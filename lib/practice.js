// MEX Practice Mode
// Practice what you learned without formal lessons.
// Build faster than TensorFlow.js with MEX syntax.

const fs = require('fs');
const path = require('path');
const { tokenize } = require('./lexer');
const { parse } = require('./parser');
const { interpret } = require('./interpreter');
const { generate } = require('./generator');

// ── Practice Progress File ─────────────────────────
const PRACTICE_FILE = path.join(__dirname, '..', 'practice.json');

function loadPracticeProgress() {
  if (fs.existsSync(PRACTICE_FILE)) {
    return JSON.parse(fs.readFileSync(PRACTICE_FILE, 'utf-8'));
  }
  return { sessions: [], totalPracticeTime: 0, topics: {} };
}

function savePracticeProgress(progress) {
  fs.writeFileSync(PRACTICE_FILE, JSON.stringify(progress, null, 2));
}

function recordPractice(topic) {
  const progress = loadPracticeProgress();
  const now = new Date();
  
  if (!progress.topics[topic]) {
    progress.topics[topic] = { count: 0, lastPracticed: null };
  }
  
  progress.topics[topic].count++;
  progress.topics[topic].lastPracticed = now.toISOString();
  progress.sessions.push({ topic, timestamp: now.toISOString() });
  
  // Keep only last 100 sessions
  if (progress.sessions.length > 100) {
    progress.sessions = progress.sessions.slice(-100);
  }
  
  savePracticeProgress(progress);
  return progress.topics[topic];
}

// ── Practice Templates ─────────────────────────────
const practiceTemplates = {
  linear: {
    title: 'Linear Regression Practice',
    description: 'Practice predicting continuous values (like house prices)',
    template: `## Practice: Linear Regression
## Predict house prices based on square footage

data points
  (1000, 150)
  (1500, 200)
  (2000, 250)
  (2500, 300)
  (3000, 350)

model simple
train 200 epochs

## Try predicting different values!
predict 1800
predict 2200
predict 3500

show results
show accuracy`,
    hints: [
      'Change the data points to see how it affects predictions',
      'Try different numbers of epochs',
      'Add more data points for better accuracy'
    ]
  },
  
  classify: {
    title: 'Classification Practice',
    description: 'Practice categorizing data (spam/not spam, pass/fail)',
    template: `## Practice: Classification
## Predict pass/fail based on study hours

data points
  (1, 0)
  (2, 0)
  (3, 0)
  (4, 1)
  (5, 1)
  (6, 1)
  (7, 1)

model simple
train 300 epochs

## Predict: will someone pass with 3.5 hours?
predict 3.5

show results
show accuracy`,
    hints: [
      'Binary classification: 0 = no, 1 = yes',
      'The model learns a threshold',
      'Try adding more data points'
    ]
  },
  
  neural: {
    title: 'Neural Network Practice',
    description: 'Practice building neural networks with layers',
    template: `## Practice: Neural Network
## Build a network with hidden layers

data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)
  (5, 10)

## Try different architectures!
## model sequential
## dense 4 relu
## dense 1 linear

model sequential
dense 4 relu
dense 1 linear

train 500 epochs

predict 6
predict 7

show results`,
    hints: [
      'More layers = more complex patterns',
      'relu is good for hidden layers',
      'linear is good for output layer'
    ]
  },
  
  data: {
    title: 'Data Manipulation Practice',
    description: 'Practice working with arrays and data',
    template: `## Practice: Data Manipulation
## Work with arrays and statistics

let numbers = [23, 45, 12, 67, 34, 89, 12, 45, 23, 56]

## Try different operations!
print("Original: " + numbers)
print("Sorted: " + sort(numbers))
print("Unique: " + unique(numbers))
print("Mean: " + mean(numbers))
print("Median: " + median(numbers))
print("Std Dev: " + std(numbers))

## Filter
let big = filter(numbers, fn(x) { return x > 50 })
print("Greater than 50: " + big)

## Map
let doubled = map(numbers, fn(x) { return x * 2 })
print("Doubled: " + doubled)`,
    hints: [
      'Use filter() to select specific values',
      'Use map() to transform values',
      'Use statistics functions to analyze data'
    ]
  },
  
  csv: {
    title: 'CSV Data Practice',
    description: 'Practice loading and working with CSV files',
    template: `## Practice: CSV Data
## Load and analyze real data

## First, create a CSV file or use existing ones
## Then load it:
## data csv "datasets/houses.csv"

## For now, practice with inline data
data points
  (1000, 200)
  (1500, 250)
  (2000, 300)
  (2500, 350)
  (3000, 400)

model simple
train 200 epochs

## Predict prices for different sizes
predict 1200
predict 1800
predict 2200

show results`,
    hints: [
      'Create your own CSV files',
      'Use data csv "filename.csv"',
      'MEX auto-detects columns'
    ]
  }
};

// ── Practice Mode ──────────────────────────────────
function runPractice(topic) {
  const template = practiceTemplates[topic];
  
  if (!template) {
    console.log('');
    console.log('  Practice Topics:');
    console.log('  ────────────────');
    Object.keys(practiceTemplates).forEach(key => {
      console.log(`    ${key.padEnd(12)} - ${practiceTemplates[key].description}`);
    });
    console.log('');
    console.log('  Usage: node mex.js practice <topic>');
    console.log('  Example: node mex.js practice linear');
    console.log('');
    return;
  }
  
  console.log('');
  console.log(`  Practice: ${template.title}`);
  console.log('  ' + '─'.repeat(template.title.length + 10));
  console.log(`  ${template.description}`);
  console.log('');
  
  // Show template
  console.log('  Template Code:');
  console.log('  ──────────────');
  template.template.split('\n').forEach(line => {
    console.log(`  ${line}`);
  });
  console.log('');
  
  // Show hints
  console.log('  Hints:');
  console.log('  ──────');
  template.hints.forEach((hint, i) => {
    console.log(`  ${i + 1}. ${hint}`);
  });
  console.log('');
  
  // Ask if they want to run it
  console.log('  To run this template:');
  console.log(`  node mex.js --run-practice ${topic}`);
  console.log('');
}

function runPracticeTemplate(topic) {
  const template = practiceTemplates[topic];
  
  if (!template) {
    console.error(`Error: Unknown practice topic: ${topic}`);
    console.log('Available topics: ' + Object.keys(practiceTemplates).join(', '));
    process.exit(1);
  }
  
  // Record this practice session
  const stats = recordPractice(topic);
  
  console.log(`Running: ${template.title}`);
  console.log('─'.repeat(50));
  
  try {
    const tokens = tokenize(template.template);
    const ast = parse(tokens);
    const output = interpret(ast);
    output.forEach(line => console.log(line));
    
    console.log('');
    console.log(`  ✓ Practice recorded! (You've practiced this ${stats.count} times)`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

module.exports = { practiceTemplates, runPractice, runPracticeTemplate, loadPracticeProgress };
