// ═══════════════════════════════════════════════════════
//  MEX Learning System
//  Progress tracking, unlocking, scoring, hints
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// ── Progress File ──────────────────────────────────
const PROGRESS_FILE = path.join(__dirname, '..', 'progress.json');

// ── Lesson Definitions ─────────────────────────────
const lessons = [
  {
    num: 1,
    file: '01_what_is_data.mx',
    title: 'What is Data?',
    desc: 'Features, labels, datasets',
    unlockRequirement: null, // Always unlocked
    concepts: ['features', 'labels', 'datasets', 'patterns'],
    challengeFile: '01_challenge.mx',
    solutionFile: '01_solutions.mx',
    hints: [
      'Data points are pairs: (feature, label)',
      'Features are inputs (X), labels are outputs (y)',
      'Look for patterns: as X increases, does Y increase?',
      'The formula y = mx + b describes linear patterns'
    ]
  },
  {
    num: 2,
    file: '02_finding_patterns.mx',
    title: 'Finding Patterns',
    desc: 'Linear regression, training',
    unlockRequirement: 1, // Complete lesson 1 first
    concepts: ['linear regression', 'training', 'prediction', 'error'],
    challengeFile: '02_challenge.mx',
    solutionFile: '02_solutions.mx',
    hints: [
      'Linear regression finds the line y = mx + b',
      'Training adjusts m and b to reduce error',
      'More epochs = more adjustments = better fit',
      'Error near 0 means the model learned well'
    ]
  },
  {
    num: 3,
    file: '03_classification.mx',
    title: 'Classification',
    desc: 'Categories, yes/no',
    unlockRequirement: 2,
    concepts: ['classification', 'categories', 'accuracy', 'confusion matrix'],
    challengeFile: '03_challenge.mx',
    solutionFile: '03_solutions.mx',
    hints: [
      'Classification puts things into categories',
      'Output is 0 or 1 (no/yes, cat/dog)',
      'Accuracy = correct predictions / total predictions',
      'Sigmoid activation outputs values between 0 and 1'
    ]
  },
  {
    num: 4,
    file: '04_neural_networks.mx',
    title: 'Neural Networks',
    desc: 'Layers, learning',
    unlockRequirement: 3,
    concepts: ['neural networks', 'layers', 'activations', 'backpropagation'],
    challengeFile: '04_challenge.mx',
    solutionFile: '04_solutions.mx',
    hints: [
      'Neural networks have layers of neurons',
      'Each neuron computes: weighted sum + activation',
      'Activations add non-linearity (sigmoid, relu)',
      'Backpropagation propagates error backwards'
    ]
  },
  {
    num: 5,
    file: '05_real_data.mx',
    title: 'Real Data',
    desc: 'CSV files, cleaning',
    unlockRequirement: 4,
    concepts: ['CSV', 'data cleaning', 'normalization', 'real-world data'],
    challengeFile: '05_challenge.mx',
    solutionFile: '05_solutions.mx',
    hints: [
      'Real data is messy — needs cleaning',
      'Normalization scales data to 0-1 range',
      'Missing values need handling (fill or remove)',
      'CSV files store data in comma-separated format'
    ]
  },
  {
    num: 6,
    file: '06_advanced.mx',
    title: 'Advanced',
    desc: 'Multi-layer, regularization',
    unlockRequirement: 5,
    concepts: ['multi-layer', 'regularization', 'overfitting', 'validation'],
    challengeFile: '06_challenge.mx',
    solutionFile: '06_solutions.mx',
    hints: [
      'Multi-layer networks learn complex patterns',
      'Regularization prevents overfitting',
      'Validation tests on unseen data',
      'Dropout randomly disables neurons during training'
    ]
  }
];

// ── Default Progress ───────────────────────────────
function getDefaultProgress() {
  return {
    completedLessons: [],
    scores: {},
    hintsUsed: {},
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    totalHintsUsed: 0,
    totalChallengesCompleted: 0,
    averageScore: 0
  };
}

// ── Load Progress ──────────────────────────────────
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading progress:', err.message);
  }
  return getDefaultProgress();
}

// ── Save Progress ──────────────────────────────────
function saveProgress(progress) {
  progress.lastActivity = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Check if Lesson is Unlocked ────────────────────
function isLessonUnlocked(lessonNum, progress) {
  const lesson = lessons.find(l => l.num === lessonNum);
  if (!lesson) return false;

  // Lesson 1 is always unlocked
  if (lesson.unlockRequirement === null) return true;

  // Check if prerequisite is completed
  return progress.completedLessons.includes(lesson.unlockRequirement);
}

// ── Complete a Lesson ──────────────────────────────
function completeLesson(lessonNum, score, progress) {
  if (!progress.completedLessons.includes(lessonNum)) {
    progress.completedLessons.push(lessonNum);
  }

  // Update score (keep best)
  const currentBest = progress.scores[lessonNum] || 0;
  if (score > currentBest) {
    progress.scores[lessonNum] = score;
  }

  // Update stats
  progress.totalChallengesCompleted = Object.keys(progress.scores).length;
  const scores = Object.values(progress.scores);
  progress.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  saveProgress(progress);
  return progress;
}

// ── Use a Hint ─────────────────────────────────────
function useHint(lessonNum, progress) {
  if (!progress.hintsUsed[lessonNum]) {
    progress.hintsUsed[lessonNum] = 0;
  }
  progress.hintsUsed[lessonNum]++;
  progress.totalHintsUsed++;
  saveProgress(progress);
  return progress;
}

// ── Get Available Hint ─────────────────────────────
function getHint(lessonNum, hintIndex) {
  const lesson = lessons.find(l => l.num === lessonNum);
  if (!lesson) return null;

  const index = hintIndex || 0;
  if (index < lesson.hints.length) {
    return lesson.hints[index];
  }
  return lesson.hints[lesson.hints.length - 1];
}

// ── Get Next Locked Lesson ─────────────────────────
function getNextLockedLesson(progress) {
  for (const lesson of lessons) {
    if (!progress.completedLessons.includes(lesson.num)) {
      if (isLessonUnlocked(lesson.num, progress)) {
        return lesson;
      }
    }
  }
  return null;
}

// ── Get Unlock Message ─────────────────────────────
function getUnlockMessage(lessonNum, progress) {
  const lesson = lessons.find(l => l.num === lessonNum);
  if (!lesson) return null;

  if (isLessonUnlocked(lessonNum, progress)) {
    return `✓ Lesson ${lessonNum}: ${lesson.title} is UNLOCKED`;
  }

  // Find what's needed
  const required = lessons.find(l => l.num === lesson.unlockRequirement);
  if (required) {
    return `🔒 Lesson ${lessonNum}: Complete Lesson ${required.num} (${required.title}) first`;
  }

  return `🔒 Lesson ${lessonNum}: Requirements not met`;
}

// ── Calculate Score ────────────────────────────────
function calculateScore(testResults) {
  // testResults is array of { name, passed }
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  return Math.round((passed / total) * 100);
}

// ── Achievement Definitions ────────────────────────
const achievements = [
  { id: 'first_lesson', name: 'First Steps', desc: 'Complete your first lesson', icon: '🌟', condition: (p) => p.completedLessons.length >= 1 },
  { id: 'half_way', name: 'Half Way', desc: 'Complete 3 lessons', icon: '🚀', condition: (p) => p.completedLessons.length >= 3 },
  { id: 'all_lessons', name: 'ML Graduate', desc: 'Complete all 6 lessons', icon: '🎓', condition: (p) => p.completedLessons.length >= 6 },
  { id: 'first_challenge', name: 'Challenger', desc: 'Complete your first challenge', icon: '⚡', condition: (p) => p.totalChallengesCompleted >= 1 },
  { id: 'all_challenges', name: 'Challenge Master', desc: 'Complete all challenges', icon: '🏆', condition: (p) => p.totalChallengesCompleted >= 6 },
  { id: 'no_hints', name: 'Independent', desc: 'Complete a lesson without hints', icon: '💪', condition: (p) => p.completedLessons.length >= 1 && p.totalHintsUsed === 0 },
  { id: 'perfect_score', name: 'Perfect', desc: 'Get 100% on a challenge', icon: '💯', condition: (p) => Object.values(p.scores).some(s => s === 100) },
  { id: 'high_scorer', name: 'High Scorer', desc: 'Average score above 80%', icon: '🔥', condition: (p) => p.averageScore >= 80 },
  { id: 'persistent', name: 'Persistent', desc: 'Use 10 or more hints', icon: '📚', condition: (p) => p.totalHintsUsed >= 10 },
  { id: 'speed_learner', name: 'Speed Learner', desc: 'Complete 2 lessons in one session', icon: '⚡', condition: (p) => p.completedLessons.length >= 2 },
  { id: 'compressionist', name: 'Compressionist', desc: 'Achieve 2.5x compression ratio', icon: '📦', condition: (p) => p.averageCompressionRatio >= 2.5 }
];

// ── Get Earned Achievements ────────────────────────
function getEarnedAchievements(progress) {
  return achievements.filter(a => a.condition(progress));
}

// ── Get All Achievements ───────────────────────────
function getAllAchievements(progress) {
  const earned = getEarnedAchievements(progress);
  return achievements.map(a => ({
    ...a,
    earned: earned.some(e => e.id === a.id)
  }));
}

// ── Get Progress Summary ───────────────────────────
function getProgressSummary(progress) {
  const total = lessons.length;
  const completed = progress.completedLessons.length;
  const unlocked = lessons.filter(l => isLessonUnlocked(l.num, progress)).length;
  const locked = total - unlocked;
  const earnedAchievements = getEarnedAchievements(progress);

  return {
    total,
    completed,
    unlocked,
    locked,
    percentComplete: Math.round((completed / total) * 100),
    averageScore: progress.averageScore || 0,
    totalHintsUsed: progress.totalHintsUsed || 0,
    achievementsEarned: earnedAchievements.length,
    totalAchievements: achievements.length
  };
}

// ── Export ──────────────────────────────────────────
module.exports = {
  lessons,
  achievements,
  loadProgress,
  saveProgress,
  isLessonUnlocked,
  completeLesson,
  useHint,
  getHint,
  getNextLockedLesson,
  getUnlockMessage,
  calculateScore,
  getProgressSummary,
  getDefaultProgress,
  getEarnedAchievements,
  getAllAchievements
};
