# MEX Curriculum v3 — Complete Implementation

> Built from the Instructor Brief. Every directive addressed. Every gap filled.

---

## Updated Track Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            MEX LEARNING PATH v3                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TRACK A         TRACK B         TRACK C         TRACK D         TRACK E         │
│  Foundations      Core ML         Classical       Debugging       Real Data       │
│  (Lessons 1-3)   (Lessons 4-6)   Algorithms      & Diagnosis     & Production   │
│                                    (Lessons 7-9)  (Lessons 10-12) (Lessons 13-15)│
│                                                                                  │
│  Data →          Clustering →    Decision Trees → Shape Mismatch → CSV →         │
│  Patterns        Evaluation      k-NN            NaN Loss        Clean →         │
│  Classification  Overfitting     Logistic Reg    Overfitting     Deploy          │
│                                    Hyperparams    Stack Traces                    │
│                                                                                  │
│  TRACK F         TRACK G                                                           │
│  Neural Nets     Projects &                                                          │
│  (Lessons 16-18) Specialized                                                        │
│                                                                                  │
│  Dense → CNN →   Kaggle → Build → NLP → Time Series → Generative                 │
│  RNN             Compare                                                                │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  PRO MODE: Cross-cutting (compression stats, achievements, landing page)        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TRACK A: Foundations (Unchanged)

### A1: What is Data?
### A2: Finding Patterns (Linear Regression)
### A3: Classification (Logistic Regression — NAMED)

**v3 Change:** Explicitly name "logistic regression" in A3. The lesson already teaches it; just add the term.

```mex
## This is LOGISTIC REGRESSION
## It predicts categories (0 or 1)
## Not continuous numbers like linear regression

data points
  (1, 0)
  (2, 0)
  (3, 1)
  (4, 1)

model simple
train 100 epochs
```

---

## TRACK B: Core ML Algorithms (Unchanged)

### B4: Clustering (Conceptual)
### B5: Model Evaluation
### B6: Overfitting & Regularization

**v3 Change:** Add explicit link: "This is what overfitting LOOKS LIKE when it goes wrong — you'll debug this in Track D."

---

## TRACK C: Classical Algorithms (NEW — Inserted between B and D)

> **Why this exists:** Real-world beginner ML uses decision trees, k-NN, and logistic regression long before neural networks. MEX's engine only does gradient-descent models, but the curriculum should teach the concepts. k-NN is the easiest to implement from scratch (distance + voting, no gradient descent).

### C7: Decision Trees (Conceptual)

**ID:** 7  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** B6  
**Sourced From:**
- microsoft/ML-For-Beginners/4-Classification (decision trees)
- roadmap.sh "Core ML Algorithms > Decision Trees"

**Objectives:**
- [ ] Understand how decision trees split data
- [ ] Know what Gini impurity / information gain means
- [ ] Understand when trees are better than linear models
- [ ] Know about random forests as "many trees"

**Key Concepts:**
```
Decision Tree = Series of if/else questions
Split = Dividing data based on a feature
Gini Impurity = How "mixed" a node is
Leaf = Final prediction node
Random Forest = Many trees voted together
```

**MEX Approach (Conceptual):**
```mex
## MEX doesn't have decision trees yet
## But we can teach the concept with pure MEX

fn predict_with_tree(sqft, bedrooms) {
  ## This IS a decision tree!
  if (sqft > 2000) {
    if (bedrooms > 3) {
      return 400    ## Large house, many rooms → expensive
    } else {
      return 300    ## Large house, few rooms → medium
    }
  } else {
    if (bedrooms > 2) {
      return 250    ## Small house, many rooms → medium
    } else {
      return 150    ## Small house, few rooms → cheap
    }
  }
}

## This is literally what a decision tree does
print(predict_with_tree(2500, 4))
print(predict_with_tree(1500, 2))
```

**Library Equivalent (Callout Box):**
```python
# Scikit-learn decision tree
from sklearn.tree import DecisionTreeClassifier
tree = DecisionTreeClassifier(max_depth=3)
tree.fit(X_train, y_train)
predictions = tree.predict(X_test)
```

**Assessment:**
- Build a manual decision tree in MEX
- Explain when trees beat linear models
- Know what random forests are

---

### C8: k-Nearest Neighbors (IMPLEMENTABLE)

**ID:** 8  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** C7  
**Sourced From:**
- microsoft/ML-For-Beginners/4-Classification (k-NN)
- roadmap.sh "Core ML Algorithms > k-NN"

**Objectives:**
- [ ] Understand instance-based learning
- [ ] Calculate Euclidean distance
- [ ] Implement k-NN voting
- [ ] Know when k-NN is appropriate

**Key Concepts:**
```
Instance-Based Learning = " memorize" training data
k = Number of neighbors to check
Euclidean Distance = Straight-line distance between points
Voting = Majority of k neighbors decides
Lazy Learning = No training phase, just store data
```

**MEX Implementation (REAL — No gradient descent needed!):**
```mex
## k-NN can be implemented in pure MEX!
## No neural network, no gradient descent

## Training data: (hours_studied, hours_slept, passed)
data points
  (2, 6, 0)
  (3, 7, 0)
  (5, 6, 1)
  (6, 8, 1)
  (8, 7, 1)
  (1, 5, 0)

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
  ## Calculate distances (pass features only, not label)
  let distances = []
  for i in range(0, len(data)) {
    ## data[i] is [feat1, feat2, label] - slice off the label
    let features = [data[i][0], data[i][1]]  ## Only first 2 columns
    let d = euclidean(features, point)
    distances = distances + [[d, data[i][2]]]  ## [distance, label]
  }
  
  ## Sort by distance (sort_by handles [distance, label] pairs correctly)
  let sorted = sort_by(distances, fn(x) { return x[0] })
  
  ## Vote from k nearest
  let votes = [0, 0]
  for i in range(0, k) {
    let label = sorted[i][1]
    votes[label] = votes[label] + 1
  }
  
  ## Return majority
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

**Library Equivalent (Callout Box):**
```python
# Scikit-learn k-NN
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)
predictions = knn.predict(X_test)
```

**Assessment:**
- Implement k-NN from scratch in MEX
- Explain why no training phase is needed
- Choose appropriate k value

---

### C9: Logistic Regression (Named Explicitly)

**ID:** 9  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** C8  
**Sourced From:**
- microsoft/ML-For-Beginners/3-Classification (logistic regression)
- roadmap.sh "Core ML Algorithms > Logistic Regression"

**Objectives:**
- [ ] Understand sigmoid function
- [ ] Know logistic regression is for classification
- [ ] Compare to linear regression
- [ ] Understand decision boundary

**Key Concepts:**
```
Sigmoid = Squashes output to 0-1 range
Decision Boundary = Threshold (usually 0.5)
Log-Odds = Linear combination passed through sigmoid
Binary Classification = Two classes (0/1)
```

**MEX Implementation:**
```mex
## This is what MEX's "model simple" actually does for classification!
## It's called LOGISTIC REGRESSION

data points
  (1, 0)
  (2, 0)
  (3, 1)
  (4, 1)

## "model simple" with binary labels → logistic regression
model simple
train 100 epochs

## The model learns a sigmoid shape
predict 2.5    ## Should be ~0.5 (decision boundary)
predict 3.5    ## Should be ~1 (class 1)

show results
```

**Library Equivalent (Callout Box):**
```python
# Scikit-learn logistic regression
from sklearn.linear_model import LogisticRegression
lr = LogisticRegression()
lr.fit(X_train, y_train)
predictions = lr.predict(X_test)
probability = lr.predict_proba(X_test)
```

**Assessment:**
- Explain sigmoid function
- Compare logistic vs linear regression
- Know when to use each

---

## TRACK D: Debugging & Diagnosis (NEW — 3 Lessons)

> **Why this exists:** Every real ML workflow spends more time staring at cryptic errors than writing happy paths. No beginner curriculum teaches this well. This is the highest-leverage addition — it determines whether someone keeps going after their first crash.

### D10: Shape Mismatch & Data Errors

**ID:** 10  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** C9  
**Sourced From:**
- Common ML errors across all frameworks
- roadmap.sh "Model Evaluation > Debugging"

**Objectives:**
- [ ] Recognize shape mismatch errors
- [ ] Know why data shape matters
- [ ] Fix common data formatting issues
- [ ] Prevent errors before they happen

**Key Concepts:**
```
Shape Mismatch = Data dimensions don't match model expectations
Feature/Label Confusion = Swapping input and output columns
Missing Values = Empty cells in data
Wrong Dtype = Text where numbers expected
```

**MEX Deliberately-Broken Examples:**

```mex
## ERROR EXAMPLE 1: Wrong number of features
## Model expects 1 feature, you give 2

data points
  (1, 2, 3)      ## TWO inputs, but model expects ONE
  (2, 4, 5)

model simple      ## Only takes 1 input!
train 100 epochs

## → Error: Shape mismatch
```

```mex
## ERROR EXAMPLE 2: Labels are strings not numbers

data points
  (1, "low")
  (2, "high")

## → Error: Labels must be numbers
```

**Smart Debug Output:**
```
❌ Shape Mismatch Error

Your data has 2 features per point:
  (1, 2, 3) → 2 inputs, 1 label

But "model simple" expects exactly 1 feature:
  (input, label)

Fix: Either reduce to 1 feature, or use:
  model sequential
  dense 4 relu
  dense 1 linear
```

**Assessment:**
- Identify shape mismatch from error message
- Fix data formatting issues
- Prevent errors with validation

---

### D11: NaN Loss & Exploding Gradients

**ID:** 11  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** D10  
**Sourced From:**
- Common training failures
- roadmap.sh "Deep Learning > Debugging"

**Objectives:**
- [ ] Recognize NaN loss symptoms
- [ ] Understand learning rate effects
- [ ] Know when data needs normalization
- [ ] Fix exploding gradient problems

**Key Concepts:**
```
NaN = "Not a Number" — training broke
Exploding Gradients = Updates too large, model diverges
Learning Rate Too High = Model bounces around, never settles
Learning Rate Too Low = Training crawls, takes forever
```

**MEX Deliberately-Broken Examples:**

```mex
## ERROR EXAMPLE: Learning rate too high

data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
## Default learning rate is 0.1
## What if we set it way too high?

train 50 epochs

## Loss might go NaN or explode
```

**Smart Debug Output:**
```
⚠️ NaN Loss Detected

Your training loss became NaN (Not a Number) at epoch 12.

Common causes:
1. Learning rate too high (most likely)
   → Try: Reduce learning rate to 0.01 or 0.001
2. Data not normalized
   → Try: Use normalize_array() on your data
3. Bad data values
   → Check for NaN/Infinity in your dataset

MEX default learning rate: 0.1
For this dataset, try: 0.01
```

**Assessment:**
- Recognize NaN loss from output
- Adjust learning rate appropriately
- Apply normalization when needed

---

### D12: Overfitting in Practice (Link to B6)

**ID:** 12  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** D11  
**Sourced From:**
- Practical overfitting diagnosis
- roadmap.sh "Model Evaluation > Overfitting"

**Objectives:**
- [ ] See what overfitting looks like in real training
- [ ] Recognize the "perfect training, bad prediction" pattern
- [ ] Apply early stopping
- [ ] Use validation data

**Key Concepts:**
```
Training Accuracy = How well model fits training data
Validation Accuracy = How well model generalizes
Gap = When training >> validation = overfitting
Early Stopping = Stop before overfitting
```

**MEX Deliberately-Broken Examples:**

```mex
## OVERFITTING EXAMPLE: Too complex, too long

data points
  (1, 2)
  (2, 4)
  (3, 6)

## Tiny dataset + huge model = overfitting
model sequential
dense 64 relu
dense 64 relu
dense 1 linear

train 1000 epochs    ## Way too long for 3 points!

## Training error: 0.0001 (perfect!)
## But predict(4) might be wrong!

predict 4
show results
```

**Smart Debug Output:**
```
⚠️ Possible Overfitting Detected

Training error: 0.0001 (very low)
But prediction accuracy seems off.

 Signs of overfitting:
• Model is complex (129 parameters) for tiny dataset (3 points)
• Training for 1000 epochs on 3 points
• Training error near zero but predictions seem wrong

 Fixes:
1. Reduce model complexity:
   model simple
2. Reduce epochs:
   train 50 epochs
3. Add more data points
```

**Assessment:**
- Identify overfitting from training curves
- Apply early stopping
- Know when to simplify model

---

## TRACK E: Real Data & Production (Reframed)

### E13: Data Preprocessing (with Library Equivalents)

**ID:** 13  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** D12  
**v3 Addition:** Library-equivalent callout boxes

**MEX ↔ Library Equivalents:**
```
┌─────────────────────────────────────────────────────────────┐
│  MEX                          EQUIVALENT                     │
├─────────────────────────────────────────────────────────────┤
│  data csv "file.csv"          pd.read_csv("file.csv")       │
│  normalize_array(arr)         MinMaxScaler().fit_transform  │
│  mean(arr)                    np.mean(arr)                  │
│  std(arr)                     np.std(arr)                   │
│  filter(arr, fn)              df[df.col > value]            │
└─────────────────────────────────────────────────────────────┘
```

**Teaching Point:**
```mex
## MEX: Auto-detects column types
data csv "houses.csv"

## Python: You handle dtypes explicitly
## import pandas as pd
## df = pd.read_csv("houses.csv")
## df["price"] = pd.to_numeric(df["price"])
## df = df.dropna()
```

---

### E14: Feature Engineering (with Library Equivalents)

**ID:** 14  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** E13

**MEX ↔ Library Equivalents:**
```
┌─────────────────────────────────────────────────────────────┐
│  MEX                          EQUIVALENT                     │
├─────────────────────────────────────────────────────────────┤
│  map(arr, fn)                 df.apply(lambda)               │
│  column(data, 0)              df.iloc[:, 0]                 │
│  unique(arr)                  df["col"].unique()            │
│  count_by(arr, fn)            df["col"].value_counts()      │
└─────────────────────────────────────────────────────────────┘
```

---

### E15: Deployment & Production (with Library Equivalents)

**ID:** 15  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** E14

**MEX ↔ Library Equivalents:**
```
┌─────────────────────────────────────────────────────────────┐
│  MEX                          EQUIVALENT                     │
├─────────────────────────────────────────────────────────────┤
│  model simple                 LinearRegression().fit()       │
│  model sequential             tf.keras.Sequential()          │
│  train 100 epochs             model.fit(epochs=100)          │
│  predict 5                    model.predict([[5]])           │
│  node mex.js --generate       Save model weights             │
└─────────────────────────────────────────────────────────────┘
```

**Teaching Point:**
```
⚠️ KEY DIFFERENCE: Scaler Fitting

MEX:
  data csv "houses.csv"     ## Auto-normalizes
  model simple               ## Ready to train

Python:
  scaler = MinMaxScaler()

---

### Classical Algorithms — Library Equivalents

| MEX Implementation | Scikit-learn Equivalent |
|---------------------|------------------------|
| knn_predict(data, point, k) | KNeighborsClassifier(n_neighbors=k) |
| Decision tree with thresholds | DecisionTreeClassifier() |
| Logistic sigmoid | LogisticRegression() |
| Train/test split | train_test_split() |
| Accuracy calculation | accuracy_score() |
| Confusion matrix | confusion_matrix() |
| Confusion matrix | confusion_matrix() |

**Key Insight:**
```
MEX teaches you HOW these algorithms work internally.
Scikit-learn gives you the optimized production version.

Example: k-NN in MEX (20 lines)
→ KNeighborsClassifier in sklearn (3 lines)

Example: Decision tree in MEX (50 lines)
→ DecisionTreeClassifier in sklearn (5 lines)

Example: Logistic regression in MEX (30 lines)
→ LogisticRegression in sklearn (5 lines)
```

---

### E15: Deployment & Production (with Library Equivalents)

**ID:** 15  
**Difficulty:** Intermediate  
**Duration:** 25 minutes  
**Prerequisites:** E14

**MEX ↔ Library Equivalents:**
```
┌─────────────────────────────────────────────────────────────┐
│  MEX                          EQUIVALENT                     │
├─────────────────────────────────────────────────────────────┤
│  model simple                 LinearRegression().fit()       │
│  model sequential             tf.keras.Sequential()          │
│  train 100 epochs             model.fit(epochs=100)          │
│  predict 5                    model.predict([[5]])           │
│  node mex.js --generate       Save model weights             │
└─────────────────────────────────────────────────────────────┘
```

**Teaching Point:**
```
⚠️ KEY DIFFERENCE: Scaler Fitting

MEX:
  data csv "houses.csv"     ## Auto-normalizes
  model simple               ## Ready to train

Python:
  scaler = MinMaxScaler()
  X_train = scaler.fit_transform(X_train)  ## FIT on train only
  X_test = scaler.transform(X_test)        ## TRANSFORM test (don't fit!)

Why? If you fit on test data, you're "cheating" — the model sees test stats.
```

---

## TRACK F: Neural Networks (Unchanged)

### F16: Neural Network Architecture
### F17: Convolutional Networks (Conceptual)
### F18: Recurrent Networks (Conceptual)

---

## TRACK G: Projects & Specialized (Unchanged)

### G19: Kaggle-Style Project
### G20: Build Your Own Dataset
### G21: Model Comparison Challenge
### G22: Natural Language Processing
### G23: Time Series Prediction
### G24: Generative Models

---

## TRACK H: The "Didn't Know to Ask For" Lessons (NEW)

> These fit late in the curriculum as "professional wisdom" — things experienced practitioners know that beginner curricula skip.

### H25: Hyperparameter Intuition

**ID:** 25  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** D11  
**Sourced From:**
- Instructor Brief directive #4
- Common beginner mistakes

**Objectives:**
- [ ] Understand learning rate as "the dial"
- [ ] See same model fail from too high AND too low
- [ ] Develop intuition for when to adjust
- [ ] Know the "just right" zone

**MEX Interactive Experiment:**
```mex
## EXPERIMENT: Watch the same model fail 3 ways

data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)

## Run 1: Learning rate too LOW
## (Training crawls, barely improves)

## Run 2: Learning rate too HIGH
## (Loss bounces around, never settles)

## Run 3: Learning rate just right
## (Smooth convergence)

## The "Goldilocks zone" for learning rate:
## - 0.001: Too slow
## - 0.1: Too fast
## - 0.01: Usually works
```

**Assessment:**
- Adjust learning rate based on training behavior
- Know when to increase vs decrease
- Explain the "Goldilocks zone"

---

### H26: The "Should You Even Use ML?" Sanity Check

**ID:** 26  
**Difficulty:** Intermediate  
**Duration:** 15 minutes  
**Prerequisites:** E15  
**Sourced From:**
- Instructor Brief directive #4
- Real-world best practices

**Objectives:**
- [ ] Know when a simple rule beats ML
- [ ] Recognize "overengineering" with ML
- [ ] Use lookup tables when appropriate
- [ ] Apply the "could an if-statement do this?" test

**Key Concepts:**
```
The ML Question: "Is this problem complex enough for ML?"

Simple Rule Wins:
• Threshold: score > 80 → pass
• Lookup: zip code → city
• Average: predict mean
• Pattern: weekends → more traffic

ML Wins:
• Complex patterns in many features
• No clear rule exists
• Data has non-linear relationships
• Need to generalize from examples
```

**MEX Demonstration:**
```mex
## WHEN ML IS OVERKILL

## Problem: Predict if a number is positive
## Simple rule: if (x > 0) return 1 else return 0

## ML approach (overkill!):
data points
  (1, 1)
  (2, 1)
  (-1, 0)
  (-2, 0)

model simple
train 100 epochs
predict 5

## Just use an if-statement!
fn is_positive(x) {
  if (x > 0) {
    return 1
  }
  return 0
}

## WHEN ML WINS

## Problem: Predict house prices from 10 features
## No simple rule works
## ML finds the pattern
```

**Assessment:**
- Identify when ML is overkill
- Apply the if-statement test
- Know when ML is necessary

---

### H27: Reading Error Messages (Transferable Skill)

**ID:** 27  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** D12  
**Sourced From:**
- Instructor Brief directive #4
- Professional development skills

**Objectives:**
- [ ] Read any stack trace
- [ ] Find the actual error line
- [ ] Distinguish error from noise
- [ ] Know what to search for

**Key Concepts:**
```
Stack Trace = Error journey through code
Error Line = Where the problem actually is
Call Stack = Functions that led to error
Noise = Framework internals (usually skip)
```

**MEX Error Anatomy:**
```
Error: Unexpected token LBRACKET ('undefined') at line 24
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        This is the actual error message

  at Parser.parsePrimary (C:\...\parser.js:382:11)
  at Parser.parseExpression (C:\...\parser.js:350:20)
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        These are stack frames — usually noise for beginners

The error is at line 24 of YOUR file.
The parser.js:382 is MEX internals — skip it.
```

**Assessment:**
- Find error line in any stack trace
- Ignore framework noise
- Search for solutions effectively

---

### H28: AI-Assisted Debugging (Professional Workflow)

**ID:** 28  
**Difficulty:** Intermediate  
**Duration:** 20 minutes  
**Prerequisites:** H27  
**Sourced From:**
- Instructor Brief directive #4
- Real-world 2026 workflow

**Objectives:**
- [ ] Know when to ask AI for help
- [ ] Format errors for AI assistance
- [ ] Get useful debugging help
- [ ] Verify AI suggestions

**The Formula:**
```
When your MEX-generated Python/TF.js throws an error:

1. COPY the full error message
2. COPY the relevant code (not the whole file)
3. EXPLAIN what you expected
4. ASK: "What went wrong and how do I fix it?"

Example prompt to AI:
---
I ran this Python code generated from MEX:

[code here]

I got this error:
[error here]

I expected [what you expected]. What went wrong?
---
```

**MEX Workflow:**
```bash
# 1. Generate Python from MEX
node mex.js --python my_model.mx > model.py

# 2. Run the Python code
python model.py

# 3. If error occurs, copy error + code to AI

# 4. AI explains and fixes

# 5. Apply fix to model.py
```

**Assessment:**
- Format a debugging prompt correctly
- Get useful AI assistance
- Verify suggested fixes

---

## PRO MODE: Cross-Cutting Feature (Not a Track)

> **Why this exists:** Every .mx file converts to longer TF.js/Python code. That compression ratio is a real metric. Use it.

### Implementation

**1. `--stats` Flag:**
```bash
node mex.js --stats examples/05_full.mx

# Output:
# MEX: 12 lines
# TF.js: 31 lines
# Python: 28 lines
# Compression ratio: 2.6x
```

**2. Challenge Type: "Compression Challenge"**
```yaml
challenge:
  type: compression
  problem: "Implement linear regression in under 10 lines"
  scoring:
    correctness: 40%    # Must work
    compression: 40%    # Lines saved vs reference
    readability: 20%    # Still understandable
```

**3. Achievement: "Compressionist"**
```javascript
{
  id: 'compressionist',
  name: 'Compressionist',
  icon: '📦',
  condition: (progress) => progress.averageCompressionRatio > 2.5
}
```

**4. Landing Page Section:**
```html
<section id="compression">
  <h2>MEX = Less Code, Same ML</h2>
  <div class="compression-grid">
    <div class="example">
      <h3>Linear Regression</h3>
      <div class="mex-code">12 lines</div>
      <div class="arrow">→</div>
      <div class="tfjs-code">31 lines TF.js</div>
      <div class="ratio">2.6x compression</div>
    </div>
    <!-- More examples from examples/ folder -->
  </div>
</section>
```

---

## Smart Debug: Interpreter Integration

### Pattern Matching in interpreter.js

```javascript
// Add to interpreter.js after training

function checkTrainingHealth(state) {
  const warnings = [];
  
  // Check for NaN loss
  if (state.results.some(r => isNaN(r.error))) {
    warnings.push({
      type: 'nan_loss',
      message: 'Your training loss became NaN (Not a Number).',
      causes: [
        'Learning rate too high (most likely)',
        'Data not normalized',
        'Bad data values (NaN/Infinity)'
      ],
      fixes: [
        'Reduce learning rate to 0.01 or 0.001',
        'Use normalize_array() on your data',
        'Check dataset for invalid values'
      ]
    });
  }
  
  // Check for exploding loss
  if (state.results.length > 10) {
    const first10 = state.results.slice(0, 10).map(r => r.error);
    const last10 = state.results.slice(-10).map(r => r.error);
    const avgFirst = first10.reduce((a,b) => a+b, 0) / 10;
    const avgLast = last10.reduce((a,b) => a+b, 0) / 10;
    
    if (avgLast > avgFirst * 10) {
      warnings.push({
        type: 'exploding_loss',
        message: 'Your loss is increasing instead of decreasing.',
        causes: ['Learning rate too high'],
        fixes: ['Reduce learning rate by 10x']
      });
    }
  }
  
  // Check for overfitting
  if (state.results.length > 0) {
    const finalError = state.results[state.results.length - 1].error;
    if (finalError < 0.001 && state.data.points.length < 10) {
      warnings.push({
        type: 'possible_overfitting',
        message: 'Training error is very low but dataset is tiny.',
        causes: ['Model may have memorized data instead of learning'],
        fixes: [
          'Reduce model complexity',
          'Reduce epochs',
          'Add more data points'
        ]
      });
    }
  }
  
  return warnings;
}
```

---

## Implementation Checklist

### Phase 1: New Tracks (Lessons 7-12) ⬜

- [ ] C7: Decision Trees (Conceptual)
- [ ] C8: k-NN (IMPLEMENTABLE — real algorithm!)
- [ ] C9: Logistic Regression (Named Explicitly)
- [ ] D10: Shape Mismatch & Data Errors
- [ ] D11: NaN Loss & Exploding Gradients
- [ ] D12: Overfitting in Practice

### Phase 2: Smart Debug Feature ⬜

- [ ] Add `checkTrainingHealth()` to interpreter.js
- [ ] Add pattern matching for common errors
- [ ] Add plain-language explanations
- [ ] Test with deliberately-broken .mx files

### Phase 3: Pro Mode ⬜

- [ ] Add `--stats` flag to mex.js
- [ ] Add compression ratio calculation
- [ ] Add "Compressionist" achievement
- [ ] Add compression challenge type
- [ ] Update landing page with compression examples

### Phase 4: Library Equivalents ⬜

- [ ] Add callout boxes to Track E lessons
- [ ] Create MEX ↔ Pandas/NumPy/Scikit-learn mapping
- [ ] Add "key difference" callouts (scaler fitting, etc.)

### Phase 5: Professional Wisdom (Lessons 25-28) ⬜

- [ ] H25: Hyperparameter Intuition
- [ ] H26: ML Sanity Check
- [ ] H27: Reading Stack Traces
- [ ] H28: AI-Assisted Debugging

---

## Summary: What v3 Changes

| Change | Impact | Effort |
|--------|--------|--------|
| Classical Algorithms Track | High — realistic ML progression | Medium |
| k-NN Implementation | High — second real algorithm | Low (no gradient descent) |
| Debugging Track | Very High — determines learner retention | Medium |
| Smart Debug Feature | Very High — differentiator | Medium |
| Pro Mode | Medium — engagement + landing page | Low |
| Library Equivalents | High — bridges to production | Low |
| Hyperparameter Intuition | High — prevents common frustration | Low |
| ML Sanity Check | Medium — practical wisdom | Low |
| Reading Stack Traces | High — transferable skill | Low |
| AI-Assisted Debugging | High — real-world workflow | Low |

---

*v3 Curriculum — Complete*  
*Last updated: June 17, 2026*
