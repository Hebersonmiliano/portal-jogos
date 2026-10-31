// =============================================================
// Arte dos biomas: decoração das salas, tochas animadas,
// iluminação com várias fontes de luz e partículas de ambiente.
// =============================================================
'use strict';

// Cor e tipo de luz das paredes de cada bioma
const BIOME_ART = [
  { torch: '#fb923c', glow: '255,150,60',  dark: 0.9,  amb: 'drip',   ambColor: '#7dd3fc' },  // Cavernas
  { torch: '#fbbf24', glow: '255,200,80',  dark: 0.93, amb: 'dust',   ambColor: '#a8a29e' },  // Minas
  { torch: '#5eead4', glow: '94,234,212',  dark: 0.88, amb: 'bubble', ambColor: '#99f6e4' },  // Ruínas (cristais)
  { torch: '#a78bfa', glow: '167,139,250', dark: 0.9,  amb: 'mist',   ambColor: '#e9d5ff' },  // Cripta (chama fantasma)
  { torch: '#f97316', glow: '255,110,30',  dark: 0.88, amb: 'ember',  ambColor: '#fb923c' },  // Abismo
];

// ---------- Decora o andar (desenha no mapa já pronto) ----------
function decorateFloor(L) {
  const x = G.floorCanvas.getContext('2d');
  const m = L.map, bi = L.biome.idx || 0, art = BIOME_ART[bi];
  L.lights = []; L.torches = [];
  const floorAt = (tx, ty) => tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H && m[ty * MAP_W + tx] === 1;
  const busy = new Set();
  const nearKey = (tx, ty) => busy.has(tx + ',' + ty);
  const avoid = [L.start, L.stairs].filter(Boolean).map(o => ({ tx: Math.floor(o.x / TILE), ty: Math.floor(o.y / TILE) }));
  const freeTile = (tx, ty) => floorAt(tx, ty) && !nearKey(tx, ty) && !avoid.some(a => Math.abs(a.tx - tx) < 2 && Math.abs(a.ty - ty) < 2);

  // tochas / cristais nas paredes (face da parede com chão embaixo)
  let last = -99;
  for (let ty = 1; ty < MAP_H - 1; ty++) for (let tx = 1; tx < MAP_W - 1; tx++) {
    if (m[ty * MAP_W + tx] !== 0 || !floorAt(tx, ty + 1)) continue;
    if (Math.random() < 0.09 && (ty * MAP_W + tx) - last > 4) {
      last = ty * MAP_W + tx;
      const t = { x: tx * TILE + 8, y: ty * TILE + 7, color: art.torch, phase: Math.random() * 6 };
      L.torches.push(t);
      L.lights.push({ x: t.x, y: t.y + 10, r: 54, color: art.glow, flicker: true, phase: t.phase });
      // suporte da tocha desenhado no mapa
      x.fillStyle = '#3f2a14'; x.fillRect(tx * TILE + 7, ty * TILE + 8, 2, 5);
      x.fillStyle = '#57534e'; x.fillRect(tx * TILE + 6, ty * TILE + 12, 4, 1);
    }
  }

  // decoração do chão
  const count = 190 + ri(60);
  for (let n = 0; n < count; n++) {
    const tx = 1 + ri(MAP_W - 2), ty = 1 + ri(MAP_H - 2);
    if (!freeTile(tx, ty)) continue;
    busy.add(tx + ',' + ty);
    const px = tx * TILE, py = ty * TILE, r = Math.random();
    if (bi === 0) { // Cavernas: cogumelos (alguns brilham), musgo, poças
      if (r < 0.35) {
        const glow = Math.random() < 0.35;
        const cap = glow ? '#38bdf8' : pick(['#b91c1c', '#a16207', '#78350f']);
        for (let k = 0; k < 1 + ri(3); k++) {
          const ox = px + 3 + ri(9), oy = py + 6 + ri(6);
          x.fillStyle = '#e7e5e4'; x.fillRect(ox + 1, oy, 1, 3);
          x.fillStyle = cap; x.fillRect(ox, oy - 2, 3, 2);
          if (!glow) { x.fillStyle = '#fef3c7'; x.fillRect(ox + 1, oy - 2, 1, 1); }
        }
        if (glow) L.lights.push({ x: px + 8, y: py + 8, r: 28, color: '56,189,248', soft: true });
      } else if (r < 0.7) { x.fillStyle = 'rgba(77,124,58,0.55)'; for (let k = 0; k < 7; k++) x.fillRect(px + ri(14), py + ri(14), 2 + ri(3), 1); }
      else { x.fillStyle = 'rgba(30,58,90,0.6)'; x.beginPath(); x.ellipse(px + 8, py + 9, 6, 3, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = 'rgba(125,211,252,0.35)'; x.fillRect(px + 5, py + 8, 3, 1); }
    } else if (bi === 1) { // Minas: trilhos, caixotes, entulho, lanternas
      if (r < 0.3 && floorAt(tx + 1, ty) && floorAt(tx - 1, ty)) {
        x.fillStyle = '#5a3a1e'; for (let k = 0; k < 4; k++) x.fillRect(px + k * 4, py + 5, 2, 7);
        x.fillStyle = '#9ca3af'; x.fillRect(px, py + 6, 16, 1); x.fillRect(px, py + 10, 16, 1);
      } else if (r < 0.5) {
        x.fillStyle = '#7c4a1e'; x.fillRect(px + 3, py + 3, 10, 10); x.fillStyle = '#5a3412'; x.fillRect(px + 3, py + 3, 10, 1); x.fillRect(px + 3, py + 7, 10, 1); x.fillRect(px + 7, py + 3, 1, 10);
      } else if (r < 0.8) { x.fillStyle = '#57534e'; for (let k = 0; k < 5; k++) x.fillRect(px + ri(13), py + 4 + ri(10), 2 + ri(2), 2); }
      else {
        x.fillStyle = '#44403c'; x.fillRect(px + 6, py + 6, 4, 6); x.fillStyle = '#fde047'; x.fillRect(px + 7, py + 7, 2, 3);
        L.lights.push({ x: px + 8, y: py + 8, r: 40, color: '255,210,90', flicker: true, phase: Math.random() * 6 });
      }
    } else if (bi === 2) { // Ruínas: poças, algas, colunas quebradas, algas que brilham
      if (r < 0.3) { x.fillStyle = 'rgba(20,184,166,0.28)'; x.fillRect(px + 1, py + 2, 14, 12); x.fillStyle = 'rgba(153,246,228,0.35)'; x.fillRect(px + 2, py + 3, 6, 1); }
      else if (r < 0.55) { x.fillStyle = '#166534'; for (let k = 0; k < 3; k++) { const ox = px + 3 + k * 4; x.fillRect(ox, py + 6 + (k % 2), 1, 8); x.fillRect(ox + 1, py + 8, 1, 3); } }
      else if (r < 0.75) { x.fillStyle = '#94a3b8'; x.fillRect(px + 4, py + 6, 8, 8); x.fillStyle = '#cbd5e1'; x.fillRect(px + 4, py + 6, 8, 2); x.fillStyle = '#64748b'; x.fillRect(px + 9, py + 4, 3, 2); }
      else {
        x.fillStyle = '#5eead4'; for (let k = 0; k < 4; k++) x.fillRect(px + 3 + ri(10), py + 4 + ri(9), 1, 2);
        L.lights.push({ x: px + 8, y: py + 8, r: 26, color: '94,234,212', soft: true });
      }
    } else if (bi === 3) { // Cripta: ossos, crânios, velas, teias, caixões
      if (r < 0.35) { x.fillStyle = '#d6d3c4'; x.fillRect(px + 3, py + 9, 6, 1); x.fillRect(px + 2, py + 8, 1, 3); x.fillRect(px + 9, py + 8, 1, 3); if (Math.random() < 0.5) { x.fillRect(px + 10, py + 4, 4, 3); x.fillStyle = '#292524'; x.fillRect(px + 11, py + 5, 1, 1); x.fillRect(px + 13, py + 5, 1, 1); } }
      else if (r < 0.6) {
        x.fillStyle = '#e7e5e4'; x.fillRect(px + 7, py + 7, 2, 5); x.fillStyle = '#c084fc'; x.fillRect(px + 7, py + 5, 2, 2);
        L.lights.push({ x: px + 8, y: py + 7, r: 30, color: '216,180,254', flicker: true, phase: Math.random() * 6 });
      } else if (r < 0.75 && floorAt(tx + 1, ty)) {
        x.fillStyle = '#44403c'; x.fillRect(px + 2, py + 4, 26, 9); x.fillStyle = '#57534e'; x.fillRect(px + 3, py + 5, 24, 7); x.fillStyle = '#78716c'; x.fillRect(px + 13, py + 6, 1, 5); x.fillRect(px + 11, py + 8, 5, 1);
        busy.add((tx + 1) + ',' + ty);
      } else { x.strokeStyle = 'rgba(229,231,235,0.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 10, py + 8); x.moveTo(px + 6, py); x.lineTo(px + 4, py + 10); x.moveTo(px, py + 6); x.lineTo(px + 9, py + 3); x.stroke(); }
    } else { // Abismo: rachaduras de lava, obsidiana, correntes
      if (r < 0.4) {
        x.fillStyle = '#7c2d12'; let cx = px + 1, cy = py + 4 + ri(8);
        for (let k = 0; k < 7; k++) { x.fillRect(cx, cy, 3, 2); cx += 2; cy += ri(3) - 1; }
        x.fillStyle = '#fb923c'; cx = px + 2; cy = py + 5 + ri(6);
        for (let k = 0; k < 6; k++) { x.fillRect(cx, cy, 2, 1); cx += 2; cy += ri(3) - 1; }
        L.lights.push({ x: px + 8, y: py + 8, r: 34, color: '255,110,30', flicker: true, phase: Math.random() * 6 });
      } else if (r < 0.7) { x.fillStyle = '#1c1917'; x.fillRect(px + 5, py + 6, 4, 7); x.fillRect(px + 9, py + 9, 3, 4); x.fillStyle = '#57534e'; x.fillRect(px + 5, py + 6, 1, 3); }
      else { x.fillStyle = '#44403c'; for (let k = 0; k < 6; k++) x.fillRect(px + 2 + k * 2, py + 7 + (k % 2), 2, 2); }
    }
  }
  // luz das fogueiras e da escada
  for (const pr of G.props) if (pr.type === 'campfire') L.lights.push({ x: pr.x, y: pr.y - 4, r: 70, color: '255,140,40', flicker: true, phase: 0, prop: pr });
}

// ---------- Tochas animadas ----------
function drawTorches(ctx) {
  const L = G.level;
  if (!L.torches) return;
  const t = G.time;
  for (const tc of L.torches) {
    if (Math.abs(tc.x - G.p.x) > G.viewW || Math.abs(tc.y - G.p.y) > G.viewH) continue;
    const f = Math.sin(t * 14 + tc.phase) * 0.5 + 0.5;
    const x = Math.round(tc.x), y = Math.round(tc.y);
    ctx.fillStyle = tc.color; ctx.fillRect(x - 2, y - 2 - Math.round(f), 4, 4 + Math.round(f));
    ctx.fillStyle = '#fef3c7'; ctx.fillRect(x - 1, y - 1, 2, 2);
    if (Math.random() < 0.06) G.particles.push({ x: x + rr(-1, 1), y: y - 3, vx: rr(-4, 4), vy: -rr(10, 22), t: 0.5, color: tc.color });
  }
}

// ---------- Partículas de ambiente ----------
function updateAmbient(dt) {
  const L = G.level, art = BIOME_ART[L.biome.idx || 0];
  G.ambient = G.ambient || [];
  const want = art.amb === 'mist' ? 14 : 40;
  if (G.ambient.length < want && Math.random() < dt * 30) {
    const x = G.cam.x + Math.random() * G.viewW, y = G.cam.y + Math.random() * G.viewH;
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (L.map[ty * MAP_W + tx] === 1) {
      const a = { x, y, t: 0, life: rr(1.5, 3.5), kind: art.amb, color: art.ambColor };
      if (a.kind === 'drip') { a.vy = 90; a.vx = 0; a.y = y - 30; a.life = 0.6; }
      else if (a.kind === 'dust') { a.vx = rr(-6, 6); a.vy = rr(-3, 3); }
      else if (a.kind === 'bubble') { a.vx = rr(-3, 3); a.vy = -rr(8, 18); }
      else if (a.kind === 'mist') { a.vx = rr(4, 10) * (Math.random() < 0.5 ? -1 : 1); a.vy = 0; a.life = rr(3, 5); a.w = 12 + ri(14); }
      else { a.vx = rr(-6, 6); a.vy = -rr(10, 25); }
      G.ambient.push(a);
    }
  }
  for (const a of G.ambient) { a.t += dt; a.x += a.vx * dt; a.y += a.vy * dt; if (a.kind === 'ember') a.vx += Math.sin(a.t * 4) * 8 * dt; }
  G.ambient = G.ambient.filter(a => a.t < a.life);
}
function drawAmbient(ctx) {
  for (const a of G.ambient || []) {
    const k = a.t / a.life, fade = Math.min(1, k * 4, (1 - k) * 4);
    ctx.globalAlpha = fade * (a.kind === 'mist' ? 0.07 : a.kind === 'dust' ? 0.5 : 0.75);
    ctx.fillStyle = a.color;
    if (a.kind === 'mist') { ctx.beginPath(); ctx.ellipse(a.x, a.y, a.w, a.w * 0.35, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(a.x + a.w * 0.4, a.y - 2, a.w * 0.6, a.w * 0.25, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (a.kind === 'drip') ctx.fillRect(Math.round(a.x), Math.round(a.y), 1, 2);
    else if (a.kind === 'bubble') { ctx.fillRect(Math.round(a.x), Math.round(a.y), 1, 1); ctx.fillRect(Math.round(a.x) + 1, Math.round(a.y) - 1, 1, 1); }
    else ctx.fillRect(Math.round(a.x), Math.round(a.y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

// ---------- Iluminação: escuridão com várias fontes de luz ----------
let _lightCanvas = null;
function drawLighting(ctx) {
  const L = G.level, p = G.p, s = G.scale, art = BIOME_ART[L.biome.idx || 0];
  const W = G.canvas.width, H = G.canvas.height;
  if (!_lightCanvas || _lightCanvas.width !== W || _lightCanvas.height !== H) {
    _lightCanvas = document.createElement('canvas'); _lightCanvas.width = W; _lightCanvas.height = H;
  }
  const lc = _lightCanvas.getContext('2d');
  lc.globalCompositeOperation = 'source-over';
  lc.clearRect(0, 0, W, H);
  lc.fillStyle = `rgba(0,0,0,${art.dark})`;
  lc.fillRect(0, 0, W, H);
  lc.globalCompositeOperation = 'destination-out';
  const hole = (wx, wy, r, strength) => {
    const sx = (wx - G.cam.x) * s, sy = (wy - G.cam.y) * s, rr2 = r * s;
    if (sx < -rr2 || sy < -rr2 || sx > W + rr2 || sy > H + rr2) return;
    const g = lc.createRadialGradient(sx, sy, rr2 * 0.15, sx, sy, rr2);
    g.addColorStop(0, `rgba(0,0,0,${strength})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    lc.fillStyle = g; lc.fillRect(sx - rr2, sy - rr2, rr2 * 2, rr2 * 2);
  };
  hole(p.x, p.y - 6, L.biome.light * 1.05, 1);
  const visible = (L.lights || []).filter(l => !(l.prop && l.prop.used) && Math.abs(l.x - p.x) < G.viewW && Math.abs(l.y - p.y) < G.viewH);
  for (const l of visible) {
    const f = l.flicker ? 0.9 + Math.sin(G.time * 11 + l.phase) * 0.06 + Math.sin(G.time * 23 + l.phase) * 0.04 : 1;
    hole(l.x, l.y, l.r * f, l.soft ? 0.55 : 0.85);
  }
  for (const pr of G.projectiles) if (pr.explode || pr.color === '#f97316' || pr.color === '#fb923c') hole(pr.x, pr.y, 26, 0.7);
  for (const h of G.hazards) if (h.dur > 0 && h.kind === 'lava') hole(h.x, h.y, h.r * 1.6, 0.8);
  lc.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(_lightCanvas, 0, 0);
  // brilho colorido das luzes
  ctx.globalCompositeOperation = 'lighter';
  for (const l of visible) {
    const f = l.flicker ? 0.85 + Math.sin(G.time * 9 + l.phase) * 0.15 : 1;
    const sx = (l.x - G.cam.x) * s, sy = (l.y - G.cam.y) * s, r = l.r * 0.8 * s;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(${l.color},${(l.soft ? 0.1 : 0.16) * f})`); g.addColorStop(1, `rgba(${l.color},0)`);
    ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
}
