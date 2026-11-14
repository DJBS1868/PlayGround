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
    });
    g.on('harvest', e => {
      const pos = this.slotPos(e.propId, e.index);
      if (pos) {
        this.particles.push({ type: 'leaf', wx: pos[0], wy: pos[1], z: 34, vx: 0, vy: 0, vz: 60, life: 1.1, max: 1.1, color: STRAIN_BY_ID[e.strain]?.color || '#7bf58a' });
        this.burstCash(pos[0], pos[1] - .4, `+${e.grams}g`);
      }
    });
    g.on('tend', e => {
      const pos = this.slotPos(e.propId, e.index);
      if (pos) for (let i = 0; i < 4; i++) this.particles.push({ type: 'drop', wx: pos[0] + (Math.random() - .5) * .3, wy: pos[1] + (Math.random() - .5) * .3, z: 70, vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10, vz: -40, life: .8, max: .8, color: '#8fe7ff' });
    });
    g.on('plant', e => {
      const pos = this.slotPos(e.propId, e.index);
      if (pos) for (let i = 0; i < 7; i++) this.particles.push({ type: 'spark', wx: pos[0], wy: pos[1], z: 22, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, vz: 35, life: .8, max: .8, color: '#b8ff9a' });
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
      draws.push({ depth: spot[0] + spot[1] + .3, draw: () => this.drawStaff(id, spot[0], spot[1], st) });
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

  drawDecor(p) {
    const ctx = this.ctx;
    const pal = p.palette;
    for (const deco of p.decor || []) {
      this.withWall(deco.wall, (c, wall) => {
        if (deco.type === 'window') {
          const u1 = deco.u1, u2 = deco.u2, z1 = deco.z1, z2 = deco.z2;
          const w = u2 - u1, h = z2 - z1;
          c.fillStyle = 'rgba(0,0,0,.35)'; this.wallRect(c, u1 - .06, u2 + .06, z1 - .06, z2 + .06); c.fill();
          this.wallRect(c, u1, u2, z1, z2); c.save(); c.clip();
          const g = c.createLinearGradient(0, -z2, 0, -z1);
          const night = this.game.hour < 6.5 || this.game.hour > 19;
          g.addColorStop(0, night ? '#0a1726' : '#7fb1a5');
          g.addColorStop(1, night ? '#17323a' : '#c7d99b');
          c.fillStyle = g; c.fillRect(U(u1), -z2, U(w), h);
          // buildings
          for (let i = 0; i < 10; i++) {
            const bx = U(u1) + seeded(i * 2.4 + u1) * U(w);
            const bw = 4 + seeded(i * 5.1) * 10, bh = 8 + seeded(i * 8.3) * 30;
            c.fillStyle = night ? 'rgba(8,18,26,.9)' : 'rgba(50,80,72,.45)';
            c.fillRect(bx, -z1 - bh, bw, bh);
            if (night) {
              c.fillStyle = 'rgba(255,205,120,.5)';
              for (let wy = -z1 - bh + 3; wy < -z1 - 2; wy += 5) for (let wx = bx + 1.5; wx < bx + bw - 1; wx += 4) if (seeded(wx + wy) > .55) c.fillRect(wx, wy, 1.2, 1.8);
            }
          }
          if (night) { c.fillStyle = 'rgba(245,245,215,.9)'; c.beginPath(); c.arc(U(u1) + U(w) * .72, -z2 + 18, 5, 0, TAU); c.fill(); }
          c.restore();
          // frame
          c.strokeStyle = shade(pal.trim, 15); c.lineWidth = 2.2;
          this.wallRect(c, u1, u2, z1, z2); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,.15)'; c.lineWidth = .7;
          this.wallRect(c, u1 + .12, u2 - .12, z1 + .12, z2 - .12); c.stroke();
          // sill
          c.fillStyle = shade(pal.trim, -5); c.fillRect(U(u1) - 3, -z1, U(w) + 6, 2.4);
        } else if (deco.type === 'poster') {
          const w = deco.u2 - deco.u1, h = deco.z2 - deco.z1;
          c.fillStyle = 'rgba(0,0,0,.3)';
          c.fillRect(U(deco.u1) + 2, -deco.z2 + 2, U(w), h);
          c.fillStyle = '#17201a'; c.fillRect(U(deco.u1) - 2, -deco.z2 - 2, U(w) + 4, h + 4);
          const g = c.createLinearGradient(U(deco.u1), -deco.z2, U(deco.u2), -deco.z2);
          g.addColorStop(0, '#263b2c'); g.addColorStop(1, '#17251d');
          c.fillStyle = g; c.fillRect(U(deco.u1), -deco.z2, U(w), h);
          c.strokeStyle = rgba(deco.color, .6); c.lineWidth = .8;
          c.strokeRect(U(deco.u1) + .8, -deco.z2 + .8, U(w) - 1.6, h - 1.6);
          const tx = wall === 'left' ? deco.u2 - .55 : deco.u1 + .55;
          this.wallText(c, wall, tx, deco.z2 - 12, deco.title || '', '900 12px "Arial Black", Impact, sans-serif', deco.color);
          this.wallText(c, wall, tx, deco.z2 - 21, deco.sub || '', '700 6px system-ui', 'rgba(255,255,255,.55)');
          // leaf doodle
          c.strokeStyle = rgba(deco.color, .35); c.lineWidth = 1;
          for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(U(deco.u1) + 9 + i * 5, -deco.z1 + 10 + i * 1.4, 4, 2, -.6 + i * .3, 0, TAU); c.stroke(); }
        } else if (deco.type === 'shelf') {
          const w = U(deco.u2 - deco.u1);
          c.fillStyle = shade(pal.trim, -25); c.fillRect(U(deco.u1), -deco.z2, w, 2.2);
          c.fillRect(U(deco.u1), -deco.z1, w, 2);
          c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(U(deco.u1), -deco.z2 + 2.2, w, 1);
          for (let i = 0; i < 4; i++) {
            const u = U(deco.u1) + 2 + i * (w - 4) / 4;
            c.fillStyle = ['#7fae6d', '#c9a75b', '#5f8f9e', '#a57070'][i]; c.fillRect(u, -deco.z2 - 7, 2.6, 7);
            c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(u + .4, -deco.z2 - 6, .8, 5);
          }
        } else if (deco.type === 'stringlights') {
          c.strokeStyle = 'rgba(20,20,18,.8)'; c.lineWidth = .6;
          c.beginPath(); c.moveTo(U(deco.u1), -deco.z);
          for (let i = 0; i <= 8; i++) { const t = i / 8, u = U(deco.u1) + t * U(deco.u2 - deco.u1); c.lineTo(u, -deco.z + Math.sin(t * Math.PI) * 7); }
          c.stroke();
          for (let i = 0; i <= 8; i++) {
            const t = i / 8, u = U(deco.u1) + t * U(deco.u2 - deco.u1), z = deco.z - Math.sin(t * Math.PI) * 7;
            c.fillStyle = 'rgba(255,207,117,.16)';
            c.beginPath(); c.arc(u, -z + 1.5, 5, 0, TAU); c.fill();
            c.fillStyle = '#ffd88a';
            c.beginPath(); c.arc(u, -z + 1.5, 1.4, 0, TAU); c.fill();
          }
        } else if (deco.type === 'garagedoor') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1, x = U(deco.u1), z = deco.z1;
          c.fillStyle = '#2c3033'; c.fillRect(x, -deco.z2, w, h);
          c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = .7;
          for (let zz = z + 5; zz < deco.z2; zz += 7) { c.beginPath(); c.moveTo(x, -zz); c.lineTo(x + w, -zz); c.stroke(); }
          for (let i = 0; i < 4; i++) {
            c.fillStyle = 'rgba(120,180,190,.08)'; c.fillRect(x + 8 + i * (w - 16) / 4, -deco.z2 + 12, (w - 16) / 8, 9);
          }
          c.fillStyle = '#1c2022'; c.fillRect(x + w / 2 - 8, -z - 7, 16, 4);
        } else if (deco.type === 'sign' || deco.type === 'neon') {
          const isNeon = deco.type === 'neon';
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1;
          if (!isNeon) {
            c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(U(deco.u1) - 3, -deco.z2 - 3, w + 6, h + 6);
            c.fillStyle = '#22292a'; c.fillRect(U(deco.u1), -deco.z2, w, h);
          }
          const mu = U((deco.u1 + deco.u2) / 2), mz = (deco.z1 + deco.z2) / 2;
          const sg = c.createRadialGradient(mu, -mz, 1, mu, -mz, Math.max(14, w * .55));
          sg.addColorStop(0, rgba(deco.color, .22)); sg.addColorStop(1, rgba(deco.color, 0));
          c.fillStyle = sg; c.fillRect(U(deco.u1), -deco.z2, w, h);
          this.wallText(c, wall, (deco.u1 + deco.u2) / 2, mz + 5, deco.title, '900 16px "Arial Black", Impact, sans-serif', deco.color, 'center');
          this.wallText(c, wall, (deco.u1 + deco.u2) / 2, mz - 5, deco.sub || '', '700 5px system-ui', 'rgba(255,255,255,.5)', 'center');
          if (isNeon) {
            c.strokeStyle = rgba(deco.color, .4); c.lineWidth = 1;
            c.strokeRect(U(deco.u1), -deco.z2, w, h);
          }
        } else if (deco.type === 'pegboard') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1;
          c.fillStyle = '#5f4c37'; c.fillRect(U(deco.u1), -deco.z2, w, h);
          c.fillStyle = 'rgba(0,0,0,.25)';
          for (let u = U(deco.u1) + 1; u < U(deco.u2); u += 2.5) for (let z = deco.z1 + 2; z < deco.z2; z += 3) c.fillRect(u, -z, .5, .5);
          // tools
          const tools = [['#d9d9d9', 20], ['#c68d3d', 30], ['#8c9da0', 24], ['#d9d9d9', 28]];
          tools.forEach((t, i) => {
            const u = U(deco.u1) + w * (.18 + i * .2);
            c.strokeStyle = t[0]; c.lineWidth = 3;
            c.beginPath(); c.moveTo(u, -deco.z2 + 10); c.lineTo(u, -deco.z2 + 10 + t[1]); c.stroke();
            c.fillStyle = t[0]; c.fillRect(u - 4, -deco.z2 + 6, 8, 5);
          });
        } else if (deco.type === 'pipe') {
          c.strokeStyle = '#6c7c7f'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(U(deco.u1), -deco.z); c.lineTo(U(deco.u1), -deco.z - 14); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = .8;
          c.beginPath(); c.moveTo(U(deco.u1) - 1, -deco.z); c.lineTo(U(deco.u1) - 1, -deco.z - 13); c.stroke();
          c.fillStyle = '#58686b'; c.fillRect(U(deco.u1) - 3, -deco.z - 3, 6, 2);
        } else if (deco.type === 'duct') {
          const w = U(deco.u2 - deco.u1), x = U(deco.u1);
          c.fillStyle = '#5b676c'; c.fillRect(x, -deco.z - 7, w, 14);
          c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x, -deco.z - 7, w, 2);
          c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .8;
          for (let u = x + 4; u < x + w; u += 12) { c.beginPath(); c.moveTo(u, -deco.z - 7); c.lineTo(u, -deco.z + 7); c.stroke(); }
          for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(18,24,24,.8)'; c.fillRect(x + 6 + i * 10, -deco.z - 2, 4, 4); }
        } else if (deco.type === 'warning') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1, cu = U((deco.u1 + deco.u2) / 2);
          c.fillStyle = '#d8b33c'; c.fillRect(U(deco.u1), -deco.z2, w, h);
          c.strokeStyle = '#1c1c1a'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cu, -deco.z2 + 5); c.lineTo(cu - 8, -deco.z1 - 9); c.lineTo(cu + 8, -deco.z1 - 9); c.closePath(); c.stroke();
          this.wallText(c, wall, (deco.u1 + deco.u2) / 2, (deco.z1 + deco.z2) / 2, '!', '900 15px "Arial Black"', '#1c1c1a', 'center');
        } else if (deco.type === 'labwindow') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1, x = U(deco.u1);
          c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x, -deco.z2, w, h);
          c.save(); this.wallRect(c, deco.u1, deco.u2, deco.z1, deco.z2); c.clip();
          const g = c.createLinearGradient(0, -deco.z2, 0, -deco.z1);
          g.addColorStop(0, '#123442'); g.addColorStop(1, '#0c2027'); c.fillStyle = g; c.fillRect(x, -deco.z2, w, h);
          c.fillStyle = 'rgba(110,230,255,.25)';
          for (let i = 0; i < 4; i++) c.fillRect(x + 2 + i * 3, -deco.z2 + 6 + i * 3, w - 4 - i * 4, .8);
          c.restore();
          c.strokeStyle = '#6b8b94'; c.lineWidth = 1.4; this.wallRect(c, deco.u1, deco.u2, deco.z1, deco.z2); c.stroke();
        } else if (deco.type === 'wirefence') {
          c.strokeStyle = 'rgba(150,170,168,.28)'; c.lineWidth = .55;
          for (let u = U(deco.u1); u < U(deco.u2); u += 3) {
            c.beginPath(); c.moveTo(u, -deco.z2); c.lineTo(u + 3, -deco.z1); c.stroke();
            c.beginPath(); c.moveTo(u, -deco.z1); c.lineTo(u + 3, -deco.z2); c.stroke();
          }
          c.fillStyle = '#5b6462'; c.fillRect(U(deco.u1), -deco.z2 - 2, .9, deco.z2 - deco.z1 + 4);
          c.fillRect(U(deco.u2), -deco.z2 - 2, .9, deco.z2 - deco.z1 + 4);
        } else if (deco.type === 'skyline') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1, x = U(deco.u1);
          c.save(); this.wallRect(c, deco.u1, deco.u2, deco.z1, deco.z2); c.clip();
          const g = c.createLinearGradient(0, -deco.z2, 0, -deco.z1);
          g.addColorStop(0, '#080f1a'); g.addColorStop(.55, '#122636'); g.addColorStop(1, '#2a3e44'); c.fillStyle = g; c.fillRect(x, -deco.z2, w, h);
          for (let i = 0; i < 30; i++) {
            const bx = x + seeded(i * 7.2) * w;
            const bw = 5 + seeded(i * 3.3) * 12, bh = 12 + seeded(i * 9.1) * 80;
            c.fillStyle = 'rgba(3,9,15,.88)'; c.fillRect(bx, -deco.z1 - bh, bw, bh);
            c.fillStyle = 'rgba(255,215,140,.55)';
            for (let wy = -deco.z1 - bh + 3; wy < -deco.z1 - 4; wy += 5) for (let wx = bx + 1.5; wx < bx + bw - 1; wx += 3.5) if (seeded(wx * 2 + wy) > .35) c.fillRect(wx, wy, 1, 1.5);
          }
          // moon reflection
          c.fillStyle = 'rgba(220,235,220,.13)'; c.beginPath(); c.arc(x + w * .75, -deco.z2 + 20, 10, 0, TAU); c.fill();
          c.restore();
          // mullions
          c.strokeStyle = 'rgba(110,100,85,.5)'; c.lineWidth = 1.2;
          for (let u = x; u <= x + w; u += w / 6) { c.beginPath(); c.moveTo(u, -deco.z2); c.lineTo(u, -deco.z1); c.stroke(); }
          c.beginPath(); c.moveTo(x, -deco.z1 - 6); c.lineTo(x + w, -deco.z1 - 6); c.stroke();
        } else if (deco.type === 'art') {
          const w = U(deco.u2 - deco.u1), h = deco.z2 - deco.z1, x = U(deco.u1);
          c.fillStyle = '#a88a58'; c.fillRect(x, -deco.z2, w, h);
          c.fillStyle = '#1f1a20'; c.fillRect(x + 1, -deco.z2 + 1, w - 2, h - 2);
          c.fillStyle = '#7d3f4c'; c.beginPath(); c.moveTo(x + 4, -deco.z1 - 5); c.lineTo(x + w / 2, -deco.z2 + 5); c.lineTo(x + w - 4, -deco.z1 - 5); c.fill();
          c.fillStyle = '#d7b46a'; c.beginPath(); c.arc(x + 6, -deco.z2 + 8, 2.5, 0, TAU); c.fill();
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
    const strain = slot ? STRAIN_BY_ID[slot.strain] : null;
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
    if (!slot) {
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
      this.drawPlant(px, py - potH, slot, strain, p, index);
      // progress arc
      if (slot.progress < 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(px, py, 35, 14, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        ctx.strokeStyle = strain.color;
        ctx.beginPath(); ctx.ellipse(px, py, 35, 14, 0, Math.PI * 1.08, Math.PI * 1.08 + Math.PI * .84 * slot.progress); ctx.stroke();
        ctx.restore();
      }
    }
    const hot = this.toScreen(x, y, slot ? 32 : potH + 12);
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
    const bob = Math.sin(t * 2.4 + phase) * 1.1 + (walk > .01 ? Math.abs(Math.sin(walk)) * -1.5 : 0);
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
    // arms
    ctx.strokeStyle = shirt; ctx.lineWidth = 5.5;
    const armSwing = walk > .01 ? -swing * .6 : Math.sin(t * 1.6 + phase) * 1.4;
    ctx.beginPath(); ctx.moveTo(-9, -42 + bob); ctx.lineTo(-13, -27 + bob + armSwing); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -42 + bob); ctx.lineTo(13, -27 + bob - armSwing); ctx.stroke();
    // hands
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-13, -26 + bob + armSwing, 2.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -26 + bob - armSwing, 2.6, 0, TAU); ctx.fill();
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
      const hx = 13, hy2 = -27 + bob - armSwing;
      ctx.save();
      ctx.translate(hx, hy2);
      if (opt.held === 'can') {
        ctx.fillStyle = '#8fa7a1';
        ctx.beginPath(); ctx.roundRect(-4, -4, 9, 9, 2); ctx.fill();
        ctx.strokeStyle = '#c4d8d2'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(5, -2); ctx.lineTo(12, -7); ctx.stroke();
        ctx.beginPath(); ctx.arc(-.5, -6, 3.8, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
        ctx.fillStyle = 'rgba(146,234,255,.9)';
        ctx.beginPath(); ctx.arc(12, -8, 1.5, 0, TAU); ctx.fill();
      } else if (opt.held === 'pot') {
        ctx.fillStyle = '#b06a46';
        ctx.beginPath(); ctx.roundRect(-4, -2, 8, 6, 1.5); ctx.fill();
        ctx.fillStyle = '#d18a60'; ctx.fillRect(-4.6, -2.8, 9.2, 1.8);
        ctx.strokeStyle = '#6fcf72'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -2.8); ctx.lineTo(0, -7); ctx.stroke();
        ctx.fillStyle = '#7bdc85';
        ctx.beginPath(); ctx.ellipse(-2, -7, 3, 1.6, -.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(2.2, -6.2, 2.6, 1.5, .4, 0, TAU); ctx.fill();
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
    return { ...spots, ...(overrides[p.id] || {}) };
  }

  drawStaff(id, x, y, st) {
    const looks = {
      bea: { skin: '#e0b08a', hair: '#6a3f28', shirt: '#b9643b', style: 'bob', apron: true, held: 'shears', phase: .6, flip: 1 },
      tito: { skin: '#8f5e40', hair: '#191512', shirt: '#3e7f5d', style: 'short', held: 'tray', phase: 2.1, flip: -1 },
      priya: { skin: '#b97f5e', hair: '#171311', shirt: '#4e739c', style: 'bob', glasses: true, held: 'flask', phase: 4.2, flip: 1 },
      bruno: { skin: '#a87352', hair: '#25201c', shirt: '#38383f', style: 'bald', scale: 1.16, phase: 1.4, flip: -1, tattoo: true },
      mara: { skin: '#c88f62', hair: '#3a2618', shirt: '#4f8a5c', style: 'curly', apron: true, held: 'can', phase: .9, flip: -1 },
      eli: { skin: '#8b6448', hair: '#221a16', shirt: '#6a5fa8', style: 'messy', held: 'pot', phase: 3.3, flip: 1 }
    };
    const look = looks[id] || {};
    this.drawPerson(x, y, { ...look, walk: 0 });
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
