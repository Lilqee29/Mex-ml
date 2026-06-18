# Installation & Setup Guide

Everything you need to run MEX (Machine Learning EXpression Language) on your machine.

---

## Quick Start (2 minutes)

### Prerequisites

- **Node.js** (v14 or higher) — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

### Step 1: Clone or Download

```bash
# Option A: Clone with Git
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Option B: Download ZIP
# Download from GitHub, extract, open terminal in folder
```

### Step 2: Verify Node.js

```bash
node --version
# Should show: v14.x.x or higher

npm --version
# Should show: 6.x.x or higher
```

### Step 3: Run Your First MEX Program

```bash
node mex.js examples/01_data.mx
```

**Expected output:**
```
Data loaded: 5 points
Features: 2
```

**That's it!** MEX is ready to use.

---

## Detailed Installation

### Windows

#### Option 1: PowerShell (Recommended)
```powershell
# Clone repository
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Verify installation
node mex.js examples/05_full.mx
```

#### Option 2: Command Prompt
```cmd
# Clone repository
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Verify installation
node mex.js examples\05_full.mx
```

#### Option 3: Windows Subsystem for Linux (WSL)
```bash
# Clone repository
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Verify installation
node mex.js examples/05_full.mx
```

### macOS

```bash
# Clone repository
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Verify installation
node mex.js examples/05_full.mx
```

### Linux

```bash
# Clone repository
git clone https://github.com/yourusername/mex-language.git
cd mex-language

# Verify installation
node mex.js examples/05_full.mx
```

---

## First-Time Setup

### 1. Create a Working Directory

```bash
# Create a folder for your MEX projects
mkdir my-mex-projects
cd my-mex-projects
```

### 2. Create Your First .mx File

```bash
# Create a file called hello.mx
echo 'data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
train 100 epochs
predict 5' > hello.mx
```

### 3. Run It

```bash
node ../mex-language/mex.js hello.mx
```

### 4. Set Up Aliases (Optional)

#### PowerShell (Windows)
```powershell
# Add to PowerShell profile
notepad $PROFILE

# Add this line:
function mex { node "C:\path\to\mex-language\mex.js" $args }

# Restart PowerShell, then use:
mex hello.mx
```

#### Bash (macOS/Linux)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias mex='node /path/to/mex-language/mex.js'

# Reload shell
source ~/.bashrc

# Use:
mex hello.mx
```

---

## CLI Commands Reference

### Basic Commands

```bash
# Run a .mx file
node mex.js <file.mx>

# Run inline code
node mex.js --run "data points\n  (1, 2)\nshow data"

# Show help
node mex.js --help
```

### Learning Commands

```bash
# Start a lesson
node mex.js lesson <number>

# Try a challenge
node mex.js challenge <number>

# List all lessons
node mex.js lessons

# Check your progress
node mex.js status

# View achievements
node mex.js achievements

# Get a hint
node mex.js hint <lesson-number>

# Unlock next lesson
node mex.js unlock

# Reset progress
node mex.js reset
```

### Code Generation Commands

```bash
# Generate TensorFlow.js code
node mex.js --generate <file.mx>

# Generate Python/TensorFlow code
node mex.js --python <file.mx>

# Show TF.js equivalent alongside MEX
node mex.js --show-tf <file.mx>

# Show compression statistics
node mex.js --stats <file.mx>
```

### Practice Commands

```bash
# List practice templates
node mex.js practice

# Run a practice template
node mex.js --run-practice <topic>

# Topics: linear, classify, neural, data, csv

# Check practice history
node mex.js practice-status
```

---

## Troubleshooting

### Common Issues

#### "Node.js is not recognized"
**Solution:** Install Node.js from https://nodejs.org/ and restart your terminal.

#### "File not found"
**Solution:** Check the file path. Use forward slashes `/` or escaped backslashes `\\`.

```bash
# Correct
node mex.js examples/05_full.mx

# Also correct
node mex.js examples\\05_full.mx

# Wrong
node mex.js examples\05_full.mx
```

#### "Cannot find module"
**Solution:** Make sure you're in the MEX directory.

```bash
cd /path/to/mex-language
node mex.js examples/05_full.mx
```

#### PowerShell URL Error
**Solution:** Don't use `&` operator with URLs. Run commands separately.

```powershell
# Wrong
node mex.js --generate examples/05_full.mx & node mex.js --python examples/05_full.mx

# Correct
node mex.js --generate examples/05_full.mx
node mex.js --python examples/05_full.mx
```

#### WSL Disk Mount Error
**Solution:** Use PowerShell or Command Prompt instead of WSL on Windows.

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10, macOS 10.15, or Linux (any recent distro)
- **Node.js:** v14.0.0 or higher
- **RAM:** 256 MB
- **Disk:** 50 MB free space

### Recommended
- **OS:** Windows 11, macOS 13, or Ubuntu 22.04
- **Node.js:** v18.0.0 or higher
- **RAM:** 512 MB
- **Disk:** 100 MB free space

---

## Verification

After installation, run these commands to verify everything works:

```bash
# 1. Check Node.js
node --version
# Expected: v14.x.x or higher

# 2. Check MEX CLI
node mex.js --help
# Expected: Shows help text with all commands

# 3. Run a simple example
node mex.js examples/01_data.mx
# Expected: Shows data loading output

# 4. Run the full test suite
node mex.js examples/99_full_test.mx
# Expected: ALL TESTS PASSED

# 5. Check compression stats
node mex.js --stats examples/05_full.mx
# Expected: Shows MEX lines vs TF.js/Python lines
```

---

## Next Steps

After installation, try:

1. **Read the [README.md](README.md)** — overview of MEX
2. **Start [Lesson 1](lessons/01_what_is_data.mx)** — learn data basics
3. **Try [examples/05_full.mx](examples/05_full.mx)** — see a complete ML workflow
4. **Read [DOCUMENTATION.md](DOCUMENTATION.md)** — full language reference

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/yourusername/mex-language/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/mex-language/discussions)
- **Email:** your.email@example.com

---

## Uninstallation

To remove MEX, simply delete the folder:

```bash
# Windows
rmdir /s /q C:\path\to\mex-language

# macOS/Linux
rm -rf /path/to/mex-language
```

No system-wide changes were made during installation.
