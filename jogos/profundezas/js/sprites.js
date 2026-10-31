// =============================================================
// Sprites em pixel art desenhados a partir de matrizes de texto.
// Cada letra é uma cor da paleta; '.' é transparente.
// =============================================================
'use strict';

const SPRITES = {
  hero: [
    '....hhhh....',
    '...hhhhhh...',
    '...hssssh...',
    '...sesess...',
    '...ssssss...',
    '....ssss....',
    '..dccccccd..',
    '.s.cccccc.s.',
    '.s.cbbbbc.s.',
    '...pppppp...',
    '...pp..pp...',
    '...kk..kk...',
  ],
  rat: [
    '............',
    '............',
    '............',
    '............',
    '......aaa...',
    '....aaaaaab.',
    '...aaaaaaeab',
    't.aaaaaaaaab',
    '.taaaaaaaab.',
    '..aaaaaaab..',
    '...b.b..b.b.',
    '............',
  ],
  bat: [
    '............',
    '............',
    'w....aa....w',
    'ww..aaaa..ww',
    'www.aeea.www',
    'wwwwaaaawwww',
    '.wwwaaaawww.',
    '..w.aaaa.w..',
    '.....aa.....',
    '............',
    '............',
    '............',
  ],
  slime: [
    '............',
    '............',
    '............',
    '.....aa.....',
    '....aaaa....',
    '...alaaaa...',
    '..alaaaaaa..',
    '..aaeaaeaa..',
    '.aaaaaaaaaa.',
    '.aaaaaaaaaa.',
    'bbbbbbbbbbbb',
    '............',
  ],
  goblin: [
    '............',
    '....gggg....',
    '.g.gggggg.g.',
    '.ggge.eggg..',
    '...gggggg...',
    '....gddg....',
    '...cccccc.b.',
    '..gcccccc.b.',
    '..g.cccc..b.',
    '....dddd.b..',
    '....d..d....',
    '...dd..dd...',
  ],
  humanoid: [
    '............',
    '....gggg....',
    '...gggggg...',
    '...ge..eg...',
    '...gggggg...',
    '....gddg....',
    '..cccccccc..',
    '.g.cccccc.g.',
    '.g.cccccc.g.',
    '....dddd....',
    '....d..d....',
    '...dd..dd...',
  ],
  chest: [
    '............',
    '............',
    '..dddddddd..',
    '.dwwwwwwwwd.',
    '.dwwwwwwwwd.',
    '.mmmmmmmmmm.',
    '.dwwwmmwwwd.',
    '.dwwwwwwwwd.',
    '.dwwwwwwwwd.',
    '.dddddddddd.',
    '............',
    '............',
  ],
  chestOpen: [
    '............',
    '..dddddddd..',
    '.dkkkkkkkkd.',
    '.dkkkkkkkkd.',
    '............',
    '.mmmmmmmmmm.',
    '.dwwwwwwwwd.',
    '.dwwwwwwwwd.',
    '.dwwwwwwwwd.',
    '.dddddddddd.',
    '............',
    '............',
  ],
  tomb: [
    '............',
    '....ssss....',
    '...ssssss...',
    '...sskkss...',
    '...skkkks...',
    '...sskkss...',
    '...sskkss...',
    '...ssssss...',
    '...ssssss...',
    '..dddddddd..',
    '............',
    '............',
  ],
  campfire: [
    '............',
    '.....ff.....',
    '....fyyf....',
    '....fyyf....',
    '...fyyyyf...',
    '...frrrrf...',
    '....rrrr....',
    '..ww.ww.ww..',
    '...wwwwww...',
    '..ww.ww.ww..',
    '............',
    '............',
  ],
  // ícones 8x8
  i_weapon: [
    '......mm',
    '.....mlm',
    '....mlm.',
    '...mlm..',
    'h.mlm...',
    '.hhm....',
    '.hh.....',
    'h..h....',
  ],
  i_armor: [
    '........',
    '.mm..mm.',
    '.mmmmmm.',
    '..mlmm..',
    '..mmmm..',
    '..mmmm..',
    '...mm...',
    '........',
  ],
  i_ring: [
    '...gg...',
    '..gllg..',
    '.g....g.',
    '.g....g.',
    '.g....g.',
    '..g..g..',
    '...gg...',
    '........',
  ],
  i_treasure: [
    '........',
    '..gggg..',
    '.gllggg.',
    'gggggggg',
    '.gggggg.',
    '..gggg..',
    '...gg...',
    '........',
  ],
  i_potion: [
    '...cc...',
    '...gg...',
    '..g..g..',
    '.grrrrg.',
    '.grlrrg.',
    '.grrrrg.',
    '..gggg..',
    '........',
  ],
  i_food: [
    '........',
    '........',
    '..bbbb..',
    '.bllllb.',
    'bllllllb',
    'bbbbbbbb',
    '........',
    '........',
  ],
  i_scroll: [
    '........',
    '.pppppp.',
    'ppwwwwpp',
    '.wkkkkw.',
    '.wwwwww.',
    '.wkkkw..',
    'ppwwwwpp',
    '.pppppp.',
  ],
  i_gold: [
    '..yyyy..',
    '.yyyyyy.',
    'yyoyyyyy',
    'yyoyyyyy',
    'yyyyyyyy',
    '.yyyyyy.',
    '..yyyy..',
    '........',
  ],
};

const DEFAULT_PAL = {
  hero: { h: '#6b3e1f', s: '#f1c27d', e: '#1a1a1a', c: '#3b82f6', d: '#1d4ed8', b: '#7c4a1e', p: '#4b3621', k: '#2b1d10' },
  chest: { d: '#4a2e14', w: '#9a6a34', m: '#e0b040' },
  chestOpen: { d: '#4a2e14', w: '#9a6a34', m: '#e0b040', k: '#1a0f06' },
  tomb: { s: '#8a8a94', k: '#4a4a52', d: '#3a2e22' },
  campfire: { f: '#f97316', y: '#fde047', r: '#dc2626', w: '#7c4a1e' },
  i_weapon: { m: '#cbd5e1', l: '#ffffff', h: '#8b5a2b' },
  i_armor: { m: '#94a3b8', l: '#e2e8f0' },
  i_ring: { g: '#facc15', l: '#fff7c2' },
  i_treasure: { g: '#22d3ee', l: '#cffafe' },
  i_potion: { c: '#8b5a2b', g: '#cbd5e1', r: '#ef4444', l: '#fecaca' },
  i_food: { b: '#a16207', l: '#eab308' },
  i_scroll: { p: '#a16207', w: '#f5e6c8', k: '#6b4a2b' },
  i_gold: { y: '#facc15', o: '#fff3b0' },
};

const _spriteCache = {};

// Gera (e guarda em cache) um canvas com o sprite usando a paleta indicada.
function getSprite(name, pal, flash) {
  const key = name + JSON.stringify(pal || '') + (flash ? '!' : '');
  if (_spriteCache[key]) return _spriteCache[key];
  const rows = SPRITES[name];
  const p = pal || DEFAULT_PAL[name] || {};
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if (ch === '.') continue;
      x.fillStyle = flash ? '#ffffff' : (p[ch] || '#ff00ff');
      x.fillRect(i, j, 1, 1);
    }
  }
  _spriteCache[key] = c;
  return c;
}

function itemIconName(item) {
  return 'i_' + item.kind;
}

function itemIconPal(item) {
  if (item.kind === 'treasure') {
    const cols = ['#22d3ee', '#facc15', '#e2e8f0', '#f59e0b', '#c084fc'];
    const idx = TREASURES.findIndex(t => item.name.startsWith(t.name));
    const g = cols[Math.max(0, idx) % cols.length];
    return { g, l: '#ffffff' };
  }
  return null;
}

// Ícone como dataURL (para a interface em HTML)
const _iconCache = {};
function itemIconURL(item) {
  const name = itemIconName(item);
  const pal = itemIconPal(item);
  const key = name + JSON.stringify(pal || '');
  if (_iconCache[key]) return _iconCache[key];
  const spr = getSprite(name, pal);
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(spr, 0, 0, 32, 32);
  _iconCache[key] = c.toDataURL();
  return _iconCache[key];
}

// Tiles do mapa, gerados por bioma
function makeTiles(biome) {
  const mk = () => { const c = document.createElement('canvas'); c.width = TILE; c.height = TILE; return c; };
  const floors = [];
  for (let v = 0; v < 4; v++) {
    const c = mk(), x = c.getContext('2d');
    x.fillStyle = v % 2 ? biome.alt : biome.floor;
    x.fillRect(0, 0, TILE, TILE);
    for (let n = 0; n < 7; n++) {
      x.fillStyle = Math.random() < 0.5 ? biome.alt : shade(biome.floor, -12);
      x.fillRect(ri(TILE), ri(TILE), 1 + ri(2), 1);
    }
    if (v === 3) { x.fillStyle = biome.accent; x.globalAlpha = 0.5; x.fillRect(3 + ri(8), 3 + ri(8), 2, 2); x.fillRect(2 + ri(10), 2 + ri(10), 1, 1); }
    floors.push(c);
  }
  const face = mk(); {
    const x = face.getContext('2d');
    x.fillStyle = biome.face; x.fillRect(0, 0, TILE, TILE);
    x.fillStyle = biome.faceDark;
    x.fillRect(0, 5, TILE, 1); x.fillRect(0, 11, TILE, 1);
    x.fillRect(4, 0, 1, 5); x.fillRect(12, 6, 1, 5); x.fillRect(7, 12, 1, 4);
    x.fillStyle = shade(biome.face, 18); x.fillRect(0, 0, TILE, 1);
  }
  const top = mk(); {
    const x = top.getContext('2d');
    x.fillStyle = biome.wall; x.fillRect(0, 0, TILE, TILE);
    x.fillStyle = shade(biome.wall, 10);
    for (let n = 0; n < 4; n++) x.fillRect(ri(TILE), ri(TILE), 1, 1);
  }
  return { floors, face, top };
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
