# Changelog

All notable changes to MEX (Machine Learning EXpression Language) are documented here.

This changelog is written for contributors and maintainers. For user-facing documentation, see [README.md](README.md) or [DOCUMENTATION.md](DOCUMENTATION.md).

---

## [Unreleased] — 2026-06-18

### Added
- **Object Literals** — `{key: value, key2: value2}` syntax for dictionaries
- **Object Property Access** — `obj.property` dot notation
- **Object Methods** — `obj.keys()`, `obj.values()`, `obj.entries()`, `obj.has()`, `obj.get()`, `obj.set()`
- **Array Methods** — `arr.length()`, `arr.push()`, `arr.pop()`, `arr.shift()`, `arr.sort()`, `arr.includes()`, `arr.join()`, `arr.reverse()`
- **String Methods** — `str.length()`, `str.toUpperCase()`, `str.toLowerCase()`, `str.trim()`, `str.includes()`, `str.replace()`, `str.split()`, `str.startsWith()`, `str.endsWith()`
- **Interactive Playground** — web-based editor with file tabs, examples dropdown, syntax reference
- **Autocomplete/Intelligence** — type keywords and get suggestions (Tab to accept)
- **REPL Mode** — `mex repl` for interactive experimentation
- **Model Save/Load** — `save model "file.json"` / `load model "file.json"` persists weights and architecture
- **Array Access Syntax** — `arr[0]`, `arr[0] = 5` for reading and writing array elements
- **Dropout Regularization** — `dropout 0.2` after dense layers (inverted dropout with scaling)
- **AND/OR/NOT Operators** — `and`, `or`, `not` for boolean logic
- **range(n)** — single argument version: `range(5)` → 0,1,2,3,4
- **sort_by Builtin** — explicit key-based sorting: `sort_by(arr, fn(x) { return x[0] })`
- **localStorage Auto-save** — playground files persist between sessions
- **CSV Import** — load local .csv files in playground via file picker
- **Export .mx** — download code as .mx file from playground
- **k-NN Algorithm** — implemented from scratch with distance + voting
- **Library Equivalents Table** — MEX ↔ Pandas/NumPy/Scikit-learn mappings
- **Classical Algorithm Mappings** — DecisionTreeClassifier, KNeighborsClassifier, LogisticRegression
- **Python Generator Fixes** — now produces complete runnable code
- **Compression Stats Fixes** — accurate line counts for Python generation

### Fixed
- **k-NN euclidean bug** — was comparing features+label against features-only
- **sort() silent bug** — was sorting [distance, label] pairs as strings
- **callMEXFn variable restore** — outer scope assignments now work correctly
- **Python generator incomplete** — was missing data loading, model creation, training
- **Windows line endings** — `\r` characters no longer break lexer
- **Stats example** — renamed `data` variable to avoid reserved keyword conflict
- **multi-output model** — dense 1 layers work with sigmoid/tanh activations

### Changed
- **Playground redesigned** — now uses separate files (CSS, JS) instead of single HTML
- Enhanced `sort()` to handle arrays by sorting on first element
- Updated k-NN examples in CURRICULUM_V3.md and DOCUMENTATION.md
- Updated Theory Guide with accurate current state

---

## [0.6.0] — 2026-06-17

### Added
- **CSV Loading** — `data csv "file.csv"` with header detection, auto-type conversion
- **40+ Built-in Functions** — statistics, string, array, data manipulation, normalization
- **Higher-order Functions** — filter, map, reduce, each, find, every, some
- **Column Operations** — column, columns, select, pluck, distinct, union, intersection
- **Normalization Functions** — normalize, denormalize, normalize_array, denormalize_array
- **Practice System** — 5 templates (linear, classify, neural, data, csv), tracking
- **Smart Debug** — pattern-matches: NaN loss, exploding loss, stuck loss, overfitting, high error
- **Pro Mode** — `--stats` shows compression ratio (MEX lines vs generated lines)
- **Compressionist Achievement** — awarded for 2.5x compression ratio

### Fixed
- **Python Generator** — now produces complete runnable code with data, model, training, predictions
- **Compression Stats** — accurate line counts for Python generation

### Changed
- Enhanced interpreter.js with CSV parsing and data manipulation functions
- Updated learning.js with new achievements
- Updated mex.js with new CLI commands

---

## [0.5.0] — 2026-06-16

### Added
- **Array Literal Syntax** — `[1, 2, 3]` support in parser and interpreter
- **Anonymous Functions** — `fn(x) { return x * 2 }` with higher-order function support
- **Extended Builtins** — sqrt, pow, abs, log, exp, sin, cos, tan, floor, ceil, round, random
- **String Functions** — upper, lower, trim, split, join, replace, includes, type
- **Array Functions** — sort, reverse, unique, flatten, slice, head, tail, zip
- **Conversion Functions** — to_number, to_string, to_array

### Fixed
- **Parser** — handles both `train 200 epochs` and `train epochs 200`
- **Interpreter** — properly scopes anonymous functions with parent scope

### Changed
- Enhanced lexer to track line numbers on tokens
- Improved error messages with line numbers

---

## [0.4.0] — 2026-06-15

### Added
- **Learning System** — 6 lessons with challenges and solutions
- **Progress Tracking** — saved to progress.json
- **Unlock System** — complete lesson → next unlocks
- **Scoring System** — for challenges
- **Hint System** — 4 progressive hints per lesson
- **11 Achievement Badges** — First Step, Data Whisperer, Pattern Finder, etc.
- **Commands** — lesson, challenge, lessons, status, achievements, hint, unlock, reset

### Fixed
- **Lesson Content** — accurate, working examples
- **Challenge Grading** — proper scoring

### Changed
- Enhanced learning.js with progress tracking and achievements

---

## [0.3.0] — 2026-06-14

### Added
- **Custom Neural Network** — nn.js with forward pass, backprop, activations, normalization
- **Data Normalization** — built into interpreter (error ~0.013 vs ~30 without)
- **TF.js Code Generation** — `--generate` flag produces TensorFlow.js code
- **Export/Import** — `export` and `import` for sharing functions between files
- **Math Library** — exported math.mx with stats functions
- **Utils Library** — exported utils.mx with ML utilities

### Fixed
- **Normalization** — proper min-max scaling
- **Backpropagation** — correct gradient computation

### Changed
- Enhanced nn.js with layer activations tracking
- Improved error handling

---

## [0.2.0] — 2026-06-13

### Added
- **Core Language** — variables, for/while loops, if/else, functions
- **ML Keywords** — data, model, train, predict, show
- **String Concatenation** — `"Hello " + name`
- **Predict as Expression** — `let p = predict 5`
- **Error Messages** — with line numbers

### Fixed
- **Parser** — handles complex expressions
- **Interpreter** — proper scope management

### Changed
- Enhanced lexer with more token types
- Improved parser error recovery

---

## [0.1.0] — 2026-06-12

### Added
- **Initial Release** — basic lexer, parser, interpreter
- **Simple Syntax** — `data points`, `model simple`, `train 100 epochs`
- **CLI Entry Point** — `mex.js` with file execution

### Fixed
- **Basic Parsing** — handles simple expressions

### Changed
- Initial implementation

---

## Version History Summary

| Version | Date | Key Feature |
|---------|------|-------------|
| 0.1.0 | 2026-06-12 | Initial release |
| 0.2.0 | 2026-06-13 | Core language |
| 0.3.0 | 2026-06-14 | Neural network + normalization |
| 0.4.0 | 2026-06-15 | Learning system + achievements |
| 0.5.0 | 2026-06-16 | Arrays + anonymous functions |
| 0.6.0 | 2026-06-17 | CSV + smart debug + pro mode |
| 0.6.1 | 2026-06-18 | k-NN + library equivalents + fixes |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to MEX.

## License

MIT License — see [LICENSE](LICENSE) for details.
