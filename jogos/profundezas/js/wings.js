// =============================================================
// Asas: caem dos chefes e transformam a esquiva num voo
// 0 Morcego · 1 Pedra · 2 Escama · 3 Espectrais · 4 Fogo · 5 Abissais (todas)
// =============================================================
'use strict';

function wingIdx(p) { return p && p.eq && p.eq.wings ? p.eq.wings.wing : -1; }
function wingHas(p, i) { const w = wingIdx(p); return w === i || w >= 5; }

const FLY_TIME = 0.3;
function flyTime(p) { return wingHas(p, 0) ? 0.42 : FLY_TIME; }

// Chamado quando o herói aperta a esquiva
function startDodge(p, dx, dy) {
  const d = Math.hypot(dx, dy) || 1;
  if (wingIdx(p) >= 0) {
    const sp = wingHas(p, 0) ? 240 : 205;
    p.vx = dx / d * sp; p.vy = dy / d * sp;
    p.dodgeT = flyTime(p); p.flyT = p.dodgeT; p.flyHit = new Set();
    p.dodgeCd = 0.22;
    if (wingHas(p, 2)) { const st = playerStats(p), k = wingIdx(p) === 6 ? 0.06 : 0.03; p.hp = Math.min(st.maxHp, p.hp + st.maxHp * k); addText(p.x, p.y - 18, '+' + Math.round(st.maxHp * k), '#5eead4', 0.6); }
    Sfx.flap();
  } else {
    p.vx = dx / d * 230; p.vy = dy / d * 230;
    p.dodgeT = 0.17; p.dodgeCd = 0.22; p.flyT = 0;
    Sfx.dash();
  }
  if (p.dodgeCh >= dodgeMax(p)) p.dodgeRecT = dodgeRecharge(p);
  p.dodgeCh--;
}

// Durante o voo (chamado a cada quadro enquanto dodgeT > 0)
function updateFlight(p, dt) {
  if (!p.flyT) return;
  const w = WINGS[wingIdx(p)] || WINGS[0];
  if (Math.random() < 0.7) G.particles.push({ x: p.x + rr(-6, 6), y: p.y - rr(6, 12), vx: rr(-8, 8), vy: rr(4, 14), t: 0.35, color: w.edge });
  if (wingHas(p, 4)) { // asas de fogo: rastro que queima
    G.particles.push({ x: p.x + rr(-3, 3), y: p.y - rr(0, 2), vx: 0, vy: -rr(8, 20), t: 0.5, color: Math.random() < 0.5 ? '#f97316' : '#fde047' });
    const st = playerStats(p);
    for (const e of G.enemies) {
      if (e.dead || e.isProp || e.hidden || p.flyHit.has(e)) continue;
      if (dist(p.x, p.y, e.x, e.y) < 14 + e.r) {
        p.flyHit.add(e);
        const dmg = st.weaponDmg * st.dmgMul * 0.6;
        e.hurt(dmg, p.x, p.y, false);
        e.poisonT = 2.5; e.poisonDps = dmg * 0.35;
      }
    }
  }
  if (p.dodgeT - dt <= 0) land(p);
}
function land(p) {
  p.flyT = 0;
  if (wingHas(p, 1)) { p.stoneT = 2; G.effects.push({ type: 'ring', x: p.x, y: p.y - 4, r: 4, max: 16, t: 0.3, color: '#d6d3d1' }); }
  burst(p.x, p.y, '#cbd5e1', 5);
}

// Asas desenhadas nas costas (origem: entre os ombros)
function drawWings(ctx, wi, t, flying) {
  const w = WINGS[wi] || WINGS[0];
  const flap = flying ? Math.sin(t * 30) : Math.sin(t * 3) * 0.35;
  const spread = flying ? 0.75 + 0.35 * flap : 0.8 + 0.12 * flap;
  const lift = Math.round(flying ? -flap * 2 : -flap);
  const rows = wi === 1 ? [7, 8, 8, 6, 4] : wi === 3 ? [8, 9, 9, 8, 6, 4, 2] : [8, 9, 9, 8, 6, 3];
  const dark = shade(w.color, -35);
  for (const side of [-1, 1]) {
    rows.forEach((len, i) => {
      const L = Math.max(1, Math.round(len * spread));
      const y = -4 + i + lift + (i === 0 ? 0 : Math.round((1 - spread) * i * 0.5));
      for (let k = 0; k < L; k++) {
        const x = side > 0 ? 2 + k : -3 - k;
        ctx.fillStyle = k === L - 1 || i === 0 ? w.edge : (wi === 0 || wi === 5) && i > 2 && k % 2 ? dark : w.color;
        if (wi === 3) ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 4 + k);
        ctx.fillRect(x, y - (k >= 6 ? 2 : k >= 3 ? 1 : 0) - (flying && k >= 4 ? Math.round(flap) : 0), 1, 1);
      }
    });
    if (wi >= 4) { // brilho
      ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 9);
      ctx.fillStyle = wi === 4 ? '#fde047' : wi === 6 ? '#ffffff' : '#f43f5e';
      ctx.fillRect(side > 0 ? 2 + Math.round(7 * spread) : -3 - Math.round(7 * spread), -3 + lift, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
}

// Chefes deixam asas: a primeira vitória garante as asas daquele chefe
function bossWingDrop(f, first) {
  const biomeWing = Math.min(4, Math.max(0, Math.floor((((f - 1) % MAX_FLOOR) + 1) / 10) - 1));
  if (first && f <= MAX_FLOOR) return makeWings(biomeWing, f);
  if (Math.random() < (f > MAX_FLOOR ? 0.3 : 0.15)) return makeWings(f > MAX_FLOOR && Math.random() < 0.5 ? 5 : biomeWing, f);
  return null;
}
