// GREEN EMPIRE — game data: strains, properties, staff, upgrades, fronts.
export const SAVE_KEY = 'greenEmpire.save.v2';
export const DAY_LENGTH = 150;

export const STRAINS = [
  {
    id: 'dime', name: 'Dime Bag OG', short: 'Dime OG', cost: 25, growTime: 26,
    yield: 8, price: 7, quality: 42, color: '#62d66b', accent: '#c4ff8a',
    desc: 'A forgiving starter strain with a skunky soul and a student budget.',
    unlockedAt: 0
  },
  {
    id: 'neon', name: 'Neon Haze', short: 'Neon', cost: 90, growTime: 38,
    yield: 11, price: 11, quality: 55, color: '#45e6b8', accent: '#9ffff0',
    desc: 'Citrus-forward, fast-finishing, and extremely photogenic under grow lights.',
    unlockedAt: 1
  },
  {
    id: 'cipher', name: 'Blue Cipher', short: 'Cipher', cost: 260, growTime: 52,
    yield: 15, price: 18, quality: 69, color: '#5ea8ff', accent: '#c2e7ff',
    desc: 'A lab-grade hybrid with a crystalline finish. Named for the colour of the ash.',
    unlockedAt: 5
  },
  {
    id: 'mamba', name: 'Velvet Mamba', short: 'Mamba', cost: 700, growTime: 72,
    yield: 20, price: 28, quality: 81, color: '#c184ff', accent: '#f3ccff',
    desc: 'Dark, resin-heavy, and unforgiving. The strain that built the Sloane syndicate.',
    unlockedAt: 8
  },
  {
    id: 'purity', name: 'Purity 99', short: 'Purity', cost: 1800, growTime: 96,
    yield: 28, price: 44, quality: 93, color: '#ffd166', accent: '#fff4b8',
    desc: "Milo's own formula. No street name. Just a number people whisper.",
    unlockedAt: 11
  }
];
export const STRAIN_BY_ID = Object.fromEntries(STRAINS.map(s => [s.id, s]));

export const QUALITY_GRADES = [
  { min: 88, name: 'Pristine', color: '#ffe27a' },
  { min: 75, name: 'Exotic', color: '#c79bff' },
  { min: 60, name: 'Dank', color: '#71e89a' },
  { min: 45, name: 'Mids', color: '#8fcfc2' },
  { min: 0, name: 'Reggie', color: '#9aa79d' }
];
export function gradeFor(q) {
  return QUALITY_GRADES.find(g => q >= g.min) || QUALITY_GRADES[QUALITY_GRADES.length - 1];
}

export const REP_RANKS = [
  { min: 92, name: 'Kingpin' },
  { min: 78, name: 'Major Player' },
  { min: 62, name: 'Known Name' },
  { min: 44, name: 'Small Timer' },
  { min: 24, name: 'Hustler' },
  { min: 0, name: 'Nobody' }
];
export function rankFor(rep) {
  return (REP_RANKS.find(r => rep >= r.min) || REP_RANKS[REP_RANKS.length - 1]).name;
}

const QUEUE = (cx, cy) => [
  [cx - 0.2, cy + 1.15],
  [cx + 0.9, cy + 1.0],
  [cx + 1.8, cy + 0.7],
  [cx - 1.25, cy + 1.35]
];

export const PROPERTIES = {
  apartment: {
    id: 'apartment', name: 'Ashgrove Apartment', short: 'Apartment', act: 'ACT I',
    tagline: 'A dead aunt, a grow light, and three square feet of hope.',
    w: 9, d: 7, cost: 0, reqMission: 0, priceMod: 1, growthMod: 0, qualityMod: 0,
    yieldMod: 0, slots: [[1.15, 1.25], [2.5, 1.2], [3.85, 1.25]],
    counter: [5.85, 4.65], door: [8.35, 6.35], queue: QUEUE(5.85, 4.65),
    palette: {
      floorA: '#6d5a46', floorB: '#77634d', wallL: '#25342c', wallR: '#304238',
      trim: '#8d7658', accent: '#7bf58a', glow: 'rgba(255, 190, 120, .22)'
    },
    decor: [
      { type: 'window', wall: 'back', u1: 4.3, u2: 7.2, z1: 52, z2: 138 },
      { type: 'poster', wall: 'left', u1: 1.25, u2: 2.75, z1: 62, z2: 118, title: 'GROW', sub: 'OR DIE', color: '#c8ff6a' },
      { type: 'shelf', wall: 'left', u1: 3.6, u2: 5.1, z1: 62, z2: 78 },
      { type: 'stringlights', wall: 'back', u1: 1.0, u2: 4.0, z: 145 }
    ],
    props: [
      { type: 'couch', x: 1.15, y: 3.75, w: 2.15, d: 1.05, hue: '#4c6b58' },
      { type: 'rug', x: 3.0, y: 3.15, w: 2.6, d: 1.9, hue: '#704c3b' },
      { type: 'table', x: 3.35, y: 3.65, w: 1.35, d: 1.05, hue: '#4a382a', pizza: true, cup: true },
      { type: 'tv', x: 0.5, y: 5.0, w: 0.9, d: 0.55 },
      { type: 'bed', x: 6.55, y: 1.25, w: 2.2, d: 1.75, hue: '#3f5a67' },
      { type: 'fridge', x: 7.9, y: 3.45 },
      { type: 'lamp', x: 0.75, y: 6.2 },
      { type: 'boxes', x: 0.4, y: 6.0 },
      { type: 'cat' }
    ]
  },
  garage: {
    id: 'garage', name: "Rourke's Auto Body", short: 'Garage', act: 'ACT II',
    tagline: 'Grease, concrete, and the smell of something that is not motor oil.',
    w: 9, d: 7, cost: 1200, reqMission: 3, priceMod: 1.12, growthMod: .06, qualityMod: 2,
    yieldMod: .04, slots: [[1.15, 1.15], [2.55, 1.15], [3.95, 1.15], [1.15, 2.5], [2.55, 2.5]],
    counter: [6.0, 4.85], door: [8.35, 6.35], queue: QUEUE(6.0, 4.85),
    palette: {
      floorA: '#565b60', floorB: '#5d6268', wallL: '#34383b', wallR: '#3e4348',
      trim: '#777d82', accent: '#ffb257', glow: 'rgba(255, 165, 80, .18)'
    },
    decor: [
      { type: 'garagedoor', wall: 'back', u1: 4.6, u2: 8.2, z1: 18, z2: 142 },
      { type: 'sign', wall: 'left', u1: 1.2, u2: 3.4, z1: 100, z2: 130, title: "ROURKE'S", sub: 'AUTO BODY', color: '#ffbd69' },
      { type: 'pegboard', wall: 'left', u1: 4.0, u2: 6.0, z1: 55, z2: 105 },
      { type: 'pipe', wall: 'back', u1: 1.0, z: 132 }
    ],
    props: [
      { type: 'car', x: 4.7, y: 2.25, w: 2.5, d: 1.35 },
      { type: 'workbench', x: 6.9, y: 0.85, w: 1.7, d: .75 },
      { type: 'tires', x: 7.95, y: 2.5 },
      { type: 'toolbox', x: 6.8, y: 3.3 },
      { type: 'crate', x: 7.9, y: 4.9, w: .8, d: .7 },
      { type: 'barrel', x: 8.1, y: 6.0 },
      { type: 'lamp', x: 3.4, y: 4.9, hang: true },
      { type: 'oil' }
    ]
  },
  lab: {
    id: 'lab', name: 'The Hive · Sublevel 3', short: 'Lab', act: 'ACT II',
    tagline: 'A forgotten cistern with perfect acoustics and terrible ventilation.',
    w: 10, d: 8, cost: 6000, reqMission: 5, priceMod: 1.3, growthMod: .12, qualityMod: 8,
    yieldMod: .08, slots: [[1.2, 1.3], [2.5, 1.3], [3.8, 1.3], [1.2, 2.55], [2.5, 2.55], [3.8, 2.55], [5.1, 1.9]],
    counter: [7.35, 5.5], door: [9.4, 7.45], queue: QUEUE(7.35, 5.5),
    palette: {
      floorA: '#2f3e46', floorB: '#35464f', wallL: '#202b34', wallR: '#283641',
      trim: '#5a707d', accent: '#6fe7ff', glow: 'rgba(110, 210, 255, .2)'
    },
    decor: [
      { type: 'duct', wall: 'back', u1: 1.5, u2: 7.3, z: 148 },
      { type: 'warning', wall: 'left', u1: 1.2, u2: 3.2, z1: 62, z2: 102 },
      { type: 'labwindow', wall: 'back', u1: 6.6, u2: 8.8, z1: 65, z2: 125 },
      { type: 'pipe', wall: 'back', u1: 9.0, z: 120 },
      { type: 'pipe', wall: 'left', u1: 6.3, z: 125 }
    ],
    props: [
      { type: 'reactor', x: 7.7, y: 1.5 },
      { type: 'labtable', x: 5.5, y: 3.0, w: 1.9, d: .8 },
      { type: 'flasks', x: 5.6, y: 3.2 },
      { type: 'barrels', x: 8.8, y: 4.0 },
      { type: 'shelf', x: 5.4, y: .75, w: 1.8 },
      { type: 'server', x: 9.0, y: 2.5 },
      { type: 'lamp', x: 4.4, y: 4.3, hang: true, color: '#8ef0ff' }
    ]
  },
  warehouse: {
    id: 'warehouse', name: 'Pier 9 Distribution', short: 'Warehouse', act: 'ACT III',
    tagline: 'Forty thousand square feet of plausible deniability.',
    w: 11, d: 8, cost: 18000, reqMission: 9, priceMod: 1.5, growthMod: .18, qualityMod: 10,
    yieldMod: .16, slots: [[1.25, 1.3], [2.6, 1.3], [3.95, 1.3], [1.25, 2.55], [2.6, 2.55], [3.95, 2.55], [1.25, 3.8], [2.6, 3.8], [3.95, 3.8]],
    counter: [7.45, 5.35], door: [10.45, 7.45], queue: QUEUE(7.45, 5.35),
    palette: {
      floorA: '#4b4a45', floorB: '#52514b', wallL: '#2b2e2f', wallR: '#35393a',
      trim: '#73776f', accent: '#ffcf6b', glow: 'rgba(255, 205, 100, .17)'
    },
    decor: [
      { type: 'sign', wall: 'back', u1: 4.6, u2: 7.2, z1: 112, z2: 150, title: 'PIER 9', sub: 'DISTRIBUTION', color: '#ffcf6b' },
      { type: 'wirefence', wall: 'left', u1: .6, u2: 4.6, z1: 20, z2: 110 },
      { type: 'duct', wall: 'back', u1: 1.0, u2: 8.6, z: 160 },
      { type: 'warning', wall: 'left', u1: 5.6, u2: 7.4, z1: 58, z2: 98 }
    ],
    props: [
      { type: 'rack', x: 5.0, y: 1.0, w: 2.3, d: .65 },
      { type: 'pallet', x: 6.3, y: 3.6, w: 1.2, d: 1.0 },
      { type: 'forklift', x: 8.4, y: 3.2 },
      { type: 'crate', x: 9.2, y: 5.0, w: .9, d: .8 },
      { type: 'barrels', x: 9.3, y: 1.2 },
      { type: 'pallet', x: 8.9, y: 6.4, w: 1.0, d: .85 },
      { type: 'lamp', x: 5.8, y: 4.6, hang: true, industrial: true },
      { type: 'lamp', x: 8.7, y: 2.0, hang: true, industrial: true }
    ]
  },
  empire: {
    id: 'empire', name: 'The Aerie', short: 'Aerie', act: 'ACT IV',
    tagline: 'The top floor. Where the smoke rises and the city looks small.',
    w: 11, d: 8, cost: 50000, reqMission: 12, priceMod: 1.8, growthMod: .25, qualityMod: 14,
    yieldMod: .24, slots: [[1.25, 1.25], [2.6, 1.25], [3.95, 1.25], [5.3, 1.25], [1.25, 2.5], [2.6, 2.5], [3.95, 2.5], [5.3, 2.5], [1.25, 3.75], [2.6, 3.75], [3.95, 3.75], [5.3, 3.75]],
    counter: [8.15, 5.25], door: [10.35, 7.15], queue: QUEUE(8.15, 5.25),
    palette: {
      floorA: '#6d665f', floorB: '#766f67', wallL: '#24222b', wallR: '#2d2b34',
      trim: '#b39a6b', accent: '#ffd98a', glow: 'rgba(255, 215, 140, .22)'
    },
    decor: [
      { type: 'skyline', wall: 'back', u1: .8, u2: 10.2, z1: 34, z2: 158 },
      { type: 'art', wall: 'left', u1: 1.3, u2: 3.2, z1: 78, z2: 120 },
      { type: 'neon', wall: 'left', u1: 4.4, u2: 6.4, z1: 98, z2: 125, title: 'EMPIRE', color: '#ffd98a' }
    ],
    props: [
      { type: 'sofa', x: 6.3, y: 2.0, w: 2.3, d: 1.0, hue: '#7d3f4c' },
      { type: 'rug', x: 6.6, y: 3.3, w: 2.6, d: 1.7, hue: '#4d3a32' },
      { type: 'table', x: 7.05, y: 3.75, w: 1.2, d: .8, hue: '#3b2f28' },
      { type: 'aquarium', x: 7.3, y: .85 },
      { type: 'bar', x: 9.3, y: 2.2 },
      { type: 'plant', x: 5.7, y: 5.2, big: true },
      { type: 'plant', x: 3.4, y: 5.4, big: true },
      { type: 'lamp', x: 6.6, y: 5.1, hang: false, color: '#ffd98a' }
    ]
  }
};
export const PROPERTY_LIST = Object.values(PROPERTIES);

export const STAFF = [
  { id: 'bea', name: 'Bea', role: 'Trimmer', cost: 350, wage: 18, color: '#f0a35e',
    desc: 'Auto-harvests mature plants every 8 seconds.', power: 'Auto-harvest' },
  { id: 'tito', name: 'Tito', role: 'Budtender', cost: 550, wage: 26, color: '#67d9a2',
    desc: 'Auto-serves waiting customers every 6 seconds.', power: 'Auto-sell' },
  { id: 'priya', name: 'Priya', role: 'Chemist', cost: 1400, wage: 42, color: '#9ad1ff',
    desc: '+8 harvest quality. Unlocks instant batch stabilization.', power: '+8 quality' },
  { id: 'bruno', name: 'Bruno', role: 'Muscle', cost: 1000, wage: 36, color: '#d78b8b',
    desc: '-25% heat gain and smaller losses when raided.', power: '-25% heat' }
];
export const STAFF_BY_ID = Object.fromEntries(STAFF.map(s => [s.id, s]));

export const UPGRADES = [
  { id: 'lights', name: 'Grow Lights', icon: 'bulb', max: 5, base: 240, growth: 1.7,
    desc: '+12% growth speed per level' },
  { id: 'vent', name: 'Ventilation', icon: 'wind', max: 4, base: 320, growth: 1.8,
    desc: '+4 harvest quality per level' },
  { id: 'irrigation', name: 'Irrigation', icon: 'drop', max: 3, base: 420, growth: 1.9,
    desc: '+2 harvest quality per level' },
  { id: 'security', name: 'Security', icon: 'shield', max: 3, base: 650, growth: 2.0,
    desc: '-12% heat gain and raid losses per level' },
  { id: 'counter', name: 'Counter Display', icon: 'tag', max: 3, base: 500, growth: 1.9,
    desc: '+7% sale prices per level' }
];
export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const FRONTS = [
  { id: 'legal', name: 'Kestrel Legal', kind: 'Law office', cost: 2500, req: 2,
    rate: 0, conv: 0, heat: .2, rep: 0,
    desc: 'A lawyer on retainer. Cools police interest and improves every wash.',
    tag: 'Heat -0.2/s · +6% wash rate' },
  { id: 'carwash', name: 'Sunshine Car Wash', kind: 'Car wash', cost: 6000, req: 3,
    rate: 75, conv: .75, heat: .04, rep: 0,
    desc: 'Soap, foam, and a bookkeeper who knows when not to look.',
    tag: 'Washes $75/min · 75% clean' },
  { id: 'chicken', name: 'Cluck & Cover', kind: 'Fried chicken', cost: 15000, req: 8,
    rate: 230, conv: .8, heat: .02, rep: 2,
    desc: 'Eleven herbs and spices. Zero questions about the till.',
    tag: 'Washes $230/min · +2 rep' },
  { id: 'club', name: 'The Velvet Room', kind: 'Night club', cost: 35000, req: 12,
    rate: 620, conv: .86, heat: 0, rep: 5,
    desc: 'The crown jewel of the empire. Money goes in dirty, comes out legendary.',
    tag: 'Washes $620/min · 86% clean' }
];
export const FRONT_BY_ID = Object.fromEntries(FRONTS.map(f => [f.id, f]));

export const BUFFS = [
  { id: 'bloom', name: 'Grow Bloom', cost: 120, color: '#7bf58a', type: 'yield',
    desc: '+25% yield for the next 3 harvests' },
  { id: 'resin', name: 'Resin Boost', cost: 220, color: '#c79bff', type: 'quality',
    desc: '+9 harvest quality for the next 3 harvests' },
  { id: 'rush', name: 'Rush Feed', cost: 170, color: '#6fe7ff', type: 'speed',
    desc: '+40% growth speed for the next 3 harvests' }
];

export const PRICING = {
  bargain: { name: 'Bargain', mod: .84, rep: 1.5, heat: .8, note: 'Fast turnover. Customers love you.' },
  standard: { name: 'Standard', mod: 1, rep: 1, heat: 1, note: 'Fair market value. The usual.' },
  premium: { name: 'Premium', mod: 1.28, rep: .4, heat: 1.35, note: 'Top shelf tax. Reputation takes the hit.' }
};

export const CUSTOMER_TYPES = [
  { id: 'student', name: 'Student', mult: .9, tip: .7, weight: 22, skin: '#c58c63', shirt: '#5b7cc9', hair: '#462f22' },
  { id: 'tourist', name: 'Tourist', mult: 1.15, tip: 1.2, weight: 14, skin: '#e0ad83', shirt: '#e7b34c', hair: '#c9a24a' },
  { id: 'suit', name: 'Suit', mult: 1.35, tip: 1.6, weight: 12, skin: '#b57c55', shirt: '#323844', hair: '#22201f' },
  { id: 'punk', name: 'Local', mult: .95, tip: .8, weight: 20, skin: '#8d6044', shirt: '#b1495b', hair: '#1d1512' },
  { id: 'mom', name: 'Neighbour', mult: 1.05, tip: 1.1, weight: 14, skin: '#deb287', shirt: '#7b9b72', hair: '#6d4a33' },
  { id: 'influencer', name: 'Influencer', mult: 1.2, tip: 1.8, weight: 10, skin: '#e7bb96', shirt: '#c76ee0', hair: '#291f33' },
  { id: 'veteran', name: 'Old Timer', mult: 1.0, tip: 1.3, weight: 10, skin: '#a97a58', shirt: '#707a6b', hair: '#c9c7bd' }
];
