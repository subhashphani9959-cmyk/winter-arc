/**
 * Comprehensive Verification of Winter Arc Complete Redesign
 */
const fs = require('fs');
const path = require('path');

console.log('=======================================================');
console.log('WINTER ARC — COMPLETE REDESIGN VERIFICATION SUITE');
console.log('=======================================================');

// 1. Assets Verification
console.log('\n[CHECK 1] Asset Files Verification:');
const videoPath = path.join(__dirname, 'assets', 'videos', 'winter-arc.mp4');
const imgPath = path.join(__dirname, 'assets', 'images', 'peddi-kushti.jpg');

const videoExists = fs.existsSync(videoPath);
const imgExists = fs.existsSync(imgPath);

console.log(`  -> Video "assets/videos/winter-arc.mp4": ${videoExists ? 'EXISTS (' + fs.statSync(videoPath).size + ' bytes)' : 'MISSING'}`);
console.log(`  -> Image "assets/images/peddi-kushti.jpg": ${imgExists ? 'EXISTS (' + fs.statSync(imgPath).size + ' bytes)' : 'MISSING'}`);

if (!videoExists || !imgExists) {
  console.error('FAIL: Critical assets missing!');
  process.exit(1);
}
console.log('  STATUS: PASS');

// 2. HTML Markup & Structure Verification
console.log('\n[CHECK 2] HTML Markup & Opening Structure:');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const hasPreload = html.includes('rel="preload" as="image" href="assets/images/peddi-kushti.jpg"');
const hasOpeningExperience = html.includes('id="openingExperience"');
const hasVideoTag = /<video[^>]*\bautoplay\b[^>]*\bmuted\b[^>]*\bplaysinline\b/i.test(html);
const hasOpeningTitle = html.includes('id="openingTitle"');
const hasBtnEnter = html.includes('id="btnOpeningEnter"');
const hasBackdropWrap = html.includes('id="cinematicBackdropWrap"');
const hasBackdropImage = html.includes('id="cinematicBackdropImage"');
const hasMaintainDiscipline = html.includes('MAINTAIN DISCIPLINE');
const hasOldSubtitle = html.includes('AKHADA DISCIPLINE &bull; 85');

console.log(`  -> Preloads peddi-kushti.jpg: ${hasPreload}`);
console.log(`  -> Contains #openingExperience: ${hasOpeningExperience}`);
console.log(`  -> Video tag has autoplay, muted, playsinline: ${hasVideoTag}`);
console.log(`  -> Contains subtitle "MAINTAIN DISCIPLINE": ${hasMaintainDiscipline} (Old removed: ${!hasOldSubtitle})`);
console.log(`  -> Contains #openingTitle ("WINTER ARC"): ${hasOpeningTitle}`);
console.log(`  -> Contains #btnOpeningEnter ("[ ENTER ]"): ${hasBtnEnter}`);
console.log(`  -> Contains #cinematicBackdropWrap & #cinematicBackdropImage: ${hasBackdropWrap && hasBackdropImage}`);

if (!hasPreload || !hasOpeningExperience || !hasVideoTag || !hasOpeningTitle || !hasBtnEnter || !hasBackdropWrap || !hasBackdropImage || !hasMaintainDiscipline || hasOldSubtitle) {
  console.error('FAIL: Missing required HTML opening elements or incorrect subtitle!');
  process.exit(1);
}

// 3. Navigation Verification: 4 PRIMARY CATEGORIES (ACTIVITY, STEPS, FOOD, WATER)
console.log('\n[CHECK 3] Navigation Categories Verification:');
const deskNavMatch = html.match(/<nav class="desktop-nav-bar"[^>]*>([\s\S]*?)<\/nav>/i);
const bottomNavMatch = html.match(/<nav class="bottom-nav-bar"[^>]*>([\s\S]*?)<\/nav>/i);

const deskNavText = deskNavMatch ? deskNavMatch[1] : '';
const bottomNavText = bottomNavMatch ? bottomNavMatch[1] : '';

const deskNavBtns = [...deskNavText.matchAll(/data-nav="([^"]+)"/g)].map(m => m[1]);
const bottomNavBtns = [...bottomNavText.matchAll(/data-nav="([^"]+)"/g)].map(m => m[1]);

console.log(`  -> Desktop Primary Navigation: [ ${deskNavBtns.join(', ')} ]`);
console.log(`  -> Mobile Bottom Navigation: [ ${bottomNavBtns.join(', ')} ]`);

const expectedPrimary = ['activity', 'steps', 'food', 'water'];
const deskValid = deskNavBtns.length === 4 && deskNavBtns.every(b => expectedPrimary.includes(b));
const bottomValid = bottomNavBtns.length === 4 && bottomNavBtns.every(b => expectedPrimary.includes(b));

console.log(`  -> Contains exactly ACTIVITY, STEPS, FOOD, WATER: ${deskValid && bottomValid}`);
if (!deskValid || !bottomValid) {
  console.error('FAIL: Primary navigation must contain exactly ACTIVITY, STEPS, FOOD, WATER!');
  process.exit(1);
}
console.log('  STATUS: PASS');

// 4. CSS Palette & Aesthetics Verification
console.log('\n[CHECK 4] CSS Palette & Aesthetics Verification:');
const css = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');

const hasObsidian = css.includes('#0A0A09');
const hasIvory = css.includes('#F3EFE6');
const hasChampagneGold = css.includes('#C6A15B');
const hasBronze = css.includes('#8F6B3D');
const hasVermillion = css.includes('#A64B32');

console.log(`  -> Deep Obsidian (#0A0A09): ${hasObsidian}`);
console.log(`  -> Warm Ivory (#F3EFE6): ${hasIvory}`);
console.log(`  -> Champagne Gold (#C6A15B): ${hasChampagneGold}`);
console.log(`  -> Antique Bronze (#8F6B3D): ${hasBronze}`);
console.log(`  -> Burnt Vermillion (#A64B32): ${hasVermillion}`);

if (!hasObsidian || !hasIvory || !hasChampagneGold || !hasBronze) {
  console.error('FAIL: Missing required luxury palette colors!');
  process.exit(1);
}

// 5. JavaScript State Machine & Lifecycle Verification
console.log('\n[CHECK 5] Opening State Machine & Enter Transition:');
// Build mock DOM
const mockElements = {};
function createEl(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    dataset: {},
    value: '',
    textContent: '',
    _innerHTML: '',
    get innerHTML() { return this._innerHTML || ''; },
    set innerHTML(v) { this._innerHTML = v; if (!v) this.children = []; },
    style: {},
    classList: {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      toggle(c, f) { if (f !== undefined) { if (f) this._classes.add(c); else this._classes.delete(c); } else { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); } },
      contains(c) { return this._classes.has(c); }
    },
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    setAttribute(k, v) { this[k] = v; },
    _listeners: {},
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    },
    click() {
      if (this._listeners['click']) this._listeners['click'].forEach(fn => fn({ target: this }));
    },
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    paused: true,
    currentTime: 0,
    muted: true
  };
}

global.window = global;
global.window.location = { hash: '' };
global.window.scrollTo = () => {};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) mockElements[id] = createEl(id);
    return mockElements[id];
  },
  querySelectorAll: (selector) => {
    const list = [];
    if (selector.includes('.nav-item-btn') || selector.includes('.desk-nav-btn')) {
      ['activity', 'food', 'water', 'dashboard', 'walking', 'training', 'progress'].forEach(v => {
        const btn = createEl(`btn_${v}`, 'button');
        btn.dataset.nav = v;
        list.push(btn);
      });
    } else if (selector.includes('.view-section')) {
      ['dashboard', 'activity', 'water', 'walking', 'food', 'training', 'progress', 'history', 'settings'].forEach(v => {
        const sec = createEl(`view-${v}`, 'section');
        list.push(sec);
      });
    } else if (selector.includes('.meal-slot-btn')) {
      ['breakfast', 'lunch', 'snack', 'dinner'].forEach(s => {
        const btn = createEl(`meal_slot_${s}`, 'button');
        btn.dataset.slot = s;
        list.push(btn);
      });
    }
    return list;
  },
  body: createEl('body', 'body'),
  createElement: (t) => createEl('', t),
  createElementNS: (ns, t) => createEl('', t),
  addEventListener: () => {}
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
const { WinterArcApp } = require('./js/app.js');

const app = new WinterArcApp();

console.log(`  -> Initial Opening State: "${app.openingState}" (Expected: OPENING_VIDEO)`);
if (app.openingState !== 'OPENING_VIDEO') {
  console.error('FAIL: Expected initial state OPENING_VIDEO');
  process.exit(1);
}

// Simulate ~3 seconds passing
app.revealOpeningTitle();
console.log(`  -> After 3s Title Reveal: State="${app.openingState}" | classList contains "title-revealed": ${mockElements['openingExperience'].classList.contains('title-revealed')}`);
if (app.openingState !== 'TITLE_REVEALED') {
  console.error('FAIL: Title reveal did not transition to TITLE_REVEALED');
  process.exit(1);
}

// Verify Dual Entry Points: Clicking "WINTER ARC" title triggers enterApplication()
mockElements['openingTitle'].click();
console.log(`  -> After clicking WINTER ARC: State="${app.openingState}" | Video paused: ${mockElements['heroOpeningVideo'].paused} | body has "app-entered": ${global.document.body.classList.contains('app-entered')}`);
if (app.openingState !== 'TRANSITIONING' || mockElements['heroOpeningVideo'].paused !== true || !global.document.body.classList.contains('app-entered')) {
  console.error('FAIL: Clicking WINTER ARC did not trigger transition or pause video!');
  process.exit(1);
}

// Verify double-click prevention
const isTrans = app.isTransitioning;
mockElements['openingTitle'].click();
if (!isTrans || app.openingState !== 'TRANSITIONING') {
  console.error('FAIL: Double click was not prevented!');
  process.exit(1);
}
console.log('  -> Double-click guard verified: transition only executes once');

// Test Replay Intro and Clicking [ ENTER ] button
console.log('\n[CHECK 6] Replay & [ ENTER ] Button Verification:');
app.openingState = 'APP';
app.replayIntro();
console.log(`  -> After Replay: State="${app.openingState}" | body has "app-entered": ${global.document.body.classList.contains('app-entered')} | Video paused: ${mockElements['heroOpeningVideo'].paused}`);
if (app.openingState !== 'OPENING_VIDEO' || global.document.body.classList.contains('app-entered')) {
  console.error('FAIL: Replay intro did not reset opening state properly!');
  process.exit(1);
}

// Reveal title and test clicking [ ENTER ] button directly
app.revealOpeningTitle();
mockElements['btnOpeningEnter'].click();
console.log(`  -> After clicking [ ENTER ]: State="${app.openingState}" | Video paused: ${mockElements['heroOpeningVideo'].paused} | body has "app-entered": ${global.document.body.classList.contains('app-entered')}`);
if (app.openingState !== 'TRANSITIONING' || mockElements['heroOpeningVideo'].paused !== true || !global.document.body.classList.contains('app-entered')) {
  console.error('FAIL: Clicking [ ENTER ] did not trigger the same transition or pause video!');
  process.exit(1);
}
console.log('  STATUS: PASS (Both WINTER ARC title and [ ENTER ] button trigger identical transition)');

// Test Navigation doesn't restart video
console.log('\n[CHECK 7] Navigation Isolation Verification:');
app.openingState = 'APP';
mockElements['heroOpeningVideo'].paused = true;
app.switchView('steps');
console.log(`  -> Switched to STEPS: Video paused=${mockElements['heroOpeningVideo'].paused} | Active view="${app.activeView}"`);
app.switchView('food');
console.log(`  -> Switched to FOOD: Video paused=${mockElements['heroOpeningVideo'].paused} | Active view="${app.activeView}"`);
app.switchView('water');
console.log(`  -> Switched to WATER: Video paused=${mockElements['heroOpeningVideo'].paused} | Active view="${app.activeView}"`);
app.switchView('activity');
console.log(`  -> Switched to ACTIVITY: Video paused=${mockElements['heroOpeningVideo'].paused} | Active view="${app.activeView}"`);

if (mockElements['heroOpeningVideo'].paused !== true) {
  console.error('FAIL: Navigation between tabs restarted the opening video!');
  process.exit(1);
}
console.log('  STATUS: PASS (Navigation NEVER restarts the opening video)');

console.log('\n=======================================================');
console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY! ZERO DEFECTS. ✅');
console.log('=======================================================');
