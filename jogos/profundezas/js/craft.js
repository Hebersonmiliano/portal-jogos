// =============================================================
// Alquimista (Iara) e Joalheiro (Otto): ingredientes, elixires e gemas
// Os dois chegam à vila depois do primeiro chefe.
// =============================================================
'use strict';

// ---------- Ingredientes (um por bioma) ----------
const MATERIALS = {
  cogumelo: { name: 'Cogumelo Brilhante', biome: 0, value: 5,  c1: '#4ade80', c2: '#bbf7d0', desc: 'Cresce nas Cavernas Úmidas. A alquimista usa em poções e chás.' },
  minerio:  { name: 'Minério de Ferro',   biome: 1, value: 7,  c1: '#94a3b8', c2: '#e2e8f0', desc: 'Das Minas Abandonadas. Base do Elixir Pele de Pedra.' },
  escama:   { name: 'Escama de Sereia',   biome: 2, value: 9,  c1: '#2dd4bf', c2: '#ccfbf1', desc: 'Das Ruínas Submersas. Traz sorte, dizem.' },
  osso:     { name: 'Osso Antigo',        biome: 3, value: 11, c1: '#e7e5e4', c2: '#ffffff', desc: 'Da Cripta Esquecida. Clareia a visão no escuro.' },
  brasa:    { name: 'Brasa Viva',         biome: 4, value: 14, c1: '#f97316', c2: '#fde047', desc: 'Do Coração do Abismo. Ainda quente.' },
};
const MAT_BY_BIOME = ['cogumelo', 'minerio', 'escama', 'osso', 'brasa'];

// ---------- Gemas ----------
const GEMS = {
  rubi:      { name: 'Rubi',      fem: false, c1: '#e11d48', c2: '#fecdd3', stat: 'dmg',  vals: [3, 6, 10], label: v => `+${v}% de dano` },
  safira:    { name: 'Safira',    fem: true,  c1: '#2563eb', c2: '#bfdbfe', stat: 'def',  vals: [4, 8, 13], label: v => `+${v}% de defesa` },
  esmeralda: { name: 'Esmeralda', fem: true,  c1: '#16a34a', c2: '#bbf7d0', stat: 'hp',   vals: [4, 8, 13], label: v => `+${v}% de vida` },
  topazio:   { name: 'Topázio',   fem: false, c1: '#f59e0b', c2: '#fef3c7', stat: 'crit', vals: [2, 4, 6],  label: v => `+${v}% de chance de crítico` },
  ametista:  { name: 'Ametista',  fem: true,  c1: '#9333ea', c2: '#e9d5ff', stat: 'cd',   vals: [3, 6, 10], label: v => `habilidades recarregam ${v}% mais rápido` },
};
const GEM_SIZE = { m: ['Pequeno', 'Médio', 'Grande'], f: ['Pequena', 'Média', 'Grande'] };
const GEM_VALUE = [25, 80, 240];
const SOCKET_MAX = { weapon: 2, amulet: 2, ring: 1 };

function gemName(g, sz) { const G0 = GEMS[g]; return `${G0.name} ${GEM_SIZE[G0.fem ? 'f' : 'm'][sz]}`; }
function makeMaterial(id, qty = 1) { const m = MATERIALS[id]; return { id: uid(), kind: 'mat', mat: id, name: m.name, rarity: 0, qty, value: m.value, bonuses: [] }; }
function makeGem(g, sz, qty = 1) { return { id: uid(), kind: 'gem', gem: g, sz, name: gemName(g, sz), rarity: [1, 2, 3][sz], qty, value: GEM_VALUE[sz], bonuses: [] }; }

function isStackable(it) { return !!CONSUMABLES[it.kind] || it.kind === 'mat' || it.kind === 'gem'; }
function stackKey(it) { return it.kind + ':' + (it.mat || '') + (it.gem || '') + (it.sz ?? ''); }
function isCraftItem(it) { return it.kind === 'mat' || it.kind === 'gem'; }

// ---------- Elixires e poções novas ----------
Object.assign(CONSUMABLES, {
  potion2:      { name: 'Poção Forte',            price: 70, desc: 'Recupera 60% da vida.' },
  cha:          { name: 'Chá Revigorante',        price: 35, desc: 'Tira 40 de cansaço e 15 de fome.' },
  elixir_forca: { name: 'Elixir de Força',        price: 90, desc: '+20% de dano por 2 andares.' },
  elixir_pedra: { name: 'Elixir Pele de Pedra',   price: 90, desc: 'Recebe 20% menos dano por 2 andares.' },
  elixir_sorte: { name: 'Elixir da Sorte',        price: 90, desc: '+15 de sorte (mais itens raros) por 2 andares.' },
  elixir_visao: { name: 'Elixir da Visão',        price: 70, desc: 'Enxerga 35% mais longe no escuro por 2 andares.' },
});
const ELIXIR_COLOR = { potion2: '#dc2626', cha: '#a16207', elixir_forca: '#f97316', elixir_pedra: '#a8a29e', elixir_sorte: '#22c55e', elixir_visao: '#38bdf8' };
const ELIXIR_SHORT = { elixir_forca: 'Força', elixir_pedra: 'Pele de Pedra', elixir_sorte: 'Sorte', elixir_visao: 'Visão' };

// Receitas da alquimista: ingredientes + ouro
const RECIPES = [
  { out: 'potion2',      need: { cogumelo: 2 },              gold: 15 },
  { out: 'cha',          need: { cogumelo: 2 },              gold: 0 },
  { out: 'elixir_visao', need: { cogumelo: 2, osso: 1 },     gold: 20 },
  { out: 'elixir_pedra', need: { minerio: 3 },               gold: 30 },
  { out: 'elixir_sorte', need: { escama: 2, cogumelo: 1 },   gold: 35 },
  { out: 'elixir_forca', need: { brasa: 2, osso: 1 },        gold: 45 },
];

function elixirOn(id) { const p = G.p; return G.state === 'dungeon' && !!p && !!p.elixir && p.elixir.id === id && !p.elixir.fresh; }

// Usar poção forte, chá ou elixir (chamado por useConsumable). Retorna undefined se não for daqui.
function useCraftConsumable(it) {
  const p = G.p, st = playerStats(p);
  if (it.kind === 'potion2') {
    if (p.hp >= st.maxHp) { UI.toast('Vida já está cheia.', '#9ca3af'); return false; }
    const h = st.maxHp * 0.6;
    p.hp = Math.min(st.maxHp, p.hp + h);
    if (G.state === 'dungeon') { addText(p.x, p.y - 18, '+' + Math.round(h), '#4ade80'); burst(p.x, p.y - 6, '#f87171', 10); }
    Sfx.heal(); it.qty--; return true;
  }
  if (it.kind === 'cha') {
    if (p.fatigue <= 0 && p.hunger >= 100) { UI.toast('Você está descansado.', '#9ca3af'); return false; }
    p.fatigue = Math.max(0, p.fatigue - 40); p.hunger = Math.min(100, p.hunger + 15);
    Sfx.heal(); it.qty--; return true;
  }
  if (ELIXIR_SHORT[it.kind]) {
    const inDungeon = G.state === 'dungeon';
    p.elixir = { id: it.kind, left: 2, fresh: !inDungeon };
    UI.toast(`${CONSUMABLES[it.kind].name}: ${CONSUMABLES[it.kind].desc}${inDungeon ? '' : ' Começa no próximo andar.'}`, ELIXIR_COLOR[it.kind]);
    if (inDungeon) burst(p.x, p.y - 6, ELIXIR_COLOR[it.kind], 12);
    Sfx.magic(); it.qty--; return true;
  }
  return undefined;
}
// A cada andar novo o elixir perde um andar de duração
function elixirOnFloor(p) {
  if (!p.elixir) return;
  if (p.elixir.fresh) { p.elixir.fresh = false; return; }
  p.elixir.left--;
  if (p.elixir.left <= 0) { UI.toast(`O efeito do ${CONSUMABLES[p.elixir.id].name} acabou.`, '#9ca3af'); p.elixir = null; }
}

// ---------- Gemas encaixadas ----------
function gemTotals(p) {
  const t = { dmg: 0, def: 0, hp: 0, crit: 0, cd: 0 };
  for (const s of EQUIP_SLOTS) {
    const it = p.eq && p.eq[s];
    if (!it || !it.sockets) continue;
    for (const g of it.sockets) if (g) t[GEMS[g.gem].stat] += GEMS[g.gem].vals[g.sz];
  }
  return t;
}
// Gemas e elixires nos atributos (chamado no fim de playerStats)
function applyCraftStats(p, st) {
  const g = gemTotals(p);
  st.dmgMul *= (1 + g.dmg / 100) * (elixirOn('elixir_forca') ? 1.2 : 1);
  st.def *= 1 + g.def / 100;
  st.maxHp = Math.round(st.maxHp * (1 + g.hp / 100));
  st.crit = Math.min(0.85, st.crit + g.crit / 100);
  if (elixirOn('elixir_sorte')) st.luck += 15;
  return st;
}
function gemCdMult(p) { return Math.max(0.6, 1 - gemTotals(p).cd / 100); }
const elixirDamageTaken = () => elixirOn('elixir_pedra') ? 0.8 : 1;
const elixirLight = () => elixirOn('elixir_visao') ? 1.35 : 1;

function socketLines(item) {
  if (!item.sockets || !item.sockets.length) return [];
  return item.sockets.map(g => g ? `<span style="color:${GEMS[g.gem].c1}">◆ ${gemName(g.gem, g.sz)}: ${GEMS[g.gem].label(GEMS[g.gem].vals[g.sz])}</span>` : '<span style="color:#6b6378">◇ Espaço vazio para gema (joalheiro)</span>');
}
function craftItemLines(item) {
  if (item.kind === 'mat') return [MATERIALS[item.mat].desc];
  if (item.kind === 'gem') return [GEMS[item.gem].label(GEMS[item.gem].vals[item.sz]), 'Leve ao joalheiro Otto para encaixar numa arma, anel ou amuleto. Três iguais viram uma maior.'];
  return [];
}

// ---------- Chegada dos dois na vila ----------
function craftArrived(p) { return !!p && (p.beaten || []).length >= 1; }
function npcHere(n) { return (n.id !== 'iara' && n.id !== 'otto') || craftArrived(G.p); }

function craftArrival() {
  const p = G.p;
  if (!craftArrived(p) || p.craftMet || G.state !== 'village') return;
  if (UI.open) { setTimeout(craftArrival, 800); return; }
  p.craftMet = true;
  Dialog.play([
    { who: 'tobias', text: 'Explorador! A notícia da sua vitória correu longe. Chegaram dois viajantes querendo morar em Pedra Funda.' },
    { who: 'iara', text: 'Sou Iara, alquimista. Traga ingredientes da masmorra (cogumelos, minério, escamas...) e eu faço poções fortes e elixires.' },
    { who: 'otto', text: 'Otto, joalheiro, a seu dispor. Gemas caem lá embaixo. Eu abro espaços nas suas armas, anéis e amuletos e encaixo as pedras.' },
    { who: 'otto', text: 'E três gemas iguais eu fundo numa maior. Minha loja fica ao lado da forja do Bruno; a da Iara, perto da praça.' },
  ], () => saveGame());
}

// ---------- Queda de ingredientes e gemas ----------
function craftDrops(e, f) {
  const p = G.p;
  if (!craftArrived(p) || e.isProp) return;
  const bi = Math.min(4, Math.floor(((f - 1) % MAX_FLOOR) / 10));
  const mat = () => MAT_BY_BIOME[Math.random() < 0.75 ? bi : ri(bi + 1)];
  const gem = sz => makeGem(pick(Object.keys(GEMS)), sz);
  const luck = 1 + playerStats(p).luck * 0.01;
  if (e.isBoss) {
    G.drops.push(makeDrop(e.x - 14, e.y + 10, makeMaterial(MAT_BY_BIOME[bi], 3), 0.5));
    G.drops.push(makeDrop(e.x - 14, e.y - 6, gem(1), 0.5));
    return;
  }
  if (Math.random() < (e.elite ? 1 : 0.16 * luck)) G.drops.push(makeDrop(e.x + rr(-5, 5), e.y + rr(-3, 3), makeMaterial(mat(), e.elite ? 2 : 1), 0.35));
  if (Math.random() < (e.elite ? 0.3 : 0.035 * luck)) G.drops.push(makeDrop(e.x + rr(-5, 5), e.y + rr(-3, 3), gem(f > 30 && Math.random() < 0.25 ? 1 : 0), 0.35));
}

// ---------- Tirar e pôr itens do estoque (mochila e baú) ----------
function countStock(p, pred) { return p.bag.concat(p.stash || []).filter(pred).reduce((a, i) => a + (i.qty || 1), 0); }
function takeStock(p, pred, n) {
  for (const list of [p.bag, p.stash || []]) {
    for (let i = list.length - 1; i >= 0 && n > 0; i--) {
      const it = list[i];
      if (!pred(it)) continue;
      const k = Math.min(n, it.qty || 1);
      it.qty = (it.qty || 1) - k; n -= k;
      if (it.qty <= 0) list.splice(i, 1);
    }
  }
}
function giveItem(p, it) {
  if (bagAdd(p.bag, p.bagSize, it)) return 'na mochila';
  if (stashAdd(p, it)) return 'no baú';
  return null;
}

// ---------- Loja da Alquimista ----------
function alchemistMenu() {
  const p = G.p;
  const items = [];
  items.push({ label: '— Comprar —', disabled: true });
  for (const k of ['potion2', 'cha']) {
    const c = CONSUMABLES[k];
    items.push({ label: c.name, sub: c.desc, right: c.price + ' ◆', icon: itemIconURL({ kind: k }), disabled: p.gold < c.price,
      act: () => { if (!bagAdd(p.bag, p.bagSize, makeConsumable(k))) { UI.toast('Mochila cheia!', '#f87171'); return; } p.gold -= c.price; Sfx.gold(); saveGame(); alchemistMenu(); } });
  }
  items.push({ label: '— Preparar com ingredientes (mochila e baú) —', disabled: true });
  for (const r of RECIPES) {
    const c = CONSUMABLES[r.out];
    const parts = Object.entries(r.need).map(([m, n]) => { const have = countStock(p, i => i.kind === 'mat' && i.mat === m); return { m, n, have }; });
    const ok = parts.every(x => x.have >= x.n) && p.gold >= r.gold;
    items.push({ label: c.name, icon: itemIconURL({ kind: r.out }), color: ok ? '#4ade80' : null,
      sub: `${c.desc} · ${parts.map(x => `${x.n}× ${MATERIALS[x.m].name} (${x.have})`).join(' + ')}`,
      right: r.gold ? r.gold + ' ◆' : 'grátis', disabled: !ok,
      act: () => {
        const out = makeConsumable(r.out);
        if (!bagAdd(p.bag, p.bagSize, out)) { UI.toast('Mochila cheia!', '#f87171'); return; }
        for (const x of parts) takeStock(p, i => i.kind === 'mat' && i.mat === x.m, x.n);
        p.gold -= r.gold; Sfx.magic(); questEvent('brew', out); saveGame();
        UI.toast(`Iara preparou: ${c.name}!`, ELIXIR_COLOR[r.out]); alchemistMenu();
      } });
  }
  const mats = Object.keys(MATERIALS).map(m => `${MATERIALS[m].name.split(' ')[0]} ${countStock(p, i => i.kind === 'mat' && i.mat === m)}`).join(' · ');
  const active = p.elixir ? ` · Ativo: ${CONSUMABLES[p.elixir.id].name}${p.elixir.fresh ? ' (começa no próximo andar)' : ` (${p.elixir.left} ${p.elixir.left > 1 ? 'andares' : 'andar'})`}` : '';
  UI.menu({ title: 'Alquimista', text: `"Cada bioma tem seu ingrediente. Elixires duram dois andares." · ◆ ${p.gold}<br><small>${mats}${active}</small>`, items, back: () => villageMenu() });
}

// ---------- Loja do Joalheiro ----------
const socketCost = it => Math.round(120 * (1 + (it.lvl || 1) * 0.08) * ((it.sockets || []).length + 1));
const FUSE_COST = [40, 140];
const UNSOCKET_COST = 50;

function jewelerMenu(tab = 'gems') {
  const p = G.p;
  const items = [];
  items.push({ label: tab === 'gems' ? '» Encaixar gemas' : 'Encaixar gemas', color: tab === 'gems' ? '#fde047' : null, act: () => jewelerMenu('gems') });
  items.push({ label: tab === 'fuse' ? '» Fundir e comprar' : 'Fundir e comprar', color: tab === 'fuse' ? '#fde047' : null, act: () => jewelerMenu('fuse') });
  if (tab === 'gems') {
    for (const slot of ['weapon', 'amulet', 'ring', 'ring2']) {
      const it = p.eq[slot];
      if (!it) { items.push({ label: `${SLOT_LABEL[slot]}: nada equipado`, disabled: true }); continue; }
      const max = SOCKET_MAX[it.kind];
      const socks = it.sockets || [];
      items.push({ label: `${itemDisplayName(it)}`, color: RARITIES[it.rarity].color, icon: itemIconURL(it), sub: `${SLOT_LABEL[slot]} · ${socks.length}/${max} espaços`, disabled: true });
      socks.forEach((g, i) => {
        if (g) items.push({ label: `  ◆ ${gemName(g.gem, g.sz)}`, sub: `${GEMS[g.gem].label(GEMS[g.gem].vals[g.sz])} · retirar sem quebrar`, right: UNSOCKET_COST + ' ◆', icon: itemIconURL(makeGem(g.gem, g.sz)), disabled: p.gold < UNSOCKET_COST,
          act: () => { const where = giveItem(p, makeGem(g.gem, g.sz)); if (!where) { UI.toast('Mochila e baú cheios!', '#f87171'); return; } it.sockets[i] = null; p.gold -= UNSOCKET_COST; Sfx.click(); saveGame(); jewelerMenu('gems'); } });
        else items.push({ label: '  ◇ Espaço vazio: escolher gema', sub: 'Gemas da mochila e do baú', color: '#a5f3fc', act: () => pickGemMenu(it, i) });
      });
      if (socks.length < max) {
        const c = socketCost(it);
        items.push({ label: '  + Abrir espaço para gema', sub: `${it.name} poderá ter ${socks.length + 1} ${socks.length + 1 > 1 ? 'gemas' : 'gema'}`, right: c + ' ◆', disabled: p.gold < c,
          act: () => { it.sockets = socks.concat([null]); p.gold -= c; Sfx.chest(); saveGame(); UI.toast(`Otto abriu um espaço em ${it.name}.`, '#a5f3fc'); jewelerMenu('gems'); } });
      }
    }
  } else {
    let any = false;
    for (const g of Object.keys(GEMS)) for (const sz of [0, 1]) {
      const have = countStock(p, i => i.kind === 'gem' && i.gem === g && i.sz === sz);
      if (!have) continue;
      any = true;
      const c = FUSE_COST[sz];
      items.push({ label: `3× ${gemName(g, sz)} → ${gemName(g, sz + 1)}`, icon: itemIconURL(makeGem(g, sz + 1)), sub: `Você tem ${have} · ${GEMS[g].label(GEMS[g].vals[sz + 1])}`, right: c + ' ◆', disabled: have < 3 || p.gold < c,
        act: () => { takeStock(p, i => i.kind === 'gem' && i.gem === g && i.sz === sz, 3); const where = giveItem(p, makeGem(g, sz + 1)); p.gold -= c; Sfx.rare(); saveGame(); UI.toast(`Otto fundiu: ${gemName(g, sz + 1)} ${where || ''}.`, GEMS[g].c1); jewelerMenu('fuse'); } });
    }
    if (!any) items.push({ label: 'Você ainda não tem gemas pequenas ou médias para fundir.', disabled: true });
    const price = 110;
    items.push({ label: 'Comprar gema pequena (aleatória)', sub: 'Rubi, Safira, Esmeralda, Topázio ou Ametista', right: price + ' ◆', disabled: p.gold < price,
      act: () => { const gm = makeGem(pick(Object.keys(GEMS)), 0); if (!bagAdd(p.bag, p.bagSize, gm)) { UI.toast('Mochila cheia!', '#f87171'); return; } p.gold -= price; Sfx.gold(); saveGame(); UI.toast(`Você comprou: ${gm.name}.`, GEMS[gm.gem].c1); jewelerMenu('fuse'); } });
  }
  UI.menu({ title: 'Joalheiro', text: `"Uma boa gema vale mais que dez espadas enferrujadas." · ◆ ${p.gold}`, items, back: () => villageMenu(), focus: tab === 'gems' ? 0 : 1 });
}

function pickGemMenu(it, idx) {
  const p = G.p;
  const groups = {};
  for (const g of p.bag.concat(p.stash || [])) if (g.kind === 'gem') { const k = g.gem + g.sz; groups[k] = groups[k] || { gem: g.gem, sz: g.sz, n: 0 }; groups[k].n += g.qty || 1; }
  const list = Object.values(groups).sort((a, b) => b.sz - a.sz);
  const items = list.map(x => ({ label: gemName(x.gem, x.sz), icon: itemIconURL(makeGem(x.gem, x.sz)), sub: `${GEMS[x.gem].label(GEMS[x.gem].vals[x.sz])} · você tem ${x.n}`, right: '20 ◆', color: GEMS[x.gem].c1, disabled: p.gold < 20,
    act: () => { takeStock(p, i => i.kind === 'gem' && i.gem === x.gem && i.sz === x.sz, 1); it.sockets[idx] = { gem: x.gem, sz: x.sz }; p.gold -= 20; Sfx.rare(); questEvent('socket', x); saveGame(); UI.toast(`${gemName(x.gem, x.sz)} encaixada em ${it.name}!`, GEMS[x.gem].c1); jewelerMenu('gems'); } }));
  if (!items.length) items.push({ label: 'Você não tem gemas. Elas caem dos inimigos, principalmente dos de elite.', disabled: true });
  UI.menu({ title: `Encaixar em ${it.name}`, text: 'Escolha a gema. Ela pode ser retirada depois sem quebrar.', items, back: () => jewelerMenu('gems') });
}
