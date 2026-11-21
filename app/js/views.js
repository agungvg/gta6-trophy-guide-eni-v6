// Sunset Ledger views: checklist cards, single-trophy detail, roadmap,
// missables & unknowns, settings. Everything is built with textContent and
// created elements — no innerHTML from data, so a bad string can't break layout.
import { saveEarned } from './store.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

function sourceLink(name, urlMap) {
  // Step citations and trophy source lists use the long label
  // ("Exophase — official trophy list"); the URL map is keyed by the short
  // name in lower case ("exophase"). Match case-insensitively, including the
  // "Official trophy description (Exophase)" form. Labels with no source
  // ("Sunset Ledger — …") stay plain text.
  const lower = name.toLowerCase();
  const key = Object.keys(urlMap).find((k) => {
    const lk = k.toLowerCase();
    return lower === lk || lower.startsWith(lk + ' — ') || lower.includes('(' + lk + ')');
  });
  const raw = key ? urlMap[key] : null;
  // The map holds bare URLs; extract defensively so a "Label — URL" value
  // can never leak into an href.
  const url = raw ? (raw.match(/https?:\/\/\S+/) || [null])[0] : null;
  if (!url) return el('span', 'cite', name);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = name;
  return a;
}

function gradeBadge(t) {
  return el('span', 'grade ' + t.grade, t.grade);
}

function badges(t) {
  const wrap = el('div', 'badges');
  if (t.missable) wrap.append(el('span', 'badge missable', 'MISSABLE'));
  if (t.unconfirmed) wrap.append(el('span', 'badge unconfirmed', 'UNCONFIRMED'));
  if (t.hidden) wrap.append(el('span', 'badge hidden', 'HIDDEN'));
  return wrap;
}

export function trophyCard(t, urlMap, earned, onToggle, onDetail) {
  const card = el('article', 'trophy' + (earned.has(t.id) ? ' earned' : ''));
  const head = el('div', 'trophy-head');
  head.append(gradeBadge(t));
  head.append(el('h2', null, t.name));
  if (t.count !== null && t.count !== undefined) {
    head.append(el('span', 'count', '× ' + t.count.toLocaleString('en-US')));
  }
  card.append(head);
  card.append(badges(t));
  const desc = el('p', 'desc', t.description);
  if (t.hidden) desc.classList.add('spoiler');
  card.append(desc);
  card.append(el('p', 'guide', t.guide));

  const steps = el('ol', 'steps');
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.append(document.createTextNode(s.text + ' '));
    const cite = el('span', 'cite', '— ');
    cite.append(sourceLink(s.source, urlMap));
    li.append(cite);
    steps.append(li);
  }
  card.append(steps);

  const srcs = el('p', 'sources', 'Sources: ');
  t.sources.forEach((s, i) => {
    if (i > 0) srcs.append(document.createTextNode(', '));
    srcs.append(sourceLink(s, urlMap));
  });
  card.append(srcs);

  const row = el('div', 'earn-row');
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned(earned);
    onToggle();
  });
  label.append(box, document.createTextNode(' Earned'));
  row.append(label);
  const detail = el('button', 'detail-link', 'Full guide →');
  detail.type = 'button';
  detail.addEventListener('click', () => onDetail(t.id));
  row.append(detail);
  card.append(row);
  return card;
}

export function renderChecklist(main, data, state) {
  main.replaceChildren();
  const intro = el('p', 'section-intro',
    'All 55 trophies. Tick them off as you earn them — progress saves in this browser. ' +
    'Every step cites its source; the one missable and the five unconfirmed are flagged, never hidden.');
  main.append(intro);
  const q = state.search.trim().toLowerCase();
  const list = data.trophies.filter((t) => {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
  if (list.length === 0) {
    main.append(el('p', 'empty', 'No trophies match those filters.'));
    return;
  }
  for (const t of list) {
    main.append(trophyCard(t, data.sources, state.earned, state.refresh, state.showDetail));
  }
}

export function renderDetail(main, data, state, id) {
  const t = data.trophies.find((x) => x.id === id);
  main.replaceChildren();
  const wrap = el('div', 'detail');
  const back = el('button', 'back', '← Back to checklist');
  back.type = 'button';
  back.addEventListener('click', () => state.showView('checklist'));
  wrap.append(back);
  wrap.append(trophyCard(t, data.sources, state.earned, state.refresh, state.showDetail));
  if (t.missable) {
    const note = el('div', 'note-box danger');
    note.append(el('strong', null, 'Missable — do it in Chapter 1. '));
    note.append(document.createTextNode(
      'This is the only trophy that can be missed. Meditate at Jason\u2019s house in Chapter 1, ' +
      'after Lucia mentions meditation in the kitchen — follow her to the balcony and accept the prompt. ' +
      'Whether the spot is strictly required is unconfirmed; do all 18 spots to be safe.'));
    wrap.append(note);
  }
  if (t.unconfirmed) {
    const note = el('div', 'note-box');
    note.append(el('strong', null, 'Unconfirmed — read this as a lead, not a fact. '));
    note.append(document.createTextNode(
      'PowerPyx lists this trophy\u2019s condition as unknown. The guide above is the best reading of the ' +
      'official description plus any single-source report, clearly marked. It will be corrected when a ' +
      'guide confirms the exact trigger.'));
    wrap.append(note);
  }
  main.append(wrap);
}

export function renderRoadmap(main, data, state) {
  main.replaceChildren();
  main.append(el('p', 'section-intro',
    'Seven phases, in order. Do the missable in Chapter 1, play the story, finish the stranger strands, ' +
    'then grind the open world — and leave the five unknowns until a guide confirms them.'));
  for (const ph of data.roadmap) {
    const sec = el('section', 'phase');
    const h = el('h2', null, '');
    h.append(el('span', 'phase-num', 'Phase ' + ph.phase + ' — '));
    h.append(document.createTextNode(ph.title));
    sec.append(h);
    sec.append(el('p', null, ph.note));
    const ul = document.createElement('ul');
    for (const tid of ph.trophies) {
      const t = data.trophies.find((x) => x.id === tid);
      const li = document.createElement('li');
      if (state.earned.has(tid)) li.className = 'done';
      li.append(document.createTextNode(t.name + ' — ' + t.grade));
      if (t.missable) li.append(document.createTextNode(' (missable)'));
      if (t.unconfirmed) li.append(document.createTextNode(' (unconfirmed)'));
      ul.append(li);
    }
    sec.append(ul);
    main.append(sec);
  }
}

export function renderMissables(main, data, state) {
  main.replaceChildren();
  main.append(el('p', 'section-intro',
    'The two things this guide refuses to get wrong: the one trophy you can miss, and the five whose ' +
    'exact triggers no guide has confirmed yet.'));
  const miss = data.trophies.filter((t) => t.missable);
  const h1 = el('h2', 'serif', 'The one missable');
  main.append(h1);
  for (const t of miss) {
    main.append(trophyCard(t, data.sources, state.earned, state.refresh, state.showDetail));
  }
  main.append(el('h2', 'serif', 'The five unconfirmed'));
  main.append(el('p', null,
    'PowerPyx lists all five conditions as unknown. Each guide below gives the best reading of the ' +
    'official description and marks any single-source report as unverified. Do not treat them as fact.'));
  for (const t of data.trophies.filter((t) => t.unconfirmed)) {
    main.append(trophyCard(t, data.sources, state.earned, state.refresh, state.showDetail));
  }
}

export function renderSettings(main, data, state) {
  main.replaceChildren();
  const panel = el('div', 'settings-panel');
  panel.append(el('h2', 'serif', 'Settings'));
  const spoilerLabel = document.createElement('label');
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = state.settings.hideSpoilers;
  spoilerBox.addEventListener('change', () => {
    state.settings.hideSpoilers = spoilerBox.checked;
    state.applySettings();
  });
  spoilerLabel.append(spoilerBox, document.createTextNode(' Hide story spoilers '));
  spoilerLabel.append(el('span', 'hint', '(blurs hidden-trophy descriptions; hover to peek)'));
  panel.append(spoilerLabel);
  const resetLabel = document.createElement('label');
  const reset = el('button', null, 'Reset all progress');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    if (window.confirm('Clear every earned tick?')) {
      state.earned.clear();
      saveEarned(state.earned);
      state.refresh();
    }
  });
  resetLabel.append(reset);
  panel.append(resetLabel);
  panel.append(el('p', 'hint',
    'Progress and settings live only in this browser (localStorage). Export from the checklist view to keep a copy.'));
  main.append(panel);
}
