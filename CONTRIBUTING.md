# Contributing to MEX

Thank you for your interest in contributing to MEX! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Issue Templates](#issue-templates)
- [Community](#community)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Git
- A text editor (VS Code recommended)

### First-Time Setup

1. **Fork the repository**
   - Go to https://github.com/yourusername/mex-language
   - Click "Fork" button

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/mex-language.git
   cd mex-language
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/originaluser/mex-language.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Verify setup**
   ```bash
   node mex.js examples/99_full_test.mx
   # Expected: ALL TESTS PASSED
   ```

---

## How to Contribute

### Types of Contributions

#### 1. Bug Reports

Found a bug? Open an issue with:

- **Title:** Clear, concise description
- **Steps to reproduce:** What you did
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happened
- **Environment:** OS, Node.js version

#### 2. Feature Requests

Have an idea? Open an issue with:

- **Title:** Feature request: [description]
- **Problem:** What problem does this solve?
- **Solution:** How should it work?
- **Alternatives:** Other approaches considered

#### 3. Code Contributions

Ready to code? Pick an issue labeled "good first issue" or "help wanted".

#### 4. Documentation

Improvements to docs are always welcome:

- Fix typos
- Add examples
- Clarify explanations
- Translate to other languages

#### 5. Lessons & Curriculum

Help write learning content:

- New lessons
- Better challenges
- More examples
- Assessment criteria

---

## Development Setup

### Project Structure

```
mex-language/
├── mex.js              # CLI entry point
├── lib/                # Core library
│   ├── lexer.js        # Tokenizer
│   ├── parser.js       # AST builder
│   ├── interpreter.js  # Code executor
│   ├── nn.js           # Neural network
│   ├── generator.js    # TF.js generator
│   ├── python-generator.js  # Python generator
│   ├── learning.js     # Progress tracking
│   ├── practice.js     # Practice templates
│   ├── math.mx         # Math library
│   └── utils.mx        # ML utilities
├── lessons/            # Learning content
├── examples/           # Example .mx files
├── datasets/           # Sample data
└── docs/               # Documentation
```

### Running Tests

```bash
# Run full test suite
node mex.js examples/99_full_test.mx

# Run specific test
node mex.js examples/05_full.mx

# Run lesson tests
node mex.js lesson 1
```

### Testing Changes

1. **Make your changes**
2. **Run the test suite**
   ```bash
   node mex.js examples/99_full_test.mx
   ```
3. **Test edge cases**
   ```bash
   # Test error handling
   node mex.js --run "invalid code"
   
   # Test all commands
   node mex.js --help
   node mex.js lessons
   node mex.js status
   ```

4. **Test on multiple platforms** (if possible)
   - Windows (PowerShell)
   - macOS (Terminal)
   - Linux (Bash)

---

## Code Style

### General Rules

- **No external dependencies** — MEX must work with zero npm packages
- **Clear variable names** — `error` not `err`, `prediction` not `pred`
- **Comments for complex logic** — Explain why, not what
- **Line length:** 80 characters max
- **Indentation:** 2 spaces

### JavaScript Style

```javascript
// Good
function calculateMean(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

// Bad
function calc(a){let s=0;for(let i=0;i<a.length;i++)s+=a[i];return s/a.length;}
```

### MEX Style

```mex
## Good
fn euclidean(a, b) {
  let sum = 0
  for i in range(0, len(a)) {
    let diff = a[i] - b[i]
    sum = sum + diff * diff
  }
  return sqrt(sum)
}

## Bad
fn e(a,b){let s=0;for i in range(0,len(a)){let d=a[i]-b[i];s=s+d*d}return sqrt(s)}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions | camelCase | `calculateMean` |
| Variables | camelCase | `trainingData` |
| Constants | UPPER_SNAKE | `MAX_EPOCHS` |
| Files | snake_case | `lexer.js` |
| Lessons | number_name | `01_what_is_data.mx` |

---

## Pull Request Process

### 1. Create a Branch

```bash
# From main
git checkout -b feature/your-feature-name

# From issue
git checkout -b fix/issue-123
```

### 2. Make Changes

- Write code
- Add tests if applicable
- Update documentation if needed

### 3. Commit

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: add sort_by builtin for array sorting"

# Or for bug fixes
git commit -m "fix: k-NN euclidean function now compares only features"
```

**Commit Message Format:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting (no code change)
- `refactor:` — Code restructuring
- `test:` — Adding tests
- `chore:` — Maintenance

### 4. Push

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the template
4. Submit

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Lesson content

## Testing
- [ ] Ran test suite (`node mex.js examples/99_full_test.mx`)
- [ ] Tested on Windows/macOS/Linux
- [ ] Added new tests if applicable

## Checklist
- [ ] Code follows project style
- [ ] No external dependencies added
- [ ] Documentation updated
- [ ] Commit messages are clear
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainer
3. **Merge** after approval

---

## Issue Templates

### Bug Report

```markdown
**Title:** [Bug]: Clear description

**Describe the bug:**
A clear description of what the bug is.

**To reproduce:**
Steps to reproduce the behavior:
1. Run `node mex.js ...`
2. See error

**Expected behavior:**
What you expected to happen.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Node.js: [e.g., v18.0.0]
- MEX version: [e.g., 0.6.1]
```

### Feature Request

```markdown
**Title:** [Feature]: Clear description

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution:**
What you want to happen.

**Describe alternatives:**
Other solutions you've considered.

**Additional context:**
Any other context or screenshots.
```

### Lesson Request

```markdown
**Title:** [Lesson]: Topic

**Topic:**
What should this lesson teach?

**Prerequisites:**
What should learners know first?

**Learning objectives:**
- [ ] Objective 1
- [ ] Objective 2

**Assessment:**
How should we test if they learned it?
```

---

## Community

### Communication

- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Questions, ideas, show-and-tell
- **Pull Requests:** Code contributions

### Getting Help

- Read the [README.md](README.md)
- Check [DOCUMENTATION.md](DOCUMENTATION.md)
- Look at [examples/](examples/) for working code
- Open a discussion on GitHub

### Showing Your Work

Built something with MEX? Share it!

- Open a discussion with "Show and Tell" tag
- Tweet with #MEXLanguage
- Write a blog post

---

## Recognition

Contributors will be recognized in:

- **README.md** — All contributors listed
- **CHANGES.md** — Your contributions noted
- **Release notes** — Major contributions highlighted

---

## Questions?

Open a discussion on GitHub or reach out to the maintainer.

Thank you for contributing to MEX! 🚀
