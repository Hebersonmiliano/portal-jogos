// =============================================================
// Árvore de habilidades: 3 ramos em degraus (Guerreiro, Caçador,
// Arcano). Cada ponto gasto num ramo abre o degrau seguinte; no topo
// fica a habilidade suprema. Pontos: 1 a cada 2 níveis + 1 por chefe.
// Atalhos 1, 2 e 3 para as habilidades ativas.
// =============================================================
'use strict';

const SKILL_TREES = [
  { id: 'guerreiro', name: 'Guerreiro', color: '#f87171', icon: '⚔', title: 'Mestre Guerreiro', bonus: n => `+${2 * n}% de vida` },
  { id: 'cacador',   name: 'Caçador',   color: '#4ade80', icon: '➶', title: 'Mestre Caçador',   bonus: n => `+${n}% de velocidade e de crítico` },
  { id: 'arcano',    name: 'Arcano',    color: '#a78bfa', icon: '✦', title: 'Mestre Arcano',    bonus: n => `+${2 * n}% de dano das habilidades` },
];
const TIER_REQ = [0, 3, 6, 12]; // pontos no ramo para abrir cada degrau
const TITLE_AT = 12;

// kind: 'active' (vai no atalho), 'passive', 'ultimate' (suprema, nível único)
const SKILLS = {
  // ---------- Guerreiro ----------
  giro:      { tree: 'guerreiro', tier: 1, kind: 'active', name: 'Golpe Giratório', short: 'GIRO', cd: () => 6,
               desc: r => `Gira a arma e atinge todos ao redor com ${150 + 40 * (r - 1)}% do dano.` },
  peledura:  { tree: 'guerreiro', tier: 1, kind: 'passive', name: 'Pele Dura',
               desc: r => `+${8 * r}% de vida máxima e +${12 * r}% de defesa.` },
  investida: { tree: 'guerreiro', tier: 2, kind: 'active', name: 'Investida', short: 'INV', cd: () => 5,
               desc: r => `Avança invulnerável e acerta quem estiver no caminho com ${120 + 30 * (r - 1)}% do dano.` },
  sede:      { tree: 'guerreiro', tier: 2, kind: 'passive', name: 'Sede de Sangue',
               desc: r => `Golpes da arma recuperam ${2 * r}% do dano causado como vida.` },
  escudo:    { tree: 'guerreiro', tier: 3, kind: 'active', name: 'Escudo de Pedra', short: 'ESC', cd: () => 14,
               desc: r => `Por 4 segundos, reduz em ${50 + 10 * (r - 1)}% todo o dano recebido.` },
  contra:    { tree: 'guerreiro', tier: 3, kind: 'passive', name: 'Contra-ataque',
               desc: r => `Ao levar dano, ${15 * r}% de chance de revidar em volta com 120% do dano da arma.` },
  furia:     { tree: 'guerreiro', tier: 4, kind: 'ultimate', name: 'Fúria do Titã', short: 'FÚRIA', cd: () => 45,
               desc: () => 'SUPREMA. Por 8 segundos você cresce, causa +50% de dano, não fica lento e cada golpe solta uma onda de choque.' },
  // ---------- Caçador ----------
  flechas:   { tree: 'cacador', tier: 1, kind: 'active', name: 'Tiro Múltiplo', short: 'ARCO', cd: () => 3,
               desc: r => `Dispara ${3 + 2 * (r - 1)} flechas em leque, cada uma com 90% do dano.` },
  passos:    { tree: 'cacador', tier: 1, kind: 'passive', name: 'Passos Leves',
               desc: r => `+${6 * r}% de velocidade de movimento.` },
  armadilha: { tree: 'cacador', tier: 2, kind: 'active', name: 'Armadilha', short: 'ARM', cd: () => 7,
               desc: r => `Arma uma armadilha que explode quando um inimigo pisa: ${200 + 60 * (r - 1)}% do dano em área. Até 3 de uma vez.` },
  rolamento: { tree: 'cacador', tier: 2, kind: 'passive', name: 'Rolamento Duplo',
               desc: r => `A esquiva ganha 2 cargas e recarrega ${15 + 10 * (r - 1)}% mais rápido.` },
  perfurante:{ tree: 'cacador', tier: 3, kind: 'active', name: 'Flecha Perfurante', short: 'PERF', cd: () => 4,
               desc: r => `Uma flecha poderosa que atravessa todos os inimigos da fila com ${160 + 40 * (r - 1)}% do dano.` },
  aguia:     { tree: 'cacador', tier: 3, kind: 'passive', name: 'Olho de Águia',
               desc: r => `+${4 * r}% de crítico e +${2 * r} de alcance da arma.` },
  chuva:     { tree: 'cacador', tier: 4, kind: 'ultimate', name: 'Chuva de Flechas', short: 'CHUVA', cd: () => 30,
               desc: () => 'SUPREMA. Marca uma área grande na direção da mira, onde caem flechas por 4 segundos.' },
  // ---------- Arcano ----------
  fogo:      { tree: 'arcano', tier: 1, kind: 'active', name: 'Bola de Fogo', short: 'FOGO', cd: () => 4,
               desc: r => `Lança uma bola de fogo que explode em área com ${180 + 50 * (r - 1)}% do dano.` },
  mente:     { tree: 'arcano', tier: 1, kind: 'passive', name: 'Mente Clara',
               desc: r => `Todas as habilidades recarregam ${7 * r}% mais rápido.` },
  raio:      { tree: 'arcano', tier: 2, kind: 'active', name: 'Raio em Cadeia', short: 'RAIO', cd: () => 5,
               desc: r => `Um raio salta entre ${3 + (r - 1)} inimigos próximos, com 120% do dano em cada.` },
  escudoarc: { tree: 'arcano', tier: 2, kind: 'passive', name: 'Escudo Arcano',
               desc: r => `Uma bolha bloqueia um golpe inteiro e volta depois de ${14 - 2 * (r - 1)} segundos.` },
  teleporte: { tree: 'arcano', tier: 3, kind: 'active', name: 'Teleporte', short: 'TELE', cd: r => 6 - (r - 1),
               desc: r => `Teleporta até 80 pixels na direção da mira, invulnerável por um instante. Recarga de ${6 - (r - 1)} s.` },
  nova:      { tree: 'arcano', tier: 3, kind: 'passive', name: 'Nova de Gelo',
               desc: r => `Ao teleportar, congela quem está perto por ${1 + 0.5 * r} s e causa ${60 + 20 * (r - 1)}% do dano.` },
  meteoro:   { tree: 'arcano', tier: 4, kind: 'ultimate', name: 'Meteoro', short: 'METEORO', cd: () => 25,
               desc: () => 'SUPREMA. Um meteoro gigante cai onde você mira (500% do dano) e deixa o chão em chamas.' },
};
const maxRank = id => SKILLS[id].kind === 'ultimate' ? 1 : 3;

function skillRank(p, id) {
  const r = (p.skills && p.skills[id]) || 0;
  if (!r || maxRank(id) === 1) return r;
  return r + EQUIP_SLOTS.filter(s => p.eq && p.eq[s] && p.eq[s].skillUp === id).length; // amuleto: +1 nível
}
function learnedRank(p, id) { return (p.skills && p.skills[id]) || 0; }
function skillPointsSpent(p) { return Object.values(p.skills || {}).reduce((a, b) => a + b, 0); }
function branchPoints(p, tree) { return Object.entries(p.skills || {}).reduce((a, [id, r]) => a + (SKILLS[id] && SKILLS[id].tree === tree ? r : 0), 0); }
function tierOpen(p, id) { const s = SKILLS[id]; return branchPoints(p, s.tree) >= TIER_REQ[s.tier - 1]; }
function expectedPoints(p) { return Math.floor(p.level / 2) + (p.beaten || []).length + (p.cls ? 1 : 0); }
function playerTitle(p) { const t = SKILL_TREES.find(t => branchPoints(p, t.id) >= TITLE_AT); return t ? t.title : null; }

// Garante os campos (e converte jogos salvos da árvore antiga)
function ensureSkills(p) {
  if (!p.skills) p.skills = {};
  if (!Array.isArray(p.slots)) p.slots = [null, null, null];
  for (const id in p.skills) if (!SKILLS[id]) delete p.skills[id];
  if (!p.treeV2) { // árvore nova: devolve todos os pontos
    const had = skillPointsSpent(p) > 0;
    p.skills = {}; p.slots = [null, null, null]; p.skillPts = 0; p.treeV2 = true;
    if (had && typeof UI !== 'undefined') setTimeout(() => UI.toast('Árvore de habilidades nova! Seus pontos foram devolvidos. Aperte H para escolher.', '#a78bfa'), 1500);
  }
  const have = skillPointsSpent(p) + (p.skillPts || 0);
  const exp = expectedPoints(p);
  if (have < exp) p.skillPts = (p.skillPts || 0) + (exp - have);
  if (!p.skillPts) p.skillPts = 0;
  p.slots = p.slots.map(id => id && skillRank(p, id) && SKILLS[id].kind !== 'passive' ? id : null);
}

function canLearn(p, id) { return p.skillPts > 0 && learnedRank(p, id) < maxRank(id) && tierOpen(p, id); }

function learnSkill(p, id) {
  if (!canLearn(p, id)) return false;
  const r = learnedRank(p, id);
  p.skills[id] = r + 1;
  p.skillPts--;
  if (r === 0 && SKILLS[id].kind !== 'passive' && !p.slots.includes(id)) {
    const free = p.slots.indexOf(null);
    if (free >= 0) p.slots[free] = id;
    else if (SKILLS[id].kind === 'ultimate') p.slots[2] = id; // suprema vai para o atalho 3
  }
  return true;
}

function resetSkills(p) {
  p.skillPts = (p.skillPts || 0) + skillPointsSpent(p);
  p.skills = {}; p.slots = [null, null, null];
}
function respecCost(p) { return 25 * p.level; }

// ---------- Passivas e bônus de especialização ----------
function applySkillStats(p, st) {
  if (!p.skills) return st;
  const g = branchPoints(p, 'guerreiro'), c = branchPoints(p, 'cacador');
  st.maxHp = Math.round(st.maxHp * (1 + 0.08 * skillRank(p, 'peledura') + 0.02 * g));
  st.def *= 1 + 0.12 * skillRank(p, 'peledura');
  st.steal += 0.02 * skillRank(p, 'sede');
  st.speed *= 1 + 0.06 * skillRank(p, 'passos') + 0.01 * c;
  st.crit = Math.min(0.75, st.crit + 0.04 * skillRank(p, 'aguia') + 0.01 * c);
  st.range += 2 * skillRank(p, 'aguia');
  if (p.rageT > 0) { st.dmgMul *= 1.5; st.speed = Math.max(st.speed, 74 * 0.95); }
  return st;
}
function skillDmgMul(p) { return (1 + 0.02 * branchPoints(p, 'arcano')) * (hasSpecial('arcano') ? 1.2 : 1); }
function skillCdMult(p) { return Math.max(0.5, 1 - 0.07 * skillRank(p, 'mente')) * cdMult(); }

function dodgeMax(p) { return skillRank(p, 'rolamento') ? 2 : 1; }
function dodgeRecharge(p) { const r = skillRank(p, 'rolamento'); return 0.75 * (r ? 1 - (0.15 + 0.1 * (r - 1)) : 1) * (hasSpecial('agil') ? 0.65 : 1) * (wingHas(p, 3) ? 0.6 : 1); }

// Passivas que reagem a golpes recebidos (chamado por hurtPlayer)
function skillOnHurt(p, source) {
  // Escudo Arcano: bloqueia o golpe inteiro
  const ea = skillRank(p, 'escudoarc');
  if (ea && (p.arcShieldCd || 0) <= 0) {
    p.arcShieldCd = 14 - 2 * (ea - 1);
    G.effects.push({ type: 'ring', x: p.x, y: p.y - 6, r: 6, max: 16, t: 0.3, color: '#a78bfa' });
    addText(p.x, p.y - 18, 'bloqueado', '#c4b5fd', 0.8);
    Sfx.click();
    p.iframes = 0.4;
    return true;
  }
  // Contra-ataque
  const ct = skillRank(p, 'contra');
  if (ct && Math.random() < 0.15 * ct) {
    const st = playerStats(p);
    setTimeout(() => { if (G.state === 'dungeon' && !p.dead) { p.spin = 0.25; areaDamage(p.x, p.y - 5, 26, st.weaponDmg * st.dmgMul * 1.2, '#fca5a5'); addText(p.x, p.y - 22, 'contra-ataque!', '#fca5a5', 0.8); } }, 80);
  }
  return false;
}
// Fúria do Titã: cada golpe da arma solta uma onda de choque
function skillOnMeleeHits(p, aim, st) {
  if (p.rageT > 0) {
    const fx = p.x + Math.cos(aim) * 16, fy = p.y - 5 + Math.sin(aim) * 16;
    G.effects.push({ type: 'ring', x: fx, y: fy, r: 4, max: 26, t: 0.25, color: '#ef4444' });
    for (const e of G.enemies) if (!e.dead && !e.isProp && dist(fx, fy, e.x, e.y - 5) < 26 + e.r) e.hurt(st.weaponDmg * st.dmgMul * 0.5, fx, fy, false);
  }
}

// Direção da mira: controle, mouse (se usado há pouco) ou para onde o herói olha
function aimAngle() {
  const p = G.p;
  const pa = Input.padAim();
  if (pa !== null) return pa;
  if (!Input.isTouch && Input.mouse.lastMove && performance.now() - Input.mouse.lastMove < 2500) {
    const w = screenToWorld(Input.mouse.x, Input.mouse.y);
    return Math.atan2(w.y - (p.y - 5), w.x - p.x);
  }
  return Math.atan2(p.fy, p.fx);
}
// Ponto no chão na direção da mira (para Chuva de Flechas e Meteoro)
function aimPoint(maxD) {
  const p = G.p, a = aimAngle();
  let tx = p.x, ty = p.y;
  for (let s = 6; s <= maxD; s += 6) { const nx = p.x + Math.cos(a) * s, ny = p.y + Math.sin(a) * s; if (solidAt(nx, ny)) break; tx = nx; ty = ny; }
  return { x: tx, y: ty };
}

function useSkill(slot) {
  const p = G.p;
  const id = p.slots[slot];
  if (!id) { UI.toast('Atalho vazio. Aprenda habilidades com a tecla H.', '#9ca3af'); return; }
  const r = skillRank(p, id);
  if (!r || SKILLS[id].kind === 'passive') return;
  if ((p.skillCd[id] || 0) > 0) return;
  const st = playerStats(p);
  const base = st.weaponDmg * st.dmgMul * skillDmgMul(p);
  const a = aimAngle();
  const cx = p.x, cy = p.y - 5;
  p.skillCd[id] = SKILLS[id].cd(r) * skillCdMult(p);
  p.face = Math.cos(a) < 0 ? -1 : 1;

  if (id === 'giro') {
    G.effects.push({ type: 'ring', x: cx, y: cy, r: 6, max: 30, t: 0.3, color: '#f87171' });
    p.spin = 0.3;
    Sfx.swing(); Sfx.hit();
    for (const e of G.enemies) if (!e.dead && dist(cx, cy, e.x, e.y - 5) < 30 + e.r) e.hurt(base * (1.5 + 0.4 * (r - 1)), p.x, p.y, false);
  } else if (id === 'investida') {
    p.charge = { t: 0.24, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, hit: new Set(), dmg: base * (1.2 + 0.3 * (r - 1)) };
    p.iframes = Math.max(p.iframes, 0.3);
    Sfx.dash();
  } else if (id === 'escudo') {
    p.shieldT = 4; p.shieldRed = 0.5 + 0.1 * (r - 1);
    Sfx.chest();
  } else if (id === 'furia') {
    p.rageT = 8;
    G.effects.push({ type: 'ring', x: cx, y: cy, r: 6, max: 44, t: 0.5, color: '#ef4444' });
    G.shake = 6; Sfx.boom(); Sfx.level();
    UI.toast('FÚRIA DO TITÃ!', '#ef4444');
  } else if (id === 'flechas') {
    const n = 3 + 2 * (r - 1), spread = 0.16;
    for (let i = 0; i < n; i++) {
      const aa = a + (i - (n - 1) / 2) * spread;
      G.projectiles.push(new Projectile(cx, cy, Math.cos(aa) * 230, Math.sin(aa) * 230, base * 0.9, true, '#d9f99d', 2, { life: 1.2 + 0.1 * skillRank(p, 'aguia') }));
    }
    Sfx.shoot();
  } else if (id === 'armadilha') {
    G.traps.push({ x: p.x, y: p.y, arm: 0.5, life: 30, dmg: base * (2 + 0.6 * (r - 1)) });
    while (G.traps.length > 3) G.traps.shift();
    Sfx.chest();
  } else if (id === 'perfurante') {
    G.projectiles.push(new Projectile(cx, cy, Math.cos(a) * 300, Math.sin(a) * 300, base * (1.6 + 0.4 * (r - 1)), true, '#bef264', 4, { pierce: true, life: 1.2 }));
    Sfx.shoot(); Sfx.dash();
  } else if (id === 'chuva') {
    const pt = aimPoint(90);
    G.rains.push({ x: pt.x, y: pt.y, r: 48, t: 4, tick: 0, dmg: base * 0.7 });
    Sfx.shoot();
  } else if (id === 'fogo') {
    G.projectiles.push(new Projectile(cx, cy, Math.cos(a) * 170, Math.sin(a) * 170, base * (1.8 + 0.5 * (r - 1)), true, '#f97316', 5, { explode: 30, life: 1.5 }));
    Sfx.shoot();
  } else if (id === 'raio') {
    const hits = [];
    let from = { x: cx, y: cy }, range = 130;
    for (let k = 0; k < 3 + (r - 1); k++) {
      let best = null, bd = range;
      for (const e of G.enemies) {
        if (e.dead || e.hidden || e.isProp || hits.includes(e)) continue;
        const d = dist(from.x, from.y, e.x, e.y - 5);
        if (d < bd) { bd = d; best = e; }
      }
      if (!best) break;
      hits.push(best);
      G.effects.push({ type: 'bolt', x: from.x, y: from.y, x2: best.x, y2: best.y - 5, t: 0.25, r: 0, max: 0, color: '#c4b5fd' });
      from = { x: best.x, y: best.y - 5 }; range = 80;
    }
    for (const e of hits) e.hurt(base * 1.2, e.x, e.y + 2, false);
    if (!hits.length) { UI.toast('Nenhum inimigo ao alcance do raio.', '#9ca3af'); p.skillCd[id] = 0.5; return; }
    Sfx.crit();
  } else if (id === 'teleporte') {
    burst(p.x, p.y - 6, '#a78bfa', 14);
    let tx = p.x, ty = p.y;
    for (let s = 4; s <= 80; s += 4) {
      const nx = p.x + Math.cos(a) * s, ny = p.y + Math.sin(a) * s;
      if (boxSolid(nx, ny, 4, 3)) break;
      tx = nx; ty = ny;
    }
    p.x = tx; p.y = ty; p.iframes = Math.max(p.iframes, 0.4);
    burst(p.x, p.y - 6, '#a78bfa', 14);
    Sfx.dash();
    const nv = skillRank(p, 'nova');
    if (nv) {
      G.effects.push({ type: 'ring', x: p.x, y: p.y - 5, r: 4, max: 38, t: 0.35, color: '#bae6fd' });
      burst(p.x, p.y - 5, '#bae6fd', 16);
      for (const e of G.enemies) if (!e.dead && !e.isProp && dist(p.x, p.y - 5, e.x, e.y - 5) < 38 + e.r) {
        e.hurt(base * (0.6 + 0.2 * (nv - 1)), p.x, p.y, false);
        e.chillT = 1 + 0.5 * nv; e.frozenT = 1 + 0.5 * nv;
      }
    }
  } else if (id === 'meteoro') {
    const pt = aimPoint(100);
    G.meteors.push({ x: pt.x, y: pt.y, t: 1.0, dmg: base * 5 });
    Sfx.tone(200, 0.9, 'sawtooth', 0.05, -150);
  }
}

function updateSkills(dt) {
  const p = G.p;
  for (const id in p.skillCd) if (p.skillCd[id] > 0) p.skillCd[id] = Math.max(0, p.skillCd[id] - dt);
  if (p.shieldT > 0) p.shieldT -= dt;
  if (p.spin > 0) p.spin -= dt;
  if (p.arcShieldCd > 0) { p.arcShieldCd -= dt; if (p.arcShieldCd <= 0) Sfx.tone(880, 0.1, 'sine', 0.04); }
  if (p.rageT > 0) { p.rageT -= dt; p.slowT = 0; if (Math.random() < 0.5) G.particles.push({ x: p.x + rr(-6, 6), y: p.y - rr(0, 14), vx: 0, vy: -20, t: 0.4, color: '#ef4444' }); }
  if (p.charge) {
    const c = p.charge;
    c.t -= dt;
    moveBody(p, c.vx * dt, c.vy * dt);
    burst(p.x, p.y - 5, '#fca5a5', 1);
    for (const e of G.enemies) {
      if (e.dead || c.hit.has(e)) continue;
      if (dist(p.x, p.y - 5, e.x, e.y - 5) < 12 + e.r) { c.hit.add(e); e.hurt(c.dmg, p.x, p.y, false); Sfx.hit(); }
    }
    if (c.t <= 0) p.charge = null;
  }
  // inimigos congelados pela Nova ficam parados
  for (const e of G.enemies) if (e.frozenT > 0) { e.frozenT -= dt; e.spd = 0; e.wind = 0; e.dash = null; e.atkCd = Math.max(e.atkCd, 0.2); e.shootCd = Math.max(e.shootCd || 0, 0.3); }
  // armadilhas
  for (const tr of G.traps) {
    tr.life -= dt;
    if (tr.arm > 0) { tr.arm -= dt; continue; }
    for (const e of G.enemies) {
      if (!e.dead && !e.hidden && !e.isProp && dist(tr.x, tr.y, e.x, e.y) < 12 + e.r) { tr.boom = true; break; }
    }
    if (tr.boom) areaDamage(tr.x, tr.y - 3, 32, tr.dmg, '#facc15');
  }
  G.traps = G.traps.filter(tr => !tr.boom && tr.life > 0);
  // Chuva de Flechas
  for (const rn of G.rains) {
    rn.t -= dt; rn.tick -= dt;
    while (rn.tick <= 0) {
      rn.tick += 0.08;
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * rn.r;
      const ax = rn.x + Math.cos(a) * d, ay = rn.y + Math.sin(a) * d * 0.7;
      rn.arrows = rn.arrows || []; rn.arrows.push({ x: ax, y: ay, t: 0.18 });
      for (const e of G.enemies) if (!e.dead && !e.isProp && !e.hidden && dist(ax, ay, e.x, e.y) < 10 + e.r) e.hurt(rn.dmg, ax, ay - 4, false);
    }
    if (rn.arrows) { for (const ar of rn.arrows) ar.t -= dt; rn.arrows = rn.arrows.filter(ar => ar.t > 0); }
  }
  G.rains = G.rains.filter(rn => rn.t > 0);
  // Meteoro
  for (const m of G.meteors) {
    if (m.t > 0) {
      m.t -= dt;
      if (m.t <= 0) {
        G.shake = 8; Sfx.boom(); Sfx.boom();
        areaDamage(m.x, m.y - 4, 50, m.dmg, '#f97316');
        burst(m.x, m.y - 4, '#fde047', 30);
        m.burn = 3; m.tick = 0;
      }
    } else if (m.burn > 0) { // chão em chamas: fere só os inimigos
      m.burn -= dt; m.tick -= dt;
      if (m.tick <= 0) { m.tick = 0.5; for (const e of G.enemies) if (!e.dead && !e.isProp && dist(m.x, m.y, e.x, e.y) < 36 + e.r) e.hurt(m.dmg * 0.06, m.x, m.y - 2, false); }
    }
  }
  G.meteors = G.meteors.filter(m => m.t > 0 || m.burn > 0);
  // atalhos
  if (Input.hit('1') || Input.tb('s1')) useSkill(0);
  if (Input.hit('2') || Input.tb('s2')) useSkill(1);
  if (Input.hit('3') || Input.tb('s3')) useSkill(2);
}

function drawSkillsWorld(ctx) {
  const p = G.p, t = G.time;
  for (const tr of G.traps) {
    const x = Math.round(tr.x), y = Math.round(tr.y);
    ctx.fillStyle = tr.arm > 0 ? '#78716c' : '#a16207';
    ctx.fillRect(x - 5, y - 2, 10, 3);
    ctx.fillStyle = tr.arm > 0 ? '#57534e' : (Math.sin(t * 8) > 0 ? '#facc15' : '#ca8a04');
    ctx.fillRect(x - 1, y - 3, 2, 2);
    ctx.fillStyle = '#d6d3d1';
    for (let i = -4; i <= 4; i += 2) ctx.fillRect(x + i, y - 4, 1, 2);
  }
  for (const rn of G.rains) {
    ctx.strokeStyle = 'rgba(190,242,100,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(rn.x, rn.y, rn.r, rn.r * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#d9f99d';
    for (const ar of rn.arrows || []) { const k = ar.t / 0.18; ctx.fillRect(Math.round(ar.x), Math.round(ar.y - 14 * k - 6), 1, 6); }
  }
  for (const m of G.meteors) {
    if (m.t > 0) {
      const k = 1 - m.t;
      ctx.fillStyle = 'rgba(239,68,68,0.15)'; ctx.strokeStyle = 'rgba(239,68,68,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(m.x, m.y, 50, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(m.x, m.y, 50 * k, 32 * k, 0, 0, Math.PI * 2); ctx.stroke();
      const my = m.y - 120 * (1 - k);
      ctx.fillStyle = '#f97316'; ctx.fillRect(Math.round(m.x - 4 + 40 * (1 - k)), Math.round(my - 4), 8, 8);
      ctx.fillStyle = '#fde047'; ctx.fillRect(Math.round(m.x - 2 + 40 * (1 - k)), Math.round(my - 2), 4, 4);
    } else if (m.burn > 0) {
      ctx.globalAlpha = 0.35 + Math.sin(t * 10) * 0.1; ctx.fillStyle = '#ea580c';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, 36, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (Math.random() < 0.5) G.particles.push({ x: m.x + rr(-30, 30), y: m.y + rr(-16, 16), vx: 0, vy: -25, t: 0.5, color: '#fb923c' });
    }
  }
  if (p.shieldT > 0) {
    ctx.strokeStyle = `rgba(168,162,158,${0.5 + Math.sin(t * 8) * 0.2})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y - 6, 11, 0, Math.PI * 2); ctx.stroke();
  }
  if (skillRank(p, 'escudoarc') && (p.arcShieldCd || 0) <= 0) {
    ctx.strokeStyle = `rgba(167,139,250,${0.35 + Math.sin(t * 4) * 0.15})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(p.x, p.y - 6, 10, 0, Math.PI * 2); ctx.stroke();
  }
  if (p.rageT > 0) {
    ctx.strokeStyle = `rgba(239,68,68,${0.4 + Math.sin(t * 12) * 0.2})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 1, 9, 4, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (p.spin > 0) {
    const k = 1 - p.spin / 0.3;
    ctx.strokeStyle = `rgba(255,255,255,${0.8 - k * 0.6})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y - 5, 26, k * Math.PI * 4, k * Math.PI * 4 + 4); ctx.stroke();
  }
  for (const e of G.enemies) if (e.frozenT > 0 && !e.dead) {
    ctx.fillStyle = 'rgba(186,230,253,0.45)'; ctx.fillRect(Math.round(e.x - 6 * e.scale), Math.round(e.y - 12 * e.scale), Math.round(12 * e.scale), Math.round(12 * e.scale));
  }
}

// ---------- Painel da árvore ----------
UI.skills = function (ctx) {
  const p = G.p;
  ensureSkills(p);
  const node = (id) => {
    const s = SKILLS[id], r = learnedRank(p, id), eff = skillRank(p, id), mr = maxRank(id), open = tierOpen(p, id);
    const tree = SKILL_TREES.find(t => t.id === s.tree);
    const need = TIER_REQ[s.tier - 1] - branchPoints(p, s.tree);
    const dots = Array.from({ length: mr }, (_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('');
    const slotBtns = (s.kind !== 'passive' && r > 0) ? `<div class="slots">${[0, 1, 2].map(i =>
      `<button data-act="slot" data-arg="${id}:${i}" class="${p.slots[i] === id ? 'cur' : ''}" title="Atalho ${i + 1}">${i + 1}</button>`).join('')}</div>` : '';
    const kindLabel = s.kind === 'passive' ? 'passiva' : s.kind === 'ultimate' ? 'suprema' : 'ativa';
    return `<div class="sn ${s.kind} ${r ? 'has' : ''} ${open ? '' : 'locked'}">
      <div class="skh"><b>${s.name}</b><span class="dots">${dots}${eff > r ? '<em class="amu" title="Bônus do amuleto">+' + (eff - r) + '</em>' : ''}</span></div>
      <p class="kind">${kindLabel}${s.cd && s.kind !== 'passive' ? ` · recarga ${s.cd(Math.max(1, r))} s` : ''}</p>
      <p>${s.desc(Math.max(1, eff))}${r > 0 && r < mr ? `<br><small>Próximo: ${s.desc(r + 1)}</small>` : ''}</p>
      <div class="skf">
        ${!open ? `<span class="note">🔒 faltam ${need} ${need > 1 ? 'pontos' : 'ponto'} em ${tree.name}</span>`
          : canLearn(p, id) ? `<button data-act="learn" data-arg="${id}" class="learn">${r ? 'Melhorar' : 'Aprender'}</button>`
          : `<span class="note">${r >= mr ? 'Nível máximo' : r ? '' : 'sem pontos'}</span>`}
        ${slotBtns}
      </div></div>`;
  };
  const cols = SKILL_TREES.map(tree => {
    const n = branchPoints(p, tree.id);
    const tiers = [1, 2, 3, 4].map(tier => {
      const ids = Object.keys(SKILLS).filter(id => SKILLS[id].tree === tree.id && SKILLS[id].tier === tier);
      const open = n >= TIER_REQ[tier - 1];
      return `<div class="tier ${open ? 'open' : ''} ${tier === 4 ? 'top' : ''}">
        <p class="tlabel">${tier === 4 ? 'Suprema' : 'Degrau ' + tier}${tier > 1 ? ` · ${TIER_REQ[tier - 1]} pontos` : ''}</p>
        <div class="trow">${ids.map(node).join('')}</div></div>`;
    }).join('<div class="tlink"></div>');
    return `<div class="tree2" style="--tc:${tree.color}">
      <h3>${tree.icon} ${tree.name} <span>${n} ${n === 1 ? 'ponto' : 'pontos'}</span></h3>
      <p class="spec">Especialização: ${tree.bonus(n)}${n >= TITLE_AT ? ` · <b>${tree.title}</b>` : ''}</p>
      ${tiers}</div>`;
  }).join('');
  const title = playerTitle(p);
  const slotsLine = p.slots.map((id, i) => `<span>${i + 1}: ${id ? SKILLS[id].name : '—'}</span>`).join('');
  const html = `
    <div class="invhead"><h2>Árvore de Habilidades</h2>${title ? `<span class="ttl">${title}</span>` : ''}<span class="gold">${p.skillPts} ${p.skillPts === 1 ? 'ponto' : 'pontos'}</span><button class="x" data-act="close">✕</button></div>
    <p class="mtext">Um ponto a cada 2 níveis e um por chefe derrotado pela primeira vez. Cada ponto num ramo abre o degrau seguinte; com 12 pontos você chega à habilidade Suprema. Ativas vão nos atalhos 1, 2 e 3. Para recomeçar a árvore, fale com o Ancião Tobias.</p>
    <div class="trees2">${cols}</div>
    <p class="slotsline">${slotsLine}</p>`;
  const back = () => { this.close(); if (ctx === 'village') villageMenu(); };
  const rerender = () => { const sc = document.getElementById('panel').scrollTop; this.skills(ctx); document.getElementById('panel').scrollTop = sc; };
  this.show(html, {
    cls: 'skillsp',
    onBack: back,
    actions: {
      close: back,
      learn: id => { if (learnSkill(p, id)) { Sfx.level(); saveGame(); } rerender(); },
      slot: arg => {
        const [id, i] = arg.split(':');
        const old = p.slots.indexOf(id);
        if (old >= 0) p.slots[old] = p.slots[+i];
        p.slots[+i] = id;
        saveGame(); rerender();
      },
    },
  });
  this.keyHook = e => { if (e.key.toLowerCase() === 'h') { e.preventDefault && e.preventDefault(); back(); return true; } return false; };
};

// Barra de habilidades no HUD
function updateSkillBar() {
  const p = G.p;
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('sk' + i);
    if (!el) continue;
    const id = p.slots[i];
    const name = id ? SKILLS[id].short : '';
    const lab = el.querySelector('.nm');
    if (lab.textContent !== name) lab.textContent = name;
    el.classList.toggle('empty', !id);
    el.classList.toggle('ult', !!id && SKILLS[id].kind === 'ultimate');
    const cd = id ? (p.skillCd[id] || 0) : 0;
    const max = id ? SKILLS[id].cd(skillRank(p, id)) * skillCdMult(p) : 1;
    el.querySelector('.cd').style.height = (cd > 0 ? Math.min(1, cd / max) * 100 : 0) + '%';
    const tb = document.querySelector(`[data-tbtn="s${i + 1}"]`);
    if (tb) { tb.textContent = name || (i + 1); tb.classList.toggle('cool', cd > 0); tb.style.display = id ? '' : 'none'; }
  }
  const dc = document.getElementById('dodgeCh');
  if (dc) dc.textContent = dodgeMax(p) > 1 ? '×' + p.dodgeCh : '';
}
