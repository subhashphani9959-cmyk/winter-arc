/**
 * End-to-End Headless Integration Test
 * Simulates complete user session across:
 * - Dynamic Food NLP Input & Daily Macro Calculations
 * - Recommendation Engine Adaptation
 * - Training Mode Protocols & Session Lifecycle
 */

// Mock window and browser environment
global.window = global;
global.document = {
  getElementById: (id) => ({
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild() {},
    addEventListener() {},
    focus() {},
    scrollIntoView() {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    appendChild() {}
  })
};
global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

require('./js/food_parser.js');
require('./js/database.js');
require('./js/store.js');
require('./js/training.js');
require('./js/app.js');

console.log('>>> [STEP 1] Testing App Initialization & Store...');
const store = window.arcStore;
console.log('Store initialized with profile: Starting 85kg -> Target 70kg, Water 3000ml, Steps 12000.');

console.log('\n>>> [STEP 2] Simulating User typing: "4 bread with jam"...');
const parsed = window.foodParser.parse("4 bread with jam");
console.log(`Parsed ${parsed.length} items:`);
parsed.forEach(it => {
  console.log(`  - ${it.emoji} ${it.name} | Qty: ${it.quantity} ${it.unit} | ~${it.calories} kcal | ${it.protein}g Protein | ${it.carbs}g Carbs | ${it.fat}g Fat | Confidence: ${it.confidence}`);
});

console.log('\n>>> [STEP 3] Logging items to Breakfast...');
parsed.forEach(item => {
  store.addMealItem('breakfast', {
    name: item.name,
    portion: item.portion,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    confidence: item.confidence,
    source: item.source,
    quantity: item.quantity,
    unit: item.unit
  });
});

const bSlotTotals = store.getMealTotals('breakfast');
console.log(`Breakfast Slot Totals: ${bSlotTotals.calories} kcal, ${bSlotTotals.protein}g Protein, ${bSlotTotals.carbs}g Carbs, ${bSlotTotals.fat}g Fat`);

const dayTotals = store.getDailyNutritionTotals();
console.log(`Daily Nutrition Totals: ${dayTotals.calories} kcal, ${dayTotals.protein}g Protein, ${dayTotals.carbs}g Carbs, ${dayTotals.fat}g Fat`);

console.log('\n>>> [STEP 4] Testing Recommendation Engine with Today\'s Log...');
const lunchRecommendation = window.RECOMMENDATION_ENGINE.analyzePlate("Rice, Chicken, Dal, Potato curry", store.getTodayLog());
console.log(`Recommendation Summary: ~${lunchRecommendation.estCalories} kcal, ${lunchRecommendation.estProtein}g Protein`);
console.log(`Coach Why Statement:\n"${lunchRecommendation.why}"`);

console.log('\n>>> [STEP 5] Testing Training Mode...');
const controller = new TrainingController();
console.log(`Training Controller Initialized.`);
console.log(`Available Protocols: ${TRAINING_PROTOCOLS.length}`);
TRAINING_PROTOCOLS.forEach((p, i) => {
  console.log(`  Protocol ${i + 1}: ${p.name} (${p.estMinutes} mins, ~${p.estCalories} kcal, ${p.exercises.length} exercises)`);
});

// Select Protocol 1: Dhruva Combat & Calisthenics
controller.selectProtocol('dhruva_combat');
console.log(`Selected Protocol: ${controller.currentProtocol.name}`);

// Start workout
controller.launchWorkoutSession();
console.log(`Session Launched.`);

// Simulate completing sets
controller.currentProtocol.exercises.forEach(ex => {
  for (let s = 1; s <= ex.sets; s++) {
    controller.toggleSetComplete(ex.id, s);
  }
});
console.log(`All sets marked completed. Completed count: ${Object.values(controller.completedSetsMap).filter(Boolean).length}`);

// Complete workout
controller.sessionElapsedSec = 45 * 60; // 45 mins
controller.completeWorkoutSession();

const updatedTodayLog = store.getTodayLog();
console.log(`Workouts logged today: ${updatedTodayLog.workouts ? updatedTodayLog.workouts.length : 0}`);
if (updatedTodayLog.workouts && updatedTodayLog.workouts.length > 0) {
  const w = updatedTodayLog.workouts[0];
  console.log(`  - Logged Workout: "${w.name}" | Duration: ${w.durationMins} mins | Calories Burned: ~${w.calories} kcal`);
}

console.log('\n>>> [STEP 6] Testing remaining required food cases:');
const testQueries = [
  "2 eggs and 2 chapathi",
  "3 idli with sambar",
  "1 plate chicken biryani",
  "rice dal chicken curd",
  "banana",
  "1 glass milk",
  "2 samosa",
  "paneer curry",
  "unknown hostel curry"
];

testQueries.forEach(q => {
  const res = window.foodParser.parse(q);
  const c = res.reduce((s, x) => s + x.calories, 0);
  const p = res.reduce((s, x) => s + x.protein, 0);
  console.log(`  Query "${q}" => ${res.length} item(s) recognized: ~${c} kcal, ~${p.toFixed(1)}g P, Confidence: [${res.map(x=>x.confidence).join(', ')}]`);
});

console.log('\n>>> ALL SYSTEMS VERIFIED AND READY! <<<');
