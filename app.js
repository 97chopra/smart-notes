//DATA MODEL 
const STORAGE_KEY = 'smart_notes_v1';
let notes = [];

const NOTE_COLORS = [
  { name: 'none',   hex: null },
  { name: 'purple', hex: '#7c6af7' },
  { name: 'teal',   hex: '#52c07a' },
  { name: 'coral',  hex: '#e07052' },
  { name: 'amber',  hex: '#e0a050' },
  { name: 'blue',   hex: '#5298e0' },
  { name: 'pink',   hex: '#e05294' },
];

const TAG_COLORS = [
  '#7c6af7','#52c07a','#e07052','#e0a050','#5298e0','#e05294','#52c0c0'
];

const tagColorMap = {};
let tagColorIndex = 0;

//HELPERS 
function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function getTagColor(tag) {
  if (!tagColorMap[tag]) {
    tagColorMap[tag] = TAG_COLORS[tagColorIndex % TAG_COLORS.length];
    tagColorIndex++;
  }
  return tagColorMap[tag];
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

//LOCALSTORAGE
function loadNotes() {
  try {
    notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    notes = [];
  }
  if (notes.length === 0) seedDemoNotes();
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function seedDemoNotes() {
  notes = [
    {
      id: genId(),
      title: 'Welcome to Smart Notes',
      content: '## Getting Started\n\nThis is the **AI-powered** notes app.\n\n- Create and edit notes\n- Use *Markdown* formatting\n- Add tags to organise\n- Use AI to summarise or improve your notes!',
      color: 'purple',
      tags: ['welcome'],
      pinned: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: genId(),
      title: 'Portfolio Project Ideas',
      content: '## Projects to Build\n\n1. Smart Notes App (this one!)\n2. Data Dashboard with D3.js\n3. ML Sentiment Analyser\n4. AUT Final Year writeup',
      color: 'teal',
      tags: ['portfolio', 'ideas'],
      pinned: false,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: genId(),
      title: 'Data Science Revision',
      content: '## Key Algorithms\n\n- Linear & Logistic Regression\n- Decision Trees / Random Forest\n- K-Means Clustering\n- Neural Networks & backprop',
      color: 'amber',
      tags: ['study', 'ai'],
      pinned: false,
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
    },
  ];
  saveNotes();
}

//RENDER NOTES
function renderNotes() {
  const grid = document.getElementById('notesGrid');
  const list = getFilteredNotes();

  renderSidebarTags();

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No notes found</h3>
        <p>Try a different filter or create a new note.</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  list.forEach(note => renderNoteCard(note, grid));
}

function renderNoteCard(note, grid) {
  const card = document.createElement('div');
  card.className = 'note-card' + (note.pinned ? ' pinned' : '');
  card.dataset.id = note.id;

  const colorObj = NOTE_COLORS.find(c => c.name === note.color);
  const colorBar = colorObj?.hex
    ? `<div class="note-color-bar" style="background:${colorObj.hex}"></div>`
    : '';

  const tagBadges = note.tags.map(tag => {
    const c = getTagColor(tag);
    return `<span class="note-tag-badge"
      style="background:${hexToRgba(c, 0.15)};color:${c};"
    >${tag}</span>`;
  }).join('');

  card.innerHTML = `
    ${colorBar}
    <div class="card-actions">
      <button class="card-action-btn ${note.pinned ? 'pin-active' : ''}"
        data-action="pin" title="Pin">📌</button>
      <button class="card-action-btn danger"
        data-action="delete" title="Delete">🗑</button>
    </div>
    <div class="note-card-title">${escHtml(note.title) || 'Untitled'}</div>
    <div class="note-card-body">${escHtml(note.content)}</div>
    <div class="note-card-footer">
      <span class="note-card-date">${formatDate(note.updatedAt)}</span>
      <div class="note-card-tags">${tagBadges}</div>
    </div>
  `;

  // open editor on card click
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.card-action-btn')) openModal(note.id);
  });

  // pin button
  card.querySelector('[data-action="pin"]').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePin(note.id);
  });

  // delete button
  card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
    e.stopPropagation();
    askDelete(note.id);
  });

  grid.appendChild(card);
}

// SIDEBAR TAGS
function renderSidebarTags() {
  const container = document.getElementById('tagsList');
  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort();

  if (allTags.length === 0) {
    container.innerHTML = '<div style="padding:8px 16px;font-size:12px;color:var(--muted);">No tags yet</div>';
    return;
  }

  container.innerHTML = allTags.map(tag => {
    const c = getTagColor(tag);
    return `<div class="tag-chip" data-tag="${tag}">
      <span class="tag-dot" style="background:${c};"></span>${tag}
    </div>`;
  }).join('');

  container.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filterByTag(chip.dataset.tag);
    });
  });
}

//FILTERING 
let currentFilter = 'all';
let currentTag    = null;

function getFilteredNotes() {
  let list = [...notes];

  if (currentFilter === 'pinned') list = list.filter(n => n.pinned);
  if (currentFilter === 'recent') {
    const week = Date.now() - 7 * 86400000;
    list = list.filter(n => n.updatedAt >= week);
  }
  if (currentTag) list = list.filter(n => n.tags.includes(currentTag));

  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  if (q) {
    list = list.filter(n =>
      (n.title + n.content + n.tags.join(' ')).toLowerCase().includes(q)
    );
  }

  const sort = document.getElementById('sortSelect').value;
  if (sort === 'newest')  list.sort((a, b) => b.updatedAt - a.updatedAt);
  if (sort === 'oldest')  list.sort((a, b) => a.updatedAt - b.updatedAt);
  if (sort === 'alpha')   list.sort((a, b) => a.title.localeCompare(b.title));

  // pinned always on top
  list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return list;
}

function setFilter(filter, label) {
  currentFilter = filter;
  currentTag    = null;
  document.getElementById('viewTitle').textContent = label;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.filter === filter);
  });
  renderNotes();
}

function filterByTag(tag) {
  currentTag    = tag;
  currentFilter = 'all';
  document.getElementById('viewTitle').textContent = `#${tag}`;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  renderNotes();
}

// TOGGLE PIN
function togglePin(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    saveNotes();
    renderNotes();
  }
}

//DELETE 
function askDelete(id) {
  console.log('delete', id); 
}

// MODAL 
function openModal(id) {
  console.log('open', id);   
}

// EVENT LISTENERS 
document.getElementById('searchInput').addEventListener('input', renderNotes);
document.getElementById('sortSelect').addEventListener('change', renderNotes);
document.getElementById('newNoteBtn').addEventListener('click', () => openModal(null));

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const labels = { all: 'All Notes', pinned: 'Pinned', recent: 'Recent' };
    setFilter(item.dataset.filter, labels[item.dataset.filter]);
  });
});

// INIT 
loadNotes();
renderNotes();