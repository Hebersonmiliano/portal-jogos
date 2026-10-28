/* Original SETOR 404 soundtrack, synthesized locally after the player's click. */
(function (global) {
  'use strict';
  const BPM = 116, SIXTEENTH = 60 / BPM / 4;
  const roots = [45, 41, 48, 40, 45, 41, 48, 40];
  const chords = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];
  const lead = [[76, 0, 72, 74], [77, 0, 72, 69], [76, 79, 76, 72], [71, 74, 71, 68]];
  const arpOrder = [0, 2, 1, 2, 0, 2, 1, 2];
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const clamp = n => Math.max(0, Math.min(1, Number(n) || 0));
  let context = null, master = null, musicBus = null, effectsBus = null, noiseBuffer = null;
  let enabled = true, paused = false, started = false, unlocked = false, volume = 0.34, intensity = 0;
  let timer = null, nextTime = 0, step = 0, pendingUnlock = null, lastError = '';
  const voices = new Set();

  function ramp(param, value, seconds = 0.025) {
    if (!context) return;
    const now = context.currentTime;
    param.cancelScheduledValues(now);
    param.setTargetAtTime(value, now, seconds);
  }
  function keep(source, gain, nodes, track) {
    const voice = { source, gain, nodes, track };
    voices.add(voice);
    source.onended = () => {
      voices.delete(voice);
      for (const node of nodes) { try { node.disconnect(); } catch (_) {} }
    };
    return voice;
  }
  function silence(track) {
    if (!context) return;
    const now = context.currentTime;
    for (const voice of Array.from(voices)) {
      if (track && voice.track !== track) continue;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0.0001, now, 0.006);
      try { voice.source.stop(now + 0.025); } catch (_) {}
    }
  }
  function stopScheduler() {
    if (timer !== null) { global.clearInterval(timer); timer = null; }
    silence('music');
  }
  function tone(note, at, length, amplitude, options = {}) {
    const osc = context.createOscillator(), gain = context.createGain();
    const track = options.track || 'music', nodes = [osc, gain];
    const start = Math.max(context.currentTime + 0.002, at), duration = Math.max(0.03, length);
    const frequency = options.frequency || midi(note);
    osc.type = options.type || 'triangle';
    osc.frequency.setValueAtTime(Math.max(10, frequency), start);
    if (options.to) osc.frequency.exponentialRampToValueAtTime(Math.max(10, options.to), start + duration * 0.9);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(amplitude, start + Math.min(options.attack || 0.006, duration / 4));
    if (options.sustain !== undefined) gain.gain.linearRampToValueAtTime(amplitude * options.sustain, start + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    if (options.lowpass) {
      const filter = context.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.value = options.lowpass; filter.Q.value = 0.55;
      gain.connect(filter); filter.connect(track === 'music' ? musicBus : effectsBus); nodes.push(filter);
    } else gain.connect(track === 'music' ? musicBus : effectsBus);
    keep(osc, gain, nodes, track); osc.start(start); osc.stop(start + duration + 0.02);
  }
  function noise(at, length, amplitude, options = {}) {
    const source = context.createBufferSource(), gain = context.createGain(), filter = context.createBiquadFilter();
    const start = Math.max(context.currentTime + 0.002, at), duration = Math.min(0.65, Math.max(0.025, length));
    const track = options.track || 'music';
    source.buffer = noiseBuffer; filter.type = options.type || 'highpass';
    filter.frequency.value = options.frequency || 6000; filter.Q.value = options.q || 0.7;
    source.connect(filter); filter.connect(gain); gain.connect(track === 'music' ? musicBus : effectsBus);
    gain.gain.setValueAtTime(0.0001, start); gain.gain.linearRampToValueAtTime(amplitude, start + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    keep(source, gain, [source, gain, filter], track); source.start(start); source.stop(start + duration + 0.02);
  }
  function kick(at, amount = 1) {
    tone(0, at, 0.17, 0.36 * amount, { type: 'sine', frequency: 145, to: 42 });
  }
  function snare(at) {
    noise(at, 0.11, 0.095, { type: 'bandpass', frequency: 1800 });
    tone(0, at, 0.08, 0.075, { type: 'triangle', frequency: 165, to: 95 });
  }
  function score(index, at) {
    const bar = Math.floor(index / 16) % 8, s = index % 16;
    const root = roots[bar], chord = chords[bar % 4];
    // A minor → F → C → E gives the factory loop a returning, unresolved pulse.
    if (s === 0) for (const interval of chord) tone(root + 12 + interval, at, SIXTEENTH * 14, 0.018,
      { type: 'triangle', lowpass: 950, attack: 0.065, sustain: 0.45 });
    if ([0, 3, 6, 8, 11, 14].includes(s)) {
      const offset = s === 6 || s === 14 ? 7 : s === 11 ? 12 : 0;
      tone(root + offset, at, SIXTEENTH * (s === 0 || s === 8 ? 2.2 : 1.25), 0.15,
        { type: 'triangle', lowpass: 1050, sustain: 0.55 });
    }
    if (s % 2 === 0) tone(root + 24 + chord[arpOrder[s / 2]], at, SIXTEENTH * 0.78, 0.026,
      { type: 'square', lowpass: 1900 + intensity * 700, sustain: 0.55 });
    if (s % 4 === 0) {
      const n = lead[bar % 4][s / 4];
      if (n) tone(n, at + 0.004, SIXTEENTH * 2.5, 0.027, { type: 'triangle', lowpass: 2600, sustain: 0.65 });
    }
    if (s === 0 || s === 8 || (intensity > 0.5 && s === 11)) kick(at);
    if (s === 4 || s === 12) snare(at);
    if (s % 2 === 0 || intensity > 0.65) noise(at, s === 14 ? 0.09 : 0.035, s % 4 === 2 ? 0.035 : 0.022,
      { type: 'highpass', frequency: 7400 });
    if (intensity > 0.35 && (s === 7 || s === 15)) {
      tone(0, at, 0.075, 0.022, { type: 'sine', frequency: 567, to: 450 });
      tone(0, at, 0.06, 0.012, { type: 'sine', frequency: 905, to: 800 });
    }
  }
  function schedule() {
    if (!context || context.state !== 'running' || !enabled || paused || !started) return;
    const now = context.currentTime;
    if (nextTime < now - 0.3) nextTime = now + 0.045;
    while (nextTime < now + 0.12) {
      score(step, nextTime); step = (step + 1) % 128; nextTime += SIXTEENTH;
    }
  }
  function startScheduler() {
    if (!unlocked || !enabled || paused || !started || !context || context.state !== 'running' || timer !== null) return;
    nextTime = context.currentTime + 0.045; schedule();
    timer = global.setInterval(schedule, 25);
  }
  function buildContext() {
    const AudioContext = global.AudioContext || global.webkitAudioContext;
    if (!AudioContext) return false;
    context = new AudioContext();
    master = context.createGain(); musicBus = context.createGain(); effectsBus = context.createGain();
    master.gain.value = enabled && !paused ? volume : 0; musicBus.gain.value = 0.65; effectsBus.gain.value = 0.85;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 18; compressor.ratio.value = 3;
    compressor.attack.value = 0.006; compressor.release.value = 0.18;
    musicBus.connect(master); effectsBus.connect(master); master.connect(compressor); compressor.connect(context.destination);
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.7), context.sampleRate);
    const data = noiseBuffer.getChannelData(0); let seed = 404;
    for (let i = 0; i < data.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; data[i] = seed / 2147483648 - 1; }
    return true;
  }
  async function unlock() {
    started = true;
    if (!enabled) return false;
    if (pendingUnlock) return pendingUnlock;
    pendingUnlock = (async () => {
      try {
        if (!context && !buildContext()) return false;
        if (context.state === 'suspended') await context.resume();
        unlocked = context.state === 'running';
        if (unlocked) { ramp(master.gain, paused ? 0 : volume); startScheduler(); }
        return unlocked;
      } catch (error) { lastError = String(error && error.message || error); return false; }
    })();
    try { return await pendingUnlock; } finally { pendingUnlock = null; }
  }
  function setEnabled(value) {
    enabled = !!value;
    if (!context) return enabled;
    ramp(master.gain, enabled && !paused ? volume : 0);
    if (enabled) startScheduler(); else { stopScheduler(); silence(); }
    return enabled;
  }
  function setPaused(value) {
    paused = !!value;
    if (!context) return;
    ramp(master.gain, paused || !enabled ? 0 : volume);
    if (paused) { stopScheduler(); silence(); }
    else startScheduler();
  }
  function setVolume(value) { volume = clamp(value); if (master) ramp(master.gain, enabled && !paused ? volume : 0); }
  function setIntensity(value) { intensity = clamp(value); }
  function stop() { started = false; step = 0; stopScheduler(); silence(); }
  function sfx(name) {
    if (!context || !unlocked || !enabled || paused || context.state !== 'running') return;
    const at = context.currentTime + 0.006, opt = { track: 'effect', type: 'square', lowpass: 3400 };
    const n = (note, offset, duration, amp = 0.1, options = {}) => tone(note, at + offset, duration, amp, { ...opt, ...options });
    switch (name) {
      case 'jump': n(56, 0, 0.12, 0.09, { to: midi(72), type: 'triangle' }); break;
      case 'dodge': noise(at+0.025, 0.19, 0.105, { track: 'effect', type: 'bandpass', frequency: 1350 }); n(0, 0.025, 0.16, 0.055, { frequency: 310, to: 95, type: 'triangle' }); break;
      case 'attack': noise(at, 0.11, 0.13, { track: 'effect', type: 'bandpass', frequency: 2400 }); n(0, 0, 0.1, 0.08, { frequency: 270, to: 90 }); break;
      case 'rivet': noise(at,0.045,0.09,{track:'effect',type:'highpass',frequency:2600});n(0,0,0.06,0.06,{frequency:650,to:260,type:'triangle'});break;
      case 'arc': n(0,0,0.16,0.07,{frequency:160,to:95,type:'sawtooth',lowpass:1800});noise(at,0.12,0.055,{track:'effect',type:'bandpass',frequency:1600});break;
      case 'hammer': noise(at+0.44,0.16,0.12,{track:'effect',type:'lowpass',frequency:800});n(0,0.44,0.19,0.09,{frequency:95,to:35,type:'triangle'});break;
      case 'emp': [45,52,57].forEach((note,i)=>n(note,i*0.035,0.28,0.055,{type:'triangle',to:midi(note-8)}));break;
      case 'hurt': n(43, 0, 0.19, 0.12, { to: midi(31), type: 'sawtooth', lowpass: 1700 }); break;
      case 'robotAttack': n(61, 0, 0.055, 0.065); n(55, 0.06, 0.1, 0.065); break;
      case 'robotHurt': noise(at, 0.065, 0.13, { track: 'effect', type: 'highpass', frequency: 2100 }); n(0, 0, 0.055, 0.09, { frequency: 510, to: 230 }); break;
      case 'explosion': noise(at, 0.4, 0.23, { track: 'effect', type: 'lowpass', frequency: 1700 }); n(0, 0, 0.3, 0.15, { type: 'triangle', frequency: 120, to: 32 }); break;
      case 'repair': [69, 72, 76, 81].forEach((note, i) => n(note, i * 0.095, 0.18, 0.09, { type: 'triangle' })); break;
      case 'pickup': n(76, 0, 0.08, 0.07); n(81, 0.08, 0.16, 0.08); break;
      case 'victory': [69, 72, 76, 81, 76, 81, 84].forEach((note, i) => n(note, i * 0.14, i === 6 ? 0.6 : 0.22, 0.09, { type: 'triangle' })); break;
      case 'death': [57, 52, 48, 45, 33].forEach((note, i) => n(note, i * 0.16, 0.26, 0.095, { type: 'triangle' })); break;
    }
  }
  function getState() {
    return { supported: !!(global.AudioContext || global.webkitAudioContext), unlocked, enabled, paused,
      started, playing: timer !== null, volume, intensity, step, voices: voices.size, error: lastError };
  }
  global.SectorAudio = Object.freeze({ unlock, setEnabled, isEnabled: () => enabled, setVolume,
    setPaused, setIntensity, sfx, stop, getState });
})(typeof window !== 'undefined' ? window : globalThis);
