// =============================================================
// PROFUNDEZAS - configuração geral, biomas, inimigos e itens
// =============================================================
'use strict';

const TILE = 16;
const MAP_W = 64;
const MAP_H = 48;
const VERSION = 'v1.1';
const SAVE_KEY = 'profundezas_save_v1';
const MAX_FLOOR = 50;
const BAG_START = 24;   // espaços da mochila no começo
const BAG_MAX = 60;     // máximo com o alfaiate
const BAG_STEP = 6;     // espaços por melhoria
const STACK_MAX = 20;   // consumíveis iguais por espaço

// ---------- Biomas (10 andares cada) ----------
const BIOMES = [
  {
    name: 'Cavernas Úmidas', floor: '#3b2f2a', alt: '#44362e', wall: '#1a1512',
    face: '#5a4636', faceDark: '#3d3027', accent: '#4d7c3a', light: 125, proj: '#c9a46a',
    enemies: {
      chaser:  { name: 'Rato Gigante',    sprite: 'rat',    pal: { a: '#8b7d6b', b: '#5c5246', e: '#ff4040', t: '#d9a0a0' } },
      fast:    { name: 'Morcego',         sprite: 'bat',    pal: { w: '#4b3b5c', a: '#6b5b7c', e: '#ffde59' } },
      tank:    { name: 'Slime',           sprite: 'slime',  pal: { a: '#5fbf5f', b: '#2f7f2f', l: '#a7f3a7', e: '#103010' } },
      shooter: { name: 'Goblin Arqueiro', sprite: 'goblin', pal: { g: '#6fa84f', e: '#ff3b3b', c: '#7c4a1e', d: '#3f2a14', b: '#c9a46a' } },
    },
    boss: { name: 'Rei Goblin', kind: 0, sprite: 'b_goblin', pal: { k: '#facc15', g: '#5c9a3c', e: '#ffde59', c: '#b91c1c', d: '#3f2a14', b: '#facc15' } },
  },
  {
    name: 'Minas Abandonadas', floor: '#38383b', alt: '#424246', wall: '#18181a',
    face: '#5b5650', faceDark: '#3c3935', accent: '#d97706', light: 80, proj: '#f59e0b',
    enemies: {
      chaser:  { name: 'Mineiro Esqueleto', sprite: 'skel', pal: { h: '#facc15', l: '#fff7c2', w: '#e5e5d5', d: '#3a3226', m: '#94a3b8', p: '#7c4a1e' } },
      fast:    { name: 'Aranha', sprite: 'spider', pal: { l: '#7a5a3e', a: '#9a7650', b: '#3a2a1a', e: '#ef4444' } },
      tank:    { name: 'Golem de Pedra', sprite: 'golem', pal: { a: '#7a7a80', b: '#4a4a50', l: '#a8a8b0', e: '#fbbf24' } },
      shooter: { name: 'Kobold Dinamiteiro', sprite: 'kobold', pal: { g: '#c2703d', e: '#111111', c: '#5a4a3a', d: '#2e2620', r: '#dc2626', y: '#fde047' } },
    },
    boss: { name: 'Verme de Pedra', kind: 1, sprite: 'b_worm', pal: { a: '#8a7a6a', b: '#4a3f35', l: '#b8a890', e: '#f97316', t: '#f5f5dc' } },
  },
  {
    name: 'Ruínas Submersas', floor: '#1e3a46', alt: '#244656', wall: '#0c1a20',
    face: '#2f6170', faceDark: '#1f4350', accent: '#2dd4bf', light: 105, proj: '#5eead4',
    enemies: {
      chaser:  { name: 'Homem-Peixe', sprite: 'fishman', pal: { g: '#3fa38a', e: '#fef08a', f: '#2b7a6a', c: '#a7e8d8', d: '#1b3a48' } },
      fast:    { name: 'Enguia Elétrica', sprite: 'eel', pal: { w: '#1e6f8f', a: '#38bdf8', e: '#fef08a' } },
      tank:    { name: 'Caranguejo Blindado', sprite: 'crab', pal: { a: '#dc5f3c', b: '#9a3a22', l: '#f59e7a', e: '#111111', c: '#ef7a50' } },
      shooter: { name: 'Sereia Sombria', sprite: 'siren', pal: { h: '#5b4a9c', g: '#9fc3d1', e: '#ff66ff', c: '#2b8a8a', b: '#99eeff' } },
    },
    boss: { name: 'Hidra das Marés', kind: 2, sprite: 'b_hydra', pal: { a: '#3cbfa4', b: '#126b5d', l: '#a7f3e4', e: '#fef08a' } },
  },
  {
    name: 'Cripta Esquecida', floor: '#2e2438', alt: '#372b44', wall: '#140f19',
    face: '#4c3d5c', faceDark: '#33293f', accent: '#e5e5d0', light: 95, proj: '#c084fc',
    enemies: {
      chaser:  { name: 'Zumbi', sprite: 'zombie', pal: { g: '#7f9f6f', e: '#b91c1c', c: '#4a4a5a', d: '#2a2a33' } },
      fast:    { name: 'Fantasma', sprite: 'ghost', pal: { w: '#c7c7e0', a: '#e8e8ff', e: '#222244' } },
      tank:    { name: 'Cavaleiro Amaldiçoado', sprite: 'knight', pal: { a: '#5a5a6a', b: '#33333d', l: '#8a8aa0', e: '#a855f7', s: '#cbd5e1' } },
      shooter: { name: 'Necromante', sprite: 'necro', pal: { c: '#3b1f4f', g: '#d8d0c0', e: '#a855f7', b: '#7c4a1e', o: '#c084fc', d: '#1d0f27' } },
    },
    boss: { name: 'Lich Ancestral', kind: 3, sprite: 'b_lich', pal: { k: '#facc15', g: '#e8e0d0', e: '#a855f7', t: '#555555', c: '#2e1065', d: '#1d0f27', b: '#7c4a1e', o: '#c084fc' } },
  },
  {
    name: 'Coração do Abismo', floor: '#2a1414', alt: '#331818', wall: '#100606',
    face: '#4a1f1a', faceDark: '#331410', accent: '#f97316', light: 105, proj: '#fb923c',
    enemies: {
      chaser:  { name: 'Diabrete', sprite: 'imp', pal: { h: '#1a0505', g: '#c0392b', e: '#fde047', d: '#3a1010', w: '#7f1d1d' } },
      fast:    { name: 'Cão Infernal', sprite: 'hound', pal: { a: '#6b1f1a', w: '#2a0808', e: '#fde047', f: '#f97316' } },
      tank:    { name: 'Demônio', sprite: 'demon', pal: { a: '#7f1d1d', b: '#450a0a', l: '#dc2626', e: '#fde047', h: '#1a0505' } },
      shooter: { name: 'Elemental de Fogo', sprite: 'flame', pal: { f: '#f97316', y: '#fde047', w: '#ffffff', e: '#7f1d1d' } },
    },
    boss: { name: 'Senhor do Abismo', kind: 4, sprite: 'b_abyss', pal: { h: '#1a0505', g: '#7f1d1d', e: '#fde047', f: '#f97316', c: '#111111', d: '#000000', w: '#450a0a' } },
  },
];

BIOMES.forEach((b, i) => { b.idx = i; });
// Depois do andar 50 (Profundezas Infinitas), os biomas voltam a se repetir
function biomeOf(floor) {
  const i = Math.floor((floor - 1) / 10);
  return BIOMES[floor > MAX_FLOOR ? i % BIOMES.length : Math.min(BIOMES.length - 1, i)];
}

// ---------- Curva de dificuldade (simulada para manter ~3 golpes por inimigo) ----------
// Inimigos: vida cresce 6% por andar + 4,5% linear; o começo é mais leve
function enemyHpMul(f) { return Math.pow(1.06, f - 1) * (1 + 0.045 * (f - 1)) * (1.7 + 0.9 * Math.min(1, (f - 1) / 12)) * 1.12; }
function enemyDmgMul(f) { return (1 + 0.10 * (f - 1)) * Math.pow(1.012, f - 1) * (1.5 + 0.6 * Math.min(1, (f - 1) / 15)) * (1.05 + 0.2 * Math.min(1, (f - 1) / 12)); } // v1.1: mais peças de defesa → inimigos batem mais forte com o tempo
function enemySpdMul(f) { return 1 + Math.min(0.45, 0.009 * (f - 1)); }
// Itens: dano cresce 6% por nível do item; armadura 7% linear
function itemDmgMul(lvl) { return Math.pow(1.06, lvl - 1); }
function itemDefMul(lvl) { return 1 + 0.07 * (lvl - 1); }
// Limite de melhorias do ferreiro conforme o nível do item
function upgradeCap(item) { return Math.min(10, 2 + Math.floor((item.lvl || 1) / 5)); }

// ---------- Comportamentos base dos inimigos (andar 1) ----------
const ENEMY_BASE = {
  chaser:  { hp: 14, dmg: 5, spd: 46, xp: 6,  r: 6 },
  fast:    { hp: 8,  dmg: 4, spd: 76, xp: 5,  r: 5 },
  tank:    { hp: 32, dmg: 8, spd: 24, xp: 9,  r: 7 },
  shooter: { hp: 15, dmg: 6, spd: 40, xp: 10, r: 6 },
};

// ---------- Itens ----------
const RARITIES = [
  { name: 'Comum',    color: '#e8e8e8', weight: 70,  bonus: 0, mult: 1 },
  { name: 'Incomum',  color: '#4ade80', weight: 20,  bonus: 1, mult: 2 },
  { name: 'Raro',     color: '#60a5fa', weight: 8,   bonus: 2, mult: 4 },
  { name: 'Épico',    color: '#c084fc', weight: 1.8, bonus: 3, mult: 8 },
  { name: 'Lendário', color: '#facc15', weight: 0.2, bonus: 3, mult: 22 },
];

// type: como a arma ataca. cls: classe que mais combina com ela.
const WEAPONS = [
  { name: 'Adaga',        dmg: 5,   cd: 0.26, range: 13, type: 'adaga',   cls: 'guerreiro' },
  { name: 'Espada Curta', dmg: 7,   cd: 0.36, range: 15, type: 'espada',  cls: 'guerreiro' },
  { name: 'Machado',      dmg: 11,  cd: 0.58, range: 16, type: 'machado', cls: 'guerreiro' },
  { name: 'Lança',        dmg: 8,   cd: 0.46, range: 22, type: 'lanca',   cls: 'guerreiro' },
  { name: 'Martelo',      dmg: 14,  cd: 0.72, range: 18, type: 'martelo', cls: 'guerreiro' },
  { name: 'Arco',         dmg: 6.5, cd: 0.42, range: 0,  type: 'arco',    cls: 'cacador' },
  { name: 'Cajado',       dmg: 7.5, cd: 0.52, range: 0,  type: 'cajado',  cls: 'arcano' },
];
function weaponType(item) { if (!item) return 'espada'; if (item.wtype) return item.wtype; const w = WEAPONS.find(w => item.name && item.name.startsWith(w.name)); return w ? w.type : item.name && item.name.startsWith('Lâmina') ? 'espada' : 'espada'; }
// Classes escolhidas no começo do jogo
const CLASS_INFO = {
  guerreiro: { name: 'Guerreiro', weapon: 'Espada Curta', skill: 'giro',    color: '#f87171', desc: 'Espada, machado, lança e martelo. Muita vida e golpes em área de perto.' },
  cacador:   { name: 'Caçador',   weapon: 'Arco',         skill: 'flechas', color: '#4ade80', desc: 'Arco que atira flechas de longe. Rápido, crítico alto e esquiva ágil.' },
  arcano:    { name: 'Arcano',    weapon: 'Cajado',       skill: 'fogo',    color: '#a78bfa', desc: 'Cajado com magia que explode. Habilidades fortes que recarregam rápido.' },
};
const isRanged = item => ['arco', 'cajado'].includes(weaponType(item));

// Peças de defesa: a armadura tem a metade da defesa; capacete, luvas e botas, o resto
const ARMORS = [
  { name: 'Roupa de Couro', def: 1 },
  { name: 'Cota de Malha',  def: 2 },
  { name: 'Peitoral',       def: 3 },
];
const GEAR = {
  helmet: [{ name: 'Capuz', def: 0.6 }, { name: 'Elmo', def: 0.8 }, { name: 'Elmo de Placas', def: 1.0 }],
  gloves: [{ name: 'Luvas de Couro', def: 0.4 }, { name: 'Manoplas', def: 0.6 }, { name: 'Luvas de Garra', def: 0.7 }],
  boots:  [{ name: 'Botas de Couro', def: 0.4 }, { name: 'Botas de Ferro', def: 0.6 }, { name: 'Grevas', def: 0.7 }],
};
const RINGS = ['Anel'];
const AMULETS = ['Amuleto', 'Colar', 'Talismã'];

// Espaços de equipamento (a ordem é a da tela da mochila)
const EQUIP_SLOTS = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'amulet', 'ring', 'ring2', 'wings'];
const SLOT_LABEL = { weapon: 'Arma', helmet: 'Capacete', armor: 'Armadura', gloves: 'Luvas', boots: 'Botas', amulet: 'Amuleto', ring: 'Anel', ring2: 'Anel', wings: 'Asas' };
const KIND_LABEL = { weapon: 'Arma', helmet: 'Capacete', armor: 'Armadura', gloves: 'Luvas', boots: 'Botas', amulet: 'Amuleto', ring: 'Anel', wings: 'Asas' };
const DEF_KINDS = ['helmet', 'armor', 'gloves', 'boots'];
function slotsForKind(kind) { return kind === 'ring' ? ['ring', 'ring2'] : EQUIP_SLOTS.includes(kind) ? [kind] : []; }
// Bônus aleatórios que cada tipo de peça pode ter, e a força deles
const SLOT_BONUS = {
  weapon: { pool: ['dmg', 'crit', 'steal', 'spd'], mul: 1 },
  armor:  { pool: ['hp', 'def', 'dmg', 'luck'],     mul: 1 },
  helmet: { pool: ['hp', 'def', 'luck', 'crit'],    mul: 0.5 },
  gloves: { pool: ['crit', 'dmg', 'steal'],         mul: 0.5 },
  boots:  { pool: ['spd', 'hp', 'def'],             mul: 0.5 },
  amulet: { pool: ['dmg', 'crit', 'hp', 'luck'],    mul: 0.6 },
  ring:   { pool: null,                             mul: 0.7 },
  wings:  { pool: ['spd', 'hp', 'dmg', 'crit'],     mul: 0.8 },
};

// Asas: uma por chefe (kind do chefe) e as Abissais nas Profundezas Infinitas
const WINGS = [
  { name: 'Asas de Morcego',  color: '#6b5b7c', edge: '#a78bfa', desc: 'O voo é mais longo e rápido.' },
  { name: 'Asas de Pedra',    color: '#78716c', edge: '#d6d3d1', desc: 'Ao pousar, você recebe 50% menos dano por 2 s.' },
  { name: 'Asas de Escama',   color: '#0f766e', edge: '#5eead4', desc: 'Voar recupera 3% da vida.' },
  { name: 'Asas Espectrais',  color: '#c7c7e0', edge: '#ffffff', desc: 'O voo recarrega 40% mais rápido.' },
  { name: 'Asas de Fogo',     color: '#c2410c', edge: '#fde047', desc: 'Por onde você voa, o chão pega fogo e queima os inimigos.' },
  { name: 'Asas Abissais',    color: '#1e1b4b', edge: '#f43f5e', desc: 'Reúne o poder de todas as asas.' },
];

const TREASURES = [
  { name: 'Gema Bruta',     base: 14 },
  { name: 'Moeda Antiga',   base: 10 },
  { name: 'Cálice de Prata', base: 18 },
  { name: 'Ídolo Dourado',  base: 24 },
  { name: 'Relíquia',       base: 30 },
];

const BONUS_POOL = [
  { k: 'dmg',   label: v => `+${v}% dano`,          roll: (l) => 4 + ri(8) },
  { k: 'hp',    label: v => `+${v} vida`,           roll: (l) => 8 + ri(10) + l * 2 },
  { k: 'crit',  label: v => `+${v}% crítico`,       roll: (l) => 2 + ri(5) },
  { k: 'spd',   label: v => `+${v}% velocidade`,    roll: (l) => 3 + ri(6) },
  { k: 'steal', label: v => `${v}% roubo de vida`,  roll: (l) => 1 + ri(3) },
  { k: 'luck',  label: v => `+${v} sorte`,          roll: (l) => 2 + ri(4) },
  { k: 'def',   label: v => `+${v} defesa`,         roll: (l) => 1 + ri(3) + Math.floor(l / 4) },
];

const LEGENDS = { // (efeitos únicos dos lendários)
  weapon: { name: 'Lâmina do Primeiro Fogo', effect: 'fogo',     desc: 'A cada 3º golpe que acerta, uma explosão de fogo atinge os inimigos próximos.' },
  ring:   { name: 'Coração do Abismo',       effect: 'vamp',     desc: 'Cura 8% de todo o dano causado.' },
  armor:  { name: 'Égide do Rei Goblin',     effect: 'espinhos', desc: 'Devolve 40% do dano recebido a quem atacou.' },
};

// Consumíveis (preço de compra na vila)
const CONSUMABLES = {
  potion: { name: 'Poção de Vida',          price: 25, desc: 'Recupera 35% da vida + 20.' },
  food:   { name: 'Pão',                    price: 10, desc: 'Recupera 35 de fome.' },
  scroll: { name: 'Pergaminho de Retorno',  price: 40, desc: 'Leva você de volta à vila com tudo o que carrega.' },
};

// ---------- Utilidades ----------
function ri(n) { return Math.floor(Math.random() * n); }
function rr(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function dist(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); }
function pick(arr) { return arr[ri(arr.length)]; }
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); }
let _uid = 1;
function uid() { return _uid++; }
