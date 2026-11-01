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
    '.g.cccccc.g.',
    '.g.cbbbbc.g.',
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
  // ---------- Bioma 2: Minas ----------
  skel: [
    '....hhhh....',
    '...hhlhhh...',
    '...wwwwww...',
    '...wdwwdw...',
    '...wwwwww...',
    '....wddw....',
    '.mmm.ww.....',
    '..p.wwww.w..',
    '..p.wwww....',
    '..p..ww.....',
    '....w..w....',
    '...ww..ww...',
  ],
  spider: [
    '............',
    '............',
    '............',
    'l..l....l..l',
    '.l..laal..l.',
    '..llaaaall..',
    '...aeaeaa...',
    '..llaaaall..',
    '.l..lbbl..l.',
    'l...l..l...l',
    '............',
    '............',
  ],
  golem: [
    '............',
    '....aaaa....',
    '...alaaab...',
    '...aeaeaab..',
    '.aaaaaaaaaa.',
    'aalaaaaaaabb',
    'aa.aaaaaa.bb',
    'aa.abaaba.bb',
    '...aaaaaa...',
    '...aa..aa...',
    '..aaa..aaa..',
    '..bbb..bbb..',
  ],
  kobold: [
    '.........y..',
    '..gggg...r..',
    '.ggegggg.r..',
    '..ggggggg...',
    '...gddg..g..',
    '..cccccc.g..',
    '.gcccccc....',
    '..cccccc....',
    '...dddd.....',
    '...d..d.....',
    '..dd..dd....',
    '............',
  ],
  // ---------- Bioma 3: Ruínas ----------
  fishman: [
    '.....f......',
    '....fgg.....',
    '...gggggg...',
    '..ggeggggg..',
    '..gggggddd..',
    '...gggggg...',
    '.f.gccccg.f.',
    '.g.gccccg.g.',
    '...gccccg...',
    '...gg..gg...',
    '...g....g...',
    '..ff....ff..',
  ],
  eel: [
    '............',
    '............',
    '............',
    '.......www..',
    '......wwaew.',
    '..ww..wwww..',
    '.wwaw.ww....',
    'ww..wwww....',
    'w....ww.....',
    '............',
    '............',
    '............',
  ],
  crab: [
    '............',
    '............',
    'cc........cc',
    'cc..e..e..cc',
    '.c..b..b..c.',
    '.caaaaaaaac.',
    'aalaaaaaaaaa',
    'aaaaaaaaaaab',
    '.bbbbbbbbbb.',
    'b.b.b..b.b.b',
    '............',
    '............',
  ],
  siren: [
    '...hhhh.....',
    '..hhhhhh....',
    '..hgggghh...',
    '..hgegegh...',
    '..hggggh.b..',
    '...hggh.bb..',
    '...cccc.g...',
    '..gcccc.....',
    '...cccc.....',
    '....ccc.....',
    '.....cc.cc..',
    '......ccc...',
  ],
  // ---------- Bioma 4: Cripta ----------
  zombie: [
    '....gggg....',
    '...gggggg...',
    '...geggeg...',
    '...gggggg...',
    '....gddg....',
    '..cccccccggg',
    '..ccccccc...',
    '..cccccccggg',
    '...ccdccc...',
    '...dd..dd...',
    '...d...dd...',
    '..dd...ddd..',
  ],
  ghost: [
    '............',
    '....wwww....',
    '...waaaww...',
    '..waeaaeww..',
    '..waaaaaww..',
    '..waeeeaww..',
    '..waaaaaww..',
    '..wwaaawww..',
    '..wwwwwwww..',
    '..w.ww.w.w..',
    '....w....w..',
    '............',
  ],
  knight: [
    '....aaaa....',
    '...alaaab...',
    '...abeeab...',
    '...aaaaab...',
    '.s.laaaab...',
    '.s.aaaaaab..',
    '.saaaaaaab..',
    '.s.aaaaaab..',
    '...aaaaab...',
    '...ab..ab...',
    '...ab..ab...',
    '..bbb..bbb..',
  ],
  necro: [
    '...cccc...o.',
    '..cccccc.ob.',
    '..cggggc..b.',
    '..cgegec..b.',
    '..cgggc...b.',
    '.cccccccc.b.',
    '.ccccccggb..',
    '..cccccc..b.',
    '..cccccc..b.',
    '.cccccccc.b.',
    '.cccccccc.b.',
    '.dddddddd...',
  ],
  // ---------- Bioma 5: Abismo ----------
  imp: [
    '..h......h..',
    '..hh.gg.hh..',
    '...gggggg...',
    '..ggeggegg..',
    '...gggggg...',
    'w...gddg...w',
    'ww.gggggg.ww',
    'www.gggg.www',
    '....gggg....',
    '....g..g....',
    '...gg..gg...',
    '............',
  ],
  hound: [
    '............',
    '............',
    '.........ff.',
    '........aaf.',
    'f......aaeaa',
    'ff.aaaaaaaa.',
    '.faaaaaaaww.',
    '..aaaaaaa...',
    '..a.a..a.a..',
    '..w.w..w.w..',
    '............',
    '............',
  ],
  demon: [
    '.h........h.',
    '.hh.aaaa.hh.',
    '..haaaaaah..',
    '...aeaaea...',
    '...aabbaa...',
    '.aaaaaaaaaa.',
    'aalaaaaaaaaa',
    'aa.aaaaaa.aa',
    'aa.aabbaa.aa',
    '...aa..aa...',
    '...aa..aa...',
    '..bbb..bbb..',
  ],
  flame: [
    '.....f......',
    '....ff..f...',
    '...ffyf.ff..',
    '..ffyyyfff..',
    '..fyeyyeyf..',
    '.ffyyyyyyff.',
    '.fyywwwyyyf.',
    '.fyyywwyyyf.',
    '..fyyyyyyf..',
    '...ffyyff...',
    '....ffff....',
    '.....ff.....',
  ],
  // ---------- Chefes (16x16) ----------
  b_goblin: [
    '....k..k..k.....',
    '....kkkkkkk.....',
    '...ggggggggg....',
    '.gggeegggeeggg..',
    '..ggggggggggg...',
    '....gddddddg....',
    '...cccgggggccc.b',
    '..cccccccccccc.b',
    '.cgcccccccccgcb.',
    '.cg.cccccccc.gcb',
    'cc..cccccccc..cb',
    'c...dddddddd...b',
    '....dd....dd...b',
    '....dd....dd....',
    '...ddd....ddd...',
    '................',
  ],
  b_worm: [
    '................',
    '.....aaaaaa.....',
    '....alaaaaab....',
    '...aaeaaaaeab...',
    '...aattttttab...',
    '...ab.t..t.ab...',
    '...aattttttab...',
    '....aaaaaaab....',
    '...bbbbbbbbbb...',
    '..aaaaaaaaaaab..',
    '..alaaaaaaaaab..',
    '.bbbbbbbbbbbbbb.',
    '.aaaaaaaaaaaaab.',
    'aalaaaaaaaaaaabb',
    'bbbbbbbbbbbbbbbb',
    '................',
  ],
  b_hydra: [
    '.aa....aa....aa.',
    'aeaa..aeaa..aeaa',
    'aaa...aaa...aaa.',
    '.aa....aa....aa.',
    '..a....aa....a..',
    '..aa...aa...aa..',
    '...aa..aa..aa...',
    '....aaaaaaaa....',
    '...aallaaaaab...',
    '..aallaaaaaaab..',
    '.aaaaaaaaaaaaab.',
    '.aaaaaaaaaaaaab.',
    '..abbaaaaaabba..',
    '..bb.bbbbbb.bb..',
    '................',
    '................',
  ],
  b_lich: [
    '....k.k.k....o..',
    '....kkkkk...ooo.',
    '...ggggggg...b..',
    '...geegeeg...b..',
    '...ggggggg...b..',
    '....gtttg....b..',
    '..ccccccccc..b..',
    '.ccccccccccc.b..',
    '.cgcccccccgccb..',
    '.c.cccccccc.cb..',
    '...ccccccccc.b..',
    '..ccccccccccc...',
    '..ccccccccccc...',
    '.ccccccccccccc..',
    '.ddddddddddddd..',
    '................',
  ],
  b_abyss: [
    '.h............h.',
    '.hh..gggggg..hh.',
    '..hhgggggghh....',
    '....geggggeg....',
    '....gggffggg....',
    'w...ggggggggg..w',
    'ww.cccccccccc.ww',
    'www.cccccccccwww',
    'wwwgccccccccgwww',
    'ww.gccffffccg.ww',
    'w..gccccccccg..w',
    '....cccccccc....',
    '....dd....dd....',
    '....dd....dd....',
    '...ddd....ddd...',
    '................',
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
  i_helmet: [
    '........',
    '..mmmm..',
    '.mlmmmm.',
    '.mmmmmm.',
    '.m.kk.m.',
    '.m.kk.m.',
    '.mm..mm.',
    '........',
  ],
  i_gloves: [
    '........',
    '.m.m.m..',
    '.m.m.m..',
    '.mmmmm.m',
    '.mlmmmmm',
    '.mmmmmm.',
    '..bbbb..',
    '........',
  ],
  i_boots: [
    '........',
    '..mmm...',
    '..mlm...',
    '..mmm...',
    '..mmmmm.',
    '.mmmmmmm',
    '.bbbbbbb',
    '........',
  ],
  i_amulet: [
    'g......g',
    '.g....g.',
    '..g..g..',
    '...gg...',
    '..rrrr..',
    '..rlrr..',
    '..rrrr..',
    '...rr...',
  ],
  i_wings: [
    '........',
    'mm....mm',
    'mlm..mlm',
    'mmmkkmmm',
    '.mmkkmm.',
    '.mm..mm.',
    'm......m',
    '........',
  ],
  i_bow: [
    '..hh...w',
    '.h....w.',
    'h....w..',
    'h...m...',
    'h..w....',
    'h.w.....',
    '.h......',
    '..hh....',
  ],
  i_staff: [
    '.....ll.',
    '....lgl.',
    '.....lh.',
    '....h...',
    '...h....',
    '..h.....',
    '.h......',
    'h.......',
  ],
  i_hammer: [
    '...mmmm.',
    '...mllm.',
    '...mmmm.',
    '....h...',
    '...h....',
    '..h.....',
    '.h......',
    'h.......',
  ],
  i_mat: [
    '........',
    '...ll...',
    '..lmml..',
    '.lmmmml.',
    '.mmmmmd.',
    '..mmmd..',
    '...dd...',
    '........',
  ],
  i_gem: [
    '........',
    '..mmmm..',
    '.mlmmmm.',
    'mllmmmmd',
    '.mmmmmd.',
    '..mmmd..',
    '...md...',
    '........',
  ],
  i_cup: [
    '..l..l..',
    '...l....',
    '.wwwwww.',
    '.wrrrrww',
    '.wrrrrw.',
    '.wwwwww.',
    '..wwww..',
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

// Quadros de animação do herói, derivados do quadro parado
(function () {
  const h = SPRITES.hero;
  const frame = (changes) => h.map((row, i) => changes[i] !== undefined ? changes[i] : row);
  SPRITES.hero_walk1 = frame({ 10: '..pp....pp..', 11: '.kk......kk.' });
  SPRITES.hero_walk2 = frame({ 10: '....pppp....', 11: '....kkkk....' });
  SPRITES.hero_atk = frame({ 7: '.g.ccccccgg.', 8: '...cbbbbc...', 10: '..pp...pp...', 11: '..kk...kk...' });
  SPRITES.hero_hurt = frame({ 3: '...sksksss..', 5: '....skks....', 7: 'g..cccccc..g' });
  SPRITES.crabShell = [
    '............', '............', '............', '............', '............',
    '..aaaaaaaa..', '.alaaaaaaaa.', 'aaaaaaaaaaab', '.bbbbbbbbbb.',
    '............', '............', '............',
  ];
})();

const DEFAULT_PAL = {
  hero_walk1: null, hero_walk2: null, hero_atk: null, hero_hurt: null,
  hero: { h: '#6b3e1f', s: '#f1c27d', g: '#f1c27d', e: '#1a1a1a', c: '#3b82f6', d: '#1d4ed8', b: '#7c4a1e', p: '#4b3621', k: '#2b1d10' },
  chest: { d: '#4a2e14', w: '#9a6a34', m: '#e0b040' },
  chestOpen: { d: '#4a2e14', w: '#9a6a34', m: '#e0b040', k: '#1a0f06' },
  tomb: { s: '#8a8a94', k: '#4a4a52', d: '#3a2e22' },
  campfire: { f: '#f97316', y: '#fde047', r: '#dc2626', w: '#7c4a1e' },
  i_weapon: { m: '#cbd5e1', l: '#ffffff', h: '#8b5a2b' },
  i_armor: { m: '#94a3b8', l: '#e2e8f0' },
  i_ring: { g: '#facc15', l: '#fff7c2' },
  i_treasure: { g: '#22d3ee', l: '#cffafe' },
  i_helmet: { m: '#94a3b8', l: '#e2e8f0', k: '#1e293b' },
  i_gloves: { m: '#a16207', l: '#eab308', b: '#78350f' },
  i_boots: { m: '#78350f', l: '#b45309', b: '#3f2410' },
  i_amulet: { g: '#facc15', r: '#a855f7', l: '#e9d5ff' },
  i_wings: { m: '#a78bfa', l: '#ede9fe', k: '#4c1d95' },
  i_bow: { h: '#8b5a2b', w: '#e5e7eb', m: '#cbd5e1' },
  i_staff: { h: '#8b5a2b', l: '#a5f3fc', g: '#22d3ee' },
  i_hammer: { m: '#94a3b8', l: '#e2e8f0', h: '#8b5a2b' },
  i_potion: { c: '#8b5a2b', g: '#cbd5e1', r: '#ef4444', l: '#fecaca' },
  i_food: { b: '#a16207', l: '#eab308' },
  i_scroll: { p: '#a16207', w: '#f5e6c8', k: '#6b4a2b' },
  i_gold: { y: '#facc15', o: '#fff3b0' },
};

const _spriteCache = {};

// Gera (e guarda em cache) um canvas com o sprite usando a paleta indicada.
function getSprite(name, pal, flash) {
  const key = name + JSON.stringify(pal || '') + String(flash || '');
  if (_spriteCache[key]) return _spriteCache[key];
  const rows = SPRITES[name];
  const p = pal || DEFAULT_PAL[name] || (name.startsWith('hero') ? DEFAULT_PAL.hero : {});
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if (ch === '.') continue;
      x.fillStyle = flash === 'red' ? '#ff4d4d' : flash ? '#ffffff' : (p[ch] || (ch === 'g' && name.startsWith('hero') && p.s) || '#ff00ff');
      x.fillRect(i, j, 1, 1);
    }
  }
  _spriteCache[key] = c;
  return c;
}

function itemIconName(item) {
  if (item.kind === 'mat' || item.kind === 'gem') return 'i_' + item.kind;
  if (item.kind === 'cha') return 'i_cup';
  if (item.kind === 'potion2' || (item.kind || '').startsWith('elixir')) return 'i_potion';
  if (item.kind === 'weapon') {
    const t = weaponType(item);
    if (t === 'arco') return 'i_bow';
    if (t === 'cajado') return 'i_staff';
    if (t === 'martelo') return 'i_hammer';
  }
  return 'i_' + item.kind;
}

function itemIconPal(item) {
  if (item.kind === 'treasure') {
    const cols = ['#22d3ee', '#facc15', '#e2e8f0', '#f59e0b', '#c084fc'];
    const idx = TREASURES.findIndex(t => item.name.startsWith(t.name));
    const g = cols[Math.max(0, idx) % cols.length];
    return { g, l: '#ffffff' };
  }
  if (item.kind === 'mat' && typeof MATERIALS !== 'undefined') { const m = MATERIALS[item.mat]; return { m: m.c1, l: m.c2, d: shade(m.c1, -40) }; }
  if (item.kind === 'gem' && typeof GEMS !== 'undefined') { const g = GEMS[item.gem]; return { m: g.c1, l: g.c2, d: shade(g.c1, -45) }; }
  if (item.kind === 'cha') return { w: '#e7e5e4', r: '#a16207', l: '#d6d3d1' };
  if (typeof ELIXIR_COLOR !== 'undefined' && ELIXIR_COLOR[item.kind]) { const c = ELIXIR_COLOR[item.kind]; return { c: '#8b5a2b', g: '#cbd5e1', r: c, l: shade(c, 60) }; }
  if (item.kind === 'wings' && WINGS[item.wing]) { const w = WINGS[item.wing]; return { m: w.color, l: w.edge, k: shade(w.color, -40) }; }
  return null;
}

// Paleta do herói conforme o equipamento (elmo, armadura, luvas, botas)
const GEAR_COLORS = {
  'Capuz': '#3f6212', 'Elmo': '#9ca3af', 'Elmo de Placas': '#e5e7eb',
  'Roupa de Couro': ['#a16207', '#713f12'], 'Cota de Malha': ['#94a3b8', '#475569'], 'Peitoral': ['#cbd5e1', '#64748b'],
  'Luvas de Couro': '#92400e', 'Manoplas': '#94a3b8', 'Luvas de Garra': '#57534e',
  'Botas de Couro': '#78350f', 'Botas de Ferro': '#64748b', 'Grevas': '#cbd5e1',
};
function heroPal(p) {
  const pal = Object.assign({}, DEFAULT_PAL.hero);
  if (!p || !p.eq) return pal;
  const base = it => { let best = null; for (const k in GEAR_COLORS) if (it.name.startsWith(k) && (!best || k.length > best.length)) best = k; return best && GEAR_COLORS[best]; };
  const tint = it => it.rarity === 4 ? RARITIES[4].color : it.set != null && typeof SETS !== 'undefined' ? SETS[it.set].color : null;
  const col = it => it && (tint(it) || base(it));
  const h = col(p.eq.helmet); if (h) pal.h = h;
  const ar = p.eq.armor, at = ar && tint(ar);
  const a = at ? [at, shade(at, -40)] : ar && base(ar);
  if (a) { pal.c = a[0]; pal.d = a[1]; }
  const g = col(p.eq.gloves); if (g) pal.g = g;
  const b = col(p.eq.boots); if (b) pal.k = b;
  return pal;
}
function heroPalKey(p) { return EQUIP_SLOTS.map(s => p.eq[s] ? p.eq[s].name + p.eq[s].rarity + (p.eq[s].set ?? '') : '-').join('|'); }

// Retrato do herói para a mochila
const _dollCache = {};
function heroPortraitURL(p) {
  const key = heroPalKey(p);
  if (_dollCache[key]) return _dollCache[key];
  const c = document.createElement('canvas');
  c.width = 96; c.height = 84;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.scale(6, 6);
  x.translate(8, 1);
  if (p.eq.wings && typeof drawWings === 'function') { x.save(); x.translate(0, 7); drawWings(x, p.eq.wings.wing, 0.6); x.restore(); }
  x.drawImage(getSprite('hero', heroPal(p)), -6, 1);
  if (p.eq.weapon && typeof drawWeaponInHand === 'function') { x.save(); x.translate(0, 1); drawWeaponInHand(x, p.eq.weapon, false); x.restore(); }
  _dollCache[key] = c.toDataURL();
  return _dollCache[key];
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
