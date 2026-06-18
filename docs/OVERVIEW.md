# MEX — Complete System Overview

> A machine learning learning language that teaches ML concepts through simple syntax, then bridges to production TensorFlow.js/Python.

---

## Table of Contents

1. [Vision & Philosophy](#vision--philosophy)
2. [Architecture](#architecture)
3. [Language Specification](#language-specification)
4. [ML Engine](#ml-engine)
5. [Learning System](#learning-system)
6. [Practice System](#practice-system)
7. [Code Generation](#code-generation)
8. [CLI Commands](#cli-commands)
9. [File Structure](#file-structure)
10. [Current Capabilities](#current-capabilities)
11. [Gaps & Opportunities](#gaps--opportunities)
12. [Lesson Schema Ideas](#lesson-schema-ideas)

---

## Vision & Philosophy

### Core Idea
**MEX** = **M**achine learning **EX**periment language

### Three Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   LEARN              PRACTICE            PRODUCE                │
│   ─────              ────────            ───────                │
│   Simple syntax      Quick templates     Export to Python       │
│   Guided lessons     No restrictions     Export to TF.js        │
│   Progressive unlock Experimentation     Real-world ready       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Zero dependencies** — runs anywhere Node.js runs
2. **Syntax mirrors TensorFlow.js** — skills transfer directly
3. **Gentle learning curve** — start with data points, progress to neural networks
4. **Immediate feedback** — see results instantly
5. **Bridge to production** — convert to Python/TF.js when ready

---

## Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        MEX CLI (mex.js)                       │
├──────────────────────────────────────────────────────────────┤
│  Commands: run, lesson, challenge, practice, generate,       │
│            python, show-tf, status, achievements, hint       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Lexer (lexer.js)                         │
│  Input: .mx source code                                       │
│  Output: Token stream                                         │
│  Features: 70+ token types, line tracking                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Parser (parser.js)                        │
│  Input: Token stream                                          │
│  Output: Abstract Syntax Tree (AST)                          │
│  Features: Recursive descent, error recovery                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   Interpreter (interpreter.js)                │
│  Input: AST                                                   │
│  Output: Execution results                                    │
│  Features: 40+ built-in functions, variable scoping          │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   nn.js         │ │  generator.js   │ │ python-generator│
│   Neural Net    │ │  TF.js Export   │ │ Python Export   │
│   from scratch  │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Output / Generated Code                    │
└──────────────────────────────────────────────────────────────┘
```

### Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `mex.js` | CLI entry point, command routing | ~470 |
| `lib/lexer.js` | Tokenizer | ~260 |
| `lib/parser.js` | AST builder | ~610 |
| `lib/interpreter.js` | Code executor | ~860 |
| `lib/nn.js` | Neural network from scratch | ~140 |
| `lib/generator.js` | TF.js code generator | ~280 |
| `lib/python-generator.js` | Python/TF code generator | ~120 |
| `lib/learning.js` | Lessons, progress, achievements | ~290 |
| `lib/practice.js` | Practice templates | ~180 |
| `lib/math.mx` | Math library (MEX) | ~30 |
| `lib/utils.mx` | ML utilities (MEX) | ~50 |

---

## Language Specification

### Token Types (70+)

#### Keywords
```
data, points, csv, model, simple, sequential, dense, train, epochs
predict, show, results, accuracy, loss, let, if, else, for, in, while
fn, return, import, export, from, as, print, input, true, false
```

#### Operators
```
+, -, *, /, %, ==, !=, <, >, <=, >=, &&, ||, !, =
```

#### Delimiters
```
(, ), [, ], {, }, ,, :, .
```

### Data Types

| Type | Example | Description |
|------|---------|-------------|
| Number | `42`, `3.14` | Floating point |
| String | `"hello"` | Text |
| Boolean | `true`, `false` | Logical |
| Array | `[1, 2, 3]` | Collection |
| Function | `fn(x) { return x }` | Callable |

### Statement Types

```mex
## Variable Declaration
let x = 10
let name = "MEX"

## Assignment
x = 20

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

## Function Declaration
fn add(a, b) {
  return a + b
}

## Anonymous Function (for callbacks)
fn(x) { return x * 2 }

## Print
print("Hello")

## Import/Export
import { add, multiply } from "lib/math.mx"
export fn myFunction() {}
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

### Built-in Functions (40+)

#### Math Functions
```
sqrt, pow, abs, sin, cos, tan, log, log10, exp
floor, ceil, round, min, max, random
PI, E, LN2, LN10, LOG2E, LOG10E, SQRT1_2, SQRT2
```

#### Statistics Functions
```
mean(arr)       → Average
sum(arr)        → Total
std(arr)        → Standard deviation
variance(arr)   → Variance
median(arr)     → Middle value
mode(arr)       → Most frequent
range(arr)      → Max - Min
count(arr)      → Length
```

#### Array Functions
```
sort(arr)           → Sorted array
reverse(arr)        → Reversed array
unique(arr)         → Distinct values
flatten(arr)        → Flattened array
head(arr, n)        → First n elements
tail(arr, n)        → Last n elements
zip(arr1, arr2)     → Combined array
len(arr)            → Length
```

#### String Functions
```
upper(str)          → Uppercase
lower(str)          → Lowercase
trim(str)           → Trimmed
split(str, delim)   → Array
join(arr, delim)    → String
replace(str, old, new) → Replaced
includes(str, sub)  → Boolean
len(str)            → Length
```

#### Data Manipulation
```
filter(arr, fn)     → Filtered array
map(arr, fn)        → Transformed array
reduce(arr, fn)     → Accumulated value
each(arr, fn)       → Iterate
find(arr, fn)       → First match
every(arr, fn)      → All match?
some(arr, fn)       → Any match?
where(arr, fn)      → Alias for filter
limit(arr, n)       → First n
offset(arr, n)      → Skip n
sample(arr, n)      → Random n
shuffle(arr)        → Shuffled
```

#### Column Operations
```
column(data, col)       → Single column
columns(data, cols)     → Multiple columns
select(data, cols)      → Select columns
pluck(arr, key)         → Extract key
distinct(arr)           → Unique values
union(a, b)             → Combined unique
intersection(a, b)      → Common values
difference(a, b)        → Unique to a
count_by(arr, fn)       → Group counts
group_by(arr, fn)       → Grouped object
```

#### Normalization
```
normalize(val, min, max)         → 0-1 range
denormalize(val, min, max)       → Original range
normalize_array(arr)             → Normalized array
denormalize_array(arr, min, max) → Denormalized array
```

#### Conversion
```
to_number(x)    → Number
to_string(x)    → String
to_array(x)     → Array
```

#### Random
```
rand_int(min, max)      → Random integer
rand_float(min, max)    → Random float
rand_choice(arr)        → Random element
```

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
    this.layerActivations = [];  // Stored for backprop
  }
}
```

#### Supported Activations
| Activation | Formula | Derivative |
|------------|---------|------------|
| sigmoid | `1 / (1 + e^-x)` | `x * (1 - x)` |
| relu | `max(0, x)` | `x > 0 ? 1 : 0` |
| tanh | `tanh(x)` | `1 - x^2` |
| linear | `x` | `1` |

#### Training Process
```
1. Initialize weights randomly
2. For each epoch:
   a. Forward pass: compute predictions
   b. Calculate error (MSE)
   c. Backpropagation: compute gradients
   d. Update weights and biases
3. Return trained model
```

#### Model Types
- **simple/linear**: Single dense layer, 1 unit, linear activation
- **sequential**: Multiple layers, configurable architecture

---

## Learning System

### Progress Tracking (progress.json)

```json
{
  "completedLessons": [1, 2, 3],
  "scores": { "1": 100, "2": 85, "3": 90 },
  "hintsUsed": { "1": 0, "2": 1, "3": 0 },
  "totalHintsUsed": 1,
  "averageScore": 91.67,
  "timestamps": {
    "1": "2026-06-17T20:00:00.000Z",
    "2": "2026-06-17T20:05:00.000Z",
    "3": "2026-06-17T20:10:00.000Z"
  }
}
```

### Unlock System
- Sequential unlocking: Complete lesson N → unlocks N+1
- Lesson 1 always unlocked
- Progress saved to `progress.json`

### Scoring System
- Challenges scored 0-100
- Based on: correctness, efficiency, style
- Average score tracked

### Hint System
- 4 progressive hints per lesson
- Hints get more specific
- Usage tracked

### Achievements (10)

| Badge | Name | Condition |
|-------|------|-----------|
| 🎯 | First Steps | Complete lesson 1 |
| 🏆 | Half Way | Complete lessons 1-3 |
| 🎓 | ML Graduate | Complete all 6 lessons |
| ⭐ | Challenger | Complete first challenge |
| 🥇 | Challenge Master | Perfect score on challenge |
| 🔬 | Independent | Complete lesson without hints |
| ✨ | Perfect | 100% score on any challenge |
| 📊 | High Scorer | Average > 80% |
| 💪 | Persistent | Use hint and still complete |
| ⚡ | Speed Learner | Complete lesson in < 2 min |

---

## Practice System

### Practice Templates

| Topic | Description | Template |
|-------|-------------|----------|
| `linear` | Linear regression | Predict house prices |
| `classify` | Classification | Pass/fail prediction |
| `neural` | Neural networks | Multi-layer architecture |
| `data` | Data manipulation | Arrays, statistics, filtering |
| `csv` | CSV data | Load and analyze files |

### Practice Tracking (practice.json)

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

### Show TF.js Equivalent

```bash
node mex.js --show-tf file.mx
```

Shows TF.js code alongside MEX execution output.

---

## CLI Commands

### Core Commands
```bash
node mex.js <file.mx>              # Run a .mx file
node mex.js --run "code"           # Run inline code
node mex.js --generate <file.mx>   # Generate TF.js code
node mex.js --python <file.mx>     # Generate Python code
node mex.js --show-tf <file.mx>    # Show TF.js equivalent
```

### Learning Commands
```bash
node mex.js lesson <number>        # Run a lesson
node mex.js challenge <number>     # Run a challenge (scored)
node mex.js lessons                # List all lessons
node mex.js status                 # Show progress
node mex.js hint <lesson>          # Get a hint
node mex.js unlock                 # Show unlock status
node mex.js achievements           # Show achievements
node mex.js reset                  # Reset all progress
```

### Practice Commands
```bash
node mex.js practice               # List practice topics
node mex.js practice <topic>       # Show practice template
node mex.js --run-practice <topic> # Run practice template
node mex.js practice-status        # Show practice history
```

---

## File Structure

```
the_language/
├── mex.js                          # CLI entry point
├── package.json                    # Package config
├── progress.json                   # Learning progress
├── practice.json                   # Practice history
├── lib/
│   ├── lexer.js                    # Tokenizer
│   ├── parser.js                   # AST builder
│   ├── interpreter.js              # Code executor
│   ├── nn.js                       # Neural network
│   ├── generator.js                # TF.js generator
│   ├── python-generator.js         # Python generator
│   ├── learning.js                 # Lessons & progress
│   ├── practice.js                 # Practice templates
│   ├── math.mx                     # Math library
│   └── utils.mx                    # ML utilities
├── lessons/
│   ├── README.md                   # Lesson guide
│   ├── CURRICULUM.md               # Full curriculum
│   ├── 01_what_is_data.mx          # Lesson 1
│   ├── 01_challenge.mx             # Challenge 1
│   ├── 01_solutions.mx             # Solutions 1
│   ├── 02_finding_patterns.mx      # Lesson 2
│   ├── 02_challenge.mx             # Challenge 2
│   ├── 02_solutions.mx             # Solutions 2
│   ├── 03_classification.mx        # Lesson 3
│   ├── 03_challenge.mx             # Challenge 3
│   ├── 03_solutions.mx             # Solutions 3
│   ├── 04_neural_networks.mx       # Lesson 4
│   ├── 04_challenge.mx             # Challenge 4
│   ├── 04_solutions.mx             # Solutions 4
│   ├── 05_real_data.mx             # Lesson 5
│   ├── 05_challenge.mx             # Challenge 5
│   ├── 05_solutions.mx             # Solutions 5
│   ├── 06_advanced.mx              # Lesson 6
│   ├── 06_challenge.mx             # Challenge 6
│   └── 06_solutions.mx             # Solutions 6
├── examples/
│   ├── 01_data.mx                  # Basic data
│   ├── 02_model.mx                 # Model creation
│   ├── 03_train.mx                 # Training
│   ├── 04_predict.mx               # Prediction
│   ├── 05_full.mx                  # Complete workflow
│   ├── 06_csv.mx                   # CSV loading
│   ├── 07_phase3.mx                # Variables
│   ├── 08_ml_with_phase3.mx        # ML + variables
│   ├── 09_comprehensive.mx         # All features
│   ├── 10_import.mx                # Import/export
│   ├── 11_import_all.mx            # Import all
│   ├── 12_builtins.mx              # Built-in functions
│   ├── 13_csv_test.mx              # CSV testing
│   └── 14_learning_workflow.mx     # Learning workflow
├── datasets/
│   ├── houses.csv                  # Sample dataset
│   └── simple.json                 # JSON dataset
├── index.html                      # Landing page
├── docs/
│   └── index.html                  # Documentation site
└── research/                       # Research materials
    ├── github_repos.md
    ├── tensorflow_js_resources.md
    └── results/
        └── ...                     # Test outputs
```

---

## Current Capabilities

### ✅ Working

| Feature | Status | Notes |
|---------|--------|-------|
| Lexer | ✅ Complete | 70+ token types |
| Parser | ✅ Complete | Recursive descent |
| Interpreter | ✅ Complete | 40+ built-in functions |
| Neural Network | ✅ Complete | Custom from scratch |
| Variables | ✅ Complete | let, assignment |
| Control Flow | ✅ Complete | if/else, for, while |
| Functions | ✅ Complete | Named + anonymous |
| Arrays | ✅ Complete | Full support |
| Import/Export | ✅ Complete | Module system |
| CSV Loading | ✅ Complete | Auto-detect columns |
| Data Manipulation | ✅ Complete | filter, map, reduce, etc. |
| Statistics | ✅ Complete | mean, std, median, etc. |
| String Operations | ✅ Complete | upper, lower, trim, etc. |
| Normalization | ✅ Complete | Built-in |
| TF.js Generation | ✅ Complete | Full code export |
| Python Generation | ✅ Complete | TensorFlow export |
| Lessons | ✅ Complete | 6 lessons |
| Challenges | ✅ Complete | Scored |
| Progress Tracking | ✅ Complete | JSON file |
| Unlock System | ✅ Complete | Sequential |
| Achievements | ✅ Complete | 10 badges |
| Hints | ✅ Complete | 4 per lesson |
| Practice Templates | ✅ Complete | 5 topics |
| Practice Tracking | ✅ Complete | History saved |
| Documentation | ✅ Complete | Full docs site |

### 🔶 Partial

| Feature | Status | Notes |
|---------|--------|-------|
| Error Messages | 🔶 Basic | Line numbers, could be friendlier |
| REPL Mode | 🔶 Not started | Would be nice |
| Interactive Playground | 🔶 Not started | Web-based |

### ❌ Missing

| Feature | Status | Notes |
|---------|--------|-------|
| Dropout Layer | ❌ Not implemented | For regularization |
| Batch Training | ❌ Not implemented | Mini-batch SGD |
| Loss Functions | ❌ Not implemented | MSE only |
| Multiple Optimizers | ❌ Not implemented | SGD only |
| Model Save/Load | ❌ Not implemented | Persist models |
| Data Splitting | ❌ Not implemented | Train/test split |
| Confusion Matrix | ❌ Not implemented | For classification |
| Visualization | ❌ Not implemented | Charts, graphs |
| Web Playground | ❌ Not started | Browser-based |
| VS Code Extension | ❌ Not started | Syntax highlighting |

---

## Gaps & Opportunities

### Learning System Gaps

1. **No lesson content variety**
   - Currently: Text + code examples
   - Could add: Diagrams, videos, interactive demos

2. **No adaptive difficulty**
   - Currently: Fixed progression
   - Could add: Adjust based on performance

3. **No spaced repetition**
   - Currently: Linear progression
   - Could add: Review old concepts

4. **No real-world projects**
   - Currently: Abstract examples
   - Could add: Build real ML models

5. **No community features**
   - Currently: Single player
   - Could add: Share solutions, compare scores

### Language Gaps

1. **No class/object syntax**
   - Currently: Functions only
   - Could add: Simple OOP

2. **No string interpolation**
   - Currently: Concatenation only
   - Could add: Template literals

3. **No list comprehensions**
   - Currently: map/filter only
   - Could add: Python-style comprehensions

4. **No error handling**
   - Currently: Crashes on error
   - Could add: try/catch

5. **No async/await**
   - Currently: Synchronous only
   - Could add: Async operations

### ML Gaps

1. **No regularization**
   - Currently: Basic training only
   - Could add: Dropout, L1/L2

2. **No validation**
   - Currently: No train/test split
   - Could add: Validation set support

3. **No metrics**
   - Currently: MSE only
   - Could add: Accuracy, F1, etc.

4. **No data preprocessing**
   - Currently: Manual normalization
   - Could add: Pipeline support

5. **No pre-trained models**
   - Currently: Train from scratch
   - Could add: Transfer learning

---

## Lesson Schema Ideas

### Current Schema (Lessons 1-6)

```
Lesson Structure:
├── Title
├── Introduction (text)
├── Concepts (text + code)
├── Examples ( runnable .mx code)
├── Key Takeaways (bullet points)
└── Next Steps (preview)

Challenge Structure:
├── Problem Statement
├── Requirements
├── Evaluation Criteria
└── Scoring Rubric
```

### Proposed Enhanced Schema

```yaml
lesson:
  id: 1
  title: "What is Data?"
  difficulty: beginner
  duration: "10 minutes"
  
  prerequisites: []
  unlocks: [2]
  
  objectives:
    - "Understand what features are"
    - "Understand what labels are"
    - "Create a dataset in MEX"
  
  sections:
    - type: introduction
      content: |
        Data is the foundation of machine learning...
    
    - type: concept
      title: "Features"
      content: |
        Features are the input variables...
      code: |
        data points
          (1, 2)
          (2, 4)
    
    - type: interactive
      prompt: "Try changing the data points..."
      expected: "Different predictions"
    
    - type: diagram
      url: "images/data_points.png"
      alt: "Data points visualization"
    
    - type: quiz
      question: "What are features?"
      options:
        - "Input variables"
        - "Output variables"
        - "Model parameters"
      correct: 0
  
  challenge:
    problem: "Create a dataset for house prices"
    requirements:
      - "At least 5 data points"
      - "Realistic values"
    evaluation:
      - "Correct format: 90%"
      - "Realistic data: 10%"
    scoring:
      perfect: 100
      good: 80
      passing: 60
  
  hints:
    - "Data points use (input, output) format"
    - "House prices are typically 100k-1M"
    - "Square footage is a good feature"
    - "Example: (1500, 250) means 1500 sqft, $250k"
```

### Lesson Ideas for Expansion

#### Beginner Track (Lessons 1-6: Done)
1. What is Data? ✅
2. Finding Patterns ✅
3. Classification ✅
4. Neural Networks ✅
5. Real Data ✅
6. Advanced ✅

#### Intermediate Track (Lessons 7-12: Proposed)
7. **Overfitting & Regularization**
   - Train/test split
   - Cross-validation
   - Dropout
   - Early stopping

8. **Multiple Outputs**
   - Multi-class classification
   - One-hot encoding
   - Softmax activation

9. **Data Preprocessing**
   - Missing values
   - Outlier detection
   - Feature scaling
   - Encoding categorical data

10. **Model Evaluation**
    - Confusion matrix
    - Precision/Recall
    - ROC curves
    - AUC score

11. **Real-World Dataset**
    - Load actual CSV
    - Clean data
    - Feature engineering
    - Build model

12. **Deployment**
    - Export to Python
    - Export to TF.js
    - Save model
    - Make predictions

#### Advanced Track (Lessons 13-18: Proposed)
13. **Convolutional Networks**
    - Image data
    - Convolution layers
    - Pooling

14. **Recurrent Networks**
    - Sequence data
    - LSTM/GRU
    - Time series

15. **Transfer Learning**
    - Pre-trained models
    - Fine-tuning

16. **Generative Models**
    - VAEs
    - GANs basics

17. **Reinforcement Learning**
    - Q-learning basics
    - Game playing

18. **Production ML**
    - MLOps
    - Monitoring
    - Scaling

### Practice Topic Ideas

#### Current Topics
- linear
- classify
- neural
- data
- csv

#### Proposed Additional Topics

| Topic | Description | Skills Practiced |
|-------|-------------|------------------|
| `normalize` | Data normalization | Preprocessing |
| `features` | Feature engineering | Data transformation |
| `tune` | Hyperparameter tuning | Optimization |
| `compare` | Compare models | Model selection |
| `ensemble` | Ensemble methods | Advanced ML |
| `real` | Real dataset | End-to-end project |

---

## Summary

### What MEX Is
- A **learning language** for ML concepts
- **Zero dependency** — runs anywhere
- **Simple syntax** that mirrors TensorFlow.js
- **Bridge to production** via code generation

### What MEX Has
- Complete language (lexer, parser, interpreter)
- Custom neural network engine
- 6 lessons with challenges
- Practice system with templates
- Code generation (TF.js + Python)
- Full documentation

### What MEX Needs
- More lessons (intermediate, advanced)
- Real-world projects
- Better error messages
- Interactive playground
- Community features

### The Prompt Opportunity
Use this overview to create a prompt that:
1. Describes the current system
2. Identifies gaps
3. Proposes specific improvements
4. Maintains the learning philosophy
5. Builds on existing architecture

---

*Last updated: June 17, 2026*
