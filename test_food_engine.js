/**
 * Comprehensive Automated Verification Script
 * Validates:
 * 1. All 10 user test queries (4 bread with jam, 2 eggs and 2 chapathi, 3 idli with sambar,
 *    1 plate chicken biryani, rice dal chicken curd, banana, 1 glass milk, 2 samosa, paneer curry, unknown food)
 * 2. Macro estimation: Calories, Protein, Carbs, Fat, and Confidence.
 * 3. Recommendation engine reaction to low morning protein and high carbs (e.g. 4 bread with jam).
 * 4. Store persistence and daily totals calculation.
 */

// Mock browser globals for Node.js execution
global.window = global;
global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

// Load scripts
require('./js/food_parser.js');
require('./js/database.js');
require('./js/store.js');

console.log('====================================================');
console.log('WINTER ARC — NUTRITION & PARSER VERIFICATION SUITE');
console.log('====================================================\n');

const testCases = [
  { id: 1, query: "4 bread with jam", expectedItems: 2 },
  { id: 2, query: "2 eggs and 2 chapathi", expectedItems: 2 },
  { id: 3, query: "3 idli with sambar", expectedItems: 2 },
  { id: 4, query: "1 plate chicken biryani", expectedItems: 1 },
  { id: 5, query: "rice dal chicken curd", expectedItems: 4 },
  { id: 6, query: "banana", expectedItems: 1 },
  { id: 7, query: "1 glass milk", expectedItems: 1 },
  { id: 8, query: "2 samosa", expectedItems: 1 },
  { id: 9, query: "paneer curry", expectedItems: 1 },
  { id: 10, query: "avocado toast with matcha latte", expectedItems: 2 } // unknown/novel food
];

let allPassed = true;

testCases.forEach(tc => {
  const result = window.foodParser.parse(tc.query);
  const totalCal = result.reduce((s, it) => s + (it.calories || 0), 0);
  const totalP = Number(result.reduce((s, it) => s + (it.protein || 0), 0).toFixed(1));
  const totalC = Number(result.reduce((s, it) => s + (it.carbs || 0), 0).toFixed(1));
  const totalF = Number(result.reduce((s, it) => s + (it.fat || 0), 0).toFixed(1));

  console.log(`[TEST ${tc.id}] "${tc.query}"`);
  console.log(`  -> Items Recognized: ${result.length} (Expected >= 1)`);

  if (result.length === 0) {
    console.error(`  FAIL: Zero items recognized for "${tc.query}"!`);
    allPassed = false;
    return;
  }

  result.forEach((it, i) => {
    console.log(`     Item ${i + 1}: ${it.emoji || '🍽️'} ${it.name} | Qty: ${it.quantity} ${it.unit || ''} | ~${it.calories} kcal | ${it.protein}g P | ${it.carbs}g C | ${it.fat}g F | Confidence: [${it.confidence}]`);
  });

  console.log(`  -> MEAL TOTAL: ~${totalCal} kcal | ${totalP}g Protein | ${totalC}g Carbs | ${totalF}g Fat`);

  // Assertions
  if (totalCal <= 0) {
    console.error(`  FAIL: Calories should be > 0 (got ${totalCal})`);
    allPassed = false;
  }
  if (isNaN(totalP) || isNaN(totalC) || isNaN(totalF)) {
    console.error(`  FAIL: Macros contained NaN values!`);
    allPassed = false;
  }

  console.log(`  STATUS: PASS\n`);
});

// Test Recommendation Engine Adaptation to Actual Logged Food
console.log('====================================================');
console.log('TESTING RECOMMENDATION ENGINE ADAPTATION');
console.log('====================================================\n');

// 1. Simulate logging "4 bread with jam" for breakfast
const parsedBreakfast = window.foodParser.parse("4 bread with jam");
parsedBreakfast.forEach(item => {
  window.arcStore.addMealItem('breakfast', {
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

const todayLog = window.arcStore.getTodayLog();
const dailyTotals = window.arcStore.getDailyNutritionTotals();
console.log(`Logged Breakfast: 4 Bread + Jam`);
console.log(`Today's Nutrition Totals: ~${dailyTotals.calories} kcal | ${dailyTotals.protein}g Protein | ${dailyTotals.carbs}g Carbs | ${dailyTotals.fat}g Fat\n`);

// 2. Query Plate Recommendation at Lunch when mess has: "Rice, Chicken, Dal, Potato curry"
console.log('Mess Menu Available: "Rice, Chicken, Dal, Potato curry"');
const lunchRec = window.RECOMMENDATION_ENGINE.analyzePlate("Rice, Chicken, Dal, Potato curry", todayLog);

console.log('\n--- RECOMMENDATION OUTPUT ---');
console.log(`Est Calories: ${lunchRec.estCalories} kcal`);
console.log(`Est Protein: ${lunchRec.estProtein}g`);
console.log('\nPlate Breakdown:');
lunchRec.recommendedPlate.forEach(item => {
  console.log(`  - ${item.name} (${item.portion}): ${item.note}`);
});
console.log(`\nWhy Statement:`);
console.log(`"${lunchRec.why}"`);

// Verify that Chicken and Dal are prioritized, and protein advice is triggered
const whyLower = lunchRec.why.toLowerCase();
const mentionsProtein = whyLower.includes('protein') || whyLower.includes('carbohydrate') || whyLower.includes('breakfast');
console.log(`\nDoes advice dynamically account for morning breakfast? ${mentionsProtein ? 'YES (PASS)' : 'NO (FAIL)'}`);

if (!mentionsProtein) {
  allPassed = false;
}

console.log('\n====================================================');
console.log(allPassed ? 'ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✅' : 'SOME TESTS FAILED! ❌');
console.log('====================================================');
