# MEX Documentation

Complete reference for MEX (Machine Learning EXpression Language).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Language Syntax](#language-syntax)
3. [Data](#data)
4. [Models](#models)
5. [Training](#training)
6. [Prediction](#prediction)
7. [Built-in Functions](#built-in-functions)
8. [Control Flow](#control-flow)
9. [Functions](#functions)
10. [Arrays](#arrays)
11. [Objects](#objects)
12. [Strings](#strings)
13. [CSV Loading](#csv-loading)
14. [Code Generation](#code-generation)
15. [Smart Debug](#smart-debug)
16. [Pro Mode](#pro-mode)
17. [Model Save/Load](#model-saveload)
18. [Array Access](#array-access)
19. [Logical Operators](#logical-operators)
20. [Dropout](#dropout)
21. [REPL Mode](#repl-mode)
22. [Learning System](#learning-system)
23. [CLI Reference](#cli-reference)
24. [Examples](#examples)
25. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Hello World

```mex
data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
train 100 epochs
predict 5
```

**Run it:**
```bash
node mex.js hello.mx
```

**Output:**
```
Data loaded: 3 points
Features: 1
Model: simple
Training: 100 epochs
Prediction for 5: 10.0
```

### What Just Happened?

1. **Data** — We defined 3 data points: (1,2), (2,4), (3,6)
2. **Model** — We created a simple linear model
3. **Train** — We trained for 100 epochs
4. **Predict** — We predicted the output for input 5

---

## Language Syntax

### Comments

```mex
## This is a comment
# This is also a comment
```

### Variables

```mex
let x = 5
let name = "MEX"
let data = [1, 2, 3]
```

### Print

```mex
print("Hello, World!")
print("x = " + x)
```

---

## Data

### Data Points

```mex
data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)
```

**Format:** `(input, output)`

### Data from CSV

```mex
data csv "houses.csv"
```

**Requirements:**
- First row should be headers
- Numeric columns auto-converted
- Missing values handled gracefully

### Multiple Features

```mex
data points
  (2, 6, 0)    ## 2 features + label
  (3, 7, 0)
  (5, 6, 1)
  (6, 8, 1)
```

---

## Models

### Simple Model

```mex
model simple
```

**Use for:** Linear regression, single-output problems

### Sequential Model

```mex
model sequential
```

**Use for:** Multi-layer networks, complex patterns

### Model with Layers

```mex
model sequential
layer dense units 32 activation relu
layer dense units 16 activation relu
layer dense units 1
```

**Available activations:** `relu`, `sigmoid`, `tanh`

### Model with Dropout

```mex
model sequential
layer dense units 64 activation relu
dropout 0.2
layer dense units 32 activation relu
dropout 0.2
layer dense units 1
```

---

## Training

### Basic Training

```mex
train 100 epochs
```

### Training with Learning Rate

```mex
train 200 epochs learning_rate 0.01
```

### Training with Verbosity

```mex
train 500 epochs verbose
```

**Verbose output shows:**
- Epoch number
- Current loss
- Progress bar

---

## Prediction

### Predict Single Value

```mex
predict 5
```

### Predict Multiple Values

```mex
predict [5, 10, 15]
```

### Store Prediction

```mex
let p = predict 5
print("Prediction: " + p)
```

---

## Built-in Functions

### Statistics

```mex
mean([1, 2, 3, 4, 5])      ## 3
std([1, 2, 3, 4, 5])        ## 1.414
variance([1, 2, 3, 4, 5])   ## 2
median([1, 2, 3, 4, 5])     ## 3
mode([1, 1, 2, 3, 3, 3])    ## 3
```

### String Functions

```mex
upper("hello")               ## "HELLO"
lower("HELLO")               ## "hello"
trim("  hello  ")            ## "hello"
split("a,b,c", ",")          ## ["a", "b", "c"]
join(["a", "b", "c"], ",")   ## "a,b,c"
replace("hello world", "world", "MEX")  ## "hello MEX"
includes("hello", "ell")     ## true
type("hello")                ## "string"
```

### Array Functions

```mex
sort([3, 1, 2])              ## [1, 2, 3]
sort_by([{x:2}, {x:1}], fn(x) { return x.x })  ## [{x:1}, {x:2}]
reverse([1, 2, 3])           ## [3, 2, 1]
unique([1, 1, 2, 3])         ## [1, 2, 3]
flatten([[1, 2], [3, 4]])    ## [1, 2, 3, 4]
slice([1, 2, 3, 4], 1, 3)    ## [2, 3]
head([1, 2, 3], 2)           ## [1, 2]
tail([1, 2, 3], 2)           ## [2, 3]
zip([1, 2], [3, 4])          ## [[1, 3], [2, 4]]
```

### Data Functions

```mex
data csv "file.csv"
column(data, 0)               ## Get first column
columns(data)                 ## Get number of columns
select(data, [0, 2])          ## Select columns 0 and 2
pluck(data, 0)                ## Get flat array of column 0
distinct([1, 1, 2, 3])       ## [1, 2, 3]
count_by([1, 1, 2, 3], fn(x) { return x })  ## {1: 2, 2: 1, 3: 1}
```

### Normalization

```mex
normalize(5, 0, 10)          ## 0.5
denormalize(0.5, 0, 10)      ## 5
normalize_array([1, 2, 3, 4, 5])  ## [0, 0.25, 0.5, 0.75, 1]
```

### Conversion

```mex
to_number("42")               ## 42
to_string(42)                 ## "42"
to_array(42)                  ## [42]
```

### Math

```mex
sqrt(16)                      ## 4
pow(2, 3)                     ## 8
abs(-5)                       ## 5
log(100)                      ## 4.605
exp(1)                        ## 2.718
sin(3.14159)                  ## 0
cos(0)                        ## 1
tan(0)                        ## 0
floor(3.7)                    ## 3
ceil(3.2)                     ## 4
round(3.5)                    ## 4
random()                      ## Random 0-1
```

### Higher-Order Functions

```mex
let numbers = [1, 2, 3, 4, 5]

filter(numbers, fn(x) { return x > 3 })  ## [4, 5]
map(numbers, fn(x) { return x * 2 })     ## [2, 4, 6, 8, 10]
reduce(numbers, fn(a, b) { return a + b }, 0)  ## 15
each(numbers, fn(x) { print(x) })        ## Prints each number
find(numbers, fn(x) { return x > 3 })    ## 4
every(numbers, fn(x) { return x > 0 })   ## true
some(numbers, fn(x) { return x > 3 })    ## true
```

---

## Control Flow

### For Loop

```mex
for i in range(0, 5) {
  print(i)
}
```

**Output:** 0, 1, 2, 3, 4

### For Loop (Single Argument)

```mex
for i in range(5) {
  print(i)
}
```

**Output:** 0, 1, 2, 3, 4

### For Loop (With Step)

```mex
for i in range(0, 10, 2) {
  print(i)
}
```

**Output:** 0, 2, 4, 6, 8

### While Loop

```mex
let i = 0
while i < 5 {
  print(i)
  i = i + 1
}
```

### If/Else

```mex
if (x > 5) {
  print("x is greater than 5")
} else {
  print("x is 5 or less")
}
```

### Comparison Operators

- `==` equal
- `!=` not equal
- `>` greater than
- `<` less than
- `>=` greater or equal
- `<=` less or equal

### Logical Operators

- `and` AND
- `or` OR
- `not` NOT

---

## Functions

### Define Function

```mex
fn add(a, b) {
  return a + b
}
```

### Call Function

```mex
let result = add(3, 4)
print(result)  ## 7
```

### Anonymous Functions

```mex
let double = fn(x) { return x * 2 }
print(double(5))  ## 10
```

### Higher-Order Functions

```mex
fn apply_to_each(arr, transform) {
  let result = []
  for i in range(0, len(arr)) {
    result = result + [transform(arr[i])]
  }
  return result
}

let numbers = [1, 2, 3]
let doubled = apply_to_each(numbers, fn(x) { return x * 2 })
print(doubled)  ## [2, 4, 6]
```

---

## Arrays

### Create Array

```mex
let arr = [1, 2, 3, 4, 5]
```

### Access Elements

```mex
let first = arr[0]   ## 1
let third = arr[2]   ## 3
```

### Modify Elements

```mex
arr[0] = 10
```

### Array Methods

```mex
let arr = [3, 1, 4, 1, 5]
arr.length()          ## 5
arr.push(9)           ## [3, 1, 4, 1, 5, 9]
arr.pop()             ## 5
arr.sort()            ## [1, 1, 3, 4, 5]
arr.includes(4)       ## true
arr.join(', ')        ## "1, 1, 3, 4, 5"
arr.reverse()         ## [5, 4, 3, 1, 1]
arr.indexOf(4)        ## 3
```

### Array Length

```mex
let len = len(arr)   ## 5
```

### Array Concatenation

```mex
let arr1 = [1, 2]
let arr2 = [3, 4]
let combined = arr1 + arr2  ## [1, 2, 3, 4]
```

### Nested Arrays

```mex
let matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
```

---

## Objects

### Create Object

```mex
let person = {
  name: "Alice",
  age: 30,
  city: "New York"
}
```

### Access Properties

```mex
print(person.name)    ## "Alice"
print(person.age)     ## 30
```

### Object Methods

```mex
person.keys()         ## ["name", "age", "city"]
person.values()       ## ["Alice", 30, "New York"]
person.entries()      ## [["name", "Alice"], ["age", 30], ...]
person.has("name")    ## true
person.get("age")     ## 30
person.set("email", "alice@example.com")
```

### Nested Objects

```mex
let company = {
  name: "Acme",
  ceo: {
    name: "Bob",
    age: 50
  }
}
print(company.ceo.name)  ## "Bob"
```

---

## Strings

### String Methods

```mex
let msg = "hello world"
msg.length()            ## 11
msg.toUpperCase()       ## "HELLO WORLD"
msg.toLowerCase()       ## "hello world"
msg.trim()              ## "hello world"
msg.includes("world")   ## true
msg.replace("world", "MEX")  ## "hello MEX"
msg.split(" ")          ## ["hello", "world"]
msg.startsWith("hello") ## true
msg.endsWith("world")   ## true
msg.charAt(0)           ## "h"
msg.substring(0, 5)     ## "hello"
msg.indexOf("world")    ## 6
```

---

## CSV Loading

### Basic CSV Loading

```mex
data csv "houses.csv"
show data
```

### CSV with Header Detection

```mex
data csv "houses.csv"
## Headers: size, bedrooms, price
## First row: 2104, 5, 400000
```

### CSV Data Manipulation

```mex
data csv "houses.csv"

## Get column
let sizes = column(data, 0)

## Calculate statistics
let avg_size = mean(sizes)
let std_size = std(sizes)

print("Average size: " + avg_size)
print("Std size: " + std_size)
```

### CSV Filtering

```mex
data csv "houses.csv"

## Filter rows
let large_houses = filter(data, fn(row) { return row[0] > 2000 })
print("Large houses: " + len(large_houses))
```

---

## Code Generation

### Generate TensorFlow.js

```bash
node mex.js --generate examples/05_full.mx
```

**Output:**
```javascript
const xs = tf.tensor2d([[1], [2], [3], [4], [5]]);
const ys = tf.tensor2d([[3], [5], [7], [9], [11]]);
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));
model.compile({optimizer: 'sgd', loss: 'mse'});
await model.fit(xs, ys, {epochs: 500});
const prediction = model.predict(tf.tensor2d([[6]]));
prediction.print();
```

### Generate Python/TensorFlow

```bash
node mex.js --python examples/05_full.mx
```

**Output:**
```python
import tensorflow as tf
import numpy as np

xs = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
ys = np.array([3, 5, 7, 9, 11]).reshape(-1, 1)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, input_shape=[1])
])

model.compile(optimizer='sgd', loss='mse')
model.fit(xs, ys, epochs=500, verbose=0)

pred = model.predict(np.array([[6]]))
print(f"Prediction: {pred.numpy()[0][0]:.4f}")
```

### Show TF.js Alongside MEX

```bash
node mex.js --show-tf examples/05_full.mx
```

**Output:**
```
MEX:                          TF.js:
data points                   const xs = tf.tensor2d([[1], [2], ...]);
  (1, 2)                      const ys = tf.tensor2d([[2], [4], ...]);
  (2, 4)                      const model = tf.sequential();
model simple                  model.add(tf.layers.dense({units: 1}));
train 100 epochs              await model.fit(xs, ys, {epochs: 100});
predict 5                     model.predict(tf.tensor2d([[5]]))
```

---

## Smart Debug

### Automatic Error Detection

MEX automatically detects common training issues:

```mex
data points
  (1, 999999)
  (2, 888888)

model simple
train 100 epochs
```

**Output:**
```
⚠️ Smart Debug: Exploding Loss Detected
Your training loss increased dramatically during training.
This usually means the learning rate is too high.
Suggestion: Try a lower learning rate (e.g., 0.001)
```

### Patterns Detected

| Pattern | Message | Suggestion |
|---------|---------|------------|
| NaN Loss | Loss became NaN | Lower learning rate, normalize data |
| Exploding Loss | Loss increased dramatically | Lower learning rate |
| Stuck Loss | Loss barely changing | Increase learning rate |
| Overfitting | Very low error on tiny dataset | Get more data |
| High Error | Error still high after many epochs | Try more epochs or different model |

---

## Pro Mode

### Compression Statistics

```bash
node mex.js --stats examples/05_full.mx
```

**Output:**
```
MEX lines:      8
TF.js lines:    13
Python lines:   15

TF.js ratio:    1.6x
Python ratio:   1.9x

📦 Compressionist Achievement Unlocked!
```

### What It Means

- **MEX lines:** Lines of MEX code
- **TF.js lines:** Equivalent TensorFlow.js code
- **Python lines:** Equivalent Python/TensorFlow code
- **Ratio:** How much more code the generated version requires

---

## Learning System

### Start a Lesson

```bash
node mex.js lesson 1
```

### Try a Challenge

```bash
node mex.js challenge 1
```

### Check Progress

```bash
node mex.js status
```

**Output:**
```
Progress:
  Lessons completed: 3/6
  Challenges passed: 2/6
  Achievements earned: 5/11
  
Current lesson: 4 (Neural Networks)
Next unlock: Complete lesson 4
```

### Get a Hint

```bash
node mex.js hint 1
```

### View Achievements

```bash
node mex.js achievements
```

**Output:**
```
Achievements:
  ✅ First Step — Complete lesson 1
  ✅ Data Whisperer — Complete all data lessons
  ✅ Pattern Finder — Complete all pattern lessons
  ⬜ Neural Navigator — Complete all neural network lessons
  ✅ Challenge Champion — Complete all challenges
  ...
```

---

## Model Save/Load

### Save a Trained Model

```mex
data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
train 500 epochs
save model "my_model.json"
```

**Output:**
```
Model saved to my_model.json
```

### Load a Saved Model

```mex
load model "my_model.json"
predict 5
```

**Output:**
```
Model loaded from my_model.json
Prediction for 5: 10.0
```

### What Gets Saved

- Model weights and biases
- Layer architecture
- Training history
- Normalization statistics (for predict after load)

---

## Array Access

### Read Elements

```mex
let arr = [10, 20, 30]
let first = arr[0]     ## 10
let second = arr[1]    ## 20
let third = arr[2]     ## 30
```

### Modify Elements

```mex
let arr = [1, 2, 3]
arr[0] = 10            ## arr is now [10, 2, 3]
arr[1] = 20            ## arr is now [10, 20, 3]
```

### Nested Array Access

```mex
let matrix = [[1, 2], [3, 4]]
let val = matrix[0][1]  ## 2
matrix[1][0] = 10       ## matrix is now [[1, 2], [10, 4]]
```

### Use in Loops

```mex
let arr = [10, 20, 30, 40, 50]
for i in range(0, len(arr)) {
  print("Element " + i + ": " + arr[i])
}
```

---

## Logical Operators

### AND Operator

```mex
let x = 5
if (x > 0 and x < 10) {
  print("x is between 0 and 10")
}
```

### OR Operator

```mex
let x = 15
if (x < 0 or x > 10) {
  print("x is outside 0-10 range")
}
```

### NOT Operator

```mex
let done = false
if (not done) {
  print("Not done yet!")
}
```

### Complex Conditions

```mex
let age = 25
let has_id = true
if (age >= 18 and has_id) {
  print("Entry allowed")
}
```

---

## Dropout

### Basic Dropout

```mex
model sequential
layer dense units 64 activation relu
dropout 0.2              ## Drop 20% of neurons during training
layer dense units 32 activation relu
dropout 0.2
layer dense units 1
train 200 epochs
```

### How It Works

- **During training:** Randomly disables neurons (inverted dropout)
- **During prediction:** All neurons active, scaled appropriately
- **Helps prevent overfitting** on small datasets

### Common Rates

| Rate | Use Case |
|------|----------|
| 0.1 | Low regularization |
| 0.2 | Standard (recommended) |
| 0.3 | Medium regularization |
| 0.5 | High regularization (may underfit) |

---

## REPL Mode

### Start REPL

```bash
mex repl
```

### Interactive Session

```mex
> let x = 5
> x * 2
10
> print("hello")
hello
> let arr = [1, 2, 3]
> map(arr, fn(x) { return x * 2 })
[2, 4, 6]
```

### REPL Commands

| Command | Description |
|---------|-------------|
| `.help` | Show available commands |
| `.vars` | Show all variables |
| `.funcs` | Show all functions |
| `.quit` | Exit REPL |

### Use Cases

- Experiment with syntax
- Test functions quickly
- Debug expressions
- Learn the language interactively

---

## CLI Reference

### Basic Commands

| Command | Description |
|---------|-------------|
| `node mex.js <file.mx>` | Run a .mx file |
| `node mex.js --run "code"` | Run inline code |
| `node mex.js repl` | Start interactive REPL |
| `node mex.js --help` | Show help |

### Code Generation

| Command | Description |
|---------|-------------|
| `node mex.js --generate <file.mx>` | Generate TensorFlow.js |
| `node mex.js --python <file.mx>` | Generate Python/TF |
| `node mex.js --show-tf <file.mx>` | Show TF.js alongside |
| `node mex.js --stats <file.mx>` | Show compression stats |

### Learning

| Command | Description |
|---------|-------------|
| `node mex.js lesson <n>` | Start lesson n |
| `node mex.js challenge <n>` | Try challenge n |
| `node mex.js lessons` | List all lessons |
| `node mex.js status` | Check progress |
| `node mex.js achievements` | View achievements |
| `node mex.js hint <n>` | Get hint for lesson n |
| `node mex.js unlock` | Unlock next lesson |
| `node mex.js reset` | Reset progress |

### Practice

| Command | Description |
|---------|-------------|
| `node mex.js practice` | List practice templates |
| `node mex.js --run-practice <topic>` | Run a template |
| `node mex.js practice-status` | Practice history |

---

## Examples

### Linear Regression

```mex
## Simple linear regression
data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)

model simple
train 100 epochs
predict 5
```

### Classification

```mex
## Binary classification
data points
  (2, 6, 0)
  (3, 7, 0)
  (5, 6, 1)
  (6, 8, 1)

model sequential
layer dense units 8 activation relu
layer dense units 1 activation sigmoid
train 200 epochs
predict [4, 7]
```

### Neural Network

```mex
## Multi-layer neural network
data points
  (1, 3)
  (2, 6)
  (3, 9)
  (4, 12)

model sequential
layer dense units 16 activation relu
layer dense units 8 activation relu
layer dense units 1
train 300 epochs
predict 5
```

### CSV Loading

```mex
## Load and analyze CSV data
data csv "houses.csv"

## Get statistics
let avg_price = mean(column(data, 2))
let std_price = std(column(data, 2))

print("Average price: " + avg_price)
print("Std price: " + std_price)

## Filter large houses
let large = filter(data, fn(row) { return row[0] > 2000 })
print("Large houses: " + len(large))
```

### k-NN Algorithm

```mex
## k-Nearest Neighbors from scratch
data points
  (2, 6, 0)
  (3, 7, 0)
  (5, 6, 1)
  (6, 8, 1)

fn euclidean(features_a, features_b) {
  let sum = 0
  for i in range(0, len(features_a)) {
    let diff = features_a[i] - features_b[i]
    sum = sum + diff * diff
  }
  return sqrt(sum)
}

fn knn_predict(data, point, k) {
  let distances = []
  for i in range(0, len(data)) {
    let features = [data[i][0], data[i][1]]
    let d = euclidean(features, point)
    distances = distances + [[d, data[i][2]]]
  }
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

let prediction = knn_predict(data, [4, 7], 3)
print("Predicted: " + prediction)
```

---

## Troubleshooting

### Common Errors

#### "Syntax Error: Unexpected token"
**Cause:** Missing bracket, parenthesis, or comma

**Fix:**
```mex
## Wrong
data points
  (1, 2
  (3, 4)

## Correct
data points
  (1, 2)
  (3, 4)
```

#### "Reference Error: x is not defined"
**Cause:** Variable used before declaration

**Fix:**
```mex
## Wrong
print(x)
let x = 5

## Correct
let x = 5
print(x)
```

#### "Type Error: Cannot read property 'map' of undefined"
**Cause:** Array operation on non-array

**Fix:**
```mex
## Wrong
let result = map(5, fn(x) { return x * 2 })

## Correct
let result = map([1, 2, 3], fn(x) { return x * 2 })
```

#### "Training stuck at high loss"
**Cause:** Learning rate too low or data not normalized

**Fix:**
```mex
## Try higher learning rate
train 200 epochs learning_rate 0.01

## Or normalize data
data csv "data.csv"
## (normalization happens automatically)
```

### Getting Help

1. Check the [Examples](#examples) section
2. Run `node mex.js --help` for CLI help
3. Read [DOCUMENTATION.md](DOCUMENTATION.md) for full reference
4. Open an issue on GitHub

---

## Glossary

| Term | Definition |
|------|------------|
| **Epoch** | One complete pass through the training data |
| **Learning Rate** | How big of a step to take during training |
| **Loss** | How wrong the model's predictions are |
| **Overfitting** | Model memorizes training data instead of learning patterns |
| **Normalization** | Scaling data to a standard range (usually 0-1) |
| **Features** | Input variables (columns in your data) |
| **Labels** | Output variables (what you're predicting) |
| **AST** | Abstract Syntax Tree — internal representation of code |
| **Backpropagation** | Algorithm for computing gradients in neural networks |
| **Tensor** | Multi-dimensional array (used in TensorFlow) |

---

## Further Reading

- [README.md](README.md) — Project overview
- [INSTALL.md](INSTALL.md) — Installation guide
- [CHANGES.md](CHANGES.md) — Changelog
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [DOCUMENTATION.md](DOCUMENTATION.md) — Full language reference
- [OVERVIEW.md](OVERVIEW.md) — System overview
- [CURRICULUM_V3.md](CURRICULUM_V3.md) — 28-lesson curriculum
