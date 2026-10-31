// =============================================================
// Jogador, inimigos, chefes, projéteis, drops e efeitos
// =============================================================
'use strict';

// ---------- Caminhos: mapa de distâncias a partir do herói ----------
const Flow = { dist: null, tx: -1, ty: -1, t: 0 };
function resetFlow() { Flow.dist = null; Flow.tx = Flow.ty = -1; }
function updateFlow(dt) {
  const p = G.p, tx = Math.floor(p.x / TILE), ty = Math.floor(p.y / TILE);
  Flow.t -= dt;
  if (!Flow.dist || ((tx !== Flow.tx || ty !== Flow.ty) && Flow.t <= 0)) {
    if (G.level.map[ty * MAP_W + tx] !== 1) return;
    Flow.dist = bfs(G.level.map, tx, ty); Flow.tx = tx; Flow.ty = ty; Flow.t = 0.12;
  }
}
// Direção para o próximo quadrado do caminho até o herói
function flowDir(e) {
  const D = Flow.dist;
  if (!D) return null;
  const tx = Math.floor(e.x / TILE), ty = Math.floor(e.y / TILE);
  const m = G.level.map;
  let best = D[ty * MAP_W + tx], bx = 0, by = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = tx + dx, ny = ty + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    if (dx && dy && (m[ty * MAP_W + nx] !== 1 || m[ny * MAP_W + tx] !== 1)) continue; // não corta quina
    const v = D[ny * MAP_W + nx];
    if (v >= 0 && (best < 0 || v < best)) { best = v; bx = dx; by = dy; }
  }
  if (!bx && !by) return null;
  const cx = (tx + bx) * TILE + TILE / 2, cy = (ty + by) * TILE + TILE / 2 + 2;
  const d = dist(e.x, e.y, cx, cy) || 1;
  return { x: (cx - e.x) / d, y: (cy - e.y) / d };
}
// Linha livre entre dois pontos (com a largura do corpo)
function hasLOS(ax, ay, bx, by, hw = 4) {
  const d = dist(ax, ay, bx, by), steps = Math.ceil(d / 5);
  const nx = -(by - ay) / (d || 1) * hw, ny = (bx - ax) / (d || 1) * hw;
  for (let i = 1; i < steps; i++) {
    const k = i / steps, x = ax + (bx - ax) * k, y = ay + (by - ay) * k;
    if (solidAt(x + nx, y + ny) || solidAt(x - nx, y - ny)) return false;
  }
  return true;
}

// ---------- Colisão com o mapa ----------
function solidAt(px, py) {
  const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
  return G.level.map[ty * MAP_W + tx] !== 1;
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
    dmgMul: (1 + p.str * 0.05 + s.dmgPct / 100 + blessing('forca') * 0.25) * tired,
    crit: Math.min(0.6, 0.05 + p.agi * 0.01 + s.crit / 100),
    speed: 74 * (1 + p.agi * 0.008 + s.spd / 100 + blessing('rapidez') * 0.15) * tired * ((p.slowT || 0) > 0 ? (p.slowMul || 0.5) : 1),
    def: (a ? a.def * (1 + 0.08 * (a.up || 0)) : 0) + s.def,
    steal: s.steal / 100 + (s.effects.vamp ? 0.08 : 0),
    luck: p.luck + s.luck + blessing('fortuna') * 10,
    effects: s.effects,
  };
}

function xpNext(level) { return Math.floor(40 * Math.pow(level, 1.6)); }

// ---------- Inimigo ----------
// Cada sprite tem um comportamento especial (ver ABILITY_OF)
const ABILITY_OF = {
  rat: 'lunge', bat: 'swoop', slime: 'split', goblin: 'volley',
  skel: 'revive', spider: 'web', golem: 'pound', kobold: 'dynamite',
  fishman: 'lunge', eel: 'shock', crab: 'shell', siren: 'orb',
  zombie: 'grab', ghost: 'phase', knight: 'charge', necro: 'raise',
  imp: 'blink', hound: 'trail', demon: 'pound', flame: 'deathburst',
};

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
    this.mini = !!opts.mini;
    this.scale = this.elite ? 1.3 : this.mini ? 0.7 : 1;
    this.maxHp = Math.round(base.hp * hpMul * (this.elite ? 2.5 : this.mini ? 0.4 : 1));
    this.hp = this.maxHp;
    this.dmg = base.dmg * dmgMul * (this.elite ? 1.5 : this.mini ? 0.6 : 1);
    this.spd = base.spd * (this.elite ? 1.1 : this.mini ? 1.3 : 1);
    this.xp = Math.round(base.xp * (1 + 0.15 * (floor - 1)) * (this.elite ? 3 : this.mini ? 0.3 : 1));
    this.r = base.r * this.scale;
    this.hw = 4 * this.scale; this.hh = 3;
    this.aware = false;
    this.atkCd = 0;
    this.shootCd = 1 + Math.random() * 1.5;
    this.shots = 0;
    this.kx = 0; this.ky = 0;
    this.flash = 0;
    this.wander = { x: 0, y: 0, t: 0 };
    this.t = Math.random() * 10;
    this.dead = false;
    this.floor = floor;
    this.ability = opts.noAbility ? null : ABILITY_OF[this.sprite] || null;
    this.abCd = rr(1.5, 3.5);
    this.wind = 0; this.windAct = null;   // preparação de um golpe especial
    this.dash = null;                       // avanço rápido
    this.shellT = 0; this.downT = 0; this.revived = !!opts.revived;
    this.trailT = 0; this.minions = [];
    this.anim = null;                       // { type: 'attack'|'hurt', t, dur, ax, ay }
    this.moving = false;
    if (this.elite) this.name += ' (Elite)';
  }

  setAnim(type, dur, ax = 0, ay = 0) { this.anim = { type, t: dur, dur, ax, ay }; }

  // Linha de visão até o herói (recalculada algumas vezes por segundo)
  canSee(dt, d) {
    if (this.ability === 'phase') return true;
    this.losT = (this.losT || 0) - dt;
    if (this.losT <= 0) {
      this.losT = 0.15 + Math.random() * 0.1;
      this.los = d < 220 && hasLOS(this.x, this.y, G.p.x, G.p.y, this.hw);
    }
    return this.los;
  }

  // Começa a preparar um golpe especial (o jogador vê o aviso)
  windup(act, t) { this.wind = t; this.windAct = act; }

  update(dt) {
    const p = G.p;
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.anim) { this.anim.t -= dt; if (this.anim.t <= 0) this.anim = null; }
    if (this.abCd > 0) this.abCd -= dt * (this.elite ? 1.4 : 1);
    this.moving = false;

    // esqueleto caído: os ossos se juntam de novo
    if (this.downT > 0) {
      this.downT -= dt;
      if (this.downT <= 0) {
        this.revived = true; this.hp = Math.round(this.maxHp * 0.5);
        burst(this.x, this.y - 6, '#e5e5d5', 12); Sfx.chest();
        addText(this.x, this.y - 16, 'levantou!', '#e5e5d5', 0.8);
      }
      return;
    }
    if (this.shellT > 0) { this.shellT -= dt; return; }

    // empurrão
    if (this.kx || this.ky) {
      this.move(this.kx * dt, this.ky * dt);
      this.kx *= Math.pow(0.002, dt); this.ky *= Math.pow(0.002, dt);
      if (Math.abs(this.kx) < 2) this.kx = 0;
      if (Math.abs(this.ky) < 2) this.ky = 0;
    }
    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aware && d < 120) this.aware = true;
    const ax = (p.x - this.x) / (d || 1), ay = (p.y - this.y) / (d || 1);

    // preparando golpe especial: fica parado tremendo
    if (this.wind > 0) {
      this.wind -= dt;
      if (this.wind <= 0) this.doAbility(this.windAct, ax, ay, d);
      return;
    }
    // avanço (bote, mergulho, investida)
    if (this.dash) {
      this.dash.t -= dt;
      this.move(this.dash.vx * dt, this.dash.vy * dt);
      this.moving = true;
      if (d < this.r + 7 && this.atkCd <= 0) this.contact(ax, ay);
      if (this.dash.t <= 0) this.dash = null;
      return;
    }

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
      // sem linha de visão: segue o caminho pelo mapa de distâncias
      // travado numa quina? segue o caminho por um tempo mesmo vendo o herói
      this.stuckT = (this.stuckT || 0) + dt;
      if (this.stuckT > 0.5) {
        const moved = dist(this.x, this.y, this.lastX ?? this.x, this.lastY ?? this.y);
        if (moved < 4 && d > this.r + 10) this.forcePath = 1.5;
        this.stuckT = 0; this.lastX = this.x; this.lastY = this.y;
      }
      if (this.forcePath > 0) this.forcePath -= dt;
      const see = this.canSee(dt, d) && !(this.forcePath > 0);
      const path = see ? null : flowDir(this);
      const gx = path ? path.x : ax, gy = path ? path.y : ay;
      if (this.type === 'shooter') {
        if (!see) { mx = gx; my = gy; }
        else if (d > 95) { mx = ax; my = ay; }
        else if (d < 55) { mx = -ax; my = -ay; }
        else { mx = -ay * 0.5; my = ax * 0.5; }
        this.shootCd -= dt;
        if (see && this.shootCd <= 0 && d < 170) {
          this.shootCd = 1.6 + Math.random() * 0.8;
          this.shoot(ax, ay);
        }
      } else if (this.type === 'fast') {
        const w = see ? Math.sin(this.t * 6) * 0.7 : 0;
        mx = gx - gy * w; my = gy + gx * w;
      } else {
        mx = gx; my = gy;
      }
      if (this.type !== 'shooter' && d < this.r + 6 && this.atkCd <= 0) this.contact(ax, ay);
      if (see || this.ability === 'raise' || this.ability === 'blink') this.tryAbility(d, ax, ay);
    }
    // separação entre inimigos
    for (const o of G.enemies) {
      if (o === this || o.dead) continue;
      const dd = dist(this.x, this.y, o.x, o.y);
      if (dd < 10 && dd > 0.01) { mx += (this.x - o.x) / dd * 0.6; my += (this.y - o.y) / dd * 0.6; }
    }
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    if (len > 0.05) this.moving = true;
    this.move(mx * this.spd * dt, my * this.spd * dt);
    if (mx) this.face = mx < 0 ? -1 : 1;
    // cão infernal deixa um rastro de fogo
    if (this.ability === 'trail' && this.aware && this.moving) {
      this.trailT -= dt;
      if (this.trailT <= 0) { this.trailT = 0.3; addHazard(this.x, this.y, 8, 0.05, 1.6, this.dmg * 0.35, '#f97316', 'fire'); }
    }
  }

  // fantasma atravessa paredes
  move(dx, dy) {
    if (this.ability === 'phase') {
      this.x = clamp(this.x + dx, TILE, (MAP_W - 1) * TILE);
      this.y = clamp(this.y + dy, TILE, (MAP_H - 1) * TILE);
    } else moveBody(this, dx, dy);
  }

  contact(ax, ay) {
    this.atkCd = 0.9;
    this.setAnim('attack', 0.18, ax, ay);
    hurtPlayer(this.dmg, this);
    if (this.ability === 'grab') { G.p.slowT = 1.5; G.p.slowMul = 0.55; }
  }

  shoot(ax, ay) {
    const col = biomeOf(this.floor).proj;
    this.setAnim('attack', 0.18, ax, ay);
    this.shots++;
    if (this.ability === 'volley' && this.shots % 3 === 0) {
      for (const o of [-0.25, 0, 0.25]) {
        const a = Math.atan2(ay, ax) + o;
        G.projectiles.push(new Projectile(this.x, this.y - 6, Math.cos(a) * 115, Math.sin(a) * 115, this.dmg, false, col));
      }
    } else if (this.ability === 'orb') {
      G.projectiles.push(new Projectile(this.x, this.y - 6, ax * 60, ay * 60, this.dmg * 1.2, false, '#ff66ff', 4, { homing: true, life: 4 }));
    } else if (this.ability === 'dynamite') {
      const p = G.p;
      addHazard(p.x + rr(-6, 6), p.y + rr(-4, 4), 22, 1.0, 0, this.dmg * 1.3, '#ef4444', 'meteor');
    } else {
      G.projectiles.push(new Projectile(this.x, this.y - 6, ax * 110, ay * 110, this.dmg, false, col));
    }
    Sfx.shoot();
  }

  tryAbility(d, ax, ay) {
    if (this.abCd > 0) return;
    const a = this.ability;
    if ((a === 'lunge') && d < 60) { this.windup('lunge', 0.35); this.abCd = 3; }
    else if (a === 'swoop' && d < 90) { this.windup('swoop', 0.25); this.abCd = 2.6; }
    else if (a === 'pound' && d < 42) { this.windup('pound', 0.6); this.abCd = 4; }
    else if (a === 'shock' && d < 40) { this.windup('shock', 0.5); this.abCd = 3.5; }
    else if (a === 'charge' && d < 110) { this.windup('charge', 0.55); this.chargeDir = { x: ax, y: ay }; this.abCd = 4; }
    else if (a === 'web' && d < 120) { this.windup('web', 0.3); this.abCd = 3.5; }
    else if (a === 'blink' && d < 130) { this.windup('blink', 0.3); this.abCd = 4; }
    else if (a === 'raise' && d < 160) {
      this.minions = this.minions.filter(m => !m.dead);
      if (this.minions.length < 2) { this.windup('raise', 0.7); this.abCd = 7; } else this.abCd = 2;
    }
  }

  doAbility(act, ax, ay, d) {
    const p = G.p;
    this.setAnim('attack', 0.2, ax, ay);
    if (act === 'lunge') { this.dash = { t: this.sprite === 'fishman' ? 0.25 : 0.2, vx: ax * 230, vy: ay * 230 }; Sfx.dash(); }
    else if (act === 'swoop') { this.dash = { t: 0.25, vx: ax * 260, vy: ay * 260 }; Sfx.dash(); }
    else if (act === 'charge') { const c = this.chargeDir || { x: ax, y: ay }; this.dash = { t: 0.45, vx: c.x * 220, vy: c.y * 220 }; Sfx.dash(); }
    else if (act === 'pound' || act === 'shock') {
      const r = act === 'pound' ? 36 : 34, col = act === 'shock' ? '#38bdf8' : this.sprite === 'demon' ? '#f97316' : '#a8a29e';
      G.effects.push({ type: 'ring', x: this.x, y: this.y - 4, r: 4, max: r, t: 0.3, color: col });
      burst(this.x, this.y - 4, col, 12);
      if (d < r + 4) hurtPlayer(this.dmg * 1.3, this);
      if (this.sprite === 'demon') for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        G.projectiles.push(new Projectile(this.x, this.y - 6, Math.cos(a) * 80, Math.sin(a) * 80, this.dmg * 0.6, false, '#f97316', 3));
      }
      G.shake = Math.max(G.shake, 2); act === 'shock' ? Sfx.crit() : Sfx.boom();
    } else if (act === 'web') {
      G.projectiles.push(new Projectile(this.x, this.y - 6, ax * 95, ay * 95, this.dmg * 0.4, false, '#f5f5f4', 4, { slow: true }));
      Sfx.shoot();
    } else if (act === 'blink') {
      burst(this.x, this.y - 6, '#f87171', 10);
      for (let k = 0; k < 12; k++) {
        const a = Math.random() * Math.PI * 2, nx = p.x + Math.cos(a) * 26, ny = p.y + Math.sin(a) * 26;
        if (!boxSolid(nx, ny, this.hw, this.hh)) { this.x = nx; this.y = ny; break; }
      }
      burst(this.x, this.y - 6, '#f87171', 10); Sfx.dash();
      this.atkCd = 0.3;
    } else if (act === 'raise') {
      const sk = BIOMES[1].enemies.chaser;
      for (let i = 0; i < 2 - this.minions.length; i++) {
        const e = new Enemy('chaser', this.floor, this.x + rr(-16, 16), this.y + rr(-8, 8), { def: sk, noAbility: true });
        e.aware = true; e.xp = Math.round(e.xp / 3);
        this.minions.push(e); G.enemies.push(e);
        burst(e.x, e.y - 4, '#a855f7', 10);
      }
      Sfx.chest();
    }
  }

  hurt(amount, fromX, fromY, crit) {
    if (this.shellT > 0) { addText(this.x, this.y - 14, 'bloqueou', '#9ca3af', 0.7); Sfx.click(); return; }
    if (this.downT > 0) { // quebrar os ossos antes que levante
      this.downT = 0; this.dead = true; burst(this.x, this.y - 3, '#e5e5d5', 14); Sfx.hit();
      addText(this.x, this.y - 12, 'ossos quebrados!', '#e5e5d5', 0.7);
      onEnemyDeath(this); return;
    }
    this.hp -= amount;
    this.flash = 0.1;
    this.aware = true;
    const d = dist(fromX, fromY, this.x, this.y) || 1;
    const kb = this.type === 'tank' ? 60 : 140;
    this.kx = (this.x - fromX) / d * kb; this.ky = (this.y - fromY) / d * kb;
    this.setAnim('hurt', 0.14);
    if (this.wind > 0 && this.type !== 'tank') this.wind += 0.15; // golpe atrasa a preparação
    addText(this.x, this.y - 14, Math.round(amount) + (crit ? '!' : ''), crit ? '#fde047' : '#ffffff', crit ? 1.3 : 1);
    burst(this.x, this.y - 5, this.pal.a || this.pal.g || '#fff', 4);
    if (this.ability === 'shell' && this.hp > 0 && this.hp < this.maxHp * 0.8 && this.abCd <= 0) {
      this.shellT = 1.5; this.abCd = 5; this.kx = this.ky = 0;
      addText(this.x, this.y - 18, 'casco!', '#fca5a5', 0.8);
    }
    if (this.hp <= 0 && !this.dead) {
      if (this.ability === 'revive' && !this.revived) { this.hp = 0; this.downT = 2.5; this.kx = this.ky = 0; Sfx.die(); return; }
      this.dead = true;
      this.onDeathAbility();
      onEnemyDeath(this);
    }
  }

  onDeathAbility() {
    if (this.ability === 'split' && !this.mini) {
      for (const o of [-8, 8]) {
        const e = new Enemy(this.type, this.floor, this.x + o, this.y, { def: { name: this.name.replace(' (Elite)', '') + ' Pequeno', sprite: this.sprite, pal: this.pal }, mini: true });
        e.aware = true; e.kx = o * 12;
        G.enemies.push(e);
      }
    } else if (this.ability === 'deathburst') {
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        G.projectiles.push(new Projectile(this.x, this.y - 6, Math.cos(a) * 75, Math.sin(a) * 75, this.dmg * 0.7, false, '#fb923c', 3));
      }
      G.effects.push({ type: 'ring', x: this.x, y: this.y - 6, r: 4, max: 24, t: 0.3, color: '#f97316' });
    }
  }

  draw(ctx) {
    // ossos no chão
    if (this.downT > 0) {
      ctx.fillStyle = '#d6d3c4';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(this.x - 6 + (i * 5) % 12), Math.round(this.y - 2 - (i % 2) * 2), 3, 1);
      ctx.fillRect(Math.round(this.x - 2), Math.round(this.y - 5), 4, 3);
      if (Math.sin(G.time * 16) > 0) { ctx.fillStyle = '#a855f7'; ctx.fillRect(Math.round(this.x), Math.round(this.y - 8), 1, 1); }
      return;
    }
    const winding = this.wind > 0;
    const mode = this.flash > 0 ? true : winding && Math.sin(G.time * 40) > 0 ? 'red' : false;
    const spr = getSprite(this.shellT > 0 ? 'crabShell' : this.sprite, this.pal, mode);
    let sx = this.scale, sy = this.scale, ox = 0, oy = 0;
    // animação: caminhar (balanço), atacar (avanço), dano (amassar)
    if (this.moving && !this.dash) { const k = Math.sin(this.t * 14); sy *= 1 + k * 0.06; sx *= 1 - k * 0.04; }
    if (this.type === 'tank' && !this.moving) sy *= 1 + Math.sin(this.t * 4) * 0.04;
    if (this.anim) {
      const k = this.anim.t / this.anim.dur;
      if (this.anim.type === 'attack') { const f = Math.sin(k * Math.PI); ox = this.anim.ax * 4 * f; oy = this.anim.ay * 3 * f; sx *= 1 + 0.18 * f; sy *= 1 - 0.1 * f; }
      if (this.anim.type === 'hurt') { sx *= 1 + 0.18 * k; sy *= 1 - 0.18 * k; }
    }
    if (winding) { ox += rr(-0.8, 0.8); sy *= 0.92; sx *= 1.06; }
    if (this.dash) { sx *= 1.15; sy *= 0.9; }
    const w = spr.width * sx, h = spr.height * sy, baseH = spr.height * this.scale;
    const bob = this.type === 'fast' ? Math.sin(this.t * 10) * 2 - 4 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(this.x, this.y, spr.width * this.scale * 0.32, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    if (this.ability === 'phase') ctx.globalAlpha = 0.55 + Math.sin(this.t * 3) * 0.2;
    ctx.translate(Math.round(this.x + ox), Math.round(this.y - h + 2 + bob + oy));
    if (this.face === -1) ctx.scale(-1, 1);
    ctx.drawImage(spr, -w / 2, 0, w, h);
    ctx.restore();
    if (winding) { // aviso "!" sobre a cabeça
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(Math.round(this.x - 1), Math.round(this.y - baseH - 9 + bob), 2, 5);
      ctx.fillRect(Math.round(this.x - 1), Math.round(this.y - baseH - 3 + bob), 2, 2);
      if (this.windAct === 'charge' && this.chargeDir) {
        ctx.strokeStyle = 'rgba(239,68,68,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(this.x, this.y - 4); ctx.lineTo(this.x + this.chargeDir.x * 99, this.y - 4 + this.chargeDir.y * 99); ctx.stroke();
      }
      if (this.windAct === 'pound' || this.windAct === 'shock') {
        ctx.strokeStyle = 'rgba(239,68,68,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(this.x, this.y - 2, 36, 22, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    if (this.elite) {
      ctx.strokeStyle = 'rgba(250,204,21,0.7)'; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(this.x - w / 2 + ox) - 0.5, Math.round(this.y - h + 2 + bob + oy) - 0.5, w + 1, h + 1);
    }
    if (this.hp < this.maxHp && !this.isBoss) {
      const bw = 12 * this.scale;
      ctx.fillStyle = '#000'; ctx.fillRect(Math.round(this.x - bw / 2), Math.round(this.y - baseH - 1 + bob), bw, 2);
      ctx.fillStyle = this.elite ? '#facc15' : '#ef4444';
      ctx.fillRect(Math.round(this.x - bw / 2), Math.round(this.y - baseH - 1 + bob), bw * Math.max(0, this.hp / this.maxHp), 2);
    }
  }
}

// ---------- Restos de inimigos (animação de morte) ----------
function addCorpse(e) {
  G.corpses.push({ sprite: e.sprite, pal: e.pal, x: e.x, y: e.y, scale: e.scale, face: e.face || 1, t: 0.45, fly: e.type === 'fast' });
}
function drawCorpses(ctx, dt) {
  for (const c of G.corpses) {
    const k = 1 - c.t / 0.45;
    const spr = getSprite(c.sprite, c.pal, k < 0.25);
    const w = spr.width * c.scale, h = spr.height * c.scale;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - k * 1.1);
    ctx.translate(Math.round(c.x), Math.round(c.y - 2 + (c.fly ? k * 6 : 0)));
    ctx.rotate(c.face * k * 1.4);
    ctx.scale(c.face * (1 + k * 0.2), 1 - k * 0.5);
    ctx.drawImage(spr, -w / 2, -h, w, h);
    ctx.restore();
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
    if (!this.aware) { if (d < 150) { this.aware = true; G.boss = this; UI.toast(`${this.name} desperta!`, '#f87171'); Sfx.boom(); Music.play('boss'); bossIntro(this); } else return; }
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
    const path = this.canSee(dt, d) ? null : flowDir(this);
    moveBody(this, (path ? path.x : ax) * this.spd * dt, (path ? path.y : ay) * this.spd * dt);
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
    this.setAnim('hurt', 0.1);
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
      if (h.kind !== 'fire') {
        G.effects.push({ type: 'ring', x: h.x, y: h.y, r: 3, max: h.r, t: 0.25, color: h.color });
        burst(h.x, h.y - 3, h.color, 6);
      }
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
    this.homing = !!opts.homing; this.slow = !!opts.slow;
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
    if (this.homing) { // orbe da sereia persegue devagar
      const a = Math.atan2(p.y - 6 - this.y, p.x - this.x), sp = Math.hypot(this.vx, this.vy);
      const cur = Math.atan2(this.vy, this.vx);
      let da = a - cur; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
      const na = cur + clamp(da, -2 * dt, 2 * dt);
      this.vx = Math.cos(na) * sp; this.vy = Math.sin(na) * sp;
    }
    if (dist(this.x, this.y, p.x, p.y - 6) < 6 + this.size) {
      this.dead = true;
      if (this.slow) { p.slowT = 2.2; p.slowMul = 0.45; addText(p.x, p.y - 18, 'preso na teia!', '#f5f5f4', 0.7); }
      hurtPlayer(this.dmg, null);
    }
  }
  end() {
    this.dead = true;
    if (this.explode) areaDamage(this.x, this.y, this.explode, this.dmg, this.color);
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    if (this.slow) { // teia
      const x = Math.round(this.x), y = Math.round(this.y);
      ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 2, y - 2, 1, 1); ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1); ctx.fillRect(x - 2, y + 2, 1, 1);
      return;
    }
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
  p.hurtT = 0.3;
  if (p.recall) cancelReturn('Retorno interrompido: você levou dano!');
  if (Input.lastDevice === 'pad') Input.rumble(dmg > st.maxHp * 0.15 ? 220 : 110, dmg > st.maxHp * 0.15 ? 0.9 : 0.45);
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
  hitSecretWall(aimAngle);
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
