# How Pop Choice Was Built — A Complete Guide

This guide walks through every part of the app in plain language, from the first line of code to how a movie recommendation reaches your screen.

---

## What the App Does

1. You answer questions about your mood and what you want to watch tonight.
2. Your answers get converted into a list of numbers (an "embedding") that captures their meaning.
3. Those numbers are compared against pre-computed numbers for 25 movies stored in a database.
4. The closest matching movie wins.
5. An AI (Groq) writes a personal explanation of why that movie is perfect for you tonight.
6. The movie poster is fetched from The Movie Database (TMDB) and shown on screen.

---

## The Tech Stack and Why We Chose Each Tool

| Tool | What it does in this app | Why we chose it |
|---|---|---|
| **Node.js + Express** | Runs the backend server | Simple, no-config JavaScript server |
| **Supabase** | Stores movies + their number-vectors | Free, has built-in vector search via pgvector |
| **@xenova/transformers** | Converts text into number-vectors (embeddings) | Runs locally, no extra API key needed |
| **Groq** | Writes the personalized explanation | Extremely fast LLM inference, free tier |
| **TMDB** | Fetches movie posters | Free API, huge movie database |
| **Plain HTML/CSS/JS** | The UI | No build step, works everywhere |

---

## Part 1: Project Setup

### Step 1 — Create the project folder and install dependencies

```
npm install
```

The `package.json` lists every library the app needs. When you run `npm install`, Node downloads them all into a `node_modules` folder.

**Key dependencies explained:**
- `express` — the web server framework. Handles incoming requests and sends responses.
- `@supabase/supabase-js` — the official library for talking to Supabase from JavaScript.
- `@xenova/transformers` — runs AI models locally. We use it to generate embeddings.
- `groq-sdk` — the official library for calling Groq's AI API.
- `dotenv` — loads your secret API keys from the `.env` file into the app.
- `cors` — allows your browser to make requests to your local server.

### Step 2 — Create your `.env` file

Copy `.env.example` to `.env` and fill in your four keys:

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  (the service_role key, not the anon key)
GROQ_API_KEY=gsk_...
TMDB_API_KEY=abc123...
PORT=3000
```

**Why two Supabase keys?**
- The `anon` key is for public use — it respects Row Level Security (RLS) restrictions.
- The `service_role` key bypasses RLS — it's for trusted backend code like ours.
- Never expose the service_role key in the frontend (browser). Keep it server-side only.

---

## Part 2: The Movie Database (movies.txt)

### What is "chunking"?

In AI systems that search through text (called RAG — Retrieval Augmented Generation), you split large documents into smaller pieces called **chunks**. Each chunk gets its own embedding. When a user asks a question, their question's embedding is compared against all the chunks to find the best match.

In our app, **each movie is one chunk**. The `movies.txt` file is our document, and splitting it by `---` gives us 25 chunks — one per movie.

### The movies.txt format

```
TITLE: The Shawshank Redemption
YEAR: 1994
DIRECTOR: Frank Darabont
GENRES: Drama
RUNTIME: 2h 22m
MOOD_TAGS: hopeful, inspiring, emotional, uplifting, profound
WHY_WATCH: The most life-affirming film ever made.
DESCRIPTION: A wrongfully imprisoned man forges an unbreakable friendship...
EMBED_TEXT: The Shawshank Redemption 1994. Drama. Hopeful inspiring...
---
```

**Why is EMBED_TEXT different from DESCRIPTION?**
DESCRIPTION is what users see on screen — it's written for humans.
EMBED_TEXT is what gets converted into a number-vector — it's written to be semantically rich, packing in genres, mood words, and what kind of viewer the movie is perfect for. This makes the vector search more accurate.

### How to add a new movie

Just add a new block at the end of `movies.txt` following the same format, then run `npm run setup` again. That's it.

---

## Part 3: What is an Embedding?

An embedding is a list of numbers that represents the meaning of a piece of text. Similar meanings produce similar lists of numbers.

For example:
- "I feel happy and want something funny" → `[0.12, -0.45, 0.78, ...]` (384 numbers)
- "Superbad 2007. Hilarious fun lighthearted comedy." → `[0.11, -0.43, 0.80, ...]` (384 numbers)

These two vectors are close to each other numerically, so they match. This is how the app knows that a person who wants something funny tonight should watch Superbad.

We use the `all-MiniLM-L6-v2` model — a small but powerful model that produces 384-dimensional vectors. The "384-dimensional" part means each embedding is a list of 384 numbers.

```javascript
// How embedding generation works in setup-db.js and server.js:
const { pipeline } = await import('@xenova/transformers');
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const output = await embedder("some text here", { pooling: 'mean', normalize: true });
const embedding = Array.from(output.data); // [0.12, -0.45, 0.78, ...]
```

- `pooling: 'mean'` — averages all the word vectors into one vector for the whole sentence.
- `normalize: true` — scales the vector so its length equals 1. Required for accurate cosine similarity.

---

## Part 4: The Setup Script (scripts/setup-db.js)

Run this once to fill your Supabase database with movies:

```
npm run setup
```

**What it does, step by step:**

1. **Reads movies.txt** and splits it into 25 chunks using the `---` delimiter.
2. **Parses each chunk** into a JavaScript object with fields like title, year, genres, etc.
3. **Clears the existing movies table** in Supabase so re-runs are safe.
4. **For each movie**, generates a 384-number embedding from its EMBED_TEXT.
5. **Inserts the movie** (all fields + embedding) into the Supabase `movies` table.

```javascript
// The parser — splits the txt file into movie objects:
function parseMoviesTxt() {
  const content = fs.readFileSync('movies.txt', 'utf-8');
  const chunks  = content.split(/\n---\n/).filter(c => c.trim());

  return chunks.map(chunk => {
    const movie = {};
    for (const line of chunk.trim().split('\n')) {
      const colonIdx = line.indexOf(': ');
      const key      = line.substring(0, colonIdx).trim();
      const value    = line.substring(colonIdx + 2).trim();
      if (key === 'TITLE')   movie.title  = value;
      if (key === 'GENRES')  movie.genres = value.split(',').map(s => s.trim());
      // ... etc
    }
    return movie;
  });
}
```

---

## Part 5: Supabase and Vector Search (schema.sql)

### The movies table

```sql
create table movies (
  id          bigserial primary key,
  title       text,
  year        integer,
  director    text,
  genres      text[],        -- array of strings
  runtime     text,
  mood_tags   text[],
  description text,
  why_watch   text,
  embedding   vector(384)    -- 384-dimensional vector
);
```

The key column is `embedding vector(384)`. This is a special column type provided by the `pgvector` extension that Supabase enables. It stores the 384-number list for each movie.

### The similarity search function

```sql
create function match_movies(query_embedding vector(384), match_threshold float, match_count int)
returns table (title text, similarity float, ...)
as $$
  select *, 1 - (embedding <=> query_embedding) as similarity
  from movies
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

- `<=>` is the cosine distance operator from pgvector.
- `1 - distance` converts distance into similarity (1.0 = identical, 0.0 = completely different).
- `match_threshold: 0.1` means "only return movies that are at least 10% similar."
- `match_count: 3` means "return the top 3 matches."

### Row Level Security (RLS)

RLS is Supabase's security system. We enable it and add one policy:

```sql
create policy "Anyone can read movies" on movies for select using (true);
```

This means anyone can READ movies, but nobody can INSERT/UPDATE/DELETE through the public API. Our setup script uses the `service_role` key which bypasses RLS entirely, so it can insert movies freely.

---

## Part 6: The Backend (server.js)

The server has two endpoints.

### POST /api/recommend

This is the main endpoint. Called when the user hits "Find My Movie."

**Step by step:**

1. Receives `{ groupDescription, persons: [{mood, experience}, ...] }` from the browser.
2. Builds a combined query string from all the answers:
   ```javascript
   // For 1 person:
   "Mood: Happy and upbeat. Craving: Hilarious and fun laughter comedy."

   // For 3 people:
   "Group context: Date night. Person 1 — mood: Calm, craving: Heartwarming.
    Person 2 — mood: Excited, craving: Thrilling."
   ```
3. Converts that string into a 384-number embedding.
4. Calls the Supabase `match_movies` function with that embedding.
5. Takes the top result and fetches its poster from TMDB **at the same time** as generating the Groq explanation (using `Promise.all` to run them in parallel — faster).
6. Returns `{ movie, explanation, alternatives }` to the browser.

```javascript
// Running TMDB and Groq in parallel — not one after the other:
const [poster_url, explanation] = await Promise.all([
  fetchTmdbPoster(top.title, top.year),
  getGroqExplanation(top, { groupDescription, persons })
]);
```

### POST /api/explain

Called when the user clicks "Try Another Recommendation →". The browser already has the alternative movies from the first API call. It just needs a new Groq explanation for the next movie.

```javascript
// Server receives the next movie object + original answers
// and generates a new personalized explanation
const explanation = await getGroqExplanation(movie, { groupDescription, persons });
```

This avoids re-running the vector search — we already have our 3 candidates.

### TMDB Poster Fetch

```javascript
function fetchTmdbPoster(title, year) {
  // Uses Node's built-in https module — no extra library needed
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${title}&year=${year}`;
  // Returns the CDN URL for the poster image, or null if not found
  // e.g. "https://image.tmdb.org/t/p/w500/abc123.jpg"
}
```

If `TMDB_API_KEY` is not set or the movie isn't found, it returns `null`. The frontend falls back to a 🎬 emoji in that case.

### The Groq Prompt

```javascript
{
  role: 'system',
  content: 'You are a passionate movie expert who gives warm, personal recommendations in 2-3 sentences.'
}
{
  role: 'user',
  content: `Context: Person 1: Happy, wants Heartwarming...
             Why is "Forrest Gump" the PERFECT movie for them tonight?`
}
```

- `model: 'llama-3.3-70b-versatile'` — Groq's most capable model.
- `temperature: 0.8` — slightly creative but not random.
- `max_tokens: 200` — keeps the explanation short.

---

## Part 7: The Frontend

### How screens work (public/index.html + public/app.js)

The app has 5 screens. All exist in the HTML at once, but only one is visible at a time.

```javascript
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
```

The CSS transitions handle the fade/slide animation automatically when the `active` class is added or removed.

### The state object

All app data lives in one object:

```javascript
const state = {
  numPeople:        1,     // how many people are watching
  groupDescription: '',    // optional context text
  persons:          [],    // [{mood, experience}, ...] one per person
  currentPerson:    0,     // which person screen we're showing
  allMatches:       [],    // all 3 movie results from the API
  currentMatchIdx:  0,     // which match is currently displayed
  lastAnswers:      {}     // saved for "Try Another" explanation calls
};
```

### The N-people flow

For N people, the app loops through a single reusable `screen-person` screen, updating its content each time:

```javascript
function showPersonScreen(index) {
  // Update the badge ("Person 1", "Person 2", etc.)
  document.getElementById('person-badge').textContent = `Person ${index + 1}`;

  // Update the progress bar
  document.getElementById('person-progress-fill').style.width =
    `${((index + 1) / state.numPeople) * 100}%`;

  // Clear old pill selections, restore if navigating back
  clearPills('person-mood-grid');
  if (state.persons[index]) restorePill('person-mood-grid', state.persons[index].mood);

  showScreen('screen-person');
}
```

When the user submits their picks, the answer is saved and the next person's screen is shown — or `findMovie()` is called if it was the last person.

### The "Try Another" button

The API returns 3 movies in one call. When the user clicks "Try Another":

1. The next movie from `state.allMatches` is selected (wraps back to first after the last).
2. The movie info updates immediately on screen.
3. A separate `/api/explain` request gets a new personalized Groq explanation.
4. The explanation updates when it arrives.

No new vector search is needed — we already have our 3 candidates from the first call.

---

## Part 8: Running the Full App

```bash
# 1. Install dependencies (once)
npm install

# 2. Run schema.sql in Supabase SQL Editor (once)
#    — enables pgvector, creates the movies table and match_movies function

# 3. Seed the database (run again if you edit movies.txt)
npm run setup

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3000
```

---

## How to Extend the App

**Add more movies:** Edit `movies.txt`, add a new block with the same format, run `npm run setup`.

**Change the questions:** Edit the pill buttons in `public/index.html`. Update the `data-value` attributes to match what you want sent to the server. The values get embedded semantically, so descriptive phrases work better than single words.

**Change the AI model:** In `server.js`, change `model: 'llama-3.3-70b-versatile'` to any model available on Groq (e.g., `mixtral-8x7b-32768`).

**Deploy online:** Push to a platform like Railway, Render, or Fly.io. Set your four environment variables there instead of in `.env`. The app needs no database migrations — Supabase is already online.

---

## Quick Reference: Data Flow

```
User answers questions
        ↓
app.js builds { groupDescription, persons } and POSTs to /api/recommend
        ↓
server.js builds a combined query string from all N people's answers
        ↓
@xenova/transformers converts the string → 384 numbers (embedding)
        ↓
Supabase pgvector compares against all 25 stored movie embeddings
→ returns top 3 by cosine similarity
        ↓
TMDB API fetches the poster for the #1 match      (in parallel)
Groq generates a personalized explanation          (in parallel)
        ↓
Response sent to browser: { movie, explanation, alternatives }
        ↓
app.js renders the result card with poster + explanation
        ↓
User clicks "Try Another" → /api/explain with the next movie
→ new Groq explanation, same movie data, no new vector search
```
