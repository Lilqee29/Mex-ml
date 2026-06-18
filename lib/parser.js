// ═══════════════════════════════════════════════════════
//  MEX PARSER — Builds AST from tokens
// ═══════════════════════════════════════════════════════

const { TOKEN_TYPES } = require('./lexer');

function parse(tokens) {
  let pos = 0;

  function peek() { return tokens[pos]; }
  function advance() { return tokens[pos++]; }
  function expect(type) {
    const t = advance();
    if (t.type !== type) {
      throw new Error(`Expected ${type}, got ${t.type} ('${t.value}') at line ${t.line}`);
    }
    return t;
  }
  function skipNewlines() {
    while (peek().type === TOKEN_TYPES.NEWLINE) advance();
  }

  // ── Program ──────────────────────────────────────
  function parseProgram() {
    const body = [];
    skipNewlines();
    while (peek().type !== TOKEN_TYPES.EOF) {
      body.push(parseStatement());
      skipNewlines();
    }
    return { type: 'Program', body };
  }

  // ── Statement ────────────────────────────────────
  function parseStatement() {
    const t = peek();

    if (t.type === TOKEN_TYPES.DATA) {
      // Check if this is followed by 'points' or 'csv' - if so, it's a data declaration
      // Otherwise, it's a variable reference
      const next = tokens[pos + 1];
      if (next && (next.type === TOKEN_TYPES.POINTS || next.type === TOKEN_TYPES.CSV)) {
        return parseDataSection();
      }
      // Otherwise treat as identifier/variable
      return parseDataAsIdentifier();
    }
    if (t.type === TOKEN_TYPES.MODEL) return parseModelSection();
    if (t.type === TOKEN_TYPES.TRAIN) return parseTrainSection();
    if (t.type === TOKEN_TYPES.SHOW) return parseShowSection();
    if (t.type === TOKEN_TYPES.LET) return parseLet();
    if (t.type === TOKEN_TYPES.IF) return parseIf();
    if (t.type === TOKEN_TYPES.FOR) return parseFor();
    if (t.type === TOKEN_TYPES.WHILE) return parseWhile();
    if (t.type === TOKEN_TYPES.FN) return parseFn();
    if (t.type === TOKEN_TYPES.RETURN) return parseReturn();
    if (t.type === TOKEN_TYPES.PRINT) return parsePrint();
    if (t.type === TOKEN_TYPES.IMPORT) return parseImport();
    if (t.type === TOKEN_TYPES.EXPORT) return parseExport();
    if (t.type === TOKEN_TYPES.SAVE) return parseSave();
    if (t.type === TOKEN_TYPES.LOAD) return parseLoad();
    if (t.type === TOKEN_TYPES.IDENT) return parseAssignment();
    if (t.type === TOKEN_TYPES.PREDICT) return parsePredictSection();

    throw new Error(`Unexpected token ${t.type} ('${t.value}') at line ${t.line}`);
  }

  // ── Let (Variable Declaration) ───────────────────
  function parseLet() {
    expect(TOKEN_TYPES.LET);
    const name = expect(TOKEN_TYPES.IDENT).value;
    
    // Optional type annotation: let x: number = 42
    let typeAnnotation = null;
    if (peek().type === TOKEN_TYPES.COLON) {
      advance(); // consume colon
      typeAnnotation = expect(TOKEN_TYPES.IDENT).value;
    }
    
    expect(TOKEN_TYPES.EQ);
    const value = parseExpression();
    return { type: 'Let', name, value, typeAnnotation };
  }

  // ── Assignment ───────────────────────────────────
  function parseAssignment() {
    const name = expect(TOKEN_TYPES.IDENT).value;
    
    // Check for method call: obj.method()
    if (peek().type === TOKEN_TYPES.DOT) {
      advance();
      const method = expect(TOKEN_TYPES.IDENT).value;
      if (peek().type === TOKEN_TYPES.LPAREN) {
        advance();
        const args = [];
        if (peek().type !== TOKEN_TYPES.RPAREN) {
          args.push(parseExpression());
          while (peek().type === TOKEN_TYPES.COMMA) {
            advance();
            args.push(parseExpression());
          }
        }
        expect(TOKEN_TYPES.RPAREN);
        return { type: 'MethodCall', object: name, method, args };
      }
      // Object property access as statement (just evaluate)
      const property = method;
      return { type: 'ObjectAccess', object: name, property };
    }
    
    // Check for array access: arr[index] = value
    if (peek().type === TOKEN_TYPES.LBRACKET) {
      advance();
      const index = parseExpression();
      expect(TOKEN_TYPES.RBRACKET);
      expect(TOKEN_TYPES.EQ);
      const value = parseExpression();
      return { type: 'ArrayAssignment', name, index, value };
    }
    
    expect(TOKEN_TYPES.EQ);
    const value = parseExpression();
    return { type: 'Assignment', name, value };
  }

  // ── Data as Identifier ────────────────────────────
  function parseDataAsIdentifier() {
    advance(); // consume 'data'
    // Handle data.something
    if (peek().type === TOKEN_TYPES.DOT) {
      advance();
      const property = expect(TOKEN_TYPES.IDENT).value;
      if (peek().type === TOKEN_TYPES.LPAREN) {
        advance();
        const args = [];
        if (peek().type !== TOKEN_TYPES.RPAREN) {
          args.push(parseExpression());
          while (peek().type === TOKEN_TYPES.COMMA) {
            advance();
            args.push(parseExpression());
          }
        }
        expect(TOKEN_TYPES.RPAREN);
        return { type: 'MethodCall', object: 'data', method: property, args };
      }
      return { type: 'ObjectAccess', object: 'data', property };
    }
    // Handle data[index]
    if (peek().type === TOKEN_TYPES.LBRACKET) {
      advance();
      const index = parseExpression();
      expect(TOKEN_TYPES.RBRACKET);
      return { type: 'ArrayAccess', name: 'data', index };
    }
    return { type: 'Identifier', name: 'data' };
  }

  // ── If/Else ──────────────────────────────────────
  function parseIf() {
    expect(TOKEN_TYPES.IF);
    expect(TOKEN_TYPES.LPAREN);
    const condition = parseExpression();
    expect(TOKEN_TYPES.RPAREN);
    expect(TOKEN_TYPES.LBRACE);
    skipNewlines();
    const body = [];
    while (peek().type !== TOKEN_TYPES.RBRACE) {
      body.push(parseStatement());
      skipNewlines();
    }
    expect(TOKEN_TYPES.RBRACE);

    let elseBody = null;
    if (peek().type === TOKEN_TYPES.ELSE) {
      advance();
      if (peek().type === TOKEN_TYPES.IF) {
        elseBody = parseIf();
      } else {
        expect(TOKEN_TYPES.LBRACE);
        skipNewlines();
        elseBody = [];
        while (peek().type !== TOKEN_TYPES.RBRACE) {
          elseBody.push(parseStatement());
          skipNewlines();
        }
        expect(TOKEN_TYPES.RBRACE);
      }
    }

    return { type: 'If', condition, body, elseBody };
  }

  // ── For Loop ─────────────────────────────────────
  function parseFor() {
    expect(TOKEN_TYPES.FOR);
    const varName = expect(TOKEN_TYPES.IDENT).value;
    expect(TOKEN_TYPES.IN);
    // Handle range as a function call
    if (peek().type === TOKEN_TYPES.IDENT && peek().value === 'range') {
      advance();
      expect(TOKEN_TYPES.LPAREN);
      const first = parseExpression();
      let start, end;
      if (peek().type === TOKEN_TYPES.COMMA) {
        advance(); // skip comma
        start = first;
        end = parseExpression();
      } else {
        start = { type: 'Number', value: 0 };
        end = first;
      }
      expect(TOKEN_TYPES.RPAREN);
      expect(TOKEN_TYPES.LBRACE);
      skipNewlines();
      const body = [];
      while (peek().type !== TOKEN_TYPES.RBRACE) {
        body.push(parseStatement());
        skipNewlines();
      }
      expect(TOKEN_TYPES.RBRACE);
      return { type: 'For', varName, start, end, body };
    }
    throw new Error(`Expected 'range(...)' after 'in' at line ${peek().line}`);
  }

  // ── While Loop ───────────────────────────────────
  function parseWhile() {
    expect(TOKEN_TYPES.WHILE);
    expect(TOKEN_TYPES.LPAREN);
    const condition = parseExpression();
    expect(TOKEN_TYPES.RPAREN);
    expect(TOKEN_TYPES.LBRACE);
    skipNewlines();
    const body = [];
    while (peek().type !== TOKEN_TYPES.RBRACE) {
      body.push(parseStatement());
      skipNewlines();
    }
    expect(TOKEN_TYPES.RBRACE);
    return { type: 'While', condition, body };
  }

  // ── Function ─────────────────────────────────────
  function parseFn() {
    expect(TOKEN_TYPES.FN);
    // Check if next token is a name or LPAREN (anonymous function)
    let name = null;
    if (peek().type === TOKEN_TYPES.IDENT) {
      name = advance().value;
    }
    expect(TOKEN_TYPES.LPAREN);
    const params = [];
    const paramTypes = [];
    if (peek().type !== TOKEN_TYPES.RPAREN) {
      const paramName = expect(TOKEN_TYPES.IDENT).value;
      params.push(paramName);
      // Optional type annotation: fn add(a: number, b: number)
      let paramType = null;
      if (peek().type === TOKEN_TYPES.COLON) {
        advance();
        paramType = expect(TOKEN_TYPES.IDENT).value;
      }
      paramTypes.push(paramType);
      while (peek().type === TOKEN_TYPES.COMMA) {
        advance();
        const pName = expect(TOKEN_TYPES.IDENT).value;
        params.push(pName);
        let pType = null;
        if (peek().type === TOKEN_TYPES.COLON) {
          advance();
          pType = expect(TOKEN_TYPES.IDENT).value;
        }
        paramTypes.push(pType);
      }
    }
    expect(TOKEN_TYPES.RPAREN);
    
    // Optional return type: -> number
    let returnType = null;
    if (peek().type === TOKEN_TYPES.MINUS) {
      advance(); // consume -
      if (peek().type === TOKEN_TYPES.GT) {
        advance(); // consume >
        returnType = expect(TOKEN_TYPES.IDENT).value;
      }
    }
    
    expect(TOKEN_TYPES.LBRACE);
    skipNewlines();
    const body = [];
    while (peek().type !== TOKEN_TYPES.RBRACE) {
      body.push(parseStatement());
      skipNewlines();
    }
    expect(TOKEN_TYPES.RBRACE);
    return { type: 'Function', name, params, body, paramTypes, returnType };
  }

  // ── Return ───────────────────────────────────────
  function parseReturn() {
    expect(TOKEN_TYPES.RETURN);
    let value = null;
    if (peek().type !== TOKEN_TYPES.NEWLINE && peek().type !== TOKEN_TYPES.EOF) {
      value = parseExpression();
    }
    return { type: 'Return', value };
  }

  // ── Print ────────────────────────────────────────
  function parsePrint() {
    expect(TOKEN_TYPES.PRINT);
    expect(TOKEN_TYPES.LPAREN);
    const args = [];
    if (peek().type !== TOKEN_TYPES.RPAREN) {
      args.push(parseExpression());
      while (peek().type === TOKEN_TYPES.COMMA) {
        advance();
        args.push(parseExpression());
      }
    }
    expect(TOKEN_TYPES.RPAREN);
    return { type: 'Print', args };
  }

  // ── Predict Expression ───────────────────────────
  function parsePredictExpr() {
    expect(TOKEN_TYPES.PREDICT);
    const input = parseExpression();
    return { type: 'PredictExpr', input };
  }

  // ── Import ───────────────────────────────────────
  function parseImport() {
    expect(TOKEN_TYPES.IMPORT);

    // import "file.mx"
    if (peek().type === TOKEN_TYPES.STRING) {
      const path = advance().value;
      return { type: 'Import', path, names: null };
    }

    // import { name1, name2 } from "file.mx"
    // import name from "file.mx"
    // import name as alias from "file.mx"
    const names = [];
    if (peek().type === TOKEN_TYPES.LBRACE) {
      advance();
      while (peek().type !== TOKEN_TYPES.RBRACE) {
        const name = expect(TOKEN_TYPES.IDENT).value;
        let alias = null;
        if (peek().type === TOKEN_TYPES.AS) {
          advance();
          alias = expect(TOKEN_TYPES.IDENT).value;
        }
        names.push({ name, alias });
        if (peek().type === TOKEN_TYPES.COMMA) advance();
      }
      expect(TOKEN_TYPES.RBRACE);
    } else {
      const name = expect(TOKEN_TYPES.IDENT).value;
      let alias = null;
      if (peek().type === TOKEN_TYPES.AS) {
        advance();
        alias = expect(TOKEN_TYPES.IDENT).value;
      }
      names.push({ name, alias });
    }

    expect(TOKEN_TYPES.FROM);
    const path = expect(TOKEN_TYPES.STRING).value;
    return { type: 'Import', path, names };
  }

  // ── Export ───────────────────────────────────────
  function parseExport() {
    expect(TOKEN_TYPES.EXPORT);

    // export fn name
    // export let name
    // export { name1, name2 }
    if (peek().type === TOKEN_TYPES.LBRACE) {
      advance();
      const names = [];
      while (peek().type !== TOKEN_TYPES.RBRACE) {
        names.push(expect(TOKEN_TYPES.IDENT).value);
        if (peek().type === TOKEN_TYPES.COMMA) advance();
      }
      expect(TOKEN_TYPES.RBRACE);
      return { type: 'Export', names };
    }

    // export fn/let
    const declarations = [];
    if (peek().type === TOKEN_TYPES.FN) {
      declarations.push(parseFn());
    } else if (peek().type === TOKEN_TYPES.LET) {
      declarations.push(parseLet());
    } else {
      const name = expect(TOKEN_TYPES.IDENT).value;
      return { type: 'Export', names: [name] };
    }

    return { type: 'Export', declarations };
  }

  // ── Save Model ───────────────────────────────────
  function parseSave() {
    expect(TOKEN_TYPES.SAVE);
    expect(TOKEN_TYPES.MODEL);
    const filename = expect(TOKEN_TYPES.STRING).value;
    return { type: 'Save', filename };
  }

  // ── Load Model ───────────────────────────────────
  function parseLoad() {
    expect(TOKEN_TYPES.LOAD);
    expect(TOKEN_TYPES.MODEL);
    const filename = expect(TOKEN_TYPES.STRING).value;
    return { type: 'Load', filename };
  }

  // ── Expression ───────────────────────────────────
  function parseExpression() {
    return parseComparison();
  }

  function parseComparison() {
    let left = parseAnd();
    while (peek().type === TOKEN_TYPES.EQEQ || peek().type === TOKEN_TYPES.NEQ ||
           peek().type === TOKEN_TYPES.LT || peek().type === TOKEN_TYPES.GT ||
           peek().type === TOKEN_TYPES.LTE || peek().type === TOKEN_TYPES.GTE) {
      const op = advance().type;
      const right = parseAnd();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseAnd() {
    let left = parseOr();
    while (peek().type === TOKEN_TYPES.AND) {
      advance();
      const right = parseOr();
      left = { type: 'BinaryOp', op: 'AND', left, right };
    }
    return left;
  }

  function parseOr() {
    let left = parseAddSub();
    while (peek().type === TOKEN_TYPES.OR) {
      advance();
      const right = parseAddSub();
      left = { type: 'BinaryOp', op: 'OR', left, right };
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDiv();
    while (peek().type === TOKEN_TYPES.PLUS || peek().type === TOKEN_TYPES.MINUS) {
      const op = advance().type;
      const right = parseMulDiv();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseMulDiv() {
    let left = parseUnary();
    while (peek().type === TOKEN_TYPES.STAR || peek().type === TOKEN_TYPES.SLASH || peek().type === TOKEN_TYPES.PERCENT) {
      const op = advance().type;
      const right = parseUnary();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === TOKEN_TYPES.MINUS) {
      advance();
      return { type: 'UnaryOp', op: 'MINUS', expr: parsePostfix() };
    }
    if (peek().type === TOKEN_TYPES.NOT) {
      advance();
      return { type: 'UnaryOp', op: 'NOT', expr: parsePostfix() };
    }
    return parsePostfix();
  }

  // Postfix operators: .property, [index], ()
  function parsePostfix() {
    let expr = parsePrimary();
    while (peek().type === TOKEN_TYPES.DOT || peek().type === TOKEN_TYPES.LBRACKET || peek().type === TOKEN_TYPES.LPAREN) {
      if (peek().type === TOKEN_TYPES.DOT) {
        advance();
        const property = expect(TOKEN_TYPES.IDENT).value;
        if (peek().type === TOKEN_TYPES.LPAREN) {
          advance();
          const args = [];
          if (peek().type !== TOKEN_TYPES.RPAREN) {
            args.push(parseExpression());
            while (peek().type === TOKEN_TYPES.COMMA) {
              advance();
              args.push(parseExpression());
            }
          }
          expect(TOKEN_TYPES.RPAREN);
          expr = { type: 'MethodCall', object: expr, method: property, args };
        } else {
          expr = { type: 'ObjectAccess', object: expr, property };
        }
      } else if (peek().type === TOKEN_TYPES.LBRACKET) {
        advance();
        const index = parseExpression();
        expect(TOKEN_TYPES.RBRACKET);
        expr = { type: 'ArrayAccess', name: expr, index };
      } else if (peek().type === TOKEN_TYPES.LPAREN) {
        advance();
        const args = [];
        if (peek().type !== TOKEN_TYPES.RPAREN) {
          args.push(parseExpression());
          while (peek().type === TOKEN_TYPES.COMMA) {
            advance();
            args.push(parseExpression());
          }
        }
        expect(TOKEN_TYPES.RPAREN);
        expr = { type: 'Call', name: expr, args };
      }
    }
    return expr;
  }

  function parsePrimary() {
    const t = peek();

    if (t.type === TOKEN_TYPES.NUMBER) {
      advance();
      return { type: 'Number', value: t.value };
    }
    if (t.type === TOKEN_TYPES.STRING) {
      advance();
      return { type: 'String', value: t.value };
    }
    if (t.type === TOKEN_TYPES.TRUE) {
      advance();
      return { type: 'Boolean', value: true };
    }
    if (t.type === TOKEN_TYPES.FALSE) {
      advance();
      return { type: 'Boolean', value: false };
    }
    if (t.type === TOKEN_TYPES.PREDICT) {
      advance();
      const input = parseExpression();
      return { type: 'PredictExpr', input };
    }
    // Handle range and other keywords as function calls in expressions
    if (t.type === TOKEN_TYPES.RANGE || t.type === TOKEN_TYPES.MEAN || t.type === TOKEN_TYPES.STD || t.type === TOKEN_TYPES.VARIANCE || t.type === TOKEN_TYPES.MEDIAN) {
      advance();
      if (peek().type === TOKEN_TYPES.LPAREN) {
        advance();
        const args = [];
        if (peek().type !== TOKEN_TYPES.RPAREN) {
          args.push(parseExpression());
          while (peek().type === TOKEN_TYPES.COMMA) {
            advance();
            args.push(parseExpression());
          }
        }
        expect(TOKEN_TYPES.RPAREN);
        return { type: 'Call', name: t.value, args };
      }
      return { type: 'Identifier', name: t.value };
    }
    // Allow 'data' as an identifier in expressions
    if (t.type === TOKEN_TYPES.DATA) {
      advance();
      // Handle data.method() or data.property
      if (peek().type === TOKEN_TYPES.DOT) {
        advance();
        const property = expect(TOKEN_TYPES.IDENT).value;
        if (peek().type === TOKEN_TYPES.LPAREN) {
          advance();
          const args = [];
          if (peek().type !== TOKEN_TYPES.RPAREN) {
            args.push(parseExpression());
            while (peek().type === TOKEN_TYPES.COMMA) {
              advance();
              args.push(parseExpression());
            }
          }
          expect(TOKEN_TYPES.RPAREN);
          return { type: 'MethodCall', object: 'data', method: property, args };
        }
        return { type: 'ObjectAccess', object: 'data', property };
      }
      // Handle data[0]
      if (peek().type === TOKEN_TYPES.LBRACKET) {
        advance();
        const index = parseExpression();
        expect(TOKEN_TYPES.RBRACKET);
        return { type: 'ArrayAccess', name: 'data', index };
      }
      return { type: 'Identifier', name: 'data' };
    }
    if (t.type === TOKEN_TYPES.IDENT) {
      advance();
      // Function call
      if (peek().type === TOKEN_TYPES.LPAREN) {
        advance();
        const args = [];
        if (peek().type !== TOKEN_TYPES.RPAREN) {
          args.push(parseExpression());
          while (peek().type === TOKEN_TYPES.COMMA) {
            advance();
            args.push(parseExpression());
          }
        }
        expect(TOKEN_TYPES.RPAREN);
        return { type: 'Call', name: t.value, args };
      }
      // Array access: arr[index]
      if (peek().type === TOKEN_TYPES.LBRACKET) {
        advance();
        const index = parseExpression();
        expect(TOKEN_TYPES.RBRACKET);
        return { type: 'ArrayAccess', name: t.value, index };
      }
      // Object property access: obj.property
      if (peek().type === TOKEN_TYPES.DOT) {
        advance();
        const property = expect(TOKEN_TYPES.IDENT).value;
        // Check for method call: obj.method()
        if (peek().type === TOKEN_TYPES.LPAREN) {
          advance();
          const args = [];
          if (peek().type !== TOKEN_TYPES.RPAREN) {
            args.push(parseExpression());
            while (peek().type === TOKEN_TYPES.COMMA) {
              advance();
              args.push(parseExpression());
            }
          }
          expect(TOKEN_TYPES.RPAREN);
          return { type: 'MethodCall', object: t.value, method: property, args };
        }
        return { type: 'ObjectAccess', object: t.value, property };
      }
      return { type: 'Identifier', name: t.value };
    }
    if (t.type === TOKEN_TYPES.LPAREN) {
      advance();
      const expr = parseExpression();
      expect(TOKEN_TYPES.RPAREN);
      return expr;
    }
    if (t.type === TOKEN_TYPES.FN) {
      return parseFn();
    }
    if (t.type === TOKEN_TYPES.LBRACKET) {
      advance();
      const elements = [];
      if (peek().type !== TOKEN_TYPES.RBRACKET) {
        elements.push(parseExpression());
        while (peek().type === TOKEN_TYPES.COMMA) {
          advance();
          elements.push(parseExpression());
        }
      }
      expect(TOKEN_TYPES.RBRACKET);
      return { type: 'ArrayLiteral', elements };
    }
    // Object literal: {key: value, key2: value2}
    if (t.type === TOKEN_TYPES.LBRACE) {
      advance();
      const properties = [];
      if (peek().type !== TOKEN_TYPES.RBRACE) {
        // First property
        const key = expect(TOKEN_TYPES.IDENT).value;
        expect(TOKEN_TYPES.COLON);
        const value = parseExpression();
        properties.push({ key, value });
        // More properties
        while (peek().type === TOKEN_TYPES.COMMA) {
          advance();
          const k = expect(TOKEN_TYPES.IDENT).value;
          expect(TOKEN_TYPES.COLON);
          const v = parseExpression();
          properties.push({ key: k, value: v });
        }
      }
      expect(TOKEN_TYPES.RBRACE);
      return { type: 'ObjectLiteral', properties };
    }

    throw new Error(`Unexpected token ${t.type} ('${t.value}') at line ${t.line}`);
  }

  // ── Data Section ─────────────────────────────────
  function parseDataSection() {
    expect(TOKEN_TYPES.DATA);
    const t = peek();

    if (t.type === TOKEN_TYPES.POINTS) {
      return parseDataPoints();
    } else if (t.type === TOKEN_TYPES.CSV) {
      return parseDataCSV();
    }

    throw new Error(`Expected 'points' or 'csv' after 'data' at line ${t.line}`);
  }

  function parseDataPoints() {
    expect(TOKEN_TYPES.POINTS);
    skipNewlines();

    const points = [];
    while (peek().type === TOKEN_TYPES.LPAREN) {
      points.push(parsePoint());
      skipNewlines();
    }

    return { type: 'DataPoints', points };
  }

  function parsePoint() {
    expect(TOKEN_TYPES.LPAREN);
    const x = expect(TOKEN_TYPES.NUMBER).value;
    expect(TOKEN_TYPES.COMMA);
    const y = expect(TOKEN_TYPES.NUMBER).value;
    expect(TOKEN_TYPES.RPAREN);
    return [x, y];
  }

  function parseDataCSV() {
    expect(TOKEN_TYPES.CSV);
    const filename = expect(TOKEN_TYPES.STRING).value;
    return { type: 'DataCSV', filename };
  }

  // ── Model Section ────────────────────────────────
  function parseModelSection() {
    expect(TOKEN_TYPES.MODEL);

    // Optional model name (string)
    let name = 'model';
    if (peek().type === TOKEN_TYPES.STRING) {
      name = advance().value;
    }

    // Model type
    const typeToken = peek();
    let modelType = 'simple';
    if (typeToken.type === TOKEN_TYPES.SIMPLE) {
      advance();
      modelType = 'simple';
    } else if (typeToken.type === TOKEN_TYPES.SEQUENTIAL) {
      advance();
      modelType = 'sequential';
    } else if (typeToken.type === TOKEN_TYPES.STRING) {
      // Handle case where name was already captured
      modelType = 'simple';
    }

    // Parse layers (for sequential models)
    const layers = [];
    if (modelType === 'sequential') {
      skipNewlines();
      while (peek().type === TOKEN_TYPES.DENSE || peek().type === TOKEN_TYPES.DROPOUT) {
        layers.push(parseLayer());
        skipNewlines();
      }
    }

    return { type: 'ModelDecl', name, modelType, layers };
  }

  function parseLayer() {
    const t = peek();

    if (t.type === TOKEN_TYPES.DENSE) {
      advance();
      const units = expect(TOKEN_TYPES.NUMBER).value;
      const activation = parseActivation();
      return { type: 'DenseLayer', units, activation };
    }

    if (t.type === TOKEN_TYPES.DROPOUT) {
      advance();
      const rate = expect(TOKEN_TYPES.NUMBER).value;
      return { type: 'DropoutLayer', rate };
    }

    throw new Error(`Expected 'dense' or 'dropout' at line ${t.line}`);
  }

  function parseActivation() {
    const t = peek();
    const activations = [
      TOKEN_TYPES.RELU, TOKEN_TYPES.SIGMOID, TOKEN_TYPES.SOFTMAX,
      TOKEN_TYPES.TANH, TOKEN_TYPES.LINEAR
    ];
    if (activations.includes(t.type)) {
      advance();
      return t.value;
    }
    // Default to linear if no activation specified
    return 'linear';
  }

  // ── Train Section ────────────────────────────────
  function parseTrainSection() {
    expect(TOKEN_TYPES.TRAIN);

    let optimizer = 'sgd';
    let epochs = 10;
    let loss = 'mse';
    let batch = null;

    // Parse options in any order until we hit a non-train token
    while (peek().type !== TOKEN_TYPES.NEWLINE && peek().type !== TOKEN_TYPES.EOF) {
      const t = peek();

      if (t.type === TOKEN_TYPES.WITH) {
        advance();
        optimizer = parseOptimizer();
      } else if (t.type === TOKEN_TYPES.EPOCHS) {
        advance();
        epochs = expect(TOKEN_TYPES.NUMBER).value;
      } else if (t.type === TOKEN_TYPES.NUMBER && epochs === 10) {
        // Handle "train 200 epochs" syntax
        epochs = advance().value;
        if (peek().type === TOKEN_TYPES.EPOCHS) advance(); // consume optional "epochs"
      } else if (t.type === TOKEN_TYPES.LOSS) {
        advance();
        loss = parseLoss();
      } else if (t.type === TOKEN_TYPES.BATCH) {
        advance();
        batch = expect(TOKEN_TYPES.NUMBER).value;
      } else {
        break;
      }
    }

    return { type: 'TrainSection', optimizer, epochs, loss, batch };
  }

  function parseOptimizer() {
    const t = peek();
    if (t.type === TOKEN_TYPES.ADAM) { advance(); return 'adam'; }
    if (t.type === TOKEN_TYPES.SGD) { advance(); return 'sgd'; }
    throw new Error(`Expected optimizer (adam/sgd) at line ${t.line}`);
  }

  function parseLoss() {
    const t = peek();
    if (t.type === TOKEN_TYPES.MSE) { advance(); return 'mse'; }
    if (t.type === TOKEN_TYPES.CROSS_ENTROPY) { advance(); return 'cross_entropy'; }
    throw new Error(`Expected loss function (mse/cross_entropy) at line ${t.line}`);
  }

  // ── Predict Section ──────────────────────────────
  function parsePredictSection() {
    expect(TOKEN_TYPES.PREDICT);

    // Can be a single number or array
    let input;
    if (peek().type === TOKEN_TYPES.LBRACKET) {
      advance();
      input = [];
      if (peek().type !== TOKEN_TYPES.RBRACKET) {
        input.push(expect(TOKEN_TYPES.NUMBER).value);
        while (peek().type === TOKEN_TYPES.COMMA) {
          advance();
          input.push(expect(TOKEN_TYPES.NUMBER).value);
        }
      }
      expect(TOKEN_TYPES.RBRACKET);
    } else {
      input = expect(TOKEN_TYPES.NUMBER).value;
    }

    return { type: 'PredictSection', input };
  }

  // ── Show Section ─────────────────────────────────
  function parseShowSection() {
    expect(TOKEN_TYPES.SHOW);
    const t = peek();

    if (t.type === TOKEN_TYPES.RESULTS) { advance(); return { type: 'ShowSection', what: 'results' }; }
    if (t.type === TOKEN_TYPES.ACCURACY) { advance(); return { type: 'ShowSection', what: 'accuracy' }; }
    if (t.type === TOKEN_TYPES.LOSS) { advance(); return { type: 'ShowSection', what: 'loss' }; }
    if (t.type === TOKEN_TYPES.DATA_KW || t.type === TOKEN_TYPES.DATA) { advance(); return { type: 'ShowSection', what: 'data' }; }
    if (t.type === TOKEN_TYPES.MODEL_KW || t.type === TOKEN_TYPES.MODEL) { advance(); return { type: 'ShowSection', what: 'model' }; }

    throw new Error(`Expected what to show (results/accuracy/loss/data/model) at line ${t.line}`);
  }

  return parseProgram();
}

module.exports = { parse };
