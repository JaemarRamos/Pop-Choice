-- Run this entire file in your Supabase SQL Editor before running `npm run setup`

-- 1. Enable the pgvector extension
create extension if not exists vector;

-- 2. Create the movies table
create table if not exists movies (
  id          bigserial primary key,
  title       text not null,
  year        integer,
  director    text,
  genres      text[],
  runtime     text,
  mood_tags   text[],
  description text,
  why_watch   text,
  embedding   vector(384)
);

-- 3. Enable RLS and allow public reads (movies are not sensitive data)
alter table movies enable row level security;

create policy "Anyone can read movies"
  on movies for select
  using (true);

-- 4. Create the similarity search function
create or replace function match_movies(
  query_embedding vector(384),
  match_threshold float default 0.1,
  match_count     int   default 3
)
returns table (
  id          bigint,
  title       text,
  year        integer,
  director    text,
  genres      text[],
  runtime     text,
  mood_tags   text[],
  description text,
  why_watch   text,
  similarity  float
)
language sql stable
as $$
  select
    id,
    title,
    year,
    director,
    genres,
    runtime,
    mood_tags,
    description,
    why_watch,
    1 - (embedding <=> query_embedding) as similarity
  from movies
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- 5. Allow the function to be called via the Supabase API
grant execute on function match_movies(vector(384), float, int)
  to anon, authenticated, service_role;
