/* Pixel & Sons — shared constants, data, helpers, audio. */
'use strict';

const W = 1200, H = 760;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const stage = document.getElementById('stage');
const $ = (id) => document.getElementById(id);
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
canvas.width = W * DPR;
canvas.height = H * DPR;
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

const PHONE = { x: 482, y: 158, w: 236, h: 468 };
const SCREEN = { x: 491, y: 167, w: 218, h: 450 };
const INNER = { x: 496, y: 172, w: 208, h: 436 };
const POWER = { x: 722, y: 261 };
const BIN = { x: 232, y: 508, w: 116, h: 136 };
const TRAY = { x: 742, y: 246, w: 132, h: 372 };
const SIDE_SCREEN = { cx: 398, cy: 326, scale: 0.74, rot: -0.085 };
const SIDE_HIT = { x: 310, y: 150, w: 182, h: 360 };

const SCREW_SETS = {
  bottom: [{ x: 508, y: 600 }, { x: 692, y: 600 }],
  port: [{ x: 536, y: 552 }, { x: 664, y: 552 }],
  speaker: [{ x: 552, y: 514 }, { x: 648, y: 514 }]
};
const CONNECTORS = {
  display: { x: 657, y: 312, r: 18 },
  battery: { x: 678, y: 352, r: 18 },
  camera: { x: 626, y: 214, r: 18 }
};
const PART_RECTS = {
  battery: { x: 546, y: 350, w: 132, h: 120 },
  camera: { x: 506, y: 178, w: 64, h: 64 },
  speaker: { x: 546, y: 528, w: 108, h: 30 },
  port: { x: 546, y: 568, w: 108, h: 30 }
};
const PART_NAT = {
  screen: { w: 218, h: 450 },
  protector: { w: 218, h: 450 },
  battery: { w: 132, h: 120 },
  camera: { w: 64, h: 64 },
  speaker: { w: 108, h: 30 },
  port: { w: 108, h: 30 }
};
const PART_LABEL = {
  screen: 'SCREEN', protector: 'PROTECTOR', battery: 'BATTERY',
  camera: 'CAMERA', speaker: 'SPEAKER', port: 'PORT'
};
const TOOL_NAMES = {
  heat: 'Heat gun', driver: 'Screwdriver', suction: 'Suction cup',
  spudger: 'Spudger', tweezers: 'Tweezers', cloth: 'Cloth', hand: 'Your hand'
};

/* ---------------------------------------------------------
   Customers & jobs
   --------------------------------------------------------- */
const ORDERS = [
  {
    name: 'Maya Chen', avatar: '👩🏻', weekday: 'Monday', time: '9:02 am',
    model: 'iFruit 12', repair: 'protector', repairLabel: 'Screen protector',
    issue: '“cracked” screen', base: 42, limit: 105,
    body: '#b7a6c6', glowA: '#f6b46a', glowB: '#c9688c', seed: 11,
    quote: 'I dropped it at the skate park and the glass went full spiderweb. I can’t look at it.',
    comment5: 'It was just the protector? You’re a wizard. I’m telling the whole skate park.'
  },
  {
    name: 'Marcus Webb', avatar: '👨🏽', weekday: 'Monday', time: '11:40 am',
    model: 'Galaxo S21', repair: 'screen', repairLabel: 'Screen replacement',
    issue: 'cracked screen', base: 120, limit: 170,
    body: '#4a4f57', glowA: '#7fa2d6', glowB: '#2c3b5a', seed: 22,
    quote: 'Fumbled it getting out of the car. Screen’s cracked and the touch is jumping all over.',
    comment5: 'Smooth as glass. You just saved me eight hundred bucks, my friend.'
  },
  {
    name: 'Nina Patel', avatar: '👩🏾', weekday: 'Tuesday', time: '10:15 am',
    model: 'Pixi 6', repair: 'battery', repairLabel: 'Battery replacement',
    issue: 'dead battery', base: 98, limit: 155,
    body: '#9dc2b5', glowA: '#7ee0b0', glowB: '#2a6b58', seed: 33,
    quote: 'It dies at forty percent. Then sixty. Then it’s just… gone. I need my maps, please.',
    comment5: 'It’s been at a hundred for an hour. I forgot what that felt like. Thank you!'
  },
  {
    name: 'Dwayne Brooks', avatar: '👨🏿', weekday: 'Wednesday', time: '1:30 pm',
    model: 'iFruit 11', repair: 'port', repairLabel: 'Charging port',
    issue: 'won’t charge', base: 88, limit: 150,
    body: '#d8d2c6', glowA: '#f3c969', glowB: '#c46a44', seed: 44,
    quote: 'The charger only works if I hold it at a forty-seven degree angle and pray.',
    comment5: 'Clicked in first try. First try! I’m never lending it to my brother again.'
  },
  {
    name: 'Sofia Reyes', avatar: '👩🏼', weekday: 'Thursday', time: '9:48 am',
    model: 'Galaxo Note', repair: 'water', repairLabel: 'Water damage',
    issue: 'pool incident', base: 142, limit: 180,
    body: '#536b91', glowA: '#67c6d8', glowB: '#2a5e7a', seed: 55,
    quote: 'My kid pushed me into the pool. With the phone. It’s been in rice for two days.',
    comment5: 'You brought it back from the dead. I owe you a coffee. Or a pool float.'
  },
  {
    name: 'Theo Kim', avatar: '🧑🏻', weekday: 'Friday', time: '11:05 am',
    model: 'Pixi Pro', repair: 'camera', repairLabel: 'Rear camera',
    issue: 'blurry photos', base: 112, limit: 165,
    body: '#b5645a', glowA: '#ffb27a', glowB: '#c3514d', seed: 66,
    quote: 'Every photo looks like it was taken through a greasy window. And there’s a crack.',
    comment5: 'Sharp. Like, actually sharp. My cat is horrified by the detail.'
  },
  {
    name: 'Bea Osei', avatar: '👩🏽', weekday: 'Friday', time: '3:22 pm',
    model: 'iFruit 13', repair: 'speaker', repairLabel: 'Speaker replacement',
    issue: 'crackly calls', base: 108, limit: 165,
    body: '#c8ab74', glowA: '#f7d9a0', glowB: '#b3764b', seed: 77,
    quote: 'Every call sounds like popcorn. My boss thinks I’m at a rave.',
    comment5: 'Crystal clear. My boss can hear me sigh now. Thanks, I think.'
  },
  {
    name: 'Ray Alvarez', avatar: '👨🏻', weekday: 'Saturday', time: '12:10 pm',
    model: 'Galaxo Ultra', repair: 'both', repairLabel: 'Screen + battery',
    issue: 'rush job', base: 260, limit: 215,
    body: '#3d4147', glowA: '#9a8bef', glowB: '#3f2f7a', seed: 88,
    quote: 'Cracked screen AND the battery is swelling up. I need it by two for a wedding speech.',
    comment5: 'Two fixes, one visit, and I made it to the wedding. You are an absolute legend.'
  }
];

const STAR_COMMENTS = {
  5: 'Better than new. I’m telling everyone.',
  4: 'Looks great. Tiny scuff on the corner, but I’m happy.',
  3: 'It works! Took a while, but it works.',
  2: 'Hmm. It works… mostly. I’ve seen faster.',
  1: 'Well, it turns on. I suppose that’s something.'
};
const MOODS = { 5: 'Delighted', 4: 'Happy', 3: 'Satisfied', 2: 'Unimpressed', 1: 'Tolerated' };

/* ---------------------------------------------------------
   Repair procedures
   --------------------------------------------------------- */
const mkHeat = () => ({
  type: 'heat', tool: 'heat', need: 2.2,
  label: 'Warm the adhesive',
  hint: 'Hold the heat gun over the screen until the glue softens.'
});
const mkScrews = (where, label, hint) => ({
  type: 'unscrew', tool: 'driver', where,
  count: SCREW_SETS[where].length, label, hint
});
const mkPry = () => ({
  type: 'pry', tool: 'suction',
  label: 'Lift the display',
  hint: 'Press the suction cup on the screen, then drag it upward.'
});
const mkDisconnect = (name) => ({
  type: 'disconnect', tool: 'spudger', name,
  label: name === 'display' ? 'Pop the display cable' : name === 'battery' ? 'Pop the battery cable' : 'Free the camera cable',
  hint: name === 'display' ? 'Hold the spudger on the gold display connector.'
    : name === 'battery' ? 'Hold the spudger on the battery connector.'
    : 'Hold the spudger on the camera connector.'
});
const mkRemove = (part, label, hint) => ({
  type: 'remove', tool: 'tweezers', part, label, hint
});
const mkInstall = (part, label, hint) => ({
  type: 'install', tool: 'hand', part, label, hint
});
const mkClose = () => ({
  type: 'close', tool: 'hand', need: 1.0,
  label: 'Press the phone shut',
  hint: 'Hold your hand on the phone until the screen clicks home.'
});
const mkTest = () => ({
  type: 'test', tool: 'hand',
  label: 'Power it on',
  hint: 'Tap the side button and let it boot up.'
});
const mkClean = () => ({
  type: 'clean', tool: 'cloth',
  label: 'Wipe the glass',
  hint: 'Drag the cloth back and forth across the screen.'
});
const mkSmooth = () => ({
  type: 'smooth', tool: 'cloth',
  label: 'Buff out the bubbles',
  hint: 'Rub the cloth across the protector until it’s glassy.'
});
const mkDry = () => ({
  type: 'dry', tool: 'heat', need: 2.6,
  label: 'Evaporate the water',
  hint: 'Hold the heat gun inside the open phone. Gently.'
});
const mkScrub = () => ({
  type: 'scrub', tool: 'cloth',
  label: 'Scrub the corrosion',
  hint: 'Drag the cloth over the green gunk on the board.'
});

function buildTasks(order) {
  const procs = {
    protector: () => [
      mkRemove('protector', 'Peel off the old film', 'Drag the cracked film into the broken-parts bin.'),
      mkClean(), mkInstall('protector', 'Apply a fresh protector', 'Drag the new protector from the tray onto the screen.'),
      mkSmooth(), mkTest()
    ],
    screen: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDisconnect('display'),
      mkRemove('screen', 'Pull the broken screen', 'Drag the loose screen into the broken-parts bin.'),
      mkInstall('screen', 'Fit the new screen', 'Drag the new screen from the parts tray onto the phone.'),
      mkClose(), mkTest()
    ],
    battery: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDisconnect('battery'),
      mkRemove('battery', 'Pull the dead battery', 'Tweezers on the old battery — drag it into the bin.'),
      mkInstall('battery', 'Seat the new battery', 'Drag the fresh battery from the tray into the phone.'),
      mkClose(), mkTest()
    ],
    port: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDisconnect('battery'),
      mkScrews('port', 'Free the charging board', 'Two more screws above the charging port.'),
      mkRemove('port', 'Extract the charging port', 'Drag the corroded port board into the bin.'),
      mkInstall('port', 'Fit a new charging port', 'Drag the new port board from the tray into place.'),
      mkClose(), mkTest()
    ],
    water: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDry(), mkScrub(), mkClose(), mkTest()
    ],
    camera: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDisconnect('camera'),
      mkRemove('camera', 'Pull the broken camera', 'Tweezers on the camera module — into the bin.'),
      mkInstall('camera', 'Fit the new camera', 'Drag the new camera module from the tray.'),
      mkClose(), mkTest()
    ],
    speaker: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(),
      mkScrews('speaker', 'Free the speaker', 'Two screws either side of the speaker grille.'),
      mkRemove('speaker', 'Pull the blown speaker', 'Drag the speaker into the broken-parts bin.'),
      mkInstall('speaker', 'Fit a new speaker', 'Drag the new speaker from the tray.'),
      mkClose(), mkTest()
    ],
    both: () => [
      mkHeat(), mkScrews('bottom', 'Remove the bottom screws', 'Hold the driver on each pentalobe screw until it lifts out.'),
      mkPry(), mkDisconnect('display'),
      mkRemove('screen', 'Pull the broken screen', 'Drag the loose screen into the broken-parts bin.'),
      mkDisconnect('battery'),
      mkRemove('battery', 'Pull the swollen battery', 'Tweezers on the old battery — into the bin.'),
      mkInstall('battery', 'Seat the new battery', 'Drag the fresh battery into the phone.'),
      mkInstall('screen', 'Fit the new screen', 'Drag the new screen from the tray onto the phone.'),
      mkClose(), mkTest()
    ]
  };
  return procs[order.repair]();
}

/* ---------------------------------------------------------
   Small helpers
   --------------------------------------------------------- */
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function inRect(p, r, pad = 0) {
  return p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad;
}
function inPhone(p, pad = 8) { return inRect(p, PHONE, pad); }
function inScreen(p, pad = 0) { return inRect(p, SCREEN, pad); }
function inSideScreen(p) { return inRect(p, SIDE_HIT); }
function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}
function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function makeCracks(seed) {
  const r = mulberry32(seed);
  const cx = 0.5 + r() * 0.24, cy = 0.2 + r() * 0.17;
  const lines = [];
  const count = 10 + Math.floor(r() * 4);
  for (let i = 0; i < count; i++) {
    let a = r() * Math.PI * 2, x = cx, y = cy;
    const pts = [{ x, y }];
    const len = 3 + Math.floor(r() * 5);
    for (let j = 0; j < len; j++) {
      a += (r() - 0.5) * 1.15;
      const d = 0.025 + r() * 0.085;
      x += Math.cos(a) * d;
      y += Math.sin(a) * d * 0.92;
      pts.push({ x, y });
    }
    lines.push(pts);
  }
  return lines;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

/* ---------------------------------------------------------
   Audio — tiny procedural sound kit
   --------------------------------------------------------- */
let AC = null;
let muted = false;
try { muted = localStorage.getItem('pixelward.muted') === '1'; } catch (e) { /* ignore */ }

function ensureAudio() {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) AC = new C();
  }
  if (AC && AC.state === 'suspended') AC.resume();
}
function tone(freq, dur, type = 'sine', vol = 0.05, slideTo = null, when = 0) {
  if (!AC || muted) return;
  const t0 = AC.currentTime + when;
  const osc = AC.createOscillator();
  const gain = AC.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(AC.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}
function noiseBurst(dur = 0.08, vol = 0.03, hp = 900, when = 0) {
  if (!AC || muted) return;
  const t0 = AC.currentTime + when;
  const len = Math.max(1, Math.floor(AC.sampleRate * dur));
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = AC.createBufferSource();
  src.buffer = buf;
  const g = AC.createGain();
  g.gain.value = vol;
  const f = AC.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp;
  src.connect(f).connect(g).connect(AC.destination);
  src.start(t0);
}
function sfx(name) {
  if (!AC || muted) return;
  switch (name) {
    case 'tap': tone(480, 0.05, 'sine', 0.03); break;
    case 'select': tone(560, 0.06, 'triangle', 0.035); tone(760, 0.05, 'sine', 0.018, null, 0.03); break;
    case 'pick': tone(300, 0.05, 'triangle', 0.03); break;
    case 'screw': noiseBurst(0.06, 0.035, 1800); tone(160, 0.06, 'sawtooth', 0.025, 120); break;
    case 'unscrew': tone(520, 0.1, 'sine', 0.04, 820); noiseBurst(0.05, 0.02, 2400); break;
    case 'heat': noiseBurst(0.18, 0.015, 500); break;
    case 'pop': tone(620, 0.11, 'sine', 0.045, 980); break;
    case 'install': tone(150, 0.16, 'sine', 0.06, 90); tone(480, 0.09, 'triangle', 0.03, 660, 0.06); break;
    case 'trash': tone(120, 0.12, 'square', 0.03); noiseBurst(0.1, 0.03, 300); break;
    case 'wrong': tone(150, 0.14, 'square', 0.035, 110); break;
    case 'step': tone(660, 0.08, 'sine', 0.035); tone(880, 0.09, 'sine', 0.028, null, 0.06); break;
    case 'boot': tone(330, 0.5, 'sine', 0.035, 660); tone(495, 0.4, 'triangle', 0.02, 990, 0.15); break;
    case 'success': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, 'triangle', 0.045, null, i * 0.09)); break;
    case 'coin': tone(900, 0.1, 'square', 0.028); tone(1350, 0.2, 'sine', 0.03, null, 0.08); break;
    case 'stamp': tone(90, 0.16, 'sine', 0.08, 60); noiseBurst(0.08, 0.04, 200); break;
  }
}
