require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
const GroqModule = require('groq-sdk');
const Groq = GroqModule.default ?? GroqModule;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Embedding pipeline (lazy-loaded) ─────────────────────
let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    const { pipeline } = await import('@xenova/transformers');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

async function generateEmbedding(text) {
  const pipe   = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// ── Build combined query text from N people's answers ────
function buildQueryText({ groupDescription, persons }) {
  const groupLine = groupDescription ? `Group context: ${groupDescription}.` : '';
  const personLines = persons.map((p, i) =>
    persons.length === 1
      ? `Mood: ${p.mood}. Craving: ${p.experience}.`
      : `Person ${i + 1} — mood: ${p.mood}, craving: ${p.experience}.`
  ).join(' ');
  return `${groupLine} ${personLines}`.trim();
}

// ── Groq explanation ──────────────────────────────────────
async function getGroqExplanation(movie, { groupDescription, persons }) {
  const isSolo   = persons.length === 1;
  const context  = isSolo
    ? `One person — mood: ${persons[0].mood}, craving: ${persons[0].experience}. ${groupDescription || ''}`.trim()
    : `Group of ${persons.length} — ${persons.map((p, i) => `Person ${i + 1}: ${p.mood}, wants ${p.experience}`).join('; ')}. ${groupDescription || ''}`.trim();

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a passionate movie expert who gives warm, personal recommendations in 2-3 sentences. Be specific about why this movie fits the exact group mood and context described.'
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nWhy is "${movie.title}" (${movie.year}, dir. ${movie.director}) the PERFECT movie for them tonight?\nMovie: ${movie.description}`
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 200
  });

  return completion.choices[0].message.content;
}

// ── Format a DB row for the API response ─────────────────
function formatMovie(m, poster_url = null) {
  return {
    title:       m.title,
    year:        m.year,
    director:    m.director,
    genres:      m.genres,
    runtime:     m.runtime,
    mood_tags:   m.mood_tags,
    description: m.description,
    why_watch:   m.why_watch,
    similarity:  Math.round((m.similarity || 0) * 100),
    poster_url
  };
}

// ── POST /api/recommend ───────────────────────────────────
app.post('/api/recommend', async (req, res) => {
  try {
    const { groupDescription = '', persons } = req.body;

    if (!Array.isArray(persons) || persons.length === 0) {
      return res.status(400).json({ error: 'persons array is required.' });
    }
    if (persons.some(p => !p.mood || !p.experience)) {
      return res.status(400).json({ error: 'Each person needs a mood and experience.' });
    }

    const queryText      = buildQueryText({ groupDescription, persons });
    const queryEmbedding = await generateEmbedding(queryText);

    const { data: matches, error } = await supabase.rpc('match_movies', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.1,
      match_count:     3
    });

    if (error) throw error;
    if (!matches || matches.length === 0) {
      return res.json({ error: 'No matching movies found. Make sure you ran npm run setup.' });
    }

    const [top, ...rest] = matches;

    const explanation = await getGroqExplanation(top, { groupDescription, persons });

    res.json({
      movie:        formatMovie(top),
      explanation,
      alternatives: rest.map(m => formatMovie(m))
    });

  } catch (err) {
    console.error('Error in /api/recommend:', err);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

// ── POST /api/explain (for "Try Another" button) ─────────
app.post('/api/explain', async (req, res) => {
  try {
    const { movie, groupDescription = '', persons } = req.body;
    if (!movie || !Array.isArray(persons)) {
      return res.status(400).json({ error: 'movie and persons are required.' });
    }
    const explanation = await getGroqExplanation(movie, { groupDescription, persons });
    res.json({ explanation });
  } catch (err) {
    console.error('Error in /api/explain:', err);
    res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pop Choice running at http://localhost:${PORT}`));
