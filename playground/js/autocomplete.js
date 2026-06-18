// ═══════════════════════════════════════════════════════
//  MEX AUTOCOMPLETE — Intelligence for the editor
// ═══════════════════════════════════════════════════════

const MEX_KEYWORDS = [
  {word:'let',     type:'kw', desc:'Declare variable: let x = 5'},
  {word:'if',      type:'kw', desc:'Condition: if (x > 0) { }'},
  {word:'else',    type:'kw', desc:'Else branch: } else { }'},
  {word:'for',     type:'kw', desc:'Loop: for i in range(5) { }'},
  {word:'while',   type:'kw', desc:'Loop: while (x > 0) { }'},
  {word:'fn',      type:'kw', desc:'Function: fn name(args) { }'},
  {word:'return',  type:'kw', desc:'Return value: return x + 1'},
  {word:'true',    type:'kw', desc:'Boolean true'},
  {word:'false',   type:'kw', desc:'Boolean false'},
  {word:'and',     type:'kw', desc:'Logical AND: a and b'},
  {word:'or',      type:'kw', desc:'Logical OR: a or b'},
  {word:'not',     type:'kw', desc:'Logical NOT: not x'},
  {word:'data',    type:'kw', desc:'Load data: data points'},
  {word:'points',  type:'kw', desc:'Inline data points'},
  {word:'model',   type:'kw', desc:'Create model: model simple'},
  {word:'simple',  type:'kw', desc:'Linear model: model simple'},
  {word:'sequential',type:'kw',desc:'Deep model: model sequential'},
  {word:'dense',   type:'kw', desc:'Layer: dense 8 relu'},
  {word:'dropout', type:'kw', desc:'Regularization: dropout 0.2'},
  {word:'train',   type:'kw', desc:'Train: train 200 epochs'},
  {word:'epochs',  type:'kw', desc:'Training iterations'},
  {word:'predict', type:'kw', desc:'Predict: predict 5'},
  {word:'show',    type:'kw', desc:'Show: show results'},
  {word:'results', type:'kw', desc:'Show predictions'},
  {word:'print',   type:'kw', desc:'Output: print("hello")'},
  {word:'range',   type:'kw', desc:'Range: range(5) or range(0, 10)'},
  {word:'import',  type:'kw', desc:'Import module'},
  {word:'export',  type:'kw', desc:'Export names'},
  {word:'save',    type:'kw', desc:'Save model: save model "file.json"'},
  {word:'load',    type:'kw', desc:'Load model: load model "file.json"'},
];

const MEX_FUNCTIONS = [
  {word:'abs',     type:'fn', desc:'Absolute value: abs(-5)'},
  {word:'sqrt',    type:'fn', desc:'Square root: sqrt(16)'},
  {word:'pow',     type:'fn', desc:'Power: pow(2, 3)'},
  {word:'floor',   type:'fn', desc:'Round down: floor(3.7)'},
  {word:'ceil',    type:'fn', desc:'Round up: ceil(3.2)'},
  {word:'round',   type:'fn', desc:'Round: round(3.5)'},
  {word:'random',  type:'fn', desc:'Random 0-1: random()'},
  {word:'log',     type:'fn', desc:'Natural log: log(100)'},
  {word:'exp',     type:'fn', desc:'e^x: exp(1)'},
  {word:'min',     type:'fn', desc:'Minimum: min([1,2,3])'},
  {word:'max',     type:'fn', desc:'Maximum: max([1,2,3])'},
  {word:'sum',     type:'fn', desc:'Sum array: sum([1,2,3])'},
  {word:'len',     type:'fn', desc:'Array length: len([1,2,3])'},
  {word:'sort',    type:'fn', desc:'Sort array: sort([3,1,2])'},
  {word:'sort_by', type:'fn', desc:'Sort by key: sort_by(arr, fn(x) { return x })'},
  {word:'reverse', type:'fn', desc:'Reverse array: reverse([1,2,3])'},
  {word:'unique',  type:'fn', desc:'Unique values: unique([1,1,2])'},
  {word:'flatten', type:'fn', desc:'Flatten nested: flatten([[1,2],[3]])'},
  {word:'slice',   type:'fn', desc:'Slice array: slice(arr, 1, 3)'},
  {word:'head',    type:'fn', desc:'First n: head([1,2,3], 2)'},
  {word:'tail',    type:'fn', desc:'Last n: tail([1,2,3], 2)'},
  {word:'zip',     type:'fn', desc:'Zip arrays: zip([1,2], [3,4])'},
  {word:'push',    type:'fn', desc:'Add to end: arr.push(5)'},
  {word:'pop',     type:'fn', desc:'Remove last: arr.pop()'},
  {word:'shift',   type:'fn', desc:'Remove first: arr.shift()'},
  {word:'unshift', type:'fn', desc:'Add to start: arr.unshift(5)'},
  {word:'includes',type:'fn', desc:'Contains: arr.includes(5)'},
  {word:'indexOf', type:'fn', desc:'Find index: arr.indexOf(5)'},
  {word:'join',    type:'fn', desc:'Join to string: arr.join(", ")'},
  {word:'map',     type:'fn', desc:'Transform: map(arr, fn(x) { return x * 2 })'},
  {word:'filter',  type:'fn', desc:'Filter: filter(arr, fn(x) { return x > 3 })'},
  {word:'reduce',  type:'fn', desc:'Reduce: reduce(arr, fn(a, b) { return a + b }, 0)'},
  {word:'each',    type:'fn', desc:'Iterate: each(arr, fn(x) { print(x) })'},
  {word:'find',    type:'fn', desc:'Find first: find(arr, fn(x) { return x > 3 })'},
  {word:'every',   type:'fn', desc:'All match: every(arr, fn(x) { return x > 0 })'},
  {word:'some',    type:'fn', desc:'Any match: some(arr, fn(x) { return x > 3 })'},
  {word:'mean',    type:'fn', desc:'Average: mean([1,2,3])'},
  {word:'median',  type:'fn', desc:'Middle value: median([1,2,3])'},
  {word:'mode',    type:'fn', desc:'Most common: mode([1,1,2])'},
  {word:'std',     type:'fn', desc:'Standard deviation: std([1,2,3])'},
  {word:'variance',type:'fn', desc:'Variance: variance([1,2,3])'},
  {word:'normalize',type:'fn', desc:'Normalize array: normalize([1,2,3])'},
  {word:'column',  type:'fn', desc:'Get column: column(data, 0)'},
  {word:'columns', type:'fn', desc:'Count columns: columns(data)'},
  {word:'select',  type:'fn', desc:'Select columns: select(data, [0, 2])'},
  {word:'pluck',   type:'fn', desc:'Extract column: pluck(data, 0)'},
  {word:'distinct',type:'fn', desc:'Unique values: distinct([1,1,2])'},
  {word:'count_by',type:'fn', desc:'Count by key: count_by(arr, fn(x) { return x })'},
  {word:'group_by',type:'fn', desc:'Group by key: group_by(arr, fn(x) { return x })'},
  {word:'upper',   type:'fn', desc:'Uppercase: upper("hello")'},
  {word:'lower',   type:'fn', desc:'Lowercase: lower("HELLO")'},
  {word:'trim',    type:'fn', desc:'Trim whitespace: trim("  hi  ")'},
  {word:'split',   type:'fn', desc:'Split string: split("a,b,c", ",")'},
  {word:'replace', type:'fn', desc:'Replace: replace("hello", "world", "MEX")'},
  {word:'type',    type:'fn', desc:'Get type: type(42)'},
  {word:'to_number',type:'fn', desc:'Convert to number: to_number("42")'},
  {word:'to_string',type:'fn', desc:'Convert to string: to_string(42)'},
];
  {word:'reverse', type:'fn', desc:'Reverse array: reverse([1,2,3])'},
  {word:'unique',  type:'fn', desc:'Remove duplicates: unique([1,1,2])'},
  {word:'concat',  type:'fn', desc:'Join arrays: concat([1],[2])'},
  {word:'append',  type:'fn', desc:'Add to array: append([1], 2)'},
  {word:'map',     type:'fn', desc:'Transform: map(arr, fn(x) { return x*2 })'},
  {word:'filter',  type:'fn', desc:'Filter: filter(arr, fn(x) { return x>3 })'},
  {word:'reduce',  type:'fn', desc:'Reduce: reduce(arr, fn(x,acc) { return x+acc }, 0)'},
  {word:'mean',    type:'fn', desc:'Average: mean([1,2,3])'},
  {word:'normalize',type:'fn',desc:'Normalize to 0-1: normalize([1,2,3])'},
  {word:'sigmoid', type:'fn', desc:'Sigmoid: sigmoid(0.5)'},
  {word:'relu',    type:'fn', desc:'ReLU: relu(-1)'},
  {word:'tanh',    type:'fn', desc:'Tanh: tanh(0.5)'},
];

const MEX_ACTIVATIONS = ['relu', 'sigmoid', 'tanh', 'linear', 'softmax'];
const MEX_SNIPPETS = {
  'fn': {text:'fn ${1:name}(${2:args}) {\n  ${3:return}\n}', desc:'Function'},
  'if': {text:'if (${1:condition}) {\n  ${2}\n}', desc:'If statement'},
  'ifelse': {text:'if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}', desc:'If-else'},
  'for': {text:'for ${1:i} in range(${2:n}) {\n  ${3}\n}', desc:'For loop'},
  'while': {text:'while (${1:condition}) {\n  ${2}\n}', desc:'While loop'},
  'model': {text:'model sequential\n  dense ${1:8} ${2:relu}\n  dense ${3:1} ${4:sigmoid}', desc:'Neural network'},
  'train': {text:'train ${1:200} epochs', desc:'Training'},
  'data': {text:'data points\n  (${1:0}, ${2:0})\n  (${3:1}, ${4:1})', desc:'Data points'},
  'print': {text:'print("${1:message}")', desc:'Print'},
  'map': {text:'map(${1:arr}, fn(${2:x}) { return ${3:x} })', desc:'Map'},
  'filter': {text:'filter(${1:arr}, fn(${2:x}) { return ${3:x > 0} })', desc:'Filter'},
  'reduce': {text:'reduce(${1:arr}, fn(${2:x}, ${3:acc}) { return ${4:x + acc} }, ${5:0})', desc:'Reduce'},
};

const ALL_SUGGESTIONS = [...MEX_KEYWORDS, ...MEX_FUNCTIONS];

class Autocomplete {
  constructor(editor, container) {
    this.editor = editor;
    this.container = container;
    this.visible = false;
    this.items = [];
    this.selected = 0;
    this.wordStart = 0;
    this.word = '';

    this.container.className = 'autocomplete';
    document.body.appendChild(this.container);

    this.editor.addEventListener('input', () => this.onInput());
    this.editor.addEventListener('keydown', (e) => this.onKey(e));
    this.editor.addEventListener('blur', () => setTimeout(() => this.hide(), 150));
    this.editor.addEventListener('click', () => this.hide());
  }

  getWord() {
    const pos = this.editor.selectionStart;
    const text = this.editor.value;
    let start = pos - 1;
    while (start >= 0 && /[a-zA-Z0-9_]/.test(text[start])) start--;
    start++;
    return {word: text.substring(start, pos), start};
  }

  onInput() {
    const {word, start} = this.getWord();
    if (word.length < 1) { this.hide(); return; }
    this.word = word;
    this.wordStart = start;

    const lower = word.toLowerCase();
    const matches = ALL_SUGGESTIONS.filter(s => s.word.toLowerCase().startsWith(lower));
    if (matches.length === 0) { this.hide(); return; }
    this.show(matches.slice(0, 8));
  }

  show(items) {
    this.items = items;
    this.selected = 0;
    this.visible = true;
    this.render();
    this.position();
    this.container.classList.add('open');
  }

  hide() {
    this.visible = false;
    this.container.classList.remove('open');
  }

  position() {
    const pos = this.editor.selectionStart;
    const text = this.editor.value.substring(0, pos);
    const lines = text.split('\n');
    const lineNum = lines.length - 1;
    const col = lines[lineNum].length;

    const lineHeight = 23.1; // font-size * line-height
    const charWidth = 8.4;   // approx mono char width
    const top = (lineNum + 1) * lineHeight + 12;
    const left = col * charWidth + 16;

    this.container.style.top = Math.min(top, window.innerHeight - 220) + 'px';
    this.container.style.left = Math.min(left, window.innerWidth - 220) + 'px';
  }

  render() {
    this.container.innerHTML = this.items.map((item, i) =>
      `<div class="ac-item ${i === this.selected ? 'selected' : ''}" data-i="${i}">
        <span class="ac-type ${item.type}">${item.type}</span>
        <span>${item.word}</span>
        <span style="color:var(--text-dim);font-size:10px;margin-left:auto">${item.desc || ''}</span>
      </div>`
    ).join('');

    this.container.querySelectorAll('.ac-item').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.select(parseInt(el.dataset.i));
      });
    });
  }

  onKey(e) {
    if (!this.visible) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.selected = Math.min(this.selected + 1, this.items.length - 1); this.render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.selected = Math.max(this.selected - 1, 0); this.render(); }
    else if (e.key === 'Tab' || e.key === 'Enter') {
      if (this.items.length > 0) { e.preventDefault(); this.select(this.selected); }
    }
    else if (e.key === 'Escape') { this.hide(); }
  }

  select(i) {
    const item = this.items[i];
    if (!item) return;

    const text = this.editor.value;
    const before = text.substring(0, this.wordStart);
    const after = text.substring(this.editor.selectionStart);

    // Check for snippet (fn, if, for, etc.)
    const snippet = MEX_SNIPPETS[item.word];
    let insert = item.word;
    if (snippet) {
      // Simple snippet: add parens for functions, braces for control
      if (item.type === 'fn' && ['abs','sqrt','pow','floor','ceil','round','random','log','exp','min','max','sum','len','sort','reverse','unique','concat','append','map','filter','reduce','mean','normalize','sigmoid','relu','tanh'].includes(item.word)) {
        insert = item.word + '()';
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + insert.length - 1;
      } else if (item.word === 'fn') {
        insert = 'fn name() {\n  \n}';
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + 3;
      } else if (item.word === 'if') {
        insert = 'if () {\n  \n}';
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + 4;
      } else if (item.word === 'for') {
        insert = 'for i in range(n) {\n  \n}';
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + 8;
      } else {
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + insert.length;
      }
    } else {
      // Auto-add () for functions
      if (item.type === 'fn') {
        insert = item.word + '()';
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + insert.length - 1;
      } else {
        this.editor.value = before + insert + after;
        this.editor.selectionStart = this.editor.selectionEnd = this.wordStart + insert.length;
      }
    }

    this.hide();
    if (typeof syncHighlight === 'function') syncHighlight();
    this.editor.focus();
  }
}
