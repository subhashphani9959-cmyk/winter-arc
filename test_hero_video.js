/**
 * Verification Test: Hero Video Implementation & Attributes
 */
const fs = require('fs');
const path = require('path');

console.log('=======================================================');
console.log('WINTER ARC — HERO OPENING VIDEO VERIFICATION');
console.log('=======================================================');

// 1. Verify file system
console.log('\n[CHECK 1] Local File Verification:');
const primaryVideo = path.join(__dirname, 'assets', 'videos', 'winter-arc.mp4');
const duplicateVideo = path.join(__dirname, 'assets', 'videos', 'winter-arc.mp4.mp4');

const primaryExists = fs.existsSync(primaryVideo);
const duplicateExists = fs.existsSync(duplicateVideo);

console.log(`  -> "assets/videos/winter-arc.mp4" exists: ${primaryExists}`);
if (primaryExists) {
  const stats = fs.statSync(primaryVideo);
  console.log(`     File size: ${stats.size} bytes (~${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}
console.log(`  -> "assets/videos/winter-arc.mp4.mp4" exists: ${duplicateExists} (Expected: false)`);

if (!primaryExists) {
  console.error('  FAIL: Primary video file is missing!');
  process.exit(1);
}
if (duplicateExists) {
  console.error('  FAIL: Duplicate file was not removed!');
  process.exit(1);
}
console.log('  STATUS: PASS (Only assets/videos/winter-arc.mp4 exists)');

// 2. Verify HTML markup and single source
console.log('\n[CHECK 2] HTML Video Tag & Single Source:');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const hasAutoplay = /<video[^>]*\bautoplay\b/i.test(htmlContent);
const hasMuted = /<video[^>]*\bmuted\b/i.test(htmlContent);
const hasPlaysinline = /<video[^>]*\bplaysinline\b/i.test(htmlContent);
const hasLoop = /<video[^>]*\bloop\b/i.test(htmlContent);
const videoWrapMatches = htmlContent.match(/<div class="hero-opening-video-wrap">([\s\S]*?)<\/div>/i);

console.log(`  -> autoplay attribute: ${hasAutoplay}`);
console.log(`  -> muted attribute: ${hasMuted}`);
console.log(`  -> playsinline attribute: ${hasPlaysinline}`);
console.log(`  -> loop attribute: ${hasLoop}`);

if (!hasAutoplay || !hasMuted || !hasPlaysinline || !hasLoop) {
  console.error('  FAIL: Video is missing one or more required attributes (autoplay, muted, playsinline, loop)');
  process.exit(1);
}

// Count <source> tags in video element
const sourceMatches = videoWrapMatches ? videoWrapMatches[1].match(/<source[^>]*>/gi) : [];
console.log(`  -> Number of <source> tags: ${sourceMatches.length}`);
sourceMatches.forEach(src => console.log(`     ${src}`));

if (sourceMatches.length !== 1) {
  console.error(`  FAIL: Expected exactly 1 <source> tag, found ${sourceMatches.length}`);
  process.exit(1);
}

const usesOnlyWinterArcMp4 = sourceMatches[0].includes('assets/videos/winter-arc.mp4') && !sourceMatches[0].includes('.mp4.mp4');
console.log(`  -> Points exclusively to "assets/videos/winter-arc.mp4": ${usesOnlyWinterArcMp4}`);
if (!usesOnlyWinterArcMp4) {
  console.error('  FAIL: Source does not point to assets/videos/winter-arc.mp4');
  process.exit(1);
}
console.log('  STATUS: PASS (Single source confirmed)');

// 3. Verify CSS styling & layering
console.log('\n[CHECK 3] CSS Layering & object-fit: cover:');
const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');

const hasObjectFitCover = /\.hero-opening-video\s*\{[^}]*object-fit:\s*cover/i.test(cssContent);
const hasWrapZ1 = /\.hero-opening-video-wrap\s*\{[^}]*z-index:\s*1/i.test(cssContent);
const hasOverlayZ2 = /\.hero-video-overlay\s*\{[^}]*z-index:\s*2/i.test(cssContent);
const hasContentZ3 = /\.hero-content-layer\s*\{[^}]*z-index:\s*3/i.test(cssContent);
const hasUnmuteZ4 = /\.btn-hero-unmute\s*\{[^}]*z-index:\s*4/i.test(cssContent);

console.log(`  -> .hero-opening-video has object-fit: cover: ${hasObjectFitCover}`);
console.log(`  -> .hero-opening-video-wrap has z-index: 1 (behind content): ${hasWrapZ1}`);
console.log(`  -> .hero-video-overlay has z-index: 2 (cinematic dimming): ${hasOverlayZ2}`);
console.log(`  -> .hero-content-layer has z-index: 3 (sharp foreground text): ${hasContentZ3}`);
console.log(`  -> .btn-hero-unmute has z-index: 4 (clickable top layer): ${hasUnmuteZ4}`);

if (!hasObjectFitCover || !hasWrapZ1 || !hasOverlayZ2 || !hasContentZ3 || !hasUnmuteZ4) {
  console.error('  FAIL: CSS layering or object-fit is incomplete');
  process.exit(1);
}
console.log('  STATUS: PASS (CSS hierarchy and object-fit verified)');

// 4. Test UNMUTE / MUTE interaction in JavaScript runtime
console.log('\n[CHECK 4] UNMUTE / MUTE Toggle Functionality:');

// Setup mock DOM
const mockElements = {};
function createEl(id) {
  return {
    id,
    muted: true,
    paused: false,
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() {} },
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    setAttribute(k, v) { this[k] = v; },
    innerHTML: '',
    textContent: '',
    _listeners: {},
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    },
    click() {
      if (this._listeners['click']) {
        this._listeners['click'].forEach(fn => fn());
      }
    },
    play() {
      this.paused = false;
      return Promise.resolve();
    },
    querySelector(s) {
      return createEl('source');
    }
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
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (t) => createEl(t),
  createElementNS: (ns, t) => createEl(t)
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
const video = mockElements['heroOpeningVideo'];
const toggleBtn = mockElements['btnHeroAudioToggle'];
const audioIcon = mockElements['heroAudioIcon'];
const audioLabel = mockElements['heroAudioLabel'];

console.log(`  -> Initial video muted state: ${video.muted} (autoplay requirement)`);

// Simulate user clicking UNMUTE button
toggleBtn.click();
console.log(`  -> After 1st Click (UNMUTE): muted=${video.muted}, label="${audioLabel.textContent}", icon="${audioIcon.innerHTML}"`);
if (video.muted !== false || audioLabel.textContent !== 'MUTE') {
  console.error('  FAIL: Unmuting failed!');
  process.exit(1);
}

// Simulate user clicking MUTE button again
toggleBtn.click();
console.log(`  -> After 2nd Click (MUTE): muted=${video.muted}, label="${audioLabel.textContent}", icon="${audioIcon.innerHTML}"`);
if (video.muted !== true || audioLabel.textContent !== 'UNMUTE') {
  console.error('  FAIL: Re-muting failed!');
  process.exit(1);
}
console.log('  STATUS: PASS (UNMUTE / MUTE toggle operates flawlessly)');

// 5. Test missing-video fallback
console.log('\n[CHECK 5] Missing-Video Fallback Behavior:');
// Simulate error event triggered if video file was removed
if (video._listeners['error']) {
  video._listeners['error'].forEach(fn => fn());
}
console.log(`  -> Video style.display on error: "${video.style.display}" (Expected: "none")`);
console.log(`  -> Unmute button style.display on error: "${toggleBtn.style.display}" (Expected: "none")`);

if (video.style.display !== 'none' || toggleBtn.style.display !== 'none') {
  console.error('  FAIL: Fallback did not hide elements on error');
  process.exit(1);
}
console.log('  STATUS: PASS (Missing video gracefully falls back to background image with no broken UI)');

console.log('\n=======================================================');
console.log('ALL 5 HERO VIDEO CHECKS PASSED WITH ZERO ERRORS! ✅');
console.log('=======================================================');
