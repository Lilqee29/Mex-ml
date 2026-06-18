// ═══════════════════════════════════════════════════════
//  MEX NEURAL NETWORK — From scratch, no dependencies
// ═══════════════════════════════════════════════════════

const acts = {
  relu:    {fn: x => Math.max(0, x),          der: x => x > 0 ? 1 : 0},
  sigmoid: {fn: x => 1 / (1 + Math.exp(-x)), der: x => x * (1 - x)},
  tanh:    {fn: x => Math.tanh(x),            der: x => 1 - x * x},
  linear:  {fn: x => x,                       der: () => 1},
};

class NeuralNetwork {
  constructor(config = {}) {
    this.layers = config.layers || [1];
    this.activation = config.activation || 'sigmoid';
    this.learningRate = config.learningRate || 0.1;
    this.dropout = config.dropout || 0;
    this.weights = [];
    this.biases = [];
  }

  init(inputSize) {
    this.weights = [];
    this.biases = [];
    let prev = inputSize;
    for (const size of this.layers) {
      const w = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < prev; j++) row.push((Math.random() - 0.5) * 2);
        w.push(row);
      }
      this.weights.push(w);
      this.biases.push(new Array(size).fill(0));
      prev = size;
    }
  }

  applyDropout(act, rate, training) {
    if (!training || rate === 0) return act;
    return act.map(a => Math.random() > rate ? a / (1 - rate) : 0);
  }

  forward(input, training = false) {
    let cur = Array.isArray(input) ? input : [input];
    const layerActs = [cur];
    for (let l = 0; l < this.weights.length; l++) {
      const next = [];
      for (let i = 0; i < this.weights[l].length; i++) {
        let sum = this.biases[l][i];
        for (let j = 0; j < cur.length; j++) sum += this.weights[l][i][j] * cur[j];
        if (l === this.weights.length - 1 && this.layers[l] > 1) next.push(sum);
        else next.push(acts[this.activation].fn(sum));
      }
      if (l === this.weights.length - 1 && this.layers[l] > 1) {
        const mx = Math.max(...next);
        const ex = next.map(x => Math.exp(x - mx));
        const s = ex.reduce((a, b) => a + b, 0);
        cur = ex.map(e => e / s);
      } else {
        cur = l < this.weights.length - 1 ? this.applyDropout(next, this.dropout, training) : next;
      }
      layerActs.push(cur);
    }
    return {output: cur, activations: layerActs};
  }

  trainSample(input, target) {
    const {output, activations: la} = this.forward(input, true);
    const tgt = Array.isArray(target) ? target : [target];
    let errors = output.map((o, i) => tgt[i] - o);
    for (let l = this.weights.length - 1; l >= 0; l--) {
      const prev = la[l];
      const deltas = [];
      for (let i = 0; i < this.weights[l].length; i++) {
        let delta;
        if (l === this.weights.length - 1 && this.layers[l] > 1) delta = errors[i];
        else delta = errors[i] * acts[this.activation].der(la[l + 1][i]);
        deltas.push(delta);
        for (let j = 0; j < this.weights[l][i].length; j++)
          this.weights[l][i][j] += this.learningRate * delta * prev[j];
        this.biases[l][i] += this.learningRate * delta;
      }
      if (l > 0) {
        errors = new Array(this.weights[l - 1].length).fill(0);
        for (let i = 0; i < this.weights[l].length; i++)
          for (let j = 0; j < this.weights[l][i].length; j++)
            errors[j] += deltas[i] * this.weights[l][i][j];
      }
    }
    return output;
  }

  train(data, epochs = 100) {
    if (data.length === 0) return {error: 0, iterations: 0};
    const inputSize = Array.isArray(data[0].input) ? data[0].input.length : 1;
    this.init(inputSize);
    let lastError = Infinity;
    for (let ep = 0; ep < epochs; ep++) {
      let totalError = 0;
      for (const s of data) {
        const inp = Array.isArray(s.input) ? s.input : [s.input];
        const tgt = Array.isArray(s.output) ? s.output : [s.output];
        const out = this.trainSample(inp, tgt);
        for (let i = 0; i < out.length; i++) totalError += Math.pow(tgt[i] - out[i], 2);
      }
      lastError = totalError / data.length;
    }
    return {error: lastError, iterations: epochs};
  }

  predict(input) {
    return this.forward(input, false).output;
  }
}
