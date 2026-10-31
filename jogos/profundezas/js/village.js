// =============================================================
// Vila de Pedra Funda explorável: casas, praça, moradores e torre
// =============================================================
'use strict';

const VW = 40, VH = 24; // tamanho da vila em quadrados de 16 px

const VILLAGE = {
  built: false, canvas: null, solids: [], npcs: [], objs: [], lamps: [], windows: [],
  bubble: null, bubbleT: 3, smoke: [],
};

// Casas: x, y, largura e altura em quadrados (a porta fica embaixo, no meio)
const HOUSES = [
  { id: 'inn',    x: 4,  y: 3,  w: 8, h: 5, roof: '#9f1239', wall: '#a16207', sign: 'bed',    npc: 'marta' },
  { id: 'market', x: 24, y: 2,  w: 7, h: 4, roof: '#1d4ed8', wall: '#a8a29e', sign: 'coin',   npc: 'joana' },
  { id: 'smith',  x: 4,  y: 14, w: 7, h: 5, roof: '#44403c', wall: '#78716c', sign: 'anvil',  npc: 'bruno' },
  { id: 'tailor', x: 22, y: 16, w: 6, h: 4, roof: '#7e22ce', wall: '#d6d3d1', sign: 'needle', npc: 'lia' },
  { id: 'elder',  x: 31, y: 14, w: 6, h: 5, roof: '#166534', wall: '#a8a29e', sign: 'book',   npc: 'tobias' },
];
const TOWER = { x: 32, y: 2, w: 5, h: 7 };
const FOUNTAIN = { x: 20, y: 9, w: 3, h: 3 };

const NPC_LINES = {
  marta:   ['Sopa de cogumelo quentinha!', 'Descanse antes de descer.', 'A cama está arrumada.'],
  joana:   ['Poções fresquinhas!', 'Compro qualquer tesouro.', 'Pergaminhos salvam vidas.'],
  bruno:   ['*clang* *clang*', 'Traga ouro e eu afio essa lâmina.', 'Aço bom não quebra.'],
  lia:     ['Mochila maior, mais tesouro!', 'Costuro qualquer coisa.', 'Cuidado com as teias lá embaixo.'],
  tobias:  ['A Chama ainda pulsa...', 'Venha conversar, explorador.', 'A história não acabou.'],
  pedrinho:['Um dia eu vou descer também!', 'Você viu um dragão?', 'Me conta da masmorra!'],
};

function buildVillage() {
  const V = VILLAGE;
  V.solids = []; V.objs = []; V.lamps = []; V.windows = [];
  const c = document.createElement('canvas'); c.width = VW * TILE; c.height = VH * TILE;
  const x = c.getContext('2d');
  const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const solid = (tx, ty, tw, th) => V.solids.push({ x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE });

  // grama
  for (let ty = 0; ty < VH; ty++) for (let tx = 0; tx < VW; tx++) {
    R((tx + ty) % 2 ? '#2f4a2a' : '#334f2d', tx * TILE, ty * TILE, TILE, TILE);
    for (let k = 0; k < 4; k++) R('#3d5e36', tx * TILE + ri(15), ty * TILE + ri(15), 1, 2);
    if (Math.random() < 0.06) { R(pick(['#fde047', '#f472b6', '#e5e7eb', '#60a5fa']), tx * TILE + 4 + ri(8), ty * TILE + 4 + ri(8), 2, 2); }
  }
  // estradas e praça
  const road = (tx, ty, tw, th) => { for (let yy = ty; yy < ty + th; yy++) for (let xx = tx; xx < tx + tw; xx++) { R('#6b4f35', xx * TILE, yy * TILE, TILE, TILE); for (let k = 0; k < 3; k++) R('#7c5c3e', xx * TILE + ri(14), yy * TILE + ri(14), 2, 1); } };
  road(1, 10, 38, 2); road(19, 1, 2, 22); road(8, 8, 2, 2); road(26, 6, 2, 4); road(7, 12, 2, 2); road(25, 12, 2, 4); road(34, 9, 2, 1); road(33, 12, 2, 2);
  for (let ty = 7; ty <= 14; ty++) for (let tx = 15; tx <= 27; tx++) {
    R('#57534e', tx * TILE, ty * TILE, TILE, TILE);
    R('#78716c', tx * TILE + 1, ty * TILE + 1, 6, 6); R('#6b6560', tx * TILE + 9, ty * TILE + 1, 6, 6);
    R('#6b6560', tx * TILE + 1, ty * TILE + 9, 6, 6); R('#78716c', tx * TILE + 9, ty * TILE + 9, 6, 6);
  }

  // casas
  for (const h of HOUSES) {
    const px = h.x * TILE, py = h.y * TILE, w = h.w * TILE, hh = h.h * TILE;
    R('rgba(0,0,0,0.3)', px + 4, py + hh, w, 4);
    R(h.wall, px, py + 10, w, hh - 10);
    for (let k = 0; k < h.w * 2; k++) R(shade(h.wall, -18), px + k * 8, py + 10, 1, hh - 10);
    // telhado em degraus
    for (let s = 0; s < 4; s++) R(shade(h.roof, -s * 8), px - 4 + s * 6, py - 10 + s * 5, w + 8 - s * 12, 7);
    R(h.roof, px - 4, py + 4, w + 8, 8); R(shade(h.roof, 25), px - 4, py + 4, w + 8, 1);
    // porta
    const dx = px + w / 2 - 6, dy = py + hh - 18;
    R('#3f2a14', dx, dy, 12, 18); R('#57391b', dx + 1, dy + 1, 10, 17); R('#facc15', dx + 9, dy + 9, 1, 2);
    // janelas acesas
    for (const wx of [px + 8, px + w - 18]) { R('#1c1917', wx - 1, py + 17, 12, 10); R('#fbbf24', wx, py + 18, 10, 8); R('#92400e', wx + 4, py + 18, 1, 8); R('#92400e', wx, py + 21, 10, 1); V.windows.push({ x: wx + 5, y: py + 24 }); }
    // placa sobre a porta
    const sx = px + w / 2 - 6, sy = py + hh - 30;
    R('#7c4a1e', sx, sy, 12, 9); R('#a16207', sx + 1, sy + 1, 10, 7);
    x.fillStyle = '#1c1917';
    if (h.sign === 'bed') { R('#1c1917', sx + 2, sy + 4, 8, 2); R('#1c1917', sx + 2, sy + 3, 2, 1); }
    if (h.sign === 'coin') { R('#facc15', sx + 4, sy + 2, 4, 5); R('#ca8a04', sx + 5, sy + 3, 2, 3); }
    if (h.sign === 'anvil') { R('#1c1917', sx + 2, sy + 3, 8, 2); R('#1c1917', sx + 4, sy + 5, 4, 2); }
    if (h.sign === 'needle') { R('#e5e7eb', sx + 3, sy + 6, 6, 1); R('#e5e7eb', sx + 8, sy + 2, 1, 5); }
    if (h.sign === 'book') { R('#7f1d1d', sx + 3, sy + 2, 6, 5); R('#f5f5f4', sx + 4, sy + 3, 4, 3); }
    solid(h.x, h.y, h.w, h.h);
    if (h.id === 'smith') { V.smokeAt = { x: px + 10, y: py - 12 }; R('#57534e', px + 6, py - 14, 8, 10); }
  }
  // bigorna do ferreiro e banca da mercadora
  R('#44403c', 12 * TILE + 2, 17 * TILE + 6, 12, 5); R('#57534e', 12 * TILE, 17 * TILE + 3, 16, 4); R('#292524', 12 * TILE + 5, 17 * TILE + 11, 6, 5);
  solid(12, 17, 1, 1);
  R('#7c4a1e', 22 * TILE, 6 * TILE + 4, 3 * TILE, 10); R('#dc2626', 22 * TILE - 2, 6 * TILE - 2, 3 * TILE + 4, 6); for (let k = 0; k < 6; k++) R('#f5f5f4', 22 * TILE - 2 + k * 9, 6 * TILE - 2, 4, 6);
  R('#ef4444', 22 * TILE + 4, 6 * TILE + 5, 4, 4); R('#22c55e', 22 * TILE + 14, 6 * TILE + 5, 4, 4); R('#facc15', 22 * TILE + 28, 6 * TILE + 5, 5, 4);
  solid(22, 6, 3, 1);

  // torre da masmorra
  { const px = TOWER.x * TILE, py = TOWER.y * TILE, w = TOWER.w * TILE, hh = TOWER.h * TILE;
    R('rgba(0,0,0,0.35)', px + 5, py + hh, w, 5);
    R('#57534e', px, py, w, hh);
    for (let ry = 0; ry < TOWER.h * 2; ry++) for (let rx = 0; rx < TOWER.w * 2; rx++) R(((rx + ry) % 2) ? '#4a4540' : '#5f5a54', px + rx * 8 + (ry % 2) * 4, py + ry * 8, 7, 7);
    for (let k = 0; k < 5; k++) R('#57534e', px + k * 17, py - 8, 10, 8);
    R('#0a0a0a', px + w / 2 - 9, py + hh - 28, 18, 28); R('#1c1917', px + w / 2 - 9, py + hh - 30, 18, 3);
    R('#7f1d1d', px + w / 2 - 5, py + hh - 10, 10, 2);
    R('#1c1917', px + 16, py + 20, 6, 10); R('#1c1917', px + w - 22, py + 20, 6, 10);
    solid(TOWER.x, TOWER.y, TOWER.w, TOWER.h);
    V.objs.push({ id: 'tower', x: px + w / 2, y: py + hh + 6, label: 'Entrada da masmorra' }); }

  // fonte
  { const px = FOUNTAIN.x * TILE, py = FOUNTAIN.y * TILE;
    R('#78716c', px, py + 4, 48, 40); R('#a8a29e', px + 2, py + 6, 44, 36); R('#1e3a8a', px + 6, py + 10, 36, 28);
    R('#a8a29e', px + 20, py + 2, 8, 22); R('#d6d3d1', px + 21, py + 2, 2, 22);
    solid(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.w, FOUNTAIN.h);
    V.objs.push({ id: 'fountain', x: px + 24, y: py + 52, label: 'Fonte' }); }

  // quadro de missões e baú
  R('#5a3412', 16 * TILE + 2, 8 * TILE - 2, 3, 18); R('#5a3412', 17 * TILE + 11, 8 * TILE - 2, 3, 18);
  R('#7c4a1e', 16 * TILE, 8 * TILE - 6, 30, 16); R('#a16207', 16 * TILE + 1, 8 * TILE - 5, 28, 14);
  for (let k = 0; k < 4; k++) R('#f5f5f4', 16 * TILE + 3 + k * 7, 8 * TILE - 3 + (k % 2) * 3, 5, 6);
  solid(16, 8, 2, 1);
  V.objs.push({ id: 'board', x: 17 * TILE, y: 9 * TILE + 6, label: 'Quadro de Missões' });
  R('#4a2e14', 25 * TILE + 2, 12 * TILE + 3, 12, 10); R('#9a6a34', 25 * TILE + 3, 12 * TILE + 4, 10, 8); R('#e0b040', 25 * TILE + 2, 12 * TILE + 7, 12, 2);
  solid(25, 12, 1, 1);
  V.objs.push({ id: 'stash', x: 25 * TILE + 8, y: 13 * TILE + 8, label: 'Baú' });

  // postes de luz
  for (const [lx, ly] of [[15, 9], [28, 9], [15, 14], [28, 14], [18, 3], [18, 19], [11, 11], [31, 11], [3, 11], [37, 11]]) {
    R('#292524', lx * TILE + 7, ly * TILE - 6, 2, 18); R('#44403c', lx * TILE + 5, ly * TILE - 10, 6, 5); R('#fde68a', lx * TILE + 6, ly * TILE - 9, 4, 3);
    V.lamps.push({ x: lx * TILE + 8, y: ly * TILE - 8 });
    V.solids.push({ x: lx * TILE + 6, y: ly * TILE + 8, w: 4, h: 4 });
  }
  // árvores na borda e em grupos
  const tree = (tx, ty) => {
    const px = tx * TILE, py = ty * TILE;
    R('rgba(0,0,0,0.3)', px + 2, py + 13, 14, 3);
    R('#5a3412', px + 6, py + 6, 4, 9);
    R('#14532d', px, py - 6, 16, 14); R('#166534', px + 2, py - 9, 12, 6); R('#15803d', px + 3, py - 5, 5, 4);
    V.solids.push({ x: px + 4, y: py + 8, w: 8, h: 7 });
  };
  const blocked = (tx, ty) => V.solids.some(s => tx * TILE + 8 > s.x - 8 && tx * TILE + 8 < s.x + s.w + 8 && ty * TILE + 8 > s.y - 8 && ty * TILE + 8 < s.y + s.h + 8);
  const keep = [[8, 9], [23.5, 7.3], [13.2, 18.3], [25, 20.6], [33.8, 19.6], [23, 13], [34.5, 9.5], [21.5, 13.5], [6.5, 9.5]];
  for (const h of HOUSES) for (let ty = h.y + h.h; ty <= h.y + h.h + 3; ty++) keep.push([h.x + h.w / 2, ty]);
  const isRoad = (tx, ty) => (ty >= 10 && ty <= 11) || (tx >= 19 && tx <= 20) || (tx >= 15 && tx <= 27 && ty >= 7 && ty <= 14) || keep.some(([kx, ky]) => Math.abs(kx - tx - 0.5) < 2.5 && Math.abs(ky - ty - 0.5) < 2.5);
  for (let tx = 0; tx < VW; tx++) { tree(tx, 0); tree(tx, VH - 1); }
  for (let ty = 1; ty < VH - 1; ty++) { tree(0, ty); tree(VW - 1, ty); }
  for (let k = 0; k < 40; k++) { const tx = 1 + ri(VW - 2), ty = 1 + ri(VH - 2); if (!isRoad(tx, ty) && !blocked(tx, ty)) tree(tx, ty); }
  // as estradas nas bordas atravessam as árvores visualmente: limpa as pontas
  V.canvas = c;

  // moradores
  const at = (tx, ty) => ({ x: tx * TILE + 8, y: ty * TILE + 8 });
  const npc = (id, tx, ty, wander) => { const p = at(tx, ty); V.npcs.push({ id, x: p.x, y: p.y, hx: p.x, hy: p.y, wander, t: Math.random() * 9, face: 1, mv: 0, tx: p.x, ty: p.y, wt: 0 }); };
  npc('marta', 8, 9, false);
  npc('joana', 23.5, 7.3, false);
  npc('bruno', 13.2, 18.3, false);
  npc('lia', 25, 20.6, false);
  npc('tobias', 33.8, 19.6, false);
  npc('pedrinho', 23, 13, true);
  V.built = true;
}

// Posições de chegada
function villageSpawn(where) {
  if (where === 'tower') return { x: (TOWER.x + TOWER.w / 2) * TILE, y: (TOWER.y + TOWER.h) * TILE + 20 };
  if (where === 'inn') return { x: 6.5 * TILE, y: 9.5 * TILE };
  return { x: 21.5 * TILE, y: 13.5 * TILE };
}

function villageSolid(x, y, hw = 4, hh = 3) {
  if (x - hw < TILE || y - hh < TILE || x + hw > (VW - 1) * TILE || y + hh > (VH - 1) * TILE) return true;
  for (const s of VILLAGE.solids) if (x + hw > s.x && x - hw < s.x + s.w && y + hh > s.y && y - hh < s.y + s.h) return true;
  return false;
}

// ---------- Atualização ----------
function updateVillage(dt) {
  const p = G.p, V = VILLAGE;
  const mv = Input.move();
  const spd = 82;
  if (mv.x || mv.y) { p.walkT += dt; if (mv.x) p.face = mv.x < 0 ? -1 : 1; }
  const nx = p.x + mv.x * spd * dt, ny = p.y + mv.y * spd * dt;
  if (!villageSolid(nx, p.y)) p.x = nx;
  if (!villageSolid(p.x, ny)) p.y = ny;

  // moradores
  for (const n of V.npcs) {
    n.t += dt;
    if (n.wander) {
      n.wt -= dt;
      if (n.wt <= 0) { n.wt = 1.5 + Math.random() * 2.5; n.tx = clamp(n.hx + rr(-70, 70), 16 * TILE, 27 * TILE); n.ty = clamp(n.hy + rr(-40, 40), 8 * TILE, 14 * TILE); }
      const d = dist(n.x, n.y, n.tx, n.ty);
      n.mv = d > 3 ? 1 : 0;
      if (d > 3) { const sx = (n.tx - n.x) / d * 34 * dt, sy = (n.ty - n.y) / d * 34 * dt; if (!villageSolid(n.x + sx, n.y)) n.x += sx; if (!villageSolid(n.x, n.y + sy)) n.y += sy; n.face = sx < 0 ? -1 : 1; }
    } else n.face = p.x < n.x ? -1 : 1;
  }
  // fumaça da forja
  if (V.smokeAt && Math.random() < dt * 6) V.smoke.push({ x: V.smokeAt.x + rr(-2, 2), y: V.smokeAt.y, t: 0 });
  for (const s of V.smoke) { s.t += dt; s.y -= 12 * dt; s.x += Math.sin(s.t * 2) * 6 * dt; }
  V.smoke = V.smoke.filter(s => s.t < 2.5);

  // balões de fala
  V.bubbleT -= dt;
  if (V.bubble) { V.bubble.t -= dt; if (V.bubble.t <= 0) V.bubble = null; }
  if (V.bubbleT <= 0) {
    V.bubbleT = 4 + Math.random() * 4;
    const near = V.npcs.filter(n => dist(n.x, n.y, p.x, p.y) < 140);
    if (near.length) { const n = pick(near); V.bubble = { npc: n, text: pick(NPC_LINES[n.id]), t: 3 }; }
  }

  // interação
  const target = villageTarget();
  const pe = document.getElementById('prompt');
  const txt = target ? `[E] ${target.label}` : '';
  if (pe.textContent !== txt) { pe.textContent = txt; pe.classList.toggle('hidden', !txt); }
  if (target && (Input.hit('e') || Input.tb('use') || Input.hit('enter'))) { pe.classList.add('hidden'); villageInteract(target); return; }
  if (Input.hit('i') || Input.hit('tab') || Input.tb('bag')) { UI.invSel = { area: 'bag', i: 0 }; G.resumeFromMenu = () => {}; UI.inventory('village'); return; }
  if (Input.hit('h') || Input.tb('skills')) { UI.skills('village'); return; }
  if (Input.hit('escape') || Input.tb('pause')) { villagePause(); return; }
}

function villageTarget() {
  const p = G.p, V = VILLAGE;
  let best = null, bd = 24;
  for (const n of V.npcs) { const d = dist(n.x, n.y, p.x, p.y); if (d < bd) { bd = d; best = { kind: 'npc', npc: n, label: `Falar com ${PEOPLE[n.id].name}` }; } }
  for (const o of V.objs) { const d = dist(o.x, o.y, p.x, p.y); if (d < bd) { bd = d; best = { kind: 'obj', obj: o, label: o.id === 'tower' ? 'Descer à masmorra' : o.id === 'board' ? 'Ver o Quadro de Missões' : o.id === 'stash' ? 'Abrir o baú' : 'Olhar a fonte' }; } }
  return best;
}

function giverOf(q) { return { Bruno: 'bruno', Marta: 'marta', Joana: 'joana', Pedrinho: 'pedrinho', 'Ancião': 'tobias', Lia: 'lia' }[q.giver.split(/[ ,]/)[0]]; }

function villageInteract(t) {
  const p = G.p;
  if (t.kind === 'obj') {
    if (t.obj.id === 'tower') descendMenu();
    else if (t.obj.id === 'board') questBoard();
    else if (t.obj.id === 'stash') stashMenu();
    else Dialog.play([{ who: 'pedrinho', text: p.beaten.includes(50) ? 'A água da fonte voltou a ficar quentinha! É a Chama, né? Você conseguiu!' : 'Dizem que a água da fonte era morna quando a Chama estava forte. Hoje está gelada...' }]);
    return;
  }
  const id = t.npc.id;
  // entrega de missões direto com o morador
  const done = (p.quests || []).filter(q => q.done && giverOf(q) === id);
  const lines = [];
  for (const q of done) { lines.push({ who: id, text: `Você conseguiu! "${q.text}" Muito obrigado. Aqui está a sua recompensa.` }); }
  const after = () => { for (const q of done) claimQuest(p, q); npcMenu(id); };
  lines.push(...npcTalk(id));
  Dialog.play(lines, after);
}

function npcTalk(id) {
  const p = G.p, st = playerStats(p);
  const b = p.beaten || [];
  if (id === 'marta') return [{ who: id, text: p.fatigue >= 60 ? 'Credo, você está caindo de sono! Uma noite na minha estalagem resolve isso.' : p.hp < st.maxHp * 0.6 ? 'Está todo machucado... Deite um pouco, eu cuido de você.' : 'Bem-vindo à Estalagem da Brasa! Cama quente e sopa de cogumelo.' }];
  if (id === 'joana') return [{ who: id, text: p.bag.some(i => i.kind === 'treasure') ? 'Opa, estou vendo tesouros nessa mochila! Vamos negociar?' : 'Poções, pão, pergaminhos... e compro tudo o que você trouxer lá de baixo.' }];
  if (id === 'bruno') return [{ who: id, text: p.eq.weapon && p.eq.weapon.up >= 5 ? `Essa ${p.eq.weapon.name} já está +${p.eq.weapon.up}. Trabalho bonito, se me permite dizer.` : 'Hmpf. Essa arma precisa de cuidado. Traga ouro que eu deixo ela afiada.' }];
  if (id === 'lia') return [{ who: id, text: p.bag.length >= p.bagSize - 3 ? 'Sua mochila está explodindo! Deixa eu aumentar ela.' : 'Uma mochila maior é mais tesouro voltando para casa.' }];
  if (id === 'pedrinho') return [{ who: id, text: pick([
    'Sabia que dá para quebrar paredes rachadas lá embaixo? Meu avô dizia que tem salas secretas!',
    'Os barris vermelhos explodem! Eu vi uma vez pela janela da torre... ou foi um sonho.',
    'Quando você levar um golpe forte, use uma poção! A Joana vende.',
    b.includes(10) ? 'Você derrotou o Rei Goblin?! Uau! Me ensina a lutar?' : 'Dizem que tem um Rei Goblin no andar 10. Ele usa coroa de verdade?',
    'Se você ficar parado e apertar R, você volta pra cá! O Ancião chama de Runa de Retorno.',
  ]) }];
  if (id === 'tobias') {
    const chs = STORY.chapters.filter(c => b.includes(c.floor));
    const seen = p.chaptersTalked || 0;
    if (chs.length > seen) {
      p.chaptersTalked = chs.length;
      const c = chs[chs.length - 1];
      return ELDER_TALK[c.floor].map(t => ({ who: t[0], text: t[1] }));
    }
    return [{ who: id, text: STORY.elder(p).talk.replace(/^"|"$/g, '') }];
  }
  return [];
}

// Conversa do Ancião depois de cada capítulo
const ELDER_TALK = {
  10: [['tobias', 'Uma brasa da Chama... na coroa de um goblin? Então ela não está só enfraquecendo.'], ['tobias', 'Alguém a está levando embora, pedaço por pedaço. Os mineiros de Aldo desceram até o andar 20. Procure por eles.']],
  20: [['tobias', 'A picareta do Aldo... "Alguém está bebendo dela." Aldo nunca foi homem de exagerar.'], ['tobias', 'Abaixo das minas ficam as ruínas do povo que guardava a Chama. Talvez eles saibam quem fez isso.']],
  30: [['tobias', 'Um rei coroado descendo com o fogo nas mãos... Conheço essa lenda. Achei que fosse só história para crianças.'], ['tobias', 'Se ele existiu, o túmulo dele fica na Cripta, no andar 40. Leve muitas poções.']],
  40: [['tobias', 'Então o rei bebeu da Chama para nunca morrer, e ela caiu no Abismo.'], ['tobias', 'O que vive lá embaixo cresceu com o nosso fogo. Andar 50. Pedra Funda inteira está com você.']],
  50: [['tobias', 'Olhe as janelas... todas acesas! Em trinta anos, nunca vi a vila assim.'], ['tobias', 'Você trouxe a Chama de volta. Mas sinto o chão tremer: as Profundezas não acabam no Abismo. Se quiser continuar, a torre estará sempre aberta.']],
};

// Depois da conversa, o morador abre o que ele oferece
function npcMenu(id) {
  if (id === 'marta') innMenu();
  else if (id === 'joana') marketMenu('buy');
  else if (id === 'bruno') smithMenu();
  else if (id === 'lia') tailorMenu();
  else if (id === 'tobias') elderMenu();
}

// ---------- Desenho ----------
let _villageLight = null;
function renderVillage() {
  const ctx = G.ctx, p = G.p, V = VILLAGE, s = G.scale;
  const vw = G.viewW, vh = G.viewH;
  G.cam.x = Math.round(clamp(p.x - vw / 2, 0, Math.max(0, VW * TILE - vw)));
  G.cam.y = Math.round(clamp(p.y - 8 - vh / 2, 0, Math.max(0, VH * TILE - vh)));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0a0f'; ctx.fillRect(0, 0, G.canvas.width, G.canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(s, 0, 0, s, -G.cam.x * s, -G.cam.y * s);
  ctx.drawImage(V.canvas, 0, 0);
  const t = G.time;
  // água da fonte
  { const px = FOUNTAIN.x * TILE, py = FOUNTAIN.y * TILE;
    for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#3b82f6' : '#60a5fa'; ctx.fillRect(px + 8 + ((k * 7 + Math.floor(t * 8)) % 30), py + 14 + (k * 5) % 20, 3, 1); }
    for (let k = 0; k < 5; k++) { const a = (t * 2 + k) % 1; ctx.fillStyle = '#bfdbfe'; ctx.fillRect(px + 23 + (k - 2) * 2, py + 2 - a * 6 + a * a * 14, 1, 2); } }
  // fumaça
  for (const sm of V.smoke) { ctx.globalAlpha = 0.35 * (1 - sm.t / 2.5); ctx.fillStyle = '#a8a29e'; ctx.fillRect(Math.round(sm.x), Math.round(sm.y), 3, 3); }
  ctx.globalAlpha = 1;
  // moradores e herói ordenados por altura
  const list = V.npcs.map(n => ({ y: n.y, n })).concat([{ y: p.y, me: true }]);
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.me) { drawPlayer(ctx); continue; }
    const n = it.n, info = PEOPLE[n.id];
    const sc = n.id === 'pedrinho' ? 0.85 : n.id === 'bruno' ? 1.12 : 1;
    const frame = n.mv ? ['hero_walk1', 'hero', 'hero_walk2', 'hero'][Math.floor(n.t * 8) % 4] : 'hero';
    const spr = getSprite(frame, info.body);
    const bob = n.mv ? 0 : Math.round(Math.sin(n.t * 2) * 0.5);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(n.x, n.y, 4 * sc, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(Math.round(n.x), Math.round(n.y - 12 * sc + bob)); if (n.face === -1) ctx.scale(-1, 1);
    ctx.drawImage(spr, -6 * sc, 0, 12 * sc, 12 * sc);
    if (n.id === 'tobias') { ctx.fillStyle = '#7c4a1e'; ctx.fillRect(6, -2, 1, 14); ctx.fillStyle = '#a78bfa'; ctx.fillRect(5, -4, 3, 3); }
    if (n.id === 'bruno') { ctx.fillStyle = '#9ca3af'; ctx.fillRect(6, 2, 3, 2); ctx.fillStyle = '#5a3412'; ctx.fillRect(7, 4, 1, 6); }
    ctx.restore();
    // marcador de missão pronta (!) ou de conversa nova
    const hasDone = (p.quests || []).some(q => q.done && giverOf(q) === n.id);
    const newChapter = n.id === 'tobias' && STORY.chapters.filter(c => (p.beaten || []).includes(c.floor)).length > (p.chaptersTalked || 0);
    if (hasDone || newChapter) {
      const yy = Math.round(n.y - 22 * sc + Math.sin(t * 5) * 1.5);
      ctx.fillStyle = hasDone ? '#4ade80' : '#fde047'; ctx.fillRect(Math.round(n.x) - 1, yy, 2, 5); ctx.fillRect(Math.round(n.x) - 1, yy + 6, 2, 2);
    }
  }
  // iluminação da noite
  const W = G.canvas.width, H = G.canvas.height;
  if (!_villageLight || _villageLight.width !== W || _villageLight.height !== H) { _villageLight = document.createElement('canvas'); _villageLight.width = W; _villageLight.height = H; }
  const lc = _villageLight.getContext('2d');
  const restored = (p.beaten || []).includes(MAX_FLOOR);
  lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, W, H);
  lc.fillStyle = restored ? 'rgba(20,10,30,0.25)' : 'rgba(8,6,20,0.55)'; lc.fillRect(0, 0, W, H);
  lc.globalCompositeOperation = 'destination-out';
  const hole = (wx, wy, r, a) => { const sx = (wx - G.cam.x) * s, sy = (wy - G.cam.y) * s, rr2 = r * s; const g = lc.createRadialGradient(sx, sy, 0, sx, sy, rr2); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lc.fillStyle = g; lc.fillRect(sx - rr2, sy - rr2, rr2 * 2, rr2 * 2); };
  hole(p.x, p.y - 6, 70, 0.8);
  for (const l of V.lamps) hole(l.x, l.y + 8, 46 + Math.sin(t * 7 + l.x) * 2, 0.9);
  for (const w of V.windows) hole(w.x, w.y, 26, 0.7);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(_villageLight, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  for (const l of V.lamps) { const sx = (l.x - G.cam.x) * s, sy = (l.y - G.cam.y) * s, r = 34 * s; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, 'rgba(255,200,100,0.18)'); g.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, r * 2, r * 2); }
  { const tx = ((TOWER.x + TOWER.w / 2) * TILE - G.cam.x) * s, ty = ((TOWER.y + TOWER.h) * TILE - 6 - G.cam.y) * s, r = 30 * s; const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, r); g.addColorStop(0, `rgba(220,38,38,${0.15 + Math.sin(t * 2) * 0.05})`); g.addColorStop(1, 'rgba(220,38,38,0)'); ctx.fillStyle = g; ctx.fillRect(tx - r, ty - r, r * 2, r * 2); }
  ctx.globalCompositeOperation = 'source-over';
  // nomes e balões (em resolução de tela)
  const fs = Math.max(8, Math.round(s * 2.3));
  ctx.textAlign = 'center';
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  for (const n of V.npcs) {
    if (dist(n.x, n.y, p.x, p.y) > 60) continue;
    const sx = (n.x - G.cam.x) * s, sy = (n.y - 18 - G.cam.y) * s;
    ctx.fillStyle = '#000'; ctx.fillText(PEOPLE[n.id].name, sx + 2, sy + 2);
    ctx.fillStyle = '#fde68a'; ctx.fillText(PEOPLE[n.id].name, sx, sy);
  }
  if (V.bubble) {
    const n = V.bubble.npc, sx = (n.x - G.cam.x) * s, sy = (n.y - 30 - G.cam.y) * s;
    ctx.font = `${Math.round(fs * 0.9)}px "Press Start 2P", monospace`;
    const w = ctx.measureText(V.bubble.text).width + 16, h = fs * 2;
    ctx.globalAlpha = Math.min(1, V.bubble.t * 2);
    ctx.fillStyle = 'rgba(245,245,244,0.95)'; ctx.fillRect(sx - w / 2, sy - h, w, h);
    ctx.fillRect(sx - 4, sy, 8, 6);
    ctx.fillStyle = '#1c1917'; ctx.fillText(V.bubble.text, sx, sy - h / 2 + fs * 0.35);
    ctx.globalAlpha = 1;
  }
}
