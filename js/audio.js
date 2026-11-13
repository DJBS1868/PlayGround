// GREEN EMPIRE — tiny synthesized sound engine (no external assets).
export class Audio {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.master = null;
    this.enabled = game?.state?.settings?.sound !== false;
    this.ambientStarted = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? .18 : 0;
      this.master.connect(this.ctx.destination);
      this.startAmbient();
    } catch { this.ctx = null; }
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(this.enabled ? .18 : 0, this.ctx.currentTime + .12);
    }
    if (this.enabled) this.init();
  }

  tone(freq, dur = .12, type = 'sine', gain = .5, slideTo = null, delay = 0) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    osc.connect(g); g.connect(this.master);
    osc.start(t0); osc.stop(t0 + dur + .03);
  }

  noise(dur = .18, gain = .22, band = 1200, delay = 0) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = band; filter.Q.value = .9;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(filter); filter.connect(g); g.connect(this.master);
    src.start(t0);
  }

  startAmbient() {
    if (this.ambientStarted || !this.ctx || !this.master) return;
    this.ambientStarted = true;
    // Low, slow city hum: two detuned sines under a gentle filter.
    const g = this.ctx.createGain();
    g.gain.value = .05;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 320;
    g.connect(filter); filter.connect(this.master);
    [55, 82.4, 110].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      const og = this.ctx.createGain();
      og.gain.value = i === 2 ? .16 : .28;
      o.connect(og); og.connect(g);
      o.start();
    });
    // Very quiet filtered noise bed for room tone.
    const len = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = last * .985 + (Math.random() * 2 - 1) * .015; d[i] = last; }
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const ng = this.ctx.createGain(); ng.gain.value = .5;
    src.connect(ng); ng.connect(g);
    src.start();
  }

  click() { this.tone(520, .06, 'triangle', .28, 660); }
  plant() { this.noise(.14, .16, 900); this.tone(220, .12, 'sine', .24, 320); }
  water() { this.noise(.22, .18, 2100); this.tone(660, .09, 'sine', .14, 780, .05); }
  harvest() {
    this.noise(.12, .12, 1600);
    this.tone(392, .1, 'triangle', .25, 523);
    this.tone(659, .16, 'sine', .18, 784, .08);
  }
  cash() {
    this.tone(1046, .07, 'square', .18, 1318);
    this.tone(1318, .1, 'square', .16, 1568, .07);
    this.tone(1568, .18, 'sine', .18, 2093, .14);
  }
  success() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .16, 'triangle', .2, f, i * .07));
  }
  error() { this.tone(160, .16, 'sawtooth', .2, 110); this.tone(120, .2, 'square', .12, 80, .05); }
  siren() {
    for (let i = 0; i < 4; i++) {
      this.tone(760, .34, 'sawtooth', .16, 1120, i * .36);
      this.tone(1090, .3, 'sawtooth', .12, 720, i * .36 + .18);
    }
  }
}
