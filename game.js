'use strict';
/* ============================================================
   MEND — a thumb-sized phone repair game
   ============================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

/* ---------------- audio ---------------- */
let actx = null, noiseBuf = null;
function audioUnlock() {
  if (!actx) {
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const len = actx.sampleRate * 0.6;
    noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (actx.state === 'suspended') actx.resume();
}
function tone(freq, dur = .1, type = 'sine', vol = .05, slide = 0, delay = 0) {
  if (!actx || state.muted) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(20, freq), t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + .008);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t); o.stop(t + dur + .03);
}
function noise(dur = .12, freq = 1400, vol = .04, type = 'bandpass', q = 1) {
  if (!actx || state.muted || !noiseBuf) return;
  const t = actx.currentTime;
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f).connect(g).connect(actx.destination);
  s.start(t); s.stop(t + dur + .02);
}
const sfx = {
  tap()   { tone(620, .045, 'triangle', .035); tone(980, .035, 'sine', .018, 0, .01); },
  click() { tone(1100, .025, 'square', .012); },
  screw() { noise(.09, 3000, .028, 'highpass'); tone(240, .05, 'square', .012); },
  crack() { noise(.07, 3600, .03, 'highpass'); },
  heat()  { noise(.09, 900, .018, 'lowpass'); },
  pop()   { tone(190, .13, 'sine', .07, 75); noise(.05, 900, .02); },
  suction(){ noise(.22, 420, .028, 'lowpass'); tone(280, .18, 'sine', .022, 170); },
  snap()  { tone(120, .06, 'square', .045, 65); noise(.05, 1800, .025); },
  connect(){ tone(320, .06, 'square', .02); tone(640, .09, 'sine', .03, 900, .05); },
  drop()  { tone(140, .12, 'sawtooth', .035, 90); },
  error() { tone(150, .17, 'sawtooth', .04, 95); },
  win()   { [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, 'sine', .045, 0, i * .07)); },
  boot()  { [330, 440, 554, 660, 880].forEach((f, i) => tone(f, .16, 'sine', .04, 0, i * .11)); },
  cash()  { tone(1180, .09, 'triangle', .04); tone(1560, .14, 'triangle', .035, 0, .07); noise(.05, 2600, .02); },
  bell()  { tone(1320, .13, 'sine', .03); tone(1760, .18, 'sine', .022, 0, .09); },
  step()  { tone(120, .07, 'sine', .02, 90); noise(.05, 500, .012); },
  heart() { tone(880, .12, 'sine', .035); tone(1320, .18, 'sine', .03, 0, .06); },
  tick()  { tone(1400, .02, 'square', .008); }
};

/* ---------------- content ---------------- */
const KITS = {
  screen:  { name: 'Screen assembly', desc: 'Glass + OLED panel', icon: 'screen' },
  battery: { name: 'Battery cell', desc: '4,200 mAh Li-ion', icon: 'battery' },
  camera:  { name: 'Camera module', desc: 'Lens + 48 MP sensor', icon: 'camera' },
  port:    { name: 'Charging port', desc: 'USB-C flex cable', icon: 'port' },
  speaker: { name: 'Speaker unit', desc: 'Earpiece + loudspeaker', icon: 'speaker' },
  dry:     { name: 'Deep clean & dry', desc: 'Ultrasonic bath', icon: 'water' }
};

const CUSTOMERS = [
  { name: 'Maya',  skin: '#c98a63', hair: '#2a1712', shirt: '#2f6f6a', style: 'bob',    glasses: false, bg: '#123039' },
  { name: 'Devon', skin: '#8a5a3c', hair: '#161616', shirt: '#6b3b5a', style: 'short',  glasses: true,  bg: '#1c2a3c' },
  { name: 'Priya', skin: '#b97850', hair: '#1b1210', shirt: '#3c5d8a', style: 'bun',    glasses: false, bg: '#1d2a34' },
  { name: 'Jonas', skin: '#e0b090', hair: '#c9a15a', shirt: '#4a6b3c', style: 'short',  glasses: false, bg: '#1a2e2a' },
  { name: 'Kiki',  skin: '#6b432c', hair: '#3b1f2e', shirt: '#b5533c', style: 'curly',  glasses: false, bg: '#2a1c2a' },
  { name: 'Omar',  skin: '#a86b47', hair: '#1c1c1c', shirt: '#2f4a6b', style: 'short',  glasses: true,  bg: '#152530' },
  { name: 'Lena',  skin: '#f0c8a8', hair: '#b98f4e', shirt: '#7a4a6b', style: 'long',   glasses: false, bg: '#2a1d2c' },
  { name: 'Theo',  skin: '#c98f68', hair: '#4a2e1a', shirt: '#4c6b5a', style: 'curly',  glasses: false, bg: '#182c2a' }
];

const JOBS = [
  {
    id: 'screen', kit: 'screen', phone: 'NOVA 12 Pro', part: 'screen', pay: 120,
    clue: 'Shattered glass, dead touch.',
    complaints: [
      'I dropped it face-down on the pavement. The whole screen is a spiderweb and half the touch is dead!',
      'It fell off my bike mount. There is glass in my pocket and I can barely read my messages. Help!'
    ],
    quotes: ['You are a lifesaver! It looks brand new.', 'That was fast. My photos are safe, right?'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'cracks', need: 520, title: 'Scrape off the shattered glass', sub: 'Rub across the cracks to clear the shards', tool: 'Suction cup' },
      { type: 'dragOut', part: 'screen', title: 'Lift off the dead display', sub: 'Drag the old screen into the parts tray', tool: 'Pry pick' },
      { type: 'dragIn', part: 'screen', title: 'Fit the new display', sub: 'Drag the fresh panel onto the frame', tool: 'Tweezers' },
      { type: 'hold', target: 'screen', need: 850, title: 'Seat the new screen', sub: 'Press and hold to set the adhesive', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Testing display, touch and sensors', tool: 'Diagnostics' }
    ]
  },
  {
    id: 'battery', kit: 'battery', phone: 'NOVA 12 Pro', part: 'battery', pay: 85,
    clue: 'Dies early. Runs hot. Needs a cell.',
    complaints: [
      'It dies at 40% and shuts down. I cannot get through lunch without a charger. It gets super hot too.',
      'The battery drains in an hour and the back is bulging. I think the cell is toast.'
    ],
    quotes: ['It has not dropped below 90% all afternoon. Amazing.', 'I can finally leave the house without a power bank.'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'edges', need: 470, title: 'Heat the display adhesive', sub: 'Rub around the edges to soften the glue', tool: 'Heat mat' },
      { type: 'open', title: 'Lift the display', sub: 'Mind the ribbon cable underneath', tool: 'Suction cup' },
      { type: 'rub', visual: 'battery', need: 380, title: 'Free the battery adhesive', sub: 'Rub across the cell to peel the strips', tool: 'Spudger' },
      { type: 'dragOut', part: 'battery', title: 'Lift out the old cell', sub: 'Drag the battery into the parts tray', tool: 'Spudger' },
      { type: 'dragIn', part: 'battery', title: 'Drop in the new cell', sub: 'Drag the fresh battery onto the chassis', tool: 'Tweezers' },
      { type: 'hold', target: 'battery', need: 850, title: 'Connect the battery flex', sub: 'Press and hold the connector', tool: 'Spudger' },
      { type: 'hold', target: 'screen', need: 700, title: 'Snap the display back down', sub: 'Press and hold to reseat the screen', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Running a battery health check', tool: 'Diagnostics' }
    ]
  },
  {
    id: 'camera', kit: 'camera', phone: 'NOVA 12 Pro', part: 'camera', pay: 110,
    clue: 'Blurry photos. Cracked lens.',
    complaints: [
      'Every photo comes out blurry and there is a crack over the lens. My vacation starts Friday!',
      'The camera rattles and refuses to focus. I need it fixed before the concert tonight.'
    ],
    quotes: ['Sharp as ever. The concert photos are going to be great.', 'Finally, no more blurry food pics. Thank you!'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'edges', need: 470, title: 'Heat the display adhesive', sub: 'Rub around the edges to soften the glue', tool: 'Heat mat' },
      { type: 'open', title: 'Lift the display', sub: 'Mind the ribbon cable underneath', tool: 'Suction cup' },
      { type: 'dragOut', part: 'camera', title: 'Unclip the camera module', sub: 'Drag the dead module into the tray', tool: 'Spudger' },
      { type: 'dragIn', part: 'camera', title: 'Snap in the new module', sub: 'Drag the fresh camera onto its socket', tool: 'Tweezers' },
      { type: 'hold', target: 'camera', need: 800, title: 'Seat the camera flex', sub: 'Press and hold the connector down', tool: 'Spudger' },
      { type: 'hold', target: 'screen', need: 700, title: 'Snap the display back down', sub: 'Press and hold to reseat the screen', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Testing focus and stabilization', tool: 'Diagnostics' }
    ]
  },
  {
    id: 'port', kit: 'port', phone: 'NOVA 12 Pro', part: 'port', pay: 70,
    clue: 'Charges only at a weird angle.',
    complaints: [
      'It only charges if I hold the cable at a weird angle. I have tried three different cables!',
      'There is pocket lint jammed in the port and now it will not connect at all.'
    ],
    quotes: ['Charges first try, every time. You are a wizard.', 'I can finally stop borrowing everyone\'s charger.'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'edges', need: 470, title: 'Heat the display adhesive', sub: 'Rub around the edges to soften the glue', tool: 'Heat mat' },
      { type: 'open', title: 'Lift the display', sub: 'Mind the ribbon cable underneath', tool: 'Suction cup' },
      { type: 'rub', visual: 'port', need: 420, title: 'Scrub out the lint', sub: 'Rub the port with the brush to clear it', tool: 'Anti-static brush' },
      { type: 'dragOut', part: 'port', title: 'Pull the dead port flex', sub: 'Drag the old port into the tray', tool: 'Spudger' },
      { type: 'dragIn', part: 'port', title: 'Fit the new port flex', sub: 'Drag the new USB-C port into place', tool: 'Tweezers' },
      { type: 'hold', target: 'port', need: 800, title: 'Solder the port down', sub: 'Press and hold to bond the contacts', tool: 'Hot iron' },
      { type: 'hold', target: 'screen', need: 700, title: 'Snap the display back down', sub: 'Press and hold to reseat the screen', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Testing charge and data pins', tool: 'Diagnostics' }
    ]
  },
  {
    id: 'speaker', kit: 'speaker', phone: 'NOVA 12 Pro', part: 'speaker', pay: 75,
    clue: 'Muffled calls. Crackly sound.',
    complaints: [
      'Calls sound muffled and the speaker crackles at full volume. People can barely hear me.',
      'No sound comes out unless I put it on speaker. The earpiece is completely dead.'
    ],
    quotes: ['Crystal clear. I can hear my mum complain again.', 'The crackle is gone. My podcasts sound perfect.'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'edges', need: 470, title: 'Heat the display adhesive', sub: 'Rub around the edges to soften the glue', tool: 'Heat mat' },
      { type: 'open', title: 'Lift the display', sub: 'Mind the ribbon cable underneath', tool: 'Suction cup' },
      { type: 'dragOut', part: 'speaker', title: 'Free the blown speaker', sub: 'Drag the old speaker into the tray', tool: 'Spudger' },
      { type: 'dragIn', part: 'speaker', title: 'Fit the new speaker', sub: 'Drag the fresh unit onto the chassis', tool: 'Tweezers' },
      { type: 'hold', target: 'speaker', need: 800, title: 'Press the speaker home', sub: 'Hold to seat the contacts', tool: 'Spudger' },
      { type: 'hold', target: 'screen', need: 700, title: 'Snap the display back down', sub: 'Press and hold to reseat the screen', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Testing earpiece and loudspeaker', tool: 'Diagnostics' }
    ]
  },
  {
    id: 'water', kit: 'dry', phone: 'NOVA 12 Pro', part: 'battery', pay: 95,
    clue: 'Liquid damage. Dead. Corrosion.',
    complaints: [
      'It went for a swim in the sink. It is completely dead and there is water behind the screen.',
      'Coffee went everywhere. Now it will not turn on and the buttons are sticky.'
    ],
    quotes: ['I cannot believe it came back to life. Thank you!', 'Dry, clean, and working. You saved my whole week.'],
    steps: [
      { type: 'screw', title: 'Remove the pentalobe screws', sub: 'Tap both screws at the bottom edge', tool: 'Pentalobe driver' },
      { type: 'rub', visual: 'edges', need: 470, title: 'Heat the display adhesive', sub: 'Rub around the edges to soften the glue', tool: 'Heat mat' },
      { type: 'open', title: 'Lift the display', sub: 'Mind the ribbon cable underneath', tool: 'Suction cup' },
      { type: 'rub', visual: 'water', need: 520, title: 'Blot the water out', sub: 'Rub the cloth across the soaked chassis', tool: 'Microfibre cloth' },
      { type: 'rub', visual: 'corrosion', need: 450, title: 'Scrub off the corrosion', sub: 'Brush the green gunk off the board', tool: 'Anti-static brush' },
      { type: 'hold', target: 'battery', need: 750, title: 'Reconnect the battery', sub: 'Press and hold the flex connector', tool: 'Spudger' },
      { type: 'hold', target: 'screen', need: 700, title: 'Snap the display back down', sub: 'Press and hold to reseat the screen', tool: 'Roller' },
      { type: 'boot', title: 'Power on the phone', sub: 'Checking for liquid damage faults', tool: 'Diagnostics' }
    ]
  }
];

const UPGRADES = [
  { id: 'tools', name: 'Precision Kit', desc: '-8% repair timer per level', icon: 'tools', max: 3, costs: [120, 220, 340] },
  { id: 'sign',  name: 'Neon Sign',     desc: '+12% pay per level',        icon: 'sign',  max: 3, costs: [100, 190, 300] },
  { id: 'bench', name: 'Coffee Machine',desc: '+1 starting heart per level', icon: 'coffee', max: 2, costs: [150, 280] }
];

/* ---------------- dom ---------------- */
const app = $('#app');
const phone = $('#phone');
const screenLayer = $('#screenLayer');
const cracks = $('#cracks');
const interior = $('#interior');
const bench = $('#bench');
const tray = $('#tray');
const traySlot = $('#traySlot');
const trayStatus = $('#trayStatus');
const screwCup = $('#screwCup');
const fxLayer = $('#fxLayer');
const hintLayer = $('#hintLayer');
const hudDay = $('#hudDay'), hudMoney = $('#hudMoney');
const customerBar = $('#customerBar'), avatarEl = $('#avatar'), custName = $('#custName'),
      custTag = $('#custTag'), custLine = $('#custLine'), heartsEl = $('#hearts'),
      patienceFill = $('#patienceFill');
const stepDots = $('#stepDots'), stepTitle = $('#stepTitle'), stepSub = $('#stepSub'),
      stepBar = $('#stepBar'), toolChip = $('#toolChip'), actionBtn = $('#actionBtn');
const diagSheet = $('#diagSheet'), kitList = $('#kitList'), diagHint = $('#diagHint');
const paySheet = $('#paySheet'), payTitle = $('#payTitle'), payStars = $('#payStars'),
      payQuote = $('#payQuote'), payRows = $('#payRows'), payNext = $('#payNext');
const failSheet = $('#failSheet'), failAvatar = $('#failAvatar'), failText = $('#failText'),
      failTip = $('#failTip'), failNext = $('#failNext');
const daySheet = $('#daySheet'), dayNum = $('#dayNum'), statRepairs = $('#statRepairs'),
      statEarned = $('#statEarned'), statRating = $('#statRating'), upgradeList = $('#upgradeList'),
      upgradeMoney = $('#upgradeMoney'), nextDayBtn = $('#nextDayBtn');
const menuScreen = $('#menuScreen'), playBtn = $('#playBtn'), menuSave = $('#menuSave'),
      howSheet = $('#howSheet'), settingsSheet = $('#settingsSheet'), soundState = $('#soundState'),
      toastEl = $('#toast'), dayBanner = $('#dayBanner');
const shopScene = $('#shopScene'), visitorFigure = $('#visitorFigure'), askBubble = $('#askBubble'),
      askName = $('#askName'), askTag = $('#askTag'), askLine = $('#askLine'),
      acceptBtn = $('#acceptBtn'), shopPhone = $('#shopPhone'), lockName = $('#lockName');

/* ---------------- state ---------------- */
const SAVE_KEY = 'mend.save.v2';
const state = {
  day: 1, coins: 0, repSum: 0, repCount: 0,
  upgrades: { tools: 0, sign: 0, bench: 0 },
  muted: false,
  phase: 'menu',
  job: null, customer: null,
  stepIndex: 0, stepDone: false,
  patience: 1, hearts: 3, maxHearts: 3, mistakes: 0,
  jobsTotal: 2, jobsDone: 0, jobsWon: 0, earnedToday: 0,
  timerOn: false, sheetOpen: false, started: false,
  queue: [], lastCustomer: null, todayStars: [], complaint: '',
  saveDay: 0, hasSave: false
};

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || typeof d.day !== 'number') return false;
    state.day = Math.max(1, d.day | 0);
    state.coins = Math.max(0, d.coins | 0);
    state.repSum = Math.max(0, d.repSum | 0);
    state.repCount = Math.max(0, d.repCount | 0);
    state.upgrades = Object.assign({ tools: 0, sign: 0, bench: 0 }, d.upgrades || {});
    state.muted = !!d.muted;
    state.hasSave = true;
    return true;
  } catch (e) { return false; }
}
function saveGame(nextDay) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      day: nextDay || state.day, coins: state.coins, repSum: state.repSum, repCount: state.repCount,
      upgrades: state.upgrades, muted: state.muted
    }));
    state.hasSave = true;
  } catch (e) {}
}

/* ---------------- small UI helpers ---------------- */
let toastTimer = null;
function toast(text, kind = '') {
  toastEl.textContent = text;
  toastEl.className = 'toast show ' + kind;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast ' + kind; }, 2100);
}
function showSheet(el) { el.classList.add('show'); state.sheetOpen = true; }
function hideSheet(el) { el.classList.remove('show'); state.sheetOpen = false; }
function updateMoney() { hudMoney.textContent = money(state.coins); }
function updateDay() { hudDay.textContent = 'DAY ' + state.day; }
function rating() { return state.repCount ? (state.repSum / state.repCount) : 5; }
function icon(name, cls = '') { return `<svg class="ic ${cls}"><use href="#i-${name}"/></svg>`; }

/* ---------------- avatars ---------------- */
function avatarSVG(c, mood = 'ok') {
  const m = mood || 'ok';
  const mouth = {
    happy:   'M23 31.5c1.6 2 6.4 2 8 0',
    ok:      'M24.2 32.2h7.6',
    worried: 'M23.5 33.6c1.8-1.7 6.2-1.7 8 0',
    angry:   'M23.2 34c2-2.4 6.6-2.4 8.6 0'
  }[m] || 'M24.2 32.2h7.6';
  const eyes = m === 'happy'
    ? `<path d="M21.8 26c.8-1.2 2.4-1.2 3.2 0M30.8 26c.8-1.2 2.4-1.2 3.2 0" fill="none" stroke="#1b1210" stroke-width="1.2" stroke-linecap="round"/>`
    : `<circle cx="23.4" cy="26" r="1.15" fill="#1b1210"/><circle cx="32.6" cy="26" r="1.15" fill="#1b1210"/>`;
  const brows = m === 'angry'
    ? `<path d="M20.6 22.7l4.4 1.1M35.4 22.7l-4.4 1.1" stroke="#1b1210" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>`
    : m === 'worried'
      ? `<path d="M20.8 23.3l4.2-1M35.2 23.3l-4.2-1" stroke="#1b1210" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>`
      : '';
  let hair = '';
  if (c.style === 'bob') {
    hair = `<path d="M16.2 27.5c0-9 5.2-15 11.8-15s11.8 6 11.8 15v6.5h-3.8V26c-2.6 2.2-13.4 2.2-16 0v8h-3.8z" fill="${c.hair}"/>`;
  } else if (c.style === 'short') {
    hair = `<path d="M16.6 24.5c0-8.2 5-13.5 11.4-13.5s11.4 5.3 11.4 13.5c-1.7-3.8-4.6-5.2-11.4-5.2s-9.7 1.4-11.4 5.2z" fill="${c.hair}"/>`;
  } else if (c.style === 'bun') {
    hair = `<circle cx="28" cy="9" r="4.6" fill="${c.hair}"/><path d="M16.6 25c0-8.6 5-14 11.4-14s11.4 5.4 11.4 14c-1.9-4-4.8-5.5-11.4-5.5s-9.5 1.5-11.4 5.5z" fill="${c.hair}"/>`;
  } else if (c.style === 'curly') {
    hair = `<g fill="${c.hair}"><circle cx="20.5" cy="17.5" r="6.2"/><circle cx="28" cy="13.2" r="7"/><circle cx="35.5" cy="17.5" r="6.2"/><circle cx="17.2" cy="24.5" r="4"/><circle cx="38.8" cy="24.5" r="4"/></g>`;
  } else {
    hair = `<path d="M15.8 28c0-9.5 5.4-15.5 12.2-15.5S40.2 18.5 40.2 28v11.5c0 1.6-2.4 2.2-3.6.6V26c-2.6 2.3-13.6 2.3-16.2 0v14.1c-1.2 1.6-3.6 1-3.6-.6z" fill="${c.hair}"/>`;
  }
  const glasses = c.glasses
    ? `<g fill="none" stroke="#101a1e" stroke-width="1" opacity=".8"><rect x="18.4" y="22.8" width="8" height="6.4" rx="2.4"/><rect x="29.6" y="22.8" width="8" height="6.4" rx="2.4"/><path d="M26.4 25.2h3.2"/></g>`
    : '';
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" fill="${c.bg}"/>
    <circle cx="42" cy="12" r="18" fill="#ffffff0d"/>
    <circle cx="10" cy="48" r="14" fill="#ffffff08"/>
    <path d="M6 56c.8-8.6 8.2-13.6 22-13.6S49.2 47.4 50 56z" fill="${c.shirt}"/>
    <path d="M23.5 37h9v6.2c0 2.8-9 2.8-9 0z" fill="${c.skin}" opacity=".9"/>
    <circle cx="16.6" cy="26.5" r="2.6" fill="${c.skin}"/><circle cx="39.4" cy="26.5" r="2.6" fill="${c.skin}"/>
    <ellipse cx="28" cy="25.5" rx="11.6" ry="12.4" fill="${c.skin}"/>
    <ellipse cx="21" cy="29.4" rx="2.6" ry="1.4" fill="#ff7a6a" opacity=".22"/>
    <ellipse cx="35" cy="29.4" rx="2.6" ry="1.4" fill="#ff7a6a" opacity=".22"/>
    ${hair}${eyes}${brows}
    <path d="M28 27.4v2.2" stroke="#00000022" stroke-width="1" stroke-linecap="round"/>
    <path d="${mouth}" fill="none" stroke="#3a1a14" stroke-width="1.4" stroke-linecap="round"/>
    ${glasses}
    <path d="M25.5 40.2c0 2 1.1 3.2 2.5 3.2s2.5-1.2 2.5-3.2" fill="#ffffff18" stroke="#ffffff22" stroke-width=".6"/>
  </svg>`;
}
function renderAvatar(mood) {
  if (!state.customer) return;
  avatarEl.innerHTML = avatarSVG(state.customer, mood || state.mood || 'ok');
}
function renderHearts() {
  let out = '';
  for (let i = 0; i < state.maxHearts; i++) {
    out += `<svg class="ic fill ${i < state.hearts ? '' : 'off'}"><use href="#i-heart"/></svg>`;
  }
  heartsEl.innerHTML = out;
}

/* ---------------- menu ---------------- */
function refreshMenu() {
  if (state.hasSave) {
    playBtn.querySelector('span').textContent = `Continue — Day ${state.day}`;
    menuSave.textContent = `SAVED · DAY ${state.day} · ${money(state.coins)}`;
  } else {
    playBtn.querySelector('span').textContent = 'Start shift';
    menuSave.textContent = 'NO SAVE';
  }
  const use = state.muted ? 'sound-off' : 'sound-on';
  $$('#soundBtn use, #soundRow use').forEach(u => u.setAttribute('href', '#i-' + use));
  if (soundState) soundState.textContent = state.muted ? 'OFF' : 'ON';
}
function openMenu() {
  state.phase = 'menu';
  state.timerOn = false;
  state.sheetOpen = false;
  $$('.sheet-wrap').forEach(s => s.classList.remove('show'));
  menuScreen.style.display = 'flex';
  requestAnimationFrame(() => menuScreen.classList.remove('out'));
  refreshMenu();
}
function startShift() {
  audioUnlock();
  menuScreen.classList.add('out');
  setTimeout(() => { menuScreen.style.display = 'none'; }, 420);
  state.started = true;
  updateMoney(); updateDay();
  startDay();
}

/* ---------------- day loop ---------------- */
function startDay() {
  state.jobsTotal = state.day <= 1 ? 2 : 3;
  state.jobsDone = 0; state.jobsWon = 0; state.earnedToday = 0; state.todayStars = [];
  state.queue = shuffle(JOBS).slice(0, state.jobsTotal);
  state.phase = 'dayIntro';
  state.timerOn = false;
  updateDay(); updateMoney();
  dayBanner.querySelector('b').textContent = 'DAY ' + state.day;
  dayBanner.querySelector('span').textContent = state.day === 1 ? 'OPEN FOR BUSINESS' : pick(['OPEN FOR BUSINESS', 'FRESH COFFEE, FRESH PHONES', 'THE BENCH IS READY']);
  dayBanner.classList.add('show');
  setTimeout(() => dayBanner.classList.remove('show'), 1500);
  setTimeout(() => { if (state.phase === 'dayIntro') nextCustomer(); }, 1750);
}

function nextCustomer() {
  if (state.jobsDone >= state.jobsTotal) { endDay(); return; }
  const job = state.queue[state.jobsDone % state.queue.length] || pick(JOBS);
  state.job = job;
  state.stepIndex = 0; state.stepDone = false;
  state.phase = 'arrival'; state.timerOn = false;
  state.patience = 1; state.maxHearts = 3 + state.upgrades.bench; state.hearts = state.maxHearts;
  state.mistakes = 0; state.mood = '';
  state.customer = pick(CUSTOMERS.filter(c => c !== state.lastCustomer));
  state.lastCustomer = state.customer;
  state.complaint = pick(job.complaints);

  resetPhone(job);
  setCustomer(job);
  updateMoney(); updateDay();
  renderHearts();
  updatePatienceUI(true);
  clearFx(); clearHint();
  setDock('Customer arriving', 'Listen to the complaint.', 'READY', '', 'primary');
  renderDots(0, false);
  stepBar.style.width = '0%';
  traySlot.className = 'tray-slot';
  traySlot.innerHTML = '<span class="tray-empty">EMPTY BAY</span>';
  trayStatus.textContent = 'READY';
  resetScrewCup();
  showArrival();
}

function setCustomer(job) {
  const c = state.customer;
  custName.textContent = c.name;
  custTag.textContent = job.phone;
  if (!state.complaint) state.complaint = pick(job.complaints);
  custLine.textContent = state.complaint;
  if (lockName) lockName.textContent = `${c.name} · now`;
  renderAvatar('happy');
  state.mood = 'happy';
}

/* ---------------- shop arrival ---------------- */
let arrivalTimers = [];
const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function clearArrivalTimers() { arrivalTimers.forEach(clearTimeout); arrivalTimers = []; }
function hideShopScene() {
  clearArrivalTimers();
  shopScene.classList.remove('show', 'out', 'handoff');
  shopScene.setAttribute('aria-hidden', 'true');
  acceptBtn.disabled = true;
}
function showArrival() {
  hideShopScene();
  if (!state.job || !state.customer) return;
  const job = state.job, c = state.customer;
  state.phase = 'arrival';
  state.timerOn = false;
  askName.textContent = c.name;
  askTag.textContent = job.phone;
  askLine.textContent = '';
  askBubble.classList.remove('show', 'typing');
  acceptBtn.disabled = true;
  acceptBtn.innerHTML = `<span>Listening…</span>${icon('arrow')}`;
  visitorFigure.innerHTML = avatarSVG(c, 'happy');
  shopScene.style.setProperty('--skin', c.skin);
  shopPhone.classList.toggle('cracked', job.id === 'screen');
  shopPhone.style.opacity = '';
  shopScene.classList.remove('out', 'handoff', 'show');
  void shopScene.offsetWidth;
  shopScene.classList.add('show');
  shopScene.setAttribute('aria-hidden', 'false');
  sfx.bell();
  arrivalTimers.push(setTimeout(() => {
    if (state.phase !== 'arrival') return;
    askBubble.classList.add('show', 'typing');
    typeComplaint(state.complaint);
  }, 340));
}
function finishListening() {
  if (state.phase !== 'arrival') return;
  clearArrivalTimers();
  askLine.textContent = state.complaint;
  askBubble.classList.remove('typing');
  if (!acceptBtn.disabled) return;
  acceptBtn.disabled = false;
  acceptBtn.innerHTML = `<span>Take the phone</span>${icon('arrow')}`;
  acceptBtn.classList.add('pop');
  setTimeout(() => acceptBtn.classList.remove('pop'), 480);
}
function typeComplaint(text) {
  if (reduceMotion()) { finishListening(); return; }
  let i = 0;
  const tick = () => {
    if (state.phase !== 'arrival') return;
    i = Math.min(text.length, i + 1 + (Math.random() < .5 ? 1 : 0));
    askLine.textContent = text.slice(0, i);
    if (i % 6 === 0) sfx.tick();
    if (i < text.length) arrivalTimers.push(setTimeout(tick, 15));
    else finishListening();
  };
  tick();
}
function acceptJob() {
  if (state.phase !== 'arrival') return;
  audioUnlock();
  state.phase = 'handoff';
  clearArrivalTimers();
  askLine.textContent = state.complaint;
  askBubble.classList.remove('typing');
  acceptBtn.disabled = true;
  acceptBtn.innerHTML = `<span>Handing over…</span>${icon('arrow')}`;
  shopScene.classList.add('handoff');
  sfx.click(); vibrate(8);
  if (reduceMotion()) { flyPhoneToBench(true); finishArrival(); return; }
  arrivalTimers.push(setTimeout(() => flyPhoneToBench(false), 340));
  arrivalTimers.push(setTimeout(finishArrival, 880));
}
function flyPhoneToBench(instant) {
  const from = shopPhone.getBoundingClientRect();
  shopPhone.style.opacity = '0';
  if (!from.width) return;
  const ghost = document.createElement('div');
  ghost.className = 'shop-phone fly-phone' + (shopPhone.classList.contains('cracked') ? ' cracked' : '');
  ghost.innerHTML = shopPhone.innerHTML;
  ghost.style.setProperty('--skin', (state.customer && state.customer.skin) || '#c98a63');
  Object.assign(ghost.style, {
    position: 'fixed', left: from.left + 'px', top: from.top + 'px',
    width: from.width + 'px', height: from.height + 'px',
    bottom: 'auto', transform: 'none', zIndex: '120', pointerEvents: 'none',
    borderRadius: '6px', transition: 'none'
  });
  document.body.appendChild(ghost);
  const land = () => {
    ghost.style.opacity = '0';
    ghost.style.transition = 'opacity .16s ease';
    phone.classList.add('receiving');
    sfx.pop(); vibrate(14);
    setTimeout(() => { ghost.remove(); phone.classList.remove('receiving'); }, 220);
  };
  if (instant) { ghost.remove(); land(); return; }
  const tx = from.left + from.width / 2, ty = window.innerHeight * .78;
  requestAnimationFrame(() => {
    ghost.style.transition = 'transform .66s cubic-bezier(.28,.86,.32,1)';
    ghost.style.transform = `translate(${tx - (from.left + from.width / 2)}px, ${ty - (from.top + from.height / 2)}px) scale(1.5)`;
  });
  setTimeout(land, 670);
}
function finishArrival() {
  if (state.phase !== 'handoff') return;
  state.phase = 'reading';
  state.timerOn = false;
  shopScene.classList.add('out');
  customerBar.classList.remove('in');
  void customerBar.offsetWidth;
  customerBar.classList.add('in');
  setDock('Work order', 'Diagnose the phone on the bench.', 'READY', 'Diagnose', 'primary');
  updatePatienceUI(true);
  toast(`${state.customer.name} hands over the ${state.job.phone}.`, '');
  arrivalTimers.push(setTimeout(() => {
    shopScene.classList.remove('show', 'out', 'handoff');
    shopScene.setAttribute('aria-hidden', 'true');
  }, 420));
}

function updatePatienceUI(force) {
  const p = clamp(state.patience, 0, 1);
  patienceFill.style.width = (p * 100).toFixed(1) + '%';
  const wrap = patienceFill.parentElement;
  wrap.classList.toggle('low', p <= .45 && p > .2);
  wrap.classList.toggle('crit', p <= .2);
  const mood = p > .65 ? 'happy' : p > .35 ? 'ok' : p > .15 ? 'worried' : 'angry';
  if (force || mood !== state.mood) {
    state.mood = mood;
    renderAvatar(mood);
  }
}

/* ---------------- diagnosis ---------------- */
function openDiagnosis() {
  if (state.phase !== 'reading' || state.sheetOpen) return;
  audioUnlock();
  state.phase = 'diag';
  state.timerOn = false;
  diagHint.textContent = state.job.clue;
  const wrongPool = Object.keys(KITS).filter(k => k !== state.job.kit);
  const options = shuffle([state.job.kit, ...shuffle(wrongPool).slice(0, 2)]);
  kitList.innerHTML = options.map(k => {
    const kit = KITS[k];
    return `<button class="kit" data-kit="${k}">
      <span class="kit-ic">${icon(kit.icon)}</span>
      <span class="kit-txt"><b>${kit.name}</b><small>${kit.desc}</small></span>
      ${icon('chevron', 'chev')}
    </button>`;
  }).join('');
  $$('.kit', kitList).forEach(btn => btn.addEventListener('click', () => chooseKit(btn)));
  showSheet(diagSheet);
  sfx.click();
}

function chooseKit(btn) {
  if (state.phase !== 'diag') return;
  const k = btn.dataset.kit;
  if (k === state.job.kit) {
    if (btn.classList.contains('right')) return;
    btn.classList.add('right');
    sfx.win();
    vibrate(20);
    state.phase = 'starting';
    setTimeout(() => {
      hideSheet(diagSheet);
      beginRepair();
    }, 380);
  } else {
    if (btn.classList.contains('wrong')) return;
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 480);
    sfx.error(); vibrate([20, 40, 20]);
    state.hearts = Math.max(0, state.hearts - 1);
    state.mistakes++;
    state.patience = Math.max(.02, state.patience - .07);
    renderHearts(); updatePatienceUI(true);
    diagHint.textContent = state.hearts > 0 ? 'Not quite. Look at the phone and the complaint again.' : 'Careful — the customer is losing faith.';
    toast('Wrong kit. That will not fix it.', 'bad');
  }
}

/* ---------------- geometry / fx ---------------- */
const partEl = key => key === 'screen' ? screenLayer : $(`.part[data-part="${key}"]`);
const slotEl = key => $(`.slot-outline[data-slot="${key}"]`);
function insideRect(r, x, y, pad = 0) {
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}
function distToRect(x, y, r) {
  const dx = Math.max(r.left - x, 0, x - r.right);
  const dy = Math.max(r.top - y, 0, y - r.bottom);
  return Math.hypot(dx, dy);
}
function benchPoint(x, y) {
  const r = bench.getBoundingClientRect();
  return { x: x - r.left, y: y - r.top };
}
function burst(x, y, o = {}) {
  const { count = 8, color = '#ffd166', kind = '', spread = 46, size = 4, dur = .7 } = o;
  const p = benchPoint(x, y);
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2), d = rand(spread * .25, spread);
    const s = document.createElement('span');
    s.className = 'spark ' + kind;
    s.style.left = p.x + 'px'; s.style.top = p.y + 'px';
    s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
    s.style.setProperty('--dy', (Math.sin(a) * d - rand(0, 10)).toFixed(1) + 'px');
    s.style.setProperty('--c', color);
    s.style.setProperty('--s', rand(size * .5, size).toFixed(1) + 'px');
    s.style.setProperty('--d', rand(dur * .6, dur).toFixed(2) + 's');
    fxLayer.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}
function burstAt(el, o) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, o);
}
function clearFx() { fxLayer.innerHTML = ''; }
function confetti() {
  const colors = ['#38e0c0', '#ff8a3d', '#ffd166', '#8dfbe4', '#ff5670', '#7f8cff'];
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.left = rand(4, 96) + '%';
    c.style.background = pick(colors);
    c.style.setProperty('--d', rand(1.4, 2.8).toFixed(2) + 's');
    c.style.animationDelay = rand(0, .5).toFixed(2) + 's';
    fxLayer.appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}
function clearHint() {
  clearTimeout(state.hintTimer);
  hintLayer.innerHTML = '';
}
function setProgress(p) {
  stepBar.style.width = (clamp(p, 0, 1) * 100).toFixed(1) + '%';
}
function renderDots(active, live = true) {
  const steps = state.job ? state.job.steps : [];
  stepDots.innerHTML = steps.map((_, i) => {
    const cls = live && i < active ? 'done' : live && i === active ? 'now' : '';
    return `<i class="${cls}"></i>`;
  }).join('');
}
function setAction(text, cls = 'primary', disabled = false) {
  actionBtn.className = 'primary ' + (cls === 'secondary' ? 'secondary' : '');
  actionBtn.innerHTML = `<span>${text}</span>${icon(cls === 'secondary' ? 'spark' : 'arrow')}`;
  actionBtn.disabled = disabled;
}
function toolIcon(tool) {
  if (/brush|heat|spark|roller/i.test(tool)) return 'spark';
  if (/suction|screen|display/i.test(tool)) return 'screen';
  if (/cloth|clean/i.test(tool)) return 'water';
  if (/diagnos/i.test(tool)) return 'check';
  return 'tools';
}
function setDock(title, sub, tool, btnText, btnCls = 'secondary', disabled = false) {
  stepTitle.textContent = title;
  stepSub.textContent = sub;
  toolChip.innerHTML = icon(toolIcon(tool)) + `<span>${tool}</span>`;
  if (btnText) setAction(btnText, btnCls, disabled);
}
function resetScrewCup() { $$('.cup-screws i').forEach(i => i.classList.remove('in')); }
function clearTray() {
  traySlot.className = 'tray-slot';
  traySlot.innerHTML = '<span class="tray-empty">EMPTY BAY</span>';
  trayStatus.textContent = 'READY';
}

/* ---------------- dynamic layers ---------------- */
const wetLayer = document.createElement('div'); wetLayer.className = 'wet-layer';
const corrosion = document.createElement('div'); corrosion.className = 'corrosion';
interior.append(wetLayer, corrosion);
const lintEl = document.createElement('span'); lintEl.className = 'lint';
$('.part[data-part="port"]').append(lintEl);

/* ---------------- phone setup ---------------- */
function resetPhone(job) {
  cleanupStep();
  clearHint(); clearFx();
  phone.className = 'phone';
  phone.dataset.screen = 'lock';
  phone.dataset.job = job.id;
  phone.style.removeProperty('--seat');
  screenLayer.style.removeProperty('--crack');
  screenLayer.classList.remove('fresh');
  cracks.style.removeProperty('--crack');
  cracks.style.display = job.id === 'screen' ? '' : 'none';
  screenLayer.style.visibility = '';
  screenLayer.style.opacity = '';
  $$('.part', interior).forEach(p => {
    p.classList.remove('removed', 'focus', 'loose', 'installed', 'draggable');
    p.style.transform = '';
    p.style.visibility = '';
  });
  $$('.slot-outline').forEach(s => s.classList.remove('active', 'near'));
  $$('.screw').forEach(s => s.classList.remove('out'));
  phone.classList.remove('screws-active');
  batteryEl.style.transform = '';
  wetLayer.classList.toggle('on', job.id === 'water');
  wetLayer.style.opacity = '';
  corrosion.style.opacity = job.id === 'water' ? '.95' : '0';
  lintEl.style.opacity = job.id === 'port' ? '1' : '0';
  if (job.part && job.id !== 'water') partEl(job.part)?.classList.add('focus');
  traySlot.className = 'tray-slot';
  clearTray();
  resetScrewCup();
}
const batteryEl = $('.part[data-part="battery"]');

/* ---------------- repair flow ---------------- */
let stepCleanups = [];
function addCleanup(fn) { stepCleanups.push(fn); }
function cleanupStep() {
  stepCleanups.forEach(fn => { try { fn(); } catch (e) {} });
  stepCleanups = [];
  clearHint();
  $$('.rub-zone,.hold-zone').forEach(e => e.remove());
  document.body.classList.remove('dragging');
}
function beginRepair() {
  if (!state.job) return;
  state.phase = 'repair';
  state.timerOn = true;
  state.stepIndex = 0;
  state.stepDone = false;
  setAction('Hint', 'secondary');
  runStep();
}
function runStep() {
  if (!state.job || state.phase === 'pay' || state.phase === 'fail') return;
  const steps = state.job.steps;
  if (state.stepIndex >= steps.length) { finishJob(); return; }
  const step = steps[state.stepIndex];
  state.stepDone = false;
  renderDots(state.stepIndex, true);
  setDock(step.title, step.sub, step.tool, step.type === 'boot' || step.type === 'open' ? '' : 'Hint', 'secondary');
  setProgress(0);
  clearHint();
  state.hintTimer = setTimeout(() => showHint(step), 4200);
  switch (step.type) {
    case 'screw': setupScrews(step); break;
    case 'rub': setupRub(step); break;
    case 'open': setupOpen(step); break;
    case 'dragOut': setupDrag(step, true); break;
    case 'dragIn': setupDrag(step, false); break;
    case 'hold': setupHold(step); break;
    case 'boot': setupBoot(step); break;
  }
}
function completeStep(delay = 340) {
  if (state.stepDone) return;
  state.stepDone = true;
  cleanupStep();
  sfx.heart();
  state.stepIndex++;
  renderDots(state.stepIndex, true);
  if (state.stepIndex >= state.job.steps.length) {
    setTimeout(() => finishJob(), 300);
  } else {
    setTimeout(runStep, delay);
  }
}

/* ---------------- screws ---------------- */
function setupScrews(step) {
  phone.classList.add('screws-active');
  const screws = $$('.screw');
  let done = 0;
  addCleanup(() => {
    phone.classList.remove('screws-active');
    screws.forEach(s => s.classList.add('out'));
  });
  screws.forEach((s, i) => {
    const onTap = e => {
      e.preventDefault();
      if (state.stepDone || s.classList.contains('out')) return;
      s.classList.add('out');
      sfx.screw(); vibrate(8);
      burstAt(s, { count: 4, color: '#cfdde0', spread: 26, size: 2.6 });
      const cup = $$('.cup-screws i')[i]; if (cup) cup.classList.add('in');
      done++;
      setProgress(done / screws.length);
      if (done >= screws.length) {
        setTimeout(() => { phone.classList.remove('screws-active'); completeStep(380); }, 260);
      }
    };
    s.addEventListener('pointerdown', onTap);
    addCleanup(() => s.removeEventListener('pointerdown', onTap));
  });
}

/* ---------------- rub ---------------- */
function rubRect(visual) {
  let el, pad = 8;
  if (visual === 'cracks' || visual === 'edges') el = screenLayer;
  else if (visual === 'battery') el = batteryEl;
  else if (visual === 'port') { el = $('.part[data-part="port"]'); pad = 22; }
  else if (visual === 'camera') el = $('.part[data-part="camera"]');
  else el = interior;
  let r = el.getBoundingClientRect();
  if (visual === 'port') {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const w = Math.max(76, r.width + pad * 2), h = 74;
    return { left: cx - w / 2, top: cy - h / 2, width: w, height: h, right: cx + w / 2, bottom: cy + h / 2 };
  }
  return { left: r.left - pad, top: r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2, right: r.right + pad, bottom: r.bottom + pad };
}
function applyVisual(visual, p) {
  switch (visual) {
    case 'cracks': cracks.style.setProperty('--crack', (1 - p).toFixed(3)); break;
    case 'edges': phone.classList.add('heating'); break;
    case 'battery': batteryEl.style.transform = `translateY(${(-p * 4).toFixed(1)}px) rotate(${(-p * .7).toFixed(2)}deg)`; break;
    case 'camera': { const c = $('.part[data-part="camera"]'); c.style.transform = `translate(${(p * 2).toFixed(1)}px,${(-p * 2).toFixed(1)}px) rotate(${(p * 1.4).toFixed(2)}deg)`; break; }
    case 'port': lintEl.style.opacity = (1 - p).toFixed(2); break;
    case 'water': wetLayer.style.opacity = (1 - p).toFixed(2); break;
    case 'corrosion': corrosion.style.opacity = ((1 - p) * .95).toFixed(2); break;
  }
}
function setupRub(step) {
  const r = rubRect(step.visual);
  const br = bench.getBoundingClientRect();
  const zone = document.createElement('div');
  zone.className = 'rub-zone';
  zone.style.left = (r.left - br.left) + 'px';
  zone.style.top = (r.top - br.top) + 'px';
  zone.style.width = r.width + 'px';
  zone.style.height = r.height + 'px';
  bench.appendChild(zone);
  const kind = step.visual === 'cracks' ? 'glass' : step.visual === 'water' || step.visual === 'port' ? 'water' : step.visual === 'corrosion' ? 'dust' : '';
  const color = step.visual === 'cracks' ? '#dffcff' : step.visual === 'water' ? '#7fdcff' : step.visual === 'corrosion' ? '#8fbf7a' : step.visual === 'battery' ? '#cfdde0' : '#ffb066';
  let active = false, total = 0, last = null, acc = 0, lastTick = 0, done = false;
  const need = step.need || 420;
  if (step.visual === 'water') wetLayer.classList.add('on');

  const onMove = e => {
    if (!active || done) return;
    e.preventDefault();
    if (!last) { last = { x: e.clientX, y: e.clientY }; return; }
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    let d = Math.hypot(dx, dy);
    last = { x: e.clientX, y: e.clientY };
    if (d < .6) return;
    d = Math.min(d, 44);
    total += d; acc += d;
    const p = clamp(total / need, 0, 1);
    applyVisual(step.visual, p);
    setProgress(p);
    if (acc > 13) {
      acc = 0;
      burst(e.clientX, e.clientY, { count: step.visual === 'water' ? 2 : 2, color, kind, spread: 24, size: 3, dur: .5 });
      if (step.visual === 'cracks' || step.visual === 'port') sfx.crack();
      else sfx.heat();
    }
    const t = Math.floor(p * 6);
    if (t > lastTick) { lastTick = t; vibrate(4); }
    if (p >= 1 && !done) {
      done = true;
      active = false;
      cleanupStep();
      if (step.visual === 'cracks') { cracks.style.setProperty('--crack', 0); burstAt(screenLayer, { count: 14, color: '#dffcff', kind: 'glass', spread: 90, size: 4 }); sfx.snap(); }
      if (step.visual === 'edges') { phone.classList.remove('heating'); sfx.pop(); }
      if (step.visual === 'battery') { batteryEl.classList.add('loose'); sfx.pop(); }
      if (step.visual === 'water') { wetLayer.classList.remove('on'); wetLayer.style.opacity = '0'; sfx.pop(); }
      if (step.visual === 'corrosion') { corrosion.style.opacity = '0'; burstAt(interior, { count: 8, color: '#8fbf7a', kind: 'dust', spread: 40, size: 3 }); sfx.pop(); }
      if (step.visual === 'port') { lintEl.style.opacity = '0'; burstAt($('.part[data-part="port"]'), { count: 10, color: '#c9b48a', kind: 'dust', spread: 34, size: 3 }); sfx.pop(); }
      vibrate(20);
      completeStep(420);
    }
  };
  const onUp = () => { active = false; last = null; };
  const onDown = e => {
    if (done) return;
    e.preventDefault();
    active = true; last = { x: e.clientX, y: e.clientY };
    zone.classList.add('active');
    sfx.click();
  };
  zone.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  addCleanup(() => {
    zone.remove();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (step.visual === 'edges') phone.classList.remove('heating');
  });
}

/* ---------------- mini parts / drag ---------------- */
function miniPart(key) {
  const wrap = document.createElement('div');
  wrap.className = 'mini';
  if (key === 'battery') wrap.innerHTML = `<div class="mini mini-battery"><span class="bolt">ϟ</span><b>4,200<span>mAh</span></b></div>`;
  else if (key === 'camera') wrap.innerHTML = `<div class="mini mini-camera"><i></i><i></i></div>`;
  else if (key === 'speaker') wrap.innerHTML = `<div class="mini mini-speaker"><i></i><i></i><i></i><i></i><i></i></div>`;
  else if (key === 'port') wrap.innerHTML = `<div class="mini mini-port"><i></i></div>`;
  else if (key === 'screen') wrap.innerHTML = `<div class="mini mini-screen"></div>`;
  wrap.insertAdjacentHTML('beforeend', '<span class="tag">NEW</span>');
  return wrap;
}

function makeDrag(source, opts) {
  let ghost = null, startRect = null, active = false, moved = 0, last = null, near = false;
  const setNear = v => { if (near === v) return; near = v; opts.onNear && opts.onNear(v); };
  const place = (x, y, scale = 1.04) => {
    if (!ghost) return;
    ghost.style.transform = `translate(${x - startRect.width / 2}px, ${y - startRect.height / 2 - 4}px) scale(${scale})`;
  };
  const onDown = e => {
    if (active || state.stepDone) return;
    if (e.button && e.button > 0) return;
    if (e.cancelable) e.preventDefault();
    active = true; moved = 0; last = { x: e.clientX, y: e.clientY };
    startRect = source.getBoundingClientRect();
    ghost = source.cloneNode(true);
    ghost.classList.add('drag-ghost');
    Object.assign(ghost.style, {
      position: 'fixed', left: '0', top: '0', right: 'auto', bottom: 'auto', inset: 'auto',
      width: startRect.width + 'px', height: startRect.height + 'px', margin: '0',
      zIndex: '120', pointerEvents: 'none', transition: 'none', transformOrigin: 'center',
      visibility: 'visible', opacity: '1', filter: 'drop-shadow(0 14px 20px #0009)'
    });
    document.body.appendChild(ghost);
    source.style.visibility = 'hidden';
    document.body.classList.add('dragging');
    place(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    sfx.click();
    vibrate(6);
  };
  const onMove = e => {
    if (!active) return;
    if (e.cancelable) e.preventDefault();
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    moved += Math.hypot(dx, dy);
    last = { x: e.clientX, y: e.clientY };
    place(e.clientX, e.clientY);
    setNear(opts.hitTest ? opts.hitTest(e.clientX, e.clientY, moved) : false);
  };
  const onUp = e => {
    if (!active) return;
    active = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    document.body.classList.remove('dragging');
    const success = opts.hitTest ? opts.hitTest(e.clientX, e.clientY, moved) : false;
    const tr = opts.targetRect ? opts.targetRect() : null;
    if (success) {
      setNear(false);
      if (ghost) {
        ghost.style.transition = 'transform .18s ease-in, opacity .18s ease-in';
        if (tr) {
          const cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
          ghost.style.transform = `translate(${cx - startRect.width / 2}px, ${cy - startRect.height / 2}px) scale(.42)`;
        }
        ghost.style.opacity = '0';
        const g = ghost; ghost = null;
        setTimeout(() => g.remove(), 210);
      }
      opts.onSuccess && opts.onSuccess();
    } else {
      setNear(false);
      sfx.drop();
      if (ghost) {
        ghost.style.transition = 'transform .22s cubic-bezier(.3,1.3,.5,1), opacity .2s';
        ghost.style.transform = `translate(${startRect.left}px, ${startRect.top}px) scale(1)`;
        const g = ghost; ghost = null;
        setTimeout(() => {
          g.remove();
          source.style.visibility = '';
          source.classList.remove('drag-source');
        }, 230);
      } else source.style.visibility = '';
      opts.onFail && opts.onFail();
    }
  };
  source.addEventListener('pointerdown', onDown);
  addCleanup(() => {
    source.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (ghost) { ghost.remove(); ghost = null; }
    source.style.visibility = '';
    document.body.classList.remove('dragging');
  });
}

function setupDrag(step, isOut) {
  const key = step.part;
  clearTray();
  if (isOut) {
    const src = key === 'screen' ? screenLayer : partEl(key);
    src.style.visibility = '';
    src.classList.add('grabbable');
    if (key !== 'screen') { src.classList.remove('removed'); src.classList.add('draggable'); }
    addCleanup(() => src.classList.remove('grabbable'));
    traySlot.classList.add('dropzone');
    traySlot.innerHTML = '<span class="drop-hint">DROP<br>HERE</span>';
    trayStatus.textContent = 'REMOVE';
    const hit = (x, y, moved) =>
      insideRect(traySlot.getBoundingClientRect(), x, y, 28) ||
      (!insideRect(phone.getBoundingClientRect(), x, y, -6) && moved > 46);
    makeDrag(src, {
      hitTest: hit,
      targetRect: () => traySlot.getBoundingClientRect(),
      onNear: v => traySlot.classList.toggle('near', v),
      onSuccess: () => {
        if (key === 'screen') {
          phone.classList.add('screen-gone');
          sfx.suction(); setTimeout(() => sfx.pop(), 100);
          burstAt(phone, { count: 10, color: '#dffcff', kind: 'glass', spread: 60, size: 3.4 });
        } else {
          src.classList.add('removed');
          sfx.pop();
          burstAt(src, { count: 6, color: '#cfdde0', spread: 34, size: 3 });
        }
        trayStatus.textContent = 'REMOVED';
        vibrate(16);
        completeStep(430);
      },
      onFail: () => {
        state.patience = Math.max(0, state.patience - .02);
        updatePatienceUI();
        toast('Drop it in the parts tray.', 'bad');
      }
    });
  } else {
    const slot = slotEl(key);
    slot.classList.add('active');
    const mini = miniPart(key);
    mini.classList.add('grabbable');
    traySlot.innerHTML = '';
    traySlot.append(mini);
    trayStatus.textContent = 'INSTALL';
    const phonePart = key === 'screen' ? screenLayer : partEl(key);
    if (key !== 'screen') phonePart.classList.add('removed');
    const hit = (x, y) => key === 'screen'
      ? insideRect(phone.getBoundingClientRect(), x, y, 12)
      : (distToRect(x, y, slot.getBoundingClientRect()) < 48 || insideRect(slot.getBoundingClientRect(), x, y, 38));
    makeDrag(mini, {
      hitTest: hit,
      targetRect: () => key === 'screen' ? phone.getBoundingClientRect() : slot.getBoundingClientRect(),
      onNear: v => slot.classList.toggle('near', v),
      onSuccess: () => {
        slot.classList.remove('active', 'near');
        if (key === 'screen') {
          phone.classList.remove('screen-gone', 'open', 'reassembling');
          phone.style.removeProperty('--seat');
          screenLayer.style.visibility = '';
          cracks.style.display = 'none';
          cracks.style.setProperty('--crack', '0');
          screenLayer.classList.add('fresh');
          setTimeout(() => screenLayer.classList.remove('fresh'), 700);
          sfx.snap();
          burstAt(phone, { count: 12, color: '#38e0c0', spread: 80, size: 3.6 });
        } else {
          phonePart.classList.remove('removed');
          phonePart.classList.add('installed');
          sfx.snap();
          burstAt(phonePart, { count: 10, color: '#8dfbe4', spread: 44, size: 3 });
        }
        traySlot.innerHTML = '<span class="tray-empty">INSTALLED</span>';
        trayStatus.textContent = 'DONE';
        vibrate(18);
        completeStep(450);
      },
      onFail: () => {
        state.patience = Math.max(0, state.patience - .02);
        updatePatienceUI();
        toast('Line it up with the outline.', 'bad');
      }
    });
  }
}

/* ---------------- hold ---------------- */
function setupHold(step) {
  const isScreen = step.target === 'screen';
  const openState = phone.classList.contains('open');
  const target = isScreen ? (openState ? phone : screenLayer) : partEl(step.target);
  const tr = target.getBoundingClientRect();
  const br = bench.getBoundingClientRect();
  const size = isScreen ? 104 : 84;
  const cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
  const zone = document.createElement('div');
  zone.className = 'hold-zone';
  zone.style.left = (cx - br.left - size / 2) + 'px';
  zone.style.top = (cy - br.top - size / 2) + 'px';
  zone.style.width = size + 'px';
  zone.style.height = size + 'px';
  zone.innerHTML = `<svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="44"/><circle class="prog" cx="50" cy="50" r="44"/></svg><span>HOLD</span>`;
  bench.appendChild(zone);
  const CIRC = 2 * Math.PI * 44;
  const prog = zone.querySelector('.prog');
  prog.style.strokeDasharray = CIRC;
  prog.style.strokeDashoffset = CIRC;
  let p = 0, holding = false, done = false, reassembling = false, lastT = performance.now(), raf = 0;

  const setP = v => {
    p = clamp(v, 0, 1);
    prog.style.strokeDashoffset = CIRC * (1 - p);
    setProgress(p);
    if (isScreen && openState) {
      if (p > 0) {
        if (!reassembling) {
          reassembling = true;
          phone.classList.add('reassembling');
          phone.classList.remove('open');
        }
        phone.style.setProperty('--seat', p.toFixed(3));
      } else if (reassembling) {
        reassembling = false;
        phone.classList.remove('reassembling');
        phone.classList.add('open');
        phone.style.removeProperty('--seat');
      }
    }
  };
  const finish = () => {
    done = true;
    cancelAnimationFrame(raf);
    zone.remove();
    if (isScreen && openState) {
      phone.classList.remove('reassembling', 'open');
      phone.style.removeProperty('--seat');
      phone.dataset.screen = 'lock';
      cracks.style.display = 'none';
    }
    sfx.connect(); vibrate(24);
    burst(cx, cy, { count: 12, color: '#38e0c0', spread: 62, size: 3.4 });
    setProgress(1);
    setTimeout(() => completeStep(380), 260);
  };
  const tick = t => {
    const dt = Math.min(.06, (t - lastT) / 1000); lastT = t;
    if (!done) {
      if (holding) {
        setP(p + dt * 1000 / (step.need || 800));
        if (p >= 1) { finish(); return; }
      } else if (p > 0) {
        setP(p - dt * 1.55);
      }
      raf = requestAnimationFrame(tick);
    }
  };
  raf = requestAnimationFrame(tick);
  const onDown = e => { e.preventDefault(); if (done) return; holding = true; zone.classList.add('holding'); vibrate(8); sfx.tick(); };
  const onUp = () => { holding = false; zone.classList.remove('holding'); };
  zone.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  addCleanup(() => {
    cancelAnimationFrame(raf);
    zone.remove();
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (reassembling) {
      phone.classList.remove('reassembling');
      phone.classList.add('open');
      phone.style.removeProperty('--seat');
    }
  });
}

/* ---------------- open / boot ---------------- */
function setupOpen(step) {
  setAction('Working…', 'primary', true);
  phone.classList.add('opening');
  sfx.suction(); vibrate(12);
  const t1 = setTimeout(() => {
    phone.classList.remove('opening');
    phone.classList.add('open');
    sfx.pop();
    burstAt(phone, { count: 10, color: '#dffcff', kind: 'glass', spread: 60, size: 3 });
  }, 470);
  const t2 = setTimeout(() => completeStep(320), 1250);
  addCleanup(() => { clearTimeout(t1); clearTimeout(t2); phone.classList.remove('opening'); });
}

function setupBoot(step) {
  state.timerOn = false;
  setAction('Testing…', 'primary', true);
  setProgress(0);
  clearHint();
  phone.classList.remove('open', 'opening', 'reassembling', 'screen-gone', 'heating', 'screws-active');
  phone.style.removeProperty('--seat');
  cracks.style.display = 'none';
  cracks.style.setProperty('--crack', '0');
  screenLayer.style.visibility = '';
  phone.dataset.screen = 'boot';
  screenLayer.classList.add('fresh');
  const bootBar = $('.boot-bar i');
  if (bootBar) { bootBar.style.animation = 'none'; void bootBar.offsetWidth; bootBar.style.animation = ''; }
  sfx.boot(); vibrate([12, 40, 12]);
  let p = 0;
  const iv = setInterval(() => { p = Math.min(1, p + .055); setProgress(p); if (p >= 1) clearInterval(iv); }, 80);
  const t1 = setTimeout(() => {
    phone.dataset.screen = 'home';
    sfx.heart();
    burstAt(phone, { count: 14, color: '#38e0c0', spread: 90, size: 3.4 });
  }, 1700);
  const t2 = setTimeout(() => { clearInterval(iv); setProgress(1); finishJob(); }, 2650);
  addCleanup(() => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); });
}

/* ---------------- hints ---------------- */
function showHint(step, manual = false) {
  if (!step || state.stepDone || !state.job) return;
  clearHint();
  const br = bench.getBoundingClientRect();
  const toLocal = r => ({ x: r.left + r.width / 2 - br.left, y: r.top + r.height / 2 - br.top });
  const addFinger = (rect, mode, label, extra) => {
    const pos = toLocal(rect);
    const el = document.createElement('div');
    el.className = 'hint ' + mode;
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    el.innerHTML = `<div class="finger"><span class="ring"></span></div><span class="label">${label}</span>`;
    hintLayer.appendChild(el);
    if (extra) hintLayer.appendChild(extra);
  };
  if (step.type === 'screw') {
    const s = $$('.screw').find(x => !x.classList.contains('out'));
    if (s) addFinger(s.getBoundingClientRect(), 'tap', 'TAP');
  } else if (step.type === 'rub') {
    addFinger(rubRect(step.visual), 'rub', 'RUB');
  } else if (step.type === 'hold') {
    const openState = phone.classList.contains('open');
    const target = step.target === 'screen' ? (openState ? phone : screenLayer) : partEl(step.target);
    addFinger(target.getBoundingClientRect(), 'hold', 'PRESS & HOLD');
  } else if (step.type === 'dragOut') {
    const src = step.part === 'screen' ? screenLayer : partEl(step.part);
    const sr = src.getBoundingClientRect(), tr = traySlot.getBoundingClientRect();
    const a = toLocal(sr), b = toLocal(tr);
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'hint-arrow');
    svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
    svg.innerHTML = `<path d="M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 30} ${b.x} ${b.y}"/>`;
    hintLayer.appendChild(svg);
    addFinger(sr, 'tap', 'DRAG');
  } else if (step.type === 'dragIn') {
    const mini = traySlot.querySelector('.mini');
    if (mini) {
      const sr = mini.getBoundingClientRect();
      const slot = slotEl(step.part);
      const tr = step.part === 'screen' ? phone.getBoundingClientRect() : slot.getBoundingClientRect();
      const a = toLocal(sr), b = toLocal(tr);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'hint-arrow');
      svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
      svg.innerHTML = `<path d="M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 24} ${b.x} ${b.y}"/>`;
      hintLayer.appendChild(svg);
      addFinger(sr, 'tap', 'DRAG IN');
    }
  }
  if (manual) sfx.tick();
}

/* ---------------- payment / failure ---------------- */
function finishJob() {
  if (state.phase === 'pay' || state.phase === 'fail' || !state.job) return;
  cleanupStep();
  state.timerOn = false;
  state.phase = 'pay';
  const p = clamp(state.patience, 0, 1);
  const stars = clamp(Math.round(2 + p * 2.5 + (state.hearts - 1) * .35), 1, 5);
  const base = Math.round(state.job.pay * (1 + (state.day - 1) * .06));
  const speed = Math.round(base * .3 * p);
  const tip = state.hearts >= state.maxHearts && p > .6 ? Math.round(base * .15) : 0;
  const signBonus = Math.round((base + speed) * state.upgrades.sign * .12);
  const total = base + speed + tip + signBonus;

  state.coins += total;
  state.earnedToday += total;
  state.jobsDone++;
  state.jobsWon++;
  state.todayStars.push(stars);
  state.repSum += stars; state.repCount++;
  updateMoney(); saveGame();

  payTitle.textContent = stars >= 5 ? 'Phone saved.' : stars === 4 ? 'Good as new.' : stars === 3 ? 'It works.' : 'Barely fixed.';
  payStars.innerHTML = Array.from({ length: 5 }, (_, i) => `<svg class="ic fill ${i < stars ? '' : 'off'}"><use href="#i-star"/></svg>`).join('');
  const quotes = state.job.quotes || [];
  payQuote.textContent = stars >= 3
    ? `“${pick(quotes)}”`
    : `“${pick(['It turns on... I think?', 'Well, it is better than before.', 'I guess that will do.'])}”`;
  payRows.innerHTML = `
    <div class="pay-row"><span>Base repair</span><b>${money(base)}</b></div>
    <div class="pay-row"><span>Speed bonus</span><b class="${speed ? 'plus' : 'zero'}">${speed ? '+' + money(speed) : '$0'}</b></div>
    ${tip ? `<div class="pay-row"><span>Happy customer tip</span><b class="plus">+${money(tip)}</b></div>` : ''}
    ${signBonus ? `<div class="pay-row"><span>Neon sign bonus</span><b class="plus">+${money(signBonus)}</b></div>` : ''}
    <div class="pay-row total"><span>Total</span><b>${money(total)}</b></div>`;
  payNext.innerHTML = `<span>${state.jobsDone >= state.jobsTotal ? 'Close up shop' : 'Next customer'}</span>${icon('arrow')}`;
  sfx.cash();
  vibrate([20, 40, 20]);
  if (stars >= 4) confetti();
  setTimeout(() => { if (state.phase === 'pay') showSheet(paySheet); }, 420);
}

function failJob(reason = 'timeout') {
  if (state.phase === 'pay' || state.phase === 'fail') return;
  cleanupStep();
  state.timerOn = false;
  state.phase = 'fail';
  state.jobsDone++;
  state.repSum += 1; state.repCount++;
  updatePatienceUI(true);
  failAvatar.innerHTML = state.customer ? avatarSVG(state.customer, 'angry') : '';
  failText.textContent = reason === 'timeout'
    ? 'The patience bar hit zero. They grabbed their phone and walked out.'
    : 'They lost faith in the repair and took their phone somewhere else.';
  failTip.textContent = state.mistakes > 0
    ? 'Double-check the diagnosis — the right kit saves hearts.'
    : 'Keep moving: rubs, drags and holds all count down the clock.';
  failNext.innerHTML = `<span>${state.jobsDone >= state.jobsTotal ? 'Close up shop' : 'Next customer'}</span>${icon('arrow')}`;
  sfx.error(); vibrate([40, 60, 40]);
  setTimeout(() => { if (state.phase === 'fail') showSheet(failSheet); }, 420);
}

/* ---------------- day summary / upgrades ---------------- */
function endDay() {
  state.phase = 'day';
  state.timerOn = false;
  cleanupStep();
  hideShopScene();
  const todayAvg = state.todayStars.length ? state.todayStars.reduce((a, b) => a + b, 0) / state.todayStars.length : 5;
  dayNum.textContent = state.day;
  statRepairs.textContent = `${state.jobsWon}/${state.jobsTotal}`;
  statEarned.textContent = money(state.earnedToday);
  statRating.textContent = (state.repCount ? rating() : todayAvg).toFixed(1);
  upgradeMoney.textContent = money(state.coins);
  renderUpgrades();
  saveGame(state.day + 1);
  sfx.win();
  showSheet(daySheet);
}
function renderUpgrades() {
  upgradeMoney.textContent = money(state.coins);
  upgradeList.innerHTML = UPGRADES.map(u => {
    const lvl = state.upgrades[u.id] || 0;
    const maxed = lvl >= u.max;
    const cost = maxed ? 0 : u.costs[lvl];
    const can = !maxed && state.coins >= cost;
    return `<div class="upgrade">
      <div class="u-ic">${icon(u.icon)}</div>
      <div class="u-txt"><b>${u.name}</b><small>${u.desc}</small>
        <div class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      <button class="buy ${maxed ? 'max' : can ? '' : 'cant'}" data-up="${u.id}" ${maxed || !can ? 'disabled' : ''}>${maxed ? 'MAX' : money(cost)}</button>
    </div>`;
  }).join('');
}
function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  if (!u) return;
  const lvl = state.upgrades[id] || 0;
  if (lvl >= u.max) return;
  const cost = u.costs[lvl];
  if (state.coins < cost) { toast('Not enough cash yet.', 'bad'); return; }
  state.coins -= cost;
  state.upgrades[id] = lvl + 1;
  updateMoney();
  renderUpgrades();
  saveGame(state.day + 1);
  sfx.cash();
  vibrate(15);
  toast(`${u.name} upgraded!`, 'good');
}

/* ---------------- timer ---------------- */
let lastFrame = 0;
function gameLoop(t) {
  const dt = Math.min(.12, lastFrame ? (t - lastFrame) / 1000 : 0);
  lastFrame = t;
  if (state.timerOn && !state.sheetOpen && state.phase === 'repair' && !document.hidden) {
    const rate = .0205 * (1 + (state.day - 1) * .055) * (1 - state.upgrades.tools * .08);
    state.patience = Math.max(0, state.patience - rate * dt);
    if (state.patience <= 0) failJob('timeout');
  }
  if (state.phase !== 'menu') updatePatienceUI();
  requestAnimationFrame(gameLoop);
}

/* ---------------- settings ---------------- */
let resetArmed = false, resetTimer = null;
function openSettings() {
  if (state.sheetOpen) return;
  showSheet(settingsSheet);
  refreshMenu();
  resetArmed = false;
  const row = $('#resetRow b'); if (row) row.textContent = 'RESET';
}
function quitToMenu() {
  hideSheet(settingsSheet);
  cleanupStep();
  hideShopScene();
  state.timerOn = false;
  state.job = null;
  state.phase = 'menu';
  saveGame();
  openMenu();
}
function resetProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  hideShopScene();
  state.day = 1; state.coins = 0; state.repSum = 0; state.repCount = 0;
  state.upgrades = { tools: 0, sign: 0, bench: 0 };
  state.hasSave = false; state.job = null; state.phase = 'menu';
  state.timerOn = false;
  updateMoney(); updateDay(); refreshMenu();
  hideSheet(settingsSheet);
  openMenu();
  toast('Progress wiped. Fresh bench.', '');
}

/* ---------------- wire up ---------------- */
acceptBtn.addEventListener('click', () => { acceptJob(); });
askBubble.addEventListener('pointerdown', e => {
  if (state.phase !== 'arrival') return;
  e.preventDefault();
  if (acceptBtn.disabled) finishListening();
});
$('.shop-cta').addEventListener('pointerdown', () => {
  if (state.phase === 'arrival' && acceptBtn.disabled) finishListening();
});
actionBtn.addEventListener('click', () => {
  audioUnlock();
  if (state.phase === 'reading') openDiagnosis();
  else if (state.phase === 'repair') useHint();
});
function useHint() {
  if (state.phase !== 'repair' || !state.job) return;
  const step = state.job.steps[state.stepIndex];
  if (!step) return;
  showHint(step, true);
  state.patience = Math.max(0, state.patience - .015);
  updatePatienceUI();
  toast('Follow the gold marker.', '');
}

playBtn.addEventListener('click', startShift);
$('#howBtn').addEventListener('click', () => { showSheet(howSheet); });
$('#howClose').addEventListener('click', () => hideSheet(howSheet));
$('#soundBtn').addEventListener('click', () => {
  state.muted = !state.muted; saveGame(); refreshMenu();
  if (!state.muted) { audioUnlock(); sfx.tap(); }
});
$('#settingsBtn').addEventListener('click', openSettings);
$('#settingsClose').addEventListener('click', () => hideSheet(settingsSheet));
$('#soundRow').addEventListener('click', () => {
  state.muted = !state.muted; saveGame(); refreshMenu();
  if (!state.muted) { audioUnlock(); sfx.tap(); }
});
$('#quitRow').addEventListener('click', quitToMenu);
$('#resetRow').addEventListener('click', () => {
  if (!resetArmed) {
    resetArmed = true;
    const row = $('#resetRow b'); if (row) row.textContent = 'TAP AGAIN';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      resetArmed = false;
      const r = $('#resetRow b'); if (r) r.textContent = 'RESET';
    }, 3200);
    return;
  }
  clearTimeout(resetTimer);
  resetArmed = false;
  resetProgress();
});
payNext.addEventListener('click', () => {
  hideSheet(paySheet);
  if (state.jobsDone >= state.jobsTotal) endDay();
  else nextCustomer();
});
failNext.addEventListener('click', () => {
  hideSheet(failSheet);
  if (state.jobsDone >= state.jobsTotal) endDay();
  else nextCustomer();
});
nextDayBtn.addEventListener('click', () => {
  hideSheet(daySheet);
  state.day++;
  state.hasSave = true;
  saveGame();
  updateDay(); updateMoney();
  startDay();
});
upgradeList.addEventListener('click', e => {
  const btn = e.target.closest('.buy');
  if (btn && btn.dataset.up) buyUpgrade(btn.dataset.up);
});
document.addEventListener('pointerdown', audioUnlock, { passive: true });
document.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('resize', () => clearHint());
document.addEventListener('visibilitychange', () => { lastFrame = 0; });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (state.sheetOpen) { $$('.sheet-wrap.show').forEach(s => hideSheet(s)); }
  }
});

/* ---------------- boot ---------------- */
function init() {
  const had = loadSave();
  if (had) { state.hasSave = true; updateDay(); updateMoney(); }
  refreshMenu();
  state.job = JOBS[0];
  state.customer = CUSTOMERS[0];
  state.maxHearts = 3; state.hearts = 3;
  resetPhone(JOBS[0]);
  setCustomer(JOBS[0]);
  renderHearts();
  updatePatienceUI(true);
  requestAnimationFrame(gameLoop);
}
init();

/* ---------------- debug helpers ---------------- */
window.MEND = {
  state,
  start: startShift,
  diag: openDiagnosis,
  correct() {
    if (state.phase !== 'diag') return;
    const btn = $$('.kit', kitList).find(b => b.dataset.kit === state.job.kit);
    if (btn) chooseKit(btn);
  },
  skip() {
    if (state.phase === 'arrival') { acceptJob(); return; }
    if (state.phase === 'handoff') { finishArrival(); return; }
    if (state.phase === 'diag') { this.correct(); return; }
    if (state.phase === 'pay') { payNext.click(); return; }
    if (state.phase === 'fail') { failNext.click(); return; }
    if (state.phase === 'reading') { openDiagnosis(); return; }
    if (state.phase !== 'repair' || !state.job) return;
    const s = state.job.steps[state.stepIndex];
    if (!s) { finishJob(); return; }
    if (s.type === 'boot') { finishJob(); return; }
    completeStep(20);
  },
  jump(id) {
    const j = JOBS.find(x => x.id === id); if (!j) return;
    hideShopScene();
    state.complaint = pick(j.complaints);
    state.job = j; state.phase = 'reading'; state.timerOn = false;
    state.stepIndex = 0; state.hearts = 3; state.maxHearts = 3; state.patience = 1;
    resetPhone(j); setCustomer(j); renderHearts(); updatePatienceUI(true);
    setDock('Work order', 'Diagnose the phone on the bench.', 'READY', 'Diagnose', 'primary');
    renderDots(0, false); setProgress(0);
    menuScreen.classList.add('out');
    setTimeout(() => { menuScreen.style.display = 'none'; }, 420);
    updateDay(); updateMoney();
  },
  accept: acceptJob,
  arrive(id) {
    const j = JOBS.find(x => x.id === id); if (!j) return;
    hideShopScene();
    state.job = j; state.phase = 'arrival'; state.timerOn = false;
    state.stepIndex = 0; state.hearts = 3; state.maxHearts = 3; state.patience = 1; state.mistakes = 0;
    state.customer = pick(CUSTOMERS.filter(c => c !== state.lastCustomer));
    state.lastCustomer = state.customer;
    state.complaint = pick(j.complaints);
    resetPhone(j); setCustomer(j); renderHearts(); updatePatienceUI(true);
    renderDots(0, false); setProgress(0);
    menuScreen.classList.add('out');
    setTimeout(() => { menuScreen.style.display = 'none'; }, 420);
    updateDay(); updateMoney();
    showArrival();
  },
  setPatience(v) { state.patience = clamp(v, 0, 1); updatePatienceUI(true); },
  endDay, failJob, finishJob,
  reset: resetProgress,
  hint() { const s = state.job && state.job.steps[state.stepIndex]; if (s) showHint(s, true); }
};
