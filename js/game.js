import { TAU, clamp, lerp, smoothstep } from './util.js';
import { createWorld, WORLD, RESOURCE_META } from './world.js';
import {
  drawPine, drawRock, drawBush, drawStick, drawFireGlow, drawCampfire, drawPlayer,
  drawTargetRing, drawWater, drawFirefly, drawParticle, drawDarkness,
  drawDecor, drawButterfly, drawTent,
} from './art.js';
import { Soundscape } from './audio.js';

const DAY_LENGTH = 300;
const START_TIME = 0.13;
const GATHER_RING = 283;

const TOOL_TIERS = {
  woodaxe: ['axe', 1],
  woodpick: ['pick', 1],
  stoneaxe: ['axe', 2],
  stonepick: ['pick', 2],
};

const RECIPES = [
  {
    id: 'woodaxe', name: 'Wooden Axe', tag: 'Tool', icon: 'axe', once: true,
    desc: 'A sharpened branch lashed to a handle. Chop pines for wood.',
    cost: { stick: 5 },
  },
  {
    id: 'woodpick', name: 'Wooden Pickaxe', tag: 'Tool', icon: 'pick', once: true,
    desc: 'A hardwood point. Break boulders for stone.',
    cost: { wood: 8, stick: 3 },
  },
  {
    id: 'stoneaxe', name: 'Stone Axe', tag: 'Upgrade', icon: 'axe', once: true,
    desc: 'A stone edge bound to a stick. Chops faster and yields more wood.',
    cost: { stick: 4, stone: 5 },
  },
  {
    id: 'stonepick', name: 'Stone Pickaxe', tag: 'Upgrade', icon: 'pick', once: true,
    desc: 'A stone head bound to a handle. Mines faster and yields more stone.',
    cost: { stick: 4, stone: 5 },
  },
  {
    id: 'campfire', name: 'Campfire', tag: 'Light', icon: 'fire',
    desc: 'A warm circle of safety against the dark.',
    cost: { wood: 6, stone: 4 },
  },
  {
    id: 'tent', name: 'Tent', tag: 'Shelter', icon: 'tent', once: true,
    desc: 'A hide shelter for the night. Sleep here to greet the morning.',
    cost: { wood: 8, stick: 4 },
  },
];

const QUESTS = [
  { id: 'sticks', title: 'Gather sticks', text: 'Pick up fallen branches', goal: 5 },
  { id: 'woodaxe', title: 'Craft a wooden axe', text: 'Open the hammer tab', goal: 1 },
  { id: 'wood', title: 'Chop pines', text: 'Gather 8 wood with the axe', goal: 8 },
  { id: 'woodpick', title: 'Craft a wooden pickaxe', text: 'Use 8 wood and 3 sticks', goal: 1 },
  { id: 'stone', title: 'Mine boulders', text: 'Gather 5 stone', goal: 5 },
  { id: 'stoneaxe', title: 'Craft a stone axe', text: 'Use 4 sticks and 5 stone', goal: 1 },
  { id: 'stonepick', title: 'Craft a stone pickaxe', text: 'Use 4 sticks and 5 stone', goal: 1 },
  { id: 'fire', title: 'Build a campfire', text: 'Craft it on open ground', goal: 1 },
  { id: 'tent', title: 'Build a tent', text: 'Use 8 wood and 4 sticks', goal: 1 },
  { id: 'sleep', title: 'Sleep until morning', text: 'Tap Sleep at the tent', goal: 1 },
];

const METERS = [
  { key: 'health', icon: 'heart', color: '#d98a78', label: 'Health' },
  { key: 'hunger', icon: 'bowl', color: '#e0b06a', label: 'Hunger' },
  { key: 'stamina', icon: 'bolt', color: '#7fb3a4', label: 'Stamina' },
];

const $ = (id) => document.getElementById(id);
const gameEl = $('game');
const canvas = $('scene');
const ctx = canvas.getContext('2d', { alpha: false });
const lightCanvas = document.createElement('canvas');
const sound = new Soundscape();

const params = new URLSearchParams(location.search);
const seedParam = params.get('seed');
const seed = seedParam ? (parseInt(seedParam, 10) || 1) : ((Math.random() * 1e9) | 0);

let world = null;
let vw = 1;
let vh = 1;
let dpr = 1;
let zoom = 1;
let lastFrame = 0;
let hudAccum = 0;
let craftAccum = 0;
let leafTimer = 1.2;
let emberTimer = 0.2;
let nightNotified = false;
let faintTimer = 0;
let toastId = 0;
let sheetNoticeTimer = 0;

const keys = new Set();
const stick = { x: 0, y: 0, pointer: null, max: 30 };
const toasts = [];

const state = {
  ready: false,
  started: false,
  paused: false,
  fainting: false,
  uiOpen: false,
  time: START_TIME,
  day: 1,
  elapsed: 0,
  daylight: 1,
  nearFire: false,
  player: { x: 0, y: 0, dir: -Math.PI / 2, moving: false, walk: 0, wade: 0, wadePhase: 0 },
  cam: { x: 0, y: 0 },
  inventory: { stick: 0, wood: 0, stone: 0, food: 0 },
  totals: { stick: 0, wood: 0, stone: 0, food: 0, fire: 0, tent: 0, sleep: 0 },
  quest: { index: 0 },
  tools: { axe: 0, pick: 0 },
  survival: { health: 100, hunger: 100, stamina: 100 },
  target: null,
  tentNear: null,
  sleeping: false,
  sleepT: 0,
  sleepDone: false,
  actionHeld: false,
  gather: { targetId: 0, progress: 0, particleTimer: 0 },
  particles: [],
  floaters: [],
  fireflies: [],
  butterflies: [],
  hints: { food: false, craft: false, stamina: false, moved: false, hunger: false, axe: false, pick: false },
  lastToolsKey: '',
};

/* ---------------- UI construction ---------------- */

const metersEl = $('meters');
metersEl.innerHTML = METERS.map((m) => `
  <div class="meter" id="meter-${m.key}" style="--c:${m.color}" role="img" aria-label="${m.label}">
    <svg class="ring" viewBox="0 0 58 58" aria-hidden="true">
      <circle class="track" cx="29" cy="29" r="25"></circle>
      <circle class="fill" id="ring-${m.key}" cx="29" cy="29" r="25"></circle>
    </svg>
    <div class="meter-inner">
      <svg aria-hidden="true"><use href="#icon-${m.icon}"></use></svg>
      <span class="meter-value" id="val-${m.key}">100</span>
    </div>
  </div>`).join('');

const inventoryEl = $('inventory');
inventoryEl.innerHTML = `
  <span class="res-chip" style="--c:#c9a06d"><svg aria-hidden="true"><use href="#icon-stick"></use></svg><span class="count" id="count-stick">0</span></span>
  <span class="res-chip" style="--c:#c79a6b"><svg aria-hidden="true"><use href="#icon-wood"></use></svg><span class="count" id="count-wood">0</span></span>
  <span class="res-chip" style="--c:#b0aea0"><svg aria-hidden="true"><use href="#icon-stone"></use></svg><span class="count" id="count-stone">0</span></span>
  <button class="res-chip food-chip" id="foodChip" style="--c:#d07b70" aria-label="Eat berries"><svg aria-hidden="true"><use href="#icon-berry"></use></svg><span class="count" id="count-food">0</span></button>
  <span class="tool-badges" id="toolBadges"></span>`;

const recipesEl = $('recipes');
recipesEl.innerHTML = RECIPES.map((r) => `
  <article class="recipe" data-recipe="${r.id}">
    <div class="recipe-icon${r.tag === 'Upgrade' ? ' stone' : ''}"><svg class="${r.icon === 'axe' ? 'solid-icon' : ''}" aria-hidden="true"><use href="#icon-${r.icon}"></use></svg></div>
    <div class="recipe-body">
      <h3>${r.name} <span class="recipe-tag">${r.tag}</span></h3>
      <p>${r.desc}</p>
      <div class="cost" data-cost="${r.id}"></div>
    </div>
    <button class="craft-action" data-craft="${r.id}">Craft</button>
  </article>`).join('');

const sheetResEl = $('sheetRes');
const sheetNoticeEl = $('sheetNotice');
const sheetEl = $('sheet');
const actionWrap = $('actionWrap');
const actionBtn = $('actionBtn');
const actionLabel = $('actionLabel');
const actionIconUse = $('actionIconUse');
const actionIcon = $('actionIcon');
const actionProgress = $('actionProgress');
const craftDot = $('craftDot');
const foodChip = $('foodChip');
const toolBadgesEl = $('toolBadges');
const questCardEl = $('questCard');
const questStepEl = $('questStep');
const questTitleEl = $('questTitle');
const questTextEl = $('questText');
const questCountEl = $('questCount');
const questFillEl = $('questFill');
const dialMarker = $('dialMarker');
const dialLabel = $('dialLabel');
const dialFace = document.querySelector('.dial-face');
const dialIconUse = document.querySelector('#dialIcon use');
const titleEl = $('title');
const startBtn = $('startBtn');
const loadingText = $('loadingText');
const faintEl = $('faint');
const soundBtn = $('soundBtn');
const soundIcon = $('soundIcon');
const toastsEl = $('toasts');

/* ---------------- helpers ---------------- */

function clampCamera() {
  const hw = vw / (2 * zoom);
  const hh = vh / (2 * zoom);
  state.cam.x = WORLD > hw * 2 ? clamp(state.cam.x, hw, WORLD - hw) : WORLD / 2;
  state.cam.y = WORLD > hh * 2 ? clamp(state.cam.y, hh, WORLD - hh) : WORLD / 2;
}

function resize() {
  const rect = gameEl.getBoundingClientRect();
  vw = Math.max(1, rect.width);
  vh = Math.max(1, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  lightCanvas.width = Math.max(1, Math.round(vw));
  lightCanvas.height = Math.max(1, Math.round(vh));
  zoom = clamp(Math.min(vw, vh) / 430, 0.92, 1.45);
  clampCamera();
}

function showToast(html, duration = 2500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  el.dataset.id = String(++toastId);
  toastsEl.appendChild(el);
  toasts.push({ el, until: performance.now() + duration, id: toastId });
  while (toasts.length > 2) {
    const old = toasts.shift();
    old.el.remove();
  }
}

function updateToasts(now) {
  for (let i = toasts.length - 1; i >= 0; i--) {
    const t = toasts[i];
    if (!t.out && now >= t.until) {
      t.out = true;
      t.el.classList.add('out');
      t.until = now + 460;
    } else if (t.out && now >= t.until) {
      t.el.remove();
      toasts.splice(i, 1);
    }
  }
}

function haptic(ms = 8) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {}
}

function distanceToFire(x, y) {
  let best = Infinity;
  for (const f of world.fires) {
    const dx = f.x - x;
    const dy = f.y - y;
    const d = Math.hypot(dx, dy);
    if (d < best) best = d;
  }
  return best;
}

function canAfford(recipe) {
  return Object.entries(recipe.cost).every(([k, v]) => state.inventory[k] >= v);
}

function isOwned(recipe) {
  const tier = TOOL_TIERS[recipe.id];
  if (tier) return state.tools[tier[0]] >= tier[1];
  if (recipe.id === 'tent') return world.tents.length > 0;
  return false;
}

function spend(cost) {
  for (const [k, v] of Object.entries(cost)) state.inventory[k] -= v;
}

function phaseFor(time) {
  if (time < 0.07) return { name: 'Dawn', night: true };
  if (time < 0.19) return { name: 'Morning', night: false };
  if (time < 0.4) return { name: 'Day', night: false };
  if (time < 0.5) return { name: 'Golden hour', night: false };
  if (time < 0.6) return { name: 'Dusk', night: true };
  if (time < 0.9) return { name: 'Night', night: true };
  return { name: 'Dawn', night: true };
}

function toolLevelFor(kind) {
  if (kind === 'tree') return state.tools.axe;
  if (kind === 'rock') return state.tools.pick;
  return 0;
}

function gatherDuration(o) {
  let d = RESOURCE_META[o.kind].duration;
  const level = toolLevelFor(o.kind);
  if (level >= 2) d *= 0.55;
  else if (level >= 1) d *= 0.7;
  return d;
}

function questProgress(q) {
  if (q.id === 'sticks') return state.totals.stick;
  if (q.id === 'woodaxe') return state.tools.axe >= 1 ? 1 : 0;
  if (q.id === 'wood') return state.totals.wood;
  if (q.id === 'woodpick') return state.tools.pick >= 1 ? 1 : 0;
  if (q.id === 'stone') return state.totals.stone;
  if (q.id === 'stoneaxe') return state.tools.axe >= 2 ? 1 : 0;
  if (q.id === 'stonepick') return state.tools.pick >= 2 ? 1 : 0;
  if (q.id === 'fire') return state.totals.fire;
  if (q.id === 'tent') return state.totals.tent;
  if (q.id === 'sleep') return state.totals.sleep;
  return 0;
}

function updateQuestHud() {
  if (!questCardEl) return;
  const q = QUESTS[state.quest.index];
  if (!q) {
    questStepEl.textContent = '✓';
    questTitleEl.textContent = 'All quests complete';
    questTextEl.textContent = 'Keep the fire burning';
    questCountEl.textContent = '';
    questFillEl.style.width = '100%';
    return;
  }
  const p = Math.min(questProgress(q), q.goal);
  questStepEl.textContent = `${state.quest.index + 1}/${QUESTS.length}`;
  questTitleEl.textContent = q.title;
  questTextEl.textContent = q.text;
  questCountEl.textContent = `${p}/${q.goal}`;
  questFillEl.style.width = `${(p / q.goal) * 100}%`;
}

function checkQuests() {
  if (!state.started) return;
  let advanced = false;
  while (state.quest.index < QUESTS.length) {
    const q = QUESTS[state.quest.index];
    if (questProgress(q) < q.goal) break;
    state.quest.index++;
    advanced = true;
    const next = QUESTS[state.quest.index];
    if (next) {
      showToast(`Quest complete · <b>${q.title}</b><br><span class="toast-sub">Next: ${next.title} — ${next.text}</span>`, 3800);
    } else {
      showToast('<b>All quests complete.</b><br><span class="toast-sub">Keep the fire burning.</span>', 5000);
    }
    questCardEl.classList.remove('flash');
    void questCardEl.offsetWidth;
    questCardEl.classList.add('flash');
  }
  if (advanced) updateHud(true);
}

function updateHud(force = false) {
  const s = state.survival;
  const C = 157.08;
  for (const m of METERS) {
    const v = clamp(s[m.key], 0, 100);
    const ring = $(`ring-${m.key}`);
    const val = $(`val-${m.key}`);
    const meter = $(`meter-${m.key}`);
    if (ring) ring.style.strokeDashoffset = String(C * (1 - v / 100));
    if (val) val.textContent = String(Math.round(v));
    if (meter) meter.classList.toggle('low', v < 28);
  }

  $('count-stick').textContent = String(state.inventory.stick);
  $('count-wood').textContent = String(state.inventory.wood);
  $('count-stone').textContent = String(state.inventory.stone);
  $('count-food').textContent = String(state.inventory.food);
  foodChip.classList.toggle('urgent', s.hunger < 34 && state.inventory.food > 0);

  const toolKey = `${state.tools.axe}${state.tools.pick}`;
  if (toolKey !== state.lastToolsKey) {
    state.lastToolsKey = toolKey;
    let html = '';
    if (state.tools.axe) {
      const stone = state.tools.axe >= 2;
      html += `<span class="tool-badge${stone ? ' stone' : ''}" title="${stone ? 'Stone Axe' : 'Wooden Axe'}"><svg class="solid-icon" aria-hidden="true"><use href="#icon-axe"></use></svg></span>`;
    }
    if (state.tools.pick) {
      const stone = state.tools.pick >= 2;
      html += `<span class="tool-badge${stone ? ' stone' : ''}" title="${stone ? 'Stone Pickaxe' : 'Wooden Pickaxe'}"><svg aria-hidden="true"><use href="#icon-pick"></use></svg></span>`;
    }
    toolBadgesEl.innerHTML = html;
  }

  const phase = phaseFor(state.time);
  const darkness = 1 - state.daylight;
  dialLabel.textContent = `Day ${state.day} · ${phase.name}`;
  dialMarker.style.setProperty('--a', `${(state.time * 360).toFixed(1)}deg`);
  dialFace.classList.toggle('night', darkness > 0.45);
  dialIconUse.setAttribute('href', darkness > 0.45 ? '#icon-moon' : '#icon-sun');
  gameEl.classList.toggle('night', darkness > 0.45);

  const affordable = RECIPES.some((r) => !isOwned(r) && canAfford(r));
  craftDot.classList.toggle('show', affordable);
  if (affordable && !state.hints.craft && state.started) {
    state.hints.craft = true;
    showToast('You have enough materials to <b>craft</b>. Open the hammer tab.', 3400);
  }

  updateQuestHud();
  if (state.uiOpen) updateCraftUI();
}

function updateCraftUI() {
  sheetResEl.innerHTML = `
    <span class="res-chip" style="--c:#c9a06d"><svg aria-hidden="true"><use href="#icon-stick"></use></svg><span class="count">${state.inventory.stick}</span></span>
    <span class="res-chip" style="--c:#c79a6b"><svg aria-hidden="true"><use href="#icon-wood"></use></svg><span class="count">${state.inventory.wood}</span></span>
    <span class="res-chip" style="--c:#b0aea0"><svg aria-hidden="true"><use href="#icon-stone"></use></svg><span class="count">${state.inventory.stone}</span></span>
    <span class="res-chip" style="--c:#d07b70"><svg aria-hidden="true"><use href="#icon-berry"></use></svg><span class="count">${state.inventory.food}</span></span>`;

  for (const r of RECIPES) {
    const card = recipesEl.querySelector(`[data-recipe="${r.id}"]`);
    const costEl = recipesEl.querySelector(`[data-cost="${r.id}"]`);
    const btn = recipesEl.querySelector(`[data-craft="${r.id}"]`);
    if (!card || !costEl || !btn) continue;
    const owned = isOwned(r);
    const afford = canAfford(r);
    costEl.innerHTML = Object.entries(r.cost).map(([k, v]) => {
      const icon = k === 'wood' ? 'wood' : k === 'stone' ? 'stone' : k === 'stick' ? 'stick' : 'berry';
      const short = state.inventory[k] < v;
      return `<span class="${short ? 'short' : ''}"><svg aria-hidden="true"><use href="#icon-${icon}"></use></svg>${v}</span>`;
    }).join('');
    card.classList.toggle('affordable', afford && !owned);
    if (owned) {
      btn.textContent = 'Owned';
      btn.disabled = true;
      btn.classList.add('owned');
    } else {
      btn.textContent = 'Craft';
      btn.disabled = !afford;
      btn.classList.remove('owned');
    }
  }
}

function showSheetNotice(text, tone = 'error') {
  sheetNoticeEl.textContent = text;
  sheetNoticeEl.className = `sheet-notice ${tone}`;
  sheetNoticeEl.hidden = false;
  clearTimeout(sheetNoticeTimer);
  sheetNoticeTimer = setTimeout(() => { sheetNoticeEl.hidden = true; }, 4200);
}

function hideSheetNotice() {
  clearTimeout(sheetNoticeTimer);
  sheetNoticeEl.hidden = true;
}

function tentActionPreferred() {
  const tent = state.tentNear;
  if (!tent) return false;
  const p = state.player;
  const tentDist = Math.hypot(tent.x - p.x, tent.y - p.y);
  if (tentDist > 64) return false;
  const target = state.target;
  if (!target) return true;
  const targetDist = Math.hypot(target.x - p.x, target.y - p.y);
  return tentDist <= targetDist;
}

function updateActionUI() {
  const target = state.target;
  const tent = state.tentNear;
  const visible = (!!target || !!tent) && state.started && !state.uiOpen && !state.fainting && !state.sleeping;
  actionWrap.classList.toggle('visible', visible);
  if (!visible) {
    actionProgress.style.strokeDashoffset = String(GATHER_RING);
    return;
  }
  if (tent && (!target || tentActionPreferred())) {
    actionLabel.textContent = 'Sleep';
    actionIconUse.setAttribute('href', '#icon-moon');
    actionIcon.classList.remove('solid-icon');
    actionBtn.setAttribute('aria-label', 'Sleep in the tent until morning');
    actionProgress.style.strokeDashoffset = String(GATHER_RING);
    return;
  }
  const meta = RESOURCE_META[target.kind];
  actionLabel.textContent = meta.action;
  actionIconUse.setAttribute('href', `#icon-${meta.icon}`);
  actionIcon.classList.toggle('solid-icon', meta.icon === 'axe');
  actionBtn.setAttribute('aria-label', `${meta.action} ${meta.name}`);
  const progress = state.gather.targetId === target.id ? state.gather.progress : 0;
  actionProgress.style.strokeDashoffset = String(GATHER_RING * (1 - clamp(progress, 0, 1)));
}

/* ---------------- input ---------------- */

function resetStick() {
  stick.x = 0;
  stick.y = 0;
  stick.pointer = null;
  $('joystick').classList.remove('active');
  $('stickKnob').style.transform = 'translate(0px, 0px)';
}

function bindInput() {
  const zone = $('joystick');
  const knob = $('stickKnob');
  const base = zone.querySelector('.stick-base');
  let actionPointer = null;

  zone.addEventListener('pointerdown', (e) => {
    if (state.uiOpen || state.fainting) return;
    e.preventDefault();
    zone.setPointerCapture(e.pointerId);
    stick.pointer = e.pointerId;
    zone.classList.add('active');
    const rect = base.getBoundingClientRect();
    stick.cx = rect.left + rect.width / 2;
    stick.cy = rect.top + rect.height / 2;
    stick.max = Math.max(18, (rect.width - knob.offsetWidth) / 2 - 2);
    moveStick(e.clientX, e.clientY);
  });

  zone.addEventListener('pointermove', (e) => {
    if (stick.pointer !== e.pointerId) return;
    e.preventDefault();
    moveStick(e.clientX, e.clientY);
  });

  const end = (e) => {
    if (stick.pointer !== e.pointerId) return;
    resetStick();
  };
  zone.addEventListener('pointerup', end);
  zone.addEventListener('pointercancel', end);
  zone.addEventListener('lostpointercapture', () => {
    if (stick.pointer !== null) resetStick();
  });

  function moveStick(cx, cy) {
    let dx = cx - stick.cx;
    let dy = cy - stick.cy;
    const d = Math.hypot(dx, dy);
    if (d > stick.max) {
      dx = (dx / d) * stick.max;
      dy = (dy / d) * stick.max;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / stick.max;
    const ny = dy / stick.max;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.12) {
      stick.x = 0;
      stick.y = 0;
    } else {
      const scale = Math.min(1, mag) / mag;
      stick.x = nx * scale;
      stick.y = ny * scale;
    }
  }

  actionBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (state.sleeping || state.uiOpen || state.fainting) return;
    if (state.tentNear && (!state.target || tentActionPreferred())) {
      startSleep();
      return;
    }
    if (!state.target) return;
    state.actionHeld = true;
    actionPointer = e.pointerId;
    try { actionBtn.setPointerCapture(e.pointerId); } catch {}
  });
  const endAction = (e) => {
    if (actionPointer === null) return;
    if (e && e.pointerId !== actionPointer) return;
    actionPointer = null;
    state.actionHeld = false;
  };
  actionBtn.addEventListener('pointerup', endAction);
  actionBtn.addEventListener('pointercancel', endAction);
  actionBtn.addEventListener('lostpointercapture', () => {
    actionPointer = null;
    state.actionHeld = false;
  });
  window.addEventListener('pointerup', endAction);
  window.addEventListener('pointercancel', endAction);
  actionBtn.addEventListener('contextmenu', (e) => e.preventDefault());

  $('craftBtn').addEventListener('click', openSheet);
  $('closeSheet').addEventListener('click', closeSheet);
  recipesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-craft]');
    if (!btn) return;
    craft(btn.dataset.craft);
  });
  foodChip.addEventListener('click', eat);

  soundBtn.addEventListener('click', async () => {
    if (!sound.started) await sound.start();
    sound.setMuted(!sound.muted);
    updateSoundIcon();
  });

  startBtn.addEventListener('click', begin);
  $('wakeBtn').addEventListener('click', wake);

  gameEl.addEventListener('pointerdown', (e) => {
    if (state.uiOpen && !e.target.closest('.sheet')) closeSheet();
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    keys.add(k);
    if ((k === ' ' || k === 'e') && state.started && !state.uiOpen && !state.fainting && !state.sleeping) {
      if (state.tentNear && (!state.target || tentActionPreferred())) startSleep();
      else state.actionHeld = true;
    }
    if (k === 'escape') closeSheet();
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    keys.delete(k);
    if (k === ' ' || k === 'e') state.actionHeld = false;
  });

  window.addEventListener('resize', resize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest('.sheet')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  document.addEventListener('visibilitychange', () => {
    const hidden = document.hidden;
    state.paused = hidden;
    sound.setPaused(hidden);
    if (!hidden) lastFrame = 0;
  });
}

function updateSoundIcon() {
  const muted = sound.muted;
  soundIcon.setAttribute('href', muted ? '#icon-muted' : '#icon-sound');
  soundBtn.setAttribute('aria-pressed', String(muted));
  soundBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
}

function openSheet() {
  if (state.fainting) return;
  state.uiOpen = true;
  state.actionHeld = false;
  resetStick();
  updateCraftUI();
  hideSheetNotice();
  $('sheetScroll').scrollTop = 0;
  sheetEl.classList.add('open');
  sheetEl.setAttribute('aria-hidden', 'false');
  gameEl.classList.add('sheet-open');
}

function closeSheet() {
  state.uiOpen = false;
  hideSheetNotice();
  sheetEl.classList.remove('open');
  sheetEl.setAttribute('aria-hidden', 'true');
  gameEl.classList.remove('sheet-open');
}

/* ---------------- actions ---------------- */

function eat() {
  if (!state.started || state.fainting) return;
  if (state.inventory.food <= 0) {
    showToast('No berries left. Look for a berry bush.', 2200);
    return;
  }
  if (state.survival.hunger > 96 && state.survival.health > 96) {
    showToast('You are not hungry yet.', 1800);
    return;
  }
  state.inventory.food--;
  state.survival.hunger = Math.min(100, state.survival.hunger + 20);
  state.survival.health = Math.min(100, state.survival.health + 3);
  state.survival.stamina = Math.min(100, state.survival.stamina + 6);
  sound.eat();
  haptic(6);
  addFloater('+20 Hunger', state.player.x, state.player.y - 30, '#e8d29b');
  updateHud(true);
  if (!state.hints.food) {
    state.hints.food = true;
    showToast('Berries restore hunger. Tap the berry count whenever you need one.', 3000);
  }
}

function craft(id) {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe || isOwned(recipe)) return;
  if (!canAfford(recipe)) {
    showToast('Not enough materials yet.', 2000);
    showSheetNotice('Not enough materials yet. Gather sticks, wood, or stone.');
    return;
  }
  const p = state.player;
  if (id === 'campfire') {
    const spot = world.findFireSpot(p.x, p.y, p.dir);
    if (!spot) {
      showToast('Find open, solid ground for a campfire.', 2400);
      showSheetNotice('No open ground here. Step onto clear grass, away from trees and rocks.');
      return;
    }
    spend(recipe.cost);
    const fire = world.addFire(spot.x, spot.y);
    state.totals.fire += 1;
    for (let i = 0; i < 16; i++) spawnEmber(fire);
    sound.build();
    haptic(14);
    addFloater('Campfire', fire.x, fire.y - 34, '#f3d69b');
    showToast('Campfire built. Its light will hold back the night.', 3200);
    closeSheet();
  } else if (id === 'tent') {
    const spot = world.findTentSpot(p.x, p.y, p.dir);
    if (!spot) {
      showToast('Find open, solid ground for a tent.', 2400);
      showSheetNotice('No room here. Step onto clear grass, away from trees, rocks, and the fire.');
      return;
    }
    spend(recipe.cost);
    const tent = world.addTent(spot.x, spot.y);
    state.totals.tent += 1;
    sound.build();
    haptic(14);
    addFloater('Tent', tent.x, tent.y - 46, '#f3d69b');
    showToast('Tent raised. Sleep here to wake at morning.', 3400);
    closeSheet();
  } else {
    spend(recipe.cost);
    const tier = TOOL_TIERS[id];
    if (tier) state.tools[tier[0]] = Math.max(state.tools[tier[0]], tier[1]);
    sound.craft();
    haptic(10);
    addFloater(recipe.name, p.x, p.y - 32, '#f3d69b');
    const msg = {
      woodaxe: 'Pines can now be chopped for wood.',
      woodpick: 'Boulders can now be mined for stone.',
      stoneaxe: 'Pines fall faster and give more wood.',
      stonepick: 'Boulders break faster and give more stone.',
    }[id] || '';
    showToast(`Crafted <b>${recipe.name}</b>. ${msg}`, 3200);
    showSheetNotice(`Crafted ${recipe.name}. ${msg}`, 'ok');
  }
  updateHud(true);
  updateCraftUI();
  checkQuests();
}

function begin() {
  if (!state.ready || state.started) return;
  state.started = true;
  state.time = START_TIME;
  state.day = 1;
  state.sleeping = false;
  state.sleepT = 0;
  state.sleepDone = false;
  state.cam.x = state.player.x;
  state.cam.y = state.player.y;
  clampCamera();
  gameEl.classList.remove('prestart');
  titleEl.classList.add('hidden');
  setTimeout(() => { titleEl.style.display = 'none'; }, 1000);
  sound.start().then(() => updateSoundIcon()).catch(() => {});
  showToast('Move with the joystick. Gather the fallen sticks around the clearing.', 4400);
  setTimeout(() => {
    if (state.started) showToast('Craft a campfire before nightfall. It takes wood and stone.', 3400);
  }, 4800);
  updateQuestHud();
  lastFrame = 0;
}

function faint() {
  if (state.uiOpen) closeSheet();
  state.fainting = true;
  state.actionHeld = false;
  state.target = null;
  state.gather.progress = 0;
  sound.faint();
  faintEl.hidden = false;
  faintTimer = 0;
}

function wake() {
  const p = state.player;
  const tent = world.tents[0];
  const starter = world.fires.find((f) => f.starter) || world.fires[0];
  const base = tent || starter || world.spawn;
  p.x = base.x + 26;
  p.y = base.y + 26;
  p.dir = Math.PI / 2;
  state.survival.health = 62;
  state.survival.hunger = 48;
  state.survival.stamina = 72;
  state.cam.x = p.x;
  state.cam.y = p.y;
  clampCamera();
  state.fainting = false;
  faintEl.hidden = true;
  sound.wake();
  showToast('You wake beside the fire, a little wiser.', 3000);
  updateHud(true);
}

/* ---------------- simulation ---------------- */

function addFloater(text, x, y, color = '#f3e7c8') {
  state.floaters.push({ text, x, y, color, life: 1.25, maxLife: 1.25 });
  if (state.floaters.length > 24) state.floaters.shift();
}

function spawnHarvestBurst(o, resource) {
  const palettes = {
    wood: ['#a98055', '#8a6642', '#c7a071', '#7a5b3c'],
    stone: ['#a9a696', '#878b7e', '#c5c1ad', '#6f7468'],
    food: ['#7da35f', '#5d8a4d', '#c15a4d', '#9bb46f'],
  };
  const colors = palettes[resource] || palettes.wood;
  const shape = resource === 'food' ? 'leaf' : 'spark';
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * TAU;
    const sp = 22 + Math.random() * 55;
    state.particles.push({
      x: o.x + (Math.random() - 0.5) * 18,
      y: o.y + (Math.random() - 0.5) * 12 - 6,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp * 0.7 - 10,
      life: 0.55 + Math.random() * 0.65,
      maxLife: 1.2,
      size: 1 + Math.random() * 1.9,
      color: colors[(Math.random() * colors.length) | 0],
      shape,
      rot: Math.random() * TAU,
      spin: (Math.random() - 0.5) * 8,
      alpha: 0.85,
      drag: 2.2,
    });
  }
  if (state.particles.length > 260) state.particles.splice(0, state.particles.length - 260);
}

function spawnEmber(fire) {
  state.particles.push({
    x: fire.x + (Math.random() - 0.5) * 14,
    y: fire.y - 2 + Math.random() * 4,
    vx: (Math.random() - 0.5) * 14,
    vy: -20 - Math.random() * 34,
    life: 0.7 + Math.random() * 1.1,
    maxLife: 1.8,
    size: 0.8 + Math.random() * 1.5,
    color: Math.random() > 0.4 ? '#f2a45c' : '#ffd08a',
    shape: 'spark',
    rot: 0,
    spin: 0,
    alpha: 0.9,
    drag: 0.4,
    float: true,
  });
}

function spawnAmbientLeaf() {
  if (!world) return;
  const view = {
    x1: state.cam.x - vw / (2 * zoom) - 30,
    x2: state.cam.x + vw / (2 * zoom) + 30,
    y1: state.cam.y - vh / (2 * zoom) - 30,
    y2: state.cam.y + vh / (2 * zoom) + 30,
  };
  const trees = world.objects.filter((o) => o.kind === 'tree' && o.ready && o.x > view.x1 && o.x < view.x2 && o.y > view.y1 && o.y < view.y2);
  if (!trees.length) return;
  const t = trees[(Math.random() * trees.length) | 0];
  state.particles.push({
    x: t.x + (Math.random() - 0.5) * 34,
    y: t.y + (Math.random() - 0.5) * 28,
    vx: 6 + Math.random() * 14,
    vy: 8 + Math.random() * 14,
    life: 2.6 + Math.random() * 2.6,
    maxLife: 5.2,
    size: 1.3 + Math.random() * 1.5,
    color: Math.random() > 0.55 ? '#809b58' : Math.random() > 0.5 ? '#b08d5a' : '#6c8b50',
    shape: 'leaf',
    rot: Math.random() * TAU,
    spin: (Math.random() - 0.5) * 4,
    alpha: 0.5,
    drag: 0.15,
  });
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt;
    if (p.life <= 0) { state.particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.float) p.vy -= 7 * dt;
    const drag = Math.exp(-(p.drag ?? 1.2) * dt);
    p.vx *= drag;
    p.vy *= drag;
    if (p.spin) p.rot += p.spin * dt;
  }
  for (let i = state.floaters.length - 1; i >= 0; i--) {
    const f = state.floaters[i];
    f.life -= dt;
    f.y -= 16 * dt;
    if (f.life <= 0) state.floaters.splice(i, 1);
  }
}

function updateFireflies(dt) {
  const darkness = 1 - state.daylight;
  if (darkness < 0.2) return;
  const p = state.player;
  for (const f of state.fireflies) {
    f.t += dt;
    f.x += Math.cos(f.t * 0.55 + f.phase) * f.speed * dt;
    f.y += Math.sin(f.t * 0.42 + f.phase * 1.7) * f.speed * dt;
    const dx = f.x - p.x;
    const dy = f.y - p.y;
    if (dx * dx + dy * dy > 430 * 430) {
      const a = Math.random() * TAU;
      const r = 110 + Math.random() * 260;
      const x = clamp(p.x + Math.cos(a) * r, 30, WORLD - 30);
      const y = clamp(p.y + Math.sin(a) * r, 30, WORLD - 30);
      if (world.isLand(x, y, 0.02)) {
        f.x = x;
        f.y = y;
      }
    }
  }
}

function updateButterflies(dt, time) {
  const p = state.player;
  const daylight = state.daylight;
  for (const b of state.butterflies) {
    if (daylight < 0.25) continue;
    b.angle += Math.sin(time * 0.8 + b.phase) * 0.8 * dt;
    b.x += Math.cos(b.angle) * b.speed * dt;
    b.y += Math.sin(b.angle) * b.speed * dt;
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    if (dx * dx + dy * dy > 520 * 520) {
      const a = Math.random() * TAU;
      const r = 70 + Math.random() * 300;
      const x = clamp(p.x + Math.cos(a) * r, 30, WORLD - 30);
      const y = clamp(p.y + Math.sin(a) * r, 30, WORLD - 30);
      if (world.isLand(x, y, 0.08)) {
        b.x = x;
        b.y = y;
      }
    }
  }
}

function waterDepthAt(x, y) {
  const e = world.heightAt(x, y);
  if (e >= 0.012) return 0;
  return clamp((0.012 - e) / 0.34, 0, 1) * 0.62;
}

function nearestTent() {
  const p = state.player;
  let best = null;
  let bestD = 96 * 96;
  for (const t of world.tents) {
    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) {
      best = t;
      bestD = d2;
    }
  }
  return best;
}

function startSleep() {
  if (state.sleeping || !state.tentNear) return;
  state.sleeping = true;
  state.sleepT = 0;
  state.sleepDone = false;
  state.actionHeld = false;
  state.gather.progress = 0;
  state.gather.targetId = 0;
  haptic(12);
}

function findTarget() {
  const p = state.player;
  let best = null;
  let bestD = Infinity;
  for (const o of world.objects) {
    if (!o.ready) continue;
    if (o.kind === 'tree' && !state.tools.axe) continue;
    if (o.kind === 'rock' && !state.tools.pick) continue;
    const reach = RESOURCE_META[o.kind].reach;
    const dx = o.x - p.x;
    const dy = o.y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < reach * reach && d2 < bestD) {
      best = o;
      bestD = d2;
    }
  }
  return best;
}

function updateLockedHints() {
  const p = state.player;
  if (!state.tools.axe && !state.hints.axe) {
    for (const o of world.objects) {
      if (o.kind !== 'tree' || !o.ready) continue;
      if (Math.hypot(o.x - p.x, o.y - p.y) < 118) {
        state.hints.axe = true;
        showToast('Pines need a wooden axe. Gather sticks and craft one.', 3400);
        break;
      }
    }
  }
  if (!state.tools.pick && !state.hints.pick) {
    for (const o of world.objects) {
      if (o.kind !== 'rock' || !o.ready) continue;
      if (Math.hypot(o.x - p.x, o.y - p.y) < 118) {
        state.hints.pick = true;
        showToast('Boulders need a wooden pickaxe. Chop pines for wood first.', 3400);
        break;
      }
    }
  }
}

function resolveCollisions() {
  const p = state.player;
  for (let pass = 0; pass < 2; pass++) {
    for (const o of world.objects) {
      if (o.kind === 'stick') continue;
      const meta = RESOURCE_META[o.kind];
      const dx = p.x - o.x;
      const dy = p.y - o.y;
      const rr = meta.radius * o.scale * 0.72 + 8;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0.001 && d2 < rr * rr) {
        const d = Math.sqrt(d2);
        p.x = o.x + (dx / d) * rr;
        p.y = o.y + (dy / d) * rr;
      }
    }
    for (const f of world.fires) {
      const dx = p.x - f.x;
      const dy = p.y - f.y;
      const rr = 17;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0.001 && d2 < rr * rr) {
        const d = Math.sqrt(d2);
        p.x = f.x + (dx / d) * rr;
        p.y = f.y + (dy / d) * rr;
      }
    }
    for (const t of world.tents) {
      const dx = p.x - t.x;
      const dy = p.y - t.y;
      const rr = 27;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0.001 && d2 < rr * rr) {
        const d = Math.sqrt(d2);
        p.x = t.x + (dx / d) * rr;
        p.y = t.y + (dy / d) * rr;
      }
    }
  }
}

function completeGather(o) {
  const meta = RESOURCE_META[o.kind];
  const level = toolLevelFor(o.kind);
  const amount = level >= 2 ? 3 : level >= 1 ? 2 : 1;
  state.inventory[meta.resource] += amount;
  state.totals[meta.resource] = (state.totals[meta.resource] || 0) + amount;
  o.hits -= 1;
  if (o.hits <= 0) {
    o.ready = false;
    o.hits = meta.hits;
    o.respawnAt = meta.respawn > 0 ? state.elapsed + meta.respawn : Infinity;
    o.growth = 0;
  }
  state.survival.stamina = Math.max(0, state.survival.stamina - 3.5);
  spawnHarvestBurst(o, meta.resource);
  if (o.kind === 'tree') sound.chop();
  else if (o.kind === 'rock') sound.mine();
  else sound.pick();
  haptic(7);
  addFloater(`+${amount} ${meta.resourceName}`, o.x, o.y - 28, '#f3e2b3');
  if (meta.resource === 'food' && !state.hints.food) {
    state.hints.food = true;
    showToast('Tap the berry count in the corner to eat.', 3200);
  }
  updateHud(true);
  checkQuests();
}

function update(dt) {
  if (!state.started || state.fainting) return;

  if (state.sleeping) {
    state.sleepT += dt;
    if (!state.sleepDone && state.sleepT >= 0.62) {
      state.sleepDone = true;
      state.day += 1;
      state.time = 0.065;
      state.daylight = clamp(0.5 + 1.15 * Math.sin(state.time * TAU), 0, 1);
      nightNotified = false;
      state.survival.stamina = 100;
      state.survival.health = Math.min(100, state.survival.health + 28);
      state.survival.hunger = Math.max(0, state.survival.hunger - 6);
      state.totals.sleep += 1;
      state.actionHeld = false;
      state.gather.progress = 0;
      state.gather.targetId = 0;
      updateHud(true);
      checkQuests();
    }
    if (state.sleepT >= 1.35) {
      state.sleeping = false;
      state.sleepT = 0;
      showToast(`Day ${state.day}. The morning is cool and quiet.`, 3200);
    }
    return;
  }

  state.elapsed += dt;
  state.time += dt / DAY_LENGTH;
  if (state.time >= 1) {
    state.time -= 1;
    state.day++;
  }
  state.daylight = clamp(0.5 + 1.15 * Math.sin(state.time * TAU), 0, 1);
  const darkness = 1 - state.daylight;

  if (darkness > 0.55 && !nightNotified) {
    nightNotified = true;
    showToast('Night falls. Stay near a campfire to keep your sight.', 3800);
  } else if (darkness < 0.25 && nightNotified) {
    nightNotified = false;
    showToast('Morning returns to Nova Island.', 2400);
  }

  const p = state.player;
  let ix = stick.x;
  let iy = stick.y;
  if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
  if (keys.has('d') || keys.has('arrowright')) ix += 1;
  if (keys.has('w') || keys.has('arrowup')) iy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) iy += 1;
  let mag = Math.hypot(ix, iy);
  if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
  if (mag < 0.1) { ix = 0; iy = 0; mag = 0; }

  const gathering = state.actionHeld && state.target && !state.uiOpen;
  const moving = mag > 0.08 && !state.uiOpen && !gathering;
  p.moving = moving;

  if (moving) {
    const speed = 170 * (state.survival.stamina <= 0 ? 0.58 : 1) * (1 - p.wade * 0.34);
    p.x += ix * speed * dt;
    p.y += iy * speed * dt;
    p.dir = Math.atan2(iy, ix);
    if (!state.hints.moved && state.started) state.hints.moved = true;
  }
  resolveCollisions();
  p.x = clamp(p.x, 30, WORLD - 30);
  p.y = clamp(p.y, 30, WORLD - 30);
  updateLockedHints();

  const depth = waterDepthAt(p.x, p.y);
  p.wade = lerp(p.wade, depth, 1 - Math.exp(-dt * 7));
  p.wadePhase += dt * (0.7 + p.wade * 1.3);

  const fireDist = distanceToFire(p.x, p.y);
  state.nearFire = fireDist < 240;

  let staminaDrain = 0;
  if (moving) staminaDrain += 0.9;
  if (gathering) staminaDrain += 1.8;
  if (staminaDrain > 0) {
    state.survival.stamina = Math.max(0, state.survival.stamina - staminaDrain * dt);
  } else {
    state.survival.stamina = Math.min(100, state.survival.stamina + (state.nearFire ? 8.5 : 5.2) * dt);
  }

  state.survival.hunger = Math.max(0, state.survival.hunger - 0.2 * dt);
  if (state.survival.hunger <= 0) {
    state.survival.health = Math.max(0, state.survival.health - 0.68 * dt);
  } else if (state.survival.health < 100) {
    state.survival.health = Math.min(100, state.survival.health + (state.nearFire ? 0.24 : 0.055) * dt);
  }
  if (state.survival.hunger < 24 && !state.hints.hunger) {
    state.hints.hunger = true;
    showToast('You are getting hungry. Berries will help.', 3000);
  }
  if (state.survival.stamina <= 0 && !state.hints.stamina) {
    state.hints.stamina = true;
    showToast('You are spent. Stand still to catch your breath.', 2800);
  }
  if (state.survival.health <= 0) {
    faint();
    return;
  }

  state.target = state.uiOpen ? null : findTarget();
  state.tentNear = state.uiOpen ? null : nearestTent();
  if (state.target && gathering) {
    const wantDir = Math.atan2(state.target.y - p.y, state.target.x - p.x);
    let diff = ((wantDir - p.dir + Math.PI * 3) % TAU) - Math.PI;
    p.dir += diff * Math.min(1, dt * 14);
    if (state.gather.targetId !== state.target.id) {
      state.gather.targetId = state.target.id;
      state.gather.progress = 0;
    }
    if (state.survival.stamina <= 0.5) {
      state.gather.progress = Math.max(0, state.gather.progress - dt * 3);
    } else {
      const dur = gatherDuration(state.target);
      state.gather.progress += dt / dur;
      state.gather.particleTimer -= dt;
      if (state.gather.particleTimer <= 0) {
        state.gather.particleTimer = 0.16;
        spawnHarvestBurst(state.target, RESOURCE_META[state.target.kind].resource);
      }
      if (state.gather.progress >= 1) {
        state.gather.progress = 0;
        completeGather(state.target);
      }
    }
  } else {
    state.gather.progress = Math.max(0, state.gather.progress - dt * 2.4);
    if (!state.actionHeld) state.gather.targetId = 0;
  }

  for (const o of world.objects) {
    if (!o.ready && state.elapsed >= o.respawnAt) {
      o.ready = true;
      o.hits = o.maxHits;
      o.growth = 0;
    }
    if (o.ready && o.growth < 1) o.growth = Math.min(1, o.growth + dt * 0.9);
  }

  updateParticles(dt);
  updateFireflies(dt);
  updateButterflies(dt, state.elapsed);

  leafTimer -= dt;
  if (leafTimer <= 0) {
    leafTimer = 0.9 + Math.random() * 2.4;
    spawnAmbientLeaf();
  }
  emberTimer -= dt;
  if (emberTimer <= 0) {
    emberTimer = 0.16 + Math.random() * 0.2;
    for (const f of world.fires) {
      if (Math.abs(f.x - p.x) < vw / zoom + 200 && Math.abs(f.y - p.y) < vh / zoom + 200) spawnEmber(f);
    }
  }

  const camLerp = 1 - Math.exp(-dt * 5.5);
  const hw = vw / (2 * zoom);
  const hh = vh / (2 * zoom);
  const tx = WORLD > hw * 2 ? clamp(p.x, hw, WORLD - hw) : WORLD / 2;
  const ty = WORLD > hh * 2 ? clamp(p.y, hh, WORLD - hh) : WORLD / 2;
  state.cam.x = lerp(state.cam.x, tx, camLerp);
  state.cam.y = lerp(state.cam.y, ty, camLerp);

  sound.update(dt, { daylight: state.daylight, moving, nearFire: state.nearFire });

  hudAccum += dt;
  if (hudAccum > 0.1) {
    hudAccum = 0;
    checkQuests();
    updateHud();
  }
  if (state.uiOpen) {
    craftAccum += dt;
    if (craftAccum > 0.3) {
      craftAccum = 0;
      updateCraftUI();
    }
  }
}

/* ---------------- rendering ---------------- */

function heldTool() {
  if (!state.actionHeld || !state.target || state.uiOpen || state.fainting || state.sleeping) return null;
  const kind = state.target.kind;
  if (kind !== 'tree' && kind !== 'rock') return null;
  const tier = kind === 'tree' ? state.tools.axe : state.tools.pick;
  if (!tier) return null;
  const progress = state.gather.targetId === state.target.id ? state.gather.progress : 0;
  return { kind: kind === 'tree' ? 'axe' : 'pick', tier, progress };
}

function render(time) {
  const darkness = 1 - state.daylight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, vw, vh);
  ctx.fillStyle = '#16424e';
  ctx.fillRect(0, 0, vw, vh);

  const view = {
    x1: state.cam.x - vw / (2 * zoom),
    x2: state.cam.x + vw / (2 * zoom),
    y1: state.cam.y - vh / (2 * zoom),
    y2: state.cam.y + vh / (2 * zoom),
  };

  ctx.save();
  ctx.translate(vw / 2, vh / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-state.cam.x, -state.cam.y);

  const sx = clamp(view.x1 - 2, 0, WORLD);
  const sy = clamp(view.y1 - 2, 0, WORLD);
  const sw = clamp(view.x2 + 2, 0, WORLD) - sx;
  const sh = clamp(view.y2 + 2, 0, WORLD) - sy;
  if (sw > 0 && sh > 0) {
    ctx.drawImage(world.terrain, sx, sy, sw, sh, sx, sy, sw, sh);
  }

  drawWater(ctx, world, view, time);

  if (state.target && !state.uiOpen && !state.fainting) {
    drawTargetRing(ctx, state.target, time);
  }

  for (const f of world.fires) {
    if (f.x < view.x1 - 300 || f.x > view.x2 + 300 || f.y < view.y1 - 300 || f.y > view.y2 + 300) continue;
    drawFireGlow(ctx, f, time, 0.45 + darkness * 0.9);
  }

  const items = [];
  for (const d of world.decor) {
    if (d.x < view.x1 - 40 || d.x > view.x2 + 40 || d.y < view.y1 - 40 || d.y > view.y2 + 40) continue;
    items.push({ y: d.y, draw: () => drawDecor(ctx, d, time) });
  }
  for (const o of world.objects) {
    if (o.kind === 'stick' && !o.ready) continue;
    if (o.x < view.x1 - 90 || o.x > view.x2 + 90 || o.y < view.y1 - 90 || o.y > view.y2 + 90) continue;
    items.push({
      y: o.y,
      draw: () => {
        if (o.kind === 'tree') drawPine(ctx, o, time);
        else if (o.kind === 'rock') drawRock(ctx, o, time);
        else if (o.kind === 'stick') drawStick(ctx, o, time);
        else drawBush(ctx, o, time);
      },
    });
  }
  for (const f of world.fires) {
    if (f.x < view.x1 - 80 || f.x > view.x2 + 80 || f.y < view.y1 - 80 || f.y > view.y2 + 80) continue;
    items.push({ y: f.y, draw: () => drawCampfire(ctx, f, time, darkness) });
  }
  for (const t of world.tents) {
    if (t.x < view.x1 - 90 || t.x > view.x2 + 90 || t.y < view.y1 - 90 || t.y > view.y2 + 90) continue;
    items.push({ y: t.y, draw: () => drawTent(ctx, t, time, darkness) });
  }
  const tool = heldTool();
  items.push({ y: state.player.y, draw: () => drawPlayer(ctx, state.player, time, darkness, state.player.wade, tool) });
  items.sort((a, b) => a.y - b.y);
  for (const item of items) item.draw();

  if (state.daylight > 0.3) {
    for (const b of state.butterflies) {
      if (b.x < view.x1 || b.x > view.x2 || b.y < view.y1 || b.y > view.y2) continue;
      drawButterfly(ctx, b, time);
    }
  }

  for (const p of state.particles) drawParticle(ctx, p);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 11px ui-rounded, "Segoe UI", system-ui, sans-serif';
  for (const f of state.floaters) {
    const a = clamp(f.life / f.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = 'rgba(14,32,26,.55)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // moonlit colour grade
  if (darkness > 0.02) {
    ctx.fillStyle = `rgba(17,42,92,${0.3 * darkness})`;
    ctx.fillRect(0, 0, vw, vh);
  }

  // warm dusk wash
  const dusk = Math.max(0, 1 - Math.abs(state.time - 0.5) / 0.075);
  if (dusk > 0.01) {
    ctx.fillStyle = `rgba(246,148,86,${0.07 * dusk})`;
    ctx.fillRect(0, 0, vw, vh);
  }

  // night vision
  if (darkness > 0.02) {
    const nightAmount = smoothstep(0.2, 1, darkness);
    let radius = lerp(520, 162, nightAmount) * zoom;
    if (state.nearFire) radius = Math.max(radius, 305 * zoom);
    const pScreen = {
      x: (state.player.x - state.cam.x) * zoom + vw / 2,
      y: (state.player.y - state.cam.y) * zoom + vh / 2,
    };
    const firesScreen = world.fires
      .map((f) => ({
        x: (f.x - state.cam.x) * zoom + vw / 2,
        y: (f.y - state.cam.y) * zoom + vh / 2,
        r: (278 + Math.sin(time * 8 + f.seed) * 9) * zoom,
      }))
      .filter((f) => f.x > -f.r && f.x < vw + f.r && f.y > -f.r && f.y < vh + f.r);
    drawDarkness(ctx, lightCanvas, darkness, pScreen, radius, firesScreen, time, vw, vh);

    // a faint warm presence around the fire, above the dark
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of firesScreen) {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 0.7);
      g.addColorStop(0, `rgba(255,184,96,${0.07 * darkness})`);
      g.addColorStop(1, 'rgba(255,160,70,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    if (darkness > 0.3) {
      ctx.save();
      ctx.translate(vw / 2, vh / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-state.cam.x, -state.cam.y);
      for (const f of state.fireflies) {
        if (f.x < view.x1 || f.x > view.x2 || f.y < view.y1 || f.y > view.y2) continue;
        drawFirefly(ctx, f, time);
      }
      ctx.restore();
    }
  }

  // sleep transition: fade out, hold on the new morning, fade back
  if (state.sleeping) {
    const t = state.sleepT;
    const a = t < 0.62 ? smoothstep(0, 0.62, t) : 1 - smoothstep(0.78, 1.35, t);
    const alpha = clamp(a, 0, 1);
    ctx.fillStyle = `rgba(6,11,16,${alpha})`;
    ctx.fillRect(0, 0, vw, vh);
    if (alpha > 0.6) {
      ctx.globalAlpha = clamp((alpha - 0.6) / 0.4, 0, 1);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(245,238,219,.92)';
      ctx.font = '600 13px ui-rounded, "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`Day ${state.day} · Morning`, vw / 2, vh / 2);
      ctx.font = '500 10.5px ui-rounded, "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(245,238,219,.5)';
      ctx.fillText('You rest until first light', vw / 2, vh / 2 + 20);
      ctx.globalAlpha = 1;
    }
  }
}

/* ---------------- boot ---------------- */

function loop(now) {
  if (!lastFrame) lastFrame = now;
  let dt = (now - lastFrame) / 1000;
  lastFrame = now;
  dt = Math.min(dt, 0.05);
  if (state.started && !state.paused && !state.fainting) update(dt);
  updateActionUI();
  updateToasts(now);
  render(now / 1000);
  requestAnimationFrame(loop);
}

function init() {
  world = createWorld(seed);
  const p = state.player;
  p.x = world.spawn.x + 4;
  p.y = world.spawn.y + 40;
  state.cam.x = p.x;
  state.cam.y = p.y;

  state.fireflies = Array.from({ length: 38 }, () => ({
    x: world.spawn.x + (Math.random() - 0.5) * 700,
    y: world.spawn.y + (Math.random() - 0.5) * 700,
    phase: Math.random() * TAU,
    t: Math.random() * 100,
    speed: 5 + Math.random() * 9,
    alpha: 0.4 + Math.random() * 0.55,
  }));

  const butterflyColors = ['rgba(238,224,183,.9)', 'rgba(231,203,144,.9)', 'rgba(220,196,180,.85)', 'rgba(212,225,190,.85)'];
  state.butterflies = Array.from({ length: 11 }, () => ({
    x: world.spawn.x + (Math.random() - 0.5) * 500,
    y: world.spawn.y + (Math.random() - 0.5) * 500,
    angle: Math.random() * TAU,
    phase: Math.random() * TAU,
    flap: 7 + Math.random() * 6,
    speed: 7 + Math.random() * 10,
    color: butterflyColors[(Math.random() * butterflyColors.length) | 0],
  }));

  resize();
  bindInput();
  updateHud(true);
  updateSoundIcon();
  updateActionUI();
  state.ready = true;
  startBtn.disabled = false;
  loadingText.textContent = 'The island is ready.';
  setTimeout(() => { loadingText.style.opacity = '0'; }, 1800);
  requestAnimationFrame(loop);

  // small debug surface for verification and screenshots
  window.__nova = {
    seed,
    state,
    world,
    setTime(t) {
      state.time = clamp(t, 0, 0.999);
      state.daylight = clamp(0.5 + 1.15 * Math.sin(state.time * TAU), 0, 1);
      updateHud(true);
    },
    setNight() { this.setTime(0.76); },
    setDay() { this.setTime(0.18); },
    give(wood = 20, stone = 20, food = 10, sticks = 0) {
      state.inventory.wood += wood;
      state.inventory.stone += stone;
      state.inventory.food += food;
      state.inventory.stick += sticks;
      state.totals.wood += wood;
      state.totals.stone += stone;
      state.totals.food += food;
      state.totals.stick += sticks;
      updateHud(true);
      if (state.uiOpen) updateCraftUI();
      checkQuests();
    },
    refill() {
      state.survival.health = 100;
      state.survival.hunger = 100;
      state.survival.stamina = 100;
      updateHud(true);
    },
    near(kind) {
      const p = state.player;
      const list = world.objects.filter((o) => o.kind === kind && o.ready);
      if (!list.length) return null;
      list.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
      const o = list[0];
      let best = null;
      let bestScore = -1;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        const x = o.x + Math.cos(a) * 58;
        const y = o.y + Math.sin(a) * 58;
        if (!world.isLand(x, y, 0.03)) continue;
        let nearest = Infinity;
        for (const other of world.objects) {
          if (other === o) continue;
          const d = Math.hypot(other.x - x, other.y - y);
          if (d < nearest) nearest = d;
        }
        if (nearest > bestScore) {
          bestScore = nearest;
          best = { x, y };
        }
      }
      if (best) {
        p.x = best.x;
        p.y = best.y;
        p.dir = Math.atan2(o.y - p.y, o.x - p.x);
        state.cam.x = p.x;
        state.cam.y = p.y;
        clampCamera();
      }
      return { x: o.x, y: o.y, kind: o.kind, dist: Math.hypot(o.x - p.x, o.y - p.y) };
    },
    teleport(x, y) {
      state.player.x = clamp(x, 30, WORLD - 30);
      state.player.y = clamp(y, 30, WORLD - 30);
      state.cam.x = state.player.x;
      state.cam.y = state.player.y;
      clampCamera();
    },
    openCraft: openSheet,
    closeCraft: closeSheet,
    nearTent() {
      const t = world.tents[0];
      if (!t) return null;
      const p = state.player;
      p.x = t.x;
      p.y = t.y + 34;
      p.dir = -Math.PI / 2;
      state.cam.x = p.x;
      state.cam.y = p.y;
      clampCamera();
      return { x: t.x, y: t.y };
    },
    sleep() { startSleep(); },
    quest() {
      const q = QUESTS[state.quest.index];
      return {
        index: state.quest.index,
        total: QUESTS.length,
        id: q ? q.id : 'done',
        progress: q ? Math.min(questProgress(q), q.goal) : 1,
        goal: q ? q.goal : 1,
      };
    },
    addFire() {
      const spot = world.findFireSpot(state.player.x, state.player.y, state.player.dir);
      if (spot) world.addFire(spot.x, spot.y);
      return spot;
    },
    info() {
      return {
        seed,
        started: state.started,
        day: state.day,
        time: state.time,
        daylight: state.daylight,
        inventory: { ...state.inventory },
        totals: { ...state.totals },
        quest: {
          index: state.quest.index,
          id: QUESTS[state.quest.index] ? QUESTS[state.quest.index].id : 'done',
        },
        tools: { ...state.tools },
        survival: { ...state.survival },
        nearFire: state.nearFire,
        target: state.target ? { kind: state.target.kind, x: state.target.x, y: state.target.y } : null,
        player: { x: state.player.x, y: state.player.y, wade: state.player.wade },
        zoom,
        viewport: { width: vw, height: vh },
        objects: world.objects.length,
        fires: world.fires.length,
        tents: world.tents.length,
      };
    },
  };
}

requestAnimationFrame(() => setTimeout(() => {
  try {
    init();
  } catch (error) {
    console.error(error);
    loadingText.textContent = 'The island could not be shaped. Reload to try again.';
  }
}, 30));
