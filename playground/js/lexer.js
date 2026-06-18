// ═══════════════════════════════════════════════════════
//  MEX LEXER — Tokenizer for .mx files
// ═══════════════════════════════════════════════════════

const T = {
  DATA:'DATA',POINTS:'POINTS',CSV:'CSV',
  MODEL:'MODEL',SIMPLE:'SIMPLE',SEQUENTIAL:'SEQUENTIAL',
  DENSE:'DENSE',DROPOUT:'DROPOUT',
  TRAIN:'TRAIN',EPOCHS:'EPOCHS',BATCH:'BATCH',WITH:'WITH',
  PREDICT:'PREDICT',
  SHOW:'SHOW',RESULTS:'RESULTS',ACCURACY:'ACCURACY',LOSS:'LOSS',PRINT:'PRINT',
  NUMBER:'NUMBER',STRING:'STRING',IDENT:'IDENT',TRUE:'TRUE',FALSE:'FALSE',
  RELU:'RELU',SIGMOID:'SIGMOID',SOFTMAX:'SOFTMAX',TANH:'TANH',LINEAR:'LINEAR',
  ADAM:'ADAM',SGD:'SGD',MSE:'MSE',CROSS_ENTROPY:'CROSS_ENTROPY',
  LET:'LET',IF:'IF',ELSE:'ELSE',
  FOR:'FOR',IN:'IN',RANGE:'RANGE',WHILE:'WHILE',
  FN:'FN',RETURN:'RETURN',
  IMPORT:'IMPORT',EXPORT:'EXPORT',FROM:'FROM',AS:'AS',
  SAVE:'SAVE',LOAD:'LOAD',
  PLUS:'PLUS',MINUS:'MINUS',STAR:'STAR',SLASH:'SLASH',PERCENT:'PERCENT',
  EQ:'EQ',EQEQ:'EQEQ',NEQ:'NEQ',LT:'LT',GT:'GT',LTE:'LTE',GTE:'GTE',
  AND:'AND',OR:'OR',NOT:'NOT',
  LPAREN:'LPAREN',RPAREN:'RPAREN',LBRACKET:'LBRACKET',RBRACKET:'RBRACKET',
  LBRACE:'LBRACE',RBRACE:'RBRACE',COMMA:'COMMA',COLON:'COLON',DOT:'DOT',
  NEWLINE:'NEWLINE',EOF:'EOF',
};

const KW = {
  'data':T.DATA,'points':T.POINTS,'csv':T.CSV,
  'model':T.MODEL,'simple':T.SIMPLE,'sequential':T.SEQUENTIAL,
  'dense':T.DENSE,'dropout':T.DROPOUT,
  'train':T.TRAIN,'epochs':T.EPOCHS,'batch':T.BATCH,'with':T.WITH,
  'predict':T.PREDICT,
  'show':T.SHOW,'results':T.RESULTS,'accuracy':T.ACCURACY,'loss':T.LOSS,'print':T.PRINT,
  'true':T.TRUE,'false':T.FALSE,
  'relu':T.RELU,'sigmoid':T.SIGMOID,'softmax':T.SOFTMAX,'tanh':T.TANH,'linear':T.LINEAR,
  'adam':T.ADAM,'sgd':T.SGD,'mse':T.MSE,'cross_entropy':T.CROSS_ENTROPY,
  'let':T.LET,'if':T.IF,'else':T.ELSE,
  'for':T.FOR,'in':T.IN,'range':T.RANGE,'while':T.WHILE,
  'fn':T.FN,'return':T.RETURN,
  'import':T.IMPORT,'export':T.EXPORT,'save':T.SAVE,'load':T.LOAD,
  'from':T.FROM,'as':T.AS,'and':T.AND,'or':T.OR,'not':T.NOT,
};

function tokenize(source) {
  const tokens = [];
  let i = 0, line = 1;
  while (i < source.length) {
    if (source[i] === ' ' || source[i] === '\t' || source[i] === '\r') { i++; continue; }
    if (source[i] === '#' && source[i+1] === '#') { while (i < source.length && source[i] !== '\n') i++; continue; }
    if (source[i] === '\n') {
      if (tokens.length > 0 && tokens[tokens.length-1].type !== T.NEWLINE) tokens.push({type:T.NEWLINE,line});
      line++; i++; continue;
    }
    if (/\d/.test(source[i]) || (source[i] === '.' && i+1 < source.length && /\d/.test(source[i+1]))) {
      let num = '';
      while (i < source.length && /[\d.]/.test(source[i])) num += source[i++];
      tokens.push({type:T.NUMBER,value:parseFloat(num),line}); continue;
    }
    if (source[i] === '"' || source[i] === "'") {
      const q = source[i++]; let s = '';
      while (i < source.length && source[i] !== q) { s += source[i] === '\\' ? source[++i] : source[i]; i++; }
      i++; tokens.push({type:T.STRING,value:s,line}); continue;
    }
    if (/[a-zA-Z_]/.test(source[i])) {
      let id = '';
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) id += source[i++];
      tokens.push({type:KW[id]||T.IDENT,value:id,line}); continue;
    }
    if (source[i]==='='&&source[i+1]==='=') { tokens.push({type:T.EQEQ,line}); i+=2; continue; }
    if (source[i]==='!'&&source[i+1]==='=') { tokens.push({type:T.NEQ,line}); i+=2; continue; }
    if (source[i]==='<'&&source[i+1]==='=') { tokens.push({type:T.LTE,line}); i+=2; continue; }
    if (source[i]==='>'&&source[i+1]==='=') { tokens.push({type:T.GTE,line}); i+=2; continue; }
    const single = {'+':T.PLUS,'-':T.MINUS,'*':T.STAR,'/':T.SLASH,'%':T.PERCENT,
      '=':T.EQ,'<':T.LT,'>':T.GT,'(':T.LPAREN,')':T.RPAREN,'[':T.LBRACKET,
      ']':T.RBRACKET,'{':T.LBRACE,'}':T.RBRACE,',':T.COMMA,':':T.COLON,'.':T.DOT};
    if (single[source[i]]) { tokens.push({type:single[source[i]],line}); i++; continue; }
    throw new Error('Unexpected character \''+source[i]+'\' at line '+line);
  }
  if (tokens.length > 0 && tokens[tokens.length-1].type !== T.NEWLINE) tokens.push({type:T.NEWLINE,line});
  tokens.push({type:T.EOF,line});
  return tokens;
}
