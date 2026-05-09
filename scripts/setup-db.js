/**
 * Run after executing schema.sql in Supabase SQL Editor:
 *   npm run setup
 *
 * Reads movies.txt, splits into chunks (one per movie),
 * generates a 384-dim embedding for each chunk, and inserts into Supabase.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Parse movies.txt into an array of movie objects ───────
function parseMoviesTxt() {
  const filePath = path.join(__dirname, '../movies.txt');
  const content  = fs.readFileSync(filePath, 'utf-8');

  // Each movie is a "chunk" delimited by ---
  const chunks = content.split(/\n---\n/).filter(c => c.trim());

  return chunks.map(chunk => {
    const movie = {};
    for (const line of chunk.trim().split('\n')) {
      const colonIdx = line.indexOf(': ');
      if (colonIdx === -1) continue;
      const key   = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 2).trim();
      switch (key) {
        case 'TITLE':       movie.title       = value; break;
        case 'YEAR':        movie.year        = parseInt(value, 10); break;
        case 'DIRECTOR':    movie.director    = value; break;
        case 'GENRES':      movie.genres      = value.split(',').map(s => s.trim()); break;
        case 'RUNTIME':     movie.runtime     = value; break;
        case 'MOOD_TAGS':   movie.mood_tags   = value.split(',').map(s => s.trim()); break;
        case 'WHY_WATCH':   movie.why_watch   = value; break;
        case 'DESCRIPTION': movie.description = value; break;
        case 'EMBED_TEXT':  movie.embedText   = value; break;
      }
    }
    return movie;
  }).filter(m => m.title); // skip malformed chunks
}

// ── Embedding pipeline (lazy-loaded) ─────────────────────
async function generateEmbedding(text) {
  if (!generateEmbedding._pipe) {
    const { pipeline } = await import('@xenova/transformers');
    console.log('  Loading embedding model (one-time ~30MB download)...');
    generateEmbedding._pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('  Model ready.\n');
  }
  const output = await generateEmbedding._pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('Pop Choice — Database Setup');
  console.log('============================\n');

  const movies = parseMoviesTxt();
  console.log(`Parsed ${movies.length} movie chunks from movies.txt.\n`);

  // Clear existing rows so re-runs are safe
  const { error: deleteError } = await supabase.from('movies').delete().neq('id', 0);
  if (deleteError) {
    console.error('Failed to clear existing records:', deleteError.message);
    console.error('Make sure you ran schema.sql in Supabase SQL Editor first.\n');
    process.exit(1);
  }

  console.log(`Generating embeddings for ${movies.length} movies...\n`);

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    process.stdout.write(`[${i + 1}/${movies.length}] ${movie.title}... `);

    const embedding = await generateEmbedding(movie.embedText);

    const { error } = await supabase.from('movies').insert({
      title:       movie.title,
      year:        movie.year,
      director:    movie.director,
      genres:      movie.genres,
      runtime:     movie.runtime,
      mood_tags:   movie.mood_tags,
      description: movie.description,
      why_watch:   movie.why_watch,
      embedding
    });

    if (error) {
      console.log('FAILED');
      console.error('  Error:', error.message);
    } else {
      console.log('done');
    }
  }

  console.log('\nSetup complete! Your movie database is ready.');
  console.log('Start the app with: npm start\n');
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
