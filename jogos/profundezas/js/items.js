// =============================================================
// Geração de itens, raridade, descrição, preço e "equipar melhores"
// Tipos: weapon, helmet, armor, gloves, boots, amulet, ring, wings, treasure
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

function rollBonuses(count, lvl, kind) {
  const cfg = SLOT_BONUS[kind] || { pool: null, mul: 1 };
  const pool = BONUS_POOL.filter(b => !cfg.pool || cfg.pool.includes(b.k));
  const out = [];
  for (let i = 0; i < count && pool.length; i++) {
    const b = pool.splice(ri(pool.length), 1)[0];
    out.push({ k: b.k, v: Math.max(1, Math.round(b.roll(lvl) * cfg.mul)) });
  }
  return out;
}

// Tipo de item que cai (sem tipo forçado)
function rollKind() {
  const n = Math.random() * 100;
  return n < 20 ? 'weapon' : n < 30 ? 'armor' : n < 38 ? 'helmet' : n < 46 ? 'gloves' : n < 54 ? 'boots' : n < 59 ? 'amulet' : n < 67 ? 'ring' : 'treasure';
}

function genItem(floor, minR = 0, forceKind = null, luck = 0) {
  const r = rollRarity(luck, minR);
  const kind = forceKind || rollKind();
  const lvl = floor;
  const item = { id: uid(), kind, rarity: r, lvl, up: 0, bonuses: [] };

  if (kind === 'weapon') {
    // metade das vezes, uma arma da classe do herói
    const cls = G.p && G.p.cls;
    const pool = cls && Math.random() < 0.5 ? WEAPONS.filter(w => w.cls === cls) : WEAPONS;
    const w = pick(pool);
    item.name = w.name; item.wtype = w.type;
    item.dmg = Math.round(w.dmg * itemDmgMul(lvl) * (1 + r * 0.08) * 10) / 10;
    item.cd = w.cd; item.range = w.range;
  } else if (kind === 'armor') {
    const a = pick(ARMORS);
    item.name = a.name;
    item.def = Math.max(1, Math.round(a.def * itemDefMul(lvl) * (1 + r * 0.1)));
  } else if (GEAR[kind]) {
    const g = pick(GEAR[kind]);
    item.name = g.name;
    item.def = Math.max(1, Math.round(g.def * itemDefMul(lvl) * (1 + r * 0.1)));
  } else if (kind === 'ring') {
    item.name = pick(RINGS);
  } else if (kind === 'amulet') {
    item.name = pick(AMULETS);
  } else if (kind === 'wings') {
    return makeWings(0, floor);
  } else if (kind === 'treasure') {
    const t = pick(TREASURES);
    item.name = t.name;
    item.base = t.base;
  }

  if (kind !== 'treasure') {
    let n = RARITIES[r].bonus;
    if (kind === 'ring' || kind === 'amulet') n = Math.max(1, n + 1);
    item.bonuses = rollBonuses(n, lvl, kind);
  }
  // amuletos raros ou melhores dão +1 nível numa habilidade
  if (kind === 'amulet' && r >= 2 && typeof SKILLS !== 'undefined') {
    const known = G.p ? Object.keys(G.p.skills || {}).filter(id => SKILLS[id] && SKILLS[id].kind !== 'ultimate') : [];
    item.skillUp = known.length && Math.random() < 0.6 ? pick(known) : pick(Object.keys(SKILLS).filter(id => SKILLS[id].kind !== 'ultimate'));
  }

  if (r === 4 && LEGENDS[kind]) {
    const L = LEGENDS[kind];
    item.name = L.name; item.effect = L.effect; item.legendDesc = L.desc;
    if (kind === 'weapon') { item.dmg = Math.round(8 * itemDmgMul(lvl) * (1 + r * 0.08) * 1.3 * 10) / 10; item.cd = 0.34; item.range = 16; item.wtype = 'espada'; }
    if (kind === 'armor') item.def = Math.round(item.def * 1.3);
  } else if (r === 4 && kind === 'treasure') {
    item.name = 'Relíquia dos Antigos';
  }

  rollSpecial(item);
  rollSet(item, floor);
  item.value = Math.round(itemValue(item) * (item.special ? 1.5 : 1));
  return item;
}

// Asas: wi = índice em WINGS (0 a 5)
function makeWings(wi, floor) {
  const w = WINGS[wi];
  const item = { id: uid(), kind: 'wings', wing: wi, name: w.name, rarity: wi >= 5 ? 4 : 3, lvl: floor, up: 0, bonuses: [] };
  item.def = Math.max(1, Math.round(0.8 * itemDefMul(floor)));
  item.bonuses = rollBonuses(2, floor, 'wings');
  item.value = itemValue(item) * 3;
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
  const slotMul = item.kind === 'weapon' || item.kind === 'armor' ? 1 : 0.7;
  return Math.round(8 * (1 + 0.3 * (item.lvl - 1)) * m * slotMul);
}

function isConsumable(item) { return !!CONSUMABLES[item.kind]; }
function isEquip(item) { return !!item && slotsForKind(item.kind).length > 0; }

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
    const t = weaponType(item);
    const how = t === 'arco' ? 'flechas à distância' : t === 'cajado' ? 'magia que explode' : t === 'martelo' ? 'golpe em área' : `alcance ${item.range}`;
    lines.push(`Dano ${d.toFixed(1)} · ${item.cd < 0.3 ? 'rápida' : item.cd > 0.55 ? 'lenta' : 'média'} · ${how}`);
  }
  if (DEF_KINDS.includes(item.kind) || item.kind === 'wings') lines.push(`Defesa ${Math.round(item.def * (1 + 0.08 * (item.up || 0)))}`);
  if (item.kind === 'wings') lines.push('Asas: a esquiva vira um voo por cima de espinhos, lava e inimigos.', '✦ ' + WINGS[item.wing].desc);
  if (item.kind === 'treasure') lines.push('Tesouro: venda no mercado da vila.');
  if (CONSUMABLES[item.kind]) lines.push(CONSUMABLES[item.kind].desc);
  for (const b of item.bonuses || []) {
    const def = BONUS_POOL.find(p => p.k === b.k);
    if (def) lines.push(def.label(b.v));
  }
  if (item.skillUp && typeof SKILLS !== 'undefined' && SKILLS[item.skillUp]) lines.push(`✦ +1 nível em ${SKILLS[item.skillUp].name} (se você já tiver aprendido)`);
  if (item.legendDesc) lines.push('★ ' + item.legendDesc);
  const sp = specialLine(item); if (sp) lines.push(sp);
  lines.push(...setLines(item));
  if (canUpgrade(item)) lines.push(`Melhorias no ferreiro: até +${upgradeCap(item)}`);
  if (item.lvl) lines.push(`Nível do item: ${item.lvl}`);
  return lines;
}
function canUpgrade(item) { return item && (item.kind === 'weapon' || DEF_KINDS.includes(item.kind)) && !!item.lvl; }

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
  if (item.special) s += 12;
  if (item.skillUp) s += 10;
  if (item.set !== undefined && item.set !== null) s += 10;
  const up = 1 + 0.08 * (item.up || 0);
  if (item.kind === 'weapon') {
    s += (item.dmg * up / item.cd) * 1.6;
    const cls = G.p && G.p.cls; // a arma da sua classe vale mais
    const w = WEAPONS.find(w => w.type === weaponType(item));
    if (cls && w && w.cls === cls) s *= 1.3;
  }
  if (DEF_KINDS.includes(item.kind)) s += item.def * up * 2.5;
  if (item.kind === 'wings') s += 30 + item.wing * 6 + item.def * 2.5;
  return s;
}
// Espaço onde um item entraria (para anéis: o vazio ou o mais fraco)
function targetSlot(p, item) {
  const slots = slotsForKind(item.kind);
  if (slots.length === 1) return slots[0];
  const empty = slots.find(s => !p.eq[s]);
  if (empty) return empty;
  return itemScore(p.eq[slots[0]]) <= itemScore(p.eq[slots[1]]) ? slots[0] : slots[1];
}
// Peça que o equipar automático não troca sozinho (escolha do jogador)
// mode 'style' (botão Equipar melhores): só mantém o estilo de arma
function keepPiece(p, cur, cand, mode) {
  if (!cur) return false;
  if (mode !== 'style' && (cur.special || cur.skillUp || cur.effect)) return true;
  if (cur.set !== undefined && cur.set !== null && cand.set !== cur.set && setCount(p, cur.set) >= 2) return true; // não desfaz um conjunto ativo
  if (cur.kind === 'weapon') {
    const cls = w => (WEAPONS.find(x => x.type === weaponType(w)) || {}).cls;
    if (cls(cand) !== cls(cur)) return true; // outro estilo de arma (ex.: arco por machado)
  }
  return false;
}
// Equipa o melhor de cada espaço (mochila x equipado). Retorna os nomes equipados.
// safe = true (equipar automático): respeita as peças especiais e o estilo de arma.
function equipBest(p, safe) {
  const done = [];
  for (const kind of ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'amulet', 'ring', 'wings']) {
    const slots = slotsForKind(kind);
    for (let pass = 0; pass < slots.length; pass++) {
      const slot = targetSlot(p, { kind });
      let bestS = itemScore(p.eq[slot]), bestIdx = -1;
      p.bag.forEach((it, i) => { if (it.kind === kind && !(safe && keepPiece(p, p.eq[slot], it, safe))) { const sc = itemScore(it); if (sc > bestS + 0.01) { bestS = sc; bestIdx = i; } } });
      if (bestIdx < 0) break;
      const best = p.bag[bestIdx], old = p.eq[slot];
      p.eq[slot] = best;
      if (old) p.bag[bestIdx] = old; else p.bag.splice(bestIdx, 1);
      done.push(best.name);
    }
  }
  if (done.length) p.hp = Math.min(p.hp, playerStats(p).maxHp);
  return done;
}
function isUpgrade(p, item) { return isEquip(item) && itemScore(item) > itemScore(p.eq[targetSlot(p, item)]) + 0.01; }
function equipItem(p, bagIdx) {
  const it = p.bag[bagIdx];
  const slot = targetSlot(p, it);
  const old = p.eq[slot];
  p.eq[slot] = it;
  if (old) p.bag[bagIdx] = old; else p.bag.splice(bagIdx, 1);
  p.hp = Math.min(p.hp, playerStats(p).maxHp);
}
