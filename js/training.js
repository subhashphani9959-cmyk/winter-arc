/**
 * WINTER ARC — TRAINING MODE CONTROLLER
 * Inspired by the intense athletic conditioning and disciplined fitness aesthetic of "Dhruva".
 * Handles countdown, workout timers, exercise sets/reps tracking, rest timers,
 * audio cues, video motivation upload/playback, canvas visualizer, and completion analytics.
 */

const TRAINING_PROTOCOLS = [
  {
    id: 'dhruva_combat_conditioning',
    name: 'Dhruva Combat & Calisthenics',
    subtitle: 'High-Intensity Bodyweight & Akhada Conditioning',
    intensity: 'High Intensity',
    estMinutes: 35,
    estCalories: 380,
    quote: 'Discipline over comfort. The pain of discipline is nothing compared to the pain of regret.',
    exercises: [
      {
        id: 'e1',
        name: 'Akhada Dand (Dive-Bomber Pushups)',
        target: 'Chest, Shoulders & Triceps',
        sets: 3,
        reps: '15 reps',
        restSec: 45,
        tip: 'Deep swoop forward like kushti wrestlers. Explode up to lock triceps.'
      },
      {
        id: 'e2',
        name: 'Wide Grip Pull-ups',
        target: 'Lats & Upper Back Width',
        sets: 4,
        reps: '8-10 reps',
        restSec: 60,
        tip: 'Chest to bar. Controlled 2-second negative descent.'
      },
      {
        id: 'e3',
        name: 'Kushti Baithak (Hindu Squats)',
        target: 'Quads, Glutes & Endurance',
        sets: 4,
        reps: '25 reps',
        restSec: 45,
        tip: 'Rhythmic breathing with arm swings. Full range of motion.'
      },
      {
        id: 'e4',
        name: 'Hanging Knee Tucks / V-Ups',
        target: 'Lower Abs & Core Compression',
        sets: 3,
        reps: '15 reps',
        restSec: 40,
        tip: 'Do not swing. Initiate curl strictly from lower abdominal contraction.'
      },
      {
        id: 'e5',
        name: 'High-Octane Mountain Climbers',
        target: 'Cardio & Core Endurance',
        sets: 3,
        reps: '45 seconds',
        restSec: 30,
        tip: 'Sprint pace. Keep hips level and drive knees forcefully.'
      },
      {
        id: 'e6',
        name: 'Dhruva Isometric Plank Freeze',
        target: 'Transverse Abdominis & Mental Grip',
        sets: 3,
        reps: '60 seconds',
        restSec: 30,
        tip: 'Clench glutes and pull navel to spine. Iron fortitude.'
      }
    ]
  },
  {
    id: 'upper_body_armor',
    name: 'Upper Body Armor & Push Power',
    subtitle: 'Chest, Shoulders & Explosive Push Strength',
    intensity: 'Maximum Power',
    estMinutes: 30,
    estCalories: 320,
    quote: 'An athlete is forged in the hours nobody is watching.',
    exercises: [
      { id: 'u1', name: 'Diamond Pushups', target: 'Triceps & Inner Chest', sets: 3, reps: '15 reps', restSec: 45, tip: 'Keep elbows tucked.' },
      { id: 'u2', name: 'Decline / Feet-Elevated Pushups', target: 'Upper Chest & Shoulders', sets: 4, reps: '12 reps', restSec: 45, tip: 'Feet on hostel bed or bench.' },
      { id: 'u3', name: 'Pike Pushups (Handstand Prep)', target: 'Anterior & Lateral Deltoids', sets: 3, reps: '10 reps', restSec: 45, tip: 'Head moves forward in triangle.' },
      { id: 'u4', name: 'Chair / Bed Bench Dips', target: 'Tricep Burnout', sets: 3, reps: '20 reps', restSec: 40, tip: 'Lockout at top.' }
    ]
  },
  {
    id: 'fat_loss_metcon',
    name: 'Winter Arc MetCon Burner',
    subtitle: 'Rapid Glycogen Depletion & Fat Mobilization',
    intensity: 'Hyper Burn',
    estMinutes: 25,
    estCalories: 350,
    quote: 'Sweat the small stuff in the gym so nothing shakes you outside.',
    exercises: [
      { id: 'm1', name: 'Burpee Chest-to-Floor', target: 'Full Body Explosiveness', sets: 4, reps: '15 reps', restSec: 45, tip: 'Explode vertically.' },
      { id: 'm2', name: 'Jump Squats', target: 'Explosive Lower Power', sets: 4, reps: '20 reps', restSec: 45, tip: 'Soft landing on balls of feet.' },
      { id: 'm3', name: 'Shadow Boxing Combos', target: 'Deltoid Stamina & Agility', sets: 3, reps: '60 seconds', restSec: 30, tip: 'Snappy jabs, crosses, hooks.' },
      { id: 'm4', name: 'Bicycle Crunches', target: 'Obliques & Core Rotation', sets: 3, reps: '25 per side', restSec: 30, tip: 'Slow elbow-to-knee contact.' }
    ]
  }
];

class TrainingController {
  constructor() {
    this.protocols = TRAINING_PROTOCOLS;
    this.currentProtocol = TRAINING_PROTOCOLS[0];
    this.isSessionActive = false;
    this.sessionTimer = null;
    this.sessionElapsedSec = 0;
    this.restTimer = null;
    this.restSecRemaining = 0;
    this.completedSetsMap = {}; // key: "exIdx_setIdx" => true
    this.customVideoUrl = localStorage.getItem('winter_arc_custom_video_url') || '';

    // Cache elements
    this.cacheElements();
    this.bindEvents();
    this.initCanvasVisualizer();
  }

  cacheElements() {
    // Hub Elements
    this.trainingVideoPlayer = document.getElementById('trainingVideoPlayer');
    this.trainingVideoUploadInput = document.getElementById('trainingVideoUploadInput');
    this.trainingVideoUrlInput = document.getElementById('trainingVideoUrlInput');
    this.btnSaveVideoUrl = document.getElementById('btnSaveVideoUrl');
    this.trainingCanvasVisualizer = document.getElementById('trainingCanvasVisualizer');
    this.btnStartWorkout = document.getElementById('btnStartWorkout');
    this.workoutProtocolSelect = document.getElementById('workoutProtocolSelect');
    this.workoutStatDuration = document.getElementById('workoutStatDuration');
    this.workoutStatCalories = document.getElementById('workoutStatCalories');
    this.workoutStatStreak = document.getElementById('workoutStatStreak');

    // Full Screen Session Overlay Elements
    this.trainingSessionOverlay = document.getElementById('trainingSessionOverlay');
    this.sessionCountdownWrap = document.getElementById('sessionCountdownWrap');
    this.sessionCountdownNumber = document.getElementById('sessionCountdownNumber');
    this.sessionContentWrap = document.getElementById('sessionContentWrap');
    this.sessionElapsedDisplay = document.getElementById('sessionElapsedDisplay');
    this.sessionProtocolTitle = document.getElementById('sessionProtocolTitle');
    this.sessionProgressBar = document.getElementById('sessionProgressBar');
    this.sessionProgressText = document.getElementById('sessionProgressText');
    this.sessionExerciseList = document.getElementById('sessionExerciseList');
    this.sessionRestBanner = document.getElementById('sessionRestBanner');
    this.sessionRestSeconds = document.getElementById('sessionRestSeconds');
    this.btnSkipRest = document.getElementById('btnSkipRest');
    this.btnFinishWorkoutEarly = document.getElementById('btnFinishWorkoutEarly');
    this.sessionCelebrationScreen = document.getElementById('sessionCelebrationScreen');
    this.btnExitCelebration = document.getElementById('btnExitCelebration');
  }

  selectProtocol(protocolId) {
    const selected = this.protocols.find(p => p.id === protocolId || p.id.startsWith(protocolId));
    if (selected) {
      this.currentProtocol = selected;
      if (this.workoutProtocolSelect) this.workoutProtocolSelect.value = selected.id;
      this.renderProtocolDetails();
    }
  }

  toggleSetComplete(exIdOrIdx, setIdx, restSec) {
    let exIdx = -1;
    if (typeof exIdOrIdx === 'number') {
      exIdx = exIdOrIdx;
    } else {
      exIdx = this.currentProtocol.exercises.findIndex(e => e.id === exIdOrIdx);
      if (exIdx === -1) {
        exIdx = parseInt(exIdOrIdx, 10);
        if (isNaN(exIdx)) exIdx = 0;
      }
    }
    const ex = this.currentProtocol.exercises[exIdx];
    this.toggleSetDone(exIdx, setIdx, restSec || (ex ? ex.restSec : 45));
  }

  bindEvents() {
    // Protocol change
    this.workoutProtocolSelect?.addEventListener('change', (e) => {
      this.selectProtocol(e.target.value);
    });

    // Start Workout
    this.btnStartWorkout?.addEventListener('click', () => {
      this.launchWorkoutSession();
    });

    // Custom Video File Upload
    this.trainingVideoUploadInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const localBlobUrl = URL.createObjectURL(file);
        this.loadVideoSource(localBlobUrl);
        window.app?.showToast('Local workout video loaded!');
      }
    });

    // Custom Video URL Save
    this.btnSaveVideoUrl?.addEventListener('click', () => {
      const url = this.trainingVideoUrlInput?.value.trim();
      if (url) {
        this.customVideoUrl = url;
        localStorage.setItem('winter_arc_custom_video_url', url);
        this.loadVideoSource(url);
        window.app?.showToast('Training video URL saved!');
      }
    });

    // Skip Rest
    this.btnSkipRest?.addEventListener('click', () => {
      this.stopRestTimer();
    });

    // Finish Workout Early
    this.btnFinishWorkoutEarly?.addEventListener('click', () => {
      if (confirm('Finish and log this workout session now?')) {
        this.completeWorkoutSession();
      }
    });

    // Exit Celebration
    this.btnExitCelebration?.addEventListener('click', () => {
      this.closeSessionOverlay();
    });

    // Load initial video if saved
    if (this.customVideoUrl && this.trainingVideoUrlInput) {
      this.trainingVideoUrlInput.value = this.customVideoUrl;
      this.loadVideoSource(this.customVideoUrl);
    }
  }

  loadVideoSource(src) {
    if (!this.trainingVideoPlayer) return;
    this.trainingVideoPlayer.src = src;
    this.trainingVideoPlayer.style.display = 'block';
    if (this.trainingCanvasVisualizer) {
      this.trainingCanvasVisualizer.style.display = 'none';
    }
    this.trainingVideoPlayer.play().catch(() => {
      // autoplay block handled
    });
  }

  initCanvasVisualizer() {
    if (!this.trainingCanvasVisualizer || !this.trainingCanvasVisualizer.getContext) return;
    const canvas = this.trainingCanvasVisualizer;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;

    const animate = () => {
      if (canvas.style.display === 'none') {
        requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#140e0b');
      grad.addColorStop(0.5, '#22140d');
      grad.addColorStop(1, '#0c0806');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated energy waves / beat bars
      const numBars = 32;
      const barW = canvas.width / numBars;
      for (let i = 0; i < numBars; i++) {
        const heightMultiplier = Math.sin((frame * 0.05) + (i * 0.25)) * 0.5 + 0.5;
        const h = 20 + heightMultiplier * 80;
        const y = canvas.height - h;

        ctx.fillStyle = i % 2 === 0 ? 'rgba(214, 40, 40, 0.45)' : 'rgba(232, 93, 4, 0.45)';
        ctx.fillRect(i * barW, y, barW - 3, h);
      }

      // Title & athletic quote
      ctx.fillStyle = '#f5f2eb';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ DHRUVA TRAINING PROTOCOL', canvas.width / 2, canvas.height / 2 - 12);

      ctx.fillStyle = '#d4a373';
      ctx.font = '12px sans-serif';
      ctx.fillText('DISCIPLINE OVER COMFORT • LOAD MOTIVATION VIDEO OR TAP START', canvas.width / 2, canvas.height / 2 + 14);

      frame++;
      requestAnimationFrame(animate);
    };
    animate();
  }

  renderProtocolDetails() {
    if (this.workoutStatDuration) this.workoutStatDuration.textContent = `${this.currentProtocol.estMinutes} mins`;
    if (this.workoutStatCalories) this.workoutStatCalories.textContent = `~${this.currentProtocol.estCalories} kcal`;
    const elTodayName = document.getElementById('workoutStatTodayName');
    if (elTodayName) elTodayName.textContent = this.currentProtocol.name;

    const drillsContainer = document.getElementById('trainingDrillsContainer');
    if (drillsContainer && this.currentProtocol.exercises) {
      drillsContainer.innerHTML = this.currentProtocol.exercises.map((ex, i) => `
        <div class="compare-item-card">
          <span class="compare-item-name" style="font-size: 1.05rem;">${i + 1}. ${ex.name}</span>
          <div class="compare-metrics-row"><span>${ex.sets} Sets × ${ex.reps}</span><span>Rest: ${ex.restSec}s</span></div>
          <p style="font-size: 0.76rem; color: var(--text-muted);">${ex.tip || ex.target}</p>
        </div>
      `).join('');
    }
  }

  renderView() {
    this.renderProtocolDetails();
    if (typeof window !== 'undefined' && window.arcStore) {
      const todayLog = window.arcStore.getTodayLog();
      const streakInfo = window.arcStore.getStreakInfo();
      const steps = todayLog.steps || 0;
      const stepGoal = window.arcStore.profile.stepGoal || 12000;

      const elSteps = document.getElementById('workoutStatSteps');
      if (elSteps) {
        elSteps.textContent = `${steps.toLocaleString()} / ${(stepGoal / 1000).toFixed(0)}k`;
      }

      const elStreak = document.getElementById('workoutStatStreak');
      if (elStreak) {
        elStreak.textContent = `${streakInfo.currentStreak} ${streakInfo.currentStreak === 1 ? 'Day' : 'Days'} Arc`;
      }

      if (todayLog.workouts && todayLog.workouts.length > 0) {
        const totalBurn = todayLog.workouts.reduce((s, w) => s + (w.calories || 0), 0);
        const totalMins = todayLog.workouts.reduce((s, w) => s + (w.durationMins || 0), 0);
        if (this.workoutStatCalories) this.workoutStatCalories.textContent = `~${totalBurn} kcal (Done)`;
        if (this.workoutStatDuration) this.workoutStatDuration.textContent = `${totalMins} mins`;
      }
    }
  }

  // ===================== FULL-SCREEN ACTIVE WORKOUT SESSION =====================
  launchWorkoutSession() {
    this.isSessionActive = true;
    this.sessionElapsedSec = 0;
    this.completedSetsMap = {};

    // Reset overlay view
    this.trainingSessionOverlay.classList.add('open');
    this.sessionCelebrationScreen.style.display = 'none';
    this.sessionContentWrap.style.display = 'none';
    this.sessionCountdownWrap.style.display = 'flex';

    if (this.sessionProtocolTitle) {
      this.sessionProtocolTitle.textContent = this.currentProtocol.name.toUpperCase();
    }

    // Play 3-2-1 Countdown with audio beeps
    let count = 3;
    this.sessionCountdownNumber.textContent = count;
    this.playAudioBeep(440, 0.15);

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.sessionCountdownNumber.textContent = count;
        this.playAudioBeep(440, 0.15);
      } else if (count === 0) {
        this.sessionCountdownNumber.textContent = 'GO!';
        this.playAudioBeep(880, 0.4);
      } else {
        clearInterval(countInterval);
        this.sessionCountdownWrap.style.display = 'none';
        this.sessionContentWrap.style.display = 'flex';
        this.startSessionTimer();
        this.renderSessionExercises();
        this.updateSessionProgress();
      }
    }, 1000);
  }

  startSessionTimer() {
    clearInterval(this.sessionTimer);
    this.sessionTimer = setInterval(() => {
      this.sessionElapsedSec++;
      const mins = String(Math.floor(this.sessionElapsedSec / 60)).padStart(2, '0');
      const secs = String(this.sessionElapsedSec % 60).padStart(2, '0');
      if (this.sessionElapsedDisplay) {
        this.sessionElapsedDisplay.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  renderSessionExercises() {
    if (!this.sessionExerciseList) return;
    const exercises = this.currentProtocol.exercises;

    this.sessionExerciseList.innerHTML = exercises.map((ex, exIdx) => {
      let setButtonsHtml = '';
      for (let s = 1; s <= ex.sets; s++) {
        const key = `${exIdx}_${s}`;
        const isDone = !!this.completedSetsMap[key];
        setButtonsHtml += `
          <button class="btn-set-pill ${isDone ? 'completed' : ''}" onclick="window.trainingController.toggleSetDone(${exIdx}, ${s}, ${ex.restSec})">
            ${isDone ? '✓ Set ' + s : 'Set ' + s}
          </button>
        `;
      }

      return `
        <div class="session-exercise-card">
          <div class="session-ex-header">
            <div>
              <span class="session-ex-target">${ex.target.toUpperCase()}</span>
              <h4 class="session-ex-name">${ex.name}</h4>
            </div>
            <span class="session-ex-reps">${ex.sets} Sets × ${ex.reps}</span>
          </div>
          <p class="session-ex-tip">${ex.tip}</p>
          <div class="session-sets-row">
            ${setButtonsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  toggleSetDone(exIdx, setIdx, restSec) {
    const key = `${exIdx}_${setIdx}`;
    const wasDone = !!this.completedSetsMap[key];
    this.completedSetsMap[key] = !wasDone;

    this.renderSessionExercises();
    this.updateSessionProgress();

    if (!wasDone) {
      // Completed set: play sound & start rest timer
      this.playAudioBeep(650, 0.12);
      this.startRestTimer(restSec || 45);
    }
  }

  updateSessionProgress() {
    const exercises = this.currentProtocol.exercises;
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = Object.values(this.completedSetsMap).filter(Boolean).length;
    const pct = Math.min(100, Math.round((completedSets / totalSets) * 100));

    if (this.sessionProgressBar) {
      this.sessionProgressBar.style.width = `${pct}%`;
    }
    if (this.sessionProgressText) {
      this.sessionProgressText.textContent = `${pct}% Finished (${completedSets}/${totalSets} Sets)`;
    }

    // If 100% done, auto celebrate!
    if (completedSets === totalSets && totalSets > 0) {
      setTimeout(() => {
        this.completeWorkoutSession();
      }, 600);
    }
  }

  startRestTimer(seconds) {
    this.stopRestTimer();
    this.restSecRemaining = seconds;
    if (this.sessionRestBanner) this.sessionRestBanner.style.display = 'flex';
    if (this.sessionRestSeconds) this.sessionRestSeconds.textContent = `${this.restSecRemaining}s`;

    this.restTimer = setInterval(() => {
      this.restSecRemaining--;
      if (this.sessionRestSeconds) {
        this.sessionRestSeconds.textContent = `${this.restSecRemaining}s`;
      }

      if (this.restSecRemaining <= 0) {
        this.stopRestTimer();
        this.playWhistleTone(); // Sound cue that rest is over!
      }
    }, 1000);
  }

  stopRestTimer() {
    clearInterval(this.restTimer);
    if (this.sessionRestBanner) {
      this.sessionRestBanner.style.display = 'none';
    }
  }

  completeWorkoutSession() {
    clearInterval(this.sessionTimer);
    this.stopRestTimer();

    const mins = Math.max(1, Math.round(this.sessionElapsedSec / 60));
    const caloriesBurned = Math.round(mins * 10.5); // ~10.5 kcal per minute intense calisthenics

    // Save workout to store
    if (window.arcStore) {
      const today = typeof getTodayKey === 'function' ? getTodayKey() : (window.arcStore?.getTodayKey ? window.arcStore.getTodayKey() : new Date().toISOString().split('T')[0]);
      const todayLog = window.arcStore.getTodayLog(today);
      if (!todayLog.workouts) todayLog.workouts = [];
      todayLog.workouts.push({
        protocolId: this.currentProtocol.id,
        name: this.currentProtocol.name,
        durationMins: mins,
        calories: caloriesBurned,
        timestamp: new Date().toISOString()
      });
      window.arcStore.saveLogs();
    }

    // Play victory sound
    this.playVictoryFanfare();

    // Show celebration screen
    if (this.sessionContentWrap) this.sessionContentWrap.style.display = 'none';
    if (this.sessionCelebrationScreen) this.sessionCelebrationScreen.style.display = 'flex';

    const celebName = document.getElementById('celebWorkoutName');
    if (celebName) celebName.textContent = this.currentProtocol.name;
    const celebTime = document.getElementById('celebWorkoutTime');
    if (celebTime) celebTime.textContent = `${mins} Minutes`;
    const celebCal = document.getElementById('celebWorkoutCal');
    if (celebCal) celebCal.textContent = `~${caloriesBurned} kcal`;
  }

  closeSessionOverlay() {
    this.trainingSessionOverlay?.classList.remove('open');
    this.isSessionActive = false;
    window.app?.renderAll();
    window.app?.showToast('Workout Conquered & Logged!');
  }

  // ===================== AUDIO CUES (WEB AUDIO API) =====================
  playAudioBeep(freq = 440, duration = 0.15) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = window.app?.audioCtx || (AudioCtx ? new AudioCtx() : null);
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  playWhistleTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = window.app?.audioCtx || (AudioCtx ? new AudioCtx() : null);
      if (!ctx) return;
      [800, 1200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.18);
      });
    } catch (e) {}
  }

  playVictoryFanfare() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = window.app?.audioCtx || (AudioCtx ? new AudioCtx() : null);
      if (!ctx) return;
      [330, 440, 550, 660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    } catch (e) {}
  }
}

// Export on window for browser and Node.js testing environments
if (typeof window !== 'undefined') {
  window.TrainingController = TrainingController;
  window.TRAINING_PROTOCOLS = TRAINING_PROTOCOLS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TrainingController, TRAINING_PROTOCOLS };
}

// Global Training Controller Instance
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', () => {
    window.trainingController = new TrainingController();
  });
}
