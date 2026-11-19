import { TAU, clamp, lerp, smoothstep, mulberry32, hash2, Noise } from './util.js';

export const WORLD = 2400;
const GRID = 600;
const HALF = WORLD / 2;

export const RESOURCE_META = {
  tree: {
    name: 'Pine Tree',
    action: 'Chop',
    icon: 'axe',
    resource: 'wood',
    resourceName: 'Wood',
    duration: 1.15,
    respawn: 52,
    hits: 3,
    reach: 84,
    radius: 15,
  },
  rock: {
    name: 'Boulder',
    action: 'Mine',
    icon: 'pick',
    resource: 'stone',
    resourceName: 'Stone',
    duration: 1.38,
    respawn: 66,
    hits: 3,
    reach: 80,
    radius: 18,
  },
  bush: {
    name: 'Berry Bush',
    action: 'Pick',
    icon: 'berry',
    resource: 'food',
    resourceName: 'Berries',
    duration: 0.88,
    respawn: 42,
    hits: 2,
    reach: 74,
    radius: 14,
  },
};

const WATER_DEEP = [20, 68, 84];
const WATER_MID = [38, 108, 120];
const WATER_SHALLOW = [92, 168, 158];
const FOAM = [203, 224, 207];
const WET_SAND = [181, 164, 124];
const SAND = [211, 190, 146];
const SAND_LIGHT = [224, 205, 162];
const GRASS_EDGE = [126, 148, 90];
const GRASS = [89, 127, 76];
const GRASS_LUSH = [61, 100, 68];
const GRASS_MOSS = [108, 139, 78];
const GRASS_DRY = [143, 151, 90];

export function createWorld(seed = (Math.random() * 1e9) | 0) {
  const noise = new Noise(seed);
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const height = new Float32Array(GRID * GRID);
  const moisture = new Float32Array(GRID * GRID);
  const center = { x: HALF, y: HALF };

  const coastPhase = rand() * TAU;
  const ponds = [
    {
      x: center.x - 195,
      y: center.y - 305,
      r: 78 + rand() * 18,
      near: true,
    },
    {
      x: center.x + Math.cos(rand() * TAU) * (560 + rand() * 120),
      y: center.y + Math.sin(rand() * TAU) * (470 + rand() * 120),
      r: 82 + rand() * 46,
    },
  ];

  for (let gy = 0; gy < GRID; gy++) {
    const ny = (gy / (GRID - 1)) * 2 - 1;
    for (let gx = 0; gx < GRID; gx++) {
      const nx = (gx / (GRID - 1)) * 2 - 1;
      const ang = Math.atan2(ny, nx);
      const coast =
        0.79 +
        0.075 * Math.sin(ang * 3 + coastPhase) +
        0.05 * Math.sin(ang * 5 - coastPhase * 1.37) +
        0.035 * Math.sin(ang * 7 + coastPhase * 2.11) +
        0.06 * (noise.fbm(nx * 2.1 + 4.3, ny * 2.1 - 2.7, 3) - 0.5) * 2;
      const d = Math.hypot(nx, ny * 1.06);
      let e = (1 - d / coast) * 1.02;
      e += (noise.fbm(nx * 2.7 + 12.4, ny * 2.7 - 8.2, 4) - 0.5) * 0.34;
      e += (noise.fbm(nx * 6.4 - 3.7, ny * 6.4 + 6.1, 3) - 0.5) * 0.055;

      const wx = (gx / (GRID - 1)) * WORLD;
      const wy = (gy / (GRID - 1)) * WORLD;
      for (const pond of ponds) {
        const pd = Math.hypot(wx - pond.x, wy - pond.y) / pond.r;
        if (pd < 1.45) e -= 0.98 * (1 - smoothstep(0.5, 1.45, pd));
      }

      const idx = gy * GRID + gx;
      height[idx] = e;
      const m = noise.fbm(nx * 2.05 - 6.2, ny * 2.05 + 8.6, 3);
      moisture[idx] = clamp((m - 0.3) * 1.55 + 0.48 + (1 - clamp(e, 0, 1)) * 0.12, 0, 1);
    }
  }

  function sampleField(field, x, y) {
    const fx = clamp((x / WORLD) * (GRID - 1), 0, GRID - 1.001);
    const fy = clamp((y / WORLD) * (GRID - 1), 0, GRID - 1.001);
    const x0 = fx | 0;
    const y0 = fy | 0;
    const tx = fx - x0;
    const ty = fy - y0;
    const i0 = y0 * GRID + x0;
    const a = field[i0];
    const b = field[i0 + 1];
    const c = field[i0 + GRID];
    const d = field[i0 + GRID + 1];
    return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
  }

  const heightAt = (x, y) => sampleField(height, x, y);
  const moistureAt = (x, y) => sampleField(moisture, x, y);
  const isLand = (x, y, min = 0.015) =>
    x > 12 && y > 12 && x < WORLD - 12 && y < WORLD - 12 && heightAt(x, y) > min;

  /* ---------- painted terrain base ---------- */
  const BASE = 1024;
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = BASE;
  baseCanvas.height = BASE;
  const bctx = baseCanvas.getContext('2d');
  const img = bctx.createImageData(BASE, BASE);
  const data = img.data;

  for (let py = 0; py < BASE; py++) {
    const wy = (py / (BASE - 1)) * WORLD;
    for (let px = 0; px < BASE; px++) {
      const wx = (px / (BASE - 1)) * WORLD;
      const e = sampleField(height, wx, wy);
      const m = sampleField(moisture, wx, wy);
      let r, g, b;

      if (e < 0.012) {
        const deep = smoothstep(-0.62, -0.13, e);
        const shallow = smoothstep(-0.24, 0.012, e);
        r = lerp(lerp(WATER_DEEP[0], WATER_MID[0], deep), WATER_SHALLOW[0], shallow * 0.85);
        g = lerp(lerp(WATER_DEEP[1], WATER_MID[1], deep), WATER_SHALLOW[1], shallow * 0.85);
        b = lerp(lerp(WATER_DEEP[2], WATER_MID[2], deep), WATER_SHALLOW[2], shallow * 0.85);
        const w = (hash2(px >> 2, py >> 2, seed + 11) - 0.5) * 9;
        r += w;
        g += w;
        b += w;
        if (e > -0.045) {
          const f = smoothstep(-0.045, 0.012, e);
          r = lerp(r, FOAM[0], f * 0.42);
          g = lerp(g, FOAM[1], f * 0.42);
          b = lerp(b, FOAM[2], f * 0.42);
        }
      } else if (e < 0.088) {
        const t = smoothstep(0.012, 0.088, e);
        r = lerp(WET_SAND[0], SAND[0], t);
        g = lerp(WET_SAND[1], SAND[1], t);
        b = lerp(WET_SAND[2], SAND[2], t);
        if (e < 0.034) {
          const f = smoothstep(0.034, 0.012, e);
          r = lerp(r, FOAM[0], f * 0.5);
          g = lerp(g, FOAM[1], f * 0.5);
          b = lerp(b, FOAM[2], f * 0.5);
        } else {
          const dry = smoothstep(0.04, 0.09, e);
          r = lerp(r, SAND_LIGHT[0], dry * 0.5);
          g = lerp(g, SAND_LIGHT[1], dry * 0.5);
          b = lerp(b, SAND_LIGHT[2], dry * 0.5);
        }
        const w = (hash2(px >> 1, py >> 1, seed + 23) - 0.5) * 7;
        r += w;
        g += w;
        b += w;
      } else {
        const t = smoothstep(0.088, 0.17, e);
        r = lerp(GRASS_EDGE[0], GRASS[0], t);
        g = lerp(GRASS_EDGE[1], GRASS[1], t);
        b = lerp(GRASS_EDGE[2], GRASS[2], t);
        const lush = smoothstep(0.25, 0.8, m);
        r = lerp(r, GRASS_LUSH[0], lush * 0.72);
        g = lerp(g, GRASS_LUSH[1], lush * 0.72);
        b = lerp(b, GRASS_LUSH[2], lush * 0.72);
        const dry = 1 - smoothstep(0.16, 0.52, m);
        r = lerp(r, GRASS_DRY[0], dry * 0.3);
        g = lerp(g, GRASS_DRY[1], dry * 0.3);
        b = lerp(b, GRASS_DRY[2], dry * 0.3);
        const high = smoothstep(0.28, 0.95, e);
        r = lerp(r, GRASS_MOSS[0], high * 0.28);
        g = lerp(g, GRASS_MOSS[1], high * 0.28);
        b = lerp(b, GRASS_MOSS[2], high * 0.28);
        const w = (hash2(px, py, seed + 37) - 0.5) * 12;
        r += w;
        g += w;
        b += w;
      }

      const i = (py * BASE + px) * 4;
      data[i] = clamp(r, 0, 255);
      data[i + 1] = clamp(g, 0, 255);
      data[i + 2] = clamp(b, 0, 255);
      data[i + 3] = 255;
    }
  }
  bctx.putImageData(img, 0, 0);

  // broad, soft watercolour mottling
  for (let i = 0; i < 220; i++) {
    const bx = rand() * BASE;
    const by = rand() * BASE;
    const wx = (bx / BASE) * WORLD;
    const wy = (by / BASE) * WORLD;
    const e = sampleField(height, wx, wy);
    const rad = 14 + rand() * 58;
    let col;
    if (e < 0.01) col = rand() < 0.5 ? WATER_MID : WATER_SHALLOW;
    else if (e < 0.09) col = rand() < 0.5 ? SAND : SAND_LIGHT;
    else col = rand() < 0.45 ? GRASS_LUSH : rand() < 0.5 ? GRASS_MOSS : GRASS_DRY;
    bctx.globalAlpha = 0.035 + rand() * 0.045;
    bctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    bctx.beginPath();
    bctx.ellipse(bx, by, rad, rad * (0.55 + rand() * 0.6), rand() * TAU, 0, TAU);
    bctx.fill();
  }
  bctx.globalAlpha = 1;

  const terrain = document.createElement('canvas');
  terrain.width = WORLD;
  terrain.height = WORLD;
  const tctx = terrain.getContext('2d');
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(baseCanvas, 0, 0, WORLD, WORLD);

  /* ---------- hand-painted detail pass ---------- */
  const detail = mulberry32(seed ^ 0x51ed270b);

  // soft shore foam and ripples
  for (let i = 0; i < 7200; i++) {
    const x = detail() * WORLD;
    const y = detail() * WORLD;
    const e = heightAt(x, y);
    if (e > -0.055 && e < 0.062) {
      const a = 0.1 + detail() * 0.3;
      tctx.strokeStyle = `rgba(232,241,224,${a})`;
      tctx.lineWidth = 0.7 + detail() * 1.4;
      tctx.beginPath();
      const rr = 1.5 + detail() * 5.5;
      tctx.arc(x, y, rr, Math.PI * (0.1 + detail() * 0.35), Math.PI * (0.6 + detail() * 0.45));
      tctx.stroke();
    } else if (e > -0.42 && e < -0.06) {
      const a = 0.035 + detail() * 0.075;
      tctx.strokeStyle = `rgba(220,238,226,${a})`;
      tctx.lineWidth = 0.6 + detail() * 1.2;
      const len = 3 + detail() * 12;
      const yy = y;
      tctx.beginPath();
      tctx.moveTo(x - len, yy);
      tctx.quadraticCurveTo(x, yy - 1.5 - detail() * 2, x + len, yy);
      tctx.stroke();
    }
  }

  // grass strokes
  for (let i = 0; i < 24000; i++) {
    const x = detail() * WORLD;
    const y = detail() * WORLD;
    const e = heightAt(x, y);
    if (e < 0.1) continue;
    const m = moistureAt(x, y);
    const lush = m > 0.52;
    const roll = detail();
    let col;
    if (roll < 0.42) col = lush ? '86,124,68' : '112,138,76';
    else if (roll < 0.76) col = lush ? '61,99,63' : '132,146,84';
    else col = lush ? '111,142,82' : '150,155,96';
    const a = 0.16 + detail() * 0.26;
    const len = 2.2 + detail() * 5;
    const lean = (detail() - 0.5) * 3.4;
    tctx.strokeStyle = `rgba(${col},${a})`;
    tctx.lineWidth = 0.6 + detail() * 0.9;
    tctx.beginPath();
    tctx.moveTo(x, y);
    tctx.quadraticCurveTo(x + lean * 0.4, y - len * 0.55, x + lean, y - len);
    tctx.stroke();
  }

  // flower clusters
  const flowerCols = ['238,230,201', '222,197,132', '212,168,155', '232,226,214'];
  for (let i = 0; i < 280; i++) {
    const cx = detail() * WORLD;
    const cy = detail() * WORLD;
    if (heightAt(cx, cy) < 0.13) continue;
    const count = 2 + ((detail() * 5) | 0);
    const col = flowerCols[(detail() * flowerCols.length) | 0];
    for (let j = 0; j < count; j++) {
      const x = cx + (detail() - 0.5) * 18;
      const y = cy + (detail() - 0.5) * 16;
      tctx.fillStyle = `rgba(${col},${0.35 + detail() * 0.4})`;
      tctx.beginPath();
      tctx.arc(x, y, 0.7 + detail() * 1.1, 0, TAU);
      tctx.fill();
    }
  }

  // pebbles on the sand
  for (let i = 0; i < 850; i++) {
    const x = detail() * WORLD;
    const y = detail() * WORLD;
    const e = heightAt(x, y);
    if (e < 0.015 || e > 0.1) continue;
    tctx.fillStyle = `rgba(${110 + ((detail() * 35) | 0)},${104 + ((detail() * 30) | 0)},${90 + ((detail() * 30) | 0)},${0.18 + detail() * 0.28})`;
    tctx.beginPath();
    tctx.ellipse(x, y, 0.7 + detail() * 1.6, 0.5 + detail() * 1.1, detail() * TAU, 0, TAU);
    tctx.fill();
  }

  // fallen leaves and dry twigs
  for (let i = 0; i < 1200; i++) {
    const x = detail() * WORLD;
    const y = detail() * WORLD;
    if (heightAt(x, y) < 0.12) continue;
    const warm = detail() < 0.55;
    tctx.strokeStyle = warm
      ? `rgba(${126 + ((detail() * 30) | 0)},${101 + ((detail() * 25) | 0)},62,${0.12 + detail() * 0.18})`
      : `rgba(76,104,64,${0.1 + detail() * 0.16})`;
    tctx.lineWidth = 0.7;
    tctx.beginPath();
    const ang = detail() * TAU;
    const len = 1.2 + detail() * 2.6;
    tctx.moveTo(x, y);
    tctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    tctx.stroke();
  }

  // gentle paths radiating from the starting clearing
  const pathRand = mulberry32(seed ^ 0x2a1b3c4d);
  for (let p = 0; p < 3; p++) {
    const ang = pathRand() * TAU;
    let px = center.x;
    let py = center.y;
    for (let s = 0; s < 34; s++) {
      const wob = (pathRand() - 0.5) * 0.5;
      px += Math.cos(ang + wob) * 22;
      py += Math.sin(ang + wob) * 22;
      if (!isLand(px, py, 0.09)) break;
      tctx.fillStyle = `rgba(203,187,146,${0.06 + pathRand() * 0.05})`;
      tctx.beginPath();
      tctx.ellipse(px, py, 14 + pathRand() * 11, 8 + pathRand() * 7, ang + wob, 0, TAU);
      tctx.fill();
    }
  }

  /* ---------- water sparkle points (animated at runtime) ---------- */
  const sparkles = [];
  for (let i = 0; i < 1100; i++) {
    const x = detail() * WORLD;
    const y = detail() * WORLD;
    const e = heightAt(x, y);
    if (e > 0.008 || e < -0.36) continue;
    sparkles.push({
      x,
      y,
      len: 2 + detail() * 8,
      phase: detail() * TAU,
      speed: 0.4 + detail() * 0.9,
      a: 0.04 + detail() * 0.1,
    });
  }

  /* ---------- objects ---------- */
  const objects = [];
  const fires = [];
  const placed = [];
  let nextId = 1;

  function addObject(kind, x, y, scale) {
    const meta = RESOURCE_META[kind];
    const obj = {
      id: nextId++,
      kind,
      x,
      y,
      scale,
      seed: (rand() * 1e9) | 0,
      ready: true,
      hits: meta.hits,
      maxHits: meta.hits,
      respawnAt: 0,
      growth: 1,
      sway: rand() * TAU,
    };
    objects.push(obj);
    placed.push({ x, y, r: meta.radius * scale });
    return obj;
  }

  function canPlace(x, y, minE, clearance) {
    if (!isLand(x, y, minE)) return false;
    for (const p of placed) {
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy < (p.r + clearance) * (p.r + clearance)) return false;
    }
    const dsx = x - center.x;
    const dsy = y - center.y;
    if (dsx * dsx + dsy * dsy < 135 * 135) return false;
    return true;
  }

  function findTutorialSpot(kind, angle, dist, minE) {
    const meta = RESOURCE_META[kind];
    for (let ring = 0; ring < 12; ring++) {
      const d = dist + ring * 26;
      for (let k = 0; k < 14; k++) {
        const a = angle + (k % 2 === 0 ? 1 : -1) * Math.ceil(k / 2) * 0.24;
        const x = center.x + Math.cos(a) * d;
        const y = center.y + Math.sin(a) * d;
        if (canPlace(x, y, minE, meta.radius + 10)) return { x, y };
      }
    }
    return null;
  }

  // a welcoming clearing: fire + one of each resource within easy reach
  let fireSpot = { x: center.x + 54, y: center.y + 38 };
  if (!isLand(fireSpot.x, fireSpot.y, 0.15)) fireSpot = { x: center.x + 40, y: center.y - 40 };
  fires.push({ id: 1, x: fireSpot.x, y: fireSpot.y, seed: (rand() * 1e9) | 0, builtAt: 0, starter: true });
  placed.push({ x: fireSpot.x, y: fireSpot.y, r: 26 });

  const tutorials = [
    ['tree', -0.6, 208, 0.15],
    ['bush', 2.45, 186, 0.13],
    ['rock', 1.35, 226, 0.09],
  ];
  for (const [kind, angle, dist, minE] of tutorials) {
    const spot = findTutorialSpot(kind, angle, dist, minE);
    if (spot) addObject(kind, spot.x, spot.y, 0.95 + rand() * 0.15);
  }

  function scatter(kind, target, candidates, minE, clearance, scoreFn) {
    const picks = [];
    for (let i = 0; i < candidates; i++) {
      const x = 90 + rand() * (WORLD - 180);
      const y = 90 + rand() * (WORLD - 180);
      if (!isLand(x, y, minE)) continue;
      const dsx = x - center.x;
      const dsy = y - center.y;
      if (dsx * dsx + dsy * dsy < 165 * 165) continue;
      picks.push({ x, y, score: scoreFn(x, y) });
    }
    picks.sort((a, b) => b.score - a.score);
    let added = 0;
    for (const p of picks) {
      if (added >= target) break;
      if (!canPlace(p.x, p.y, minE, clearance)) continue;
      addObject(kind, p.x, p.y, 0.82 + rand() * 0.42);
      added++;
    }
    return added;
  }

  scatter(
    'tree',
    66,
    480,
    0.16,
    58,
    (x, y) => noise.fbm(x / 640 + 3.1, y / 640 - 1.4, 3) * 1.1 + rand() * 0.45,
  );
  scatter(
    'rock',
    30,
    260,
    0.055,
    72,
    (x, y) => rand() * 0.8 + (1 - Math.abs(heightAt(x, y) - 0.22)) * 0.4,
  );
  scatter(
    'bush',
    38,
    300,
    0.105,
    46,
    (x, y) => moistureAt(x, y) * 0.9 + rand() * 0.5,
  );

  /* ---------- small, non-interactive scenery ---------- */
  const decor = [];
  function addDecor(type, x, y, scale) {
    decor.push({
      type,
      x,
      y,
      scale,
      seed: (rand() * 1e9) | 0,
      phase: rand() * TAU,
    });
  }

  for (let i = 0; i < 190; i++) {
    const x = 70 + rand() * (WORLD - 140);
    const y = 70 + rand() * (WORLD - 140);
    if (!isLand(x, y, 0.12)) continue;
    if (Math.hypot(x - center.x, y - center.y) < 55) continue;
    addDecor('fern', x, y, 0.7 + rand() * 0.7);
  }

  for (let i = 0; i < 110; i++) {
    const x = 70 + rand() * (WORLD - 140);
    const y = 70 + rand() * (WORLD - 140);
    const e = heightAt(x, y);
    if (e < -0.055 || e > 0.115) continue;
    addDecor('reed', x, y, 0.75 + rand() * 0.7);
  }

  for (const pond of ponds) {
    for (let i = 0; i < 15; i++) {
      const a = rand() * TAU;
      const r = rand() * pond.r * 0.72;
      const x = pond.x + Math.cos(a) * r;
      const y = pond.y + Math.sin(a) * r;
      if (heightAt(x, y) < -0.008) addDecor('lily', x, y, 0.65 + rand() * 0.75);
    }
  }

  for (let i = 0; i < 150; i++) {
    const x = 70 + rand() * (WORLD - 140);
    const y = 70 + rand() * (WORLD - 140);
    if (!isLand(x, y, 0.035)) continue;
    addDecor('pebble', x, y, 0.5 + rand() * 0.8);
  }

  for (let i = 0; i < 52; i++) {
    const x = 70 + rand() * (WORLD - 140);
    const y = 70 + rand() * (WORLD - 140);
    if (!isLand(x, y, 0.14)) continue;
    addDecor('mushroom', x, y, 0.6 + rand() * 0.6);
  }

  for (let i = 0; i < 18; i++) {
    const x = 120 + rand() * (WORLD - 240);
    const y = 120 + rand() * (WORLD - 240);
    if (!isLand(x, y, 0.11)) continue;
    addDecor('log', x, y, 0.8 + rand() * 0.6);
  }

  for (let i = 0; i < 18; i++) {
    const x = 100 + rand() * (WORLD - 200);
    const y = 100 + rand() * (WORLD - 200);
    const e = heightAt(x, y);
    if (e < 0.015 || e > 0.1) continue;
    addDecor('driftwood', x, y, 0.7 + rand() * 0.6);
  }

  for (let i = 0; i < 9; i++) {
    const x = 150 + rand() * (WORLD - 300);
    const y = 150 + rand() * (WORLD - 300);
    if (!isLand(x, y, 0.16)) continue;
    addDecor('stump', x, y, 0.7 + rand() * 0.5);
  }

  return {
    seed,
    terrain,
    height,
    moisture,
    heightAt,
    moistureAt,
    isLand,
    center,
    spawn: { x: center.x, y: center.y },
    pond: ponds[0],
    ponds,
    objects,
    fires,
    decor,
    sparkles,
    addFire(x, y) {
      const fire = {
        id: fires.length + 1,
        x,
        y,
        seed: (Math.random() * 1e9) | 0,
        builtAt: performance.now() / 1000,
      };
      fires.push(fire);
      return fire;
    },
    findFireSpot(px, py, dir) {
      for (let ring = 0; ring < 9; ring++) {
        const dist = 44 + ring * 12;
        for (let k = 0; k < 10; k++) {
          const a = dir + (k % 2 === 0 ? 1 : -1) * Math.ceil(k / 2) * 0.5;
          const x = clamp(px + Math.cos(a) * dist, 40, WORLD - 40);
          const y = clamp(py + Math.sin(a) * dist, 40, WORLD - 40);
          if (!isLand(x, y, 0.085)) continue;
          let ok = true;
          for (const o of objects) {
            const dx = o.x - x;
            const dy = o.y - y;
            if (dx * dx + dy * dy < 48 * 48) { ok = false; break; }
          }
          if (ok) {
            for (const f of fires) {
              const dx = f.x - x;
              const dy = f.y - y;
              if (dx * dx + dy * dy < 110 * 110) { ok = false; break; }
            }
          }
          if (ok) return { x, y };
        }
      }
      return null;
    },
  };
}
