// GREEN EMPIRE — tiny synthesized sound engine (no external assets).
const TTS_PROFILES = {
  narrator: { pitch: .78, rate: .92, names: ['daniel', 'david', 'google uk english male', 'microsoft david', 'male'] },
  milo: { pitch: .97, rate: .98, names: ['alex', 'daniel', 'guy', 'david', 'male'] },
  dex: { pitch: 1.03, rate: 1.07, names: ['fred', 'alex', 'guy', 'david', 'male'] },
  vera: { pitch: .84, rate: .93, names: ['samantha', 'victoria', 'karen', 'moira', 'aria', 'zira', 'female'] },
  marlow: { pitch: .94, rate: 1.02, names: ['karen', 'moira', 'aria', 'zira', 'samantha', 'female'] },
  lenny: { pitch: 1.06, rate: 1.04, names: ['google uk english male', 'daniel', 'guy', 'david', 'male'] },
  tess: { pitch: .86, rate: .96, names: ['moira', 'tessa', 'zira', 'samantha', 'female'] },
  ward: { pitch: .88, rate: .92, names: ['daniel', 'david', 'google uk english male', 'guy', 'male'] },
  rook: { pitch: .76, rate: .88, names: ['david', 'daniel', 'google uk english male', 'guy', 'male'] },
  nico: { pitch: 1.12, rate: 1.04, names: ['fred', 'alex', 'microsoft guy', 'male'] },
  bea: { pitch: 1.0, rate: 1.0, names: ['aria', 'samantha', 'zira', 'female'] },
  priya: { pitch: 1.08, rate: 1.05, names: ['google us english', 'aria', 'zira', 'samantha', 'female'] }
};

export class Audio {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.master = null;
    this.enabled = game?.state?.settings?.sound !== false;
    this.ambientStarted = false;
    this.ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.voices = [];
    this.voiceSignature = '';
    this.voiceMap = {};
    this.usedVoices = new Set();
    this.speechToken = 0;
    this.speechTimer = null;
    this.speaking = false;
    this.lastSpeech = null;
    this.speechLog = [];
    if (this.ttsSupported) {
      this.loadVoices();
      try { window.speechSynthesis.onvoiceschanged = () => this.loadVoices(); } catch {}
    }
  }

  loadVoices() {
    if (!this.ttsSupported) return;
    let voices = [];
    try { voices = window.speechSynthesis.getVoices() || []; } catch { voices = []; }
    const signature = voices.map(v => `${v.name || ''}|${v.lang || ''}`).join('~');
    if (signature === this.voiceSignature) return;
    this.voiceSignature = signature;
    this.voices = voices;
    this.voiceMap = {};
    this.usedVoices = new Set();
  }

  primeSpeech() {
    if (!this.ttsSupported) return;
    this.loadVoices();
    try { window.speechSynthesis.resume(); } catch {}
  }

  voiceEnabled() {
    const settings = this.game?.state?.settings;
    return this.ttsSupported && settings?.sound !== false && settings?.voice !== false;
  }

  pickVoice(speakerId) {
    if (this.voiceMap[speakerId] !== undefined) return this.voiceMap[speakerId];
    const english = this.voices.filter(v => /^en([-_]|$)/i.test(v.lang || ''));
    const pool = english.length ? english : this.voices;
    if (!pool.length) return null;
    const profile = TTS_PROFILES[speakerId] || TTS_PROFILES.narrator;
    const scored = pool.map((v, i) => {
      const name = String(v.name || '').toLowerCase();
      let score = 0;
      for (let n = 0; n < profile.names.length; n++) {
        if (name.includes(profile.names[n])) { score = 100 - n * 4; break; }
      }
      if (/^en[-_]us/i.test(v.lang || '')) score += 6;
      else if (/^en[-_]gb/i.test(v.lang || '')) score += 4;
      return { v, score, i };
    }).sort((a, b) => b.score - a.score || a.i - b.i);
    let chosen = scored.find(x => !this.usedVoices.has(x.v.name));
    if (!chosen) chosen = scored[0];
    this.usedVoices.add(chosen.v.name);
    this.voiceMap[speakerId] = chosen.v;
    return chosen.v;
  }

  speakLine(speakerId, text) {
    if (!this.voiceEnabled() || !text) return false;
    this.loadVoices();
    const profile = TTS_PROFILES[speakerId] || TTS_PROFILES.narrator;
    const voice = this.pickVoice(speakerId);
    const token = ++this.speechToken;
    if (this.speechTimer) { clearTimeout(this.speechTimer); this.speechTimer = null; }
    let busy = false;
    try { busy = !!(window.speechSynthesis.speaking || window.speechSynthesis.pending); } catch {}
    try { window.speechSynthesis.cancel(); } catch {}
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = profile.rate || 1;
      utterance.pitch = profile.pitch || 1;
      utterance.volume = .95;
      utterance.lang = voice?.lang || 'en-US';
      if (voice) { try { utterance.voice = voice; } catch {} }
      this.lastSpeech = {
        speaker: speakerId, text,
        voice: voice?.name || 'browser default',
        lang: utterance.lang, pitch: utterance.pitch, rate: utterance.rate
      };
      this.speechLog.push({ ...this.lastSpeech, at: Date.now() });
      if (this.speechLog.length > 16) this.speechLog.shift();
      utterance.onstart = () => { if (token === this.speechToken) this.speaking = true; };
      utterance.onend = () => { if (token === this.speechToken) this.speaking = false; };
      utterance.onerror = () => { if (token === this.speechToken) this.speaking = false; };
      const fire = () => {
        if (token !== this.speechToken || !this.voiceEnabled()) return;
        try { window.speechSynthesis.resume(); } catch {}
        try {
          window.speechSynthesis.speak(utterance);
        } catch { this.speaking = false; }
      };
      if (busy) {
        // A tiny defer avoids Chrome dropping a new utterance right after cancel().
        this.speechTimer = setTimeout(() => {
          this.speechTimer = null;
          fire();
        }, 30);
      } else {
        // Speak inside the original tap gesture when possible (mobile autoplay rules).
        fire();
      }
      return true;
    } catch {
      this.speaking = false;
      return false;
    }
  }

  voiceName(speakerId) {
    const v = this.voiceMap[speakerId];
    return v?.name || null;
  }

  stopSpeaking() {
    this.speechToken++;
    this.speaking = false;
    if (this.speechTimer) { clearTimeout(this.speechTimer); this.speechTimer = null; }
    if (this.ttsSupported) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  init() {
    this.primeSpeech();
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
    if (!this.enabled) this.stopSpeaking();
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
