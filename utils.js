// ── SHARED UTILITIES ──────────────────────────────────────

// Libraries loaded via CDN in each page head
// pdf-lib, pdf.js, FileSaver.js

let STATE = {};

function fmtSz(b) {
  return b < 1024 ? b + 'B' : b < 1048576 ? (b/1024).toFixed(1) + 'KB' : (b/1048576).toFixed(2) + 'MB';
}

// ── DROP ZONE ──
function dz(id, multi = false, accept = '.pdf', label = '') {
  const accepts = accept.split(',').map(a => `<span class="dz-tag">${a.replace('.','').toUpperCase()}</span>`).join('');
  return `
  <div class="drop-zone" id="dz-${id}"
    onclick="document.getElementById('fi-${id}').click()"
    ondragover="event.preventDefault();document.getElementById('dz-${id}').classList.add('drag')"
    ondragleave="document.getElementById('dz-${id}').classList.remove('drag')"
    ondrop="dropH(event,'${id}')">
    <div class="dz-icon">📂</div>
    <h3>${label || 'Drop your file here or click to browse'}</h3>
    <p>${multi ? 'Multiple files supported · ' : ''}Drag & drop or click to select</p>
    <div class="dz-hint">${accepts}</div>
    <input type="file" id="fi-${id}" accept="${accept}" ${multi ? 'multiple' : ''}
      onchange="fileH(event,'${id}')" onclick="event.stopPropagation()">
  </div>`;
}

function dropH(e, id) {
  e.preventDefault();
  document.getElementById('dz-' + id)?.classList.remove('drag');
  pFiles(id, [...e.dataTransfer.files]);
}
function fileH(e, id) { pFiles(id, [...e.target.files]); }
function pFiles(id, files) {
  if (!STATE[id]) STATE[id] = {};
  STATE[id].files = files;
  renderFL(id, files);
}
function renderFL(id, files) {
  const el = document.getElementById('fl-' + id);
  if (!el) return;
  el.innerHTML = files.map((f, i) => `
    <div class="file-item">
      <div class="fi-icon">📄</div>
      <div class="fi-info">
        <div class="fi-name">${f.name}</div>
        <div class="fi-size">${fmtSz(f.size)}</div>
      </div>
      <button class="fi-remove" onclick="rmFile('${id}',${i})">✕ Remove</button>
    </div>`).join('');
}
function rmFile(id, i) {
  STATE[id].files.splice(i, 1);
  renderFL(id, STATE[id].files);
}

// ── PROGRESS ──
function progHTML(id) {
  return `<div class="prog-wrap" id="pw-${id}">
    <div class="prog-top">
      <span class="prog-label" id="pl-${id}">Processing…</span>
      <span class="prog-pct" id="pp-${id}">0%</span>
    </div>
    <div class="prog-track"><div class="prog-fill" id="pf-${id}"></div></div>
    <div class="prog-msg" id="pm-${id}"></div>
  </div>`;
}
function showProg(id, pct, lbl = '', msg = '') {
  const pw = document.getElementById('pw-' + id); if (pw) pw.style.display = '';
  const pf = document.getElementById('pf-' + id); if (pf) pf.style.width = pct + '%';
  const pp = document.getElementById('pp-' + id); if (pp) pp.textContent = pct + '%';
  const pl = document.getElementById('pl-' + id); if (pl && lbl) pl.textContent = lbl;
  const pm = document.getElementById('pm-' + id); if (pm && msg) pm.textContent = msg;
}
function hideProg(id) {
  const pw = document.getElementById('pw-' + id); if (pw) pw.style.display = 'none';
}

// ── RESULT BOX ──
function resHTML(id) {
  return `<div class="result-box" id="rb-${id}">
    <div class="res-icon">✅</div>
    <h3>Done!</h3>
    <p id="rb-msg-${id}"></p>
    <div class="btn-row" id="rb-btn-${id}"></div>
  </div>`;
}
function showRes(id, msg, btns = '') {
  const rb = document.getElementById('rb-' + id); if (rb) rb.style.display = '';
  const rm = document.getElementById('rb-msg-' + id); if (rm) rm.textContent = msg;
  const rbt = document.getElementById('rb-btn-' + id); if (rbt) rbt.innerHTML = btns;
}

// ── PDF LOAD ──
async function loadPDF(file) {
  return await PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
}

// ── NAV ACTIVE ──
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);
