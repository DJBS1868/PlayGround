// GREEN EMPIRE — 2.5D isometric canvas renderer.
import { PROPERTIES, PROPERTY_LIST, STRAIN_BY_ID, STAFF_BY_ID, gradeFor } from './data.js';

const TW = 104, TH = 52, WALL = 162;
// Length of one world unit along a wall, in screen pixels.
const WALL_UNIT = Math.hypot(TW / 2, TH / 2);
const U = u => u * WALL_UNIT;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const TAU = Math.PI * 2;

function seeded(n) {
  let s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function rgba(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = clamp(((n >> 16) & 255) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.zoom = 1; this.ox = 0; this.oy = 0;
    // Fit-to-room camera plus a player-controlled zoom/pan layer.
    this.baseZoom = 1;
    this.zoomFactor = 1;
    this.panX = 0; this.panY = 0;
    this.sceneCenterX = 0; this.sceneCenterY = 0;
    this.baseOx = 0; this.baseOy = 0;
    this.minZoomFactor = .8;
    this.maxZoomFactor = 3;
    this.time = 0;
    this.hotspots = [];
    this.hoverId = null;
    this.particles = [];
    this.shake = 0;
    this.flash = 0;
    this.city = [];
    this.ambient = { catX: 7.2, catY: 5.7, catTarget: 7.2, catTimer: 0 };
    // Visual crew jobs: walk to a pot, perform the role animation, then drift home.
    this.crewStates = new Map();
    this.crewPropId = null;
    this.hiddenPlants = new Set();
    this.trimGhosts = new Map();
    this.bindEvents();
    this.makeCity();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  bindEvents() {
    const g = this.game;
    g.on('sale', e => {
      const c = e.customer;
      if (c) this.burstCash(c.x, c.y - 1.2, '+' + e.payout);
      else this.burstCash(5, 4, '+' + e.payout);
      if (c) this.particles.push({ type: 'heart', wx: c.x, wy: c.y, z: 70, vx: .15, vy: -.15, vz: 20, life: 1.4, max: 1.4, color: '#ff8fa3' });
      const tito = this.crewStates.get('tito');
      if (tito) tito.serve = 1;
    });
    g.on('harvest', e => {
      if (e.propId !== g.state.activeProperty) return;
      const pos = this.slotPos(e.propId, e.index);
      if (!pos) return;
      const crewDriven = e.auto && g.state.staff.includes('bea');
      if (crewDriven) {
        // Keep the ripe plant visible until Bea reaches it and trims it.
        this.trimGhosts.set(this.slotKey(e.propId, e.index), { strain: e.strain, progress: 1, tendQ: 0 });
        if (!this.enqueueCrewJob('bea', e.propId, e.index, 'trim', { grams: e.grams, strain: e.strain })) {
          this.trimGhosts.delete(this.slotKey(e.propId, e.index));
          this.burstTrim(pos, e.strain, e.grams);
        }
      } else {
        this.burstTrim(pos, e.strain, e.grams);
      }
    });
    g.on('tend', e => {
      if (e.propId !== g.state.activeProperty) return;
      const pos = this.slotPos(e.propId, e.index);
      if (!pos) return;
      if (!(e.auto && g.state.staff.includes('mara') && this.enqueueCrewJob('mara', e.propId, e.index, 'water'))) {
        this.burstWater(pos);
      }
    });
    g.on('plant', e => {
      if (e.propId !== g.state.activeProperty) return;
      const pos = this.slotPos(e.propId, e.index);
      if (!pos) return;
      const crewDriven = e.auto && g.state.staff.includes('eli');
      if (crewDriven) {
        // Show an empty pot until Eli has walked over and planted the seed.
        this.hiddenPlants.add(this.slotKey(e.propId, e.index));
        if (!this.enqueueCrewJob('eli', e.propId, e.index, 'plant', { strain: e.strain })) {
          this.hiddenPlants.delete(this.slotKey(e.propId, e.index));
          this.burstPlant(pos);
        }
      } else {
        this.burstPlant(pos);
      }
    });
    g.on('refine', () => this.sparkleScreen());
    g.on('raid', () => { this.shake = 1; this.flash = 1; });
    g.on('betrayal', () => { this.shake = .8; this.flash = .8; });
    g.on('ready', e => {
      const pos = this.slotPos(e.propId, e.slot);
      if (pos) for (let i = 0; i < 4; i++) this.particles.push({ type: 'spark', wx: pos[0], wy: pos[1], z: 50, vx: (Math.random() - .5) * 20, vy: (Math.random() - .5) * 20, vz: 20, life: 1.2, max: 1.2, color: '#d9ff8a' });
    });
    g.on('frontBought', () => this.sparkleScreen());
    g.on('missionReward', () => this.sparkleScreen());
  }

  slotPos(propId, index) {
    const p = PROPERTIES[propId];
    return p?.slots[index] || null;
  }

  slotKey(propId, index) { return `${propId}:${index}`; }

  burstPlant(pos) {
    for (let i = 0; i < 7; i++) this.particles.push({ type: 'spark', wx: pos[0], wy: pos[1], z: 22, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, vz: 35, life: .8, max: .8, color: '#b8ff9a' });
  }

  burstWater(pos) {
    for (let i = 0; i < 5; i++) this.particles.push({ type: 'drop', wx: pos[0] + (Math.random() - .5) * .35, wy: pos[1] + (Math.random() - .5) * .35, z: 58, vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10, vz: -45, life: .8, max: .8, color: '#8fe7ff' });
  }

  burstTrim(pos, strain, grams = 0) {
    const color = STRAIN_BY_ID[strain]?.color || '#7bf58a';
    for (let i = 0; i < 7; i++) this.particles.push({ type: 'leaf', wx: pos[0], wy: pos[1], z: 36 + Math.random() * 18, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, vz: 20 + Math.random() * 35, life: 1.2, max: 1.2, color });
    if (grams) this.burstCash(pos[0], pos[1] - .4, `+${grams}g`);
  }

  makeCity() {
    const arr = [];
    for (let i = 0; i < 46; i++) {
      arr.push({
        x: seeded(i * 3.1), w: .02 + seeded(i * 7.7) * .045, h: .04 + seeded(i * 5.3) * .18,
        layer: seeded(i * 9.1) > .55 ? 1 : 0, lit: seeded(i * 1.3), antenna: seeded(i * 4.4) > .8
      });
    }
    this.city = arr;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    const p = this.game.propConfig;
    const roomW = (p.w + p.d) * TW / 2;
    const roomH = (p.w + p.d) * TH / 2 + WALL;
    const mobile = w < 720;
    const top = mobile ? 118 : 92;
    const bottom = mobile ? 148 : 126;
    const availH = Math.max(200, h - top - bottom);
    const z = Math.min((w - (mobile ? 20 : 60)) / roomW, availH / roomH, 1.28);
    this.baseZoom = Math.max(.3, z);
    const midX = (p.w - p.d) * TW / 4;
    this.sceneCenterX = w / 2;
    this.sceneCenterY = top + availH / 2 - (mobile ? 6 : 12);
    this.baseOx = w / 2 - midX * this.baseZoom;
    this.baseOy = top + (availH - roomH * this.baseZoom) / 2 + WALL * this.baseZoom - (mobile ? 6 : 12);
    this.applyCamera();
    this.palette = p.palette;
  }

  applyCamera() {
    this.zoomFactor = clamp(this.zoomFactor, this.minZoomFactor, this.maxZoomFactor);
    this.zoom = this.baseZoom * this.zoomFactor;
    this.clampPan();
    const f = this.zoomFactor;
    this.ox = this.sceneCenterX - (this.sceneCenterX - this.baseOx) * f + this.panX;
    this.oy = this.sceneCenterY - (this.sceneCenterY - this.baseOy) * f + this.panY;
  }

  clampPan() {
    if (this.zoomFactor <= 1.001) { this.panX = 0; this.panY = 0; return; }
    const p = this.game.propConfig;
    const roomW = (p.w + p.d) * TW / 2;
    const roomH = (p.w + p.d) * TH / 2 + WALL;
    const z = this.baseZoom * this.zoomFactor;
    const freeX = Math.max(0, (roomW * z - this.w) / 2) + this.w * .1;
    const freeY = Math.max(0, (roomH * z - this.h) / 2) + this.h * .08;
    this.panX = clamp(this.panX, -freeX, freeX);
    this.panY = clamp(this.panY, -freeY, freeY);
  }

  canPan() {
    return this.zoomFactor > 1.001;
  }

  zoomTo(factor, sx = this.w / 2, sy = this.sceneCenterY) {
    const target = clamp(factor, this.minZoomFactor, this.maxZoomFactor);
    if (Math.abs(target - this.zoomFactor) < .0005) return false;
    const oldZoom = this.zoom, oldOx = this.ox, oldOy = this.oy;
    const wx = (sx - oldOx) / oldZoom;
    const wy = (sy - oldOy) / oldZoom;
    this.zoomFactor = target;
    this.applyCamera();
    const f = this.zoomFactor;
    const baseX = this.sceneCenterX - (this.sceneCenterX - this.baseOx) * f;
    const baseY = this.sceneCenterY - (this.sceneCenterY - this.baseOy) * f;
    this.panX = sx - wx * this.zoom - baseX;
    this.panY = sy - wy * this.zoom - baseY;
    this.applyCamera();
    return true;
  }

  zoomBy(mult, sx, sy) {
    return this.zoomTo(this.zoomFactor * mult, sx, sy);
  }

  panBy(dx, dy) {
    if (!this.canPan()) return false;
    this.panX += dx;
    this.panY += dy;
    this.applyCamera();
    return true;
  }

  resetCamera() {
    this.zoomFactor = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyCamera();
  }

  worldTransform(extraShake = true) {
    const sx = extraShake ? (Math.random() - .5) * this.shake * 14 : 0;
    const sy = extraShake ? (Math.random() - .5) * this.shake * 14 : 0;
    this.ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, this.dpr * (this.ox + sx), this.dpr * (this.oy + sy));
  }
  screenTransform() { this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); }

  P(x, y, z = 0) { return [(x - y) * TW / 2, (x + y) * TH / 2 - z]; }
  toScreen(x, y, z = 0) {
    const [px, py] = this.P(x, y, z);
    return { x: this.ox + px * this.zoom, y: this.oy + py * this.zoom };
  }

  // ---------- main draw ----------
  draw(dt) {
    this.time += dt;
    const ctx = this.ctx;
    const p = this.game.propConfig;
    // recompute layout if active property dimensions changed
    if (!this.lastProp || this.lastProp !== p.id) {
      this.lastProp = p.id;
      this.zoomFactor = 1;
      this.panX = 0; this.panY = 0;
      this.resize();
    }
    this.hotspots = [];
    this.staffTags = [];
    this.updateCrew(dt, p);
    this.screenTransform();
    ctx.clearRect(0, 0, this.w, this.h);
    this.drawBackdrop();
    this.worldTransform();
    this.drawRoomBase(p);
    this.drawFloor(p);
    this.drawWalls(p);
    this.drawDecor(p);
    this.drawDecals(p);
    const draws = [];
    for (const prop of p.props) {
      if (['rug', 'oil', 'pizza'].includes(prop.type)) continue;
      if (prop.type === 'cat') continue;
      draws.push({ depth: prop.x + prop.y + .001, draw: () => this.drawProp(prop, p) });
    }
    // grow pots
    this.game.propState.slots.forEach((slot, i) => {
      const pos = p.slots[i];
      if (!pos) return;
      draws.push({ depth: pos[0] + pos[1] + .35, draw: () => this.drawSlot(pos[0], pos[1], slot, i, p) });
    });
    // counter
    const [cx, cy] = p.counter;
    draws.push({ depth: cx + cy + .2, draw: () => this.drawCounter(cx, cy, p) });
    // staff
    const staffSpots = this.staffSpots(p);
    for (const id of this.game.state.staff) {
      const st = STAFF_BY_ID[id];
      const spot = staffSpots[id];
      if (!st || !spot) continue;
      const crew = this.crewStates.get(id);
      const x = crew ? crew.x : spot[0], y = crew ? crew.y : spot[1];
      draws.push({ depth: x + y + .3, draw: () => this.drawStaff(id, x, y, st, crew) });
    }
    // customers
    for (const c of this.game.runtime.customers) {
      draws.push({ depth: c.x + c.y + .45, draw: () => this.drawCustomer(c) });
    }
    // ambient cat
    if (p.id === 'apartment') {
      const cat = this.updateCat(dt);
      draws.push({ depth: cat[0] + cat[1] + .4, draw: () => this.drawCat(cat[0], cat[1]) });
    }
    draws.sort((a, b) => a.depth - b.depth);
    for (const d of draws) d.draw();
    this.drawWorldParticles(dt);
    this.drawLighting(p);
    this.screenTransform();
    this.drawBubbles();
    this.drawHover();
    this.drawScreenFx(dt);
    this.shake = Math.max(0, this.shake - dt * 2.2);
    this.flash = Math.max(0, this.flash - dt * 1.4);
  }

  updateCat(dt) {
    const a = this.ambient;
    a.catTimer -= dt;
    if (a.catTimer <= 0) {
      a.catTarget = [1.2 + Math.random() * 6, 3.2 + Math.random() * 2.8];
      a.catTimer = 3 + Math.random() * 5;
    }
    const dx = a.catTarget[0] - a.catX, dy = a.catTarget[1] - a.catY;
    const d = Math.hypot(dx, dy);
    if (d > .08) { a.catX += dx / d * .45 * dt; a.catY += dy / d * .45 * dt; }
    return [a.catX, a.catY];
  }

  // ---------- backdrop ----------
  drawBackdrop() {
    const ctx = this.ctx, w = this.w, h = this.h;
    const hour = this.game.hour;
    const night = (hour < 6.4 || hour > 19.2) ? 1 : (hour < 8 ? (8 - hour) / 1.6 : hour > 17.5 ? (hour - 17.5) / 1.7 : 0);
    const nf = clamp(night, 0, 1);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (nf > .5) {
      g.addColorStop(0, '#080d13'); g.addColorStop(.55, '#0b1418'); g.addColorStop(1, '#121b1a');
    } else {
      g.addColorStop(0, '#0d1a1b'); g.addColorStop(.45, '#12251f'); g.addColorStop(1, '#1b241c');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // horizon glow
    const hg = ctx.createRadialGradient(w * .5, h * .55, 10, w * .5, h * .55, w * .72);
    hg.addColorStop(0, nf > .5 ? 'rgba(80,160,150,.09)' : 'rgba(230,190,110,.14)');
    hg.addColorStop(.5, 'rgba(70,120,90,.05)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, w, h);

    // stars
    if (nf > .25) {
      for (let i = 0; i < 70; i++) {
        const x = seeded(i * 2.7) * w, y = seeded(i * 8.3) * h * .52;
        const a = (0.25 + seeded(i * 4.1) * .6) * nf;
        ctx.fillStyle = `rgba(210,240,235,${a})`;
        const s = seeded(i * 5.9) > .85 ? 1.6 : .8;
        ctx.fillRect(x, y, s, s);
      }
      // moon
      const mx = w * .83, my = h * .16;
      const mg = ctx.createRadialGradient(mx, my, 2, mx, my, 52);
      mg.addColorStop(0, 'rgba(240,245,220,.95)'); mg.addColorStop(.35, 'rgba(220,235,210,.18)'); mg.addColorStop(1, 'rgba(200,230,220,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 52, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(238,244,216,.9)'; ctx.beginPath(); ctx.arc(mx, my, 13, 0, TAU); ctx.fill();
    }

    // city silhouette
    ctx.save();
    for (const layer of [0, 1]) {
      const base = h * (layer ? .60 : .56);
      for (const b of this.city) {
        if (b.layer !== layer) continue;
        const bh = b.h * h * (layer ? 1 : .8), bw = b.w * w;
        const x = b.x * w, y = base - bh;
        ctx.fillStyle = layer ? 'rgba(8,18,17,.45)' : 'rgba(7,14,14,.7)';
        ctx.fillRect(x, y, bw, bh);
        if (b.antenna) ctx.fillRect(x + bw / 2, y - 10, 1.5, 10);
        if (nf > .35 && layer === 1) {
          ctx.fillStyle = `rgba(255,205,110,${.08 + .1 * b.lit})`;
          for (let wy = y + 6; wy < base - 4; wy += 7) {
            for (let wx = x + 3; wx < x + bw - 3; wx += 6) {
              if (seeded(wx * .7 + wy * 1.3 + b.x) > .55) ctx.fillRect(wx, wy, 1.5, 2);
            }
          }
        }
      }
    }
    ctx.restore();

    // fog bands
    for (let i = 0; i < 3; i++) {
      const fy = h * (.52 + i * .05) + Math.sin(this.time * .06 + i) * 6;
      const fg = ctx.createLinearGradient(0, fy - 24, 0, fy + 34);
      fg.addColorStop(0, 'rgba(70,110,100,0)'); fg.addColorStop(.5, `rgba(80,130,115,${.045 - i * .01})`); fg.addColorStop(1, 'rgba(70,110,100,0)');
      ctx.fillStyle = fg; ctx.fillRect(0, fy - 24, w, 58);
    }

    // dust motes
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const x = (seeded(i * 3.7) * w + this.time * (3 + seeded(i) * 6)) % w;
      const y = (seeded(i * 8.1) * h + Math.sin(this.time * .3 + i) * 20) % h;
      ctx.fillStyle = `rgba(190,225,190,${.03 + seeded(i * 9.3) * .06})`;
      ctx.beginPath(); ctx.arc(x, y, .8 + seeded(i * 2.2) * 1.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // ---------- room shell ----------
  floorPoly(p, z = 0) {
    return [this.P(-.45, -.45, z), this.P(p.w + .45, -.45, z), this.P(p.w + .45, p.d + .45, z), this.P(-.45, p.d + .45, z)];
  }
  polyPath(points) {
    const ctx = this.ctx;
    ctx.beginPath();
    points.forEach((pt, i) => i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]));
    ctx.closePath();
  }
  fillPoly(points, fill, stroke = null, lw = 1) {
    const ctx = this.ctx;
    this.polyPath(points); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  drawRoomBase(p) {
    const ctx = this.ctx;
    const pal = p.palette;
    // soft ground shadow
    const [sx, sy] = this.P(p.w / 2, p.d / 2);
    ctx.save();
    const sg = ctx.createRadialGradient(sx, sy + 30, 20, sx, sy + 30, (p.w + p.d) * TW * .36);
    sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(.7, 'rgba(0,0,0,.22)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(sx, sy + 38, (p.w + p.d) * TW * .34, (p.w + p.d) * TH * .52, 0, 0, TAU); ctx.fill();
    ctx.restore();

    // extruded platform
    const depth = 22;
    const top = this.floorPoly(p, 0);
    const frontR = [this.P(p.w + .45, -.45, 0), this.P(p.w + .45, p.d + .45, 0)];
    const frontL = [this.P(-.45, p.d + .45, 0), this.P(-.45, -.45, 0)];
    // right side (between corner right and bottom)
    const rightSide = [this.P(p.w + .45, -.45, 0), this.P(p.w + .45, p.d + .45, 0), this.P(p.w + .45, p.d + .45, -depth), this.P(p.w + .45, -.45, -depth)];
    const leftSide = [this.P(p.w + .45, p.d + .45, 0), this.P(-.45, p.d + .45, 0), this.P(-.45, p.d + .45, -depth), this.P(p.w + .45, p.d + .45, -depth)];
    const backL = [this.P(-.45, p.d + .45, 0), this.P(-.45, -.45, 0), this.P(-.45, -.45, -depth), this.P(-.45, p.d + .45, -depth)];
    this.fillPoly(rightSide, 'rgba(5,9,8,.75)');
    this.fillPoly(leftSide, 'rgba(8,13,11,.85)');
    this.fillPoly(backL, 'rgba(5,8,7,.6)');
    // rim
    this.polyPath(top); ctx.strokeStyle = rgba(pal.accent, .28); ctx.lineWidth = 2; ctx.stroke();
    this.polyPath(top); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 5; ctx.stroke();
    // stairs / edge blocks maybe
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    this.fillPoly([this.P(p.w + .45, p.d * .45, 0), this.P(p.w + .45, p.d * .55, 0), this.P(p.w + .45, p.d * .55, -depth), this.P(p.w + .45, p.d * .45, -depth)], 'rgba(0,0,0,.25)');
  }

  drawFloor(p) {
    const ctx = this.ctx;
    const pal = p.palette;
    const floor = [this.P(0, 0), this.P(p.w, 0), this.P(p.w, p.d), this.P(0, p.d)];
    ctx.save();
    this.polyPath(floor); ctx.clip();
    ctx.fillStyle = pal.floorA; ctx.fillRect(-2000, -2000, 4000, 4000);
    for (let x = 0; x < p.w; x++) {
      for (let y = 0; y < p.d; y++) {
        const even = (x + y) % 2 === 0;
        let c = even ? pal.floorA : pal.floorB;
        const v = seeded(x * 13.7 + y * 4.3);
        if (p.id === 'apartment') c = shade(c, (v - .5) * 12);
        this.fillPoly([this.P(x, y), this.P(x + 1, y), this.P(x + 1, y + 1), this.P(x, y + 1)], c);
        // grout / plank seams
        ctx.strokeStyle = p.id === 'apartment' ? 'rgba(30,20,12,.16)' : 'rgba(0,0,0,.13)';
        ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(...this.P(x, y + .5)); ctx.lineTo(...this.P(x + 1, y + .5)); ctx.stroke();
        if (p.id === 'apartment') {
          ctx.beginPath(); ctx.moveTo(...this.P(x + .5, y)); ctx.lineTo(...this.P(x + .5, y + 1)); ctx.stroke();
        }
        if (p.id === 'lab' || p.id === 'empire') {
          ctx.strokeStyle = p.id === 'lab' ? 'rgba(120,220,255,.06)' : 'rgba(255,230,190,.055)';
          this.polyPath([this.P(x, y), this.P(x + 1, y), this.P(x + 1, y + 1), this.P(x, y + 1)]);
          ctx.stroke();
        }
      }
    }
    // stains and wear
    for (let i = 0; i < 14; i++) {
      const x = seeded(i * 3.3) * p.w, y = seeded(i * 6.1) * p.d;
      const r = 8 + seeded(i * 2.2) * 30;
      const [sx, sy] = this.P(x, y);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, p.id === 'garage' || p.id === 'warehouse' ? 'rgba(20,18,15,.15)' : 'rgba(0,0,0,.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * .5, 0, 0, TAU); ctx.fill();
    }
    if (p.id === 'empire') {
      ctx.strokeStyle = 'rgba(255,240,210,.07)'; ctx.lineWidth = .8;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const [x1, y1] = this.P(seeded(i) * p.w, 0);
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 + 80, y1 + 40, x1 + 140, y1 + 80, x1 + 240, y1 + 150);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawWalls(p) {
    const ctx = this.ctx;
    const pal = p.palette;
    const wallL = [this.P(0, 0, 0), this.P(0, p.d, 0), this.P(0, p.d, WALL), this.P(0, 0, WALL)];
    const wallR = [this.P(0, 0, 0), this.P(p.w, 0, 0), this.P(p.w, 0, WALL), this.P(0, 0, WALL)];
    // left wall
    const gL = ctx.createLinearGradient(0, -WALL, 0, p.d * TH / 2);
    gL.addColorStop(0, shade(pal.wallL, 16)); gL.addColorStop(.45, pal.wallL); gL.addColorStop(1, shade(pal.wallL, -10));
    this.fillPoly(wallL, gL);
    // right wall
    const gR = ctx.createLinearGradient(0, -WALL, 0, p.w * TH / 2);
    gR.addColorStop(0, shade(pal.wallR, 12)); gR.addColorStop(.5, pal.wallR); gR.addColorStop(1, shade(pal.wallR, -14));
    this.fillPoly(wallR, gR);
    // subtle pattern
    const pat = (wallH, count, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = 1; i < count; i++) {
        const t = i / count;
        ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = .7;
        ctx.beginPath();
        if (wallH === 'left') { ctx.moveTo(...this.P(0, t * p.d, 0)); ctx.lineTo(...this.P(0, t * p.d, WALL)); }
        else { ctx.moveTo(...this.P(t * p.w, 0, 0)); ctx.lineTo(...this.P(t * p.w, 0, WALL)); }
        ctx.stroke();
      }
      ctx.restore();
    };
    if (p.id === 'apartment') { pat('left', 9, .5); pat('right', 12, .5); }
    if (p.id === 'garage' || p.id === 'warehouse') {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = .7;
      for (let z = 12; z < WALL; z += 18) {
        ctx.beginPath(); ctx.moveTo(...this.P(0, 0, z)); ctx.lineTo(...this.P(0, p.d, z)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...this.P(0, 0, z)); ctx.lineTo(...this.P(p.w, 0, z)); ctx.stroke();
      }
      ctx.restore();
    }
    // skirting
    this.drawWallTexture(p);
    ctx.strokeStyle = rgba(pal.trim, .75); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(...this.P(0, p.d, 0)); ctx.lineTo(...this.P(0, 0, 0)); ctx.lineTo(...this.P(p.w, 0, 0)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(...this.P(0, p.d, 5)); ctx.lineTo(...this.P(0, 0, 5)); ctx.lineTo(...this.P(p.w, 0, 5)); ctx.stroke();
    // top cap
    ctx.strokeStyle = rgba(pal.trim, .28); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(...this.P(0, p.d, WALL)); ctx.lineTo(...this.P(0, 0, WALL)); ctx.lineTo(...this.P(p.w, 0, WALL)); ctx.stroke();
    // corner shadow
    const cg = ctx.createLinearGradient(...this.P(0, 0, WALL), ...this.P(1.2, 1.2, 0));
    cg.addColorStop(0, 'rgba(0,0,0,.3)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    this.fillPoly([this.P(0, 0, WALL), this.P(0, 0, 0), this.P(1.2, 1.2, 0), this.P(1.2, 1.2, WALL)], cg);
  }

  drawWallTexture(p) {
    const surface = (c, wall) => {
      const len = wall === 'back' ? p.w : p.d;
      const W = U(len), H = WALL;
      c.save();
      // A soft light wash makes the flat wall surfaces read as painted material.
      const wash = c.createLinearGradient(0, -H, 0, 0);
      wash.addColorStop(0, 'rgba(255,232,188,.055)');
      wash.addColorStop(.55, 'rgba(255,244,220,.012)');
      wash.addColorStop(1, 'rgba(0,0,0,.035)');
      c.fillStyle = wash; c.fillRect(0, -H, W, H);
      // Fine grain everywhere.
      for (let i = 0; i < 46; i++) {
        const gx = seeded(i * 3.1 + len * 2.7) * W;
        const gy = -seeded(i * 5.7 + len) * H;
        c.fillStyle = `rgba(255,255,255,${.008 + seeded(i * 2.3) * .014})`;
        c.fillRect(gx, gy, 1 + seeded(i * 4.4) * 2, .6);
      }

      if (p.id === 'apartment') {
        // Striped wallpaper with a picture rail and lower wainscot.
        for (let x = 8; x < W; x += 14) {
          c.strokeStyle = 'rgba(255,255,255,.026)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, -H); c.lineTo(x, 0); c.stroke();
          c.strokeStyle = 'rgba(0,0,0,.045)'; c.lineWidth = .7;
          c.beginPath(); c.moveTo(x + 1.6, -H); c.lineTo(x + 1.6, 0); c.stroke();
        }
        c.fillStyle = 'rgba(255,238,202,.045)'; c.fillRect(0, -32, W, 32);
        c.strokeStyle = 'rgba(255,239,205,.17)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, -32); c.lineTo(W, -32); c.stroke();
        c.beginPath(); c.moveTo(0, -131); c.lineTo(W, -131); c.stroke();
        for (let x = 30; x < W; x += 52) {
          c.strokeStyle = 'rgba(16,14,10,.11)'; c.lineWidth = .8;
          c.strokeRect(x, -29, 44, 25);
        }
      } else if (p.id === 'garage') {
        // Painted cinder block with staggered joints.
        for (let y = 0; y < H; y += 17) {
          const row = Math.floor(y / 17);
          c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = .8;
          c.beginPath(); c.moveTo(0, -y); c.lineTo(W, -y); c.stroke();
          c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = .7;
          c.beginPath(); c.moveTo(0, -y + 1); c.lineTo(W, -y + 1); c.stroke();
          for (let x = (row % 2) * 22; x < W; x += 44) {
            c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = .7;
            c.beginPath(); c.moveTo(x, -y); c.lineTo(x, -y - 16); c.stroke();
            c.strokeStyle = 'rgba(255,255,255,.025)'; c.lineWidth = .5;
            c.beginPath(); c.moveTo(x + 1, -y); c.lineTo(x + 1, -y - 16); c.stroke();
          }
        }
        for (let i = 0; i < 9; i++) {
          const sx = seeded(i * 4.1 + len) * W, sy = -seeded(i * 6.7) * H;
          c.strokeStyle = `rgba(20,19,16,${.05 + seeded(i) * .05})`; c.lineWidth = .6;
          c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 12 + seeded(i * 3.3) * 28, sy + 3 + seeded(i * 2.1) * 8); c.stroke();
        }
      } else if (p.id === 'lab') {
        // Sealed concrete panels, cable seams and cold cyan kick-light.
        for (let x = 0; x < W; x += 56) {
          c.strokeStyle = 'rgba(120,220,240,.055)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, -H); c.lineTo(x, 0); c.stroke();
          c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x + 1.2, -H); c.lineTo(x + 1.2, 0); c.stroke();
        }
        for (let y = 0; y < H; y += 44) {
          c.strokeStyle = 'rgba(0,0,0,.13)'; c.lineWidth = .9;
          c.beginPath(); c.moveTo(0, -y); c.lineTo(W, -y); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = .5;
          c.beginPath(); c.moveTo(0, -y + 1); c.lineTo(W, -y + 1); c.stroke();
        }
        for (let i = 0; i < 20; i++) {
          const x = seeded(i * 3.3) * W, y = -seeded(i * 5.9) * H;
          c.fillStyle = 'rgba(180,200,205,.16)'; c.beginPath(); c.arc(x, y, .9, 0, TAU); c.fill();
        }
        c.fillStyle = 'rgba(111,231,255,.035)'; c.fillRect(0, -12, W, 12);
        c.strokeStyle = 'rgba(111,231,255,.13)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, -12); c.lineTo(W, -12); c.stroke();
      } else if (p.id === 'warehouse') {
        // Corrugated steel: alternating ridge highlights and dark valleys.
        for (let x = 0; x < W; x += 13) {
          c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(x, -H); c.lineTo(x, 0); c.stroke();
          c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x + 4.5, -H); c.lineTo(x + 4.5, 0); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,.018)'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x + 2, -H); c.lineTo(x + 2, 0); c.stroke();
        }
        for (const z of [34, 104]) {
          c.fillStyle = 'rgba(10,12,11,.2)'; c.fillRect(0, -z - 3, W, 6);
          c.fillStyle = 'rgba(255,255,255,.045)'; c.fillRect(0, -z - 3, W, .9);
          c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(0, -z + 2, W, 1);
        }
        for (let i = 0; i < 18; i++) {
          const x = seeded(i * 2.1) * W, top = -H + 8 + seeded(i * 5.3) * 40;
          c.fillStyle = `rgba(127,77,39,${.035 + seeded(i * 3.7) * .05})`;
          c.fillRect(x, top, 1 + seeded(i * 4.1) * 2, 12 + seeded(i * 6.7) * 26);
        }
      } else if (p.id === 'empire') {
        // Fluted marble panels with warm gold inlays.
        for (let x = 0; x < W; x += 30) {
          c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, -H); c.lineTo(x, 0); c.stroke();
          c.strokeStyle = 'rgba(0,0,0,.09)'; c.lineWidth = 1.4;
          c.beginPath(); c.moveTo(x + 1.5, -H); c.lineTo(x + 1.5, 0); c.stroke();
        }
        for (let i = 0; i < 11; i++) {
          const x0 = seeded(i * 4.7) * W, y0 = -seeded(i * 7.1) * H;
          c.strokeStyle = `rgba(255,245,222,${.035 + seeded(i * 2.9) * .04})`; c.lineWidth = .8;
          c.beginPath(); c.moveTo(x0, y0);
          c.bezierCurveTo(x0 + 14, y0 - 22, x0 + 32, y0 + 17, x0 + 62, y0 - 8);
          c.stroke();
        }
        for (const z of [36, 138]) {
          c.fillStyle = 'rgba(180,154,101,.35)'; c.fillRect(0, -z, W, 1.2);
          c.fillStyle = 'rgba(255,236,183,.18)'; c.fillRect(0, -z + .4, W, .5);
          c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(0, -z + 1.2, W, .8);
        }
      }
      c.restore();
    };
    this.withWall('left', surface);
    this.withWall('back', surface);
  }

  withWall(wall, fn) {
    const ctx = this.ctx;
    ctx.save();
    // Local wall space is measured in screen pixels: x runs along the wall
    // (positive toward the far corner), y = -z runs up the wall. Keeping both
    // axes at pixel scale means fonts, line widths and small details are not
    // stretched by the isometric projection.
    const dx = TW / 2 / WALL_UNIT, dy = TH / 2 / WALL_UNIT;
    if (wall === 'back') ctx.transform(dx, dy, 0, 1, 0, 0);
    else ctx.transform(-dx, dy, 0, 1, 0, 0);
    fn(ctx, wall);
    ctx.restore();
  }

  wallRect(ctx, u1, u2, z1, z2) { ctx.beginPath(); ctx.rect(U(u1), -z2, U(u2 - u1), z2 - z1); }

  wallText(ctx, wall, u, z, text, font, color, align = 'left') {
    ctx.save();
    ctx.translate(U(u), -z);
    if (wall === 'left') ctx.scale(-1, 1);
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // ---------- wall decor ----------
  // Decor helpers work in wall-local pixels, the same space used by withWall().
  // Keeping every detail in this space means bevels, glows and tiny labels stay
  // crisp instead of being stretched by the isometric projection.
  wallGlow(c, u, z, radius, color, alpha = .2) {
    if (!color) return;
    const x = U(u), y = -z;
    const g = c.createRadialGradient(x, y, 1, x, y, radius);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(.45, rgba(color, alpha * .34));
    g.addColorStop(1, rgba(color, 0));
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = g;
    c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    c.restore();
  }

  wallShadow(c, x, y, w, h, spread = 5, alpha = .34) {
    c.save();
    c.fillStyle = `rgba(0,0,0,${alpha})`;
    c.beginPath(); c.roundRect(x + spread, y + spread + 2, w, h, Math.min(9, spread + 2)); c.fill();
    c.restore();
  }

  screwHead(c, x, y, r = 1.35) {
    const g = c.createRadialGradient(x - r * .3, y - r * .3, .2, x, y, r);
    g.addColorStop(0, 'rgba(245,242,225,.9)');
    g.addColorStop(.45, 'rgba(155,154,143,.9)');
    g.addColorStop(1, 'rgba(42,44,41,.9)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(15,18,16,.7)'; c.lineWidth = .45;
    c.beginPath(); c.moveTo(x - r * .55, y); c.lineTo(x + r * .55, y); c.stroke();
  }

  drawWindowDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco;
    const w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const night = this.game.hour < 6.6 || this.game.hour > 19;
    const midU = (u1 + u2) / 2, midZ = (z1 + z2) / 2;
    this.wallGlow(c, midU, midZ, Math.max(w, h) * .78, night ? '#ffd28c' : '#b9e7d7', night ? .24 : .2);
    this.wallShadow(c, x - 2, y - 2, w + 4, h + 4, 5, .42);

    // outer casing
    const fg = c.createLinearGradient(x - 5, y, x + w + 5, y + h);
    fg.addColorStop(0, shade(pal.trim, 24));
    fg.addColorStop(.35, shade(pal.trim, 7));
    fg.addColorStop(.7, shade(pal.trim, -10));
    fg.addColorStop(1, shade(pal.trim, -28));
    c.fillStyle = fg; c.fillRect(x - 6, y - 6, w + 12, h + 12);
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = .8;
    c.strokeRect(x - 5.2, y - 5.2, w + 10.4, h + 10.4);

    // glass + view
    const gx = x + 3, gy = y + 3, gw = w - 6, gh = h - 6;
    c.save();
    c.beginPath(); c.roundRect(gx, gy, gw, gh, 1.5); c.clip();
    const sky = c.createLinearGradient(0, gy, 0, gy + gh);
    if (night) {
      sky.addColorStop(0, '#071421'); sky.addColorStop(.48, '#102a3a'); sky.addColorStop(.78, '#244249'); sky.addColorStop(1, '#3f5550');
    } else {
      sky.addColorStop(0, '#89c4bd'); sky.addColorStop(.45, '#b9d8c1'); sky.addColorStop(.75, '#e5d6a6'); sky.addColorStop(1, '#c5ae7d');
    }
    c.fillStyle = sky; c.fillRect(gx, gy, gw, gh);

    // street haze and distant blocks
    const haze = c.createLinearGradient(0, gy + gh * .52, 0, gy + gh);
    haze.addColorStop(0, night ? 'rgba(80,130,155,0)' : 'rgba(255,238,190,0)');
    haze.addColorStop(1, night ? 'rgba(45,80,90,.42)' : 'rgba(225,192,130,.5)');
    c.fillStyle = haze; c.fillRect(gx, gy, gw, gh);

    if (night) {
      for (let i = 0; i < 16; i++) {
        const sx = gx + seeded(i * 3.3 + u1 * 5.7) * gw;
        const sy = gy + seeded(i * 6.1 + z1) * gh * .38;
        c.fillStyle = `rgba(215,238,235,${.18 + seeded(i * 2.9) * .45})`;
        c.fillRect(sx, sy, seeded(i * 4.2) > .83 ? 1.5 : .8, seeded(i * 4.2) > .83 ? 1.5 : .8);
      }
    }

    const baseY = gy + gh * (night ? .74 : .8);
    for (let i = 0; i < 13; i++) {
      const bw = 5 + seeded(i * 5.1 + u1) * 13;
      const bh = 9 + seeded(i * 8.7 + z1) * gh * .34;
      const bx = gx - 2 + i * (gw + 4) / 13;
      c.fillStyle = night ? `rgba(7,17,24,${.72 + seeded(i) * .2})` : `rgba(50,79,71,${.28 + seeded(i) * .2})`;
      c.fillRect(bx, baseY - bh, bw, bh + gh);
      if (night) {
        for (let wy = baseY - bh + 3; wy < baseY - 3; wy += 5) {
          for (let wx = bx + 1.5; wx < bx + bw - 1; wx += 4) {
            if (seeded(wx * .9 + wy * 1.7) > .62) {
              c.fillStyle = `rgba(255,199,105,${.35 + seeded(wx + wy) * .45})`;
              c.fillRect(wx, wy, 1.1, 1.7);
            }
          }
        }
      }
    }
    // moon/sun
    const orbX = gx + gw * .76, orbY = gy + gh * .2;
    const orb = c.createRadialGradient(orbX, orbY, 1, orbX, orbY, 16);
    if (night) {
      orb.addColorStop(0, 'rgba(245,244,215,.98)'); orb.addColorStop(.25, 'rgba(235,240,215,.36)'); orb.addColorStop(1, 'rgba(210,235,225,0)');
    } else {
      orb.addColorStop(0, 'rgba(255,247,207,.95)'); orb.addColorStop(.3, 'rgba(255,224,150,.34)'); orb.addColorStop(1, 'rgba(255,210,120,0)');
    }
    c.fillStyle = orb; c.beginPath(); c.arc(orbX, orbY, 16, 0, TAU); c.fill();
    c.fillStyle = night ? 'rgba(243,244,220,.92)' : 'rgba(255,250,225,.96)';
    c.beginPath(); c.arc(orbX, orbY, night ? 5.4 : 4.5, 0, TAU); c.fill();

    // glass reflection
    const refl = c.createLinearGradient(gx, gy, gx + gw * .75, gy + gh);
    refl.addColorStop(0, 'rgba(255,255,255,.18)'); refl.addColorStop(.28, 'rgba(255,255,255,.03)'); refl.addColorStop(.29, 'rgba(255,255,255,0)'); refl.addColorStop(.62, 'rgba(255,255,255,.08)'); refl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = refl; c.fillRect(gx, gy, gw, gh);
    c.restore();

    // mullions
    c.strokeStyle = shade(pal.trim, -22); c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(x + w * .53, y); c.lineTo(x + w * .53, y + h); c.stroke();
    c.beginPath(); c.moveTo(x, y + h * .47); c.lineTo(x + w, y + h * .47); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = .8;
    c.beginPath(); c.moveTo(x + w * .53 - 1, y); c.lineTo(x + w * .53 - 1, y + h); c.stroke();
    c.beginPath(); c.moveTo(x, y + h * .47 - 1); c.lineTo(x + w, y + h * .47 - 1); c.stroke();

    // inner reveal
    c.strokeStyle = 'rgba(18,20,17,.72)'; c.lineWidth = 1.2;
    c.strokeRect(x + .6, y + .6, w - 1.2, h - 1.2);
    c.strokeStyle = 'rgba(255,255,255,.11)'; c.lineWidth = .7;
    c.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // sill
    const sill = c.createLinearGradient(0, y + h - 2, 0, y + h + 7);
    sill.addColorStop(0, shade(pal.trim, 20)); sill.addColorStop(.45, shade(pal.trim, -4)); sill.addColorStop(1, shade(pal.trim, -32));
    c.fillStyle = sill; c.fillRect(x - 9, y + h, w + 18, 6);
    c.fillStyle = 'rgba(0,0,0,.24)'; c.fillRect(x - 7, y + h + 6, w + 14, 3);
    c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x - 7, y + h + .6, w + 14, .8);

    // a little life on the sill
    const px = x + w * .8, py = y + h;
    c.fillStyle = 'rgba(42,33,25,.8)'; c.beginPath(); c.ellipse(px, py + 1.5, 7, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = '#9a5e3b'; c.beginPath(); c.moveTo(px - 5, py - 7); c.lineTo(px + 5, py - 7); c.lineTo(px + 3.8, py); c.lineTo(px - 3.8, py); c.closePath(); c.fill();
    c.strokeStyle = '#4f8a58'; c.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i - 1.5) * .44;
      c.beginPath(); c.moveTo(px, py - 7); c.quadraticCurveTo(px + Math.cos(a) * 5, py - 13, px + Math.cos(a) * 10, py - 15 - (i % 2) * 3); c.stroke();
      c.fillStyle = i % 2 ? '#5fa368' : '#477f52'; c.beginPath(); c.ellipse(px + Math.cos(a) * 10, py - 15 - (i % 2) * 3, 3.6, 2, a, 0, TAU); c.fill();
    }

    // curtains
    if (deco.curtain) {
      const cc = deco.curtain;
      c.strokeStyle = shade(cc, -32); c.lineWidth = 2.2;
      c.beginPath(); c.moveTo(x - 12, y - 7); c.lineTo(x + w + 12, y - 7); c.stroke();
      for (const fx of [x - 14, x + w + 14]) {
        c.fillStyle = shade(cc, 18); c.beginPath(); c.arc(fx, y - 7, 2.6, 0, TAU); c.fill();
      }
      for (const side of [0, 1]) {
        const cw = Math.min(w * .21, 24);
        const cx0 = side ? x + w - cw + 4 : x - cw - 4;
        const cg = c.createLinearGradient(cx0, 0, cx0 + cw, 0);
        cg.addColorStop(0, shade(cc, -28)); cg.addColorStop(.32, shade(cc, 14)); cg.addColorStop(.56, shade(cc, -10)); cg.addColorStop(.82, shade(cc, 5)); cg.addColorStop(1, shade(cc, -34));
        c.fillStyle = cg;
        c.beginPath();
        c.moveTo(cx0, y - 7);
        c.quadraticCurveTo(cx0 + cw * .6, y + h * .2, cx0 + cw * .72, y + h);
        c.lineTo(cx0 + cw * .28, y + h);
        c.quadraticCurveTo(cx0 + cw * .4, y + h * .4, cx0, y - 7);
        c.fill();
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = .7;
        c.beginPath(); c.moveTo(cx0 + cw * .56, y - 5); c.quadraticCurveTo(cx0 + cw * .74, y + h * .5, cx0 + cw * .64, y + h - 2); c.stroke();
      }
    }
    // frame corner screws
    for (const [sx, sy] of [[x - 3, y - 3], [x + w + 3, y - 3], [x - 3, y + h + 3], [x + w + 3, y + h + 3]]) this.screwHead(c, sx, sy, 1.3);
  }

  drawPosterDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 3.5, .38);
    const pg = c.createLinearGradient(x, y, x + w, y + h);
    pg.addColorStop(0, '#253c2c'); pg.addColorStop(.55, '#18281f'); pg.addColorStop(1, '#111b16');
    c.fillStyle = pg; c.fillRect(x, y, w, h);
    c.strokeStyle = rgba(deco.color || pal.accent, .72); c.lineWidth = 1;
    c.strokeRect(x + .7, y + .7, w - 1.4, h - 1.4);
    // paper fibre + a fold
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let i = 0; i < 28; i++) {
      c.fillStyle = `rgba(255,255,255,${.012 + seeded(i + u1) * .02})`;
      c.fillRect(x + seeded(i * 2.7) * w, y + seeded(i * 5.1) * h, 1 + seeded(i * 3.3) * 2, .5);
    }
    const gloss = c.createLinearGradient(x, y, x + w * .9, y + h);
    gloss.addColorStop(0, 'rgba(255,255,255,.10)'); gloss.addColorStop(.38, 'rgba(255,255,255,.015)'); gloss.addColorStop(.4, 'rgba(0,0,0,0)');
    c.fillStyle = gloss; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = .8;
    c.beginPath(); c.moveTo(x + w * .7, y); c.lineTo(x + w * .66, y + h); c.stroke();
    c.restore();
    // leaf emblem
    const lx = x + w * .76, ly = y + h * .72;
    c.strokeStyle = rgba(deco.color || pal.accent, .76); c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(lx - 12, ly + 16); c.quadraticCurveTo(lx + 2, ly - 6, lx + 15, ly - 15); c.stroke();
    for (let i = 0; i < 5; i++) {
      const t = i / 5, px = lx - 11 + t * 26, py = ly + 15 - t * 30;
      c.fillStyle = rgba(deco.color || pal.accent, .32 - i * .03);
      c.beginPath(); c.ellipse(px - 4, py - 2, 6.3 - t * 2, 2.6, -.65, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(px + 5, py + 1, 5.6 - t * 2, 2.4, .55, 0, TAU); c.fill();
    }
    const tx = wall === 'left' ? u2 - .42 : u1 + .42;
    this.wallText(c, wall, tx, z2 - 16, deco.title || '', '900 15px "Arial Black", Impact, sans-serif', deco.color || pal.accent);
    this.wallText(c, wall, tx, z2 - 27.5, deco.sub || '', '800 6.5px system-ui', 'rgba(241,246,225,.66)');
    this.wallText(c, wall, tx, z1 + 9, 'ASHGROVE · EST. 2031', '700 4.6px system-ui', 'rgba(214,232,201,.32)');
    // tape
    c.fillStyle = 'rgba(226,214,164,.45)';
    c.save(); c.translate(x + 5, y + 4); c.rotate(-.32); c.fillRect(-4, -2.5, 9, 5); c.restore();
    c.save(); c.translate(x + w - 5, y + h - 4); c.rotate(.33); c.fillRect(-4, -2.5, 9, 5); c.restore();
  }

  drawShelfDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), x = U(u1);
    this.wallShadow(c, x, -z2 - 1, w, z2 - z1 + 4, 2.5, .26);
    const boards = [z2, z1];
    for (let bi = 0; bi < boards.length; bi++) {
      const z = boards[bi];
      const bg = c.createLinearGradient(0, -z, 0, -z + 4);
      bg.addColorStop(0, shade(pal.trim, 22)); bg.addColorStop(.35, shade(pal.trim, 3)); bg.addColorStop(1, shade(pal.trim, -34));
      c.fillStyle = bg; c.fillRect(x, -z, w, 4);
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x, -z + 4, w, 1.6);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x, -z + .3, w, .7);
      // brackets
      for (const bx of [x + 4, x + w - 8]) {
        c.fillStyle = shade(pal.trim, -21);
        c.beginPath(); c.moveTo(bx, -z + 4); c.lineTo(bx + 3, -z + 4); c.lineTo(bx + 3, -z + 11); c.closePath(); c.fill();
      }
      // items above the board
      const n = bi === 0 ? 7 : 6;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const bw = 2.7 + seeded(i + bi * 8 + u1) * 3.4;
        const bh = 7 + seeded(i * 3.7 + bi) * 6;
        const bx = x + 4 + t * (w - 12) + (seeded(i * 5.3) - .5) * 3;
        const lean = (seeded(i * 7.1 + bi) - .5) * .18;
        c.save(); c.translate(bx, -z); c.rotate(lean);
        const cols = ['#b98b56', '#7fa16d', '#b06a60', '#5f8fa3', '#c4ab65', '#977a55'];
        const col = cols[(i + bi + Math.floor(seeded(i) * 5)) % cols.length];
        c.fillStyle = col; c.fillRect(0, -bh, bw, bh);
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(.5, -bh + 1, .7, bh - 2);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(bw - .7, -bh, .7, bh);
        c.strokeStyle = 'rgba(240,225,190,.34)'; c.lineWidth = .5; c.strokeRect(.6, -bh + .6, bw - 1.2, 2.8);
        c.restore();
      }
      // a jar with a leafy cutting
      if (bi === 1) {
        const jx = x + w - 14, jy = -z;
        c.fillStyle = 'rgba(175,213,194,.42)'; c.fillRect(jx, jy - 8, 6, 8);
        c.fillStyle = '#5a9c61'; c.beginPath(); c.ellipse(jx + 3, jy - 11, 4, 2.3, -.45, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(jx + 5, jy - 13.5, 3.4, 2, .4, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(226,255,230,.5)'; c.lineWidth = .6; c.strokeRect(jx, jy - 8, 6, 8);
      }
    }
    // trailing plant over the top board
    const px = x + w * .56;
    c.strokeStyle = '#4c7d50'; c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(px + i * 2, -z2); c.bezierCurveTo(px + i * 2 + 5, -z2 - 9, px + i * 2 + (i - 1) * 8, -z2 - 18, px + i * 2 + (i - 2) * 11, -z2 - 25); c.stroke();
      c.fillStyle = i % 2 ? '#568f5a' : '#406f48'; c.beginPath(); c.ellipse(px + i * 2 + (i - 2) * 11, -z2 - 25, 4.6, 2.4, -.5 + i * .3, 0, TAU); c.fill();
    }
  }

  drawStringLights(c, deco) {
    const Y = u => -deco.z + Math.sin(((u - deco.u1) / (deco.u2 - deco.u1)) * Math.PI) * 8;
    const c0 = U(deco.u1), c1 = U(deco.u2), bulbs = Math.max(6, Math.round((c1 - c0) / 24));
    c.strokeStyle = 'rgba(20,22,19,.82)'; c.lineWidth = .75;
    c.beginPath();
    for (let i = 0; i <= 30; i++) {
      const t = i / 30, u = deco.u1 + t * (deco.u2 - deco.u1);
      const px = U(u), py = Y(u);
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.stroke();
    const palette = ['#ffd58a', '#ffb66f', '#fff0b8', '#ffd58a', '#ffc47d'];
    for (let i = 0; i <= bulbs; i++) {
      const t = i / bulbs, u = deco.u1 + t * (deco.u2 - deco.u1);
      const px = U(u), py = Y(u) + 2.5;
      const col = palette[i % palette.length];
      const pulse = .88 + Math.sin(this.time * 1.8 + i * 1.7) * .1;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(px, py + 1, 1, px, py + 1, 11);
      g.addColorStop(0, rgba(col, .4 * pulse)); g.addColorStop(.45, rgba(col, .13)); g.addColorStop(1, rgba(col, 0));
      c.fillStyle = g; c.beginPath(); c.arc(px, py + 1, 11, 0, TAU); c.fill();
      c.restore();
      c.fillStyle = 'rgba(30,31,27,.9)'; c.fillRect(px - 1.4, py - 3.4, 2.8, 2.4);
      c.fillStyle = col; c.beginPath(); c.moveTo(px - 2.2, py - 1); c.lineTo(px + 2.2, py - 1); c.lineTo(px + 1.55, py + 4.4); c.lineTo(px - 1.55, py + 4.4); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(px - 1.1, py - .4, .8, 2.2);
      c.strokeStyle = 'rgba(40,32,20,.5)'; c.lineWidth = .45; c.beginPath(); c.moveTo(px - 1.7, py + 1.2); c.lineTo(px + 1.7, py + 1.2); c.stroke();
    }
    // clips
    for (const u of [deco.u1, deco.u2]) {
      c.fillStyle = 'rgba(58,56,48,.9)'; c.fillRect(U(u) - 1, -deco.z - 2, 2, 3);
    }
  }

  drawGarageDoor(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x - 3, y - 3, w + 6, h + 6, 5, .4);
    // tracks + header
    const metal = c.createLinearGradient(x, 0, x + w, 0);
    metal.addColorStop(0, '#252b2d'); metal.addColorStop(.3, '#444c4e'); metal.addColorStop(.7, '#353c3e'); metal.addColorStop(1, '#1e2325');
    c.fillStyle = metal; c.fillRect(x - 7, y - 6, w + 14, 8);
    c.fillStyle = '#202628'; c.fillRect(x - 7, y, 5, h + 5); c.fillRect(x + w + 2, y, 5, h + 5);
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 6, y - 5.5, w + 12, .8);
    // slats
    const rows = 9;
    for (let i = 0; i < rows; i++) {
      const ry = y + 3 + i * (h - 6) / rows, rh = (h - 6) / rows;
      const sg = c.createLinearGradient(0, ry, 0, ry + rh);
      sg.addColorStop(0, i % 2 ? '#363d40' : '#3d4548');
      sg.addColorStop(.16, i % 2 ? '#4e575a' : '#545e61');
      sg.addColorStop(.55, i % 2 ? '#30373a' : '#384043');
      sg.addColorStop(1, '#1c2224');
      c.fillStyle = sg; c.fillRect(x, ry, w, rh - .6);
      c.fillStyle = 'rgba(255,255,255,.11)'; c.fillRect(x, ry + .8, w, .7);
      c.fillStyle = 'rgba(0,0,0,.36)'; c.fillRect(x, ry + rh - 1.4, w, 1.1);
      // embossed panel lines
      c.strokeStyle = 'rgba(255,255,255,.045)'; c.lineWidth = .7;
      for (let k = 1; k < 5; k++) { const px = x + k * w / 5; c.beginPath(); c.moveTo(px, ry + 1); c.lineTo(px, ry + rh - 1.5); c.stroke(); }
    }
    // window row
    const wy = y + h * .31, wh = 12;
    for (let i = 0; i < 4; i++) {
      const ww = w * .14, wx = x + w * .12 + i * w * .2;
      c.fillStyle = '#111819'; c.fillRect(wx - 1.5, wy - 1.5, ww + 3, wh + 3);
      const wg = c.createLinearGradient(0, wy, 0, wy + wh);
      wg.addColorStop(0, '#7d9b9b'); wg.addColorStop(.5, '#3c565b'); wg.addColorStop(1, '#1c3036');
      c.fillStyle = wg; c.fillRect(wx, wy, ww, wh);
      c.fillStyle = 'rgba(255,231,168,.22)'; c.fillRect(wx + 1, wy + 1, ww - 2, wh * .35);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(wx + 1, wy + 2, 1.2, wh - 4);
      c.strokeStyle = '#596365'; c.lineWidth = .7; c.strokeRect(wx, wy, ww, wh);
    }
    // scuffs
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let i = 0; i < 12; i++) {
      const sx = x + seeded(i * 4.1) * w, sy = y + h * .72 + seeded(i * 7.7) * h * .21;
      c.strokeStyle = `rgba(215,220,210,${.05 + seeded(i * 2.2) * .07})`; c.lineWidth = .6 + seeded(i * 3.4) * .8;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 5 + seeded(i) * 18, sy - 1 + seeded(i * 5.5) * 2); c.stroke();
    }
    c.restore();
    // stencil
    this.wallText(c, wall, (u1 + u2) / 2, z1 + 20, deco.label || 'BAY 02', '900 8px "Arial Black", Impact, sans-serif', 'rgba(232,196,112,.44)', 'center');
    // handle
    const hx = x + w * .48, hy = y + h * .81;
    c.fillStyle = '#1a1f20'; c.fillRect(hx - 11, hy - 2, 22, 4);
    c.fillStyle = '#6e797a'; c.fillRect(hx - 9, hy - 1.4, 18, 1.2);
    // bottom seal
    c.fillStyle = '#111516'; c.fillRect(x - 4, y + h + 2, w + 8, 5);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x - 4, y + h + 2, w + 8, .7);
  }

  drawSignDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const color = deco.color || pal.accent;
    this.wallShadow(c, x, y, w, h, 4.5, .46);
    const frame = c.createLinearGradient(x, y, x + w, y + h);
    frame.addColorStop(0, '#8d774d'); frame.addColorStop(.3, '#594a32'); frame.addColorStop(.7, '#3b3022'); frame.addColorStop(1, '#211b14');
    c.fillStyle = frame; c.fillRect(x - 3, y - 3, w + 6, h + 6);
    c.strokeStyle = 'rgba(255,226,160,.22)'; c.lineWidth = .8; c.strokeRect(x - 2.3, y - 2.3, w + 4.6, h + 4.6);
    const face = c.createLinearGradient(x, y, x + w * .8, y + h);
    face.addColorStop(0, '#28302e'); face.addColorStop(.55, '#1a201f'); face.addColorStop(1, '#111615');
    c.fillStyle = face; c.fillRect(x, y, w, h);
    // subtle patina
    for (let i = 0; i < 10; i++) {
      c.fillStyle = `rgba(180,150,105,${.018 + seeded(i + u1) * .026})`;
      c.beginPath(); c.ellipse(x + seeded(i * 3.3) * w, y + seeded(i * 5.9) * h, 3 + seeded(i * 2.1) * 9, 1 + seeded(i * 4.7) * 4, seeded(i) * 2, 0, TAU); c.fill();
    }
    const midU = (u1 + u2) / 2, midZ = (z1 + z2) / 2;
    this.wallGlow(c, midU, midZ, Math.max(18, w * .45), color, .12);
    // icon
    const ix = x + w * .17, iy = y + h * .5;
    c.save(); c.translate(ix, iy); c.strokeStyle = rgba(color, .86); c.fillStyle = rgba(color, .86); c.lineWidth = 1.6;
    if (deco.icon === 'anchor') {
      c.beginPath(); c.arc(0, -7, 2.2, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 9); c.moveTo(-5, 2); c.lineTo(5, 2); c.stroke();
      c.beginPath(); c.arc(0, 2, 7, .15, Math.PI - .15); c.stroke();
      c.beginPath(); c.moveTo(-8, 5); c.lineTo(-5, 8); c.lineTo(-8, 9); c.moveTo(8, 5); c.lineTo(5, 8); c.lineTo(8, 9); c.stroke();
    } else {
      // wrench
      c.beginPath(); c.arc(-4, -5, 4, .6, 4.8); c.stroke();
      c.beginPath(); c.arc(-4, -5, 1.4, 0, TAU); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(-1.5, -2); c.lineTo(7, 8); c.stroke();
      c.lineWidth = .7; c.strokeStyle = 'rgba(20,16,10,.5)'; c.beginPath(); c.moveTo(-1.5, -2.8); c.lineTo(7, 7.2); c.stroke();
    }
    c.restore();
    // title
    const tx = u1 + .46 + (u2 - u1) * .09;
    c.save();
    const txt = this.ctx;
    c.save();
    c.translate(U(tx), -midZ);
    if (wall === 'left') c.scale(-1, 1);
    c.textAlign = 'left';
    c.font = '900 12px "Arial Black", Impact, sans-serif';
    c.shadowColor = rgba(color, .55); c.shadowBlur = 7;
    c.fillStyle = color; c.fillText(deco.title || '', 0, -1.5);
    c.shadowBlur = 0;
    c.fillStyle = 'rgba(255,255,255,.16)'; c.fillText(deco.title || '', 0, -2.4);
    c.font = '800 4.8px system-ui'; c.fillStyle = 'rgba(241,237,220,.52)';
    c.fillText(deco.sub || '', 1.5, 7.5);
    c.restore();
    c.restore();
    // screws
    for (const [sx, sy] of [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4]]) this.screwHead(c, sx, sy, 1.15);
    // rust drips
    for (let i = 0; i < 3; i++) {
      const rx = x + 5 + i * w * .4;
      c.fillStyle = 'rgba(147,82,41,.16)';
      c.beginPath(); c.moveTo(rx, y + h - 3); c.lineTo(rx + 1.4, y + h + 2 + seeded(i) * 4); c.lineTo(rx + 2.8, y + h - 3); c.fill();
    }
  }

  drawNeonDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const color = deco.color || '#ffd98a';
    const flick = .82 + Math.sin(this.time * 6.7) * .09 + Math.sin(this.time * 17.3) * .035;
    this.wallGlow(c, (u1 + u2) / 2, (z1 + z2) / 2, Math.max(w, h) * .95, color, .2 * flick);
    // backing plate + chains
    c.fillStyle = 'rgba(11,15,15,.5)'; c.beginPath(); c.roundRect(x - 4, y - 4, w + 8, h + 8, 4); c.fill();
    c.strokeStyle = 'rgba(178,154,102,.4)'; c.lineWidth = .8; c.stroke();
    for (const cx of [x + 8, x + w - 8]) {
      c.strokeStyle = 'rgba(180,175,155,.35)'; c.lineWidth = .7;
      c.beginPath(); c.moveTo(cx, y - 4); c.lineTo(cx + 2, y - 16); c.stroke();
    }
    // glow tube border
    c.save();
    c.shadowColor = rgba(color, .9); c.shadowBlur = 10;
    c.strokeStyle = rgba(color, .42 * flick); c.lineWidth = 1.2;
    c.beginPath(); c.roundRect(x + 1, y + 1, w - 2, h - 2, 3); c.stroke();
    c.restore();
    const midU = (u1 + u2) / 2, midZ = (z1 + z2) / 2 + 5;
    c.save();
    c.translate(U(midU), -midZ);
    if (wall === 'left') c.scale(-1, 1);
    c.textAlign = 'center';
    c.font = '900 16px "Arial Black", Impact, sans-serif';
    c.shadowColor = rgba(color, .95); c.shadowBlur = 16 * flick;
    c.fillStyle = rgba(color, .4 * flick); c.fillText(deco.title || '', 0, 0);
    c.shadowBlur = 8;
    c.fillStyle = color; c.fillText(deco.title || '', 0, 0);
    c.shadowBlur = 0;
    c.fillStyle = 'rgba(255,255,255,.5)'; c.font = '900 15px "Arial Black", Impact, sans-serif'; c.fillText(deco.title || '', 0, -.8);
    c.font = '800 5px system-ui'; c.fillStyle = rgba(color, .7); c.fillText(deco.sub || '', 0, 9);
    c.restore();
    // terminal box and cable
    c.fillStyle = '#232a28'; c.fillRect(x + w - 5, y + h - 10, 4, 6);
    c.strokeStyle = 'rgba(28,30,27,.9)'; c.lineWidth = .9;
    c.beginPath(); c.moveTo(x + w - 3, y + h - 4); c.quadraticCurveTo(x + w + 1, y + h + 10, x + w - 7, y + h + 18); c.stroke();
    for (const [sx, sy] of [[x + 3, y + 3], [x + w - 3, y + 3], [x + 3, y + h - 3], [x + w - 3, y + h - 3]]) this.screwHead(c, sx, sy, 1);
  }

  drawPegboard(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 4, .32);
    const bg = c.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, '#6c563d'); bg.addColorStop(.55, '#584531'); bg.addColorStop(1, '#3f3022');
    c.fillStyle = '#2b2219'; c.fillRect(x - 3, y - 3, w + 6, h + 6);
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    // peg grid
    for (let px = x + 4; px < x + w - 3; px += 6) {
      for (let py = y + 5; py < y + h - 3; py += 6) {
        c.fillStyle = 'rgba(20,13,8,.55)'; c.beginPath(); c.arc(px, py, .8, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,235,200,.09)'; c.beginPath(); c.arc(px - .4, py - .4, .35, 0, TAU); c.fill();
      }
    }
    // steel edging
    c.strokeStyle = 'rgba(207,197,170,.18)'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w - 1, h - 1);
    // tools
    const tools = [
      { kind: 'wrench', x: .16, y: .22, s: 1.15, col: '#b9c2bf' },
      { kind: 'screwdriver', x: .4, y: .2, s: 1, col: '#d7a24d' },
      { kind: 'hammer', x: .67, y: .21, s: 1, col: '#9b784e' },
      { kind: 'saw', x: .24, y: .62, s: 1.1, col: '#aeb7b3' },
      { kind: 'spanner', x: .55, y: .62, s: 1, col: '#c3cbc7' },
      { kind: 'cable', x: .82, y: .64, s: 1, col: '#333b38' }
    ];
    for (const t of tools) {
      const tx = x + w * t.x, ty = y + h * t.y;
      c.save(); c.translate(tx + 2, ty + 2); c.globalAlpha = .28; c.strokeStyle = '#080a08'; c.fillStyle = '#080a08'; c.lineWidth = 2.4;
      this.drawToolShape(c, t.kind, t.s);
      c.restore();
      c.save(); c.translate(tx, ty); c.strokeStyle = t.col; c.fillStyle = t.col; c.lineWidth = 2.1;
      this.drawToolShape(c, t.kind, t.s);
      c.restore();
    }
    // shelf at the bottom
    c.fillStyle = shade(pal.trim, -30); c.fillRect(x + 3, -z1 - 4, w - 6, 3);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 3, -z1, w - 6, 1.5);
    for (let i = 0; i < 3; i++) {
      const cx = x + w * (.22 + i * .24);
      c.fillStyle = ['#a84d3e', '#4d7c63', '#b48a42'][i];
      c.fillRect(cx, -z1 - 12, 5.5, 8);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(cx + .6, -z1 - 11, .8, 6);
      c.fillStyle = 'rgba(20,20,18,.55)'; c.fillRect(cx + 1.2, -z1 - 10, 3.1, 1.2);
    }
    // pinned work order
    c.save(); c.translate(x + w * .78, y + h * .18); c.rotate(-.08);
    c.fillStyle = 'rgba(232,226,200,.88)'; c.fillRect(-6, -4, 12, 15);
    c.fillStyle = 'rgba(80,84,72,.65)'; c.fillRect(-4.5, -2, 9, .9); c.fillRect(-4.5, .2, 7, .8); c.fillRect(-4.5, 2.4, 8, .8);
    c.fillStyle = '#b24d3d'; c.beginPath(); c.arc(0, -4, 1.2, 0, TAU); c.fill();
    c.restore();
  }

  drawToolShape(c, kind, s) {
    c.save(); c.scale(s, s);
    if (kind === 'wrench') {
      c.beginPath(); c.arc(-3, -8, 3.4, .7, 4.7); c.stroke();
      c.beginPath(); c.moveTo(-1, -5); c.lineTo(5, 8); c.stroke();
    } else if (kind === 'screwdriver') {
      c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 5); c.stroke();
      c.fillStyle = '#b34b3b'; c.fillRect(-1.8, -13, 3.6, 6);
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-1.1, -12, .7, 4);
    } else if (kind === 'hammer') {
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -5); c.lineTo(0, 10); c.stroke();
      c.fillStyle = '#7d8784'; c.fillRect(-6, -8, 12, 5);
    } else if (kind === 'saw') {
      c.beginPath(); c.moveTo(-6, -7); c.lineTo(6, -9); c.lineTo(4, 0); c.lineTo(-5, 1); c.closePath(); c.stroke();
      c.lineWidth = .7; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-5 + i * 2, 1); c.lineTo(-4.5 + i * 2, 3.5); c.stroke(); }
    } else if (kind === 'spanner') {
      c.beginPath(); c.arc(-3, -7, 2.4, 0, TAU); c.stroke();
      c.beginPath(); c.arc(3, 7, 2.4, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-2.4, -5.5); c.lineTo(2.4, 5.5); c.stroke();
    } else if (kind === 'cable') {
      c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.stroke();
      c.beginPath(); c.arc(0, 0, 3.5, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(6, 3); c.lineTo(9, 9); c.stroke();
    }
    c.restore();
  }

  drawPipeDeco(c, wall, deco, pal) {
    const x = U(deco.u1), zBot = Math.max(4, deco.z - (deco.length || 84)), zTop = deco.z;
    const yb = -zBot, yt = -zTop, h = yb - yt;
    c.fillStyle = 'rgba(0,0,0,.24)'; c.fillRect(x + 3, yt + 2, 5, h);
    const g = c.createLinearGradient(x - 4, 0, x + 5, 0);
    g.addColorStop(0, '#303b3d'); g.addColorStop(.3, deco.color || '#7a8b8b'); g.addColorStop(.52, shade(deco.color || '#7a8b8b', 30)); g.addColorStop(.72, deco.color || '#7a8b8b'); g.addColorStop(1, '#263032');
    c.fillStyle = g; c.fillRect(x - 3.5, yt, 7, h);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - 1.2, yt + 2, 1, h - 4);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 2.2, yt + 2, 1.1, h - 4);
    // flanges
    for (let y = yt + 4; y <= yb; y += Math.max(24, h / 4)) {
      c.fillStyle = '#394446'; c.fillRect(x - 6, y - 2, 12, 4);
      c.fillStyle = deco.color || '#7a8b8b'; c.fillRect(x - 5, y - 1.2, 10, 1.1);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x - 5, y - 2, 10, .55);
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x - 5, y + 1.4, 10, .7);
      this.screwHead(c, x - 4, y + .6, .8); this.screwHead(c, x + 4, y + .6, .8);
    }
    // valve
    const vy = yt + h * .42;
    c.fillStyle = '#465255'; c.beginPath(); c.arc(x, vy, 9, 0, TAU); c.fill();
    c.strokeStyle = '#aeb8b4'; c.lineWidth = 1.3; c.beginPath(); c.arc(x, vy, 7.2, 0, TAU); c.stroke();
    c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.save(); c.translate(x, vy); c.rotate(i * Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -7); c.stroke(); c.restore(); }
    c.fillStyle = '#cdd1c6'; c.beginPath(); c.arc(x, vy, 1.8, 0, TAU); c.fill();
    // pressure gauge
    const gy = Math.min(yb - 14, vy + 24);
    c.fillStyle = '#d8d6c9'; c.beginPath(); c.arc(x, gy, 6, 0, TAU); c.fill();
    c.strokeStyle = '#4d5653'; c.lineWidth = .9; c.stroke();
    c.strokeStyle = '#9b3f38'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, gy); c.lineTo(x + 3.5, gy - 4); c.stroke();
    c.fillStyle = '#545c58'; c.fillRect(x - 7, gy + 5, 14, 2);
    // wall clamps
    for (const y of [yt + 10, yb - 10]) {
      c.fillStyle = 'rgba(35,42,42,.9)'; c.fillRect(x - 7, y - 1.5, 14, 3);
      this.screwHead(c, x - 5.5, y, .7); this.screwHead(c, x + 5.5, y, .7);
    }
    // elbow at top
    c.strokeStyle = deco.color || '#7a8b8b'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, yt + 2); c.lineTo(x + 10, yt + 2); c.stroke();
    c.lineCap = 'butt';
  }

  drawDuctDeco(c, wall, deco, pal) {
    const { u1, u2 } = deco, w = U(u2 - u1), x = U(u1), h = deco.h || 16, y = -deco.z - h / 2;
    this.wallShadow(c, x, y, w, h, 4, .3);
    // hanger rods
    for (const t of [.18, .5, .82]) {
      const hx = x + w * t;
      c.strokeStyle = 'rgba(176,180,168,.45)'; c.lineWidth = .9;
      c.beginPath(); c.moveTo(hx, y - 10); c.lineTo(hx, y + 1); c.stroke();
    }
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#788488'); g.addColorStop(.25, '#a2aeaf'); g.addColorStop(.55, '#6e7a7d'); g.addColorStop(.86, '#4a565a'); g.addColorStop(1, '#333d41');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x, y + 1, w, 1);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x, y + h - 2, w, 2);
    c.strokeStyle = 'rgba(30,38,40,.45)'; c.lineWidth = .75;
    for (let px = x + 12; px < x + w; px += 26) { c.beginPath(); c.moveTo(px, y + 1); c.lineTo(px, y + h - 1); c.stroke(); }
    for (let i = 0; i < 5; i++) { const px = x + 5 + i * w / 5; this.screwHead(c, px, y + h * .38, .65); }
    // vent grille
    const vx = x + w * .48, vw = Math.min(26, w * .15), vy = y + h * .46;
    c.fillStyle = '#273033'; c.fillRect(vx, vy, vw, h * .38);
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(170,181,177,.34)'; c.fillRect(vx + 2, vy + 2 + i * (h * .3 / 4), vw - 4, .8); }
    // label
    c.fillStyle = 'rgba(224,217,187,.36)'; c.fillRect(x + w * .75, y + h * .26, 13, 7);
    this.wallText(c, wall, u1 + (u2 - u1) * .775, deco.z + 2.6, 'HVAC', '800 3.4px system-ui', 'rgba(23,28,27,.7)');
    // condensation
    c.fillStyle = 'rgba(180,225,235,.16)';
    c.beginPath(); c.ellipse(x + w * .64, y + h - 2, 3, 1.2, 0, 0, TAU); c.fill();
  }

  drawWarningDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const accent = deco.color || '#e3b94a';
    this.wallShadow(c, x, y, w, h, 3.5, .35);
    c.fillStyle = '#2a2d2a'; c.fillRect(x - 2, y - 2, w + 4, h + 4);
    c.fillStyle = '#141716'; c.fillRect(x, y, w, h);
    // hazard border
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    for (let i = -h; i < w + h; i += 9) {
      c.fillStyle = accent; c.beginPath();
      c.moveTo(x + i, y); c.lineTo(x + i + 5, y); c.lineTo(x + i + 5 - h, y + h); c.lineTo(x + i - h, y + h); c.closePath(); c.fill();
      c.fillStyle = '#1a1c19'; c.beginPath();
      c.moveTo(x + i + 5, y); c.lineTo(x + i + 10, y); c.lineTo(x + i + 10 - h, y + h); c.lineTo(x + i + 5 - h, y + h); c.closePath(); c.fill();
    }
    c.restore();
    const inset = Math.min(5, h * .06);
    c.fillStyle = '#20231f'; c.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    c.strokeStyle = 'rgba(231,206,116,.55)'; c.lineWidth = .8; c.strokeRect(x + inset + .4, y + inset + .4, w - inset * 2 - .8, h - inset * 2 - .8);
    // triangle
    const tx = x + w / 2, ty = y + h * .38, tr = Math.min(w * .18, h * .17);
    c.fillStyle = accent; c.beginPath(); c.moveTo(tx, ty - tr); c.lineTo(tx + tr * .95, ty + tr * .72); c.lineTo(tx - tr * .95, ty + tr * .72); c.closePath(); c.fill();
    c.fillStyle = '#20231f'; c.font = '900 11px "Arial Black", Impact, sans-serif'; c.textAlign = 'center'; c.fillText('!', tx, ty + tr * .55);
    // text
    const mid = (z1 + z2) / 2;
    this.wallText(c, wall, (u1 + u2) / 2, mid - 9, deco.title || 'CAUTION', '900 7px "Arial Black", Impact, sans-serif', accent, 'center');
    this.wallText(c, wall, (u1 + u2) / 2, mid - 18, deco.sub || 'HIGH VOLTAGE', '700 4.1px system-ui', 'rgba(242,236,211,.58)', 'center');
    // screws + corrosion
    for (const [sx, sy] of [[x + 3, y + 3], [x + w - 3, y + 3], [x + 3, y + h - 3], [x + w - 3, y + h - 3]]) this.screwHead(c, sx, sy, .8);
    for (let i = 0; i < 4; i++) {
      c.fillStyle = `rgba(153,96,48,${.06 + seeded(i + u1) * .09})`;
      c.beginPath(); c.ellipse(x + seeded(i * 3.3 + u1) * w, y + h - seeded(i * 4.4) * 8, 2 + seeded(i) * 4, 1 + seeded(i * 2.2) * 2, 0, 0, TAU); c.fill();
    }
  }

  drawLabWindow(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const color = deco.color || '#6fe7ff';
    const pulse = .9 + Math.sin(this.time * 1.4) * .08;
    this.wallGlow(c, (u1 + u2) / 2, (z1 + z2) / 2, Math.max(w, h) * .9, color, .26 * pulse);
    this.wallShadow(c, x, y, w, h, 5, .4);
    // heavy steel frame
    const fg = c.createLinearGradient(x - 5, y, x + w + 5, y + h);
    fg.addColorStop(0, '#4a585b'); fg.addColorStop(.35, '#718083'); fg.addColorStop(.7, '#3b484b'); fg.addColorStop(1, '#202a2d');
    c.fillStyle = fg; c.fillRect(x - 5, y - 5, w + 10, h + 10);
    c.closePath(); c.strokeStyle = 'rgba(230,255,255,.12)'; c.lineWidth = .8; c.strokeRect(x - 4.2, y - 4.2, w + 8.4, h + 8.4);
    c.save(); c.beginPath(); c.rect(x + 2, y + 2, w - 4, h - 4); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#071a22'); g.addColorStop(.34, '#0d3441'); g.addColorStop(.7, '#115564'); g.addColorStop(1, '#0a2f3a');
    c.fillStyle = g; c.fillRect(x + 2, y + 2, w - 4, h - 4);
    // fluid glow
    const fgl = c.createRadialGradient(x + w * .5, y + h * .5, 2, x + w * .5, y + h * .5, w * .7);
    fgl.addColorStop(0, rgba(color, .34 * pulse)); fgl.addColorStop(.5, rgba(color, .1)); fgl.addColorStop(1, rgba(color, 0));
    c.fillStyle = fgl; c.fillRect(x, y, w, h);
    // specimen shadows behind glass
    for (let i = 0; i < 4; i++) {
      const sx = x + w * (.22 + i * .18), sy = y + h * (.42 + (i % 2) * .08);
      c.fillStyle = `rgba(4,18,23,${.42 + i * .05})`;
      c.beginPath(); c.ellipse(sx, sy, 5 + i * .8, 13 + i * 1.5, (i - 1.5) * .05, 0, TAU); c.fill();
      c.fillStyle = `rgba(4,18,23,.35)`; c.beginPath(); c.arc(sx, sy - 15, 4, 0, TAU); c.fill();
    }
    // bubbles
    for (let i = 0; i < 7; i++) {
      const bx = x + w * (.16 + seeded(i * 3.1) * .68);
      const by = y + h - ((this.time * (7 + seeded(i)) + i * 13) % (h * .7));
      c.fillStyle = `rgba(190,250,255,${.12 + seeded(i * 2.4) * .24})`;
      c.beginPath(); c.arc(bx, by, .8 + seeded(i * 5.3) * 1.7, 0, TAU); c.fill();
    }
    // scan lines + reflection
    c.strokeStyle = 'rgba(150,245,255,.1)'; c.lineWidth = .8;
    for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(x + 2, y + i * h / 8); c.lineTo(x + w - 2, y + i * h / 8); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.07)';
    c.beginPath(); c.moveTo(x + w * .18, y + 2); c.lineTo(x + w * .3, y + 2); c.lineTo(x + w * .05, y + h - 2); c.lineTo(x - 7, y + h - 2); c.closePath(); c.fill();
    c.restore();
    // center brace + frame details
    c.strokeStyle = '#5f7073'; c.lineWidth = 2.3;
    c.beginPath(); c.moveTo(x + w * .5, y); c.lineTo(x + w * .5, y + h); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.13)'; c.lineWidth = .7;
    c.beginPath(); c.moveTo(x + w * .5 - 1, y); c.lineTo(x + w * .5 - 1, y + h); c.stroke();
    for (const [sx, sy] of [[x - 2.5, y - 2.5], [x + w + 2.5, y - 2.5], [x - 2.5, y + h + 2.5], [x + w + 2.5, y + h + 2.5], [x + w * .5, y - 2.5], [x + w * .5, y + h + 2.5]]) this.screwHead(c, sx, sy, 1.25);
    // sticker
    c.fillStyle = 'rgba(217,184,67,.85)'; c.fillRect(x + w - 17, y + h - 15, 11, 7);
    this.wallText(c, wall, u2 - .1, z1 + 11.4, 'BIO', '800 2.8px system-ui', '#211f15');
  }

  drawWireFence(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 3, .3);
    const mesh = c.createLinearGradient(x, 0, x + w, 0);
    mesh.addColorStop(0, 'rgba(160,178,174,.4)'); mesh.addColorStop(.5, 'rgba(207,218,211,.3)'); mesh.addColorStop(1, 'rgba(143,163,159,.4)');
    c.strokeStyle = mesh; c.lineWidth = .55;
    for (let px = x - h; px < x + w + h; px += 5) {
      c.beginPath(); c.moveTo(px, y); c.lineTo(px + h, y + h); c.stroke();
      c.beginPath(); c.moveTo(px, y + h); c.lineTo(px + h, y); c.stroke();
    }
    // rails
    c.strokeStyle = 'rgba(121,139,135,.72)'; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + w, y + 1); c.stroke();
    c.beginPath(); c.moveTo(x, y + h - 1); c.lineTo(x + w, y + h - 1); c.stroke();
    // posts
    for (const px of [x, x + w]) {
      const pg = c.createLinearGradient(px - 4, 0, px + 4, 0);
      pg.addColorStop(0, '#525b59'); pg.addColorStop(.4, '#98a5a0'); pg.addColorStop(1, '#3f4846');
      c.fillStyle = pg; c.fillRect(px - 2.4, y - 3, 4.8, h + 5);
      c.fillStyle = '#909c96'; c.fillRect(px - 3.2, y - 4, 6.4, 2.2);
      c.fillStyle = 'rgba(25,31,29,.55)'; c.fillRect(px - 3.4, y + h + 1, 6.8, 2.4);
    }
    // barbed wire
    c.strokeStyle = 'rgba(178,188,181,.45)'; c.lineWidth = .6;
    c.beginPath();
    for (let i = 0; i <= 20; i++) { const px = x + i / 20 * w, py = y - 8 + Math.sin(i * .9) * 1.8; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
    for (let i = 2; i < 20; i += 4) {
      const px = x + i / 20 * w, py = y - 8 + Math.sin(i * .9) * 1.8;
      c.strokeStyle = 'rgba(188,198,191,.38)'; c.lineWidth = .55;
      c.beginPath(); c.moveTo(px - 2, py - 2); c.lineTo(px + 2, py + 2); c.moveTo(px + 2, py - 2); c.lineTo(px - 2, py + 2); c.stroke();
    }
    // restricted sign
    const sx = x + w * .56, sy = y + h * .36;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(sx + 1.5, sy + 2, 20, 14);
    c.fillStyle = '#cbb64e'; c.fillRect(sx, sy, 20, 14);
    c.strokeStyle = '#27241a'; c.lineWidth = .8; c.strokeRect(sx + .5, sy + .5, 19, 13);
    this.wallText(c, wall, u1 + (u2 - u1) * .59, z2 - h * .38 + 3, 'NO ENTRY', '900 3.7px "Arial Black"', '#27241a', 'center');
    this.wallText(c, wall, u1 + (u2 - u1) * .59, z2 - h * .38 - 3, 'PIER 9', '800 3.2px system-ui', 'rgba(39,36,26,.72)', 'center');
  }

  drawSkyline(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const night = this.game.hour < 6.6 || this.game.hour > 19;
    this.wallGlow(c, (u1 + u2) / 2, (z1 + z2) / 2, Math.max(w, h) * .64, night ? '#ffcd85' : '#f6d7a0', night ? .22 : .2);
    this.wallShadow(c, x - 4, y - 4, w + 8, h + 8, 6, .46);
    // bronze casing
    const frame = c.createLinearGradient(x, y, x + w, y + h);
    frame.addColorStop(0, '#6f5735'); frame.addColorStop(.25, '#b2955e'); frame.addColorStop(.52, '#7e653d'); frame.addColorStop(.78, '#c3a66c'); frame.addColorStop(1, '#4a3824');
    c.fillStyle = frame; c.fillRect(x - 7, y - 7, w + 14, h + 14);
    c.strokeStyle = 'rgba(255,234,183,.24)'; c.lineWidth = 1; c.strokeRect(x - 6.2, y - 6.2, w + 12.4, h + 12.4);
    c.strokeStyle = 'rgba(32,23,14,.55)'; c.lineWidth = 1.2; c.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3);
    // glass
    c.save(); c.beginPath(); c.rect(x + 1, y + 1, w - 2, h - 2); c.clip();
    const sky = c.createLinearGradient(0, y, 0, y + h);
    if (night) { sky.addColorStop(0, '#050b16'); sky.addColorStop(.36, '#0c1a2b'); sky.addColorStop(.67, '#1b3846'); sky.addColorStop(.84, '#3b4e4d'); sky.addColorStop(1, '#6d5d48'); }
    else { sky.addColorStop(0, '#385b72'); sky.addColorStop(.35, '#7b9fa5'); sky.addColorStop(.66, '#d3aa74'); sky.addColorStop(1, '#e8c892'); }
    c.fillStyle = sky; c.fillRect(x, y, w, h);
    // clouds/haze
    c.fillStyle = night ? 'rgba(80,110,145,.12)' : 'rgba(255,240,210,.18)';
    for (let i = 0; i < 5; i++) {
      const cy = y + h * (.16 + i * .11), cw = w * (.24 + seeded(i) * .3);
      c.beginPath(); c.ellipse(x + seeded(i * 3.7) * w, cy, cw, 5 + seeded(i * 2.2) * 7, 0, 0, TAU); c.fill();
    }
    // horizon glow
    const hg = c.createLinearGradient(0, y + h * .58, 0, y + h);
    hg.addColorStop(0, 'rgba(255,186,105,0)'); hg.addColorStop(.7, night ? 'rgba(255,161,92,.1)' : 'rgba(255,205,135,.25)'); hg.addColorStop(1, night ? 'rgba(255,171,100,.02)' : 'rgba(255,220,160,.04)');
    c.fillStyle = hg; c.fillRect(x, y + h * .58, w, h * .42);
    // stars
    if (night) for (let i = 0; i < 26; i++) {
      const sx = x + seeded(i * 2.7 + u1) * w, sy = y + seeded(i * 5.3 + z1) * h * .36;
      c.fillStyle = `rgba(222,238,240,${.16 + seeded(i * 3.9) * .4})`; c.fillRect(sx, sy, .7 + seeded(i * 4.6) * .8, .7 + seeded(i * 7.2) * .8);
    }
    // moon
    const mx = x + w * .77, my = y + h * (.18 + (night ? 0 : .1));
    const mg = c.createRadialGradient(mx, my, 1, mx, my, 24);
    mg.addColorStop(0, night ? 'rgba(242,244,220,.96)' : 'rgba(255,250,223,.96)'); mg.addColorStop(.25, night ? 'rgba(238,242,217,.24)' : 'rgba(255,240,190,.25)'); mg.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 24, 0, TAU); c.fill();
    c.fillStyle = night ? 'rgba(241,243,218,.9)' : 'rgba(255,251,228,.96)'; c.beginPath(); c.arc(mx, my, 7, 0, TAU); c.fill();
    // three skyline layers
    const layers = [
      { base: y + h * .84, hMin: .18, hMax: .38, alpha: night ? .35 : .24, col: night ? '#193141' : '#778b88', lights: .4, step: 24 },
      { base: y + h * .9, hMin: .25, hMax: .56, alpha: night ? .66 : .42, col: night ? '#0a1822' : '#526965', lights: .75, step: 18 },
      { base: y + h * .96, hMin: .3, hMax: .68, alpha: night ? .94 : .66, col: night ? '#02090e' : '#2f413e', lights: 1, step: 15 }
    ];
    for (let li = 0; li < layers.length; li++) {
      const L = layers[li];
      for (let i = 0; i < Math.ceil(w / L.step) + 1; i++) {
        const bw = L.step * (.55 + seeded(i * 3.7 + li) * .65);
        const bh = h * (L.hMin + seeded(i * 5.1 + li * 7) * (L.hMax - L.hMin));
        const bx = x + i * L.step - seeded(i * 2.2 + li) * 5;
        c.fillStyle = rgba(L.col, L.alpha);
        c.fillRect(bx, L.base - bh, bw, bh + h);
        if (L.lights > .5) {
          const winCol = night ? `rgba(255,205,125,${.45 * L.lights})` : `rgba(255,229,175,${.22 * L.lights})`;
          for (let wy = L.base - bh + 4; wy < L.base - 4; wy += 6) {
            for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
              if (seeded(wx * .7 + wy * 1.3 + li) > .57) { c.fillStyle = winCol; c.fillRect(wx, wy, 1.1, 1.7); }
            }
          }
        }
        if (seeded(i * 9.7 + li) > .82) {
          c.fillStyle = rgba(L.col, L.alpha); c.fillRect(bx + bw * .5, L.base - bh - 8, .9, 8);
          if (night) { c.fillStyle = 'rgba(255,95,85,.7)'; c.fillRect(bx + bw * .5 - .3, L.base - bh - 9, 1.4, 1.4); }
        }
      }
    }
    // glass reflection
    const refl = c.createLinearGradient(x, y, x + w * .7, y + h);
    refl.addColorStop(0, 'rgba(255,244,210,.13)'); refl.addColorStop(.25, 'rgba(255,244,210,.02)'); refl.addColorStop(.27, 'rgba(255,244,210,0)'); refl.addColorStop(.7, 'rgba(255,244,210,.05)'); refl.addColorStop(1, 'rgba(255,244,210,0)');
    c.fillStyle = refl; c.fillRect(x, y, w, h);
    c.restore();
    // mullions
    for (let i = 1; i < 6; i++) {
      const px = x + w * i / 6;
      c.strokeStyle = '#6b5433'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px, y); c.lineTo(px, y + h); c.stroke();
      c.strokeStyle = 'rgba(255,229,174,.3)'; c.lineWidth = .7; c.beginPath(); c.moveTo(px - .8, y); c.lineTo(px - .8, y + h); c.stroke();
    }
    c.strokeStyle = '#6b5433'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + h * .78); c.lineTo(x + w, y + h * .78); c.stroke();
    c.strokeStyle = 'rgba(255,229,174,.28)'; c.lineWidth = .8; c.beginPath(); c.moveTo(x, y + h * .78 - .8); c.lineTo(x + w, y + h * .78 - .8); c.stroke();
    // sill / balcony rail
    c.fillStyle = '#5d482d'; c.fillRect(x - 9, y + h, w + 18, 5);
    c.fillStyle = 'rgba(255,232,182,.25)'; c.fillRect(x - 8, y + h + .5, w + 16, .8);
    c.fillStyle = 'rgba(16,12,8,.35)'; c.fillRect(x - 7, y + h + 5, w + 14, 2);
    // curtains
    if (deco.curtain) {
      for (const side of [0, 1]) {
        const cw = Math.min(w * .1, 30), cx0 = side ? x + w - cw + 5 : x - cw - 5;
        const cg = c.createLinearGradient(cx0, 0, cx0 + cw, 0);
        cg.addColorStop(0, shade(deco.curtain, -35)); cg.addColorStop(.32, shade(deco.curtain, 12)); cg.addColorStop(.6, shade(deco.curtain, -18)); cg.addColorStop(1, shade(deco.curtain, -40));
        c.fillStyle = cg;
        c.beginPath(); c.moveTo(cx0, y - 5); c.quadraticCurveTo(cx0 + cw * .7, y + h * .4, cx0 + cw * .8, y + h + 4); c.lineTo(cx0 + cw * .3, y + h + 4); c.quadraticCurveTo(cx0 + cw * .35, y + h * .45, cx0, y - 5); c.fill();
      }
    }
    // corner bolts
    for (const [sx, sy] of [[x - 3, y - 3], [x + w + 3, y - 3], [x - 3, y + h + 3], [x + w + 3, y + h + 3]]) this.screwHead(c, sx, sy, 1.3);
  }

  drawArtDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    const gold = deco.color || '#d7b46a';
    this.wallShadow(c, x, y, w, h, 4.5, .38);
    this.wallGlow(c, (u1 + u2) / 2, z2 + 8, w * .8, '#ffe0a0', .14);
    // ornate gold frame
    const fg = c.createLinearGradient(x, y, x + w, y + h);
    fg.addColorStop(0, shade(gold, -38)); fg.addColorStop(.24, gold); fg.addColorStop(.5, shade(gold, 24)); fg.addColorStop(.76, shade(gold, -12)); fg.addColorStop(1, shade(gold, -48));
    c.fillStyle = fg; c.fillRect(x - 4, y - 4, w + 8, h + 8);
    c.strokeStyle = 'rgba(255,245,205,.35)'; c.lineWidth = .8; c.strokeRect(x - 3.2, y - 3.2, w + 6.4, h + 6.4);
    c.strokeStyle = 'rgba(68,46,20,.55)'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w - 1, h - 1);
    // inner mat
    c.fillStyle = '#1c1918'; c.fillRect(x + 3, y + 3, w - 6, h - 6);
    c.strokeStyle = 'rgba(226,198,139,.35)'; c.lineWidth = .8; c.strokeRect(x + 5, y + 5, w - 10, h - 10);
    // abstract canvas
    c.save(); c.beginPath(); c.rect(x + 7, y + 7, w - 14, h - 14); c.clip();
    const bg = c.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, '#342231'); bg.addColorStop(.45, '#6f3b45'); bg.addColorStop(1, '#d0a165');
    c.fillStyle = bg; c.fillRect(x + 6, y + 6, w - 12, h - 12);
    const shapes = [
      ['#cd8b62', .2, .55, .35, .4, -0.6], ['#8f4b52', .6, .42, .3, .5, .35], ['#e6c47d', .42, .25, .22, .26, .8], ['#2f3d43', .72, .7, .4, .28, -.2]
    ];
    for (const [col, sx, sy, sw, sh, rot] of shapes) {
      c.save(); c.translate(x + w * sx, y + h * sy); c.rotate(rot);
      c.fillStyle = rgba(col, .72); c.beginPath(); c.ellipse(0, 0, w * sw, h * sh, 0, 0, TAU); c.fill();
      c.restore();
    }
    c.strokeStyle = 'rgba(247,224,178,.22)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x + w * .1, y + h * .8); c.bezierCurveTo(x + w * .35, y + h * .2, x + w * .6, y + h * .9, x + w * .9, y + h * .3); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(x + w * .15, y); c.lineTo(x + w * .28, y); c.lineTo(x + w * .04, y + h); c.lineTo(x - 8, y + h); c.closePath(); c.fill();
    c.restore();
    // plaque
    const px = x + w / 2, py = y + h + 8;
    c.fillStyle = shade(gold, -30); c.fillRect(px - 12, py - 2, 24, 4);
    c.fillStyle = 'rgba(255,238,190,.55)'; c.fillRect(px - 11, py - 1.6, 22, .7);
    if (deco.title) this.wallText(c, wall, (u1 + u2) / 2, z1 - 11.5, deco.title, '800 3.2px system-ui', 'rgba(245,226,178,.56)', 'center');
    // spotlight
    const sg = c.createRadialGradient(px, y - 10, 2, px, y - 10, w * .7);
    sg.addColorStop(0, 'rgba(255,228,170,.12)'); sg.addColorStop(1, 'rgba(255,228,170,0)');
    c.fillStyle = sg; c.fillRect(x - w * .3, y - 30, w * 1.6, h * .8);
  }

  drawPictureDeco(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 2.5, .34);
    const fg = c.createLinearGradient(x, y, x + w, y + h);
    fg.addColorStop(0, '#7d6241'); fg.addColorStop(.5, '#b09161'); fg.addColorStop(1, '#4a3827');
    c.fillStyle = fg; c.fillRect(x - 2, y - 2, w + 4, h + 4);
    c.fillStyle = '#d7c8a6'; c.fillRect(x, y, w, h);
    c.fillStyle = '#17211d'; c.fillRect(x + 2, y + 2, w - 4, h - 4);
    c.save(); c.beginPath(); c.rect(x + 3, y + 3, w - 6, h - 6); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#324843'); g.addColorStop(.55, '#56644f'); g.addColorStop(1, '#967b54'); c.fillStyle = g; c.fillRect(x + 3, y + 3, w - 6, h - 6);
    // two silhouettes under a tree
    c.fillStyle = 'rgba(20,29,24,.75)';
    c.beginPath(); c.arc(x + w * .38, y + h * .58, 4.6, 0, TAU); c.fill();
    c.beginPath(); c.arc(x + w * .6, y + h * .6, 4.2, 0, TAU); c.fill();
    c.fillRect(x + w * .33, y + h * .58, 6, h * .22); c.fillRect(x + w * .56, y + h * .6, 5.5, h * .2);
    c.fillStyle = 'rgba(16,28,20,.45)'; c.beginPath(); c.arc(x + w * .2, y + h * .3, w * .18, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,241,200,.08)'; c.fillRect(x + 3, y + 3, w - 6, h * .26);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = .7; c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x + 2, y + 2, w * .3, .7);
    if (deco.title) this.wallText(c, wall, (u1 + u2) / 2, z1 - 5.5, deco.title, '700 3px system-ui', 'rgba(235,221,190,.46)', 'center');
    // nail
    c.fillStyle = '#b7b1a3'; c.beginPath(); c.arc(x + w / 2, y - 4, 1, 0, TAU); c.fill();
  }

  drawClockDeco(c, wall, deco, pal) {
    const cu = (deco.u1 + deco.u2) / 2, cz = (deco.z1 + deco.z2) / 2;
    const r = Math.min(U(deco.u2 - deco.u1), deco.z2 - deco.z1) / 2;
    const x = U(cu), y = -cz;
    this.wallShadow(c, x - r, y - r, r * 2, r * 2, 2.5, .3);
    const bez = c.createRadialGradient(x - r * .3, y - r * .3, 2, x, y, r);
    bez.addColorStop(0, '#9ba19a'); bez.addColorStop(.72, '#4e5552'); bez.addColorStop(1, '#252b2a');
    c.fillStyle = bez; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = '#e6dfc9'; c.beginPath(); c.arc(x, y, r * .83, 0, TAU); c.fill();
    const face = c.createRadialGradient(x - r * .25, y - r * .25, 1, x, y, r * .83);
    face.addColorStop(0, 'rgba(255,252,235,.8)'); face.addColorStop(1, 'rgba(190,181,155,.25)');
    c.fillStyle = face; c.beginPath(); c.arc(x, y, r * .83, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(55,59,55,.65)'; c.lineWidth = .6;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, inner = i % 3 === 0 ? r * .6 : r * .69;
      c.beginPath(); c.moveTo(x + Math.sin(a) * inner, y - Math.cos(a) * inner); c.lineTo(x + Math.sin(a) * r * .76, y - Math.cos(a) * r * .76); c.stroke();
    }
    const hour = this.game.hour;
    const ha = (hour % 12) / 12 * TAU, ma = (hour * 60 % 60) / 60 * TAU;
    c.strokeStyle = '#2b302c'; c.lineCap = 'round';
    c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(ha) * r * .42, y - Math.cos(ha) * r * .42); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(ma) * r * .62, y - Math.cos(ma) * r * .62); c.stroke();
    c.lineCap = 'butt';
    c.fillStyle = '#a83e34'; c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x - r * .3, y - r * .36, r * .28, r * .4, -.5, 0, TAU); c.fill();
  }

  drawHangingPlant(c, wall, deco) {
    const u = (deco.u1 + deco.u2) / 2, z = deco.z || 148;
    const x = U(u), y = -z;
    const sway = Math.sin(this.time * .8 + u) * 1.6;
    const px = x + sway, py = y + 26;
    // bracket
    c.strokeStyle = 'rgba(35,37,32,.85)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x - 10, y + 2); c.lineTo(x - 10, y - 2); c.lineTo(x + 8, y + 2); c.stroke();
    c.fillStyle = '#6f6a59'; c.beginPath(); c.arc(x - 10, y + 1, 1.4, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(165,167,148,.6)'; c.lineWidth = .7;
    c.beginPath(); c.moveTo(x - 3, y + 2); c.lineTo(px + 3, py - 2); c.moveTo(x + 4, y + 2); c.lineTo(px - 4, py - 2); c.stroke();
    // pot
    const pot = c.createLinearGradient(px - 8, 0, px + 8, 0);
    pot.addColorStop(0, '#5e4230'); pot.addColorStop(.45, '#b5794d'); pot.addColorStop(1, '#4a3225');
    c.fillStyle = pot; c.beginPath(); c.moveTo(px - 8, py - 5); c.lineTo(px + 8, py - 5); c.lineTo(px + 5.5, py + 8); c.lineTo(px - 5.5, py + 8); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(px, py - 4, 8, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.13)'; c.fillRect(px - 5, py - 3.5, 1.2, 8);
    // leaves
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + .3, rr = 10 + (i % 3) * 4;
      const lx = px + Math.cos(a) * rr + Math.sin(this.time + i) * .8;
      const ly = py - 4 + Math.sin(a) * rr * .5;
      c.fillStyle = i % 3 ? '#4f8f58' : '#3e7348';
      c.beginPath(); c.ellipse(lx, ly, 4.8, 2.4, a, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(175,230,170,.22)'; c.lineWidth = .5; c.beginPath(); c.ellipse(lx, ly, 3, 1.4, a, 0, TAU); c.stroke();
    }
    // trailing vines
    c.strokeStyle = '#527b4d'; c.lineWidth = 1;
    for (let v = 0; v < 3; v++) {
      const vx = px - 5 + v * 5;
      c.beginPath(); c.moveTo(vx, py + 6); c.bezierCurveTo(vx + 8, py + 20, vx - 5, py + 34, vx + 3, py + 48 + v * 4); c.stroke();
      for (let i = 0; i < 4; i++) {
        const t = i / 4, lx = vx + Math.sin(t * 5 + v) * 5, ly = py + 10 + t * (38 + v * 4);
        c.fillStyle = i % 2 ? '#4e8754' : '#3c6d45'; c.beginPath(); c.ellipse(lx, ly, 3.4, 1.8, .5, 0, TAU); c.fill();
      }
    }
  }

  drawHazardStripe(c, wall, deco) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#171a18'; c.fillRect(x, y, w, h);
    for (let i = -h; i < w + h; i += 10) {
      c.fillStyle = '#c9a93b'; c.beginPath();
      c.moveTo(x + i, y); c.lineTo(x + i + 5, y); c.lineTo(x + i + 5 - h, y + h); c.lineTo(x + i - h, y + h); c.closePath(); c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x, y, w, 1.5); c.fillRect(x, y + h - 1.5, w, 1.5);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x, y + .5, w, .6);
    for (let i = 0; i < 8; i++) {
      c.fillStyle = `rgba(35,31,22,${.08 + seeded(i + u1) * .08})`;
      c.beginPath(); c.ellipse(x + seeded(i * 3.7) * w, y + seeded(i * 5.1) * h, 3 + seeded(i) * 8, 1.2, 0, 0, TAU); c.fill();
    }
    c.restore();
  }

  drawSconce(c, wall, deco) {
    const u = (deco.u1 + deco.u2) / 2, z = (deco.z1 + deco.z2) / 2;
    const x = U(u), y = -z;
    const color = deco.color || '#ffd98a';
    this.wallGlow(c, u, z - 4, 28, color, .22);
    // backplate
    const bp = c.createLinearGradient(x - 5, 0, x + 5, 0);
    bp.addColorStop(0, '#54452e'); bp.addColorStop(.45, '#c0a166'); bp.addColorStop(1, '#4a3b26');
    c.fillStyle = bp; c.fillRect(x - 4, y - 5, 8, 13);
    c.strokeStyle = 'rgba(255,235,180,.35)'; c.lineWidth = .6; c.strokeRect(x - 3.6, y - 4.6, 7.2, 12.2);
    // arm and shade
    c.strokeStyle = '#8d754b'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x, y - 2); c.lineTo(x, y - 14); c.stroke();
    const sh = c.createLinearGradient(x - 8, 0, x + 8, 0);
    sh.addColorStop(0, '#5e4728'); sh.addColorStop(.5, '#d7b87e'); sh.addColorStop(1, '#4b371e');
    c.fillStyle = sh; c.beginPath(); c.moveTo(x - 7, y - 12); c.lineTo(x + 7, y - 12); c.lineTo(x + 10, y - 20); c.lineTo(x - 10, y - 20); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - 8, y - 19.5, 16, .8);
    // bulb
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(x, y - 10, 1, x, y - 10, 12);
    g.addColorStop(0, rgba(color, .65)); g.addColorStop(.3, rgba(color, .2)); g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y - 10, 12, 0, TAU); c.fill();
    c.restore();
    c.fillStyle = '#fff4cd'; c.beginPath(); c.arc(x, y - 10, 2.2, 0, TAU); c.fill();
    this.screwHead(c, x, y + 5, 1);
  }

  drawWineRack(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 3.5, .3);
    const frame = c.createLinearGradient(x, y, x + w, y + h);
    frame.addColorStop(0, '#4c3524'); frame.addColorStop(.35, '#8d6b45'); frame.addColorStop(.7, '#5c4029'); frame.addColorStop(1, '#2f2117');
    c.fillStyle = frame; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(13,10,8,.62)'; c.fillRect(x + 2.5, y + 2.5, w - 5, h - 5);
    c.strokeStyle = 'rgba(255,220,160,.12)'; c.lineWidth = .7; c.strokeRect(x + 3, y + 3, w - 6, h - 6);
    // two shelves
    for (const lvl of [0, 1]) {
      const sy = y + h * (.52 + lvl * .27);
      c.fillStyle = shade(pal.trim, -18); c.fillRect(x + 4, sy, w - 8, 2.2);
      c.fillStyle = 'rgba(255,238,198,.2)'; c.fillRect(x + 4, sy, w - 8, .55);
      for (let i = 0; i < 4; i++) {
        const bx = x + w * (.16 + i * .22);
        const bh = 13 + (i + lvl) % 2 * 2;
        const col = ['#4e1f2c', '#30513a', '#5c3d22', '#3a2b47'][(i + lvl) % 4];
        const bg = c.createLinearGradient(bx - 3, 0, bx + 3, 0);
        bg.addColorStop(0, shade(col, -24)); bg.addColorStop(.4, shade(col, 24)); bg.addColorStop(.65, shade(col, 4)); bg.addColorStop(1, shade(col, -30));
        c.fillStyle = bg; c.beginPath(); c.roundRect(bx - 2.5, sy - bh, 5, bh - 1.5, 2); c.fill();
        c.fillStyle = '#251b12'; c.fillRect(bx - 1, sy - bh - 2.6, 2, 3);
        c.fillStyle = 'rgba(255,231,192,.52)'; c.fillRect(bx - 2.2, sy - bh + 2, 7, 3.2);
        c.fillStyle = 'rgba(60,26,24,.65)'; c.fillRect(bx - 1.5, sy - bh + 3, 6, 2.6);
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(bx - 1.2, sy - bh + 1, .7, bh - 5);
      }
    }
    // hanging glasses
    for (let i = 0; i < 4; i++) {
      const gx = x + w * (.15 + i * .22);
      c.strokeStyle = 'rgba(220,205,170,.34)'; c.lineWidth = .6;
      c.beginPath(); c.arc(gx, y + h * .16, 2.5, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(gx, y + h * .16 + 2.5); c.lineTo(gx, y + h * .24); c.stroke();
    }
    // little plaque
    this.wallText(c, wall, (u1 + u2) / 2, z1 - 5.5, 'RESERVE', '800 3.1px system-ui', 'rgba(235,205,150,.5)', 'center');
  }

  drawFireExt(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 2.5, .34);
    // wall bracket
    c.fillStyle = '#302f2a'; c.fillRect(x + w * .3, y + 3, w * .4, h - 6);
    // extinguisher body
    const bw = Math.min(w * .62, 10), bx = x + (w - bw) / 2, by = y + 7;
    const body = c.createLinearGradient(bx, 0, bx + bw, 0);
    body.addColorStop(0, '#5e1d1b'); body.addColorStop(.35, '#d3483c'); body.addColorStop(.62, '#a42d27'); body.addColorStop(1, '#4a1715');
    c.fillStyle = body; c.beginPath(); c.roundRect(bx, by, bw, h - 17, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(bx + 1, by + 2, 1, h - 23);
    c.fillStyle = '#22221f'; c.fillRect(bx + bw * .2, by - 3, bw * .6, 3.5);
    c.strokeStyle = '#2b2b27'; c.lineWidth = .8;
    c.beginPath(); c.arc(bx + bw * .5, by - 4, 2.4, Math.PI, 0); c.stroke();
    // hose
    c.strokeStyle = '#1c1b18'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(bx + bw - 1, by + 4); c.bezierCurveTo(bx + bw + 5, by + 9, bx + bw + 2, by + h * .55, bx + bw - 2, by + h * .7); c.stroke();
    // gauge + label
    c.fillStyle = '#d6c66e'; c.beginPath(); c.arc(bx + bw * .5, by + 6, 2.2, 0, TAU); c.fill();
    c.strokeStyle = '#282721'; c.lineWidth = .5; c.beginPath(); c.moveTo(bx + bw * .5, by + 6); c.lineTo(bx + bw * .5 + 1.4, by + 4.8); c.stroke();
    c.fillStyle = '#e8e4d4'; c.fillRect(bx + 1, by + 12, bw - 2, 5);
    this.wallText(c, wall, (deco.u1 + deco.u2) / 2, z2 - h * .52, 'FIRE', '900 3px system-ui', '#27241e', 'center');
    // top sign
    c.fillStyle = '#a52e26'; c.fillRect(x, y - 1, w, 7);
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = .5; c.strokeRect(x, y - 1, w, 7);
  }

  drawNoticeboard(c, wall, deco, pal) {
    const { u1, u2, z1, z2 } = deco, w = U(u2 - u1), h = z2 - z1, x = U(u1), y = -z2;
    this.wallShadow(c, x, y, w, h, 3.5, .32);
    c.fillStyle = '#4a3827'; c.fillRect(x - 2, y - 2, w + 4, h + 4);
    const cork = c.createLinearGradient(x, y, x + w, y + h);
    cork.addColorStop(0, '#ad7f4f'); cork.addColorStop(.5, '#95693f'); cork.addColorStop(1, '#79522f');
    c.fillStyle = cork; c.fillRect(x, y, w, h);
    for (let i = 0; i < 45; i++) {
      c.fillStyle = `rgba(60,37,20,${.03 + seeded(i + u1) * .06})`;
      c.fillRect(x + seeded(i * 2.7) * w, y + seeded(i * 5.1) * h, 1 + seeded(i * 3.3) * 2, .8);
    }
    // pinned papers
    const notes = [
      { x: .12, y: .14, w: .3, h: .38, col: '#e4e0cd', rot: -.08 },
      { x: .5, y: .1, w: .34, h: .3, col: '#d9d4bd', rot: .05 },
      { x: .23, y: .56, w: .3, h: .32, col: '#e8e3d1', rot: .06 },
      { x: .63, y: .56, w: .26, h: .3, col: '#cfc9b3', rot: -.04 }
    ];
    for (const n of notes) {
      c.save(); c.translate(x + w * n.x, y + h * n.y); c.rotate(n.rot);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(1.5, 2, w * n.w, h * n.h);
      c.fillStyle = n.col; c.fillRect(0, 0, w * n.w, h * n.h);
      c.fillStyle = 'rgba(72,67,56,.6)';
      for (let l = 0; l < 4; l++) c.fillRect(3, 5 + l * 4, w * n.w - 7, .7);
      c.fillStyle = '#b94739'; c.beginPath(); c.arc(w * n.w * .5, 1.5, 1.2, 0, TAU); c.fill();
      c.restore();
    }
    // red string
    c.strokeStyle = 'rgba(184,55,47,.65)'; c.lineWidth = .7;
    c.beginPath(); c.moveTo(x + w * .27, y + h * .24); c.lineTo(x + w * .64, y + h * .18); c.lineTo(x + w * .38, y + h * .66); c.stroke();
    if (deco.title) this.wallText(c, wall, (u1 + u2) / 2, z2 - 5, deco.title, '900 4.8px "Arial Black", Impact, sans-serif', 'rgba(238,232,209,.8)', 'center');
    if (deco.sub) this.wallText(c, wall, (u1 + u2) / 2, z2 - 10, deco.sub, '700 3px system-ui', 'rgba(228,222,199,.48)', 'center');
  }

  drawLabStrip(c, wall, deco) {
    const { u1, u2 } = deco, w = U(u2 - u1), x = U(u1), y = -deco.z;
    const color = deco.color || '#6fe7ff';
    const pulse = .82 + Math.sin(this.time * 2.2) * .1;
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(0, y + 6, 0, y - 18);
    g.addColorStop(0, rgba(color, .24 * pulse)); g.addColorStop(.5, rgba(color, .06)); g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g; c.fillRect(x - 4, y - 18, w + 8, 26);
    c.restore();
    c.fillStyle = '#2f3c3e'; c.fillRect(x, y, w, 3.2);
    c.fillStyle = rgba(color, .82 * pulse); c.fillRect(x + 1, y + 1, w - 2, 1.4);
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 1, y + 1, w - 2, .4);
    c.fillStyle = '#222b2c';
    for (let px = x + 10; px < x + w; px += 32) c.fillRect(px, y - .5, 2, 4);
  }

  drawDecor(p) {
    const ctx = this.ctx;
    const pal = p.palette;
    for (const deco of p.decor || []) {
      this.withWall(deco.wall, (c, wall) => {
        switch (deco.type) {
          case 'window': this.drawWindowDeco(c, wall, deco, pal); break;
          case 'poster': this.drawPosterDeco(c, wall, deco, pal); break;
          case 'shelf': this.drawShelfDeco(c, wall, deco, pal); break;
          case 'stringlights': this.drawStringLights(c, deco); break;
          case 'garagedoor': this.drawGarageDoor(c, wall, deco, pal); break;
          case 'sign': this.drawSignDeco(c, wall, deco, pal); break;
          case 'neon': this.drawNeonDeco(c, wall, deco, pal); break;
          case 'pegboard': this.drawPegboard(c, wall, deco, pal); break;
          case 'pipe': this.drawPipeDeco(c, wall, deco, pal); break;
          case 'duct': this.drawDuctDeco(c, wall, deco, pal); break;
          case 'warning': this.drawWarningDeco(c, wall, deco, pal); break;
          case 'labwindow': this.drawLabWindow(c, wall, deco, pal); break;
          case 'wirefence': this.drawWireFence(c, wall, deco, pal); break;
          case 'skyline': this.drawSkyline(c, wall, deco, pal); break;
          case 'art': this.drawArtDeco(c, wall, deco, pal); break;
          case 'picture': this.drawPictureDeco(c, wall, deco, pal); break;
          case 'clock': this.drawClockDeco(c, wall, deco, pal); break;
          case 'hangingplant': this.drawHangingPlant(c, wall, deco); break;
          case 'hazardstripe': this.drawHazardStripe(c, wall, deco); break;
          case 'sconce': this.drawSconce(c, wall, deco); break;
          case 'winerack': this.drawWineRack(c, wall, deco, pal); break;
          case 'fireext': this.drawFireExt(c, wall, deco, pal); break;
          case 'noticeboard': this.drawNoticeboard(c, wall, deco, pal); break;
          case 'labstrip': this.drawLabStrip(c, wall, deco); break;
          default: break;
        }
      });
    }
  }

  // ---------- prop primitives ----------
  box(x, y, w, d, h, z, top, front, side, stroke = 'rgba(8,12,10,.25)') {
    const ctx = this.ctx;
    const p = (pts, fill) => this.fillPoly(pts, fill);
    // front face (y + d)
    p([this.P(x, y + d, z), this.P(x + w, y + d, z), this.P(x + w, y + d, z + h), this.P(x, y + d, z + h)], front);
    // right face (x + w)
    p([this.P(x + w, y, z), this.P(x + w, y + d, z), this.P(x + w, y + d, z + h), this.P(x + w, y, z + h)], side);
    // top
    p([this.P(x, y, z + h), this.P(x + w, y, z + h), this.P(x + w, y + d, z + h), this.P(x, y + d, z + h)], top);
    ctx.strokeStyle = stroke; ctx.lineWidth = .8;
    this.polyPath([this.P(x, y, z + h), this.P(x + w, y, z + h), this.P(x + w, y + d, z + h), this.P(x, y + d, z + h)]); ctx.stroke();
  }

  roundScreen(x, y, w, h, r, fill, stroke = null) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  drawDecals(p) {
    const ctx = this.ctx;
    for (const prop of p.props) {
      if (prop.type === 'rug') {
        const x1 = prop.x, y1 = prop.y, x2 = prop.x + prop.w, y2 = prop.y + prop.d;
        this.fillPoly([this.P(x1, y1), this.P(x2, y1), this.P(x2, y2), this.P(x1, y2)], prop.hue || '#5a4033');
        const inset = .12;
        this.polyPath([this.P(x1 + inset, y1 + inset), this.P(x2 - inset, y1 + inset), this.P(x2 - inset, y2 - inset), this.P(x1 + inset, y2 - inset)]);
        ctx.strokeStyle = 'rgba(255,235,200,.22)'; ctx.lineWidth = 1.4; ctx.stroke();
        // pattern
        ctx.save(); this.polyPath([this.P(x1, y1), this.P(x2, y1), this.P(x2, y2), this.P(x1, y2)]); ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          const [sx, sy] = this.P(prop.x + .3 + i * .45, prop.y + .2);
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 40, sy + 22); ctx.stroke();
        }
        ctx.restore();
      } else if (prop.type === 'oil') {
        for (let i = 0; i < 4; i++) {
          const [sx, sy] = this.P(3 + seeded(i) * 5, 4 + seeded(i * 2) * 2.3);
          ctx.fillStyle = `rgba(8,10,9,${.08 + seeded(i) * .06})`;
          ctx.beginPath(); ctx.ellipse(sx, sy, 26 + seeded(i) * 30, 12 + seeded(i) * 12, seeded(i) * 2, 0, TAU); ctx.fill();
        }
      }
    }
  }

  drawProp(prop, p) {
    const ctx = this.ctx;
    const pal = p.palette;
    switch (prop.type) {
      case 'rug': case 'oil': case 'pizza': return;
      case 'couch': case 'sofa': this.drawCouch(prop); break;
      case 'table': this.drawTable(prop); break;
      case 'tv': this.drawTV(prop); break;
      case 'bed': this.drawBed(prop); break;
      case 'fridge': this.drawFridge(prop); break;
      case 'lamp': this.drawLamp(prop); break;
      case 'boxes': this.drawBoxes(prop); break;
      case 'car': this.drawCar(prop); break;
      case 'workbench': this.drawWorkbench(prop); break;
      case 'tires': this.drawTires(prop); break;
      case 'toolbox': this.drawToolbox(prop); break;
      case 'crate': this.drawCrate(prop); break;
      case 'barrel': case 'barrels': this.drawBarrels(prop); break;
      case 'reactor': this.drawReactor(prop); break;
      case 'labtable': this.drawLabTable(prop); break;
      case 'flasks': this.drawFlasks(prop); break;
      case 'shelf': this.drawShelf(prop); break;
      case 'server': this.drawServer(prop); break;
      case 'rack': this.drawRack(prop); break;
      case 'pallet': this.drawPallet(prop); break;
      case 'forklift': this.drawForklift(prop); break;
      case 'aquarium': this.drawAquarium(prop); break;
      case 'bar': this.drawBar(prop); break;
      case 'plant': this.drawBigPlant(prop); break;
      default: this.box(prop.x, prop.y, prop.w || .8, prop.d || .8, 20, 0, shade(pal.floorB, 20), shade(pal.floorB, 5), shade(pal.floorB, -15));
    }
  }

  drawCouch(prop) {
    const hue = prop.hue || '#4c6b58';
    const dark = shade(hue, -28), mid = shade(hue, -10), light = shade(hue, 18);
    this.box(prop.x, prop.y, prop.w, prop.d, 16, 0, light, mid, dark);
    this.box(prop.x, prop.y, prop.w, prop.d * .24, 26, 16, shade(hue, 24), shade(hue, 4), shade(hue, -18));
    this.box(prop.x, prop.y, .18, prop.d, 20, 16, light, mid, dark);
    this.box(prop.x + prop.w - .18, prop.y, .18, prop.d, 20, 16, light, mid, dark);
    const n = 3, gap = .06, cw = (prop.w - .36 - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      this.box(prop.x + .18 + i * (cw + gap), prop.y + prop.d * .18, cw, prop.d * .72, 6, 16, shade(hue, 20), shade(hue, 2), dark);
    }
    // throw pillow
    const [px, py] = this.P(prop.x + .35, prop.y + .37, 30);
    this.roundScreen(px - 7, py - 5, 14, 10, 3, '#b98a4a');
    this.roundScreen(px - 2, py - 1, 4, 1, 1, 'rgba(0,0,0,.2)');
  }

  drawTable(prop) {
    const hue = prop.hue || '#4a382a';
    this.box(prop.x, prop.y, prop.w, prop.d, 4, 18, shade(hue, 22), shade(hue, 4), shade(hue, -18));
    this.box(prop.x + .12, prop.y + .12, .12, .12, 18, 0, shade(hue, 12), shade(hue, -8), shade(hue, -26));
    this.box(prop.x + prop.w - .24, prop.y + .12, .12, .12, 18, 0, shade(hue, 12), shade(hue, -8), shade(hue, -26));
    this.box(prop.x + .12, prop.y + prop.d - .24, .12, .12, 18, 0, shade(hue, 12), shade(hue, -8), shade(hue, -26));
    this.box(prop.x + prop.w - .24, prop.y + prop.d - .24, .12, .12, 18, 0, shade(hue, 12), shade(hue, -8), shade(hue, -26));
    if (prop.pizza) {
      const [px, py] = this.P(prop.x + .55, prop.y + .45, 22.5);
      this.roundScreen(px - 11, py - 4, 22, 8, 2, '#c98f3d', '#8e5a24');
      this.roundScreen(px - 8, py - 2.5, 16, 5, 1.5, '#e2b45f');
      for (let i = 0; i < 3; i++) { this.ctx.fillStyle = '#a52f2f'; this.ctx.beginPath(); this.ctx.arc(px - 5 + i * 5, py - 1, 1.3, 0, TAU); this.ctx.fill(); }
    }
    if (prop.cup) {
      const [px, py] = this.P(prop.x + .95, prop.y + .55, 22.5);
      this.roundScreen(px - 3, py - 7, 6, 8, 1.5, '#d8d6cc');
    }
  }

  drawTV(prop) {
    const ctx = this.ctx;
    this.box(prop.x, prop.y, 1.55, .75, 20, 0, '#3b3027', '#2c241d', '#1c1712');
    this.box(prop.x + .3, prop.y + .06, .95, .18, 36, 20, '#20262a', '#171b1e', '#101315');
    const [sx, sy] = this.P(prop.x + .3, prop.y + .06, 56);
    const [ex, ey] = this.P(prop.x + 1.25, prop.y + .06, 56);
    const [ex2, ey2] = this.P(prop.x + 1.25, prop.y + .06, 23);
    const [sx2, sy2] = this.P(prop.x + .3, prop.y + .06, 23);
    ctx.save();
    const g = ctx.createLinearGradient(sx, sy, ex2, ey2);
    const flick = .5 + Math.sin(this.time * 9) * .1 + Math.sin(this.time * 2.3) * .08;
    g.addColorStop(0, `rgba(${30 + flick * 50},${90 + flick * 80},${100 + flick * 60},1)`);
    g.addColorStop(1, 'rgba(16,40,50,1)');
    this.fillPoly([[sx, sy], [ex, ey], [ex2, ey2], [sx2, sy2]], g);
    // scanlines
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = .6;
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(lerp(sx, sx2, i / 5), lerp(sy, sy2, i / 5)); ctx.lineTo(lerp(ex, ex2, i / 5), lerp(ey, ey2, i / 5)); ctx.stroke(); }
    // little silhouette
    ctx.fillStyle = 'rgba(10,30,30,.55)';
    ctx.beginPath(); ctx.ellipse((sx + ex) / 2 + 10, (sy + ey) / 2 + 18, 22, 9, .2, 0, TAU); ctx.fill();
    ctx.restore();
    // antenna
    ctx.strokeStyle = '#9aa39e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(...this.P(prop.x + .55, prop.y + .1, 56)); ctx.lineTo(...this.P(prop.x + .35, prop.y + .1, 82)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...this.P(prop.x + .55, prop.y + .1, 56)); ctx.lineTo(...this.P(prop.x + .85, prop.y + .1, 78)); ctx.stroke();
  }

  drawBed(prop) {
    const hue = prop.hue || '#3f5a67';
    this.box(prop.x, prop.y, prop.w, prop.d, 12, 0, '#3b2d22', '#2b2119', '#1e1712');
    this.box(prop.x + .08, prop.y + .08, prop.w - .16, prop.d - .16, 9, 12, '#d9d4c4', '#bcb7a9', '#8f8b80');
    // blanket
    this.box(prop.x + .08, prop.y + .55, prop.w - .16, prop.d - .63, 5, 21, shade(hue, 15), hue, shade(hue, -20));
    // pillow
    this.box(prop.x + .18, prop.y + .12, .65, .38, 7, 21, '#ece7d8', '#d6d0bf', '#b3ad9e');
    this.box(prop.x + .95, prop.y + .12, .65, .38, 7, 21, '#ece7d8', '#d6d0bf', '#b3ad9e');
  }

  drawFridge(prop) {
    this.box(prop.x, prop.y, .75, .72, 58, 0, '#a9b7ac', '#87968b', '#5e6c63');
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(40,50,45,.45)'; ctx.lineWidth = 1;
    const [ax, ay] = this.P(prop.x + .1, prop.y + .72, 47);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + .6, ay + .3); ctx.stroke();
    // handle
    const [hx, hy] = this.P(prop.x + .62, prop.y + .74, 34);
    this.roundScreen(hx - 1, hy - 10, 2, 12, 1, '#4b5650');
    // magnets
    for (let i = 0; i < 3; i++) {
      const [mx, my] = this.P(prop.x + .2 + i * .16, prop.y + .73, 26 + i * 6);
      ctx.fillStyle = ['#cf5d5d', '#d9b154', '#5d91cf'][i];
      ctx.beginPath(); ctx.arc(mx, my, 1.8, 0, TAU); ctx.fill();
    }
  }

  drawLamp(prop) {
    const ctx = this.ctx;
    const baseZ = prop.hang === false ? 0 : WALL;
    const [bx, by] = this.P(prop.x, prop.y, 0);
    const [lx, ly] = this.P(prop.x, prop.y, prop.hang === false ? 66 : 96);
    if (prop.hang !== false) {
      ctx.strokeStyle = 'rgba(30,30,25,.8)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(bx, by - WALL); ctx.lineTo(lx, ly); ctx.stroke();
    } else {
      ctx.strokeStyle = '#3a3a33'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 58); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(bx, by, 9, 4, 0, 0, TAU); ctx.fillStyle = '#2c2c27'; ctx.fill();
    }
    const color = prop.color || (this.lastProp === 'lab' ? '#8ef0ff' : '#ffd58a');
    // Cheap radial glow instead of a blurred shadow.
    const rg = ctx.createRadialGradient(lx, ly, 1, lx, ly, 46);
    rg.addColorStop(0, rgba(color, .34)); rg.addColorStop(.45, rgba(color, .12)); rg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(lx, ly, 46, 0, TAU); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (prop.hang !== false) { ctx.moveTo(lx - 12, ly - 10); ctx.lineTo(lx + 12, ly - 10); ctx.lineTo(lx + 18, ly + 4); ctx.lineTo(lx - 18, ly + 4); ctx.closePath(); }
    else { ctx.moveTo(lx - 10, ly - 7); ctx.lineTo(lx + 10, ly - 7); ctx.lineTo(lx + 14, ly + 4); ctx.lineTo(lx - 14, ly + 4); ctx.closePath(); }
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,35,25,.4)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(lx - 12, ly - 10); ctx.lineTo(lx + 12, ly - 10); ctx.stroke();
  }

  drawBoxes(prop) {
    this.box(prop.x + .1, prop.y + .1, .7, .55, 24, 0, '#b58c56', '#98703f', '#6f502c');
    this.box(prop.x + .18, prop.y + .15, .5, .4, 20, 24, '#c19760', '#a17846', '#775531');
    this.box(prop.x + .75, prop.y + .4, .55, .5, 18, 0, '#a87f4a', '#8d6638', '#63482a');
    this.ctx.strokeStyle = 'rgba(255,235,190,.25)'; this.ctx.lineWidth = 2;
    this.ctx.beginPath(); this.ctx.moveTo(...this.P(prop.x + .45, prop.y + .1, 20)); this.ctx.lineTo(...this.P(prop.x + .45, prop.y + .65, 20)); this.ctx.stroke();
  }

  drawCar(prop) {
    const ctx = this.ctx;
    const body = '#3f6f74', dark = '#244c52', light = '#5e969a';
    // shadow
    const [cx, cy] = this.P(prop.x + prop.w / 2, prop.y + prop.d / 2);
    ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, 80, 26, 0, 0, TAU); ctx.fill();
    // wheels
    for (const [wx, wy] of [[prop.x + .45, prop.y + .18], [prop.x + .45, prop.y + prop.d - .18], [prop.x + prop.w - .5, prop.y + .18], [prop.x + prop.w - .5, prop.y + prop.d - .18]]) {
      const [px, py] = this.P(wx, wy, 8);
      ctx.fillStyle = '#151616'; ctx.beginPath(); ctx.ellipse(px, py, 11, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5e6462'; ctx.beginPath(); ctx.ellipse(px, py, 4, 2.8, 0, 0, TAU); ctx.fill();
    }
    this.box(prop.x, prop.y, prop.w, prop.d, 18, 8, body, dark, '#1c3c41');
    // cabin
    this.box(prop.x + .55, prop.y + .16, prop.w - 1.3, prop.d - .3, 17, 26, light, body, dark);
    // windows
    this.box(prop.x + .65, prop.y + .21, prop.w - 1.55, .06, 10, 31, '#b5d9d7', '#8bb5b4', '#5f8a8c');
    this.box(prop.x + .65, prop.y + prop.d - .27, prop.w - 1.55, .06, 10, 31, '#b5d9d7', '#8bb5b4', '#5f8a8c');
    // roof highlight
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(...this.P(prop.x + .6, prop.y + .3, 44)); ctx.lineTo(...this.P(prop.x + prop.w - .6, prop.y + .3, 44)); ctx.stroke();
    // headlights
    for (const [hx, hy] of [[prop.x + .02, prop.y + .22], [prop.x + .02, prop.y + prop.d - .3]]) {
      const [px, py] = this.P(hx, hy, 17);
      ctx.fillStyle = '#ffe8a6'; ctx.beginPath(); ctx.arc(px, py, 2.3, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,150,.16)'; ctx.beginPath(); ctx.arc(px, py, 9, 0, TAU); ctx.fill();
    }
  }

  drawWorkbench(prop) {
    this.box(prop.x, prop.y, prop.w, prop.d, 5, 26, '#6d5c46', '#544430', '#382d20');
    this.box(prop.x, prop.y, .1, prop.d, 26, 0, '#3a342c', '#2b261f', '#1d1915');
    this.box(prop.x + prop.w - .1, prop.y, .1, prop.d, 26, 0, '#3a342c', '#2b261f', '#1d1915');
    // tools on top
    this.ctx.strokeStyle = '#aeb5b3'; this.ctx.lineWidth = 1.2;
    this.ctx.beginPath(); this.ctx.moveTo(...this.P(prop.x + .35, prop.y + .3, 32)); this.ctx.lineTo(...this.P(prop.x + .75, prop.y + .3, 32)); this.ctx.stroke();
    this.ctx.fillStyle = '#b45b3f'; this.box(prop.x + .95, prop.y + .15, .3, .25, 6, 31, '#d27652', '#a94f34', '#713421');
  }

  drawTires(prop) {
    const ctx = this.ctx;
    for (let i = 0; i < 3; i++) {
      const [px, py] = this.P(prop.x + i * .07, prop.y + i * .04, 6 + i * 12);
      ctx.fillStyle = '#1a1b1a'; ctx.beginPath(); ctx.ellipse(px, py, 17, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3c3f3c'; ctx.beginPath(); ctx.ellipse(px, py, 10, 4.3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#222422'; ctx.beginPath(); ctx.ellipse(px, py, 5, 2.2, 0, 0, TAU); ctx.fill();
    }
  }

  drawToolbox(prop) {
    this.box(prop.x, prop.y, .55, .38, 13, 0, '#b84d3e', '#94382d', '#64251d');
    this.ctx.strokeStyle = '#2e2a25'; this.ctx.lineWidth = 1;
    this.ctx.beginPath(); this.ctx.arc(...this.P(prop.x + .27, prop.y + .05, 16), 6, Math.PI, 0); this.ctx.stroke();
  }

  drawCrate(prop) {
    const w = prop.w || .8, d = prop.d || .7;
    this.box(prop.x, prop.y, w, d, 22, 0, '#87673f', '#6d5030', '#4a351f');
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(40,28,15,.5)'; ctx.lineWidth = 1.2;
    const [x1, y1] = this.P(prop.x, prop.y + d, 0), [x2, y2] = this.P(prop.x + w, prop.y + d, 22);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y2); ctx.lineTo(x2, y1); ctx.stroke();
  }

  drawBarrels(prop) {
    const many = prop.type === 'barrels';
    const items = many ? [[0, 0], [.7, .25], [.25, .65]] : [[0, 0]];
    const ctx = this.ctx;
    for (const [ox, oy] of items) {
      const [px, py] = this.P(prop.x + ox, prop.y + oy, 0);
      const h = 34, rw = 15;
      ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(px, py + 2, rw + 4, 7, 0, 0, TAU); ctx.fill();
      const g = ctx.createLinearGradient(px - rw, 0, px + rw, 0);
      g.addColorStop(0, '#3d4b45'); g.addColorStop(.4, '#6d7f72'); g.addColorStop(1, '#2b3833');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(px - rw, py - h); ctx.lineTo(px - rw, py - 2); ctx.quadraticCurveTo(px, py + 8, px + rw, py - 2); ctx.lineTo(px + rw, py - h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#83947f'; ctx.beginPath(); ctx.ellipse(px, py - h, rw, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(25,35,28,.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py - h * .65, rw, 4.5, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(px, py - h * .28, rw, 4.5, 0, 0, TAU); ctx.stroke();
      if (many) { ctx.fillStyle = 'rgba(220,210,120,.45)'; ctx.fillRect(px - 4, py - h + 1, 8, 5); }
    }
  }

  drawReactor(prop) {
    const ctx = this.ctx;
    const [px, py] = this.P(prop.x, prop.y, 0);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(px, py + 4, 34, 13, 0, 0, TAU); ctx.fill();
    // legs
    for (const off of [-24, 24]) { ctx.strokeStyle = '#4a5a5e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + off, py); ctx.lineTo(px + off * .7, py - 26); ctx.stroke(); }
    // tank
    const g = ctx.createLinearGradient(px - 26, 0, px + 26, 0);
    g.addColorStop(0, '#485b5f'); g.addColorStop(.35, '#9db4b2'); g.addColorStop(.7, '#5b7073'); g.addColorStop(1, '#2e3d40');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(px - 26, py - 112, 52, 88, 16); ctx.fill();
    ctx.fillStyle = '#263235'; ctx.beginPath(); ctx.ellipse(px, py - 112, 26, 7, 0, 0, TAU); ctx.fill();
    // window
    const wg = ctx.createLinearGradient(px, py - 95, px, py - 45);
    wg.addColorStop(0, '#b8fbff'); wg.addColorStop(.4, '#39cfea'); wg.addColorStop(1, '#0c6f92');
    const wgl = ctx.createRadialGradient(px, py - 72, 2, px, py - 72, 46);
    wgl.addColorStop(0, 'rgba(99,232,255,.35)'); wgl.addColorStop(1, 'rgba(99,232,255,0)');
    ctx.fillStyle = wgl; ctx.beginPath(); ctx.arc(px, py - 72, 46, 0, TAU); ctx.fill();
    ctx.fillStyle = wg; ctx.beginPath(); ctx.roundRect(px - 15, py - 96, 30, 48, 10); ctx.fill();
    // bubbles
    for (let i = 0; i < 6; i++) {
      const yy = py - 52 - ((this.time * 16 + i * 9) % 40);
      ctx.fillStyle = 'rgba(230,255,255,.7)';
      ctx.beginPath(); ctx.arc(px - 8 + Math.sin(this.time + i) * 6, yy, 1.4 + i % 3, 0, TAU); ctx.fill();
    }
    // pipes
    ctx.strokeStyle = '#6d7f80'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px + 26, py - 96); ctx.lineTo(px + 40, py - 96); ctx.lineTo(px + 40, py - 42); ctx.stroke();
    ctx.strokeStyle = '#a8bcb9'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 28, py - 98); ctx.lineTo(px + 38, py - 98); ctx.stroke();
    // gauge
    ctx.fillStyle = '#c9d8cf'; ctx.beginPath(); ctx.arc(px - 30, py - 72, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#32403d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - 30, py - 72); ctx.lineTo(px - 26, py - 77); ctx.stroke();
    ctx.fillStyle = '#3b4946'; ctx.fillRect(px - 36, py - 64, 12, 3);
  }

  drawLabTable(prop) {
    this.box(prop.x, prop.y, prop.w, prop.d, 5, 28, '#8fa7a5', '#6f8786', '#4a5f5f');
    for (const [lx, ly] of [[.12, .12], [prop.w - .2, .12], [.12, prop.d - .2], [prop.w - .2, prop.d - .2]]) {
      this.box(prop.x + lx, prop.y + ly, .08, .08, 28, 0, '#7b8e8c', '#5e7271', '#3e4f4f');
    }
    // sink
    const [sx, sy] = this.P(prop.x + .3, prop.y + .3, 34);
    this.roundScreen(sx - 9, sy - 4, 18, 8, 3, '#536765');
  }

  drawFlasks(prop) {
    const ctx = this.ctx;
    const colors = ['#65e4ff', '#c084fc', '#8fff9a'];
    for (let i = 0; i < 3; i++) {
      const [px, py] = this.P(prop.x + i * .35, prop.y + .05, 33);
      ctx.fillStyle = 'rgba(200,230,230,.18)';
      ctx.beginPath(); ctx.moveTo(px - 5, py - 14); ctx.lineTo(px + 5, py - 14); ctx.lineTo(px + 8, py); ctx.lineTo(px - 8, py); ctx.closePath(); ctx.fill();
      ctx.fillStyle = colors[i];
      ctx.beginPath(); ctx.moveTo(px - 6, py - 4); ctx.lineTo(px + 6, py - 4); ctx.lineTo(px + 7.5, py); ctx.lineTo(px - 7.5, py); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(230,255,255,.5)'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(px - 5, py - 14); ctx.lineTo(px + 5, py - 14); ctx.stroke();
      if (i === 0) {
        for (let b = 0; b < 3; b++) { ctx.fillStyle = 'rgba(220,255,255,.75)'; ctx.beginPath(); ctx.arc(px - 1 + Math.sin(this.time * 2 + b) * 2, py - 6 - (b * 3 + (this.time * 8) % 8), 1, 0, TAU); ctx.fill(); }
      }
    }
  }

  drawShelf(prop) {
    const ctx = this.ctx;
    const w = prop.w || 1.8, d = prop.d || .55;
    this.box(prop.x, prop.y, .06, d, 66, 0, '#5d6b66', '#46544f', '#2f3a36');
    this.box(prop.x + w - .06, prop.y, .06, d, 66, 0, '#5d6b66', '#46544f', '#2f3a36');
    for (let lvl = 0; lvl < 3; lvl++) {
      const z = 12 + lvl * 20;
      this.box(prop.x, prop.y, w, d, 2.5, z, '#84968d', '#65776f', '#45534d');
      for (let i = 0; i < 4; i++) {
        const [px, py] = this.P(prop.x + .25 + i * .35, prop.y + .2, z + 2.5);
        const col = ['#79a76e', '#c7a252', '#5b8d9c', '#a36b6b'][(i + lvl) % 4];
        ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(px - 3, py - 11, 6, 11, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(px - 1.5, py - 9, 1.4, 7);
      }
    }
  }

  drawServer(prop) {
    const ctx = this.ctx;
    this.box(prop.x, prop.y, .62, .7, 74, 0, '#333c40', '#232b2e', '#141a1c');
    for (let i = 0; i < 7; i++) {
      const [px, py] = this.P(prop.x + .12, prop.y + .72, 10 + i * 8);
      ctx.fillStyle = seeded(i + Math.floor(this.time * 3) * .2) > .4 ? '#65f0b4' : '#2c6b53';
      ctx.fillRect(px, py, 2.4, 1.6);
      ctx.fillStyle = 'rgba(140,190,180,.3)'; ctx.fillRect(px + 6, py, 14, .8);
    }
  }

  drawRack(prop) {
    const ctx = this.ctx;
    const w = prop.w || 2.3;
    this.box(prop.x, prop.y, .08, prop.d || .65, 90, 0, '#5f6160', '#464847', '#2e3030');
    this.box(prop.x + w - .08, prop.y, .08, prop.d || .65, 90, 0, '#5f6160', '#464847', '#2e3030');
    for (let lvl = 0; lvl < 3; lvl++) {
      const z = 8 + lvl * 30;
      this.box(prop.x, prop.y, w, prop.d || .65, 3, z, '#7a7b76', '#5c5d58', '#3d3e3a');
      for (let i = 0; i < 3; i++) {
        const bw = .5 + seeded(i + lvl) * .15;
        this.box(prop.x + .16 + i * .65, prop.y + .1, bw, .42, 16, z + 3, '#b18b55', '#94703f', '#6b502b');
      }
    }
  }

  drawPallet(prop) {
    const w = prop.w || 1.1, d = prop.d || .9;
    for (let i = 0; i < 3; i++) this.box(prop.x, prop.y + i * (d / 3), w, .12, 3, 0, '#8d7049', '#715737', '#4e3b23');
    if (prop.loaded !== false) {
      this.box(prop.x + .08, prop.y + .06, w - .16, d - .12, 12, 3, '#a9804c', '#8a6437', '#644726');
      this.box(prop.x + .15, prop.y + .12, w - .3, d - .24, 10, 15, '#b78e59', '#96703f', '#6c4f2b');
      this.ctx.strokeStyle = 'rgba(245,225,180,.25)'; this.ctx.lineWidth = 1.5;
      this.ctx.beginPath(); this.ctx.moveTo(...this.P(prop.x + w / 2, prop.y + .06, 15)); this.ctx.lineTo(...this.P(prop.x + w / 2, prop.y + d - .06, 15)); this.ctx.stroke();
    }
  }

  drawForklift(prop) {
    const ctx = this.ctx;
    const [px, py] = this.P(prop.x, prop.y, 0);
    // wheels
    for (const off of [[-18, 2], [14, 2], [-18, 12], [14, 12]]) {
      ctx.fillStyle = '#141515'; ctx.beginPath(); ctx.ellipse(px + off[0] + 12, py + off[1] - 2, 8, 4.5, 0, 0, TAU); ctx.fill();
    }
    this.box(prop.x, prop.y, 1.15, .78, 26, 5, '#d7a53c', '#b4842a', '#7d5a1c');
    this.box(prop.x + .22, prop.y + .15, .55, .42, 16, 31, '#c79532', '#9f7424', '#6c4e19');
    // mast
    this.box(prop.x + 1.13, prop.y + .1, .1, .1, 76, 5, '#4a4c4c', '#363838', '#222424');
    this.box(prop.x + 1.03, prop.y + .1, .08, .8, 4, 40, '#686b6a', '#4c4f4f', '#2f3131');
    // forks
    this.box(prop.x + .65, prop.y + .22, .7, .08, 2, 6, '#767978', '#5a5d5c', '#3a3c3c');
    this.box(prop.x + .65, prop.y + .52, .7, .08, 2, 6, '#767978', '#5a5d5c', '#3a3c3c');
  }

  drawAquarium(prop) {
    const ctx = this.ctx;
    this.box(prop.x, prop.y, 1.25, .65, 20, 0, '#2b231f', '#211b18', '#15110f');
    const [px, py] = this.P(prop.x + .62, prop.y + .32, 20);
    const agl = ctx.createRadialGradient(px, py - 20, 2, px, py - 20, 52);
    agl.addColorStop(0, 'rgba(90,220,255,.28)'); agl.addColorStop(1, 'rgba(90,220,255,0)');
    ctx.fillStyle = agl; ctx.beginPath(); ctx.arc(px, py - 20, 52, 0, TAU); ctx.fill();
    const g = ctx.createLinearGradient(px - 36, py, px + 36, py - 38);
    g.addColorStop(0, 'rgba(30,140,170,.8)'); g.addColorStop(1, 'rgba(70,230,235,.55)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(px - 34, py - 40, 68, 38, 5); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const fx = px - 18 + i * 15 + Math.sin(this.time * .9 + i * 2) * 8;
      const fy = py - 20 + Math.cos(this.time * .7 + i) * 6;
      ctx.fillStyle = ['#ffd166', '#ff9f6e', '#9dffd7'][i];
      ctx.beginPath(); ctx.ellipse(fx, fy, 4.5, 2.2, .2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx + 4, fy); ctx.lineTo(fx + 7, fy - 2); ctx.lineTo(fx + 7, fy + 2); ctx.fill();
    }
    // seaweed
    ctx.strokeStyle = 'rgba(80,210,150,.7)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(px - 25 + i * 8, py - 2); ctx.quadraticCurveTo(px - 27 + i * 8 + Math.sin(this.time + i) * 5, py - 18, px - 25 + i * 8, py - 30); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(220,245,245,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px - 34, py - 40, 68, 38, 5); ctx.stroke();
  }

  drawBar(prop) {
    const ctx = this.ctx;
    this.box(prop.x, prop.y, 1.6, .7, 30, 0, '#3a2f2a', '#2b221e', '#191411');
    this.box(prop.x, prop.y, 1.6, .12, 34, 30, '#6b4f3c', '#563e2f', '#39291f');
    for (let i = 0; i < 5; i++) {
      const [bx, by] = this.P(prop.x + .18 + i * .25, prop.y + .2, 36);
      ctx.fillStyle = ['#79a76e', '#c9a75b', '#9f7290', '#5f8f9e', '#c68d3d'][i];
      ctx.beginPath(); ctx.roundRect(bx - 2, by - 14, 4.5, 14, 1.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(bx - .8, by - 12, 1, 9);
    }
  }

  drawBigPlant(prop) {
    const ctx = this.ctx;
    const [px, py] = this.P(prop.x, prop.y, 0);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(px, py + 2, 22, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#45403a'; ctx.beginPath(); ctx.moveTo(px - 13, py - 24); ctx.lineTo(px + 13, py - 24); ctx.lineTo(px + 9, py); ctx.lineTo(px - 9, py); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d3b48f'; ctx.beginPath(); ctx.ellipse(px, py - 24, 13, 4, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const ang = -Math.PI / 2 + (i - 3) * .38 + Math.sin(this.time * .7 + i) * .04;
      const len = 34 + (i % 3) * 9;
      const ex = px + Math.cos(ang) * len, ey = py - 30 + Math.sin(ang) * len;
      ctx.strokeStyle = '#3f6a44'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(px, py - 28); ctx.quadraticCurveTo(px + Math.cos(ang) * len * .5, py - 34 + Math.sin(ang) * len * .7, ex, ey); ctx.stroke();
      ctx.fillStyle = i % 2 ? '#4f8a58' : '#3d7247';
      ctx.beginPath(); ctx.ellipse(ex, ey, 10, 5.5, ang, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(180,230,170,.25)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(ex, ey, 7, 3.5, ang, 0, TAU); ctx.stroke();
    }
  }

  drawCounter(cx, cy, p) {
    const ctx = this.ctx;
    const pal = p.palette;
    const x = cx - 1.0, y = cy - .42, w = 2.0, d = .84;
    this.box(x, y, w, d, 32, 0, shade(pal.floorB, 25), shade(pal.floorB, -5), shade(pal.floorB, -28));
    this.box(x - .05, y - .05, w + .1, d + .1, 3, 32, shade(pal.trim, 18), shade(pal.trim, 0), shade(pal.trim, -28));
    // register
    this.box(cx + .15, y + .1, .45, .35, 12, 35, '#4b5a58', '#364440', '#222c2a');
    const [rx, ry] = this.P(cx + .37, y + .28, 48);
    ctx.fillStyle = 'rgba(150,240,200,.7)'; ctx.fillRect(rx - 5, ry - 4, 10, 4);
    // scale
    const [sx, sy] = this.P(cx - .45, y + .35, 35);
    this.roundScreen(sx - 8, sy - 2, 16, 3, 1.5, '#8c9894');
    ctx.fillStyle = '#5e6a66'; ctx.fillRect(sx - 3, sy - 5, 6, 3);
    // cash jar
    const [jx, jy] = this.P(cx - .85, y + .55, 35);
    ctx.fillStyle = 'rgba(200,230,220,.25)'; ctx.beginPath(); ctx.roundRect(jx - 6, jy - 12, 12, 13, 3); ctx.fill();
    ctx.fillStyle = '#7ddc8a'; ctx.fillRect(jx - 4, jy - 4, 8, 4);
    ctx.strokeStyle = 'rgba(220,255,235,.4)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.roundRect(jx - 6, jy - 12, 12, 13, 3); ctx.stroke();
    // little bags
    for (let i = 0; i < 2; i++) {
      const [bx, by] = this.P(cx + .7 + i * .12, y + .2 + i * .12, 36);
      ctx.fillStyle = 'rgba(120,240,160,.5)'; ctx.beginPath(); ctx.roundRect(bx - 3, by - 6, 6, 7, 2); ctx.fill();
    }
    // sign hanging
    const [nx, ny] = this.P(cx, y + .05, 64);
    ctx.save(); ctx.fillStyle = pal.accent;
    ctx.font = '800 7px "Arial Black", Impact, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('COUNTER', nx, ny); ctx.restore();
    this.hotspots.push({ x: this.toScreen(cx, cy, 30).x, y: this.toScreen(cx, cy, 30).y, r: 46 * this.zoom + 12, kind: 'counter', id: 'counter' });
  }

  drawSlot(x, y, slot, index, p) {
    const ctx = this.ctx;
    const pal = p.palette;
    const [px, py] = this.P(x, y, 0);
    const key = this.slotKey(p.id, index);
    // A queued crew job can briefly lead the simulation: keep the old ripe
    // plant on screen until Bea cuts it, and keep a new seed hidden until Eli
    // has actually worked the pot.
    const ghost = this.trimGhosts.get(key);
    const visual = ghost || (this.hiddenPlants.has(key) ? null : slot);
    const strain = visual ? STRAIN_BY_ID[visual.strain] : null;
    // tray
    ctx.fillStyle = 'rgba(20,24,20,.34)';
    ctx.beginPath(); ctx.ellipse(px, py + 2, 36, 15, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(40,50,40,.55)';
    ctx.beginPath(); ctx.ellipse(px, py, 31, 12.5, 0, 0, TAU); ctx.fill();
    // pot
    const potH = 30;
    const grad = ctx.createLinearGradient(px - 24, 0, px + 24, 0);
    const potCol = p.id === 'lab' ? '#8f9c97' : p.id === 'empire' ? '#b39a6b' : '#b26d45';
    grad.addColorStop(0, shade(potCol, -25)); grad.addColorStop(.4, shade(potCol, 20)); grad.addColorStop(1, shade(potCol, -35));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px - 23, py - potH); ctx.lineTo(px + 23, py - potH); ctx.lineTo(px + 17, py - 2); ctx.quadraticCurveTo(px, py + 6, px - 17, py - 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(potCol, 18);
    ctx.beginPath(); ctx.ellipse(px, py - potH, 23, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2c231a';
    ctx.beginPath(); ctx.ellipse(px, py - potH + 1, 19, 5, 0, 0, TAU); ctx.fill();
    // small tag
    if (strain) {
      ctx.save(); ctx.translate(px + 16, py - 16); ctx.rotate(.2);
      ctx.fillStyle = strain.color; ctx.fillRect(0, 0, 9, 5);
      ctx.restore();
    }
    if (!visual) {
      // Keep the add control tucked just above the pot rim instead of floating high above it.
      const bob = Math.sin(this.time * 2.4 + index) * 2;
      const addY = py - potH - 12 + bob;
      ctx.save();
      ctx.strokeStyle = 'rgba(180,255,190,.28)'; ctx.lineWidth = 1.3; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.ellipse(px, addY + 8, 20, 9, 0, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.save();
      ctx.fillStyle = 'rgba(20,40,26,.85)'; ctx.strokeStyle = 'rgba(160,255,175,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(px - 10, addY - 10, 20, 20, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b6ff9e'; ctx.font = '700 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+', px, addY + 4.5);
      ctx.restore();
    } else {
      this.drawPlant(px, py - potH, visual, strain, p, index);
      // progress arc
      if (visual.progress < 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(px, py, 35, 14, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        ctx.strokeStyle = strain.color;
        ctx.beginPath(); ctx.ellipse(px, py, 35, 14, 0, Math.PI * 1.08, Math.PI * 1.08 + Math.PI * .84 * visual.progress); ctx.stroke();
        ctx.restore();
      }
    }
    const hot = this.toScreen(x, y, visual ? 32 : potH + 12);
    this.hotspots.push({ x: hot.x, y: hot.y, r: 34 * this.zoom + 10, kind: 'slot', propId: p.id, index, id: `slot:${p.id}:${index}` });
  }

  drawPlant(px, py, slot, strain, p, index) {
    const ctx = this.ctx;
    if (!strain) return;
    const prog = slot.progress;
    const sway = Math.sin(this.time * 1.3 + index * 1.7) * .035;
    const scale = .55 + prog * .55;
    const stemH = 26 + prog * 40;
    ctx.save();
    ctx.translate(px, py - 2);
    // stem
    const topX = Math.sin(sway * 4) * 7, topY = -stemH;
    ctx.strokeStyle = '#3f6e3f'; ctx.lineWidth = 2.1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -stemH * .55, topX, topY); ctx.stroke();
    const nodes = prog < .35 ? 1 : prog < .7 ? 3 : 4;
    for (let n = 0; n < nodes; n++) {
      const t = (n + 1) / (nodes + .4);
      const nx = topX * t * .7, ny = topY * t;
      const dir = n % 2 ? 1 : -1;
      const leafLen = (12 + prog * 12) * (1 - t * .25);
      const ang = dir * (.7 + t * .2) + sway;
      // stem branch
      ctx.strokeStyle = '#4b7c48'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(nx, ny); ctx.quadraticCurveTo(nx + dir * leafLen * .5, ny - 4, nx + dir * leafLen, ny - 2); ctx.stroke();
      // fan leaf shape
      ctx.save(); ctx.translate(nx + dir * leafLen, ny - 2); ctx.rotate(ang);
      ctx.fillStyle = n % 2 ? '#4f8a4a' : '#3f7340';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-6, -7, -15, -4, -18, 0);
      ctx.bezierCurveTo(-13, 5, -5, 6, 0, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,240,160,.25)'; ctx.lineWidth = .6;
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-15, k * 2.4); ctx.stroke(); }
      ctx.restore();
    }
    // buds
    if (prog > .62) {
      const density = prog > .95 ? 11 : 5 + Math.round(prog * 4);
      const budR = (3.2 + prog * 4.8) * (1 + (slot.tendQ || 0) * .015);
      const cols = [strain.color, shade(strain.color, -22), strain.accent];
      for (let b = 0; b < density; b++) {
        const t = .45 + seeded(b + index * 7.3) * .55;
        const bx = topX * t + (seeded(b * 3.1 + index) - .5) * 24 * prog;
        const by = topY * t + (seeded(b * 5.7 + index) - .5) * 13 * prog;
        const r = budR * (.7 + seeded(b * 8.1) * .55);
        ctx.fillStyle = cols[b % 3];
        ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        ctx.beginPath(); ctx.arc(bx - r * .25, by - r * .25, r * .35, 0, TAU); ctx.fill();
        if (prog > .9) {
          ctx.fillStyle = 'rgba(230,255,255,.6)';
          for (let s = 0; s < 2; s++) { ctx.beginPath(); ctx.arc(bx + (seeded(b + s) - .5) * r * 1.4, by + (seeded(b + s * 2) - .5) * r, .7, 0, TAU); ctx.fill(); }
        }
      }
      if (prog >= 1) {
        const glow = ctx.createRadialGradient(0, topY * .8, 2, 0, topY * .8, 32 * scale);
        glow.addColorStop(0, rgba(strain.color, .32)); glow.addColorStop(1, rgba(strain.color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, topY * .8, 32 * scale, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }
  // ---------- people ----------
  drawPerson(x, y, opt) {
    const ctx = this.ctx;
    const [px, py] = this.P(x, y, 0);
    const t = this.time;
    const phase = opt.phase || 0;
    const walk = opt.walk || 0;
    const workT = opt.workT || 0;
    const workWave = Math.sin(workT * 9 + phase);
    let bob = Math.sin(t * 2.4 + phase) * 1.1 + (walk > .01 ? Math.abs(Math.sin(walk)) * -1.5 : 0);
    if (opt.workPose === 'plant') bob += 3.2 + workWave * .7;
    else if (opt.workPose === 'water') bob += .8 + workWave * .4;
    const swing = Math.sin(walk) * 5;
    const skin = opt.skin || '#c58c63';
    const shirt = opt.shirt || '#4f6f5e';
    const pants = opt.pants || '#2e3538';
    const hair = opt.hair || '#251d19';
    const scale = opt.scale || 1;
    const flip = opt.flip || 1;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale * flip, scale);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath(); ctx.ellipse(0, 2, 15, 5.5, 0, 0, TAU); ctx.fill();
    // legs
    ctx.strokeStyle = pants; ctx.lineWidth = 6.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(-4 - swing * .5, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(4 + swing * .5, -3); ctx.stroke();
    ctx.strokeStyle = '#191a1a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-4 - swing * .5, -3); ctx.lineTo(-6 - swing * .5, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4 + swing * .5, -3); ctx.lineTo(6 + swing * .5, -1); ctx.stroke();
    // arms — the working hand reaches for the pot while the pose loops
    ctx.strokeStyle = shirt; ctx.lineWidth = 5.5;
    const armSwing = walk > .01 ? -swing * .6 : Math.sin(t * 1.6 + phase) * 1.4;
    let leftHandX = -13, leftHandY = -27 + bob + armSwing;
    let rightHandX = 13, rightHandY = -27 + bob - armSwing;
    if (opt.workPose === 'water') { rightHandX = 14.5 + workWave * .7; rightHandY = -23 + bob + workWave * .8; }
    else if (opt.workPose === 'trim') { rightHandX = 14 + workWave * .9; rightHandY = -28 + bob + workWave * .35; }
    else if (opt.workPose === 'plant') { rightHandX = 12 + workWave * .7; rightHandY = -17 + bob; leftHandX = -8 + workWave * .4; leftHandY = -23 + bob; }
    else if (opt.workPose === 'inspect') { rightHandX = 8 + workWave * .5; rightHandY = -45 + bob; }
    if (opt.serving) { rightHandX = 11; rightHandY = -36 + bob; }
    if (opt.crossed) {
      ctx.beginPath(); ctx.moveTo(-9, -42 + bob); ctx.lineTo(6, -31 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(9, -42 + bob); ctx.lineTo(-6, -31 + bob); ctx.stroke();
      leftHandX = -6; leftHandY = -31 + bob;
      rightHandX = 6; rightHandY = -31 + bob;
    } else {
      ctx.beginPath(); ctx.moveTo(-9, -42 + bob); ctx.lineTo(leftHandX, leftHandY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(9, -42 + bob); ctx.lineTo(rightHandX, rightHandY); ctx.stroke();
    }
    // hands
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(leftHandX, leftHandY + 1, 2.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(rightHandX, rightHandY + 1, 2.6, 0, TAU); ctx.fill();
    // torso
    ctx.save();
    ctx.translate(0, -35 + bob);
    const tg = ctx.createLinearGradient(-11, -12, 11, 12);
    tg.addColorStop(0, shade(shirt, 16)); tg.addColorStop(1, shade(shirt, -16));
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.roundRect(-10, -12, 20, 25, 7); ctx.fill();
    if (opt.apron) { ctx.fillStyle = 'rgba(240,235,220,.85)'; ctx.beginPath(); ctx.roundRect(-7, -6, 14, 19, 3); ctx.fill(); }
    if (opt.chain) { ctx.strokeStyle = '#e1bf6d'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, -8, 5, .15, Math.PI - .15); ctx.stroke(); }
    ctx.restore();
    if (opt.crossed) {
      // Folded forearms sit over the shirt so the muscle's stance reads clearly.
      ctx.strokeStyle = shade(shirt, 10); ctx.lineWidth = 5.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-10, -40 + bob); ctx.quadraticCurveTo(-2, -29 + bob, 9, -35 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -40 + bob); ctx.quadraticCurveTo(2, -29 + bob, -9, -35 + bob); ctx.stroke();
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(9, -35 + bob, 2.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(-9, -35 + bob, 2.6, 0, TAU); ctx.fill();
    }
    // neck
    ctx.fillStyle = skin; ctx.fillRect(-2.5, -47 + bob, 5, 5);
    // head
    const hy = -58 + bob;
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, hy, 10, 0, TAU); ctx.fill();
    // ears
    ctx.beginPath(); ctx.arc(-9.5, hy + 1, 2, 0, TAU); ctx.arc(9.5, hy + 1, 2, 0, TAU); ctx.fill();
    // hair
    ctx.fillStyle = hair;
    if (opt.style === 'bald') {
      ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(0, hy - 1, 9.4, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.globalAlpha = 1;
    } else if (opt.style === 'curly') {
      for (let i = 0; i < 5; i++) ctx.beginPath(), ctx.arc(-7 + i * 3.6, hy - 7 + Math.sin(i) * 1.4, 3.8, 0, TAU), ctx.fill();
    } else if (opt.style === 'slick') {
      ctx.beginPath(); ctx.moveTo(-10, hy - 5); ctx.quadraticCurveTo(-2, hy - 14, 9, hy - 7); ctx.quadraticCurveTo(11, hy - 4, 8, hy - 4); ctx.quadraticCurveTo(0, hy - 9, -9, hy - 2); ctx.fill();
    } else if (opt.style === 'bob') {
      ctx.beginPath(); ctx.arc(0, hy - 1, 11.2, Math.PI, TAU); ctx.fill();
      ctx.fillRect(-11, hy - 1, 3, 10); ctx.fillRect(8, hy - 1, 3, 10);
    } else if (opt.style === 'locs') {
      ctx.beginPath(); ctx.arc(0, hy - 3, 10.5, Math.PI, TAU); ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.strokeStyle = hair; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9 + i * 4.5, hy - 7); ctx.quadraticCurveTo(-11 + i * 5, hy + 2, -10 + i * 4.5, hy + 7); ctx.stroke(); }
    } else if (opt.style === 'wild') {
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-8 + i * 2.7, hy - 9 + Math.sin(i * 2.2) * 2.5, 2.8, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.arc(0, hy - 4, 9.6, Math.PI, TAU); ctx.fill();
    } else if (opt.style === 'messy') {
      ctx.beginPath(); ctx.arc(0, hy - 3, 10, Math.PI, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-9, hy - 5); ctx.lineTo(-11, hy - 10); ctx.lineTo(-5, hy - 7); ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, hy - 2.5, 10.2, Math.PI, TAU); ctx.fill();
    }
    if (opt.bandana) { ctx.fillStyle = opt.bandana; ctx.beginPath(); ctx.roundRect(-9.5, hy - 8, 19, 4, 2); ctx.fill(); }
    if (opt.beard) { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, hy + 4, 7.5, .2, Math.PI - .2); ctx.fill(); }
    // face
    const eyeY = hy - 1;
    ctx.fillStyle = '#201b18';
    ctx.beginPath(); ctx.arc(-3.2, eyeY, 1.05, 0, TAU); ctx.arc(3.2, eyeY, 1.05, 0, TAU); ctx.fill();
    if (opt.glasses) {
      ctx.strokeStyle = 'rgba(230,240,235,.6)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.arc(-3.2, eyeY, 2.8, 0, TAU); ctx.arc(3.2, eyeY, 2.8, 0, TAU); ctx.moveTo(-.4, eyeY); ctx.lineTo(.4, eyeY); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(60,35,30,.7)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.arc(0, hy + 4.5, 3.2, .15, Math.PI - .15); ctx.stroke();
    if (opt.lips) { ctx.fillStyle = '#b4485d'; ctx.beginPath(); ctx.roundRect(-2.5, hy + 4, 5, 1.8, 1); ctx.fill(); }
    if (opt.tattoo) { ctx.strokeStyle = 'rgba(40,65,60,.6)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(-9, -40); ctx.lineTo(-11, -34); ctx.lineTo(-8, -32); ctx.stroke(); }
    // held tools make each crew member readable at a glance
    if (opt.held) {
      ctx.save();
      ctx.translate(rightHandX, rightHandY + 1);
      if (opt.workPose === 'water') ctx.rotate(.58 + workWave * .16);
      else if (opt.workPose === 'trim') ctx.rotate(workWave * .24);
      else if (opt.workPose === 'plant') ctx.rotate(.55 + workWave * .12);
      else if (opt.workPose === 'inspect') ctx.rotate(-.24);
      if (opt.held === 'can') {
        ctx.fillStyle = '#8fa7a1';
        ctx.beginPath(); ctx.roundRect(-4, -4, 9, 9, 2); ctx.fill();
        ctx.strokeStyle = '#c4d8d2'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(5, -2); ctx.lineTo(12, -7); ctx.stroke();
        ctx.beginPath(); ctx.arc(-.5, -6, 3.8, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
        ctx.fillStyle = 'rgba(146,234,255,.9)';
        ctx.beginPath(); ctx.arc(12, -8, 1.5, 0, TAU); ctx.fill();
        if (opt.workPose === 'water') {
          ctx.fillStyle = 'rgba(150,235,255,.55)';
          for (let i = 0; i < 3; i++) {
            const fall = ((workT * 26 + i * 3.6) % 10);
            ctx.beginPath(); ctx.arc(13.5, -8 + fall, 1 + i * .25, 0, TAU); ctx.fill();
          }
        }
      } else if (opt.held === 'pot') {
        ctx.fillStyle = '#b06a46';
        ctx.beginPath(); ctx.roundRect(-4, -2, 8, 6, 1.5); ctx.fill();
        ctx.fillStyle = '#d18a60'; ctx.fillRect(-4.6, -2.8, 9.2, 1.8);
        ctx.strokeStyle = '#6fcf72'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -2.8); ctx.lineTo(0, -7); ctx.stroke();
        ctx.fillStyle = '#7bdc85';
        ctx.beginPath(); ctx.ellipse(-2, -7, 3, 1.6, -.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(2.2, -6.2, 2.6, 1.5, .4, 0, TAU); ctx.fill();
        if (opt.workPose === 'plant') {
          ctx.fillStyle = '#e6d39b';
          for (let i = 0; i < 3; i++) {
            const fall = (workT * 34 + i * 3) % 7;
            ctx.beginPath(); ctx.arc(2 + i * 1.5, 2 + fall, .9, 0, TAU); ctx.fill();
          }
        }
      } else if (opt.held === 'shears') {
        ctx.strokeStyle = '#cfd8d8'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(5, -7); ctx.moveTo(-6, -7); ctx.lineTo(5, -1); ctx.stroke();
        ctx.strokeStyle = '#c05a3c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(-4, 2); ctx.moveTo(-6, -7); ctx.lineTo(-4, -10); ctx.stroke();
      } else if (opt.held === 'tray') {
        ctx.fillStyle = '#3c3a38';
        ctx.beginPath(); ctx.roundRect(-5, -2, 11, 5, 1.5); ctx.fill();
        ctx.fillStyle = '#6fcf72';
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-3 + i * 3.4, -3.4, 1.4, 0, TAU); ctx.fill(); }
      } else if (opt.held === 'flask') {
        ctx.strokeStyle = 'rgba(200,240,255,.85)'; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-2, -7); ctx.lineTo(3, -7); ctx.lineTo(3, -2); ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(110,231,255,.75)';
        ctx.beginPath(); ctx.moveTo(-2.6, -2); ctx.lineTo(3.6, -2); ctx.lineTo(3.6, -4.5); ctx.lineTo(-2.6, -4.5); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  staffSpots(p) {
    const slots = p.slots;
    const avgX = slots.reduce((n, s) => n + s[0], 0) / slots.length;
    const maxX = Math.max(...slots.map(s => s[0]));
    const maxY = Math.max(...slots.map(s => s[1]));
    // Defaults keep every crew member in the walkable aisles beside the pots,
    // the counter and the door. Per-room overrides clear the larger props.
    const spots = {
      bea: [maxX + .8, maxY + .75],
      tito: [p.counter[0] + 1.75, p.counter[1] + .05],
      priya: [avgX + .8, maxY + 1.3],
      bruno: [p.door[0] - 1.35, p.door[1] - 1.1],
      mara: [slots[0][0] - .55, maxY + 1.35],
      eli: [maxX + 1.9, maxY + 1.55]
    };
    const overrides = {
      apartment: {
        bea: [4.75, 2.05], tito: [7.6, 4.7], priya: [5.2, 3.35],
        bruno: [7.0, 5.25], mara: [2.0, 2.2], eli: [6.7, 3.0]
      },
      garage: {
        bea: [5.1, 3.6], tito: [7.75, 4.9], priya: [2.4, 3.9],
        bruno: [7.0, 5.25], mara: [1.15, 3.6], eli: [3.8, 4.4]
      },
      lab: {
        bea: [4.65, 4.1], tito: [9.1, 5.55], priya: [5.95, 4.2],
        bruno: [8.05, 6.35], mara: [1.2, 3.8], eli: [2.6, 3.9]
      },
      warehouse: {
        bea: [4.65, 4.9], tito: [9.2, 5.4], priya: [3.08, 5.6],
        bruno: [9.1, 6.35], mara: [1.25, 5.1], eli: [5.2, 5.4]
      },
      empire: {
        bea: [6.15, 4.55], tito: [9.9, 5.3], priya: [2.7, 4.65],
        bruno: [9.0, 6.05], mara: [1.1, 4.25], eli: [4.6, 4.7]
      }
    };
    const merged = { ...spots, ...(overrides[p.id] || {}) };
    // Tito works the far side of the counter; Bruno holds the door.
    const behindCounter = {
      apartment: [5.2, 4.0], garage: [5.35, 4.2], lab: [6.7, 4.85],
      warehouse: [6.8, 4.8], empire: [8.35, 4.68]
    };
    const doorGuard = {
      apartment: [7.55, 5.55], garage: [7.55, 5.55], lab: [8.6, 6.65],
      warehouse: [9.55, 6.25], empire: [9.55, 6.35]
    };
    merged.tito = behindCounter[p.id] || [p.counter[0] - .68, p.counter[1] - .62];
    merged.bruno = doorGuard[p.id] || [p.door[0] - .8, p.door[1] - .8];
    return merged;
  }

  ensureCrew(p) {
    if (this.crewPropId !== p.id) {
      this.crewPropId = p.id;
      this.crewStates.clear();
      this.hiddenPlants.clear();
      this.trimGhosts.clear();
    }
    const hired = this.game.state.staff;
    for (const id of [...this.crewStates.keys()]) {
      if (!hired.includes(id)) this.crewStates.delete(id);
    }
    const spots = this.staffSpots(p);
    for (const id of hired) {
      if (!STAFF_BY_ID[id] || !spots[id]) continue;
      const state = this.crewStates.get(id);
      if (state) state.home = spots[id];
      else this.crewStates.set(id, this.makeCrewState(id, spots[id]));
    }
  }

  makeCrewState(id, home) {
    const facing = { tito: -1, bruno: -1, mara: -1 };
    return {
      id, x: home[0], y: home[1], home,
      phase: 'idle', timer: .5 + Math.random() * 2, target: null,
      walking: false, walkPhase: 0, face: facing[id] || 1,
      job: null, queue: [], workT: 0, particleT: 0,
      inspectIndex: -1, serve: 0
    };
  }

  enqueueCrewJob(id, propId, index, kind, extra = {}) {
    const g = this.game;
    if (!g.state.staff.includes(id) || propId !== g.state.activeProperty) return false;
    this.ensureCrew(g.propConfig);
    const state = this.crewStates.get(id);
    if (!state) return false;
    if (state.job?.kind === kind && state.job.index === index) return true;
    if (state.queue.some(job => job.kind === kind && job.index === index)) return true;
    state.queue.push({ propId, index, kind, ...extra });
    return true;
  }

  updateCrew(dt, p) {
    this.ensureCrew(p);
    // Crew animation follows the simulation: freeze it while the game is paused
    // for the splash, a panel or an event dialog.
    if (this.game.runtime.uiPaused || this.game.runtime.pendingEvent) return;
    for (const state of this.crewStates.values()) this.stepWorker(state, p, dt);
    this.cleanupCrewArtifacts(p);
  }

  stepWorker(state, p, dt) {
    state.serve = Math.max(0, state.serve - dt * 2.2);
    if (state.id === 'tito') return;
    if (state.id === 'bruno') return;
    if (state.id === 'priya') { this.stepInspector(state, p, dt); return; }

    if (state.phase === 'walk') {
      const arrived = this.stepTo(state, state.target, 2.15, dt);
      if (arrived) {
        state.phase = 'work';
        state.workT = 0;
        state.particleT = .12;
        state.timer = state.job?.kind === 'trim' ? 1.9 : state.job?.kind === 'water' ? 1.45 : 1.6;
        const pos = state.job ? (p.slots[state.job.index] || this.slotPos(state.job.propId, state.job.index)) : null;
        if (pos) state.face = (pos[0] - pos[1]) < (state.x - state.y) ? -1 : 1;
      }
    } else if (state.phase === 'work') {
      state.workT += dt;
      state.timer -= dt;
      state.particleT -= dt;
      if (state.particleT <= 0) {
        this.emitCrewWorkParticles(state, p);
        state.particleT = state.job?.kind === 'water' ? .2 : .34;
      }
      if (state.timer <= 0) this.finishCrewJob(state, p);
    } else if (state.phase === 'rest') {
      state.timer -= dt;
      if (state.timer <= 0) {
        if (state.queue.length) this.startCrewJob(state, p);
        else { state.phase = 'return'; state.target = state.home; }
      }
    } else if (state.phase === 'return') {
      if (this.stepTo(state, state.home, 1.65, dt)) {
        state.phase = 'idle';
        state.timer = 1.2 + Math.random() * 2.2;
      }
    } else {
      state.walking = false;
      state.timer -= dt;
      if (state.queue.length) this.startCrewJob(state, p);
    }
  }

  startCrewJob(state, p) {
    while (state.queue.length) {
      const job = state.queue.shift();
      const key = this.slotKey(job.propId, job.index);
      const hasTarget = p.slots[job.index] || (job.kind === 'trim' && this.trimGhosts.has(key));
      if (!hasTarget) continue;
      job.approach = this.crewApproach(p, job.index, state.id);
      state.job = job;
      state.target = job.approach;
      state.phase = 'walk';
      return true;
    }
    state.job = null;
    state.phase = 'return';
    state.target = state.home;
    return false;
  }

  finishCrewJob(state, p) {
    const job = state.job;
    state.job = null;
    state.walking = false;
    if (job) {
      const key = this.slotKey(job.propId, job.index);
      const pos = p.slots[job.index] || this.slotPos(job.propId, job.index);
      if (job.kind === 'plant') {
        this.hiddenPlants.delete(key);
        if (pos) this.burstPlant(pos);
      } else if (job.kind === 'water') {
        if (pos) this.burstWater(pos);
      } else if (job.kind === 'trim') {
        this.trimGhosts.delete(key);
        if (pos) this.burstTrim(pos, job.strain, job.grams);
      }
    }
    if (state.queue.length) this.startCrewJob(state, p);
    else { state.phase = 'rest'; state.timer = .9 + Math.random() * 1.2; state.target = null; }
  }

  cleanupCrewArtifacts(p) {
    const busy = new Set();
    for (const state of this.crewStates.values()) {
      if (state.job) busy.add(this.slotKey(state.job.propId, state.job.index));
      for (const job of state.queue) busy.add(this.slotKey(job.propId, job.index));
    }
    for (const key of [...this.hiddenPlants]) {
      const [propId, idx] = key.split(':');
      if (propId !== p.id || !this.game.propState.slots[Number(idx)] || !busy.has(key)) this.hiddenPlants.delete(key);
    }
    for (const key of [...this.trimGhosts.keys()]) {
      const [propId] = key.split(':');
      if (propId !== p.id || !busy.has(key)) this.trimGhosts.delete(key);
    }
  }

  stepTo(state, target, speed, dt) {
    if (!target) return true;
    const dx = target[0] - state.x, dy = target[1] - state.y;
    const dist = Math.hypot(dx, dy);
    if (dist < .035) {
      state.x = target[0]; state.y = target[1];
      state.walking = false;
      return true;
    }
    const step = Math.min(dist, speed * dt);
    state.x += dx / dist * step;
    state.y += dy / dist * step;
    state.walking = true;
    state.walkPhase += dt * 9;
    const screenDx = dx - dy;
    if (Math.abs(screenDx) > .001) state.face = screenDx > 0 ? 1 : -1;
    return false;
  }

  crewApproach(p, index, id) {
    const [x, y] = p.slots[index];
    const sets = {
      eli: [[-.55, .62], [.6, .58], [.62, -.15], [-.62, .05], [0, .86]],
      mara: [[.58, .6], [-.58, .6], [.72, .12], [-.7, .12], [.15, .88]],
      bea: [[.64, .42], [-.64, .42], [.6, -.28], [-.6, -.22], [.15, .8]],
      priya: [[.78, .36], [-.78, .36], [.52, .92], [-.52, .92], [.82, -.1]]
    };
    for (const [ox, oy] of sets[id] || sets.priya) {
      const spot = [clamp(x + ox, .45, p.w - .45), clamp(y + oy, .45, p.d - .45)];
      if (this.crewSpotClear(p, spot, index)) return spot;
    }
    return [clamp(x + .55, .45, p.w - .45), clamp(y + .7, .45, p.d - .45)];
  }

  crewSpotClear(p, [x, y], ownIndex) {
    if (x < .35 || y < .35 || x > p.w - .35 || y > p.d - .35) return false;
    for (let i = 0; i < p.slots.length; i++) {
      if (i === ownIndex) continue;
      const [sx, sy] = p.slots[i];
      if (Math.hypot(sx - x, sy - y) < .55) return false;
    }
    const [cx, cy] = p.counter;
    if (x > cx - 1.12 && x < cx + 1.12 && y > cy - .55 && y < cy + .55) return false;
    for (const prop of p.props) {
      if (!prop.w || !prop.d || ['rug', 'oil', 'pizza', 'cat'].includes(prop.type)) continue;
      if (x > prop.x - .12 && x < prop.x + prop.w + .12 && y > prop.y - .12 && y < prop.y + prop.d + .12) return false;
    }
    return true;
  }

  stepInspector(state, p, dt) {
    if (state.phase === 'walk') {
      if (this.stepTo(state, state.target, 1.15, dt)) {
        state.phase = 'inspect';
        state.timer = 2.3 + Math.random() * 1.6;
        state.workT = 0;
        state.particleT = .35;
        const pos = p.slots[state.inspectIndex];
        if (pos) state.face = (pos[0] - pos[1]) < (state.x - state.y) ? -1 : 1;
      }
    } else if (state.phase === 'inspect') {
      state.workT += dt;
      state.timer -= dt;
      state.particleT -= dt;
      if (state.particleT <= 0) {
        state.particleT = .55;
        const pos = p.slots[state.inspectIndex];
        if (pos) for (let i = 0; i < 2; i++) this.particles.push({ type: 'spark', wx: pos[0] + (Math.random() - .5) * .3, wy: pos[1] + (Math.random() - .5) * .3, z: 52 + Math.random() * 16, vx: (Math.random() - .5) * .1, vy: (Math.random() - .5) * .1, vz: 18, life: .9, max: .9, color: '#9ad1ff' });
      }
      if (state.timer <= 0) {
        state.phase = 'idle';
        state.timer = 1.1 + Math.random() * 2.1;
      }
    } else {
      state.walking = false;
      state.timer -= dt;
      if (state.timer <= 0) {
        const occupied = [];
        this.game.propState.slots.forEach((slot, i) => { if (slot) occupied.push(i); });
        const pool = occupied.length ? occupied : p.slots.map((_, i) => i);
        let index = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1 && index === state.inspectIndex) index = pool[(pool.indexOf(index) + 1) % pool.length];
        state.inspectIndex = index;
        state.target = this.crewApproach(p, index, 'priya');
        state.phase = 'walk';
      }
    }
  }

  emitCrewWorkParticles(state, p) {
    if (!state.job) return;
    // Trim jobs run after the game has cleared the pot, so fall back to the
    // property layout for the effect position.
    const pos = p.slots[state.job.index] || this.slotPos(state.job.propId, state.job.index);
    if (!pos) return;
    if (state.job.kind === 'plant') {
      for (let i = 0; i < 2; i++) this.particles.push({ type: 'spark', wx: pos[0] + (Math.random() - .5) * .2, wy: pos[1] + (Math.random() - .5) * .2, z: 20, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, vz: 20, life: .6, max: .6, color: '#c9ff9a' });
    } else if (state.job.kind === 'water') {
      this.particles.push({ type: 'drop', wx: pos[0] + (Math.random() - .5) * .3, wy: pos[1] + (Math.random() - .5) * .3, z: 58 + Math.random() * 8, vx: 0, vy: 0, vz: -35, life: .7, max: .7, color: '#8fe7ff' });
    } else if (state.job.kind === 'trim') {
      this.particles.push({ type: 'leaf', wx: pos[0] + (Math.random() - .5) * .35, wy: pos[1] + (Math.random() - .5) * .35, z: 40 + Math.random() * 16, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2, vz: 22, life: .9, max: .9, color: STRAIN_BY_ID[state.job.strain]?.color || '#7bf58a' });
    }
  }

  drawStaff(id, x, y, st, state) {
    const looks = {
      bea: { skin: '#e0b08a', hair: '#6a3f28', shirt: '#b9643b', style: 'bob', apron: true, held: 'shears', phase: .6, flip: 1 },
      tito: { skin: '#8f5e40', hair: '#191512', shirt: '#3e7f5d', style: 'short', held: 'tray', phase: 2.1, flip: -1 },
      priya: { skin: '#b97f5e', hair: '#171311', shirt: '#4e739c', style: 'bob', glasses: true, held: 'flask', phase: 4.2, flip: 1 },
      bruno: { skin: '#a87352', hair: '#25201c', shirt: '#38383f', style: 'bald', scale: 1.16, phase: 1.4, flip: -1, tattoo: true },
      mara: { skin: '#c88f62', hair: '#3a2618', shirt: '#4f8a5c', style: 'curly', apron: true, held: 'can', phase: .9, flip: -1 },
      eli: { skin: '#8b6448', hair: '#221a16', shirt: '#6a5fa8', style: 'messy', held: 'pot', phase: 3.3, flip: 1 }
    };
    const look = looks[id] || {};
    const working = state && (state.phase === 'work' || state.phase === 'inspect');
    const workPose = working ? (id === 'bea' ? 'trim' : id === 'mara' ? 'water' : id === 'eli' ? 'plant' : 'inspect') : null;
    this.drawPerson(x, y, {
      ...look,
      flip: state?.face ?? look.flip,
      walk: state?.walking ? state.walkPhase : 0,
      workPose,
      workT: state?.workT || 0,
      serving: id === 'tito' && (state?.serve || 0) > .05,
      crossed: id === 'bruno'
    });
    // Collect the badge here, but paint it later in screen space. Drawing screen
    // coordinates inside the world transform pushed every tag far off the body.
    const tagZ = 80 + Math.max(0, (look.scale || 1) - 1) * 62;
    this.staffTags.push({ s: this.toScreen(x, y, tagZ), name: st.name, color: st.color });
  }

  drawStaffTags() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '800 9px system-ui';
    const labels = this.staffTags.map(tag => {
      const label = tag.name.toUpperCase();
      const textW = ctx.measureText(label).width;
      const pad = 7, dot = 5, gap = 4;
      const w = pad * 2 + dot + gap + textW;
      const h = 16;
      return { tag, label, w, h, x: tag.s.x - w / 2, y: tag.s.y - h };
    });
    // Stack labels upward when the room is viewed small enough that two badges
    // would otherwise cover each other (phones, zoomed-out camera).
    labels.sort((a, b) => a.y - b.y || a.x - b.x);
    const placed = [];
    const overlaps = (a, b) => a.x < b.x + b.w + 3 && a.x + a.w + 3 > b.x && a.y < b.y + b.h + 2 && a.y + a.h + 2 > b.y;
    for (const box of labels) {
      let guard = 0;
      while (placed.some(other => overlaps(box, other)) && guard++ < 16) box.y -= box.h + 3;
      placed.push(box);
    }
    for (const box of placed) {
      const { tag, label, w, h, x, y } = box;
      const anchorX = tag.s.x, anchorY = tag.s.y;
      if (y + h < anchorY - 1) {
        // leader line keeps a lifted badge tied to its owner
        ctx.strokeStyle = rgba(tag.color, .35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(anchorX, anchorY); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
        ctx.fillStyle = rgba(tag.color, .75);
        ctx.beginPath(); ctx.arc(anchorX, anchorY, 1.6, 0, TAU); ctx.fill();
      }
      // soft shadow anchors the tag above the head without hiding the face
      ctx.fillStyle = 'rgba(0,0,0,.32)';
      ctx.beginPath(); ctx.roundRect(x + 1, y + 2, w, h, 8); ctx.fill();
      ctx.fillStyle = 'rgba(9,15,12,.9)';
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = rgba(tag.color, .45); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = tag.color;
      ctx.beginPath(); ctx.arc(x + 7 + 2.5, y + h / 2, 2.5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(244,250,244,.95)';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 7 + 5 + 4, y + h / 2 + 3.2);
    }
    ctx.restore();
  }

  drawCustomer(c) {
    const t = this.game.state;
    const walking = c.state === 'enter' || c.state === 'leave';
    const opt = {
      skin: c.type.skin, hair: c.type.hair, shirt: c.type.shirt, style: c.type.id === 'influencer' ? 'curly' : c.type.id === 'suit' ? 'slick' : c.type.id === 'punk' ? 'messy' : 'short',
      phase: c.wobble * .1, walk: walking ? c.wobble : 0, flip: c.x > c.target?.[0] ? -1 : 1
    };
    if (c.type.id === 'mom') opt.style = 'bob';
    if (c.type.id === 'veteran') opt.style = 'bald';
    if (c.served) opt.flip = -1;
    this.drawPerson(c.x, c.y, opt);
    // small held bag
    if (!c.served && c.state === 'wait') {
      const [px, py] = this.P(c.x, c.y, 0);
      const ctx = this.ctx;
      ctx.fillStyle = 'rgba(230,225,200,.85)';
      ctx.beginPath(); ctx.roundRect(px + 11, py - 26, 8, 10, 2); ctx.fill();
    }
  }

  drawCat(x, y) {
    const [px, py] = this.P(x, y, 0);
    const ctx = this.ctx;
    const bob = Math.sin(this.time * 1.7) * .8;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(px, py + 1, 10, 3.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c98c58';
    ctx.beginPath(); ctx.ellipse(px, py - 8 + bob, 10, 5.5, .05, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 8, py - 13 + bob, 5.2, 0, TAU); ctx.fill();
    // ears
    ctx.beginPath(); ctx.moveTo(px + 5, py - 17 + bob); ctx.lineTo(px + 6, py - 22 + bob); ctx.lineTo(px + 9, py - 17.5 + bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px + 10, py - 17.5 + bob); ctx.lineTo(px + 13, py - 21 + bob); ctx.lineTo(px + 13.5, py - 16 + bob); ctx.fill();
    // tail
    ctx.strokeStyle = '#c98c58'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(px - 9, py - 8 + bob); ctx.quadraticCurveTo(px - 18, py - 14 + Math.sin(this.time * 2) * 4, px - 15, py - 22 + bob); ctx.stroke();
    // eyes
    ctx.fillStyle = '#30261c'; ctx.beginPath(); ctx.arc(px + 6.5, py - 14 + bob, .8, 0, TAU); ctx.arc(px + 10, py - 14 + bob, .8, 0, TAU); ctx.fill();
    // stripes
    ctx.strokeStyle = 'rgba(120,75,35,.5)'; ctx.lineWidth = .8;
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(px - 3 + i * 4, py - 10 + bob, 4, .6, 2.1); ctx.stroke(); }
  }

  // ---------- screen overlays ----------
  drawBubbles() {
    const ctx = this.ctx;
    this.screenTransform();
    const zoom = this.zoom;
    const g = this.game;
    const p = g.propConfig;
    // plant status
    g.propState.slots.forEach((slot, i) => {
      const pos = p.slots[i];
      if (!pos) return;
      // Keep every pot indicator anchored to the pot's own screen position.
      // Offsetting these in screen space made them drift to the right of the
      // planters, especially on the apartment's angled row of pots.
      const center = this.toScreen(pos[0], pos[1], 0);
      const top = this.toScreen(pos[0], pos[1], slot ? 58 + slot.progress * 40 : 58);
      if (!slot) return;
      if (slot.progress >= 1) {
        const bob = Math.sin(this.time * 3 + i) * 2.5;
        const label = 'HARVEST';
        ctx.save();
        ctx.font = '800 9px system-ui';
        const textW = ctx.measureText(label).width;
        const iconW = 12, gap = 5;
        const contentW = iconW + gap + textW;
        const w = Math.max(52, contentW + 20), h = 20;
        const x = center.x, y = top.y - 12 + bob;
        const start = x - contentW / 2;
        ctx.fillStyle = 'rgba(14,30,18,.92)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(150,255,160,.6)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#c7ff9d';
        // leaf glyph, measured with the label so the whole badge is centred
        ctx.beginPath(); ctx.ellipse(start + 5, y - 10, 5, 2.8, -.5, 0, TAU); ctx.fill();
        ctx.textAlign = 'left';
        ctx.fillText(label, start + iconW + gap, y - 6.5);
        // pulse ring
        const pulse = (Math.sin(this.time * 3) + 1) / 2;
        ctx.strokeStyle = `rgba(180,255,170,${.35 * (1 - pulse)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(x - w / 2 - pulse * 5, y - h - pulse * 4, w + pulse * 10, h + pulse * 8, 10); ctx.stroke();
        ctx.restore();
      } else if (g.state.clock - (slot.lastTend || 0) > 4) {
        // Water droplet: directly over the pot, never off to one side.
        const sx = center.x, sy = top.y - 2;
        ctx.save();
        ctx.fillStyle = 'rgba(14,28,34,.8)'; ctx.beginPath(); ctx.arc(sx, sy, 8, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(130,235,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#92eaff'; ctx.beginPath(); ctx.moveTo(sx, sy - 5); ctx.quadraticCurveTo(sx + 4, sy + 1, sx, sy + 4); ctx.quadraticCurveTo(sx - 4, sy + 1, sx, sy - 5); ctx.fill();
        ctx.restore();
      }
    });
    // customer bubbles (drawn back-to-front so front customer on top)
    const waiting = g.runtime.customers.filter(c => c.state === 'enter' || c.state === 'wait').sort((a, b) => (b.queueIndex || 0) - (a.queueIndex || 0));
    for (const c of waiting) {
      const head = this.toScreen(c.x, c.y, 72);
      const strain = STRAIN_BY_ID[c.strain];
      const stock = g.strainStock(c.strain);
      const out = stock < 1;
      const w = 118, h = 48;
      const x = head.x - w / 2;
      const y = head.y - h - 6 + (c.queueIndex % 2) * 4;
      const patience = c.state === 'wait' ? clamp(c.patience / c.maxPatience, 0, 1) : 1;
      const tempCol = patience > .55 ? '#7bf58a' : patience > .25 ? '#ffcf6b' : '#ff6e6e';
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.beginPath(); ctx.roundRect(x + 1.5, y + 4, w, h, 10); ctx.fill();
      ctx.fillStyle = 'rgba(12,19,16,.92)';
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
      ctx.strokeStyle = out ? 'rgba(255,100,100,.4)' : rgba(strain.color, .5); ctx.lineWidth = 1;
      ctx.stroke();
      // tail
      ctx.fillStyle = 'rgba(12,19,16,.92)';
      ctx.beginPath(); ctx.moveTo(head.x - 7, y + h - 1); ctx.lineTo(head.x + 3, y + h - 1); ctx.lineTo(head.x - 1, y + h + 7); ctx.closePath(); ctx.fill();
      // top line
      ctx.font = '800 8px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.textAlign = 'left';
      ctx.fillText(c.type.name.toUpperCase(), x + 9, y + 12);
      ctx.textAlign = 'right';
      ctx.fillStyle = out ? '#ff8b8b' : '#ffd98a';
      ctx.font = '800 11px system-ui';
      ctx.fillText('$' + c.total, x + w - 9, y + 13);
      // middle
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '700 11px system-ui';
      ctx.fillText(`${c.grams}g`, x + 9, y + 28);
      ctx.fillStyle = strain.color;
      ctx.beginPath(); ctx.arc(x + 36, y + 24, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(235,245,235,.85)'; ctx.font = '600 9px system-ui';
      ctx.fillText(out ? 'NO STOCK' : strain.short, x + 43, y + 28);
      // patience bar
      ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.beginPath(); ctx.roundRect(x + 9, y + 36, w - 18, 3, 2); ctx.fill();
      ctx.fillStyle = tempCol; ctx.beginPath(); ctx.roundRect(x + 9, y + 36, (w - 18) * patience, 3, 2); ctx.fill();
      ctx.restore();
      this.hotspots.push({ x: x + w / 2, y: y + h / 2, r: 46, kind: 'customer', id: c.id });
    }
    // served / angry indicators
    for (const c of g.runtime.customers) {
      if (c.state === 'leave') {
        const head = this.toScreen(c.x, c.y, 76);
        ctx.save(); ctx.font = '800 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillStyle = c.served ? '#9dffc0' : '#ff8b8b';
        ctx.fillText(c.served ? '✓' : '!', head.x, head.y);
        ctx.restore();
        if (!c.served) this.hotspots.push({ x: head.x, y: head.y - 8, r: 14, kind: 'none', id: 'angry' });
      }
    }
    // Crew badges sit above every scene bubble so names stay legible.
    this.drawStaffTags();
  }

  drawHover() {
    if (!this.hoverId) return;
    const h = this.hotspots.find(x => x.id === this.hoverId);
    if (!h) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(160,255,170,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(h.x, h.y, Math.min(h.r, 42), 0, TAU); ctx.stroke();
    ctx.restore();
  }

  drawLighting(p) {
    const ctx = this.ctx;
    this.screenTransform();
    const hour = this.game.hour;
    const night = hour < 6.5 || hour > 19 ? 1 : hour < 8 ? (8 - hour) / 1.5 : hour > 17.5 ? (hour - 17.5) / 1.5 : 0;
    const nf = clamp(night, 0, 1);
    // ambient tint
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${lerp(255, 105, nf)},${lerp(250, 135, nf)},${lerp(240, 185, nf)},${.16 + nf * .28})`;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
    // lamp & screen glows
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glows = [];
    for (const prop of p.props) {
      if (prop.type === 'lamp') glows.push({ ...this.toScreen(prop.x, prop.y, prop.hang === false ? 66 : 96), col: prop.color || (p.id === 'lab' ? '110,240,255' : '255,205,125'), r: prop.hang === false ? 130 : 110 });
      if (prop.type === 'tv') glows.push({ ...this.toScreen(prop.x + .8, prop.y, 40), col: '90,190,210', r: 100 });
      if (prop.type === 'aquarium') glows.push({ ...this.toScreen(prop.x + .6, prop.y, 40), col: '90,225,235', r: 100 });
      if (prop.type === 'reactor') glows.push({ ...this.toScreen(prop.x, prop.y, 70), col: '80,225,255', r: 140 });
    }
    // window light
    for (const d of p.decor || []) {
      if (d.type === 'window' || d.type === 'skyline' || d.type === 'labwindow') {
        const u = (d.u1 + d.u2) / 2;
        const pos = d.wall === 'back' ? this.toScreen(u, 0, (d.z1 + d.z2) / 2) : this.toScreen(0, u, (d.z1 + d.z2) / 2);
        glows.push({ ...pos, col: p.id === 'empire' ? '255,220,150' : '160,220,210', r: 190 });
      } else if (d.type === 'neon' || d.type === 'sconce') {
        const u = (d.u1 + d.u2) / 2, z = (d.z1 + d.z2) / 2;
        const pos = d.wall === 'back' ? this.toScreen(u, 0, z) : this.toScreen(0, u, z);
        const col = d.color || '#ffd98a';
        glows.push({ ...pos, col, r: d.type === 'neon' ? 150 : 95 });
      } else if (d.type === 'stringlights') {
        const u = (d.u1 + d.u2) / 2;
        const pos = d.wall === 'back' ? this.toScreen(u, 0, d.z) : this.toScreen(0, u, d.z);
        glows.push({ ...pos, col: '255,205,130', r: 130 });
      } else if (d.type === 'labstrip') {
        const u = (d.u1 + d.u2) / 2;
        const pos = d.wall === 'back' ? this.toScreen(u, 0, d.z) : this.toScreen(0, u, d.z);
        glows.push({ ...pos, col: d.color || '#6fe7ff', r: 160 });
      } else if (d.type === 'sign' || d.type === 'art') {
        const u = (d.u1 + d.u2) / 2, z = (d.z1 + d.z2) / 2;
        const pos = d.wall === 'back' ? this.toScreen(u, 0, z) : this.toScreen(0, u, z);
        glows.push({ ...pos, col: d.color || '#ffd28c', r: d.type === 'art' ? 100 : 90 });
      }
    }
    for (const g of glows) {
      const gr = g.r * this.zoom;
      const rg = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, gr);
      const glowCol = a => g.col.startsWith('#') ? rgba(g.col, a) : `rgba(${g.col},${a})`;
      rg.addColorStop(0, glowCol(.10 + nf * .12)); rg.addColorStop(.5, glowCol(.035)); rg.addColorStop(1, glowCol(0));
      ctx.fillStyle = rg; ctx.fillRect(g.x - gr, g.y - gr, gr * 2, gr * 2);
    }
    ctx.restore();
  }

  // ---------- particles & fx ----------
  burstCash(x, y, text) {
    this.particles.push({ type: 'cash', wx: x, wy: y, z: 64, vx: (Math.random() - .5) * .12, vy: -.08, vz: 24, life: 1.5, max: 1.5, text, color: '#c9ff9a' });
  }
  sparkleScreen() {
    const cx = this.w / 2, cy = this.h * .45;
    for (let i = 0; i < 26; i++) {
      this.screenParticles = this.screenParticles || [];
      this.screenParticles.push({
        x: cx + (Math.random() - .5) * 220, y: cy + (Math.random() - .5) * 100,
        vx: (Math.random() - .5) * 260, vy: -60 - Math.random() * 180,
        life: 1.2 + Math.random() * .6, max: 1.8, col: ['#c7ff9d', '#ffd166', '#8fe7ff', '#ff9fae'][i % 4], rot: Math.random() * TAU, vr: (Math.random() - .5) * 8
      });
    }
  }

  drawWorldParticles(dt) {
    const ctx = this.ctx;
    this.particles = this.particles.filter(p => (p.life -= dt) > 0);
    for (const p of this.particles) {
      p.wx += (p.vx || 0) * dt; p.wy += (p.vy || 0) * dt;
      p.z += (p.vz || 0) * dt; p.vz -= (p.type === 'drop' ? 90 : 5) * dt;
      const [sx, sy] = this.P(p.wx, p.wy, Math.max(0, p.z));
      const a = clamp(p.life / p.max, 0, 1);
      if (p.type === 'cash') continue;
      ctx.save();
      ctx.globalAlpha = a;
      if (p.type === 'leaf') {
        ctx.translate(sx, sy); ctx.rotate(this.time * 3 + p.wx);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, TAU); ctx.fill();
      } else if (p.type === 'heart') {
        ctx.translate(sx, sy); ctx.fillStyle = p.color; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('♥', 0, 0);
      } else if (p.type === 'drop') {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(sx, sy, 1.3 + a * 1.4, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  drawScreenFx(dt) {
    const ctx = this.ctx;
    this.screenTransform();
    // cash text particles
    for (const p of this.particles) {
      if (p.type !== 'cash') continue;
      const s = this.toScreen(p.wx, p.wy, Math.max(10, p.z));
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `800 ${11 + this.zoom * 3}px system-ui`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
      ctx.strokeText(p.text, s.x, s.y);
      ctx.fillStyle = p.color; ctx.fillText(p.text, s.x, s.y);
      ctx.restore();
    }
    // confetti
    this.screenParticles = (this.screenParticles || []).filter(p => (p.life -= dt) > 0);
    for (const p of this.screenParticles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.rot += p.vr * dt;
      ctx.save(); ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
      ctx.fillRect(-2.5, -1.2, 5, 2.4); ctx.restore();
    }
    // vignette
    const vg = ctx.createRadialGradient(this.w / 2, this.h * .45, Math.min(this.w, this.h) * .3, this.w / 2, this.h * .5, Math.max(this.w, this.h) * .72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.52)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, this.w, this.h);
    // heat siren
    const heat = this.game.state.heat;
    if (heat > 55) {
      const intensity = clamp((heat - 55) / 45, 0, 1);
      const pulse = (Math.sin(this.time * 6) + 1) / 2;
      const red = ctx.createRadialGradient(this.w * .5, this.h * .5, Math.min(this.w, this.h) * .35, this.w * .5, this.h * .5, Math.max(this.w, this.h) * .75);
      red.addColorStop(0, 'rgba(255,40,50,0)');
      red.addColorStop(1, `rgba(${pulse > .5 ? '255,50,60' : '70,140,255'},${.06 + intensity * .1})`);
      ctx.fillStyle = red; ctx.fillRect(0, 0, this.w, this.h);
    }
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,80,70,${this.flash * .22})`; ctx.fillRect(0, 0, this.w, this.h);
    }
    ctx.fillStyle = 'rgba(160,220,180,.018)';
    for (let i = 0; i < 120; i++) {
      const x = (i * 97.13) % this.w, y = (i * 53.7 + this.time * 2) % this.h;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  pick(px, py) {
    let best = null, bestD = Infinity;
    for (const h of this.hotspots) {
      const d = Math.hypot(px - h.x, py - h.y);
      if (d <= h.r && d < bestD) { best = h; bestD = d; }
    }
    return best;
  }

  labelFor(hit) {
    if (!hit) return '';
    const g = this.game;
    if (hit.kind === 'slot') {
      const slot = g.state.properties[hit.propId]?.slots[hit.index];
      if (!slot) {
        const strain = STRAIN_BY_ID[g.selectedStrainId()];
        return `Plant ${strain.short} · $${g.state.freePlantings > 0 ? 0 : strain.cost}`;
      }
      if (slot.progress >= 1) return 'Harvest';
      return g.state.clock - (slot.lastTend || 0) > 4 ? 'Water & tend' : 'Growing…';
    }
    if (hit.kind === 'customer') {
      const c = g.runtime.customers.find(x => x.id === hit.id);
      if (!c) return '';
      return `Serve ${c.grams}g ${STRAIN_BY_ID[c.strain].short} · $${c.total}`;
    }
    if (hit.kind === 'counter') return 'Counter · open grow menu';
    return '';
  }
}
