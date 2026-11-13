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

// Preview browsers often have no system speech voices installed. This compact
// eSpeak-based engine (meSpeak, GPL-3.0-or-later) runs entirely client-side and
// is loaded lazily from jsDelivr only when the device has no system voices.
const FALLBACK_BASE = 'https://cdn.jsdelivr.net/npm/mespeak@2.0.2';
const FALLBACK_CONFIG = FALLBACK_BASE + '/src/mespeak_config.json';
const FALLBACK_PROFILES = {
  narrator: { voice: 'en', pitch: 38, speed: 155 },
  milo: { voice: 'en-us', pitch: 50, speed: 172 },
  dex: { voice: 'en-us', pitch: 43, speed: 184 },
  vera: { voice: 'en-rp', pitch: 62, speed: 164 },
  marlow: { voice: 'en-rp', pitch: 54, speed: 178 },
  lenny: { voice: 'en', pitch: 56, speed: 180 },
  tess: { voice: 'en-sc', pitch: 58, speed: 166 },
  ward: { voice: 'en-wm', pitch: 44, speed: 160 },
  rook: { voice: 'en-sc', pitch: 34, speed: 148 },
  nico: { voice: 'en-us', pitch: 62, speed: 188 },
  bea: { voice: 'en-wm', pitch: 58, speed: 176 },
  priya: { voice: 'en-rp', pitch: 61, speed: 180 }
};
const FALLBACK_WORKER_SRC = `
let me = null;
self.onmessage = async (event) => {
  const msg = event.data || {};
  try {
    if (msg.type === 'init') {
      const mod = await import('https://cdn.jsdelivr.net/npm/mespeak@2.0.2/+esm');
      me = mod.default || mod;
      me.loadConfig(msg.config);
      self.postMessage({ type: 'ready', ok: me.isConfigLoaded() });
    } else if (msg.type === 'voice') {
      me.loadVoice(msg.voice, (ok, id) => {
        self.postMessage({ type: 'voice', key: msg.key, ok: me.isVoiceLoaded(id), id });
      });
    } else if (msg.type === 'speak') {
      const t0 = performance.now();
      const wav = me.speak(msg.text, {
        rawdata: 'array',
        voice: msg.voiceId || undefined,
        pitch: msg.pitch,
        speed: msg.speed,
        amplitude: 100
      });
      const bytes = new Uint8Array(wav);
      self.postMessage({ type: 'audio', seq: msg.seq, bytes: bytes.buffer, ms: Math.round(performance.now() - t0) }, [bytes.buffer]);
    }
  } catch (err) {
    self.postMessage({ type: 'error', seq: msg.seq, message: err && err.message ? err.message : String(err) });
  }
};
`;

export class Audio {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.master = null;
    this.enabled = game?.state?.settings?.sound !== false;
    this.ambientStarted = false;
    this.ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.fallbackCapable = typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof fetch === 'function' && typeof Blob !== 'undefined' && typeof URL !== 'undefined';
    this.fallback = null;
    this.fallbackLoading = null;
    this.fallbackFailed = false;
    this.fallbackRetryAt = 0;
    this.fallbackSource = null;
    this.fallbackGain = null;
    this.fallbackErrorNotified = false;
    this.onFallbackError = null;
    this.preparing = false;
    this.lastFallback = null;
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

  systemVoicesAvailable() {
    return this.ttsSupported && this.voices.length > 0;
  }

  voiceSupported() {
    return this.ttsSupported || this.fallbackCapable;
  }

  voiceEnabled() {
    const settings = this.game?.state?.settings;
    return this.voiceSupported() && settings?.sound !== false && settings?.voice !== false;
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
    if (this.systemVoicesAvailable()) {
      this.stopFallbackSource();
      return this.speakSystem(speakerId, text);
    }
    if (this.fallbackCapable) {
      this.speakFallback(speakerId, text);
      return true;
    }
    return false;
  }

  speakSystem(speakerId, text) {
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

  // ---------- preview fallback voices (no system speech installed) ----------
  fallbackVoiceUrl(name) {
    return `${FALLBACK_BASE}/voices/en/${name}.json`;
  }

  initFallback() {
    if (this.fallback && this.fallback.ready) return Promise.resolve(this.fallback);
    if (this.fallbackLoading) return this.fallbackLoading;
    if (this.fallbackFailed && Date.now() < this.fallbackRetryAt) {
      return Promise.reject(new Error('Voice engine is cooling down.'));
    }
    this.fallbackFailed = false;
    this.fallbackLoading = (async () => {
      if (!this.fallbackCapable) throw new Error('Voice engine is not supported.');
      const config = await fetch(FALLBACK_CONFIG, { cache: 'force-cache' }).then(res => {
        if (!res.ok) throw new Error('Could not download the voice engine.');
        return res.json();
      });
      const worker = new Worker(URL.createObjectURL(new Blob([FALLBACK_WORKER_SRC], { type: 'text/javascript' })), { type: 'module' });
      const fb = {
        worker, ready: false, readyResolve: null, readyReject: null, readyTimer: null,
        seq: 0, voices: new Map(), voiceLoads: new Map(), pendingVoices: new Map(), pendingAudio: new Map()
      };
      this.fallback = fb;
      worker.onmessage = event => this.onFallbackMessage(event.data);
      worker.onerror = event => {
        try { event.preventDefault(); } catch {}
        this.failFallback(new Error(event.message || 'Voice engine crashed.'));
      };
      const ready = new Promise((resolve, reject) => {
        fb.readyResolve = resolve;
        fb.readyReject = reject;
        fb.readyTimer = setTimeout(() => reject(new Error('Voice engine timed out.')), 20000);
      });
      worker.postMessage({ type: 'init', config });
      await ready;
      fb.ready = true;
      return fb;
    })().catch(err => {
      this.failFallback(err);
      throw err;
    }).finally(() => {
      this.fallbackLoading = null;
    });
    return this.fallbackLoading;
  }

  onFallbackMessage(msg) {
    const fb = this.fallback;
    if (!fb || !msg) return;
    if (msg.type === 'ready') {
      if (fb.readyTimer) { clearTimeout(fb.readyTimer); fb.readyTimer = null; }
      const resolve = fb.readyResolve;
      const reject = fb.readyReject;
      fb.readyResolve = fb.readyReject = null;
      if (msg.ok === false) {
        if (reject) reject(new Error('Voice engine failed to initialize.'));
        return;
      }
      if (resolve) resolve(true);
      return;
    }
    if (msg.type === 'voice') {
      const pending = fb.pendingVoices.get(msg.key);
      if (!pending) return;
      fb.pendingVoices.delete(msg.key);
      clearTimeout(pending.timer);
      if (msg.ok && msg.id) pending.resolve(msg.id);
      else pending.reject(new Error('Voice module failed to load.'));
      return;
    }
    if (msg.type === 'audio') {
      const pending = fb.pendingAudio.get(msg.seq);
      if (!pending) return;
      fb.pendingAudio.delete(msg.seq);
      clearTimeout(pending.timer);
      pending.resolve(msg);
      return;
    }
    if (msg.type === 'error') {
      const pending = msg.seq ? fb.pendingAudio.get(msg.seq) : null;
      if (pending) {
        fb.pendingAudio.delete(msg.seq);
        clearTimeout(pending.timer);
        pending.reject(new Error(msg.message || 'Voice synthesis failed.'));
        return;
      }
      if (fb.readyReject) {
        const reject = fb.readyReject;
        if (fb.readyTimer) { clearTimeout(fb.readyTimer); fb.readyTimer = null; }
        fb.readyResolve = fb.readyReject = null;
        reject(new Error(msg.message || 'Voice engine failed.'));
      }
    }
  }

  async loadFallbackVoice(name) {
    const fb = await this.initFallback();
    if (fb.voices.has(name)) return fb.voices.get(name);
    if (fb.voiceLoads.has(name)) return fb.voiceLoads.get(name);
    const load = (async () => {
      const voice = await fetch(this.fallbackVoiceUrl(name), { cache: 'force-cache' }).then(res => {
        if (!res.ok) throw new Error('Could not load voice ' + name + '.');
        return res.json();
      });
      const id = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          fb.pendingVoices.delete(name);
          reject(new Error('Voice module timed out.'));
        }, 15000);
        fb.pendingVoices.set(name, { resolve, reject, timer });
        fb.worker.postMessage({ type: 'voice', key: name, voice });
      });
      fb.pendingVoices.delete(name);
      fb.voices.set(name, id);
      return id;
    })().catch(err => {
      fb.pendingVoices.delete(name);
      throw err;
    }).finally(() => {
      fb.voiceLoads.delete(name);
    });
    fb.voiceLoads.set(name, load);
    return load;
  }

  async speakFallback(speakerId, text) {
    const token = ++this.speechToken;
    this.stopFallbackSource();
    try { window.speechSynthesis?.cancel(); } catch {}
    this.preparing = true;
    try {
      const fb = await this.initFallback();
      if (token !== this.speechToken || !this.voiceEnabled()) return false;
      const profile = FALLBACK_PROFILES[speakerId] || FALLBACK_PROFILES.narrator;
      let voiceId = null;
      try { voiceId = await this.loadFallbackVoice(profile.voice); }
      catch (err) { console.warn('Fallback voice module failed:', err?.message || err); }
      if (token !== this.speechToken || !this.voiceEnabled()) return false;
      const seq = ++fb.seq;
      const msg = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          fb.pendingAudio.delete(seq);
          reject(new Error('Voice synthesis timed out.'));
        }, 20000);
        fb.pendingAudio.set(seq, { resolve, reject, timer });
        fb.worker.postMessage({
          type: 'speak', seq, text, voiceId,
          pitch: profile.pitch, speed: profile.speed
        });
      });
      if (token !== this.speechToken || !this.voiceEnabled()) return false;
      const duration = await this.playFallbackAudio(msg.bytes, token);
      if (duration > 0) {
        const entry = {
          speaker: speakerId, text,
          voice: 'meSpeak ' + profile.voice,
          lang: 'en', pitch: profile.pitch / 50, rate: profile.speed / 175
        };
        this.lastSpeech = entry;
        this.lastFallback = {
          ...entry, voiceId, duration: +duration.toFixed(2),
          bytes: msg.bytes?.byteLength || 0, synthMs: msg.ms, at: Date.now()
        };
        this.speechLog.push({ ...entry, at: Date.now() });
        if (this.speechLog.length > 16) this.speechLog.shift();
      }
      return duration > 0;
    } catch (err) {
      console.warn('Character voice fallback failed:', err?.message || err);
      this.notifyFallbackError(err);
      return false;
    } finally {
      if (token === this.speechToken) this.preparing = false;
    }
  }

  async playFallbackAudio(data, token) {
    this.init();
    if (!this.ctx) return 0;
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch {}
    }
    if (token !== this.speechToken || !this.voiceEnabled()) return 0;
    let buffer;
    try { buffer = await this.ctx.decodeAudioData(data); }
    catch { return 0; }
    if (token !== this.speechToken || !this.voiceEnabled()) return 0;
    this.stopFallbackSource();
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = .9;
    src.connect(gain);
    gain.connect(this.ctx.destination);
    this.fallbackSource = src;
    this.fallbackGain = gain;
    src.onended = () => {
      if (this.fallbackSource !== src) return;
      this.fallbackSource = null;
      this.fallbackGain = null;
      this.speaking = false;
      try { src.disconnect(); gain.disconnect(); } catch {}
    };
    this.preparing = false;
    this.speaking = true;
    try { src.start(); }
    catch {
      this.fallbackSource = null;
      this.speaking = false;
      return 0;
    }
    return buffer.duration;
  }

  stopFallbackSource() {
    const src = this.fallbackSource;
    this.fallbackSource = null;
    if (src) {
      src.onended = null;
      try { src.stop(); } catch {}
      try { src.disconnect(); } catch {}
    }
    if (this.fallbackGain) {
      try { this.fallbackGain.disconnect(); } catch {}
      this.fallbackGain = null;
    }
    this.speaking = false;
  }

  failFallback(err) {
    this.fallbackFailed = true;
    this.fallbackRetryAt = Date.now() + 8000;
    this.preparing = false;
    const fb = this.fallback;
    this.fallback = null;
    if (fb) {
      if (fb.readyTimer) { clearTimeout(fb.readyTimer); fb.readyTimer = null; }
      if (fb.readyReject) {
        const reject = fb.readyReject;
        fb.readyResolve = fb.readyReject = null;
        try { reject(err); } catch {}
      }
      for (const pending of fb.pendingVoices.values()) {
        clearTimeout(pending.timer);
        try { pending.reject(err); } catch {}
      }
      for (const pending of fb.pendingAudio.values()) {
        clearTimeout(pending.timer);
        try { pending.reject(err); } catch {}
      }
      fb.pendingVoices.clear();
      fb.pendingAudio.clear();
      try { fb.worker.terminate(); } catch {}
    }
    this.notifyFallbackError(err);
  }

  notifyFallbackError(err) {
    if (this.fallbackErrorNotified) return;
    this.fallbackErrorNotified = true;
    if (this.onFallbackError) {
      try { this.onFallbackError(err); } catch {}
    }
  }

  voiceName(speakerId) {
    const v = this.voiceMap[speakerId];
    return v?.name || null;
  }

  stopSpeaking() {
    this.speechToken++;
    this.speaking = false;
    this.preparing = false;
    if (this.speechTimer) { clearTimeout(this.speechTimer); this.speechTimer = null; }
    this.stopFallbackSource();
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
