/* Pixel & Sons — game state, flow, interactions, HUD. */
'use strict';

const taskListEl = $('taskList');
const nowTitleEl = $('nowTitle');
const nowHintEl = $('nowHint');
const needToolEl = $('needTool');
const patienceFill = $('patienceFill');
const patienceWord = $('patienceWord');
const tipEl = $('tipPreview');
const timerEl = $('timer');
const toastEl = $('toast');
const bannerEl = $('banner');
const bannerText = $('bannerText');

let G = {
  mode: 'title',
  day: 0,
  order: ORDERS[0],
  phone: null,
  tasks: [],
  ti: 0,
  selected: 'heat',
  pointer: { x: 600, y: 380 },
  down: false,
  drag: null,
  hold: null,
  cloth: null,
  elapsed: 0,
  patience: 1,
  penalty: 0,
  mistakes: 0,
  money: 0,
  ratings: [],
  dayTotals: [],
  particles: [],
  time: 0,
  jobDone: false,
  finishTimer: 0,
  closing: 0,
  testing: false,
  locked: false,
  toastTimer: 0,
  bannerTimer: 0,
  lastWrong: 0,
  result: null
};

/* ---------------------------------------------------------
   Job state
   --------------------------------------------------------- */
function resetPhone(order) {
  const repair = order.repair;
  return {
    openT: 0, openTarget: 0, seat: 1, seatTarget: 1,
    screenRemoved: false, screenNew: false,
    screenBroken: repair === 'screen' || repair === 'both',
    protector: repair === 'protector', protectorPeeled: false, protectorNew: false,
    parts: {
      battery: (repair === 'battery' || repair === 'both') ? 'broken' : 'ok',
      port: repair === 'port' ? 'broken' : 'ok',
      camera: repair === 'camera' ? 'broken' : 'ok',
      speaker: repair === 'speaker' ? 'broken' : 'ok'
    },
    connectors: { display: true, battery: true, camera: true },
    screwProg: { bottom: [0, 0], port: [0, 0], speaker: [0, 0] },
    screwsRemoved: { bottom: false, port: false, speaker: false },
    heat: 0,
    clean: repair === 'protector' ? 0 : 1,
    bubbles: repair === 'protector' ? 1 : 0,
    corrosion: repair === 'water' ? 1 : 0,
    dry: 0,
    powerOn: false,
    bootT: 0,
    cracks: makeCracks(order.seed),
    filmCracks: makeCracks(order.seed + 7)
  };
}

function currentTask() { return G.tasks[G.ti] || null; }

function installParts() {
  const seen = [];
  G.tasks.forEach((t) => {
    if (t.type === 'install' && !seen.includes(t.part)) seen.push(t.part);
  });
  seen.sort((a, b) => (a === 'screen' || a === 'protector') ? -1 : (b === 'screen' || b === 'protector') ? 1 : 0);
  return seen;
}
function partInstalled(part) {
  if (!G.phone) return false;
  if (part === 'screen') return G.phone.screenNew && !G.phone.screenRemoved;
  if (part === 'protector') return G.phone.protectorNew;
  return G.phone.parts[part] === 'new';
}
function traySlots() {
  const parts = installParts();
  if (!parts.length) return [];
  if (parts.length === 1) return [{ part: parts[0], cx: 808, cy: 400, w: 104, h: 214 }];
  return [
    { part: parts[0], cx: 808, cy: 338, w: 104, h: 168 },
    { part: parts[1], cx: 808, cy: 520, w: 104, h: 92 }
  ];
}
function slotHit(slot) {
  return { x: slot.cx - slot.w / 2 - 8, y: slot.cy - slot.h / 2 - 8, w: slot.w + 16, h: slot.h + 16 };
}

/* ---------------------------------------------------------
   UI
   --------------------------------------------------------- */
function setToolUI() {
  document.querySelectorAll('.tool').forEach((b) => {
    b.classList.toggle('selected', b.dataset.tool === G.selected);
    const t = currentTask();
    b.classList.toggle('hot', Boolean(t && t.tool === b.dataset.tool && G.mode === 'playing'));
  });
}
function selectTool(name) {
  if (!TOOL_NAMES[name]) return;
  G.selected = name;
  setToolUI();
  if (G.mode === 'playing') sfx('select');
}
function renderTicket() {
  taskListEl.innerHTML = '';
  G.tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : (i === G.ti ? 'current' : '');
    const dot = document.createElement('span');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.textContent = t.label;
    li.append(dot, label);
    taskListEl.appendChild(li);
  });
  const t = currentTask();
  if (t) {
    nowTitleEl.textContent = t.label;
    nowHintEl.textContent = t.hint;
    needToolEl.innerHTML = 'Tool: <b>' + TOOL_NAMES[t.tool] + '</b>';
  } else {
    nowTitleEl.textContent = 'All done';
    nowHintEl.textContent = 'Hand the phone back with a smile.';
    needToolEl.innerHTML = '';
  }
}
function updateCustomerCard() {
  const o = G.order;
  $('avatar').textContent = o.avatar;
  $('custName').textContent = o.name;
  $('custDay').textContent = o.weekday + ' · ' + o.time;
  $('phoneModel').textContent = o.model;
  $('issueTag').textContent = o.issue;
  $('custQuote').textContent = '“' + o.quote + '”';
  $('phoneDot').style.background = o.body;
  $('ticketNo').textContent = 'TICKET #' + String(G.day + 1).padStart(2, '0');
  $('repairTag').textContent = o.repairLabel.toUpperCase();
  $('ticketTitle').textContent = o.repairLabel;
}
function updateTopbar() {
  $('dayLabel').textContent = 'DAY ' + (G.day + 1) + ' / ' + ORDERS.length;
  $('money').textContent = Math.round(G.money).toLocaleString('en-US');
  if (G.ratings.length) {
    const avg = G.ratings.reduce((a, b) => a + b, 0) / G.ratings.length;
    $('rating').textContent = avg.toFixed(1);
  } else {
    $('rating').textContent = '—';
  }
}
function updateHud() {
  if (!G.order) return;
  timerEl.textContent = fmtTime(G.elapsed);
  const p = G.patience;
  patienceFill.style.width = (p * 100).toFixed(1) + '%';
  let col = 'linear-gradient(90deg,#6fb37a,#95c477)';
  let word = 'calm', wc = '#6c8a55';
  if (p < 0.66) { col = 'linear-gradient(90deg,#d6a54e,#e8c35c)'; word = 'waiting'; wc = '#a37a2f'; }
  if (p < 0.4) { col = 'linear-gradient(90deg,#d08a44,#e0a257)'; word = 'tapping foot'; wc = '#a26428'; }
  if (p < 0.2) { col = 'linear-gradient(90deg,#c1553f,#d47a5f)'; word = 'about to leave'; wc = '#a33f32'; }
  patienceFill.style.background = col;
  patienceWord.textContent = word;
  patienceWord.style.color = wc;
  tipEl.textContent = 'Tip on the line: ' + money(Math.round(G.order.base * 0.42 * p));
}
function toast(msg, ms = 2400) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  G.toastTimer = ms / 1000;
}
function banner(text) {
  bannerText.textContent = text;
  bannerEl.classList.add('show');
  G.bannerTimer = 2.4;
}

/* ---------------------------------------------------------
   Flow
   --------------------------------------------------------- */
function startDay() {
  const order = ORDERS[G.day];
  G.order = order;
  G.phone = resetPhone(order);
  G.tasks = buildTasks(order);
  G.ti = 0;
  G.elapsed = 0;
  G.patience = 1;
  G.penalty = 0;
  G.mistakes = 0;
  G.jobDone = false;
  G.finishTimer = 0;
  G.closing = 0;
  G.testing = false;
  G.locked = false;
  G.drag = null;
  G.hold = null;
  G.cloth = null;
  G.particles = [];
  G.result = null;
  G.mode = 'playing';
  stage.classList.remove('pre');
  $('receipt').classList.add('hidden');
  $('summary').classList.add('hidden');
  $('titleScreen').classList.add('hidden');
  toastEl.classList.remove('show');
  G.toastTimer = 0;
  updateCustomerCard();
  updateTopbar();
  renderTicket();
  updateHud();
  const t = currentTask();
  if (t) selectTool(t.tool);
  banner('Day ' + (G.day + 1) + ' · ' + order.weekday + ' · ' + order.time);
  sfx('stamp');
}
function setTask() {
  const t = currentTask();
  if (!t) return;
  t.progress = t.progress || 0;
  G.hold = null;
  G.drag = null;
  G.cloth = null;
  selectTool(t.tool);
  setToolUI();
  renderTicket();
}
function completeTask() {
  const t = currentTask();
  if (!t || t.done) return;
  t.done = true;
  G.hold = null;
  G.drag = null;
  G.cloth = null;
  G.ti++;
  sfx('step');
  if (G.ti >= G.tasks.length) {
    finishJob();
    return;
  }
  const nt = currentTask();
  if (nt) {
    nt.progress = nt.progress || 0;
    selectTool(nt.tool);
  }
  setToolUI();
  renderTicket();
}
function finishJob() {
  G.jobDone = true;
  G.locked = true;
  const order = G.order;
  const p = clamp(G.patience, 0, 1);
  const stars = p >= 0.75 ? 5 : p >= 0.55 ? 4 : p >= 0.35 ? 3 : p >= 0.16 ? 2 : 1;
  const tip = Math.round(order.base * 0.42 * p);
  const total = order.base + tip;
  G.money += total;
  G.ratings.push(stars);
  G.dayTotals.push(total);
  G.result = { stars, tip, total, time: G.elapsed, base: order.base, p };
  G.finishTimer = 1.45;
  updateTopbar();
  sfx('success');
  const cols = ['#f2b64c', '#e8893a', '#8fd49d', '#9ec7e8', '#f28f8f', '#d9b8f2'];
  for (let i = 0; i < 44; i++) {
    const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 190;
    G.particles.push({
      x: 600 + (Math.random() - 0.5) * 120, y: 360 + (Math.random() - 0.5) * 160,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50,
      life: 1.1 + Math.random() * 0.9, max: 2,
      size: 2 + Math.random() * 4, color: cols[i % cols.length], shape: 'rect',
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, gravity: 220
    });
  }
}
function showReceipt() {
  if (!G.result) return;
  const o = G.order, r = G.result;
  G.mode = 'receipt';
  $('rModel').textContent = o.model;
  $('rTicket').textContent = '#' + String(G.day + 1).padStart(2, '0');
  $('rRepair').textContent = o.repairLabel;
  $('rTime').textContent = fmtTime(r.time);
  $('rMood').textContent = MOODS[r.stars];
  $('rBase').textContent = money(r.base);
  $('rTip').textContent = money(r.tip);
  $('rTotal').textContent = money(r.total);
  $('rStars').innerHTML = '<span>' + '★'.repeat(r.stars) + '</span><span class="dim">' + '★'.repeat(5 - r.stars) + '</span>';
  $('rComment').textContent = '“' + (r.stars === 5 && o.comment5 ? o.comment5 : STAR_COMMENTS[r.stars]) + '”';
  $('nextBtn').textContent = G.day >= ORDERS.length - 1 ? 'See the day book →' : 'Next customer →';
  $('receipt').classList.remove('hidden');
  sfx('coin');
}
function showSummary() {
  G.mode = 'summary';
  const jobs = G.dayTotals.length;
  const avg = G.ratings.length ? G.ratings.reduce((a, b) => a + b, 0) / G.ratings.length : 0;
  const best = G.dayTotals.length ? Math.max(...G.dayTotals) : 0;
  const total = G.money;
  let rank = 'Bench Apprentice';
  if (total >= 650) rank = 'Shop Technician';
  if (total >= 850) rank = 'Senior Technician';
  if (total >= 1080) rank = 'Repair Legend';
  $('sumRank').textContent = rank;
  $('sumLine').textContent = jobs + ' phones, ' + G.mistakes + ' wrong tools, and one very tired screwdriver.';
  $('sumJobs').textContent = String(jobs);
  $('sumMoney').textContent = money(total);
  $('sumRating').textContent = avg.toFixed(1) + ' / 5';
  $('sumBest').textContent = money(best);
  $('sumStars').innerHTML = '<span>' + '★'.repeat(Math.round(avg)) + '</span><span class="dim">' + '★'.repeat(5 - Math.round(avg)) + '</span>';
  const comments = {
    5: '“The only shop in town where I trust my phone.”',
    4: '“Fast, friendly, and the screen is spotless.”',
    3: '“A few hiccups, but my phone lives.”',
    2: '“Maybe bring a snack next time. It took a while.”',
    1: '“At least it turns on…”'
  };
  $('sumComment').textContent = comments[clamp(Math.round(avg), 1, 5)];
  let bestRun = 0;
  try {
    bestRun = Number(localStorage.getItem('pixelward.best') || 0);
    if (total > bestRun) {
      bestRun = total;
      localStorage.setItem('pixelward.best', String(total));
    }
  } catch (e) { bestRun = total; }
  $('bestRun').textContent = money(bestRun);
  $('summary').classList.remove('hidden');
  sfx('stamp');
}
function startRun() {
  ensureAudio();
  G.money = 0;
  G.ratings = [];
  G.dayTotals = [];
  G.day = 0;
  G.mistakes = 0;
  stage.classList.remove('pre');
  $('titleScreen').classList.add('hidden');
  startDay();
  sfx('coin');
}

/* ---------------------------------------------------------
   Input helpers
   --------------------------------------------------------- */
function nearestScrew(p, where) {
  const set = SCREW_SETS[where];
  let best = null;
  set.forEach((s, i) => {
    if (G.phone.screwProg[where][i] >= 1) return;
    const d = dist(p.x, p.y, s.x, s.y);
    if (d < 28 && (!best || d < best.d)) best = { i, s, d };
  });
  return best;
}
function targetHit(p, t) {
  switch (t.type) {
    case 'heat': return inPhone(p, 12);
    case 'pry': return inScreen(p, 14) || (G.phone.openT > 0.5 && inSideScreen(p));
    case 'unscrew': return Boolean(nearestScrew(p, t.where));
    case 'disconnect': {
      const c = CONNECTORS[t.name];
      return dist(p.x, p.y, c.x, c.y) < 30 && G.phone.connectors[t.name];
    }
    case 'remove':
      if (t.part === 'screen') return inSideScreen(p);
      if (t.part === 'protector') return inScreen(p, 10);
      return inRect(p, PART_RECTS[t.part], 10) && G.phone.parts[t.part] !== 'gone';
    case 'close': return inPhone(p, 12);
    case 'clean':
    case 'smooth': return inScreen(p, 14);
    case 'dry':
    case 'scrub': return inRect(p, INNER, 20);
    case 'test': return dist(p.x, p.y, POWER.x, POWER.y) < 52;
  }
  return false;
}
function wrongTool(t) {
  const now = performance.now();
  if (now - G.lastWrong < 1100) return;
  G.lastWrong = now;
  G.mistakes++;
  G.penalty = Math.min(0.5, G.penalty + 0.015);
  sfx('wrong');
  toast('Wrong tool for the job. This needs the ' + TOOL_NAMES[t.tool] + '.');
  const btn = document.querySelector('.tool[data-tool="' + G.selected + '"]');
  if (btn) {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 450);
  }
  G.patience = clamp(1 - G.elapsed / G.order.limit - G.penalty, 0, 1);
}
function startHold(p, type, opts) {
  G.hold = {
    x: p.x, y: p.y, type,
    progress: opts.progress || 0,
    need: opts.need || 1,
    r: opts.r || 28,
    idx: opts.idx, where: opts.where
  };
}
function burst(x, y, opts = {}) {
  const n = opts.n || 10;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = opts.speed || (40 + Math.random() * 110);
    G.particles.push({
      x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: opts.life || (0.35 + Math.random() * 0.4), max: opts.life || 0.9,
      size: opts.size || (1 + Math.random() * 2.4),
      color: opts.color || '#ffd27a', shape: opts.shape || 'dot',
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6, gravity: opts.gravity || 0
    });
  }
}

function handleDown(p) {
  if (G.mode !== 'playing' || G.jobDone || G.locked) return;
  const t = currentTask();
  if (!t) return;

  if (t.type === 'install') {
    const slot = traySlots().find((s) => s.part === t.part && !partInstalled(s.part) && inRect(p, slotHit(s)));
    if (slot) {
      G.drag = { kind: 'install', part: t.part, x: p.x, y: p.y };
      sfx('pick');
    } else {
      toast('Grab the new ' + PART_LABEL[t.part].toLowerCase() + ' from the parts tray.');
    }
    return;
  }

  if (t.type === 'remove') {
    let hit = false;
    if (t.part === 'screen') hit = inSideScreen(p) && G.phone.openT > 0.45;
    else if (t.part === 'protector') hit = inScreen(p, 10);
    else hit = inRect(p, PART_RECTS[t.part], 10);
    if (!hit) {
      toast(t.part === 'screen' ? 'The loose screen is over on the left.' : 'Grab the old part on the phone.');
      return;
    }
    if (G.selected !== t.tool) {
      wrongTool(t);
      return;
    }
    G.drag = { kind: 'remove', part: t.part, x: p.x, y: p.y };
    sfx('pick');
    return;
  }

  if (t.type === 'test') {
    if (dist(p.x, p.y, POWER.x, POWER.y) < 52 || inPhone(p, 14)) startTest();
    else toast('Tap the power button on the right edge of the phone.');
    return;
  }

  if (G.selected !== t.tool) {
    if (targetHit(p, t)) wrongTool(t);
    return;
  }

  switch (t.type) {
    case 'heat':
      if (inPhone(p, 12)) startHold(p, 'action', { need: t.need, progress: t.progress, r: 30 });
      else toast('Hold the heat gun over the phone.');
      break;
    case 'pry':
      if (inScreen(p, 14) || inPhone(p, 10)) {
        G.drag = { kind: 'pry', startY: p.y, lift: 0 };
        G.phone.openTarget = 0;
      }
      break;
    case 'unscrew': {
      const hit = nearestScrew(p, t.where);
      if (hit) startHold(p, 'screw', { idx: hit.i, where: t.where, progress: G.phone.screwProg[t.where][hit.i], need: 0.85, r: 14 });
      else toast('Find the little screws at the bottom of the phone.');
      break;
    }
    case 'disconnect': {
      const c = CONNECTORS[t.name];
      if (dist(p.x, p.y, c.x, c.y) < 32) startHold({ x: c.x, y: c.y }, 'action', { need: 0.65, progress: t.progress, r: 24 });
      else toast('Look for the little gold connector on the board.');
      break;
    }
    case 'close':
      if (inPhone(p, 14)) startHold(p, 'action', { need: t.need, progress: t.progress, r: 32 });
      break;
    case 'clean':
    case 'smooth':
      if (inScreen(p, 18)) {
        G.cloth = { task: t, last: p };
      }
      break;
    case 'scrub':
      if (inRect(p, INNER, 20)) {
        G.cloth = { task: t, last: p };
      } else toast('Drag the cloth over the green gunk on the board.');
      break;
    case 'dry':
      if (inRect(p, INNER, 18)) startHold(p, 'action', { need: t.need, progress: t.progress, r: 30 });
      else toast('Hold the heat gun inside the open phone.');
      break;
  }
}

function handleMove(p) {
  if (G.mode !== 'playing' || G.jobDone || G.locked) return;
  if (G.drag) {
    if (G.drag.kind === 'pry') {
      const lift = clamp((G.drag.startY - p.y) / 108, 0, 1);
      G.drag.lift = lift;
      G.phone.openTarget = lift * 0.94;
      return;
    }
    G.drag.x = p.x;
    G.drag.y = p.y;
    return;
  }
  if (G.cloth && G.down) {
    const t = currentTask();
    if (!t || G.cloth.task !== t) { G.cloth = null; return; }
    const d = dist(p.x, p.y, G.cloth.last.x, G.cloth.last.y);
    G.cloth.last = p;
    if (d > 90) return;
    if (t.type === 'scrub') {
      if (!inRect(p, INNER, 24)) return;
      t.progress = clamp((t.progress || 0) + d / 620, 0, 1);
      G.phone.corrosion = 1 - t.progress;
    } else {
      if (!inScreen(p, 24)) return;
      t.progress = clamp((t.progress || 0) + d / 640, 0, 1);
      if (t.type === 'clean') G.phone.clean = t.progress;
      else G.phone.bubbles = 1 - t.progress;
    }
    if (Math.random() < 0.015) sfx('heat');
    if (t.progress >= 1) {
      G.cloth = null;
      if (t.type === 'clean') G.phone.clean = 1;
      if (t.type === 'smooth') G.phone.bubbles = 0;
      if (t.type === 'scrub') G.phone.corrosion = 0;
      burst(p.x, p.y, { n: 12, color: '#dff6ec', speed: 60 });
      completeTask();
    }
  }
}

function handleUp(p) {
  G.down = false;
  if (G.drag) {
    if (G.drag.kind === 'pry') {
      if ((G.drag.lift || 0) > 0.9) {
        G.phone.openTarget = 1;
        G.phone.openT = 1;
        sfx('pop');
        burst(G.pointer.x, G.pointer.y, { n: 8, color: '#ffd9a0' });
        completeTask();
      } else {
        G.phone.openTarget = 0;
        if ((G.drag.lift || 0) > 0.25) toast('Almost. Give the screen a firmer pull upward.');
      }
    } else if (G.drag.kind === 'install') {
      const part = G.drag.part;
      const r = dropRect(part);
      if (inRect(p, r, 26)) {
        if (part === 'screen') {
          G.phone.screenRemoved = false;
          G.phone.screenNew = true;
          G.phone.openTarget = 0;
          G.phone.seat = 0;
          G.phone.seatTarget = 0;
        } else if (part === 'protector') {
          G.phone.protectorNew = true;
          G.phone.protectorPeeled = false;
          G.phone.bubbles = 1;
        } else {
          G.phone.parts[part] = 'new';
        }
        sfx('install');
        burst(p.x, p.y, { n: 16, color: '#ffe0a0', speed: 80 });
        completeTask();
      } else {
        toast('Drop it right on the empty slot.');
      }
    } else if (G.drag.kind === 'remove') {
      const part = G.drag.part;
      if (inRect(p, BIN, 12)) {
        if (part === 'screen') {
          G.phone.screenRemoved = true;
          G.phone.screenNew = false;
        } else if (part === 'protector') {
          G.phone.protectorPeeled = true;
          G.phone.protectorNew = false;
          G.phone.screenBroken = false;
          G.phone.clean = 0;
          toast('Underneath? Spotless. It was only the protector.');
        } else {
          G.phone.parts[part] = 'gone';
        }
        sfx('trash');
        burst(p.x, p.y, { n: 10, color: '#c9a35a', speed: 70 });
        completeTask();
      } else {
        toast('Pop it in the broken-parts bin on the left.');
      }
    }
    G.drag = null;
  }
  G.hold = null;
  G.cloth = null;
}

function startTest() {
  if (G.testing) return;
  G.testing = true;
  G.locked = true;
  G.phone.powerOn = true;
  G.phone.bootT = 0;
  G.phone.connectors.battery = true;
  sfx('boot');
  toast('Powering on…');
}

/* ---------------------------------------------------------
   Update loop
   --------------------------------------------------------- */
function updateHold(dt) {
  const h = G.hold;
  if (!h || !G.down) return;
  const t = currentTask();
  if (!t || G.locked) return;
  h.progress += dt / (h.need || 1);
  if (h.type === 'screw') {
    const pr = Math.min(1, h.progress);
    G.phone.screwProg[h.where][h.idx] = pr;
    if (pr >= 1) {
      G.hold = null;
      sfx('unscrew');
      burst(h.x, h.y, { n: 7, color: '#d8e4ec', speed: 55 });
      if (G.phone.screwProg[h.where].every((v) => v >= 1)) {
        G.phone.screwsRemoved[h.where] = true;
        completeTask();
      }
    }
    return;
  }
  t.progress = Math.min(1, h.progress);
  if (h.type === 'action' && t.type === 'heat') {
    G.phone.heat = t.progress;
    if (Math.random() < dt * 6) burst(h.x, h.y, { n: 1, color: 'rgba(255,200,140,.8)', speed: 30, life: 0.5, size: 1.6 });
  }
  if (h.type === 'action' && t.type === 'dry') {
    G.phone.dry = t.progress;
    if (Math.random() < dt * 8) burst(h.x, h.y, { n: 1, color: 'rgba(220,240,250,.8)', speed: 40, life: 0.7, size: 1.4 });
  }
  if (h.progress >= 1) {
    G.hold = null;
    switch (t.type) {
      case 'heat':
        sfx('pop');
        burst(h.x, h.y, { n: 10, color: '#ffb066' });
        completeTask();
        break;
      case 'dry':
        sfx('pop');
        G.phone.corrosion = Math.max(0.45, G.phone.corrosion);
        burst(h.x, h.y, { n: 10, color: '#bfe4ee' });
        completeTask();
        break;
      case 'disconnect':
        G.phone.connectors[t.name] = false;
        sfx('pop');
        burst(h.x, h.y, { n: 8, color: '#ffd27a' });
        completeTask();
        break;
      case 'close':
        beginClose();
        break;
    }
  }
}
function beginClose() {
  G.locked = true;
  G.closing = 0.75;
  G.phone.openTarget = 0;
  G.phone.seatTarget = 1;
  G.phone.screwsRemoved.bottom = false;
  sfx('install');
  burst(600, 380, { n: 12, color: '#ffd9a0' });
}

function update(dt) {
  G.time += dt;
  const p = G.phone;

  if (G.mode === 'playing' && !G.jobDone) {
    if (!G.testing) G.elapsed += dt;
    G.patience = clamp(1 - G.elapsed / G.order.limit - G.penalty, 0, 1);
    if (!G.locked) updateHold(dt);
    if (G.closing > 0) {
      G.closing -= dt;
      if (G.closing <= 0) {
        G.locked = false;
        completeTask();
      }
    }
    if (G.testing && p.powerOn) {
      if (p.bootT > 2.5) {
        G.testing = false;
        completeTask();
      }
    }
    updateHud();
  }

  if (G.jobDone && G.mode === 'playing') {
    G.finishTimer -= dt;
    if (G.finishTimer <= 0) showReceipt();
  }

  if (p) {
    p.openT += (p.openTarget - p.openT) * Math.min(1, dt * 7);
    p.seat += (p.seatTarget - p.seat) * Math.min(1, dt * 9);
    if (p.powerOn) p.bootT += dt;
  }

  // particles
  G.particles = G.particles.filter((q) => {
    q.life -= dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.vy += (q.gravity || 0) * dt;
    q.vx *= 0.985;
    q.vy *= 0.985;
    q.rot += q.vr * dt;
    return q.life > 0;
  });

  if (G.toastTimer > 0) {
    G.toastTimer -= dt;
    if (G.toastTimer <= 0) toastEl.classList.remove('show');
  }
  if (G.bannerTimer > 0) {
    G.bannerTimer -= dt;
    if (G.bannerTimer <= 0) bannerEl.classList.remove('show');
  }
}

/* ---------------------------------------------------------
   Canvas input
   --------------------------------------------------------- */
function stagePoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width * W,
    y: (e.clientY - r.top) / r.height * H
  };
}
canvas.addEventListener('pointerdown', (e) => {
  if (G.mode !== 'playing') return;
  e.preventDefault();
  ensureAudio();
  const p = stagePoint(e);
  G.pointer = p;
  G.down = true;
  handleDown(p);
});
window.addEventListener('pointermove', (e) => {
  const p = stagePoint(e);
  G.pointer = p;
  handleMove(p);
});
window.addEventListener('pointerup', (e) => {
  const p = stagePoint(e);
  G.pointer = p;
  handleUp(p);
});
window.addEventListener('pointercancel', () => { G.down = false; G.hold = null; G.cloth = null; G.drag = null; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

/* ---------------------------------------------------------
   DOM wiring
   --------------------------------------------------------- */
document.querySelectorAll('.tool').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (G.mode !== 'playing') return;
    selectTool(btn.dataset.tool);
  });
});
$('muteBtn').addEventListener('click', () => {
  muted = !muted;
  document.body.classList.toggle('muted', muted);
  try { localStorage.setItem('pixelward.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
  if (!muted) { ensureAudio(); sfx('select'); }
});
$('startBtn').addEventListener('click', startRun);
$('nextBtn').addEventListener('click', () => {
  if (G.mode !== 'receipt') return;
  sfx('tap');
  $('receipt').classList.add('hidden');
  if (G.day >= ORDERS.length - 1) {
    showSummary();
  } else {
    G.day++;
    startDay();
  }
});
$('replayBtn').addEventListener('click', () => {
  if (G.mode !== 'summary') return;
  ensureAudio();
  $('summary').classList.add('hidden');
  G.money = 0;
  G.ratings = [];
  G.dayTotals = [];
  G.day = 0;
  G.mistakes = 0;
  startDay();
  sfx('coin');
});
window.addEventListener('keydown', (e) => {
  if (G.mode !== 'playing') return;
  const tools = ['heat', 'driver', 'suction', 'spudger', 'tweezers', 'cloth', 'hand'];
  const idx = Number(e.key) - 1;
  if (idx >= 0 && idx < tools.length) selectTool(tools[idx]);
  if (e.key === 'm' || e.key === 'M') $('muteBtn').click();
});

/* ---------------------------------------------------------
   Fit, boot, loop
   --------------------------------------------------------- */
function fitStage() {
  const scale = Math.min((window.innerWidth - 20) / W, (window.innerHeight - 20) / H);
  stage.style.transform = 'scale(' + scale + ')';
}
window.addEventListener('resize', fitStage);

function init() {
  fitStage();
  stage.classList.add('pre');
  document.body.classList.toggle('muted', muted);
  G.order = ORDERS[0];
  G.phone = resetPhone(ORDERS[0]);
  G.phone.screenBroken = false;
  G.phone.protector = false;
  G.phone.powerOn = true;
  G.phone.bootT = 2.7;
  G.phone.clean = 1;
  G.tasks = [];
  G.selected = 'heat';
  updateTopbar();
  setToolUI();
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

init();
window.__ps = { G, startRun, startDay, selectTool, completeTask };
