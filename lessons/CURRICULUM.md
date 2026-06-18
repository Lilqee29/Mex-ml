# MEX Learning System — Curriculum Document

## Overview

Two foundational lessons teaching ML concepts through the MEX language.
Based on research from Microsoft, Google, DataCamp, and academic sources.

---

## Research Sources

| Source | What We Used |
|--------|--------------|
| Microsoft ML-For-Beginners | Lesson structure, features/labels definition |
| Google ML Crash Course | Linear regression explanation, y = mx + b |
| DataCamp | Line of best fit, slope/intercept calculation |
| Mathsisfun | Least squares regression, visual examples |
| NYU ML Lecture | Training/test terminology, supervised learning |
| StatsOnline | Regression coefficients, prediction |

---

## Lesson 1: What is Data?

### Concept
Data is the fuel of ML. Every dataset has features (inputs) and labels (outputs).

### Key Terms
- **Feature** — input variable (X)
- **Label** — output variable (y)
- **Dataset** — collection of examples
- **Example** — one row of data

### Content
1. What is data? (ingredients analogy)
2. Loading data with `data points`
3. Looking at patterns
4. The math behind patterns (y = mx + b)
5. Using built-in math functions

### Challenges
1. Create a study dataset (hours → scores)
2. Create a temperature dataset (Celsius → Fahrenheit)
3. Predict a value manually
4. Describe a real-world example

### Files
- `01_what_is_data.mx` — Main lesson
- `01_challenge.mx` — Student challenges
- `01_solutions.mx` — Solutions

---

## Lesson 2: Finding Patterns

### Concept
Linear regression finds the line that best fits your data.

### Key Terms
- **Linear regression** — finding a line through data
- **Line of best fit** — y = mx + b
- **Slope (m)** — how steep the line is
- **Intercept (b)** — where line crosses y-axis
- **Training** — teaching the model
- **Prediction** — using the model
- **Error** — how wrong predictions are

### Content
1. The problem (predicting unknown values)
2. Linear regression explained
3. Training the model (`train N epochs`)
4. Making predictions (`predict x`)
5. Understanding accuracy (`show accuracy`)
6. How machines learn (iterative process)
7. New example (hours studied → test score)

### Challenges
1. Ice cream sales (temperature → sales)
2. Compare training (100 vs 500 epochs)
3. Non-linear pattern (age → shoe size)
4. Design your own dataset

### Files
- `02_finding_patterns.mx` — Main lesson
- `02_challenge.mx` — Student challenges
- `02_solutions.mx` — Solutions

---

## Learning Progression

```
Lesson 1: What is Data?
    ↓
    Features, labels, datasets
    ↓
Lesson 2: Finding Patterns
    ↓
    Linear regression, training, prediction
    ↓
Lesson 3 (future): Classification
    ↓
    Categories, accuracy, confusion matrix
    ↓
Lesson 4 (future): Neural Networks
    ↓
    Layers, activations, backpropagation
```

---

## Test Results

| File | Status | Output |
|------|--------|--------|
| 01_what_is_data.mx | ✅ PASS | All parts work |
| 02_finding_patterns.mx | ✅ PASS | Model trains, predicts |
| 01_solutions.mx | ✅ PASS | Solutions correct |
| 02_solutions.mx | ✅ PASS | Solutions correct |

---

## How to Run

```bash
# List all lessons
node mex.js lessons

# Run a lesson by number
node mex.js lesson 1
node mex.js lesson 2

# Run a specific file
node mex.js lessons/01_what_is_data.mx

# Run challenges
node mex.js lessons/01_challenge.mx

# Run solutions
node mex.js lessons/01_solutions.mx
```

---

## Future Lessons (Planned)

| Lesson | Topic | Concept |
|--------|-------|---------|
| 3 | Classification | Categories, yes/no |
| 4 | Neural Networks | Layers, learning |
| 5 | Real Data | CSV files, cleaning |
| 6 | Advanced | Multi-layer, regularization |
