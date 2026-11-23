/* Tiny synth sound engine — no assets, works offline, unlockable on first touch. */

export class Sfx {
  constructor() {
    this.ctx = null
    this.master = null
    this.enabled = true
    this.noiseBuffer = null
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
      return
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    try {
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.4
      this.master.connect(this.ctx.destination)
      const len = Math.floor(this.ctx.sampleRate * 0.35)
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
      this.noiseBuffer = buffer
    } catch {
      this.ctx = null
    }
  }

  setEnabled(on) {
    this.enabled = !!on
    if (this.master) this.master.gain.value = on ? 0.4 : 0
  }

  tone({ freq = 440, to = null, dur = 0.12, type = 'sine', gain = 0.2, delay = 0, attack = 0.008 }) {
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const amp = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur)
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(gain, t + attack)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(amp)
    amp.connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  noise({ dur = 0.1, gain = 0.14, freq = 1800, q = 0.8, delay = 0, type = 'bandpass' }) {
    if (!this.ctx || !this.enabled || !this.noiseBuffer) return
    const t = this.ctx.currentTime + delay
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    filter.Q.value = q
    const amp = this.ctx.createGain()
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.012)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter)
    filter.connect(amp)
    amp.connect(this.master)
    src.start(t)
    src.stop(t + dur + 0.03)
  }

  select() {
    this.tone({ freq: 520, to: 740, dur: 0.07, type: 'triangle', gain: 0.12 })
  }

  click() {
    this.tone({ freq: 820, to: 620, dur: 0.045, type: 'square', gain: 0.06 })
  }

  wrong() {
    this.tone({ freq: 170, to: 120, dur: 0.16, type: 'sawtooth', gain: 0.1 })
    this.tone({ freq: 120, to: 90, dur: 0.16, type: 'triangle', gain: 0.08, delay: 0.03 })
  }

  screw() {
    this.tone({ freq: 560, to: 280, dur: 0.1, type: 'triangle', gain: 0.12 })
    this.noise({ dur: 0.06, gain: 0.04, freq: 2400 })
  }

  pop() {
    this.tone({ freq: 760, to: 1180, dur: 0.07, type: 'sine', gain: 0.16 })
    this.noise({ dur: 0.04, gain: 0.05, freq: 3000 })
  }

  openPhone() {
    this.noise({ dur: 0.22, gain: 0.06, freq: 900, q: 0.5 })
    this.tone({ freq: 240, to: 160, dur: 0.16, type: 'sine', gain: 0.1 })
  }

  closePhone() {
    this.tone({ freq: 140, to: 90, dur: 0.12, type: 'sine', gain: 0.16 })
    this.noise({ dur: 0.05, gain: 0.05, freq: 500 })
  }

  heatTick() {
    this.noise({ dur: 0.13, gain: 0.035, freq: 1200, q: 1.4 })
  }

  scrub() {
    this.noise({ dur: 0.16, gain: 0.09, freq: 3200, q: 1.1 })
    this.tone({ freq: 1300, to: 900, dur: 0.06, type: 'triangle', gain: 0.04 })
  }

  drop() {
    this.tone({ freq: 180, to: 90, dur: 0.13, type: 'sine', gain: 0.16 })
    this.noise({ dur: 0.07, gain: 0.06, freq: 600 })
  }

  duct() {
    this.tone({ freq: 300, to: 470, dur: 0.1, type: 'triangle', gain: 0.1 })
    this.tone({ freq: 600, to: 900, dur: 0.08, type: 'sine', gain: 0.07, delay: 0.05 })
  }

  success() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.26, type: 'triangle', gain: 0.13, delay: i * 0.075 }))
    this.noise({ dur: 0.3, gain: 0.03, freq: 4000, delay: 0.28 })
  }

  star(i = 0) {
    this.tone({ freq: 880 + i * 220, dur: 0.22, type: 'triangle', gain: 0.14, delay: i * 0.1 })
    this.tone({ freq: 1320 + i * 220, dur: 0.16, type: 'sine', gain: 0.05, delay: i * 0.1 })
  }

  cash() {
    this.tone({ freq: 980, dur: 0.1, type: 'triangle', gain: 0.12 })
    this.tone({ freq: 1470, dur: 0.2, type: 'triangle', gain: 0.1, delay: 0.08 })
  }

  shutter() {
    this.noise({ dur: 0.06, gain: 0.14, freq: 2600 })
    this.noise({ dur: 0.05, gain: 0.1, freq: 900, delay: 0.07 })
  }

  chime() {
    const notes = [659.25, 783.99, 987.77, 1318.5]
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.34, type: 'sine', gain: 0.11, delay: i * 0.11 }))
  }

  boot() {
    this.tone({ freq: 180, to: 720, dur: 0.5, type: 'sine', gain: 0.1 })
    this.tone({ freq: 720, dur: 0.2, type: 'triangle', gain: 0.06, delay: 0.46 })
  }

  flip() {
    this.tone({ freq: 420, to: 700, dur: 0.16, type: 'triangle', gain: 0.08 })
    this.noise({ dur: 0.14, gain: 0.04, freq: 1800 })
  }
}

export const sfx = new Sfx()

export function vibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    /* haptics are a bonus */
  }
}
