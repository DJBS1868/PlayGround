/* Tiny procedural sound engine — no external audio assets. */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambient = null;
    this.noiseBuffer = null;
    this.muted = localStorage.getItem('dd_muted') === '1';
    this.lastBrush = 0;
    this.lastDig = 0;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : .26;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise(2.4);
      this.startWind();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  makeNoise(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * .985 + white * .015;
      data[i] = last * 3.2 + white * .15;
    }
    return buffer;
  }

  startWind() {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.Q.value = .35;
    const gain = this.ctx.createGain();
    gain.gain.value = .022;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = .075;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = .011;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    lfo.start();
    this.ambient = gain;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('dd_muted', muted ? '1' : '0');
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : .26, this.ctx.currentTime + .18);
    }
  }

  noiseBurst({ freq = 700, q = .8, dur = .08, vol = .15, type = 'bandpass' } = {}) {
    if (!this.ensure() || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t, Math.random() * 1.4, dur + .03);
  }

  tone(freq, dur = .12, vol = .05, type = 'sine', delay = 0) {
    if (!this.ensure() || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + .04);
  }

  click() {
    this.tone(240, .06, .03, 'triangle');
    this.noiseBurst({ freq: 1800, q: 1.4, dur: .025, vol: .025 });
  }

  dig() {
    if (!this.ensure() || this.muted) return;
    const now = performance.now();
    if (now - this.lastDig < 70) return;
    this.lastDig = now;
    this.noiseBurst({ freq: 420 + Math.random() * 160, q: .7, dur: .055, vol: .11 });
  }

  brush() {
    if (!this.ensure() || this.muted) return;
    const now = performance.now();
    if (now - this.lastBrush < 55) return;
    this.lastBrush = now;
    this.noiseBurst({ freq: 2100 + Math.random() * 900, q: 1.2, dur: .045, vol: .045, type: 'highpass' });
  }

  water() {
    if (!this.ensure() || this.muted) return;
    const now = performance.now();
    if (now - this.lastBrush < 70) return;
    this.lastBrush = now;
    this.noiseBurst({ freq: 3200, q: .5, dur: .1, vol: .055, type: 'highpass' });
    this.tone(980 + Math.random() * 220, .045, .012, 'sine');
  }

  cloth() {
    if (!this.ensure() || this.muted) return;
    const now = performance.now();
    if (now - this.lastBrush < 80) return;
    this.lastBrush = now;
    this.noiseBurst({ freq: 1200, q: .4, dur: .11, vol: .03, type: 'bandpass' });
  }

  discover() {
    this.tone(392, .5, .05, 'sine');
    this.tone(523.25, .6, .045, 'sine', .08);
    this.tone(659.25, .8, .04, 'sine', .17);
    this.tone(783.99, 1.1, .026, 'triangle', .29);
  }

  complete() {
    this.tone(523.25, .55, .045, 'sine');
    this.tone(659.25, .7, .04, 'sine', .1);
    this.tone(783.99, .9, .035, 'sine', .2);
    this.tone(1046.5, 1.2, .025, 'sine', .33);
    this.noiseBurst({ freq: 5200, q: .8, dur: .35, vol: .022, type: 'highpass' });
  }

  coin() {
    this.tone(880, .12, .05, 'triangle');
    this.tone(1318.5, .18, .04, 'sine', .055);
    this.tone(1760, .22, .025, 'sine', .1);
  }

  error() {
    this.tone(130, .18, .045, 'sawtooth');
    this.tone(98, .24, .035, 'sine', .06);
  }

  pulse() {
    this.tone(660, .35, .025, 'sine');
    this.tone(990, .5, .012, 'sine', .06);
  }
}
