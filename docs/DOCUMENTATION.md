# MEX — Complete Documentation

> A machine learning learning language that teaches ML concepts through simple syntax, then bridges to production TensorFlow.js/Python.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [Language Reference](#language-reference)
5. [ML Engine](#ml-engine)
6. [CLI Commands](#cli-commands)
7. [Smart Debug](#smart-debug)
8. [Pro Mode](#pro-mode)
9. [Learning System](#learning-system)
10. [Practice System](#practice-system)
11. [Code Generation](#code-generation)
12. [Curriculum](#curriculum)
13. [Examples](#examples)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 30-Second Demo

```bash
# Run your first ML model
node mex.js --run "data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
train 100 epochs
predict 5"

# Output:
# Data loaded: 3 points
# Model created: simple (linear)
# Training for 100 epochs...
# Training complete! Error: 0.023456
# Prediction for 5: 9.8765
```

### What Just Happened?

1. **Data**: You gave 3 data points (1→2, 2→4, 3→6)
2. **Model**: Created a simple linear model
3. **Training**: Taught the model to find the pattern
4. **Prediction**: Asked "what comes after 3?" → 9.8765 (close to 10)

---

## Installation

### Requirements
- Node.js 14+ (no external dependencies!)

### Setup
```bash
# Clone or download the_language folder
cd the_language

# Run any .mx file
node mex.js examples/01_data.mx

# Or run inline code
node mex.js --run "print('Hello MEX!')"
```

### Verify Installation
```bash
node mex.js --help
```

---

## Core Concepts

### What is MEX?

MEX = **M**achine learning **EX**periment language

| Purpose | Description |
|---------|-------------|
| **Learn** | Simple syntax that teaches ML concepts |
| **Practice** | Quick templates to build skills |
| **Produce** | Export to TensorFlow.js or Python |

### Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                     MEX LEARNING PATH                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   LEARN              PRACTICE            PRODUCE              │
│   ─────              ────────            ───────              │
│   Simple syntax      Quick templates     Export to Python     │
│   Guided lessons     No restrictions     Export to TF.js      │
│   Progressive unlock Experimentation     Real-world ready     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Zero dependencies** — runs anywhere Node.js runs
2. **Syntax mirrors TensorFlow.js** — skills transfer directly
3. **Gentle learning curve** — start with data points, progress to neural networks
4. **Immediate feedback** — see results instantly
5. **Bridge to production** — convert to Python/TF.js when ready

---

## Language Reference

### Data Types

| Type | Example | Description |
|------|---------|-------------|
| Number | `42`, `3.14` | Floating point |
| String | `"hello"` | Text |
| Boolean | `true`, `false` | Logical |
| Array | `[1, 2, 3]` | Collection |
| Function | `fn(x) { return x }` | Callable |

### Variables

```mex
## Declaration
let x = 10
let name = "MEX"
let data = [1, 2, 3]

## Assignment
x = 20
```

### Control Flow

```mex
## If/Else
if (x > 10) {
  print("big")
} else {
  print("small")
}

## For Loop
for i in range(0, 10) {
  print(i)
}

## While Loop
while (x > 0) {
  x = x - 1
}
```

### Functions

```mex
## Named function
fn add(a, b) {
  return a + b
}

## Anonymous function (for callbacks)
fn(x) { return x * 2 }

## Usage
let result = add(3, 4)
let doubled = map([1, 2, 3], fn(x) { return x * 2 })
```

### Arrays

```mex
## Creation
let nums = [1, 2, 3, 4, 5]

## Operations
print(sort(nums))           ## [1, 2, 3, 4, 5]
print(reverse(nums))        ## [5, 4, 3, 2, 1]
print(unique(nums))         ## [1, 2, 3, 4, 5]
print(flatten([[1,2],[3]])) ## [1, 2, 3]
print(len(nums))            ## 5

## Higher-order functions
let evens = filter(nums, fn(x) { return x % 2 == 0 })
let doubled = map(nums, fn(x) { return x * 2 })
let total = reduce(nums, fn(a, b) { return a + b }, 0)
```

### ML-Specific Syntax

```mex
## Data Declaration
data points
  (1, 2)
  (2, 4)
  (3, 6)

data csv "datasets/houses.csv"

## Model Declaration
model simple              ## Linear model
model sequential          ## Neural network

## Layer Declaration
dense <units> <activation>
dense 128 relu
dense 64 sigmoid
dense 1 linear

## Training
train <epochs> epochs
train 200 epochs

## Prediction
predict <input>
predict 5
predict [1, 2, 3]

## Show Results
show results
show accuracy
show loss
show data
```

---

## Built-in Functions (40+)

### Math Functions

| Function | Description | Example |
|----------|-------------|---------|
| `sqrt(x)` | Square root | `sqrt(16)` → `4` |
| `pow(x, y)` | Power | `pow(2, 10)` → `1024` |
| `abs(x)` | Absolute value | `abs(-42)` → `42` |
| `sin(x)` | Sine | `sin(0)` → `0` |
| `cos(x)` | Cosine | `cos(0)` → `1` |
| `tan(x)` | Tangent | `tan(0)` → `0` |
| `log(x)` | Natural log | `log(1)` → `0` |
| `log10(x)` | Base-10 log | `log10(100)` → `2` |
| `exp(x)` | e^x | `exp(0)` → `1` |
| `floor(x)` | Round down | `floor(3.7)` → `3` |
| `ceil(x)` | Round up | `ceil(3.2)` → `4` |
| `round(x)` | Round | `round(3.5)` → `4` |
| `min(a, b)` | Minimum | `min(5, 10)` → `5` |
| `max(a, b)` | Maximum | `max(5, 10)` → `10` |
| `random()` | Random 0-1 | `random()` → `0.732...` |

### Statistics Functions

| Function | Description | Example |
|----------|-------------|---------|
| `mean(arr)` | Average | `mean([1,2,3])` → `2` |
| `sum(arr)` | Total | `sum([1,2,3])` → `6` |
| `std(arr)` | Standard deviation | `std([1,2,3])` → `0.816...` |
| `variance(arr)` | Variance | `variance([1,2,3])` → `0.666...` |
| `median(arr)` | Middle value | `median([1,2,3])` → `2` |
| `mode(arr)` | Most frequent | `mode([1,1,2])` → `1` |
| `range(arr)` | Max - Min | `range([1,5])` → `4` |
| `count(arr)` | Length | `count([1,2,3])` → `3` |

### Array Functions

| Function | Description | Example |
|----------|-------------|---------|
| `sort(arr)` | Sorted array | `sort([3,1,2])` → `[1,2,3]` |
| `reverse(arr)` | Reversed | `reverse([1,2,3])` → `[3,2,1]` |
| `unique(arr)` | Distinct values | `unique([1,1,2])` → `[1,2]` |
| `flatten(arr)` | Flattened | `flatten([[1,2],[3]])` → `[1,2,3]` |
| `head(arr, n)` | First n elements | `head([1,2,3], 2)` → `[1,2]` |
| `tail(arr, n)` | Last n elements | `tail([1,2,3], 2)` → `[2,3]` |
| `zip(a, b)` | Combined | `zip([1,2], [3,4])` → `[[1,3],[2,4]]` |
| `len(arr)` | Length | `len([1,2,3])` → `3` |

### Data Manipulation Functions

| Function | Description | Example |
|----------|-------------|---------|
| `filter(arr, fn)` | Select matching | `filter([1,2,3], fn(x){x>1})` → `[2,3]` |
| `map(arr, fn)` | Transform | `map([1,2,3], fn(x){x*2})` → `[2,4,6]` |
| `reduce(arr, fn, init)` | Accumulate | `reduce([1,2,3], fn(a,b){a+b}, 0)` → `6` |
| `each(arr, fn)` | Iterate | `each([1,2,3], print)` |
| `find(arr, fn)` | First match | `find([1,2,3], fn(x){x>1})` → `2` |
| `every(arr, fn)` | All match? | `every([1,2,3], fn(x){x>0})` → `true` |
| `some(arr, fn)` | Any match? | `some([1,2,3], fn(x){x>2})` → `true` |
| `where(arr, fn)` | Alias for filter | Same as filter |
| `limit(arr, n)` | First n | `limit([1,2,3], 2)` → `[1,2]` |
| `offset(arr, n)` | Skip n | `offset([1,2,3], 1)` → `[2,3]` |
| `sample(arr, n)` | Random n | `sample([1,2,3], 2)` → random 2 |
| `shuffle(arr)` | Shuffled | `shuffle([1,2,3])` → random order |

### Normalization Functions

| Function | Description | Example |
|----------|-------------|---------|
| `normalize(val, min, max)` | Scale to 0-1 | `normalize(5, 0, 10)` → `0.5` |
| `denormalize(val, min, max)` | Original scale | `denormalize(0.5, 0, 10)` → `5` |
| `normalize_array(arr)` | Scale array | `normalize_array([100,200,300])` → `[0,0.5,1]` |
| `denormalize_array(arr, min, max)` | Descale array | Inverse of normalize_array |

### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `upper(str)` | Uppercase | `upper("hello")` → `"HELLO"` |
| `lower(str)` | Lowercase | `lower("HELLO")` → `"hello"` |
| `trim(str)` | Trimmed | `trim("  hi  ")` → `"hi"` |
| `split(str, delim)` | To array | `split("a,b", ",")` → `["a","b"]` |
| `join(arr, delim)` | To string | `join(["a","b"], ",")` → `"a,b"` |
| `replace(str, old, new)` | Replace | `replace("hi", "h", "H")` → `"Hi"` |
| `includes(str, sub)` | Contains? | `includes("hello", "ell")` → `true` |
| `len(str)` | Length | `len("hello")` → `5` |

### Conversion Functions

| Function | Description | Example |
|----------|-------------|---------|
| `to_number(x)` | To number | `to_number("42")` → `42` |
| `to_string(x)` | To string | `to_string(42)` → `"42"` |
| `to_array(x)` | To array | `to_array(42)` → `[42]` |

### Random Functions

| Function | Description | Example |
|----------|-------------|---------|
| `rand_int(min, max)` | Random integer | `rand_int(1, 10)` → `7` |
| `rand_float(min, max)` | Random float | `rand_float(0, 1)` → `0.732...` |
| `rand_choice(arr)` | Random element | `rand_choice([1,2,3])` → `2` |

---

## ML Engine

### Neural Network (nn.js)

**Custom implementation from scratch — zero dependencies.**

#### Architecture

```javascript
class NeuralNetwork {
  constructor(config) {
    this.layers = config.layers || [1];      // Layer sizes
    this.activation = config.activation || 'sigmoid';
    this.learningRate = config.learningRate || 0.1;
    this.weights = [];   // Weight matrices
    this.biases = [];    // Bias vectors
  }
}
```

#### Supported Activations

| Activation | Formula | Derivative | Best For |
|------------|---------|------------|----------|
| sigmoid | `1 / (1 + e^-x)` | `x * (1 - x)` | Output (binary) |
| relu | `max(0, x)` | `x > 0 ? 1 : 0` | Hidden layers |
| tanh | `tanh(x)` | `1 - x^2` | Hidden layers |
| linear | `x` | `1` | Regression output |

#### Model Types

| Type | Description | Use Case |
|------|-------------|----------|
| `model simple` | Single dense layer, 1 unit, linear | Linear regression |
| `model sequential` | Multiple layers, configurable | Complex patterns |

---

## CLI Commands

### Core Commands

```bash
# Run a .mx file
node mex.js <file.mx>

# Run inline code
node mex.js --run "code here"

# Generate TensorFlow.js code
node mex.js --generate <file.mx>

# Generate Python/TensorFlow code
node mex.js --python <file.mx>

# Show TF.js equivalent alongside MEX output
node mex.js --show-tf <file.mx>

# Show compression statistics
node mex.js --stats <file.mx>
```

### Learning Commands

```bash
# Run a lesson
node mex.js lesson <number>

# Run a challenge (scored)
node mex.js challenge <number>

# List all lessons
node mex.js lessons

# Show progress
node mex.js status

# Get a hint
node mex.js hint <lesson>

# Show unlock status
node mex.js unlock

# Show achievements
node mex.js achievements

# Reset all progress
node mex.js reset
```

### Practice Commands

```bash
# List practice topics
node mex.js practice

# Show practice template
node mex.js practice <topic>

# Run practice template
node mex.js --run-practice <topic>

# Show practice history
node mex.js practice-status
```

---

## Smart Debug

### What is Smart Debug?

MEX automatically detects common training problems and explains them in plain language.

### Detected Issues

| Issue | Detection | Message |
|-------|-----------|---------|
| **NaN Loss** | `isNaN(error)` | "Learning rate too high or data not normalized" |
| **Exploding Loss** | Loss increasing 5x | "Learning rate too high" |
| **Stuck Loss** | Low variance, high error | "Model too simple or learning rate too low" |
| **Overfitting** | Low error + tiny dataset | "Model may have memorized data" |
| **High Error** | Error > 10 after 100+ epochs | "Data needs normalization or model too small" |

### Example Output

```bash
$ node mex.js examples/debug_overfit.mx

Data loaded: 3 points
Model created: sequential [64, 32, 1]
Training for 1000 epochs...
Training complete! Error: 0.002494

⚠️  Possible Overfitting
    Training error is very low (0.002494) but dataset is tiny (3 points).
    The model may have memorized the data.
    Fix: Try reducing model complexity, reducing epochs, or adding more data points.

Prediction for 4: 5.9398
```

### How It Works

Smart Debug runs after every training session:
1. Checks for NaN/Infinity in error
2. Analyzes loss history for explosions
3. Detects stuck training
4. Flags possible overfitting
5. Warns about high error

---

## Pro Mode

### Compression Statistics

Every MEX file converts to longer TF.js/Python code. Pro Mode shows this ratio.

```bash
$ node mex.js --stats examples/05_full.mx

  ═══════════════════════════════════════════════
    MEX — Compression Statistics
  ═══════════════════════════════════════════════

    MEX lines:      12
    TF.js lines:    31
    Python lines:   28

    TF.js ratio:    2.6x
    Python ratio:   2.3x

  ═══════════════════════════════════════════════
```

### Compressionist Achievement

Earn the "Compressionist" badge by achieving high compression ratios across challenges.

---

## Learning System

### Progress Tracking

Progress is saved to `progress.json`:

```json
{
  "completedLessons": [1, 2, 3],
  "scores": { "1": 100, "2": 85, "3": 90 },
  "hintsUsed": { "1": 0, "2": 1, "3": 0 },
  "totalHintsUsed": 1,
  "averageScore": 91.67,
  "timestamps": {
    "1": "2026-06-17T20:00:00.000Z",
    "2": "2026-06-17T20:05:00.000Z"
  }
}
```

### Unlock System

- Sequential unlocking: Complete lesson N → unlocks N+1
- Lesson 1 always unlocked
- Progress saved automatically

### Scoring System

- Challenges scored 0-100
- Based on: correctness, efficiency, style
- Average score tracked

### Hint System

- 4 progressive hints per lesson
- Hints get more specific
- Usage tracked

### Achievements (11)

| Badge | Name | Condition |
|-------|------|-----------|
| 🌟 | First Steps | Complete lesson 1 |
| 🚀 | Half Way | Complete 3 lessons |
| 🎓 | ML Graduate | Complete all 6 lessons |
| ⚡ | Challenger | Complete first challenge |
| 🏆 | Challenge Master | Complete all challenges |
| 💪 | Independent | Complete lesson without hints |
| 💯 | Perfect | 100% score on any challenge |
| 🔥 | High Scorer | Average > 80% |
| 📚 | Persistent | Use 10+ hints |
| ⚡ | Speed Learner | Complete 2 lessons in one session |
| 📦 | Compressionist | Achieve 2.5x compression ratio |

---

## Practice System

### Practice Templates

| Topic | Description | What You Practice |
|-------|-------------|-------------------|
| `linear` | Linear regression | Predict continuous values |
| `classify` | Classification | Categorize data |
| `neural` | Neural networks | Build multi-layer models |
| `data` | Data manipulation | Arrays, statistics, filtering |
| `csv` | CSV data | Load and analyze files |

### Practice Tracking

Practice history is saved to `practice.json`:

```json
{
  "sessions": [
    { "topic": "linear", "timestamp": "2026-06-17T20:00:00.000Z" }
  ],
  "topics": {
    "linear": { "count": 5, "lastPracticed": "2026-06-17T20:00:00.000Z" }
  }
}
```

---

## Code Generation

### MEX → TensorFlow.js

```bash
node mex.js --generate file.mx
```

**Output:**
```javascript
const tf = require("@tensorflow/tfjs-node");

// Data
const xs = tf.tensor1d([1, 2, 3, 4, 5]);
const ys = tf.tensor1d([2, 4, 6, 8, 10]);

// Model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

// Train
model.compile({ optimizer: "sgd", loss: "mse" });
await model.fit(xs, ys, { epochs: 100 });

// Predict
const prediction = model.predict(tf.tensor1d([6]));
prediction.print();
```

### MEX → Python/TensorFlow

```bash
node mex.js --python file.mx
```

**Output:**
```python
import tensorflow as tf
import numpy as np

# Data
xs = np.array([1, 2, 3, 4, 5])
ys = np.array([2, 4, 6, 8, 10])

# Model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, input_shape=[1])
])

# Train
model.compile(optimizer='sgd', loss='mse')
model.fit(xs, ys, epochs=100)

# Predict
prediction = model.predict(np.array([[6]]))
print(prediction.numpy())
```

### Library Equivalents

| MEX | Pandas | NumPy | Scikit-learn |
|-----|--------|-------|--------------|
| `data csv "file.csv"` | `pd.read_csv("file.csv")` | — | — |
| `normalize_array(arr)` | — | — | `MinMaxScaler().fit_transform` |
| `mean(arr)` | `df["col"].mean()` | `np.mean(arr)` | — |
| `std(arr)` | `df["col"].std()` | `np.std(arr)` | — |
| `filter(arr, fn)` | `df[df.col > value]` | — | — |
| `map(arr, fn)` | `df.apply(lambda)` | — | — |
| `model simple` | — | — | `LinearRegression().fit()` |
| `model sequential` | — | — | `tf.keras.Sequential()` |

---

## Curriculum

### Track Structure

```
TRACK A: Foundations (1-3)
  A1: What is Data?
  A2: Finding Patterns (Linear Regression)
  A3: Classification (Logistic Regression)

TRACK B: Core ML (4-6)
  B4: Clustering (Conceptual)
  B5: Model Evaluation
  B6: Overfitting & Regularization

TRACK C: Classical Algorithms (7-9) 🆕
  C7: Decision Trees (Conceptual)
  C8: k-Nearest Neighbors (IMPLEMENTABLE)
  C9: Logistic Regression (Named)

TRACK D: Debugging & Diagnosis (10-12) 🆕
  D10: Shape Mismatch & Data Errors
  D11: NaN Loss & Exploding Gradients
  D12: Overfitting in Practice

TRACK E: Real Data & Production (13-15)
  E13: Data Preprocessing
  E14: Feature Engineering
  E15: Deployment & Production

TRACK F: Neural Networks (16-18)
  F16: Neural Network Architecture
  F17: Convolutional Networks (Conceptual)
  F18: Recurrent Networks (Conceptual)

TRACK G: Projects (19-24)
  G19: Kaggle-Style Project
  G20: Build Your Own Dataset
  G21: Model Comparison Challenge
  G22: Natural Language Processing
  G23: Time Series Prediction
  G24: Generative Models

TRACK H: Professional Wisdom (25-28) 🆕
  H25: Hyperparameter Intuition
  H26: The "Should You Even Use ML?" Sanity Check
  H27: Reading Error Messages
  H28: AI-Assisted Debugging
```

### k-NN Implementation

MEX includes a real k-NN implementation (no gradient descent needed):

```mex
## k-NN can be implemented in pure MEX!
## Training data: (hours_studied, hours_slept, passed)
data points
  (2, 6, 0)
  (3, 7, 0)
  (5, 6, 1)
  (6, 8, 1)

## Distance function - compare ONLY features, not label
fn euclidean(features_a, features_b) {
  let sum = 0
  for i in range(0, len(features_a)) {
    let diff = features_a[i] - features_b[i]
    sum = sum + diff * diff
  }
  return sqrt(sum)
}

## k-NN prediction
fn knn_predict(data, point, k) {
  let distances = []
  for i in range(0, len(data)) {
    ## data[i] is [feat1, feat2, label] - slice off the label
    let features = [data[i][0], data[i][1]]  ## Only first 2 columns
    let d = euclidean(features, point)
    distances = distances + [[d, data[i][2]]]
  }
  ## Sort by distance (sort_by handles [distance, label] pairs correctly)
  let sorted = sort_by(distances, fn(x) { return x[0] })
  let votes = [0, 0]
  for i in range(0, k) {
    let label = sorted[i][1]
    votes[label] = votes[label] + 1
  }
  if (votes[1] > votes[0]) {
    return 1
  } else {
    return 0
  }
}

## Predict: 4 hours studied, 7 hours slept
let prediction = knn_predict(data, [4, 7], 3)
print("Predicted: " + prediction)
```

---

## Examples

### Example Files

| File | Description |
|------|-------------|
| `01_data.mx` | Basic data declaration |
| `02_model.mx` | Model creation |
| `03_train.mx` | Training |
| `04_predict.mx` | Prediction |
| `05_full.mx` | Complete workflow |
| `06_csv.mx` | CSV loading |
| `07_phase3.mx` | Variables |
| `08_ml_with_phase3.mx` | ML + variables |
| `09_comprehensive.mx` | All features |
| `10_import.mx` | Import/export |
| `11_import_all.mx` | Import all |
| `12_builtins.mx` | Built-in functions |
| `13_csv_test.mx` | CSV testing |
| `14_learning_workflow.mx` | Learning workflow |
| `debug_overfit.mx` | Smart debug test |

### Running Examples

```bash
# Basic data
node mex.js examples/01_data.mx

# Complete workflow
node mex.js examples/05_full.mx

# CSV loading
node mex.js examples/06_csv.mx

# Built-in functions
node mex.js examples/12_builtins.mx

# Smart debug test
node mex.js examples/debug_overfit.mx

# Compression stats
node mex.js --stats examples/09_comprehensive.mx
```

---

## Troubleshooting

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `File not found` | Wrong path | Check file exists |
| `Unexpected token` | Syntax error | Check MEX syntax |
| `No model defined` | Missing `model` line | Add `model simple` |
| `Model not trained` | Missing `train` | Add `train N epochs` |
| `NaN Loss` | Learning rate too high | Reduce learning rate |
| `Shape mismatch` | Wrong data format | Check data points format |

### Getting Help

```bash
# Show all commands
node mex.js --help

# Run a lesson
node mex.js lesson 1

# Get a hint
node mex.js hint 1

# Check progress
node mex.js status
```

---

## File Structure

```
the_language/
├── mex.js                      # CLI entry point
├── package.json                # Package config
├── progress.json               # Learning progress
├── practice.json               # Practice history
├── lib/
│   ├── lexer.js                # Tokenizer
│   ├── parser.js               # AST builder
│   ├── interpreter.js          # Code executor + Smart Debug
│   ├── nn.js                   # Neural network
│   ├── generator.js            # TF.js generator
│   ├── python-generator.js     # Python generator
│   ├── learning.js             # Lessons & progress
│   ├── practice.js             # Practice templates
│   ├── math.mx                 # Math library
│   └── utils.mx                # ML utilities
├── lessons/
│   ├── README.md               # Lesson guide
│   ├── CURRICULUM.md           # Full curriculum
│   ├── CURRICULUM_V3.md        # Updated curriculum
│   └── *.mx                    # Lesson files
├── examples/
│   └── *.mx                    # Example files
├── datasets/
│   ├── houses.csv              # Sample dataset
│   └── simple.json             # JSON dataset
├── index.html                  # Landing page
├── docs/
│   └── index.html              # Documentation site
├── OVERVIEW.md                 # System overview
└── MEX_Curriculum_v3_Instructor_Brief.md  # v3 brief
```

---

## Version History

### v3.0 (Current)
- Added Smart Debug feature
- Added Pro Mode (compression stats)
- Added Classical Algorithms track (k-NN, Decision Trees)
- Added Debugging & Diagnosis track
- Added Professional Wisdom track
- Added Compressionist achievement
- Added library-equivalent callouts

### v2.0
- Added 6 lessons with challenges
- Added practice system
- Added code generation (TF.js + Python)
- Added achievements

### v1.0
- Core language (lexer, parser, interpreter)
- Neural network engine
- Basic ML features

---

*Documentation version: 3.0*  
*Last updated: June 17, 2026*
