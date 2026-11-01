// =============================================================
// Fim de jogo: chefes corrompidos nas Profundezas Infinitas (andares 60 a 90),
// a Chama Corrompida no andar 100, recompensas exclusivas e recordes.
// =============================================================
'use strict';

const FINAL_FLOOR = 100;
const CORRUPT_NAMES = ['Rei Goblin Corrompido', 'Verme de Pedra Corrompido', 'Hidra das Marés Corrompida', 'Lich Ancestral Corrompido', 'Senhor do Abismo Corrompido'];
const FINAL_BOSS = {
  name: 'Chama Corrompida', kind: 5, sprite: 'b_abyss',
  pal: { h: '#3b0764', g: '#a21caf', e: '#ffffff', f: '#f0abfc', c: '#1e1b4b', d: '#0f0a1e', w: '#701a75' },
};
// Movimentos extras: cada chefe corrompido ganha um ataque novo e uma 3ª fase
const CORRUPT_MOVE = ['eliteSummon', 'lavaHoles', 'fourHeads', 'doubleSpiral', 'meteorRing'];
const FINAL_MOVES = {
  p1: ['volley', 'rocks', 'streams', 'spiral', 'meteors', 'slam'],
  p2: ['volley', 'charge', 'streams', 'spiral', 'lava', 'meteors', 'wave', 'blink'],
  p3: ['meteorRing', 'doubleSpiral', 'fourHeads', 'lavaHoles', 'eliteSummon', 'charge', 'wave'],
};
const FINAL_TAUNT = [
  'Você chegou fundo, pequena brasa. Mais fundo que o rei.',
  'Eu sou o que sobrou da Chama quando ele a bebeu: fome, fogo e mais nada.',
  'Cada chefe que você venceu era um pedaço de mim. Agora venha buscar o resto.',
];
const FINAL_STORY = {
  title: 'O Coração da Chama',
  text: 'A Chama Corrompida se desfaz em faíscas violetas, que sobem pelos cem andares até a superfície. Em Pedra Funda, a fonte ferve de calor e as janelas brilham como nunca. A última parte da Chama, a que o rei roubou há séculos, voltou para casa.<br><br>Você é agora o <b>Guardião da Chama</b>. As Profundezas continuam abaixo de você, para quem quiser descer ainda mais.',
};

// Paleta "corrompida": puxa todas as cores para violeta escuro
function corruptPal(pal) {
  const out = {};
  for (const k in pal) {
    const c = pal[k];
    const n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const mix = (a, t) => Math.round(a * 0.55 + t * 0.45);
    out[k] = '#' + [mix(r, 76), mix(g, 29), mix(b, 149)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  if (pal.e) out.e = '#f0abfc'; // olhos brilhando
  return out;
}

// Ajusta um chefe recém-criado (chamado no construtor de Boss)
function setupEndgameBoss(boss, floor) {
  if (floor <= MAX_FLOOR) return;
  boss.corrupt = true;
  if (floor === FINAL_FLOOR) {
    boss.final = true; boss.kind = 5;
    boss.name = FINAL_BOSS.name; boss.sprite = FINAL_BOSS.sprite; boss.pal = FINAL_BOSS.pal;
    boss.maxHp = Math.round(boss.maxHp * 1.9); boss.scale = 2.7; boss.r = 17;
    boss.proj = '#f0abfc';
  } else {
    boss.name = CORRUPT_NAMES[boss.kind] || boss.name;
    boss.pal = corruptPal(boss.pal);
    boss.maxHp = Math.round(boss.maxHp * 1.3);
    boss.proj = '#d946ef';
  }
  boss.hp = boss.maxHp;
}

// Escolhe o próximo ataque de um chefe corrompido ou final (null = usar os normais)
function endgameMove(boss) {
  if (!boss.corrupt) return null;
  if (boss.phase < 3 && boss.hp < boss.maxHp * 0.33) {
    boss.phase = 3; boss.spd = 52;
    UI.toast(`${boss.name}: terceira fase!`, '#f0abfc');
    G.shake = 8; Sfx.boom(); burst(boss.x, boss.y - 18, '#f0abfc', 30);
    G.effects.push({ type: 'ring', x: boss.x, y: boss.y - 10, r: 6, max: 70, t: 0.5, color: '#f0abfc' });
  }
  if (boss.final) return pick(boss.phase === 3 ? FINAL_MOVES.p3 : boss.phase === 2 ? FINAL_MOVES.p2 : FINAL_MOVES.p1);
  const base = BOSS_MOVES[boss.kind];
  if (boss.phase === 3) return Math.random() < 0.3 ? CORRUPT_MOVE[boss.kind] : pick(base.p2);
  if (boss.phase === 2 && Math.random() < 0.25) return CORRUPT_MOVE[boss.kind];
  return null;
}
function endgameCooldown(boss) { return boss.phase === 3 ? 1.5 : boss.phase === 2 ? 1.9 : 2.6; }

// Ataques novos (chamado por Boss.start; retorna true se tratou o ataque)
function endgameStart(boss, act) {
  const p = G.p;
  if (act === 'eliteSummon') {
    if (G.enemies.filter(e => !e.dead && e.elite).length >= 4) { boss.ring(12, 80); return true; } // já tem elites demais
    for (const t of ['shooter', 'chaser']) {
      const e = new Enemy(t, boss.floor, boss.x + rr(-26, 26), boss.y + rr(-14, 14), { elite: true });
      e.aware = true; e.xp = Math.round(e.xp / 3);
      G.enemies.push(e);
    }
    burst(boss.x, boss.y - 10, '#d946ef', 18); Sfx.boom();
    return true;
  }
  if (act === 'lavaHoles') {
    const n = boss.phase === 3 ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      addHazard(p.x + Math.cos(a) * 46, p.y + Math.sin(a) * 34, 20, 0.8, 4, boss.dmg * 0.5, '#f97316', 'lava');
    }
    addHazard(p.x, p.y, 22, 1.2, 3, boss.dmg * 0.5, '#f97316', 'lava');
    G.shake = 4;
    return true;
  }
  if (act === 'fourHeads') { boss.mode = { type: 'streams', t: 1.6, next: 0, shots: 0, heads: 4, max: 16 }; return true; }
  if (act === 'doubleSpiral') { boss.mode = { type: 'spiral', t: 2.4, emit: 0, ang: Math.random() * 6, arms: 4 }; return true; }
  if (act === 'meteorRing') {
    const n = 10;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; addHazard(p.x + Math.cos(a) * 52, p.y + Math.sin(a) * 40, 20, 0.6 + i * 0.07, 0, boss.dmg * 1.1, '#e879f9', 'meteor'); }
    boss.ring(12, 80);
    return true;
  }
  return false;
}

// ---------- Recompensas ----------
function endgameDrops(e, f) {
  const p = G.p;
  if (!e.corrupt) return;
  // conjunto lendário do Guardião da Chama
  const piece = () => {
    const it = genItem(f, 4, pick(SET_KINDS), playerStats(p).luck);
    it.effect = null; it.legendDesc = null; it.set = null;
    const base = (GEAR[it.kind] || ARMORS).slice(-1)[0];
    it.name = base.name; it.rarity = 4;
    it.def = Math.max(1, Math.round(base.def * itemDefMul(f) * 1.5));
    rollSet(it, f, 5);
    it.value = Math.round(itemValue(it) * 2);
    return it;
  };
  G.drops.push(makeDrop(e.x + 18, e.y - 8, piece(), 0.5));
  if (e.final || Math.random() < 0.35) G.drops.push(makeDrop(e.x - 18, e.y - 8, piece(), 0.5));
  if (e.final) {
    const first = !p.flameKeeper;
    if (first) {
      p.flameKeeper = true; p.title = 'Guardião da Chama'; p.time100 = Math.round(p.playTime || 0);
      G.drops.push(makeDrop(e.x, e.y - 20, makeWings(6, f), 0.5));
      setTimeout(() => { if (G.state === 'dungeon') showStory(FINAL_STORY.title, FINAL_STORY.text, null, 'ch5'); }, 1800);
      setTimeout(() => UI.toast('Você ganhou as Asas da Chama e o título Guardião da Chama!', '#f0abfc'), 1200);
    }
  }
}
// Recordes
function endgameRecords(p, f) {
  if (f === MAX_FLOOR && !p.time50) p.time50 = Math.round(p.playTime || 0);
}
function recordsLine(p) {
  const parts = [`andar mais fundo ${p.maxFloor || 1}`];
  if (p.time50) parts.push(`andar 50 em ${fbTime(p.time50)}`);
  if (p.time100) parts.push(`andar 100 em ${fbTime(p.time100)}`);
  return parts.join(' · ');
}

// Renascer do conjunto do Guardião (4 peças): uma vez por andar
function endgameCheatDeath(p) {
  if (!setHas(p, 5, 4) || p.reviveUsed) return false;
  p.reviveUsed = true;
  const st = playerStats(p);
  p.hp = st.maxHp * 0.4; p.iframes = 1.5;
  burst(p.x, p.y - 6, '#f0abfc', 30); Sfx.level();
  G.effects.push({ type: 'ring', x: p.x, y: p.y - 6, r: 4, max: 40, t: 0.5, color: '#f0abfc' });
  UI.toast('O Guardião da Chama renasceu! (uma vez por andar)', '#f0abfc');
  return true;
}
