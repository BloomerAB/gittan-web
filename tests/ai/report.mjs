#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const runDir = resolve(process.argv[2] || '.');
const runFile = join(runDir, 'run.json');

if (!existsSync(runFile)) {
  console.error(`No run.json found in ${runDir}`);
  process.exit(1);
}

const run = JSON.parse(readFileSync(runFile, 'utf-8'));

function loadScreenshot(relativePath) {
  if (!relativePath) return null;
  const abs = join(runDir, relativePath);
  if (!existsSync(abs)) return null;
  const buf = readFileSync(abs);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

let caseIndex = 0;
let stepsHtml = '';
let navHtml = '';

for (const feature of run.features || []) {
  navHtml += `<div class="nav-feature">${esc(feature.name)}</div>`;

  for (const c of feature.cases || []) {
    const casePass = c.result === 'pass';
    const badge = casePass ? '✓' : '✗';
    const cls = casePass ? 'pass' : 'fail';
    navHtml += `<a class="nav-case ${cls}" href="#case-${esc(c.id)}">`
      + `<span class="nav-badge ${cls}">${badge}</span>${esc(c.name)}</a>`;

    stepsHtml += `<article id="case-${esc(c.id)}">`;
    stepsHtml += `<div class="case-header">`;
    stepsHtml += `<h2>${esc(c.id)}: ${esc(c.name)}</h2>`;
    stepsHtml += `<span class="badge ${cls}">${casePass ? 'PASS' : 'FAIL'}</span>`;
    stepsHtml += `</div>`;

    // Horizontal screenshot strip
    stepsHtml += `<div class="strip" data-case="${caseIndex}">`;
    for (const step of c.steps || []) {
      const sPass = step.status === 'pass';
      const sCls = sPass ? 'pass' : 'fail';
      const img = loadScreenshot(step.screenshot);
      if (img) {
        stepsHtml += `<div class="strip-card ${sCls}" data-case="${caseIndex}" data-step="${step.number}">`;
        stepsHtml += `<div class="strip-num"><span class="step-dot ${sCls}">${step.number}</span></div>`;
        stepsHtml += `<div class="thumb"><img src="${img}" alt="Step ${step.number}"></div>`;
        stepsHtml += `</div>`;
      } else {
        stepsHtml += `<div class="strip-dot-only ${sCls}" data-case="${caseIndex}" data-step="${step.number}">`;
        stepsHtml += `<span class="step-dot ${sCls}">${step.number}</span>`;
        stepsHtml += `</div>`;
      }
    }
    stepsHtml += `</div>`;

    // Detail modal (overlay)
    stepsHtml += `<div class="detail-panel" data-case="${caseIndex}" data-case-id="${esc(c.id)}" data-case-name="${esc(c.name)}" data-case-result="${cls}" role="dialog" aria-modal="true">`;
    stepsHtml += `<button type="button" class="detail-nav detail-prev" aria-label="Previous step">‹</button>`;
    stepsHtml += `<button type="button" class="detail-nav detail-next" aria-label="Next step">›</button>`;
    stepsHtml += `<div class="detail-content">`;
    stepsHtml += `<button type="button" class="detail-close" aria-label="Close">×</button>`;
    stepsHtml += `<div class="detail-case-header"></div>`;
    stepsHtml += `<div class="detail-step-title"></div>`;
    stepsHtml += `<div class="detail-meta"></div>`;
    stepsHtml += `<div class="detail-img"></div>`;
    stepsHtml += `</div>`;
    stepsHtml += `</div>`;

    // Hidden step data for JS
    stepsHtml += `<script type="application/json" class="step-data" data-case="${caseIndex}">`;
    stepsHtml += JSON.stringify((c.steps || []).map(step => ({
      number: step.number,
      action: step.action,
      expect: step.expect,
      status: step.status,
      note: step.note || '',
      error: step.error || '',
      hasImg: !!loadScreenshot(step.screenshot),
    })));
    stepsHtml += `</script>`;

    stepsHtml += `</article>`;
    caseIndex++;
  }
}

const s = run.summary || {};
const inProgress = !!s.in_progress;
const totalPlanned = s.total_planned || s.total_cases || 0;
const completed = s.total_cases || 0;
const allPass = (s.failed_steps || 0) === 0;
const verdict = inProgress ? '…' : (allPass ? '✓' : '✗');
const verdictCls = inProgress ? 'running' : (allPass ? 'pass' : 'fail');
const refreshMeta = '';
const liveModeFlag = inProgress ? 'true' : 'false';
const titlePrefix = inProgress ? `(${completed}/${totalPlanned}) ` : '';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${refreshMeta}
<title>${titlePrefix}AI Test — Gittan</title>
<style>
:root {
  --bg: #0f0f11;
  --surface: #1a1a1f;
  --ink: #e5e5e7;
  --ink-muted: #71717a;
  --accent: #c4993a;
  --green: #22c55e;
  --border: rgba(255,255,255,0.08);
  --pass-bg: rgba(34,197,94,0.1);
  --fail-bg: rgba(239,68,68,0.1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
.layout { display: flex; min-height: 100vh; }

/* Sidebar */
nav.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
nav.sidebar h1 { font-size: 1.1rem; margin-bottom: 0.5rem; }
.nav-meta { font-size: 0.8rem; color: var(--ink-muted); margin-bottom: 1.5rem; line-height: 1.6; }
.nav-feature { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); margin-top: 1rem; margin-bottom: 0.3rem; }
.nav-case { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.5rem; border-radius: 6px; text-decoration: none; color: var(--ink); font-size: 0.85rem; }
.nav-case:hover { background: var(--bg); }
.nav-badge { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; color: white; }
.nav-badge.pass { background: var(--green); }
.nav-badge.fail { background: var(--accent); }

/* Main */
main.content { flex: 1; padding: 2rem; max-width: 960px; }

/* Summary */
.summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--surface);
  border-radius: 12px;
  margin-bottom: 2rem;
}
.verdict { font-size: 2.5rem; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; }
.verdict.pass { background: var(--green); }
.verdict.fail { background: var(--accent); }
.verdict.running { background: var(--ink-muted); animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
.live-pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.7rem; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); font-size: 0.75rem; font-weight: 600; color: var(--ink-muted); margin-left: 0.6rem; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
.progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 0.5rem; max-width: 280px; }
.progress-fill { height: 100%; background: var(--green); transition: width 0.4s ease; }
.summary-text h2 { font-size: 1.1rem; display: flex; align-items: center; }
.summary-stats { font-size: 0.85rem; color: var(--ink-muted); }

/* Case */
article { margin-bottom: 2.5rem; }
.case-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.75rem; }
.case-header h2 { font-size: 1rem; }
.badge { padding: 0.15rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; }
.badge.pass { background: var(--green); }
.badge.fail { background: var(--accent); }

/* Horizontal screenshot strip */
.strip {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 6px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.strip::-webkit-scrollbar { height: 4px; }
.strip::-webkit-scrollbar-track { background: transparent; }
.strip::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.strip-card {
  flex-shrink: 0;
  width: 200px;
  cursor: pointer;
  border-radius: 8px;
  transition: transform 0.15s;
  scroll-snap-align: start;
  position: relative;
  outline: 3px solid transparent;
  outline-offset: 2px;
  background: var(--surface);
}
.strip-card:hover { transform: translateY(-2px); }
.strip-card.active { outline-color: var(--accent); }
/* Desktop thumbnails: landscape ratio (1280x800 → 0.625, shown at 200x140) */
.strip-card .thumb {
  width: 200px;
  height: 140px;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}
.strip-card .thumb img {
  width: 200px;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}
.strip-card .thumb::after {
  /* Fade-out at the bottom to indicate the image is clipped */
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 28px;
  background: linear-gradient(to bottom, transparent, rgba(15,15,17,0.95));
  pointer-events: none;
}
/* Steps without screenshots — just a clickable dot */
.strip-dot-only {
  flex-shrink: 0;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}
.strip-dot-only:hover { background: var(--surface); }
.strip-dot-only.active { border-color: var(--accent); }
.strip-num {
  display: flex;
  justify-content: center;
  padding: 0.25rem 0;
}
.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}
.step-dot.pass { background: var(--green); }
.step-dot.fail { background: var(--accent); }

/* Detail modal (overlay) */
.detail-panel {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  overflow-y: auto;
  animation: fadeIn 0.12s ease-out;
}
.detail-panel.open { display: flex; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.detail-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem 1rem 0.85rem;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  max-width: 700px;
  width: 100%;
  height: 90vh;
  max-height: 90vh;
}
/* Text blocks: fixed (won't shrink). Image: fills remaining space, never overflows. */
.detail-content .detail-step-title { flex: 0 0 auto; }
.detail-content .detail-meta { flex: 0 0 auto; }
.detail-content .detail-img {
  flex: 1 1 0;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.detail-close {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--bg);
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-close:hover { background: var(--border); color: var(--ink); }
.detail-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(26,26,31,0.92);
  border-radius: 50%;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  user-select: none;
}
.detail-nav:hover { background: var(--surface); }
.detail-nav:disabled { opacity: 0.3; cursor: not-allowed; }
.detail-prev { left: max(0.5rem, calc(50vw - 370px)); }
.detail-next { right: max(0.5rem, calc(50vw - 370px)); }
@media (max-width: 800px) {
  .detail-prev { left: 0.4rem; }
  .detail-next { right: 0.4rem; }
  .detail-nav { width: 40px; height: 40px; font-size: 1.3rem; }
}
.detail-step-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted);
  margin-bottom: 0.25rem;
}
.detail-meta {}
.detail-meta .detail-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted);
  margin-top: 0.6rem;
  margin-bottom: 0.15rem;
}
.detail-meta .detail-label:first-child { margin-top: 0; }
.detail-meta .detail-text {
  font-size: 0.9rem;
  line-height: 1.4;
}
.detail-meta .detail-error {
  color: var(--accent);
  font-weight: 500;
  font-size: 0.9rem;
  margin-top: 0.4rem;
}
.detail-meta .detail-note {
  color: var(--ink-muted);
  font-style: italic;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}
.detail-img img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
  margin: 0 auto;
  cursor: zoom-in;
  object-fit: contain;
}
.detail-img img.expanded {
  max-width: none;
  max-height: none;
  cursor: zoom-out;
}
/* Tighter meta typography when modal is short */
.detail-meta .detail-label { margin-top: 0.4rem; margin-bottom: 0.1rem; }
.detail-meta .detail-label:first-child { margin-top: 0; }
.detail-meta .detail-text { font-size: 0.85rem; line-height: 1.35; }
/* Case header in modal */
.detail-case-header {
  flex: 0 0 auto;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.25rem;
}
.detail-case-id {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.7rem;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-case-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  margin-top: 0.1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.detail-case-result {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 0.6rem;
  color: white;
  flex-shrink: 0;
}
.detail-case-result.pass { background: var(--green); }
.detail-case-result.fail { background: var(--accent); }

@media (max-width: 768px) {
  .layout { flex-direction: column; }
  nav.sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid var(--border); }
  main.content { padding: 1rem; }
  .detail-img img { max-width: 100%; }
}
</style>
</head>
<body>
<div class="layout">
  <nav class="sidebar">
    <h1>Gittan</h1>
    <div class="nav-meta">
      AI Test Report<br>
      ${esc(run.timestamp || '')}<br>
      ${run.model ? `Model: ${esc(run.model)}` : ''}
      ${run.duration_seconds ? `<br>${formatDuration(run.duration_seconds)}` : ''}
    </div>
    ${navHtml}
  </nav>
  <main class="content">
    <div class="summary">
      <div class="verdict ${verdictCls}">${verdict}</div>
      <div class="summary-text">
        <h2>
          ${inProgress ? `${completed}/${totalPlanned} cases done` : `${s.passed_steps || 0}/${s.total_steps || 0} steps`}
          ${inProgress ? `<span class="live-pill"><span class="live-dot"></span>running live (auto-refresh)</span>` : ''}
        </h2>
        <div class="summary-stats">
          ${s.total_cases || 0} cases &middot;
          ${s.passed_cases || 0} pass &middot;
          ${s.failed_cases || 0} fail
        </div>
        ${inProgress && totalPlanned > 0 ? `<div class="progress-bar"><div class="progress-fill" style="width:${Math.round((completed / totalPlanned) * 100)}%"></div></div>` : ''}
      </div>
    </div>
    ${stepsHtml}
  </main>
</div>
<script>
const allData = {};
document.querySelectorAll('.step-data').forEach(el => {
  allData[el.dataset.case] = JSON.parse(el.textContent);
});

let openPanel = null;
let openCaseIdx = null;
let openStepNum = null;

function closeModal() {
  if (!openPanel) return;
  openPanel.classList.remove('open');
  openPanel = null;
  openCaseIdx = null;
  openStepNum = null;
  document.body.style.overflow = '';
}

function nextStep(direction) {
  if (openCaseIdx == null) return;
  const steps = allData[openCaseIdx] || [];
  if (steps.length === 0) return;
  const idx = steps.findIndex(s => s.number === openStepNum);
  if (idx < 0) return;
  const nextIdx = idx + direction;
  if (nextIdx < 0 || nextIdx >= steps.length) return; // no wrap
  showStep(openCaseIdx, steps[nextIdx].number);
}

function updateNavButtons() {
  if (!openPanel) return;
  const steps = allData[openCaseIdx] || [];
  const idx = steps.findIndex(s => s.number === openStepNum);
  const prevBtn = openPanel.querySelector('.detail-prev');
  const nextBtn = openPanel.querySelector('.detail-next');
  if (prevBtn) prevBtn.disabled = idx <= 0;
  if (nextBtn) nextBtn.disabled = idx >= steps.length - 1;
}

function showStep(caseIdx, stepNum) {
  // Activate clicked item visually in the strip
  document.querySelectorAll('[data-case="' + caseIdx + '"].strip-card, [data-case="' + caseIdx + '"].strip-dot-only')
    .forEach(c => c.classList.remove('active'));
  const card = document.querySelector('[data-case="' + caseIdx + '"][data-step="' + stepNum + '"]');
  if (card) card.classList.add('active');

  const steps = allData[caseIdx] || [];
  const step = steps.find(s => s.number === stepNum);
  if (!step) return;

  const panel = document.querySelector('.detail-panel[data-case="' + caseIdx + '"]');
  if (!panel) return;

  // Case header at top of modal
  const caseHeader = panel.querySelector('.detail-case-header');
  const caseId = panel.dataset.caseId || '';
  const caseName = panel.dataset.caseName || '';
  const caseResult = panel.dataset.caseResult || 'pass';
  caseHeader.innerHTML =
    '<div class="detail-case-id">' + escHtml(caseId) + '</div>' +
    '<div class="detail-case-name">' +
      '<span class="detail-case-result ' + caseResult + '">' + (caseResult === 'pass' ? '✓' : '✗') + '</span>' +
      '<span>' + escHtml(caseName) + '</span>' +
    '</div>';

  // Title (step)
  panel.querySelector('.detail-step-title').textContent = 'Step ' + stepNum + ' — ' + (step.status === 'pass' ? '✓ Pass' : '✗ Fail');

  const meta = panel.querySelector('.detail-meta');
  let h = '';
  h += '<div class="detail-label">Action</div>';
  h += '<div class="detail-text">' + escHtml(step.action) + '</div>';
  if (step.expect && step.expect !== step.action) {
    h += '<div class="detail-label">Expect</div>';
    h += '<div class="detail-text">' + escHtml(step.expect) + '</div>';
  }
  if (step.error) {
    h += '<div class="detail-error">' + escHtml(step.error) + '</div>';
  }
  if (step.note) {
    h += '<div class="detail-note">' + escHtml(step.note) + '</div>';
  }
  meta.innerHTML = h;

  // Fill image — grab from the strip card's img if it exists
  const imgEl = panel.querySelector('.detail-img');
  const cardImg = card ? card.querySelector('img') : null;
  if (cardImg) {
    imgEl.innerHTML = '<img src="' + cardImg.src + '" alt="Step ' + stepNum + '">';
    imgEl.style.display = '';
  } else {
    imgEl.innerHTML = '';
    imgEl.style.display = 'none';
  }

  // Show modal + lock body scroll
  if (openPanel && openPanel !== panel) {
    openPanel.classList.remove('open');
  }
  openPanel = panel;
  openCaseIdx = caseIdx;
  openStepNum = stepNum;
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateNavButtons();
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

document.addEventListener('click', e => {
  // Prev / next buttons
  if (e.target.closest('.detail-prev')) { nextStep(-1); return; }
  if (e.target.closest('.detail-next')) { nextStep(1); return; }

  // Zoom on screenshot
  const img = e.target.closest('.detail-img img');
  if (img) { img.classList.toggle('expanded'); return; }

  // Close on backdrop (modal area outside content) or close-button
  if (e.target.classList.contains('detail-panel') || e.target.classList.contains('detail-close')) {
    closeModal();
  }
});

document.addEventListener('keydown', e => {
  if (!openPanel) return;
  if (e.key === 'Escape') closeModal();
  else if (e.key === 'ArrowLeft') nextStep(-1);
  else if (e.key === 'ArrowRight') nextStep(1);
});

// Event delegation for strip-cards so soft-refresh can replace content
// without rebinding handlers manually.
document.addEventListener('click', e => {
  const card = e.target.closest('.strip-card, .strip-dot-only');
  if (card && !e.target.closest('.detail-panel')) {
    showStep(parseInt(card.dataset.case), parseInt(card.dataset.step));
  }
});

// Helper to reload step-data from injected <script class="step-data"> tags.
// Called after soft-refresh so allData reflects new cases.
function reloadStepData() {
  Object.keys(allData).forEach(k => delete allData[k]);
  document.querySelectorAll('.step-data').forEach(el => {
    allData[el.dataset.case] = JSON.parse(el.textContent);
  });
}

// Live-mode: preserve scroll position over refresh so the user doesn't
// jump to the top every time a new test result lands.
(function () {
  const KEY = 'gittan-report-scroll';
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
  }
  window.addEventListener('scroll', () => {
    sessionStorage.setItem(KEY, String(window.scrollY));
  }, { passive: true });
})();

// Live soft-refresh — fetches new report.html and swaps nav.sidebar and
// main.content without reloading the page. No blink, scroll stays put.
// Pauses when modal is open. Stops when the suite run completes.
let liveMode = ${liveModeFlag};
(function () {
  if (!liveMode) return;

  const isModalOpen = () => !!document.querySelector('.detail-panel.open');
  let timer = null;
  let refreshing = false;
  let wasPaused = false;

  function setPillState(paused) {
    const pill = document.querySelector('.live-pill');
    if (!pill) return;
    pill.innerHTML = paused
      ? '<span class="live-dot"></span>paused (close modal to resume)'
      : '<span class="live-dot"></span>running live (auto-refresh)';
  }

  async function softRefresh() {
    if (refreshing) return;
    if (isModalOpen()) {
      if (!wasPaused) { wasPaused = true; setPillState(true); }
      return;
    }
    if (wasPaused) { wasPaused = false; setPillState(false); }
    refreshing = true;
    try {
      const res = await fetch(location.pathname + '?t=' + Date.now(), { cache: 'no-cache' });
      if (!res.ok) return;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newNav = doc.querySelector('nav.sidebar');
      const newMain = doc.querySelector('main.content');
      const curNav = document.querySelector('nav.sidebar');
      const curMain = document.querySelector('main.content');
      if (newNav && curNav) curNav.innerHTML = newNav.innerHTML;
      if (newMain && curMain) curMain.innerHTML = newMain.innerHTML;
      reloadStepData();
      // Update title (so tab shows "X/Y" progress)
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;
      // If run is done in new HTML, stop polling
      const stillLive = !!doc.querySelector('.live-pill');
      if (!stillLive) {
        liveMode = false;
        if (timer) { clearInterval(timer); timer = null; }
      }
    } catch {
      // Ignore transient errors — retry in 3s
    } finally {
      refreshing = false;
    }
  }

  timer = setInterval(softRefresh, 3000);
})();
</script>
</body>
</html>`;

const outPath = join(runDir, 'report.html');
writeFileSync(outPath, html);
console.log(`Report: ${outPath}`);
