// ═══════════════════════════════════════════════════════
//  MEX INTERPRETER — Executes AST nodes
// ═══════════════════════════════════════════════════════

function interpret(ast) {
  const S = {vars:{}, fns:{}, data:null, model:null, trained:false, output:[], norm:null};

  // ── Built-in Functions ───────────────────────────
  const B = {
    // Math
    abs: x => Math.abs(x),
    sqrt: x => Math.sqrt(x),
    pow: (x, y) => Math.pow(x, y),
    floor: x => Math.floor(x),
    ceil: x => Math.ceil(x),
    round: x => Math.round(x),
    random: () => Math.random(),
    log: x => Math.log(x),
    exp: x => Math.exp(x),
    min: a => Math.min(...(Array.isArray(a) ? a : [a])),
    max: a => Math.max(...(Array.isArray(a) ? a : [a])),
    sum: a => a.reduce((x, y) => x + y, 0),

    // Array
    len: a => a.length,
    sort: a => [...a].sort((x, y) => x - y),
    reverse: a => [...a].reverse(),
    unique: a => [...new Set(a)],
    concat: (a, b) => [...a, ...b],
    append: (a, v) => { a.push(v); return a; },

    // Higher-order (handled specially in Call)
    map: null,
    filter: null,
    reduce: null,

    // Stats
    mean: a => a.reduce((x, y) => x + y, 0) / a.length,
    normalize: a => {
      const mn = Math.min(...a), mx = Math.max(...a), r = mx - mn || 1;
      return a.map(v => (v - mn) / r);
    },

    // ML
    sigmoid: x => 1 / (1 + Math.exp(-x)),
    relu: x => Math.max(0, x),
    tanh: x => Math.tanh(x),

    // Range
    range: (start, end) => {
      if (end === undefined) { end = start; start = 0; }
      return Array.from({length: end - start}, (_, i) => start + i);
    },
  };

  // ── Execute node ─────────────────────────────────
  function ex(n) {
    if (!n) return null;
    switch (n.type) {
      case 'Program':
        for (const s of n.body) ex(s);
        return S.output;

      case 'Let':
        S.vars[n.name] = ex(n.value);
        break;

      case 'Assign':
        S.vars[n.name] = ex(n.value);
        break;

      case 'ArrayAssign':
        if (!(n.name in S.vars)) throw new Error(n.name + ' not defined');
        S.vars[n.name][ex(n.index)] = ex(n.value);
        break;

      case 'Print': {
        const v = ex(n.arg);
        const str = typeof v === 'number'
          ? (Number.isInteger(v) ? String(v) : v.toFixed(6))
          : String(v);
        S.output.push(str);
        break;
      }

      case 'If':
        if (ex(n.condition)) { for (const s of n.body) ex(s); }
        else if (n.elseBody) { for (const s of n.elseBody) ex(s); }
        break;

      case 'For': {
        let iterable;
        if (n.iterable.type === 'Range') {
          iterable = B.range(ex(n.iterable.start), ex(n.iterable.end));
        } else {
          iterable = ex(n.iterable);
        }
        if (Array.isArray(iterable)) {
          for (const item of iterable) {
            S.vars[n.name] = item;
            for (const s of n.body) ex(s);
          }
        }
        break;
      }

      case 'While':
        while (ex(n.condition)) { for (const s of n.body) ex(s); }
        break;

      case 'Function':
        S.fns[n.name] = n;
        break;

      case 'Return':
        throw {type:'RS', value:ex(n.value)};

      case 'DataPoints':
        S.data = {
          type: 'pts',
          inputs: n.points.map(p => ex(p.input)),
          outputs: n.points.map(p => ex(p.output))
        };
        S.output.push('Data loaded: ' + n.points.length + ' points');
        break;

      case 'DataCSV':
        S.output.push('CSV: use "data points" for inline data in playground');
        break;

      case 'ModelDecl': {
        const ls = n.layers.filter(l => l.type === 'dense').map(l => l.units);
        const act = n.layers.find(l => l.type === 'dense');
        const dr = n.layers.find(l => l.type === 'dropout');
        S.model = new NeuralNetwork({
          layers: ls,
          activation: act ? act.activation : 'sigmoid',
          dropout: dr ? dr.rate : 0,
        });
        S.output.push('Model created: ' + n.arch + ' (' + ls.join('-') + ')');
        break;
      }

      case 'TrainSection': {
        if (!S.model) throw new Error('No model defined');
        if (!S.data) throw new Error('No data loaded');
        const d = S.data.inputs.map((inp, i) => ({input: inp, output: S.data.outputs[i]}));
        S.output.push('Training for ' + n.epochs + ' epochs...');
        const r = S.model.train(d, n.epochs);
        S.trained = true;
        S.output.push('Training complete! Error: ' + r.error.toFixed(6));
        break;
      }

      case 'ShowResults': {
        if (!S.data) { S.output.push('No data loaded.'); break; }
        for (let i = 0; i < S.data.inputs.length; i++) {
          const inp = S.data.inputs[i];
          const pred = S.model ? S.model.predict(Array.isArray(inp) ? inp : [inp]) : [0];
          S.output.push('Input: ' + JSON.stringify(inp) + ' -> Predicted: ' + pred[0].toFixed(4) + ' | Actual: ' + S.data.outputs[i]);
        }
        break;
      }

      case 'ShowAccuracy':
        S.output.push('Use show results for predictions');
        break;

      case 'ShowLoss':
        S.output.push('Final loss available after training');
        break;

      // ── Values ──────────────────────────────────
      case 'Number': case 'String': case 'Boolean':
        return n.value;

      case 'Identifier':
        if (n.name in S.vars) return S.vars[n.name];
        if (n.name in B) return B[n.name];
        throw new Error('Undefined: ' + n.name);

      case 'ArrayAccess': {
        const arr = n.name in S.vars ? S.vars[n.name] : ex(n.name);
        if (!Array.isArray(arr)) throw new Error('Cannot index non-array');
        return arr[ex(n.index)];
      }

      case 'ArrayLiteral':
        return n.elements.map(e => ex(e));

      case 'ObjectLiteral': {
        const obj = {};
        for (const p of n.properties) obj[p.key] = ex(p.value);
        return obj;
      }

      case 'ObjectAccess': {
        const obj = n.object in S.vars ? S.vars[n.object] : ex(n.object);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Not an object');
        return obj[n.property];
      }

      case 'MethodCall': {
        const obj = n.object in S.vars ? S.vars[n.object] : ex(n.object);
        const args = n.args.map(a => ex(a));
        if (Array.isArray(obj)) {
          switch (n.method) {
            case 'length': return obj.length;
            case 'push': obj.push(...args); return obj;
            case 'pop': return obj.pop();
            case 'shift': return obj.shift();
            case 'unshift': obj.unshift(...args); return obj;
            case 'slice': return obj.slice(args[0], args[1]);
            case 'indexOf': return obj.indexOf(args[0]);
            case 'includes': return obj.includes(args[0]);
            case 'join': return obj.join(args[0] || ',');
            case 'reverse': return obj.reverse();
            case 'sort': return obj.sort((a,b) => a - b);
            default: throw new Error('Unknown array method: ' + n.method);
          }
        }
        if (typeof obj === 'string') {
          switch (n.method) {
            case 'length': return obj.length;
            case 'toUpperCase': return obj.toUpperCase();
            case 'toLowerCase': return obj.toLowerCase();
            case 'trim': return obj.trim();
            case 'charAt': return obj.charAt(args[0]);
            case 'substring': return obj.substring(args[0], args[1]);
            case 'indexOf': return obj.indexOf(args[0]);
            case 'includes': return obj.includes(args[0]);
            case 'replace': return obj.replace(args[0], args[1]);
            case 'split': return obj.split(args[0] || ',');
            case 'startsWith': return obj.startsWith(args[0]);
            case 'endsWith': return obj.endsWith(args[0]);
            default: throw new Error('Unknown string method: ' + n.method);
          }
        }
        if (typeof obj === 'object') {
          switch (n.method) {
            case 'keys': return Object.keys(obj);
            case 'values': return Object.values(obj);
            case 'entries': return Object.entries(obj);
            case 'has': return args[0] in obj;
            case 'get': return obj[args[0]];
            case 'set': obj[args[0]] = args[1]; return obj;
            default: throw new Error('Unknown object method: ' + n.method);
          }
        }
        throw new Error('Cannot call method on this type');
      }

      case 'BinOp': {
        const l = ex(n.left), r = ex(n.right);
        switch (n.op) {
          case 'PLUS': return l + r;
          case 'MINUS': return l - r;
          case 'STAR': return l * r;
          case 'SLASH': return l / r;
          case 'PERCENT': return l % r;
          case 'EQEQ': return l === r;
          case 'NEQ': return l !== r;
          case 'LT': return l < r;
          case 'GT': return l > r;
          case 'LTE': return l <= r;
          case 'GTE': return l >= r;
          case 'AND': return l && r;
          case 'OR': return l || r;
        }
      }

      case 'UnaryOp': {
        const v = ex(n.operand);
        return n.op === '-' ? -v : !v;
      }

      case 'Call': {
        // Handle higher-order functions (map/filter/reduce with fn callback)
        if (n.name === 'map' || n.name === 'filter' || n.name === 'reduce') {
          const arr = ex(n.args[0]);
          const fnNode = n.args[1]; // Keep as AST node
          const initVal = n.args[2] ? ex(n.args[2]) : undefined;

          if (n.name === 'map') {
            return arr.map(item => callMEXFn(fnNode, [item]));
          }
          if (n.name === 'filter') {
            return arr.filter(item => callMEXFn(fnNode, [item]));
          }
          if (n.name === 'reduce') {
            let acc = initVal !== undefined ? initVal : arr[0];
            const start = initVal !== undefined ? 0 : 1;
            for (let i = start; i < arr.length; i++) {
              acc = callMEXFn(fnNode, [acc, arr[i]]);
            }
            return acc;
          }
        }

        // Regular function call
        if (n.name in B && typeof B[n.name] === 'function') {
          return B[n.name](...n.args.map(a => ex(a)));
        }

        // User-defined function
        if (n.name in S.fns) {
          return callMEXFn(S.fns[n.name], n.args.map(a => ex(a)));
        }

        throw new Error('Undefined function: ' + n.name);
      }

      case 'PredictExpr': {
        if (!S.model) throw new Error('No model');
        if (!S.trained) throw new Error('Model not trained');
        const i = ex(n.input);
        const r = S.model.predict(Array.isArray(i) ? i : [i]);
        return r.length === 1 ? r[0] : r;
      }

      default:
        throw new Error('Unknown: ' + n.type);
    }
    return null;
  }

  // ── Call a MEX function (handles return) ─────────
  function callMEXFn(fnNode, args) {
    if (fnNode.type === 'Function') {
      const savedKeys = Object.keys(S.vars);
      const savedVals = savedKeys.map(k => S.vars[k]);
      fnNode.params.forEach((p, i) => S.vars[p] = args[i]);
      let result = null;
      try { for (const s of fnNode.body) ex(s); }
      catch (e) { if (e.type === 'RS') result = e.value; else throw e; }
      // Restore in place
      for (const k of Object.keys(S.vars)) delete S.vars[k];
      savedKeys.forEach((k, i) => S.vars[k] = savedVals[i]);
      return result;
    }
    throw new Error('Not a function');
  }

  ex(ast);
  return S.output;
}
