/**
 * WINTER ARC — Main Application Controller & UI Logic
 * Coordinates views, user interactions, 12k steps, 3L water (+250ml taps),
 * mess coach, comparisons, SVG charts, badges, and local persistence.
 */

class WinterArcApp {
  constructor() {
    this.store = window.arcStore;
    this.audioCtx = null;
    this.activeView = 'activity';
    this.activeCoachTab = 'plate-builder';
    this.selectedMessFoods = new Set();
    this.activeFoodCategory = 'all';
    this.openingState = 'OPENING_VIDEO';
    this.isTransitioning = false;
    this.openingTitleTimer = null;
    this.activeMealSlot = this.getAutoMealSlot();

    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.activeView = 'activity';
    }

    // Initialize audio context lazily on user gesture
    this.initAudio();

    // DOM Elements Cache
    this.cacheElements();

    // Bind event handlers
    this.bindEvents();

    // Initialize opening video & transition sequence
    this.initOpeningExperience();

    // Initial renders
    this.renderAll();

    // Check initial hash on load
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['activity', 'steps', 'dashboard', 'home', 'water', 'walking', 'food', 'training', 'progress', 'history', 'settings'].includes(initialHash)) {
      this.switchView(initialHash === 'home' || initialHash === 'dashboard' ? 'activity' : initialHash, false);
    }

    // Subscribe to store updates
    this.store.subscribe(() => {
      this.renderAll();
    });
  }

  getAutoMealSlot() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 19) return 'snack';
    return 'dinner';
  }

  // ===================== AUDIO FEEDBACK (WEB AUDIO API) =====================
  initAudio() {
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
  }

  playWaterSound() {
    if (!this.store.profile.soundEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Pitch drops slightly like a water droplet in a container
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playVictoryTone() {
    if (!this.store.profile.soundEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      [330, 440, 550, 660].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch (e) {
      // Audio fallback silent
    }
  }

  // ===================== DOM CACHE =====================
  cacheElements() {
    // Top Bar
    this.elHeaderStreakText = document.getElementById('headerStreakText');

    // Dashboard
    this.elDashCurrentWeight = document.getElementById('dashCurrentWeight');
    this.elDashTargetWeight = document.getElementById('dashTargetWeight');
    this.elDashRemainingWeight = document.getElementById('dashRemainingWeight');
    this.elDashJourneyBadge = document.getElementById('dashJourneyBadge');
    this.elDashProgressBar = document.getElementById('dashProgressBar');
    this.elDashDateToday = document.getElementById('dashDateToday');
    this.elDashPercentCompleted = document.getElementById('dashPercentCompleted');

    // Coach Alert
    this.elCoachAlertTag = document.getElementById('coachAlertTag');
    this.elCoachAlertTitle = document.getElementById('coachAlertTitle');
    this.elCoachAlertText = document.getElementById('coachAlertText');

    // Steps Card
    this.elStepsRingCircle = document.getElementById('stepsRingCircle');
    this.elStepsRingPercent = document.getElementById('stepsRingPercent');
    this.elStepsCurrentDisplay = document.getElementById('stepsCurrentDisplay');
    this.elStepsRemainingText = document.getElementById('stepsRemainingText');
    this.elStepsGoalBadge = document.getElementById('stepsGoalBadge');
    this.stepsTargetRatio = document.getElementById('stepsTargetRatio');
    this.stepConsistencyGrid = document.getElementById('stepConsistencyGrid');
    this.stepsConsistencyBadge = document.getElementById('stepsConsistencyBadge');

    // Water Card
    this.elWaterCurrentDisplay = document.getElementById('waterCurrentDisplay');
    this.elWaterTargetDisplay = document.getElementById('waterTargetDisplay');
    this.elWaterGlassesDisplay = document.getElementById('waterGlassesDisplay');
    this.elWaterGoalBadge = document.getElementById('waterGoalBadge');
    this.elWaterDropsGrid = document.getElementById('waterDropsGrid');
    this.elWaterProgressFill = document.getElementById('waterProgressFill');
    this.btnWaterAdd250 = document.getElementById('btnWaterAdd250');
    this.btnWaterUndo250 = document.getElementById('btnWaterUndo250');

    // Weight Card
    this.elWeightTodayDisplay = document.getElementById('weightTodayDisplay');
    this.elWeightTodaySub = document.getElementById('weightTodaySub');
    this.elWeightLoggedBadge = document.getElementById('weightLoggedBadge');
    this.elWeightStatTotalLost = document.getElementById('weightStatTotalLost');
    this.elWeightStatRemaining = document.getElementById('weightStatRemaining');
    this.elWeightStatWeeklyAvg = document.getElementById('weightStatWeeklyAvg');

    // Today's Food Summary
    this.elStatusBreakfast = document.getElementById('statusBreakfast');
    this.elStatusLunch = document.getElementById('statusLunch');
    this.elStatusSnack = document.getElementById('statusSnack');
    this.elStatusDinner = document.getElementById('statusDinner');

    // Mess Coach
    this.elMessSelectChips = document.getElementById('messSelectChips');
    this.elMessCustomInput = document.getElementById('messCustomInput');
    this.btnGeneratePlate = document.getElementById('btnGeneratePlate');
    this.elPlateResultContainer = document.getElementById('plateResultContainer');
    this.elComparePresetChips = document.getElementById('comparePresetChips');
    this.elCompareCustomInput = document.getElementById('compareCustomInput');
    this.btnRunCompare = document.getElementById('btnRunCompare');
    this.elCompareResultContainer = document.getElementById('compareResultContainer');
    this.elFoodCardsList = document.getElementById('foodCardsList');
    this.elFoodDbSearchInput = document.getElementById('foodDbSearchInput');
    this.elFoodDbCountBadge = document.getElementById('foodDbCountBadge');

    // Progress View
    this.elWeightSvgChart = document.getElementById('weightSvgChart');
    this.elChartLatestWeightBadge = document.getElementById('chartLatestWeightBadge');
    this.elProgCurrentWeight = document.getElementById('progCurrentWeight');
    this.elProgTotalLost = document.getElementById('progTotalLost');
    this.elProgRemaining = document.getElementById('progRemaining');
    this.elProgStepAvg = document.getElementById('progStepAvg');
    this.elStepsBarChartContainer = document.getElementById('stepsBarChartContainer');
    this.elMilestonesGrid = document.getElementById('milestonesGrid');

    // History View
    this.elReviewStreakNumber = document.getElementById('reviewStreakNumber');
    this.elWeeklyReviewsContainer = document.getElementById('weeklyReviewsContainer');

    // Modals
    this.modalWeightOverlay = document.getElementById('modalWeightOverlay');
    this.modalStepOverlay = document.getElementById('modalStepOverlay');
    this.modalMealOverlay = document.getElementById('modalMealOverlay');

    // Dynamic NLP Food Inputs & Preview Containers
    this.nlpFoodInputDash = document.getElementById('nlpFoodInputDash');
    this.btnParseFoodDash = document.getElementById('btnParseFoodDash');
    this.nlpPreviewContainerDash = document.getElementById('nlpPreviewContainerDash');

    this.nlpFoodInputFood = document.getElementById('nlpFoodInputFood');
    this.btnParseFoodFood = document.getElementById('btnParseFoodFood');
    this.nlpPreviewContainerFood = document.getElementById('nlpPreviewContainerFood');

    // Daily Macro Display Elements
    this.badgeMacroCal = document.getElementById('badgeMacroCal');
    this.macroValCal = document.getElementById('macroValCal');
    this.macroValProtein = document.getElementById('macroValProtein');
    this.macroValCarbs = document.getElementById('macroValCarbs');
    this.macroValFat = document.getElementById('macroValFat');

    this.macroFoodTabCal = document.getElementById('macroFoodTabCal');
    this.macroFoodTabProtein = document.getElementById('macroFoodTabProtein');
    this.macroFoodTabCarbs = document.getElementById('macroFoodTabCarbs');
    this.macroFoodTabFat = document.getElementById('macroFoodTabFat');

    this.slotTotalsBreakfast = document.getElementById('slotTotalsBreakfast');
    this.slotTotalsLunch = document.getElementById('slotTotalsLunch');
    this.slotTotalsSnack = document.getElementById('slotTotalsSnack');
    this.slotTotalsDinner = document.getElementById('slotTotalsDinner');

    // Training CTAs
    this.btnLaunchTrainingFromDash = document.getElementById('btnLaunchTrainingFromDash');
    this.btnQuickLaunchTrainingHeader = document.getElementById('btnQuickLaunchTrainingHeader');

    // Opening Hero Video
    this.heroOpeningVideo = document.getElementById('heroOpeningVideo');
    this.btnHeroAudioToggle = document.getElementById('btnHeroAudioToggle');
    this.heroAudioIcon = document.getElementById('heroAudioIcon');
    this.heroAudioLabel = document.getElementById('heroAudioLabel');

    // Home Quick Summary Pills
    this.homeSummarySteps = document.getElementById('homeSummarySteps');
    this.homeSummaryStepsSub = document.getElementById('homeSummaryStepsSub');
    this.homeSummaryWater = document.getElementById('homeSummaryWater');
    this.homeSummaryWaterSub = document.getElementById('homeSummaryWaterSub');
    this.homeSummaryFood = document.getElementById('homeSummaryFood');
    this.homeSummaryFoodSub = document.getElementById('homeSummaryFoodSub');
    this.homeSummaryTraining = document.getElementById('homeSummaryTraining');
    this.homeSummaryTrainingSub = document.getElementById('homeSummaryTrainingSub');

    // Dedicated Water View
    this.waterPercentDisplay = document.getElementById('waterPercentDisplay');
    this.waterRemainingText = document.getElementById('waterRemainingText');
    this.waterHistoryList = document.getElementById('waterHistoryList');

    // Dedicated Walking View
    this.walkWeeklyAvgBadge = document.getElementById('walkWeeklyAvgBadge');
    this.stepHistoryList = document.getElementById('stepHistoryList');

    // Dedicated Progress View
    this.weightHistoryListContainer = document.getElementById('weightHistoryListContainer');

    // Active Parsed State
    this.currentParsedResult = null;
    this.activeParsedContainer = null;
    this.activeParsedInput = null;

    // Opening Sequence Elements
    this.openingExperience = document.getElementById('openingExperience');
    this.openingTitle = document.getElementById('openingTitle');
    this.openingEnterWrap = document.getElementById('openingEnterWrap');
    this.btnOpeningEnter = document.getElementById('btnOpeningEnter');
    this.openingClickHint = document.getElementById('openingClickHint');
    this.dashCurrentProtein = document.getElementById('dashCurrentProtein');
    this.brandBadgeHome = document.getElementById('brandBadgeHome');

    // Toast Notice
    this.appToastNotice = document.getElementById('appToastNotice');
    this.toastMessage = document.getElementById('toastMessage');
  }

  // ===================== CINEMATIC OPENING SEQUENCE =====================
  initOpeningExperience() {
    this.openingExperience = document.getElementById('openingExperience');
    this.openingTitle = document.getElementById('openingTitle');
    this.openingEnterWrap = document.getElementById('openingEnterWrap');
    this.btnOpeningEnter = document.getElementById('btnOpeningEnter');
    this.heroOpeningVideo = document.getElementById('heroOpeningVideo');

    if (!this.openingExperience) return;

    // Auto-attempt video play on startup
    if (this.heroOpeningVideo && typeof this.heroOpeningVideo.play === 'function') {
      this.heroOpeningVideo.play().catch(() => {});
    }

    // Schedule title reveal after ~3 seconds
    if (this.openingTitleTimer) clearTimeout(this.openingTitleTimer);
    this.openingTitleTimer = setTimeout(() => {
      this.revealOpeningTitle();
    }, 3000);

    // Also monitor timeupdate in case video reaches ~2.8s earlier
    if (this.heroOpeningVideo && typeof this.heroOpeningVideo.addEventListener === 'function') {
      const onTimeUpdate = () => {
        if (this.heroOpeningVideo.currentTime >= 2.8 && this.openingState === 'OPENING_VIDEO') {
          this.revealOpeningTitle();
        }
      };
      this.heroOpeningVideo.addEventListener('timeupdate', onTimeUpdate);
    }

    // Both "WINTER ARC" title AND "ENTER" button are clickable entry points
    // calling the exact same enterApplication() transition
    this.openingTitle?.addEventListener('click', () => {
      this.enterApplication();
    });

    // Keyboard support (Enter/Space on title)
    this.openingTitle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.enterApplication();
      }
    });

    // Click on ENTER button triggers the exact same enterApplication()
    this.btnOpeningEnter?.addEventListener('click', () => {
      this.enterApplication();
    });
  }

  revealOpeningTitle() {
    if (this.openingState !== 'OPENING_VIDEO') return;
    this.openingState = 'TITLE_REVEALED';
    if (this.openingTitleTimer) clearTimeout(this.openingTitleTimer);
    this.openingExperience?.classList.add('title-revealed');
    this.openingEnterWrap?.classList.add('visible');
  }

  revealOpeningEnter() {
    this.revealOpeningTitle();
  }

  enterApplication() {
    // Prevent double-clicks / duplicate transitions
    if (this.isTransitioning) return;
    if (this.openingState === 'TRANSITIONING' || this.openingState === 'APP') return;
    this.isTransitioning = true;
    this.openingState = 'TRANSITIONING';

    // 1. Fade title and enter button
    if (this.openingTitle) this.openingTitle.style.opacity = '0';
    if (this.openingEnterWrap) this.openingEnterWrap.classList.remove('visible');

    // 2. Pause and stop video playback
    if (this.heroOpeningVideo && typeof this.heroOpeningVideo.pause === 'function') {
      this.heroOpeningVideo.pause();
    }

    // 3. Reveal Peddi/kushti photograph and interface
    document.body?.classList.add('app-entered');

    // 4. Complete transition after ~1400ms
    setTimeout(() => {
      this.openingState = 'APP';
      this.isTransitioning = false;
      if (this.openingExperience) {
        this.openingExperience.classList.add('fade-out');
        this.openingExperience.style.display = 'none';
      }
      // Guarantee video is stopped
      if (this.heroOpeningVideo && typeof this.heroOpeningVideo.pause === 'function') {
        this.heroOpeningVideo.pause();
      }
    }, 1400);
  }

  executeEnterTransition() {
    this.enterApplication();
  }

  replayIntro() {
    this.isTransitioning = false;
    this.openingState = 'OPENING_VIDEO';
    document.body?.classList.remove('app-entered');

    if (this.openingExperience) {
      this.openingExperience.style.display = 'flex';
      this.openingExperience.style.opacity = '1';
      this.openingExperience.classList.remove('fade-out', 'title-revealed');
    }
    if (this.openingEnterWrap) {
      this.openingEnterWrap.classList.remove('visible');
    }
    if (this.openingTitle) {
      this.openingTitle.style.opacity = '';
    }
    const hint = document.getElementById('openingClickHint');
    if (hint) {
      hint.textContent = 'TAP TO ENTER';
    }

    if (this.heroOpeningVideo) {
      this.heroOpeningVideo.currentTime = 0;
      if (typeof this.heroOpeningVideo.play === 'function') {
        this.heroOpeningVideo.play().catch(() => {});
      }
    }

    if (this.openingTitleTimer) clearTimeout(this.openingTitleTimer);
    this.openingTitleTimer = setTimeout(() => {
      this.revealOpeningTitle();
    }, 3000);
  }

  // ===================== EVENT BINDINGS =====================
  bindEvents() {
    // Bottom Navigation (Mobile)
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.nav;
        this.switchView(viewId);
      });
    });

    // Top Navigation (Desktop)
    document.querySelectorAll('.desk-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.nav;
        this.switchView(viewId);
      });
    });

    // Home Summary & Quick Navigation [data-jump] buttons
    document.querySelectorAll('[data-jump]').forEach(el => {
      el.addEventListener('click', () => {
        const targetView = el.dataset.jump;
        this.switchView(targetView);
      });
    });

    // Brand badge click -> Replay opening sequence or back to Activity
    document.getElementById('brandBadgeHome')?.addEventListener('click', () => {
      if (this.openingState === 'APP') {
        this.replayIntro();
      } else {
        this.switchView('activity');
      }
    });

    // Meal Context Slot Buttons
    document.querySelectorAll('.meal-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.meal-slot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeMealSlot = btn.dataset.slot;
        this.showToast(`Selected: ${btn.dataset.slot.toUpperCase()}`);
      });
    });

    // Header Settings button
    document.getElementById('btnHeaderSettings')?.addEventListener('click', () => {
      this.switchView('settings');
    });

    // Hero Opening Video Sound Toggle
    this.btnHeroAudioToggle?.addEventListener('click', () => {
      if (this.heroOpeningVideo) {
        this.heroOpeningVideo.muted = !this.heroOpeningVideo.muted;
        if (!this.heroOpeningVideo.muted && this.heroOpeningVideo.paused && typeof this.heroOpeningVideo.play === 'function') {
          this.heroOpeningVideo.play().catch(() => {});
        }
        if (this.heroAudioIcon) {
          this.heroAudioIcon.innerHTML = this.heroOpeningVideo.muted ? '&#128266;' : '&#128264;';
        }
        if (this.heroAudioLabel) {
          this.heroAudioLabel.textContent = this.heroOpeningVideo.muted ? 'UNMUTE' : 'MUTE';
        }
      }
    });

    // Auto-attempt video play on startup
    if (this.heroOpeningVideo && typeof this.heroOpeningVideo.play === 'function') {
      this.heroOpeningVideo.play().catch(() => {});
    }

    // Graceful missing-video fallback handling
    if (this.heroOpeningVideo) {
      const handleVideoError = () => {
        if (this.heroOpeningVideo) this.heroOpeningVideo.style.display = 'none';
        if (this.btnHeroAudioToggle) this.btnHeroAudioToggle.style.display = 'none';
      };
      this.heroOpeningVideo.addEventListener('error', handleVideoError, true);
      const sourceEl = typeof this.heroOpeningVideo.querySelector === 'function' ? this.heroOpeningVideo.querySelector('source') : null;
      if (sourceEl) {
        sourceEl.addEventListener('error', handleVideoError);
      }
    }

    // Browser Hash Routing (Back/Forward Navigation)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== this.activeView) {
        this.switchView(hash, false);
      }
    });

    // Quick Action button in Dashboard to jump to Mess Coach
    document.getElementById('btnQuickPlateBuilder')?.addEventListener('click', () => {
      this.switchView('food');
      this.switchCoachTab('plate-builder');
      this.elMessCustomInput?.focus();
    });

    document.getElementById('btnGoToFoodTab')?.addEventListener('click', () => {
      this.switchView('food');
      this.switchCoachTab('meal-logs');
    });

    // Dynamic NLP Food Input: Dashboard
    this.btnParseFoodDash?.addEventListener('click', () => {
      this.handleNlpParse(this.nlpFoodInputDash, this.nlpPreviewContainerDash, 'breakfast');
    });
    this.nlpFoodInputDash?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleNlpParse(this.nlpFoodInputDash, this.nlpPreviewContainerDash, 'breakfast');
      }
    });

    // Dynamic NLP Food Input: Food Tab
    this.btnParseFoodFood?.addEventListener('click', () => {
      this.handleNlpParse(this.nlpFoodInputFood, this.nlpPreviewContainerFood, 'lunch');
    });
    this.nlpFoodInputFood?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleNlpParse(this.nlpFoodInputFood, this.nlpPreviewContainerFood, 'lunch');
      }
    });

    // Training Mode CTAs
    this.btnLaunchTrainingFromDash?.addEventListener('click', () => {
      this.switchView('training');
    });
    this.btnQuickLaunchTrainingHeader?.addEventListener('click', () => {
      this.switchView('training');
    });

    // Food Slot pills
    ['breakfast', 'lunch', 'snack', 'dinner'].forEach(slot => {
      document.getElementById(`pillSlot${slot.charAt(0).toUpperCase() + slot.slice(1)}`)?.addEventListener('click', () => {
        this.openAddMealModal(slot);
      });
    });

    // Water Buttons: ONE TAP = +250 ML
    this.btnWaterAdd250?.addEventListener('click', () => {
      const inc = this.store.profile.waterIncrement || 250;
      const newTotal = this.store.addWater(inc);
      this.playWaterSound();
      this.showToast(`+${inc} ml Logged! (${newTotal.toLocaleString()} / ${(this.store.profile.waterGoal || 3000).toLocaleString()} ml)`);

      // If just hit water goal, play victory tone
      if (newTotal >= (this.store.profile.waterGoal || 3000) && (newTotal - inc) < (this.store.profile.waterGoal || 3000)) {
        this.playVictoryTone();
      }
    });

    this.btnWaterUndo250?.addEventListener('click', () => {
      const inc = this.store.profile.waterIncrement || 250;
      const newTotal = this.store.undoWater(inc);
      this.showToast(`Undo: -${inc} ml (${newTotal.toLocaleString()} ml)`);
    });

    // Step Quick Buttons
    document.querySelectorAll('.btn-step-add[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const addVal = parseInt(btn.dataset.add, 10);
        const newTotal = this.store.addSteps(addVal);
        this.showToast(`+${addVal.toLocaleString()} Steps Logged! (${newTotal.toLocaleString()} / 12,000)`);
        if (newTotal >= (this.store.profile.stepGoal || 12000) && (newTotal - addVal) < (this.store.profile.stepGoal || 12000)) {
          this.playVictoryTone();
        }
      });
    });

    document.getElementById('btnCustomStepModal')?.addEventListener('click', () => {
      this.openStepModal();
    });

    // Weight Log Trigger
    document.getElementById('btnOpenWeightModal')?.addEventListener('click', () => {
      this.openWeightModal();
    });

    // Mess Coach Tabs
    document.querySelectorAll('.coach-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchCoachTab(btn.dataset.coachTab);
      });
    });

    // Generate Plate button
    this.btnGeneratePlate?.addEventListener('click', () => {
      this.runPlateBuilder();
    });

    // Compare Run button
    this.btnRunCompare?.addEventListener('click', () => {
      const query = this.elCompareCustomInput?.value.trim() || 'chapathi vs rice';
      this.runComparison(query);
    });

    // Food Database Search
    this.elFoodDbSearchInput?.addEventListener('input', (e) => {
      this.filterFoodDatabase(e.target.value);
    });

    // Category filter pills
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFoodCategory = btn.dataset.cat;
        this.filterFoodDatabase(this.elFoodDbSearchInput?.value || '');
      });
    });

    // Modal Close buttons
    document.getElementById('btnCloseWeightModal')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btnCloseStepModal')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btnCloseMealModal')?.addEventListener('click', () => this.closeModals());

    this.modalWeightOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalWeightOverlay) this.closeModals();
    });
    this.modalStepOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalStepOverlay) this.closeModals();
    });
    this.modalMealOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalMealOverlay) this.closeModals();
    });

    // Modal Save Actions
    document.getElementById('btnSaveWeightEntry')?.addEventListener('click', () => {
      const weightVal = parseFloat(document.getElementById('inputLogWeightVal').value);
      const dateVal = document.getElementById('inputLogWeightDate').value || getTodayKey();
      const noteVal = document.getElementById('inputLogWeightNote').value;

      if (!isNaN(weightVal) && weightVal > 0) {
        this.store.logWeight(weightVal, dateVal, noteVal);
        this.closeModals();
        this.showToast(`Weight Logged: ${weightVal.toFixed(1)} kg`);
      } else {
        alert('Please enter a valid weight in kg (e.g. 84.8)');
      }
    });

    document.getElementById('btnSaveStepEntry')?.addEventListener('click', () => {
      const stepVal = parseInt(document.getElementById('inputStepTotalVal').value, 10);
      if (!isNaN(stepVal) && stepVal >= 0) {
        this.store.setSteps(stepVal);
        this.closeModals();
        this.showToast(`Total Steps Set: ${stepVal.toLocaleString()}`);
        if (stepVal >= (this.store.profile.stepGoal || 12000)) {
          this.playVictoryTone();
        }
      }
    });

    document.getElementById('btnSaveMealItem')?.addEventListener('click', () => {
      const slot = document.getElementById('inputMealSlotSelect').value;
      const name = document.getElementById('inputMealItemName').value.trim();
      const portion = document.getElementById('inputMealItemPortion').value.trim() || '1 serving';
      const cal = parseInt(document.getElementById('inputMealItemCal').value, 10) || 0;
      const protein = parseFloat(document.getElementById('inputMealItemProtein').value) || 0;

      if (name) {
        this.store.addMealItem(slot, { name, portion, calories: cal, protein, confidence: 'HIGH', source: 'MANUAL_ENTRY' });
        this.closeModals();
        this.showToast(`Added to ${slot.toUpperCase()}: ${name}`);
      } else {
        alert('Please enter a food name');
      }
    });

    // Settings Profile Save
    document.getElementById('btnSaveProfileSettings')?.addEventListener('click', () => {
      const startW = parseFloat(document.getElementById('setStartingWeight').value) || 85.0;
      const targetW = parseFloat(document.getElementById('setTargetWeight').value) || 70.0;
      const sGoal = parseInt(document.getElementById('setStepGoal').value, 10) || 12000;
      const wGoal = parseInt(document.getElementById('setWaterGoal').value, 10) || 3000;
      const wInc = parseInt(document.getElementById('setWaterInc').value, 10) || 250;

      this.store.saveProfile({
        startingWeight: startW,
        targetWeight: targetW,
        stepGoal: sGoal,
        waterGoal: wGoal,
        waterIncrement: wInc
      });
      this.showToast('Profile Targets Saved!');
    });

    // Settings Demo Data
    document.getElementById('btnLoadDemoData')?.addEventListener('click', () => {
      if (confirm('Load realistic 10-day progressive Winter Arc demonstration data (85.0 kg → 83.4 kg)?')) {
        this.store.loadDemoData();
        this.showToast('10-Day Demo Arc Loaded! Check Progress & Reviews.');
        this.switchView('dashboard');
      }
    });

    document.getElementById('btnResetToCleanStart')?.addEventListener('click', () => {
      if (confirm('Reset to clean Day 1 starting state at 85.0 kg?')) {
        this.store.resetToCleanStart();
        this.showToast('Reset to Day 1 Clean Start (85.0 kg)');
        this.switchView('dashboard');
      }
    });

    // Backup & Restore
    document.getElementById('btnExportBackup')?.addEventListener('click', () => {
      const jsonStr = this.store.exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `winter_arc_backup_${getTodayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Backup JSON Exported!');
    });

    document.getElementById('btnTriggerImport')?.addEventListener('click', () => {
      document.getElementById('fileImportInput')?.click();
    });

    document.getElementById('fileImportInput')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = this.store.importBackupJSON(event.target.result);
          if (success) {
            this.showToast('Backup Restored Successfully!');
            this.switchView('dashboard');
          } else {
            alert('Failed to import backup. File format invalid.');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // ===================== NAVIGATION =====================
  switchView(viewName, updateHash = true) {
    if (viewName === 'home') viewName = 'dashboard';
    this.activeView = viewName;

    // Set active section on body for dynamic backdrop vignette layering
    const activeCategory = (viewName === 'dashboard' ? 'activity' : (viewName === 'walking' ? 'steps' : viewName));
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.activeView = activeCategory;
    }

    // Update bottom nav active state (Mobile)
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      const bNav = btn.dataset.nav;
      const isActive = bNav === viewName || 
        ((viewName === 'activity' || viewName === 'dashboard') && (bNav === 'activity' || bNav === 'dashboard' || bNav === 'home')) ||
        ((viewName === 'steps' || viewName === 'walking') && (bNav === 'steps' || bNav === 'walking'));
      btn.classList.toggle('active', isActive);
    });

    // Update desktop nav active state
    document.querySelectorAll('.desk-nav-btn').forEach(btn => {
      const bNav = btn.dataset.nav;
      const isActive = bNav === viewName || 
        ((viewName === 'activity' || viewName === 'dashboard') && (bNav === 'activity' || bNav === 'dashboard' || bNav === 'home')) ||
        ((viewName === 'steps' || viewName === 'walking') && (bNav === 'steps' || bNav === 'walking'));
      btn.classList.toggle('active', isActive);
    });

    // Update view visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      const isSecActive = sec.id === `view-${viewName}` ||
        ((viewName === 'activity' || viewName === 'dashboard') && (sec.id === 'view-dashboard' || sec.id === 'view-activity' || sec.dataset.sectionAlias === 'activity')) ||
        ((viewName === 'steps' || viewName === 'walking') && (sec.id === 'view-steps' || sec.id === 'view-walking' || sec.dataset.sectionAlias === 'walking' || sec.dataset.sectionAlias === 'steps'));
      sec.classList.toggle('active', isSecActive);
    });

    if (updateHash && window.location.hash !== '#' + viewName) {
      window.location.hash = '#' + viewName;
    }

    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render specific view assets
    if (viewName === 'progress') {
      this.renderProgressView();
    } else if (viewName === 'water') {
      this.renderWaterView();
    } else if (viewName === 'walking' || viewName === 'steps') {
      this.renderStepsView();
    } else if (viewName === 'history') {
      this.renderHistoryView();
    } else if (viewName === 'food') {
      this.renderFoodView();
    } else if (viewName === 'dashboard' || viewName === 'activity') {
      this.renderDashboard();
    } else if (viewName === 'training') {
      if (window.trainingController) {
        window.trainingController.renderView();
      }
    }
  }

  switchCoachTab(tabName) {
    this.activeCoachTab = tabName;
    document.querySelectorAll('.coach-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.coachTab === tabName);
    });

    document.getElementById('coachSubPlateBuilder').style.display = tabName === 'plate-builder' ? 'block' : 'none';
    document.getElementById('coachSubCompare').style.display = tabName === 'compare' ? 'block' : 'none';
    document.getElementById('coachSubDatabase').style.display = tabName === 'database' ? 'block' : 'none';
    document.getElementById('coachSubMealLogs').style.display = tabName === 'meal-logs' ? 'block' : 'none';
  }

  // ===================== RENDER CONTROLLER =====================
  renderAll() {
    this.renderHeader();
    this.renderDashboard();
    this.renderWaterView();
    this.renderWalkingView();
    this.renderFoodView();
    this.renderProgressView();
    this.renderHistoryView();
    this.renderSettings();
  }

  renderHeader() {
    const streak = this.store.getStreakInfo();
    const days = streak.currentStreak;
    this.elHeaderStreakText.textContent = `${days} ${days === 1 ? 'DAY' : 'DAYS'} ARC`;
  }

  // ===================== DASHBOARD RENDERING =====================
  renderDashboard() {
    const metrics = this.store.getWeightMetrics();
    const todayLog = this.store.getTodayLog();
    const profile = this.store.profile;

    // Top Hero 85 -> 70
    this.elDashCurrentWeight.innerHTML = `${metrics.current.toFixed(1)}<span class="stat-unit">kg</span>`;
    this.elDashTargetWeight.innerHTML = `${metrics.target.toFixed(1)}<span class="stat-unit">kg</span>`;
    this.elDashRemainingWeight.innerHTML = `${metrics.remaining.toFixed(1)}<span class="stat-unit">kg</span>`;
    this.elDashJourneyBadge.textContent = `${metrics.totalToLose.toFixed(1)} KG JOURNEY`;
    this.elDashProgressBar.style.width = `${metrics.percent}%`;
    this.elDashPercentCompleted.textContent = `${metrics.percent}% Complete (${metrics.lost.toFixed(1)} kg lost)`;
    this.elDashDateToday.textContent = formatDateDisplay(getTodayKey());

    // Dynamic Coach Alert
    const dailyTip = COACH_TIPS_ENGINE.getDailyTip(profile, todayLog);
    this.elCoachAlertTag.textContent = dailyTip.tag;
    this.elCoachAlertTitle.textContent = dailyTip.title;
    this.elCoachAlertText.textContent = dailyTip.text;

    // Goal 1: 12,000 Steps
    const steps = todayLog.steps || 0;
    const stepGoal = profile.stepGoal || 12000;
    const stepPercent = Math.min(100, Math.round((steps / stepGoal) * 100));
    this.elStepsCurrentDisplay.innerHTML = `${steps.toLocaleString()} <span class="stat-unit">steps</span>`;
    this.elStepsRingPercent.textContent = `${stepPercent}%`;

    const remainingSteps = Math.max(0, stepGoal - steps);
    this.elStepsRemainingText.textContent = remainingSteps > 0
      ? `${remainingSteps.toLocaleString()} steps remaining`
      : '12,000 Step Goal Smashed! &check;';

    // SVG Ring circle circumference = 2 * PI * 42 = 263.89
    const circumference = 263.89;
    const offset = circumference - (circumference * (Math.min(steps, stepGoal) / stepGoal));
    this.elStepsRingCircle.style.strokeDashoffset = offset;

    this.elStepsGoalBadge.textContent = `${stepPercent}% Done`;
    this.elStepsGoalBadge.classList.toggle('completed', steps >= stepGoal);

    // Goal 2: Water (3,000 ml)
    const water = todayLog.water || 0;
    const waterGoal = profile.waterGoal || 3000;
    const waterInc = profile.waterIncrement || 250;
    const totalGlasses = Math.round(waterGoal / waterInc);
    const completedGlasses = Math.floor(water / waterInc);

    this.elWaterCurrentDisplay.textContent = water.toLocaleString();
    this.elWaterTargetDisplay.textContent = waterGoal.toLocaleString();
    this.elWaterGlassesDisplay.textContent = `${completedGlasses} / ${totalGlasses} glasses (${waterInc}ml)`;

    const waterPercent = Math.round((water / waterGoal) * 100);
    this.elWaterGoalBadge.textContent = `${waterPercent}% (${water.toLocaleString()}/${waterGoal.toLocaleString()} ML)`;
    this.elWaterGoalBadge.classList.toggle('completed', water >= waterGoal);
    if (this.elWaterProgressFill) {
      this.elWaterProgressFill.style.width = `${Math.min(100, Math.max(0, waterPercent))}%`;
    }

    // Render 12 Water Droplet Indicators
    this.elWaterDropsGrid.innerHTML = '';
    for (let i = 1; i <= totalGlasses; i++) {
      const drop = document.createElement('div');
      drop.className = `drop-indicator ${i <= completedGlasses ? 'filled' : ''}`;
      drop.title = `Glass ${i} (${i * waterInc} ml)`;
      drop.innerHTML = `
        <svg class="drop-svg" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2 C8 2 2.5 9.5 2.5 13.2 C2.5 16.4 5 18.5 8 18.5 C11 18.5 13.5 16.4 13.5 13.2 C13.5 9.5 8 2 8 2 Z" stroke="currentColor" stroke-width="1.3" fill="currentColor"/>
        </svg>
        <span class="drop-num">${i}</span>
      `;
      this.elWaterDropsGrid.appendChild(drop);
    }

    // Goal 3: Weight
    const todayWeight = todayLog.weight;
    if (todayWeight) {
      this.elWeightTodayDisplay.innerHTML = `${todayWeight.toFixed(1)} <span class="stat-unit">kg</span>`;
      this.elWeightTodaySub.textContent = `Logged today &bull; Target: ${metrics.target.toFixed(1)} kg`;
      this.elWeightLoggedBadge.textContent = 'Logged Today &check;';
      this.elWeightLoggedBadge.classList.add('completed');
    } else {
      this.elWeightTodayDisplay.innerHTML = `${metrics.current.toFixed(1)} <span class="stat-unit">kg</span>`;
      this.elWeightTodaySub.textContent = `Unlogged today &bull; Target: ${metrics.target.toFixed(1)} kg`;
      this.elWeightLoggedBadge.textContent = 'Pending Today';
      this.elWeightLoggedBadge.classList.remove('completed');
    }

    this.elWeightStatTotalLost.textContent = `${metrics.lost.toFixed(1)} kg`;
    this.elWeightStatRemaining.textContent = `${metrics.remaining.toFixed(1)} kg`;
    this.elWeightStatWeeklyAvg.textContent = `${metrics.weeklyAverage.toFixed(1)} kg`;

    // Today's Meal Summary Pills
    const meals = todayLog.meals || {};
    const updatePill = (slot, elPill, elStatus) => {
      const items = meals[slot] || [];
      if (items.length > 0) {
        elPill.classList.add('logged');
        elStatus.textContent = `&check; ${items.length}`;
      } else {
        elPill.classList.remove('logged');
        elStatus.innerHTML = '&mdash;';
      }
    };

    updatePill('breakfast', document.getElementById('pillSlotBreakfast'), this.elStatusBreakfast);
    updatePill('lunch', document.getElementById('pillSlotLunch'), this.elStatusLunch);
    updatePill('snack', document.getElementById('pillSlotSnack'), this.elStatusSnack);
    updatePill('dinner', document.getElementById('pillSlotDinner'), this.elStatusDinner);

    // Render Daily Nutrition Macro Totals
    const dailyMacros = this.store.getDailyNutritionTotals();
    if (this.macroValCal) this.macroValCal.textContent = dailyMacros.calories;
    if (this.macroValProtein) this.macroValProtein.textContent = `${dailyMacros.protein}g`;
    if (this.macroValCarbs) this.macroValCarbs.textContent = `${dailyMacros.carbs}g`;
    if (this.macroValFat) this.macroValFat.textContent = `${dailyMacros.fat}g`;
    if (this.badgeMacroCal) this.badgeMacroCal.textContent = `${dailyMacros.calories} kcal`;

    // Activity Quick Summary Cards & Pillars
    if (this.homeSummarySteps) {
      this.homeSummarySteps.textContent = `${steps.toLocaleString()} / ${stepGoal.toLocaleString()}`;
    }
    const dashStepsMiniFill = document.getElementById('dashStepsMiniFill');
    if (dashStepsMiniFill) {
      dashStepsMiniFill.style.width = `${stepPercent}%`;
    }
    if (this.homeSummaryStepsSub) {
      this.homeSummaryStepsSub.textContent = remainingSteps > 0
        ? `${remainingSteps.toLocaleString()} remaining`
        : 'Goal Smashed! &check;';
    }

    if (this.homeSummaryWater) {
      this.homeSummaryWater.textContent = `${water.toLocaleString()} / ${waterGoal.toLocaleString()} ML`;
    }
    if (this.homeSummaryWaterSub) {
      this.homeSummaryWaterSub.textContent = `${completedGlasses} / ${totalGlasses} glasses (${waterInc}ml)`;
    }

    if (this.homeSummaryFood) {
      this.homeSummaryFood.textContent = `${dailyMacros.calories} KCAL`;
    }
    if (this.homeSummaryFoodSub) {
      const totalItems = Object.values(meals).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);
      this.homeSummaryFoodSub.textContent = totalItems > 0 ? `${totalItems} items logged today` : 'Daily intake';
    }

    if (this.dashCurrentProtein) {
      this.dashCurrentProtein.textContent = `${dailyMacros.protein} G`;
    }

    const trainingDone = window.trainingController && window.trainingController.history && window.trainingController.history.some(h => h.date === getTodayKey());
    if (this.homeSummaryTraining) {
      this.homeSummaryTraining.textContent = trainingDone ? 'Completed' : '01';
    }
    if (this.homeSummaryTrainingSub) {
      this.homeSummaryTrainingSub.textContent = trainingDone ? 'Session logged &check;' : 'Winter Arc Day';
    }

    // Transformation Status & Protocol Overview Strip on Activity
    const workoutSummaryEl = document.getElementById('dashWorkoutSummaryVal');
    if (workoutSummaryEl) {
      workoutSummaryEl.innerHTML = trainingDone ? 'Dhruva Combat &bull; Completed &check;' : 'Dhruva Combat &bull; Akhada Conditioning';
    }
    const streakOverviewEl = document.getElementById('dashStreakOverviewVal');
    if (streakOverviewEl) {
      const streakInfo = this.store.getStreakInfo();
      streakOverviewEl.textContent = `${streakInfo.currentStreak} Day ${streakInfo.currentStreak === 1 ? 'Fire' : 'Streak'}`;
    }
    const overallStatusEl = document.getElementById('dashOverallStatusVal');
    if (overallStatusEl) {
      overallStatusEl.textContent = metrics.remaining > 0 ? `${metrics.remaining.toFixed(1)} KG to 70.0 KG Target` : 'Target 70 KG Achieved!';
    }
  }

  // ===================== WATER VIEW RENDERING =====================
  renderWaterView() {
    const todayLog = this.store.getTodayLog();
    const profile = this.store.profile;
    const water = todayLog.water || 0;
    const waterGoal = profile.waterGoal || 3000;
    const waterInc = profile.waterIncrement || 250;
    const totalGlasses = Math.round(waterGoal / waterInc);
    const completedGlasses = Math.floor(water / waterInc);
    const waterPercent = Math.round((water / waterGoal) * 100);
    const remainingWater = Math.max(0, waterGoal - water);

    if (this.elWaterCurrentDisplay) this.elWaterCurrentDisplay.textContent = water.toLocaleString();
    if (this.elWaterTargetDisplay) this.elWaterTargetDisplay.textContent = waterGoal.toLocaleString();
    if (this.elWaterGlassesDisplay) this.elWaterGlassesDisplay.textContent = `${completedGlasses} / ${totalGlasses} glasses (${waterInc}ml)`;
    if (this.waterPercentDisplay) this.waterPercentDisplay.textContent = `${waterPercent}%`;
    if (this.waterRemainingText) {
      this.waterRemainingText.textContent = remainingWater > 0
        ? `${remainingWater.toLocaleString()} ML REMAINING`
        : 'HYDRATION GOAL MET! &check;';
    }
    if (this.elWaterGoalBadge) {
      this.elWaterGoalBadge.textContent = `${waterPercent}% (${water.toLocaleString()}/${waterGoal.toLocaleString()} ML)`;
      this.elWaterGoalBadge.classList.toggle('completed', water >= waterGoal);
    }
    if (this.elWaterProgressFill) {
      this.elWaterProgressFill.style.width = `${Math.min(100, Math.max(0, waterPercent))}%`;
    }

    // Render 12 Water Droplet Indicators Grid
    if (this.elWaterDropsGrid) {
      this.elWaterDropsGrid.innerHTML = '';
      for (let i = 1; i <= totalGlasses; i++) {
        const drop = document.createElement('div');
        drop.className = `drop-indicator ${i <= completedGlasses ? 'filled' : ''}`;
        drop.title = `Glass ${i} (${i * waterInc} ml)`;
        drop.innerHTML = `
          <svg class="drop-svg" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2 C8 2 2.5 9.5 2.5 13.2 C2.5 16.4 5 18.5 8 18.5 C11 18.5 13.5 16.4 13.5 13.2 C13.5 9.5 8 2 8 2 Z" stroke="currentColor" stroke-width="1.3" fill="currentColor"/>
          </svg>
          <span class="drop-num">${i}</span>
        `;
        this.elWaterDropsGrid.appendChild(drop);
      }
    }

    // Hydration History
    if (this.waterHistoryList) {
      const last7 = this.store.getLast7DaysLogs();
      this.waterHistoryList.innerHTML = last7.map(d => {
        const hit = d.water >= waterGoal;
        const pct = Math.round((d.water / waterGoal) * 100);
        return `
          <div class="water-history-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(14, 11, 9, 0.6); border: 1px solid var(--border-subtle); border-radius: 6px; margin-bottom: 6px;">
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.88rem;">${d.dayLabel} (${d.date})</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${Math.floor(d.water / waterInc)} glasses (${waterInc}ml)</div>
            </div>
            <div style="text-align: right;">
              <span class="card-badge ${hit ? 'completed' : ''}" style="font-size: 0.78rem;">${d.water.toLocaleString()} / ${waterGoal.toLocaleString()} ML</span>
              <div style="font-size: 0.7rem; color: ${hit ? 'var(--accent-gold)' : 'var(--text-muted)'}; margin-top: 2px;">${pct}%</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ===================== WALKING & STEPS VIEW RENDERING =====================
  renderWalkingView() {
    this.renderStepsView();
  }

  renderStepsView() {
    const todayLog = this.store.getTodayLog();
    const profile = this.store.profile;
    const steps = todayLog.steps || 0;
    const stepGoal = profile.stepGoal || 12000;
    const stepPercent = Math.min(100, Math.round((steps / stepGoal) * 100));
    const remainingSteps = Math.max(0, stepGoal - steps);

    if (this.elStepsCurrentDisplay) {
      this.elStepsCurrentDisplay.innerHTML = `${steps.toLocaleString()} <span class="stat-unit">steps</span>`;
    }
    if (this.elStepsRingPercent) {
      this.elStepsRingPercent.textContent = `${stepPercent}%`;
    }
    if (this.elStepsRemainingText) {
      this.elStepsRemainingText.textContent = remainingSteps > 0
        ? `${remainingSteps.toLocaleString()} STEPS REMAINING`
        : '12,000 STEP GOAL SMASHED! &check;';
    }

    if (this.elStepsGoalBadge) {
      this.elStepsGoalBadge.textContent = `${stepPercent}% Done`;
      this.elStepsGoalBadge.classList.toggle('completed', steps >= stepGoal);
    }

    const elTargetRatio = document.getElementById('stepsTargetRatio');
    if (elTargetRatio) {
      elTargetRatio.textContent = `/ ${stepGoal.toLocaleString()} STEPS`;
    }

    // SVG Ring circle circumference = 2 * PI * 118 = 741.42
    const circumference = 741.42;
    const offset = circumference - (circumference * (Math.min(steps, stepGoal) / stepGoal));
    if (this.elStepsRingCircle) {
      this.elStepsRingCircle.style.strokeDasharray = circumference;
      this.elStepsRingCircle.style.strokeDashoffset = offset;
    }

    const last7 = this.store.getLast7DaysLogs();
    this.renderStepsBarChart(last7);
    this.renderStepsConsistency(last7, stepGoal);

    const avgSteps = Math.round(last7.reduce((sum, d) => sum + d.steps, 0) / 7);
    if (this.walkWeeklyAvgBadge) {
      this.walkWeeklyAvgBadge.textContent = `Avg: ${avgSteps.toLocaleString()} steps/day`;
    }

    // Clean 7-day history list with refined visualization (MON 10,240 with subtle gold progress bar)
    if (this.stepHistoryList) {
      this.stepHistoryList.innerHTML = last7.map(d => {
        const hit = d.steps >= stepGoal;
        const pct = Math.min(100, Math.round((d.steps / stepGoal) * 100));
        return `
          <div class="step-history-row">
            <span class="step-hist-day">${d.dayLabel.toUpperCase()}</span>
            <div class="step-hist-track">
              <div class="step-hist-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="step-hist-val">${d.steps.toLocaleString()}</span>
            <span class="step-hist-status ${hit ? 'hit' : ''}">${hit ? '&check;' : `${Math.max(0, stepGoal - d.steps).toLocaleString()} left`}</span>
          </div>
        `;
      }).join('');
    }
  }

  renderStepsConsistency(last7, stepGoal) {
    const elGrid = document.getElementById('stepConsistencyGrid') || this.stepConsistencyGrid;
    const elBadge = document.getElementById('stepsConsistencyBadge') || this.stepsConsistencyBadge;
    if (!elGrid) return;

    const daysHit = last7.filter(d => d.steps >= stepGoal).length;
    if (elBadge) {
      elBadge.textContent = `${daysHit} / 7 Days Met`;
      elBadge.classList.toggle('completed', daysHit >= 5);
    }

    elGrid.innerHTML = last7.map(d => {
      const hit = d.steps >= stepGoal;
      return `
        <div class="consistency-day-card ${hit ? 'goal-hit' : 'goal-missed'}">
          <span class="consistency-day-label">${d.dayLabel.toUpperCase()}</span>
          <span class="consistency-mark">${hit ? '&check;' : '&#10005;'}</span>
          <span class="consistency-steps">${d.steps.toLocaleString()}</span>
        </div>
      `;
    }).join('');
  }

  // ===================== MESS FOOD COACH RENDERING =====================
  renderFoodView() {
    this.renderMessSelectChips();
    this.renderFoodComparisonPresets();
    this.filterFoodDatabase(this.elFoodDbSearchInput?.value || '');
    this.renderMealLogs();
  }

  renderMessSelectChips() {
    if (!this.elMessSelectChips) return;
    const popularMessFoods = [
      'Chapathi / Roti', 'White Rice', 'Yellow Dal (Toor / Moong Tadka)',
      'Boiled Egg', 'Hostel Chicken Curry', 'Fresh Curd / Dahi',
      'Sambar', 'Mixed Vegetable Curry / Poriyal', 'Potato / Aloo Curry',
      'Soya Chunks Curry', 'Paneer Curry / Kadai Paneer', 'Idli', 'Plain Dosa', 'Poori'
    ];

    this.elMessSelectChips.innerHTML = '';
    popularMessFoods.forEach(foodName => {
      const foodObj = HOSTEL_FOODS.find(f => f.name === foodName) || { name: foodName };
      const chip = document.createElement('button');
      const isSelected = this.selectedMessFoods.has(foodName);
      chip.className = `food-select-chip ${isSelected ? 'selected' : ''}`;
      chip.textContent = `${isSelected ? '&check; ' : '+ '}${foodName}`;
      chip.addEventListener('click', () => {
        if (this.selectedMessFoods.has(foodName)) {
          this.selectedMessFoods.delete(foodName);
        } else {
          this.selectedMessFoods.add(foodName);
        }
        this.renderMessSelectChips();
      });
      this.elMessSelectChips.appendChild(chip);
    });
  }

  runPlateBuilder() {
    const selectedList = Array.from(this.selectedMessFoods);
    const typedText = this.elMessCustomInput?.value.trim() || '';

    let query = '';
    if (selectedList.length > 0 && typedText) {
      query = `${selectedList.join(', ')}, ${typedText}`;
    } else if (selectedList.length > 0) {
      query = selectedList.join(', ');
    } else if (typedText) {
      query = typedText;
    } else {
      query = 'Chapathi, rice, dal, chicken, curd';
      if (this.elMessCustomInput) this.elMessCustomInput.value = query;
    }

    const result = RECOMMENDATION_ENGINE.analyzePlate(query);
    if (!result) return;

    // Group items into tiers
    const prioritizeItems = result.recommendedPlate.filter(it => (it.tier || 'PRIORITIZE').toUpperCase() === 'PRIORITIZE');
    const moderateItems = result.recommendedPlate.filter(it => (it.tier || '').toUpperCase() === 'MODERATE');
    const limitItems = result.recommendedPlate.filter(it => (it.tier || '').toUpperCase().includes('LIMIT'));

    const renderTierGroup = (title, badgeClass, items) => {
      if (!items || items.length === 0) return '';
      return `
        <div class="plate-tier-group">
          <div class="plate-tier-header">
            <span class="tier-badge ${badgeClass}">${title}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div class="plate-items-list">
            ${items.map(item => `
              <div class="plate-item-row" style="display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                <span class="plate-item-icon" style="font-size: 1.25rem;">${item.icon || '🍽️'}</span>
                <div class="plate-item-details" style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span class="plate-item-name" style="font-weight: 700; color: var(--text-primary); font-size: 0.88rem;">${item.name}</span>
                    <span class="plate-item-portion" style="color: var(--accent-gold); font-size: 0.8rem; font-weight: 600;">${item.portion}</span>
                  </div>
                  <div class="plate-item-note" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${item.note || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    this.elPlateResultContainer.style.display = 'block';
    this.elPlateResultContainer.innerHTML = `
      <div class="plate-result-card">
        <div class="plate-header-row">
          <div>
            <span class="card-tag">COACH RECOMMENDATION</span>
            <h3 class="plate-header-title">RECOMMENDED ATHLETE PLATE</h3>
          </div>
          <span class="card-badge completed">~${result.estCalories} kcal &bull; ${result.estProtein}g Protein</span>
        </div>

        <!-- Tier Groups: PRIORITIZE, MODERATE, LIMIT PORTION -->
        <div style="margin-top: 10px;">
          ${renderTierGroup('PRIORITIZE', 'prioritize', prioritizeItems)}
          ${renderTierGroup('MODERATE', 'moderate', moderateItems)}
          ${renderTierGroup('LIMIT PORTION', 'limit', limitItems)}
        </div>

        <!-- Exact Practical Portions Card -->
        <div class="plate-practical-portions">
          <div class="practical-portions-title">
            <span>⚖️</span> EXACT PRACTICAL PORTIONS
          </div>
          <div class="portions-breakdown-list">
            ${result.recommendedPlate.map(item => `
              <div class="portion-row">
                <span class="portion-item-name">${item.name}</span>
                <span class="portion-arrow">&rarr;</span>
                <span class="portion-serving">${item.portion}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="plate-why-box">
          <div class="plate-why-title">THE COACH'S BREAKDOWN ("WHY?")</div>
          <p>${result.why}</p>
        </div>

        <div class="plate-hacks-list">
          <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase;">Hostel Mess Hacks:</span>
          ${result.hostelHacks.map(hack => `
            <div class="hack-item">
              <span class="hack-bullet">&bull;</span>
              <span>${hack}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
          <button class="btn-secondary" onclick="app.quickLogPlateToMeal('lunch')">+ Log to Lunch</button>
          <button class="btn-secondary" onclick="app.quickLogPlateToMeal('dinner')">+ Log to Dinner</button>
        </div>
      </div>
    `;

    this.elPlateResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  quickLogPlateToMeal(slotName) {
    const selectedList = Array.from(this.selectedMessFoods);
    const typedText = this.elMessCustomInput?.value.trim() || '';
    const plateDesc = selectedList.length > 0 ? selectedList.join(' + ') : typedText || 'Hostel Mess Balanced Plate';

    this.store.addMealItem(slotName, {
      name: `Mess Plate: ${plateDesc.slice(0, 32)}...`,
      portion: 'Coach Portioned Plate',
      calories: 450,
      protein: 24
    });

    this.showToast(`Logged to ${slotName.toUpperCase()}! &check;`);
  }

  // ===================== FOOD COMPARISON =====================
  renderFoodComparisonPresets() {
    if (!this.elComparePresetChips) return;
    const presets = COMPARISON_ENGINE.getPresetComparisons();
    this.elComparePresetChips.innerHTML = '';
    presets.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.textContent = p.title;
      chip.addEventListener('click', () => {
        if (this.elCompareCustomInput) this.elCompareCustomInput.value = p.query;
        this.runComparison(p.query);
      });
      this.elComparePresetChips.appendChild(chip);
    });

    // Default comparison run on init
    this.runComparison('chapathi vs rice');
  }

  runComparison(query) {
    const res = COMPARISON_ENGINE.compare(query);
    if (!res || !this.elCompareResultContainer) return;

    this.elCompareResultContainer.innerHTML = `
      <div style="margin-top: 10px;">
        <div class="compare-card-winner">
          <span style="font-size: 1.4rem;">&starf;</span>
          <div>
            <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 800; letter-spacing: 1px;">VERDICT</div>
            <div style="font-weight: 700; color: #ffffff;">${res.winner}</div>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">
          ${res.summary}
        </p>

        ${res.items.map(item => `
          <div class="compare-item-card">
            <span class="compare-item-name">${item.name}</span>
            <div class="compare-metrics-row">
              <span>Portion: ${item.recommendedPortion}</span>
              ${item.calories ? `<span>${item.calories}</span>` : ''}
              ${item.protein ? `<span>${item.protein}</span>` : ''}
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">${item.verdict}</p>
          </div>
        `).join('')}

        <div class="coach-alert-card" style="margin-top: 10px; border-left-color: var(--accent-gold);">
          <div class="coach-alert-body">
            <div class="coach-alert-tag">ATHLETE PROTOCOL TIP</div>
            <p class="coach-alert-text">${res.coachTip}</p>
          </div>
        </div>
      </div>
    `;
  }

  // ===================== FOOD DATABASE EXPLORER =====================
  filterFoodDatabase(query = '') {
    let list = HOSTEL_FOODS;
    if (this.activeFoodCategory !== 'all') {
      list = list.filter(f => f.category === this.activeFoodCategory);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some(t => t.includes(q)));
    }

    if (this.elFoodDbCountBadge) {
      this.elFoodDbCountBadge.textContent = `${list.length} Items`;
    }

    if (!this.elFoodCardsList) return;
    this.elFoodCardsList.innerHTML = list.map(item => `
      <div class="food-db-item">
        <div class="food-db-top">
          <span class="food-db-name">${item.name}</span>
          <span class="food-db-cal">~${item.calories} kcal</span>
        </div>
        <div class="food-macro-pills">
          <span class="macro-p-pill">${item.protein}g Protein</span> &bull;
          <span class="macro-c-pill">${item.carbs}g Carbs</span> &bull;
          <span class="macro-f-pill">${item.fat}g Fat</span>
        </div>
        <div class="food-db-portion">Suggested Serving: ${item.suggestedPortion}</div>
        <p class="food-db-notes">${item.hostelNotes}</p>
        <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem; align-self: flex-start; margin-top: 4px;" onclick="app.openAddMealModalWithFood('${item.id}')">
          + Log to Meal
        </button>
      </div>
    `).join('');
  }

  renderMealLogs() {
    const todayLog = this.store.getTodayLog();
    const meals = todayLog.meals || {};

    // Update Food Tab Daily Macro Strip
    const dailyMacros = this.store.getDailyNutritionTotals();
    if (this.macroFoodTabCal) this.macroFoodTabCal.textContent = dailyMacros.calories;
    if (this.macroFoodTabProtein) this.macroFoodTabProtein.textContent = `${dailyMacros.protein}g`;
    if (this.macroFoodTabCarbs) this.macroFoodTabCarbs.textContent = `${dailyMacros.carbs}g`;
    if (this.macroFoodTabFat) this.macroFoodTabFat.textContent = `${dailyMacros.fat}g`;

    const updateSlotTotals = (slotName, el) => {
      if (!el) return;
      const totals = this.store.getMealTotals(slotName);
      el.textContent = `${totals.calories} kcal • ${totals.protein}g P`;
    };
    updateSlotTotals('breakfast', this.slotTotalsBreakfast);
    updateSlotTotals('lunch', this.slotTotalsLunch);
    updateSlotTotals('snack', this.slotTotalsSnack);
    updateSlotTotals('dinner', this.slotTotalsDinner);

    const renderSlot = (slotName, elementId) => {
      const container = document.getElementById(elementId);
      if (!container) return;
      const items = meals[slotName] || [];
      if (items.length === 0) {
        container.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">No items logged</span>';
      } else {
        container.innerHTML = items.map(item => {
          const confBadge = item.confidence
            ? `<span class="confidence-badge conf-${item.confidence.toLowerCase()}" style="font-size: 0.6rem; padding: 1px 4px; margin-left: 4px;">${item.confidence}</span>`
            : '';
          const macrosText = `~${item.calories || 0} kcal &bull; ${item.protein || 0}g P${item.carbs !== undefined ? ' &bull; ' + item.carbs + 'g C' : ''}${item.fat !== undefined ? ' &bull; ' + item.fat + 'g F' : ''}`;

          return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(14, 11, 9, 0.6); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle);">
              <div>
                <div style="display: flex; align-items: center;">
                  <span style="font-weight: 600; color: var(--text-primary);">${item.name}</span>
                  ${confBadge}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                  Portion: ${item.portion || '1 serving'}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; color: var(--accent-gold); text-align: right;">${macrosText}</span>
                <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 2px 6px;" onclick="app.removeMealItem('${slotName}', '${item.id}')" title="Delete item">&times;</button>
              </div>
            </div>
          `;
        }).join('');
      }
    };

    renderSlot('breakfast', 'mealSlotItemsBreakfast');
    renderSlot('lunch', 'mealSlotItemsLunch');
    renderSlot('snack', 'mealSlotItemsSnack');
    renderSlot('dinner', 'mealSlotItemsDinner');
  }

  removeMealItem(slot, id) {
    this.store.removeMealItem(slot, id);
    this.showToast('Item removed');
  }

  // ===================== DYNAMIC FOOD PARSER UI =====================
  handleNlpParse(inputEl, containerEl, defaultSlot = 'breakfast') {
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) {
      this.showToast('Please type a meal or food item');
      return;
    }

    if (!window.foodParser) {
      alert('Food parser engine is loading...');
      return;
    }

    const items = window.foodParser.parse(text);
    if (!items || items.length === 0) {
      this.showToast('Could not recognize any items in your text.');
      return;
    }

    const totalCal = items.reduce((sum, it) => sum + (it.calories || 0), 0);
    const totalP = Number(items.reduce((sum, it) => sum + (it.protein || 0), 0).toFixed(1));
    const totalC = Number(items.reduce((sum, it) => sum + (it.carbs || 0), 0).toFixed(1));
    const totalF = Number(items.reduce((sum, it) => sum + (it.fat || 0), 0).toFixed(1));

    let overallConf = 'HIGH';
    if (items.some(it => it.confidence === 'LOW')) {
      overallConf = 'LOW';
    } else if (items.some(it => it.confidence === 'MEDIUM')) {
      overallConf = 'MEDIUM';
    }

    this.currentParsedResult = {
      originalInput: text,
      items: items,
      totalCalories: totalCal,
      totalProtein: totalP,
      totalCarbs: totalC,
      totalFat: totalF,
      overallConfidence: overallConf,
      preferredSlot: defaultSlot
    };
    this.activeParsedContainer = containerEl;
    this.activeParsedInput = inputEl;

    this.renderNlpParsedResult(this.currentParsedResult, containerEl);
  }

  renderNlpParsedResult(parsed, containerEl) {
    if (!containerEl || !parsed) return;
    containerEl.style.display = 'block';

    const preferredSlot = this.activeMealSlot || parsed.preferredSlot || 'breakfast';

    containerEl.innerHTML = `
      <div class="nlp-parsed-card" style="margin-top: 10px; background: var(--bg-card); border: 1px solid var(--border-gold); padding: 18px; border-radius: 2px;">
        <div class="parsed-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-title); font-size: 0.8rem; color: var(--accent-gold); font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">ANALYZED MEAL BREAKDOWN</span>
            <span class="confidence-badge ${parsed.overallConfidence === 'HIGH' ? 'high' : 'estimated'}">${parsed.overallConfidence === 'HIGH' ? 'VERIFIED' : 'ESTIMATED NUTRITION'}</span>
          </div>
          <button style="background: none; border: none; color: var(--text-ash); cursor: pointer; font-size: 1.4rem; line-height: 1;" onclick="app.closeNlpPreview('${containerEl.id}')" title="Dismiss">&times;</button>
        </div>

        <div class="parsed-items-list" style="display: flex; flex-direction: column; gap: 10px;">
          ${parsed.items.map((item, idx) => {
            const isVerified = item.source === 'INDIAN_NUTRITION_DB' && item.confidence === 'HIGH';
            return `
            <div class="parsed-item-row" style="display: flex; align-items: flex-start; gap: 12px; background: rgba(18, 17, 15, 0.85); padding: 12px 14px; border-radius: 2px; border: 1px solid var(--border-subtle);">
              <span style="font-size: 1.5rem; line-height: 1;">${item.emoji || '🍽️'}</span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px;">
                  <span style="font-weight: 700; color: var(--text-ivory); font-size: 0.95rem;">
                    ${item.name || item.cleanName}
                    <span style="color: var(--accent-gold); font-weight: 600; font-size: 0.82rem; margin-left: 4px;">&times; ${item.quantity} ${item.unit ? item.unit : ''}</span>
                  </span>
                  <span class="confidence-badge ${isVerified ? 'high' : 'estimated'}">${isVerified ? 'VERIFIED' : 'ESTIMATED NUTRITION'}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-stone); margin-top: 4px;">
                  <strong style="color: var(--accent-gold);">${item.calories} kcal</strong> &bull; 
                  <strong style="color: #60a5fa;">${item.protein}g protein</strong> &bull; 
                  <strong style="color: #fbbf24;">${item.carbs}g carbs</strong> &bull; 
                  <strong style="color: #f87171;">${item.fat}g fat</strong>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-ash); margin-top: 3px;">
                  Source: ${item.source === 'INDIAN_NUTRITION_DB' ? 'Hostel Nutrition Database' : 'Nutrition Heuristic Engine'} &bull; Confidence: ${item.confidence || 'ESTIMATED'}
                </div>

                <!-- Instant Quantity Chips -->
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                  <span style="font-size: 0.68rem; color: var(--text-ash); font-weight: 700; letter-spacing: 0.1em;">QTY:</span>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 1)">1</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 2)">2</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 3)">3</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 4)">4</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 100, 'g')">100g</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 150, 'g')">150g</button>
                  <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="app.updateItemQuantity(${idx}, 250, 'g')">250g</button>
                </div>

                ${item.clarifications && item.clarifications.length > 0 ? `
                  <div class="clarify-box" style="margin-top: 8px; padding: 6px 10px; background: rgba(198, 161, 91, 0.08); border-radius: 2px; border: 1px dashed rgba(198, 161, 91, 0.3);">
                    <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 700;">Refine estimate:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
                      ${item.clarifications.map((opt, optIdx) => `
                        <button class="clarify-chip" style="font-size: 0.7rem; background: var(--bg-graphite); border: 1px solid var(--border-subtle); color: var(--text-ivory); padding: 3px 8px; border-radius: 2px; cursor: pointer;" onclick="app.applyClarification(${idx}, ${optIdx})">
                          ${opt.text}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
            `;
          }).join('')}
        </div>

        <!-- Total Breakdown Box -->
        <div style="background: rgba(18, 17, 15, 0.95); border: 1px solid var(--border-gold); border-radius: 2px; padding: 14px; margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-family: var(--font-title); font-size: 0.78rem; color: var(--text-ivory); font-weight: 700; letter-spacing: 0.15em;">TOTAL ESTIMATED MEAL:</span>
            <span style="font-family: var(--font-display); font-size: 1.5rem; color: var(--accent-gold);">~${parsed.totalCalories} KCAL</span>
          </div>
          <div style="display: flex; gap: 14px; margin-top: 6px; font-size: 0.8rem; color: var(--text-stone);">
            <span>Protein: <strong style="color: var(--text-ivory);">${parsed.totalProtein}g</strong></span>
            <span>Carbs: <strong style="color: var(--text-ivory);">${parsed.totalCarbs}g</strong></span>
            <span>Fat: <strong style="color: var(--text-ivory);">${parsed.totalFat}g</strong></span>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-ash); font-style: italic; margin-top: 6px;">
            *Portions and macros adjust live with quantity selections.
          </div>
        </div>

        <!-- Add to Meal Slot Buttons -->
        <div style="margin-top: 14px;">
          <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">CONFIRM &amp; ADD TO LOG:</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button class="btn-secondary ${preferredSlot === 'breakfast' ? 'active-slot' : ''}" style="padding: 10px 4px; font-size: 0.75rem; text-align: center; border-color: ${preferredSlot === 'breakfast' ? 'var(--accent-gold)' : 'var(--border-subtle)'};" onclick="app.confirmNlpAddToMeal('breakfast')">+ BREAKFAST</button>
            <button class="btn-secondary ${preferredSlot === 'lunch' ? 'active-slot' : ''}" style="padding: 10px 4px; font-size: 0.75rem; text-align: center; border-color: ${preferredSlot === 'lunch' ? 'var(--accent-gold)' : 'var(--border-subtle)'};" onclick="app.confirmNlpAddToMeal('lunch')">+ LUNCH</button>
            <button class="btn-secondary ${preferredSlot === 'snack' ? 'active-slot' : ''}" style="padding: 10px 4px; font-size: 0.75rem; text-align: center; border-color: ${preferredSlot === 'snack' ? 'var(--accent-gold)' : 'var(--border-subtle)'};" onclick="app.confirmNlpAddToMeal('snack')">+ SNACK</button>
            <button class="btn-secondary ${preferredSlot === 'dinner' ? 'active-slot' : ''}" style="padding: 10px 4px; font-size: 0.75rem; text-align: center; border-color: ${preferredSlot === 'dinner' ? 'var(--accent-gold)' : 'var(--border-subtle)'};" onclick="app.confirmNlpAddToMeal('dinner')">+ DINNER</button>
          </div>
        </div>
      </div>
    `;

    if (typeof containerEl.scrollIntoView === 'function') {
      containerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  updateItemQuantity(itemIdx, newQty, unit) {
    if (!this.currentParsedResult || !this.currentParsedResult.items[itemIdx]) return;
    const item = this.currentParsedResult.items[itemIdx];

    // Store baseline single unit values if not yet cached
    if (item.baselineCal === undefined) {
      const origQty = item.quantity || 1;
      item.baselineCal = item.calories / origQty;
      item.baselineP = item.protein / origQty;
      item.baselineC = item.carbs / origQty;
      item.baselineF = item.fat / origQty;
    }

    let mult = newQty;
    if (unit === 'g') {
      mult = newQty / 100;
      item.unit = 'g';
      item.portion = `${newQty}g`;
    } else {
      item.unit = unit || item.unit;
      item.portion = `${newQty} ${item.unit || 'portion'}`;
    }

    item.quantity = newQty;
    item.calories = Math.round(item.baselineCal * mult);
    item.protein = Number((item.baselineP * mult).toFixed(1));
    item.carbs = Number((item.baselineC * mult).toFixed(1));
    item.fat = Number((item.baselineF * mult).toFixed(1));

    // Recalculate totals
    const items = this.currentParsedResult.items;
    this.currentParsedResult.totalCalories = items.reduce((sum, it) => sum + (it.calories || 0), 0);
    this.currentParsedResult.totalProtein = Number(items.reduce((sum, it) => sum + (it.protein || 0), 0).toFixed(1));
    this.currentParsedResult.totalCarbs = Number(items.reduce((sum, it) => sum + (it.carbs || 0), 0).toFixed(1));
    this.currentParsedResult.totalFat = Number(items.reduce((sum, it) => sum + (it.fat || 0), 0).toFixed(1));

    if (this.activeParsedContainer) {
      this.renderNlpParsedResult(this.currentParsedResult, this.activeParsedContainer);
    }
  }

  applyClarification(itemIdx, optIdx) {
    if (!this.currentParsedResult || !this.currentParsedResult.items[itemIdx]) return;
    const item = this.currentParsedResult.items[itemIdx];
    const opt = item.clarifications[optIdx];
    if (!opt) return;

    if (opt.cal !== undefined) {
      item.calories = Math.round(opt.cal * item.quantity);
      item.protein = Number((opt.p * item.quantity).toFixed(1));
      item.carbs = Number((opt.c * item.quantity).toFixed(1));
      item.fat = Number((opt.f * item.quantity).toFixed(1));
      item.name = opt.text;
    } else if (opt.mult !== undefined) {
      item.calories = Math.round(item.calories * opt.mult);
      item.protein = Number((item.protein * opt.mult).toFixed(1));
      item.carbs = Number((item.carbs * opt.mult).toFixed(1));
      item.fat = Number((item.fat * opt.mult).toFixed(1));
      item.portion = opt.text;
    }

    // Remove clarification after choice is applied
    item.clarifications = [];

    // Recalculate totals
    const items = this.currentParsedResult.items;
    this.currentParsedResult.totalCalories = items.reduce((sum, it) => sum + (it.calories || 0), 0);
    this.currentParsedResult.totalProtein = Number(items.reduce((sum, it) => sum + (it.protein || 0), 0).toFixed(1));
    this.currentParsedResult.totalCarbs = Number(items.reduce((sum, it) => sum + (it.carbs || 0), 0).toFixed(1));
    this.currentParsedResult.totalFat = Number(items.reduce((sum, it) => sum + (it.fat || 0), 0).toFixed(1));

    if (this.activeParsedContainer) {
      this.renderNlpParsedResult(this.currentParsedResult, this.activeParsedContainer);
    }
  }

  confirmNlpAddToMeal(slot) {
    if (!this.currentParsedResult || !this.currentParsedResult.items || this.currentParsedResult.items.length === 0) return;

    const items = this.currentParsedResult.items;
    items.forEach(item => {
      this.store.addMealItem(slot, {
        name: item.name || item.cleanName,
        portion: item.portion || item.displayPortion || `${item.quantity} ${item.unit || 'portion'}`,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        confidence: item.confidence || 'HIGH',
        source: item.source || 'DYNAMIC_NLP_ENGINE',
        quantity: item.quantity,
        unit: item.unit,
        originalInput: this.currentParsedResult.originalInput
      });
    });

    this.showToast(`Logged to ${slot.toUpperCase()}! (~${this.currentParsedResult.totalCalories} kcal, ${this.currentParsedResult.totalProtein}g P)`);

    // Reset inputs
    if (this.activeParsedInput) this.activeParsedInput.value = '';
    if (this.nlpFoodInputDash) this.nlpFoodInputDash.value = '';
    if (this.nlpFoodInputFood) this.nlpFoodInputFood.value = '';

    if (this.activeParsedContainer) this.activeParsedContainer.style.display = 'none';
    if (this.nlpPreviewContainerDash) this.nlpPreviewContainerDash.style.display = 'none';
    if (this.nlpPreviewContainerFood) this.nlpPreviewContainerFood.style.display = 'none';

    this.currentParsedResult = null;
    this.activeParsedContainer = null;
    this.activeParsedInput = null;

    // Refresh UI
    this.renderDashboard();
    this.renderMealLogs();
  }

  closeNlpPreview(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.style.display = 'none';
    this.currentParsedResult = null;
  }

  // ===================== PROGRESS & CHARTS RENDERING =====================
  renderProgressView() {
    const metrics = this.store.getWeightMetrics();
    const history = this.store.weightHistory;
    const last7 = this.store.getLast7DaysLogs();
    const todayLog = this.store.getTodayLog();

    if (this.elProgCurrentWeight) this.elProgCurrentWeight.textContent = `${metrics.current.toFixed(1)} kg`;
    if (this.elProgTotalLost) this.elProgTotalLost.textContent = `${metrics.lost.toFixed(1)} kg`;
    if (this.elProgRemaining) this.elProgRemaining.textContent = `${metrics.remaining.toFixed(1)} kg`;
    if (this.elChartLatestWeightBadge) this.elChartLatestWeightBadge.textContent = `${metrics.current.toFixed(1)} kg`;

    const avgSteps = Math.round(last7.reduce((sum, d) => sum + d.steps, 0) / 7);
    if (this.elProgStepAvg) this.elProgStepAvg.textContent = `${avgSteps.toLocaleString()} steps`;

    // Render Today's Weight Card (cardWeightGoal in view-progress)
    const todayWeight = todayLog.weight;
    if (this.elWeightTodayDisplay) {
      if (todayWeight) {
        this.elWeightTodayDisplay.innerHTML = `${todayWeight.toFixed(1)} <span class="stat-unit">kg</span>`;
      } else {
        this.elWeightTodayDisplay.innerHTML = `${metrics.current.toFixed(1)} <span class="stat-unit">kg</span>`;
      }
    }
    if (this.elWeightTodaySub) {
      this.elWeightTodaySub.textContent = todayWeight
        ? `Logged today &bull; Target: ${metrics.target.toFixed(1)} kg`
        : `Unlogged today &bull; Target: ${metrics.target.toFixed(1)} kg`;
    }
    if (this.elWeightLoggedBadge) {
      if (todayWeight) {
        this.elWeightLoggedBadge.textContent = 'Logged Today &check;';
        this.elWeightLoggedBadge.classList.add('completed');
      } else {
        this.elWeightLoggedBadge.textContent = 'Pending Today';
        this.elWeightLoggedBadge.classList.remove('completed');
      }
    }
    if (this.elWeightStatTotalLost) this.elWeightStatTotalLost.textContent = `${metrics.lost.toFixed(1)} kg`;
    if (this.elWeightStatRemaining) this.elWeightStatRemaining.textContent = `${metrics.remaining.toFixed(1)} kg`;
    if (this.elWeightStatWeeklyAvg) this.elWeightStatWeeklyAvg.textContent = `${metrics.weeklyAverage.toFixed(1)} kg`;

    // Render weight history entries list
    if (this.weightHistoryListContainer) {
      const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
      this.weightHistoryListContainer.innerHTML = sortedHistory.map(entry => `
        <div class="weight-history-entry" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(14, 11, 9, 0.6); border: 1px solid var(--border-subtle); border-radius: 6px; margin-bottom: 6px;">
          <div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${entry.date} ${entry.date === getTodayKey() ? '<span style="font-size: 0.7rem; color: var(--accent-gold);">(Today)</span>' : ''}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${entry.note || 'Morning weigh-in (fasted)'}</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); font-family: var(--font-condensed);">${entry.weight.toFixed(1)} <span style="font-size: 0.75rem; color: var(--text-secondary);">kg</span></span>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${(85.0 - entry.weight).toFixed(1)} kg lost</div>
          </div>
        </div>
      `).join('');
    }

    // Render SVG Weight Chart
    this.renderWeightChart(history);

    // Render 7-Day Steps Bar Chart
    this.renderStepsBarChart(last7);

    // Render Badges
    this.renderBadges(metrics, avgSteps);
  }

  renderWeightChart(history) {
    if (!this.elWeightSvgChart) return;
    const svg = this.elWeightSvgChart;
    svg.innerHTML = `
      <defs>
        <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4a373" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#d4a373" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
    `;

    const width = 460;
    const height = 200;
    const padX = 40;
    const padY = 25;

    // Weight range from 88 to 68 kg
    const minW = 68.0;
    const maxW = 88.0;

    const getY = (w) => {
      const norm = (w - minW) / (maxW - minW);
      return height - padY - (norm * (height - 2 * padY));
    };

    // Draw horizontal reference lines
    const startLineY = getY(85.0);
    const targetLineY = getY(70.0);

    // Gridlines at 85, 80, 75, 70
    [85, 80, 75, 70].forEach(val => {
      const y = getY(val);
      const isStart = val === 85;
      const isTarget = val === 70;
      const cls = isStart ? 'chart-start-line' : (isTarget ? 'chart-target-line' : 'chart-guideline');

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padX);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - 10);
      line.setAttribute('y2', y);
      line.setAttribute('class', cls);
      svg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', 5);
      label.setAttribute('y', y + 4);
      label.setAttribute('fill', isStart ? '#d62828' : (isTarget ? '#10b981' : '#7c7467'));
      label.setAttribute('font-size', '10px');
      label.setAttribute('font-family', 'sans-serif');
      label.textContent = `${val}k`;
      svg.appendChild(label);
    });

    if (history.length === 0) return;

    // Plot data points
    const stepX = (width - padX - 20) / Math.max(1, history.length - 1);
    const points = history.map((entry, idx) => ({
      x: history.length === 1 ? width / 2 : padX + (idx * stepX),
      y: getY(entry.weight),
      weight: entry.weight,
      date: entry.date
    }));

    // Generate Path
    if (points.length >= 2) {
      const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

      // Fill area path
      const dArea = `${dPath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', dArea);
      area.setAttribute('class', 'chart-weight-area');
      svg.appendChild(area);

      // Line
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', dPath);
      path.setAttribute('class', 'chart-weight-path');
      svg.appendChild(path);
    }

    // Circles
    points.forEach(pt => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('class', 'chart-point');
      circle.innerHTML = `<title>${pt.date}: ${pt.weight} kg</title>`;
      svg.appendChild(circle);
    });
  }

  renderStepsBarChart(last7) {
    if (!this.elStepsBarChartContainer) return;
    const maxSteps = 16000;
    this.elStepsBarChartContainer.innerHTML = last7.map(d => {
      const pct = Math.min(100, Math.round((d.steps / maxSteps) * 100));
      const hit = d.steps >= (this.store.profile.stepGoal || 12000);
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%;">
          <div style="font-size: 0.65rem; color: ${hit ? 'var(--accent-amber)' : 'var(--text-muted)'}; font-weight: 600;">
            ${d.steps > 0 ? (d.steps >= 1000 ? (d.steps/1000).toFixed(1) + 'k' : d.steps) : '0'}
          </div>
          <div style="width: 100%; height: 80px; background: rgba(14, 11, 9, 0.8); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; border: 1px solid var(--border-subtle);">
            <div style="width: 100%; height: ${pct}%; background: ${hit ? 'linear-gradient(180deg, #e85d04, #d62828)' : '#3a281e'}; border-radius: 4px; transition: height 0.6s ease;"></div>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">${d.dayLabel}</div>
        </div>
      `;
    }).join('');
  }

  renderBadges(metrics, avgSteps) {
    if (!this.elMilestonesGrid) return;
    const badges = [
      {
        id: 'b1',
        title: 'The Initiation',
        desc: 'Started Winter Arc Day 1 (85.0 kg)',
        icon: '&#9876;',
        unlocked: this.store.weightHistory.length > 0
      },
      {
        id: 'b2',
        title: 'Sub-84 Rampart',
        desc: 'Broached the 84.0 kg milestone',
        icon: '&#128170;',
        unlocked: metrics.current < 84.0
      },
      {
        id: 'b3',
        title: '12k Commando',
        desc: 'Averaging over 10,000 daily steps',
        icon: '&#128095;',
        unlocked: avgSteps >= 10000
      },
      {
        id: 'b4',
        title: 'Hydration Iron Grip',
        desc: 'Met 3L target consistently',
        icon: '&#128167;',
        unlocked: (this.store.getTodayLog().water || 0) >= 3000
      },
      {
        id: 'b5',
        title: 'Halfway Titan',
        desc: 'Reach 77.5 kg (Half of 15 kg lost)',
        icon: '&#128081;',
        unlocked: metrics.lost >= 7.5
      },
      {
        id: 'b6',
        title: 'Akhada Champion',
        desc: 'Hit ultimate 70.0 kg target',
        icon: '&#127942;',
        unlocked: metrics.current <= 70.0
      }
    ];

    this.elMilestonesGrid.innerHTML = badges.map(b => `
      <div class="badge-card ${b.unlocked ? 'unlocked' : ''}">
        <span class="badge-icon">${b.icon}</span>
        <div class="badge-info">
          <span class="badge-title">${b.title}</span>
          <span class="badge-desc">${b.desc}</span>
        </div>
      </div>
    `).join('');
  }

  // ===================== HISTORY & REVIEW RENDERING =====================
  renderHistoryView() {
    const streak = this.store.getStreakInfo();
    this.elReviewStreakNumber.textContent = streak.currentStreak;

    // 4 Pillars Checklist
    const p = streak.todayPillars;
    const updateCheck = (elItem, elIcon, elStatus, isDone, label) => {
      elItem.classList.toggle('done', isDone);
      elIcon.innerHTML = isDone ? '&check;' : '&#9675;';
      elStatus.textContent = isDone ? 'Complete &check;' : 'Pending';
    };

    updateCheck(document.getElementById('pillarSteps'), document.getElementById('pillarIconSteps'), document.getElementById('pillarStatusSteps'), p.steps);
    updateCheck(document.getElementById('pillarWater'), document.getElementById('pillarIconWater'), document.getElementById('pillarStatusWater'), p.water);
    updateCheck(document.getElementById('pillarWeight'), document.getElementById('pillarIconWeight'), document.getElementById('pillarStatusWeight'), p.weight);
    updateCheck(document.getElementById('pillarFood'), document.getElementById('pillarIconFood'), document.getElementById('pillarStatusFood'), p.meals);

    // Weekly Reviews
    const reviews = this.store.getWeeklyReviews();
    this.elWeeklyReviewsContainer.innerHTML = reviews.map(r => `
      <article class="weekly-summary-card">
        <div class="card-header-row">
          <div class="card-title-group">
            <span class="card-tag">${r.weekLabel}</span>
            <h3 class="card-name">${r.weekNumber} (${r.dateRange})</h3>
          </div>
          <span class="card-badge completed">${r.weightChange}</span>
        </div>

        <div class="weekly-stats-table">
          <div class="week-stat-box">
            <span class="week-stat-title">Average Weight</span>
            <span class="week-stat-number">${r.avgWeight.toFixed(1)} kg</span>
          </div>
          <div class="week-stat-box">
            <span class="week-stat-title">Average Steps</span>
            <span class="week-stat-number">${r.avgSteps.toLocaleString()}</span>
          </div>
          <div class="week-stat-box">
            <span class="week-stat-title">Water Target Hit</span>
            <span class="week-stat-number">${r.waterCompletion}</span>
          </div>
          <div class="week-stat-box">
            <span class="week-stat-title">Meals Logged</span>
            <span class="week-stat-number">${r.mealsLogged}</span>
          </div>
        </div>

        <div class="week-coach-verdict">
          <div style="font-size: 0.68rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">COACH'S FACTUAL REVIEW</div>
          <p>${r.coachSummary}</p>
        </div>
      </article>
    `).join('');
  }

  renderSettings() {
    const p = this.store.profile;
    const setStart = document.getElementById('setStartingWeight');
    const setTarget = document.getElementById('setTargetWeight');
    const setStep = document.getElementById('setStepGoal');
    const setWater = document.getElementById('setWaterGoal');
    const setInc = document.getElementById('setWaterInc');

    if (setStart) setStart.value = p.startingWeight;
    if (setTarget) setTarget.value = p.targetWeight;
    if (setStep) setStep.value = p.stepGoal;
    if (setWater) setWater.value = p.waterGoal;
    if (setInc) setInc.value = p.waterIncrement;
  }

  // ===================== MODALS =====================
  openWeightModal() {
    const inputVal = document.getElementById('inputLogWeightVal');
    const inputDate = document.getElementById('inputLogWeightDate');
    if (inputVal) inputVal.value = this.store.profile.currentWeight || 85.0;
    if (inputDate) inputDate.value = getTodayKey();
    this.modalWeightOverlay.classList.add('open');
    inputVal?.focus();
  }

  openStepModal() {
    const inputVal = document.getElementById('inputStepTotalVal');
    if (inputVal) inputVal.value = this.store.getTodayLog().steps || 12000;
    this.modalStepOverlay.classList.add('open');
    inputVal?.focus();
  }

  openAddMealModal(slotName = 'lunch') {
    const select = document.getElementById('inputMealSlotSelect');
    const nameInput = document.getElementById('inputMealItemName');
    const portionInput = document.getElementById('inputMealItemPortion');
    const calInput = document.getElementById('inputMealItemCal');
    const proteinInput = document.getElementById('inputMealItemProtein');

    if (select) select.value = slotName;
    if (nameInput) nameInput.value = '';
    if (portionInput) portionInput.value = '';
    if (calInput) calInput.value = '';
    if (proteinInput) proteinInput.value = '';

    this.modalMealOverlay.classList.add('open');
    nameInput?.focus();
  }

  openAddMealModalWithFood(foodId) {
    const food = HOSTEL_FOODS.find(f => f.id === foodId);
    if (!food) return;

    this.openAddMealModal('lunch');
    document.getElementById('inputMealItemName').value = food.name;
    document.getElementById('inputMealItemPortion').value = food.suggestedPortion;
    document.getElementById('inputMealItemCal').value = food.calories;
    document.getElementById('inputMealItemProtein').value = food.protein;
  }

  closeModals() {
    this.modalWeightOverlay?.classList.remove('open');
    this.modalStepOverlay?.classList.remove('open');
    this.modalMealOverlay?.classList.remove('open');
  }

  // ===================== TOAST FEEDBACK =====================
  showToast(msg) {
    if (!this.appToastNotice || !this.toastMessage) return;
    this.toastMessage.textContent = msg;
    this.appToastNotice.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.appToastNotice.classList.remove('show');
    }, 2400);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WinterArcApp();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WinterArcApp };
}
