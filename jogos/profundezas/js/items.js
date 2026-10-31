// =============================================================
// Geração de itens, raridade, descrição e preço
// =============================================================
'use strict';

function rollRarity(luck, minR = 0) {
  const ws = RARITIES.map((r, i) => (i >= 2 ? r.weight * (1 + luck * 0.04) : r.weight));
  for (let i = 0; i < minR; i++) ws[i] = 0;
  const total = ws.reduce((a, b) => a + b, 0);
  let n = Math.random() * total;
  for (let i = 0; i < ws.length; i++) { n -= ws[i]; if (n <= 0) return i; }
  return minR;
}

function rollBonuses(count, lvl, exclude) {
  const pool = BONUS_POOL.filter(b => !exclude || !exclude.includes(b.k));
  const out = [];
  for (let i = 0; i < count && pool.length; i++) {
    const b = pool.splice(ri(pool.length), 1)[0];
    out.push({ k: b.k, v: b.roll(lvl) });
  }
  return out;
}

function genItem(floor, minR = 0, forceKind = null, luck = 0) {
  const r = rollRarity(luck, minR);
  let kind = forceKind;
  if (!kind) {
    const n = Math.random() * 100;
    kind = n < 28 ? 'weapon' : n < 50 ? 'armor' : n < 62 ? 'ring' : 'treasure';
  }
  const lvl = floor;
  const item = { id: uid(), kind, rarity: r, lvl, up: 0, bonuses: [] };

  if (kind === 'weapon') {
    const w = pick(WEAPONS);
    item.name = w.name;
    item.dmg = Math.round(w.dmg * (1 + 0.12 * (lvl - 1)) * (1 + r * 0.08) * 10) / 10;
    item.cd = w.cd; item.range = w.range;
  } else if (kind === 'armor') {
    const a = pick(ARMORS);
    item.name = a.name;
    item.def = Math.round(a.def * (1 + 0.1 * (lvl - 1)) * (1 + r * 0.1));
  } else if (kind === 'ring') {
    item.name = pick(RINGS);
  } else if (kind === 'treasure') {
    const t = pick(TREASURES);
    item.name = t.name;
    item.base = t.base;
  }

  if (kind !== 'treasure') {
    let n = RARITIES[r].bonus;
    if (kind === 'ring') n = Math.max(1, n + 1);
    item.bonuses = rollBonuses(n, lvl);
  }

  if (r === 4 && LEGENDS[kind]) {
    const L = LEGENDS[kind];
    item.name = L.name; item.effect = L.effect; item.legendDesc = L.desc;
    if (kind === 'weapon') { item.dmg = Math.round(item.dmg * 1.3 * 10) / 10; item.cd = 0.34; item.range = 16; }
    if (kind === 'armor') item.def = Math.round(item.def * 1.3);
  } else if (r === 4 && kind === 'treasure') {
    item.name = 'Relíquia dos Antigos';
  }

  item.value = itemValue(item);
  return item;
}

function makeConsumable(kind, qty = 1) {
  const c = CONSUMABLES[kind];
  return { id: uid(), kind, name: c.name, rarity: 0, qty, value: Math.floor(c.price / 2), bonuses: [] };
}

function itemValue(item) {
  const m = RARITIES[item.rarity].mult;
  if (item.kind === 'treasure') return Math.round(item.base * (1 + 0.35 * (item.lvl - 1)) * m);
  if (CONSUMABLES[item.kind]) return Math.floor(CONSUMABLES[item.kind].price / 2);
  return Math.round(8 * (1 + 0.3 * (item.lvl - 1)) * m);
}

function isConsumable(item) { return !!CONSUMABLES[item.kind]; }
function isEquip(item) { return item.kind === 'weapon' || item.kind === 'armor' || item.kind === 'ring'; }

function itemDisplayName(item) {
  let n = item.name;
  if (item.up) n += ' +' + item.up;
  if (item.qty > 1) n += ' x' + item.qty;
  return n;
}

function itemStatLines(item) {
  const lines = [];
  if (item.kind === 'weapon') {
    const d = item.dmg * (1 + 0.08 * (item.up || 0));
    lines.push(`Dano ${d.toFixed(1)} · ${item.cd < 0.3 ? 'rápida' : item.cd > 0.5 ? 'lenta' : 'média'} · alcance ${item.range}`);
  }
  if (item.kind === 'armor') lines.push(`Defesa ${Math.round(item.def * (1 + 0.08 * (item.up || 0)))}`);
  if (item.kind === 'treasure') lines.push('Tesouro: venda no mercado da vila.');
  if (CONSUMABLES[item.kind]) lines.push(CONSUMABLES[item.kind].desc);
  for (const b of item.bonuses || []) {
    const def = BONUS_POOL.find(p => p.k === b.k);
    if (def) lines.push(def.label(b.v));
  }
  if (item.legendDesc) lines.push('★ ' + item.legendDesc);
  if (item.lvl) lines.push(`Nível do item: ${item.lvl}`);
  return lines;
}

// Tenta colocar um item na mochila; retorna true se coube.
function bagAdd(bag, size, item) {
  if (isConsumable(item)) {
    for (const it of bag) {
      if (it.kind === item.kind && it.qty < STACK_MAX) {
        const room = STACK_MAX - it.qty;
        const n = Math.min(room, item.qty);
        it.qty += n; item.qty -= n;
        if (item.qty <= 0) return true;
      }
    }
  }
  if (bag.length >= size) return false;
  bag.push(item);
  return true;
}

// ---------- Pontuação para "equipar melhores" ----------
const BONUS_WEIGHT = { dmg: 1.0, hp: 0.25, crit: 1.2, spd: 0.8, steal: 3, luck: 0.4, def: 1.5 };
function itemScore(item) {
  if (!item || !isEquip(item)) return -1;
  let s = 0;
  for (const b of item.bonuses || []) s += (BONUS_WEIGHT[b.k] || 0) * b.v;
  if (item.effect) s += 15;
  const up = 1 + 0.08 * (item.up || 0);
  if (item.kind === 'weapon') s += (item.dmg * up / item.cd) * 1.6;
  if (item.kind === 'armor') s += item.def * up * 2.5;
  return s;
}
// Equipa o melhor item de cada tipo (mochila x equipado). Retorna os nomes equipados.
function equipBest(p) {
  const done = [];
  for (const slot of ['weapon', 'armor', 'ring']) {
    let best = p.eq[slot], bestS = itemScore(best), bestIdx = -1;
    p.bag.forEach((it, i) => { if (it.kind === slot) { const sc = itemScore(it); if (sc > bestS + 0.01) { best = it; bestS = sc; bestIdx = i; } } });
    if (bestIdx >= 0) {
      const old = p.eq[slot];
      p.eq[slot] = best;
      if (old) p.bag[bestIdx] = old; else p.bag.splice(bestIdx, 1);
      done.push(best.name);
    }
  }
  if (done.length) p.hp = Math.min(p.hp, playerStats(p).maxHp);
  return done;
}
function isUpgrade(p, item) { return isEquip(item) && itemScore(item) > itemScore(p.eq[item.kind]) + 0.01; }
