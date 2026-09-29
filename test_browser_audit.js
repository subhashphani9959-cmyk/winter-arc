const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(__dirname, 'chrome_profile_' + Date.now());

async function runBrowserAudit() {
  console.log('Launching headless Chrome on port 9222...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,850',
    'http://localhost:8080/'
  ]);

  chromeProc.stderr.on('data', d => {});

  // Wait for remote debugging endpoint
  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      versionData = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  if (!versionData) {
    console.error('Failed to connect to Chrome debugging port.');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome:', versionData['Browser']);

  // Get active target
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    console.error('No page target found.');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('CSS.enable');

  console.log('Waiting 3.4 seconds for opening title reveal...');
  await new Promise(r => setTimeout(r, 3400));

  // Check if title-revealed class is present
  const titleEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const exp = document.getElementById('openingExperience');
      const title = document.getElementById('openingTitle');
      const enter = document.getElementById('openingEnterWrap');
      return {
        hasTitleRevealed: exp.classList.contains('title-revealed'),
        titleText: title.innerText.trim(),
        enterVisible: enter.classList.contains('visible')
      };
    })()`,
    returnByValue: true
  });

  console.log('Opening Reveal State:', titleEval.result.value);

  // Click on "WINTER ARC" title to test unified entry
  console.log('Clicking "WINTER ARC" title...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('openingTitle').click()`
  });

  // Wait 1.6s for transition into main interface
  console.log('Waiting for cinematic transition to Peddi photo and main UI...');
  await new Promise(r => setTimeout(r, 1600));

  const postEnterEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyHasEntered = document.body.classList.contains('app-entered');
      const appShellOpacity = window.getComputedStyle(document.getElementById('appShell')).opacity;
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const titleMainColor = window.getComputedStyle(document.querySelector('.journal-main-title')).color;
      const targetWeightColor = window.getComputedStyle(document.querySelector('.journal-main-title span:last-child')).color;
      const activeNavColor = window.getComputedStyle(document.querySelector('.desk-nav-btn.active')).color;
      const inactiveNavColor = window.getComputedStyle(document.querySelectorAll('.desk-nav-btn')[1]).color;
      const statNumColor = window.getComputedStyle(document.querySelector('.pillar-value')).color;
      const statLabelColor = window.getComputedStyle(document.querySelector('.pillar-tag')).color;
      return {
        bodyHasEntered,
        appShellOpacity,
        bodyBg,
        titleMainColor,
        targetWeightColor,
        activeNavColor,
        inactiveNavColor,
        statNumColor,
        statLabelColor
      };
    })()`,
    returnByValue: true
  });

  console.log('Post-Enter Computed Aesthetics:', postEnterEval.result.value);

  // Capture Desktop Activity Screenshot
  const actShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'audit_desktop_activity.png'), Buffer.from(actShot.data, 'base64'));
  console.log('Saved audit_desktop_activity.png');

  // Navigate to STEPS
  console.log('Navigating to STEPS view...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.desk-nav-btn[data-nav="steps"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  const stepsEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const ringBgStroke = window.getComputedStyle(document.getElementById('stepsRingCircle').previousElementSibling).stroke;
      const hugeNumColor = window.getComputedStyle(document.getElementById('stepsCurrentDisplay')).color;
      const pctColor = window.getComputedStyle(document.getElementById('stepsRingPercent')).color;
      const activeCategory = document.body.dataset.activeView;
      return { ringBgStroke, hugeNumColor, pctColor, activeCategory };
    })()`,
    returnByValue: true
  });
  console.log('Steps Computed Aesthetics:', stepsEval.result.value);

  const stepsShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'audit_desktop_steps.png'), Buffer.from(stepsShot.data, 'base64'));
  console.log('Saved audit_desktop_steps.png');

  // Navigate to FOOD
  console.log('Navigating to FOOD view...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.desk-nav-btn[data-nav="food"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Type in mess menu and generate plate to inspect recommendation tiers
  await send('Runtime.evaluate', {
    expression: `(() => {
      const inp = document.getElementById('messCustomInput');
      inp.value = 'Rice, Chicken, Dal, Potato curry, Curd';
      document.getElementById('btnGeneratePlate').click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const foodEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const inputBg = window.getComputedStyle(document.getElementById('messCustomInput')).backgroundColor;
      const calColor = window.getComputedStyle(document.getElementById('macroFoodTabCal')).color;
      const proColor = window.getComputedStyle(document.getElementById('macroFoodTabProtein')).color;
      const carbColor = window.getComputedStyle(document.getElementById('macroFoodTabCarbs')).color;
      const activeCategory = document.body.dataset.activeView;
      const prioritizeBadge = document.querySelector('.tier-badge.prioritize');
      const prioritizeColor = prioritizeBadge ? window.getComputedStyle(prioritizeBadge).color : null;
      return { inputBg, calColor, proColor, carbColor, activeCategory, prioritizeColor };
    })()`,
    returnByValue: true
  });
  console.log('Food Computed Aesthetics:', foodEval.result.value);

  const foodShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'audit_desktop_food.png'), Buffer.from(foodShot.data, 'base64'));
  console.log('Saved audit_desktop_food.png');

  // Navigate to WATER
  console.log('Navigating to WATER view...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.desk-nav-btn[data-nav="water"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Click +250 ML
  await send('Runtime.evaluate', {
    expression: `document.getElementById('btnWaterAdd250').click()`
  });
  await new Promise(r => setTimeout(r, 300));

  const waterEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const volNumColor = window.getComputedStyle(document.getElementById('waterCurrentDisplay')).color;
      const unitColor = window.getComputedStyle(document.querySelector('.water-volume-unit')).color;
      const dropFilledBg = window.getComputedStyle(document.querySelector('.water-drop-indicator.filled')).backgroundColor;
      const btnAddBg = window.getComputedStyle(document.getElementById('btnWaterAdd250')).backgroundColor;
      const btnAddColor = window.getComputedStyle(document.getElementById('btnWaterAdd250')).color;
      const activeCategory = document.body.dataset.activeView;
      return { volNumColor, unitColor, dropFilledBg, btnAddBg, btnAddColor, activeCategory };
    })()`,
    returnByValue: true
  });
  console.log('Water Computed Aesthetics:', waterEval.result.value);

  const waterShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'audit_desktop_water.png'), Buffer.from(waterShot.data, 'base64'));
  console.log('Saved audit_desktop_water.png');

  // Test Mobile Responsive Viewport (390 x 844)
  console.log('Setting mobile viewport (390 x 844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', {
    expression: `window.app.switchView('activity');`
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const bottomNavDisplay = window.getComputedStyle(document.querySelector('.bottom-nav-bar')).display;
      const bottomNavBg = window.getComputedStyle(document.querySelector('.bottom-nav-bar')).backgroundColor;
      const activeBottomNavColor = window.getComputedStyle(document.querySelector('.nav-item-btn.active')).color;
      return { bottomNavDisplay, bottomNavBg, activeBottomNavColor };
    })()`,
    returnByValue: true
  });
  console.log('Mobile Computed Aesthetics:', mobileEval.result.value);

  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'audit_mobile_activity.png'), Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved audit_mobile_activity.png');

  // Test Replay and clicking [ ENTER ]
  console.log('Testing Replay and clicking [ ENTER ] button...');
  await send('Runtime.evaluate', {
    expression: `window.app.replayIntro();`
  });
  await new Promise(r => setTimeout(r, 3300));
  await send('Runtime.evaluate', {
    expression: `document.getElementById('btnOpeningEnter').click();`
  });
  await new Promise(r => setTimeout(r, 1600));

  const enterBtnEval = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        bodyEnteredAfterEnterBtn: document.body.classList.contains('app-entered'),
        openingHidden: document.getElementById('openingExperience').style.display === 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Enter Button Transition Result:', enterBtnEval.result.value);

  ws.close();
  chromeProc.kill();

  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n========================================');
  console.log('REAL BROWSER AUDIT COMPLETED SUCCESSFULLY!');
  console.log('========================================');
}

runBrowserAudit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
