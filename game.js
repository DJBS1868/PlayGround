/* Melon Playground - mobile landscape physics sandbox */
(() => {
  'use strict';

  const M = window.Matter;
  if (!M) return;
  const { Engine, Bodies, Body, Composite, Constraint, Events, Vector, Query } = M;

  const WORLD = { w: 2400, h: 900, groundY: 720, floorBottom: 900 };
  // Keep the action above the bottom hotbar on short landscape phones.
  const UI_OFFSET_Y = 52;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  const normAngle = a => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };

  // ---------------------------------------------------------------- palettes
  const PALETTES = {
    green: {
      base: '#78ac26', light: '#a7d54f', dark: '#416611', line: '#172707',
      accent: '#d3ef83', type: 'melon', name: 'MELON'
    },
    red: {
      base: '#d94540', light: '#f2746d', dark: '#7c211d', line: '#360b09',
      accent: '#ffb0a7', type: 'apple', name: 'APPLE'
    },
    yellow: {
      base: '#dfb52c', light: '#f7da64', dark: '#856810', line: '#342805',
      accent: '#ffefa1', type: 'lemon', name: 'LEMON'
    },
    orange: {
      base: '#e58526', light: '#f8ae51', dark: '#86480f', line: '#321804',
      accent: '#ffd095', type: 'orange', name: 'ORANGE'
    },
    pumpkin: {
      base: '#d96a1d', light: '#f39242', dark: '#763407', line: '#2d1202',
      accent: '#ffc07e', type: 'pumpkin', name: 'PUMPKIN'
    },
    blue: {
      base: '#4d72cf', light: '#7f9eef', dark: '#263f83', line: '#0d1736',
      accent: '#b5c8ff', type: 'blueberry', name: 'BLUEBERRY'
    },
    grape: {
      base: '#7a4bc8', light: '#aa7cf0', dark: '#42236e', line: '#1e0d36',
      accent: '#d8bbff', type: 'grape', name: 'GRAPE'
    },
    tomato: {
      base: '#df463b', light: '#ff7b6d', dark: '#7d1c15', line: '#350906',
      accent: '#ffb0a5', type: 'tomato', name: 'TOMATO'
    },
    pear: {
      base: '#a5c63b', light: '#d3e979', dark: '#5d7512', line: '#273305',
      accent: '#eaffab', type: 'pear', name: 'PEAR'
    },
    ninja: {
      base: '#41474e', light: '#656d76', dark: '#171a1e', line: '#080a0c',
      accent: '#9099a4', type: 'ninja', name: 'NINJA'
    },
    gold: {
      base: '#d6a526', light: '#f7d95c', dark: '#7b5909', line: '#332404',
      accent: '#fff0a5', type: 'melon', name: 'GOLD MELON'
    },
    ice: {
      base: '#84c4d8', light: '#c2eef8', dark: '#3b7485', line: '#12323a',
      accent: '#e5fbff', type: 'ice', name: 'ICE MELON'
    }
  };

  // ---------------------------------------------------------------- item data
  const CATEGORIES = [
    { id: 'living', label: 'LIVING', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="6.2" r="3.1"/><path d="M8.5 21v-5.2L7 12l2.2-2.2h5.6L17 12l-1.5 3.8V21"/><path d="m9 21 .3-4.6M15 21l-.3-4.6"/></svg>' },
    { id: 'weapons', label: 'WEAPONS', icon: '<svg viewBox="0 0 24 24"><path d="m4 20 9.5-9.5"/><path d="m12 6 6-2 2 2-2 6-4-4-2-2Z"/><path d="m4 20 3.5-1L6 15.5 4 20Z"/></svg>' },
    { id: 'build', label: 'BUILD', icon: '<svg viewBox="0 0 24 24"><path d="M14.5 4.5 19.5 9.5 16 13 11 8l3.5-3.5Z"/><path d="m12.5 10.5-7 7 2 2 7-7"/><path d="m6 18-2 2"/></svg>' },
    { id: 'fun', label: 'CHAOS', icon: '<svg viewBox="0 0 24 24"><path d="m12 3 2.1 5.1L20 10l-5.9 1.9L12 17l-2.1-5.1L4 10l5.9-1.9L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>' }
  ];

  const ITEMS = {
    living: [
      { id: 'melon', name: 'MELON', cat: 'living', kind: 'ragdoll', pal: 'green' },
      { id: 'apple', name: 'APPLE', cat: 'living', kind: 'ragdoll', pal: 'red' },
      { id: 'lemon', name: 'LEMON', cat: 'living', kind: 'ragdoll', pal: 'yellow' },
      { id: 'orange', name: 'ORANGE', cat: 'living', kind: 'ragdoll', pal: 'orange' },
      { id: 'pumpkin', name: 'PUMPKIN', cat: 'living', kind: 'ragdoll', pal: 'pumpkin' },
      { id: 'blueberry', name: 'BLUEBERRY', cat: 'living', kind: 'ragdoll', pal: 'blue' },
      { id: 'grape', name: 'GRAPE', cat: 'living', kind: 'ragdoll', pal: 'grape' },
      { id: 'tomato', name: 'TOMATO', cat: 'living', kind: 'ragdoll', pal: 'tomato' },
      { id: 'pear', name: 'PEAR', cat: 'living', kind: 'ragdoll', pal: 'pear' },
      { id: 'ninja', name: 'NINJA', cat: 'living', kind: 'ragdoll', pal: 'ninja' },
      { id: 'gold', name: 'GOLD MELON', cat: 'living', kind: 'ragdoll', pal: 'gold' },
      { id: 'ice', name: 'ICE MELON', cat: 'living', kind: 'ragdoll', pal: 'ice' }
    ],
    weapons: [
      { id: 'pistol', name: 'PISTOL', cat: 'weapons', kind: 'pistol', auto: false },
      { id: 'sword', name: 'SWORD', cat: 'weapons', kind: 'sword' },
      { id: 'katana', name: 'KATANA', cat: 'weapons', kind: 'katana' },
      { id: 'axe', name: 'AXE', cat: 'weapons', kind: 'axe' },
      { id: 'grenade', name: 'GRENADE', cat: 'weapons', kind: 'grenade' },
      { id: 'rocket', name: 'ROCKET', cat: 'weapons', kind: 'rocket' },
      { id: 'minigun', name: 'MINIGUN', cat: 'weapons', kind: 'minigun', auto: true },
      { id: 'flame', name: 'FLAMER', cat: 'weapons', kind: 'flame', auto: true }
    ],
    build: [
      { id: 'crate', name: 'CRATE', cat: 'build', kind: 'crate' },
      { id: 'barrel', name: 'TNT BARREL', cat: 'build', kind: 'barrel' },
      { id: 'wall', name: 'WALL', cat: 'build', kind: 'wall' },
      { id: 'platform', name: 'GIRDER', cat: 'build', kind: 'platform' },
      { id: 'spikes', name: 'SPIKES', cat: 'build', kind: 'spikes' },
      { id: 'trampoline', name: 'BOUNCER', cat: 'build', kind: 'trampoline' }
    ],
    fun: [
      { id: 'blackhole', name: 'BLACK HOLE', cat: 'fun', kind: 'blackhole' },
      { id: 'meteor', name: 'METEOR', cat: 'fun', kind: 'meteor' },
      { id: 'lightning', name: 'LIGHTNING', cat: 'fun', kind: 'lightning' },
      { id: 'freeze', name: 'FREEZE', cat: 'fun', kind: 'freeze' },
      { id: 'gravity', name: 'ZERO-G', cat: 'fun', kind: 'gravity' },
      { id: 'nuke', name: 'NUKE', cat: 'fun', kind: 'nuke' }
    ]
  };

  const ALL_ITEMS = new Map();
  Object.values(ITEMS).forEach(list => list.forEach(item => ALL_ITEMS.set(item.id, item)));
  const HAND_ITEM = { id: 'hand', name: 'HAND', cat: 'hand', kind: 'hand' };
  const getItem = id => id === 'hand' ? HAND_ITEM : ALL_ITEMS.get(id);

  const HINTS = {
    hand: 'Drag a melon, or open ITEMS to cause trouble.',
    melon: 'Tap the floor to spawn a fresh test subject.',
    apple: 'Tap to drop an apple. Gravity does the rest.',
    lemon: 'Tap to deploy a very sour test subject.',
    orange: 'Tap to add another victim to the lab.',
    pumpkin: 'Tap to spawn a seasonal volunteer.',
    blueberry: 'Tap to spawn a blue test subject.',
    grape: 'Tap to spawn a grape. It knows what it did.',
    tomato: 'Tap to deploy a tomato. Technically a fruit.',
    pear: 'Tap to add a pear to the experiment.',
    ninja: 'Tap to spawn a stealth specialist. Very stealthy.',
    gold: 'Tap to spawn a premium test subject.',
    ice: 'Tap to spawn a chilled volunteer.',
    pistol: 'Tap a target. The nearest melon takes the shot.',
    sword: 'Tap to swing. Aim for the limbs.',
    katana: 'Tap for a fast, very sharp slash.',
    axe: 'Tap to chop. Precision is optional.',
    grenade: 'Tap to lob a grenade. Fuse is short.',
    rocket: 'Tap to launch a rocket. Please stand back.',
    minigun: 'Hold on a target to unload.',
    flame: 'Hold to spray fire. Everything is flammable.',
    crate: 'Tap to drop a wooden crate.',
    barrel: 'Tap to place an explosive barrel. Obviously.',
    wall: 'Tap to drop a concrete barrier.',
    platform: 'Tap to place a steel girder.',
    spikes: 'Tap to install a very unsafe floor.',
    trampoline: 'Tap to add a bounce pad.',
    blackhole: 'Tap to open a very bad idea.',
    meteor: 'Tap to call something from orbit.',
    lightning: 'Tap to strike the lab with lightning.',
    freeze: 'Tap to freeze every melon solid.',
    gravity: 'Tap to turn gravity upside down for a bit.',
    nuke: 'Tap to end the experiment permanently.'
  };

  // ---------------------------------------------------------------- DOM
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const ui = document.getElementById('ui');
  const drawer = document.getElementById('drawer');
  const drawerTabs = document.getElementById('drawerTabs');
  const itemGrid = document.getElementById('itemGrid');
  const hotbarEl = document.getElementById('hotbar');
  const toolNameEl = document.getElementById('toolName');
  const hintPill = document.getElementById('hintPill');
  const hintText = document.getElementById('hintText');
  const toastEl = document.getElementById('toast');
  const pauseModal = document.getElementById('pauseModal');
  const rotateOverlay = document.getElementById('rotateOverlay');
  const victimCountEl = document.getElementById('victimCount');

  // ---------------------------------------------------------------- state
  const state = {
    tool: 'hand',
    cat: 'living',
    quick: ['hand', 'pistol', 'sword', 'grenade', 'crate', 'melon'],
    paused: false,
    muted: false,
    drawerOpen: false,
    rotateDismissed: false,
    pointer: { x: 0, y: 0, worldX: 0, worldY: 0, inside: false, down: false },
    hold: null,
    lastUiSound: 0
  };

  const camera = { x: 800, y: 450, zoom: 1 };
  let scale = 1;
  let viewW = 1600;
  let viewH = 900;
  let dpr = 1;
  let W = 1280;
  let H = 720;

  const ragdolls = [];
  const props = [];
  const projectiles = [];
  const particles = [];
  const effects = [];
  const decals = [];
  const history = [];
  let ragdollSerial = 0;
  let shake = 0;
  let flash = 0;
  let flashColor = '255,220,130';
  let sceneTime = 0;
  let gravityUntil = 0;
  let dragConstraint = null;
  let dragBody = null;
  let dragWorld = null;
  let gesture = null;
  let pinch = null;
  let toastTimer = 0;
  let hintTimer = 0;
  let ready = false;

  const pointers = new Map();
  const thumbCache = new Map();

  // ---------------------------------------------------------------- audio
  let actx = null;
  let noiseBuffer = null;
  function ensureAudio() {
    if (state.muted) return null;
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }
  function getNoise(ac) {
    if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
    const len = Math.floor(ac.sampleRate * 0.7);
    noiseBuffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }
  function tone(freq, dur, type, vol, slide) {
    const ac = ensureAudio();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ac.currentTime + dur);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur + 0.02);
  }
  function noise(dur, vol, freq, q) {
    const ac = ensureAudio();
    if (!ac) return;
    const src = ac.createBufferSource();
    src.buffer = getNoise(ac);
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq || 900;
    filter.Q.value = q || 0.7;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    src.connect(filter).connect(g).connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + dur + 0.02);
  }
  const sfx = {
    click() { tone(520, 0.035, 'square', 0.025, -90); },
    spawn() { tone(190, 0.08, 'sine', 0.05, 90); setTimeout(() => tone(290, 0.06, 'sine', 0.035, 60), 45); },
    shoot() { noise(0.07, 0.11, 1400, 0.8); tone(150, 0.06, 'square', 0.055, -100); },
    shotgun() { noise(0.14, 0.16, 900, 0.6); tone(100, 0.11, 'sawtooth', 0.06, -70); },
    slash() { noise(0.11, 0.055, 2600, 2.4); },
    hit() { noise(0.06, 0.055, 380, 0.9); tone(90, 0.06, 'sine', 0.04, -30); },
    explosion() { noise(0.45, 0.22, 220, 0.45); tone(70, 0.32, 'sawtooth', 0.09, -35); },
    boom() { noise(0.65, 0.28, 120, 0.4); tone(48, 0.5, 'sine', 0.12, -20); },
    boing() { tone(180, 0.16, 'sine', 0.055, 420); },
    freeze() { tone(1200, 0.22, 'sine', 0.035, 900); noise(0.18, 0.04, 4000, 1.8); },
    thunder() { noise(0.4, 0.2, 500, 0.5); tone(55, 0.35, 'sawtooth', 0.09, -20); },
    error() { tone(120, 0.12, 'square', 0.035, -20); },
    undo() { tone(300, 0.06, 'sine', 0.04, -100); }
  };
  function playSfx(name) {
    if (state.muted) return;
    try { sfx[name] && sfx[name](); } catch (_) {}
  }

  // ---------------------------------------------------------------- canvas sizing
  function resize() {
    W = Math.max(320, window.innerWidth);
    H = Math.max(240, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    scale = Math.max(W / 1600, H / 900);
    camera.zoom = W <= 960 ? 1.08 : 1;
    viewW = W / (scale * camera.zoom);
    viewH = H / (scale * camera.zoom);
    clampCamera();
    updateOrientation();
  }

  function clampCamera() {
    const halfW = viewW / 2;
    const halfH = viewH / 2;
    if (viewW >= WORLD.w) camera.x = WORLD.w / 2;
    else camera.x = clamp(camera.x, halfW, WORLD.w - halfW);
    if (viewH >= WORLD.h) camera.y = WORLD.h / 2;
    else camera.y = clamp(camera.y, halfH, WORLD.h - halfH);
  }

  function screenToWorld(x, y) {
    const s = scale * camera.zoom;
    return {
      x: camera.x + (x - W / 2) / s,
      y: camera.y + (y - (H / 2 - UI_OFFSET_Y)) / s
    };
  }
  function worldToScreen(x, y) {
    const s = scale * camera.zoom;
    return { x: W / 2 + (x - camera.x) * s, y: H / 2 + (y - camera.y) * s };
  }

  function updateOrientation() {
    const portrait = window.innerHeight > window.innerWidth * 1.02;
    rotateOverlay.classList.toggle('show', portrait && !state.rotateDismissed);
  }
  updateOrientation();

  // ---------------------------------------------------------------- UI
  function buildUI() {
    drawerTabs.innerHTML = CATEGORIES.map(cat => (
      `<button class="tab-btn ${cat.id === state.cat ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.icon}<span>${cat.label}</span>
      </button>`
    )).join('');

    drawerTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.cat;
        drawerTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderItems();
        playSfx('click');
      });
    });

    renderItems();
    renderHotbar();
    updateSelectionUI();
  }

  function renderItems() {
    const list = ITEMS[state.cat] || [];
    itemGrid.innerHTML = list.map(item => (
      `<button class="item-card ${item.id === state.tool ? 'active' : ''}" data-id="${item.id}" aria-label="${item.name}">
        <canvas width="96" height="96"></canvas><span>${item.name}</span>
      </button>`
    )).join('');
    itemGrid.querySelectorAll('.item-card').forEach(card => {
      const item = ALL_ITEMS.get(card.dataset.id);
      const c = card.querySelector('canvas');
      drawItemThumb(c, item);
      card.addEventListener('click', () => {
        selectTool(item.id, true);
        playSfx('click');
      });
    });
  }

  function renderHotbar() {
    hotbarEl.innerHTML = state.quick.map((id, i) => {
      const item = getItem(id);
      return `<button class="hot-slot ${id === state.tool ? 'active' : ''}" data-id="${id}" aria-label="${item ? item.name : id}">
        <span class="hot-key">${i + 1}</span><canvas width="96" height="96"></canvas>
      </button>`;
    }).join('');
    hotbarEl.querySelectorAll('.hot-slot').forEach(slot => {
      const item = getItem(slot.dataset.id);
      drawItemThumb(slot.querySelector('canvas'), item);
      slot.addEventListener('click', () => {
        selectTool(slot.dataset.id, true);
        playSfx('click');
      });
    });
  }

  function updateSelectionUI() {
    const item = getItem(state.tool) || HAND_ITEM;
    toolNameEl.textContent = item.name;
    hotbarEl.querySelectorAll('.hot-slot').forEach(el => el.classList.toggle('active', el.dataset.id === state.tool));
    itemGrid.querySelectorAll('.item-card').forEach(el => el.classList.toggle('active', el.dataset.id === state.tool));
    hintText.textContent = HINTS[state.tool] || HINTS.hand;
    hintPill.classList.remove('fade');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hintPill.classList.add('fade'), 6500);
    victimCountEl.textContent = String(ragdolls.length);
  }

  function selectTool(id, fromDrawer) {
    if (!getItem(id)) return;
    if (state.tool === id && !fromDrawer) {
      // still close the drawer when re-selecting
    }
    state.tool = id;
    if (id !== 'hand' && !state.quick.includes(id)) {
      state.quick[state.quick.length - 1] = id;
      renderHotbar();
    }
    updateSelectionUI();
    if (fromDrawer) closeDrawer();
    const item = getItem(id);
    showToast(item.name + ' EQUIPPED');
  }

  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  function openDrawer() {
    state.drawerOpen = true;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    playSfx('click');
  }
  function closeDrawer() {
    state.drawerOpen = false;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function toggleDrawer() {
    state.drawerOpen ? closeDrawer() : openDrawer();
  }

  function setPaused(value) {
    state.paused = value;
    pauseModal.classList.toggle('open', value);
    pauseModal.setAttribute('aria-hidden', value ? 'false' : 'true');
    state.hold = null;
    if (value) {
      victimCountEl.textContent = String(ragdolls.length);
      playSfx('click');
    }
  }

  function updateVictimCount() {
    victimCountEl.textContent = String(ragdolls.length);
  }

  // ---------------------------------------------------------------- UI bindings
  document.getElementById('btnShop').addEventListener('click', toggleDrawer);
  document.getElementById('btnCloseShop').addEventListener('click', closeDrawer);
  document.getElementById('btnUndo').addEventListener('click', undo);
  document.getElementById('btnReset').addEventListener('click', () => { resetScene(); playSfx('click'); });
  document.getElementById('btnPause').addEventListener('click', () => setPaused(true));
  document.getElementById('btnResume').addEventListener('click', () => setPaused(false));
  document.getElementById('btnRestart').addEventListener('click', () => { setPaused(false); resetScene(); playSfx('click'); });
  document.getElementById('btnClearPause').addEventListener('click', () => { setPaused(false); clearEverything(); playSfx('click'); });
  document.getElementById('btnClear').addEventListener('click', () => { clearEverything(); playSfx('click'); });
  document.getElementById('btnMute').addEventListener('click', toggleMute);
  document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('btnLandscape').addEventListener('click', () => {
    state.rotateDismissed = true;
    rotateOverlay.classList.remove('show');
    tryLockLandscape();
  });

  function toggleMute() {
    state.muted = !state.muted;
    const btn = document.getElementById('btnMute');
    btn.classList.toggle('is-off', state.muted);
    if (!state.muted) {
      ensureAudio();
      playSfx('click');
    }
    showToast(state.muted ? 'SOUND OFF' : 'SOUND ON');
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        await tryLockLandscape();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (_) {}
  }

  async function tryLockLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (_) {}
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 150));
  window.addEventListener('keydown', e => {
    if (e.key >= '1' && e.key <= '6') {
      const id = state.quick[Number(e.key) - 1];
      if (id) selectTool(id, false);
    } else if (e.key === 'Escape') {
      if (state.drawerOpen) closeDrawer();
      else if (state.paused) setPaused(false);
    } else if (e.key === ' ') {
      e.preventDefault();
      setPaused(!state.paused);
    } else if (e.key.toLowerCase() === 'r') {
      resetScene();
    } else if (e.key.toLowerCase() === 'm') {
      toggleMute();
    }
  });

  // ---------------------------------------------------------------- thumbnails
  function drawItemThumb(cv, item) {
    if (!item) return;
    const c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    c.save();
    c.translate(cv.width / 2, cv.height / 2 + 2);
    const s = cv.width / 96;
    c.scale(s, s);
    drawThumbArt(c, item);
    c.restore();
  }

  function thumbFor(item) {
    if (thumbCache.has(item.id)) return thumbCache.get(item.id);
    const cv = document.createElement('canvas');
    cv.width = 128;
    cv.height = 128;
    drawItemThumb(cv, item);
    thumbCache.set(item.id, cv);
    return cv;
  }

  // ---------------------------------------------------------------- physics
  const engine = Engine.create({
    enableSleeping: false,
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 6
  });
  engine.gravity.y = 1.08;
  const world = engine.world;

  const ground = Bodies.rectangle(WORLD.w / 2, WORLD.groundY + 90, WORLD.w, 180, {
    isStatic: true, friction: 0.95, restitution: 0.02, label: 'ground'
  });
  ground.plugin = { type: 'ground' };
  const leftWall = Bodies.rectangle(-35, WORLD.h / 2, 70, WORLD.h * 2, { isStatic: true, label: 'wall' });
  leftWall.plugin = { type: 'wall' };
  const rightWall = Bodies.rectangle(WORLD.w + 35, WORLD.h / 2, 70, WORLD.h * 2, { isStatic: true, label: 'wall' });
  rightWall.plugin = { type: 'wall' };
  Composite.add(world, [ground, leftWall, rightWall]);

  // ---------------------------------------------------------------- helpers
  function bodyAt(point) {
    const found = Query.point(Composite.allBodies(world), point);
    for (let i = found.length - 1; i >= 0; i--) {
      const b = found[i];
      if (b.isStatic && b.plugin?.type !== 'prop') continue;
      if (b.plugin?.type === 'ground' || b.plugin?.type === 'wall') continue;
      return b;
    }
    let best = null;
    let bestD = 46;
    for (const b of Composite.allBodies(world)) {
      if (b.isStatic) continue;
      const d = Vector.magnitude(Vector.sub(b.position, point)) - (b.circleRadius || 24);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  function addBlood(x, y, count = 10, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(60, 260) * power;
      particles.push({
        type: 'blood',
        x, y,
        vx: Math.cos(a) * sp + rand(-30, 30),
        vy: Math.sin(a) * sp - rand(40, 180),
        size: rand(2, 6) * (0.8 + power * 0.25),
        life: rand(0.5, 1.1),
        maxLife: 1.1,
        color: Math.random() > 0.5 ? '#a81818' : '#7c0e0e',
        gravity: 1250,
        rot: rand(0, 6)
      });
    }
  }

  function addSparks(x, y, count = 5, color = '#ffd36a') {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(100, 380);
      particles.push({
        type: 'spark',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: rand(1.5, 3.5),
        life: rand(0.12, 0.35),
        maxLife: 0.35,
        color,
        gravity: 700
      });
    }
  }

  function addSmoke(x, y, count = 8, power = 1, color = 'rgba(62,62,62,') {
    for (let i = 0; i < count; i++) {
      particles.push({
        type: 'smoke',
        x: x + rand(-18, 18),
        y: y + rand(-18, 18),
        vx: rand(-90, 90) * power,
        vy: rand(-160, -40) * power,
        size: rand(10, 28) * power,
        life: rand(0.6, 1.5),
        maxLife: 1.5,
        color,
        gravity: -30
      });
    }
  }

  function addFire(x, y, count = 5, power = 1) {
    for (let i = 0; i < count; i++) {
      particles.push({
        type: 'fire',
        x: x + rand(-8, 8),
        y: y + rand(-8, 8),
        vx: rand(-60, 60) * power,
        vy: rand(-180, -40) * power,
        size: rand(6, 18) * power,
        life: rand(0.2, 0.55),
        maxLife: 0.55,
        color: Math.random() > 0.45 ? '#ffb21f' : '#ff5b18',
        gravity: -60
      });
    }
  }

  function addDebris(x, y, count = 8, color = '#a06b35') {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(100, 400);
      particles.push({
        type: 'debris',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(30, 160),
        size: rand(3, 9),
        life: rand(0.6, 1.3),
        maxLife: 1.3,
        color,
        gravity: 1100,
        rot: rand(0, 6),
        vr: rand(-12, 12)
      });
    }
  }

  function addDecal(x, y, type = 'blood', size = 1) {
    if (decals.length > 130) decals.shift();
    decals.push({
      x, y,
      type,
      r: rand(9, 30) * size,
      alpha: type === 'scorch' ? 0.55 : rand(0.35, 0.7),
      seed: rand(0, 100),
      drips: type === 'blood' ? Array.from({ length: 2 + ((Math.random() * 3) | 0) }, () => ({
        dx: rand(-12, 12), h: rand(8, 38), w: rand(1, 3)
      })) : []
    });
  }

  function addEffect(effect) {
    effect.life = effect.life ?? 0.4;
    effect.maxLife = effect.maxLife ?? effect.life;
    effects.push(effect);
  }

  function applyImpulse(body, x, y, power, upward = 0) {
    Body.setVelocity(body, {
      x: body.velocity.x + x * power,
      y: body.velocity.y + y * power - upward
    });
    Body.setAngularVelocity(body, body.angularVelocity + rand(-0.12, 0.12) * power);
  }

  function removeBody(body) {
    Composite.remove(world, body);
  }

  function removeRagdoll(r) {
    for (const c of r.constraints) Composite.remove(world, c);
    Object.values(r.parts).forEach(b => Composite.remove(world, b));
    const i = ragdolls.indexOf(r);
    if (i >= 0) ragdolls.splice(i, 1);
    updateVictimCount();
  }

  function removeProp(body) {
    Composite.remove(world, body);
    const i = props.indexOf(body);
    if (i >= 0) props.splice(i, 1);
  }

  function removeProjectile(p) {
    if (p.removed) return;
    p.removed = true;
    Composite.remove(world, p.body);
    const i = projectiles.indexOf(p);
    if (i >= 0) projectiles.splice(i, 1);
  }

  // ---------------------------------------------------------------- ragdolls
  const PART_DIMS = {
    torso: { w: 54, h: 104 },
    head: { w: 72, h: 66 },
    armL1: { w: 20, h: 44 },
    armL2: { w: 19, h: 40 },
    armR1: { w: 20, h: 44 },
    armR2: { w: 19, h: 40 },
    legL1: { w: 21, h: 46 },
    legL2: { w: 20, h: 44 },
    legR1: { w: 21, h: 46 },
    legR2: { w: 20, h: 44 }
  };

  function createRagdoll(x, feetY, palKey, opts = {}) {
    const pal = PALETTES[palKey] || PALETTES.green;
    const r = {
      id: ++ragdollSerial,
      palKey,
      pal,
      parts: {},
      constraints: [],
      health: 100,
      dead: false,
      standing: opts.standing !== false,
      homeX: x,
      feetY,
      weapon: opts.weapon || null,
      weaponFlash: 0,
      weaponTimer: 0,
      hitFlash: 0,
      showHealth: 0,
      blinkAt: rand(1, 5),
      blink: 0,
      seed: rand(0, 100),
      frozenUntil: 0,
      spikeCooldown: 0,
      severed: new Set()
    };

    const torsoY = feetY - 142;
    const shoulderY = torsoY - 36;
    const hipY = torsoY + 52;
    const D = PART_DIMS;
    const bodyOpts = {
      friction: 0.75,
      frictionAir: 0.012,
      restitution: 0.04,
      density: 0.0022,
      slop: 0.02,
      collisionFilter: { category: 0x0002, mask: 0xffffffff }
    };

    const torso = Bodies.rectangle(x, torsoY, D.torso.w, D.torso.h, bodyOpts);
    const head = Bodies.rectangle(x, torsoY - 85, D.head.w, D.head.h, { ...bodyOpts, density: 0.003 });
    const armL1 = Bodies.rectangle(x - 35, shoulderY + 22, D.armL1.w, D.armL1.h, bodyOpts);
    const armL2 = Bodies.rectangle(x - 35, shoulderY + 64, D.armL2.w, D.armL2.h, bodyOpts);
    const armR1 = Bodies.rectangle(x + 35, shoulderY + 22, D.armR1.w, D.armR1.h, bodyOpts);
    const armR2 = Bodies.rectangle(x + 35, shoulderY + 64, D.armR2.w, D.armR2.h, bodyOpts);
    const legL1 = Bodies.rectangle(x - 13, hipY + 23, D.legL1.w, D.legL1.h, bodyOpts);
    const legL2 = Bodies.rectangle(x - 13, hipY + 68, D.legL2.w, D.legL2.h, bodyOpts);
    const legR1 = Bodies.rectangle(x + 13, hipY + 23, D.legR1.w, D.legR1.h, bodyOpts);
    const legR2 = Bodies.rectangle(x + 13, hipY + 68, D.legR2.w, D.legR2.h, bodyOpts);

    r.parts = { torso, head, armL1, armL2, armR1, armR2, legL1, legL2, legR1, legR2 };
    Object.entries(r.parts).forEach(([name, body]) => {
      const d = PART_DIMS[name];
      body.plugin = { type: 'part', ragdoll: r, partName: name, w: d.w, h: d.h };
    });

    const addJoint = (a, b, pa, pb, stiffness = 0.92) => {
      const c = Constraint.create({
        bodyA: a, pointA: pa,
        bodyB: b, pointB: pb,
        length: 0, stiffness, damping: 0.12,
        render: { visible: false }
      });
      c.plugin = { ragdoll: r, partA: a.plugin.partName, partB: b.plugin.partName };
      Composite.add(world, c);
      r.constraints.push(c);
      return c;
    };

    addJoint(torso, head, { x: 0, y: -52 }, { x: 0, y: 33 }, 0.95);
    addJoint(torso, armL1, { x: -27, y: -36 }, { x: 0, y: -22 });
    addJoint(armL1, armL2, { x: 0, y: 22 }, { x: 0, y: -20 });
    addJoint(torso, armR1, { x: 27, y: -36 }, { x: 0, y: -22 });
    addJoint(armR1, armR2, { x: 0, y: 22 }, { x: 0, y: -20 });
    addJoint(torso, legL1, { x: -13, y: 52 }, { x: 0, y: -23 }, 0.95);
    addJoint(legL1, legL2, { x: 0, y: 23 }, { x: 0, y: -22 }, 0.95);
    addJoint(torso, legR1, { x: 13, y: 52 }, { x: 0, y: -23 }, 0.95);
    addJoint(legR1, legR2, { x: 0, y: 23 }, { x: 0, y: -22 }, 0.95);

    Composite.add(world, Object.values(r.parts));
    ragdolls.push(r);

    while (ragdolls.length > 9) removeRagdoll(ragdolls[0]);
    updateVictimCount();
    return r;
  }

  function stabilizeRagdoll(r) {
    if (!r.standing || r.dead || sceneTime < r.frozenUntil) return;
    const torso = r.parts.torso;
    const target = 0;
    Body.setAngularVelocity(torso, torso.angularVelocity * 0.8 + normAngle(target - torso.angle) * 0.09);
    const targets = [
      ['head', 0.02], ['armL1', 0.02], ['armL2', 0.04],
      ['armR1', -0.02], ['armR2', -0.04], ['legL1', 0.01],
      ['legL2', 0.01], ['legR1', -0.01], ['legR2', -0.01]
    ];
    for (const [name, bias] of targets) {
      if (r.severed.has(name)) continue;
      const b = r.parts[name];
      if (!b) continue;
      const diff = normAngle(torso.angle + bias - b.angle);
      Body.setAngularVelocity(b, b.angularVelocity * 0.76 + diff * 0.085);
    }
    // gentle centre spring, enough to keep a standing pose but not enough to fight a real hit
    const dx = r.homeX - torso.position.x;
    if (Math.abs(dx) > 2) {
      Body.setVelocity(torso, { x: torso.velocity.x * 0.93 + dx * 0.0009, y: torso.velocity.y });
    }
  }

  function isPartAttached(r, name) {
    return r.constraints.some(c => c.plugin && (c.plugin.partA === name || c.plugin.partB === name));
  }

  function detachPart(r, name, impulse = 0) {
    if (!r.parts[name] || r.severed.has(name)) return;
    const parentJoint = {
      head: c => c.plugin.partB === 'head',
      armL1: c => c.plugin.partA === 'armL1' && c.plugin.partB === 'torso',
      armL2: c => c.plugin.partA === 'armL1' && c.plugin.partB === 'armL2',
      armR1: c => c.plugin.partA === 'armR1' && c.plugin.partB === 'torso',
      armR2: c => c.plugin.partA === 'armR1' && c.plugin.partB === 'armR2',
      legL1: c => c.plugin.partA === 'legL1' && c.plugin.partB === 'torso',
      legL2: c => c.plugin.partA === 'legL1' && c.plugin.partB === 'legL2',
      legR1: c => c.plugin.partA === 'legR1' && c.plugin.partB === 'torso',
      legR2: c => c.plugin.partA === 'legR1' && c.plugin.partB === 'legR2'
    }[name];
    if (!parentJoint) return;
    const idx = r.constraints.findIndex(parentJoint);
    if (idx < 0) return;
    Composite.remove(world, r.constraints[idx]);
    r.constraints.splice(idx, 1);
    r.severed.add(name);
    r.standing = false;
    const b = r.parts[name];
    addBlood(b.position.x, b.position.y, 16, 1.3);
    if (impulse) {
      Body.setVelocity(b, {
        x: b.velocity.x + rand(-1, 1) * impulse,
        y: b.velocity.y - rand(1, 2) * impulse
      });
      Body.setAngularVelocity(b, b.angularVelocity + rand(-0.35, 0.35));
    }
    if (name === 'head') {
      r.dead = true;
      r.health = 0;
      addBlood(b.position.x, b.position.y, 30, 1.6);
    }
  }

  function damageRagdoll(r, amount, point, opts = {}) {
    if (!r) return;
    r.standing = false;
    r.hitFlash = 0.22;
    r.showHealth = 2.2;
    r.health -= amount;
    if (point) addBlood(point.x, point.y, opts.blood ?? 9, opts.power ?? 1);
    if (r.health <= 0 && !r.dead) {
      r.dead = true;
      r.health = 0;
      r.weapon = null;
      addBlood(r.parts.torso.position.x, r.parts.torso.position.y - 30, 26, 1.4);
    }
    if (opts.detach && Math.random() < opts.detachChance) {
      const choices = ['armL2', 'armR2', 'legL2', 'legR2', 'armL1', 'legL1'];
      detachPart(r, pick(choices), opts.impulse ?? 3);
    }
  }

  // ---------------------------------------------------------------- props
  function spawnProp(kind, x, y, opts = {}) {
    const isStatic = kind === 'spikes' || kind === 'trampoline';
    let w = 80, h = 80, density = 0.003, friction = 0.65, restitution = 0.08;
    if (kind === 'barrel') { w = 58; h = 80; density = 0.0025; }
    if (kind === 'wall') { w = 38; h = 168; density = 0.007; }
    if (kind === 'platform') { w = 220; h = 26; density = 0.005; }
    if (kind === 'spikes') { w = 150; h = 26; }
    if (kind === 'trampoline') { w = 150; h = 22; restitution = 1.35; friction = 0.9; }
    const cy = clamp(y, 60 + h / 2, WORLD.groundY - h / 2);
    const body = Bodies.rectangle(clamp(x, 80, WORLD.w - 80), cy, w, h, {
      isStatic,
      density,
      friction,
      frictionAir: 0.012,
      restitution,
      slop: 0.02,
      collisionFilter: { category: 0x0004, mask: 0xffffffff }
    });
    body.plugin = {
      type: 'prop',
      kind,
      w, h,
      hp: kind === 'barrel' ? 45 : kind === 'crate' ? 85 : kind === 'wall' ? 220 : 999,
      explosive: kind === 'barrel',
      exploded: false,
      seed: rand(0, 100)
    };
    Composite.add(world, body);
    props.push(body);
    if (!opts.silent) {
      addSmoke(body.position.x, body.position.y, 4, 0.55, 'rgba(130,128,116,');
      playSfx('spawn');
    }
    return body;
  }

  function damageProp(body, amount, point) {
    if (!body || !body.plugin || body.plugin.type !== 'prop') return;
    const p = body.plugin;
    if (p.kind === 'spikes' || p.kind === 'trampoline') return;
    p.hp -= amount;
    if (point) addDebris(point.x, point.y, 3, p.kind === 'barrel' ? '#b9362e' : '#9b6a38');
    if (p.explosive && p.hp <= 0 && !p.exploded) {
      p.exploded = true;
      const pos = { ...body.position };
      removeProp(body);
      explode(pos.x, pos.y, 175, 23, 85);
    } else if (p.hp <= 0) {
      const pos = { ...body.position };
      if (p.kind === 'crate') addDebris(pos.x, pos.y, 14, '#9b6a38');
      if (p.kind === 'wall') addDebris(pos.x, pos.y, 20, '#8b8b85');
      addSmoke(pos.x, pos.y, 8, 1, 'rgba(120,116,104,');
      removeProp(body);
    }
  }

  // ---------------------------------------------------------------- projectiles
  function spawnBullet(from, target, opts = {}) {
    const dir = Vector.normalise(Vector.sub(target, from));
    const speed = opts.speed || 24;
    const body = Bodies.circle(from.x, from.y, 3.2, {
      isSensor: true,
      frictionAir: 0,
      density: 0.02,
      collisionFilter: { category: 0x0008, mask: 0xffffffff }
    });
    body.plugin = {
      type: 'bullet',
      damage: opts.damage || 34,
      shooter: opts.shooter || null,
      age: 0
    };
    Body.setVelocity(body, { x: dir.x * speed, y: dir.y * speed });
    Composite.add(world, body);
    const p = { body, kind: 'bullet', life: 1.4, trail: [] };
    projectiles.push(p);
    addEffect({ type: 'muzzle', x: from.x, y: from.y, angle: Math.atan2(dir.y, dir.x), life: 0.09 });
    addSparks(from.x, from.y, 2, '#ffe6a0');
    return p;
  }

  function spawnRocket(from, target, shooter) {
    const dir = Vector.normalise(Vector.sub(target, from));
    const body = Bodies.circle(from.x, from.y, 7, {
      isSensor: true,
      frictionAir: 0,
      density: 0.02,
      collisionFilter: { category: 0x0008, mask: 0xffffffff }
    });
    body.plugin = { type: 'rocket', shooter: shooter || null, age: 0 };
    Body.setVelocity(body, { x: dir.x * 17, y: dir.y * 17 });
    Composite.add(world, body);
    const p = { body, kind: 'rocket', life: 3, trail: [], dir };
    projectiles.push(p);
    playSfx('shotgun');
    addEffect({ type: 'muzzle', x: from.x, y: from.y, angle: Math.atan2(dir.y, dir.x), life: 0.14, big: true });
    addSmoke(from.x, from.y, 5, 0.8);
    return p;
  }

  function spawnGrenade(from, target, shooter) {
    const body = Bodies.circle(from.x, from.y, 12, {
      density: 0.004,
      friction: 0.6,
      frictionAir: 0.008,
      restitution: 0.35,
      collisionFilter: { category: 0x0008, mask: 0xffffffff }
    });
    body.plugin = { type: 'grenade', shooter: shooter || null, fuse: 1.55, age: 0 };
    const dir = Vector.normalise(Vector.sub(target, from));
    const dist = Vector.magnitude(Vector.sub(target, from));
    const power = clamp(dist / 28, 7, 15);
    Body.setVelocity(body, { x: dir.x * power, y: dir.y * power - 4.5 });
    Body.setAngularVelocity(body, rand(-0.25, 0.25));
    Composite.add(world, body);
    projectiles.push({ body, kind: 'grenade', life: 2.2, trail: [] });
    playSfx('click');
    return body;
  }

  function spawnBomb(x, y) {
    const body = Bodies.circle(clamp(x, 50, WORLD.w - 50), clamp(y, 40, WORLD.groundY - 18), 17, {
      density: 0.006,
      friction: 0.7,
      frictionAir: 0.01,
      restitution: 0.25,
      collisionFilter: { category: 0x0008, mask: 0xffffffff }
    });
    body.plugin = { type: 'bomb', fuse: 2.1, age: 0 };
    Composite.add(world, body);
    projectiles.push({ body, kind: 'bomb', life: 2.6, trail: [] });
    playSfx('spawn');
    return body;
  }

  function spawnMeteor(x) {
    const body = Bodies.circle(clamp(x, 80, WORLD.w - 80), -80, 30, {
      density: 0.02,
      frictionAir: 0,
      restitution: 0.05,
      collisionFilter: { category: 0x0008, mask: 0xffffffff }
    });
    body.plugin = { type: 'meteor', age: 0 };
    Body.setVelocity(body, { x: rand(-2.5, 2.5), y: 17 });
    Body.setAngularVelocity(body, rand(-0.15, 0.15));
    Composite.add(world, body);
    projectiles.push({ body, kind: 'meteor', life: 3, trail: [] });
    playSfx('thunder');
  }

  // ---------------------------------------------------------------- explosions
  function explode(x, y, radius = 150, power = 20, damage = 70) {
    shake = Math.max(shake, clamp(radius / 9, 7, 24));
    flash = Math.max(flash, clamp(radius / 340, 0.14, 0.48));
    flashColor = '255,180,80';
    playSfx(radius > 300 ? 'boom' : 'explosion');
    addEffect({ type: 'ring', x, y, r0: 10, r1: radius * 1.35, life: 0.55, color: '255,220,150', width: 7 });
    addEffect({ type: 'ring', x, y, r0: 4, r1: radius * 0.75, life: 0.3, color: '255,255,230', width: 14 });
    addSmoke(x, y, Math.round(radius / 16), clamp(radius / 150, 0.7, 1.8));
    addFire(x, y, Math.round(radius / 9), clamp(radius / 130, 0.7, 1.7));
    addSparks(x, y, Math.round(radius / 9), '#ffd36a');
    addDebris(x, y, Math.round(radius / 18), '#56524a');
    addDecal(x, Math.max(WORLD.groundY - 3, y), 'scorch', clamp(radius / 110, 0.6, 2));

    const affected = new Set();
    const bodies = Composite.allBodies(world);
    for (const body of bodies) {
      if (!body || body.isStatic) continue;
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const d = Math.hypot(dx, dy);
      if (d > radius || d < 0.001) continue;
      const f = 1 - d / radius;
      const nx = dx / d;
      const ny = dy / d;
      const mass = body.mass || 1;
      Body.setVelocity(body, {
        x: body.velocity.x + nx * power * f * (0.5 + Math.min(1.4, mass)),
        y: body.velocity.y + ny * power * f * (0.5 + Math.min(1.4, mass)) - 4 * f
      });
      Body.setAngularVelocity(body, body.angularVelocity + rand(-0.18, 0.18) * f);
      if (body.plugin?.type === 'part') affected.add(body.plugin.ragdoll);
      if (body.plugin?.type === 'prop') {
        if (body.plugin.explosive && !body.plugin.exploded) {
          body.plugin.hp -= 70;
          if (body.plugin.hp <= 0) {
            body.plugin.exploded = true;
            const pos = { ...body.position };
            removeProp(body);
            setTimeout(() => explode(pos.x, pos.y, 150, 18, 65), 90);
          }
        } else {
          damageProp(body, damage * 2.2 * f, body.position);
        }
      }
    }
    for (const r of [...affected]) {
      const d = Math.hypot(r.parts.torso.position.x - x, r.parts.torso.position.y - y);
      const f = 1 - clamp(d / radius, 0, 1);
      damageRagdoll(r, damage * f, { x: r.parts.torso.position.x, y: r.parts.torso.position.y }, {
        blood: Math.round(12 + f * 20),
        power: 1 + f,
        detach: f > 0.28,
        detachChance: f * 0.95,
        impulse: 2 + f * 4
      });
      if (f > 0.72) detachPart(r, 'head', 4 + f * 4);
    }
    // bullets and loose small things get cleared
    for (const p of [...projectiles]) {
      if (p.kind === 'bullet' && Math.hypot(p.body.position.x - x, p.body.position.y - y) < radius * 0.8) removeProjectile(p);
    }
  }

  // ---------------------------------------------------------------- main scene
  function addInitialProps() {
    const crate1 = spawnProp('crate', 1215, WORLD.groundY - 42, { silent: true });
    const crate2 = spawnProp('crate', 1215, WORLD.groundY - 128, { silent: true });
    const crate3 = spawnProp('crate', 1300, WORLD.groundY - 42, { silent: true });
    const barrel = spawnProp('barrel', 1395, WORLD.groundY - 42, { silent: true });
    const wall = spawnProp('wall', 1510, WORLD.groundY - 86, { silent: true });
    [crate1, crate2, crate3, barrel, wall].forEach(b => {
      if (!b) return;
      Body.setStatic(b, true);
      b.plugin.initialStatic = true;
    });
  }

  function createInitialScene() {
    clearEverything(true);
    const roster = [
      { x: 540, pal: 'green', weapon: 'sword' },
      { x: 665, pal: 'red', weapon: 'pistol' },
      { x: 790, pal: 'yellow', weapon: null },
      { x: 915, pal: 'orange', weapon: null },
      { x: 1040, pal: 'pumpkin', weapon: null }
    ];
    roster.forEach((entry, i) => {
      const r = createRagdoll(entry.x, WORLD.groundY, entry.pal, { weapon: entry.weapon });
      r.standing = true;
      r.isIntro = true;
      r.aimAngle = entry.weapon === 'sword' ? -0.72 : entry.weapon === 'pistol' ? 0.28 : 0;
      if (i === 3) {
        // a little variety in the opening tableau
        Body.setAngle(r.parts.head, 0.09);
      }
    });
    addInitialProps();
    for (let i = 0; i < 6; i++) {
      addDecal(rand(430, 1150), rand(WORLD.groundY + 10, WORLD.groundY + 120), 'blood', rand(0.4, 1.1));
    }
    addDecal(1120, WORLD.groundY + 18, 'scorch', 1.5);
    history.length = 0;
    camera.x = 800;
    camera.y = 450;
    camera.zoom = W <= 960 ? 1.08 : 1;
    clampCamera();
    updateVictimCount();
    updateSelectionUI();
  }

  function resetScene() {
    createInitialScene();
    showToast('SCENE RESET');
  }

  function clearEverything(silent = false) {
    for (const r of [...ragdolls]) removeRagdoll(r);
    for (const b of [...props]) removeProp(b);
    for (const p of [...projectiles]) removeProjectile(p);
    for (const c of [...effects]) c.life = 0;
    for (const d of [...decals]) d.alpha = 0;
    ragdolls.length = 0;
    props.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    effects.length = 0;
    decals.length = 0;
    history.length = 0;
    if (dragConstraint) { Composite.remove(world, dragConstraint); dragConstraint = null; dragBody = null; }
    engine.gravity.y = 1.08;
    gravityUntil = 0;
    updateVictimCount();
    if (!silent) showToast('EVERYTHING CLEARED');
  }

  // ---------------------------------------------------------------- undo
  function rememberSpawn(entry) {
    history.push(entry);
    if (history.length > 40) history.shift();
  }

  function undo() {
    while (history.length) {
      const entry = history.pop();
      if (entry.kind === 'ragdoll') {
        if (ragdolls.includes(entry.ref)) { removeRagdoll(entry.ref); playSfx('undo'); showToast('UNDONE'); return; }
      } else if (entry.kind === 'prop') {
        if (props.includes(entry.ref)) { removeProp(entry.ref); playSfx('undo'); showToast('UNDONE'); return; }
      }
    }
    showToast('NOTHING TO UNDO');
  }

  // ---------------------------------------------------------------- boot (continued below)

  // ---------------------------------------------------------------- tool actions
  function nearestRagdoll(point, maxDist = Infinity, aliveOnly = true, exclude = null) {
    let best = null;
    let bestD = maxDist;
    for (const r of ragdolls) {
      if (r === exclude) continue;
      if (aliveOnly && r.dead) continue;
      const p = r.parts.torso.position;
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d < bestD) { bestD = d; best = r; }
    }
    return best;
  }

  function ragdollAtPoint(point) {
    const b = bodyAt(point);
    return b?.plugin?.ragdoll || null;
  }

  function handPoint(r) {
    const b = r.parts.armR2 || r.parts.torso;
    const local = { x: 0, y: (b.plugin?.h || 50) / 2 + 2 };
    const rotated = Vector.rotate(local, b.angle);
    return { x: b.position.x + rotated.x, y: b.position.y + rotated.y };
  }

  function aimFrom(r, target) {
    const from = handPoint(r);
    const dir = Vector.normalise(Vector.sub(target, from));
    return { from: { x: from.x + dir.x * 24, y: from.y + dir.y * 24 }, dir };
  }

  function useTool(point, event) {
    const item = getItem(state.tool);
    if (!item) return;
    if (item.cat === 'living') {
      const x = clamp(point.x, 80, WORLD.w - 80);
      const feet = point.y < WORLD.groundY - 90 ? clamp(point.y, 330, WORLD.groundY) : WORLD.groundY;
      const r = createRagdoll(x, feet, item.pal, { standing: feet >= WORLD.groundY - 10 });
      if (feet >= WORLD.groundY - 10) {
        Body.setVelocity(r.parts.torso, { x: rand(-0.5, 0.5), y: 0 });
      }
      rememberSpawn({ kind: 'ragdoll', ref: r });
      addSmoke(x, WORLD.groundY - 4, 5, 0.5, 'rgba(150,150,140,');
      playSfx('spawn');
      showToast(item.name + ' DEPLOYED');
    } else if (item.cat === 'build') {
      const b = spawnProp(item.kind, point.x, point.y);
      rememberSpawn({ kind: 'prop', ref: b });
      showToast(item.name + ' PLACED');
    } else if (item.cat === 'weapons') {
      useWeapon(item, point);
    } else if (item.cat === 'fun') {
      useFun(item, point);
    }
  }

  function setShooterWeapon(r, kind, angle) {
    if (!r) return;
    r.weapon = kind;
    r.weaponFlash = 0.14;
    r.weaponTimer = 3;
    if (angle !== undefined) r.aimAngle = angle;
  }

  function useWeapon(item, point) {
    const targetR = ragdollAtPoint(point);
    let shooter = nearestRagdoll(point, 1100, false, targetR);
    if (!shooter && targetR) shooter = nearestRagdoll(point, 1400, false, null) === targetR ? null : nearestRagdoll(point, 1400, false, null);
    const kind = item.kind;
    if (kind === 'pistol') {
      let from, dir, p;
      if (shooter) {
        const aim = aimFrom(shooter, point);
        from = aim.from;
        dir = aim.dir;
        setShooterWeapon(shooter, 'pistol', Math.atan2(dir.y, dir.x));
        p = spawnBullet(from, point, { shooter, damage: 38, speed: 25 });
        Body.applyForce(shooter.parts.torso, shooter.parts.torso.position, {
          x: -dir.x * 0.012 * shooter.parts.torso.mass,
          y: -dir.y * 0.012 * shooter.parts.torso.mass
        });
      } else {
        from = { x: clamp(point.x - 220, 30, WORLD.w - 30), y: point.y - 40 };
        dir = Vector.normalise(Vector.sub(point, from));
        p = spawnBullet(from, point, { damage: 38, speed: 25 });
        addEffect({ type: 'ghostGun', x: from.x, y: from.y, angle: Math.atan2(dir.y, dir.x), life: 0.22 });
      }
      playSfx('shoot');
      addSmoke(from.x, from.y, 2, 0.35);
    } else if (kind === 'sword' || kind === 'katana' || kind === 'axe') {
      const reach = kind === 'katana' ? 150 : kind === 'axe' ? 105 : 125;
      const dmg = kind === 'axe' ? 62 : kind === 'katana' ? 48 : 42;
      let origin = point;
      if (shooter) {
        origin = handPoint(shooter);
        const d = Vector.sub(point, origin);
        const mag = Vector.magnitude(d) || 1;
        const push = Math.min(mag, reach * 0.8);
        point = { x: origin.x + d.x / mag * push, y: origin.y + d.y / mag * push };
        setShooterWeapon(shooter, kind, Math.atan2(d.y, d.x));
        Body.setVelocity(shooter.parts.torso, {
          x: shooter.parts.torso.velocity.x + (point.x - origin.x) * 0.012,
          y: shooter.parts.torso.velocity.y - 1.2
        });
      }
      const angle = Math.atan2(point.y - origin.y, point.x - origin.x);
      addEffect({ type: 'slash', x: origin.x, y: origin.y, angle, reach, life: 0.2, heavy: kind === 'axe' });
      playSfx('slash');
      shake = Math.max(shake, kind === 'axe' ? 4 : 2);
      for (const r of [...ragdolls]) {
        const dx = r.parts.torso.position.x - point.x;
        const dy = r.parts.torso.position.y - point.y;
        if (Math.hypot(dx, dy) < reach * 0.95) {
          damageRagdoll(r, dmg, { x: point.x, y: point.y }, {
            blood: 18, power: 1.3,
            detach: true, detachChance: kind === 'axe' ? 0.8 : 0.55,
            impulse: kind === 'axe' ? 5 : 3
          });
          const nx = dx / (Math.hypot(dx, dy) || 1);
          const ny = dy / (Math.hypot(dx, dy) || 1);
          Body.setVelocity(r.parts.torso, {
            x: r.parts.torso.velocity.x + nx * (kind === 'axe' ? 5 : 3),
            y: r.parts.torso.velocity.y + ny * (kind === 'axe' ? 5 : 3) - 1.5
          });
        }
      }
      for (const b of [...props]) {
        const d = Math.hypot(b.position.x - point.x, b.position.y - point.y);
        if (d < reach * 0.8) damageProp(b, dmg * 1.2, b.position);
      }
    } else if (kind === 'grenade') {
      let from;
      if (shooter) {
        setShooterWeapon(shooter, 'grenade', Math.atan2(point.y - handPoint(shooter).y, point.x - handPoint(shooter).x));
        from = handPoint(shooter);
      } else {
        from = { x: clamp(point.x - 120, 40, WORLD.w - 40), y: clamp(point.y - 180, 60, WORLD.groundY - 80) };
      }
      spawnGrenade(from, point, shooter);
      showToast('GRENADE OUT');
    } else if (kind === 'rocket') {
      let from;
      if (shooter) {
        const aim = aimFrom(shooter, point);
        from = aim.from;
        setShooterWeapon(shooter, 'rocket', Math.atan2(aim.dir.y, aim.dir.x));
      } else {
        from = { x: clamp(point.x - 260, 20, WORLD.w - 20), y: clamp(point.y - 50, 40, WORLD.groundY - 60) };
      }
      spawnRocket(from, point, shooter);
      showToast('ROCKET AWAY');
    } else if (kind === 'minigun') {
      if (state.hold) return;
      if (shooter) setShooterWeapon(shooter, 'minigun');
      state.hold = { kind: 'minigun', shooter, point: { ...point }, cooldown: 0 };
      fireAutoWeapon(point);
    } else if (kind === 'flame') {
      if (state.hold) return;
      if (shooter) setShooterWeapon(shooter, 'flame');
      state.hold = { kind: 'flame', shooter, point: { ...point }, cooldown: 0 };
      fireAutoWeapon(point);
    }
  }

  function fireAutoWeapon(point) {
    if (!state.hold) return;
    const shooter = state.hold.shooter && !state.hold.shooter.dead ? state.hold.shooter : nearestRagdoll(point, 1100, false);
    if (state.hold.kind === 'minigun') {
      let from, dir;
      if (shooter) {
        const aim = aimFrom(shooter, point);
        from = aim.from;
        dir = aim.dir;
        shooter.aimAngle = Math.atan2(dir.y, dir.x);
      } else {
        from = { x: clamp(point.x - 220, 20, WORLD.w - 20), y: point.y - 35 };
        dir = Vector.normalise(Vector.sub(point, from));
      }
      const spread = { x: point.x + rand(-22, 22), y: point.y + rand(-22, 22) };
      spawnBullet(from, spread, { shooter, damage: 20, speed: 27 });
      addSparks(from.x, from.y, 1, '#ffe6a0');
      playSfx('shoot');
      shake = Math.max(shake, 1.4);
      if (shooter) {
        Body.applyForce(shooter.parts.torso, shooter.parts.torso.position, {
          x: -dir.x * 0.004 * shooter.parts.torso.mass,
          y: -dir.y * 0.004 * shooter.parts.torso.mass
        });
      }
    } else if (state.hold.kind === 'flame') {
      let from, dir;
      if (shooter) {
        const aim = aimFrom(shooter, point);
        from = aim.from;
        dir = aim.dir;
        shooter.aimAngle = Math.atan2(dir.y, dir.x);
      } else {
        from = { x: clamp(point.x - 120, 20, WORLD.w - 20), y: point.y - 10 };
        dir = Vector.normalise(Vector.sub(point, from));
      }
      const perp = { x: -dir.y, y: dir.x };
      for (let i = 0; i < 7; i++) {
        const spread = rand(-0.24, 0.24);
        const d2 = { x: dir.x * Math.cos(spread) - dir.y * Math.sin(spread), y: dir.x * Math.sin(spread) + dir.y * Math.cos(spread) };
        particles.push({
          type: 'fire', x: from.x + d2.x * 14, y: from.y + d2.y * 14,
          vx: d2.x * rand(420, 680) + perp.x * rand(-50, 50),
          vy: d2.y * rand(420, 680) + perp.y * rand(-50, 50) - 40,
          size: rand(7, 17), life: rand(0.25, 0.55), maxLife: 0.55,
          color: Math.random() > 0.45 ? '#ffc02b' : '#ff5b18', gravity: -80
        });
      }
      addSmoke(from.x, from.y, 2, 0.35, 'rgba(50,48,45,');
      for (const r of ragdolls) {
        const dx = r.parts.torso.position.x - from.x;
        const dy = r.parts.torso.position.y - from.y;
        if (Math.hypot(dx, dy) < 250) {
          const dot = (dx * dir.x + dy * dir.y) / (Math.hypot(dx, dy) || 1);
          if (dot > 0.55) damageRagdoll(r, 2.2, { x: r.parts.torso.position.x, y: r.parts.torso.position.y - 20 }, { blood: 2, power: 0.4 });
        }
      }
      playSfx('hit');
    }
  }

  function useFun(item, point) {
    const kind = item.kind;
    if (kind === 'blackhole') {
      addEffect({ type: 'blackhole', x: point.x, y: point.y, life: 3.2, radius: 310 });
      playSfx('thunder');
      showToast('EVENT HORIZON OPEN');
    } else if (kind === 'meteor') {
      spawnMeteor(point.x);
      showToast('IMPACT INBOUND');
    } else if (kind === 'lightning') {
      const points = [];
      let px = point.x + rand(-20, 20);
      points.push({ x: px, y: 0 });
      for (let y = 0; y < point.y; y += 42) {
        px += rand(-24, 24);
        points.push({ x: px, y });
      }
      points.push({ x: point.x, y: point.y });
      addEffect({ type: 'lightning', points, x: point.x, y: point.y, life: 0.3 });
      flash = Math.max(flash, 0.55);
      flashColor = '210,235,255';
      shake = Math.max(shake, 9);
      playSfx('thunder');
      explode(point.x, point.y, 110, 10, 50);
      showToast('LIGHTNING STRIKE');
    } else if (kind === 'freeze') {
      for (const r of ragdolls) {
        r.frozenUntil = sceneTime + 4.5;
        r.standing = false;
        for (const b of Object.values(r.parts)) {
          Body.setVelocity(b, { x: 0, y: 0 });
          Body.setAngularVelocity(b, 0);
        }
      }
      addEffect({ type: 'freeze', x: point.x, y: point.y, life: 0.8 });
      flash = Math.max(flash, 0.2);
      flashColor = '170,225,255';
      playSfx('freeze');
      showToast('SUBJECTS FROZEN');
    } else if (kind === 'gravity') {
      engine.gravity.y = -0.82;
      gravityUntil = sceneTime + 4.2;
      playSfx('freeze');
      showToast('GRAVITY INVERTED');
    } else if (kind === 'nuke') {
      explode(point.x, Math.min(point.y, WORLD.groundY - 20), 460, 42, 160);
      flash = 1;
      flashColor = '255,244,210';
      shake = 28;
      playSfx('boom');
      showToast('EXPERIMENT CONCLUDED');
    }
  }

  // ---------------------------------------------------------------- dragging
  function startDrag(point, body) {
    endDrag();
    if (body.isStatic) {
      if (body.plugin?.type === 'prop' && body.plugin.initialStatic) {
        Body.setStatic(body, false);
        body.plugin.initialStatic = false;
      } else return;
    }
    const local = Vector.rotate(Vector.sub(point, body.position), -body.angle);
    dragConstraint = Constraint.create({
      pointA: { x: point.x, y: point.y },
      bodyB: body,
      pointB: local,
      length: 0,
      stiffness: 0.16,
      damping: 0.16,
      render: { visible: false }
    });
    Composite.add(world, dragConstraint);
    dragBody = body;
    dragWorld = { x: point.x, y: point.y };
    if (body.plugin?.ragdoll) {
      body.plugin.ragdoll.standing = false;
    }
  }

  function moveDrag(point) {
    if (!dragConstraint) return;
    dragConstraint.pointA.x = point.x;
    dragConstraint.pointA.y = point.y;
    dragWorld = { x: point.x, y: point.y };
  }

  function endDrag() {
    if (dragConstraint) Composite.remove(world, dragConstraint);
    dragConstraint = null;
    dragBody = null;
    dragWorld = null;
  }

  // ---------------------------------------------------------------- pointer input
  function pointerWorld(e) {
    const rect = canvas.getBoundingClientRect();
    return screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  }

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    ensureAudio();
    canvas.setPointerCapture?.(e.pointerId);
    const p = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, p);
    const w = pointerWorld(e);
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.worldX = w.x;
    state.pointer.worldY = w.y;
    state.pointer.inside = true;
    state.pointer.down = true;

    if (pointers.size === 2) {
      endDrag();
      gesture = null;
      const arr = [...pointers.values()];
      pinch = {
        dist: Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y),
        zoom: camera.zoom
      };
      return;
    }
    if (pointers.size > 2) return;

    if (state.drawerOpen) {
      closeDrawer();
      return;
    }

    if (state.tool === 'hand') {
      const b = bodyAt(w);
      if (b) {
        startDrag(w, b);
        playSfx('hit');
      } else {
        gesture = { type: 'pan', sx: e.clientX, sy: e.clientY, camX: camera.x, camY: camera.y };
      }
    } else {
      useTool(w, e);
      const item = getItem(state.tool);
      if (item && item.auto) state.hold = { kind: item.kind, shooter: state.hold?.shooter, point: w, cooldown: 0 };
    }
  });

  canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) {
      const w = pointerWorld(e);
      state.pointer.x = e.clientX;
      state.pointer.y = e.clientY;
      state.pointer.worldX = w.x;
      state.pointer.worldY = w.y;
      state.pointer.inside = true;
      return;
    }
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const w = pointerWorld(e);
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.worldX = w.x;
    state.pointer.worldY = w.y;
    state.pointer.inside = true;

    if (pointers.size >= 2 && pinch) {
      const arr = [...pointers.values()];
      const dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      camera.zoom = clamp(pinch.zoom * (dist / Math.max(20, pinch.dist)), 0.72, 1.55);
      viewW = W / (scale * camera.zoom);
      viewH = H / (scale * camera.zoom);
      clampCamera();
      return;
    }

    if (dragConstraint) {
      moveDrag(w);
    } else if (gesture?.type === 'pan') {
      const s = scale * camera.zoom;
      camera.x = gesture.camX - (e.clientX - gesture.sx) / s;
      camera.y = gesture.camY - (e.clientY - gesture.sy) / s;
      clampCamera();
    } else if (state.hold) {
      state.hold.point = { x: w.x, y: w.y };
    }
  });

  function releasePointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      endDrag();
      gesture = null;
      state.pointer.down = false;
      state.hold = null;
    }
    try { canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('pointerleave', e => {
    if (pointers.size === 0) state.pointer.inside = false;
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    camera.zoom = clamp(camera.zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.72, 1.55);
    viewW = W / (scale * camera.zoom);
    viewH = H / (scale * camera.zoom);
    clampCamera();
  }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // ---------------------------------------------------------------- simulation
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        if (p.type === 'blood' && Math.random() < 0.35) {
          addDecal(p.x, Math.min(WORLD.groundY + rand(2, 30), p.y), 'blood', rand(0.25, 0.55));
        }
        particles.splice(i, 1);
        continue;
      }
      p.vy += (p.gravity || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rot !== undefined) p.rot += (p.vr || 0) * dt;
      if (p.type === 'blood' || p.type === 'debris') {
        if (p.y > WORLD.groundY - 2) {
          p.y = WORLD.groundY - 2;
          p.vy *= -0.18;
          p.vx *= 0.55;
          if (p.type === 'blood' && Math.random() < 0.25) {
            addDecal(p.x, WORLD.groundY + rand(2, 26), 'blood', 0.32);
          }
        }
      }
    }
    if (particles.length > 650) particles.splice(0, particles.length - 650);
  }

  function updateEffects(dt) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.life -= dt;
      if (e.type === 'blackhole' && e.life > 0) {
        const bodies = Composite.allBodies(world);
        for (const b of bodies) {
          if (!b || b.isStatic) continue;
          const dx = e.x - b.position.x;
          const dy = e.y - b.position.y;
          const d = Math.hypot(dx, dy);
          if (d < e.radius && d > 4) {
            const f = (1 - d / e.radius) * 0.85;
            b.velocity.x += (dx / d) * f * 0.9 - (dy / d) * f * 0.25;
            b.velocity.y += (dy / d) * f * 0.9 + (dx / d) * f * 0.25;
            b.angularVelocity += 0.004 * f;
          }
        }
        if (Math.random() < 0.35) {
          const a = rand(0, Math.PI * 2);
          const rr = rand(30, e.radius);
          particles.push({
            type: 'spark', x: e.x + Math.cos(a) * rr, y: e.y + Math.sin(a) * rr,
            vx: -Math.cos(a) * rand(80, 260), vy: -Math.sin(a) * rand(80, 260),
            size: rand(1, 2.4), life: rand(0.2, 0.5), maxLife: 0.5, color: '#b67cff', gravity: 0
          });
        }
      }
      if (e.life <= 0) effects.splice(i, 1);
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.removed) continue;
      p.life -= dt;
      const b = p.body;
      b.plugin.age = (b.plugin.age || 0) + dt;
      if (p.kind === 'bullet') {
        p.trail.push({ x: b.position.x, y: b.position.y });
        if (p.trail.length > 4) p.trail.shift();
        if (p.life <= 0 || b.position.x < -40 || b.position.x > WORLD.w + 40 || b.position.y < -80 || b.position.y > WORLD.groundY + 50) {
          removeProjectile(p);
        }
      } else if (p.kind === 'rocket') {
        if (Math.random() < 0.9) {
          particles.push({
            type: 'fire', x: b.position.x - b.velocity.x * 0.6 + rand(-4, 4), y: b.position.y - b.velocity.y * 0.6 + rand(-4, 4),
            vx: rand(-40, 40), vy: rand(-40, 40), size: rand(6, 13),
            life: rand(0.15, 0.4), maxLife: 0.4, color: Math.random() > 0.5 ? '#ffb21f' : '#ff5b18', gravity: -30
          });
          particles.push({
            type: 'smoke', x: b.position.x - b.velocity.x * 0.9, y: b.position.y - b.velocity.y * 0.9,
            vx: rand(-30, 30), vy: rand(-30, 30), size: rand(9, 18),
            life: rand(0.4, 0.9), maxLife: 0.9, color: 'rgba(70,68,64,', gravity: -20
          });
        }
        if (p.life <= 0 || b.position.y > WORLD.groundY + 100) {
          explode(b.position.x, Math.min(b.position.y, WORLD.groundY - 10), 170, 22, 80);
          removeProjectile(p);
        }
      } else if (p.kind === 'grenade') {
        b.plugin.fuse -= dt;
        if (Math.random() < 0.25) addSmoke(b.position.x, b.position.y - 12, 1, 0.3, 'rgba(110,110,105,');
        if (b.plugin.fuse <= 0) {
          const pos = { ...b.position };
          removeProjectile(p);
          explode(pos.x, pos.y, 175, 22, 82);
        }
        if (p.life <= 0) removeProjectile(p);
      } else if (p.kind === 'bomb') {
        b.plugin.fuse -= dt;
        if (b.plugin.fuse <= 0) {
          const pos = { ...b.position };
          removeProjectile(p);
          explode(pos.x, pos.y, 210, 28, 100);
        }
        if (p.life <= 0) removeProjectile(p);
      } else if (p.kind === 'meteor') {
        if (Math.random() < 0.95) {
          particles.push({
            type: 'fire', x: b.position.x + rand(-16, 16), y: b.position.y + rand(-16, 16),
            vx: rand(-40, 40), vy: rand(-90, 10), size: rand(9, 20),
            life: rand(0.2, 0.5), maxLife: 0.5, color: Math.random() > 0.4 ? '#ff9d1e' : '#ff4b12', gravity: -40
          });
          particles.push({
            type: 'smoke', x: b.position.x + rand(-14, 14), y: b.position.y - 18,
            vx: rand(-30, 30), vy: rand(-60, -10), size: rand(12, 24),
            life: rand(0.5, 1.1), maxLife: 1.1, color: 'rgba(58,56,53,', gravity: -20
          });
        }
        if (p.life <= 0) removeProjectile(p);
      }
    }
  }

  function updateRagdolls(dt) {
    for (const r of ragdolls) {
      r.hitFlash = Math.max(0, r.hitFlash - dt);
      r.showHealth = Math.max(0, r.showHealth - dt);
      r.weaponFlash = Math.max(0, r.weaponFlash - dt);
      r.weaponTimer = Math.max(0, r.weaponTimer - dt);
      if (r.weaponTimer <= 0 && !r.dead) {
        // keep the intro weapons, but drop temporary weapons after a while
        if (!r.isIntro) r.weapon = null;
      }
      r.blinkAt -= dt;
      if (r.blinkAt <= 0) { r.blink = 0.12; r.blinkAt = rand(2.2, 6.5); }
      r.blink = Math.max(0, r.blink - dt);
      if (r.frozenUntil > sceneTime) {
        for (const b of Object.values(r.parts)) {
          Body.setVelocity(b, { x: 0, y: 0 });
          Body.setAngularVelocity(b, 0);
        }
      } else if (r.standing && !r.dead) {
        stabilizeRagdoll(r);
      }
      if (r.spikeCooldown > 0) r.spikeCooldown -= dt;
      if (r.parts.torso.position.y > WORLD.h + 200) {
        removeRagdoll(r);
      }
    }
  }

  function update(dt) {
    sceneTime += dt;
    if (gravityUntil && sceneTime > gravityUntil) {
      engine.gravity.y = 1.08;
      gravityUntil = 0;
      showToast('GRAVITY RESTORED');
    }
    if (state.hold) {
      state.hold.cooldown -= dt;
      if (state.hold.cooldown <= 0) {
        const rate = state.hold.kind === 'minigun' ? 0.065 : 0.075;
        state.hold.cooldown = rate;
        fireAutoWeapon(state.hold.point);
      }
    }
    updateRagdolls(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateEffects(dt);
    shake *= Math.pow(0.035, dt);
    if (shake < 0.15) shake = 0;
    flash *= Math.pow(0.008, dt);
    if (flash < 0.01) flash = 0;
    if (dragBody && dragConstraint) {
      const b = dragBody;
      if (b.position.x < -100 || b.position.x > WORLD.w + 100) endDrag();
    }
  }

  // ---------------------------------------------------------------- collisions
  Events.on(engine, 'collisionStart', event => {
    for (const pair of event.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      handleProjectilePair(a, b, pair);
      handleProjectilePair(b, a, pair);
      handleSpikePair(a, b);
      handleSpikePair(b, a);
      handleTrampolinePair(a, b);
      handleTrampolinePair(b, a);
    }
  });

  function contactPoint(pair, a, b) {
    const supports = pair.collision?.supports;
    if (supports && supports.length) return { x: supports[0].x, y: supports[0].y };
    return { x: (a.position.x + b.position.x) / 2, y: (a.position.y + b.position.y) / 2 };
  }

  function handleProjectilePair(p, other, pair) {
    if (!p.plugin) return;
    const type = p.plugin.type;
    if (type !== 'bullet' && type !== 'rocket' && type !== 'meteor' && type !== 'grenade' && type !== 'bomb') return;
    if (!other.plugin) return;
    if (other.plugin.type === 'bullet' || other.plugin.type === 'rocket' || other.plugin.type === 'meteor') return;
    const point = contactPoint(pair, p, other);
    if (type === 'grenade' || type === 'bomb') return;
    if (type === 'bullet') {
      const shooter = p.plugin.shooter;
      if (shooter && other.plugin.ragdoll === shooter && p.plugin.age < 0.11) return;
      if (other.plugin.type === 'part') {
        const partName = other.plugin.partName;
        const isHead = partName === 'head';
        const isLimb = partName.endsWith('2');
        const dmg = p.plugin.damage * (isHead ? 2.25 : isLimb ? 0.8 : 1);
        damageRagdoll(other.plugin.ragdoll, dmg, point, {
          blood: isHead ? 22 : 12, power: isHead ? 1.8 : 1.2,
          detach: isHead ? Math.random() < 0.8 : Math.random() < 0.3,
          detachChance: isHead ? 0.9 : 0.35,
          impulse: isHead ? 4 : 2
        });
        if (isHead) shake = Math.max(shake, 3);
        addSparks(point.x, point.y, 2, '#ffb0a0');
        playSfx('hit');
      } else if (other.plugin.type === 'prop') {
        damageProp(other, 26, point);
        addSparks(point.x, point.y, 4);
        playSfx('hit');
      } else {
        addSparks(point.x, point.y, 4, '#ffe8a0');
      }
      const proj = projectiles.find(x => x.body === p);
      if (proj) removeProjectile(proj);
    } else if (type === 'rocket') {
      const proj = projectiles.find(x => x.body === p);
      if (proj) removeProjectile(proj);
      explode(point.x, point.y, 165, 22, 78);
    } else if (type === 'meteor') {
      const proj = projectiles.find(x => x.body === p);
      if (proj) removeProjectile(proj);
      explode(point.x, point.y, 210, 28, 100);
    }
  }

  function handleSpikePair(a, b) {
    const spikes = a.plugin?.type === 'prop' && a.plugin.kind === 'spikes' ? a : (b.plugin?.type === 'prop' && b.plugin.kind === 'spikes' ? b : null);
    if (!spikes) return;
    const part = a.plugin?.type === 'part' ? a : (b.plugin?.type === 'part' ? b : null);
    if (!part) return;
    const r = part.plugin.ragdoll;
    if (!r || r.spikeCooldown > 0) return;
    r.spikeCooldown = 0.55;
    damageRagdoll(r, 28, part.position, { blood: 18, power: 1.4, detach: Math.random() < 0.3, detachChance: 0.4, impulse: 3 });
    Body.setVelocity(part, { x: part.velocity.x + rand(-1.5, 1.5), y: -5 });
    playSfx('hit');
  }

  function handleTrampolinePair(a, b) {
    const tramp = a.plugin?.type === 'prop' && a.plugin.kind === 'trampoline' ? a : (b.plugin?.type === 'prop' && b.plugin.kind === 'trampoline' ? b : null);
    if (!tramp) return;
    const other = a === tramp ? b : a;
    if (other.plugin?.type !== 'part' && other.plugin?.type !== 'prop') return;
    if (other.velocity.y > 2) {
      Body.setVelocity(other, { x: other.velocity.x * 0.9, y: -Math.max(9, other.velocity.y * 1.5) });
      addEffect({ type: 'ring', x: other.position.x, y: tramp.position.y - 12, r0: 4, r1: 44, life: 0.22, color: '180,255,120', width: 3 });
      playSfx('boing');
    }
  }

  // ---------------------------------------------------------------- boot (continued)

  // ---------------------------------------------------------------- render: environment
  let wallPattern = null;
  let floorPattern = null;
  const decor = {
    stains: Array.from({ length: 18 }, () => ({
      x: rand(120, WORLD.w - 120),
      y: rand(80, WORLD.groundY - 90),
      rx: rand(26, 100),
      ry: rand(16, 55),
      a: rand(0.025, 0.075)
    })),
    floorStains: Array.from({ length: 22 }, () => ({
      x: rand(60, WORLD.w - 60),
      y: rand(WORLD.groundY + 18, WORLD.floorBottom - 10),
      rx: rand(20, 90),
      ry: rand(5, 20),
      a: rand(0.05, 0.14)
    })),
    cracks: Array.from({ length: 7 }, () => {
      const pts = [];
      let x = rand(100, WORLD.w - 100);
      let y = rand(100, WORLD.groundY - 100);
      for (let i = 0; i < 5; i++) {
        pts.push({ x, y });
        x += rand(-26, 30);
        y += rand(10, 34);
      }
      return pts;
    })
  };

  function makePattern(base, dots, size = 256) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const c = cv.getContext('2d');
    c.fillStyle = base;
    c.fillRect(0, 0, size, size);
    for (let i = 0; i < 1500; i++) {
      c.fillStyle = `rgba(${dots[0]},${dots[1]},${dots[2]},${rand(0.012, 0.055).toFixed(3)})`;
      const s = Math.random() > 0.92 ? 2 : 1;
      c.fillRect(rand(0, size), rand(0, size), s, s);
    }
    for (let i = 0; i < 12; i++) {
      c.fillStyle = `rgba(20,20,22,${rand(0.02, 0.06)})`;
      c.beginPath();
      c.ellipse(rand(0, size), rand(0, size), rand(8, 30), rand(3, 12), rand(0, 6), 0, Math.PI * 2);
      c.fill();
    }
    return ctx.createPattern(cv, 'repeat');
  }

  function initTextures() {
    wallPattern = makePattern('#68696c', [235, 235, 230]);
    floorPattern = makePattern('#3d3e42', [180, 180, 180]);
  }

  function drawEnvironment(view) {
    const left = view.left - 20;
    const right = view.right + 20;
    const width = right - left;

    // wall
    ctx.fillStyle = wallPattern || '#68696c';
    ctx.fillRect(left, -100, width, WORLD.groundY + 100);

    // large concrete panels
    ctx.lineWidth = 2;
    for (let x = Math.floor(left / 320) * 320; x < right; x += 320) {
      ctx.strokeStyle = 'rgba(35,36,38,0.38)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD.groundY);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.beginPath();
      ctx.moveTo(x + 2, 0);
      ctx.lineTo(x + 2, WORLD.groundY);
      ctx.stroke();
    }

    // tile grid
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(32,33,35,0.25)';
    const gx = Math.floor(left / 64) * 64;
    const gy = Math.floor((view.top - 20) / 64) * 64;
    ctx.beginPath();
    for (let x = gx; x < right; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.groundY); }
    for (let y = gy; y < WORLD.groundY; y += 64) { ctx.moveTo(left, y); ctx.lineTo(right, y); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.beginPath();
    for (let x = gx + 1; x < right; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.groundY); }
    for (let y = gy + 1; y < WORLD.groundY; y += 64) { ctx.moveTo(left, y); ctx.lineTo(right, y); }
    ctx.stroke();

    // stains and cracks
    for (const s of decor.stains) {
      if (s.x < left - s.rx || s.x > right + s.rx) continue;
      ctx.fillStyle = `rgba(35,35,36,${s.a})`;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.rx, s.ry, rand(0, 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(34,35,36,0.22)';
    ctx.lineWidth = 1.2;
    for (const crack of decor.cracks) {
      if (crack[0].x < left || crack[0].x > right) continue;
      ctx.beginPath();
      ctx.moveTo(crack[0].x, crack[0].y);
      for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i].x, crack[i].y);
      ctx.stroke();
    }

    // wall pipes near the top
    if (view.top < 150) {
      ctx.fillStyle = '#4b4d51';
      ctx.fillRect(left, 62, width, 15);
      ctx.fillStyle = '#5b5d61';
      ctx.fillRect(left, 62, width, 4);
      ctx.fillStyle = '#323337';
      ctx.fillRect(left, 74, width, 3);
      for (let x = Math.floor(left / 180) * 180; x < right; x += 180) {
        ctx.fillStyle = '#2f3034';
        ctx.fillRect(x, 56, 13, 28);
        ctx.fillStyle = '#727478';
        ctx.fillRect(x + 2, 58, 3, 22);
      }
      // valve
      const vx = 1260;
      if (vx > left && vx < right) {
        ctx.strokeStyle = '#d24d3f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(vx, 69, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#292a2d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(vx - 25, 69);
        ctx.lineTo(vx + 25, 69);
        ctx.moveTo(vx, 44);
        ctx.lineTo(vx, 94);
        ctx.stroke();
      }
    }

    // warning sign / wall placard
    drawWallSign(1660, 270);
    // The small placard crowds the top-left HUD on short landscape phones.
    if (W >= 1000 && H >= 700) drawWallSign(300, 180, true);

    // faint lab lettering
    if (right > 920 && left < 1400) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#111214';
      ctx.font = '800 72px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TEST CHAMBER', 1170, 360);
      ctx.font = '700 24px Rubik, sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillText('MELON CORPORATION', 1170, 398);
      ctx.restore();
    }

    // floor
    ctx.fillStyle = floorPattern || '#3d3e42';
    ctx.fillRect(left, WORLD.groundY, width, WORLD.floorBottom - WORLD.groundY + 200);

    // floor stains
    for (const s of decor.floorStains) {
      if (s.x < left - s.rx || s.x > right + s.rx) continue;
      ctx.fillStyle = `rgba(20,20,22,${s.a})`;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // top metal lip
    ctx.fillStyle = '#9b9c9c';
    ctx.fillRect(left, WORLD.groundY - 5, width, 8);
    ctx.fillStyle = '#c4c5c3';
    ctx.fillRect(left, WORLD.groundY - 5, width, 2);
    ctx.fillStyle = '#242528';
    ctx.fillRect(left, WORLD.groundY + 3, width, 4);
    const shadow = ctx.createLinearGradient(0, WORLD.groundY + 7, 0, WORLD.groundY + 54);
    shadow.addColorStop(0, 'rgba(12,12,13,0.42)');
    shadow.addColorStop(1, 'rgba(12,12,13,0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(left, WORLD.groundY + 7, width, 52);

    // floor panel seams and bolts
    ctx.strokeStyle = 'rgba(18,18,20,0.35)';
    ctx.lineWidth = 2;
    for (let x = Math.floor(left / 240) * 240; x < right; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x, WORLD.groundY + 8);
      ctx.lineTo(x + 34, WORLD.floorBottom + 120);
      ctx.stroke();
    }
    for (let x = Math.floor(left / 120) * 120; x < right; x += 120) {
      ctx.fillStyle = 'rgba(150,151,150,0.22)';
      ctx.beginPath();
      ctx.arc(x, WORLD.groundY + 18, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // painted test zone
    if (right > 420 && left < 1170) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#e9e7dc';
      ctx.font = '800 23px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '5px';
      ctx.fillText('TEST ZONE 07', 800, 790);
      ctx.strokeStyle = '#e9e7dc';
      ctx.lineWidth = 2;
      ctx.setLineDash([16, 14]);
      ctx.beginPath();
      ctx.moveTo(390, 802);
      ctx.lineTo(1210, 802);
      ctx.stroke();
      ctx.restore();
    }

    // hazard stripe along far-left wall edge
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, WORLD.groundY - 54, 78, 54);
    ctx.clip();
    ctx.fillStyle = '#d9b528';
    ctx.fillRect(0, WORLD.groundY - 54, 78, 54);
    ctx.fillStyle = '#222326';
    for (let i = -80; i < 130; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, WORLD.groundY);
      ctx.lineTo(i + 20, WORLD.groundY - 54);
      ctx.lineTo(i + 34, WORLD.groundY - 54);
      ctx.lineTo(i + 14, WORLD.groundY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWallSign(x, y, small = false) {
    const w = small ? 122 : 190;
    const h = small ? 66 : 96;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(20,21,23,0.75)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);
    ctx.fillStyle = '#34363a';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 4;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
    ctx.fillStyle = '#9edb2f';
    ctx.font = `800 ${small ? 8 : 9}px Rubik, sans-serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('MELON CORP.', 0, -h / 2 + 22);
    ctx.fillStyle = '#d9d8d0';
    ctx.font = `800 ${small ? 10 : 13}px Rubik, sans-serif`;
    ctx.fillText(small ? 'AUTHORIZED' : 'BIO TESTING', 0, -h / 2 + 40);
    ctx.fillStyle = 'rgba(158,219,47,0.25)';
    ctx.fillRect(-w / 2 + 18, h / 2 - 28, w - 36, 3);
    ctx.fillStyle = '#777974';
    ctx.font = '600 7px Rubik, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('SECTOR 07', 0, h / 2 - 13);
    ctx.restore();
  }

  // ---------------------------------------------------------------- render: world
  function drawShadows() {
    ctx.save();
    for (const r of ragdolls) {
      const x = r.parts.torso.position.x;
      const height = clamp((WORLD.groundY - r.parts.torso.position.y) / 300, 0, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.22 - height * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(x, WORLD.groundY + 5, 52 + height * 14, 8 + height * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const b of props) {
      if (b.plugin?.kind === 'spikes' || b.plugin?.kind === 'trampoline') continue;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(b.position.x, WORLD.groundY + 4, (b.plugin?.w || 60) * 0.48, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawDecals() {
    for (const d of decals) {
      if (d.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = d.alpha;
      if (d.type === 'blood') {
        ctx.fillStyle = '#681010';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r, d.r * rand(0.22, 0.34), d.seed, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7d1111';
        for (let i = 0; i < 3; i++) {
          const a = d.seed + i * 2.1;
          ctx.beginPath();
          ctx.ellipse(d.x + Math.cos(a) * d.r * 0.8, d.y + Math.sin(a) * d.r * 0.16, d.r * 0.22, d.r * 0.07, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(90,10,10,0.55)';
        for (const drip of d.drips) {
          ctx.fillRect(d.x + drip.dx, d.y, drip.w, drip.h);
          ctx.beginPath();
          ctx.arc(d.x + drip.dx + drip.w / 2, d.y + drip.h, drip.w * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (d.type === 'scorch') {
        const grad = ctx.createRadialGradient(d.x, d.y, 2, d.x, d.y, d.r * 2.4);
        grad.addColorStop(0, 'rgba(8,8,8,0.8)');
        grad.addColorStop(0.5, 'rgba(18,16,14,0.5)');
        grad.addColorStop(1, 'rgba(18,16,14,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r * 2.4, d.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function renderWorld(view) {
    drawEnvironment(view);
    drawDecals();
    drawShadows();

    const renderables = [];
    for (const b of props) renderables.push({ y: b.position.y + (b.plugin?.h || 0) / 2, kind: 'prop', body: b });
    for (const r of ragdolls) renderables.push({ y: r.parts.torso.position.y + 90, kind: 'ragdoll', ragdoll: r });
    renderables.sort((a, b) => a.y - b.y);
    for (const item of renderables) {
      if (item.kind === 'prop') drawProp(item.body);
      else drawRagdoll(item.ragdoll);
    }

    for (const p of projectiles) drawProjectile(p);
    drawParticles();
    drawEffects();
  }

  // ---------------------------------------------------------------- art helpers
  function rr(c, x, y, w, h, radius) {
    const rad = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  }

  function drawProp(body) {
    const p = body.plugin;
    if (!p) return;
    const w = p.w;
    const h = p.h;
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);
    ctx.lineJoin = 'round';

    if (p.kind === 'crate') {
      ctx.fillStyle = '#a9743a';
      ctx.strokeStyle = '#3a220e';
      ctx.lineWidth = 4;
      rr(ctx, -w / 2, -h / 2, w, h, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(64,37,13,0.62)';
      ctx.lineWidth = 2;
      for (let i = -h / 2 + 20; i < h / 2; i += 20) {
        ctx.beginPath(); ctx.moveTo(-w / 2 + 4, i); ctx.lineTo(w / 2 - 4, i); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,220,150,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + 7); ctx.lineTo(w / 2 - 8, -h / 2 + 7); ctx.stroke();
      ctx.strokeStyle = '#7b4c20';
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + 8); ctx.lineTo(w / 2 - 8, h / 2 - 8); ctx.stroke();
      ctx.strokeStyle = '#5e3715';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h / 2 + 8); ctx.lineTo(w / 2 - 8, h / 2 - 8); ctx.stroke();
      ctx.fillStyle = '#4c4d50';
      const c = 12;
      for (const [x, y] of [[-w / 2, -h / 2], [w / 2 - c, -h / 2], [-w / 2, h / 2 - c], [w / 2 - c, h / 2 - c]]) {
        ctx.fillRect(x, y, c, c);
      }
      ctx.fillStyle = '#8c8d8e';
      for (const [x, y] of [[-w / 2 + 5, -h / 2 + 5], [w / 2 - 7, -h / 2 + 5], [-w / 2 + 5, h / 2 - 7], [w / 2 - 7, h / 2 - 7]]) {
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.fillStyle = '#f0e4c7';
      ctx.font = '800 12px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MP-07', 0, 5);
      ctx.restore();
    } else if (p.kind === 'barrel') {
      ctx.fillStyle = '#b7332d';
      ctx.strokeStyle = '#3b100d';
      ctx.lineWidth = 4;
      rr(ctx, -w / 2, -h / 2, w, h, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4a4b4e';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 11, w + 4, 9);
      ctx.fillRect(-w / 2 - 2, h / 2 - 20, w + 4, 9);
      ctx.fillStyle = '#7c7d7e';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 11, w + 4, 2);
      ctx.save();
      ctx.beginPath(); ctx.rect(-w / 2 + 4, -12, w - 8, 26); ctx.clip();
      ctx.fillStyle = '#e4b72d';
      ctx.fillRect(-w / 2 + 4, -12, w - 8, 26);
      ctx.fillStyle = '#242528';
      for (let i = -40; i < 50; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, -12); ctx.lineTo(i + 10, -12); ctx.lineTo(i + 28, 14); ctx.lineTo(i + 18, 14); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.17)';
      ctx.fillRect(-w / 2 + 7, -h / 2 + 7, 5, h - 14);
      ctx.fillStyle = '#2b0a08';
      ctx.font = '800 8px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TNT', 0, 33);
    } else if (p.kind === 'wall') {
      ctx.fillStyle = '#85867f';
      ctx.strokeStyle = '#292a29';
      ctx.lineWidth = 4;
      rr(ctx, -w / 2, -h / 2, w, h, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 4, 5, h - 8);
      ctx.strokeStyle = 'rgba(44,45,43,0.4)';
      ctx.lineWidth = 1.4;
      for (let y = -h / 2 + 34; y < h / 2; y += 38) {
        ctx.beginPath(); ctx.moveTo(-w / 2 + 4, y); ctx.lineTo(w / 2 - 4, y); ctx.stroke();
      }
      ctx.strokeStyle = '#5b5c56';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8, -h / 2 + 20); ctx.lineTo(-14, -h / 2 + 46); ctx.lineTo(-5, -h / 2 + 64); ctx.lineTo(-12, -h / 2 + 88);
      ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.rect(-w / 2 + 4, h / 2 - 18, w - 8, 14); ctx.clip();
      ctx.fillStyle = '#d5b02b'; ctx.fillRect(-w / 2, h / 2 - 18, w, 14);
      ctx.fillStyle = '#232427';
      for (let i = -30; i < 50; i += 14) {
        ctx.beginPath(); ctx.moveTo(i, h / 2 - 18); ctx.lineTo(i + 7, h / 2 - 18); ctx.lineTo(i + 15, h / 2 - 4); ctx.lineTo(i + 8, h / 2 - 4); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = '#4b3b2f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-9, -h / 2); ctx.lineTo(-11, -h / 2 - 12); ctx.moveTo(8, -h / 2); ctx.lineTo(12, -h / 2 - 9); ctx.stroke();
    } else if (p.kind === 'platform') {
      ctx.fillStyle = '#66696e';
      ctx.strokeStyle = '#24262a';
      ctx.lineWidth = 4;
      rr(ctx, -w / 2, -h / 2, w, h, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#9edb2f';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 9, w - 8, 3);
      ctx.fillStyle = '#3b3d40';
      for (let x = -w / 2 + 20; x < w / 2 - 8; x += 36) {
        ctx.beginPath(); ctx.arc(x, 3, 2.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(30,31,34,0.55)';
      ctx.lineWidth = 2;
      for (let x = -w / 2 + 18; x < w / 2 - 18; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, h / 2 - 3); ctx.lineTo(x + 16, -h / 2 + 3); ctx.stroke();
      }
    } else if (p.kind === 'spikes') {
      ctx.fillStyle = '#43454a';
      ctx.strokeStyle = '#1d1e21';
      ctx.lineWidth = 3;
      rr(ctx, -w / 2, -h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();
      const count = 7;
      const sw = w / count;
      for (let i = 0; i < count; i++) {
        const x = -w / 2 + i * sw;
        const grad = ctx.createLinearGradient(0, -h / 2 - 25, 0, -h / 2 + 6);
        grad.addColorStop(0, '#e8e9e6');
        grad.addColorStop(0.55, '#9b9d9e');
        grad.addColorStop(1, '#5b5d60');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x + 3, -h / 2 + 5);
        ctx.lineTo(x + sw / 2, -h / 2 - 30);
        ctx.lineTo(x + sw - 3, -h / 2 + 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2a2b2e';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    } else if (p.kind === 'trampoline') {
      ctx.fillStyle = '#34363a';
      ctx.strokeStyle = '#161719';
      ctx.lineWidth = 3;
      rr(ctx, -w / 2, -h / 2, w, h, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7fba1f';
      ctx.strokeStyle = '#1f3007';
      ctx.lineWidth = 2;
      rr(ctx, -w / 2 + 6, -h / 2 + 3, w - 12, h - 6, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(-w / 2 + 12, -h / 2 + 6, w - 24, 2);
      ctx.strokeStyle = '#9a9b98';
      ctx.lineWidth = 2;
      for (let x = -w / 2 + 14; x < w / 2 - 8; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, -h / 2 + 6); ctx.lineTo(x + 5, -h / 2 + 1); ctx.stroke();
      }
      ctx.strokeStyle = '#2a2b2e';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 24, h / 2); ctx.lineTo(-w / 2 + 12, h / 2 + 24); ctx.moveTo(w / 2 - 24, h / 2); ctx.lineTo(w / 2 - 12, h / 2 + 24); ctx.stroke();
    }
    ctx.restore();
  }

  function drawRagdoll(r) {
    const p = r.parts;
    const pal = r.pal;
    if (!p.torso) return;

    drawLimb(r, 'armL1');
    drawLimb(r, 'armL2');
    drawLimb(r, 'legL1');
    drawLimb(r, 'legL2');

    const headAttached = !r.severed.has('head');
    if (headAttached) {
      ctx.save();
      ctx.strokeStyle = pal.dark;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.torso.position.x, p.torso.position.y - (p.torso.plugin.h / 2 - 2));
      ctx.lineTo(p.head.position.x, p.head.position.y + (p.head.plugin.h / 2 - 12));
      ctx.stroke();
      ctx.restore();
    }

    drawTorso(r);

    drawLimb(r, 'legR1');
    drawLimb(r, 'legR2');
    drawLimb(r, 'armR1');
    drawLimb(r, 'armR2');

    drawHead(r);

    if (r.weapon && !r.dead) drawHeldWeapon(r);

    if (r.frozenUntil > sceneTime) {
      ctx.save();
      ctx.globalAlpha = 0.36;
      ctx.fillStyle = '#c4f2ff';
      for (const name of ['torso', 'head', 'armL1', 'armR1', 'legL1', 'legR1']) {
        const b = p[name];
        if (!b) continue;
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        const w = b.plugin.w + 8;
        const h = b.plugin.h + 8;
        rr(ctx, -w / 2, -h / 2, w, h, 7);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = '#e8fbff';
      ctx.lineWidth = 2;
      for (const name of ['torso', 'head', 'armL1', 'legL1']) {
        const b = p[name];
        if (!b) continue;
        for (let i = 0; i < 3; i++) {
          const a = r.seed + i * 2.1;
          const x = b.position.x + Math.cos(a) * 18;
          const y = b.position.y + Math.sin(a) * 26;
          ctx.beginPath();
          ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y);
          ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (r.showHealth > 0 && r.health < 100 && !r.dead) {
      const hx = p.head.position.x;
      const hy = p.head.position.y - 40;
      ctx.save();
      ctx.globalAlpha = clamp(r.showHealth, 0, 1);
      ctx.fillStyle = 'rgba(12,13,14,0.75)';
      rr(ctx, hx - 23, hy, 46, 7, 3);
      ctx.fill();
      ctx.fillStyle = r.health > 55 ? '#9edb2f' : r.health > 25 ? '#f1b32b' : '#e54842';
      rr(ctx, hx - 21, hy + 2, 42 * clamp(r.health / 100, 0, 1), 3, 1.5);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLimb(r, name) {
    const b = r.parts[name];
    if (!b) return;
    const pal = r.pal;
    const w = b.plugin.w;
    const h = b.plugin.h;
    const lower = name.endsWith('2');
    const arm = name.startsWith('arm');
    ctx.save();
    ctx.translate(b.position.x, b.position.y);
    ctx.rotate(b.angle);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = pal.line;
    ctx.fillStyle = pal.base;
    rr(ctx, -w / 2, -h / 2, w, h, Math.min(w / 2, 7));
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = pal.light;
    rr(ctx, -w / 2 + 2.5, -h / 2 + 4, Math.max(2.5, w * 0.3), h - 8, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (lower) {
      if (arm) {
        ctx.fillStyle = pal.dark;
        ctx.beginPath();
        ctx.arc(0, h / 2 - 3, w * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = pal.dark;
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 3;
        rr(ctx, -w / 2 - 1, h / 2 - 10, w + 2, 10, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = pal.base;
        rr(ctx, -w / 2, h / 2 - 10, w, 6, 3);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath();
      ctx.arc(0, h / 2 - 2, w * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    if (name === 'armR1' || name === 'armL1') {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.2, -h * 0.25);
      ctx.quadraticCurveTo(w * 0.22, 0, -w * 0.1, h * 0.3);
      ctx.stroke();
    }
    if (r.hitFlash > 0) {
      ctx.globalAlpha = r.hitFlash * 1.8;
      ctx.strokeStyle = '#ff6d5d';
      ctx.lineWidth = 3;
      rr(ctx, -w / 2, -h / 2, w, h, Math.min(w / 2, 7));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTorso(r) {
    const b = r.parts.torso;
    const pal = r.pal;
    const w = b.plugin.w;
    const h = b.plugin.h;
    ctx.save();
    ctx.translate(b.position.x, b.position.y);
    ctx.rotate(b.angle);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = pal.line;
    ctx.fillStyle = pal.base;
    rr(ctx, -w / 2, -h / 2, w, h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    rr(ctx, -w / 2, -h / 2, w, h, 18);
    ctx.clip();
    ctx.fillStyle = pal.light;
    ctx.globalAlpha = 0.42;
    rr(ctx, -w / 2 + 5, -h / 2 + 7, 10, h - 14, 5);
    ctx.fill();
    ctx.fillStyle = pal.dark;
    ctx.globalAlpha = 0.3;
    rr(ctx, w / 2 - 14, -h / 2 + 6, 10, h - 12, 5);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = pal.light;
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 11, -h / 2 + 12);
      ctx.bezierCurveTo(i * 11 + 8, -h / 4, i * 11 - 8, h / 4, i * 11 + 3, h / 2 - 12);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = pal.light;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -h / 2 + 28, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pal.light;
    ctx.beginPath();
    ctx.ellipse(0, -h / 2 + 28, 2, 3.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!isPartAttached(r, 'head')) {
      ctx.fillStyle = '#6d1010';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + 3, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d0707';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + 3, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (r.severed.has('armL1')) {
      ctx.fillStyle = '#6d1010';
      ctx.beginPath(); ctx.arc(-w / 2 + 2, -h / 2 + 20, 7, 0, Math.PI * 2); ctx.fill();
    }
    if (r.severed.has('armR1')) {
      ctx.fillStyle = '#6d1010';
      ctx.beginPath(); ctx.arc(w / 2 - 2, -h / 2 + 20, 7, 0, Math.PI * 2); ctx.fill();
    }
    if (r.severed.has('legL1')) {
      ctx.fillStyle = '#6d1010';
      ctx.beginPath(); ctx.arc(-13, h / 2 - 2, 8, 0, Math.PI * 2); ctx.fill();
    }
    if (r.severed.has('legR1')) {
      ctx.fillStyle = '#6d1010';
      ctx.beginPath(); ctx.arc(13, h / 2 - 2, 8, 0, Math.PI * 2); ctx.fill();
    }

    if (r.health < 72 || r.dead) {
      ctx.save();
      ctx.globalAlpha = r.dead ? 0.8 : 0.55;
      ctx.fillStyle = '#771010';
      ctx.beginPath();
      ctx.ellipse(rand(-12, 12), rand(-36, 30), rand(3, 8), rand(6, 15), rand(0, 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (r.hitFlash > 0) {
      ctx.globalAlpha = r.hitFlash * 1.6;
      ctx.strokeStyle = '#ff7462';
      ctx.lineWidth = 4;
      rr(ctx, -w / 2, -h / 2, w, h, 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHead(r) {
    const b = r.parts.head;
    const pal = r.pal;
    const w = b.plugin.w;
    const h = b.plugin.h;
    const dead = r.dead;
    const blink = r.blink > 0 && !dead;
    ctx.save();
    ctx.translate(b.position.x, b.position.y);
    ctx.rotate(b.angle);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = pal.line;
    ctx.fillStyle = pal.base;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = pal.light;
    ctx.globalAlpha = 0.35;
    rr(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, 9, 5);
    ctx.fill();
    ctx.fillStyle = pal.dark;
    ctx.globalAlpha = 0.24;
    ctx.fillRect(-w / 2, h / 2 - 8, w, 10);
    ctx.globalAlpha = 1;
    ctx.restore();

    if (pal.type === 'apple') {
      ctx.strokeStyle = '#412008';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 1);
      ctx.quadraticCurveTo(2, -h / 2 - 10, 8, -h / 2 - 13);
      ctx.stroke();
      ctx.fillStyle = '#5b9c1d';
      ctx.strokeStyle = '#244208';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(15, -h / 2 - 9, 10, 4, -0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (pal.type === 'pumpkin') {
      ctx.fillStyle = '#4b5d17';
      ctx.strokeStyle = '#263006';
      ctx.lineWidth = 2;
      rr(ctx, -4, -h / 2 - 12, 8, 14, 2);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(70,36,7,0.45)';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 13, -h / 2 + 8);
        ctx.quadraticCurveTo(i * 19, 0, i * 12, h / 2 - 8);
        ctx.stroke();
      }
    } else if (pal.type === 'orange' || pal.type === 'lemon') {
      ctx.fillStyle = '#4f7714';
      ctx.strokeStyle = '#243706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(7, -h / 2 - 4, 7, 3.5, -0.35, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (pal.type === 'tomato') {
      ctx.fillStyle = '#4f7d18';
      ctx.strokeStyle = '#203405';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 8, -h / 2 - 2 + Math.sin(a) * 3, 8, 2.6, a, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    } else if (pal.type === 'pear') {
      ctx.fillStyle = '#587c16';
      ctx.strokeStyle = '#263a06';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(9, -h / 2 - 4, 9, 3.8, -0.45, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#3a2a0d';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, -h / 2 + 1); ctx.lineTo(2, -h / 2 - 9); ctx.stroke();
    } else if (pal.type === 'grape') {
      ctx.fillStyle = '#4f7d18';
      ctx.strokeStyle = '#203405';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(8, -h / 2 - 3, 6, 3, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.arc(-16 + i * 8, -h / 2 + 9 + (i % 2) * 5, 3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (pal.type === 'ninja') {
      ctx.fillStyle = '#b5382f';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 11, w - 6, 6);
      ctx.fillStyle = '#e6dca8';
      ctx.fillRect(-w / 2 + 8, -h / 2 + 12, 7, 3);
    } else if (pal.type === 'ice') {
      ctx.strokeStyle = '#dffaff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const x = -16 + i * 16;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2 + 2);
        ctx.lineTo(x + 2, -h / 2 - 7);
        ctx.lineTo(x + 4, -h / 2 + 2);
        ctx.stroke();
      }
    } else if (pal.type === 'melon') {
      ctx.fillStyle = '#4f7714';
      ctx.strokeStyle = '#243706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(8, -h / 2 - 3, 8, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    const eyeY = -1;
    const eyeX = 16;
    if (dead) {
      ctx.strokeStyle = '#12140b';
      ctx.lineWidth = 3;
      for (const ex of [-eyeX, eyeX]) {
        ctx.beginPath();
        ctx.moveTo(ex - 5, eyeY - 5); ctx.lineTo(ex + 5, eyeY + 5);
        ctx.moveTo(ex + 5, eyeY - 5); ctx.lineTo(ex - 5, eyeY + 5);
        ctx.stroke();
      }
      ctx.fillStyle = '#20100c';
      ctx.beginPath();
      ctx.ellipse(0, 17, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8e1b15';
      ctx.beginPath();
      ctx.ellipse(0, 19, 4.5, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (blink) {
      ctx.strokeStyle = '#12140b';
      ctx.lineWidth = 3;
      for (const ex of [-eyeX, eyeX]) {
        ctx.beginPath(); ctx.moveTo(ex - 5, eyeY); ctx.lineTo(ex + 5, eyeY); ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#14160b';
      for (const ex of [-eyeX, eyeX]) {
        rr(ctx, ex - 4, eyeY - 6, 8, 12, 3.5);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (const ex of [-eyeX, eyeX]) {
        ctx.beginPath(); ctx.arc(ex - 1.5, eyeY - 2.5, 1.7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#12140b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 17, 9, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    if (r.health < 60 || r.dead) {
      ctx.save();
      ctx.globalAlpha = r.dead ? 0.8 : 0.55;
      ctx.fillStyle = '#6d1010';
      ctx.beginPath();
      ctx.ellipse(rand(-16, 16), rand(6, 18), rand(2, 5), rand(3, 9), rand(0, 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (r.hitFlash > 0) {
      ctx.globalAlpha = r.hitFlash * 1.5;
      ctx.strokeStyle = '#ff7462';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeldWeapon(r) {
    const arm = r.parts.armR2;
    if (!arm) return;
    const hand = handPoint(r);
    const angle = r.aimAngle !== undefined ? r.aimAngle : 0.25;
    const kind = r.weapon;
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(angle);
    ctx.lineJoin = 'round';
    if (kind === 'sword' || kind === 'katana') {
      ctx.strokeStyle = '#3b230e';
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.strokeStyle = kind === 'katana' ? '#b7b9b8' : '#d5d6d3';
      ctx.lineWidth = kind === 'katana' ? 5 : 7;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(kind === 'katana' ? 88 : 70, 0);
      ctx.stroke();
      ctx.strokeStyle = '#f2f2e9';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(kind === 'katana' ? 84 : 66, -2); ctx.stroke();
      ctx.strokeStyle = '#c9a22d';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(5, -8); ctx.lineTo(5, 8); ctx.stroke();
    } else if (kind === 'axe') {
      ctx.strokeStyle = '#6a411b';
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(50, 0); ctx.stroke();
      ctx.fillStyle = '#aeb0af';
      ctx.strokeStyle = '#333537';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, -16);
      ctx.quadraticCurveTo(66, -28, 76, -5);
      ctx.lineTo(60, 6);
      ctx.lineTo(40, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (kind === 'pistol') {
      ctx.fillStyle = '#2d3034';
      ctx.strokeStyle = '#101113';
      ctx.lineWidth = 2;
      rr(ctx, -10, -7, 40, 13, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#44474b';
      rr(ctx, -8, -4, 20, 3, 1);
      ctx.fill();
      ctx.fillStyle = '#232529';
      ctx.beginPath();
      ctx.moveTo(-2, 5); ctx.lineTo(10, 5); ctx.lineTo(6, 22); ctx.lineTo(-5, 22); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a22d';
      ctx.fillRect(12, 4, 4, 3);
    } else if (kind === 'rocket') {
      ctx.fillStyle = '#47502e';
      ctx.strokeStyle = '#171b0d';
      ctx.lineWidth = 2;
      rr(ctx, -20, -10, 78, 20, 7);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#22251b';
      ctx.fillRect(10, -6, 25, 12);
      ctx.fillStyle = '#c53b2f';
      ctx.beginPath(); ctx.moveTo(58, -9); ctx.lineTo(74, 0); ctx.lineTo(58, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9edb2f';
      ctx.fillRect(-15, -7, 6, 14);
    } else if (kind === 'minigun') {
      ctx.fillStyle = '#35383c';
      ctx.strokeStyle = '#131416';
      ctx.lineWidth = 2;
      rr(ctx, -18, -13, 34, 26, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5a5d60';
      for (let i = -8; i <= 8; i += 4) {
        rr(ctx, 14, i - 2, 44, 4, 2);
        ctx.fill();
      }
      ctx.fillStyle = '#9edb2f';
      ctx.fillRect(-14, -9, 4, 18);
    } else if (kind === 'flame') {
      ctx.fillStyle = '#6c2c19';
      ctx.strokeStyle = '#29110a';
      ctx.lineWidth = 2;
      rr(ctx, -16, -11, 38, 22, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3a3d40';
      rr(ctx, 16, -4, 32, 8, 3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9edb2f';
      ctx.fillRect(-12, -7, 4, 14);
    } else if (kind === 'grenade') {
      ctx.fillStyle = '#4f6622';
      ctx.strokeStyle = '#1c250a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(12, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#b7b9b8';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(12, 0, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#c9a22d';
      ctx.fillRect(12, -14, 4, 5);
    }
    if (r.weaponFlash > 0) {
      ctx.globalAlpha = clamp(r.weaponFlash / 0.14, 0, 1);
      ctx.fillStyle = '#fff1a8';
      const fx = kind === 'rocket' ? 80 : kind === 'minigun' ? 62 : 42;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const rad = i % 2 ? 7 : 19;
        const x = fx + Math.cos(a) * rad;
        const y = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff9d1e';
      ctx.beginPath(); ctx.arc(fx, 0, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawProjectile(p) {
    const b = p.body;
    if (!b || !b.position) return;
    if (p.kind === 'bullet') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,227,130,0.35)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(b.position.x - b.velocity.x * 2.2, b.position.y - b.velocity.y * 2.2);
      ctx.lineTo(b.position.x, b.position.y);
      ctx.stroke();
      ctx.strokeStyle = '#ffe99a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.position.x - b.velocity.x * 1.4, b.position.y - b.velocity.y * 1.4);
      ctx.lineTo(b.position.x, b.position.y);
      ctx.stroke();
      ctx.restore();
    } else if (p.kind === 'rocket') {
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(Math.atan2(b.velocity.y, b.velocity.x));
      ctx.fillStyle = '#33362e';
      ctx.strokeStyle = '#11130d';
      ctx.lineWidth = 2;
      rr(ctx, -16, -6, 32, 12, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c73b2f';
      ctx.beginPath(); ctx.moveTo(16, -6); ctx.lineTo(27, 0); ctx.lineTo(16, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9edb2f';
      ctx.fillRect(-12, -4, 4, 8);
      ctx.restore();
    } else if (p.kind === 'grenade') {
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = '#4b6020';
      ctx.strokeStyle = '#151d08';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#9ea09f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#c9a22d';
      ctx.fillRect(-2, -16, 4, 6);
      if (Math.sin(sceneTime * 18) > 0.2) {
        ctx.fillStyle = '#ff4b37';
        ctx.beginPath(); ctx.arc(0, -17, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    } else if (p.kind === 'bomb') {
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = '#1d1e21';
      ctx.strokeStyle = '#090a0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3f4247';
      ctx.beginPath(); ctx.arc(-5, -5, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7d5b2d';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(8, -14); ctx.quadraticCurveTo(16, -28, 5, -32); ctx.stroke();
      ctx.fillStyle = Math.sin(sceneTime * 22) > 0 ? '#ffd24a' : '#ff5b22';
      ctx.beginPath(); ctx.arc(4, -33, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (p.kind === 'meteor') {
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.fillStyle = 'rgba(255,90,20,0.22)';
      ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff7b1a';
      ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3f352e';
      ctx.strokeStyle = '#17120f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6e5c4b';
      ctx.beginPath(); ctx.arc(-9, -8, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(11, 7, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const a = clamp(p.life / (p.maxLife || 1), 0, 1);
      ctx.save();
      if (p.type === 'blood') {
        ctx.globalAlpha = Math.min(1, a * 1.8);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + a * 0.4), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.018, p.y - p.vy * 0.018);
        ctx.stroke();
      } else if (p.type === 'smoke') {
        ctx.globalAlpha = a * 0.34;
        ctx.fillStyle = p.color + (a * 0.5).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.4 - a * 0.4), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'fire') {
        ctx.globalAlpha = Math.min(1, a * 1.7);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.35 + a * 0.65), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a * 0.45;
        ctx.fillStyle = '#fff0a0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.32, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'debris') {
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      }
      ctx.restore();
    }
  }

  function drawEffects() {
    for (const e of effects) {
      const t = 1 - clamp(e.life / (e.maxLife || 1), 0, 1);
      if (e.type === 'ring') {
        const r = lerp(e.r0 || 0, e.r1 || 100, t);
        ctx.save();
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.strokeStyle = `rgba(${e.color || '255,220,150'},${1 - t})`;
        ctx.lineWidth = (e.width || 5) * (1 - t * 0.7);
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (e.type === 'muzzle') {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = '#fff3ad';
        const sz = e.big ? 1.7 : 1;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          const rad = (i % 2 ? 5 : 16) * sz;
          const x = Math.cos(a) * rad;
          const y = Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (e.type === 'slash') {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.globalAlpha = (1 - t) * 0.95;
        const rad = e.reach * (0.55 + t * 0.5);
        ctx.strokeStyle = e.heavy ? '#ffe2a3' : '#eaffd2';
        ctx.lineWidth = (e.heavy ? 14 : 8) * (1 - t * 0.7);
        ctx.beginPath();
        ctx.arc(0, 0, rad, -0.7, 0.7);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, rad + 5, -0.65, 0.65); ctx.stroke();
        ctx.restore();
      } else if (e.type === 'lightning') {
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = 'rgba(180,225,255,0.28)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        e.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.stroke();
        ctx.strokeStyle = '#eaf9ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        e.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
      } else if (e.type === 'blackhole') {
        ctx.save();
        ctx.globalAlpha = clamp(e.life / 0.5, 0, 1) * 0.9;
        const r = e.radius * 0.35;
        const grad = ctx.createRadialGradient(e.x, e.y, 4, e.x, e.y, r);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.45, 'rgba(15,4,30,0.98)');
        grad.addColorStop(0.78, 'rgba(112,45,190,0.6)');
        grad.addColorStop(1, 'rgba(112,45,190,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(190,130,255,0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(e.x, e.y, r * (0.55 + i * 0.16), sceneTime * (1.2 + i * 0.4), sceneTime * (1.2 + i * 0.4) + 2.4);
          ctx.stroke();
        }
        ctx.restore();
      } else if (e.type === 'freeze') {
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = '#bdeeff';
        ctx.lineWidth = 5 * (1 - t);
        ctx.beginPath(); ctx.arc(e.x, e.y, 30 + t * 280, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (e.type === 'ghostGun') {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.globalAlpha = (1 - t) * 0.7;
        ctx.fillStyle = '#1f2124';
        rr(ctx, -8, -6, 38, 12, 3); ctx.fill();
        rr(ctx, -1, 5, 11, 17, 2); ctx.fill();
        ctx.restore();
      }
    }
  }

  // ---------------------------------------------------------------- render: overlays
  function drawWorldCursor() {
    if (!state.pointer.inside || state.drawerOpen) return;
    const item = getItem(state.tool);
    if (!item || item.id === 'hand') return;
    const w = { x: state.pointer.worldX, y: state.pointer.worldY };
    if (item.cat === 'weapons' || item.cat === 'fun') {
      if (item.cat === 'weapons' && ['pistol', 'rocket', 'minigun', 'flame'].includes(item.kind)) {
        const r = nearestRagdoll(w, 1100, false);
        if (r) {
          const from = handPoint(r);
          ctx.save();
          ctx.globalAlpha = 0.24;
          ctx.strokeStyle = '#9edb2f';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 10]);
          ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(w.x, w.y); ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }
    const cv = thumbFor(item);
    if (item.cat === 'living') {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(w.x, WORLD.groundY + 4, 30, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.58;
      ctx.drawImage(cv, w.x - 44, WORLD.groundY - 76, 88, 88);
      ctx.restore();
    } else if (item.cat === 'build') {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(w.x, WORLD.groundY + 4, 32, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(cv, w.x - 40, w.y - 40, 80, 80);
      ctx.restore();
    }
  }

  function drawScreenOverlay() {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.34, W / 2, H / 2, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.1)');
    g.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const topG = ctx.createLinearGradient(0, 0, 0, H * 0.17);
    topG.addColorStop(0, 'rgba(8,9,10,0.32)');
    topG.addColorStop(1, 'rgba(8,9,10,0)');
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, W, H * 0.17);
    const botG = ctx.createLinearGradient(0, H * 0.78, 0, H);
    botG.addColorStop(0, 'rgba(8,9,10,0)');
    botG.addColorStop(1, 'rgba(8,9,10,0.32)');
    ctx.fillStyle = botG;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);

    if (state.pointer.inside && !state.drawerOpen) {
      const item = getItem(state.tool);
      if (item && item.id !== 'hand' && (item.cat === 'weapons' || item.cat === 'fun')) {
        const x = state.pointer.x;
        const y = state.pointer.y;
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = '#eaffd1';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(158,219,47,0.95)';
        ctx.lineWidth = 2.5;
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          ctx.beginPath();
          ctx.moveTo(dx * 16, dy * 16);
          ctx.lineTo(dx * 23, dy * 23);
          ctx.stroke();
        }
        ctx.fillStyle = '#9edb2f';
        ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    if (flash > 0.005) {
      ctx.fillStyle = `rgba(${flashColor},${clamp(flash, 0, 1) * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  function render(now) {
    const s = scale * camera.zoom;
    const sx = shake > 0.15 ? Math.sin(now * 0.07) * shake : 0;
    const sy = shake > 0.15 ? Math.cos(now * 0.093) * shake * 0.7 : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#4b4c50';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 + sx, H / 2 - UI_OFFSET_Y + sy);
    ctx.scale(s, s);
    ctx.translate(-camera.x, -camera.y);
    const view = {
      left: camera.x - W / (2 * s) - 40,
      right: camera.x + W / (2 * s) + 40,
      top: camera.y - H / (2 * s) + UI_OFFSET_Y / s - 40,
      bottom: camera.y + H / (2 * s) + UI_OFFSET_Y / s + 40
    };
    renderWorld(view);
    drawWorldCursor();
    ctx.restore();
    drawScreenOverlay();
  }

  // ---------------------------------------------------------------- main loop
  let lastFrame = performance.now();
  let accumulator = 0;
  const STEP = 1 / 60;

  function frame(now) {
    const raw = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!state.paused) {
      accumulator += raw;
      let steps = 0;
      while (accumulator >= STEP && steps < 3) {
        Engine.update(engine, STEP * 1000);
        update(STEP);
        accumulator -= STEP;
        steps++;
      }
      if (steps === 3) accumulator = 0;
    }
    render(now);
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- thumbnails art
  function drawThumbArt(c, item) {
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.beginPath();
    c.ellipse(0, 34, 30, 6, 0, 0, Math.PI * 2);
    c.fill();

    if (item.cat === 'hand') {
      c.save();
      c.translate(0, 2);
      c.fillStyle = '#e7e4d8';
      c.strokeStyle = '#232426';
      c.lineWidth = 3;
      rr(c, -20, -8, 38, 30, 10);
      c.fill(); c.stroke();
      for (let i = 0; i < 4; i++) {
        rr(c, -17 + i * 9, -31, 7, 28, 3.5);
        c.fill(); c.stroke();
      }
      c.save();
      c.translate(-19, 2);
      c.rotate(-0.45);
      rr(c, -17, -7, 22, 11, 5);
      c.fill(); c.stroke();
      c.restore();
      c.fillStyle = 'rgba(0,0,0,0.1)';
      rr(c, -14, 6, 26, 5, 2); c.fill();
      c.restore();
      return;
    }

    if (item.cat === 'living') {
      const pal = PALETTES[item.pal] || PALETTES.green;
      c.save();
      c.translate(0, -1);
      c.strokeStyle = pal.line;
      c.lineWidth = 4;
      c.fillStyle = pal.base;
      for (const x of [-7, 7]) {
        rr(c, x - 3.5, 12, 7, 23, 3); c.fill(); c.stroke();
        c.fillStyle = pal.dark;
        rr(c, x - 5, 32, 13, 5, 2); c.fill();
        c.fillStyle = pal.base;
      }
      for (const x of [-12, 12]) {
        rr(c, x - 3.5, -10, 7, 24, 3); c.fill(); c.stroke();
      }
      c.fillStyle = pal.base;
      rr(c, -10, -17, 20, 35, 7); c.fill(); c.stroke();
      c.fillStyle = pal.light;
      c.globalAlpha = 0.35;
      rr(c, -6, -13, 4, 26, 2); c.fill();
      c.globalAlpha = 1;
      c.fillStyle = pal.base;
      rr(c, -14, -42, 28, 25, 8); c.fill(); c.stroke();
      c.fillStyle = pal.light;
      c.globalAlpha = 0.32;
      rr(c, -11, -39, 22, 5, 2); c.fill();
      c.globalAlpha = 1;
      c.fillStyle = '#15170c';
      rr(c, -8, -32, 4, 6, 1.5); c.fill();
      rr(c, 4, -32, 4, 6, 1.5); c.fill();
      c.strokeStyle = '#15170c';
      c.lineWidth = 1.8;
      c.beginPath(); c.arc(0, -23, 4, 0.2, Math.PI - 0.2); c.stroke();
      if (pal.type !== 'blueberry') {
        c.fillStyle = '#4e7714';
        c.strokeStyle = '#243706';
        c.lineWidth = 1;
        c.beginPath(); c.ellipse(6, -44, 5, 2.4, -0.35, 0, Math.PI * 2); c.fill(); c.stroke();
      }
      c.restore();
    } else if (item.cat === 'weapons') {
      drawWeaponThumb(c, item.kind);
    } else if (item.cat === 'build') {
      drawBuildThumb(c, item.kind);
    } else if (item.cat === 'fun') {
      drawFunThumb(c, item.kind);
    }
  }

  function drawWeaponThumb(c, kind) {
    c.save();
    if (kind === 'pistol') {
      c.rotate(-0.18);
      c.fillStyle = '#2d3034';
      c.strokeStyle = '#0f1012';
      c.lineWidth = 2.5;
      rr(c, -27, -11, 51, 18, 4); c.fill(); c.stroke();
      c.fillStyle = '#46494d';
      rr(c, -23, -7, 27, 4, 2); c.fill();
      c.fillStyle = '#232529';
      c.beginPath();
      c.moveTo(-9, 6); c.lineTo(8, 6); c.lineTo(2, 27); c.lineTo(-13, 27); c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = '#c9a22d';
      c.fillRect(14, 4, 5, 4);
    } else if (kind === 'sword' || kind === 'katana') {
      c.rotate(-0.7);
      c.strokeStyle = '#3b230e';
      c.lineWidth = 9;
      c.beginPath(); c.moveTo(-31, 0); c.lineTo(-10, 0); c.stroke();
      c.strokeStyle = '#c7c9c6';
      c.lineWidth = kind === 'katana' ? 6 : 9;
      c.beginPath(); c.moveTo(-7, 0); c.lineTo(kind === 'katana' ? 38 : 33, 0); c.stroke();
      c.strokeStyle = '#f6f5eb';
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(-4, -2); c.lineTo(30, -2); c.stroke();
      c.strokeStyle = '#c9a22d';
      c.lineWidth = 5;
      c.beginPath(); c.moveTo(-9, -10); c.lineTo(-9, 10); c.stroke();
      c.fillStyle = '#5b3a18';
      c.beginPath(); c.arc(-31, 0, 5, 0, Math.PI * 2); c.fill();
    } else if (kind === 'axe') {
      c.rotate(-0.5);
      c.strokeStyle = '#6a411b';
      c.lineWidth = 8;
      c.beginPath(); c.moveTo(-28, 0); c.lineTo(25, 0); c.stroke();
      c.fillStyle = '#b0b2b1';
      c.strokeStyle = '#343638';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(14, -19); c.quadraticCurveTo(44, -34, 53, -6); c.lineTo(35, 6); c.lineTo(14, 1); c.closePath();
      c.fill(); c.stroke();
    } else if (kind === 'grenade') {
      c.fillStyle = '#4d6420';
      c.strokeStyle = '#171f08';
      c.lineWidth = 3;
      c.beginPath(); c.arc(0, 6, 24, 0, Math.PI * 2); c.fill(); c.stroke();
      c.strokeStyle = '#a8aaa9';
      c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, 6, 13, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#c9a22d';
      rr(c, -4, -26, 8, 12, 2); c.fill();
      c.strokeStyle = '#c9a22d';
      c.lineWidth = 3;
      c.beginPath(); c.arc(9, -20, 8, Math.PI, Math.PI * 1.8); c.stroke();
    } else if (kind === 'rocket') {
      c.rotate(-0.15);
      c.fillStyle = '#47502e';
      c.strokeStyle = '#171b0d';
      c.lineWidth = 2.5;
      rr(c, -34, -10, 58, 20, 7); c.fill(); c.stroke();
      c.fillStyle = '#22251b';
      c.fillRect(-12, -6, 22, 12);
      c.fillStyle = '#c53b2f';
      c.beginPath(); c.moveTo(24, -10); c.lineTo(41, 0); c.lineTo(24, 10); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#9edb2f';
      c.fillRect(-28, -7, 6, 14);
    } else if (kind === 'minigun') {
      c.fillStyle = '#35383c';
      c.strokeStyle = '#131416';
      c.lineWidth = 2.5;
      rr(c, -33, -16, 40, 32, 6); c.fill(); c.stroke();
      c.fillStyle = '#5b5e61';
      for (let i = -12; i <= 12; i += 6) {
        rr(c, 5, i - 2, 42, 4, 2); c.fill();
      }
      c.fillStyle = '#9edb2f';
      c.fillRect(-28, -11, 5, 22);
    } else if (kind === 'flame') {
      c.fillStyle = '#6c2c19';
      c.strokeStyle = '#29110a';
      c.lineWidth = 2.5;
      rr(c, -28, -14, 42, 28, 9); c.fill(); c.stroke();
      c.fillStyle = '#3a3d40';
      rr(c, 10, -5, 32, 10, 4); c.fill(); c.stroke();
      c.fillStyle = '#9edb2f';
      c.fillRect(-22, -9, 5, 18);
      c.fillStyle = '#ff8b1e';
      c.beginPath();
      c.moveTo(40, -7); c.quadraticCurveTo(55, 0, 40, 7); c.closePath(); c.fill();
    }
    c.restore();
  }

  function drawBuildThumb(c, kind) {
    c.save();
    if (kind === 'crate') {
      c.fillStyle = '#a9743a';
      c.strokeStyle = '#3a220e';
      c.lineWidth = 3;
      rr(c, -25, -25, 50, 50, 4); c.fill(); c.stroke();
      c.strokeStyle = '#7b4c20';
      c.lineWidth = 6;
      c.beginPath(); c.moveTo(-21, -21); c.lineTo(21, 21); c.stroke();
      c.strokeStyle = 'rgba(255,220,150,0.35)';
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(-20, -20); c.lineTo(20, -20); c.stroke();
      c.fillStyle = '#4c4d50';
      for (const [x, y] of [[-25, -25], [17, -25], [-25, 17], [17, 17]]) c.fillRect(x, y, 8, 8);
    } else if (kind === 'barrel') {
      c.fillStyle = '#b7332d';
      c.strokeStyle = '#3b100d';
      c.lineWidth = 3;
      rr(c, -19, -27, 38, 54, 7); c.fill(); c.stroke();
      c.fillStyle = '#4a4b4e';
      c.fillRect(-21, -18, 42, 7);
      c.fillRect(-21, 14, 42, 7);
      c.fillStyle = '#e4b72d';
      c.fillRect(-17, -3, 34, 12);
      c.fillStyle = '#242528';
      for (let i = -16; i < 18; i += 12) {
        c.beginPath(); c.moveTo(i, -3); c.lineTo(i + 6, -3); c.lineTo(i + 12, 9); c.lineTo(i + 6, 9); c.closePath(); c.fill();
      }
    } else if (kind === 'wall') {
      c.fillStyle = '#85867f';
      c.strokeStyle = '#292a29';
      c.lineWidth = 3;
      rr(c, -17, -31, 34, 62, 3); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(44,45,43,0.45)';
      c.lineWidth = 1.4;
      for (let y = -20; y < 30; y += 15) {
        c.beginPath(); c.moveTo(-15, y); c.lineTo(15, y); c.stroke();
      }
      c.fillStyle = '#d5b02b';
      c.fillRect(-16, 22, 32, 7);
      c.fillStyle = '#232427';
      for (let i = -14; i < 18; i += 9) {
        c.beginPath(); c.moveTo(i, 22); c.lineTo(i + 4, 22); c.lineTo(i + 8, 29); c.lineTo(i + 4, 29); c.closePath(); c.fill();
      }
    } else if (kind === 'platform') {
      c.fillStyle = '#66696e';
      c.strokeStyle = '#24262a';
      c.lineWidth = 3;
      rr(c, -34, -9, 68, 18, 3); c.fill(); c.stroke();
      c.fillStyle = '#9edb2f';
      c.fillRect(-30, -7, 60, 3);
      c.fillStyle = '#3b3d40';
      for (let x = -24; x < 28; x += 14) {
        c.beginPath(); c.arc(x, 2, 1.7, 0, Math.PI * 2); c.fill();
      }
    } else if (kind === 'spikes') {
      c.fillStyle = '#43454a';
      c.strokeStyle = '#1d1e21';
      c.lineWidth = 2.5;
      rr(c, -32, 8, 64, 12, 3); c.fill(); c.stroke();
      for (let i = 0; i < 6; i++) {
        const x = -30 + i * 10;
        c.fillStyle = '#c7c9c6';
        c.beginPath();
        c.moveTo(x, 8); c.lineTo(x + 5, -14); c.lineTo(x + 10, 8); c.closePath(); c.fill(); c.stroke();
      }
    } else if (kind === 'trampoline') {
      c.fillStyle = '#34363a';
      c.strokeStyle = '#161719';
      c.lineWidth = 3;
      rr(c, -30, -9, 60, 19, 5); c.fill(); c.stroke();
      c.fillStyle = '#7fba1f';
      c.strokeStyle = '#1f3007';
      c.lineWidth = 2;
      rr(c, -25, -6, 50, 13, 4); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fillRect(-20, -4, 40, 2);
      c.strokeStyle = '#2a2b2e';
      c.lineWidth = 4;
      c.beginPath(); c.moveTo(-18, 10); c.lineTo(-11, 23); c.moveTo(18, 10); c.lineTo(11, 23); c.stroke();
    }
    c.restore();
  }

  function drawFunThumb(c, kind) {
    c.save();
    if (kind === 'blackhole') {
      const g = c.createRadialGradient(0, 0, 2, 0, 0, 30);
      g.addColorStop(0, '#000');
      g.addColorStop(0.55, '#1a072f');
      g.addColorStop(0.8, 'rgba(138,68,220,0.7)');
      g.addColorStop(1, 'rgba(138,68,220,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(0, 0, 32, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(200,145,255,0.75)';
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath(); c.arc(0, 0, 12 + i * 7, i, i + 3.4); c.stroke();
      }
    } else if (kind === 'meteor') {
      c.strokeStyle = 'rgba(255,120,20,0.35)';
      c.lineWidth = 13;
      c.beginPath(); c.moveTo(-24, 26); c.lineTo(4, -2); c.stroke();
      c.fillStyle = '#ff7b1a';
      c.beginPath(); c.arc(8, -8, 24, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3f352e';
      c.strokeStyle = '#17120f';
      c.lineWidth = 2.5;
      c.beginPath(); c.arc(8, -8, 18, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#6e5c4b';
      c.beginPath(); c.arc(2, -14, 4, 0, Math.PI * 2); c.fill();
    } else if (kind === 'lightning') {
      c.fillStyle = '#e9faff';
      c.strokeStyle = '#5fb7ff';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(5, -36); c.lineTo(-17, 2); c.lineTo(-1, 2); c.lineTo(-12, 36); c.lineTo(21, -8); c.lineTo(4, -8); c.closePath();
      c.fill(); c.stroke();
    } else if (kind === 'freeze') {
      c.strokeStyle = '#bdeeff';
      c.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI / 3;
        c.beginPath();
        c.moveTo(Math.cos(a) * -30, Math.sin(a) * -30);
        c.lineTo(Math.cos(a) * 30, Math.sin(a) * 30);
        c.stroke();
      }
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const x = Math.cos(a) * 22;
        const y = Math.sin(a) * 22;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + 0.7) * 7, y + Math.sin(a + 0.7) * 7); c.stroke();
      }
    } else if (kind === 'gravity') {
      c.strokeStyle = '#9edb2f';
      c.lineWidth = 5;
      for (const x of [-15, 0, 15]) {
        c.beginPath(); c.moveTo(x, 24); c.lineTo(x, -22); c.stroke();
        c.beginPath(); c.moveTo(x - 8, -12); c.lineTo(x, -24); c.lineTo(x + 8, -12); c.stroke();
      }
      c.fillStyle = 'rgba(158,219,47,0.18)';
      c.beginPath(); c.arc(0, 0, 34, 0, Math.PI * 2); c.fill();
    } else if (kind === 'nuke') {
      c.fillStyle = '#2b2d30';
      c.strokeStyle = '#0d0e0f';
      c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, 9, 23, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#d9d8d0';
      c.beginPath(); c.arc(0, 9, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2b2d30';
      c.beginPath(); c.arc(0, 9, 3, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2 - Math.PI / 2;
        c.beginPath();
        c.moveTo(0, 9);
        c.arc(0, 9, 12, a, a + 0.55);
        c.closePath(); c.fill();
      }
      c.strokeStyle = '#c9a22d';
      c.lineWidth = 3;
      c.beginPath(); c.moveTo(11, -12); c.quadraticCurveTo(25, -26, 11, -34); c.stroke();
      c.fillStyle = '#ff5b22';
      c.beginPath(); c.arc(10, -35, 3.5, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  // ---------------------------------------------------------------- boot
  function boot() {
    initTextures();
    resize();
    buildUI();
    createInitialScene();
    ready = true;
    window.__melonReady = true;
    window.__melon = {
      engine, world, ragdolls, props, projectiles, particles, effects,
      spawnRagdoll: (x, pal) => createRagdoll(x ?? 800, WORLD.groundY, pal || 'green'),
      explode,
      reset: resetScene,
      state
    };
    requestAnimationFrame(frame);
  }

  boot();
})();



