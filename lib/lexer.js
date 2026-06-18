// ═══════════════════════════════════════════════════════
//  MEX LEXER — Tokenizer for .mx files
// ═══════════════════════════════════════════════════════

const TOKEN_TYPES = {
  // Data
  DATA: 'DATA',
  POINTS: 'POINTS',
  CSV: 'CSV',

  // Model
  MODEL: 'MODEL',
  SIMPLE: 'SIMPLE',
  SEQUENTIAL: 'SEQUENTIAL',

  // Layers
  DENSE: 'DENSE',
  DROPOUT: 'DROPOUT',

  // Training
  TRAIN: 'TRAIN',
  EPOCHS: 'EPOCHS',
  BATCH: 'BATCH',
  WITH: 'WITH',

  // Prediction
  PREDICT: 'PREDICT',

  // Output
  SHOW: 'SHOW',
  RESULTS: 'RESULTS',
  ACCURACY: 'ACCURACY',
  LOSS: 'LOSS',
  PRINT: 'PRINT',

  // Values
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENT: 'IDENT',
  TRUE: 'TRUE',
  FALSE: 'FALSE',

  // Activations
  RELU: 'RELU',
  SIGMOID: 'SIGMOID',
  SOFTMAX: 'SOFTMAX',
  TANH: 'TANH',
  LINEAR: 'LINEAR',

  // Optimizers
  ADAM: 'ADAM',
  SGD: 'SGD',

  // Loss functions
  MSE: 'MSE',
  CROSS_ENTROPY: 'CROSS_ENTROPY',

  // Variables
  LET: 'LET',

  // Conditionals
  IF: 'IF',
  ELSE: 'ELSE',

  // Loops
  FOR: 'FOR',
  IN: 'IN',
  RANGE: 'RANGE',
  WHILE: 'WHILE',

  // Functions
  FN: 'FN',
  RETURN: 'RETURN',

  // Modules
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  FROM: 'FROM',
  AS: 'AS',
  SAVE: 'SAVE',
  LOAD: 'LOAD',

  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  EQ: 'EQ',        // =
  EQEQ: 'EQEQ',    // ==
  NEQ: 'NEQ',       // !=
  LT: 'LT',         // <
  GT: 'GT',         // >
  LTE: 'LTE',       // <=
  GTE: 'GTE',       // >=
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',

  // Punctuation
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  COMMA: 'COMMA',
  COLON: 'COLON',
  DOT: 'DOT',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
};

const KEYWORDS = {
  'data': TOKEN_TYPES.DATA,
  'points': TOKEN_TYPES.POINTS,
  'csv': TOKEN_TYPES.CSV,
  'model': TOKEN_TYPES.MODEL,
  'simple': TOKEN_TYPES.SIMPLE,
  'sequential': TOKEN_TYPES.SEQUENTIAL,
  'dense': TOKEN_TYPES.DENSE,
  'dropout': TOKEN_TYPES.DROPOUT,
  'train': TOKEN_TYPES.TRAIN,
  'epochs': TOKEN_TYPES.EPOCHS,
  'batch': TOKEN_TYPES.BATCH,
  'with': TOKEN_TYPES.WITH,
  'predict': TOKEN_TYPES.PREDICT,
  'show': TOKEN_TYPES.SHOW,
  'results': TOKEN_TYPES.RESULTS,
  'accuracy': TOKEN_TYPES.ACCURACY,
  'loss': TOKEN_TYPES.LOSS,
  'print': TOKEN_TYPES.PRINT,
  'true': TOKEN_TYPES.TRUE,
  'false': TOKEN_TYPES.FALSE,
  'relu': TOKEN_TYPES.RELU,
  'sigmoid': TOKEN_TYPES.SIGMOID,
  'softmax': TOKEN_TYPES.SOFTMAX,
  'tanh': TOKEN_TYPES.TANH,
  'linear': TOKEN_TYPES.LINEAR,
  'adam': TOKEN_TYPES.ADAM,
  'sgd': TOKEN_TYPES.SGD,
  'mse': TOKEN_TYPES.MSE,
  'cross_entropy': TOKEN_TYPES.CROSS_ENTROPY,
  'let': TOKEN_TYPES.LET,
  'if': TOKEN_TYPES.IF,
  'else': TOKEN_TYPES.ELSE,
  'for': TOKEN_TYPES.FOR,
  'in': TOKEN_TYPES.IN,
  'while': TOKEN_TYPES.WHILE,
  'fn': TOKEN_TYPES.FN,
  'return': TOKEN_TYPES.RETURN,
  'import': TOKEN_TYPES.IMPORT,
  'export': TOKEN_TYPES.EXPORT,
  'save': TOKEN_TYPES.SAVE,
  'load': TOKEN_TYPES.LOAD,
  'from': TOKEN_TYPES.FROM,
  'as': TOKEN_TYPES.AS,
  'and': TOKEN_TYPES.AND,
  'or': TOKEN_TYPES.OR,
  'not': TOKEN_TYPES.NOT,
};

function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;

  while (i < source.length) {
    // Skip spaces, tabs, and carriage returns (not newlines)
    if (source[i] === ' ' || source[i] === '\t' || source[i] === '\r') {
      i++;
      continue;
    }

    // Skip comments (## ...)
    if (source[i] === '#' && source[i + 1] === '#') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }

    // Newlines (statement separators)
    if (source[i] === '\n') {
      // Collapse multiple newlines into one
      if (tokens.length > 0 && tokens[tokens.length - 1].type !== TOKEN_TYPES.NEWLINE) {
        tokens.push({ type: TOKEN_TYPES.NEWLINE, line });
      }
      line++;
      i++;
      continue;
    }

    // Numbers (integers and floats)
    if (/\d/.test(source[i]) || (source[i] === '.' && i + 1 < source.length && /\d/.test(source[i + 1]))) {
      let num = '';
      while (i < source.length && /[\d.]/.test(source[i])) {
        num += source[i++];
      }
      tokens.push({ type: TOKEN_TYPES.NUMBER, value: parseFloat(num), line });
      continue;
    }

    // Strings (single or double quotes)
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i++];
      let str = '';
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') {
          i++;
          str += source[i++];
        } else {
          str += source[i++];
        }
      }
      i++; // skip closing quote
      tokens.push({ type: TOKEN_TYPES.STRING, value: str, line });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(source[i])) {
      let ident = '';
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) {
        ident += source[i++];
      }
      const type = KEYWORDS[ident] || TOKEN_TYPES.IDENT;
      tokens.push({ type, value: ident, line });
      continue;
    }

    // Two-character operators
    if (source[i] === '=' && source[i + 1] === '=') { tokens.push({ type: TOKEN_TYPES.EQEQ, line }); i += 2; continue; }
    if (source[i] === '!' && source[i + 1] === '=') { tokens.push({ type: TOKEN_TYPES.NEQ, line }); i += 2; continue; }
    if (source[i] === '<' && source[i + 1] === '=') { tokens.push({ type: TOKEN_TYPES.LTE, line }); i += 2; continue; }
    if (source[i] === '>' && source[i + 1] === '=') { tokens.push({ type: TOKEN_TYPES.GTE, line }); i += 2; continue; }

    // Single-character operators
    if (source[i] === '+') { tokens.push({ type: TOKEN_TYPES.PLUS, line }); i++; continue; }
    if (source[i] === '-') { tokens.push({ type: TOKEN_TYPES.MINUS, line }); i++; continue; }
    if (source[i] === '*') { tokens.push({ type: TOKEN_TYPES.STAR, line }); i++; continue; }
    if (source[i] === '/') { tokens.push({ type: TOKEN_TYPES.SLASH, line }); i++; continue; }
    if (source[i] === '%') { tokens.push({ type: TOKEN_TYPES.PERCENT, line }); i++; continue; }
    if (source[i] === '=') { tokens.push({ type: TOKEN_TYPES.EQ, line }); i++; continue; }
    if (source[i] === '<') { tokens.push({ type: TOKEN_TYPES.LT, line }); i++; continue; }
    if (source[i] === '>') { tokens.push({ type: TOKEN_TYPES.GT, line }); i++; continue; }

    // Punctuation
    if (source[i] === '(') { tokens.push({ type: TOKEN_TYPES.LPAREN, line }); i++; continue; }
    if (source[i] === ')') { tokens.push({ type: TOKEN_TYPES.RPAREN, line }); i++; continue; }
    if (source[i] === '[') { tokens.push({ type: TOKEN_TYPES.LBRACKET, line }); i++; continue; }
    if (source[i] === ']') { tokens.push({ type: TOKEN_TYPES.RBRACKET, line }); i++; continue; }
    if (source[i] === '{') { tokens.push({ type: TOKEN_TYPES.LBRACE, line }); i++; continue; }
    if (source[i] === '}') { tokens.push({ type: TOKEN_TYPES.RBRACE, line }); i++; continue; }
    if (source[i] === ',') { tokens.push({ type: TOKEN_TYPES.COMMA, line }); i++; continue; }
    if (source[i] === ':') { tokens.push({ type: TOKEN_TYPES.COLON, line }); i++; continue; }
    if (source[i] === '.') { tokens.push({ type: TOKEN_TYPES.DOT, line }); i++; continue; }

    // Unknown character
    throw new Error(`Unexpected character '${source[i]}' at line ${line}`);
  }

  // Add final newline if missing
  if (tokens.length > 0 && tokens[tokens.length - 1].type !== TOKEN_TYPES.NEWLINE) {
    tokens.push({ type: TOKEN_TYPES.NEWLINE, line });
  }

  tokens.push({ type: TOKEN_TYPES.EOF, line });
  return tokens;
}

module.exports = { tokenize, TOKEN_TYPES };
