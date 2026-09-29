/**
 * WINTER ARC — Dynamic Natural-Language Food Recognition & AI/Heuristic Nutrition Engine
 * Parses ANY natural language food input (e.g. "4 bread with jam", "3 idli and 1 bowl sambar")
 * Extracts quantities, units, estimates Calories, Protein, Carbs, Fat, assigns confidence,
 * offers non-blocking clarifications, and dynamically learns unknown foods.
 */

// Comprehensive Universal Food Knowledge Ontology (120+ common foods & ingredients)
const FOOD_ONTOLOGY = {
  // --- Breads, Roti & Bakery ---
  'bread': { name: 'Bread Slice', category: 'bakery', cal: 70, p: 2.5, c: 13.0, f: 0.8, unit: 'slice', defaultQty: 1, confidence: 'HIGH', aliases: ['bread', 'breads', 'white bread', 'brown bread', 'toast'] },
  'white_bread': { name: 'White Bread', category: 'bakery', cal: 75, p: 2.3, c: 14.0, f: 0.9, unit: 'slice', defaultQty: 1, confidence: 'HIGH' },
  'brown_bread': { name: 'Brown Bread', category: 'bakery', cal: 68, p: 2.8, c: 12.0, f: 0.7, unit: 'slice', defaultQty: 1, confidence: 'HIGH' },
  'multigrain_bread': { name: 'Multigrain Bread', category: 'bakery', cal: 72, p: 3.2, c: 11.5, f: 1.1, unit: 'slice', defaultQty: 1, confidence: 'HIGH' },
  'chapathi': { name: 'Chapathi / Roti', category: 'grains', cal: 105, p: 3.5, c: 19.0, f: 1.5, unit: 'piece', defaultQty: 2, confidence: 'HIGH', aliases: ['chapathi', 'chapati', 'roti', 'phulka', 'rotis', 'chapathis'] },
  'paratha': { name: 'Plain Paratha', category: 'grains', cal: 210, p: 4.5, c: 28.0, f: 9.0, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['paratha', 'parantha', 'parotta'] },
  'aloo_paratha': { name: 'Aloo Paratha', category: 'grains', cal: 280, p: 5.5, c: 42.0, f: 10.5, unit: 'piece', defaultQty: 1, confidence: 'HIGH' },
  'naan': { name: 'Naan', category: 'grains', cal: 260, p: 7.0, c: 45.0, f: 5.5, unit: 'piece', defaultQty: 1, confidence: 'HIGH' },
  'pav': { name: 'Pav / Bun', category: 'bakery', cal: 110, p: 3.0, c: 21.0, f: 1.5, unit: 'piece', defaultQty: 2, confidence: 'HIGH' },

  // --- Spreads, Dips & Fats ---
  'jam': { name: 'Fruit Jam', category: 'spreads', cal: 50, p: 0.1, c: 13.0, f: 0.0, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH', aliases: ['jam', 'fruit jam', 'mixed fruit jam'] },
  'butter': { name: 'Butter', category: 'dairy', cal: 102, p: 0.1, c: 0.0, f: 11.5, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH' },
  'ghee': { name: 'Desi Ghee', category: 'dairy', cal: 112, p: 0.0, c: 0.0, f: 12.5, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH' },
  'peanut_butter': { name: 'Peanut Butter', category: 'spreads', cal: 95, p: 4.0, c: 3.5, f: 8.0, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH' },
  'honey': { name: 'Honey', category: 'spreads', cal: 64, p: 0.1, c: 17.0, f: 0.0, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH' },
  'mayonnaise': { name: 'Mayonnaise', category: 'spreads', cal: 90, p: 0.2, c: 1.0, f: 10.0, unit: 'tbsp', defaultQty: 1, confidence: 'HIGH' },
  'cheese_slice': { name: 'Cheese Slice', category: 'dairy', cal: 70, p: 4.5, c: 1.0, f: 5.5, unit: 'slice', defaultQty: 1, confidence: 'HIGH', aliases: ['cheese', 'cheese slice'] },

  // --- Rice, Grains & South Indian Breakfast ---
  'rice': { name: 'Cooked White Rice', category: 'grains', cal: 180, p: 3.5, c: 39.0, f: 0.5, unit: 'cup', defaultQty: 1, confidence: 'HIGH', aliases: ['rice', 'white rice', 'chawal', 'cooked rice'] },
  'brown_rice': { name: 'Brown Rice', category: 'grains', cal: 170, p: 3.8, c: 36.0, f: 1.2, unit: 'cup', defaultQty: 1, confidence: 'HIGH' },
  'biryani': { name: 'Chicken Biryani', category: 'grains', cal: 420, p: 22.0, c: 48.0, f: 15.0, unit: 'plate', defaultQty: 1, confidence: 'HIGH', aliases: ['biryani', 'biriyani', 'chicken biryani', 'mutton biryani'] },
  'veg_biryani': { name: 'Veg Biryani / Pulao', category: 'grains', cal: 260, p: 5.0, c: 44.0, f: 7.5, unit: 'plate', defaultQty: 1, confidence: 'HIGH', aliases: ['pulao', 'veg pulao', 'veg biryani', 'jeera rice'] },
  'fried_rice': { name: 'Fried Rice', category: 'grains', cal: 280, p: 5.5, c: 42.0, f: 9.5, unit: 'plate', defaultQty: 1, confidence: 'HIGH' },
  'idli': { name: 'Idli', category: 'breakfast', cal: 65, p: 2.0, c: 14.0, f: 0.2, unit: 'piece', defaultQty: 3, confidence: 'HIGH', aliases: ['idli', 'idlis', 'steamed idli'] },
  'dosa': { name: 'Plain Dosa', category: 'breakfast', cal: 135, p: 3.2, c: 22.0, f: 3.8, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['dosa', 'dosas', 'plain dosa'] },
  'masala_dosa': { name: 'Masala Dosa', category: 'breakfast', cal: 250, p: 4.8, c: 38.0, f: 8.5, unit: 'piece', defaultQty: 1, confidence: 'HIGH' },
  'poori': { name: 'Poori', category: 'breakfast', cal: 140, p: 2.2, c: 16.0, f: 7.8, unit: 'piece', defaultQty: 2, confidence: 'HIGH', aliases: ['poori', 'puri', 'pooris', 'puris'] },
  'vada': { name: 'Medu Vada', category: 'breakfast', cal: 150, p: 3.8, c: 15.0, f: 8.5, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['vada', 'wada', 'medu vada'] },
  'upma': { name: 'Rava Upma', category: 'breakfast', cal: 180, p: 4.0, c: 28.0, f: 5.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['upma', 'uppumavu'] },
  'poha': { name: 'Poha', category: 'breakfast', cal: 170, p: 3.2, c: 31.0, f: 4.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['poha', 'aval'] },
  'pongal': { name: 'Ven Pongal / Khichdi', category: 'breakfast', cal: 210, p: 6.0, c: 32.0, f: 7.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['pongal', 'khichdi'] },
  'oats': { name: 'Cooked Oatmeal', category: 'breakfast', cal: 150, p: 5.0, c: 27.0, f: 2.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['oats', 'oatmeal', 'porridge'] },
  'maggi': { name: 'Maggi / Instant Noodles', category: 'snacks', cal: 310, p: 6.0, c: 45.0, f: 12.0, unit: 'pack', defaultQty: 1, confidence: 'HIGH', aliases: ['maggi', 'noodles', 'instant noodles'] },

  // --- Protein, Meat, Poultry, Eggs & Seafood ---
  'egg': { name: 'Boiled Egg', category: 'protein', cal: 78, p: 6.3, c: 0.6, f: 5.3, unit: 'piece', defaultQty: 2, confidence: 'HIGH', aliases: ['egg', 'eggs', 'boiled egg', 'boiled eggs'] },
  'egg_white': { name: 'Egg White', category: 'protein', cal: 17, p: 3.6, c: 0.2, f: 0.1, unit: 'piece', defaultQty: 3, confidence: 'HIGH', aliases: ['egg white', 'egg whites'] },
  'omelette': { name: 'Egg Omelette / Bhurji', category: 'protein', cal: 190, p: 12.5, c: 3.0, f: 13.8, unit: 'serving', defaultQty: 1, confidence: 'HIGH', aliases: ['omelette', 'omlet', 'egg bhurji', 'scrambled egg'] },
  'bread_omelette': { name: 'Bread Omelette', category: 'breakfast', cal: 290, p: 14.0, c: 26.0, f: 14.0, unit: 'plate', defaultQty: 1, confidence: 'HIGH' },
  'chicken': { name: 'Chicken Curry', category: 'protein', cal: 240, p: 24.0, c: 4.5, f: 13.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['chicken', 'chicken curry', 'murgh curry'] },
  'chicken_breast': { name: 'Grilled Chicken Breast', category: 'protein', cal: 165, p: 31.0, c: 0.0, f: 3.6, unit: 'serving', defaultQty: 1, confidence: 'HIGH' },
  'chicken_fry': { name: 'Chicken Fry / 65', category: 'protein', cal: 290, p: 25.0, c: 6.0, f: 17.0, unit: 'plate', defaultQty: 1, confidence: 'HIGH', aliases: ['chicken fry', 'chicken 65', 'pepper chicken', 'chicken roast'] },
  'fish': { name: 'Fish Curry', category: 'protein', cal: 210, p: 22.0, c: 3.5, f: 11.0, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['fish', 'fish curry', 'machli'] },
  'fish_fry': { name: 'Fish Fry', category: 'protein', cal: 250, p: 20.0, c: 5.0, f: 15.0, unit: 'piece', defaultQty: 1, confidence: 'HIGH' },
  'mutton': { name: 'Mutton Curry', category: 'protein', cal: 320, p: 26.0, c: 4.0, f: 22.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['mutton', 'mutton curry', 'lamb curry', 'goat meat'] },
  'protein_shake': { name: 'Whey Protein Shake', category: 'protein', cal: 130, p: 25.0, c: 3.0, f: 1.5, unit: 'scoop', defaultQty: 1, confidence: 'HIGH', aliases: ['protein shake', 'whey protein', 'whey', 'protein powder'] },

  // --- Dals, Legumes & Vegetarian Proteins ---
  'dal': { name: 'Yellow Dal / Tadka', category: 'protein', cal: 140, p: 7.0, c: 21.0, f: 3.2, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['dal', 'daal', 'toor dal', 'moong dal', 'dal tadka', 'yellow dal'] },
  'dal_makhani': { name: 'Dal Makhani', category: 'protein', cal: 260, p: 9.0, c: 28.0, f: 12.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH' },
  'sambar': { name: 'Sambar', category: 'vegetables', cal: 95, p: 3.5, c: 14.0, f: 2.2, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['sambar', 'sambhar'] },
  'chana': { name: 'Chana Masala (Chickpeas)', category: 'protein', cal: 190, p: 8.5, c: 29.0, f: 4.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['chana', 'chana masala', 'chole', 'kabuli chana'] },
  'rajma': { name: 'Rajma (Kidney Beans)', category: 'protein', cal: 185, p: 8.2, c: 28.0, f: 4.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['rajma', 'kidney beans'] },
  'paneer': { name: 'Paneer Curry', category: 'protein', cal: 270, p: 13.0, c: 8.0, f: 20.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['paneer', 'paneer curry', 'kadai paneer', 'shahi paneer', 'matar paneer'] },
  'raw_paneer': { name: 'Raw / Fresh Paneer (100g)', category: 'protein', cal: 265, p: 18.0, c: 2.5, f: 20.0, unit: 'serving', defaultQty: 1, confidence: 'HIGH' },
  'soya_chunks': { name: 'Soya Chunks Curry', category: 'protein', cal: 175, p: 18.0, c: 12.0, f: 4.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['soya', 'soya chunks', 'meal maker'] },

  // --- Dairy & Curds ---
  'curd': { name: 'Curd / Plain Dahi', category: 'dairy', cal: 90, p: 5.5, c: 6.0, f: 4.5, unit: 'cup', defaultQty: 1, confidence: 'HIGH', aliases: ['curd', 'dahi', 'yogurt', 'plain curd'] },
  'milk': { name: 'Milk (1 Glass / 200ml)', category: 'dairy', cal: 130, p: 6.5, c: 9.5, f: 7.0, unit: 'glass', defaultQty: 1, confidence: 'HIGH', aliases: ['milk', 'glass of milk', 'cow milk', 'toned milk'] },
  'buttermilk': { name: 'Buttermilk / Chaas', category: 'dairy', cal: 45, p: 2.8, c: 3.5, f: 2.0, unit: 'glass', defaultQty: 1, confidence: 'HIGH', aliases: ['buttermilk', 'chaas', 'chach', 'mor'] },

  // --- Vegetables & Curries ---
  'potato_curry': { name: 'Potato / Aloo Curry', category: 'vegetables', cal: 160, p: 2.2, c: 26.0, f: 5.0, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['potato', 'potato curry', 'aloo', 'aloo curry', 'aloo sabzi'] },
  'mixed_veg': { name: 'Mixed Vegetable Sabzi', category: 'vegetables', cal: 110, p: 2.8, c: 12.0, f: 5.5, unit: 'bowl', defaultQty: 1, confidence: 'HIGH', aliases: ['veg', 'vegetables', 'mixed veg', 'sabzi', 'poriyal', 'curry'] },
  'salad': { name: 'Raw Vegetable Salad', category: 'vegetables', cal: 30, p: 1.0, c: 6.0, f: 0.2, unit: 'plate', defaultQty: 1, confidence: 'HIGH', aliases: ['salad', 'cucumber', 'cucumber salad', 'green salad'] },

  // --- Fruits & Healthy Snacks ---
  'banana': { name: 'Banana', category: 'fruits', cal: 95, p: 1.2, c: 23.0, f: 0.3, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['banana', 'bananas', 'kela'] },
  'apple': { name: 'Apple', category: 'fruits', cal: 80, p: 0.4, c: 19.0, f: 0.2, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['apple', 'apples', 'seb'] },
  'orange': { name: 'Orange', category: 'fruits', cal: 62, p: 1.2, c: 15.0, f: 0.2, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['orange', 'oranges', 'santre'] },
  'roasted_chana': { name: 'Roasted Chana', category: 'snacks', cal: 140, p: 7.5, c: 20.0, f: 2.5, unit: 'handful', defaultQty: 1, confidence: 'HIGH', aliases: ['roasted chana', 'bhuna chana'] },
  'peanuts': { name: 'Boiled / Roasted Peanuts', category: 'snacks', cal: 170, p: 7.0, c: 6.0, f: 14.0, unit: 'handful', defaultQty: 1, confidence: 'HIGH', aliases: ['peanuts', 'groundnuts', 'moongphali'] },

  // --- Canteen & Street Food ---
  'samosa': { name: 'Samosa', category: 'snacks', cal: 260, p: 3.5, c: 32.0, f: 14.5, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['samosa', 'samosas'] },
  'tea': { name: 'Milk Tea / Cutting Chai', category: 'beverages', cal: 75, p: 1.8, c: 11.0, f: 2.5, unit: 'cup', defaultQty: 1, confidence: 'HIGH', aliases: ['tea', 'chai', 'cutting chai', 'milk tea'] },
  'black_coffee': { name: 'Black Coffee (No Sugar)', category: 'beverages', cal: 5, p: 0.3, c: 0.8, f: 0.1, unit: 'cup', defaultQty: 1, confidence: 'HIGH', aliases: ['black coffee', 'coffee'] },
  'biscuits': { name: 'Biscuits / Cookies (3 pcs)', category: 'snacks', cal: 145, p: 2.0, c: 24.0, f: 5.0, unit: 'serving', defaultQty: 1, confidence: 'HIGH', aliases: ['biscuit', 'biscuits', 'parle-g', 'cookies'] },
  'chips': { name: 'Potato Chips Pack', category: 'snacks', cal: 220, p: 2.5, c: 24.0, f: 13.0, unit: 'pack', defaultQty: 1, confidence: 'HIGH', aliases: ['chips', 'potato chips', 'lays', 'kurkure'] },
  'pizza_slice': { name: 'Pizza Slice', category: 'fast_food', cal: 270, p: 11.0, c: 30.0, f: 12.0, unit: 'slice', defaultQty: 1, confidence: 'HIGH', aliases: ['pizza', 'pizza slice'] },
  'burger': { name: 'Veg / Chicken Burger', category: 'fast_food', cal: 380, p: 14.0, c: 42.0, f: 17.0, unit: 'piece', defaultQty: 1, confidence: 'HIGH', aliases: ['burger', 'sandwhich', 'sandwich'] },
  'momos': { name: 'Steamed Momos (5-6 pcs)', category: 'snacks', cal: 240, p: 8.0, c: 36.0, f: 6.0, unit: 'plate', defaultQty: 1, confidence: 'HIGH', aliases: ['momo', 'momos', 'dimsum'] }
};

// Word-to-number mapping
const WORD_NUMBERS = {
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25, 'single': 1, 'double': 2, 'triple': 3,
  'couple': 2, 'few': 3
};

// Unit Multipliers relative to base item serving
const UNIT_MULTIPLIERS = {
  'piece': 1.0, 'pieces': 1.0, 'pcs': 1.0, 'pc': 1.0,
  'slice': 1.0, 'slices': 1.0,
  'bowl': 1.0, 'bowls': 1.0, 'katori': 1.0, 'katoris': 1.0,
  'cup': 1.0, 'cups': 1.0,
  'glass': 1.0, 'glasses': 1.0,
  'plate': 1.2, 'plates': 1.2,
  'handful': 0.8, 'handfuls': 0.8, 'fist': 0.8,
  'tbsp': 0.3, 'tablespoon': 0.3, 'tablespoons': 0.3,
  'tsp': 0.1, 'teaspoon': 0.1,
  'pack': 1.0, 'packet': 1.0, 'packets': 1.0,
  'serving': 1.0, 'servings': 1.0,
  'scoop': 1.0, 'scoops': 1.0,
  'g': 0.01, 'gram': 0.01, 'grams': 0.01, // 100g base = 1.0
  'ml': 0.005 // 200ml glass = 1.0
};

class DynamicFoodParser {
  constructor() {
    this.customLearnedFoods = this.loadCustomFoods();
  }

  loadCustomFoods() {
    try {
      const saved = localStorage.getItem('winter_arc_custom_foods_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveCustomFood(foodKey, foodData) {
    this.customLearnedFoods[foodKey] = foodData;
    try {
      localStorage.setItem('winter_arc_custom_foods_v1', JSON.stringify(this.customLearnedFoods));
    } catch (e) {
      console.warn('Could not save custom food to localStorage');
    }
  }

  /**
   * Main Parsing Pipeline:
   * Splits user input into distinct items, extracts quantities/units,
   * matches against Ontology / Custom Cache / Dynamic Heuristics.
   */
  parse(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return [];
    const text = rawInput.trim();
    if (!text) return [];

    // Split segments:
    // Support "and", "with", "plus", "&", "+", ",", ";", "\n"
    const segments = this.splitIntoSegments(text);
    const parsedItems = [];

    segments.forEach(segment => {
      const item = this.parseSegment(segment);
      if (item) {
        parsedItems.push(item);
      }
    });

    return parsedItems;
  }

  splitIntoSegments(text) {
    // Replace separators with standard pipe
    let normalized = text
      .replace(/\s+(and|with|plus|\&|\+)\s+/gi, ' | ')
      .replace(/[,;\n]+/g, ' | ');

    let parts = normalized.split('|').map(s => s.trim()).filter(Boolean);

    // If only 1 part was found, check if it's space-separated known staple words
    // e.g. "rice dal chicken curd"
    if (parts.length === 1 && parts[0].split(/\s+/).length >= 3) {
      const tokens = parts[0].split(/\s+/);
      const recognizedTokens = tokens.filter(t => this.isLikelyFoodToken(t));
      if (recognizedTokens.length >= 3) {
        return recognizedTokens;
      }
    }

    return parts;
  }

  isLikelyFoodToken(token) {
    const t = token.toLowerCase();
    return Object.keys(FOOD_ONTOLOGY).some(k => k.includes(t) || (FOOD_ONTOLOGY[k].aliases && FOOD_ONTOLOGY[k].aliases.includes(t)));
  }

  parseSegment(segment) {
    let clean = segment.trim();
    if (!clean) return null;

    let quantity = 1;
    let unit = null;
    let unitMultiplier = 1.0;

    // 1. Check leading/trailing numeric expressions (e.g., "4 bread", "chicken curry 1 bowl", "100g paneer")
    // Match patterns like "4", "4.5", "1/2", "two"
    const numRegex = /^(\d+(?:\.\d+)?|\d+\/\d+)\s*([a-zA-Z]+)?\b/i;
    const trailingNumRegex = /\b(\d+(?:\.\d+)?|\d+\/\d+)\s*([a-zA-Z]+)?$/i;
    const wordNumRegex = /^(a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|single|double)\b/i;

    let match = clean.match(numRegex);
    if (match) {
      quantity = this.parseNumberVal(match[1]);
      if (match[2]) {
        unit = match[2].toLowerCase();
      }
      clean = clean.replace(match[0], '').trim();
    } else {
      let trailingMatch = clean.match(trailingNumRegex);
      if (trailingMatch) {
        quantity = this.parseNumberVal(trailingMatch[1]);
        if (trailingMatch[2]) {
          unit = trailingMatch[2].toLowerCase();
        }
        clean = clean.replace(trailingMatch[0], '').trim();
      } else {
        let wordMatch = clean.match(wordNumRegex);
        if (wordMatch) {
          quantity = WORD_NUMBERS[wordMatch[1].toLowerCase()] || 1;
          clean = clean.replace(wordMatch[0], '').trim();
        }
      }
    }

    // Check if remaining phrase has an inline unit (e.g., "1 bowl of", "2 cups of")
    const unitInPhraseMatch = clean.match(/\b(bowl|bowls|katori|katoris|cup|cups|plate|plates|slice|slices|glass|glasses|piece|pieces|tbsp|tsp|handful|serving|servings|g|grams|ml)\b/i);
    if (unitInPhraseMatch) {
      if (!unit) unit = unitInPhraseMatch[1].toLowerCase();
      clean = clean.replace(unitInPhraseMatch[0], '').trim();
    }

    // Remove filler words ("of", "a", "some", "with", "the")
    clean = clean.replace(/\b(of|a|an|some|the|fresh|hot|cooked)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) clean = unit || 'Food item';

    // Normalize unit multiplier
    if (unit && UNIT_MULTIPLIERS[unit]) {
      unitMultiplier = UNIT_MULTIPLIERS[unit];
    }

    // 2. Resolve Food Nutrition
    const resolved = this.resolveNutrition(clean, quantity, unit, unitMultiplier);

    return {
      originalQuery: segment,
      name: resolved.name,
      cleanName: resolved.name,
      emoji: resolved.emoji,
      category: resolved.category,
      quantity: quantity,
      unit: unit || resolved.unit,
      displayPortion: `${quantity} ${unit ? unit : resolved.unit}${quantity > 1 && !unit?.endsWith('s') && !['g','ml','tbsp','tsp'].includes(unit) ? 's' : ''}`,
      portion: `${quantity} ${unit ? unit : resolved.unit}${quantity > 1 && !unit?.endsWith('s') && !['g','ml','tbsp','tsp'].includes(unit) ? 's' : ''}`,
      calories: Math.round(resolved.calories),
      protein: Number(resolved.protein.toFixed(1)),
      carbs: Number(resolved.carbs.toFixed(1)),
      fat: Number(resolved.fat.toFixed(1)),
      confidence: resolved.confidence,
      source: resolved.source,
      clarifications: resolved.clarifications || []
    };
  }

  parseNumberVal(numStr) {
    if (numStr.includes('/')) {
      const [num, den] = numStr.split('/').map(Number);
      return den ? num / den : 1;
    }
    return parseFloat(numStr) || 1;
  }

  /**
   * Multi-tier resolution:
   * 1. Check custom learned foods
   * 2. Check universal food ontology (exact / alias / keyword)
   * 3. Check hardcoded hostel foods
   * 4. AI/Heuristic culinary inference engine for unknown foods
   */
  resolveNutrition(foodQuery, qty, unit, unitMultiplier) {
    const q = foodQuery.toLowerCase().trim();

    // 1. Check Custom Foods
    if (this.customLearnedFoods[q]) {
      const item = this.customLearnedFoods[q];
      return this.scaleItem(item, qty, unitMultiplier, 'Learned User Food');
    }

    // 2. Direct lookup in Universal Ontology
    let matchKey = Object.keys(FOOD_ONTOLOGY).find(k => k === q);
    if (!matchKey) {
      matchKey = Object.keys(FOOD_ONTOLOGY).find(k => {
        const item = FOOD_ONTOLOGY[k];
        return item.aliases && item.aliases.some(alias => alias === q || q.includes(alias) || alias.includes(q));
      });
    }

    if (!matchKey) {
      // Word token match
      matchKey = Object.keys(FOOD_ONTOLOGY).find(k => {
        const words = q.split(/\s+/);
        return words.some(w => w.length > 2 && (k.includes(w) || (FOOD_ONTOLOGY[k].aliases && FOOD_ONTOLOGY[k].aliases.some(a => a.includes(w)))));
      });
    }

    if (matchKey) {
      const item = FOOD_ONTOLOGY[matchKey];
      const scaled = this.scaleItem(item, qty, unitMultiplier, 'Knowledge Ontology');

      // Add smart clarification options if ambiguous
      if (matchKey === 'bread') {
        scaled.clarifications = [
          { text: 'White Bread', cal: 75, p: 2.3, c: 14, f: 0.9 },
          { text: 'Brown Bread', cal: 68, p: 2.8, c: 12, f: 0.7 },
          { text: 'Multigrain', cal: 72, p: 3.2, c: 11.5, f: 1.1 }
        ];
      } else if (matchKey === 'jam') {
        scaled.clarifications = [
          { text: '1 tbsp (~50 kcal)', mult: 1.0 },
          { text: '2 tbsp thick spread (~100 kcal)', mult: 2.0 },
          { text: 'Light spread (~30 kcal)', mult: 0.6 }
        ];
      }

      return scaled;
    }

    // 3. Fallback to existing Hostel Food DB
    if (typeof HOSTEL_FOODS !== 'undefined') {
      const hMatch = HOSTEL_FOODS.find(f => f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase()));
      if (hMatch) {
        return {
          name: hMatch.name,
          category: hMatch.category,
          emoji: this.getEmojiForCategory(hMatch.category),
          unit: hMatch.servingSize || 'serving',
          calories: hMatch.calories * qty,
          protein: hMatch.protein * qty,
          carbs: hMatch.carbs * qty,
          fat: hMatch.fat * qty,
          confidence: 'HIGH',
          source: 'Hostel Knowledge Base'
        };
      }
    }

    // 4. Unknown Food: AI / Culinary Heuristic Estimation Layer
    return this.estimateUnknownFood(foodQuery, qty, unit, unitMultiplier);
  }

  scaleItem(baseItem, qty, unitMultiplier, source) {
    // If unit is grams, scale: (qty / 100) * base 100g macros
    let mult = qty;
    if (unitMultiplier !== 1.0) {
      mult = qty * unitMultiplier;
    }

    return {
      name: baseItem.name,
      category: baseItem.category,
      emoji: this.getEmojiForCategory(baseItem.category),
      unit: baseItem.unit,
      calories: baseItem.cal * mult,
      protein: baseItem.p * mult,
      carbs: baseItem.c * mult,
      fat: baseItem.f * mult,
      confidence: baseItem.confidence || 'HIGH',
      source: source
    };
  }

  /**
   * AI/Heuristic Layer for Unknown Foods
   * Analyzes culinary words, liquid/solid state, and estimates plausible macros.
   */
  estimateUnknownFood(query, qty, unit, unitMultiplier) {
    const q = query.toLowerCase();
    let category = 'general';
    let baseCal = 180;
    let baseP = 5.0;
    let baseC = 25.0;
    let baseF = 6.0;
    let confidence = 'MEDIUM';

    // Keyword detection
    if (q.includes('chicken') || q.includes('meat') || q.includes('beef') || q.includes('pork') || q.includes('steak')) {
      category = 'protein';
      baseCal = 240; baseP = 26.0; baseC = 2.0; baseF = 14.0;
    } else if (q.includes('fish') || q.includes('tuna') || q.includes('salmon') || q.includes('prawn') || q.includes('shrimp')) {
      category = 'protein';
      baseCal = 190; baseP = 24.0; baseC = 1.0; baseF = 9.0;
    } else if (q.includes('egg') || q.includes('omelet')) {
      category = 'protein';
      baseCal = 140; baseP = 11.0; baseC = 1.0; baseF = 10.0;
    } else if (q.includes('shake') || q.includes('smoothie')) {
      category = 'beverages';
      baseCal = 220; baseP = 15.0; baseC = 30.0; baseF = 4.0;
    } else if (q.includes('salad') || q.includes('veggie') || q.includes('greens') || q.includes('soup')) {
      category = 'vegetables';
      baseCal = 90; baseP = 2.5; baseC = 12.0; baseF = 3.5;
    } else if (q.includes('curry') || q.includes('gravy') || q.includes('masala') || q.includes('stew')) {
      category = 'curry';
      baseCal = 210; baseP = 8.0; baseC = 14.0; baseF = 14.0;
    } else if (q.includes('cake') || q.includes('sweet') || q.includes('chocolate') || q.includes('dessert') || q.includes('ice cream')) {
      category = 'sweets';
      baseCal = 320; baseP = 3.5; baseC = 46.0; baseF = 14.0;
    } else if (q.includes('rice') || q.includes('noodle') || q.includes('pasta') || q.includes('grain')) {
      category = 'grains';
      baseCal = 200; baseP = 4.5; baseC = 42.0; baseF = 1.5;
    } else if (q.includes('toast') || q.includes('sandwich') || q.includes('wrap') || q.includes('roll')) {
      category = 'bakery';
      baseCal = 290; baseP = 10.0; baseC = 38.0; baseF = 11.0;
    } else if (q.includes('juice') || q.includes('soda') || q.includes('drink')) {
      category = 'beverages';
      baseCal = 110; baseP = 0.5; baseC = 27.0; baseF = 0.0;
    } else {
      confidence = 'LOW';
    }

    const mult = qty * (unitMultiplier || 1.0);
    const formattedName = query.charAt(0).toUpperCase() + query.slice(1);

    // Auto-cache this newly recognized food for user's local database
    const foodEntry = {
      name: formattedName,
      category: category,
      unit: unit || 'portion',
      cal: baseCal,
      p: baseP,
      c: baseC,
      f: baseF,
      confidence: confidence
    };
    this.saveCustomFood(q, foodEntry);

    return {
      name: formattedName,
      category: category,
      emoji: this.getEmojiForCategory(category),
      unit: unit || 'portion',
      calories: baseCal * mult,
      protein: baseP * mult,
      carbs: baseC * mult,
      fat: baseF * mult,
      confidence: confidence,
      source: 'AI / Heuristic Estimate'
    };
  }

  getEmojiForCategory(cat) {
    const emojis = {
      'bakery': '🍞',
      'spreads': '🍓',
      'grains': '🍚',
      'breakfast': '🥞',
      'protein': '🍗',
      'dairy': '🥛',
      'vegetables': '🥗',
      'fruits': '🍌',
      'snacks': '🍿',
      'beverages': '☕',
      'fast_food': '🍔',
      'curry': '🥣',
      'sweets': '🍫',
      'general': '🍽️'
    };
    return emojis[cat] || '🍽️';
  }
}

// Global Parser Instance
window.foodParser = new DynamicFoodParser();
