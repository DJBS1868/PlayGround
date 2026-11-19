export class Soundscape {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.started = false;
    this.muted = false;
    this.timers = { bird: 4, cricket: 3, step: 0.2, pop: 0.4 };
    this.nearFire = 0;
    this.volume = 0.62;
  }

  async start() {
    if (this.started) {
      if (this.ctx?.state === 'suspended') await this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // reusable soft noise
    const len = Math.floor(ctx.sampleRate * 2.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[i] = last * 4.5 + white * 0.14;
    }
    this.noise = buf;

    // wind
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = buf;
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 430;
    windFilter.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    windSrc.connect(windFilter).connect(windGain).connect(this.master);
    windSrc.start();
    this.wind = { filter: windFilter, gain: windGain };

    // distant surf
    const seaSrc = ctx.createBufferSource();
    seaSrc.buffer = buf;
    seaSrc.loop = true;
    const seaFilter = ctx.createBiquadFilter();
    seaFilter.type = 'bandpass';
    seaFilter.frequency.value = 260;
    seaFilter.Q.value = 0.6;
    const seaGain = ctx.createGain();
    seaGain.gain.value = 0.022;
    seaSrc.connect(seaFilter).connect(seaGain).connect(this.master);
    seaSrc.start();
    this.sea = { filter: seaFilter, gain: seaGain };

    // fire bed
    const fireSrc = ctx.createBufferSource();
    fireSrc.buffer = buf;
    fireSrc.loop = true;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'bandpass';
    fireFilter.frequency.value = 720;
    fireFilter.Q.value = 0.55;
    const fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    fireSrc.connect(fireFilter).connect(fireGain).connect(this.master);
    fireSrc.start();
    this.fire = { filter: fireFilter, gain: fireGain };

    this.started = true;
    if (ctx.state === 'suspended') await ctx.resume();
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, ctx.currentTime, 0.8);
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.15);
  }

  setPaused(paused) {
    if (!this.ctx) return;
    if (paused) this.ctx.suspend().catch(() => {});
    else this.ctx.resume().catch(() => {});
  }

  tone({ freq = 440, endFreq = null, dur = 0.15, gain = 0.03, type = 'sine', pan = 0, when = 0 }) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    osc.connect(g).connect(p).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  noiseBurst({ dur = 0.12, gain = 0.02, freq = 900, q = 0.8, type = 'bandpass', pan = 0, when = 0 }) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(f).connect(g).connect(p).connect(this.master);
    src.start(t, Math.random() * 1.4);
    src.stop(t + dur + 0.03);
  }

  bird() {
    if (!this.ctx) return;
    const pan = Math.random() * 1.4 - 0.7;
    const base = 1700 + Math.random() * 1300;
    const notes = 2 + ((Math.random() * 3) | 0);
    let when = 0;
    for (let i = 0; i < notes; i++) {
      const up = Math.random() > 0.45;
      this.tone({
        freq: base * (0.94 + Math.random() * 0.12),
        endFreq: base * (up ? 1.28 : 0.82),
        dur: 0.055 + Math.random() * 0.05,
        gain: 0.012 + Math.random() * 0.014,
        type: 'sine',
        pan,
        when,
      });
      when += 0.075 + Math.random() * 0.08;
    }
  }

  cricket() {
    const pan = Math.random() * 1.6 - 0.8;
    const base = 2350 + Math.random() * 650;
    const pulses = 3 + ((Math.random() * 3) | 0);
    let when = 0;
    for (let i = 0; i < pulses; i++) {
      this.tone({ freq: base, endFreq: base * 0.98, dur: 0.028, gain: 0.005, type: 'sine', pan, when });
      when += 0.055;
    }
  }

  crackle() {
    if (!this.ctx) return;
    this.noiseBurst({ dur: 0.035 + Math.random() * 0.05, gain: 0.01 + Math.random() * 0.02, freq: 1400 + Math.random() * 900, q: 1.2, pan: (Math.random() - 0.5) * 0.5 });
  }

  step() {
    this.noiseBurst({ dur: 0.09, gain: 0.006, freq: 380, q: 0.6, type: 'lowpass', pan: (Math.random() - 0.5) * 0.3 });
  }

  chop() {
    this.tone({ freq: 135, endFreq: 62, dur: 0.13, gain: 0.05, type: 'sine' });
    this.noiseBurst({ dur: 0.1, gain: 0.026, freq: 520, q: 0.7, type: 'lowpass' });
  }

  mine() {
    this.tone({ freq: 96, endFreq: 54, dur: 0.16, gain: 0.04, type: 'sine' });
    this.noiseBurst({ dur: 0.12, gain: 0.022, freq: 1900, q: 1.1 });
  }

  pick() {
    this.tone({ freq: 620, endFreq: 420, dur: 0.09, gain: 0.018, type: 'sine' });
    this.noiseBurst({ dur: 0.08, gain: 0.012, freq: 1200, q: 0.9 });
  }

  craft() {
    this.tone({ freq: 523, dur: 0.32, gain: 0.022, type: 'sine', when: 0 });
    this.tone({ freq: 784, dur: 0.4, gain: 0.016, type: 'sine', when: 0.09 });
    this.tone({ freq: 1046, dur: 0.34, gain: 0.009, type: 'sine', when: 0.17 });
  }

  build() {
    this.noiseBurst({ dur: 0.16, gain: 0.026, freq: 300, q: 0.7, type: 'lowpass' });
    this.tone({ freq: 180, endFreq: 110, dur: 0.18, gain: 0.035, type: 'sine' });
    this.craft();
  }

  eat() {
    this.tone({ freq: 340, endFreq: 250, dur: 0.1, gain: 0.02, type: 'sine' });
    this.noiseBurst({ dur: 0.08, gain: 0.012, freq: 700, q: 0.7, type: 'lowpass' });
  }

  faint() {
    this.tone({ freq: 220, endFreq: 110, dur: 1.4, gain: 0.025, type: 'sine' });
    this.tone({ freq: 330, endFreq: 165, dur: 1.6, gain: 0.012, type: 'sine', when: 0.1 });
  }

  wake() {
    this.tone({ freq: 392, dur: 0.4, gain: 0.02, type: 'sine' });
    this.tone({ freq: 523, dur: 0.5, gain: 0.014, type: 'sine', when: 0.14 });
  }

  update(dt, state) {
    if (!this.started || !this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const daylight = state.daylight ?? 1;
    const moving = state.moving;

    const windTarget = 0.038 + 0.016 * Math.sin(t * 0.14) + 0.01 * Math.sin(t * 0.037);
    this.wind.gain.gain.setTargetAtTime(windTarget, t, 0.5);
    this.wind.filter.frequency.setTargetAtTime(360 + 130 * (0.5 + 0.5 * Math.sin(t * 0.11)), t, 0.8);
    this.sea.gain.gain.setTargetAtTime(0.014 + 0.012 * (0.5 + 0.5 * Math.sin(t * 0.09 + 1.4)), t, 0.7);

    const fireTarget = state.nearFire ? 0.026 : 0;
    this.fire.gain.gain.setTargetAtTime(fireTarget, t, 0.4);

    this.timers.bird -= dt;
    this.timers.cricket -= dt;
    this.timers.step -= dt;
    this.timers.pop -= dt;

    if (this.timers.bird <= 0) {
      this.timers.bird = 6 + Math.random() * 12;
      if (daylight > 0.45) this.bird();
    }
    if (this.timers.cricket <= 0) {
      this.timers.cricket = 2.4 + Math.random() * 5;
      if (daylight < 0.3) this.cricket();
    }
    if (this.timers.pop <= 0) {
      this.timers.pop = 0.18 + Math.random() * 0.55;
      if (state.nearFire) this.crackle();
    }
    if (moving) {
      if (this.timers.step <= 0) {
        this.timers.step = 0.33;
        this.step();
      }
    } else {
      this.timers.step = 0.15;
    }
  }
}
