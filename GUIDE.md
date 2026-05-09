# Building Pop Choice — What I Learned and How It Works

So I built this app that recommends a movie based on your mood, and honestly it turned out cooler than I expected. This guide is me documenting everything I did so I (or anyone else) can understand it later without starting from scratch.

I'm not going to pretend I knew all of this from the start. A lot of it I had to look up, break, fix, and break again. But that's the point.

---

## What the app actually does

You open it, say how many people are watching, pick your mood, pick what kind of movie you're in the mood for — and it finds you a movie. Not just any movie. It compares what you said against a database of 25 movies using math (embeddings, I'll explain) and then uses an AI to write a little paragraph about why that specific movie is perfect for your night.

It also has a "Try Another" button if you don't like the first pick, which I'm pretty proud of because it reuses the same search results instead of hitting the database again.

---

## The tools I used and why

**Node.js + Express** — I used this for the backend because it's JavaScript, which I already know. Express just makes it easier to handle routes (like when the browser sends data to the server).

**Supabase** — This is basically a free online database. The cool part is it has a plugin called pgvector that lets you store and search through lists of numbers (embeddings). Without that, this whole app doesn't work.

**@xenova/transformers** — This is the library that converts text into embeddings. It runs locally on your computer so you don't need another API key for it. It downloads a small AI model the first time you use it (~30MB) and caches it after that.

**Groq** — This is the AI that writes the explanation for why a movie fits your mood. It's really fast compared to other AI APIs I've tried. Free tier is generous enough for a project like this.

**Plain HTML/CSS/JS** — No React, no Vue, nothing fancy. Just regular files the browser can open. I did this on purpose because I wanted to actually understand what's happening instead of hiding it behind a framework.

---

## Before you run anything

You need four things:

1. A Supabase account (free) — supabase.com
2. A Groq API key — console.groq.com
3. Node.js installed on your machine
4. A `.env` file with your keys (I'll explain below)

Create a `.env` file in the root folder (copy `.env.example` and fill it in):

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
GROQ_API_KEY=gsk_...
PORT=3000
```

One thing that tripped me up — Supabase gives you two keys: the `anon` key and the `service_role` key. Use the `service_role` one here. The anon key won't have permission to insert movies into the database because of security rules (RLS — more on that later). Don't put either key in your frontend code, ever. Keep them server-side only.

---

## The movie data lives in movies.txt

I didn't want to hardcode movies in a JavaScript file because that felt messy and hard to edit. So I made a `movies.txt` file where each movie is its own block separated by `---`.

```
TITLE: Inception
YEAR: 2010
DIRECTOR: Christopher Nolan
GENRES: Sci-Fi, Action, Thriller
RUNTIME: 2h 28m
MOOD_TAGS: mind-bending, thrilling, complex, intense, imaginative
WHY_WATCH: You will not stop thinking about it for days.
DESCRIPTION: A thief who steals corporate secrets through dream-sharing...
EMBED_TEXT: Inception 2010. Sci-Fi Action Thriller. Mind-bending thrilling...
---
```

Notice there are two description fields. `DESCRIPTION` is what the user sees on screen. `EMBED_TEXT` is what actually gets turned into an embedding — I made it longer and packed with mood words and genres because that's what helps it match better.

To add a new movie, just copy one of the blocks, fill it in, run `npm run setup` again. That's it.

This pattern of splitting a text file into chunks and embedding each chunk separately is called RAG (Retrieval Augmented Generation). In our case each chunk is one movie, but in bigger apps the chunks might be paragraphs from a long document.

---

## What is an embedding and why does it matter

This was the hardest concept for me to wrap my head around at first.

An embedding is just a long list of numbers that represents the *meaning* of a piece of text. The model I'm using (`all-MiniLM-L6-v2`) turns any text into exactly 384 numbers. Two pieces of text with similar meaning will produce similar lists of numbers. Two completely unrelated things will produce very different lists.

So when you say "I'm feeling calm and want something heartwarming," the app converts that into 384 numbers. Then it compares those numbers against the pre-stored 384 numbers for every movie in the database. The movie whose numbers are closest wins.

The code for this is pretty short actually:

```javascript
const { pipeline } = await import('@xenova/transformers');
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const output = await embedder("some text", { pooling: 'mean', normalize: true });
const embedding = Array.from(output.data); // this is now a list of 384 numbers
```

`pooling: 'mean'` averages all the word-level numbers into one list for the whole sentence. `normalize: true` makes sure all the numbers are scaled consistently, which is required for the comparison math to work right.

---

## Setting up the database

Before anything works, you need to run `schema.sql` in the Supabase SQL Editor. Copy the whole file and paste it in there.

What it does:
- Turns on the pgvector extension (the thing that makes vector/embedding search possible)
- Creates the `movies` table with a special `embedding vector(384)` column
- Creates a function called `match_movies` that does the similarity search
- Sets up Row Level Security (RLS) so only our server can write to the table

RLS is Supabase's way of saying "who is allowed to do what." We enable it and add one rule: anyone can read movies, but nobody can add or delete them through the public API. Our setup script gets around this because it uses the `service_role` key which bypasses RLS entirely.

Then run the setup script to fill the database:

```bash
npm run setup
```

This reads `movies.txt`, generates an embedding for each movie using the local AI model, and inserts everything into Supabase. First run takes a bit longer because it downloads the model. After that it's cached and fast.

---

## How the server works (server.js)

The server has two endpoints.

**POST /api/recommend** — the main one. Called when you hit "Find My Movie."

Here's the flow:
1. Gets the answers from the browser (mood, experience, how many people, etc.)
2. Combines everything into one string — like "Group of 2. Person 1 mood: Happy, craving: Hilarious. Person 2 mood: Calm, craving: Heartwarming."
3. Converts that string into an embedding (384 numbers)
4. Sends those numbers to Supabase and asks "which movie is closest to this?"
5. Takes the top result and sends it to Groq with a prompt asking it to explain why it's perfect
6. Sends everything back to the browser

```javascript
// building the query string for multiple people
function buildQueryText({ groupDescription, persons }) {
  const groupLine = groupDescription ? `Group context: ${groupDescription}.` : '';
  const personLines = persons.map((p, i) =>
    persons.length === 1
      ? `Mood: ${p.mood}. Craving: ${p.experience}.`
      : `Person ${i + 1} — mood: ${p.mood}, craving: ${p.experience}.`
  ).join(' ');
  return `${groupLine} ${personLines}`.trim();
}
```

**POST /api/explain** — called when you click "Try Another." The browser already has the top 3 results from the first call. It just needs a new explanation from Groq for the next movie in line. So this endpoint skips the embedding and database search entirely and just calls Groq.

---

## How the frontend works

The app has multiple screens (welcome, group description, per-person questions, loading, result, error). They all exist in the HTML at the same time — only one is visible at a time.

```javascript
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
```

The CSS uses `opacity` and `transform` to animate between them. That's the sliding effect.

All the app's data lives in one `state` object:

```javascript
const state = {
  numPeople: 1,
  groupDescription: '',
  persons: [],          // one { mood, experience } per person
  currentPerson: 0,
  allMatches: [],       // top 3 results from the API
  currentMatchIdx: 0,   // which one is currently showing
  lastAnswers: {}       // saved so "Try Another" can reuse them
};
```

For multiple people, I reuse the same HTML screen and just update its content in JavaScript before showing it. So instead of creating N screens dynamically, there's one screen that changes what it says depending on which person is up.

---

## The N-people feature

This one was fun to build. The idea is that the per-person question screen is the same screen every time — JavaScript just updates the heading and clears/restores the pill selections.

```javascript
function showPersonScreen(index) {
  document.getElementById('person-badge').textContent =
    state.numPeople === 1 ? 'Your Picks' : `Person ${index + 1}`;

  // clear old selections
  clearPills('person-mood-grid');
  clearPills('person-exp-grid');

  // if they hit back, restore their previous answers
  if (state.persons[index]) {
    restorePill('person-mood-grid', state.persons[index].mood);
    restorePill('person-exp-grid', state.persons[index].experience);
  }

  showScreen('screen-person');
}
```

When all N people are done, `findMovie()` fires and combines all their answers into one big query string for the embedding.

---

## The "Try Another" button

The API always returns 3 movie matches. The first one shows up on the result screen. The other two are stored in `state.allMatches`.

When you click "Try Another," it grabs the next movie from that list and calls `/api/explain` to get a fresh Groq explanation for it. No new database search. Just a new explanation.

One thing I liked about building this — the movie info shows up immediately, and the explanation loads a second later. That way it doesn't feel slow even though there's a network request happening.

---

## Running it yourself

```bash
# install everything
npm install

# run schema.sql in Supabase SQL Editor first (one time)

# seed the database
npm run setup

# start the server
npm start

# open in browser
http://localhost:3000
```

If you add movies to `movies.txt`, just run `npm run setup` again. It wipes the old data and re-seeds everything fresh.

---

## Things I'd do differently next time

- Store the movie poster URL in the database instead of fetching it at runtime
- Add a way to filter by genre before the search
- Cache the embedding model in memory on startup instead of lazy-loading it on first request (makes the first recommendation slow)
- Maybe add a ratings or "already seen" feature so it doesn't repeat suggestions

But for a first version, it works and I'm happy with it.
