// =============================================================
// Recursos dos mapas: armadilhas de espinho, barris explosivos,
// sala secreta, santuário, mercador errante e sala de desafio.
// =============================================================
'use strict';

const BLESSINGS = {
  forca:   { name: 'Bênção da Força',   desc: '+25% de dano neste andar.' },
  vigor:   { name: 'Bênção do Vigor',   desc: 'Recupera vida aos poucos neste andar.' },
  fortuna: { name: 'Bênção da Fortuna', desc: '+10 de sorte neste andar.' },
  rapidez: { name: 'Bênção da Rapidez', desc: '+15% de velocidade neste andar.' },
};
function blessing(id) { return G.state === 'dungeon' && G.blessing === id ? 1 : 0; }

// ---------- Barril explosivo (fica na lista de inimigos para levar golpes) ----------
class Barrel {
  constructor(x, y, floor) {
    this.x = x; this.y = y; this.floor = floor;
    this.r = 6; this.hw = 4; this.hh = 3;
    this.hp = 1; this.maxHp = 1;
    this.isProp = true; this.fuse = 0; this.dead = false; this.flash = 0;
    this.dmg = 22 * (1 + 0.15 * (floor - 1));
    this.name = 'Barril';
  }
  update(dt) {
    if (this.flash > 0) this.flash -= dt;
    if (this.fuse > 0) {
      this.fuse -= dt;
      if (this.fuse <= 0) {
        this.dead = true;
        G.shake = Math.max(G.shake, 5);
        const p = G.p;
        if (dist(this.x, this.y, p.x, p.y) < 34) hurtPlayer(this.dmg * 0.5, null);
        areaDamage(this.x, this.y - 4, 34, this.dmg, '#f97316');
      }
    }
  }
  hurt() {
    if (this.fuse > 0 || this.dead) return;
    this.fuse = 0.35; this.flash = 0.35;
    Sfx.click();
  }
  draw(ctx) {
    const x = Math.round(this.x), y = Math.round(this.y);
    const blink = this.fuse > 0 && Math.sin(G.time * 50) > 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - 5, y - 1, 10, 2);
    ctx.fillStyle = blink ? '#ffffff' : '#7c4a1e'; ctx.fillRect(x - 5, y - 12, 10, 12);
    ctx.fillStyle = blink ? '#fecaca' : '#5a3412'; ctx.fillRect(x - 5, y - 9, 10, 1); ctx.fillRect(x - 5, y - 4, 10, 1);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(x - 2, y - 8, 4, 3);
    ctx.fillStyle = '#fde047'; ctx.fillRect(x - 1, y - 7, 2, 1);
  }
}

// ---------- Monta os recursos de um andar ----------
function placeFeatures(L, floor) {
  const others = L.rooms.filter(r => r !== L.startRoom && r !== L.stairsRoom);
  // barris
  const nb = L.isBoss ? 0 : 2 + ri(4);
  for (let i = 0; i < nb && others.length; i++) {
    const pt = randomPointIn(pick(others), 1);
    G.enemies.push(new Barrel(pt.x, pt.y, floor));
  }
  // espinhos (a partir do andar 2), em grupos dentro das salas
  if (!L.isBoss && floor >= 2) {
    const groups = 2 + ri(3);
    for (let g = 0; g < groups && others.length; g++) {
      const pt = randomPointIn(pick(others), 1);
      const tx = Math.floor(pt.x / TILE), ty = Math.floor(pt.y / TILE), phase = Math.random() * 2.4;
      for (let k = 0; k < 3 + ri(4); k++) {
        const x = tx + ri(3) - 1, y = ty + ri(3) - 1;
        if (L.map[y * MAP_W + x] !== 1 || G.spikes.some(s => s.tx === x && s.ty === y)) continue;
        G.spikes.push({ tx: x, ty: y, x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, phase, hitP: false });
      }
    }
  }
  // sala secreta: baú especial e ouro
  if (L.secret) {
    const s = L.secret;
    const cx = (s.x + s.w / 2) * TILE, cy = (s.y + s.h / 2) * TILE;
    G.chests.push({ x: cx - 10, y: cy, open: false, secret: true });
    G.chests.push({ x: cx + 10, y: cy, open: false, secret: true });
  }
  if (L.isBoss) return;
  // salas especiais (cada uma numa sala diferente)
  const pool = others.slice().sort(() => Math.random() - 0.5);
  const center = r => ({ x: Math.floor(r.x + r.w / 2) * TILE + TILE / 2, y: Math.floor(r.y + r.h / 2) * TILE + TILE / 2 });
  if (pool.length && Math.random() < 0.4) {
    const r = pool.pop(), c = center(r);
    G.props.push({ type: 'shrine', x: c.x, y: c.y, used: false });
  }
  if (pool.length && floor >= 3 && Math.random() < 0.35) {
    const r = pool.pop(), c = center(r);
    G.props.push({ type: 'merchant', x: c.x, y: c.y, item: genItem(floor, 1, null, 0), sold: false });
  }
  if (pool.length && floor >= 2 && Math.random() < 0.35) {
    const r = pool.pop(), c = center(r);
    G.props.push({ type: 'pedestal', x: c.x, y: c.y, used: false, room: r, wave: null });
    G.enemies = G.enemies.filter(e => e.isProp || dist(e.x, e.y, c.x, c.y) > 40);
  }
}

// ---------- Atualização ----------
function updateFeatures(dt) {
  const p = G.p;
  // espinhos: sobem por 0,8 s a cada 2,4 s
  for (const s of G.spikes) {
    const ph = (G.time + s.phase) % 2.4;
    const up = ph > 1.6;
    s.state = up ? 'up' : ph > 1.35 ? 'warn' : 'down';
    if (!up) { s.hitP = false; s.hitE = null; continue; }
    if (!s.hitP && Math.abs(p.x - s.x) < 8 && Math.abs(p.y - s.y) < 8) {
      s.hitP = true;
      hurtPlayer(6 * (1 + 0.12 * (G.level.floor - 1)), null);
    }
    if (!s.hitE) {
      s.hitE = true;
      for (const e of G.enemies) if (!e.dead && !e.isProp && !e.isBoss && e.ability !== 'phase' && e.type !== 'fast' && Math.abs(e.x - s.x) < 8 && Math.abs(e.y - s.y) < 8) e.hurt(e.maxHp * 0.25, s.x, s.y + 4, false);
    }
  }
  // bênção do vigor
  if (blessing('vigor')) { const st = playerStats(p); p.hp = Math.min(st.maxHp, p.hp + st.maxHp * 0.01 * dt); }
  // sala de desafio: quando todos caem, aparece a recompensa
  for (const pr of G.props) {
    if (pr.type !== 'pedestal' || !pr.wave || pr.done) continue;
    if (pr.wave.every(e => e.dead)) {
      pr.done = true;
      G.chests.push({ x: pr.x, y: pr.y + 18, open: false, secret: true });
      spawnGold(pr.x, pr.y + 10, 30 * (1 + 0.3 * (G.level.floor - 1)));
      UI.toast('Desafio vencido! Um baú especial apareceu.', '#facc15');
      Sfx.rare();
    }
  }
}

// Golpes na parede rachada (chamado pelo ataque do herói)
function hitSecretWall(aim) {
  const L = G.level, p = G.p;
  if (!L || !L.secret || L.secret.open) return;
  const g = L.secret.gate;
  for (const k of [10, 16]) {
    for (const yo of [0, -5]) {
      const tx = Math.floor((p.x + Math.cos(aim) * k) / TILE), ty = Math.floor((p.y + yo + Math.sin(aim) * k) / TILE);
      if (tx === g.x && ty === g.y) {
        L.secret.hits++;
        burst(g.x * TILE + 8, g.y * TILE + 10, '#a8a29e', 6);
        G.shake = Math.max(G.shake, 2);
        Sfx.hit();
        if (L.secret.hits >= 3) {
          L.secret.open = true;
          openSecret(L);
          burst(g.x * TILE + 8, g.y * TILE + 8, '#d6d3d1', 20);
          Sfx.boom();
          UI.toast('Você encontrou uma passagem secreta!', '#facc15');
        }
        return;
      }
    }
  }
}

// ---------- Interações (tecla E) ----------
function featureInteract(pr, interact) {
  const p = G.p;
  if (pr.type === 'shrine' && !pr.used) {
    if (interact) {
      pr.used = true;
      const ids = Object.keys(BLESSINGS), id = pick(ids);
      G.blessing = id;
      UI.toast(`${BLESSINGS[id].name}: ${BLESSINGS[id].desc}`, '#c4b5fd');
      G.effects.push({ type: 'ring', x: p.x, y: p.y - 6, r: 4, max: 30, t: 0.4, color: '#c4b5fd' });
      Sfx.level();
    }
    return '[E] Orar no santuário';
  }
  if (pr.type === 'merchant') {
    if (interact) merchantMenu(pr);
    return '[E] Falar com o mercador';
  }
  if (pr.type === 'pedestal' && !pr.used) {
    if (interact) {
      pr.used = true;
      const f = G.level.floor;
      pr.wave = [];
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2;
        const x = pr.x + Math.cos(a) * 40, y = pr.y + Math.sin(a) * 30;
        const pt = boxSolid(x, y, 4, 3) ? randomPointIn(pr.room, 1) : { x, y };
        const e = new Enemy(pick(['chaser', 'fast', 'tank', 'shooter']), f, pt.x, pt.y, { elite: Math.random() < 0.4 });
        e.aware = true; pr.wave.push(e); G.enemies.push(e);
        burst(pt.x, pt.y - 5, '#ef4444', 8);
      }
      UI.toast('Desafio aceito: derrote todos para ganhar um baú especial!', '#f87171');
      Sfx.boom();
    }
    return '[E] Aceitar o desafio';
  }
  return '';
}

function merchantMenu(pr) {
  const p = G.p, f = G.level.floor;
  const mult = 1.4;
  const items = ['potion', 'food', 'scroll'].map(k => {
    const c = CONSUMABLES[k], price = Math.round(c.price * mult);
    return {
      label: c.name, sub: c.desc, right: price + ' ◆', icon: itemIconURL({ kind: k }), disabled: p.gold < price,
      act: () => {
        if (!bagAdd(p.bag, p.bagSize, makeConsumable(k))) { UI.toast('Mochila cheia!', '#f87171'); return; }
        p.gold -= price; Sfx.gold(); merchantMenu(pr);
      },
    };
  });
  if (!pr.sold) {
    const it = pr.item, price = it.value * 4;
    items.push({
      label: itemDisplayName(it), color: RARITIES[it.rarity].color, icon: itemIconURL(it), sub: itemStatLines(it).slice(0, 2).join(' · '),
      right: price + ' ◆', disabled: p.gold < price,
      act: () => {
        if (!bagAdd(p.bag, p.bagSize, it)) { UI.toast('Mochila cheia!', '#f87171'); return; }
        p.gold -= price; pr.sold = true; Sfx.rare(); merchantMenu(pr);
      },
    });
  }
  UI.menu({
    title: 'Mercador Errante',
    text: `"Preços de profundeza, amigo. Aqui embaixo não tem concorrência." · ◆ ${p.gold}`,
    items, back: () => UI.close(),
  });
}

// ---------- Desenho ----------
function drawFeaturesFloor(ctx) {
  for (const s of G.spikes) {
    const x = s.tx * TILE, y = s.ty * TILE;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(x + 2 + i * 5, y + 2 + j * 5, 2, 2);
    if (s.state === 'warn') { ctx.fillStyle = '#9ca3af'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(x + 2 + i * 5, y + 2 + j * 5, 2, 1); }
    if (s.state === 'up') {
      ctx.fillStyle = '#d1d5db';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.fillRect(x + 2 + i * 5, y + j * 5, 2, 4); ctx.fillRect(x + 2 + i * 5 + 0.5, y - 1 + j * 5, 1, 1); }
    }
  }
}

function drawFeatureProp(ctx, pr) {
  const x = Math.round(pr.x), y = Math.round(pr.y), t = G.time;
  if (pr.type === 'shrine') {
    ctx.fillStyle = '#57534e'; ctx.fillRect(x - 8, y - 4, 16, 6);
    ctx.fillStyle = '#78716c'; ctx.fillRect(x - 6, y - 12, 12, 8);
    ctx.fillStyle = '#44403c'; ctx.fillRect(x - 6, y - 12, 12, 1);
    if (!pr.used) {
      ctx.fillStyle = '#c4b5fd'; ctx.fillRect(x - 2, y - 20 + Math.round(Math.sin(t * 3) * 1.5), 4, 4);
      ctx.globalAlpha = 0.25 + Math.sin(t * 4) * 0.1; ctx.fillStyle = '#a78bfa';
      ctx.beginPath(); ctx.arc(x, y - 18, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
  } else if (pr.type === 'merchant') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - 6, y - 1, 12, 2);
    ctx.fillStyle = '#7c2d12'; ctx.fillRect(x + 2, y - 8, 7, 7);   // saco
    ctx.fillStyle = '#a16207'; ctx.fillRect(x + 4, y - 9, 3, 1);
    ctx.fillStyle = '#3f3f46'; ctx.fillRect(x - 5, y - 14, 8, 13); // manto
    ctx.fillStyle = '#27272a'; ctx.fillRect(x - 4, y - 17, 6, 5);  // capuz
    ctx.fillStyle = '#fde047'; ctx.fillRect(x - 3, y - 15, 1, 1); ctx.fillRect(x, y - 15, 1, 1);
    ctx.fillStyle = '#facc15'; ctx.fillRect(x - 1, y - 24 + Math.round(Math.sin(t * 3)), 2, 3); // moeda flutuando
  } else if (pr.type === 'pedestal') {
    ctx.fillStyle = '#44403c'; ctx.fillRect(x - 7, y - 3, 14, 4);
    ctx.fillStyle = '#57534e'; ctx.fillRect(x - 4, y - 11, 8, 8);
    ctx.fillStyle = pr.used ? '#78716c' : '#e5e5d5'; ctx.fillRect(x - 3, y - 16, 6, 5); // caveira
    ctx.fillStyle = pr.used ? '#44403c' : '#ef4444'; ctx.fillRect(x - 2, y - 14, 1, 1); ctx.fillRect(x + 1, y - 14, 1, 1);
  }
}
