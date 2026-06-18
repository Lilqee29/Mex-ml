// ═══════════════════════════════════════════════════════
//  MEX PARSER — Builds AST from tokens
// ═══════════════════════════════════════════════════════

function parse(source) {
  const tokens = tokenize(source);
  let pos = 0;

  function peek() { return tokens[pos]; }
  function advance() { return tokens[pos++]; }
  function expect(type) {
    const t = advance();
    if (t.type !== type) throw new Error('Expected '+type+' but got '+t.type+' ('+t.value+') at line '+t.line);
    return t;
  }
  function skipNL() { while (peek().type === T.NEWLINE) advance(); }

  // ── Program ──────────────────────────────────────
  function parseProgram() {
    const body = [];
    skipNL();
    while (peek().type !== T.EOF) { body.push(parseStmt()); skipNL(); }
    return {type:'Program', body};
  }

  // ── Statements ───────────────────────────────────
  function parseStmt() {
    const t = peek();
    if (t.type===T.DATA) return parseDataDecl();
    if (t.type===T.MODEL) return parseModelDecl();
    if (t.type===T.TRAIN) return parseTrain();
    if (t.type===T.SHOW) return parseShow();
    if (t.type===T.LET) return parseLet();
    if (t.type===T.IF) return parseIf();
    if (t.type===T.FOR) return parseFor();
    if (t.type===T.WHILE) return parseWhile();
    if (t.type===T.FN) return parseFn();
    if (t.type===T.RETURN) { advance(); return {type:'Return',value:parseExpr()}; }
    if (t.type===T.PRINT) { advance(); expect(T.LPAREN); const a=parseExpr(); expect(T.RPAREN); return {type:'Print',arg:a}; }
    if (t.type===T.IDENT) return parseAssign();
    if (t.type===T.PREDICT) return parsePredictExpr();
    throw new Error('Unexpected token '+t.type+' ('+t.value+') at line '+t.line);
  }

  function parseLet() { expect(T.LET); const n=expect(T.IDENT).value; expect(T.EQ); return {type:'Let',name:n,value:parseExpr()}; }

  function parseAssign() {
    const n=expect(T.IDENT).value;
    // Method call: obj.method()
    if (peek().type===T.DOT) { advance(); const m=expect(T.IDENT).value;
      if (peek().type===T.LPAREN) { advance(); const args=[]; if (peek().type!==T.RPAREN) { args.push(parseExpr()); while (peek().type===T.COMMA) { advance(); args.push(parseExpr()); } } expect(T.RPAREN); return {type:'MethodCall',object:n,method:m,args}; }
      return {type:'ObjectAccess',object:n,property:m};
    }
    if (peek().type===T.LBRACKET) { advance(); const idx=parseExpr(); expect(T.RBRACKET); expect(T.EQ); return {type:'ArrayAssign',name:n,index:idx,value:parseExpr()}; }
    expect(T.EQ); return {type:'Assign',name:n,value:parseExpr()};
  }

  function parseDataDecl() {
    expect(T.DATA);
    if (peek().type===T.POINTS) {
      advance(); const pts=[]; skipNL();
      while (peek().type===T.LPAREN) { advance(); const x=parseExpr(); expect(T.COMMA); const y=parseExpr(); expect(T.RPAREN); pts.push({input:x,output:y}); skipNL(); }
      return {type:'DataPoints',points:pts};
    }
    if (peek().type===T.CSV) { advance(); const f=expect(T.STRING).value; return {type:'DataCSV',filename:f}; }
    throw new Error('Expected "points" or "csv" after "data"');
  }

  function parseModelDecl() {
    expect(T.MODEL); const arch=advance().value; const layers=[]; skipNL();
    while (peek().type===T.DENSE||peek().type===T.DROPOUT) {
      if (peek().type===T.DENSE) { advance(); const u=parseInt(advance().value); const a=advance().value; layers.push({type:'dense',units:u,activation:a}); }
      else { advance(); const r=parseFloat(advance().value); layers.push({type:'dropout',rate:r}); }
      skipNL();
    }
    return {type:'ModelDecl',arch,layers};
  }

  function parseTrain() {
    expect(T.TRAIN); let ep=100;
    if (peek().type===T.NUMBER) ep=advance().value;
    expect(T.EPOCHS); let opt='sgd',loss='mse';
    if (peek().type===T.WITH) { advance(); if (peek().type===T.ADAM||peek().type===T.SGD) opt=advance().value; if (peek().type===T.MSE||peek().type===T.CROSS_ENTROPY) loss=advance().value; }
    return {type:'TrainSection',epochs:ep,optimizer:opt,loss};
  }

  function parsePredictExpr() { expect(T.PREDICT); return {type:'PredictExpr',input:parseExpr()}; }

  function parseShow() {
    expect(T.SHOW);
    if (peek().type===T.RESULTS) { advance(); return {type:'ShowResults'}; }
    if (peek().type===T.ACCURACY) { advance(); return {type:'ShowAccuracy'}; }
    if (peek().type===T.LOSS) { advance(); return {type:'ShowLoss'}; }
    return {type:'ShowResults'};
  }

  function parseIf() {
    expect(T.IF); expect(T.LPAREN); const c=parseExpr(); expect(T.RPAREN); skipNL(); expect(T.LBRACE);
    const body=[]; skipNL(); while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
    let eb=null;
    if (peek().type===T.ELSE) { advance(); skipNL(); expect(T.LBRACE); eb=[]; skipNL(); while (peek().type!==T.RBRACE) { eb.push(parseStmt()); skipNL(); } expect(T.RBRACE); }
    return {type:'If',condition:c,body,elseBody:eb};
  }

  function parseFor() {
    expect(T.FOR); const n=expect(T.IDENT).value; expect(T.IN);
    // Handle range() with 1 or 2 args
    if (peek().type===T.IDENT && peek().value==='range') {
      advance(); expect(T.LPAREN); const first=parseExpr(); let start, end;
      if (peek().type===T.COMMA) { advance(); start=first; end=parseExpr(); } else { start={type:'Number',value:0}; end=first; }
      expect(T.RPAREN); skipNL(); expect(T.LBRACE);
      const body=[]; skipNL(); while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
      return {type:'For',name:n,iterable:{type:'Range',start,end},body};
    }
    // Handle other iterables
    const it=parseExpr(); skipNL(); expect(T.LBRACE);
    const body=[]; skipNL(); while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
    return {type:'For',name:n,iterable:it,body};
  }

  function parseWhile() {
    expect(T.WHILE); expect(T.LPAREN); const c=parseExpr(); expect(T.RPAREN); skipNL(); expect(T.LBRACE);
    const body=[]; skipNL(); while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
    return {type:'While',condition:c,body};
  }

  function parseFn() {
    expect(T.FN); const n=expect(T.IDENT).value; expect(T.LPAREN); const params=[];
    if (peek().type!==T.RPAREN) { params.push(expect(T.IDENT).value); while(peek().type===T.COMMA){advance();params.push(expect(T.IDENT).value);} }
    expect(T.RPAREN); skipNL(); expect(T.LBRACE); const body=[]; skipNL();
    while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
    return {type:'Function',name:n,params,body};
  }

  // ── Expressions ──────────────────────────────────
  function parseExpr() { return parseAnd(); }

  function parseAnd() {
    let l=parseOr();
    while (peek().type===T.AND) { advance(); const r=parseOr(); l={type:'BinOp',op:'AND',left:l,right:r}; }
    return l;
  }

  function parseOr() {
    let l=parseCmp();
    while (peek().type===T.OR) { advance(); const r=parseCmp(); l={type:'BinOp',op:'OR',left:l,right:r}; }
    return l;
  }

  function parseCmp() {
    let l=addSub();
    while ([T.EQEQ,T.NEQ,T.LT,T.GT,T.LTE,T.GTE].includes(peek().type)) { const op=advance().type; const r=addSub(); l={type:'BinOp',op,left:l,right:r}; }
    return l;
  }

  function addSub() {
    let l=mulDiv();
    while ([T.PLUS,T.MINUS].includes(peek().type)) { const op=advance().type; const r=mulDiv(); l={type:'BinOp',op,left:l,right:r}; }
    return l;
  }

  function mulDiv() {
    let l=unary();
    while ([T.STAR,T.SLASH,T.PERCENT].includes(peek().type)) { const op=advance().type; const r=unary(); l={type:'BinOp',op,left:l,right:r}; }
    return l;
  }

  function unary() {
    if (peek().type===T.MINUS) { advance(); return {type:'UnaryOp',op:'-',operand:postfix()}; }
    if (peek().type===T.NOT) { advance(); return {type:'UnaryOp',op:'not',operand:postfix()}; }
    return postfix();
  }

  function postfix() {
    let e=primary();
    while (peek().type===T.LBRACKET) { advance(); const idx=parseExpr(); expect(T.RBRACKET); e={type:'ArrayAccess',name:e.value||e,index:idx}; }
    return e;
  }

  function primary() {
    const t=peek();
    if (t.type===T.NUMBER) { advance(); return {type:'Number',value:t.value}; }
    if (t.type===T.STRING) { advance(); return {type:'String',value:t.value}; }
    if (t.type===T.TRUE) { advance(); return {type:'Boolean',value:true}; }
    if (t.type===T.FALSE) { advance(); return {type:'Boolean',value:false}; }
    if (t.type===T.LPAREN) { advance(); const e=parseExpr(); expect(T.RPAREN); return e; }
    if (t.type===T.LBRACKET) {
      advance(); const els=[];
      if (peek().type!==T.RBRACKET) { els.push(parseExpr()); while(peek().type===T.COMMA){advance();els.push(parseExpr());} }
      expect(T.RBRACKET); return {type:'ArrayLiteral',elements:els};
    }
    // Object literal: {key: value, key2: value2}
    if (t.type===T.LBRACE) {
      advance(); const props=[];
      if (peek().type!==T.RBRACE) {
        const k=expect(T.IDENT).value; expect(T.COLON); const v=parseExpr(); props.push({key:k,value:v});
        while (peek().type===T.COMMA) { advance(); const k2=expect(T.IDENT).value; expect(T.COLON); const v2=parseExpr(); props.push({key:k2,value:v2}); }
      }
      expect(T.RBRACE); return {type:'ObjectLiteral',properties:props};
    }
    if (t.type===T.FN) {
      advance(); const name=peek().type===T.IDENT?advance().value:'anon'; expect(T.LPAREN); const params=[];
      if (peek().type!==T.RPAREN) { params.push(expect(T.IDENT).value); while(peek().type===T.COMMA){advance();params.push(expect(T.IDENT).value);} }
      expect(T.RPAREN); skipNL(); expect(T.LBRACE); const body=[]; skipNL();
      while (peek().type!==T.RBRACE) { body.push(parseStmt()); skipNL(); } expect(T.RBRACE);
      return {type:'Function',name,params,body};
    }
    if (t.type===T.RANGE) {
      advance(); expect(T.LPAREN); const args=[];
      if (peek().type!==T.RPAREN) { args.push(parseExpr()); while(peek().type===T.COMMA){advance();args.push(parseExpr());} }
      expect(T.RPAREN); return {type:'Call',name:'range',args};
    }
    if (t.type===T.IDENT) {
      advance();
      if (peek().type===T.LPAREN) { advance(); const args=[]; if(peek().type!==T.RPAREN){args.push(parseExpr());while(peek().type===T.COMMA){advance();args.push(parseExpr());}} expect(T.RPAREN); return {type:'Call',name:t.value,args}; }
      // Object property access: obj.property
      if (peek().type===T.DOT) { advance(); const prop=expect(T.IDENT).value;
        if (peek().type===T.LPAREN) { advance(); const args=[]; if(peek().type!==T.RPAREN){args.push(parseExpr());while(peek().type===T.COMMA){advance();args.push(parseExpr());}} expect(T.RPAREN); return {type:'MethodCall',object:t.value,method:prop,args}; }
        return {type:'ObjectAccess',object:t.value,property:prop};
      }
      return {type:'Identifier',name:t.value};
    }
    if (t.type===T.PREDICT) return parsePredictExpr();
    throw new Error('Unexpected token '+t.type+' ('+t.value+') at line '+t.line);
  }

  return parseProgram();
}
