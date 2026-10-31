// =============================================================
// Habilidades: 3 ramos (Guerreiro, Caçador, Arcano), 3 habilidades
// cada, até o nível 3. Um ponto de habilidade a cada 5 níveis.
// Atalhos 1, 2 e 3 (ou botões na tela de toque).
// =============================================================
'use strict';

const SKILL_TREES = [
  { id: 'guerreiro', name: 'Guerreiro', color: '#f87171' },
  { id: 'cacador',   name: 'Caçador',   color: '#4ade80' },
  { id: 'arcano',    name: 'Arcano',    color: '#a78bfa' },
];

const SKILLS = {
  giro: {
    tree: 'guerreiro', name: 'Golpe Giratório', short: 'GIRO', cd: () => 6,
    desc: r => `Gira a arma e atinge todos ao seu redor com ${150 + 40 * (r - 1)}% do dano.`,
  },
  investida: {
    tree: 'guerreiro', name: 'Investida', short: 'INV', cd: () => 5,
    desc: r => `Avança correndo, invulnerável, e acerta quem estiver no caminho com ${120 + 30 * (r - 1)}% do dano.`,
  },
  escudo: {
    tree: 'guerreiro', name: 'Escudo de Pedra', short: 'ESC', cd: () => 14,
    desc: r => `Por 4 segundos, reduz em ${50 + 10 * (r - 1)}% todo o dano recebido.`,
  },
  flechas: {
    tree: 'cacador', name: 'Tiro Múltiplo', short: 'ARCO', cd: () => 3,
    desc: r => `Dispara ${3 + 2 * (r - 1)} flechas em leque, cada uma com 90% do dano.`,
  },
  armadilha: {
    tree: 'cacador', name: 'Armadilha', short: 'ARM', cd: () => 7,
    desc: r => `Arma uma armadilha que explode quando um inimigo pisa: ${200 + 60 * (r - 1)}% do dano em área. Até 3 de uma vez.`,
  },
  rolamento: {
    tree: 'cacador', name: 'Rolamento Duplo', short: '', passive: true, cd: () => 0,
    desc: r => `Passiva: a esquiva ganha 2 cargas e recarrega ${15 + 10 * (r - 1)}% mais rápido.`,
  },
  fogo: {
    tree: 'arcano', name: 'Bola de Fogo', short: 'FOGO', cd: () => 4,
    desc: r => `Lança uma bola de fogo que explode em área com ${180 + 50 * (r - 1)}% do dano.`,
  },
  raio: {
    tree: 'arcano', name: 'Raio em Cadeia', short: 'RAIO', cd: () => 5,
    desc: r => `Um raio salta entre ${3 + (r - 1)} inimigos próximos, com 120% do dano em cada.`,
  },
  teleporte: {
    tree: 'arcano', name: 'Teleporte', short: 'TELE', cd: r => 6 - (r - 1),
    desc: r => `Teleporta até 80 pixels na direção da mira, invulnerável por um instante. Recarga de ${6 - (r - 1)} s.`,
  },
};

function skillRank(p, id) { return (p.skills && p.skills[id]) || 0; }
function skillPointsSpent(p) { return Object.values(p.skills || {}).reduce((a, b) => a + b, 0); }

// Garante os campos de habilidade (inclusive em jogos salvos antes da v0.3)
function ensureSkills(p) {
  if (!p.skills) p.skills = {};
  if (!Array.isArray(p.slots)) p.slots = [null, null, null];
  const expected = Math.floor(p.level / 5);
  const have = skillPointsSpent(p) + (p.skillPts || 0);
  if (have < expected) p.skillPts = (p.skillPts || 0) + (expected - have);
  if (!p.skillPts) p.skillPts = 0;
}

function learnSkill(p, id) {
  const r = skillRank(p, id);
  if (p.skillPts <= 0 || r >= 3) return false;
  p.skills[id] = r + 1;
  p.skillPts--;
  if (r === 0 && !SKILLS[id].passive && !p.slots.includes(id)) {
    const free = p.slots.indexOf(null);
    if (free >= 0) p.slots[free] = id;
  }
  return true;
}

function dodgeMax(p) { return skillRank(p, 'rolamento') ? 2 : 1; }
function dodgeRecharge(p) { const r = skillRank(p, 'rolamento'); return 0.75 * (r ? 1 - (0.15 + 0.1 * (r - 1)) : 1); }

// Direção da mira: mouse (se usado há pouco) ou para onde o herói olha
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

function useSkill(slot) {
  const p = G.p;
  const id = p.slots[slot];
  if (!id) { UI.toast('Atalho vazio. Aprenda habilidades com a tecla H.', '#9ca3af'); return; }
  const r = skillRank(p, id);
  if (!r) return;
  if ((p.skillCd[id] || 0) > 0) return;
  const st = playerStats(p);
  const base = st.weaponDmg * st.dmgMul;
  const a = aimAngle();
  const cx = p.x, cy = p.y - 5;
  p.skillCd[id] = SKILLS[id].cd(r);
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
  } else if (id === 'flechas') {
    const n = 3 + 2 * (r - 1), spread = 0.16;
    for (let i = 0; i < n; i++) {
      const aa = a + (i - (n - 1) / 2) * spread;
      G.projectiles.push(new Projectile(cx, cy, Math.cos(aa) * 230, Math.sin(aa) * 230, base * 0.9, true, '#d9f99d', 2, { life: 1.2 }));
    }
    Sfx.shoot();
  } else if (id === 'armadilha') {
    G.traps.push({ x: p.x, y: p.y, arm: 0.5, life: 30, dmg: base * (2 + 0.6 * (r - 1)) });
    while (G.traps.length > 3) G.traps.shift();
    Sfx.chest();
  } else if (id === 'fogo') {
    G.projectiles.push(new Projectile(cx, cy, Math.cos(a) * 170, Math.sin(a) * 170, base * (1.8 + 0.5 * (r - 1)), true, '#f97316', 5, { explode: 30, life: 1.5 }));
    Sfx.shoot();
  } else if (id === 'raio') {
    const hits = [];
    let from = { x: cx, y: cy }, range = 130;
    for (let k = 0; k < 3 + (r - 1); k++) {
      let best = null, bd = range;
      for (const e of G.enemies) {
        if (e.dead || e.hidden || hits.includes(e)) continue;
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
  }
}

function updateSkills(dt) {
  const p = G.p;
  for (const id in p.skillCd) if (p.skillCd[id] > 0) p.skillCd[id] = Math.max(0, p.skillCd[id] - dt);
  if (p.shieldT > 0) p.shieldT -= dt;
  if (p.spin > 0) p.spin -= dt;
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
  // armadilhas
  for (const tr of G.traps) {
    tr.life -= dt;
    if (tr.arm > 0) { tr.arm -= dt; continue; }
    for (const e of G.enemies) {
      if (!e.dead && !e.hidden && dist(tr.x, tr.y, e.x, e.y) < 12 + e.r) { tr.boom = true; break; }
    }
    if (tr.boom) areaDamage(tr.x, tr.y - 3, 32, tr.dmg, '#facc15');
  }
  G.traps = G.traps.filter(tr => !tr.boom && tr.life > 0);
  // atalhos
  if (Input.hit('1') || Input.tb('s1')) useSkill(0);
  if (Input.hit('2') || Input.tb('s2')) useSkill(1);
  if (Input.hit('3') || Input.tb('s3')) useSkill(2);
}

function drawSkillsWorld(ctx) {
  const p = G.p;
  for (const tr of G.traps) {
    const x = Math.round(tr.x), y = Math.round(tr.y);
    ctx.fillStyle = tr.arm > 0 ? '#78716c' : '#a16207';
    ctx.fillRect(x - 5, y - 2, 10, 3);
    ctx.fillStyle = tr.arm > 0 ? '#57534e' : (Math.sin(G.time * 8) > 0 ? '#facc15' : '#ca8a04');
    ctx.fillRect(x - 1, y - 3, 2, 2);
    ctx.fillStyle = '#d6d3d1';
    for (let i = -4; i <= 4; i += 2) ctx.fillRect(x + i, y - 4, 1, 2);
  }
  if (p.shieldT > 0) {
    ctx.strokeStyle = `rgba(168,162,158,${0.5 + Math.sin(G.time * 8) * 0.2})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y - 6, 11, 0, Math.PI * 2); ctx.stroke();
  }
  if (p.spin > 0) {
    const k = 1 - p.spin / 0.3;
    ctx.strokeStyle = `rgba(255,255,255,${0.8 - k * 0.6})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y - 5, 26, k * Math.PI * 4, k * Math.PI * 4 + 4); ctx.stroke();
  }
}

// ---------- Painel de habilidades ----------
UI.skills = function (ctx) {
  const p = G.p;
  ensureSkills(p);
  const cols = SKILL_TREES.map(tree => {
    const cards = Object.entries(SKILLS).filter(([, s]) => s.tree === tree.id).map(([id, s]) => {
      const r = skillRank(p, id);
      const dots = [1, 2, 3].map(i => `<i class="${i <= r ? 'on' : ''}"></i>`).join('');
      const canLearn = p.skillPts > 0 && r < 3;
      const slotBtns = (!s.passive && r > 0) ? `<div class="slots">${[0, 1, 2].map(i =>
        `<button data-act="slot" data-arg="${id}:${i}" class="${p.slots[i] === id ? 'cur' : ''}">${i + 1}</button>`).join('')}</div>` : '';
      return `<div class="sk ${r ? 'has' : ''}">
        <div class="skh"><b>${s.name}</b><span class="dots">${dots}</span></div>
        <p>${s.desc(Math.max(1, r))}${r > 0 && r < 3 ? `<br><small>Próximo nível: ${s.desc(r + 1)}</small>` : ''}</p>
        <div class="skf">
          ${canLearn ? `<button data-act="learn" data-arg="${id}" class="learn">${r ? 'Melhorar' : 'Aprender'}</button>` : `<span class="note">${r >= 3 ? 'Nível máximo' : s.passive ? 'Passiva' : ''}</span>`}
          ${slotBtns}
        </div>
      </div>`;
    }).join('');
    return `<div class="tree" style="--tc:${tree.color}"><h3>${tree.name}</h3>${cards}</div>`;
  }).join('');
  const slotsLine = p.slots.map((id, i) => `<span>${i + 1}: ${id ? SKILLS[id].name : '—'}</span>`).join('');
  const html = `
    <div class="invhead"><h2>Habilidades</h2><span class="gold">${p.skillPts} ${p.skillPts === 1 ? 'ponto' : 'pontos'}</span><button class="x" data-act="close">✕</button></div>
    <p class="mtext">Você ganha um ponto a cada 5 níveis. Cada habilidade vai até o nível 3. Use as teclas 1, 2 e 3 na masmorra.</p>
    <div class="trees">${cols}</div>
    <p class="slotsline">${slotsLine}</p>`;
  const back = () => { this.close(); if (ctx === 'village') villageMenu(); };
  this.show(html, {
    cls: 'skillsp',
    onBack: back,
    actions: {
      close: back,
      learn: id => { if (learnSkill(p, id)) { Sfx.level(); saveGame(); } this.skills(ctx); },
      slot: arg => {
        const [id, i] = arg.split(':');
        const old = p.slots.indexOf(id);
        if (old >= 0) p.slots[old] = p.slots[+i];
        p.slots[+i] = id;
        saveGame(); this.skills(ctx);
      },
    },
  });
  this.keyHook = e => { if (e.key.toLowerCase() === 'h') { e.preventDefault(); back(); return true; } return false; };
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
    const cd = id ? (p.skillCd[id] || 0) : 0;
    const max = id ? SKILLS[id].cd(skillRank(p, id)) : 1;
    el.querySelector('.cd').style.height = (cd > 0 ? (cd / max) * 100 : 0) + '%';
    const tb = document.querySelector(`[data-tbtn="s${i + 1}"]`);
    if (tb) { tb.textContent = name || (i + 1); tb.classList.toggle('cool', cd > 0); tb.style.display = id ? '' : 'none'; }
  }
  const dc = document.getElementById('dodgeCh');
  if (dc) dc.textContent = dodgeMax(p) > 1 ? '×' + p.dodgeCh : '';
}
