// =============================================================
// Baú da vila (mochila e baú lado a lado), filtros, ordenação e favoritos
// =============================================================
'use strict';

const STASH_START = 40, STASH_MAX = 100, STASH_STEP = 10;
function stashCap(p) { return p.stashSize || STASH_START; }
function stashAdd(p, it) { if (!Array.isArray(p.stash)) p.stash = []; return bagAdd(p.stash, stashCap(p), it); }

// ---------- Categorias (abas) ----------
const CATS = [
  { id: 'tudo',   label: 'Tudo' },
  { id: 'equip',  label: 'Equipamentos' },
  { id: 'cons',   label: 'Consumíveis' },
  { id: 'mat',    label: 'Ingredientes' },
  { id: 'gem',    label: 'Gemas' },
  { id: 'tes',    label: 'Tesouros' },
  { id: 'better', label: '▲ Melhores' },
];
function catOf(it) {
  if (isEquip(it)) return 'equip';
  if (isConsumable(it)) return 'cons';
  if (it.kind === 'mat') return 'mat';
  if (it.kind === 'gem') return 'gem';
  return 'tes';
}
function inCat(p, it, cat) {
  if (!it) return false;
  if (cat === 'tudo') return true;
  if (cat === 'better') return isUpgrade(p, it);
  return catOf(it) === cat;
}

// ---------- Ordenação ----------
const SORTS = [
  { id: 'tipo',     label: 'por tipo' },
  { id: 'raridade', label: 'por raridade' },
  { id: 'valor',    label: 'por valor' },
  { id: 'nivel',    label: 'por nível' },
  { id: 'novo',     label: 'mais novos primeiro' },
];
const KIND_ORDER = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'amulet', 'ring', 'wings', 'potion', 'potion2', 'food', 'cha', 'scroll', 'elixir_forca', 'elixir_pedra', 'elixir_sorte', 'elixir_visao', 'mat', 'gem', 'treasure'];
function sortItems(list, mode) {
  const kind = it => { const k = KIND_ORDER.indexOf(it.kind); return k < 0 ? 99 : k; };
  const by = {
    tipo:     (a, b) => kind(a) - kind(b) || b.rarity - a.rarity || (b.lvl || 0) - (a.lvl || 0),
    raridade: (a, b) => b.rarity - a.rarity || kind(a) - kind(b),
    valor:    (a, b) => b.value * (b.qty || 1) - a.value * (a.qty || 1),
    nivel:    (a, b) => (b.lvl || 0) - (a.lvl || 0) || kind(a) - kind(b),
    novo:     (a, b) => (b.id || 0) - (a.id || 0),
  }[mode] || (() => 0);
  list.sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || by(a, b)); // favoritos primeiro
}
function nextSort(p) {
  const i = SORTS.findIndex(s => s.id === p.sortMode);
  p.sortMode = SORTS[(i + 1) % SORTS.length].id;
  return p.sortMode;
}
function sortLabel(p) { return (SORTS.find(s => s.id === p.sortMode) || SORTS[0]).label; }

// Barra de abas + botão Organizar (usada na mochila e no baú)
function filterBarHtml(p, list) {
  const cat = p.invCat || 'tudo';
  const count = c => list.filter(it => inCat(p, it, c)).length;
  return `<div class="fbar">${CATS.map(c => {
    const n = count(c.id);
    if (c.id !== 'tudo' && c.id !== cat && !n) return '';
    return `<button class="ftab ${cat === c.id ? 'on' : ''}" data-act="cat" data-arg="${c.id}" aria-pressed="${cat === c.id}">${c.label}${c.id === 'tudo' ? '' : ` <i>${n}</i>`}</button>`;
  }).join('')}<button class="fsort" data-act="sort" title="Organizar">⇅ Organizar <i>${sortLabel(p)}</i></button></div>`;
}

// Grade de itens (respeita a aba): devolve o HTML das casas
function gridHtml(p, list, cap, area, sel, opts = {}) {
  const cat = p.invCat || 'tudo';
  let out = '';
  const cell = (it, i) => {
    const isSel = sel.area === area && sel.i === i;
    if (!it) return `<button class="slot empty ${isSel ? 'sel' : ''}" data-act="sel" data-arg="${area}:${i}" data-grid></button>`;
    return `<button class="slot ${isSel ? 'sel' : ''}" style="--rc:${RARITIES[it.rarity].color}" data-act="sel" data-arg="${area}:${i}" data-grid title="${it.name}">
      <img src="${itemIconURL(it)}">${it.qty > 1 ? `<b>${it.qty}</b>` : ''}${it.up ? `<b class="up">+${it.up}</b>` : ''}${it.fav ? '<b class="fav">★</b>' : ''}${it.set != null ? `<b class="set${it.fav ? ' low' : ''}" style="color:${SETS[it.set].color}">◆</b>` : ''}${opts.better && isUpgrade(p, it) ? '<b class="better">▲</b>' : ''}</button>`;
  };
  if (cat === 'tudo') { for (let i = 0; i < cap; i++) out += cell(list[i], i); }
  else {
    list.forEach((it, i) => { if (inCat(p, it, cat)) out += cell(it, i); });
    if (!out) out = `<p class="fempty">Nada nesta aba.</p>`;
  }
  return out;
}

// Ações comuns das abas e da ordenação
function filterActions(p, rerender, lists) {
  return {
    cat: c => { p.invCat = c; rerender(); },
    sort: () => { nextSort(p); for (const l of lists()) sortItems(l, p.sortMode); Sfx.click(); saveGame(); UI.toast(`Organizado ${sortLabel(p)}.`, '#c4b5fd'); rerender(); },
  };
}

// ---------- Tela do baú ----------
UI.stashSel = { area: 'bag', i: -1 };
UI.stash = function () {
  const p = G.p;
  if (!Array.isArray(p.stash)) p.stash = [];
  const sel = this.stashSel;
  const list = sel.area === 'bag' ? p.bag : p.stash;
  if (sel.i >= 0 && !list[sel.i]) sel.i = -1; // nada selecionado
  const it = (sel.area === 'bag' ? p.bag : p.stash)[sel.i];
  const cap = stashCap(p);
  let detail = '<p class="mtext">Clique num item para ver. Clique de novo para mudar de lado.</p>', acts = '';
  if (it) {
    detail = `<h3 style="color:${RARITIES[it.rarity].color}">${it.fav ? '★ ' : ''}${itemDisplayName(it)}</h3>
      <p class="rar">${isConsumable(it) ? 'Consumível' : RARITIES[it.rarity].name + (KIND_LABEL[it.kind] ? ' · ' + KIND_LABEL[it.kind] : '')} · vale ${it.value * (it.qty || 1)} ouro</p>
      <ul class="stats">${itemStatLines(it).slice(0, 7).map(l => `<li>${l}</li>`).join('')}</ul>`;
    acts = sel.area === 'bag'
      ? `<button data-act="move" data-focus ${p.stash.length >= cap && !isStackable(it) ? 'disabled' : ''}>Guardar no baú →</button>`
      : `<button data-act="move" data-focus ${p.bag.length >= p.bagSize && !isStackable(it) ? 'disabled' : ''}>← Levar na mochila</button>`;
    acts += `<button data-act="fav">${it.fav ? 'Tirar ★' : '★ Favoritar'}</button>`;
  }
  const html = `
    <div class="invhead"><h2>Baú</h2><span class="gold">◆ ${p.gold} ouro</span><button class="x" data-act="close" aria-label="Fechar">✕</button></div>
    <p class="mtext stashtip">Itens no baú nunca se perdem, nem quando você morre. Favoritos (★) não são vendidos no "Vender tudo".</p>
    ${filterBarHtml(p, p.bag.concat(p.stash))}
    <div class="stashgrid">
      <div class="scol"><p class="bagtitle">Mochila ${p.bag.length}/${p.bagSize}</p><div class="bag">${gridHtml(p, p.bag, p.bagSize, 'bag', sel, { better: true })}</div></div>
      <div class="scol"><p class="bagtitle">Baú ${p.stash.length}/${cap}</p><div class="bag">${gridHtml(p, p.stash, cap, 'stash', sel)}</div></div>
    </div>
    <div class="quick">
      <button data-act="q" data-arg="craft">Guardar ingredientes e gemas</button>
      <button data-act="q" data-arg="tes">Guardar tesouros</button>
      <button data-act="q" data-arg="all">Guardar tudo (menos poções, comida e pergaminhos)</button>
    </div>
    <div class="detail">${detail}<div class="acts">${acts}</div></div>`;
  const rerender = () => this.stash();
  const move = () => {
    const from = sel.area === 'bag' ? p.bag : p.stash, item = from[sel.i];
    if (!item) return;
    const ok = sel.area === 'bag' ? stashAdd(p, item) : bagAdd(p.bag, p.bagSize, item);
    if (!ok) { this.toast(sel.area === 'bag' ? 'O baú está cheio! A Lia aumenta o baú.' : 'Mochila cheia!', '#f87171'); return; }
    from.splice(from.indexOf(item), 1); // foi inteiro para o outro lado (ou juntou numa pilha)
    Sfx.pickup(); saveGame();
    sel.i = -1;
    rerender();
  };
  const quick = kind => {
    const pick = it => kind === 'craft' ? isCraftItem(it) : kind === 'tes' ? it.kind === 'treasure' : !isConsumable(it);
    let n = 0, full = false;
    for (const item of p.bag.slice()) {
      if (!pick(item)) continue;
      if (stashAdd(p, item)) { p.bag.splice(p.bag.indexOf(item), 1); n++; } else full = true;
    }
    if (n) { Sfx.chest(); saveGame(); }
    this.toast(n ? `Guardou ${n} ${n > 1 ? 'itens' : 'item'} no baú.${full ? ' O baú encheu!' : ''}` : full ? 'O baú está cheio!' : 'Nada para guardar.', n ? '#4ade80' : '#9ca3af');
    rerender();
  };
  this.show(html, {
    cls: 'inv stashp',
    onBack: () => { this.keyHook = null; this.close(); },
    actions: Object.assign({
      close: () => { this.keyHook = null; this.close(); },
      sel: arg => { const [area, i] = arg.split(':'); const same = sel.area === area && sel.i === +i; sel.area = area; sel.i = +i; if (same && !Input.isTouch) { move(); return; } rerender(); const b = document.querySelector(`[data-arg="${arg}"]`); if (b) b.focus({ preventScroll: true }); },
      move, fav: () => { if (it) { it.fav = !it.fav; saveGame(); rerender(); } },
      q: quick,
    }, filterActions(p, rerender, () => [p.bag, p.stash])),
  });
  const fb = document.querySelector(`[data-arg="${sel.area}:${sel.i}"]`);
  if (fb && !Input.isTouch) fb.focus({ preventScroll: true });
  if (fb) fb.scrollIntoView({ block: 'nearest' });
  if (!fb && !Input.isTouch) { const f0 = document.querySelector('.stashp [data-grid]'); if (f0) f0.focus({ preventScroll: true }); }
  this.keyHook = e => { const k = e.key.toLowerCase(); if (k === 'u' || k === 'enter') { if (document.activeElement && document.activeElement.dataset.act === 'sel') { move(); return true; } } if (k === 'f') { if (it) { it.fav = !it.fav; saveGame(); rerender(); } return true; } return false; };
  document.querySelectorAll('[data-grid]').forEach(b => b.addEventListener('focusSel', () => { const [area, i] = b.dataset.arg.split(':'); sel.area = area; sel.i = +i; rerender(); }));
};
