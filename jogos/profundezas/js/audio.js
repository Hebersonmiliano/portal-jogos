// =============================================================
// Sons sintetizados com WebAudio (sem arquivos externos)
// =============================================================
'use strict';

const Sfx = {
  ctx: null,
  muted: false,
  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type = 'square', vol = 0.08, slide = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur);
  },
  noise(dur, vol = 0.08) {
    if (!this.ctx || this.muted) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = vol;
    s.buffer = buf; s.connect(g); g.connect(this.ctx.destination);
    s.start();
  },
  swing()   { this.noise(0.06, 0.04); },
  hit()     { this.tone(180, 0.08, 'square', 0.07, -80); this.noise(0.05, 0.05); },
  crit()    { this.tone(320, 0.12, 'square', 0.08, -200); this.noise(0.08, 0.07); },
  hurt()    { this.tone(140, 0.18, 'sawtooth', 0.08, -60); },
  die()     { this.tone(90, 0.25, 'square', 0.06, -50); },
  gold()    { this.tone(880, 0.06, 'square', 0.05); setTimeout(() => this.tone(1320, 0.08, 'square', 0.05), 60); },
  pickup()  { this.tone(520, 0.08, 'triangle', 0.08, 300); },
  rare()    { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.08), i * 70)); },
  level()   { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.15, 'square', 0.07), i * 90)); },
  stairs()  { [400, 300, 200].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.08), i * 90)); },
  shoot()   { this.tone(600, 0.07, 'triangle', 0.04, -300); },
  dash()    { this.tone(300, 0.1, 'sine', 0.06, 400); },
  heal()    { this.tone(440, 0.2, 'sine', 0.08, 440); },
  boom()    { this.noise(0.3, 0.12); this.tone(80, 0.3, 'sawtooth', 0.08, -40); },
  chest()   { this.tone(300, 0.1, 'square', 0.06); setTimeout(() => this.tone(600, 0.15, 'square', 0.06), 100); },
  click()   { this.tone(700, 0.04, 'square', 0.04); },
};
