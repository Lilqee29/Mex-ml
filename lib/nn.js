// ═══════════════════════════════════════════════════════
//  MEX ML ENGINE — Minimal Neural Network (no dependencies)
//  This IS the learning tool — users see how ML actually works
// ═══════════════════════════════════════════════════════

// ── Activation Functions ───────────────────────────
const activations = {
  relu:      { fn: x => Math.max(0, x),         der: x => x > 0 ? 1 : 0 },
  sigmoid:   { fn: x => 1 / (1 + Math.exp(-x)), der: x => x * (1 - x) },
  tanh:      { fn: x => Math.tanh(x),            der: x => 1 - x * x },
  linear:    { fn: x => x,                       der: () => 1 },
  softmax:   { fn: null, der: null }, // handled separately
};

// ── Simple Neural Network ──────────────────────────
class NeuralNetwork {
  constructor(config = {}) {
    this.layers = config.layers || [1];
    this.activation = config.activation || 'sigmoid';
    this.learningRate = config.learningRate || 0.1;
    this.dropout = config.dropout || 0; // Dropout rate (0 = no dropout)
    this.weights = [];
    this.biases = [];
  }

  // Initialize weights and biases
  init(inputSize) {
    this.weights = [];
    this.biases = [];

    let prevSize = inputSize;
    for (const size of this.layers) {
      const w = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < prevSize; j++) {
          row.push((Math.random() - 0.5) * 2);
        }
        w.push(row);
      }
      this.weights.push(w);
      this.biases.push(new Array(size).fill(0));
      prevSize = size;
    }
  }

  // Apply dropout (randomly zero out neurons)
  applyDropout(activations, rate, isTraining) {
    if (!isTraining || rate === 0) return activations;
    
    const mask = activations.map(() => Math.random() > rate ? 1 : 0);
    const scaled = activations.map((a, i) => a * mask[i] / (1 - rate));
    return scaled;
  }

  // Forward pass
  forward(input, isTraining = false) {
    let current = Array.isArray(input) ? input : [input];
    const layerActivations = [current];

    for (let l = 0; l < this.weights.length; l++) {
      const next = [];
      for (let i = 0; i < this.weights[l].length; i++) {
        let sum = this.biases[l][i];
        for (let j = 0; j < current.length; j++) {
          sum += this.weights[l][i][j] * current[j];
        }
        // Apply activation (except for softmax layer)
        if (l === this.weights.length - 1 && this.layers[l] > 1) {
          next.push(sum); // raw logits for softmax
        } else {
          next.push(activations[this.activation].fn(sum));
        }
      }

      // Apply softmax for multi-output classification
      if (l === this.weights.length - 1 && this.layers[l] > 1) {
        const max = Math.max(...next);
        const exps = next.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        current = exps.map(e => e / sum);
      } else {
        // Apply dropout (not on output layer)
        if (l < this.weights.length - 1) {
          current = this.applyDropout(next, this.dropout, isTraining);
        } else {
          current = next;
        }
      }
      layerActivations.push(current);
    }

    return { output: current, activations: layerActivations };
  }

  // Train on a single sample
  trainSample(input, target) {
    const { output, activations: layerActivations } = this.forward(input, true); // isTraining = true
    const targetArr = Array.isArray(target) ? target : [target];

    // Calculate output error
    let errors = output.map((o, i) => targetArr[i] - o);

    // Backpropagate
    for (let l = this.weights.length - 1; l >= 0; l--) {
      const prevAct = layerActivations[l];
      const deltas = [];

      for (let i = 0; i < this.weights[l].length; i++) {
        let delta;
        if (l === this.weights.length - 1 && this.layers[l] > 1) {
          // Softmax derivative (simplified)
          delta = errors[i];
        } else {
          delta = errors[i] * activations[this.activation].der(layerActivations[l + 1][i]);
        }
        deltas.push(delta);

        // Update weights
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] += this.learningRate * delta * prevAct[j];
        }
        // Update bias
        this.biases[l][i] += this.learningRate * delta;
      }

      // Calculate error for previous layer
      if (l > 0) {
        errors = new Array(this.weights[l - 1].length).fill(0);
        for (let i = 0; i < this.weights[l].length; i++) {
          for (let j = 0; j < this.weights[l][i].length; j++) {
            errors[j] += deltas[i] * this.weights[l][i][j];
          }
        }
      }
    }

    return output;
  }

  // Train on dataset
  train(data, epochs = 100) {
    if (data.length === 0) return { error: 0, iterations: 0 };

    // Initialize weights
    const inputSize = Array.isArray(data[0].input) ? data[0].input.length : 1;
    this.init(inputSize);

    let lastError = Infinity;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;

      for (const sample of data) {
        const input = Array.isArray(sample.input) ? sample.input : [sample.input];
        const target = Array.isArray(sample.output) ? sample.output : [sample.output];
        const output = this.trainSample(input, target);

        // Calculate MSE
        for (let i = 0; i < output.length; i++) {
          totalError += Math.pow(target[i] - output[i], 2);
        }
      }

      lastError = totalError / data.length;
    }

    return { error: lastError, iterations: epochs };
  }

  // Predict
  predict(input) {
    const { output } = this.forward(input, false); // isTraining = false
    return output;
  }
}

module.exports = { NeuralNetwork };
