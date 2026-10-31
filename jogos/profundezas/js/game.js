// =============================================================
// PROFUNDEZAS - laço principal, estados, mundo e vila
// =============================================================
'use strict';

const G = {
  state: 'title',      // title | village | dungeon | dead
  p: null,
  level: null,
  floorCanvas: null,
  enemies: [], projectiles: [], drops: [], chests: [], props: [], hazards: [], traps: [], corpses: [],
  spikes: [], barrels: [], blessing: null,
  texts: [], particles: [], effects: [],
  tombEnt: null,
  boss: null,
  cam: { x: 0, y: 0 },
  shake: 0, hurtFlash: 0, hitStop: 0,
  time: 0,
  scale: 3, viewW: 320, viewH: 180,
  canvas: null, ctx: null,
  saveT: 0,

  resumeFromMenu() { /* o laço volta a rodar sozinho quando nenhum painel está aberto */ },
};

// ---------- Novo jogador ----------
function newPlayer() {
  const p = {
    level: 1, xp: 0, points: 0,
    str: 1, vit: 1, agi: 1, luck: 1,
    hp: 1, hunger: 100, fatigue: 0,
    gold: 30,
    bag: [], bagSize: BAG_START, stash: [],
    eq: { weapon: null, armor: null, ring: null },
    maxFloor: 1, floor: 0, tomb: null, kills: 0, beaten: [], bagV2: true,
    autoEquip: true, lootMin: 0, portal: null,
    skills: {}, slots: [null, null, null], skillPts: 0,
    x: 0, y: 0,
  };
  p.eq.weapon = { id: uid(), kind: 'weapon', name: 'Espada Curta', rarity: 0, lvl: 1, up: 0, dmg: 7, cd: 0.36, range: 15, bonuses: [] };
  p.eq.weapon.value = itemValue(p.eq.weapon);
  p.eq.armor = { id: uid(), kind: 'armor', name: 'Roupa de Pano', rarity: 0, lvl: 1, up: 0, def: 1, bonuses: [] };
  p.eq.armor.value = itemValue(p.eq.armor);
  p.bag.push(makeConsumable('potion', 3), makeConsumable('food', 3), makeConsumable('scroll', 1));
  p.hp = playerStats(p).maxHp;
  return p;
}

function resetRuntime(p) {
  Object.assign(p, {
    atkCd: 0, swing: null, dodgeT: 0, dodgeCd: 0, iframes: 0, fx: 1, fy: 0,
    vx: 0, vy: 0, hitCount: 0, hungerTick: 0, starveTick: 0, dead: false, walkT: 0, face: 1,
    skillCd: {}, charge: null, shieldT: 0, shieldRed: 0, spin: 0, dodgeCh: dodgeMax(p), dodgeRecT: 0, hurtT: 0, slowT: 0, slowMul: 1,
  });
}

// ---------- Salvamento ----------
const RUNTIME_KEYS = ['atkCd', 'swing', 'dodgeT', 'dodgeCd', 'iframes', 'fx', 'fy', 'vx', 'vy', 'hitCount', 'hungerTick', 'starveTick', 'dead', 'walkT', 'face', 'x', 'y', 'skillCd', 'charge', 'shieldT', 'shieldRed', 'spin', 'dodgeCh', 'dodgeRecT', 'hurtT', 'slowT', 'slowMul', 'recall'];
function saveGame() {
  try {
    const data = {};
    for (const k in G.p) if (!RUNTIME_KEYS.includes(k)) data[k] = G.p[k];
    data.uid = _uid;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* armazenamento indisponível */ }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    _uid = Math.max(_uid, data.uid || 1);
    delete data.uid;
    const p = newPlayer();
    Object.assign(p, data);
    ensureSkills(p);
    if (!data.bagV2) { // mochila antiga (12 a 40, de 4 em 4) vira a nova (24 a 60, de 6 em 6)
      const ups = Math.max(0, Math.round(((data.bagSize || 12) - 12) / 4));
      p.bagSize = Math.min(BAG_MAX, BAG_START + ups * BAG_STEP);
    }
    p.bagV2 = true;
    resetRuntime(p);
    return p;
  } catch (e) { return null; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

// ---------- Tela e câmera ----------
function resize() {
  const c = G.canvas;
  const dpr = window.devicePixelRatio || 1;
  c.width = Math.floor(innerWidth * dpr);
  c.height = Math.floor(innerHeight * dpr);
  c.style.width = innerWidth + 'px';
  c.style.height = innerHeight + 'px';
  const base = Math.max(2, Math.floor(Math.min(innerWidth / 300, innerHeight / 190)));
  G.scale = base * dpr;
  G.viewW = c.width / G.scale;
  G.viewH = c.height / G.scale;
}

// ---------- Entrar num andar ----------
function enterFloor(floor, viaStairs) {
  const p = G.p;
  G.level = generateFloor(floor);
  G.floorCanvas = renderFloorCanvas(G.level);
  G.enemies = []; G.projectiles = []; G.drops = []; G.chests = []; G.props = []; G.hazards = []; G.traps = [];
  G.corpses = []; G.spikes = []; G.barrels = []; G.blessing = null;
  resetFlow();
  G.texts = []; G.particles = []; G.effects = [];
  G.boss = null; G.tombEnt = null;
  p.floor = floor;
  p.x = G.level.start.x; p.y = G.level.start.y;
  if (viaStairs) p.fatigue = Math.min(100, p.fatigue + 5);
  if (floor > p.maxFloor) p.maxFloor = floor;
  const L = G.level;

  if (L.isBoss) {
    const arena = L.rooms[1];
    const bc = randomPointIn(arena, Math.floor(arena.w / 2) - 1);
    G.enemies.push(new Boss(floor, arena.x * TILE + arena.w * TILE * 0.6, arena.y * TILE + arena.h * TILE / 2));
    for (let i = 0; i < 4; i++) {
      const pt = randomPointIn(arena, 2);
      G.enemies.push(new Enemy(pick(['chaser', 'fast', 'tank', 'shooter']), floor, pt.x, pt.y));
    }
    G.props.push({ type: 'campfire', x: L.start.x, y: L.start.y + 20, used: false });
  } else {
    const count = Math.min(40, 15 + Math.floor(floor * 0.5) + ri(5));
    const others = L.rooms.filter(r => r !== L.startRoom);
    for (let i = 0; i < count; i++) {
      const room = pick(others);
      const pt = randomPointIn(room, 1);
      const n = Math.random();
      const type = n < 0.35 ? 'chaser' : n < 0.6 ? 'fast' : n < 0.8 ? 'tank' : 'shooter';
      G.enemies.push(new Enemy(type, floor, pt.x, pt.y, { elite: Math.random() < 0.05 }));
    }
    const nChests = 2 + ri(3);
    for (let i = 0; i < nChests; i++) {
      const room = pick(others);
      const pt = randomPointIn(room, 1);
      G.chests.push({ x: pt.x, y: pt.y, open: false, mimic: floor > 2 && Math.random() < 0.1 });
    }
    if (Math.random() < 0.35 && others.length > 2) {
      const room = pick(others.filter(r => r !== L.stairsRoom));
      const pt = randomPointIn(room, 2);
      G.props.push({ type: 'campfire', x: pt.x, y: pt.y, used: false });
    }
  }
  if (floor % 5 === 0) {
    G.props.push({ type: 'elevator', x: L.start.x - 22, y: L.start.y });
    UI.toast('Elevador ativado! Agora você pode descer direto para o andar ' + floor + '.', '#38bdf8');
  }
  if (p.tomb && p.tomb.floor === floor) {
    const room = L.isBoss ? L.rooms[0] : pick(L.rooms.filter(r => r !== L.startRoom));
    const pt = randomPointIn(room, 1);
    G.tombEnt = { x: pt.x, y: pt.y };
    UI.toast('Sua lápide está neste andar...', '#e5e7eb');
  }
  // tira inimigos de perto do início
  placeFeatures(L, floor);
  placeMiner(L, floor);
  decorateFloor(L);
  G.ambient = [];
  G.enemies = G.enemies.filter(e => e.isBoss || dist(e.x, e.y, p.x, p.y) > 70);
  G.state = 'dungeon';
  showHud(true);
  Music.play(Music.forFloor(floor));
  questEvent('floor', { floor });
  UI.toast(`Andar ${floor} · ${L.biome.name}${floor > MAX_FLOOR ? ' (Profundezas Infinitas)' : ''}`, '#fde68a');
  Tips.show('start', 'Bem-vindo às Profundezas', () => `Mova com ${K('move')}. Encontre a escada para descer mais fundo e volte vivo à vila com o que juntar.`);
  if (L.isBoss) UI.toast('Um chefe guarda este andar.', '#f87171');
  saveGame();
}

function showHud(on, mode) {
  document.getElementById('hud').classList.toggle('hidden', !on);
  document.body.classList.toggle('in-dungeon', !!on && mode !== 'village');
  document.body.classList.toggle('in-village', !!on && mode === 'village');
}

// ---------- Drops ----------
function makeDrop(x, y, item, delay = 0) {
  return { x, y, item, t: 0, delay, vy: -40, z: 0 };
}
function spawnGold(x, y, amount) {
  G.drops.push({ x: x + rr(-4, 4), y: y + rr(-3, 3), gold: Math.max(1, Math.round(amount)), t: 0, delay: 0.35, vy: -50, z: 0 });
}

function onEnemyDeath(e) {
  const p = G.p;
  addCorpse(e);
  if (!e.isBoss) questEvent('kill', e);
  const f = G.level.floor;
  const st = playerStats(p);
  p.kills++;
  gainXp(e.xp);
  burst(e.x, e.y - 5, '#ffffff', 8);
  Sfx.die();
  if (e.isBoss) {
    G.shake = 10; Sfx.boom();
    spawnGold(e.x, e.y, 60 * (1 + 0.3 * (f - 1)));
    spawnGold(e.x + 10, e.y, 60 * (1 + 0.3 * (f - 1)));
    G.drops.push(makeDrop(e.x, e.y, genItem(f, 3, null, st.luck), 0.5));
    G.drops.push(makeDrop(e.x - 12, e.y, genItem(f, 1, null, st.luck), 0.5));
    G.drops.push(makeDrop(e.x + 12, e.y, genItem(f, 1, null, st.luck), 0.5));
    G.drops.push(makeDrop(e.x, e.y + 10, makeConsumable('potion', 2), 0.5));
    const first = !p.beaten.includes(f);
    if (first) p.beaten.push(f);
    G.level.stairs = { x: e.x, y: e.y + 24 };
    UI.toast(`${e.name} foi derrotado!`, '#facc15');
    Music.play(Music.forFloor(f));
    if (first && f <= MAX_FLOOR) storyOnBoss(f);
    else UI.toast('Uma escada se abriu para as profundezas.', '#38bdf8');
    return;
  }
  if (Math.random() < 0.55) spawnGold(e.x, e.y, rr(2, 5) * (1 + 0.25 * (f - 1)) * (e.elite ? 3 : 1));
  const itemChance = 0.12 + st.luck * 0.005;
  if (e.elite) G.drops.push(makeDrop(e.x, e.y, genItem(f, 2, null, st.luck), 0.35));
  else if (Math.random() < itemChance) G.drops.push(makeDrop(e.x, e.y, genItem(f, 0, null, st.luck), 0.35));
  if (Math.random() < 0.06) G.drops.push(makeDrop(e.x, e.y, makeConsumable(Math.random() < 0.5 ? 'potion' : 'food'), 0.35));
}

function gainXp(n) {
  const p = G.p;
  if (p.level >= 50) return;
  p.xp += n;
  while (p.level < 50 && p.xp >= xpNext(p.level)) {
    p.xp -= xpNext(p.level);
    p.level++;
    p.points += 3;
    if (p.level % 5 === 0) { p.skillPts = (p.skillPts || 0) + 1; setTimeout(() => UI.toast('Novo ponto de habilidade! Aperte H para escolher.', '#a78bfa'), 400); }
    p.hp = playerStats(p).maxHp;
    addText(p.x, p.y - 24, 'NÍVEL ' + p.level + '!', '#fde047', 1.4);
    G.effects.push({ type: 'ring', x: p.x, y: p.y - 6, r: 4, max: 30, t: 0.4, color: '#fde047' });
    Sfx.level();
    UI.toast(`Você subiu para o nível ${p.level}! +3 pontos de atributo (tecla I).`, '#fde047');
  }
}

function useConsumable(it) {
  const p = G.p, st = playerStats(p);
  if (it.kind === 'potion') {
    if (p.hp >= st.maxHp) { UI.toast('Vida já está cheia.', '#9ca3af'); return false; }
    const h = st.maxHp * 0.35 + 20;
    p.hp = Math.min(st.maxHp, p.hp + h);
    if (G.state === 'dungeon') { addText(p.x, p.y - 18, '+' + Math.round(h), '#4ade80'); burst(p.x, p.y - 6, '#4ade80', 8); }
    Sfx.heal();
  } else if (it.kind === 'food') {
    if (p.hunger >= 100) { UI.toast('Você não está com fome.', '#9ca3af'); return false; }
    p.hunger = Math.min(100, p.hunger + 35);
    Sfx.pickup();
  } else if (it.kind === 'scroll') {
    if (G.state !== 'dungeon') return false;
    it.qty--;
    UI.close();
    G.p.portal = G.level.floor;
    returnToVillage(`Você leu o pergaminho e voltou à vila. Um portal ficou aberto no andar ${G.p.portal}.`);
    return true;
  }
  it.qty--;
  return true;
}

function quickUse(kind) {
  const p = G.p;
  const idx = p.bag.findIndex(i => i.kind === kind);
  if (idx < 0) { UI.toast(`Sem ${CONSUMABLES[kind].name.toLowerCase()} na mochila.`, '#9ca3af'); return; }
  const it = p.bag[idx];
  useConsumable(it);
  if (it.qty <= 0) { const j = p.bag.indexOf(it); if (j >= 0) p.bag.splice(j, 1); }
}

// ---------- Morte e retorno ----------
function playerDie() {
  const p = G.p;
  if (p.dead) return;
  p.dead = true;
  Sfx.die(); Sfx.boom();
  Music.stop();
  G.shake = 8;
  const lostGold = Math.floor(p.gold / 2);
  const lostItems = p.bag.slice();
  p.gold -= lostGold;
  p.tomb = lostItems.length ? { floor: G.level.floor, items: lostItems } : null;
  p.portal = null; // morrer fecha o portal
  p.bag = [];
  p.floor = 0;
  p.hp = playerStats(p).maxHp;
  p.hunger = 100; p.fatigue = 0;
  saveGame();
  setTimeout(() => {
    G.state = 'dead';
    showHud(false);
    UI.menu({
      title: 'Você morreu',
      text: `Caiu no andar ${G.level.floor}. Perdeu ${lostGold} de ouro${lostItems.length ? ` e ${lostItems.length} ${lostItems.length > 1 ? 'itens' : 'item'} da mochila, que ficaram na sua lápide nesse andar` : ''}. Seu nível e equipamentos continuam com você.`,
      cls: 'death',
      items: [{ label: 'Acordar na vila', act: () => { UI.close(); enterVillage(null, 'inn'); Dialog.play([{ who: 'marta', text: 'Calma, calma, não se levante ainda! Te acharam desmaiado na porta da torre. Descanse um pouco.' }]); } }],
    });
  }, 900);
}

function returnToVillage(msg) {
  Sfx.stairs();
  G.p.floor = 0;
  saveGame();
  enterVillage(msg);
}

function showVictory() {
  G.state = 'dead';
  Music.play('village');
  showHud(false);
  UI.menu({
    title: 'Vitória!',
    text: `A Chama do Fundo voltou a arder! Inimigos derrotados: ${G.p.kills}. Missões entregues: ${G.p.questsDone || 0}.<br><br>Abaixo do Abismo começam as <b>Profundezas Infinitas</b>: os biomas se repetem cada vez mais perigosos, com um chefe a cada 10 andares. Até onde você vai?`,
    cls: 'death',
    items: [
      { label: 'Continuar descendo', act: () => { UI.close(); G.state = 'dungeon'; showHud(true); } },
      { label: 'Voltar à vila', act: () => { UI.close(); returnToVillage(); } },
    ],
  });
}

// ---------- Atualização do mundo ----------
function updateDungeon(dt) {
  const p = G.p;
  const L = G.level;
  if (p.dead) { updateEffects(dt); return; }
  const st = playerStats(p);

  // sobrevivência
  p.hungerTick += dt;
  const hungerRate = 1 / 20 * Math.max(0.5, 1 - p.vit * 0.01);
  p.hunger = Math.max(0, p.hunger - hungerRate * dt);
  if (p.hunger <= 0) {
    p.starveTick += dt;
    if (p.starveTick >= 3) { p.starveTick = 0; p.hp -= 1; addText(p.x, p.y - 16, '-1 fome', '#fb923c'); if (p.hp <= 0) { p.hp = 0; playerDie(); return; } }
  }
  p.hp = Math.min(p.hp, st.maxHp);

  // movimento
  if (p.atkCd > 0) p.atkCd -= dt;
  if (p.dodgeCd > 0) p.dodgeCd -= dt;
  if (p.dodgeCh < dodgeMax(p)) { p.dodgeRecT -= dt; if (p.dodgeRecT <= 0) { p.dodgeCh++; p.dodgeRecT = dodgeRecharge(p); } }
  if (p.iframes > 0) p.iframes -= dt;
  if (p.hurtT > 0) p.hurtT -= dt;
  // Runa de Retorno: fica parado 4 s para voltar à vila
  if (p.recall) {
    const mvR = Input.move();
    if (mvR.x || mvR.y || Input.mouse.down || Input.keys['j'] || Input.keys['p_atk'] || Input.held('atk')) cancelReturn('Retorno cancelado: você se mexeu.');
    else {
      p.recall.t += dt;
      if (Math.random() < 0.7) G.particles.push({ x: p.x + rr(-7, 7), y: p.y - rr(0, 4), vx: 0, vy: -rr(20, 45), t: 0.6, color: '#7dd3fc' });
      if (p.recall.t >= RECALL_TIME) { p.recall = null; p.portal = G.level.floor; returnToVillage(`Você voltou à vila pela Runa de Retorno. Um portal ficou aberto no andar ${p.portal}.`); return; }
    }
  }
  if (p.slowT > 0) p.slowT -= dt;
  if (p.swing) { p.swing.t -= dt; if (p.swing.t <= 0) p.swing = null; }
  const mv = Input.move();
  if (mv.x || mv.y) { p.fx = mv.x; p.fy = mv.y; p.walkT += dt; if (mv.x) p.face = mv.x < 0 ? -1 : 1; }
  if (p.charge) {
    // a investida controla o movimento (skills.js)
  } else if (p.dodgeT > 0) {
    p.dodgeT -= dt;
    moveBody(p, p.vx * dt, p.vy * dt);
    if (Math.random() < 0.6) G.particles.push({ x: p.x, y: p.y - 4, vx: 0, vy: -5, t: 0.2, color: '#93c5fd' });
  } else {
    moveBody(p, mv.x * st.speed * dt, mv.y * st.speed * dt);
  }

  // ações
  const atkKey = Input.keys['j'] || Input.keys['k'] || Input.held('atk') || Input.keys['p_atk'];
  if (Input.mouse.down) {
    const w = screenToWorld(Input.mouse.x, Input.mouse.y);
    const a = Math.atan2(w.y - (p.y - 5), w.x - p.x);
    p.face = Math.cos(a) < 0 ? -1 : 1;
    playerAttack(a);
  } else if (atkKey) {
    const pa = Input.padAim();
    if (pa !== null) p.face = Math.cos(pa) < 0 ? -1 : 1;
    playerAttack(pa !== null ? pa : Math.atan2(p.fy, p.fx));
  }
  if ((Input.hit(' ') || Input.tb('dodge')) && p.dodgeCd <= 0 && p.dodgeCh > 0) {
    const dx = mv.x || mv.y ? mv.x : p.fx, dy = mv.x || mv.y ? mv.y : p.fy;
    const d = Math.hypot(dx, dy) || 1;
    p.vx = dx / d * 230; p.vy = dy / d * 230;
    p.dodgeT = 0.17; p.dodgeCd = 0.22;
    if (p.dodgeCh >= dodgeMax(p)) p.dodgeRecT = dodgeRecharge(p);
    p.dodgeCh--;
    Sfx.dash();
  }
  if (Input.hit('q') || Input.tb('potion')) quickUse('potion');
  if (Input.hit('f')) quickUse('food');
  if (Input.hit('r')) startReturn();
  if (Input.hit('i') || Input.hit('tab') || Input.tb('bag')) { UI.invSel = { area: 'bag', i: 0 }; UI.inventory('dungeon'); return; }
  if (Input.hit('escape') || Input.tb('pause')) { pauseMenu(); return; }
  if (Input.hit('h') || Input.tb('skills')) { UI.skills('dungeon'); return; }
  if (G.state !== 'dungeon' || !G.level) return; // voltou à vila (pergaminho)
  updateSkills(dt);
  Tips.check(dt);

  // explorar
  const ptx = Math.floor(p.x / TILE), pty = Math.floor(p.y / TILE);
  for (let dy = -6; dy <= 6; dy++) for (let dx = -8; dx <= 8; dx++) {
    const tx = ptx + dx, ty = pty + dy;
    if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) L.explored[ty * MAP_W + tx] = 1;
  }

  // inimigos e projéteis
  updateFlow(dt);
  for (const e of G.enemies) if (!e.dead && (e.isProp || dist(e.x, e.y, p.x, p.y) < 320)) e.update(dt);
  G.enemies = G.enemies.filter(e => !e.dead);
  for (const pr of G.projectiles) pr.update(dt);
  updateHazards(dt);
  updateFeatures(dt);
  updateAmbient(dt);
  if (G.state !== 'dungeon' || p.dead) { updateEffects(dt); return; }
  G.projectiles = G.projectiles.filter(pr => !pr.dead);

  // drops
  for (const d of G.drops) {
    d.t += dt;
    if (d.z < 0 || d.vy < 0) { d.vy += 300 * dt; d.z = Math.min(0, d.z + d.vy * dt); if (d.z >= 0) { d.z = 0; d.vy = 0; } }
    if (d.t < d.delay) continue;
    if (dist(d.x, d.y, p.x, p.y) < 12) {
      if (d.gold) {
        p.gold += d.gold; d.taken = true;
        addText(d.x, d.y - 10, '+' + d.gold, '#facc15', 0.9);
        Sfx.gold();
      } else if (isEquip(d.item) && d.item.rarity < (p.lootMin || 0) && !isUpgrade(p, d.item)) {
        d.filtered = true; // abaixo do filtro de raridade: fica no chão
      } else if (bagAdd(p.bag, p.bagSize, d.item)) {
        d.taken = true;
        const r = d.item.rarity;
        addText(d.x, d.y - 12, d.item.name, RARITIES[r].color, 0.8);
        if (r >= 2) { Sfx.rare(); UI.toast(`${RARITIES[r].name}: ${d.item.name}`, RARITIES[r].color); }
        if (d.item.kind === 'treasure') questEvent('treasure', d.item);
        else Sfx.pickup();
        if (p.autoEquip && isUpgrade(p, d.item)) {
          const eq = equipBest(p);
          if (eq.length) { UI.toast(`Equipado: ${eq.join(', ')} ▲`, '#4ade80'); addText(p.x, p.y - 22, 'equipado ▲', '#4ade80', 0.8); }
        }
      } else if (!d.warned) {
        d.warned = true;
        UI.toast('Mochila cheia! Largue algo (tecla I) ou volte à vila.', '#f87171');
      }
    } else d.warned = false;
  }
  G.drops = G.drops.filter(d => !d.taken);

  // baús
  for (const c of G.chests) {
    if (c.open || dist(c.x, c.y, p.x, p.y) > 13) continue;
    c.open = true;
    if (c.mimic) {
      const m = new Enemy('tank', L.floor, c.x, c.y, { def: { name: 'Mímico', sprite: 'chest', pal: { d: '#4a2e14', w: '#9a6a34', m: '#ef4444' } }, elite: true });
      m.aware = true;
      G.enemies.push(m);
      c.gone = true;
      UI.toast('É um mímico!', '#f87171');
      Sfx.hurt();
      continue;
    }
    Sfx.chest();
    questEvent('chest');
    const f = L.floor, luck = st.luck;
    G.drops.push(makeDrop(c.x, c.y + 4, genItem(f, c.secret ? 2 : 1, null, luck + (c.secret ? 10 : 0)), 0.3));
    if (c.secret) { G.drops.push(makeDrop(c.x - 8, c.y + 6, genItem(f, 1, null, luck), 0.3)); UI.toast('Baú especial!', '#facc15'); }
    if (Math.random() < 0.7) G.drops.push(makeDrop(c.x + 8, c.y + 4, genItem(f, 0, null, luck), 0.3));
    if (Math.random() < 0.5) G.drops.push(makeDrop(c.x - 8, c.y + 4, makeConsumable(pick(['potion', 'food', 'potion', 'scroll'])), 0.3));
    spawnGold(c.x, c.y + 6, rr(8, 16) * (1 + 0.3 * (f - 1)));
  }
  G.chests = G.chests.filter(c => !c.gone);

  // lápide
  if (G.tombEnt && dist(G.tombEnt.x, G.tombEnt.y, p.x, p.y) < 12) {
    const items = p.tomb ? p.tomb.items : [];
    let lost = 0;
    for (const it of items) if (!bagAdd(p.bag, p.bagSize, it)) { G.drops.push(makeDrop(G.tombEnt.x + rr(-8, 8), G.tombEnt.y + 8, it)); lost++; }
    UI.toast(`Você recuperou seus itens da lápide!${lost ? ' (alguns ficaram no chão)' : ''}`, '#4ade80');
    Sfx.rare();
    p.tomb = null; G.tombEnt = null;
    saveGame();
  }

  // interações (E)
  let prompt = '';
  const interact = Input.hit('e') || Input.tb('use');
  if (L.stairs && dist(L.stairs.x, L.stairs.y, p.x, p.y) < 14) {
    prompt = `[E] Descer para o andar ${L.floor + 1}`;
    if (interact) { Sfx.stairs(); enterFloor(L.floor + 1, true); return; }
  }
  for (const pr of G.props) {
    if (dist(pr.x, pr.y, p.x, p.y) > 16) continue;
    if (pr.type === 'campfire' && !pr.used) {
      prompt = '[E] Descansar na fogueira';
      if (interact) {
        pr.used = true;
        p.fatigue = Math.floor(p.fatigue / 2);
        p.hp = Math.min(st.maxHp, p.hp + st.maxHp * 0.3);
        p.hunger = Math.min(100, p.hunger + 15);
        UI.toast('Você descansou: metade do cansaço se foi.', '#fb923c');
        Sfx.heal();
      }
    } else if (pr.type === 'elevator') {
      prompt = '[E] Subir pelo elevador até a vila';
      if (interact) { returnToVillage('Você subiu pelo elevador.'); return; }
    } else {
      const pt = featureInteract(pr, interact);
      if (pt) prompt = pt;
      if (UI.anyOpen()) return;
    }
  }
  const pe = document.getElementById('prompt');
  if (pe.textContent !== prompt) { pe.textContent = prompt; pe.classList.toggle('hidden', !prompt); }

  updateEffects(dt);
  G.saveT += dt;
  if (G.saveT > 15) { G.saveT = 0; saveGame(); }
}

function updateEffects(dt) {
  for (const c of G.corpses) c.t -= dt;
  G.corpses = G.corpses.filter(c => c.t > 0);
  for (const t of G.texts) { t.t -= dt; t.y -= 18 * dt; }
  G.texts = G.texts.filter(t => t.t > 0);
  for (const q of G.particles) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; }
  G.particles = G.particles.filter(q => q.t > 0);
  for (const f of G.effects) { f.t -= dt; f.r += (f.max - f.r) * Math.min(1, dt * 14); }
  G.effects = G.effects.filter(f => f.t > 0);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 25);
  if (G.hurtFlash > 0) G.hurtFlash -= dt;
}

// ---------- Desenho ----------
function screenToWorld(sx, sy) {
  const dpr = window.devicePixelRatio || 1;
  return { x: sx * dpr / G.scale + G.cam.x, y: sy * dpr / G.scale + G.cam.y };
}

function renderDungeon() {
  const ctx = G.ctx, p = G.p, L = G.level;
  const vw = G.viewW, vh = G.viewH;
  let cx = p.x - vw / 2, cy = p.y - 8 - vh / 2;
  cx = clamp(cx, -16, MAP_W * TILE - vw + 16);
  cy = clamp(cy, -16, MAP_H * TILE - vh + 16);
  if (G.shake > 0) { cx += rr(-G.shake, G.shake); cy += rr(-G.shake, G.shake); }
  G.cam.x = Math.round(cx); G.cam.y = Math.round(cy);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, G.canvas.width, G.canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(G.scale, 0, 0, G.scale, -G.cam.x * G.scale, -G.cam.y * G.scale);
  ctx.drawImage(G.floorCanvas, 0, 0);
  drawFeaturesFloor(ctx);
  drawTorches(ctx);

  const t = G.time;
  // escada
  if (L.stairs) {
    const sx = Math.round(L.stairs.x - 8), sy = Math.round(L.stairs.y - 8);
    ctx.fillStyle = '#05080c'; ctx.fillRect(sx, sy, 16, 16);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = shade(L.biome.face, 20 - i * 12); ctx.fillRect(sx + 1, sy + 1 + i * 4, 14 - i * 2, 3); }
    ctx.strokeStyle = `rgba(56,189,248,${0.4 + Math.sin(t * 4) * 0.3})`; ctx.lineWidth = 1;
    ctx.strokeRect(sx - 0.5, sy - 0.5, 17, 17);
  }
  // props
  for (const pr of G.props) {
    if (pr.type === 'campfire') {
      const spr = getSprite('campfire');
      ctx.drawImage(spr, Math.round(pr.x - 6), Math.round(pr.y - 11 + (pr.used ? 0 : Math.sin(t * 12) * 0.5)));
    } else if (pr.type === 'elevator') {
      const ex = Math.round(pr.x - 8), ey = Math.round(pr.y - 8);
      ctx.fillStyle = '#334155'; ctx.fillRect(ex, ey, 16, 16);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(ex + 2, ey + 2, 12, 12);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(ex + 6, ey + 4 + Math.round(Math.sin(t * 3) * 2), 4, 4);
    } else drawFeatureProp(ctx, pr);
  }
  if (G.tombEnt) ctx.drawImage(getSprite('tomb'), Math.round(G.tombEnt.x - 6), Math.round(G.tombEnt.y - 11));
  for (const c of G.chests) ctx.drawImage(getSprite(c.open ? 'chestOpen' : 'chest'), Math.round(c.x - 6), Math.round(c.y - 10));

  // drops
  for (const d of G.drops) {
    const bob = Math.sin(t * 4 + d.x) * 1;
    const dy = Math.round(d.y - 8 + d.z + bob);
    if (d.gold) { ctx.drawImage(getSprite('i_gold'), Math.round(d.x - 4), dy); continue; }
    const col = RARITIES[d.item.rarity].color;
    if (d.item.rarity >= 1) {
      ctx.globalAlpha = 0.25 + Math.sin(t * 5) * 0.1;
      ctx.fillStyle = col; ctx.fillRect(Math.round(d.x - 1), dy - 20, 2, 26);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(Math.round(d.x - 4), Math.round(d.y), 8, 1);
    const icon = getSprite(itemIconName(d.item), itemIconPal(d.item));
    if (d.filtered) ctx.globalAlpha = 0.4; // abaixo do filtro de raridade
    ctx.drawImage(icon, Math.round(d.x - 4), dy);
    ctx.globalAlpha = 1;
  }

  drawHazards(ctx);
  drawCorpses(ctx);

  // entidades ordenadas por y
  const list = G.enemies.filter(e => Math.abs(e.x - p.x) < vw && Math.abs(e.y - p.y) < vh).concat([p]);
  list.sort((a, b) => a.y - b.y);
  for (const e of list) { if (e === p) drawPlayer(ctx); else e.draw(ctx); }
  for (const pr of G.projectiles) pr.draw(ctx);
  drawSkillsWorld(ctx);

  // golpe
  if (p.swing) {
    const s = p.swing, a = s.a, k = 1 - s.t / 0.14;
    ctx.strokeStyle = `rgba(255,255,255,${0.9 - k * 0.6})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y - 5, s.range * (0.7 + k * 0.3), a - 1.0 + k * 0.4, a + 1.0 - k * 0.4); ctx.stroke();
  }
  for (const f of G.effects) {
    ctx.strokeStyle = f.color; ctx.globalAlpha = Math.max(0, f.t / 0.3); ctx.lineWidth = 2;
    ctx.beginPath();
    if (f.type === 'bolt') { // raio em zigue-zague
      ctx.moveTo(f.x, f.y);
      for (let i = 1; i < 6; i++) ctx.lineTo(f.x + (f.x2 - f.x) * i / 6 + rr(-4, 4), f.y + (f.y2 - f.y) * i / 6 + rr(-4, 4));
      ctx.lineTo(f.x2, f.y2);
    } else ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (const q of G.particles) { ctx.fillStyle = q.color; ctx.globalAlpha = Math.min(1, q.t * 4); ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); }
  drawAmbient(ctx);
  ctx.globalAlpha = 1;

  // escuridão com várias fontes de luz (decor.js)
  drawLighting(ctx);
  if (G.hurtFlash > 0) { ctx.fillStyle = `rgba(200,0,0,${G.hurtFlash * 0.6})`; ctx.fillRect(0, 0, G.canvas.width, G.canvas.height); }

  // textos flutuantes (em resolução de tela)
  const fs = Math.max(8, Math.round(G.scale * 2.6));
  ctx.textAlign = 'center';
  for (const tx of G.texts) {
    ctx.font = `${Math.round(fs * tx.scale)}px "Press Start 2P", monospace`;
    const sx = (tx.x - G.cam.x) * G.scale, sy = (tx.y - G.cam.y) * G.scale;
    ctx.globalAlpha = Math.min(1, tx.t * 3);
    ctx.fillStyle = '#000'; ctx.fillText(tx.txt, sx + 2, sy + 2);
    ctx.fillStyle = tx.color; ctx.fillText(tx.txt, sx, sy);
  }
  ctx.globalAlpha = 1;
  // nome de inimigos elite
  ctx.font = `${Math.round(fs * 0.7)}px "Press Start 2P", monospace`;
  for (const e of G.enemies) if (e.elite && !e.isBoss && dist(e.x, e.y, p.x, p.y) < 90) {
    const sx = (e.x - G.cam.x) * G.scale, sy = (e.y - 22 * e.scale - G.cam.y) * G.scale;
    ctx.fillStyle = '#000'; ctx.fillText(e.name, sx + 1, sy + 1);
    ctx.fillStyle = '#facc15'; ctx.fillText(e.name, sx, sy);
  }
}

// ---------- Runa de Retorno ----------
const RECALL_TIME = 4;
function startReturn() {
  const p = G.p;
  if (p.recall) { cancelReturn('Retorno cancelado.'); return; }
  if (p.bag.some(i => i.kind === 'scroll')) { quickUse('scroll'); return; } // pergaminho: na hora
  p.recall = { t: 0 };
  Sfx.heal();
  UI.toast('Runa de Retorno: fique parado por 4 segundos. Levar dano cancela.', '#7dd3fc');
}
function cancelReturn(msg) {
  if (!G.p.recall) return;
  G.p.recall = null;
  UI.toast(msg, '#9ca3af');
}

function drawPlayer(ctx) {
  const p = G.p;
  const hurtNow = p.hurtT > 0;
  if (p.iframes > 0 && !hurtNow && !p.dodgeT && !p.charge && Math.floor(G.time * 20) % 2 === 0) return;
  const moving = Input.move().x || Input.move().y;
  // escolhe o quadro: dano, ataque, caminhada ou parado
  let frame = 'hero';
  if (p.dead) frame = 'hero_hurt';
  else if (hurtNow) frame = 'hero_hurt';
  else if (p.swing || p.spin > 0) frame = 'hero_atk';
  else if (moving) frame = ['hero_walk1', 'hero', 'hero_walk2', 'hero'][Math.floor(p.walkT * 9) % 4];
  const spr = getSprite(frame, null, hurtNow && p.hurtT > 0.2 ? true : false);
  const bob = moving && !p.dead ? Math.round(Math.abs(Math.sin(p.walkT * 12)) * -1) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(Math.round(p.x), Math.round(p.y - 6 + bob));
  ctx.globalAlpha = p.dodgeT > 0 ? 0.6 : 1;
  if (p.dead) { ctx.rotate(p.face * Math.PI / 2); ctx.globalAlpha = 0.8; }
  else if (p.dodgeT > 0) ctx.rotate(p.face * (1 - p.dodgeT / 0.17) * Math.PI * 2); // rolamento
  else if (hurtNow) ctx.translate(-p.face * 1, 0);
  if (p.face === -1) ctx.scale(-1, 1);
  ctx.translate(0, -6);
  if (p.slowT > 0) { ctx.fillStyle = 'rgba(245,245,244,0.5)'; ctx.fillRect(-5, 9, 10, 3); }
  ctx.drawImage(spr, -6, 0);
  if (p.dead) { ctx.restore(); ctx.globalAlpha = 1; return; }
  if (p.recall) { // círculo da runa enchendo
    ctx.restore(); ctx.save();
    const k = p.recall.t / RECALL_TIME;
    ctx.strokeStyle = 'rgba(125,211,252,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 11, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#7dd3fc';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 11, 6, 0, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    ctx.restore(); ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y - 12));
    if (p.face === -1) ctx.scale(-1, 1);
  }
  // arma
  const w = p.eq.weapon;
  if (w) {
    ctx.fillStyle = RARITIES[w.rarity].color === '#e8e8e8' ? '#cbd5e1' : RARITIES[w.rarity].color;
    if (p.swing) ctx.fillRect(5, 3, 6, 1);
    else { ctx.fillRect(6, 1, 1, 7); ctx.fillStyle = '#8b5a2b'; ctx.fillRect(5, 7, 3, 1); }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------- Vila ----------
function enterVillage(msg, spawn = 'tower') {
  const p = G.p;
  G.state = 'village';
  G.level = null; G.boss = null;
  p.floor = 0;
  resetRuntime(p);
  if (!VILLAGE.built) buildVillage();
  const sp = villageSpawn(spawn);
  p.x = sp.x; p.y = sp.y; p.face = 1;
  showHud(true, 'village');
  document.getElementById('floorTxt').innerHTML = `VILA<small>Pedra Funda</small>`;
  document.getElementById('prompt').classList.add('hidden');
  saveGame();
  Music.play('village');
  villageMenu(msg);
  if (p.portal) Tips.show('portal', 'Portal de Retorno', `Você deixou um portal aberto no andar ${p.portal}. Na torre, escolha o portal para voltar direto para lá, sem repetir os andares.`);
  Tips.show('village', 'A vila', () => `Ande com ${K('move')} e fale com os moradores usando ${K('use')}. A torre no canto leva à masmorra. ${K('bag')} abre a mochila e Esc abre o menu da vila.`);
}

function unlockedElevators() {
  const out = [1];
  for (let f = 5; f <= G.p.maxFloor; f += 5) out.push(f);
  return out;
}

// Fecha os menus e volta a andar pela vila
function villageMenu(msg) {
  UI.close();
  if (msg) UI.toast(msg, '#fde68a');
}

// Menu da vila (tecla Esc / botão de pausa): atalhos para tudo
function villagePause(msg) {
  const p = G.p, st = playerStats(p);
  const tombLine = p.tomb ? `<br><span style="color:#e5e7eb">Sua lápide está no andar ${p.tomb.floor}.</span>` : '';
  UI.menu({
    title: 'Vila de Pedra Funda',
    cls: 'village',
    back: () => UI.close(),
    backLabel: 'Voltar a andar pela vila',
    text: `${msg ? `<span style="color:#fde68a">${msg}</span><br>` : ''}Vida ${Math.ceil(p.hp)}/${st.maxHp} · Fome ${Math.ceil(p.hunger)} · Cansaço ${Math.floor(p.fatigue)} · ◆ ${p.gold} ouro · Mais fundo: andar ${p.maxFloor}${tombLine}`,
    items: [
      { label: 'Descer à masmorra', sub: p.portal ? `Portal de Retorno aberto no andar ${p.portal}` : 'Escolha o elevador de partida', act: descendMenu },
      { label: 'Ancião Tobias', sub: `Objetivo: ${STORY.elder(p).goal}`, color: '#fde68a', act: elderMenu },
      { label: 'Quadro de Missões', sub: (() => { ensureQuests(p); const n = p.quests.filter(q => q.done).length; return n ? `${n} ${n > 1 ? 'missões prontas' : 'missão pronta'} para entregar!` : 'Pedidos dos moradores com recompensas'; })(), color: p.quests && p.quests.some(q => q.done) ? '#4ade80' : null, act: questBoard },
      { label: 'Estalagem', sub: 'Dormir e comer', act: innMenu },
      { label: 'Mercado', sub: 'Comprar suprimentos e vender tesouros', act: () => marketMenu('buy') },
      { label: 'Ferreiro', sub: 'Melhorar arma e armadura', act: smithMenu },
      { label: 'Alfaiate', sub: `Mochila ${p.bagSize}/${BAG_MAX} espaços`, act: tailorMenu },
      { label: 'Baú', sub: `Guardar itens com segurança (${p.stash.length}/30)`, act: () => stashMenu() },
      { label: 'Habilidades', sub: (G.p.skillPts || 0) > 0 ? `${G.p.skillPts} ${G.p.skillPts > 1 ? 'pontos' : 'ponto'} para gastar!` : 'Guerreiro, Caçador e Arcano', color: (G.p.skillPts || 0) > 0 ? '#a78bfa' : null, act: () => UI.skills('village') },
      { label: 'Mochila e atributos', sub: p.points > 0 ? `${p.points} pontos para distribuir!` : 'Equipamentos e itens', color: p.points > 0 ? '#fde047' : null, act: () => { UI.invSel = { area: 'bag', i: 0 }; G.resumeFromMenu = () => villageMenu(); UI.inventory('village'); } },
      { label: 'Opções de itens', sub: `Equipar automático: ${p.autoEquip ? 'ligado' : 'desligado'} · Filtro: ${LOOT_FILTERS[p.lootMin || 0]}`, act: () => lootOptions(() => villageMenu()) },
      { label: Music.muted ? 'Ligar música' : 'Desligar música', sub: 'Atalho: tecla M', act: () => { Music.toggle(); villageMenu(); } },
      { label: 'Sair para o título', act: () => { saveGame(); UI.close(); titleScreen(); } },
    ],
  });
}

const LOOT_FILTERS = ['pegar tudo', 'só incomum ou melhor', 'só raro ou melhor'];
function lootOptions(back) {
  const p = G.p;
  UI.menu({
    title: 'Opções de itens',
    text: 'O filtro vale só para armas, armaduras e acessórios. Ouro, tesouros e consumíveis são sempre pegos, e um item melhor que o seu é pego mesmo abaixo do filtro.',
    items: [
      { label: `Equipar automaticamente: ${p.autoEquip ? 'LIGADO' : 'DESLIGADO'}`, sub: 'Ao pegar um item melhor que o seu, ele é equipado na hora', color: p.autoEquip ? '#4ade80' : null,
        act: () => { p.autoEquip = !p.autoEquip; saveGame(); lootOptions(back); } },
      ...LOOT_FILTERS.map((name, i) => ({
        label: `${(p.lootMin || 0) === i ? '» ' : ''}Filtro: ${name}`, color: (p.lootMin || 0) === i ? '#fde047' : null,
        sub: i === 0 ? 'Pega todo equipamento' : i === 1 ? 'Deixa no chão os equipamentos comuns (brancos)' : 'Deixa no chão comuns e incomuns (brancos e verdes)',
        act: () => { p.lootMin = i; saveGame(); lootOptions(back); },
      })),
    ],
    back,
  });
}

function descendMenu() {
  const p = G.p;
  const warn = p.fatigue >= 80 ? 'Você está muito cansado (−20% de dano e velocidade). Durma na estalagem antes!' : p.hunger < 30 ? 'Você está com fome. Coma antes de descer.' : 'Escolha onde começar a descida.';
  UI.menu({
    title: 'Descer',
    text: warn,
    items: (p.portal ? [{
      label: `Portal de Retorno · andar ${p.portal}`, color: '#7dd3fc',
      sub: `${biomeOf(p.portal).name} · volta para onde você parou (o portal fecha ao usar)`,
      right: 'andar ' + p.portal,
      act: () => { const f = p.portal; p.portal = null; UI.close(); G.resumeFromMenu = () => {}; enterFloor(f, false); },
    }] : []).concat(unlockedElevators().reverse().map(f => ({
      label: f === 1 ? 'Entrada da masmorra' : `Elevador do andar ${f}`,
      sub: biomeOf(f).name,
      right: 'andar ' + f,
      act: () => { UI.close(); G.resumeFromMenu = () => {}; enterFloor(f, false); },
    }))),
    back: () => villageMenu(),
  });
}

function innMenu() {
  const p = G.p, st = playerStats(p);
  const sleepCost = 8 + p.level * 2;
  const mealCost = 12 + Math.floor(p.level / 2) * 2;
  UI.menu({
    title: 'Estalagem',
    text: '"Cama quente e sopa de cogumelo. Lá embaixo você não acha isso."',
    items: [
      { label: 'Dormir', sub: 'Recupera toda a vida e zera o cansaço', right: sleepCost + ' ◆', disabled: p.gold < sleepCost || (p.hp >= st.maxHp && p.fatigue <= 0),
        act: () => { p.gold -= sleepCost; p.hp = st.maxHp; p.fatigue = 0; Sfx.heal(); saveGame(); innMenu(); UI.toast('Você dormiu como uma pedra.', '#a5b4fc'); } },
      { label: 'Refeição', sub: 'Enche toda a fome', right: mealCost + ' ◆', disabled: p.gold < mealCost || p.hunger >= 100,
        act: () => { p.gold -= mealCost; p.hunger = 100; Sfx.pickup(); saveGame(); innMenu(); } },
    ],
    back: () => villageMenu(),
  });
}

function marketMenu(tab) {
  const p = G.p;
  const items = [];
  items.push({ label: tab === 'buy' ? '» Comprar' : 'Comprar', color: tab === 'buy' ? '#fde047' : null, act: () => marketMenu('buy') });
  items.push({ label: tab === 'sell' ? '» Vender' : 'Vender', color: tab === 'sell' ? '#fde047' : null, act: () => marketMenu('sell') });
  if (tab === 'buy') {
    for (const k of ['potion', 'food', 'scroll']) {
      const c = CONSUMABLES[k];
      items.push({
        label: c.name, sub: c.desc, right: c.price + ' ◆', icon: itemIconURL({ kind: k }),
        disabled: p.gold < c.price,
        act: () => {
          const it = makeConsumable(k);
          if (!bagAdd(p.bag, p.bagSize, it)) { UI.toast('Mochila cheia!', '#f87171'); return; }
          p.gold -= c.price; Sfx.gold(); saveGame(); marketMenu('buy');
        },
      });
    }
  } else {
    const junk = p.bag.filter(i => !isConsumable(i));
    if (junk.length) {
      const tot = junk.reduce((a, i) => a + i.value, 0);
      items.push({ label: `Vender tudo (${junk.length} ${junk.length > 1 ? 'itens' : 'item'})`, sub: 'Equipamentos e tesouros da mochila. Poções, pães e pergaminhos ficam. O que está equipado não é vendido.', right: tot + ' ◆', color: '#facc15',
        act: () => { p.bag = p.bag.filter(i => isConsumable(i)); p.gold += tot; Sfx.gold(); Sfx.rare(); saveGame(); UI.toast(`Vendeu ${junk.length} itens por ${tot} ouro.`, '#facc15'); marketMenu('sell'); } });
    }
    const sellAll = p.bag.filter(i => i.kind === 'treasure');
    if (sellAll.length) {
      const total = sellAll.reduce((a, i) => a + i.value, 0);
      items.push({ label: 'Vender todos os tesouros', right: total + ' ◆', color: '#22d3ee',
        act: () => { p.bag = p.bag.filter(i => i.kind !== 'treasure'); p.gold += total; Sfx.gold(); saveGame(); marketMenu('sell'); } });
    }
    p.bag.forEach((it, idx) => {
      const v = it.value * (it.qty || 1);
      items.push({
        label: itemDisplayName(it), color: RARITIES[it.rarity].color, icon: itemIconURL(it),
        sub: itemStatLines(it)[0], right: v + ' ◆',
        act: () => { p.bag.splice(idx, 1); p.gold += v; Sfx.gold(); saveGame(); marketMenu('sell'); },
      });
    });
    if (!p.bag.length) items.push({ label: 'Sua mochila está vazia.', disabled: true });
  }
  UI.menu({ title: 'Mercado', text: `◆ ${p.gold} ouro`, items, back: () => villageMenu(), focus: tab === 'buy' ? 2 : 1 });
}

function smithMenu() {
  const p = G.p;
  const cost = it => Math.round(40 * (it.up + 1) * (1 + it.lvl * 0.15) * (1 + it.rarity * 0.3));
  const row = (slot, label) => {
    const it = p.eq[slot];
    if (!it) return { label: `${label}: nada equipado`, disabled: true };
    if (it.up >= 10) return { label: `${itemDisplayName(it)}`, sub: 'Já está no máximo (+10)', disabled: true, color: RARITIES[it.rarity].color };
    const c = cost(it);
    return {
      label: `${itemDisplayName(it)} → +${it.up + 1}`, color: RARITIES[it.rarity].color, icon: itemIconURL(it),
      sub: slot === 'weapon' ? '+8% de dano por nível' : '+8% de defesa por nível',
      right: c + ' ◆', disabled: p.gold < c,
      act: () => { p.gold -= c; it.up++; it.value = itemValue(it); Sfx.chest(); saveGame(); smithMenu(); UI.toast(`${it.name} agora é +${it.up}!`, '#fde047'); },
    };
  };
  UI.menu({ title: 'Ferreiro', text: `"Traga ouro que eu deixo isso afiado." · ◆ ${p.gold}`, items: [row('weapon', 'Arma'), row('armor', 'Armadura')], back: () => villageMenu() });
}

function tailorMenu() {
  const p = G.p;
  const cost = Math.round(80 * Math.pow(1.7, (p.bagSize - BAG_START) / BAG_STEP));
  UI.menu({
    title: 'Alfaiate',
    text: `"Uma mochila maior é mais tesouro voltando para casa." · ◆ ${p.gold}`,
    items: [p.bagSize >= BAG_MAX
      ? { label: 'Sua mochila já é a maior possível.', disabled: true }
      : { label: `Aumentar mochila (${p.bagSize} → ${p.bagSize + BAG_STEP})`, right: cost + ' ◆', disabled: p.gold < cost,
          act: () => { p.gold -= cost; p.bagSize = Math.min(BAG_MAX, p.bagSize + BAG_STEP); Sfx.chest(); saveGame(); tailorMenu(); } }],
    back: () => villageMenu(),
  });
}

function stashMenu() {
  const p = G.p;
  const items = [{ label: '— Na mochila (guardar) —', disabled: true }];
  p.bag.forEach((it, idx) => items.push({
    label: itemDisplayName(it), color: RARITIES[it.rarity].color, icon: itemIconURL(it), right: 'guardar',
    disabled: p.stash.length >= 30,
    act: () => { p.stash.push(p.bag.splice(idx, 1)[0]); saveGame(); stashMenu(); },
  }));
  items.push({ label: '— No baú (retirar) —', disabled: true });
  p.stash.forEach((it, idx) => items.push({
    label: itemDisplayName(it), color: RARITIES[it.rarity].color, icon: itemIconURL(it), right: 'retirar',
    disabled: p.bag.length >= p.bagSize,
    act: () => { p.bag.push(p.stash.splice(idx, 1)[0]); saveGame(); stashMenu(); },
  }));
  UI.menu({ title: 'Baú', text: 'Itens guardados aqui nunca são perdidos quando você morre.', items, back: () => villageMenu(), focus: 1 });
}

function pauseMenu() {
  UI.menu({
    title: 'Pausa',
    items: [
      { label: 'Continuar', act: () => UI.close() },
      { label: 'Voltar à vila', sub: G.p.bag.some(i => i.kind === 'scroll') ? 'Usa um Pergaminho de Retorno na hora' : 'Runa de Retorno: fique parado por 4 segundos', act: () => { UI.close(); startReturn(); } },
      { label: 'Controles', act: controlsScreen },
      { label: Music.muted ? 'Ligar música' : 'Desligar música', sub: 'Atalho: tecla M', act: () => { Music.toggle(); pauseMenu(); } },
      { label: Sfx.muted ? 'Ligar efeitos sonoros' : 'Desligar efeitos sonoros', act: () => { Sfx.muted = !Sfx.muted; pauseMenu(); } },
      { label: 'Opções de itens', sub: `Equipar automático: ${G.p.autoEquip ? 'ligado' : 'desligado'} · Filtro: ${LOOT_FILTERS[G.p.lootMin || 0]}`, act: () => lootOptions(pauseMenu) },
      { label: Tips.enabled ? 'Desligar dicas' : 'Ligar dicas', sub: 'Dicas do tutorial que aparecem durante o jogo', act: () => { Tips.toggle(); pauseMenu(); } },
      { label: 'Rever todas as dicas', sub: 'As dicas voltam a aparecer desde o começo', act: () => { Tips.reset(); UI.toast('As dicas vão aparecer de novo.', '#c4b5fd'); pauseMenu(); } },
      { label: 'Sair para o título', sub: 'O progresso fica salvo no início deste andar', act: () => { saveGame(); UI.close(); titleScreen(); } },
    ],
    back: () => UI.close(),
  });
}

function controlsScreen(fromTitle) {
  UI.menu({
    title: 'Controles',
    text: `<table class="ctl">
      <tr><td>Mover</td><td>WASD / setas</td></tr>
      <tr><td>Atacar</td><td>J ou clique (mira no mouse)</td></tr>
      <tr><td>Esquivar</td><td>Espaço</td></tr>
      <tr><td>Interagir</td><td>E (escada, fogueira, elevador)</td></tr>
      <tr><td>Poção / Comida</td><td>Q / F</td></tr>
      <tr><td>Voltar à vila</td><td>R (pergaminho na hora, ou Runa: 4 s parado)</td></tr>
      <tr><td>Mochila e atributos</td><td>I ou Tab</td></tr>
      <tr><td>Habilidades (usar)</td><td>1 / 2 / 3</td></tr>
      <tr><td>Painel de habilidades</td><td>H</td></tr>
      <tr><td>Pausa</td><td>Esc</td></tr>
      <tr><td>Música liga/desliga</td><td>M</td></tr>
      </table>
      <p class="ctlh">Controle (Xbox / PlayStation)</p>
      <table class="ctl">
      <tr><td>Mover / mirar</td><td>analógico esquerdo ou direcional / analógico direito</td></tr>
      <tr><td>Atacar / esquivar</td><td>A (✕) / B (○)</td></tr>
      <tr><td>Interagir / poção</td><td>X (□) / Y (△)</td></tr>
      <tr><td>Habilidades 1 / 2 / 3</td><td>LB / RB / RT</td></tr>
      <tr><td>Comida / voltar à vila</td><td>LT / clicar analógico esquerdo</td></tr>
      <tr><td>Mochila / habilidades / pausa</td><td>View / clicar analógico direito / Menu</td></tr>
      <tr><td>Nos menus</td><td>direcional navega, A confirma, B volta</td></tr>
      </table><p>No celular, use o analógico à esquerda e os botões à direita.</p>`,
    items: [],
    back: fromTitle === true ? titleScreen : pauseMenu,
  });
}

// ---------- Título ----------
function titleScreen() {
  G.state = 'title';
  Music.play('village');
  showHud(false);
  const can = hasSave();
  UI.show(`
    <div class="title">
      <h1>PROFUNDEZAS</h1>
      <p class="tag">50 andares. Uma vila. Quanto você arrisca?</p>
      <div class="tbtns">
        ${can ? '<button data-act="cont" data-focus>Continuar</button>' : ''}
        <button data-act="new" ${can ? '' : 'data-focus'}>Novo jogo</button>
        <button data-act="ctl">Controles</button>
      </div>
      <p class="ver">${VERSION} · protótipo · Portal Pixel</p>
    </div>`, {
    full: true, cls: 'titlep',
    actions: {
      cont: () => startGame(false),
      new: () => {
        if (can && !confirm('Começar um jogo novo apaga o progresso salvo. Continuar?')) return;
        startGame(true);
      },
      ctl: () => controlsScreen(true),
    },
  });
}

function startGame(fresh) {
  UI.close();
  G.p = fresh ? null : loadGame();
  if (!G.p) { G.p = newPlayer(); resetRuntime(G.p); }
  ensureSkills(G.p); G.p.dodgeCh = dodgeMax(G.p);
  ensureQuests(G.p);
  G.resumeFromMenu = () => {};
  if (G.p.floor > 0) enterFloor(G.p.floor, false);
  else if (fresh) {
    G.state = 'title'; Music.play('village');
    Scene.show('intro', STORY.intro.title, STORY.intro.text, () => {
      enterVillage(null, 'plaza');
      Dialog.play([
        { who: 'tobias', text: 'Explorador! Que bom que você veio. Eu sou Tobias, o Ancião de Pedra Funda.' },
        { who: 'tobias', text: 'A torre ali no canto leva à masmorra. Antes de descer, fale com Marta, Joana, Bruno e Lia: cada um vai te ajudar de um jeito.' },
        { who: 'pedrinho', text: 'E comigo também! Eu sei um monte de segredos da masmorra!' },
        { who: 'tobias', text: 'Quando quiser saber seu próximo objetivo, venha falar comigo. Boa sorte.' },
      ]);
    });
  }
  else enterVillage(null);
}

// ---------- Cena da vila (fundo) ----------
function renderVillageBg() {
  const ctx = G.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const w = G.canvas.width, h = G.canvas.height, s = G.scale;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1e1b4b'); g.addColorStop(0.6, '#7c3aed'); g.addColorStop(1, '#f97316');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // estrelas
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 60; i++) {
    const x = (i * 97) % w, y = (i * 53) % (h * 0.45);
    ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(G.time + i));
    ctx.fillRect(x, y, s * 0.6, s * 0.6);
  }
  ctx.globalAlpha = 1;
  // montanhas
  ctx.fillStyle = '#2e1065';
  ctx.beginPath(); ctx.moveTo(0, h * 0.7);
  for (let x = 0; x <= w; x += 20 * s) ctx.lineTo(x, h * 0.55 + Math.sin(x / (40 * s)) * 18 * s + Math.cos(x / (17 * s)) * 6 * s);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  // chão
  ctx.fillStyle = '#1c1917'; ctx.fillRect(0, h * 0.78, w, h * 0.22);
  // casas
  const houses = 7;
  for (let i = 0; i < houses; i++) {
    const hw = 34 * s, hh = (22 + (i % 3) * 6) * s;
    const x = (i + 0.3) * (w / houses), y = h * 0.78 - hh;
    ctx.fillStyle = '#292524'; ctx.fillRect(x, y, hw, hh);
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y); ctx.lineTo(x + hw / 2, y - 14 * s); ctx.lineTo(x + hw + 3 * s, y); ctx.fill();
    ctx.fillStyle = Math.sin(G.time * 2 + i) > -0.6 ? '#fbbf24' : '#92400e';
    ctx.fillRect(x + 6 * s, y + 8 * s, 6 * s, 6 * s);
    ctx.fillRect(x + hw - 12 * s, y + 8 * s, 6 * s, 6 * s);
  }
  // torre / entrada da masmorra
  const tx = w * 0.86, tw = 24 * s, th = 70 * s;
  ctx.fillStyle = '#44403c'; ctx.fillRect(tx, h * 0.78 - th, tw, th);
  ctx.fillStyle = '#000'; ctx.fillRect(tx + 7 * s, h * 0.78 - 16 * s, 10 * s, 16 * s);
  ctx.fillStyle = '#57534e';
  for (let i = 0; i < 4; i++) ctx.fillRect(tx - 2 * s + i * 7 * s, h * 0.78 - th - 6 * s, 5 * s, 6 * s);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, w, h);
}

// ---------- Laço ----------
let last = performance.now();
function frame(now) {
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  Input.pollPad(dt);
  Tips.update(dt);
  G.time += dt;
  if (G.state === 'dungeon') {
    if (!UI.anyOpen()) {
      if (G.hitStop > 0) { G.hitStop -= dt; dt = 0; }
      updateDungeon(dt);
    }
    if (G.state === 'dungeon' && G.level) {
      renderDungeon();
      UI.updateHud(dt);
      updateSkillBar();
      if (Math.floor(G.time * 4) !== Math.floor((G.time - dt) * 4)) { UI.drawMinimap(); updateQuestTracker(); }
    }
  } else if (G.state === 'village' && VILLAGE.built && G.p) {
    if (!UI.anyOpen()) updateVillage(dt);
    renderVillage();
    UI.updateHud(dt);
    if (Math.floor(G.time * 4) !== Math.floor((G.time - dt) * 4)) updateQuestTracker();
  } else {
    renderVillageBg();
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}

window.addEventListener('load', () => {
  G.canvas = document.getElementById('game');
  G.ctx = G.canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  Input.init(G.canvas);
  Music.init();
  Tips.init();
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'm' || e.repeat) return;
    Sfx.init();
    const on = Music.toggle();
    if (G.state === 'dungeon') UI.toast(on ? 'Música ligada' : 'Música desligada', '#c4b5fd');
  });
  // fecha a mochila voltando ao jogo quando aberta na masmorra
  G.resumeFromMenu = () => {};
  titleScreen();
  requestAnimationFrame(frame);
});
