// ═══════════════════════════════════════════════════════
//  MEX EXAMPLES — Pre-built code samples
// ═══════════════════════════════════════════════════════

const EXAMPLES = {
  hello: {
    label: 'Hello World',
    desc: 'Your first MEX program',
    code: `## Hello World
print("Hello from MEX!")

## Variables
let x = 42
let name = "MEX"
print("x = " + x)
print("Welcome to " + name)`
  },

  linear: {
    label: 'Linear Regression',
    desc: 'Learn the pattern y = 2x',
    code: `## Linear Regression
data points
  (1, 2)
  (2, 4)
  (3, 6)
  (4, 8)
  (5, 10)

model simple
train 200 epochs
show results

let p = predict 6
print("Predicted: " + p)`
  },

  classify: {
    label: 'Classification',
    desc: 'OR gate neural network',
    code: `## Classification (OR Gate)
data points
  (0, 0)
  (0, 1)
  (1, 0)
  (1, 1)

model sequential
  dense 4 relu
  dense 1 sigmoid

train 500 epochs
show results`
  },

  neural: {
    label: 'Deep Network',
    desc: 'Multi-layer with dropout',
    code: `## Deep Network with Dropout
data points
  (0.1, 0.2)
  (0.3, 0.6)
  (0.5, 1.0)
  (0.7, 1.4)
  (0.9, 1.8)

model sequential
  dense 8 relu
  dropout 0.2
  dense 4 relu
  dense 1 linear

train 300 epochs
show results`
  },

  dice: {
    label: 'Dice & Coin Flip',
    desc: 'Random number generation',
    code: `## Dice Roller
fn rollDice() {
  return floor(random() * 6) + 1
}

for i in range(5) {
  print("Roll " + (i + 1) + ": " + rollDice())
}

## Coin Flip
print("---")
fn coinFlip() {
  if (random() > 0.5) {
    return "Heads"
  } else {
    return "Tails"
  }
}

for i in range(5) {
  print("Flip " + (i + 1) + ": " + coinFlip())
}`
  },

  loops: {
    label: 'Loops & Math',
    desc: 'For, while, functions',
    code: `## Loops and Functions

## For loop
for i in range(5) {
  print("i = " + i)
}

## Function
fn factorial(n) {
  if (n <= 1) {
    return 1
  }
  return n * factorial(n - 1)
}

print("5! = " + factorial(5))
print("10! = " + factorial(10))

## While loop
let n = 1
while (n <= 5) {
  print("n = " + n)
  n = n + 1
}`
  },

  arrays: {
    label: 'Arrays',
    desc: 'Create, sort, access',
    code: `## Arrays

let nums = [5, 3, 8, 1, 9, 2]
print("Array: " + nums)
print("Length: " + len(nums))

## Sort
let sorted = sort(nums)
print("Sorted: " + sorted)

## Access by index
print("First: " + nums[0])
print("Third: " + nums[2])

## Map
let doubled = map(nums, fn(x) { return x * 2 })
print("Doubled: " + doubled)

## Filter
let big = filter(nums, fn(x) { return x > 4 })
print("Big ones: " + big)`
  },

  stats: {
    label: 'Statistics',
    desc: 'Mean, sum, min, max',
    code: `## Statistics

let data = [10, 20, 30, 40, 50]
print("Data: " + data)

let avg = mean(data)
print("Mean: " + avg)

let mn = min(data)
let mx = max(data)
print("Min: " + mn + ", Max: " + mx)

let s = sum(data)
print("Sum: " + s)

## Normalize
let normed = normalize(data)
print("Normalized: " + normed)`
  },

  pipeline: {
    label: 'Full Pipeline',
    desc: 'Data -> Model -> Train -> Predict',
    code: `## Full ML Pipeline

## 1. Training data
data points
  (1, 3)
  (2, 5)
  (3, 7)
  (4, 9)
  (5, 11)

## 2. Create model
model simple

## 3. Train
train 200 epochs

## 4. Check predictions
show results

## 5. Predict new value
let p = predict 6
print("Predicted for 6: " + p)`
  },

  boolean: {
    label: 'Boolean Logic',
    desc: 'true, false, and, or, not',
    code: `## Boolean Logic

let a = true
let b = false

print("a = " + a)
print("b = " + b)
print("a and b: " + (a and b))
print("a or b: " + (a or b))
print("not a: " + (not a))

## Conditional
let x = 10
if (x > 5 and x < 20) {
  print("x is between 5 and 20")
} else {
  print("x is outside range")
}`
  },

  math: {
    label: 'Math Functions',
    desc: 'sqrt, pow, abs, floor, ceil',
    code: `## Math Functions

print("sqrt(16) = " + sqrt(16))
print("pow(2, 10) = " + pow(2, 10))
print("abs(-42) = " + abs(-42))
print("floor(3.7) = " + floor(3.7))
print("ceil(3.2) = " + ceil(3.2))
print("round(3.5) = " + round(3.5))
print("log(100) = " + log(100))
print("exp(1) = " + exp(1))
print("pi ~ " + 3.14159)`
  },

  objects: {
    label: 'Objects & Methods',
    desc: 'Dictionaries, string/array methods',
    code: `## Objects (Dictionaries)
let person = {
  name: "Alice",
  age: 30,
  city: "New York"
}

print("Name: " + person.name)
print("Age: " + person.age)

## Object methods
print("Keys: " + person.keys())
print("Values: " + person.values())
print("Has name? " + person.has("name"))

## String methods
let msg = "hello world"
print(msg.toUpperCase())
print(msg.includes("world"))
print(msg.replace("world", "MEX"))

## Array methods
let nums = [5, 3, 1, 4, 2]
print("Length: " + nums.length())
nums.sort()
print("Sorted: " + nums)
print("Has 4? " + nums.includes(4))`
  },
};
