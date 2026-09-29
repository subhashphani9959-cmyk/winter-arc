/**
 * WINTER ARC — State Management & Local Persistence Store
 * Manages daily logs, 12k steps, 3L water (+250ml increments), weight tracking,
 * meals, streaks, weekly reviews, and JSON data backup.
 */

const STORAGE_KEYS = {
  PROFILE: 'winter_arc_profile_v1',
  LOGS: 'winter_arc_daily_logs_v1',
  WEIGHT_HISTORY: 'winter_arc_weight_history_v1',
  SETTINGS: 'winter_arc_settings_v1'
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

if (typeof window !== 'undefined') {
  window.getTodayKey = getTodayKey;
  window.formatDateDisplay = formatDateDisplay;
}
if (typeof global !== 'undefined') {
  global.getTodayKey = getTodayKey;
  global.formatDateDisplay = formatDateDisplay;
}

class WinterArcStore {
  constructor() {
    this.profile = this.loadProfile();
    this.logs = this.loadLogs();
    this.weightHistory = this.loadWeightHistory();
    this.listeners = [];

    // Ensure today's log exists
    this.ensureTodayLog();
  }

  // ===================== PROFILE =====================
  getDefaultProfile() {
    return {
      name: 'Akhada Warrior',
      startingWeight: 85.0,
      currentWeight: 85.0,
      targetWeight: 70.0,
      stepGoal: 12000,
      waterGoal: 3000,
      waterIncrement: 250,
      soundEnabled: true,
      unit: 'kg',
      theme: 'dark-akhada',
      startDate: getTodayKey()
    };
  }

  loadProfile() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? { ...this.getDefaultProfile(), ...JSON.parse(saved) } : this.getDefaultProfile();
    } catch (e) {
      console.error('Error loading profile:', e);
      return this.getDefaultProfile();
    }
  }

  saveProfile(updatedProfile) {
    this.profile = { ...this.profile, ...updatedProfile };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
    this.notify();
  }

  // ===================== DAILY LOGS =====================
  loadLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error loading logs:', e);
      return {};
    }
  }

  saveLogs() {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
    this.notify();
  }

  ensureTodayLog() {
    const today = getTodayKey();
    if (!this.logs[today]) {
      this.logs[today] = {
        date: today,
        steps: 0,
        water: 0,
        weight: null,
        meals: {
          breakfast: [],
          lunch: [],
          snack: [],
          dinner: []
        },
        workouts: [],
        notes: ''
      };
      this.saveLogs();
    } else if (!this.logs[today].workouts) {
      this.logs[today].workouts = [];
    }
  }

  getTodayLog() {
    const today = getTodayKey();
    this.ensureTodayLog();
    return this.logs[today];
  }

  getLogForDate(dateStr) {
    return this.logs[dateStr] || {
      date: dateStr,
      steps: 0,
      water: 0,
      weight: null,
      meals: { breakfast: [], lunch: [], snack: [], dinner: [] }
    };
  }

  // ===================== WATER LOGGING =====================
  // EVERY ONE TAP = +250 ml (or user-defined increment)
  addWater(amount = 250) {
    const today = getTodayKey();
    this.ensureTodayLog();
    const current = this.logs[today].water || 0;
    this.logs[today].water = current + amount;
    this.saveLogs();
    return this.logs[today].water;
  }

  undoWater(amount = 250) {
    const today = getTodayKey();
    this.ensureTodayLog();
    const current = this.logs[today].water || 0;
    this.logs[today].water = Math.max(0, current - amount);
    this.saveLogs();
    return this.logs[today].water;
  }

  setWater(amount) {
    const today = getTodayKey();
    this.ensureTodayLog();
    this.logs[today].water = Math.max(0, parseInt(amount, 10) || 0);
    this.saveLogs();
    return this.logs[today].water;
  }

  // ===================== STEPS LOGGING =====================
  addSteps(amount) {
    const today = getTodayKey();
    this.ensureTodayLog();
    const current = this.logs[today].steps || 0;
    this.logs[today].steps = Math.max(0, current + (parseInt(amount, 10) || 0));
    this.saveLogs();
    return this.logs[today].steps;
  }

  setSteps(total) {
    const today = getTodayKey();
    this.ensureTodayLog();
    this.logs[today].steps = Math.max(0, parseInt(total, 10) || 0);
    this.saveLogs();
    return this.logs[today].steps;
  }

  // ===================== WEIGHT LOGGING =====================
  loadWeightHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Initialize with start weight
      const initial = [
        { date: getTodayKey(), weight: 85.0, note: 'Winter Arc Day 1 — The Starting Line' }
      ];
      return initial;
    } catch (e) {
      console.error('Error loading weight history:', e);
      return [{ date: getTodayKey(), weight: 85.0, note: 'Starting Line' }];
    }
  }

  saveWeightHistory() {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(this.weightHistory));
    this.notify();
  }

  logWeight(weightValue, date = getTodayKey(), note = '') {
    const val = parseFloat(weightValue);
    if (isNaN(val) || val <= 0) return false;

    // Update today's daily log
    this.ensureTodayLog();
    if (this.logs[date]) {
      this.logs[date].weight = val;
      this.saveLogs();
    }

    // Update weight history list
    const existingIndex = this.weightHistory.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
      this.weightHistory[existingIndex].weight = val;
      if (note) this.weightHistory[existingIndex].note = note;
    } else {
      this.weightHistory.push({ date, weight: val, note });
    }

    // Sort by date ascending
    this.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.saveWeightHistory();

    // Update current weight in profile if this is the most recent date
    const latest = this.weightHistory[this.weightHistory.length - 1];
    if (latest) {
      this.profile.currentWeight = latest.weight;
      this.saveProfile(this.profile);
    }

    return true;
  }

  // ===================== MEAL LOGGING =====================
  addMealItem(mealType, item) {
    const today = getTodayKey();
    this.ensureTodayLog();
    if (!this.logs[today].meals[mealType]) {
      this.logs[today].meals[mealType] = [];
    }
    const itemObj = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      name: item.name,
      originalInput: item.originalInput || item.originalQuery || item.name,
      quantity: item.quantity !== undefined ? item.quantity : 1,
      unit: item.unit || 'serving',
      portion: item.portion || item.displayPortion || '1 serving',
      calories: Math.round(item.calories || 0),
      protein: Number((item.protein || 0).toFixed(1)),
      carbs: Number((item.carbs || 0).toFixed(1)),
      fat: Number((item.fat || 0).toFixed(1)),
      confidence: item.confidence || 'HIGH',
      source: item.source || 'Manual Entry'
    };
    this.logs[today].meals[mealType].push(itemObj);
    this.saveLogs();
    return itemObj;
  }

  getMealTotals(mealType, date = getTodayKey()) {
    const log = this.getLogForDate(date);
    const items = (log.meals && log.meals[mealType]) || [];
    const totals = items.reduce((acc, i) => {
      acc.calories += (i.calories || 0);
      acc.protein += (i.protein || 0);
      acc.carbs += (i.carbs || 0);
      acc.fat += (i.fat || 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    totals.protein = Number(totals.protein.toFixed(1));
    totals.carbs = Number(totals.carbs.toFixed(1));
    totals.fat = Number(totals.fat.toFixed(1));
    return totals;
  }

  getDailyNutritionTotals(date = getTodayKey()) {
    const slots = ['breakfast', 'lunch', 'snack', 'dinner'];
    const summary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      slots: {}
    };

    slots.forEach(s => {
      const slotTotals = this.getMealTotals(s, date);
      summary.slots[s] = slotTotals;
      summary.calories += slotTotals.calories;
      summary.protein += slotTotals.protein;
      summary.carbs += slotTotals.carbs;
      summary.fat += slotTotals.fat;
    });

    summary.protein = Number(summary.protein.toFixed(1));
    summary.carbs = Number(summary.carbs.toFixed(1));
    summary.fat = Number(summary.fat.toFixed(1));
    return summary;
  }

  removeMealItem(mealType, itemId) {
    const today = getTodayKey();
    this.ensureTodayLog();
    if (this.logs[today].meals[mealType]) {
      this.logs[today].meals[mealType] = this.logs[today].meals[mealType].filter(i => i.id !== itemId);
      this.saveLogs();
    }
  }

  clearMeal(mealType) {
    const today = getTodayKey();
    this.ensureTodayLog();
    if (this.logs[today].meals[mealType]) {
      this.logs[today].meals[mealType] = [];
      this.saveLogs();
    }
  }

  // ===================== METRICS CALCULATIONS =====================
  getWeightMetrics() {
    const start = parseFloat(this.profile.startingWeight) || 85.0;
    const target = parseFloat(this.profile.targetWeight) || 70.0;
    const current = parseFloat(this.profile.currentWeight) || start;
    const totalToLose = Math.max(0.1, start - target); // 15 kg
    const lost = Math.max(0, Number((start - current).toFixed(1)));
    const remaining = Math.max(0, Number((current - target).toFixed(1)));
    const percent = Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)));

    // Calculate weekly average from last 7 weight entries
    let weeklyAverage = current;
    if (this.weightHistory.length > 0) {
      const last7 = this.weightHistory.slice(-7);
      const sum = last7.reduce((acc, curr) => acc + curr.weight, 0);
      weeklyAverage = Number((sum / last7.length).toFixed(1));
    }

    return {
      start,
      current,
      target,
      totalToLose,
      lost,
      remaining,
      percent,
      weeklyAverage
    };
  }

  // Calculates discipline streak based on consecutive active days
  getStreakInfo() {
    const todayKey = getTodayKey();
    const sortedDates = Object.keys(this.logs).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let isTodayCompleted = false;

    // Check today's 4 discipline pillars
    const todayLog = this.getTodayLog();
    const stepGoal = this.profile.stepGoal || 12000;
    const waterGoal = this.profile.waterGoal || 3000;

    const todayStepsDone = (todayLog.steps || 0) >= stepGoal;
    const todayWaterDone = (todayLog.water || 0) >= waterGoal;
    const todayWeightDone = todayLog.weight !== null && todayLog.weight !== undefined;
    const todayMealsDone = Object.values(todayLog.meals || {}).some(arr => arr.length > 0);

    const todayPillarsCount = [todayStepsDone, todayWaterDone, todayWeightDone, todayMealsDone].filter(Boolean).length;
    isTodayCompleted = todayPillarsCount >= 2;

    // Check consecutive days backwards
    const todayDate = new Date(todayKey);
    let checkDate = new Date(todayDate);

    // If today is completed or has activity, start checking from today, else start from yesterday
    for (let i = 0; i < 60; i++) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const log = this.logs[dateStr];
      if (log) {
        const sDone = (log.steps || 0) >= (stepGoal * 0.7); // at least 70% of goal counts for consistency
        const wDone = (log.water || 0) >= (waterGoal * 0.6);
        const hasMeal = Object.values(log.meals || {}).some(arr => arr && arr.length > 0);
        const hasWeight = log.weight !== null && log.weight !== undefined;

        if (sDone || wDone || hasMeal || hasWeight) {
          currentStreak++;
        } else if (i > 0) {
          // broken streak
          break;
        }
      } else if (i > 0) {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      currentStreak: Math.max(currentStreak, isTodayCompleted ? 1 : 0),
      todayPillars: {
        steps: todayStepsDone,
        water: todayWaterDone,
        weight: todayWeightDone,
        meals: todayMealsDone,
        count: todayPillarsCount
      }
    };
  }

  // Get past 7 days logs for graphs
  getLast7DaysLogs() {
    const list = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const log = this.getLogForDate(dateKey);
      list.push({
        date: dateKey,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateDisplay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        steps: log.steps || 0,
        water: log.water || 0,
        weight: log.weight || null,
        mealsCount: Object.values(log.meals || {}).reduce((acc, m) => acc + (m ? m.length : 0), 0)
      });
    }

    return list;
  }

  // Get weekly summary reviews
  getWeeklyReviews() {
    // Generate reviews based on existing logs or synthetic weekly batches
    const reviews = [];
    const last7 = this.getLast7DaysLogs();

    const totalSteps = last7.reduce((sum, d) => sum + d.steps, 0);
    const avgSteps = Math.round(totalSteps / 7);
    const waterDaysHit = last7.filter(d => d.water >= (this.profile.waterGoal || 3000)).length;
    const totalMeals = last7.reduce((sum, d) => sum + d.mealsCount, 0);

    // Find weights in this week
    const weights = last7.filter(d => d.weight).map(d => d.weight);
    const avgWeight = weights.length > 0 ? Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)) : this.profile.currentWeight;

    let weightChange = 0;
    if (this.weightHistory.length >= 2) {
      const oldestInPeriod = this.weightHistory[0].weight;
      const newestInPeriod = this.weightHistory[this.weightHistory.length - 1].weight;
      weightChange = Number((newestInPeriod - oldestInPeriod).toFixed(1));
    }

    reviews.push({
      weekLabel: 'CURRENT WEEK',
      weekNumber: 'WEEK 01',
      dateRange: `${last7[0].dateDisplay} – ${last7[6].dateDisplay}`,
      avgWeight: avgWeight,
      avgSteps: avgSteps,
      waterCompletion: `${waterDaysHit} / 7 days`,
      mealsLogged: totalMeals,
      weightChange: weightChange <= 0 ? `${weightChange} kg` : `+${weightChange} kg`,
      coachSummary: avgSteps >= 10000 
        ? 'Outstanding athletic output. You are pacing near the 12k target. Keep meal portions tight in the hostel mess.'
        : 'Good foundation. Increase your post-dinner walking loop to hit the 12k step standard consistently.'
    });

    return reviews;
  }

  // ===================== DEMO DATA GENERATOR =====================
  // Populates realistic progressive 10-day Winter Arc data from 85.0 kg to 83.4 kg
  loadDemoData() {
    const today = new Date();
    const demoWeights = [85.0, 84.8, 84.7, 84.5, 84.4, 84.2, 84.0, 83.8, 83.6, 83.4];
    const demoSteps = [11200, 12450, 12100, 13200, 11800, 12600, 12900, 12300, 13100, 8420];
    const demoWater = [3000, 3250, 3000, 3000, 2750, 3250, 3000, 3000, 3500, 2250];

    this.logs = {};
    this.weightHistory = [];

    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const idx = 9 - i;
      const w = demoWeights[idx];
      const s = demoSteps[idx];
      const h2o = demoWater[idx];

      this.logs[dateKey] = {
        date: dateKey,
        steps: s,
        water: h2o,
        weight: w,
        meals: {
          breakfast: [
            { id: 'm1', name: 'Idli (3 pcs)', portion: '3 steamed idlis with sambar', calories: 240, protein: 7 }
          ],
          lunch: [
            { id: 'm2', name: 'Chapathi (2)', portion: '2 rotis', calories: 220, protein: 7 },
            { id: 'm3', name: 'Dal Tadka', portion: '1 bowl', calories: 140, protein: 7 },
            { id: 'm4', name: 'Boiled Egg (2)', portion: '2 whole eggs', calories: 160, protein: 13 },
            { id: 'm5', name: 'Curd', portion: '1 katori', calories: 80, protein: 5 }
          ],
          snack: [
            { id: 'm6', name: 'Roasted Chana', portion: '1 handful', calories: 140, protein: 7.5 }
          ],
          dinner: [
            { id: 'm7', name: 'Chapathi (2)', portion: '2 rotis', calories: 220, protein: 7 },
            { id: 'm8', name: 'Chicken Curry', portion: '2 pieces meat (less gravy)', calories: 240, protein: 24 },
            { id: 'm9', name: 'Cucumber Salad', portion: '1 bowl', calories: 30, protein: 1 }
          ]
        },
        notes: `Day ${idx + 1} disciplined execution.`
      };

      this.weightHistory.push({
        date: dateKey,
        weight: w,
        note: idx === 0 ? 'Starting Line 85.0 kg' : `Progress check: ${w} kg`
      });
    }

    this.profile.startingWeight = 85.0;
    this.profile.currentWeight = 83.4;
    this.profile.targetWeight = 70.0;
    this.profile.stepGoal = 12000;
    this.profile.waterGoal = 3000;

    this.saveProfile(this.profile);
    this.saveLogs();
    this.saveWeightHistory();
    return true;
  }

  // Reset to clean 85kg starting state
  resetToCleanStart() {
    this.profile = this.getDefaultProfile();
    this.logs = {};
    const today = getTodayKey();
    this.weightHistory = [
      { date: today, weight: 85.0, note: 'Winter Arc Day 1 — The Starting Line' }
    ];
    this.ensureTodayLog();
    this.saveProfile(this.profile);
    this.saveLogs();
    this.saveWeightHistory();
  }

  // JSON Data Backup & Restore
  exportBackupJSON() {
    const backup = {
      version: 1,
      appName: 'WINTER_ARC',
      exportedAt: new Date().toISOString(),
      profile: this.profile,
      logs: this.logs,
      weightHistory: this.weightHistory
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackupJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.profile || !data.logs || !data.weightHistory) {
        throw new Error('Invalid Winter Arc backup format');
      }
      this.profile = { ...this.getDefaultProfile(), ...data.profile };
      this.logs = data.logs;
      this.weightHistory = data.weightHistory;

      this.saveProfile(this.profile);
      this.saveLogs();
      this.saveWeightHistory();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  // Event Subscription
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (e) { console.error('Store listener error:', e); }
    });
  }
}

// Global Store Instance
window.arcStore = new WinterArcStore();
