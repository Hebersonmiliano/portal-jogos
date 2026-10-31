// =============================================================
// História (Ancião e capítulos dos chefes) e quadro de missões
// =============================================================
'use strict';

// ---------- História ----------
const STORY = {
  intro: {
    title: 'A Chama do Fundo',
    text: 'Há trinta anos, a Chama do Fundo, o fogo antigo que aquece Pedra Funda por baixo da terra, começou a enfraquecer. Desde então, monstros sobem pela velha mina sob a torre, e os mineiros que desceram para reacendê-la nunca voltaram.<br><br>Você é o último explorador da vila. Desça, descubra o que está apagando a Chama e volte vivo para contar.',
  },
  chapters: [
    { floor: 10, title: 'Capítulo 1: A coroa morna', text: 'Na coroa do Rei Goblin havia uma brasa ainda quente. Os goblins não estavam atacando a vila: estavam fugindo de algo mais fundo, e levaram um pedaço da Chama com eles.' },
    { floor: 20, title: 'Capítulo 2: O recado do mineiro', text: 'Dentro do Verme de Pedra, você encontra a picareta de Aldo, o mineiro-chefe. Na madeira, um recado riscado com pressa: "A Chama não está apagando. Alguém está bebendo dela."' },
    { floor: 30, title: 'Capítulo 3: Os murais afogados', text: 'As ruínas eram de um povo que guardava a Chama. Os murais mostram uma figura coroada descendo as escadas com o fogo nas mãos... e nenhum mural mostra a volta.' },
    { floor: 40, title: 'Capítulo 4: O rei que não quis morrer', text: 'O Lich era o rei dos murais. Ele roubou a Chama para viver para sempre, mas ela escapou de suas mãos e caiu no Abismo. O que vive lá embaixo cresceu bebendo do fogo.' },
    { floor: 50, title: 'Epílogo: Pedra Funda acesa', text: 'O Senhor do Abismo se desfaz em cinzas e a Chama do Fundo volta a arder. Lá em cima, as janelas de Pedra Funda se acendem pela primeira vez em trinta anos.<br><br>Mas o chão ainda treme. Abaixo do Abismo, as Profundezas Infinitas esperam por quem tiver coragem.' },
  ],
  // O que o Ancião diz conforme o progresso
  elder(p) {
    const b = p.beaten || [];
    if (!b.includes(10)) return { goal: 'Derrote o Rei Goblin no andar 10.', talk: '"Os goblins sobem cada vez mais. Algo os expulsa lá de baixo. Encontre o rei deles no andar 10 e descubra o que é."' };
    if (!b.includes(20)) return { goal: 'Derrote o Verme de Pedra no andar 20.', talk: '"Uma brasa da Chama, nas mãos de um goblin... Então ela foi levada. Os mineiros de Aldo cavaram até o andar 20. Procure por eles."' };
    if (!b.includes(30)) return { goal: 'Derrote a Hidra das Marés no andar 30.', talk: '"Alguém bebendo da Chama? Abaixo das minas ficam as ruínas do povo antigo. Eles sabiam mais do que nós. Desça até o andar 30."' };
    if (!b.includes(40)) return { goal: 'Derrote o Lich Ancestral no andar 40.', talk: '"Um rei que desceu com o fogo e nunca voltou... As lendas falam da Cripta, no andar 40. Tome cuidado: o que está morto lá embaixo não descansa."' };
    if (!b.includes(50)) return { goal: 'Derrote o Senhor do Abismo no andar 50.', talk: '"Então é isso. A Chama caiu no Abismo e alimenta uma criatura. Ela está no andar 50. Pedra Funda inteira está com você."' };
    return { goal: 'Explore as Profundezas Infinitas (além do andar 50).', talk: `"A Chama voltou a arder graças a você. Dizem que abaixo do Abismo os andares não acabam nunca. Seu recorde é o andar ${p.maxFloor}. Até onde você vai?"` };
  },
};

function showStory(title, text, after) {
  UI.menu({ title, text, cls: 'story', items: [{ label: 'Continuar', act: () => { UI.close(); if (after) after(); } }] });
}

// Chamado quando um chefe cai pela primeira vez
function storyOnBoss(floor) {
  const ch = STORY.chapters.find(c => c.floor === floor);
  if (!ch) return;
  setTimeout(() => {
    if (G.state !== 'dungeon') return;
    showStory(ch.title, ch.text + (floor === MAX_FLOOR ? '' : '<br><br><small>O Ancião vai querer ouvir isso. Volte à vila quando puder.</small>'), floor === MAX_FLOOR ? () => showVictory() : null);
  }, 1600);
}

// ---------- Missões ----------
const GIVERS = ['Bruno, o ferreiro', 'Marta, a estalajadeira', 'Joana, a mercadora', 'Pedrinho', 'Ancião Tobias', 'Lia, a alfaiate'];
const MAX_QUESTS = 3;

function questTier(p) { return Math.max(1, p.maxFloor || 1); }

function genQuest(p) {
  const f = questTier(p);
  const bi = Math.min(biomeOf(f).idx, 4);
  const giver = pick(GIVERS);
  const types = ['kill', 'kill', 'treasure', 'chests', 'elites', 'depth'];
  if (f >= 2) types.push('challenge');
  if (f >= 3) types.push('secret');
  const type = pick(types);
  const q = { id: uid(), type, giver, count: 0, done: false, tier: f };
  if (type === 'kill') {
    const b = BIOMES[Math.max(0, bi - (Math.random() < 0.3 ? 1 : 0))];
    const t = pick(['chaser', 'fast', 'tank', 'shooter']);
    q.target = b.enemies[t].name; q.need = 8 + ri(8);
    q.text = `Derrote ${q.need}× ${q.target} (${b.name}).`;
  } else if (type === 'treasure') {
    q.target = pick(TREASURES).name; q.need = 2 + ri(3);
    q.text = `Encontre ${q.need}× ${q.target} na masmorra.`;
  } else if (type === 'chests') { q.need = 4 + ri(5); q.text = `Abra ${q.need} baús.`; }
  else if (type === 'elites') { q.need = 2 + ri(3); q.text = `Derrote ${q.need} inimigos de elite.`; }
  else if (type === 'secret') { q.need = 1 + ri(2); q.text = `Encontre ${q.need} ${q.need > 1 ? 'salas secretas' : 'sala secreta'} (paredes rachadas).`; }
  else if (type === 'challenge') { q.need = 1; q.text = 'Vença uma sala de desafio.'; }
  else { q.need = 1; q.target = Math.min(f + 3 + ri(3), f > MAX_FLOOR ? f + 6 : f + 5); q.text = `Chegue ao andar ${q.target}.`; }
  const mult = { kill: 1, treasure: 1.1, chests: 1, elites: 1.3, secret: 1.4, challenge: 1.5, depth: 1.3 }[type];
  q.gold = Math.round((50 + 12 * f) * mult);
  q.xp = Math.round(25 * Math.pow(f, 1.35) * mult);
  q.itemRarity = Math.random() < 0.4 ? 2 : 1;
  return q;
}

function ensureQuests(p) {
  if (!Array.isArray(p.quests)) p.quests = [];
  while (p.quests.length < MAX_QUESTS) p.quests.push(genQuest(p));
}

// Eventos do jogo que fazem as missões andarem
function questEvent(type, data) {
  const p = G.p;
  if (!p || !p.quests) return;
  for (const q of p.quests) {
    if (q.done) continue;
    let add = 0;
    if (type === 'kill' && q.type === 'kill' && data.name && data.name.replace(' (Elite)', '').replace(' Pequeno', '') === q.target) add = 1;
    if (type === 'kill' && q.type === 'elites' && data.elite) add = 1;
    if (type === 'treasure' && q.type === 'treasure' && data.name === q.target) add = 1;
    if (type === 'chest' && q.type === 'chests') add = 1;
    if (type === 'secret' && q.type === 'secret') add = 1;
    if (type === 'challenge' && q.type === 'challenge') add = 1;
    if (type === 'floor' && q.type === 'depth' && data.floor >= q.target) add = 1;
    if (!add) continue;
    q.count = Math.min(q.need, q.count + add);
    if (q.count >= q.need) {
      q.done = true;
      UI.toast(`Missão cumprida: ${q.text} Volte ao quadro da vila para receber.`, '#4ade80');
      Sfx.level();
    }
  }
}

function claimQuest(p, q) {
  p.gold += q.gold;
  gainXp(q.xp);
  const item = genItem(questTier(p), q.itemRarity, null, playerStats(p).luck);
  const where = bagAdd(p.bag, p.bagSize, item) ? 'na mochila' : (p.stash.length < 30 ? (p.stash.push(item), 'no baú') : null);
  p.questsDone = (p.questsDone || 0) + 1;
  p.quests = p.quests.filter(x => x !== q);
  ensureQuests(p);
  saveGame();
  Sfx.rare();
  UI.toast(`Recompensa: ${q.gold} ouro, ${q.xp} XP${where ? ` e ${item.name} (${RARITIES[item.rarity].name}) ${where}` : ''}.`, '#facc15');
}

function questBoard() {
  const p = G.p;
  ensureQuests(p);
  const items = p.quests.map(q => ({
    label: `${q.done ? '✔ ' : ''}${q.text}`,
    color: q.done ? '#4ade80' : null,
    sub: `${q.giver} · ${q.done ? 'pronto para entregar!' : `${q.count}/${q.need}`} · recompensa: ${q.gold} ouro, ${q.xp} XP e um item ${RARITIES[q.itemRarity].name.toLowerCase()}`,
    right: q.done ? 'Entregar' : 'Trocar',
    act: () => {
      if (q.done) { claimQuest(p, q); questBoard(); return; }
      p.quests = p.quests.filter(x => x !== q); ensureQuests(p); saveGame(); questBoard();
    },
  }));
  UI.menu({
    title: 'Quadro de Missões',
    text: `Pedidos dos moradores de Pedra Funda. Escolha "Trocar" para pegar outro pedido no lugar. Missões entregues: ${p.questsDone || 0}.`,
    items, back: () => villageMenu(),
  });
}

function elderMenu() {
  const p = G.p, e = STORY.elder(p);
  const chapters = STORY.chapters.filter(c => (p.beaten || []).includes(c.floor));
  UI.menu({
    title: 'Ancião Tobias',
    text: `${e.talk}<br><br><span style="color:#fde68a">Objetivo: ${e.goal}</span>`,
    items: [
      { label: 'Ouvir a história de novo', sub: 'Como tudo começou', act: () => showStory(STORY.intro.title, STORY.intro.text, elderMenu) },
      ...chapters.map(c => ({ label: c.title, sub: 'Capítulo já descoberto', act: () => showStory(c.title, c.text, elderMenu) })),
    ],
    back: () => villageMenu(),
  });
}

// Rastreador de missões no HUD
function updateQuestTracker() {
  const el = document.getElementById('questTracker');
  if (!el || !G.p || !G.p.quests) return;
  const p = G.p, e = STORY.elder(p);
  const html = `<p class="goal">${e.goal}</p>` + p.quests.map(q => `<p class="${q.done ? 'ok' : ''}">${q.done ? '✔' : '•'} ${q.type === 'depth' ? `Andar ${q.target}` : q.text.replace(/ \(.*\)/, '').replace(/\.$/, '')} ${q.done ? '' : `<b>${q.count}/${q.need}</b>`}</p>`).join('');
  if (el.innerHTML !== html) el.innerHTML = html;
}
