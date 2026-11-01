// =============================================================
// Profundidade: chave do andar, bônus de andar limpo,
// modificadores de andar e efeitos especiais dos itens.
// =============================================================
'use strict';

// ---------- Modificadores de andar ----------
const MODIFIERS = {
  horda:      { name: 'Horda',       desc: '+50% de inimigos' },
  elites:     { name: 'Elites',      desc: 'muito mais inimigos de elite' },
  escuridao:  { name: 'Escuridão',   desc: 'sua luz alcança menos' },
  velozes:    { name: 'Velozes',     desc: 'inimigos 25% mais rápidos' },
  furia:      { name: 'Fúria',       desc: 'inimigos causam 30% mais dano' },
  blindados:  { name: 'Blindados',   desc: 'inimigos com 40% mais vida' },
  explosivos: { name: 'Explosivos',  desc: 'inimigos soltam fogo ao morrer' },
};

function rollMods(floor, isBoss) {
  G.mods = {}; G.modList = [];
  let n = 0;
  if (floor > MAX_FLOOR) n = Math.min(3, 1 + Math.floor((floor - MAX_FLOOR - 1) / 20));
  else if (floor > 10 && !isBoss && Math.random() < 0.2) n = 1;
  const ids = Object.keys(MODIFIERS).sort(() => Math.random() - 0.5).slice(0, n);
  for (const id of ids) { G.mods[id] = true; G.modList.push(id); }
}
function modReward() { return 1 + 0.25 * (G.modList ? G.modList.length : 0); }

// ---------- Chave do andar ----------
function placeKey(L, floor) {
  L.locked = false;
  if (L.isBoss || floor < 2) return;
  const sx = L.start.x, sy = L.start.y;
  const cands = G.enemies.filter(e => !e.isProp && !e.isBoss && dist(e.x, e.y, sx, sy) > 160 && dist(e.x, e.y, L.stairs.x, L.stairs.y) > 60);
  const pool = cands.length ? cands : G.enemies.filter(e => !e.isProp && !e.isBoss);
  if (!pool.length) return;
  const k = pick(pool);
  k.key = true; k.elite = true; k.scale = 1.35; k.r = ENEMY_BASE[k.type].r * 1.35; k.hw = 4 * 1.35;
  k.maxHp = Math.round(k.maxHp * 3); k.hp = k.maxHp; k.dmg *= 1.4;
  k.name = 'Guardião da Chave';
  L.locked = true;
}

function onKeyHolderDeath(e) {
  const L = G.level;
  if (!L.locked) return;
  L.locked = false;
  G.effects.push({ type: 'ring', x: e.x, y: e.y - 6, r: 4, max: 34, t: 0.4, color: '#facc15' });
  if (L.stairs) G.effects.push({ type: 'ring', x: L.stairs.x, y: L.stairs.y, r: 4, max: 30, t: 0.5, color: '#38bdf8' });
  UI.toast('Você pegou a Chave do Andar! A escada foi destrancada.', '#facc15');
  Sfx.rare();
}

// ---------- Bônus de andar limpo ----------
function checkCleared() {
  const L = G.level;
  if (!L || L.cleared || L.isBoss) return;
  if (G.enemies.some(e => !e.dead && !e.isProp)) return;
  L.cleared = true;
  const f = L.floor, p = G.p;
  const near = L.stairs ? { x: L.stairs.x + 18, y: L.stairs.y + 6 } : { x: p.x + 14, y: p.y };
  G.chests.push({ x: near.x, y: near.y, open: false, secret: true });
  spawnGold(near.x - 10, near.y + 8, 25 * (1 + 0.3 * (f - 1)));
  gainXp(Math.round(xpNext(p.level) * 0.08));
  UI.toast('Andar limpo! Um baú de recompensa apareceu perto da escada.', '#4ade80');
  Sfx.level();
}

// ---------- Efeitos especiais dos itens ----------
const SPECIALS = {
  weapon: {
    veneno:    { name: 'Veneno',    desc: 'Golpes envenenam: 25% do dano por segundo durante 3 s.' },
    gelo:      { name: 'Gelo',      desc: 'Golpes congelam: o inimigo fica 45% mais lento por 2 s.' },
    relampago: { name: 'Relâmpago', desc: '25% de chance de um raio saltar para 2 inimigos próximos.' },
    explosao:  { name: 'Explosão',  desc: 'Inimigos derrotados pelos seus golpes explodem e ferem quem está perto.' },
  },
  armor: {
    regeneracao: { name: 'Regeneração', desc: 'Recupera 1,2% da vida por segundo na masmorra.' },
    agil:        { name: 'Ágil',        desc: 'A esquiva recarrega 35% mais rápido.' },
  },
  ring: {
    ganancia:  { name: 'Ganância',  desc: '+35% de ouro encontrado.' },
    sabedoria: { name: 'Sabedoria', desc: '+20% de XP.' },
    foco:      { name: 'Foco',      desc: 'Habilidades recarregam 20% mais rápido.' },
  },
};
function rollSpecial(item) {
  const pool = SPECIALS[item.kind];
  if (!pool || item.effect) return;
  const chance = [0, 0, 0.35, 0.7, 1][item.rarity] || 0;
  if (Math.random() < chance) item.special = pick(Object.keys(pool));
}
function hasSpecial(id) {
  const eq = G.p && G.p.eq;
  return !!eq && ['weapon', 'armor', 'ring'].some(s => eq[s] && eq[s].special === id);
}
function specialLine(item) {
  const s = item.special && SPECIALS[item.kind] && SPECIALS[item.kind][item.special];
  return s ? `✦ ${s.name}: ${s.desc}` : null;
}
const goldMult = () => (hasSpecial('ganancia') ? 1.35 : 1) * modReward();
const xpMult = () => hasSpecial('sabedoria') ? 1.2 : 1;
const cdMult = () => hasSpecial('foco') ? 0.8 : 1;

// Chamado a cada golpe corpo a corpo que acerta
function onWeaponHit(e, dmg) {
  e.lastHitByPlayer = G.time;
  if (hasSpecial('veneno')) { e.poisonT = 3; e.poisonDps = dmg * 0.25; }
  if (hasSpecial('gelo')) e.chillT = 2;
  if (hasSpecial('relampago') && Math.random() < 0.25) {
    let from = { x: e.x, y: e.y - 5 };
    const hit = [e];
    for (let k = 0; k < 2; k++) {
      let best = null, bd = 70;
      for (const o of G.enemies) { if (o.dead || o.isProp || hit.includes(o)) continue; const d = dist(from.x, from.y, o.x, o.y - 5); if (d < bd) { bd = d; best = o; } }
      if (!best) break;
      hit.push(best);
      G.effects.push({ type: 'bolt', x: from.x, y: from.y, x2: best.x, y2: best.y - 5, t: 0.2, r: 0, max: 0, color: '#fde047' });
      best.hurt(dmg * 0.5, best.x, best.y + 2, false);
      from = { x: best.x, y: best.y - 5 };
    }
  }
}

// Efeitos contínuos (veneno, gelo, regeneração)
function updateDepth(dt) {
  const p = G.p;
  for (const e of G.enemies) {
    if (e.dead || e.isProp) continue;
    if (e.baseSpd === undefined) e.baseSpd = e.spd;
    if (e.chillT > 0) { e.chillT -= dt; e.spd = e.baseSpd * 0.55; } else e.spd = e.baseSpd;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      e.poisonTick = (e.poisonTick || 0) - dt;
      if (e.poisonTick <= 0) {
        e.poisonTick = 0.5;
        const d = e.poisonDps * 0.5;
        e.hp -= d; e.flash = 0.05;
        addText(e.x, e.y - 12, Math.round(d), '#86efac', 0.7);
        if (e.hp <= 0 && !e.dead) { e.hp = 1; e.hurt(5, e.x, e.y + 1, false); }
      }
    }
  }
  // segurança: se o guardião sumiu de algum jeito, a escada abre
  const L = G.level;
  if (L.locked && !G.enemies.some(e => e.key && !e.dead)) { L.locked = false; UI.toast('A escada foi destrancada.', '#facc15'); }
  if (hasSpecial('regeneracao')) { const st = playerStats(p); p.hp = Math.min(st.maxHp, p.hp + st.maxHp * 0.012 * dt); }
}

// Mortes: explosão especial, modificador explosivo, chave e andar limpo
function onDepthDeath(e) {
  if (e.isProp) return;
  if (e.key) onKeyHolderDeath(e);
  if (hasSpecial('explosao') && G.time - (e.lastHitByPlayer || -9) < 0.1) {
    const st = playerStats(G.p);
    G.time += 0; // marca
    const x = e.x, y = e.y - 5;
    setTimeout(() => { if (G.state === 'dungeon') areaDamage(x, y, 30, st.weaponDmg * st.dmgMul * 0.6, '#fb923c'); }, 60);
  }
  if (G.mods && G.mods.explosivos && !e.isBoss) {
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + Math.random();
      G.projectiles.push(new Projectile(e.x, e.y - 6, Math.cos(a) * 65, Math.sin(a) * 65, e.dmg * 0.5, false, '#fb923c', 3));
    }
  }
  setTimeout(checkCleared, 50);
}

// ---------- Desenho: chave, cadeado da escada, inimigos afetados ----------
function drawDepth(ctx) {
  const L = G.level, t = G.time;
  if (L.locked && L.stairs) {
    const x = Math.round(L.stairs.x), y = Math.round(L.stairs.y);
    ctx.fillStyle = '#78716c';
    for (let i = -8; i <= 8; i += 3) { ctx.fillRect(x + i, y - 8 + Math.abs(i) / 2, 2, 2); ctx.fillRect(x + i, y + 6 - Math.abs(i) / 2, 2, 2); }
    ctx.fillStyle = '#a16207'; ctx.fillRect(x - 4, y - 2, 8, 7);
    ctx.fillStyle = '#facc15'; ctx.fillRect(x - 3, y - 5, 6, 1); ctx.fillRect(x - 3, y - 5, 1, 3); ctx.fillRect(x + 2, y - 5, 1, 3);
    ctx.fillStyle = '#1c1917'; ctx.fillRect(x - 1, y, 2, 3);
  }
  for (const e of G.enemies) {
    if (e.dead || e.isProp) continue;
    if (Math.abs(e.x - G.p.x) > G.viewW || Math.abs(e.y - G.p.y) > G.viewH) continue;
    const top = Math.round(e.y - 12 * e.scale - 10 + Math.sin(t * 4) * 1.5);
    if (e.key) { // chave sobre a cabeça
      const x = Math.round(e.x);
      ctx.fillStyle = '#facc15'; ctx.fillRect(x - 3, top - 4, 5, 5); ctx.fillStyle = '#1c1917'; ctx.fillRect(x - 2, top - 3, 3, 3);
      ctx.fillStyle = '#facc15'; ctx.fillRect(x + 2, top - 2, 5, 1); ctx.fillRect(x + 5, top - 1, 1, 2); ctx.fillRect(x + 3, top - 1, 1, 2);
    }
    if (e.poisonT > 0 && Math.random() < 0.3) G.particles.push({ x: e.x + rr(-4, 4), y: e.y - rr(2, 10), vx: 0, vy: -12, t: 0.4, color: '#86efac' });
    if (e.chillT > 0 && Math.random() < 0.3) G.particles.push({ x: e.x + rr(-4, 4), y: e.y - rr(2, 10), vx: 0, vy: 8, t: 0.4, color: '#bae6fd' });
  }
}

// ---------- Arma na mão do herói conforme o tipo ----------
function drawWeaponInHand(ctx, w, swinging) {
  const col = RARITIES[w.rarity].color === '#e8e8e8' ? '#cbd5e1' : RARITIES[w.rarity].color;
  const wood = '#8b5a2b';
  const n = w.name || '';
  const type = n.startsWith('Adaga') ? 'adaga' : n.startsWith('Machado') ? 'machado' : n.startsWith('Lança') ? 'lanca' : n.startsWith('Lâmina') ? 'lendaria' : 'espada';
  const R = (c, x, y, ww, hh) => { ctx.fillStyle = c; ctx.fillRect(x, y, ww, hh); };
  if (swinging) { // arma estendida para a frente
    if (type === 'adaga') { R(wood, 5, 4, 2, 1); R(col, 7, 3, 4, 1); }
    else if (type === 'machado') { R(wood, 5, 4, 7, 1); R(col, 10, 1, 3, 6); }
    else if (type === 'lanca') { R(wood, 3, 4, 10, 1); R(col, 13, 3, 3, 3); }
    else { R(wood, 5, 4, 2, 1); R(col, 7, 3, 7, 2); if (type === 'lendaria') { ctx.globalAlpha = 0.5; R('#f97316', 7, 2, 7, 1); ctx.globalAlpha = 1; } }
  } else { // arma em pé ao lado
    if (type === 'adaga') { R(col, 6, 4, 1, 4); R(wood, 5, 8, 3, 1); }
    else if (type === 'machado') { R(wood, 6, 0, 1, 10); R(col, 7, 0, 3, 4); R(shade(col, -30), 9, 1, 1, 2); }
    else if (type === 'lanca') { R(wood, 6, -2, 1, 13); R(col, 5, -5, 3, 3); }
    else { R(col, 6, 0, 1, 8); R(wood, 5, 8, 3, 1); R(wood, 6, 9, 1, 2); if (type === 'lendaria') { R('#f97316', 6, -1 - Math.round(Math.sin(G.time * 12)), 1, 2); } }
  }
}

// ---------- Ajuste para jogos salvos antes da v0.9 ----------
function migrateBalance(p) {
  if (p.balV3) return;
  const fix = it => {
    if (!it || !it.lvl) return;
    if (it.kind === 'weapon' && it.dmg) it.dmg = Math.round(it.dmg * itemDmgMul(it.lvl) / (1 + 0.12 * (it.lvl - 1)) * 10) / 10;
    if (it.kind === 'armor' && it.def) it.def = Math.max(1, Math.round(it.def * itemDefMul(it.lvl) / (1 + 0.1 * (it.lvl - 1))));
    if (it.value !== undefined) it.value = itemValue(it);
  };
  ['weapon', 'armor', 'ring'].forEach(s => fix(p.eq[s]));
  (p.bag || []).forEach(fix); (p.stash || []).forEach(fix);
  p.balV3 = true;
  if ((p.maxFloor || 1) > 5) p.forgeGift = true; // Bruno forja equipamento novo na vila
}

function deliverForgeGift() {
  const p = G.p;
  if (!p.forgeGift) return false;
  p.forgeGift = false;
  const lvl = Math.max(1, Math.min(p.maxFloor, MAX_FLOOR + 30) - 3);
  const w = genItem(lvl, 2, 'weapon', 0), a = genItem(lvl, 2, 'armor', 0);
  Dialog.play([
    { who: 'bruno', text: 'Ei, explorador! Ouvi dizer que você chegou ao andar ' + p.maxFloor + '. Com esse equipamento velho? Assim não dá.' },
    { who: 'bruno', text: 'Aço antigo só aguenta umas poucas melhorias. Forjei uma arma e uma armadura novas com o metal das profundezas. Por minha conta!' },
  ], () => {
    for (const it of [w, a]) if (!bagAdd(p.bag, p.bagSize, it)) p.stash.push(it);
    const eq = equipBest(p);
    UI.toast(`Bruno forjou: ${w.name} e ${a.name} (nível ${lvl}).${eq.length ? ' Equipados!' : ''}`, '#facc15');
    Sfx.rare(); saveGame();
  });
  return true;
}
