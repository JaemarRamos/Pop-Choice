// ── State ────────────────────────────────────────────────────
const state = {
  numPeople:       1,
  groupDescription:'',
  persons:         [],   // [{mood, experience}, ...]
  currentPerson:   0,
  allMatches:      [],   // up to 3 full movie objects
  currentMatchIdx: 0,
  lastAnswers:     {}    // saved for /api/explain calls
};

// ── Screen navigation ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── People stepper ───────────────────────────────────────────
function changePeople(delta) {
  state.numPeople = Math.max(1, Math.min(8, state.numPeople + delta));
  document.getElementById('people-count').textContent = state.numPeople;
  document.getElementById('people-label').textContent = state.numPeople === 1 ? 'person' : 'people';
  document.getElementById('stepper-minus').disabled   = state.numPeople === 1;
  document.getElementById('stepper-plus').disabled    = state.numPeople === 8;
}

// ── Group screen ─────────────────────────────────────────────
function goToGroup() {
  const isSolo = state.numPeople === 1;
  document.getElementById('group-title').textContent = isSolo
    ? 'What kind of movie night is this? (optional)'
    : `What brings your group of ${state.numPeople} together tonight? (optional)`;
  document.getElementById('group-description').value = '';
  document.getElementById('group-char-count').textContent = '0';
  document.getElementById('group-progress-fill').style.width = '0%';
  showScreen('screen-group');
}

function skipGroup() {
  state.groupDescription = '';
  state.persons = [];
  state.currentPerson = 0;
  showPersonScreen(0);
}

function goToFirstPerson() {
  state.groupDescription = document.getElementById('group-description').value.trim();
  state.persons = [];
  state.currentPerson = 0;
  showPersonScreen(0);
}

document.getElementById('group-description').addEventListener('input', function () {
  document.getElementById('group-char-count').textContent = this.value.length;
});

// ── Per-person screen ────────────────────────────────────────
function showPersonScreen(index) {
  const isSolo = state.numPeople === 1;
  const isLast = index === state.numPeople - 1;

  // Badge
  document.getElementById('person-badge').textContent =
    isSolo ? 'Your Picks' : `Person ${index + 1}`;

  // Progress bar: group is step 0, each person is steps 1..N
  const totalSteps = state.numPeople + 1;
  const doneSteps  = index + 1; // group done + persons so far
  document.getElementById('person-progress-fill').style.width =
    `${(doneSteps / totalSteps) * 100}%`;

  // Progress label
  document.getElementById('person-progress-text').textContent =
    isSolo ? '' : `${index + 1} / ${state.numPeople}`;

  // Button label
  document.getElementById('person-btn-label').textContent = isLast
    ? (isSolo ? 'Find My Movie ✨' : 'Find Our Movie ✨')
    : 'Next Person →';

  // Clear pills; restore if navigating back
  clearPills('person-mood-grid');
  clearPills('person-exp-grid');
  if (state.persons[index]) {
    restorePill('person-mood-grid', state.persons[index].mood);
    restorePill('person-exp-grid',  state.persons[index].experience);
  }

  state.currentPerson = index;
  showScreen('screen-person');
}

function personBack() {
  if (state.currentPerson === 0) {
    showScreen('screen-group');
  } else {
    showPersonScreen(state.currentPerson - 1);
  }
}

function savePersonAndNext() {
  const mood       = getSelectedPill('person-mood-grid');
  const experience = getSelectedPill('person-exp-grid');

  if (!mood)       { alert('Please pick a mood!'); return; }
  if (!experience) { alert('Please pick what you\'re craving!'); return; }

  state.persons[state.currentPerson] = { mood, experience };

  if (state.currentPerson < state.numPeople - 1) {
    showPersonScreen(state.currentPerson + 1);
  } else {
    findMovie();
  }
}

// ── Pill helpers ─────────────────────────────────────────────
function selectPill(btn, gridId) {
  document.getElementById(gridId)
    .querySelectorAll('.pill')
    .forEach(p => p.classList.remove('selected'));
  btn.classList.add('selected');
}

function clearPills(gridId) {
  document.getElementById(gridId)
    .querySelectorAll('.pill')
    .forEach(p => p.classList.remove('selected'));
}

function restorePill(gridId, value) {
  document.getElementById(gridId)
    .querySelectorAll('.pill')
    .forEach(p => { if (p.dataset.value === value) p.classList.add('selected'); });
}

function getSelectedPill(gridId) {
  const sel = document.querySelector(`#${gridId} .pill.selected`);
  return sel ? sel.dataset.value : null;
}

// ── Find movie ───────────────────────────────────────────────
async function findMovie() {
  state.lastAnswers = {
    groupDescription: state.groupDescription,
    persons: [...state.persons]
  };

  showScreen('screen-loading');

  try {
    const res = await fetch('/api/recommend', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        groupDescription: state.groupDescription,
        persons:          state.persons
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Store all matches for "Try Another"
    state.allMatches      = [data.movie, ...(data.alternatives || [])];
    state.currentMatchIdx = 0;

    renderResult(data.movie, data.explanation);
    showScreen('screen-result');

  } catch (err) {
    document.getElementById('error-message').textContent = err.message;
    showScreen('screen-error');
  }
}

// ── Render result card ───────────────────────────────────────
function renderResult(movie, explanation) {
  document.getElementById('result-title').textContent       = movie.title;
  document.getElementById('result-meta').textContent        =
    `${movie.year}  ·  ${movie.runtime}  ·  Dir. ${movie.director}`;
  document.getElementById('result-explanation').textContent = explanation;
  document.getElementById('result-why').textContent         = `"${movie.why_watch}"`;

  // Poster
  const img      = document.getElementById('result-poster');
  const fallback = document.getElementById('result-poster-fallback');
  if (movie.poster_url) {
    img.src              = movie.poster_url;
    img.style.display    = 'block';
    fallback.style.display = 'none';
  } else {
    img.style.display    = 'none';
    fallback.style.display = 'flex';
  }

  // Genre tags
  const genreContainer = document.getElementById('result-genres');
  genreContainer.innerHTML = '';
  (movie.genres || []).forEach(g => {
    const tag       = document.createElement('span');
    tag.className   = 'genre-tag';
    tag.textContent = g;
    genreContainer.appendChild(tag);
  });

  // Try Another button — show only if there are more matches
  const btn          = document.getElementById('btn-try-another');
  btn.style.display  = state.allMatches.length > 1 ? 'block' : 'none';
  btn.disabled       = false;
  btn.textContent    = 'Try Another Recommendation →';
}

// ── Try another recommendation ────────────────────────────────
async function tryAnother() {
  const btn        = document.getElementById('btn-try-another');
  btn.disabled     = true;
  btn.textContent  = 'Getting recommendation…';

  state.currentMatchIdx = (state.currentMatchIdx + 1) % state.allMatches.length;
  const nextMovie       = state.allMatches[state.currentMatchIdx];

  // Show next movie immediately while explanation loads
  document.getElementById('result-explanation').textContent = '…';
  document.getElementById('result-title').textContent       = nextMovie.title;
  document.getElementById('result-meta').textContent        =
    `${nextMovie.year}  ·  ${nextMovie.runtime}  ·  Dir. ${nextMovie.director}`;

  try {
    const res = await fetch('/api/explain', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        movie:            nextMovie,
        groupDescription: state.lastAnswers.groupDescription,
        persons:          state.lastAnswers.persons
      })
    });
    const data = await res.json();
    renderResult(nextMovie, data.explanation || nextMovie.description);
  } catch {
    renderResult(nextMovie, nextMovie.description);
  }
}

// ── Restart ───────────────────────────────────────────────────
function restart() {
  state.numPeople        = 1;
  state.groupDescription = '';
  state.persons          = [];
  state.currentPerson    = 0;
  state.allMatches       = [];
  state.currentMatchIdx  = 0;
  state.lastAnswers      = {};

  document.getElementById('people-count').textContent = '1';
  document.getElementById('people-label').textContent = 'person';
  document.getElementById('stepper-minus').disabled   = true;
  document.getElementById('stepper-plus').disabled    = false;

  showScreen('screen-welcome');
}
