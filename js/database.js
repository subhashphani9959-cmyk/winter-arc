/**
 * WINTER ARC — Indian & Hostel Mess Food Knowledge Base & Recommendation Engine
 * Designed for athletic transformation, weight loss (85 -> 70 kg), and realistic hostel mess living.
 */

const HOSTEL_FOODS = [
  // ===================== BREAKFAST =====================
  {
    id: 'idli',
    name: 'Idli',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 65,
    protein: 2.0,
    carbs: 14.0,
    fat: 0.2,
    servingSize: '1 medium piece (40g)',
    suggestedPortion: '3–4 idlis with sambar & small chutney',
    prepMethod: 'Fermented rice & urad dal, steam cooked (Zero added oil)',
    hostelNotes: 'One of the best hostel breakfasts. Steamed and light on digestion. Pair with dal-heavy sambar for extra protein; go easy on coconut chutney.',
    tags: ['steamed', 'low-fat', 'clean-carb', 'fermented']
  },
  {
    id: 'dosa',
    name: 'Plain Dosa',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 135,
    protein: 3.2,
    carbs: 22.0,
    fat: 3.8,
    servingSize: '1 medium plain dosa (70g)',
    suggestedPortion: '1 to 2 dosas max',
    prepMethod: 'Fermented batter pan-roasted with oil/ghee',
    hostelNotes: 'Moderate choice. Hostel mess cooks often use generous oil on the tava. Request less oil if possible or pick idli if available.',
    tags: ['pan-roasted', 'moderate-calorie']
  },
  {
    id: 'masala_dosa',
    name: 'Masala Dosa',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 250,
    protein: 4.8,
    carbs: 38.0,
    fat: 8.5,
    servingSize: '1 medium masala dosa (120g)',
    suggestedPortion: '1 dosa (skip heavy second helping)',
    prepMethod: 'Pan-roasted dosa stuffed with spiced mashed potato filling',
    hostelNotes: 'Double carbs (rice batter + potato). Keep to just 1 dosa and have 2 boiled eggs alongside if available for protein balance.',
    tags: ['carb-dense', 'indulgent-breakfast']
  },
  {
    id: 'upma',
    name: 'Rava Upma',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 180,
    protein: 4.0,
    carbs: 28.0,
    fat: 5.5,
    servingSize: '1 katori / cup (120g)',
    suggestedPortion: '1 katori (approx. 1 fist-sized scoop)',
    prepMethod: 'Semolina roasted in oil/mustard seeds with onion/veggies',
    hostelNotes: 'Hostel upma can be oil-heavy. Keep the portion to 1 bowl. Eat slowly and hydrate well.',
    tags: ['semolina', 'moderate-carb']
  },
  {
    id: 'pongal',
    name: 'Ven Pongal / Khichdi',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 210,
    protein: 6.0,
    carbs: 32.0,
    fat: 7.0,
    servingSize: '1 katori (140g)',
    suggestedPortion: '1 moderate bowl with sambar',
    prepMethod: 'Rice & yellow moong dal cooked soft with black pepper, cumin & ghee',
    hostelNotes: 'Moong dal gives modest protein and comfort. Watch out for ghee pooling at the bottom of the mess vessel.',
    tags: ['comfort', 'dal-rice']
  },
  {
    id: 'poori',
    name: 'Poori',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 140,
    protein: 2.2,
    carbs: 16.0,
    fat: 7.8,
    servingSize: '1 small poori (35g)',
    suggestedPortion: 'Limit to 1–2 on rare days, or choose chapathi/idli',
    prepMethod: 'Wheat dough deep-fried in hot vegetable oil',
    hostelNotes: 'Deep-fried empty calories. Each poori absorbs 6-8g of frying oil. In a fat-loss phase, prefer idli or chapathi when possible.',
    tags: ['deep-fried', 'high-fat', 'limit']
  },
  {
    id: 'vada',
    name: 'Medu Vada',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 150,
    protein: 3.8,
    carbs: 15.0,
    fat: 8.5,
    servingSize: '1 medium vada (45g)',
    suggestedPortion: '1 piece maximum as occasional side',
    prepMethod: 'Spiced urad dal batter deep-fried',
    hostelNotes: 'Tasty but deep-fried. If having vada, keep to 1 piece and pair with 2 idlis instead of taking 3-4 vadas.',
    tags: ['deep-fried', 'side']
  },
  {
    id: 'chapathi_breakfast',
    name: 'Chapathi / Roti',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 105,
    protein: 3.5,
    carbs: 19.0,
    fat: 1.5,
    servingSize: '1 medium wheat roti (35-40g)',
    suggestedPortion: '2 chapathis with dal/curry',
    prepMethod: 'Whole wheat flour tava roasted with minimal/no oil',
    hostelNotes: 'Top-tier complex carb source. High fiber, provides steady sustained energy for workouts and classes.',
    tags: ['whole-wheat', 'high-fiber', 'staple']
  },
  {
    id: 'bread_omelette',
    name: 'Bread Omelette (Canteen)',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 290,
    protein: 14.0,
    carbs: 26.0,
    fat: 14.0,
    servingSize: '2 bread slices + 2 eggs',
    suggestedPortion: '1 plate (2 eggs, 2 brown/white slices)',
    prepMethod: 'Pan fried eggs folded around toasted bread slices',
    hostelNotes: 'Great canteen lifesaver when mess food is weak. Good 14g protein hit. Ask canteen bhaiya to use less butter/oil.',
    tags: ['protein-source', 'canteen-favorite']
  },
  {
    id: 'poha',
    name: 'Poha',
    category: 'breakfast',
    categoryLabel: 'Breakfast',
    calories: 170,
    protein: 3.2,
    carbs: 31.0,
    fat: 4.0,
    servingSize: '1 medium bowl (120g)',
    suggestedPortion: '1 medium bowl with peanuts & lemon',
    prepMethod: 'Flattened rice tempered with turmeric, onions, green chillies & peanuts',
    hostelNotes: 'Light, iron-rich, easy on the stomach. Add boiled eggs or roasted peanuts if you need more protein.',
    tags: ['flattened-rice', 'light']
  },

  // ===================== RICE & GRAINS =====================
  {
    id: 'white_rice',
    name: 'White Rice',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 180,
    protein: 3.5,
    carbs: 39.0,
    fat: 0.5,
    servingSize: '1 cup cooked (140g)',
    suggestedPortion: '1 cup (1 fist size) OR skip if having 2+ chapathis',
    prepMethod: 'Boiled white grain rice',
    hostelNotes: 'Not an enemy! Athletes need carbs for glycogen. The rule is portion control: 1 cup is plenty. Don\'t double down on large rice heaps AND 3 chapathis.',
    tags: ['staple', 'glycogen', 'portion-crucial']
  },
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 170,
    protein: 3.8,
    carbs: 36.0,
    fat: 1.2,
    servingSize: '1 cup cooked (140g)',
    suggestedPortion: '1 cup cooked',
    prepMethod: 'Whole grain unpolished rice boiled',
    hostelNotes: 'Has higher fiber and slower insulin spike than white rice, but calories are nearly identical. Still practice portion discipline.',
    tags: ['whole-grain', 'high-fiber']
  },
  {
    id: 'chapathi_lunch',
    name: 'Chapathi / Phulka (Lunch/Dinner)',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 110,
    protein: 3.6,
    carbs: 20.0,
    fat: 1.6,
    servingSize: '1 medium whole wheat roti (38g)',
    suggestedPortion: '2 to 3 chapathis (if having no rice)',
    prepMethod: 'Tava roasted whole wheat dough',
    hostelNotes: 'Better satiety than white rice due to fiber. If choosing both rice and chapathi: take 1 chapathi + 1/2 cup rice.',
    tags: ['staple', 'satiating', 'fiber']
  },
  {
    id: 'veg_pulao',
    name: 'Veg Pulao / Jeera Rice',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 220,
    protein: 4.2,
    carbs: 38.0,
    fat: 5.8,
    servingSize: '1 cup cooked (150g)',
    suggestedPortion: '1 cup cooked with dal/curd',
    prepMethod: 'Basmati rice cooked with whole spices and vegetable oil/ghee',
    hostelNotes: 'Has extra cooking fat compared to plain boiled rice. Limit portion and avoid taking extra oily gravy over it.',
    tags: ['spiced-rice', 'moderate-calorie']
  },
  {
    id: 'fried_rice',
    name: 'Hostel / Canteen Fried Rice',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 280,
    protein: 5.5,
    carbs: 42.0,
    fat: 9.5,
    servingSize: '1 plate / cup (160g)',
    suggestedPortion: '1 small cup (approx. 150g), avoid second plate',
    prepMethod: 'Wok tossed cooked rice with refined oil, veggies and soy sauce',
    hostelNotes: 'Easy to overeat. Heavy oil content. Always ask for boiled egg or chicken dry side to balance the carb surge.',
    tags: ['oil-heavy', 'indulgent-canteen']
  },
  {
    id: 'chicken_biryani',
    name: 'Chicken Biryani (Hostel/Canteen)',
    category: 'grains',
    categoryLabel: 'Rice & Grains',
    calories: 420,
    protein: 22.0,
    carbs: 48.0,
    fat: 15.0,
    servingSize: '1 standard canteen plate (approx. 300g with 2 chicken pieces)',
    suggestedPortion: '1 moderate plate with 2-3 chicken pieces, 1 cup rice, heavy onion raita (skip oily salan/gravy)',
    prepMethod: 'Layered spiced rice with marinated chicken and ghee/oil',
    hostelNotes: 'Athletic protocol: prioritize the chicken pieces first. Limit the rice to 1 cup. Add lots of onion & cucumber raita for fullness. Do not add the extra oily salan.',
    tags: ['high-protein', 'high-calorie', 'athletic-protocol']
  },

  // ===================== PROTEIN =====================
  {
    id: 'boiled_egg',
    name: 'Boiled Egg',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    servingSize: '1 large whole egg (50g)',
    suggestedPortion: '2 to 3 whole eggs OR 1 whole + 3 whites',
    prepMethod: 'Boiled in shell (Zero added oil)',
    hostelNotes: 'THE GOLD STANDARD of hostel fitness. Super cheap, highest biological value protein. Keep whole eggs to 2-3 daily; egg whites can be unlimited.',
    tags: ['superfood', 'clean-protein', 'essential']
  },
  {
    id: 'egg_omelette_bhurji',
    name: 'Egg Bhurji / Omelette',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 190,
    protein: 12.5,
    carbs: 3.0,
    fat: 13.8,
    servingSize: '2 eggs cooked with onion, chillies & oil',
    suggestedPortion: '2-egg portion with 1-2 rotis',
    prepMethod: 'Scrambled or folded with vegetable oil and spices',
    hostelNotes: 'Good protein hit. Watch out for excess oil used by canteen bhaiya. Tell them "bhaiya thoda kam tel daalo".',
    tags: ['protein-source', 'tasty']
  },
  {
    id: 'chicken_curry',
    name: 'Hostel Chicken Curry',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 240,
    protein: 24.0,
    carbs: 4.5,
    fat: 13.5,
    servingSize: '1 bowl with 2-3 medium chicken pieces (180g)',
    suggestedPortion: '2–3 chicken pieces (palm-sized). Drain excess floating gravy oil',
    prepMethod: 'Chicken simmered in onion, tomato, ginger-garlic & spice gravy',
    hostelNotes: 'Primary athlete fuel on mess chicken days. HACK: Pick out the solid meat pieces. Spoon minimal oily gravy. 20-25g pure protein!',
    tags: ['clean-meat', 'muscle-building', 'hostel-priority']
  },
  {
    id: 'chicken_fry_roast',
    name: 'Chicken Roast / Pepper Chicken',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 280,
    protein: 27.0,
    carbs: 5.0,
    fat: 16.0,
    servingSize: '1 plate (approx. 150g boneless/bone-in)',
    suggestedPortion: '1 portion (approx 120-150g)',
    prepMethod: 'Chicken pan-roasted or semi-fried with dark spices',
    hostelNotes: 'High protein. If deep-fried with thick cornflour batter (like chicken 65), peel off some crunchy crust to save 10g hidden fat.',
    tags: ['high-protein', 'flavor']
  },
  {
    id: 'fish_curry',
    name: 'Fish Curry',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 210,
    protein: 22.0,
    carbs: 3.5,
    fat: 11.0,
    servingSize: '1 medium piece with gravy (160g)',
    suggestedPortion: '1 to 2 fish pieces with 2 rotis or 1 cup rice',
    prepMethod: 'Fish cooked in tamarind/tomato based tangy gravy',
    hostelNotes: 'Lean protein and omega-3s. Outstanding choice if your mess serves it fresh. Prefer curry fish over heavily battered deep-fried fish.',
    tags: ['lean-protein', 'omega-3']
  },
  {
    id: 'yellow_dal',
    name: 'Yellow Dal (Toor / Moong Tadka)',
    category: 'protein',
    categoryLabel: 'Protein & Lentil',
    calories: 140,
    protein: 7.0,
    carbs: 21.0,
    fat: 3.2,
    servingSize: '1 medium katori / bowl (150g)',
    suggestedPortion: '1 to 2 deep katoris',
    prepMethod: 'Pressure cooked lentils tempered with cumin, garlic & mustard',
    hostelNotes: 'Hostel dal is often watered down. Ask for dal scooped from the bottom of the container where thick lentils settle. It gives carbs + modest protein.',
    tags: ['lentils', 'vegetarian-staple', 'fiber']
  },
  {
    id: 'dal_makhani',
    name: 'Dal Makhani',
    category: 'protein',
    categoryLabel: 'Protein & Lentil',
    calories: 260,
    protein: 9.0,
    carbs: 28.0,
    fat: 12.5,
    servingSize: '1 katori (150g)',
    suggestedPortion: '1 small katori (treat as carb + fat, not lean protein)',
    prepMethod: 'Whole black urad & rajma slow cooked with butter & cream',
    hostelNotes: 'Very calorie-dense due to butter/cream. Do not treat as a lean protein. Pair with 2 dry rotis and a salad.',
    tags: ['calorie-dense', 'heavy']
  },
  {
    id: 'chana_masala',
    name: 'Chana Masala (Chickpeas)',
    category: 'protein',
    categoryLabel: 'Protein & Lentil',
    calories: 190,
    protein: 8.5,
    carbs: 29.0,
    fat: 4.5,
    servingSize: '1 katori (150g)',
    suggestedPortion: '1 to 1.5 katori with 2 rotis',
    prepMethod: 'Boiled kabuli / kala chana simmered in spiced tomato onion gravy',
    hostelNotes: 'Rich in dietary fiber and complex carbs. Great for gut health and prolonged satiety during long study/training blocks.',
    tags: ['high-fiber', 'plant-protein']
  },
  {
    id: 'rajma',
    name: 'Rajma (Kidney Beans)',
    category: 'protein',
    categoryLabel: 'Protein & Lentil',
    calories: 185,
    protein: 8.2,
    carbs: 28.0,
    fat: 4.0,
    servingSize: '1 katori (150g)',
    suggestedPortion: '1 deep katori with 1-2 rotis or 1/2 cup rice',
    prepMethod: 'Red kidney beans cooked in aromatic onion-tomato masala',
    hostelNotes: 'Classic North Indian hostel comfort. Satiating. Keep the rice moderate if having rajma-chawal combo.',
    tags: ['plant-protein', 'comfort']
  },
  {
    id: 'soya_chunks',
    name: 'Soya Chunks Curry',
    category: 'protein',
    categoryLabel: 'Protein Source',
    calories: 175,
    protein: 18.0,
    carbs: 12.0,
    fat: 4.0,
    servingSize: '1 katori with chunks (140g)',
    suggestedPortion: '1 to 1.5 katoris with chunks',
    prepMethod: 'Defatted soy meal chunks boiled and cooked in curry',
    hostelNotes: 'VEGETARIAN PROTEIN BEAST. 52% dry protein content. If your mess serves soya chunks day, load up! Highly recommended for muscle retention.',
    tags: ['vegetarian-power', 'high-protein', 'budget-protein']
  },
  {
    id: 'paneer_curry',
    name: 'Paneer Curry / Kadai Paneer',
    category: 'protein',
    categoryLabel: 'Protein & Dairy',
    calories: 270,
    protein: 13.0,
    carbs: 8.0,
    fat: 20.0,
    servingSize: '1 katori with 4-5 cubes (150g)',
    suggestedPortion: '1 katori with 4–5 paneer pieces',
    prepMethod: 'Cottage cheese cubes cooked in rich spiced gravy',
    hostelNotes: 'Good protein, but high in fat. Eat the paneer cubes, but leave the excess oily gravy behind on your plate.',
    tags: ['dairy-protein', 'high-fat']
  },
  {
    id: 'curd_dahi',
    name: 'Fresh Curd / Dahi',
    category: 'protein',
    categoryLabel: 'Dairy & Probiotic',
    calories: 90,
    protein: 5.5,
    carbs: 6.0,
    fat: 4.5,
    servingSize: '1 small katori (120g)',
    suggestedPortion: '1 katori with lunch and/or dinner',
    prepMethod: 'Fermented whole or toned milk',
    hostelNotes: 'NON-NEGOTIABLE hostel health weapon. Probiotics prevent hostel stomach bugs, cool digestion, and add 5-6g clean protein. Avoid adding sugar.',
    tags: ['probiotic', 'gut-health', 'essential']
  },
  {
    id: 'buttermilk_chaas',
    name: 'Buttermilk / Chaas',
    category: 'protein',
    categoryLabel: 'Dairy & Probiotic',
    calories: 45,
    protein: 2.8,
    carbs: 3.5,
    fat: 2.0,
    servingSize: '1 glass (200ml)',
    suggestedPortion: '1 to 2 glasses (unsalted or lightly salted with roasted jeera)',
    prepMethod: 'Churned curd diluted with water and spices',
    hostelNotes: 'Incredible hydration & fullness hack. Fills the stomach before dinner so you don\'t binge on oily snacks.',
    tags: ['hydration', 'low-calorie', 'cooling']
  },

  // ===================== VEGETABLES =====================
  {
    id: 'sambar',
    name: 'Sambar',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Sambar',
    calories: 95,
    protein: 3.5,
    carbs: 14.0,
    fat: 2.2,
    servingSize: '1 medium bowl (160g)',
    suggestedPortion: '1–2 deep bowls with drumsticks & vegetables',
    prepMethod: 'Toor dal broth with drumstick, pumpkin, tomato, tamarind and sambar powder',
    hostelNotes: 'Low calorie, filling, adds volume to your meal. Eat the veggies inside the sambar first.',
    tags: ['low-calorie', 'volume-food']
  },
  {
    id: 'mixed_veg',
    name: 'Mixed Vegetable Curry / Poriyal',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Greens',
    calories: 110,
    protein: 2.8,
    carbs: 12.0,
    fat: 5.5,
    servingSize: '1 katori (130g)',
    suggestedPortion: '1 to 2 full katoris (as much as available)',
    prepMethod: 'Carrots, beans, peas, cabbage sauteed with mild spices',
    hostelNotes: 'Fills stomach volume with micronutrients and dietary fiber. Always take a generous portion.',
    tags: ['micronutrients', 'fiber', 'volume']
  },
  {
    id: 'potato_curry',
    name: 'Potato / Aloo Curry',
    category: 'vegetables',
    categoryLabel: 'Starchy Vegetables',
    calories: 160,
    protein: 2.2,
    carbs: 26.0,
    fat: 5.0,
    servingSize: '1 katori (120g)',
    suggestedPortion: 'Small portion (treat as carbohydrate, not green vegetable)',
    prepMethod: 'Boiled potatoes cooked in oil, turmeric and onion gravy',
    hostelNotes: 'IMPORTANT: Aloo is a starchy carbohydrate, NOT a green vegetable. If eating aloo curry, reduce your rice or chapathi by 1 unit.',
    tags: ['starchy-carb', 'portion-watch']
  },
  {
    id: 'bhindi_fry',
    name: 'Bhindi (Okra / Ladyfinger)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Greens',
    calories: 125,
    protein: 2.5,
    carbs: 11.0,
    fat: 7.5,
    servingSize: '1 katori (120g)',
    suggestedPortion: '1 katori',
    prepMethod: 'Sliced okra sauteed with spices and oil',
    hostelNotes: 'Good soluble fiber. Hostel cooks often use extra oil to prevent sliminess, so drain excess oil when serving.',
    tags: ['fiber', 'tasty']
  },
  {
    id: 'palak_greens',
    name: 'Palak Dal / Keerai (Spinach)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Greens',
    calories: 120,
    protein: 5.5,
    carbs: 14.0,
    fat: 4.2,
    servingSize: '1 katori (150g)',
    suggestedPortion: '1 to 2 katoris',
    prepMethod: 'Greens stewed with lentils and garlic tadka',
    hostelNotes: 'Top-tier micronutrient goldmine. Iron, magnesium, and plant compounds keep energy high during caloric deficit.',
    tags: ['iron-rich', 'superfood', 'greens']
  },
  {
    id: 'cucumber_salad',
    name: 'Raw Salad (Cucumber, Onion, Tomato)',
    category: 'vegetables',
    categoryLabel: 'Raw Salad',
    calories: 30,
    protein: 1.0,
    carbs: 6.0,
    fat: 0.2,
    servingSize: '1 plate (120g)',
    suggestedPortion: 'Unlimited plate with lemon & black salt',
    prepMethod: 'Raw fresh sliced vegetables',
    hostelNotes: 'THE SECRET CHEAT CODE. Eating a plate of raw cucumber and tomato 10 minutes before dinner fills 40% of stomach volume with near-zero calories.',
    tags: ['cheat-code', 'near-zero-calories', 'volume']
  },

  // ===================== SNACKS & CANTEEN =====================
  {
    id: 'banana',
    name: 'Banana',
    category: 'snacks',
    categoryLabel: 'Snack & Fruit',
    calories: 95,
    protein: 1.2,
    carbs: 23.0,
    fat: 0.3,
    servingSize: '1 medium banana (100g)',
    suggestedPortion: '1 banana (ideal 30-45 mins before workout or long walk)',
    prepMethod: 'Raw whole fruit',
    hostelNotes: 'Excellent pre-workout or quick energy. Potassium prevents muscle cramps during the 12,000 daily step goal.',
    tags: ['pre-workout', 'clean-energy']
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'snacks',
    categoryLabel: 'Snack & Fruit',
    calories: 80,
    protein: 0.4,
    carbs: 19.0,
    fat: 0.2,
    servingSize: '1 medium apple (150g)',
    suggestedPortion: '1 apple as afternoon snack',
    prepMethod: 'Raw whole fruit',
    hostelNotes: 'Pectin fiber expands in stomach with water, killing mid-day hostel cravings completely.',
    tags: ['appetite-control', 'fiber']
  },
  {
    id: 'roasted_chana',
    name: 'Roasted Chana (Bhuna Chana)',
    category: 'snacks',
    categoryLabel: 'Snack & Fruit',
    calories: 140,
    protein: 7.5,
    carbs: 20.0,
    fat: 2.5,
    servingSize: '1 small handful / bowl (40g)',
    suggestedPortion: '1 handful (approx 35-40g)',
    prepMethod: 'Dry roasted black chickpeas in sand/furnace (Zero oil)',
    hostelNotes: 'The ultimate hostel desk snack. Zero oil, crunch, 7-8g protein, destroys evening hunger without touching junk food.',
    tags: ['zero-oil', 'crunch', 'clean-snack']
  },
  {
    id: 'samosa',
    name: 'Samosa',
    category: 'snacks',
    categoryLabel: 'Canteen Snack',
    calories: 260,
    protein: 3.5,
    carbs: 32.0,
    fat: 14.5,
    servingSize: '1 standard samosa (90g)',
    suggestedPortion: 'Avoid or limit to 1 piece maximum once every 2 weeks',
    prepMethod: 'Refined flour maida pastry stuffed with spiced potato and deep fried in oil',
    hostelNotes: 'The classic hostel trap. 1 samosa = 260 kcal and ~15g low-grade reheated frying oil. Switch to roasted chana, banana, or boiled eggs.',
    tags: ['deep-fried', 'canteen-trap', 'limit']
  },
  {
    id: 'tea_chai',
    name: 'Hostel Cutting Chai / Milk Tea',
    category: 'snacks',
    categoryLabel: 'Beverage',
    calories: 75,
    protein: 1.8,
    carbs: 11.0,
    fat: 2.5,
    servingSize: '1 small glass / cup (100ml with 1.5 tsp sugar)',
    suggestedPortion: '1 cup with half-sugar or sugar-free',
    prepMethod: 'Boiled milk, water, tea leaves and refined white sugar',
    hostelNotes: 'Drinking 3-4 sugary canteen chais daily adds 250-300 hidden calories of pure liquid sugar. Cut down to 1 cup or request zero sugar.',
    tags: ['liquid-calories', 'watch-sugar']
  },
  {
    id: 'black_coffee',
    name: 'Black Coffee (No Sugar)',
    category: 'snacks',
    categoryLabel: 'Beverage',
    calories: 5,
    protein: 0.3,
    carbs: 0.8,
    fat: 0.1,
    servingSize: '1 mug (200ml)',
    suggestedPortion: '1 to 2 cups morning / pre-walk',
    prepMethod: 'Pure coffee powder dissolved in hot water',
    hostelNotes: 'Powerful thermogenic and appetite suppressant. Boosts physical stamina for your 12,000 steps without breaking your fast.',
    tags: ['zero-calorie', 'fat-loss-ally', 'focus']
  },
  {
    id: 'biscuits',
    name: 'Parle-G / Cream Biscuits (3-4 pcs)',
    category: 'snacks',
    categoryLabel: 'Canteen Snack',
    calories: 145,
    protein: 2.0,
    carbs: 24.0,
    fat: 5.0,
    servingSize: '4 biscuits (32g)',
    suggestedPortion: 'Limit to 2 biscuits or replace with apple/chana',
    prepMethod: 'Refined wheat flour, hydrogenated palm oil and sugar',
    hostelNotes: 'Very low satiety. Before you know it, an entire 10-rupee packet is gone. Keep fruits or roasted chana in your hostel room instead.',
    tags: ['refined-flour', 'low-satiety']
  }
];

// Helper index map
const FOOD_MAP = new Map(HOSTEL_FOODS.map(f => [f.id, f]));

/**
 * Normalizes user text query into known food matches
 */
function searchFoodDatabase(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  return HOSTEL_FOODS.filter(food => {
    return food.name.toLowerCase().includes(q) ||
           food.category.toLowerCase().includes(q) ||
           food.prepMethod.toLowerCase().includes(q) ||
           food.tags.some(t => t.toLowerCase().includes(q));
  });
}

const STAPLE_ALIAS_MAP = {
  'chicken': 'chicken_curry',
  'egg': 'boiled_egg',
  'eggs': 'boiled_egg',
  'rice': 'white_rice',
  'chawal': 'white_rice',
  'roti': 'chapathi_lunch',
  'rotis': 'chapathi_lunch',
  'chapathi': 'chapathi_lunch',
  'chapathis': 'chapathi_lunch',
  'chapati': 'chapathi_lunch',
  'dal': 'yellow_dal',
  'curd': 'curd_dahi',
  'dahi': 'curd_dahi',
  'sambar': 'sambar',
  'paneer': 'paneer_curry',
  'fish': 'fish_curry',
  'soya': 'soya_chunks',
  'aloo': 'potato_curry',
  'potato': 'potato_curry',
  'salad': 'cucumber_salad',
  'biryani': 'chicken_biryani',
  'biriyani': 'chicken_biryani',
  'idli': 'idli',
  'dosa': 'dosa',
  'poori': 'poori',
  'puri': 'poori',
  'upma': 'upma'
};

/**
 * Intelligent Mess Plate Recommendation Engine
 * Analyzes what's available and builds a customized athletic plate
 * DYNAMICALLY INCORPORATES TODAY'S LOGGED FOOD INTAKE
 */
const RECOMMENDATION_ENGINE = {
  analyzePlate(inputItemsOrText, todayLog = null) {
    let items = [];

    // Retrieve today's actual logged intake
    const activeLog = todayLog || (typeof window !== 'undefined' && window.arcStore ? window.arcStore.getTodayLog() : null);
    let todayConsumedProtein = 0;
    let todayConsumedCarbs = 0;
    let todayConsumedCalories = 0;
    let breakfastSummary = '';
    let lunchSummary = '';

    if (activeLog && activeLog.meals) {
      ['breakfast', 'lunch', 'snack', 'dinner'].forEach(slot => {
        (activeLog.meals[slot] || []).forEach(m => {
          todayConsumedProtein += (m.protein || 0);
          todayConsumedCarbs += (m.carbs || 0);
          todayConsumedCalories += (m.calories || 0);
          if (slot === 'breakfast') {
            breakfastSummary += (breakfastSummary ? ', ' : '') + m.name;
          } else if (slot === 'lunch') {
            lunchSummary += (lunchSummary ? ', ' : '') + m.name;
          }
        });
      });
    }

    if (Array.isArray(inputItemsOrText)) {
      items = inputItemsOrText.map(i => {
        if (typeof i === 'string') {
          const lower = i.toLowerCase().trim();
          if (STAPLE_ALIAS_MAP[lower]) {
            return FOOD_MAP.get(STAPLE_ALIAS_MAP[lower]) || { name: i, id: lower };
          }
          return FOOD_MAP.get(i) || HOSTEL_FOODS.find(f => f.name.toLowerCase() === lower) || { name: i, id: lower.replace(/\s+/g, '_') };
        }
        return i;
      });
    } else if (typeof inputItemsOrText === 'string') {
      // Parse comma, plus, or newline separated text
      const tokens = inputItemsOrText.split(/[,+\n;/]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
      tokens.forEach(tok => {
        // 1. Direct staple alias check
        if (STAPLE_ALIAS_MAP[tok] && FOOD_MAP.has(STAPLE_ALIAS_MAP[tok])) {
          items.push(FOOD_MAP.get(STAPLE_ALIAS_MAP[tok]));
          return;
        }

        // 2. Exact ID or exact name
        let match = HOSTEL_FOODS.find(f => f.id === tok || f.name.toLowerCase() === tok);
        if (!match) {
          const wordRegex = new RegExp(`\\b${tok}\\b`, 'i');
          if (['chicken', 'egg', 'fish', 'paneer', 'dal'].includes(tok)) {
            match = HOSTEL_FOODS.find(f => f.category === 'protein' && wordRegex.test(f.name));
          }
          if (!match) {
            match = HOSTEL_FOODS.find(f => wordRegex.test(f.name));
          }
        }
        if (!match) {
          match = HOSTEL_FOODS.find(f => f.name.toLowerCase().includes(tok));
        }

        if (match) {
          items.push(match);
        } else {
          items.push({ name: tok.charAt(0).toUpperCase() + tok.slice(1), id: tok.replace(/\s+/g, '_') });
        }
      });
    }

    if (items.length === 0) {
      return null;
    }

    // Classify available items
    const hasChicken = items.some(i => (i.id?.includes('chicken') || i.name?.toLowerCase().includes('chicken')) && !i.name?.toLowerCase().includes('biryani'));
    const hasEgg = items.some(i => i.id?.includes('egg') || i.name?.toLowerCase().includes('egg'));
    const hasFish = items.some(i => i.id?.includes('fish') || i.name?.toLowerCase().includes('fish'));
    const hasPaneer = items.some(i => i.id?.includes('paneer') || i.name?.toLowerCase().includes('paneer'));
    const hasSoya = items.some(i => i.id?.includes('soya') || i.name?.toLowerCase().includes('soya'));
    const hasDal = items.some(i => i.id?.includes('dal') || i.name?.toLowerCase().includes('dal') || i.id === 'sambar');
    const hasCurd = items.some(i => i.id?.includes('curd') || i.name?.toLowerCase().includes('curd') || i.id?.includes('chaas'));
    const hasChapathi = items.some(i => i.id?.includes('chapathi') || i.name?.toLowerCase().includes('chapathi') || i.name?.toLowerCase().includes('roti'));
    const hasRice = items.some(i => (i.id?.includes('rice') || i.name?.toLowerCase().includes('rice') || i.name?.toLowerCase().includes('pulao')) && !i.name?.toLowerCase().includes('biryani'));
    const hasBiryani = (typeof inputItemsOrText === 'string' && inputItemsOrText.toLowerCase().includes('biryani')) || items.some(i => i.id === 'chicken_biryani');
    const hasPotato = items.some(i => i.id?.includes('potato') || i.name?.toLowerCase().includes('aloo') || i.name?.toLowerCase().includes('potato'));
    const hasSalad = items.some(i => i.id?.includes('salad') || i.name?.toLowerCase().includes('salad') || i.name?.toLowerCase().includes('cucumber'));

    const recommendedPlate = [];
    const whyBullets = [];
    const hostelHacks = [];
    let estCalories = 0;
    let estProtein = 0;

    // Incorporate actual logged intake insight
    if (breakfastSummary && todayConsumedProtein < 20) {
      whyBullets.push(`Your breakfast was relatively low in protein (~${Math.round(todayConsumedProtein)}g protein, ~${Math.round(todayConsumedCarbs)}g carbs), so prioritize a protein-rich lunch.`);
    } else if (todayConsumedProtein >= 60) {
      whyBullets.push(`You have already hit ${Math.round(todayConsumedProtein)}g protein today. Keep carbohydrates controlled to remain in your deficit.`);
    }

    // 1. Biryani special case (only if explicitly biryani is on the menu)
    if (hasBiryani) {
      recommendedPlate.push({
        tier: 'LIMIT PORTION',
        name: 'Biryani Rice',
        portion: '1 moderate cup cooked (approx. 150g)',
        icon: '🍚',
        note: 'Control portion — do not take a second heap'
      });
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Chicken / Egg pieces from Biryani',
        portion: '2–3 pieces',
        icon: '🍗',
        note: 'Prioritize eating the meat pieces first'
      });
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Onion & Cucumber Raita',
        portion: '1 large bowl (extra serving)',
        icon: '🥣',
        note: 'Replaces oily salan; cools digestion and enhances satiety'
      });
      whyBullets.push('Biryani is calorie dense due to ghee and oil. By measuring 1 cup of rice, taking 2-3 chicken pieces, and skipping the gravy salan, you enjoy biryani without wrecking your deficit.');
      hostelHacks.push('Ask mess bhaiya: "Bhaiya, thoda gravy kam, raita thoda extra dena."');
      estCalories = 480;
      estProtein = 26;
      return {
        recommendedPlate,
        why: whyBullets.join(' '),
        hostelHacks,
        estCalories,
        estProtein
      };
    }

    // 2. Protein Priority
    if (hasChicken) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Chicken',
        portion: '1–2 palm-sized portions (~150g solid meat)',
        icon: '🍗',
        note: 'Pick out solid meat pieces, drain excess floating gravy oil'
      });
      estCalories += 240;
      estProtein += 24;
      whyBullets.push('Chicken provides high-density, bioavailable protein that spares muscle while dropping fat.');
    } else if (hasFish) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Fish',
        portion: '1–2 pieces',
        icon: '🐟',
        note: 'Prefer curry piece over heavily fried crust'
      });
      estCalories += 210;
      estProtein += 22;
      whyBullets.push('Fish delivers high protein with beneficial fatty acids.');
    } else if (hasEgg) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Egg',
        portion: '2 whole boiled eggs OR 1 whole + 2 whites',
        icon: '🥚',
        note: 'Cleanest protein available in the hostel'
      });
      estCalories += 160;
      estProtein += 14;
      whyBullets.push('Eggs supply complete amino acids to fuel your recovery.');
    } else if (hasSoya) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Soya Chunks',
        portion: '1–1.5 katori thick chunks',
        icon: '🌱',
        note: 'Outstanding vegetarian protein powerhouse'
      });
      estCalories += 180;
      estProtein += 18;
      whyBullets.push('Soya chunks are 52% protein dry weight — ideal vegetarian athlete fuel.');
    } else if (hasPaneer) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Paneer Curry',
        portion: '1 katori (4–5 paneer cubes)',
        icon: '🧀',
        note: 'Eat the paneer cubes; avoid drinking the excess oily butter gravy'
      });
      estCalories += 250;
      estProtein += 13;
      whyBullets.push('Paneer gives good casein protein, but carries fat so keep portion disciplined.');
    }

    // 3. Dal / Lentils
    if (hasDal) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Dal / Sambar',
        portion: '1 full deep bowl / katori',
        icon: '🥣',
        note: 'Scoop from the bottom where thick lentils settle'
      });
      estCalories += 140;
      estProtein += 7;
      whyBullets.push('Dal adds essential fiber, potassium, and complementary amino acids.');
    }

    // 4. Carbohydrate Strategy (Chapathi vs Rice vs Both)
    if (hasChapathi && hasRice) {
      recommendedPlate.push({
        tier: 'MODERATE',
        name: 'Chapathi',
        portion: '2 medium rotis',
        icon: '🫓',
        note: 'Recommended main carb (higher fiber & satiety than white rice)'
      });
      recommendedPlate.push({
        tier: 'MODERATE',
        name: 'Rice',
        portion: 'Small portion (1/2 cup) OR skip completely because chapathi is included',
        icon: '🍚',
        note: 'Do not take full servings of both at the same sitting'
      });
      estCalories += 220;
      estProtein += 7;
      whyBullets.push('Both can fit your plan, but choose one as your primary carbohydrate rather than loading huge portions of both.');
    } else if (hasChapathi) {
      recommendedPlate.push({
        tier: 'MODERATE',
        name: 'Chapathi',
        portion: '2 to 3 rotis max',
        icon: '🫓',
        note: 'Dry or lightly smeared, without swimming in ghee'
      });
      estCalories += 220;
      estProtein += 7;
    } else if (hasRice) {
      recommendedPlate.push({
        tier: 'MODERATE',
        name: 'Rice',
        portion: '1 cup cooked (approx. fist-sized portion)',
        icon: '🍚',
        note: 'Stick to 1 flat ladle; avoid the customary hostel mountain'
      });
      estCalories += 180;
      estProtein += 3.5;
    }

    // 5. Starchy vegetables warning (Potato / Aloo)
    if (hasPotato) {
      recommendedPlate.push({
        tier: 'LIMIT PORTION',
        name: 'Potato / Aloo Curry',
        portion: 'Small portion (approx 2–3 tablespoons)',
        icon: '🥔',
        note: 'Starchy carb, not a green veggie. If taking this, reduce rice/roti portion'
      });
      estCalories += 90;
      estProtein += 1.5;
      whyBullets.push('Potato is a carb source, not a vegetable — balance it against your rotis.');
    }

    // 6. Vegetables & Greens
    const vegItem = items.find(i => i.category === 'vegetables' && i.id !== 'potato_curry' && i.id !== 'sambar');
    if (vegItem) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: vegItem.name,
        portion: 'Generous bowl / as much as available',
        icon: '🥬',
        note: 'Fills your stomach with fiber and micronutrients'
      });
      estCalories += 80;
      estProtein += 2;
    } else {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Vegetables / Salad',
        portion: 'Add more raw cucumber, tomato, or sabzi if available',
        icon: '🥗',
        note: 'Crucial for fullness during a 15 kg fat loss journey'
      });
      estCalories += 30;
      estProtein += 1;
    }

    // 7. Curd / Buttermilk
    if (hasCurd || !hasChicken) {
      recommendedPlate.push({
        tier: 'PRIORITIZE',
        name: 'Curd / Buttermilk',
        portion: '1 small katori (plain, unsweetened)',
        icon: '🥛',
        note: 'Probiotics keep digestion smooth and add quality dairy protein'
      });
      estCalories += 80;
      estProtein += 5;
    }

    // Add generic hostel hacks
    hostelHacks.push('Drink 1 full glass of water 15 minutes before sitting at the mess table.');
    hostelHacks.push('Use the smaller plate if your hostel mess offers two plate sizes.');
    hostelHacks.push('Eat your protein and vegetables first before touching the rice/chapathi.');

    return {
      recommendedPlate,
      why: whyBullets.length > 0 ? whyBullets.join(' ') : 'Prioritize protein, keep total carbs moderate, and fill half your plate with volume (salad, dal, veggies).',
      hostelHacks,
      estCalories,
      estProtein
    };
  }
};

/**
 * Food Comparison Engine
 */
const COMPARISON_ENGINE = {
  getPresetComparisons() {
    return [
      {
        id: 'chapathi_vs_rice',
        title: 'Chapathi vs. White Rice',
        query: 'chapathi, rice',
        tag: 'Carb Staple Battle'
      },
      {
        id: 'poori_dosa_idli',
        title: 'Poori vs. Dosa vs. Idli',
        query: 'poori, dosa, idli',
        tag: 'Hostel Breakfast Showdown'
      },
      {
        id: 'biryani_guide',
        title: 'Sunday Hostel Biryani Protocol',
        query: 'biryani',
        tag: 'Cheat Meal Management'
      },
      {
        id: 'samosa_vs_chana',
        title: 'Canteen Samosa vs. Roasted Chana / Banana',
        query: 'samosa, roasted chana, banana',
        tag: 'Evening Snack Decision'
      },
      {
        id: 'chicken_vs_paneer',
        title: 'Chicken Curry vs. Kadai Paneer',
        query: 'chicken curry, paneer',
        tag: 'Protein Efficiency'
      }
    ];
  },

  compare(inputString) {
    const raw = (inputString || '').toLowerCase();
    
    // Check specific known patterns
    if (raw.includes('chapathi') && raw.includes('rice')) {
      return {
        title: 'BETTER CHOICE FOR THIS MEAL: CHAPATHI vs. RICE',
        winner: 'Chapathi (Slight Edge for Satiety & Fiber)',
        summary: 'Both can fit your plan. Choose one as your main carbohydrate rather than taking large portions of both.',
        items: [
          {
            name: 'Chapathi (Whole Wheat)',
            recommendedPortion: '2 rotis (3 if no rice)',
            calories: '~210 kcal (2 rotis)',
            protein: '7g',
            fiber: 'High dietary fiber',
            verdict: 'Preferred for fat loss because chewing and fiber slow down digestion, keeping you full for 3-4 hours in classes.'
          },
          {
            name: 'White Rice',
            recommendedPortion: '1 cup cooked (~140g) if choosing rice',
            calories: '~180 kcal (1 cup)',
            protein: '3.5g',
            fiber: 'Low fiber',
            verdict: 'Easy to digest and great post-workout, but extremely easy to overeat in a hostel mess. Measure 1 cup; avoid 2nd heaps.'
          }
        ],
        coachTip: 'Athlete rule: If you want both, strictly take 1 chapathi + 1/2 cup of rice. Never 3 chapathis PLUS a plate of rice.'
      };
    }

    if (raw.includes('poori') || (raw.includes('dosa') && raw.includes('idli'))) {
      return {
        title: 'BREAKFAST COMPARISON: POORI vs. DOSA vs. IDLI',
        winner: 'Idli (Clear Winner for Fat Loss & Digestion)',
        summary: 'Preparation method dictates the fat loss value here. Steaming beats pan-frying, which destroys deep-frying.',
        items: [
          {
            name: 'Idli (Steamed)',
            recommendedPortion: '3 to 4 idlis',
            calories: '~195–260 kcal',
            protein: '6–8g',
            fat: '< 1g',
            verdict: 'GOLD STANDARD. Zero oil, fermented for gut health, light on digestion. Pair with dal sambar.'
          },
          {
            name: 'Dosa (Pan Roasted)',
            recommendedPortion: '1 to 2 dosas max',
            calories: '~270 kcal (2 dosas)',
            protein: '6g',
            fat: '7–10g (oil used on tava)',
            verdict: 'ACCEPTABLE. Good fermented base, but depends heavily on how much oil the mess cook splashes on the tava.'
          },
          {
            name: 'Poori (Deep Fried)',
            recommendedPortion: 'Limit to 1–2 occasionally; avoid weekly habit',
            calories: '~280–420 kcal (2-3 pooris)',
            protein: '4g',
            fat: '16–24g pure absorbed frying oil',
            verdict: 'POOR FOR FAT LOSS. Absorbs massive hidden calories in degraded hostel frying oil. Swap for idli or chapathi.'
          }
        ],
        coachTip: 'On poori mornings in the mess, see if boiled eggs, bread, or fruits are available, or stick strictly to 1-2 pooris with lots of chana/sabzi.'
      };
    }

    if (raw.includes('biryani')) {
      return {
        title: 'ATHLETE PROTOCOL: HOW TO HANDLE BIRYANI',
        winner: 'Controlled Portion Protocol (Do not ban it, master it)',
        summary: 'Extreme dieting says "never touch biryani". The Winter Arc athlete says "I control the portion and hit my protein".',
        items: [
          {
            name: 'Biryani Rice',
            recommendedPortion: '1 standard cup (150g)',
            verdict: 'Rice is cooked in fats and spices. Eat 1 portion to enjoy the taste and refill glycogen.'
          },
          {
            name: 'Chicken / Mutton Pieces',
            recommendedPortion: '2–3 pieces',
            verdict: 'Hit your 25g+ protein quota. Consume the meat first.'
          },
          {
            name: 'Raita vs. Salan / Gravy',
            recommendedPortion: 'Double bowl of Raita; Skip the Salan',
            verdict: 'Hostel salan is floating in separated oil. Raita is curd + onion which aids digestion and suppresses hunger.'
          }
        ],
        coachTip: 'On biryani day, clock your 12,000 steps early or take a 30-minute evening walk to direct those carbs into muscle glycogen!'
      };
    }

    if (raw.includes('samosa') || raw.includes('snack') || raw.includes('banana') || raw.includes('chana')) {
      return {
        title: 'EVENING SNACK COMPARISON: SAMOSA vs. ATHLETE OPTIONS',
        winner: 'Roasted Chana + Banana (Ultimate Athletic Combo)',
        summary: 'Hostel 5 PM hunger is where most diets fail. Choose crunchy protein over deep-fried refined maida.',
        items: [
          {
            name: 'Canteen Samosa',
            recommendedPortion: '0 (Avoid in 85->70kg cut)',
            calories: '260 kcal',
            protein: '3.5g',
            fat: '15g stale frying oil',
            verdict: 'Spikes insulin, leaves you hungry again 45 minutes later, adds 260 empty calories.'
          },
          {
            name: 'Roasted Chana (40g)',
            recommendedPortion: '1 generous handful',
            calories: '140 kcal',
            protein: '8g clean protein',
            fat: '2g',
            verdict: 'Zero oil, great crunch, suppresses hunger until hostel mess dinner opens.'
          },
          {
            name: 'Banana (1 medium)',
            recommendedPortion: '1 fruit',
            calories: '95 kcal',
            protein: '1.2g',
            fat: '0.3g',
            verdict: 'Natural carbs + potassium. Best consumed 30 mins before your walk/gym workout.'
          }
        ],
        coachTip: 'Keep a 500g jar of roasted chana in your hostel room. It will save you 10,000+ unnecessary junk calories every month.'
      };
    }

    // Generic fallback comparison from DB
    const tokens = inputString.split(/[,+\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    const matched = HOSTEL_FOODS.filter(f => tokens.some(tok => f.name.toLowerCase().includes(tok))).slice(0, 3);

    if (matched.length >= 2) {
      const best = matched.reduce((prev, curr) => (curr.protein / Math.max(curr.calories, 1)) > (prev.protein / Math.max(prev.calories, 1)) ? curr : prev);
      return {
        title: `COMPARISON: ${matched.map(m => m.name).join(' vs. ')}`,
        winner: `${best.name} (Highest Protein Efficiency)`,
        summary: `Comparing these items for your Winter Arc weight loss goal (85 kg → 70 kg).`,
        items: matched.map(m => ({
          name: m.name,
          recommendedPortion: m.suggestedPortion,
          calories: `~${m.calories} kcal`,
          protein: `${m.protein}g protein`,
          fat: `${m.fat}g fat`,
          verdict: m.hostelNotes
        })),
        coachTip: 'Focus on serving sizes: high-protein items preserve muscle; moderate carb items fuel energy; cut deep-fried items.'
      };
    }

    return {
      title: 'MESS FOOD COMPARISON',
      winner: 'Balance & Portion Control',
      summary: 'Enter two or more foods (e.g. "Chapathi vs Rice", "Poori vs Idli", "Biryani") to receive an instant breakdown.',
      items: [],
      coachTip: 'Select any preset battle or type your hostel mess items above.'
    };
  }
};

/**
 * Dynamic Coaching Tips Engine
 */
const COACH_TIPS_ENGINE = {
  getDailyTip(profile, todayLog) {
    const steps = todayLog.steps || 0;
    const water = todayLog.water || 0;
    const stepGoal = profile.stepGoal || 12000;
    const waterGoal = profile.waterGoal || 3000;
    const currentWeight = profile.currentWeight || 85;

    // Check steps
    if (steps < 4000) {
      return {
        type: 'step-warning',
        tag: 'STEP PROTOCOL',
        title: 'Close the Step Gap Today',
        text: `You have logged ${steps.toLocaleString()} / ${stepGoal.toLocaleString()} steps. A 30-minute brisk walk around the hostel grounds or campus after dinner will easily add ~3,500 steps. Stay disciplined!`,
        actionText: 'Log Walk Steps'
      };
    }

    // Check water
    if (water < 1500) {
      return {
        type: 'water-warning',
        tag: 'HYDRATION PROTOCOL',
        title: 'Hydration Fuels Metabolism',
        text: `You have logged ${water} ml / ${waterGoal} ml (${Math.round((water/waterGoal)*100)}%). In hostel weather and athletic training, sub-optimal hydration slows fat mobilization and causes false hunger cues. Tap +250ml now!`,
        actionText: '+250 ML'
      };
    }

    // All active
    if (steps >= stepGoal && water >= waterGoal) {
      return {
        type: 'warrior',
        tag: 'AKHADA DISCIPLINE',
        title: 'Iron Standard Achieved Today',
        text: `Both your 12,000 steps and 3,000 ml water goals are complete. You are executing the Winter Arc standard. Rest well and repeat tomorrow.`,
        actionText: 'Review Daily Streak'
      };
    }

    // General high performance
    return {
      type: 'mindset',
      tag: 'TRANSFORMATION ETHOS',
      title: 'Discipline Over Motivation',
      text: `Going from 85 kg to 70 kg is a 15 kg athletic transformation. Daily scale weight will fluctuate by ±1 kg due to sodium and glycogen. Stick to the daily 12k steps, 3L water, and hostel mess portion control.`,
      actionText: 'Check Mess Coach'
    };
  }
};

// Export to window
window.HOSTEL_FOODS = HOSTEL_FOODS;
window.RECOMMENDATION_ENGINE = RECOMMENDATION_ENGINE;
window.COMPARISON_ENGINE = COMPARISON_ENGINE;
window.COACH_TIPS_ENGINE = COACH_TIPS_ENGINE;
window.searchFoodDatabase = searchFoodDatabase;
