// Sunset Ledger entrypoint: loads the trophy data and the roadmap, wires the
// view tabs, filters, export/import and the progress bar.
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgress } from './store.js';
import { renderChecklist, renderDetail, renderRoadmap, renderMissables, renderSettings } from './views.js';

const main = document.getElementById('main');
const gradeSel = document.getElementById('grade');
const kindSel = document.getElementById('kind');
const searchInput = document.getElementById('search');
const hideEarnedBox = document.getElementById('hide-earned');
const controls = document.getElementById('controls');
const progressEl = document.getElementById('progress');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');

const doc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const data = { trophies: doc.trophies, sources: doc.sources, roadmap: roadmapDoc.roadmap };

const state = {
  earned: loadEarned(),
  settings: loadSettings(),
  grade: 'all',
  kind: 'all',
  search: '',
  hideEarned: false,
  view: 'checklist',
  detailId: null,
  refresh,
  showDetail,
  showView,
  applySettings,
};

function applySettings() {
  document.body.classList.toggle('hide-spoilers', state.settings.hideSpoilers);
  saveSettings(state.settings);
}

function updateProgress() {
  const n = state.earned.size;
  const total = data.trophies.length;
  progressEl.textContent = `${n} of ${total} earned`;
  progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  progressFill.style.width = `${(n / total) * 100}%`;
}

function showView(view) {
  state.view = view;
  state.detailId = null;
  document.querySelectorAll('.views button').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  controls.style.display = view === 'checklist' ? '' : 'none';
  refresh();
  window.scrollTo(0, 0);
}

function showDetail(id) {
  state.view = 'detail';
  state.detailId = id;
  document.querySelectorAll('.views button').forEach((b) => b.classList.remove('active'));
  controls.style.display = 'none';
  refresh();
  window.scrollTo(0, 0);
}

function refresh() {
  updateProgress();
  if (state.view === 'checklist') renderChecklist(main, data, state);
  else if (state.view === 'detail') renderDetail(main, data, state, state.detailId);
  else if (state.view === 'roadmap') renderRoadmap(main, data, state);
  else if (state.view === 'missables') renderMissables(main, data, state);
  else if (state.view === 'settings') renderSettings(main, data, state);
}

document.querySelectorAll('.views button').forEach((b) => {
  b.addEventListener('click', () => showView(b.dataset.view));
});
gradeSel.addEventListener('change', () => { state.grade = gradeSel.value; refresh(); });
kindSel.addEventListener('change', () => { state.kind = kindSel.value; refresh(); });
searchInput.addEventListener('input', () => { state.search = searchInput.value; refresh(); });
hideEarnedBox.addEventListener('change', () => { state.hideEarned = hideEarnedBox.checked; refresh(); });

document.getElementById('export').addEventListener('click', () => exportProgress(state.earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state.earned = await importProgress(file);
    saveEarned(state.earned);
    refresh();
  } catch {
    window.alert('That file is not a Sunset Ledger progress export.');
  }
  e.target.value = '';
});

document.getElementById('alert-goto').addEventListener('click', () => {
  showView('missables');
});

applySettings();
// Deep links: #roadmap, #missables, #settings, #trophy-<id> open that view directly.
const hash = window.location.hash;
if (hash === '#roadmap' || hash === '#missables' || hash === '#settings') {
  showView(hash.slice(1));
} else if (hash.startsWith('#trophy-')) {
  const id = Number(hash.slice(8));
  if (Number.isInteger(id) && data.trophies.some((t) => t.id === id)) showDetail(id);
  else refresh();
} else {
  refresh();
}
