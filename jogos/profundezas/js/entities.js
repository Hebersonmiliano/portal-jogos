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
class Boss extends Enemy {
  constructor(floor, x, y) {
    const b = biomeOf(floor).boss;
    super('tank', floor, x, y, { def: b });
    this.isBoss = true;
    this.name = b.name;
    this.scale = 2.6;
    this.maxHp = Math.round(260 * Math.pow(1.07, floor - 1));
    this.hp = this.maxHp;
    this.dmg = 9 * (1 + 0.12 * (floor - 1));
    this.spd = 32;
    this.xp = Math.round(150 * (1 + 0.15 * (floor - 1)));
    this.r = 15; this.hw = 9; this.hh = 5;
    this.aware = false;
    this.actCd = 2.5;
    this.slam = null;
    this.phase = 1;
    this.proj = biomeOf(floor).proj;
  }

  update(dt) {
    const p = G.p;
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aware) { if (d < 150) { this.aware = true; G.boss = this; UI.toast(`${this.name} desperta!`, '#f87171'); Sfx.boom(); } else return; }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) { this.phase = 2; this.spd = 42; UI.toast(`${this.name} está furioso!`, '#f87171'); }

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
    const ax = (p.x - this.x) / (d || 1), ay = (p.y - this.y) / (d || 1);
    moveBody(this, ax * this.spd * dt, ay * this.spd * dt);
    this.face = ax < 0 ? -1 : 1;
    if (d < this.r + 6 && this.atkCd <= 0) { this.atkCd = 1; hurtPlayer(this.dmg, this); }

    this.actCd -= dt;
    if (this.actCd <= 0) {
      const opts = ['slam', 'ring'];
      if (this.phase === 2) opts.push('summon', 'ring');
      const act = pick(opts);
      this.actCd = this.phase === 2 ? 2.2 : 3.2;
      if (act === 'slam') this.slam = { x: p.x, y: p.y, t: 0.9 };
      else if (act === 'ring') {
        const n = this.phase === 2 ? 14 : 10, off = Math.random();
        for (let i = 0; i < n; i++) {
          const a = off + i / n * Math.PI * 2;
          G.projectiles.push(new Projectile(this.x, this.y - 10, Math.cos(a) * 85, Math.sin(a) * 85, this.dmg * 0.7, false, this.proj, 3));
        }
        Sfx.shoot();
      } else if (act === 'summon') {
        for (let i = 0; i < 2; i++) {
          const e = new Enemy(pick(['chaser', 'fast']), this.floor, this.x + rr(-20, 20), this.y + rr(-10, 10));
          e.aware = true; e.xp = Math.round(e.xp / 2);
          G.enemies.push(e);
        }
        burst(this.x, this.y - 10, '#c084fc', 14);
      }
    }
  }

  hurt(amount, fromX, fromY, crit) {
    this.hp -= amount;
    this.flash = 0.08;
    if (!this.aware) { this.aware = true; G.boss = this; }
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
    super.draw(ctx);
    // coroa
    const h = 12 * this.scale;
    ctx.fillStyle = '#facc15';
    const cy = Math.round(this.y - h + 2 - 3);
    ctx.fillRect(Math.round(this.x - 6), cy, 12, 3);
    ctx.fillRect(Math.round(this.x - 6), cy - 3, 2, 3);
    ctx.fillRect(Math.round(this.x - 1), cy - 4, 2, 4);
    ctx.fillRect(Math.round(this.x + 4), cy - 3, 2, 3);
  }
}

// ---------- Projétil ----------
class Projectile {
  constructor(x, y, vx, vy, dmg, friendly, color, size = 2) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.dmg = dmg; this.friendly = friendly; this.color = color || '#fff';
    this.life = 3; this.size = size; this.dead = false;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0 || solidAt(this.x, this.y + 6)) { this.dead = true; return; }
    const p = G.p;
    if (!this.friendly && dist(this.x, this.y, p.x, p.y - 6) < 6 + this.size) {
      this.dead = true;
      hurtPlayer(this.dmg, null);
    }
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x - this.size / 2), Math.round(this.y - this.size / 2), this.size, this.size);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(Math.round(this.x - this.vx * 0.03 - 1), Math.round(this.y - this.vy * 0.03 - 1), 2, 2);
    ctx.globalAlpha = 1;
  }
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
  const dmg = Math.max(1, amount * 100 / (100 + st.def * 6));
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
