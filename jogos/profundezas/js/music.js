// =============================================================
// Trilha sonora original em chiptune, gerada com WebAudio.
// Cada música tem acordes, melodia, baixo, arpejo, pad e bateria.
// Notação das linhas (16 passos por compasso):
//   'A4' toca uma nota · '.' segura a nota anterior · '_' silêncio
// =============================================================
'use strict';

const SONGS = {
  // ---------- Vila de Pedra Funda: calma, acolhedora ----------
  village: {
    name: 'Vila de Pedra Funda', bpm: 88, gain: 0.93,
    chords: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G'],
    melody: [
      'E5 . . . G5 . E5 . D5 . . . C5 . . .',
      'E5 . . . A5 . . . G5 . E5 . . . . .',
      'F5 . . . A5 . . . C6 . . . A5 . . .',
      'G5 . . . . . . . D5 . E5 . G5 . . .',
      'E5 . . . G5 . E5 . D5 . . . C5 . . .',
      'B4 . . . E5 . . . G5 . . . E5 . . .',
      'A5 . G5 . F5 . . . E5 . D5 . C5 . . .',
      'D5 . . . . . . . _ _ _ _ _ _ _ _',
    ],
    lead: { wave: 'triangle', vol: 0.16, oct: 0, decay: 0.9 },
    bass: { line: 'r . . . _ _ f . o . . . f . _ _', vol: 0.15, wave: 'triangle' },
    arp: { rate: 2, oct: 4, pattern: [0, 1, 2, 1], vol: 0.035, wave: 'square' },
    pad: { vol: 0.03, wave: 'sine' },
    drums: { k: 'k _ _ _ _ _ _ _ k _ _ _ _ _ _ _', s: '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _', h: '_ _ _ _ h _ _ _ _ _ _ _ h _ _ _' },
    echo: 0.18,
  },

  // ---------- Bioma 1: Cavernas Úmidas ----------
  d1: {
    name: 'Cavernas Úmidas', bpm: 96, gain: 1.22,
    chords: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'E'],
    melody: [
      'A4 . . . . . . . C5 . B4 . A4 . . .',
      'E4 . . . . . . . _ _ _ _ _ _ _ _',
      'F4 . . . A4 . . . C5 . . . B4 . A4 .',
      'G4 . . . . . . . D5 . . . B4 . . .',
      'A4 . . . E5 . . . D5 . C5 . B4 . . .',
      'C5 . . . A4 . . . _ _ _ _ _ _ _ _',
      'D5 . . . F5 . . . E5 . D5 . C5 . . .',
      'B4 . . . G#4 . . . E4 . . . _ _ _ _',
    ],
    lead: { wave: 'square', vol: 0.07, oct: 0, decay: 0.8 },
    bass: { line: 'r . _ r . _ r _ f . _ f . _ o _', vol: 0.16, wave: 'triangle' },
    arp: { rate: 1, oct: 3, pattern: [0, 1, 2, 1], vol: 0.03, wave: 'triangle' },
    pad: { vol: 0.025, wave: 'sine' },
    drums: { k: 'k _ _ _ _ _ _ _ k _ _ _ _ _ _ _', s: '_ _ _ _ _ _ _ _ _ _ _ _ s _ _ _', h: '_ _ h _ _ _ h _ _ _ h _ _ _ h _' },
    echo: 0.25,
  },

  // ---------- Bioma 2: Minas Abandonadas ----------
  d2: {
    name: 'Minas Abandonadas', bpm: 108, gain: 1.2,
    chords: ['Dm', 'Eb', 'Dm', 'C', 'Dm', 'Eb', 'Bb', 'A'],
    melody: [
      'D5 . . . _ _ F5 . E5 . D5 . _ _ A4 .',
      'G4 . . . Bb4 . . . Eb5 . . . D5 . . .',
      'D5 . . . _ _ F5 . A5 . G5 . F5 . E5 .',
      'E5 . . . C5 . . . G4 . . . _ _ _ _',
      'D5 . . . _ _ F5 . E5 . D5 . _ _ A4 .',
      'Bb4 . . . G4 . . . Eb5 . . . F5 . . .',
      'D5 . F5 . D5 . Bb4 . F4 . . . Bb4 . . .',
      'C#5 . . . E5 . . . A4 . . . _ _ _ _',
    ],
    lead: { wave: 'square', vol: 0.07, oct: 0, decay: 0.5 },
    bass: { line: 'r _ r _ r _ r _ f _ f _ r _ o _', vol: 0.16, wave: 'square', bassVol: 0.08 },
    arp: { rate: 2, oct: 4, pattern: [0, 2, 1, 2], vol: 0.025, wave: 'square' },
    pad: { vol: 0.02, wave: 'triangle' },
    drums: { k: 'k _ _ _ k _ _ _ k _ _ _ k _ _ _', s: '_ _ _ _ s _ _ _ _ _ _ _ s _ _ _', h: '_ h _ h _ h _ h _ h _ h _ h _ h' },
    echo: 0.12,
  },

  // ---------- Bioma 3: Ruínas Submersas ----------
  d3: {
    name: 'Ruínas Submersas', bpm: 84, gain: 0.78,
    chords: ['Em', 'A', 'Em', 'A', 'C', 'D', 'Em', 'B'],
    melody: [
      'B4 . . . . . . . E5 . . . F#5 . . .',
      'G5 . . . . . . . E5 . . . C#5 . . .',
      'B4 . . . D5 . E5 . . . . . _ _ _ _',
      'A4 . . . C#5 . . . E5 . . . _ _ _ _',
      'G5 . . . . . . . E5 . . . C5 . . .',
      'F#5 . . . . . . . D5 . . . A4 . . .',
      'G5 . F#5 . E5 . D5 . E5 . . . B4 . . .',
      'D#5 . . . . . . . _ _ _ _ _ _ _ _',
    ],
    lead: { wave: 'sine', vol: 0.15, oct: 0, decay: 1.2 },
    bass: { line: 'r . . . . . . . f . . . . . . .', vol: 0.15, wave: 'triangle' },
    arp: { rate: 2, oct: 4, pattern: [0, 1, 2, 3], vol: 0.03, wave: 'triangle' },
    pad: { vol: 0.035, wave: 'sine' },
    drums: { k: 'k _ _ _ _ _ _ _ k _ _ _ _ _ k _', s: '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _', h: '_ _ _ _ h _ _ _ _ _ _ _ h _ _ _' },
    echo: 0.4,
  },

  // ---------- Bioma 4: Cripta Esquecida ----------
  d4: {
    name: 'Cripta Esquecida', bpm: 76, gain: 1.24,
    chords: ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', 'Ddim', 'G'],
    melody: [
      'C5 . . . . . . . Eb5 . . . D5 . . .',
      'C5 . . . . . . . Ab4 . . . _ _ _ _',
      'F4 . . . Ab4 . . . C5 . . . Db5 . . .',
      'B4 . . . . . . . _ _ _ _ _ _ _ _',
      'G5 . . . . . . . F5 . Eb5 . D5 . . .',
      'Eb5 . . . C5 . . . Ab4 . . . _ _ _ _',
      'F5 . . . D5 . . . Ab4 . . . F4 . . .',
      'G4 . . . B4 . . . D5 . . . B4 . . .',
    ],
    lead: { wave: 'sine', vol: 0.16, oct: 0, decay: 1.6, bell: true },
    bass: { line: 'r . . . . . . . r . . . f . . .', vol: 0.15, wave: 'triangle' },
    arp: { rate: 4, oct: 3, pattern: [0, 2, 1, 2], vol: 0.03, wave: 'triangle' },
    pad: { vol: 0.04, wave: 'triangle' },
    drums: { k: 'k _ _ _ _ _ _ _ _ _ _ _ _ _ _ _', s: '_ _ _ _ _ _ _ _ s _ _ _ _ _ _ _', h: '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _' },
    echo: 0.38,
  },

  // ---------- Bioma 5: Coração do Abismo ----------
  d5: {
    name: 'Coração do Abismo', bpm: 132, gain: 1.28,
    chords: ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'],
    melody: [
      'E5 . . . G5 . . . B5 . . . A5 . G5 .',
      'E5 . . . . . . . C5 . D5 . E5 . . .',
      'F#5 . . . A5 . . . D6 . . . C6 . A5 .',
      'B5 . . . . . . . D#5 . . . F#5 . . .',
      'E5 . . . G5 . . . B5 . . . A5 . G5 .',
      'C6 . . . B5 . . . G5 . . . E5 . . .',
      'A5 . . . C6 . . . E5 . . . A5 . . .',
      'B5 . . . . . . . D#5 . F#5 . B4 . . .',
    ],
    lead: { wave: 'square', vol: 0.07, oct: 0, decay: 0.45 },
    bass: { line: 'r _ r _ r _ r _ r _ r _ f _ o _', vol: 0.15, wave: 'sawtooth', bassVol: 0.06 },
    arp: { rate: 1, oct: 4, pattern: [0, 1, 2, 1], vol: 0.02, wave: 'square' },
    pad: { vol: 0.02, wave: 'sawtooth' },
    drums: { k: 'k _ _ _ k _ _ _ k _ k _ k _ _ _', s: '_ _ _ _ s _ _ _ _ _ _ _ s _ _ _', h: 'h _ h _ h _ h _ h _ h _ h _ h _' },
    echo: 0.1,
  },

  // ---------- Chefe ----------
  boss: {
    name: 'Guardião das Profundezas', bpm: 144, gain: 1.06,
    chords: ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A'],
    melody: [
      'D5 . D5 . F5 . D5 . A5 . . . G5 . F5 .',
      'E5 . F5 . E5 . D5 . C#5 . . . D5 . . .',
      'Bb4 . D5 . F5 . D5 . Bb5 . . . A5 . G5 .',
      'E5 . . . G5 . . . C6 . . . E5 . . .',
      'D5 . D5 . F5 . D5 . A5 . . . G5 . F5 .',
      'A5 . G5 . F5 . E5 . D5 . . . F5 . . .',
      'G5 . . . Bb5 . . . D6 . . . C6 . Bb5 .',
      'A5 . . . C#6 . . . E6 . . . A5 . . .',
    ],
    lead: { wave: 'square', vol: 0.08, oct: 0, decay: 0.4 },
    bass: { line: 'r r o r r r o r r r o r f f o f', vol: 0.15, wave: 'square', bassVol: 0.07 },
    arp: { rate: 1, oct: 4, pattern: [0, 2, 1, 2], vol: 0.018, wave: 'square' },
    pad: { vol: 0.02, wave: 'sawtooth' },
    drums: { k: 'k _ _ k k _ _ _ k _ _ k k _ _ _', s: '_ _ _ _ s _ _ _ _ _ _ _ s _ s _', h: 'h h h h h h h h h h h h h h h h' },
    echo: 0.1,
  },
};

const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteMidi(tok) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(tok);
  if (!m) return null;
  return 12 * (+m[3] + 1) + NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function chordInfo(name) {
  const m = /^([A-G])([#b]?)(m|dim|sus)?$/.exec(name);
  const root = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const iv = m[3] === 'm' ? [0, 3, 7, 12] : m[3] === 'dim' ? [0, 3, 6, 12] : m[3] === 'sus' ? [0, 5, 7, 12] : [0, 4, 7, 12];
  return { root, iv };
}
// Converte uma linha em eventos {i, len, tok}
function parseLine(tokens) {
  const ev = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '.' || t === '_') continue;
    let len = 1;
    while (i + len < tokens.length && tokens[i + len] === '.') len++;
    ev.push({ i, len, tok: t });
  }
  return ev;
}

const Music = {
  muted: false,
  current: null,
  wanted: null,
  song: null,
  step: 0,
  nextTime: 0,
  timer: null,
  out: null, echoIn: null,
  vol: 0.55,

  init() {
    try { this.muted = localStorage.getItem('profundezas_musica') === 'off'; } catch (e) { /* sem armazenamento */ }
    document.addEventListener('visibilitychange', () => {
      if (!Sfx.ctx) return;
      if (document.hidden) Sfx.ctx.suspend(); else Sfx.ctx.resume();
    });
  },

  // Chamado quando o áudio é liberado pelo primeiro clique/tecla
  ready() {
    const ctx = Sfx.ctx;
    if (!ctx || this.out) return;
    this.out = ctx.createGain();
    this.out.gain.value = this.muted ? 0.0001 : this.vol;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    this.out.connect(comp); comp.connect(ctx.destination);
    // eco simples
    this.echoIn = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.32;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    this.echoIn.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(this.out);
    const n = Math.floor(ctx.sampleRate * 0.3);
    this.noise = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    if (this.wanted) this.play(this.wanted, true);
  },

  play(id, force) {
    this.wanted = id;
    if (!Sfx.ctx || !this.out) return;
    if (this.current === id && !force) return;
    const ctx = Sfx.ctx;
    const s = SONGS[id];
    if (!s) return;
    // pequena pausa entre músicas para não embolar
    this.stopTimer();
    const g = this.out.gain;
    const target = this.muted ? 0.0001 : this.vol * (s.gain || 1);
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    g.linearRampToValueAtTime(target, ctx.currentTime + 0.6);
    this.current = id;
    this.song = this.prepare(s);
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.35;
    this.timer = setInterval(() => this.tick(), 25);
  },

  stop() {
    this.wanted = null;
    this.current = null;
    if (!Sfx.ctx || !this.out) return;
    const ctx = Sfx.ctx, g = this.out.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    setTimeout(() => { if (!this.current) this.stopTimer(); }, 900);
  },

  level() { return this.vol * ((this.song && this.song.s.gain) || 1); },

  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },

  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem('profundezas_musica', this.muted ? 'off' : 'on'); } catch (e) { /* ignora */ }
    if (this.out && Sfx.ctx) {
      const g = this.out.gain, t = Sfx.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(this.muted ? 0.0001 : this.level(), t + 0.2);
    }
    return !this.muted;
  },

  prepare(s) {
    const bars = s.chords.length;
    const mel = parseLine(s.melody.join(' ').split(/\s+/));
    const bassTokens = s.bass.line.split(/\s+/);
    const bass = parseLine(bassTokens);
    const drums = {};
    for (const k of ['k', 's', 'h']) drums[k] = s.drums[k].split(/\s+/);
    return { s, bars, total: bars * 16, chords: s.chords.map(chordInfo), mel, bass, drums, stepDur: 60 / s.bpm / 4 };
  },

  tick() {
    const ctx = Sfx.ctx;
    if (!ctx || !this.song) return;
    // se a aba ficou muito tempo parada, recomeça o relógio sem empilhar notas
    if (this.nextTime < ctx.currentTime - 0.3) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this.schedule(this.step % this.song.total, this.nextTime);
      this.nextTime += this.song.stepDur;
      this.step++;
    }
  },

  schedule(st, t) {
    const S = this.song, s = S.s, sd = S.stepDur;
    const bar = Math.floor(st / 16), i = st % 16;
    const ch = S.chords[bar];
    // melodia
    for (const e of S.mel) if (e.i === st) {
      const m = noteMidi(e.tok);
      if (m !== null) {
        const dur = Math.min(e.len * sd, s.lead.decay + e.len * sd * 0.5);
        this.voice(t, midiFreq(m + 12 * s.lead.oct), dur, s.lead.wave, s.lead.vol, 0.01, s.lead.bell, s.echo);
      }
    }
    // baixo
    for (const e of S.bass) if (e.i === i) {
      const base = 12 * 3 + ch.root;
      const m = e.tok === 'r' ? base : e.tok === 'f' ? base + 7 : e.tok === 'o' ? base + 12 : null;
      if (m !== null) this.voice(t, midiFreq(m), e.len * sd * 0.95, s.bass.wave, s.bass.bassVol || s.bass.vol, 0.005, false, 0);
    }
    // pad no início do compasso
    if (i === 0 && s.pad.vol > 0) {
      for (const iv of ch.iv.slice(0, 3)) this.voice(t, midiFreq(12 * 5 + ch.root + iv), sd * 16, s.pad.wave, s.pad.vol, sd * 4, false, 0, true);
    }
    // arpejo
    if (i % s.arp.rate === 0) {
      const k = s.arp.pattern[(i / s.arp.rate) % s.arp.pattern.length];
      const m = 12 * (s.arp.oct + 1) + ch.root + ch.iv[k % ch.iv.length];
      this.voice(t, midiFreq(m), sd * s.arp.rate * 0.8, s.arp.wave, s.arp.vol, 0.003, false, s.echo * 0.6);
    }
    // bateria
    if (S.drums.k[i] === 'k') this.kick(t);
    if (S.drums.s[i] === 's') this.snare(t);
    if (S.drums.h[i] === 'h') this.hat(t);
    // virada no último compasso
    if (bar === S.bars - 1 && i >= 12 && s.bpm > 90) this.snare(t, 0.5);
  },

  voice(t, freq, dur, wave, vol, attack, bell, echo, pad) {
    const ctx = Sfx.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freq, t);
    if (pad) o.detune.setValueAtTime(rr(-6, 6), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    if (bell) g.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.15);
    g.gain.setValueAtTime(bell ? vol * 0.3 : vol, t + Math.max(attack, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    o.connect(g); g.connect(this.out);
    if (echo > 0) { const e = ctx.createGain(); e.gain.value = echo; g.connect(e); e.connect(this.echoIn); }
    o.start(t); o.stop(t + dur + 0.1);
    if (bell) { // harmônico de sino
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2.76, t);
      g2.gain.setValueAtTime(vol * 0.25, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o2.connect(g2); g2.connect(this.out); if (echo > 0) g2.connect(this.echoIn);
      o2.start(t); o2.stop(t + 0.6);
    }
  },

  kick(t) {
    const ctx = Sfx.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 0.2);
  },

  snare(t, k = 1) {
    const ctx = Sfx.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = 'highpass'; f.frequency.value = 1200;
    g.gain.setValueAtTime(0.12 * k, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    src.connect(f); f.connect(g); g.connect(this.out); src.start(t); src.stop(t + 0.16);
    const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(190, t);
    g2.gain.setValueAtTime(0.08 * k, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(g2); g2.connect(this.out); o.start(t); o.stop(t + 0.1);
  },

  hat(t) {
    const ctx = Sfx.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(f); f.connect(g); g.connect(this.out); src.start(t); src.stop(t + 0.05);
  },

  // Música certa para o andar atual
  forFloor(floor) { return 'd' + (biomeOf(floor).idx + 1); },
};
