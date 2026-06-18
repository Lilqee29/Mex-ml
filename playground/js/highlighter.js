/**
 * MEX Syntax Highlighter
 * Tokenizes MEX code and wraps tokens in colored spans.
 * Uses textarea + pre overlay technique (like CodeMirror's original design).
 */

const MEX_COLORS = {
  keyword:    '#c586c0',  // purple — let, if, else, for, while, fn, return
  mlKeyword:  '#569cd6',  // blue — data, model, train, predict, dense, epochs
  number:     '#b5cea8',  // light green — 42, 3.14, -1
  string:     '#ce9178',  // orange — "hello", 'hello'
  comment:    '#6a9955',  // green — ## comment
  operator:   '#d4d4d4',  // white — =, +, -, *, /, ==, !=, >, <
  fn:         '#dcdcaa',  // yellow — print(), sqrt(), user functions
  builtin:    '#4ec9b0',  // teal/cyan — print, sqrt, pow, mean, sum, len
  type:       '#4ec9b0',  // teal — number, string, boolean, array
  boolean:    '#569cd6',  // blue — true, false
  property:   '#9cdcfe',  // light blue — obj.prop
  paren:      '#d4d4d4',  // white — (), [], {}
  dot:        '#d4d4d4',  // white — .
  comma:      '#d4d4d4',  // white — ,
  colon:      '#d4d4d4',  // white — :
  bracket:    '#d4d4d4',  // white — (), [], {}
};

// Token types for classification
const MEX_KEYWORDS = new Set([
  'let', 'if', 'else', 'elif', 'for', 'in', 'while', 'fn', 'return', 'import', 'as',
  'break', 'continue', 'true', 'false', 'new', 'class', 'this'
]);

const MEX_ML_KEYWORDS = new Set([
  'data', 'points', 'csv', 'model', 'simple', 'sequential', 'dense', 'dropout',
  'train', 'epochs', 'predict', 'show', 'results', 'save', 'load', 'activation',
  'sigmoid', 'relu', 'tanh', 'linear', 'softmax', 'model'
]);

const MEX_BUILTINS = new Set([
  'print', 'sqrt', 'pow', 'abs', 'floor', 'ceil', 'round', 'random', 'random_int',
  'min', 'max', 'sum', 'mean', 'median', 'mode', 'variance', 'std', 'length', 'len',
  'push', 'pop', 'sort', 'reverse', 'includes', 'indexOf', 'join', 'slice',
  'split', 'replace', 'toUpperCase', 'toLowerCase', 'trim', 'startsWith', 'endsWith',
  'charAt', 'substring', 'keys', 'values', 'entries', 'has', 'get', 'set',
  'range', 'map', 'filter', 'reduce', 'forEach',
  'type', 'str', 'num', 'int', 'float', 'bool', 'arr', 'obj',
  'head', 'tail', 'describe', 'column_names', 'shape', 'unique', 'value_counts',
  'sort_by', 'filter_by', 'to_json', 'from_json', 'save_csv',
  'mean_squared_error', 'mean_absolute_error',
  'distance', 'euclidean', 'dot_product', 'cosine_similarity',
  'normalize', 'standardize', 'fill_missing',
  'date', 'time', 'now', 'format_date', 'parse_date',
  'json_parse', 'json_stringify', 'file_read', 'file_write',
  'plot', 'bar_chart', 'line_chart', 'scatter_plot', 'histogram', 'pie_chart'
]);

const MEX_TYPES = new Set([
  'number', 'string', 'boolean', 'array', 'object', 'function', 'void', 'null', 'undefined'
]);

/**
 * Tokenize a line of MEX code into tokens.
 * Returns array of { type, value, start, end } objects.
 */
function tokenizeMEXLine(line) {
  const tokens = [];
  let i = 0;

  while (i < line.length) {
    // Comments: ## to end of line
    if (line[i] === '#' && line[i + 1] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Single # comment (not ##)
    if (line[i] === '#' && line[i + 1] !== '#') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Strings: "..." or '...'
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++; // skip escaped char
        j++;
      }
      j++; // include closing quote
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers: 42, 3.14, -5
    if (/[0-9]/.test(line[i]) || (line[i] === '-' && /[0-9]/.test(line[i + 1]))) {
      let j = i;
      if (line[j] === '-') j++;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      // Check if this is followed by ( — it's a function call
      let rest = line.slice(j).trimStart();
      const isFunctionCall = rest.startsWith('(');

      let type = isFunctionCall ? 'fn' : 'property'; // default: property or function call
      if (word === 'true' || word === 'false') type = 'boolean';
      else if (MEX_KEYWORDS.has(word)) type = 'keyword';
      else if (MEX_ML_KEYWORDS.has(word)) type = 'mlKeyword';
      else if (MEX_TYPES.has(word)) type = 'type';
      else if (MEX_BUILTINS.has(word)) type = 'builtin';

      tokens.push({ type, value: word });
      i = j;
      continue;
    }

    // Operators
    if (/[=+\-*/<>!&|%^~]/.test(line[i])) {
      let j = i + 1;
      // Two-char operators
      if (j < line.length && /[=<>&|!]/.test(line[j])) j++;
      tokens.push({ type: 'operator', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation
    if (line[i] === '(' || line[i] === ')' ||
        line[i] === '[' || line[i] === ']' ||
        line[i] === '{' || line[i] === '}') {
      tokens.push({ type: 'bracket', value: line[i] });
      i++;
      continue;
    }

    if (line[i] === '.') {
      tokens.push({ type: 'dot', value: '.' });
      i++;
      continue;
    }

    if (line[i] === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
      continue;
    }

    if (line[i] === ':') {
      tokens.push({ type: 'colon', value: ':' });
      i++;
      continue;
    }

    // Whitespace
    if (/\s/.test(line[i])) {
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      tokens.push({ type: 'whitespace', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Unknown character
    tokens.push({ type: 'unknown', value: line[i] });
    i++;
  }

  return tokens;
}

/**
 * Convert a line of MEX code to highlighted HTML.
 */
function highlightMEXLine(line) {
  const tokens = tokenizeMEXLine(line);
  let html = '';

  for (const tok of tokens) {
    if (tok.type === 'whitespace') {
      html += tok.value;
      continue;
    }

    const color = MEX_COLORS[tok.type] || '#dee2e6';
    const escaped = tok.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html += `<span style="color:${color}">${escaped}</span>`;
  }

  return html;
}

/**
 * Highlight full MEX code (multiple lines).
 * Returns HTML string.
 */
function highlightMEX(code) {
  const lines = code.split('\n');
  return lines.map(line => highlightMEXLine(line)).join('\n');
}

// Make globally available
window.highlightMEX = highlightMEX;
window.highlightMEXLine = highlightMEXLine;
window.MEX_COLORS = MEX_COLORS;
