// =============================================================
// Jogador, inimigos, chefes, projéteis, drops e efeitos
// =============================================================
'use strict';

// ---------- Colisão com o mapa ----------
function solidAt(px, py) {
  const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
  return G.level.map[ty * MAP_W + tx] === 0;
}
function boxSolid(x, y, hw, hh) {
  return solidAt(x - hw, y - hh) || solidAt(x + hw, y - hh) || solidAt(x - hw, y + hh) || solidAt(x + hw, y + hh);
}
// Move com deslizamento nas paredes (pés da entidade em x,y)
function moveBody(e, dx, dy) {
  const hw = e.hw || 4, hh = e.hh || 3;
  if (dx && !boxSolid(e.x + dx, e.y, hw, hh)) e.x += dx;
  if (dy && !boxSolid(e.x, e.y + dy, hw, hh)) e.y += dy;
}

// ---------- Atributos derivados do jogador ----------
function playerStats(p) {
  const s = { dmgPct: 0, hp: 0, crit: 0, spd: 0, steal: 0, luck: 0, def: 0, effects: {} };
  for (const slot of ['weapon', 'armor', 'ring']) {
    const it = p.eq[slot];
    if (!it) continue;
    for (const b of it.bonuses || []) {
      if (b.k === 'dmg') s.dmgPct += b.v;
      else if (b.k === 'hp') s.hp += b.v;
      else if (b.k === 'crit') s.crit += b.v;
      else if (b.k === 'spd') s.spd += b.v;
      else if (b.k === 'steal') s.steal += b.v;
      else if (b.k === 'luck') s.luck += b.v;
      else if (b.k === 'def') s.def += b.v;
    }
    if (it.effect) s.effects[it.effect] = true;
  }
  const w = p.eq.weapon;
  const a = p.eq.armor;
  const tired = p.fatigue >= 80 ? 0.8 : 1;
  return {
    maxHp: Math.round(60 + p.level * 6 + p.vit * 10 + s.hp),
    weaponDmg: w ? w.dmg * (1 + 0.08 * (w.up || 0)) : 3,
    cd: w ? w.cd * Math.max(0.6, 1 - p.agi * 0.008) : 0.4,
    range: w ? w.range : 12,
    dmgMul: (1 + p.str * 0.05 + s.dmgPct / 100) * tired,
    crit: Math.min(0.6, 0.05 + p.agi * 0.01 + s.crit / 100),
    speed: 74 * (1 + p.agi * 0.008 + s.spd / 100) * tired,
    def: (a ? a.def * (1 + 0.08 * (a.up || 0)) : 0) + s.def,
    steal: s.steal / 100 + (s.effects.vamp ? 0.08 : 0),
    luck: p.luck + s.luck,
    effects: s.effects,
  };
}

function xpNext(level) { return Math.floor(40 * Math.pow(level, 1.6)); }

// ---------- Inimigo ----------
class Enemy {
  constructor(type, floor, x, y, opts = {}) {
    const base = ENEMY_BASE[type];
    const biome = biomeOf(floor);
    const def = opts.def || biome.enemies[type];
    this.id = uid();
    this.type = type;
    this.name = def.name;
    this.sprite = def.sprite;
    this.pal = def.pal;
    this.x = x; this.y = y;
    const hpMul = Math.pow(1.07, floor - 1);
    const dmgMul = 1 + 0.12 * (floor - 1);
    this.elite = !!opts.elite;
    this.scale = this.elite ? 1.3 : 1;
    this.maxHp = Math.round(base.hp * hpMul * (this.elite ? 2.5 : 1));
    this.hp = this.maxHp;
    this.dmg = base.dmg * dmgMul * (this.elite ? 1.5 : 1);
    this.spd = base.spd * (this.elite ? 1.1 : 1);
    this.xp = Math.round(base.xp * (1 + 0.15 * (floor - 1)) * (this.elite ? 3 : 1));
    this.r = base.r * this.scale;
    this.hw = 4 * this.scale; this.hh = 3;
    this.aware = false;
    this.atkCd = 0;
    this.shootCd = 1 + Math.random() * 1.5;
    this.kx = 0; this.ky = 0;
    this.flash = 0;
    this.wander = { x: 0, y: 0, t: 0 };
    this.t = Math.random() * 10;
    this.dead = false;
    this.floor = floor;
    if (this.elite) this.name += ' (Elite)';
  }

  update(dt) {
    const p = G.p;
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    // empurrão
    if (this.kx || this.ky) {
      moveBody(this, this.kx * dt, this.ky * dt);
      this.kx *= Math.pow(0.002, dt); this.ky *= Math.pow(0.002, dt);
      if (Math.abs(this.kx) < 2) this.kx = 0;
      if (Math.abs(this.ky) < 2) this.ky = 0;
    }
    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aware && d < 120) this.aware = true;

    let mx = 0, my = 0;
    if (!this.aware) {
      this.wander.t -= dt;
      if (this.wander.t <= 0) {
        this.wander.t = 1 + Math.random() * 2;
        const a = Math.random() * Math.PI * 2;
        const still = Math.random() < 0.4;
        this.wander.x = still ? 0 : Math.cos(a); this.wander.y = still ? 0 : Math.sin(a);
      }
      mx = this.wander.x * 0.4; my = this.wander.y * 0.4;
    } else {
      const ax = (p.x - this.x) / (d || 1), ay = (p.y - this.y) / (d || 1);
      if (this.type === 'shooter') {
        if (d > 95) { mx = ax; my = ay; }
        else if (d < 55) { mx = -ax; my = -ay; }
        else { mx = -ay * 0.5; my = ax * 0.5; }
        this.shootCd -= dt;
        if (this.shootCd <= 0 && d < 170) {
          this.shootCd = 1.6 + Math.random() * 0.8;
          G.projectiles.push(new Projectile(this.x, this.y - 6, ax * 110, ay * 110, this.dmg, false, biomeOf(this.floor).proj));
          Sfx.shoot();
        }
      } else if (this.type === 'fast') {
        const w = Math.sin(this.t * 6) * 0.7;
        mx = ax - ay * w; my = ay + ax * w;
      } else {
        mx = ax; my = ay;
      }
      // ataque de contato
      if (this.type !== 'shooter' && d < this.r + 6 && this.atkCd <= 0) {
        this.atkCd = 0.9;
        hurtPlayer(this.dmg, this);
      }
    }
    // separação entre inimigos
    for (const o of G.enemies) {
      if (o === this || o.dead) continue;
      const dd = dist(this.x, this.y, o.x, o.y);
      if (dd < 10 && dd > 0.01) { mx += (this.x - o.x) / dd * 0.6; my += (this.y - o.y) / dd * 0.6; }
    }
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    moveBody(this, mx * this.spd * dt, my * this.spd * dt);
    if (mx) this.face = mx < 0 ? -1 : 1;
  }

  hurt(amount, fromX, fromY, crit) {
    this.hp -= amount;
    this.flash = 0.1;
    this.aware = true;
    const d = dist(fromX, fromY, this.x, this.y) || 1;
    const kb = this.type === 'tank' ? 60 : 140;
    this.kx = (this.x - fromX) / d * kb; this.ky = (this.y - fromY) / d * kb;
    addText(this.x, this.y - 14, Math.round(amount) + (crit ? '!' : ''), crit ? '#fde047' : '#ffffff', crit ? 1.3 : 1);
    burst(this.x, this.y - 5, this.pal.a || this.pal.g || '#fff', 4);
    if (this.hp <= 0 && !this.dead) { this.dead = true; onEnemyDeath(this); }
  }

  draw(ctx) {
    const spr = getSprite(this.sprite, this.pal, this.flash > 0);
    const w = spr.width * this.scale, h = spr.height * this.scale;
    const bob = this.type === 'fast' ? Math.sin(this.t * 10) * 2 - 4 : this.type === 'tank' ? Math.sin(this.t * 4) * 0.8 : 0;
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(this.x, this.y, w * 0.32, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y - h + 2 + bob));
    if (this.face === -1) { ctx.scale(-1, 1); ctx.drawImage(spr, -w / 2, 0, w, h); }
    else ctx.drawImage(spr, -w / 2, 0, w, h);
    ctx.restore();
    if (this.elite) {
      ctx.strokeStyle = 'rgba(250,204,21,0.7)'; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(this.x - w / 2) - 0.5, Math.round(this.y - h + 2 + bob) - 0.5, w + 1, h + 1);
    }
    if (this.hp < this.maxHp) {
      const bw = 12 * this.scale;
      ctx.fillStyle = '#000'; ctx.fillRect(Math.round(this.x - bw / 2), Math.round(this.y - h - 1 + bob), bw, 2);
      ctx.fillStyle = this.elite ? '#facc15' : '#ef4444';
      ctx.fillRect(Math.round(this.x - bw / 2), Math.round(this.y - h - 1 + bob), bw * Math.max(0, this.hp / this.maxHp), 2);
    }
  }
}

// ---------- Chefe ----------
// Cada chefe tem o golpe em área e o anel de projéteis em comum,
// mais ataques exclusivos conforme o bioma (kind 0 a 4).
const BOSS_MOVES = {
  0: { name: 'Rei Goblin',       p1: ['slam', 'volley', 'charge'],   p2: ['volley', 'charge', 'summon', 'volley'] },
  1: { name: 'Verme de Pedra',   p1: ['burrow', 'rocks', 'slam'],    p2: ['burrow', 'rocks', 'burrow', 'ring'] },
  2: { name: 'Hidra das Marés',  p1: ['streams', 'wave', 'ring'],    p2: ['streams', 'wave', 'wave', 'streams'] },
  3: { name: 'Lich Ancestral',   p1: ['spiral', 'blink', 'summon'],  p2: ['spiral', 'blink', 'spiral', 'summon'] },
  4: { name: 'Senhor do Abismo', p1: ['lava', 'meteors', 'slam'],    p2: ['meteors', 'lava', 'ring', 'meteors'] },
};

class Boss extends Enemy {
  constructor(floor, x, y) {
    const b = biomeOf(floor).boss;
    super('tank', floor, x, y, { def: b });
    this.isBoss = true;
    this.kind = b.kind || 0;
    this.name = b.name;
    this.scale = 2.3;
    this.maxHp = Math.round(260 * Math.pow(1.07, floor - 1));
    this.hp = this.maxHp;
    this.dmg = 9 * (1 + 0.12 * (floor - 1));
    this.spd = 32;
    this.xp = Math.round(150 * (1 + 0.15 * (floor - 1)));
    this.r = 15; this.hw = 9; this.hh = 5;
    this.aware = false;
    this.actCd = 2.5;
    this.slam = null;
    this.mode = null;     // ataque em andamento: { type, t, ... }
    this.hidden = false;  // o verme fica embaixo da terra
    this.phase = 1;
    this.proj = biomeOf(floor).proj;
  }

  arena() { return G.level.rooms[1] || G.level.rooms[0]; }

  update(dt) {
    const p = G.p;
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aware) { if (d < 150) { this.aware = true; G.boss = this; UI.toast(`${this.name} desperta!`, '#f87171'); Sfx.boom(); Music.play('boss'); } else return; }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) { this.phase = 2; this.spd = 42; UI.toast(`${this.name} está furioso!`, '#f87171'); }

    // golpe em área (comum)
    if (this.slam) {
      this.slam.t -= dt;
      if (this.slam.t <= 0) {
        G.effects.push({ type: 'ring', x: this.slam.x, y: this.slam.y, r: 4, max: 48, t: 0.3, color: this.proj });
        if (dist(this.slam.x, this.slam.y, p.x, p.y) < 46) hurtPlayer(this.dmg * 1.6, this);
        G.shake = 6; Sfx.boom();
        this.slam = null;
      }
      return;
    }
    if (this.mode) { this.runMode(dt, d); return; }

    const ax = (p.x - this.x) / (d || 1), ay = (p.y - this.y) / (d || 1);
    moveBody(this, ax * this.spd * dt, ay * this.spd * dt);
    this.face = ax < 0 ? -1 : 1;
    if (d < this.r + 6 && this.atkCd <= 0) { this.atkCd = 1; hurtPlayer(this.dmg, this); }

    this.actCd -= dt;
    if (this.actCd <= 0) {
      const moves = BOSS_MOVES[this.kind] || BOSS_MOVES[0];
      const act = pick(this.phase === 2 ? moves.p2 : moves.p1);
      this.actCd = this.phase === 2 ? 2.1 : 3.0;
      this.start(act, ax, ay);
    }
  }

  start(act, ax, ay) {
    const p = G.p;
    if (act === 'slam') { this.slam = { x: p.x, y: p.y, t: 0.9 }; return; }
    if (act === 'ring') { this.ring(this.phase === 2 ? 14 : 10, 85); return; }
    if (act === 'summon') { this.summon(); return; }
    // ---- Rei Goblin ----
    if (act === 'volley') {          // chuva de flechas: círculos marcados em volta do jogador
      const n = this.phase === 2 ? 9 : 6;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, r = i === 0 ? 0 : rr(14, 60);
        addHazard(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 16, 0.9 + i * 0.06, 0, this.dmg * 0.9, '#c9a46a', 'arrow');
      }
      Sfx.shoot();
      return;
    }
    if (act === 'charge') {          // investida: sinaliza e corre em linha reta
      this.mode = { type: 'charge', t: 1.1, wind: 0.5, vx: ax * 230, vy: ay * 230, hit: false };
      return;
    }
    // ---- Verme de Pedra ----
    if (act === 'burrow') {          // mergulha e sai embaixo do jogador
      this.mode = { type: 'burrow', t: 2.2, tx: p.x, ty: p.y, marked: false };
      this.hidden = true;
      burst(this.x, this.y - 6, '#8a7a6a', 20); G.shake = 4; Sfx.boom();
      return;
    }
    if (act === 'rocks') {           // pedras caindo do teto
      const n = this.phase === 2 ? 8 : 5;
      for (let i = 0; i < n; i++) addHazard(p.x + rr(-70, 70), p.y + rr(-50, 50), 18, 0.8 + i * 0.12, 0, this.dmg * 1.1, '#a8a29e', 'rock');
      G.shake = 3;
      return;
    }
    // ---- Hidra das Marés ----
    if (act === 'streams') {         // as três cabeças disparam em sequência
      this.mode = { type: 'streams', t: 1.2, next: 0, shots: 0 };
      return;
    }
    if (act === 'wave') {            // muralha de água com uma brecha
      const dx = p.x - this.x, dy = p.y - this.y, dd = Math.hypot(dx, dy) || 1;
      const ux = dx / dd, uy = dy / dd, px = -uy, py = ux;
      const n = 15, gap = 3 + ri(n - 6);
      for (let i = 0; i < n; i++) {
        if (i === gap || i === gap + 1 || i === gap + 2) continue;
        const o = (i - (n - 1) / 2) * 11;
        G.projectiles.push(new Projectile(this.x + px * o, this.y - 10 + py * o, ux * 70, uy * 70, this.dmg * 0.8, false, '#5eead4', 4));
      }
      Sfx.shoot();
      return;
    }
    // ---- Lich Ancestral ----
    if (act === 'spiral') {          // espiral de orbes
      this.mode = { type: 'spiral', t: this.phase === 2 ? 2.6 : 2.0, emit: 0, ang: Math.random() * 6 };
      return;
    }
    if (act === 'blink') {           // some e reaparece em outro ponto da sala
      const ar = this.arena();
      burst(this.x, this.y - 14, '#a855f7', 18);
      for (let k = 0; k < 20; k++) {
        const pt = randomPointIn(ar, 2);
        if (dist(pt.x, pt.y, p.x, p.y) > 80) { this.x = pt.x; this.y = pt.y; break; }
      }
      burst(this.x, this.y - 14, '#a855f7', 18);
      Sfx.dash();
      this.ring(8, 70);
      return;
    }
    // ---- Senhor do Abismo ----
    if (act === 'lava') {            // poças de lava que queimam por alguns segundos
      const n = this.phase === 2 ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, r = i === 0 ? 0 : rr(30, 80);
        addHazard(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 26, 0.9, 4.5, this.dmg * 0.5, '#f97316', 'lava');
      }
      return;
    }
    if (act === 'meteors') {         // chuva de meteoros
      const n = this.phase === 2 ? 10 : 7;
      for (let i = 0; i < n; i++) addHazard(p.x + rr(-80, 80), p.y + rr(-60, 60), 20, 0.7 + i * 0.15, 0, this.dmg * 1.2, '#fb923c', 'meteor');
      return;
    }
  }

  runMode(dt, d) {
    const m = this.mode, p = G.p;
    m.t -= dt;
    if (m.type === 'charge') {
      if (m.wind > 0) { m.wind -= dt; if (m.wind <= 0) Sfx.dash(); }
      else {
        const ox = this.x, oy = this.y;
        moveBody(this, m.vx * dt, m.vy * dt);
        if (Math.abs(this.x - ox) + Math.abs(this.y - oy) < 0.5) m.t = 0; // bateu na parede
        if (!m.hit && dist(this.x, this.y, p.x, p.y) < this.r + 8) { m.hit = true; hurtPlayer(this.dmg * 1.5, this); }
        if (Math.random() < 0.5) burst(this.x, this.y - 4, '#a8a29e', 1);
      }
    } else if (m.type === 'burrow') {
      if (!m.marked && m.t < 1.0) { // marca o ponto onde vai sair
        m.marked = true; m.tx = p.x; m.ty = p.y;
        addHazard(m.tx, m.ty, 30, 0.9, 0, this.dmg * 1.7, '#8a7a6a', 'burrow');
      }
      if (m.t <= 0.05 && this.hidden) {
        this.x = m.tx; this.y = m.ty; this.hidden = false;
        burst(this.x, this.y - 6, '#8a7a6a', 26);
        this.ring(this.phase === 2 ? 12 : 8, 80);
      }
    } else if (m.type === 'streams') {
      m.next -= dt;
      if (m.next <= 0 && m.shots < 9) {
        m.next = 0.12; m.shots++;
        const head = (m.shots - 1) % 3, hx = this.x + (head - 1) * 14, hy = this.y - 30;
        const a = Math.atan2(p.y - 6 - hy, p.x - hx);
        G.projectiles.push(new Projectile(hx, hy, Math.cos(a) * 130, Math.sin(a) * 130, this.dmg * 0.7, false, '#5eead4', 3));
        Sfx.shoot();
      }
    } else if (m.type === 'spiral') {
      m.emit -= dt;
      while (m.emit <= 0) {
        m.emit += 0.09; m.ang += 0.42;
        for (const off of [0, Math.PI]) {
          const a = m.ang + off;
          G.projectiles.push(new Projectile(this.x, this.y - 14, Math.cos(a) * 62, Math.sin(a) * 62, this.dmg * 0.6, false, '#c084fc', 3));
        }
      }
    }
    if (m.t <= 0) { this.mode = null; this.hidden = false; }
  }

  ring(n, speed) {
    const off = Math.random();
    for (let i = 0; i < n; i++) {
      const a = off + i / n * Math.PI * 2;
      G.projectiles.push(new Projectile(this.x, this.y - 10, Math.cos(a) * speed, Math.sin(a) * speed, this.dmg * 0.7, false, this.proj, 3));
    }
    Sfx.shoot();
  }

  summon() {
    const types = this.kind === 0 ? ['shooter', 'shooter'] : this.kind === 3 ? ['chaser', 'chaser', 'chaser'] : ['chaser', 'fast'];
    for (const t of types) {
      const e = new Enemy(t, this.floor, this.x + rr(-24, 24), this.y + rr(-12, 12));
      e.aware = true; e.xp = Math.round(e.xp / 2);
      G.enemies.push(e);
    }
    burst(this.x, this.y - 10, '#c084fc', 14);
  }

  hurt(amount, fromX, fromY, crit) {
    if (this.hidden) return; // embaixo da terra não leva dano
    this.hp -= amount;
    this.flash = 0.08;
    if (!this.aware) { this.aware = true; G.boss = this; Music.play('boss'); }
    addText(this.x, this.y - 40, Math.round(amount) + (crit ? '!' : ''), crit ? '#fde047' : '#ffffff', crit ? 1.3 : 1);
    burst(this.x, this.y - 18, this.pal.g || this.pal.a || '#fff', 5);
    if (this.hp <= 0 && !this.dead) { this.dead = true; onEnemyDeath(this); }
  }

  draw(ctx) {
    if (this.slam) {
      ctx.strokeStyle = 'rgba(239,68,68,0.9)'; ctx.fillStyle = 'rgba(239,68,68,0.18)';
      ctx.beginPath(); ctx.arc(this.slam.x, this.slam.y, 46, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(this.slam.x, this.slam.y, 46 * (1 - this.slam.t / 0.9), 0, Math.PI * 2); ctx.stroke();
    }
    if (this.hidden) { // monte de terra se movendo
      ctx.fillStyle = 'rgba(138,122,106,0.8)';
      ctx.beginPath(); ctx.ellipse(this.x, this.y, 10 + Math.sin(this.t * 20) * 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (this.mode && this.mode.type === 'charge' && this.mode.wind > 0) { // aviso da investida
      ctx.strokeStyle = 'rgba(239,68,68,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.mode.vx * 0.5, this.y + this.mode.vy * 0.5); ctx.stroke();
    }
    super.draw(ctx);
  }
}

// ---------- Perigos no chão (flechas, pedras, lava, meteoros) ----------
function addHazard(x, y, r, delay, dur, dmg, color, kind) {
  if (solidAt(x, y)) return;
  G.hazards.push({ x, y, r, delay, delay0: delay, dur, dmg, color, kind, tick: 0, fired: false });
}
function updateHazards(dt) {
  const p = G.p;
  for (const h of G.hazards) {
    if (h.delay > 0) { h.delay -= dt; continue; }
    if (!h.fired) {
      h.fired = true;
      G.effects.push({ type: 'ring', x: h.x, y: h.y, r: 3, max: h.r, t: 0.25, color: h.color });
      burst(h.x, h.y - 3, h.color, 6);
      if (h.kind === 'meteor' || h.kind === 'rock' || h.kind === 'burrow') { G.shake = Math.max(G.shake, 3); Sfx.boom(); }
      if (dist(h.x, h.y, p.x, p.y) < h.r) hurtPlayer(h.dmg, null);
      if (!h.dur) { h.done = true; continue; }
    }
    h.dur -= dt; h.tick -= dt;
    if (h.tick <= 0 && dist(h.x, h.y, p.x, p.y) < h.r) { h.tick = 0.5; hurtPlayer(h.dmg, null); }
    if (h.dur <= 0) h.done = true;
  }
  G.hazards = G.hazards.filter(h => !h.done);
}
function drawHazards(ctx) {
  for (const h of G.hazards) {
    if (h.delay > 0) {
      const k = 1 - h.delay / h.delay0;
      ctx.fillStyle = 'rgba(239,68,68,0.15)'; ctx.strokeStyle = 'rgba(239,68,68,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r, h.r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(239,68,68,0.3)';
      ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r * k, h.r * 0.6 * k, 0, 0, Math.PI * 2); ctx.fill();
      if (h.kind === 'meteor' || h.kind === 'rock') { // sombra do que vai cair
        ctx.fillStyle = h.color;
        ctx.fillRect(Math.round(h.x - 2), Math.round(h.y - 60 * (1 - k) - 4), 4, 4);
      }
    } else if (h.dur > 0) {
      ctx.globalAlpha = 0.55 + Math.sin(G.time * 10 + h.x) * 0.15;
      ctx.fillStyle = h.color;
      ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r, h.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r * 0.5, h.r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

// ---------- Projétil ----------
class Projectile {
  constructor(x, y, vx, vy, dmg, friendly, color, size = 2, opts = {}) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.dmg = dmg; this.friendly = friendly; this.color = color || '#fff';
    this.life = opts.life || 3; this.size = size; this.dead = false;
    this.explode = opts.explode || 0;   // raio de explosão (bola de fogo)
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0 || solidAt(this.x, this.y + 6)) { this.end(); return; }
    if (this.friendly) {
      for (const e of G.enemies) {
        if (e.dead || e.hidden) continue;
        if (dist(this.x, this.y, e.x, e.y - (e.isBoss ? 14 : 5)) < e.r + this.size + 1) {
          if (!this.explode) e.hurt(this.dmg, this.x - this.vx * 0.05, this.y - this.vy * 0.05, false);
          this.end(); return;
        }
      }
      return;
    }
    const p = G.p;
    if (dist(this.x, this.y, p.x, p.y - 6) < 6 + this.size) {
      this.dead = true;
      hurtPlayer(this.dmg, null);
    }
  }
  end() {
    this.dead = true;
    if (this.explode) areaDamage(this.x, this.y, this.explode, this.dmg, this.color);
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x - this.size / 2), Math.round(this.y - this.size / 2), this.size, this.size);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(Math.round(this.x - this.vx * 0.03 - 1), Math.round(this.y - this.vy * 0.03 - 1), 2, 2);
    ctx.globalAlpha = 1;
  }
}

// Dano em área causado pelo jogador
function areaDamage(x, y, r, dmg, color) {
  G.effects.push({ type: 'ring', x, y, r: 4, max: r, t: 0.3, color: color || '#f97316' });
  burst(x, y, color || '#f97316', 14);
  Sfx.boom();
  for (const e of G.enemies) if (!e.dead && dist(x, y, e.x, e.y - 5) < r + e.r) e.hurt(dmg, x, y, false);
}

// ---------- Efeitos ----------
function addText(x, y, txt, color, scale = 1) {
  G.texts.push({ x: x + rr(-3, 3), y, txt: String(txt), color, t: 0.9, scale });
}
function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = rr(20, 70);
    G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, t: rr(0.25, 0.5), color });
  }
}

// ---------- Combate do jogador ----------
function hurtPlayer(amount, source) {
  const p = G.p;
  if (p.dodgeT > 0 || p.iframes > 0 || p.dead) return;
  const st = playerStats(p);
  let dmg = Math.max(1, amount * 100 / (100 + st.def * 6));
  if (p.shieldT > 0) { dmg *= 1 - p.shieldRed; G.effects.push({ type: 'ring', x: p.x, y: p.y - 6, r: 8, max: 13, t: 0.2, color: '#d6d3d1' }); }
  p.hp -= dmg;
  p.iframes = 0.5;
  G.shake = Math.max(G.shake, 3);
  G.hurtFlash = 0.25;
  addText(p.x, p.y - 16, '-' + Math.round(dmg), '#f87171');
  Sfx.hurt();
  if (st.effects.espinhos && source && !source.dead) source.hurt(amount * 0.4, p.x, p.y, false);
  if (p.hp <= 0) { p.hp = 0; playerDie(); }
}

function playerAttack(aimAngle) {
  const p = G.p;
  if (p.atkCd > 0 || p.dodgeT > 0) return;
  const st = playerStats(p);
  p.atkCd = st.cd;
  p.swing = { t: 0.14, a: aimAngle, range: st.range };
  Sfx.swing();
  const cx = p.x, cy = p.y - 5;
  let hitAny = false;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const ex = e.x, ey = e.y - (e.isBoss ? 14 : 5);
    const d = dist(cx, cy, ex, ey);
    if (d > st.range + e.r) continue;
    const a = Math.atan2(ey - cy, ex - cx);
    if (d > 9 && angDiff(a, aimAngle) > 1.15) continue;
    const crit = Math.random() < st.crit;
    const dmg = st.weaponDmg * st.dmgMul * (crit ? 2 : 1) * rr(0.9, 1.1);
    e.hurt(dmg, p.x, p.y, crit);
    if (st.steal > 0) p.hp = Math.min(st.maxHp, p.hp + dmg * st.steal);
    hitAny = true;
    if (crit) Sfx.crit(); else Sfx.hit();
  }
  if (hitAny) {
    G.hitStop = 0.04;
    p.hitCount = (p.hitCount || 0) + 1;
    if (st.effects.fogo && p.hitCount % 3 === 0) {
      const fx = cx + Math.cos(aimAngle) * 14, fy = cy + Math.sin(aimAngle) * 14;
      G.effects.push({ type: 'ring', x: fx, y: fy, r: 4, max: 34, t: 0.3, color: '#f97316' });
      burst(fx, fy, '#f97316', 16);
      Sfx.boom();
      for (const e of G.enemies) if (!e.dead && dist(fx, fy, e.x, e.y - 5) < 34) e.hurt(st.weaponDmg * st.dmgMul, fx, fy, false);
    }
  }
}
