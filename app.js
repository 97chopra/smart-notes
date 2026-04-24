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
    const stored = localStorage.getItem(STORAGE_KEY);
    notes = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Could not load notes from localStorage:', e);
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
    <div class="note-card-body">${marked.parse(note.content)}</div>
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

//PIN & COLOR 

function togglePin(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    saveNotes();
    renderNotes();
  }
}

function applyColor(colorName) {
  selectedColor = colorName;
  buildColorPicker();

  if (editingId) {
    const note = notes.find(n => n.id === editingId);
    if (note) {
      note.color = colorName;
      saveNotes();
    }
  }
}

//MODAL STATE 
let editingId     = null;
let currentTags   = [];
let selectedColor = 'none';

// OPEN MODAL 
function openModal(id) {
  editingId     = id || null;
  currentTags   = [];
  selectedColor = 'none';

  document.getElementById('modalTitle').textContent = id ? 'Edit Note' : 'New Note';
  document.getElementById('noteTitle').value        = '';
  document.getElementById('noteContent').value      = '';
  document.getElementById('tagsPreview').innerHTML  = '';
  document.getElementById('aiOutput').classList.add('hidden');

  // if editing, populate fields
  if (id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      document.getElementById('noteTitle').value   = note.title;
      document.getElementById('noteContent').value = note.content;
      currentTags   = [...note.tags];
      selectedColor = note.color || 'none';
      renderTagsPreview();
    }
  }

  // reset to write tab
  switchTab('write');
  buildColorPicker();

  document.getElementById('noteModal').classList.add('open');
  setTimeout(() => document.getElementById('noteTitle').focus(), 50);
}

//  CLOSE MODAL 
function closeModal() {
  document.getElementById('noteModal').classList.remove('open');
  editingId = null;
}

// SAVE NOTE
function saveNote() {
  const title   = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  if (!title && !content) {
    alert('Please add a title or some content.');
    return;
  }

  if (editingId) {
    // update existing
    const note    = notes.find(n => n.id === editingId);
    note.title    = title;
    note.content  = content;
    note.color    = selectedColor;
    note.tags     = currentTags;
    note.updatedAt = Date.now();
  } else {
    // create new
    notes.unshift({
      id:        genId(),
      title,
      content,
      color:     selectedColor,
      tags:      currentTags,
      pinned:    false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  saveNotes();
  closeModal();
  renderNotes();
}

//  COLOR PICKER 
function buildColorPicker() {
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = NOTE_COLORS.map(c => {
    const bg       = c.hex || 'var(--surface3)';
    const selected = selectedColor === c.name ? 'selected' : '';
    const border   = c.hex ? '' : 'border: 2px dashed var(--border2);';
    return `<div class="color-swatch ${selected}"
      style="background:${bg};${border}"
      data-color="${c.name}"
      title="${c.name}">
    </div>`;
  }).join('');

  picker.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      selectedColor = swatch.dataset.color;
      buildColorPicker();
    });
  });
}

//  TAGS 
function addTag() {
  const input = document.getElementById('tagInput');
  const val   = input.value.trim().toLowerCase().replace(/\s+/g, '-');

  if (!val) return;
  if (currentTags.includes(val)) {
    input.value = '';
    return;
  }
  if (currentTags.length >= 5) {
    alert('Max 5 tags per note.');
    return;
  }

  currentTags.push(val);
  input.value = '';
  input.focus();
  renderTagsPreview();
}

function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderTagsPreview();
}

function renderTagsPreview() {
  const wrap = document.getElementById('tagsPreview');
  wrap.innerHTML = currentTags.map(tag => {
    const c = getTagColor(tag);
    return `<span class="tag-preview-chip"
      style="background:${hexToRgba(c, 0.15)};color:${c};"
      data-tag="${tag}">
      ${tag} ✕
    </span>`;
  }).join('');

  wrap.querySelectorAll('.tag-preview-chip').forEach(chip => {
    chip.addEventListener('click', () => removeTag(chip.dataset.tag));
  });
}

//  EDITOR TABS 
function switchTab(tab) {
  const content  = document.getElementById('noteContent');
  const preview  = document.getElementById('notePreview');
  const tabBtns  = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));

  if (tab === 'preview') {
    const raw        = document.getElementById('noteContent').value;
    preview.innerHTML = marked.parse(raw || '_Nothing to preview yet._');
    content.classList.add('hidden');
    preview.classList.remove('hidden');
  } else {
    content.classList.remove('hidden');
    preview.classList.add('hidden');
  }
}

//  DELETE 
let deleteTargetId = null;

function askDelete(id) {
  deleteTargetId = id;
  document.getElementById('confirmModal').classList.add('open');
}

function confirmDelete() {
  if (!deleteTargetId) return;
  notes         = notes.filter(n => n.id !== deleteTargetId);
  deleteTargetId = null;
  saveNotes();
  closeConfirmModal();
  renderNotes();
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('open');
  deleteTargetId = null;
}

//MODAL EVENT LISTENERS
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveNote);

document.getElementById('addTagBtn').addEventListener('click', addTag);
document.getElementById('tagInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
});

document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeConfirmModal);

document.getElementById('noteModal').addEventListener('click', e => {
  if (e.target === document.getElementById('noteModal')) closeModal();
});
document.getElementById('confirmModal').addEventListener('click', e => {
  if (e.target === document.getElementById('confirmModal')) closeConfirmModal();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

//MAIN EVENT LISTENERS 
document.getElementById('searchInput').addEventListener('input', renderNotes);
document.getElementById('sortSelect').addEventListener('change', renderNotes);
document.getElementById('newNoteBtn').addEventListener('click', () => openModal(null));

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const labels = { all: 'All Notes', pinned: 'Pinned', recent: 'Recent' };
    setFilter(item.dataset.filter, labels[item.dataset.filter]);
  });
});

//INIT
loadNotes();
renderNotes();
