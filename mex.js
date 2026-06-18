#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
//  MEX — ML Learning Language
//  CLI Entry Point
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { tokenize } = require('./lib/lexer');
const { parse } = require('./lib/parser');
const { interpret } = require('./lib/interpreter');
const { generate } = require('./lib/generator');
const learning = require('./lib/learning');

// ── CLI ────────────────────────────────────────────
const args = process.argv.slice(2);
const pkg = require('./package.json');

// ── --help flag ────────────────────────────────────
if (args[0] === '--help' || args[0] === '-h') {
  console.log('');
  console.log('  MEX — ML Learning Language v' + pkg.version);
  console.log('  ─────────────────────────────────────');
  console.log('');
  console.log('  Quick Start:');
  console.log('    mex init                        Create a new MEX project');
  console.log('    mex new <name>                  Create a new .mx file');
  console.log('    mex run <file.mx>               Run a .mx file');
  console.log('    mex repl                        Start interactive mode');
  console.log('');
  console.log('  Usage:');
  console.log('    mex <file.mx>                   Run a .mx file');
  console.log('    mex --generate <file.mx>        Generate TensorFlow.js code');
  console.log('    mex --python <file.mx>          Generate Python/TensorFlow code');
  console.log('    mex --show-tf <file.mx>         Show TF.js equivalent alongside MEX');
  console.log('    mex --stats <file.mx>           Show compression statistics');
  console.log('    mex --run "code here"            Run inline code');
  console.log('');
  console.log('  Learning:');
  console.log('    mex lesson <number>             Run a lesson');
  console.log('    mex challenge <number>          Run a challenge (scored)');
  console.log('    mex lessons                     List all lessons');
  console.log('    mex status                      Show your progress');
  console.log('    mex hint <lesson>               Get a hint');
  console.log('    mex unlock                      Show unlock status');
  console.log('    mex achievements                Show achievements');
  console.log('    mex reset                       Reset all progress');
  console.log('');
  console.log('  Practice:');
  console.log('    mex practice                    List practice topics');
  console.log('    mex practice <topic>            Practice a specific topic');
  console.log('    mex --run-practice <topic>      Run a practice template');
  console.log('    mex practice-status             Show practice history');
  console.log('');
  console.log('  Packages:');
  console.log('    mex install <package>          Install a package');
  console.log('    mex publish                    Publish your package');
  console.log('    mex packages                   List installed packages');
  console.log('    mex search <query>             Search for packages');
  console.log('');
  console.log('  Info:');
  console.log('    mex --version                  Show version');
  console.log('    mex --help                     Show this help');
  console.log('');
  process.exit(0);
}

// ── --version flag ─────────────────────────────────
if (args[0] === '--version' || args[0] === '-v') {
  console.log('mex-ml v' + pkg.version);
  process.exit(0);
}

if (args.length === 0) {
  console.log('');
  console.log('  MEX — ML Learning Language v' + pkg.version);
  console.log('  ─────────────────────────────────────');
  console.log('');
  console.log('  Quick Start:');
  console.log('    mex init                        Create a new MEX project');
  console.log('    mex new <name>                  Create a new .mx file');
  console.log('    mex run <file.mx>               Run a .mx file');
  console.log('    mex repl                        Start interactive mode');
  console.log('');
  console.log('  Usage:');
  console.log('    mex <file.mx>                   Run a .mx file');
  console.log('    mex --generate <file.mx>        Generate TensorFlow.js code');
  console.log('    mex --python <file.mx>          Generate Python/TensorFlow code');
  console.log('    mex --show-tf <file.mx>         Show TF.js equivalent alongside MEX');
  console.log('    mex --stats <file.mx>           Show compression statistics');
  console.log('    mex --run "code here"            Run inline code');
  console.log('');
  console.log('  Learning:');
  console.log('    mex lesson <number>             Run a lesson');
  console.log('    mex challenge <number>          Run a challenge (scored)');
  console.log('    mex lessons                     List all lessons');
  console.log('    mex status                      Show your progress');
  console.log('    mex hint <lesson>               Get a hint');
  console.log('    mex unlock                      Show unlock status');
  console.log('    mex achievements                Show achievements');
  console.log('    mex reset                       Reset all progress');
  console.log('');
  console.log('  Practice:');
  console.log('    mex practice                    List practice topics');
  console.log('    mex practice <topic>            Practice a specific topic');
  console.log('    mex --run-practice <topic>      Run a practice template');
  console.log('    mex practice-status             Show practice history');
  console.log('');
  console.log('  Examples:');
  console.log('    mex init');
  console.log('    mex new hello');
  console.log('    mex run hello.mx');
  console.log('    mex lesson 1');
  console.log('    mex challenge 1');
  console.log('    mex practice linear');
  console.log('');
  console.log('  Packages:');
  console.log('    mex install <package>          Install a package');
  console.log('    mex publish                    Publish your package');
  console.log('    mex packages                   List installed packages');
  console.log('    mex search <query>             Search for packages');
  console.log('');
  console.log('  Info:');
  console.log('    mex --version                  Show version');
  console.log('    mex --help                     Show all commands');
  console.log('');
  process.exit(0);
}

// ── Init Command ───────────────────────────────────
// Creates a new MEX project in the current directory
if (args[0] === 'init') {
  const projectName = args[1] || 'my-mex-project';
  const projectPath = path.join(process.cwd(), projectName);
  
  console.log('');
  console.log('  🚀 Creating new MEX project: ' + projectName);
  console.log('');
  
  // Create project directory
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  
  // Create examples directory
  const examplesPath = path.join(projectPath, 'examples');
  if (!fs.existsSync(examplesPath)) {
    fs.mkdirSync(examplesPath, { recursive: true });
  }
  
  // Create datasets directory
  const datasetsPath = path.join(projectPath, 'datasets');
  if (!fs.existsSync(datasetsPath)) {
    fs.mkdirSync(datasetsPath, { recursive: true });
  }
  
  // Create hello.mx
  const helloContent = `## Hello MEX! 🎉
## This is your first ML program

## Data: (input, output) pairs
data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)

## Create a simple linear model
model simple

## Train for 100 epochs
train 100 epochs

## Predict the output for input 5
predict 5
`;
  fs.writeFileSync(path.join(projectPath, 'hello.mx'), helloContent);
  
  // Create README.md
  const readmeContent = `# ${projectName}

A MEX project for learning machine learning.

## Quick Start

\`\`\`bash
# Run your first program
mex hello.mx

# Start learning
mex lesson 1

# See all commands
mex --help
\`\`\`

## What is MEX?

MEX is a beginner-friendly language that teaches machine learning through clean, readable code.

## Examples

\`\`\`mex
## Simple linear regression
data points
  (1, 2)
  (2, 4)
  (3, 6)

model simple
train 100 epochs
predict 5
\`\`\`

## Learn More

- [Documentation](https://github.com/yourusername/mex-lang)
- [Lessons](https://github.com/yourusername/mex-lang/tree/main/lessons)
- [Examples](https://github.com/yourusername/mex-lang/tree/main/examples)
`;
  fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);
  
  // Create .gitignore
  const gitignoreContent = `# MEX runtime files
progress.json
practice.json

# Node.js
node_modules/

# OS files
.DS_Store
Thumbs.db
`;
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent);
  
  console.log('  ✅ Created project structure:');
  console.log('');
  console.log('    ' + projectName + '/');
  console.log('    ├── hello.mx          # Your first MEX program');
  console.log('    ├── README.md         # Project documentation');
  console.log('    ├── .gitignore        # Git ignore rules');
  console.log('    ├── examples/         # Example .mx files');
  console.log('    └── datasets/         # Your data files');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log('    cd ' + projectName);
  console.log('    mex hello.mx          # Run your first program');
  console.log('    mex lesson 1          # Start learning');
  console.log('    mex --help            # See all commands');
  console.log('');
  process.exit(0);
}

// ── Install Command ─────────────────────────────────
// Downloads and installs a MEX package
if (args[0] === 'install') {
  const pkgName = args[1];
  
  if (!pkgName) {
    console.log('');
    console.log('  Usage: mex install <package>');
    console.log('');
    console.log('  Examples:');
    console.log('    mex install @mex/stats         # Statistics package');
    console.log('    mex install @mex/viz           # Visualization package');
    console.log('    mex install @mex/ml            # Advanced ML package');
    console.log('');
    console.log('  Packages are .mx files that can be imported:');
    console.log('    import "@mex/stats" as stats');
    console.log('    let mean = stats.mean([1, 2, 3])');
    console.log('');
    process.exit(1);
  }
  
  console.log('');
  console.log(`  📦 Installing ${pkgName}...`);
  console.log('');
  
  // Create packages directory if it doesn't exist
  const packagesDir = path.join(process.cwd(), 'packages');
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
  }
  
  // Check if package already installed
  const pkgPath = path.join(packagesDir, pkgName.replace('/', '_') + '.mx');
  if (fs.existsSync(pkgPath)) {
    console.log(`  ✅ ${pkgName} is already installed`);
    console.log('');
    process.exit(0);
  }
  
  // Create a placeholder package (in real implementation, this would download from a registry)
  const pkgContent = `## ${pkgName} - MEX Package
## Installed via mex install

export fn hello() {
  return "Hello from ${pkgName}!"
}
`;
  
  fs.writeFileSync(pkgPath, pkgContent);
  
  console.log(`  ✅ Installed ${pkgName}`);
  console.log('');
  console.log('  Usage:');
  console.log(`    import "${pkgName}" as pkg`);
  console.log('    pkg.hello()');
  console.log('');
  process.exit(0);
}

// ── Publish Command ─────────────────────────────────
// Publishes current project as a MEX package
if (args[0] === 'publish') {
  console.log('');
  console.log('  📤 Publishing MEX package...');
  console.log('');
  
  // Check if mex.json exists
  const manifestPath = path.join(process.cwd(), 'mex.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('  ❌ No mex.json found. Run "mex init" first or create a mex.json:');
    console.log('');
    console.log('  {');
    console.log('    "name": "@yourname/mypackage",');
    console.log('    "version": "1.0.0",');
    console.log('    "description": "My MEX package",');
    console.log('    "main": "index.mx"');
    console.log('  }');
    console.log('');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`  Package: ${manifest.name}`);
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Description: ${manifest.description || 'N/A'}`);
  console.log('');
  console.log('  ✅ Package ready to publish!');
  console.log('');
  console.log('  To publish to npm:');
  console.log('    npm publish');
  console.log('');
  console.log('  To share directly:');
  console.log('    Upload your .mx file to GitHub');
  console.log('    Others can install with: mex install <your-repo>');
  console.log('');
  process.exit(0);
}

// ── Packages Command ────────────────────────────────
// Lists installed packages
if (args[0] === 'packages') {
  const packagesDir = path.join(process.cwd(), 'packages');
  
  console.log('');
  console.log('  📦 Installed Packages');
  console.log('  ─────────────────────');
  console.log('');
  
  if (!fs.existsSync(packagesDir)) {
    console.log('  No packages installed yet.');
    console.log('');
    console.log('  Install a package:');
    console.log('    mex install @mex/stats');
    console.log('');
    process.exit(0);
  }
  
  const packages = fs.readdirSync(packagesDir).filter(f => f.endsWith('.mx'));
  
  if (packages.length === 0) {
    console.log('  No packages installed yet.');
    console.log('');
    console.log('  Install a package:');
    console.log('    mex install @mex/stats');
    console.log('');
    process.exit(0);
  }
  
  packages.forEach(pkg => {
    console.log(`  • ${pkg.replace('.mx', '').replace('_', '/')}`);
  });
  
  console.log('');
  process.exit(0);
}

// ── Search Command ──────────────────────────────────
// Searches for MEX packages
if (args[0] === 'search') {
  const query = args[1] || '';
  
  console.log('');
  console.log('  🔍 Searching for MEX packages...');
  console.log('');
  
  // In a real implementation, this would search a registry
  // For now, show available official packages
  const officialPackages = [
    { name: '@mex/stats', desc: 'Statistics functions (mean, median, std, etc.)' },
    { name: '@mex/viz', desc: 'Visualization (charts, graphs, plots)' },
    { name: '@mex/ml', desc: 'Advanced ML algorithms (SVM, trees, clustering)' },
    { name: '@mex/data', desc: 'DataFrame operations and data manipulation' },
    { name: '@mex/utils', desc: 'Utility functions and helpers' },
  ];
  
  const filtered = query
    ? officialPackages.filter(p => p.name.includes(query) || p.desc.includes(query))
    : officialPackages;
  
  if (filtered.length === 0) {
    console.log(`  No packages found for "${query}"`);
    console.log('');
    process.exit(0);
  }
  
  console.log('  Official Packages:');
  console.log('');
  
  filtered.forEach(pkg => {
    console.log(`  ${pkg.name}`);
    console.log(`    ${pkg.desc}`);
    console.log('');
  });
  
  console.log('  Install with: mex install <package-name>');
  console.log('');
  process.exit(0);
}

// ── New Command ────────────────────────────────────
// Creates a new .mx file with a template
if (args[0] === 'new') {
  const fileName = args[1];
  
  if (!fileName) {
    console.log('');
    console.log('  Usage: mex new <filename>');
    console.log('');
    console.log('  Examples:');
    console.log('    mex new hello        # Creates hello.mx');
    console.log('    mex new my_model     # Creates my_model.mx');
    console.log('');
    process.exit(1);
  }
  
  // Add .mx extension if not provided
  const fullFileName = fileName.endsWith('.mx') ? fileName : fileName + '.mx';
  const filePath = path.join(process.cwd(), fullFileName);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log('');
    console.log('  ❌ File already exists: ' + fullFileName);
    console.log('');
    console.log('  Use a different name or delete the existing file.');
    console.log('');
    process.exit(1);
  }
  
  // Create template content
  const templateContent = `## ${fileName}
## Created with MEX — ML Learning Language

## Data: (input, output) pairs
data points
  (1, 2)
  (2, 4)
  (3, 6)

## Create a model
model simple

## Train
train 100 epochs

## Predict
predict 5
`;
  
  fs.writeFileSync(filePath, templateContent);
  
  console.log('');
  console.log('  ✅ Created: ' + fullFileName);
  console.log('');
  console.log('  Run it:');
  console.log('    mex ' + fullFileName);
  console.log('');
  process.exit(0);
}

// ── Run Command ────────────────────────────────────
// Shorthand for running a .mx file
if (args[0] === 'run') {
  const fileName = args[1];
  
  if (!fileName) {
    console.log('');
    console.log('  Usage: mex run <file.mx>');
    console.log('');
    console.log('  Examples:');
    console.log('    mex run hello.mx');
    console.log('    mex run examples/05_full.mx');
    console.log('');
    process.exit(1);
  }
  
  // Add .mx extension if not provided
  const fullFileName = fileName.endsWith('.mx') ? fileName : fileName + '.mx';
  const filePath = path.join(process.cwd(), fullFileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('');
    console.log('  ❌ File not found: ' + fullFileName);
    console.log('');
    console.log('  Create it with: mex new ' + fileName);
    console.log('');
    process.exit(1);
  }
  
  // Run the file (same as running mex.js directly)
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const tokens = tokenize(code);
    const ast = parse(tokens);
    interpret(ast);
  } catch (error) {
    console.error('');
    console.error('  ❌ Error: ' + error.message);
    console.error('');
    process.exit(1);
  }
  
  process.exit(0);
}

// ── REPL Command ───────────────────────────────────
// Interactive mode for running MEX code line by line
if (args[0] === 'repl') {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mex> '
  });

  console.log('');
  console.log('  MEX Interactive Mode (REPL)');
  console.log('  ───────────────────────────');
  console.log('');
  console.log('  Type MEX code and press Enter to run it.');
  console.log('  Commands: .help, .quit, .clear, .vars, .funcs');
  console.log('');

  // Persistent state across lines
  const replState = {
    variables: {},
    functions: {},
    output: []
  };

  rl.prompt();

  rl.on('line', (line) => {
    const trimmed = line.trim();
    
    // Handle REPL commands
    if (trimmed === '.quit' || trimmed === '.exit') {
      console.log('  Goodbye!');
      process.exit(0);
    }
    
    if (trimmed === '.help') {
      console.log('');
      console.log('  REPL Commands:');
      console.log('    .help       Show this help');
      console.log('    .quit       Exit REPL');
      console.log('    .clear      Clear screen');
      console.log('    .vars       Show all variables');
      console.log('    .funcs      Show all functions');
      console.log('');
      console.log('  MEX Examples:');
      console.log('    let x = 5');
      console.log('    print("Hello!")');
      console.log('    data points\\n  (1, 2)\\n  (3, 4)');
      console.log('    model simple');
      console.log('    train 100 epochs');
      console.log('');
      rl.prompt();
      return;
    }
    
    if (trimmed === '.clear') {
      console.clear();
      rl.prompt();
      return;
    }
    
    if (trimmed === '.vars') {
      console.log('');
      console.log('  Variables:');
      for (const [name, value] of Object.entries(replState.variables)) {
        console.log(`    ${name} = ${JSON.stringify(value)}`);
      }
      console.log('');
      rl.prompt();
      return;
    }
    
    if (trimmed === '.funcs') {
      console.log('');
      console.log('  Functions:');
      for (const name of Object.keys(replState.functions)) {
        console.log(`    ${name}()`);
      }
      console.log('');
      rl.prompt();
      return;
    }
    
    // Skip empty lines
    if (!trimmed) {
      rl.prompt();
      return;
    }
    
    // Execute MEX code
    try {
      const tokens = tokenize(trimmed);
      const ast = parse(tokens);
      const result = interpret(ast);
      
      // Print output
      if (result && result.length > 0) {
        for (const line of result) {
          console.log('  ' + line);
        }
      }
    } catch (error) {
      console.error('  ❌ Error: ' + error.message);
    }
    
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('  Goodbye!');
    process.exit(0);
  });

  return;
}

// ── Load Progress ──────────────────────────────────
const progress = learning.loadProgress();

// ── Lessons Command ────────────────────────────────
if (args[0] === 'lessons') {
  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Available Lessons');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');

  learning.lessons.forEach(l => {
    const isUnlocked = learning.isLessonUnlocked(l.num, progress);
    const isCompleted = progress.completedLessons.includes(l.num);
    const score = progress.scores[l.num];

    let status, color;
    if (isCompleted) {
      status = '✓';
      color = 'green';
    } else if (isUnlocked) {
      status = '○';
      color = 'yellow';
    } else {
      status = '🔒';
      color = 'red';
    }

    const scoreStr = score ? ` [${score}%]` : '';
    console.log(`    ${status} ${l.num}. ${l.title}${scoreStr}`);
    console.log(`         ${l.desc}`);
  });

  console.log('');
  console.log('  Commands:');
  console.log('    node mex.js lesson <number>    Run a lesson');
  console.log('    node mex.js challenge <number> Run challenge (scored)');
  console.log('    node mex.js status             Show progress');
  console.log('    node mex.js hint <number>      Get a hint');
  console.log('');
  process.exit(0);
}

// ── Lesson Runner ──────────────────────────────────
if (args[0] === 'lesson') {
  const num = parseInt(args[1]);
  const lesson = learning.lessons.find(l => l.num === num);

  if (!lesson) {
    console.error(`Error: Lesson ${num} not found. Use "node mex.js lessons" to see available lessons.`);
    process.exit(1);
  }

  // Check if unlocked
  if (!learning.isLessonUnlocked(num, progress)) {
    const msg = learning.getUnlockMessage(num, progress);
    console.log('');
    console.log(`  ${msg}`);
    console.log('');
    process.exit(1);
  }

  const lessonPath = path.join(__dirname, 'lessons', lesson.file);
  if (!fs.existsSync(lessonPath)) {
    console.error(`Error: Lesson file not found: ${lessonPath}`);
    process.exit(1);
  }

  console.log('');
  console.log(`  Running Lesson ${num}: ${lesson.title}`);
  console.log('  ─'.repeat(25));
  console.log('');

  const source = fs.readFileSync(lessonPath, 'utf-8');
  const tokens = tokenize(source);
  const ast = parse(tokens);
  const output = interpret(ast);
  output.forEach(line => console.log(line));

  // Mark as completed if not already
  if (!progress.completedLessons.includes(num)) {
    progress.completedLessons.push(num);
    learning.saveProgress(progress);
    console.log('');
    console.log(`  ✓ Lesson ${num} completed!`);

    // Check what's unlocked next
    const nextLesson = learning.lessons.find(l => l.num === num + 1);
    if (nextLesson && learning.isLessonUnlocked(nextLesson.num, progress)) {
      console.log(`  🔓 Lesson ${nextLesson.num} (${nextLesson.title}) is now UNLOCKED!`);
    }
  }

  process.exit(0);
}

// ── Status Command ─────────────────────────────────
if (args[0] === 'status') {
  const summary = learning.getProgressSummary(progress);

  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Your Progress');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');
  console.log(`  Lessons completed: ${summary.completed} / ${summary.total}`);
  console.log(`  Progress: ${summary.percentComplete}%`);
  console.log(`  Average score: ${summary.averageScore}%`);
  console.log(`  Hints used: ${summary.totalHintsUsed}`);
  console.log('');

  // Show bar
  const filled = Math.round(summary.percentComplete / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  console.log(`  [${bar}] ${summary.percentComplete}%`);
  console.log('');

  // Show next lesson
  const next = learning.getNextLockedLesson(progress);
  if (next) {
    console.log(`  Next: Lesson ${next.num} — ${next.title}`);
    console.log(`  ${learning.getUnlockMessage(next.num, progress)}`);
  } else if (summary.completed === summary.total) {
    console.log('  🎉 You completed all lessons!');
  }

  // Show achievements
  console.log(`  Achievements: ${summary.achievementsEarned} / ${summary.totalAchievements}`);
  console.log('');
  process.exit(0);
}

// ── Achievements Command ───────────────────────────
if (args[0] === 'achievements') {
  const allAchievements = learning.getAllAchievements(progress);

  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Achievements');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');

  allAchievements.forEach(a => {
    const status = a.earned ? '✓' : '○';
    const icon = a.earned ? a.icon : '○';
    console.log(`  ${icon} ${status} ${a.name}`);
    console.log(`      ${a.desc}`);
  });

  const earned = allAchievements.filter(a => a.earned).length;
  console.log('');
  console.log(`  Earned: ${earned} / ${allAchievements.length}`);
  console.log('');
  process.exit(0);
}

// ── Practice Command ──────────────────────────────
if (args[0] === 'practice') {
  const { runPractice } = require('./lib/practice');
  runPractice(args[1]);
  process.exit(0);
}

if (args[0] === '--run-practice') {
  const { runPracticeTemplate } = require('./lib/practice');
  runPracticeTemplate(args[1]);
  process.exit(0);
}

if (args[0] === 'practice-status') {
  const { loadPracticeProgress, practiceTemplates } = require('./lib/practice');
  const progress = loadPracticeProgress();
  
  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Practice Status');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');
  
  const topics = Object.keys(practiceTemplates);
  topics.forEach(topic => {
    const stats = progress.topics[topic];
    const count = stats ? stats.count : 0;
    const last = stats ? new Date(stats.lastPracticed).toLocaleDateString() : 'Never';
    console.log(`  ${topic.padEnd(12)} - Practiced ${count} times (Last: ${last})`);
  });
  
  console.log('');
  console.log(`  Total sessions: ${progress.sessions.length}`);
  console.log('');
  process.exit(0);
}

// ── Hint Command ───────────────────────────────────
if (args[0] === 'hint') {
  const num = parseInt(args[1]);
  const lesson = learning.lessons.find(l => l.num === num);

  if (!lesson) {
    console.error(`Error: Lesson ${num} not found.`);
    process.exit(1);
  }

  // Check if unlocked
  if (!learning.isLessonUnlocked(num, progress)) {
    const msg = learning.getUnlockMessage(num, progress);
    console.log('');
    console.log(`  ${msg}`);
    console.log('');
    process.exit(1);
  }

  // Get hint index (how many times they've used hints for this lesson)
  const hintIndex = progress.hintsUsed[num] || 0;
  const hint = learning.getHint(num, hintIndex);

  // Record hint usage
  learning.useHint(num, progress);

  console.log('');
  console.log(`  Hint for Lesson ${num}: ${lesson.title}`);
  console.log('  ─'.repeat(25));
  console.log('');
  console.log(`  ${hint}`);
  console.log('');

  if (hintIndex < lesson.hints.length - 1) {
    console.log(`  More hints available. Used ${hintIndex + 1}/${lesson.hints.length}`);
  } else {
    console.log('  No more hints for this lesson.');
  }

  console.log('');
  process.exit(0);
}

// ── Challenge Command ──────────────────────────────
if (args[0] === 'challenge') {
  const num = parseInt(args[1]);
  const lesson = learning.lessons.find(l => l.num === num);

  if (!lesson) {
    console.error(`Error: Lesson ${num} not found.`);
    process.exit(1);
  }

  // Check if unlocked
  if (!learning.isLessonUnlocked(num, progress)) {
    const msg = learning.getUnlockMessage(num, progress);
    console.log('');
    console.log(`  ${msg}`);
    console.log('');
    process.exit(1);
  }

  const challengePath = path.join(__dirname, 'lessons', lesson.challengeFile);
  if (!fs.existsSync(challengePath)) {
    console.error(`Error: Challenge file not found: ${challengePath}`);
    process.exit(1);
  }

  console.log('');
  console.log(`  Challenge ${num}: ${lesson.title}`);
  console.log('  ─'.repeat(25));
  console.log('');

  const source = fs.readFileSync(challengePath, 'utf-8');
  const tokens = tokenize(source);
  const ast = parse(tokens);
  const output = interpret(ast);
  output.forEach(line => console.log(line));

  // Calculate score (based on number of challenges - for now give completion score)
  const score = 100; // Will be updated with real scoring later
  learning.completeLesson(num, score, progress);

  console.log('');
  console.log(`  Challenge complete! Score: ${score}%`);

  // Check what's unlocked
  const nextLesson = learning.lessons.find(l => l.num === num + 1);
  if (nextLesson && learning.isLessonUnlocked(nextLesson.num, progress)) {
    console.log(`  🔓 Lesson ${nextLesson.num} (${nextLesson.title}) is now UNLOCKED!`);
  }

  console.log('');
  process.exit(0);
}

// ── Unlock Command ─────────────────────────────────
if (args[0] === 'unlock') {
  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Unlock Status');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');

  learning.lessons.forEach(l => {
    const msg = learning.getUnlockMessage(l.num, progress);
    console.log(`  ${msg}`);
  });

  console.log('');
  console.log('  Complete lessons to unlock more!');
  console.log('');
  process.exit(0);
}

// ── Reset Command ──────────────────────────────────
if (args[0] === 'reset') {
  console.log('');
  console.log('  ⚠️  This will reset ALL your progress.');
  console.log('  Are you sure? (type "yes" to confirm)');

  // For now, just reset without confirmation in non-interactive mode
  const defaultProgress = learning.getDefaultProgress();
  learning.saveProgress(defaultProgress);

  console.log('');
  console.log('  Progress has been reset.');
  console.log('');
  process.exit(0);
}

// ── Learn Mode ─────────────────────────────────────
if (args[0] === 'learn') {
  console.log('');
  console.log('  ═══════════════════════════════════════════════');
  console.log('    MEX — Learn Machine Learning');
  console.log('  ═══════════════════════════════════════════════');
  console.log('');

  const summary = learning.getProgressSummary(progress);
  console.log(`  Progress: ${summary.completed}/${summary.total} lessons (${summary.percentComplete}%)`);
  console.log('');

  learning.lessons.forEach(l => {
    const isUnlocked = learning.isLessonUnlocked(l.num, progress);
    const isCompleted = progress.completedLessons.includes(l.num);

    let status;
    if (isCompleted) {
      status = '✓';
    } else if (isUnlocked) {
      status = '○';
    } else {
      status = '🔒';
    }

    console.log(`    ${status} ${l.num}. ${l.title}`);
  });

  console.log('');
  console.log('  Commands:');
  console.log('    node mex.js lesson <number>    Run a lesson');
  console.log('    node mex.js challenge <number> Run challenge');
  console.log('    node mex.js status             Show progress');
  console.log('    node mex.js hint <number>      Get a hint');
  console.log('');
  process.exit(0);
}

// ── Generate Mode ──────────────────────────────────
let source;
let generateMode = false;
let generateLanguage = 'tfjs'; // default: tensorflow.js

if (args[0] === '--generate') {
  generateMode = true;
  generateLanguage = 'tfjs';
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  source = fs.readFileSync(filePath, 'utf-8');
} else if (args[0] === '--python') {
  generateMode = true;
  generateLanguage = 'python';
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  source = fs.readFileSync(filePath, 'utf-8');
} else if (args[0] === '--show-tf') {
  generateMode = true;
  generateLanguage = 'show-tf';
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  source = fs.readFileSync(filePath, 'utf-8');
} else if (args[0] === '--stats') {
  generateMode = true;
  generateLanguage = 'stats';
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  source = fs.readFileSync(filePath, 'utf-8');
} else if (args[0] === '--run') {
  source = args.slice(1).join(' ');
} else {
  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  source = fs.readFileSync(filePath, 'utf-8');
}

try {
  // 1. Tokenize
  const tokens = tokenize(source);

  // 2. Parse
  const ast = parse(tokens);

  if (generateMode) {
    if (generateLanguage === 'python') {
      // Generate Python/TensorFlow code
      const { generatePython } = require('./lib/python-generator');
      const pythonCode = generatePython(ast);
      console.log(pythonCode);
    } else if (generateLanguage === 'show-tf') {
      // Show MEX code with TF.js equivalents as comments
      console.log('═══════════════════════════════════════════════════════');
      console.log('  MEX Code with TensorFlow.js Equivalents');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      
      // Show the TF.js equivalent
      const tfjsCode = generate(ast);
      console.log('// TensorFlow.js equivalent:');
      console.log(tfjsCode);
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  Your MEX Code (runs automatically)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      
      // Also run the MEX code
      const output = interpret(ast);
      output.forEach(line => console.log(line));
    } else if (generateLanguage === 'stats') {
      // Show compression statistics
      const { generatePython } = require('./lib/python-generator');
      
      const mexCode = source.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('##')).length;
      const tfjsCode = generate(ast);
      const tfjsLines = tfjsCode.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
      const pythonCode = generatePython(ast);
      const pythonLines = pythonCode.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
      
      console.log('');
      console.log('  ═══════════════════════════════════════════════');
      console.log('    MEX — Compression Statistics');
      console.log('  ═══════════════════════════════════════════════');
      console.log('');
      console.log(`    MEX lines:      ${mexCode}`);
      console.log(`    TF.js lines:    ${tfjsLines}`);
      console.log(`    Python lines:   ${pythonLines}`);
      console.log('');
      console.log(`    TF.js ratio:    ${(tfjsLines / mexCode).toFixed(1)}x`);
      console.log(`    Python ratio:   ${(pythonLines / mexCode).toFixed(1)}x`);
      console.log('');
      console.log('  ═══════════════════════════════════════════════');
      console.log('');
    } else {
      // Generate TensorFlow.js code
      const tfjsCode = generate(ast);
      console.log(tfjsCode);
    }
  } else {
    // 3. Interpret
    const output = interpret(ast);

    // 4. Print output
    output.forEach(line => console.log(line));
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
