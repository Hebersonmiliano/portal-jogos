// =============================================================
// Diálogos com retratos em pixel art e cenas ilustradas
// =============================================================
'use strict';

// ---------- Retratos (16x16) ----------
const FACE = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '...hssssssssh...',
  '...hssssssssh...',
  '...ssewssewss...',
  '...ssssssssss...',
  '...ssssnsssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '...cccccccccc...',
  '..cccccccccccc..',
  '.cccccccccccccc.',
  'cccccccccccccccc',
];
const FACE_BEARD = FACE.map((r, i) => ({ 9: '...bbsmmmmsbb...', 10: '...bbbbbbbbbb...', 11: '....bbbbbbbb....', 12: '...ccbbbbbbcc...' }[i] || r));
const FACE_KID = FACE.map((r, i) => ({ 1: '................', 2: '.....hhhhhh.....', 3: '....hhhhhhhh....' }[i] || r));
SPRITES.face = FACE; SPRITES.faceBeard = FACE_BEARD; SPRITES.faceKid = FACE_KID;

const SKIN = '#f1c27d';
const PEOPLE = {
  marta:   { name: 'Marta',          role: 'Estalajadeira', face: 'face',      pal: { h: '#7c2d12', s: SKIN, e: '#1f2937', w: '#fff', n: '#d9a066', m: '#b45309', c: '#b91c1c' }, body: { h: '#7c2d12', s: SKIN, e: '#1a1a1a', c: '#b91c1c', d: '#7f1d1d', b: '#f5f5f4', p: '#57534e', k: '#292524' } },
  joana:   { name: 'Joana',          role: 'Mercadora',     face: 'face',      pal: { h: '#facc15', s: SKIN, e: '#14532d', w: '#fff', n: '#d9a066', m: '#be123c', c: '#15803d' }, body: { h: '#facc15', s: SKIN, e: '#1a1a1a', c: '#15803d', d: '#14532d', b: '#a16207', p: '#3f3f46', k: '#292524' } },
  bruno:   { name: 'Bruno',          role: 'Ferreiro',      face: 'faceBeard', pal: { h: '#1c1917', s: '#d4a373', e: '#1f2937', w: '#fff', n: '#b07d4f', m: '#7c2d12', c: '#78350f', b: '#292524' }, body: { h: '#1c1917', s: '#d4a373', e: '#1a1a1a', c: '#78350f', d: '#451a03', b: '#292524', p: '#44403c', k: '#1c1917' } },
  lia:     { name: 'Lia',            role: 'Alfaiate',      face: 'face',      pal: { h: '#111827', s: '#e0ac69', e: '#4c1d95', w: '#fff', n: '#c68a4c', m: '#be185d', c: '#db2777' }, body: { h: '#111827', s: '#e0ac69', e: '#1a1a1a', c: '#db2777', d: '#9d174d', b: '#fde68a', p: '#4c1d95', k: '#1e1b4b' } },
  tobias:  { name: 'Ancião Tobias',  role: 'Guardião da história', face: 'faceBeard', pal: { h: '#e5e7eb', s: '#e8b98a', e: '#1e3a8a', w: '#fff', n: '#c9956a', m: '#9a3412', c: '#5b21b6', b: '#f3f4f6' }, body: { h: '#e5e7eb', s: '#e8b98a', e: '#1a1a1a', c: '#5b21b6', d: '#3b0764', b: '#fde68a', p: '#3b0764', k: '#1e1b4b' } },
  pedrinho:{ name: 'Pedrinho',       role: 'Menino curioso', face: 'faceKid',  pal: { h: '#92400e', s: SKIN, e: '#1f2937', w: '#fff', n: '#d9a066', m: '#b45309', c: '#0ea5e9' }, body: { h: '#92400e', s: SKIN, e: '#1a1a1a', c: '#0ea5e9', d: '#0369a1', b: '#a16207', p: '#1e3a8a', k: '#292524' } },
  minerador:{ name: 'Mineiro perdido', role: 'Equipe de Aldo', face: 'faceBeard', pal: { h: '#facc15', s: '#d4a373', e: '#1f2937', w: '#fff', n: '#b07d4f', m: '#7c2d12', c: '#6b5b3e', b: '#57534e' }, body: { h: '#facc15', s: '#d4a373', e: '#1a1a1a', c: '#6b5b3e', d: '#3f3427', b: '#292524', p: '#44403c', k: '#1c1917' } },
};

const _portraitCache = {};
function portraitURL(who) {
  if (_portraitCache[who]) return _portraitCache[who];
  let spr;
  if (PEOPLE[who]) spr = getSprite(PEOPLE[who].face, PEOPLE[who].pal);
  else if (who.startsWith('boss')) { const b = BIOMES[+who.slice(4)].boss; spr = getSprite(b.sprite, b.pal); }
  else spr = getSprite('hero');
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.fillStyle = '#0e0c12'; x.fillRect(0, 0, 64, 64);
  const s = spr.width >= 16 ? 4 : 5, w = spr.width * s, h = spr.height * s;
  x.drawImage(spr, (64 - w) / 2, 64 - h, w, h);
  _portraitCache[who] = c.toDataURL();
  return _portraitCache[who];
}
function personName(who) {
  if (PEOPLE[who]) return PEOPLE[who].name;
  if (who.startsWith('boss')) return BIOMES[+who.slice(4)].boss.name;
  return 'Você';
}

// ---------- Diálogo: falas em sequência, texto letra por letra ----------
const Dialog = {
  lines: [], i: 0, shown: 0, timer: null, onEnd: null,
  play(lines, onEnd) {
    this.lines = lines; this.i = 0; this.onEnd = onEnd || null;
    this.render();
  },
  render() {
    const L = this.lines[this.i];
    clearInterval(this.timer);
    UI.show(`<div class="dlg">
        <img class="pt" src="${portraitURL(L.who)}" alt="">
        <div class="dtx"><p class="dn">${L.name || personName(L.who)}${PEOPLE[L.who] ? `<small>${PEOPLE[L.who].role}</small>` : ''}</p>
        <p class="dt" id="dlgText"></p></div>
        <button class="dnext" data-act="next" data-focus>${this.i < this.lines.length - 1 ? '▶' : '✔'}</button>
      </div>`, { cls: 'dialog', onBack: () => this.skip(), actions: { next: () => this.next() } });
    UI.keyHook = e => { const k = e.key.toLowerCase(); if (k === 'e' || k === ' ' || k === 'j') { e.preventDefault && e.preventDefault(); this.next(); return true; } return false; };
    document.getElementById('overlay').onclick = ev => { if (ev.target.closest('.dlg')) this.next(); };
    this.shown = 0;
    const el = document.getElementById('dlgText');
    this.full = L.text;
    this.timer = setInterval(() => {
      this.shown += 2;
      el.innerHTML = this.full.slice(0, this.shown);
      if (this.shown % 6 === 0) Sfx.tone(520 + Math.random() * 120, 0.03, 'square', 0.015);
      if (this.shown >= this.full.length) { clearInterval(this.timer); this.timer = null; el.innerHTML = this.full; }
    }, 22);
  },
  next() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; document.getElementById('dlgText').innerHTML = this.full; return; }
    this.i++;
    if (this.i >= this.lines.length) this.end(); else this.render();
  },
  skip() { clearInterval(this.timer); this.timer = null; this.end(); },
  end() {
    document.getElementById('overlay').onclick = null;
    UI.close();
    const cb = this.onEnd; this.onEnd = null;
    if (cb) cb();
  },
};

// ---------- Cenas ilustradas (introdução e capítulos) ----------
function drawScene(id, c) {
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const W = 160, H = 72;
  c.width = W; c.height = H;
  const rect = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const glow = (cx, cy, r, col) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); };
  const flame = (cx, cy, s) => { rect('#f97316', cx - 2 * s, cy - 2 * s, 4 * s, 4 * s); rect('#fde047', cx - s, cy - s, 2 * s, 3 * s); rect('#f97316', cx - s, cy - 4 * s, 2 * s, 2 * s); };
  if (id === 'intro' || id === 'ch5') {
    const lit = id === 'ch5';
    const sky = x.createLinearGradient(0, 0, 0, 40); sky.addColorStop(0, '#0f0a1e'); sky.addColorStop(1, lit ? '#7c2d12' : '#2e1065');
    x.fillStyle = sky; x.fillRect(0, 0, W, 40);
    for (let i = 0; i < 30; i++) rect('#e5e7eb', (i * 37) % W, (i * 13) % 30, 1, 1);
    rect('#1c1917', 0, 36, W, 4);
    for (let i = 0; i < 5; i++) { const hx = 8 + i * 24; rect('#292524', hx, 26, 16, 10); rect('#7f1d1d', hx - 2, 22, 20, 4); rect(lit || i % 2 ? '#fbbf24' : '#3f2a14', hx + 6, 29, 4, 3); }
    rect('#44403c', 132, 8, 14, 28); rect('#000', 136, 28, 6, 8); for (let i = 0; i < 4; i++) rect('#57534e', 131 + i * 4, 5, 3, 3);
    rect('#0c0a09', 0, 40, W, H - 40);
    for (let i = 0; i < 12; i++) rect('#1c1917', (i * 29) % W, 44 + (i * 7) % 20, 6, 2);
    glow(80, 62, lit ? 50 : 18, lit ? 'rgba(255,140,40,0.7)' : 'rgba(255,120,40,0.35)');
    flame(80, 62, lit ? 3 : 1);
  } else if (id === 'ch1') {
    rect('#140f0c', 0, 0, W, H); glow(80, 38, 46, 'rgba(255,150,60,0.35)');
    rect('#facc15', 60, 34, 40, 8); for (const k of [60, 74, 88, 96]) rect('#facc15', k, 26, 4, 8); rect('#ca8a04', 60, 40, 40, 2);
    rect('#ef4444', 68, 36, 3, 3); rect('#3b82f6', 79, 36, 3, 3); rect('#22c55e', 90, 36, 3, 3);
    flame(80, 22, 2); glow(80, 22, 16, 'rgba(255,200,80,0.6)');
  } else if (id === 'ch2') {
    rect('#1a1714', 0, 0, W, H); for (let i = 0; i < 40; i++) rect('#2a2420', (i * 23) % W, (i * 11) % H, 3, 2);
    x.save(); x.translate(80, 36); x.rotate(-0.5);
    rect('#8b5a2b', -40, -3, 70, 6); rect('#94a3b8', 26, -14, 6, 28); rect('#cbd5e1', 26, -14, 2, 28);
    rect('#3f2a14', -30, -1, 2, 2); rect('#3f2a14', -24, -1, 3, 1); rect('#3f2a14', -18, 0, 2, 1); rect('#3f2a14', -12, -1, 4, 1); rect('#3f2a14', -4, 0, 3, 1); rect('#3f2a14', 4, -1, 2, 2);
    x.restore(); glow(80, 36, 40, 'rgba(250,204,21,0.12)');
  } else if (id === 'ch3') {
    rect('#0b2530', 0, 0, W, H);
    for (let r = 0; r < 9; r++) for (let k = 0; k < 11; k++) rect(((r + k) % 2) ? '#1f4350' : '#24505f', k * 16 - (r % 2) * 8, r * 8, 15, 7);
    rect('#0f3440', 30, 12, 100, 48); rect('#5eead4', 30, 12, 100, 1); rect('#5eead4', 30, 59, 100, 1);
    rect('#a7f3d0', 72, 22, 8, 8); rect('#a7f3d0', 70, 30, 12, 18); rect('#a7f3d0', 72, 48, 3, 8); rect('#a7f3d0', 77, 48, 3, 8);
    rect('#facc15', 71, 19, 10, 3); flame(88, 32, 1); glow(88, 32, 12, 'rgba(255,160,60,0.5)');
    for (let i = 0; i < 4; i++) rect('#7dd3fc', 100 + i * 7, 44 - i * 6, 4, 3);
  } else if (id === 'ch4') {
    rect('#130b1c', 0, 0, W, H); glow(80, 30, 40, 'rgba(168,85,247,0.25)');
    rect('#2e1065', 64, 22, 32, 40); rect('#e8e0d0', 70, 10, 20, 14); rect('#facc15', 69, 6, 22, 4);
    rect('#a855f7', 74, 15, 4, 3); rect('#a855f7', 83, 15, 4, 3);
    rect('#e8e0d0', 56, 30, 8, 3); rect('#e8e0d0', 96, 30, 8, 3);
    for (let i = 0; i < 4; i++) { flame(110 + i * 3, 36 + i * 8, 1); }
    glow(118, 60, 20, 'rgba(255,120,40,0.5)');
    rect('#000', 0, 64, W, 8); rect('#7c2d12', 100, 64, 40, 2);
  }
}
function sceneURL(id) { const c = document.createElement('canvas'); drawScene(id, c); return c.toDataURL(); }

const Scene = {
  show(id, title, text, after) {
    clearInterval(this.timer);
    UI.show(`<div class="scene"><img class="sci" src="${sceneURL(id)}" alt=""><h2>${title}</h2><p class="sct" id="sceneText"></p>
      <button class="mitem sbtn" data-act="go" data-focus><span class="ml">Continuar</span></button></div>`, {
      cls: 'scenep',
      onBack: () => this.done(after),
      actions: { go: () => { if (this.timer) this.finish(); else this.done(after); } },
    });
    UI.keyHook = e => { const k = e.key.toLowerCase(); if (k === 'e' || k === ' ') { if (this.timer) this.finish(); else this.done(after); return true; } return false; };
    this.full = text; this.n = 0;
    const el = document.getElementById('sceneText');
    this.timer = setInterval(() => {
      this.n += 3; el.innerHTML = this.full.slice(0, this.n);
      if (this.n >= this.full.length) this.finish();
    }, 20);
  },
  finish() { clearInterval(this.timer); this.timer = null; const el = document.getElementById('sceneText'); if (el) el.innerHTML = this.full; },
  done(after) { this.finish(); UI.close(); if (after) after(); },
};
