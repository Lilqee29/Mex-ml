// ═══════════════════════════════════════════════════════
//  MEX INTERPRETER — Executes AST and runs ML operations
// ═══════════════════════════════════════════════════════

const { NeuralNetwork } = require('./nn');
const fs = require('fs');
const path = require('path');

function interpret(ast) {
  const state = {
    data: null,
    model: null,
    modelConfig: null,
    trained: false,
    trainResult: null,
    results: [],
    output: [],
    variables: {},
    functions: {},
    exports: {},
  };

  // Sentinel for return values
  class ReturnSignal {
    constructor(value) {
      this.value = value;
    }
  }

  // ── DataFrame class for method chaining ─────────────
  class DataFrame {
    constructor(dataObj) {
      this.raw = dataObj.raw || [];
      this.keys = dataObj.keys || [];
      this.filename = dataObj.filename || '';
    }

    // Get a column as array
    get_column(col) {
      const idx = this.keys.indexOf(col);
      return this.raw.map(row => row[col]);
    }

    // Filter rows
    filter(col, op, val) {
      const idx = this.keys.indexOf(col);
      const filtered = this.raw.filter(row => {
        const v = row[col];
        if (op === '>') return v > val;
        if (op === '<') return v < val;
        if (op === '>=') return v >= val;
        if (op === '<=') return v <= val;
        if (op === '==') return v === val;
        if (op === '!=') return v !== val;
        return false;
      });
      return new DataFrame({ raw: filtered, keys: [...this.keys], filename: this.filename });
    }

    // Sort by column
    sort(col, ascending = true) {
      const sorted = [...this.raw].sort((a, b) => {
        if (ascending) return a[col] - b[col];
        return b[col] - a[col];
      });
      return new DataFrame({ raw: sorted, keys: [...this.keys], filename: this.filename });
    }

    // Head (first n rows)
    head(n = 5) {
      return new DataFrame({ raw: this.raw.slice(0, n), keys: [...this.keys], filename: this.filename });
    }

    // Tail (last n rows)
    tail(n = 5) {
      return new DataFrame({ raw: this.raw.slice(-n), keys: [...this.keys], filename: this.filename });
    }

    // Select columns
    select(...cols) {
      const selected = this.raw.map(row => {
        const newRow = {};
        cols.forEach(c => { newRow[c] = row[c]; });
        return newRow;
      });
      return new DataFrame({ raw: selected, keys: cols, filename: this.filename });
    }

    // Drop columns
    drop(...cols) {
      const remaining = this.keys.filter(k => !cols.includes(k));
      return this.select(...remaining);
    }

    // Unique values in a column
    unique(col) {
      return [...new Set(this.raw.map(row => row[col]))];
    }

    // Value counts for a column
    value_counts(col) {
      const counts = {};
      this.raw.forEach(row => {
        const val = row[col];
        counts[val] = (counts[val] || 0) + 1;
      });
      return counts;
    }

    // Describe statistics
    describe() {
      const stats = {};
      this.keys.forEach(col => {
        const values = this.raw.map(r => r[col]).filter(v => typeof v === 'number');
        if (values.length === 0) return;
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
        stats[col] = {
          count: n,
          mean: Math.round(mean * 1000) / 1000,
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.round(Math.sqrt(variance) * 1000) / 1000
        };
      });
      return stats;
    }

    // Shape [rows, cols]
    shape() {
      return [this.raw.length, this.keys.length];
    }

    // Column names
    columns() {
      return [...this.keys];
    }

    // Convert to JSON
    to_json() {
      return JSON.stringify(this.raw, null, 2);
    }

    // Save as CSV
    save_csv(filename) {
      const header = this.keys.join(',');
      const rows = this.raw.map(row => this.keys.map(k => row[k]).join(','));
      const csv = [header, ...rows].join('\n');
      fs.writeFileSync(filename, csv);
      return `Saved ${this.raw.length} rows to ${filename}`;
    }

    // Apply a function to a column
    map(col, fn) {
      const mapped = this.raw.map(row => {
        const newRow = { ...row };
        newRow[col] = fn(row[col]);
        return newRow;
      });
      return new DataFrame({ raw: mapped, keys: [...this.keys], filename: this.filename });
    }

    // Aggregate (reduce)
    reduce(col, fn, initial) {
      return this.raw.reduce((acc, row) => fn(acc, row[col]), initial);
    }

    // Merge with another DataFrame (inner join on key)
    merge(other, key) {
      const merged = [];
      this.raw.forEach(rowA => {
        other.raw.forEach(rowB => {
          if (rowA[key] === rowB[key]) {
            merged.push({ ...rowA, ...rowB });
          }
        });
      });
      const newKeys = [...new Set([...this.keys, ...other.keys])];
      return new DataFrame({ raw: merged, keys: newKeys });
    }

    // Pivot table
    pivot(index, columns, values) {
      const result = {};
      this.raw.forEach(row => {
        const idx = row[index];
        const col = row[columns];
        if (!result[idx]) result[idx] = {};
        result[idx][col] = row[values];
      });
      return result;
    }

    // Melt (unpivot)
    melt(id_vars, value_vars) {
      const result = [];
      this.raw.forEach(row => {
        value_vars.forEach(varName => {
          const newRow = {};
          id_vars.forEach(id => { newRow[id] = row[id]; });
          newRow['variable'] = varName;
          newRow['value'] = row[varName];
          result.push(newRow);
        });
      });
      const newKeys = [...id_vars, 'variable', 'value'];
      return new DataFrame({ raw: result, keys: newKeys });
    }

    // Group by and aggregate
    groupby(col) {
      const groups = {};
      this.raw.forEach(row => {
        const key = row[col];
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      return Object.entries(groups).map(([key, rows]) => ({
        [col]: key,
        count: rows.length,
        data: new DataFrame({ raw: rows, keys: [...this.keys] })
      }));
    }

    // Return plain object for display
    toJSON() {
      return this.raw;
    }
  }

  // Error helper with line number
  function error(msg, node) {
    const line = node && node.line ? ` at line ${node.line}` : '';
    throw new Error(`${msg}${line}`);
  }

  // ── Execute program ──────────────────────────────
  function exec(node) {
    switch (node.type) {
      case 'Program':      return execProgram(node);
      case 'DataPoints':   return execDataPoints(node);
      case 'DataCSV':      return execDataCSV(node);
      case 'ModelDecl':    return execModelDecl(node);
      case 'TrainSection': return execTrain(node);
      case 'PredictSection': return execPredict(node);
      case 'ShowSection':  return execShow(node);
      case 'Let':          return execLet(node);
      case 'Assignment':   return execAssignment(node);
      case 'ArrayAssignment': return execArrayAssignment(node);
      case 'If':           return execIf(node);
      case 'For':          return execFor(node);
      case 'While':        return execWhile(node);
      case 'Function':     return execFunction(node);
      case 'Return':       return execReturn(node);
      case 'Print':        return execPrint(node);
      case 'BinaryOp':     return execBinaryOp(node);
      case 'UnaryOp':      return execUnaryOp(node);
      case 'Number':       return node.value;
      case 'String':       return node.value;
      case 'Boolean':      return node.value;
      case 'Identifier':   return execIdentifier(node);
      case 'ArrayAccess':  return execArrayAccess(node);
      case 'ObjectAccess': return execObjectAccess(node);
      case 'MethodCall':   return execMethodCall(node);
      case 'Call':         return execCall(node);
      case 'PredictExpr':  return execPredictExpr(node);
      case 'ArrayLiteral':  return node.elements.map(el => exec(el));
      case 'ObjectLiteral': return execObjectLiteral(node);
      case 'Import':       return execImport(node);
      case 'Export':       return execExport(node);
      case 'Save':         return execSave(node);
      case 'Load':         return execLoad(node);
      default:
        error(`Unknown node type: ${node.type}`, node);
    }
  }

  // ── Program ──────────────────────────────────────
  function execProgram(node) {
    for (const stmt of node.body) {
      exec(stmt);
    }
    return state.output;
  }

  // ── Let (Variable Declaration) ───────────────────
  // Type checking helper
  function checkType(value, expectedType, name) {
    if (!expectedType) return; // No type annotation, skip check
    
    const actualType = typeof value;
    const typeMap = {
      'number': 'number',
      'string': 'string',
      'boolean': 'boolean',
      'array': 'object',
      'object': 'object',
      'function': 'function',
      'void': 'undefined',
      'null': 'object',
      'undefined': 'undefined',
    };
    
    const expected = typeMap[expectedType] || expectedType;
    
    // Special checks
    if (expectedType === 'array' && !Array.isArray(value)) {
      error(`Type error: ${name} expected array, got ${actualType}`);
    }
    if (expectedType === 'null' && value !== null) {
      error(`Type error: ${name} expected null, got ${actualType}`);
    }
    if (expectedType === 'number' && actualType === 'number' && isNaN(value)) {
      error(`Type error: ${name} is NaN`);
    }
    if (expectedType === 'object' && Array.isArray(value)) {
      // Arrays are objects, so this is OK
      return;
    }
    if (expected !== actualType && expectedType !== 'object') {
      error(`Type error: ${name} expected ${expectedType}, got ${actualType}`);
    }
  }

  function execLet(node) {
    const value = exec(node.value);
    
    // Type checking if annotation present
    if (node.typeAnnotation) {
      checkType(value, node.typeAnnotation, node.name);
    }
    
    state.variables[node.name] = value;
  }

  // ── Assignment ───────────────────────────────────
  function execAssignment(node) {
    const value = exec(node.value);
    state.variables[node.name] = value;
  }

  // ── Array Assignment ──────────────────────────────
  function execArrayAssignment(node) {
    const arr = state.variables[node.name];
    if (!arr) {
      error(`Undefined array: ${node.name}`, node);
    }
    if (!Array.isArray(arr)) {
      error(`Variable is not an array: ${node.name}`, node);
    }
    const index = exec(node.index);
    if (typeof index !== 'number' || index < 0 || index >= arr.length) {
      error(`Array index out of bounds: ${index} (length: ${arr.length})`, node);
    }
    const value = exec(node.value);
    arr[index] = value;
  }

  // ── Object Literal ──────────────────────────────
  function execObjectLiteral(node) {
    const obj = {};
    for (const prop of node.properties) {
      obj[prop.key] = exec(prop.value);
    }
    return obj;
  }

  // ── If/Else ──────────────────────────────────────
  function execIf(node) {
    const condition = exec(node.condition);
    if (condition) {
      for (const stmt of node.body) {
        exec(stmt);
      }
    } else if (node.elseBody) {
      if (Array.isArray(node.elseBody)) {
        for (const stmt of node.elseBody) {
          exec(stmt);
        }
      } else {
        exec(node.elseBody);
      }
    }
  }

  // ── For Loop ─────────────────────────────────────
  function execFor(node) {
    const start = exec(node.start);
    const end = exec(node.end);
    for (let i = start; i < end; i++) {
      state.variables[node.varName] = i;
      for (const stmt of node.body) {
        exec(stmt);
      }
    }
  }

  // ── While Loop ───────────────────────────────────
  function execWhile(node) {
    let safety = 0;
    while (exec(node.condition) && safety < 10000) {
      for (const stmt of node.body) {
        exec(stmt);
      }
      safety++;
    }
  }

  // ── Function ─────────────────────────────────────
  function execFunction(node) {
    // Anonymous function: return a callable wrapper
    if (!node.name) {
      return (...args) => {
        // Create a new scope for the function
        const savedVars = { ...state.variables };
        // Bind arguments to parameter names
        node.params.forEach((param, i) => {
          state.variables[param] = args[i];
        });
        // Execute function body
        try {
          for (const stmt of node.body) {
            exec(stmt);
          }
        } catch (e) {
          if (e instanceof ReturnSignal) {
            state.variables = savedVars;
            return e.value;
          }
          throw e;
        }
        state.variables = savedVars;
        return null;
      };
    }
    state.functions[node.name] = node;
  }

  // ── Return ───────────────────────────────────────
  function execReturn(node) {
    const value = node.value ? exec(node.value) : null;
    throw new ReturnSignal(value);
  }

  // ── Print ────────────────────────────────────────
  function execPrint(node) {
    const values = node.args.map(arg => {
      const val = exec(arg);
      if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          return JSON.stringify(val);
        }
        // Check if it's a plain object (not a class instance)
        if (val.constructor === Object || val.constructor === undefined) {
          return JSON.stringify(val);
        }
        // For class instances like DataFrame, try toJSONObject
        if (typeof val.toJSON === 'function') {
          return JSON.stringify(val.toJSON());
        }
        return JSON.stringify(val);
      }
      return String(val);
    });
    state.output.push(values.join(' '));
  }

  // ── Binary Operation ─────────────────────────────
  function execBinaryOp(node) {
    const left = exec(node.left);
    const right = exec(node.right);
    switch (node.op) {
      case 'PLUS':   return left + right;
      case 'MINUS':  return left - right;
      case 'STAR':   return left * right;
      case 'SLASH':  return left / right;
      case 'PERCENT': return left % right;
      case 'EQEQ':   return left === right;
      case 'NEQ':    return left !== right;
      case 'LT':     return left < right;
      case 'GT':     return left > right;
      case 'LTE':    return left <= right;
      case 'GTE':    return left >= right;
      case 'AND':    return left && right;
      case 'OR':     return left || right;
      default:
        throw new Error(`Unknown operator: ${node.op}`);
    }
  }

  // ── Unary Operation ──────────────────────────────
  function execUnaryOp(node) {
    const expr = exec(node.expr);
    switch (node.op) {
      case 'MINUS': return -expr;
      case 'NOT':   return !expr;
      default:
        throw new Error(`Unknown unary operator: ${node.op}`);
    }
  }

  // ── Identifier ───────────────────────────────────
  function execIdentifier(node) {
    // Built-in constants
    const constants = {
      'PI': Math.PI,
      'E': Math.E,
      'LN2': Math.LN2,
      'LN10': Math.LN10,
      'LOG2E': Math.LOG2E,
      'LOG10E': Math.LOG10E,
      'SQRT1_2': Math.SQRT1_2,
      'SQRT2': Math.SQRT2,
    };

    if (node.name in constants) {
      return constants[node.name];
    }

    // Special 'data' variable - returns loaded dataset
    if (node.name === 'data' && state.data) {
      return state.data;
    }

    if (node.name in state.variables) {
      return state.variables[node.name];
    }

    if (node.name in state.functions) {
      return state.functions[node.name];
    }

    error(`Undefined variable: ${node.name}`, node);
  }

  // ── Array Access ──────────────────────────────────
  function execArrayAccess(node) {
    let arr;
    if (typeof node.name === 'object' && node.name.type) {
      arr = exec(node.name);
    } else if (node.name === 'data' && state.data) {
      arr = state.data;
    } else {
      arr = state.variables[node.name];
    }
    if (!arr) {
      error(`Undefined array: ${node.name}`, node);
    }
    if (!Array.isArray(arr)) {
      error(`Variable is not an array: ${node.name}`, node);
    }
    const index = exec(node.index);
    if (typeof index !== 'number' || index < 0 || index >= arr.length) {
      error(`Array index out of bounds: ${index} (length: ${arr.length})`, node);
    }
    return arr[index];
  }

  // ── Object Access ────────────────────────────────
  function execObjectAccess(node) {
    let obj;
    if (typeof node.object === 'object' && node.object.type) {
      obj = exec(node.object);
    } else if (node.object === 'data' && state.data) {
      obj = state.data;
    } else {
      obj = state.variables[node.object];
    }
    if (!obj) {
      error(`Undefined variable: ${node.object}`, node);
    }
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      error(`Variable is not an object: ${node.object}`, node);
    }
    if (!(node.property in obj)) {
      error(`Property '${node.property}' not found on object`, node);
    }
    return obj[node.property];
  }

  // ── Method Call ──────────────────────────────────
  function execMethodCall(node) {
    let obj;
    if (typeof node.object === 'object' && node.object.type) {
      obj = exec(node.object);
    } else if (node.object === 'data' && state.data) {
      obj = state.data;
    } else {
      obj = state.variables[node.object];
    }
    if (!obj) {
      error(`Undefined variable: ${node.object}`, node);
    }

    // Array methods
    if (Array.isArray(obj)) {
      const args = node.args.map(a => exec(a));
      switch (node.method) {
        case 'length':
          return obj.length;
        case 'push':
          obj.push(...args);
          return obj;
        case 'pop':
          return obj.pop();
        case 'shift':
          return obj.shift();
        case 'unshift':
          obj.unshift(...args);
          return obj;
        case 'slice':
          return obj.slice(args[0], args[1]);
        case 'splice':
          return obj.splice(args[0], args[1], ...args.slice(2));
        case 'indexOf':
          return obj.indexOf(args[0]);
        case 'includes':
          return obj.includes(args[0]);
        case 'join':
          return obj.join(args[0] || ',');
        case 'reverse':
          return obj.reverse();
        case 'sort':
          return obj.sort();
        default:
          error(`Unknown array method: ${node.method}`, node);
      }
    }

    // String methods
    if (typeof obj === 'string') {
      const args = node.args.map(a => exec(a));
      switch (node.method) {
        case 'length':
          return obj.length;
        case 'toUpperCase':
          return obj.toUpperCase();
        case 'toLowerCase':
          return obj.toLowerCase();
        case 'trim':
          return obj.trim();
        case 'charAt':
          return obj.charAt(args[0]);
        case 'substring':
          return obj.substring(args[0], args[1]);
        case 'indexOf':
          return obj.indexOf(args[0]);
        case 'includes':
          return obj.includes(args[0]);
        case 'replace':
          return obj.replace(args[0], args[1]);
        case 'split':
          return obj.split(args[0] || ',');
        case 'startsWith':
          return obj.startsWith(args[0]);
        case 'endsWith':
          return obj.endsWith(args[0]);
        default:
          error(`Unknown string method: ${node.method}`, node);
      }
    }

    // Object methods
    if (typeof obj === 'object' && !(obj instanceof DataFrame)) {
      const args = node.args.map(a => exec(a));
      switch (node.method) {
        case 'keys':
          return Object.keys(obj);
        case 'values':
          return Object.values(obj);
        case 'entries':
          return Object.entries(obj);
        case 'has':
          return args[0] in obj;
        case 'get':
          return obj[args[0]];
        case 'set':
          obj[args[0]] = args[1];
          return obj;
        default:
          error(`Unknown object method: ${node.method}`, node);
      }
    }

    // DataFrame methods (supports chaining)
    if (obj instanceof DataFrame) {
      const args = node.args.map(a => exec(a));
      switch (node.method) {
        case 'shape':
          return obj.shape();
        case 'columns':
          return obj.columns();
        case 'get_column':
          return obj.get_column(args[0]);
        case 'filter':
          return obj.filter(args[0], args[1], args[2]);
        case 'sort':
          return obj.sort(args[0], args[1] !== false);
        case 'head':
          return obj.head(args[0] || 5);
        case 'tail':
          return obj.tail(args[0] || 5);
        case 'select':
          return obj.select(...args);
        case 'drop':
          return obj.drop(...args);
        case 'unique':
          return obj.unique(args[0]);
        case 'value_counts':
          return obj.value_counts(args[0]);
        case 'describe':
          return obj.describe();
        case 'to_json':
          return obj.to_json();
        case 'save_csv':
          return obj.save_csv(args[0]);
        case 'map':
          return obj.map(args[0], args[1]);
        case 'reduce':
          return obj.reduce(args[0], args[1], args[2]);
        case 'merge':
          return obj.merge(args[0], args[1]);
        case 'pivot':
          return obj.pivot(args[0], args[1], args[2]);
        case 'melt':
          return obj.melt(args[0], args[1]);
        case 'groupby':
          return obj.groupby(args[0]);
        case 'length':
          return obj.raw.length;
        default:
          error(`Unknown DataFrame method: ${node.method}`, node);
      }
    }

    error(`Cannot call method '${node.method}' on this type`, node);
  }

  // ── Function Call ────────────────────────────────
  function execCall(node) {
    // Handle chained calls like data.inputs.length()
    let fnName;
    if (typeof node.name === 'object' && node.name.type) {
      fnName = exec(node.name);
    } else {
      fnName = node.name;
    }
    // Built-in math functions from JS
    const builtins = {
      'sqrt': Math.sqrt,
      'pow': Math.pow,
      'abs': Math.abs,
      'sin': Math.sin,
      'cos': Math.cos,
      'tan': Math.tan,
      'log': Math.log,
      'log10': Math.log10,
      'exp': Math.exp,
      'floor': Math.floor,
      'ceil': Math.ceil,
      'round': Math.round,
      'min': Math.min,
      'max': Math.max,
      'random': Math.random,
      'PI': Math.PI,
      'E': Math.E,
      // Statistics functions
      'mean': (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
      'sum': (arr) => arr.reduce((a, b) => a + b, 0),
      'std': (arr) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length);
      },
      'variance': (arr) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length;
      },
      'median': (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      },
      'mode': (arr) => {
        const frequency = {};
        arr.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
        return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
      },
      'min_arr': (arr) => Math.min(...arr),
      'max_arr': (arr) => Math.max(...arr),
      'range': (arr) => Math.max(...arr) - Math.min(...arr),
      'count': (arr) => arr.length,
      // String functions
      'len': (x) => x.length,
      'upper': (s) => s.toUpperCase(),
      'lower': (s) => s.toLowerCase(),
      'trim': (s) => s.trim(),
      'split': (s, d) => s.split(d),
      'join': (arr, d) => arr.join(d),
      'replace': (s, old, new_s) => s.replace(old, new_s),
      'includes': (s, sub) => s.includes(sub),
      'type': (x) => typeof x,
      // Array functions
      'sort': (arr) => [...arr].sort((a, b) => {
        // Handle arrays of numbers
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        // Handle arrays of [value] or [value, label] - sort by first element
        if (Array.isArray(a) && Array.isArray(b)) return a[0] - b[0];
        // Fallback to string comparison
        return String(a).localeCompare(String(b));
      }),
      'sort_by': (arr, fn) => [...arr].sort((a, b) => {
        const aVal = fn(a);
        const bVal = fn(b);
        if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
        return String(aVal).localeCompare(String(bVal));
      }),
      'reverse': (arr) => [...arr].reverse(),
      'unique': (arr) => [...new Set(arr)],
      'flatten': (arr) => arr.flat(),
      'slice': (arr, start, end) => arr.slice(start, end),
      'head': (arr, n) => arr.slice(0, n || 1),
      'tail': (arr, n) => arr.slice(-(n || 1)),
      'zip': (...arrays) => arrays[0].map((_, i) => arrays.map(a => a[i])),
      // Conversion
      'to_number': (x) => Number(x),
      'to_string': (x) => String(x),
      'to_array': (x) => Array.isArray(x) ? x : [x],
      // Data manipulation functions
      'filter': (arr, fn) => arr.filter(fn),
      'map': (arr, fn) => arr.map(fn),
      'reduce': (arr, fn, init) => arr.reduce(fn, init),
      'each': (arr, fn) => { arr.forEach(fn); return arr; },
      'find': (arr, fn) => arr.find(fn),
      'find_index': (arr, fn) => arr.findIndex(fn),
      'every': (arr, fn) => arr.every(fn),
      'some': (arr, fn) => arr.some(fn),
      'group_by': (arr, fn) => {
        const groups = {};
        arr.forEach(item => {
          const key = fn(item);
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
        });
        return groups;
      },
      'aggregate': (arr, fn) => arr.reduce((acc, val) => fn(acc, val)),
      // Column operations (for dataset work)
      'column': (data, col) => data.map(row => Array.isArray(row) ? row[col] : row[col]),
      'columns': (data, cols) => data.map(row => cols.map(c => Array.isArray(row) ? row[c] : row[c])),
      'select': (data, cols) => {
        if (Array.isArray(cols)) {
          return data.map(row => cols.map(c => typeof row === 'object' ? row[c] : row[c]));
        }
        return data.map(row => typeof row === 'object' ? row[cols] : row);
      },
      'where': (data, fn) => data.filter(fn),
      'limit': (data, n) => data.slice(0, n),
      'offset': (data, n) => data.slice(n),
      'sample': (data, n) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n || data.length);
      },
      'shuffle': (arr) => [...arr].sort(() => Math.random() - 0.5),
      'distinct': (arr) => [...new Set(arr)],
      'union': (a, b) => [...new Set([...a, ...b])],
      'intersection': (a, b) => a.filter(x => b.includes(x)),
      'difference': (a, b) => a.filter(x => !b.includes(x)),
      'flatten': (arr) => arr.flat(),
      'compact': (arr) => arr.filter(x => x !== null && x !== undefined && x !== ''),
      'pluck': (arr, key) => arr.map(item => item[key]),
      'count_by': (arr, fn) => {
        const counts = {};
        arr.forEach(item => {
          const key = fn(item);
          counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
      },
      // Normalization functions
      'normalize': (val, min, max) => {
        if (max === min) return 0.5;
        return (val - min) / (max - min);
      },
      'denormalize': (val, min, max) => val * (max - min) + min,
      'normalize_array': (arr) => {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        return arr.map(v => (v - min) / (max - min));
      },
      'denormalize_array': (arr, min, max) => arr.map(v => v * (max - min) + min),
      // Random functions
      'rand_int': (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      'rand_float': (min, max) => Math.random() * (max - min) + min,
      'rand_choice': (arr) => arr[Math.floor(Math.random() * arr.length)],
      'seed': (n) => { /* Seed would need more implementation */ },
      // String interpolation
      'format': (str, ...args) => {
        return str.replace(/{(\d+)}/g, (match, number) => {
          return typeof args[number] !== 'undefined' ? args[number] : match;
        });
      },
      'sprintf': (fmt, ...args) => {
        let i = 0;
        return fmt.replace(/%[sd]/g, () => args[i++]);
      },
      // DataFrame-like functions (work with loaded data)
      'column_names': () => {
        if (!state.data || !state.data.keys) return [];
        return state.data.keys;
      },
      'shape': () => {
        if (!state.data) return [0, 0];
        return [state.data.inputs.length, state.data.keys ? state.data.keys.length : 0];
      },
      'head': (...args) => {
        let raw, limit;
        if (args.length === 0) {
          if (!state.data) return [];
          raw = state.data.raw || state.data.inputs;
          limit = 5;
        } else if (args.length === 1) {
          limit = args[0];
          if (!state.data) return [];
          raw = state.data.raw || state.data.inputs;
        } else {
          raw = args[0];
          limit = args[1];
        }
        if (!raw) return [];
        return raw.slice(0, limit);
      },
      'tail': (...args) => {
        let raw, limit;
        if (args.length === 0) {
          if (!state.data) return [];
          raw = state.data.raw || state.data.inputs;
          limit = 5;
        } else if (args.length === 1) {
          limit = args[0];
          if (!state.data) return [];
          raw = state.data.raw || state.data.inputs;
        } else {
          raw = args[0];
          limit = args[1];
        }
        if (!raw) return [];
        return raw.slice(-limit);
      },
      'describe': () => {
        if (!state.data) return {};
        const raw = state.data.raw;
        const keys = state.data.keys;
        if (!raw || !keys) return {};
        const result = {};
        keys.forEach((key, i) => {
          const col = raw.map(r => typeof r === 'object' ? r[key] : r).filter(v => typeof v === 'number');
          if (col.length > 0) {
            result[key] = {
              count: col.length,
              mean: col.reduce((a, b) => a + b, 0) / col.length,
              min: Math.min(...col),
              max: Math.max(...col),
              std: Math.sqrt(col.reduce((sq, n) => sq + Math.pow(n - col.reduce((a, b) => a + b, 0) / col.length, 2), 0) / col.length)
            };
          }
        });
        return result;
      },
      'value_counts': (...args) => {
        let dataObj, col;
        if (args.length === 2) {
          [dataObj, col] = args;
        } else {
          col = args[0];
          dataObj = state.data;
        }
        if (!dataObj || !dataObj.raw) return {};
        const idx = typeof col === 'number' ? col : dataObj.keys.indexOf(col);
        const counts = {};
        dataObj.raw.forEach(row => {
          const val = typeof row === 'object' ? row[dataObj.keys[idx]] : row;
          counts[val] = (counts[val] || 0) + 1;
        });
        return counts;
      },
      'unique': (...args) => {
        let dataObj, col;
        if (args.length === 2) {
          [dataObj, col] = args;
        } else {
          col = args[0];
          dataObj = state.data;
        }
        if (!dataObj || !dataObj.raw) return [];
        const idx = typeof col === 'number' ? col : dataObj.keys.indexOf(col);
        return [...new Set(dataObj.raw.map(row => typeof row === 'object' ? row[dataObj.keys[idx]] : row))];
      },
      'sort_by': (col, asc) => {
        if (!state.data || !state.data.raw) return [];
        const idx = typeof col === 'number' ? col : state.data.keys.indexOf(col);
        const sorted = [...state.data.raw].sort((a, b) => {
          if (asc) return a[idx] > b[idx] ? 1 : -1;
          return a[idx] < b[idx] ? 1 : -1;
        });
        return sorted;
      },
      'filter_by': (...args) => {
        let dataObj, col, op, val;
        if (args.length === 4) {
          [dataObj, col, op, val] = args;
        } else {
          [col, op, val] = args;
          dataObj = state.data;
        }
        if (!dataObj || !dataObj.raw) return [];
        const idx = typeof col === 'number' ? col : dataObj.keys.indexOf(col);
        return dataObj.raw.filter(row => {
          const v = typeof row === 'object' ? row[dataObj.keys[idx]] : row;
          if (op === '>') return v > val;
          if (op === '<') return v < val;
          if (op === '>=') return v >= val;
          if (op === '<=') return v <= val;
          if (op === '==') return v === val;
          if (op === '!=') return v !== val;
          return false;
        });
      },
      'to_json': () => JSON.stringify(state.data),
      'from_json': (json) => JSON.parse(json),
      'save_csv': (filename) => {
        if (!state.data || !state.data.raw) return;
        const header = state.data.keys.join(',');
        const rows = state.data.raw.map(r => r.join(','));
        const csv = [header, ...rows].join('\n');
        fs.writeFileSync(filename, csv);
        return `Saved to ${filename}`;
      },

      // ── Visualization (ASCII charts) ─────────────
      'bar_chart': (data, options = {}) => {
        const width = options.width || 40;
        const values = Array.isArray(data) ? data : Object.values(data);
        const labels = options.labels || Object.keys(data);
        const maxVal = Math.max(...values);
        let chart = '';
        for (let i = 0; i < values.length; i++) {
          const barLen = Math.round((values[i] / maxVal) * width);
          const label = String(labels[i]).padEnd(12);
          chart += `${label} | ${'█'.repeat(barLen)} ${values[i]}\n`;
        }
        return chart;
      },
      'line_chart': (data, options = {}) => {
        const width = options.width || 50;
        const height = options.height || 15;
        const values = Array.isArray(data) ? data : Object.values(data);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        // Create grid
        const grid = Array.from({ length: height }, () => Array(width).fill(' '));
        // Plot points
        for (let i = 0; i < values.length; i++) {
          const x = Math.round((i / (values.length - 1)) * (width - 1));
          const y = Math.round(((values[i] - min) / range) * (height - 1));
          grid[height - 1 - y][x] = '●';
        }
        // Connect points with lines
        for (let i = 0; i < values.length - 1; i++) {
          const x1 = Math.round((i / (values.length - 1)) * (width - 1));
          const y1 = Math.round(((values[i] - min) / range) * (height - 1));
          const x2 = Math.round(((i + 1) / (values.length - 1)) * (width - 1));
          const y2 = Math.round(((values[i + 1] - min) / range) * (height - 1));
          // Simple line drawing
          const dx = x2 - x1;
          const dy = y2 - y1;
          const steps = Math.max(Math.abs(dx), Math.abs(dy));
          for (let s = 1; s < steps; s++) {
            const x = Math.round(x1 + (dx * s) / steps);
            const y = Math.round(y1 + (dy * s) / steps);
            if (x >= 0 && x < width && y >= 0 && y < height) {
              if (grid[height - 1 - y][x] === ' ') {
                grid[height - 1 - y][x] = '·';
              }
            }
          }
        }
        return grid.map(row => row.join('')).join('\n');
      },
      'scatter_plot': (xData, yData, options = {}) => {
        const width = options.width || 50;
        const height = options.height || 15;
        const xMin = Math.min(...xData);
        const xMax = Math.max(...xData);
        const yMin = Math.min(...yData);
        const yMax = Math.max(...yData);
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        // Create grid
        const grid = Array.from({ length: height }, () => Array(width).fill(' '));
        // Plot points
        for (let i = 0; i < xData.length; i++) {
          const x = Math.round(((xData[i] - xMin) / xRange) * (width - 1));
          const y = Math.round(((yData[i] - yMin) / yRange) * (height - 1));
          if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[height - 1 - y][x] = '●';
          }
        }
        return grid.map(row => row.join('')).join('\n');
      },
      'histogram': (data, bins = 10) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binWidth = (max - min) / bins;
        const counts = Array(bins).fill(0);
        data.forEach(v => {
          let bin = Math.floor((v - min) / binWidth);
          if (bin >= bins) bin = bins - 1;
          counts[bin]++;
        });
        const maxCount = Math.max(...counts);
        let chart = '';
        for (let i = 0; i < bins; i++) {
          const lo = Math.round(min + i * binWidth);
          const hi = Math.round(min + (i + 1) * binWidth);
          const barLen = Math.round((counts[i] / maxCount) * 30);
          chart += `${String(lo).padStart(6)}-${String(hi).padEnd(6)} | ${'█'.repeat(barLen)} ${counts[i]}\n`;
        }
        return chart;
      },
      'pie_chart': (data, options = {}) => {
        const labels = options.labels || Object.keys(data);
        const values = Array.isArray(data) ? data : Object.values(data);
        const total = values.reduce((a, b) => a + b, 0);
        const chars = ['█', '▓', '░', '▒', '■', '□', '◆', '◇'];
        let chart = '';
        for (let i = 0; i < values.length; i++) {
          const pct = ((values[i] / total) * 100).toFixed(1);
          const barLen = Math.round((values[i] / total) * 30);
          chart += `${String(labels[i]).padEnd(12)} | ${chars[i % chars.length].repeat(barLen)} ${pct}%\n`;
        }
        return chart;
      },
    };

    // Check builtins first
    if (fnName in builtins) {
      const fn = builtins[fnName];
      // For higher-order functions, pass anonymous functions directly
      const higherOrderFns = ['filter', 'map', 'reduce', 'each', 'find', 'find_index', 'every', 'some', 'group_by', 'aggregate', 'where', 'count_by'];
      let args;
      if (higherOrderFns.includes(fnName)) {
        args = node.args.map((arg, i) => {
          if (i === 1 && arg.type === 'Function') {
            // Second argument is the callback - create a wrapper
            return (...callArgs) => {
              const savedVars = { ...state.variables };
              arg.params.forEach((param, j) => {
                state.variables[param] = callArgs[j];
              });
              let result = null;
              try {
                for (const stmt of arg.body) {
                  exec(stmt);
                }
              } catch (e) {
                if (e instanceof ReturnSignal) {
                  result = e.value;
                } else {
                  throw e;
                }
              }
              state.variables = savedVars;
              return result;
            };
          }
          return exec(arg);
        });
      } else {
        args = node.args.map(arg => exec(arg));
      }
      if (typeof fn === 'function') {
        return fn(...args);
      }
      return fn;
    }

    // Check user-defined functions
    if (fnName in state.functions) {
      const func = state.functions[fnName];
      const savedVars = { ...state.variables };
      
      // Check argument count
      if (node.args.length !== func.params.length) {
        error(`${fnName} expects ${func.params.length} arguments, got ${node.args.length}`, node);
      }
      
      // Bind arguments with type checking
      func.params.forEach((param, i) => {
        const value = exec(node.args[i]);
        
        // Type checking if annotation present
        if (func.paramTypes && func.paramTypes[i]) {
          checkType(value, func.paramTypes[i], param);
        }
        
        state.variables[param] = value;
      });
      
      let result = null;
      try {
        for (const stmt of func.body) {
          exec(stmt);
        }
      } catch (e) {
        if (e instanceof ReturnSignal) {
          result = e.value;
        } else {
          throw e;
        }
      }
      
      // Check return type
      if (func.returnType && result !== null) {
        checkType(result, func.returnType, `${fnName} return`);
      }
      
      state.variables = savedVars;
      return result;
    }

    error(`Undefined function: ${fnName}`, node);
  }

  // ── Predict Expression ───────────────────────────
  function execPredictExpr(node) {
    if (!state.model) throw new Error('No model defined.');
    if (!state.trained) throw new Error('Model not trained. Add "train" section first.');

    function normalize(val, min, max) {
      if (max === min) return 0.5;
      return (val - min) / (max - min);
    }

    function denormalize(val, min, max) {
      return val * (max - min) + min;
    }

    const { inputMin, inputMax, outputMin, outputMax } = state.normalization;
    const input = exec(node.input);
    const normalizedInput = Array.isArray(input) 
      ? input.map(v => normalize(v, inputMin, inputMax))
      : [normalize(input, inputMin, inputMax)];
    const normalizedOutput = state.model.predict(normalizedInput);
    const output = normalizedOutput.map(v => denormalize(v, outputMin, outputMax));
    return output.length === 1 ? output[0] : output;
  }

  // ── Import ───────────────────────────────────────
  function execImport(node) {
    const filePath = path.resolve(node.path);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Module not found: ${node.path}`);
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    const { tokenize } = require('./lexer');
    const { parse } = require('./parser');

    const tokens = tokenize(source);
    const ast = parse(tokens);

    // Create a sub-interpreter for the module
    const moduleState = {
      data: null,
      model: null,
      modelConfig: null,
      trained: false,
      trainResult: null,
      results: [],
      output: [],
      variables: {},
      functions: {},
      exports: {},
    };

    // Execute the module
    function execModule(stmt) {
      switch (stmt.type) {
        case 'Let': {
          const value = execExpr(stmt.value);
          moduleState.variables[stmt.name] = value;
          break;
        }
        case 'Function': {
          moduleState.functions[stmt.name] = stmt;
          break;
        }
        case 'Export': {
          if (stmt.names) {
            for (const name of stmt.names) {
              if (name in moduleState.functions) {
                moduleState.exports[name] = moduleState.functions[name];
              } else if (name in moduleState.variables) {
                moduleState.exports[name] = moduleState.variables[name];
              }
            }
          }
          if (stmt.declarations) {
            for (const decl of stmt.declarations) {
              execModule(decl);
              if (decl.type === 'Function') {
                moduleState.exports[decl.name] = moduleState.functions[decl.name];
              } else if (decl.type === 'Let') {
                moduleState.exports[decl.name] = moduleState.variables[decl.name];
              }
            }
          }
          break;
        }
      }
    }

    function execExpr(expr) {
      switch (expr.type) {
        case 'Number': return expr.value;
        case 'String': return expr.value;
        case 'Boolean': return expr.value;
        case 'Identifier': {
          if (expr.name in moduleState.variables) return moduleState.variables[expr.name];
          if (expr.name in moduleState.functions) return moduleState.functions[expr.name];
          throw new Error(`Undefined: ${expr.name}`);
        }
        case 'BinaryOp': {
          const left = execExpr(expr.left);
          const right = execExpr(expr.right);
          switch (expr.op) {
            case 'PLUS': return left + right;
            case 'MINUS': return left - right;
            case 'STAR': return left * right;
            case 'SLASH': return left / right;
            case 'EQEQ': return left === right;
            case 'NEQ': return left !== right;
            case 'LT': return left < right;
            case 'GT': return left > right;
            case 'LTE': return left <= right;
            case 'GTE': return left >= right;
          }
        }
        case 'Call': {
          const func = moduleState.functions[expr.name];
          if (!func) throw new Error(`Undefined function: ${expr.name}`);
          const savedVars = { ...moduleState.variables };
          func.params.forEach((param, i) => {
            moduleState.variables[param] = execExpr(expr.args[i]);
          });
          let result = null;
          for (const s of func.body) {
            if (s.type === 'Return') {
              result = execExpr(s.value);
              break;
            }
            execModule(s);
          }
          moduleState.variables = savedVars;
          return result;
        }
      }
    }

    // Execute all statements
    for (const stmt of ast.body) {
      execModule(stmt);
    }

    // Import specific names or all exports
    if (node.names) {
      for (const { name, alias } of node.names) {
        const importName = alias || name;
        if (!(name in moduleState.exports)) {
          throw new Error(`Export '${name}' not found in ${node.path}`);
        }
        const value = moduleState.exports[name];
        state.variables[importName] = value;
        // If it's a function, also add to functions for calling
        if (typeof value === 'object' && value.type === 'Function') {
          state.functions[importName] = value;
        }
      }
    } else {
      // Import all exports
      for (const [name, value] of Object.entries(moduleState.exports)) {
        state.variables[name] = value;
        // If it's a function, also add to functions for calling
        if (typeof value === 'object' && value.type === 'Function') {
          state.functions[name] = value;
        }
      }
    }

    state.output.push(`Imported from ${node.path}`);
  }

  // ── Export ───────────────────────────────────────
  function execExport(node) {
    if (node.names) {
      for (const name of node.names) {
        if (name in state.functions) {
          state.exports = state.exports || {};
          state.exports[name] = state.functions[name];
        } else if (name in state.variables) {
          state.exports = state.exports || {};
          state.exports[name] = state.variables[name];
        }
      }
    }
    if (node.declarations) {
      for (const decl of node.declarations) {
        exec(decl);
        if (decl.type === 'Function') {
          state.exports = state.exports || {};
          state.exports[decl.name] = state.functions[decl.name];
        } else if (decl.type === 'Let') {
          state.exports = state.exports || {};
          state.exports[decl.name] = state.variables[decl.name];
        }
      }
    }
  }

  // ── Save Model ───────────────────────────────────
  function execSave(node) {
    if (!state.model) {
      throw new Error('No model to save. Create a model first with "model simple" or "model sequential".');
    }
    
    const modelData = {
      layers: state.model.layers,
      activation: state.model.activation,
      learningRate: state.model.learningRate,
      dropout: state.model.dropout,
      weights: state.model.weights,
      biases: state.model.biases,
      normalization: state.normalization || null
    };
    
    const fs = require('fs');
    const filePath = node.filename.endsWith('.json') ? node.filename : node.filename + '.json';
    fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
    state.output.push(`Model saved to ${filePath}`);
  }

  // ── Load Model ───────────────────────────────────
  function execLoad(node) {
    const fs = require('fs');
    const filePath = node.filename.endsWith('.json') ? node.filename : node.filename + '.json';
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Model file not found: ${filePath}`);
    }
    
    const modelData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const { NeuralNetwork } = require('./nn');
    state.model = new NeuralNetwork({
      layers: modelData.layers,
      activation: modelData.activation,
      learningRate: modelData.learningRate,
      dropout: modelData.dropout
    });
    
    state.model.weights = modelData.weights;
    state.model.biases = modelData.biases;
    state.trained = true;
    
    if (modelData.normalization) {
      state.normalization = modelData.normalization;
    }
    
    state.output.push(`Model loaded from ${filePath}`);
  }

  // ── Data Points ──────────────────────────────────
  function execDataPoints(node) {
    state.data = {
      type: 'points',
      points: node.points,
      inputs: node.points.map(p => p[0]),
      outputs: node.points.map(p => p[1]),
    };
    state.output.push(`Data loaded: ${node.points.length} points`);
  }

  // ── Data CSV ─────────────────────────────────────
  function execDataCSV(node) {
    const filePath = path.resolve(node.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file not found: ${node.filename}`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(node.filename).toLowerCase();

    // Try JSON first
    if (ext === '.json') {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          if (data.length > 0) {
            const keys = Object.keys(data[0]);
            state.data = new DataFrame({
              type: 'csv',
              filename: node.filename,
              inputs: data.map(d => keys.slice(0, -1).map(k => d[k])),
              outputs: data.map(d => d[keys[keys.length - 1]]),
              keys,
              raw: data,
            });
          }
        } else if (data.inputs && data.outputs) {
          state.data = new DataFrame({
            type: 'csv',
            filename: node.filename,
            inputs: data.inputs,
            outputs: data.outputs,
            raw: data,
          });
        }
        state.output.push(`Data loaded from ${node.filename}: ${state.data.inputs.length} samples`);
        return;
      } catch (e) {
        // Not valid JSON, try CSV
      }
    }

    // Parse CSV
    const lines = raw.trim().split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => {
        const trimmed = v.trim().replace(/"/g, '');
        const num = Number(trimmed);
        return isNaN(num) ? trimmed : num;
      });
      if (values.length === header.length) {
        rows.push(values);
      }
    }

    // Use last column as output (label), rest as inputs (features)
    state.data = new DataFrame({
      type: 'csv',
      filename: node.filename,
      inputs: rows.map(r => r.slice(0, -1)),
      outputs: rows.map(r => r[r.length - 1]),
      keys: header,
      raw: rows.map(r => {
        const obj = {};
        header.forEach((h, i) => obj[h] = r[i]);
        return obj;
      }),
    });

    state.output.push(`Data loaded from ${node.filename}: ${rows.length} samples, ${header.length} columns`);
  }

  // ── Parse CSV helper ─────────────────────────────
  function parseCSV(raw) {
    const lines = raw.trim().split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    if (lines.length < 2) return null;

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => {
        const trimmed = v.trim().replace(/"/g, '');
        const num = Number(trimmed);
        return isNaN(num) ? trimmed : num;
      });
      if (values.length === header.length) {
        rows.push(values);
      }
    }

    return { header, rows };
  }

  // ── Model Declaration ────────────────────────────
  function execModelDecl(node) {
    if (node.modelType === 'simple') {
      state.model = new NeuralNetwork({ layers: [1] });
      state.output.push(`Model created: simple (linear)`);
    } else if (node.modelType === 'sequential') {
      const hiddenLayers = [];
      let dropoutRate = 0;
      for (const layer of node.layers) {
        if (layer.type === 'DenseLayer') {
          hiddenLayers.push(layer.units);
        } else if (layer.type === 'DropoutLayer') {
          dropoutRate = layer.rate;
        }
      }
      state.model = new NeuralNetwork({ 
        layers: hiddenLayers.length > 0 ? hiddenLayers : [3],
        dropout: dropoutRate
      });
      const layerInfo = hiddenLayers.join(', ');
      const dropoutInfo = dropoutRate > 0 ? `, dropout: ${dropoutRate}` : '';
      state.output.push(`Model created: sequential [${layerInfo}${dropoutInfo}]`);
    }
    state.modelConfig = node;
  }

  // ── Training ─────────────────────────────────────
  function execTrain(node) {
    if (!state.model) throw new Error('No model defined. Add "model simple" or "model sequential" first.');
    if (!state.data) throw new Error('No data loaded. Add "data points" or "data csv" first.');

    // Normalize data for better training
    const allInputs = state.data.inputs.flat();
    const allOutputs = state.data.outputs.flat();
    const inputMin = Math.min(...allInputs);
    const inputMax = Math.max(...allInputs);
    const outputMin = Math.min(...allOutputs);
    const outputMax = Math.max(...allOutputs);

    state.normalization = { inputMin, inputMax, outputMin, outputMax };

    function normalize(val, min, max) {
      if (max === min) return 0.5;
      return (val - min) / (max - min);
    }

    function denormalize(val, min, max) {
      return val * (max - min) + min;
    }

    // Convert data to training format (normalized)
    const trainingData = state.data.inputs.map((input, i) => ({
      input: Array.isArray(input)
        ? input.map(v => normalize(v, inputMin, inputMax))
        : [normalize(input, inputMin, inputMax)],
      output: Array.isArray(state.data.outputs[i])
        ? state.data.outputs[i].map(v => normalize(v, outputMin, outputMax))
        : [normalize(state.data.outputs[i], outputMin, outputMax)],
    }));

    state.output.push(`Training for ${node.epochs} epochs...`);

    const result = state.model.train(trainingData, node.epochs);

    state.trained = true;
    state.trainResult = result;
    state.output.push(`Training complete! Error: ${result.error.toFixed(6)}`);

    // ── Smart Debug: Check Training Health ──────────────
    const warnings = checkTrainingHealth(result, state);
    if (warnings.length > 0) {
      state.output.push('');
      warnings.forEach(w => {
        state.output.push(`⚠️  ${w.title}`);
        state.output.push(`    ${w.message}`);
        if (w.fix) {
          state.output.push(`    Fix: ${w.fix}`);
        }
        state.output.push('');
      });
    }
  }

  // ── Smart Debug: Training Health Check ───────────────
  function checkTrainingHealth(result, state) {
    const warnings = [];
    const error = result.error;
    const history = result.history || [];

    // Check for NaN loss
    if (isNaN(error) || !isFinite(error)) {
      warnings.push({
        title: 'NaN Loss Detected',
        message: 'Your training loss became NaN (Not a Number). This usually means the learning rate is too high or data is not normalized.',
        fix: 'Try reducing the learning rate or normalizing your data with normalize_array().'
      });
      return warnings; // Don't check further if NaN
    }

    // Check for exploding loss (loss increased dramatically)
    if (history.length > 10) {
      const first5 = history.slice(0, 5);
      const last5 = history.slice(-5);
      const avgFirst = first5.reduce((a, b) => a + b, 0) / 5;
      const avgLast = last5.reduce((a, b) => a + b, 0) / 5;
      
      if (avgLast > avgFirst * 5) {
        warnings.push({
          title: 'Exploding Loss',
          message: `Loss is increasing (${avgFirst.toFixed(4)} → ${avgLast.toFixed(4)}) instead of decreasing. This usually means the learning rate is too high.`,
          fix: 'Try reducing the learning rate by 10x.'
        });
      }
    }

    // Check for stuck loss (barely changing)
    if (history.length >= state.epochs * 0.5) {
      const last10 = history.slice(-10);
      const variance = last10.reduce((a, b) => a + Math.abs(b - last10[0]), 0) / 10;
      
      if (variance < 0.0001 && error > 0.1) {
        warnings.push({
          title: 'Stuck Loss',
          message: `Loss is barely changing (${error.toFixed(6)}) and still high. The model might be too simple or the learning rate too low.`,
          fix: 'Try increasing the learning rate or making the model more complex.'
        });
      }
    }

    // Check for possible overfitting (very low error, tiny dataset)
    if (error < 0.01 && state.data.inputs.length < 10) {
      warnings.push({
        title: 'Possible Overfitting',
        message: `Training error is very low (${error.toFixed(6)}) but dataset is tiny (${state.data.inputs.length} points). The model may have memorized the data.`,
        fix: 'Try reducing model complexity, reducing epochs, or adding more data points.'
      });
    }

    // Check for very high error (might be wrong model/data)
    if (error > 10 && state.epochs >= 100) {
      warnings.push({
        title: 'High Training Error',
        message: `Training error is still high (${error.toFixed(2)}) after ${state.epochs} epochs. The model may not have enough capacity or data may need normalization.`,
        fix: 'Try normalizing data, adding more layers, or increasing epochs.'
      });
    }

    return warnings;
  }

  // ── Prediction ───────────────────────────────────
  function execPredict(node) {
    if (!state.model) throw new Error('No model defined.');
    if (!state.trained) throw new Error('Model not trained. Add "train" section first.');

    function normalize(val, min, max) {
      if (max === min) return 0.5;
      return (val - min) / (max - min);
    }

    function denormalize(val, min, max) {
      return val * (max - min) + min;
    }

    const { inputMin, inputMax, outputMin, outputMax } = state.normalization;

    // Normalize input
    const input = Array.isArray(node.input) ? node.input : [node.input];
    const normalizedInput = input.map(v => normalize(v, inputMin, inputMax));

    // Predict
    const normalizedOutput = state.model.predict(normalizedInput);

    // Denormalize output
    const output = normalizedOutput.map(v => denormalize(v, outputMin, outputMax));

    state.results.push({ input: node.input, prediction: output });
    state.output.push(`Prediction for ${JSON.stringify(node.input)}: ${output.map(v => v.toFixed(4)).join(', ')}`);
  }

  // ── Show ─────────────────────────────────────────
  function execShow(node) {
    switch (node.what) {
      case 'data':
        if (state.data) {
          state.output.push(`Data: ${state.data.inputs.length} samples`);
          if (state.data.type === 'csv') state.output.push(`Source: ${state.data.filename}`);
        } else {
          state.output.push('No data loaded.');
        }
        break;

      case 'model':
        if (state.model) {
          state.output.push(`Model: ${state.modelConfig.modelType}`);
          if (state.modelConfig.modelType === 'sequential') {
            const layers = state.modelConfig.layers.map(l =>
              l.type === 'DenseLayer' ? `dense(${l.units}, ${l.activation})` : `dropout(${l.rate})`
            );
            state.output.push(`Layers: ${layers.join(' → ')}`);
          }
        } else {
          state.output.push('No model defined.');
        }
        break;

      case 'results':
        if (state.results.length > 0) {
          state.output.push('Predictions:');
          state.results.forEach(r => {
            state.output.push(`  ${JSON.stringify(r.input)} → [${r.prediction.map(v => v.toFixed(4)).join(', ')}]`);
          });
        } else {
          state.output.push('No predictions made yet.');
        }
        break;

      case 'accuracy':
        if (state.trainResult) {
          state.output.push(`Training error: ${state.trainResult.error.toFixed(6)}`);
          state.output.push(`Iterations: ${state.trainResult.iterations}`);
        }
        break;

      case 'loss':
        if (state.trainResult) {
          state.output.push(`Final loss: ${state.trainResult.error.toFixed(6)}`);
        }
        break;
    }
  }

  exec(ast);
  return state.output;
}

module.exports = { interpret };
