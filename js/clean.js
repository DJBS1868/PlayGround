import { drawArtifact, drawArtifactShadow } from './art.js';
import { levelFor, cleaningGrade } from './data.js';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class CleanScene {
  constructor({ canvas, stage, state, artifact, audio, onUpdate, onPhase, onComplete, onHint }) {
    this.canvas = canvas;
    this.stage = stage;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.artifact = artifact;
    this.audio = audio;
    this.onUpdate = onUpdate || (() => {});
    this.onPhase = onPhase || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onHint = onHint || (() => {});

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.tool = 'brush';
    this.phase = 'clean';
    this.drawing = false;
    this.pointer = null;
    this.last = null;
    this.particles = [];
    this.raf = 0;
    this.started = false;
    this.completed = false;
    this.polish = 0;
    this.dirtCount = 0;
    this.saltCount = 0;
    this.dirtTotal = 1;
    this.saltTotal = 1;
    this.lastHaptic = 0;
    this.lastSound = 0;
    this.lastHint = 0;

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
    this.canvas.addEventListener('pointerleave', () => {
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
    this.bg = this.makeCanvas();
    this.base = this.makeCanvas();
    this.dirt = this.makeCanvas();
    this.salt = this.makeCanvas();
    this.mask = this.makeCanvas();

    this.cx = w * .5;
    this.cy = h * .52;
    this.size = Math.min(w, h) * .64;

    this.paintBackground();
    drawArtifact(this.base.ctx, this.artifact.art, this.cx, this.cy, this.size);

    this.mask.ctx.clearRect(0, 0, w, h);
    drawArtifact(this.mask.ctx, this.artifact.art, this.cx, this.cy, this.size);

    this.paintDirt();
    this.paintSalt();
    this.buildGrid();

    this.particles.length = 0;
    this.pointer = null;
    this.last = null;
    this.drawing = false;
    this.completed = false;
    this.polish = 0;
    this.phase = 'clean';
    this.dirtCount = this.dirtTotal;
    this.saltCount = this.saltTotal;
  }

  paintBackground() {
    const { ctx } = this.bg;
    const { w, h } = this;
    const g = ctx.createRadialGradient(w * .5, h * .42, 10, w * .5, h * .48, Math.max(w, h) * .72);
    g.addColorStop(0, '#32413b');
    g.addColorStop(.48, '#1b2723');
    g.addColorStop(1, '#0c1311');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // faint conservation grid
    ctx.strokeStyle = 'rgba(186, 220, 204, .045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 28) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // tray rim
    const inset = Math.min(w, h) * .08;
    const r = 16;
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, r);
    ctx.fillStyle = 'rgba(255,255,255,.018)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 226, 211, .12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(inset + 4, inset + 4, w - inset * 2 - 8, h - inset * 2 - 8, r - 4);
    ctx.strokeStyle = 'rgba(198, 226, 211, .045)';
    ctx.stroke();

    // ruler ticks
    ctx.strokeStyle = 'rgba(198, 226, 211, .12)';
    for (let i = 0; i < 17; i++) {
      const x = inset + 12 + i * ((w - inset * 2 - 24) / 16);
      const len = i % 4 === 0 ? 7 : 3;
      ctx.beginPath();
      ctx.moveTo(x, h - inset - 9);
      ctx.lineTo(x, h - inset - 9 - len);
      ctx.stroke();
    }

    // ambient dust
    const rr = seeded(91);
    for (let i = 0; i < 55; i++) {
      ctx.beginPath();
      ctx.arc(rr() * w, rr() * h, .3 + rr() * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 236, 224, ${.03 + rr() * .08})`;
      ctx.fill();
    }

    drawArtifactShadow(ctx, this.cx, this.cy, this.size, .5);

    // glass reflection
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sheen = ctx.createLinearGradient(0, inset, w, h * .7);
    sheen.addColorStop(0, 'rgba(255,255,255,.025)');
    sheen.addColorStop(.35, 'rgba(255,255,255,0)');
    sheen.addColorStop(.62, 'rgba(255,255,255,.018)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  paintDirt() {
    const { ctx } = this.dirt;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const rr = seeded(113);

    ctx.fillStyle = 'rgba(72, 54, 35, .92)';
    ctx.fillRect(0, 0, w, h);

    // mottled encrustation
    for (let i = 0; i < 130; i++) {
      const x = rr() * w, y = rr() * h;
      const rw = 3 + rr() * 20, rh = 2 + rr() * 13;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rw);
      const dark = rr() > .46;
      g.addColorStop(0, dark ? `rgba(45, 32, 20, ${.16 + rr() * .28})` : `rgba(137, 108, 72, ${.1 + rr() * .23})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, rh / rw);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // grime grain
    for (let i = 0; i < 460; i++) {
      ctx.beginPath();
      ctx.arc(rr() * w, rr() * h, .3 + rr() * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = rr() > .5 ? `rgba(154, 123, 79, ${.05 + rr() * .17})` : `rgba(38, 27, 17, ${.06 + rr() * .18})`;
      ctx.fill();
    }

    // crust cracks
    ctx.strokeStyle = 'rgba(35, 24, 15, .32)';
    for (let i = 0; i < 12; i++) {
      let x = rr() * w, y = rr() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (rr() - .5) * 28;
        y += (rr() - .5) * 28;
        ctx.lineTo(x, y);
      }
      ctx.lineWidth = .6 + rr() * .8;
      ctx.stroke();
    }

    // clip to artifact silhouette
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.mask.c, 0, 0, w, h);
    ctx.restore();
  }

  paintSalt() {
    const { ctx } = this.salt;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const rr = seeded(451);

    // base crust
    ctx.fillStyle = 'rgba(224, 220, 199, .42)';
    ctx.fillRect(0, 0, w, h);

    // crystalline blooms
    for (let i = 0; i < 80; i++) {
      const x = rr() * w, y = rr() * h;
      const r = 4 + rr() * 18;
      const g = ctx.createRadialGradient(x - r * .2, y - r * .25, 0, x, y, r);
      g.addColorStop(0, `rgba(255, 253, 239, ${.18 + rr() * .22})`);
      g.addColorStop(.55, `rgba(211, 219, 207, ${.08 + rr() * .14})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // salt veins / crack fill
    for (let i = 0; i < 22; i++) {
      let x = rr() * w, y = rr() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (rr() - .5) * 18;
        y += (rr() - .5) * 18;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(248, 247, 231, ${.08 + rr() * .22})`;
      ctx.lineWidth = 1 + rr() * 2.6;
      ctx.stroke();
    }

    // blue-grey shadows in the salt
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(rr() * w, rr() * h, 2 + rr() * 9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(117, 139, 133, ${.025 + rr() * .09})`;
      ctx.fill();
    }

    // clip
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.mask.c, 0, 0, w, h);
    ctx.restore();
  }

  buildGrid() {
    const { w, h } = this;
    const mw = this.mask.c.width;
    const mh = this.mask.c.height;
    const data = this.mask.ctx.getImageData(0, 0, mw, mh).data;
    this.cell = Math.max(4, Math.round(Math.min(w, h) / 58));
    this.cols = Math.ceil(w / this.cell);
    this.rows = Math.ceil(h / this.cell);
    this.gridMask = new Uint8Array(this.cols * this.rows);
    this.dirtGrid = new Uint8Array(this.cols * this.rows);
    this.saltGrid = new Uint8Array(this.cols * this.rows);
    this.dirtTotal = 0;
    this.saltTotal = 0;
    for (let gy = 0; gy < this.rows; gy++) {
      for (let gx = 0; gx < this.cols; gx++) {
        const x = Math.round((gx + .5) * this.cell * this.dpr);
        const y = Math.round((gy + .5) * this.cell * this.dpr);
        if (x < 0 || y < 0 || x >= mw || y >= mh) continue;
        if (data[(y * mw + x) * 4 + 3] > 32) {
          const idx = gy * this.cols + gx;
          this.gridMask[idx] = 1;
          this.dirtGrid[idx] = 1;
          this.saltGrid[idx] = 1;
          this.dirtTotal++;
          this.saltTotal++;
        }
      }
    }
    this.dirtCount = this.dirtTotal;
    this.saltCount = this.saltTotal;
  }

  setTool(tool) {
    if (tool === this.tool) return;
    this.tool = tool;
    this.pointer = null;
    this.audio.click();
  }

  point(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  onDown(e) {
    if (this.completed) return;
    e.preventDefault();
    this.audio.ensure();
    this.drawing = true;
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.point(e);
    this.last = p;
    this.pointer = p;
    this.applyTool(p.x, p.y);
    this.stage.dispatchEvent(new CustomEvent('clean-start'));
  }

  onMove(e) {
    if (this.completed) return;
    const p = this.point(e);
    this.pointer = p;
    if (!this.drawing) return;
    e.preventDefault();
    if (this.last) {
      const dx = p.x - this.last.x, dy = p.y - this.last.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 6));
      for (let i = 1; i <= steps; i++) {
        this.applyTool(this.last.x + dx * (i / steps), this.last.y + dy * (i / steps));
      }
    } else {
      this.applyTool(p.x, p.y);
    }
    this.last = p;
  }

  onUp() {
    this.drawing = false;
    this.last = null;
    this.emit();
  }

  toolRadius() {
    const scale = Math.min(1.2, Math.max(.8, Math.min(this.w, this.h) / 360));
    if (this.tool === 'brush') return (46 + (levelFor(this.state, 'brush') - 1) * 6) * scale;
    if (this.tool === 'water') return (58 + (levelFor(this.state, 'water') - 1) * 8) * scale;
    return (44 + (levelFor(this.state, 'cloth') - 1) * 6) * scale;
  }

  applyTool(x, y) {
    if (this.phase === 'done') return;
    const radius = this.toolRadius();
    if (this.tool === 'brush') {
      if (this.phase === 'polish') {
        this.hint('The crust is gone — buff it with the cloth.', 900);
        return;
      }
      const before = this.dirtCount;
      this.erase(this.dirt.ctx, x, y, radius);
      this.mark('dirt', x, y, radius * .88);
      if (this.dirtCount < before) {
        this.audio.brush();
        this.spawnDust(x, y, radius, 'rgba(105, 82, 54,');
        this.haptic(5);
      }
      if (this.dirtCount / this.dirtTotal > .28 && this.saltCount / this.saltTotal < .3) {
        this.hint('Salt crust remains. Switch to the water tool.', 1500);
      }
    } else if (this.tool === 'water') {
      if (this.phase === 'polish') {
        this.hint('The crust is gone — buff it with the cloth.', 900);
        return;
      }
      const before = this.saltCount;
      this.erase(this.salt.ctx, x, y, radius);
      this.mark('salt', x, y, radius * .92);
      if (this.saltCount < before) {
        this.audio.water();
        this.spawnWater(x, y, radius);
        this.haptic(4);
      }
      if (this.saltCount / this.saltTotal > .28 && this.dirtCount / this.dirtTotal < .3) {
        this.hint('The grime needs a dry brush first.', 1500);
      }
    } else {
      if (this.phase === 'clean') {
        this.hint('Clear the grime and salt before polishing.', 1300);
        return;
      }
      const level = levelFor(this.state, 'cloth');
      this.polish = clamp(this.polish + .009 * (1 + (level - 1) * .26), 0, 1);
      this.audio.cloth();
      this.spawnSpark(x, y, radius);
      this.haptic(3);
      if (this.polish >= 1 && !this.completed) this.finish();
    }
    this.checkPhase();
    this.emit();
  }

  erase(ctx, x, y, radius) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(x, y, radius * .22, x, y, radius);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(.72, 'rgba(0,0,0,.93)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  mark(kind, x, y, radius) {
    const grid = kind === 'dirt' ? this.dirtGrid : this.saltGrid;
    const cs = this.cell;
    const x0 = Math.max(0, Math.floor((x - radius) / cs));
    const x1 = Math.min(this.cols - 1, Math.ceil((x + radius) / cs));
    const y0 = Math.max(0, Math.floor((y - radius) / cs));
    const y1 = Math.min(this.rows - 1, Math.ceil((y + radius) / cs));
    let removed = 0;
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const idx = gy * this.cols + gx;
        if (!this.gridMask[idx] || !grid[idx]) continue;
        const cx = (gx + .5) * cs;
        const cy = (gy + .5) * cs;
        if (Math.hypot(cx - x, cy - y) <= radius) {
          grid[idx] = 0;
          removed++;
        }
      }
    }
    if (kind === 'dirt') this.dirtCount = Math.max(0, this.dirtCount - removed);
    else this.saltCount = Math.max(0, this.saltCount - removed);
  }

  checkPhase() {
    if (this.phase === 'clean') {
      const dirt = this.dirtCount / Math.max(1, this.dirtTotal);
      const salt = this.saltCount / Math.max(1, this.saltTotal);
      if (dirt <= .08 && salt <= .08) {
        this.phase = 'polish';
        this.polish = 0;
        this.audio.discover();
        if (navigator.vibrate) navigator.vibrate([18, 35, 18]);
        this.onPhase('polish');
      }
    }
  }

  finish() {
    this.completed = true;
    this.phase = 'done';
    this.audio.complete();
    if (navigator.vibrate) navigator.vibrate([25, 50, 30, 50, 80]);
    const dirt = this.dirtCount / Math.max(1, this.dirtTotal);
    const salt = this.saltCount / Math.max(1, this.saltTotal);
    const lab = cleaningGrade(this.state);
    const penalty = Math.max(0, this.artifact.fragility - lab) * 6;
    const cleanScore = (1 - dirt) * .55 + (1 - salt) * .45;
    const condition = Math.round(clamp(100 - (1 - cleanScore) * 90 - penalty, 52, 100));
    this.onPhase('done');
    this.onComplete({ condition, dirt, salt, polish: this.polish, lab });
    this.emit();
  }

  emit() {
    const dirt = this.dirtCount / Math.max(1, this.dirtTotal);
    const salt = this.saltCount / Math.max(1, this.saltTotal);
    this.onUpdate({
      dirt,
      salt,
      polish: this.polish,
      phase: this.phase,
      tool: this.tool
    });
  }

  hint(message, cooldown = 1000) {
    const now = performance.now();
    if (now - this.lastHint < cooldown) return;
    this.lastHint = now;
    this.onHint(message);
  }

  haptic(ms) {
    const now = performance.now();
    if (now - this.lastHaptic < 110) return;
    this.lastHaptic = now;
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  spawnDust(x, y, radius, color) {
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        type: 'dust',
        x: x + Math.cos(a) * radius * .7,
        y: y + Math.sin(a) * radius * .7,
        vx: Math.cos(a) * (.4 + Math.random()),
        vy: Math.sin(a) * (.4 + Math.random()) - .4,
        r: .8 + Math.random() * 2.2,
        life: 1,
        decay: .02 + Math.random() * .025,
        color
      });
    }
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
  }

  spawnWater(x, y, radius) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        type: 'water',
        x: x + Math.cos(a) * radius * .6,
        y: y + Math.sin(a) * radius * .6,
        vx: Math.cos(a) * (.5 + Math.random() * 1.4),
        vy: Math.sin(a) * (.5 + Math.random()) - .5,
        r: .8 + Math.random() * 2,
        life: 1,
        decay: .025 + Math.random() * .03,
        color: 'rgba(174, 226, 216,'
      });
    }
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
  }

  spawnSpark(x, y, radius) {
    if (Math.random() > .55) return;
    const a = Math.random() * Math.PI * 2;
    this.particles.push({
      type: 'spark',
      x: x + Math.cos(a) * radius * .8,
      y: y + Math.sin(a) * radius * .8,
      vx: Math.cos(a) * .25,
      vy: -.4 - Math.random() * .6,
      r: .8 + Math.random() * 1.8,
      life: 1,
      decay: .014 + Math.random() * .018,
      color: 'rgba(255, 236, 177,'
    });
  }

  loop() {
    if (!this.started) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(this.bg.c, 0, 0, w, h);

    // reveal halo grows as the artifact gets cleaner
    const cleanAmount = 1 - (this.dirtCount / Math.max(1, this.dirtTotal) + this.saltCount / Math.max(1, this.saltTotal)) / 2;
    if (cleanAmount > .2) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(this.cx, this.cy, this.size * .1, this.cx, this.cy, this.size * .6);
      glow.addColorStop(0, `rgba(255, 232, 174, ${.06 * cleanAmount})`);
      glow.addColorStop(1, 'rgba(255,232,174,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    ctx.drawImage(this.base.c, 0, 0, w, h);
    ctx.drawImage(this.dirt.c, 0, 0, w, h);
    ctx.drawImage(this.salt.c, 0, 0, w, h);

    // final lustre
    if (this.polish > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = this.polish * .36;
      const sh = ctx.createLinearGradient(this.cx - this.size * .4, this.cy - this.size * .4, this.cx + this.size * .4, this.cy + this.size * .4);
      sh.addColorStop(0, 'rgba(255, 250, 218, 0)');
      sh.addColorStop(.38, 'rgba(255, 245, 202, .55)');
      sh.addColorStop(.52, 'rgba(255, 255, 240, .1)');
      sh.addColorStop(.72, 'rgba(255, 240, 186, .32)');
      sh.addColorStop(1, 'rgba(255,250,218,0)');
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(this.cx, this.cy, this.size * .31, this.size * .35, -.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // twinkles
      const time = performance.now() * .001;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        const a = time * .45 + i * Math.PI / 2;
        const rad = this.size * (.3 + i * .018);
        const x = this.cx + Math.cos(a) * rad;
        const y = this.cy + Math.sin(a) * rad * .7;
        const tw = (Math.sin(time * 2.2 + i * 1.7) + 1) * .5;
        ctx.globalAlpha = this.polish * (.25 + tw * .55);
        ctx.strokeStyle = '#fff2c4';
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.type === 'water' ? .09 : p.type === 'spark' ? -.008 : .018;
      p.life -= p.decay;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      ctx.beginPath();
      if (p.type === 'spark') {
        ctx.fillStyle = p.color + (p.life * .9).toFixed(2) + ')';
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color + (p.life * .6).toFixed(2) + ')';
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // cursor
    if (this.pointer && this.drawing) {
      const radius = this.toolRadius();
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.tool === 'water' ? 'rgba(158, 220, 211, .55)' : this.tool === 'cloth' ? 'rgba(247, 220, 161, .55)' : 'rgba(255, 240, 211, .5)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fill();
      ctx.restore();
    }

    // stage vignette
    const vig = ctx.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .24, w * .5, h * .5, Math.max(w, h) * .75);
    vig.addColorStop(0, 'rgba(2,8,7,0)');
    vig.addColorStop(1, 'rgba(2,8,7,.36)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    this.raf = requestAnimationFrame(this.loop);
  }
}
