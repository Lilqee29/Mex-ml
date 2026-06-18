// ═══════════════════════════════════════════════════════
//  MEX UI — File management, localStorage, rendering
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = 'mex-playground-files';

// ── State ───────────────────────────────────────────
let files = [{name: 'untitled.mx', content: EXAMPLES.linear.code}];
let currentFile = 0;

// ── Load from localStorage ──────────────────────────
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.files && data.files.length > 0) {
        files = data.files;
        currentFile = data.currentFile || 0;
      }
    }
  } catch (e) { /* ignore */ }
}

// ── Save to localStorage ────────────────────────────
function saveToStorage() {
  try {
    files[currentFile].content = editor.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({files, currentFile}));
  } catch (e) { /* ignore */ }
}

// ── Tab rendering ───────────────────────────────────
function renderTabs() {
  const bar = document.getElementById('tabBar');
  bar.innerHTML = '';
  files.forEach((f, i) => {
    const tab = document.createElement('div');
    tab.className = 'file-tab' + (i === currentFile ? ' active' : '');
    tab.innerHTML = `<span>${f.name}</span><span class="close" data-i="${i}">&times;</span>`;
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('close')) {
        deleteFile(parseInt(e.target.dataset.i));
      } else {
        switchFile(i);
      }
    });
    bar.appendChild(tab);
  });
  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'tab-add';
  addBtn.textContent = '+';
  addBtn.title = 'New file';
  addBtn.addEventListener('click', newFile);
  bar.appendChild(addBtn);
}

function switchFile(i) {
  files[currentFile].content = editor.value;
  currentFile = i;
  editor.value = files[i].content;
  syncHighlight();
  renderTabs();
  clearOutput();
  saveToStorage();
}

function newFile() {
  const name = prompt('File name:', 'script-' + (files.length + 1) + '.mx');
  if (!name) return;
  files.push({name, content: ''});
  switchFile(files.length - 1);
}

function deleteFile(i) {
  if (files.length <= 1) return;
  files.splice(i, 1);
  if (currentFile >= files.length) currentFile = files.length - 1;
  switchFile(currentFile);
}

// ── Output ──────────────────────────────────────────
function clearOutput() {
  document.getElementById('output').innerHTML = '';
  setStatus('ready');
}

function addOutput(text, type = '') {
  const out = document.getElementById('output');
  const line = document.createElement('div');
  line.className = 'ol ' + type;
  const prefix = type === 'error' ? '! ' : type === 'success' ? '+ ' : '> ';
  line.innerHTML = `<span class="pfx">${prefix}</span>${String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;')}`;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function setStatus(state) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  dot.className = 'status-dot ' + (state === 'running' ? 'running' : state === 'done' ? 'success' : state === 'error' ? 'error' : '');
  text.textContent = state === 'running' ? 'Running...' : state === 'done' ? 'Done' : state === 'error' ? 'Error' : 'Ready';
}

// ── Run ─────────────────────────────────────────────
function runCode() {
  const code = editor.value.trim();
  if (!code) return;
  clearOutput();
  setStatus('running');
  try {
    const ast = parse(code);
    const result = interpret(ast);
    for (const line of result) addOutput(line);
    setStatus('done');
  } catch (e) {
    addOutput(e.message || String(e), 'error');
    setStatus('error');
  }
}

// ── Load example ────────────────────────────────────
function loadExample(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;
  files[currentFile].content = ex.code;
  editor.value = ex.code;
  syncHighlight();
  clearOutput();
  closeAllDropdowns();
  saveToStorage();
}

// ── Dropdown management ─────────────────────────────
function toggleDropdown(id) {
  const menu = document.getElementById(id);
  const wasOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!wasOpen) menu.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) closeAllDropdowns();
});

// ── Syntax page ─────────────────────────────────────
function openSyntax() {
  document.getElementById('syntaxOverlay').classList.add('open');
}

function closeSyntax() {
  document.getElementById('syntaxOverlay').classList.remove('open');
}

document.getElementById('syntaxOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('syntaxOverlay')) closeSyntax();
});

// ── Export ──────────────────────────────────────────
function exportFile() {
  files[currentFile].content = editor.value;
  const blob = new Blob([files[currentFile].content], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = files[currentFile].name;
  a.click();
  URL.revokeObjectURL(a.href);
  addOutput('Exported: ' + files[currentFile].name, 'success');
}

// ── Import CSV ──────────────────────────────────────
function importCSV() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.txt';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split('\n');
      if (lines.length < 2) { addOutput('CSV too short', 'error'); return; }

      const header = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));

      // Convert to MEX data points (assume last column is output)
      const inputCols = header.length - 1;
      let mexCode = '## Imported from ' + file.name + '\n';
      mexCode += '## Columns: ' + header.join(', ') + '\n\n';
      mexCode += 'data points\n';
      for (const row of rows) {
        const inputs = row.slice(0, inputCols).join(', ');
        const output = row[inputCols];
        mexCode += '  (' + inputs + ', ' + output + ')\n';
      }

      files[currentFile].content = mexCode;
      editor.value = mexCode;
      syncHighlight();
      addOutput('Imported: ' + file.name + ' (' + rows.length + ' rows)', 'success');
      saveToStorage();
    };
    reader.readAsText(file);
  });
  input.click();
}

// ── Init ────────────────────────────────────────────
const editor = document.getElementById('editor');
const highlightLayer = document.getElementById('highlightLayer');
const highlightCode = document.getElementById('highlightCode');

// Sync highlighted code with textarea
function syncHighlight() {
  highlightCode.innerHTML = highlightMEX(editor.value);
}

// Sync scroll between textarea and highlight layer
function syncScroll() {
  highlightLayer.scrollTop = editor.scrollTop;
  highlightLayer.scrollLeft = editor.scrollLeft;
}

loadFromStorage();
renderTabs();
editor.value = files[currentFile].content;
syncHighlight();

// Auto-save and re-highlight on typing
editor.addEventListener('input', () => {
  files[currentFile].content = editor.value;
  syncHighlight();
  saveToStorage();
});

// Sync scroll position
editor.addEventListener('scroll', syncScroll);

// Autocomplete
const acContainer = document.createElement('div');
new Autocomplete(editor, acContainer);

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveToStorage(); addOutput('Saved', 'success'); }
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = start + 2;
    syncHighlight();
  }
});

// Close dropdowns on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDropdowns();
    closeSyntax();
  }
});
