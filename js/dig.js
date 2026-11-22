import { drawArtifact, drawArtifactShadow } from './art.js';
import { paintDirtLayer, paintSaltLayer } from './grime.js';
import { levelFor } from './data.js';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class DigScene {
  constructor({ canvas, stage, state, site, artifact, audio, onUpdate, onFound, onLift }) {
    this.canvas = canvas;
    this.stage = stage;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.site = site;
    this.artifact = artifact;
    this.audio = audio;
    this.onUpdate = onUpdate || (() => {});
    this.onFound = onFound || (() => {});
    this.onLift = onLift || (() => {});

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.drawing = false;
    this.last = null;
    this.progress = 0;
    this.found = false;
    this.lifted = false;
    this.particles = [];
    this.pointer = null;
    this.lastHaptic = 0;
    this.outlinePulse = 0;
    this.raf = 0;
    this.started = false;

    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this.loop = this.loop.bind(this);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    this.bind();
    this.resize();
    this.raf = requestAnimationFrame(this.loop);
  }

  bind() {
    this.canvas.addEventListener('pointerdown', this.onDown, { passive: false });
    this.canvas.addEventListener('pointermove', this.onMove, { passive: false });
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('pointerleave', (e) => {
      if (!this.drawing) this.pointer = null;
    });
  }

  destroy() {
    this.resizeObserver.disconnect();
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onUp);
    this.stage.classList.remove('is-lifting');
  }

  resize() {
    const rect = this.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.build();
    this.started = true;
    this.emit();
  }

  makeCanvas() {
    const c = document.createElement('canvas');
    c.width = Math.round(this.w * this.dpr);
    c.height = Math.round(this.h * this.dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return { c, ctx };
  }

  build() {
    const { w, h } = this;
    this.base = this.makeCanvas();
    this.sand = this.makeCanvas();
    this.relicCanvas = this.makeCanvas();

    this.cx = w * .5;
    this.cy = h * .535;
    this.relicSize = Math.min(w, h) * .58;

    this.paintRelic();
    this.paintBase();
    this.paintSand();
    this.buildGrid();

    this.progress = 0;
    this.found = false;
    this.lifted = false;
    this.particles.length = 0;
    this.last = null;
    this.drawing = false;
  }

  paintBase() {
    const { ctx } = this.base;
    const { w, h } = this;
    const g = ctx.createLinearGradient(0, 0, w * .3, h);
    g.addColorStop(0, '#5d4028');
    g.addColorStop(.45, '#715032');
    g.addColorStop(1, '#4d3421');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // compacted stratigraphy
    const layers = [
      { y: h * .18, color: 'rgba(51,33,20,.25)', height: h * .1 },
      { y: h * .43, color: 'rgba(113,78,43,.25)', height: h * .16 },
      { y: h * .72, color: 'rgba(45,29,18,.32)', height: h * .15 }
    ];
    for (const layer of layers) {
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(0, layer.y);
      for (let x = 0; x <= w; x += 30) {
        ctx.lineTo(x, layer.y + Math.sin(x * .04 + layer.y) * 4);
      }
      ctx.lineTo(w, layer.y + layer.height);
      for (let x = w; x >= 0; x -= 24) {
        ctx.lineTo(x, layer.y + layer.height + Math.cos(x * .035) * 5);
      }
      ctx.closePath();
      ctx.fill();
    }

    // lower sand texture
    const r = seeded(73);
    for (let i = 0; i < 460; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = .4 + r() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fillStyle = r() > .5 ? `rgba(226,183,119,${.05 + r() * .12})` : `rgba(35,22,13,${.06 + r() * .12})`;
      ctx.fill();
    }

    // scattered stones and bone chips
    for (let i = 0; i < 16; i++) {
      const x = r() * w, y = r() * h;
      const rw = 2 + r() * 7, rh = 1.5 + r() * 4;
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, r() * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${60 + r() * 30},${45 + r() * 20},${31 + r() * 15},.65)`;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - rw * .18, y - rh * .25, rw * .45, rh * .35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226,193,140,.14)';
      ctx.fill();
    }

    // secondary ceramic shard
    ctx.save();
    ctx.translate(w * .18, h * .7);
    ctx.rotate(-.4);
    ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.lineTo(2, -8); ctx.lineTo(13, -2); ctx.lineTo(7, 7); ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fillStyle = '#9a6a3f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(45,28,14,.55)';
    ctx.stroke();
    ctx.restore();

    // dark rim
    const edge = ctx.createLinearGradient(0, 0, 0, h);
    edge.addColorStop(0, 'rgba(20,12,6,.65)');
    edge.addColorStop(.08, 'rgba(20,12,6,0)');
    edge.addColorStop(.9, 'rgba(20,12,6,0)');
    edge.addColorStop(1, 'rgba(20,12,6,.62)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(20,12,6,.45)');
    side.addColorStop(.1, 'rgba(20,12,6,0)');
    side.addColorStop(.9, 'rgba(20,12,6,0)');
    side.addColorStop(1, 'rgba(20,12,6,.45)');
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, w, h);

    // artifact shadow drawn before relic
    drawArtifactShadow(ctx, this.cx, this.cy, this.relicSize, .42);
    ctx.drawImage(this.relicCanvas.c, 0, 0, w, h);
  }

  paintRelic() {
    const { ctx } = this.relicCanvas;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    drawArtifact(ctx, this.artifact.art, this.cx, this.cy, this.relicSize);

    // Use the same grime and salt layers as the conservation bench so the
    // lifted find does not suddenly become dirty on the next screen.
    const mask = this.makeCanvas();
    drawArtifact(mask.ctx, this.artifact.art, this.cx, this.cy, this.relicSize);
    const dirt = this.makeCanvas();
    const salt = this.makeCanvas();
    paintDirtLayer(dirt.ctx, w, h, mask.c, 113);
    paintSaltLayer(salt.ctx, w, h, mask.c, 451);
    ctx.drawImage(dirt.c, 0, 0, w, h);
    ctx.drawImage(salt.c, 0, 0, w, h);
  }

  paintSand() {
    const { ctx } = this.sand;
    const { w, h } = this;
    const r = seeded(2024);

    const g = ctx.createLinearGradient(0, 0, w * .3, h);
    g.addColorStop(0, '#e0bb7d');
    g.addColorStop(.38, '#d3a666');
    g.addColorStop(.72, '#c39152');
    g.addColorStop(1, '#b37e43');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // wind ripples
    ctx.lineWidth = 1;
    for (let i = 0; i < 22; i++) {
      const y = (i / 22) * h + Math.sin(i) * 7;
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 12) {
        const yy = y + Math.sin(x * .045 + i * .8) * 3.2 + Math.cos(x * .02) * 2;
        x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(255, 233, 190, .16)' : 'rgba(110, 73, 35, .075)';
      ctx.stroke();
    }

    // wind-blown patches
    for (let i = 0; i < 15; i++) {
      const x = r() * w, y = r() * h;
      const rw = 20 + r() * 80, rh = 8 + r() * 30;
      const pg = ctx.createRadialGradient(x, y, 0, x, y, rw);
      pg.addColorStop(0, r() > .5 ? 'rgba(244, 214, 158, .14)' : 'rgba(126, 84, 40, .09)');
      pg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, rh / rw);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(0, 0, rw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // central mound
    const mound = ctx.createRadialGradient(this.cx, this.cy, 2, this.cx, this.cy, this.relicSize * .75);
    mound.addColorStop(0, 'rgba(250, 222, 170, .26)');
    mound.addColorStop(.58, 'rgba(230, 192, 131, .11)');
    mound.addColorStop(1, 'rgba(90, 57, 27, 0)');
    ctx.fillStyle = mound;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.relicSize * .76, 0, Math.PI * 2);
    ctx.fill();

    // grit
    for (let i = 0; i < 820; i++) {
      const x = r() * w, y = r() * h;
      const rad = .3 + r() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fillStyle = r() > .48 ? `rgba(255, 236, 195, ${.08 + r() * .2})` : `rgba(84, 54, 25, ${.06 + r() * .18})`;
      ctx.fill();
    }

    // pebbles / hardpan
    for (let i = 0; i < 20; i++) {
      const x = r() * w, y = r() * h;
      const rw = 1.5 + r() * 4.2, rh = 1 + r() * 2.8;
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, r() * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${85 + r() * 45},${62 + r() * 30},${38 + r() * 20},.55)`;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - rw * .2, y - rh * .25, rw * .45, rh * .32, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 236, 199, .17)';
      ctx.fill();
    }

    // dry twigs
    ctx.strokeStyle = 'rgba(92, 58, 27, .32)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x = r() * w, y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 + r() * 12, y - 3 + r() * 7);
      ctx.lineTo(x + 18 + r() * 8, y + 2 + r() * 4);
      ctx.stroke();
    }

    // edge shade
    const edge = ctx.createLinearGradient(0, 0, 0, h);
    edge.addColorStop(0, 'rgba(75, 46, 21, .38)');
    edge.addColorStop(.08, 'rgba(75, 46, 21, 0)');
    edge.addColorStop(.9, 'rgba(75, 46, 21, 0)');
    edge.addColorStop(1, 'rgba(75, 46, 21, .4)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(75, 46, 21, .28)');
    side.addColorStop(.08, 'rgba(75, 46, 21, 0)');
    side.addColorStop(.92, 'rgba(75, 46, 21, 0)');
    side.addColorStop(1, 'rgba(75, 46, 21, .3)');
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, w, h);
  }

  buildGrid() {
    const { w, h } = this;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = Math.round(w * this.dpr);
    maskCanvas.height = Math.round(h * this.dpr);
    const mctx = maskCanvas.getContext('2d');
    mctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawArtifact(mctx, this.artifact.art, this.cx, this.cy, this.relicSize);
    const data = mctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;

    this.cell = Math.max(5, Math.round(Math.min(w, h) / 52));
    this.cols = Math.ceil(w / this.cell);
    this.rows = Math.ceil(h / this.cell);
    this.grid = new Uint8Array(this.cols * this.rows);
    this.gridMask = new Uint8Array(this.cols * this.rows);
    this.totalCells = 0;

    for (let gy = 0; gy < this.rows; gy++) {
      for (let gx = 0; gx < this.cols; gx++) {
        const x = Math.round((gx + .5) * this.cell * this.dpr);
        const y = Math.round((gy + .5) * this.cell * this.dpr);
        if (x < 0 || y < 0 || x >= maskCanvas.width || y >= maskCanvas.height) continue;
        const alpha = data[(y * maskCanvas.width + x) * 4 + 3];
        if (alpha > 32) {
          this.gridMask[gy * this.cols + gx] = 1;
          this.totalCells++;
        }
      }
    }
  }

  point(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  onDown(e) {
    if (this.lifted) return;
    e.preventDefault();
    this.audio.ensure();
    this.drawing = true;
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.point(e);
    this.last = p;
    this.pointer = p;
    this.erase(p.x, p.y);
    this.stage.classList.add('is-drawing');
    this.stage.dispatchEvent(new CustomEvent('dig-start'));
  }

  onMove(e) {
    if (this.lifted) return;
    const p = this.point(e);
    this.pointer = p;
    if (!this.drawing) return;
    e.preventDefault();
    if (this.last) {
      const dx = p.x - this.last.x, dy = p.y - this.last.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 8));
      for (let i = 1; i <= steps; i++) {
        this.erase(lerp(this.last.x, p.x, i / steps), lerp(this.last.y, p.y, i / steps));
      }
    } else {
      this.erase(p.x, p.y);
    }
    this.last = p;
  }

  onUp() {
    this.drawing = false;
    this.last = null;
    this.stage.classList.remove('is-drawing');
    this.emit();
  }

  radius() {
    const level = levelFor(this.state, 'trowel');
    return (39 + (level - 1) * 9) * Math.min(1.25, Math.max(.78, this.w / 380));
  }

  erase(x, y) {
    if (this.progress >= .999) return;
    const radius = this.radius();
    const ctx = this.sand.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2;
      const off = i === 0 ? 0 : radius * (.1 + Math.random() * .22);
      const rr = radius * (i === 0 ? 1 : .72 + Math.random() * .3);
      const g = ctx.createRadialGradient(x + Math.cos(a) * off, y + Math.sin(a) * off, rr * .16, x + Math.cos(a) * off, y + Math.sin(a) * off, rr);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(.68, 'rgba(0,0,0,.93)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * off, y + Math.sin(a) * off, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.markGrid(x, y, radius * .82);
    this.spawnSand(x, y, radius);
    this.audio.dig();
    this.haptic(7);
    this.emit();
  }

  markGrid(x, y, radius) {
    const cs = this.cell;
    const x0 = Math.max(0, Math.floor((x - radius) / cs));
    const x1 = Math.min(this.cols - 1, Math.ceil((x + radius) / cs));
    const y0 = Math.max(0, Math.floor((y - radius) / cs));
    const y1 = Math.min(this.rows - 1, Math.ceil((y + radius) / cs));
    let added = 0;
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const idx = gy * this.cols + gx;
        if (!this.gridMask[idx] || this.grid[idx]) continue;
        const cx = (gx + .5) * cs;
        const cy = (gy + .5) * cs;
        if (Math.hypot(cx - x, cy - y) <= radius) {
          this.grid[idx] = 1;
          added++;
        }
      }
    }
    if (added) {
      let covered = 0;
      for (let i = 0; i < this.grid.length; i++) if (this.grid[i]) covered++;
      const p = this.totalCells ? covered / this.totalCells : 0;
      if (p > this.progress) this.progress = p;
      if (!this.found && this.progress >= .55) {
        this.found = true;
        this.audio.discover();
        this.vibrate([25, 45, 40]);
        this.onFound(this.progress);
      }
    }
  }

  spawnSand(x, y, radius) {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = .3 + Math.random() * 1.6;
      this.particles.push({
        x: x + Math.cos(a) * radius * .6,
        y: y + Math.sin(a) * radius * .6,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - .8,
        r: .7 + Math.random() * 2,
        life: 1,
        decay: .018 + Math.random() * .025,
        color: Math.random() > .5 ? 'rgba(238, 205, 151,' : 'rgba(139, 94, 48,'
      });
    }
    if (this.particles.length > 160) this.particles.splice(0, this.particles.length - 160);
  }

  haptic(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  emit() {
    const pct = Math.round(this.progress * 100);
    const stratum = this.progress < .28 ? 'I' : this.progress < .62 ? 'II' : 'III';
    const depth = (this.progress * .94).toFixed(1);
    this.onUpdate({
      progress: this.progress,
      pct,
      stratum,
      depth,
      found: this.found,
      signal: Math.round(70 + this.progress * 29)
    });
  }

  pulse() {
    this.outlinePulse = 1;
    this.audio.pulse();
    this.vibrate(12);
    this.emit();
  }

  lift() {
    if (!this.found || this.lifted) return;
    this.lifted = true;
    this.drawing = false;
    this.stage.classList.add('is-lifting');
    this.audio.complete();
    this.vibrate([15, 30, 50, 30, 80]);
    setTimeout(() => {
      this.onLift();
    }, 620);
  }

  loop() {
    if (!this.started) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.base.c, 0, 0, w, h);
    ctx.save();
    ctx.shadowColor = 'rgba(31, 17, 6, .5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.drawImage(this.sand.c, 0, 0, w, h);
    ctx.restore();

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .025;
      p.life -= p.decay;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.life * .55).toFixed(2) + ')';
      ctx.fill();
    }

    // sonar outline
    const sonar = levelFor(this.state, 'sonar');
    const baseAlpha = sonar >= 3 ? .17 : sonar >= 2 ? .09 : 0;
    const pulse = Math.max(0, this.outlinePulse);
    const alpha = Math.max(baseAlpha, pulse * .65);
    if (alpha > .01) {
      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -performance.now() * .012;
      ctx.strokeStyle = `rgba(177, 228, 200, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.relicSize * .39, this.relicSize * .38, -.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      this.outlinePulse = Math.max(0, this.outlinePulse - .012);
    }

    // cursor
    if (this.pointer && (this.drawing || this.pointerFresh)) {
      const r = this.radius();
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = this.drawing ? 'rgba(255, 241, 205, .58)' : 'rgba(255, 241, 205, .28)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash(this.drawing ? [] : [4, 5]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 241, 205, .4)';
      ctx.fill();
      ctx.restore();
    }

    // soft vignette
    const vig = ctx.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .25, w * .5, h * .5, Math.max(w, h) * .72);
    vig.addColorStop(0, 'rgba(24,14,6,0)');
    vig.addColorStop(1, 'rgba(24,14,6,.22)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    this.raf = requestAnimationFrame(this.loop);
  }
}
