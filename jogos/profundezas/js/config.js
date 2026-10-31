// =============================================================
// PROFUNDEZAS - configuração geral, biomas, inimigos e itens
// =============================================================
'use strict';

const TILE = 16;
const MAP_W = 64;
const MAP_H = 48;
const VERSION = 'v0.1';
const SAVE_KEY = 'profundezas_save_v1';
const MAX_FLOOR = 50;

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
    boss: { name: 'Rei Goblin', sprite: 'goblin', pal: { g: '#5c9a3c', e: '#ffde59', c: '#b91c1c', d: '#3f2a14', b: '#facc15' } },
  },
  {
    name: 'Minas Abandonadas', floor: '#38383b', alt: '#424246', wall: '#18181a',
    face: '#5b5650', faceDark: '#3c3935', accent: '#d97706', light: 80, proj: '#f59e0b',
    enemies: {
      chaser:  { name: 'Mineiro Esqueleto', sprite: 'humanoid', pal: { g: '#e5e5d5', e: '#111111', c: '#6b5b3e', d: '#3a3226' } },
      fast:    { name: 'Aranha',            sprite: 'bat',      pal: { w: '#2a2a2a', a: '#4a4a4a', e: '#ef4444' } },
      tank:    { name: 'Golem de Pedra',    sprite: 'slime',    pal: { a: '#7a7a80', b: '#4a4a50', l: '#a0a0a8', e: '#fbbf24' } },
      shooter: { name: 'Kobold Dinamiteiro', sprite: 'goblin',  pal: { g: '#c2703d', e: '#111111', c: '#5a4a3a', d: '#2e2620', b: '#ef4444' } },
    },
    boss: { name: 'Verme de Pedra', sprite: 'slime', pal: { a: '#8a7a6a', b: '#4a3f35', l: '#b8a890', e: '#f97316' } },
  },
  {
    name: 'Ruínas Submersas', floor: '#1e3a46', alt: '#244656', wall: '#0c1a20',
    face: '#2f6170', faceDark: '#1f4350', accent: '#2dd4bf', light: 105, proj: '#5eead4',
    enemies: {
      chaser:  { name: 'Homem-Peixe',       sprite: 'humanoid', pal: { g: '#3fa38a', e: '#fef08a', c: '#2b5f75', d: '#1b3a48' } },
      fast:    { name: 'Enguia Elétrica',   sprite: 'bat',      pal: { w: '#1e6f8f', a: '#38bdf8', e: '#fef08a' } },
      tank:    { name: 'Caranguejo Blindado', sprite: 'slime',  pal: { a: '#dc5f3c', b: '#9a3a22', l: '#f59e7a', e: '#111111' } },
      shooter: { name: 'Sereia Sombria',    sprite: 'goblin',   pal: { g: '#6b8fa3', e: '#ff66ff', c: '#3b2f5c', d: '#1f1a33', b: '#99ddee' } },
    },
    boss: { name: 'Hidra das Marés', sprite: 'slime', pal: { a: '#1f8a7a', b: '#0f4a42', l: '#5eead4', e: '#fef08a' } },
  },
  {
    name: 'Cripta Esquecida', floor: '#2e2438', alt: '#372b44', wall: '#140f19',
    face: '#4c3d5c', faceDark: '#33293f', accent: '#e5e5d0', light: 95, proj: '#c084fc',
    enemies: {
      chaser:  { name: 'Zumbi',              sprite: 'humanoid', pal: { g: '#7f9f6f', e: '#b91c1c', c: '#4a4a5a', d: '#2a2a33' } },
      fast:    { name: 'Fantasma',           sprite: 'bat',      pal: { w: '#c7c7e0', a: '#e8e8ff', e: '#222222' } },
      tank:    { name: 'Cavaleiro Amaldiçoado', sprite: 'slime', pal: { a: '#5a5a6a', b: '#33333d', l: '#8a8aa0', e: '#a855f7' } },
      shooter: { name: 'Necromante',         sprite: 'goblin',   pal: { g: '#d8d0c0', e: '#a855f7', c: '#3b1f4f', d: '#1d0f27', b: '#7c3aed' } },
    },
    boss: { name: 'Lich Ancestral', sprite: 'goblin', pal: { g: '#e8e0d0', e: '#a855f7', c: '#2e1065', d: '#1d0f27', b: '#c084fc' } },
  },
  {
    name: 'Coração do Abismo', floor: '#2a1414', alt: '#331818', wall: '#100606',
    face: '#4a1f1a', faceDark: '#331410', accent: '#f97316', light: 105, proj: '#fb923c',
    enemies: {
      chaser:  { name: 'Diabrete',            sprite: 'humanoid', pal: { g: '#c0392b', e: '#fde047', c: '#3a1010', d: '#1a0505' } },
      fast:    { name: 'Cão Infernal',        sprite: 'bat',      pal: { w: '#7f1d1d', a: '#b91c1c', e: '#fde047' } },
      tank:    { name: 'Demônio',             sprite: 'slime',    pal: { a: '#7f1d1d', b: '#450a0a', l: '#dc2626', e: '#fde047' } },
      shooter: { name: 'Elemental de Fogo',   sprite: 'goblin',   pal: { g: '#f97316', e: '#ffffff', c: '#b45309', d: '#78350f', b: '#fde047' } },
    },
    boss: { name: 'Senhor do Abismo', sprite: 'goblin', pal: { g: '#7f1d1d', e: '#fde047', c: '#111111', d: '#000000', b: '#f97316' } },
  },
];

function biomeOf(floor) { return BIOMES[Math.min(BIOMES.length - 1, Math.floor((floor - 1) / 10))]; }

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

const WEAPONS = [
  { name: 'Adaga',        dmg: 5,  cd: 0.26, range: 13 },
  { name: 'Espada Curta', dmg: 7,  cd: 0.36, range: 15 },
  { name: 'Machado',      dmg: 11, cd: 0.58, range: 16 },
  { name: 'Lança',        dmg: 8,  cd: 0.46, range: 22 },
];

const ARMORS = [
  { name: 'Roupa de Couro', def: 2 },
  { name: 'Cota de Malha',  def: 4 },
  { name: 'Peitoral',       def: 6 },
];

const RINGS = ['Anel', 'Amuleto'];

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

const LEGENDS = {
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
