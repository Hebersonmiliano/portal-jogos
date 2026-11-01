// =============================================================
// Conjuntos de equipamento: capacete, armadura, luvas e botas do mesmo conjunto
// dão bônus com 2 e com 4 peças. Cada bioma tem o seu conjunto.
// =============================================================
'use strict';

const SET_KINDS = ['helmet', 'armor', 'gloves', 'boots'];
const SETS = [
  { id: 0, name: 'Andarilho', suffix: 'do Andarilho', color: '#4ade80', biome: 'Cavernas Úmidas',
    b2: '+10% de velocidade', b4: '+1 esquiva extra e a esquiva recarrega 30% mais rápido' },
  { id: 1, name: 'Mineiro de Ferro', suffix: 'do Mineiro', color: '#fbbf24', biome: 'Minas Abandonadas',
    b2: '+15% de defesa', b4: 'Recebe 15% menos dano e não fica mais lento (teias e agarrões)' },
  { id: 2, name: 'Maré', suffix: 'da Maré', color: '#2dd4bf', biome: 'Ruínas Submersas',
    b2: '+15% de vida', b4: 'Recupera 1,5% da vida por segundo na masmorra' },
  { id: 3, name: 'Sepulcro', suffix: 'do Sepulcro', color: '#c084fc', biome: 'Cripta Esquecida',
    b2: '+8% de chance de crítico', b4: 'Cada inimigo derrotado adianta as habilidades em 0,6 s' },
  { id: 4, name: 'Brasa', suffix: 'da Brasa', color: '#f97316', biome: 'Coração do Abismo',
    b2: '+12% de dano', b4: 'Golpes têm 15% de chance de explodir em fogo' },
  { id: 5, name: 'Guardião da Chama', suffix: 'do Guardião da Chama', color: '#f0abfc', biome: 'chefes corrompidos (andares 60 a 100)',
    b2: '+10% de dano e +10% de vida', b4: 'Ao levar um golpe fatal, renasce com 40% da vida (uma vez por andar)' },
];

// Conjunto do andar (depois do 50, qualquer um)
function setForFloor(floor) { return floor > MAX_FLOOR ? ri(5) : Math.min(SETS.length - 1, Math.floor((floor - 1) / 10)); }

// Chamado por genItem: transforma a peça numa peça de conjunto (às vezes)
function rollSet(item, floor, force) {
  if (!SET_KINDS.includes(item.kind) || item.effect) return;
  const chance = force !== undefined ? 1 : [0, 0.1, 0.35, 0.5, 0.5][item.rarity] || 0;
  if (Math.random() >= chance) return;
  const s = SETS[typeof force === 'number' ? force : setForFloor(floor)];
  item.set = s.id;
  item.name = `${item.name} ${s.suffix}`;
}

function setCount(p, id) { return SET_KINDS.reduce((n, k) => n + (p.eq && p.eq[k] && p.eq[k].set === id ? 1 : 0), 0); }
function setHas(p, id, n) { return setCount(p, id) >= n; }
function activeSets(p) { return SETS.map(s => ({ s, n: setCount(p, s.id) })).filter(x => x.n >= 2); }

// Bônus nos atributos (chamado no fim de playerStats)
function applySetStats(p, st) {
  if (!p.eq) return st;
  if (setHas(p, 0, 2)) st.speed *= 1.10;
  if (setHas(p, 1, 2)) st.def *= 1.15;
  if (setHas(p, 2, 2)) st.maxHp = Math.round(st.maxHp * 1.15);
  if (setHas(p, 3, 2)) st.crit = Math.min(0.8, st.crit + 0.08);
  if (setHas(p, 4, 2)) st.dmgMul *= 1.12;
  if (setHas(p, 5, 2)) { st.dmgMul *= 1.1; st.maxHp = Math.round(st.maxHp * 1.1); }
  return st;
}

// Linhas da descrição do item
function setLines(item) {
  if (item.set === undefined || item.set === null) return [];
  const s = SETS[item.set], n = G.p ? setCount(G.p, s.id) : 0;
  return [
    `<span style="color:${s.color}">◆ Conjunto ${s.name} (${n}/4 equipadas)</span>`,
    `<span style="color:${n >= 2 ? s.color : '#6b6378'}">2 peças: ${s.b2}</span>`,
    `<span style="color:${n >= 4 ? s.color : '#6b6378'}">4 peças: ${s.b4}</span>`,
  ];
}

// Efeitos de 4 peças que reagem ao jogo
function updateSets(p, dt) {
  if (setHas(p, 1, 4)) p.slowT = 0;
  if (setHas(p, 2, 4) && G.state === 'dungeon' && !p.dead) { const st = playerStats(p); p.hp = Math.min(st.maxHp, p.hp + st.maxHp * 0.015 * dt); }
}
function setOnKill(p) {
  if (setHas(p, 3, 4)) for (const id in p.skillCd) p.skillCd[id] = Math.max(0, p.skillCd[id] - 0.6);
}
function setOnHit(p, e, dmg) {
  if (setHas(p, 4, 4) && Math.random() < 0.15) {
    const x = e.x, y = e.y - 5;
    setTimeout(() => { if (G.state === 'dungeon') areaDamage(x, y, 26, dmg * 0.6, '#f97316'); }, 40);
  }
}
const setDamageTaken = p => setHas(p, 1, 4) ? 0.85 : 1;
const setDodgeExtra = p => setHas(p, 0, 4) ? 1 : 0;
const setDodgeRecharge = p => setHas(p, 0, 4) ? 0.7 : 1;
