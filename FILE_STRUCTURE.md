# File Structure Documentation

Complete guide to every file and directory in the MEX project.

---

## Overview

```
mex-language/
├── mex.js                    # CLI entry point
├── lib/                      # Core library files
│   ├── lexer.js              # Tokenizer
│   ├── parser.js             # AST builder
│   ├── interpreter.js        # Code executor
│   ├── nn.js                 # Neural network
│   ├── generator.js          # TF.js code generator
│   ├── python-generator.js   # Python/TF code generator
│   ├── learning.js           # Progress tracking
│   ├── practice.js           # Practice templates
│   ├── math.mx               # Math library (MEX)
│   └── utils.mx              # ML utilities (MEX)
├── playground/               # Interactive web editor
│   ├── index.html            # Main page
│   ├── css/
│   │   └── styles.css        # All styles
│   └── js/
│       ├── lexer.js          # Browser tokenizer
│       ├── parser.js         # Browser parser
│       ├── nn.js             # Browser neural network
│       ├── interpreter.js    # Browser interpreter
│       ├── examples.js       # 11 example programs
│       ├── autocomplete.js   # Intelligence engine
│       └── ui.js             # File management, UI
├── lessons/                  # Learning content
│   ├── 01_what_is_data.mx    # Lesson 1: Data
│   ├── 02_finding_patterns.mx # Lesson 2: Patterns
│   ├── 03_classification.mx  # Lesson 3: Classification
│   ├── 04_neural_networks.mx # Lesson 4: Neural Networks
│   ├── 05_real_data.mx       # Lesson 5: Real Data
│   ├── 06_advanced.mx        # Lesson 6: Advanced
│   ├── 01_challenge.mx       # Challenge 1
│   ├── 02_challenge.mx       # Challenge 2
│   ├── 03_challenge.mx       # Challenge 3
│   ├── 04_challenge.mx       # Challenge 4
│   ├── 05_challenge.mx       # Challenge 5
│   ├── 06_challenge.mx       # Challenge 6
│   ├── 01_solutions.mx       # Solutions 1
│   ├── 02_solutions.mx       # Solutions 2
│   ├── 03_solutions.mx       # Solutions 3
│   ├── 04_solutions.mx       # Solutions 4
│   ├── 05_solutions.mx       # Solutions 5
│   ├── 06_solutions.mx       # Solutions 6
│   ├── CURRICULUM.md         # Curriculum outline
│   └── README.md             # Lessons overview
├── examples/                 # Example .mx files
│   ├── 01_data.mx            # Basic data
│   ├── 02_model.mx           # Model creation
│   ├── 03_train.mx           # Training
│   ├── 04_predict.mx         # Prediction
│   ├── 05_full.mx            # Complete workflow
│   ├── 06_csv.mx             # CSV loading
│   ├── 07_phase3.mx          # Phase 3 features
│   ├── 08_ml_with_phase3.mx  # ML with phase 3
│   ├── 09_comprehensive.mx   # Comprehensive example
│   ├── 10_import.mx          # Import system
│   ├── 11_import_all.mx      # Import all
│   ├── 12_builtins.mx        # Built-in functions
│   ├── 13_csv_test.mx        # CSV test
│   ├── 14_learning_workflow.mx # Learning workflow
│   ├── 99_full_test.mx       # Full test suite
│   └── debug_overfit.mx      # Overfitting debug
├── datasets/                 # Sample data
│   └── houses.csv            # House prices dataset
├── docs/                     # Documentation
│   ├── index.html            # Documentation site
│   ├── DOCUMENTATION.md      # Full language reference
│   ├── OVERVIEW.md           # System overview
│   ├── CURRICULUM_V3.md      # 28-lesson curriculum
│   └── MEX_Universal_Theory_Guide.md # Design philosophy
├── archive/                  # Internal files (not public)
├── index.html                # Landing page
├── docs.html                 # Documentation page
├── package.json              # Project metadata
├── .gitignore                # Git ignore rules
├── README.md                 # Project overview
├── INSTALL.md                # Installation guide
├── DOCS.md                   # Language reference
├── FILE_STRUCTURE.md         # This file
├── CHANGES.md                # Changelog for contributors
└── CONTRIBUTING.md           # Contribution guide
```

---

## Core Files

### mex.js — CLI Entry Point

**Purpose:** Command-line interface for MEX

**Lines:** ~500

**Responsibilities:**
- Parse command-line arguments
- Route to appropriate handler
- Display help text
- Handle errors gracefully

**Key Commands:**
```bash
node mex.js <file.mx>           # Run a file
node mex.js --run "code"        # Run inline code
node mex.js repl                # Start interactive REPL
node mex.js --generate <file>   # Generate TF.js
node mex.js --python <file>     # Generate Python
node mex.js --show-tf <file>    # Show TF.js alongside
node mex.js --stats <file>      # Show compression stats
node mex.js lesson <n>          # Start a lesson
node mex.js challenge <n>       # Try a challenge
node mex.js lessons             # List all lessons
node mex.js status              # Check progress
node mex.js achievements        # View achievements
node mex.js hint <n>            # Get a hint
node mex.js unlock              # Unlock next lesson
node mex.js reset               # Reset progress
node mex.js practice            # List practice templates
node mex.js --run-practice <t>  # Run a template
node mex.js practice-status     # Practice history
```

**Dependencies:** None (uses only Node.js built-ins)

---

### lib/lexer.js — Tokenizer

**Purpose:** Converts source code text into tokens

**Lines:** ~230

**Responsibilities:**
- Read source code character by character
- Identify keywords, identifiers, numbers, strings, operators
- Track line numbers for error messages
- Skip whitespace and comments

**Token Types:**
- Keywords: `data`, `model`, `train`, `predict`, `show`, `for`, `while`, `if`, `else`, `fn`, `let`, `return`
- ML Keywords: `points`, `simple`, `sequential`, `epochs`, `csv`, `json`
- Operators: `+`, `-`, `*`, `/`, `=`, `==`, `!=`, `>`, `<`, `>=`, `<=`
- Literals: Numbers, Strings, Identifiers
- Structural: `(`, `)`, `{`, `}`, `[`, `]`, `,`, `:`

---

### lib/parser.js — AST Builder

**Purpose:** Converts tokens into an Abstract Syntax Tree (AST)

**Lines:** ~610

**Responsibilities:**
- Consume tokens from lexer
- Build tree structure representing code logic
- Handle operator precedence
- Support array literals and anonymous functions

**AST Node Types:**
- `Program` — root node
- `DataDecl` — data declaration
- `ModelDecl` — model declaration
- `TrainSection` — training configuration
- `PredictExpr` — prediction expression
- `ShowExpr` — display expression
- `ForLoop` — for loop
- `WhileLoop` — while loop
- `IfStatement` — conditional
- `FunctionDef` — function definition
- `FunctionCall` — function call
- `ArrayLiteral` — array `[1, 2, 3]`
- `AnonymousFunction` — `fn(x) { return x * 2 }`

---

### lib/interpreter.js — Code Executor

**Purpose:** Executes the AST and runs MEX programs

**Lines:** ~970

**Responsibilities:**
- Walk the AST and execute each node
- Manage variable scope
- Handle ML operations (train, predict)
- Execute built-in functions
- Parse CSV files
- Run Smart Debug analysis

**Built-in Functions (40+):**
- Statistics: `mean`, `std`, `variance`, `median`, `mode`
- String: `upper`, `lower`, `trim`, `split`, `join`, `replace`, `includes`
- Array: `sort`, `sort_by`, `reverse`, `unique`, `flatten`, `slice`, `head`, `tail`, `zip`
- Data: `column`, `columns`, `select`, `pluck`, `distinct`, `count_by`, `group_by`
- Normalization: `normalize`, `denormalize`, `normalize_array`, `denormalize_array`
- Conversion: `to_number`, `to_string`, `to_array`
- Higher-order: `filter`, `map`, `reduce`, `each`, `find`, `every`, `some`
- Math: `sqrt`, `pow`, `abs`, `log`, `exp`, `sin`, `cos`, `tan`, `floor`, `ceil`, `round`, `random`

**Smart Debug Patterns:**
- NaN loss detection
- Exploding loss detection
- Stuck loss detection
- Overfitting detection
- High error detection

---

### lib/nn.js — Neural Network

**Purpose:** Custom neural network from scratch

**Lines:** ~140

**Responsibilities:**
- Forward pass computation
- Backpropagation
- Activation functions (ReLU, Sigmoid, Tanh)
- Data normalization
- Layer activation tracking

**Architecture:**
- Input layer → Hidden layers → Output layer
- Weights initialized randomly
- Biases initialized to zero
- Activations stored for debugging

---

### lib/generator.js — TF.js Code Generator

**Purpose:** Converts MEX AST to TensorFlow.js code

**Lines:** ~280

**Responsibilities:**
- Walk the AST
- Generate equivalent TF.js code
- Handle data declarations
- Generate model architecture
- Generate training code
- Generate prediction code

---

### lib/python-generator.js — Python/TF Code Generator

**Purpose:** Converts MEX AST to Python/TensorFlow code

**Lines:** ~300

**Responsibilities:**
- Walk the AST
- Generate equivalent Python code
- Handle data declarations
- Generate model architecture
- Generate training code
- Generate prediction code
- Wrap in `if __name__ == "__main__"` block

---

### lib/learning.js — Progress Tracking

**Purpose:** Manages learning progress, achievements, and unlock system

**Lines:** ~300

**Responsibilities:**
- Track lesson completion
- Store challenge scores
- Manage unlock sequence
- Calculate achievements
- Provide hints
- Save/load progress to JSON

**Achievements (11):**
1. First Step — Complete lesson 1
2. Data Whisperer — Complete all data lessons
3. Pattern Finder — Complete all pattern lessons
4. Neural Navigator — Complete all neural network lessons
5. Challenge Champion — Complete all challenges
6. Hint Master — Use all hints
7. Perfect Score — Get 100% on all challenges
8. Speed Demon — Complete a lesson in under 5 minutes
9. Persistence — Try a challenge 3+ times
10. Explorer — Try all practice templates
11. Compressionist — Achieve 2.5x compression ratio

---

### lib/practice.js — Practice Templates

**Purpose:** Provides practice templates for hands-on learning

**Lines:** ~150

**Responsibilities:**
- Store practice templates
- Track practice history
- Provide guided examples

**Templates:**
1. `linear` — Linear regression example
2. `classify` — Classification example
3. `neural` — Neural network example
4. `data` — Data manipulation example
5. `csv` — CSV loading example

---

### lib/math.mx — Math Library

**Purpose:** Exported math functions for MEX programs

**Lines:** ~50

**Functions:**
- `mean(arr)` — calculate mean
- `std(arr)` — calculate standard deviation
- `variance(arr)` — calculate variance
- `median(arr)` — calculate median
- `mode(arr)` — calculate mode
- `normalize(arr)` — normalize array
- `denormalize(arr, min, max)` — denormalize array

---

### lib/utils.mx — ML Utilities

**Purpose:** Exported ML utility functions for MEX programs

**Lines:** ~80

**Functions:**
- `euclidean_distance(a, b)` — calculate distance
- `manhattan_distance(a, b)` — calculate distance
- `cosine_similarity(a, b)` — calculate similarity
- `split_data(data, ratio)` — split train/test
- `accuracy(predictions, actual)` — calculate accuracy
- `confusion_matrix(predictions, actual)` — calculate confusion matrix

---

## Learning Content

### lessons/ — Lesson Files

Each lesson contains:
- **Theory** — explanation of concepts
- **Code examples** — working MEX code
- **Exercises** — practice problems
- **Solutions** — reference answers

**Lesson Structure:**
```
lessons/
├── 01_what_is_data.mx      # Lesson content
├── 01_challenge.mx         # Challenge for lesson 1
├── 01_solutions.mx         # Solutions for challenge 1
├── 02_finding_patterns.mx
├── 02_challenge.mx
├── 02_solutions.mx
├── ...
├── CURRICULUM.md           # Curriculum outline
└── README.md               # Lessons overview
```

---

### examples/ — Example Files

Working examples demonstrating MEX features:

| File | Description |
|------|-------------|
| 01_data.mx | Basic data declaration |
| 02_model.mx | Model creation |
| 03_train.mx | Training |
| 04_predict.mx | Prediction |
| 05_full.mx | Complete workflow |
| 06_csv.mx | CSV loading |
| 07_phase3.mx | Phase 3 features |
| 08_ml_with_phase3.mx | ML with phase 3 |
| 09_comprehensive.mx | Comprehensive example |
| 10_import.mx | Import system |
| 11_import_all.mx | Import all |
| 12_builtins.mx | Built-in functions |
| 13_csv_test.mx | CSV test |
| 14_learning_workflow.mx | Learning workflow |
| 99_full_test.mx | Full test suite |
| debug_overfit.mx | Overfitting debug |

---

### datasets/ — Sample Data

| File | Description |
|------|-------------|
| houses.csv | House prices dataset (size, bedrooms, price) |

---

## Documentation

### index.html — Landing Page

**Purpose:** Public-facing landing page

**Features:**
- Hero section with project description
- Feature grid showing capabilities
- Lesson list with links
- Call-to-action buttons

**Technologies:** HTML, CSS, JavaScript (no frameworks)

---

### docs/index.html — Documentation Site

**Purpose:** Full documentation with search

**Features:**
- Sidebar navigation
- Search functionality
- Syntax reference
- Function reference
- Examples

**Technologies:** HTML, CSS, JavaScript (no frameworks)

---

### docs.html — Documentation Page

**Purpose:** Alternative documentation page

**Features:**
- Comprehensive language reference
- API documentation
- Examples

---

## Markdown Files

### README.md — Project Overview

**Purpose:** First thing people see on GitHub

**Contents:**
- What is MEX
- Quick start
- Features
- Examples
- Contributing
- License

---

### INSTALL.md — Installation Guide

**Purpose:** Step-by-step installation instructions

**Contents:**
- Prerequisites
- Installation steps
- First-time setup
- CLI commands
- Troubleshooting
- System requirements

---

### DOCS.md — Language Reference

**Purpose:** Complete language documentation

**Contents:**
- Language syntax
- All built-in functions
- CLI commands
- Examples
- Troubleshooting

---

### FILE_STRUCTURE.md — File Structure Documentation

**Purpose:** This file — explains project structure

**Contents:**
- Directory tree
- File descriptions
- Architecture overview

---

### CHANGES.md — Changelog

**Purpose:** Track changes for contributors

**Contents:**
- Version history
- Added/Changed/Fixed sections
- Contributing guidelines

---

### CONTRIBUTING.md — Contribution Guide

**Purpose:** How to contribute to MEX

**Contents:**
- Code style
- Pull request process
- Issue templates
- Development setup

---

## Package Configuration

### package.json — Project Metadata

**Purpose:** Node.js project configuration

**Key Fields:**
```json
{
  "name": "mex-language",
  "version": "0.6.1",
  "description": "A beginner-friendly ML learning language",
  "main": "mex.js",
  "scripts": {
    "start": "node mex.js",
    "test": "node mex.js examples/99_full_test.mx"
  },
  "keywords": ["ml", "machine-learning", "education", "tensorflow"],
  "author": "Ibrahim Qoyum",
  "license": "MIT"
}
```

---

### .gitignore — Git Ignore Rules

**Purpose:** Tell Git which files to ignore

**Contents:**
- `node_modules/`
- `progress.json`
- `practice.json`
- OS files (`.DS_Store`, `Thumbs.db`)
- Editor files (`.vscode/`, `.idea/`)
- Temporary files
- `archive/` (internal files)

---

## Summary

| Category | Files | Purpose |
|----------|-------|---------|
| Core | 10 | Language implementation |
| Lessons | 18 | Learning content |
| Examples | 16 | Working demos |
| Documentation | 8 | Guides and references |
| Config | 2 | Project setup |

**Total:** ~60 files, ~12,000 lines of code
