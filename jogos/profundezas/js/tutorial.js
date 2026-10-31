// =============================================================
// Tutorial: dicas que aparecem uma vez, quando a situação acontece.
// Os nomes dos botões mudam conforme o aparelho (teclado, controle, toque).
// =============================================================
'use strict';

const KEYNAMES = {
  move:    { keyboard: 'WASD ou setas',      pad: 'analógico esquerdo',  touch: 'o analógico à esquerda' },
  attack:  { keyboard: 'J ou clique',        pad: 'A',                   touch: '⚔' },
  dodge:   { keyboard: 'Espaço',             pad: 'B',                   touch: '»' },
  use:     { keyboard: 'E',                  pad: 'X',                   touch: 'E' },
  potion:  { keyboard: 'Q',                  pad: 'Y',                   touch: '♥' },
  food:    { keyboard: 'F',                  pad: 'LT',                  touch: 'a mochila' },
  scroll:  { keyboard: 'R',                  pad: 'clique no analógico esquerdo', touch: 'a mochila' },
  bag:     { keyboard: 'I',                  pad: 'View',                touch: '▤' },
  skills:  { keyboard: 'H',                  pad: 'clique no analógico direito', touch: '✦' },
  skill1:  { keyboard: '1, 2 e 3',           pad: 'LB, RB e RT',         touch: 'os botões roxos' },
  aim:     { keyboard: 'o mouse',            pad: 'o analógico direito', touch: 'a direção em que você anda' },
};
function K(action) {
  const dev = Input.lastDevice === 'pad' ? 'pad' : Input.isTouch ? 'touch' : 'keyboard';
  return `<b>${KEYNAMES[action][dev]}</b>`;
}

const Tips = {
  seen: {}, enabled: true, queue: [], cur: null, t: 0, checkT: 0,

  init() {
    try {
      const d = JSON.parse(localStorage.getItem('profundezas_dicas') || '{}');
      this.seen = d.seen || {}; this.enabled = d.enabled !== false;
    } catch (e) { /* sem armazenamento */ }
  },
  save() { try { localStorage.setItem('profundezas_dicas', JSON.stringify({ seen: this.seen, enabled: this.enabled })); } catch (e) { /* ignora */ } },
  toggle() { this.enabled = !this.enabled; if (!this.enabled) this.hide(); this.queue = []; this.save(); return this.enabled; },
  reset() { this.seen = {}; this.enabled = true; this.save(); },

  show(id, title, html) {
    if (!this.enabled || this.seen[id]) return;
    if (this.queue.some(q => q.id === id) || (this.cur && this.cur.id === id)) return;
    this.queue.push({ id, title, html: typeof html === 'function' ? html : () => html });
  },

  hide() { this.cur = null; document.getElementById('tip').classList.add('hidden'); },

  update(dt) {
    if (this.cur) {
      this.t -= dt;
      if (this.t <= 0) this.hide();
      return;
    }
    if (!this.queue.length) return;
    const q = this.queue.shift();
    this.seen[q.id] = true; this.save();
    this.cur = q; this.t = 7.5;
    const el = document.getElementById('tip');
    el.innerHTML = `<p class="tt">${q.title}</p><p>${q.html()}</p>`;
    el.classList.remove('hidden');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  },

  // Confere situações na masmorra (algumas vezes por segundo)
  check(dt) {
    this.checkT -= dt;
    if (this.checkT > 0 || !this.enabled) return;
    this.checkT = 0.3;
    const p = G.p, L = G.level, st = playerStats(p);
    const near = (x, y, r) => dist(x, y, p.x, p.y) < r;
    const foes = G.enemies.filter(e => !e.dead && !e.isProp);
    if (foes.some(e => e.aware && near(e.x, e.y, 110)))
      this.show('combat', 'Combate', () => `Ataque com ${K('attack')} e mire com ${K('aim')}. Esquive com ${K('dodge')}: durante a esquiva você não leva dano.`);
    if (foes.some(e => e.wind > 0 && near(e.x, e.y, 130)))
      this.show('windup', 'Golpe especial!', () => `Um inimigo tremendo, vermelho e com <b>!</b> na cabeça vai usar um golpe especial. Esquive com ${K('dodge')} ou saia de perto.`);
    if (foes.some(e => e.elite && near(e.x, e.y, 110)))
      this.show('elite', 'Inimigo de elite', 'Inimigos com moldura dourada são mais fortes, mas sempre deixam um item raro ou melhor.');
    if (G.drops.some(d => d.item && near(d.x, d.y, 70)))
      this.show('loot', 'Itens no chão', () => `Passe por cima para pegar. A cor mostra a raridade: branco, verde, azul, roxo e dourado. Abra a mochila com ${K('bag')} para equipar.`);
    if (G.chests.some(c => !c.open && near(c.x, c.y, 80)))
      this.show('chest', 'Baú', 'Encoste no baú para abrir. Cuidado: a partir do andar 3, alguns baús são mímicos.');
    if (L.stairs && near(L.stairs.x, L.stairs.y, 110))
      this.show('stairs', 'Escada', () => `Aperte ${K('use')} na escada para descer. Cada andar descido aumenta o cansaço.`);
    if (foes.length && G.enemies.some(e => e.isProp && !e.dead && near(e.x, e.y, 80)))
      this.show('barrel', 'Barril explosivo', 'Acerte o barril e afaste-se: ele explode, fere todos por perto e pode explodir outros barris. Atraia os inimigos até ele!');
    if (G.spikes.some(s => near(s.x, s.y, 70)))
      this.show('spikes', 'Espinhos', 'Os espinhos sobem e descem. Observe o ritmo e passe quando estiverem embaixo. Eles também ferem os inimigos.');
    if (L.secret && !L.secret.open && near(L.secret.gate.x * TILE + 8, L.secret.gate.y * TILE + 8, 90))
      this.show('secret', 'Parede rachada', () => `Essa parede tem rachaduras. Ataque ela 3 vezes com ${K('attack')} para abrir uma passagem secreta.`);
    for (const pr of G.props) {
      if (!near(pr.x, pr.y, 90)) continue;
      if (pr.type === 'campfire' && !pr.used) this.show('campfire', 'Fogueira', () => `Aperte ${K('use')} para descansar: tira metade do cansaço e recupera vida. Só funciona uma vez.`);
      if (pr.type === 'shrine' && !pr.used) this.show('shrine', 'Santuário', () => `Ore com ${K('use')} para receber uma bênção que dura até você sair do andar.`);
      if (pr.type === 'merchant') this.show('merchant', 'Mercador errante', () => `Aperte ${K('use')} para comprar. Ele cobra mais caro que a vila, mas sempre traz um item raro.`);
      if (pr.type === 'pedestal' && !pr.used) this.show('pedestal', 'Sala de desafio', () => `Aperte ${K('use')} na caveira para chamar uma leva de inimigos. Derrote todos e ganhe um baú especial.`);
      if (pr.type === 'elevator') this.show('elevator', 'Elevador', () => `Chegou a um elevador! Aperte ${K('use')} para voltar à vila. De lá, você pode descer direto para este andar.`);
    }
    if (G.tombEnt) this.show('tomb', 'Sua lápide', 'Seus itens perdidos estão na lápide deste andar. Encoste nela para recuperar tudo.');
    if (G.boss && G.boss.aware) this.show('boss', 'Chefe!', 'Cada chefe tem ataques próprios. Círculos vermelhos no chão mostram onde o golpe vai cair. Na metade da vida, ele fica furioso.');
    if (p.hp < st.maxHp * 0.35) this.show('lowhp', 'Vida baixa', () => `Use uma poção com ${K('potion')}. Se as poções acabarem, leia o Pergaminho de Retorno (${K('scroll')}) para voltar à vila com o loot.`);
    if (p.hunger < 40) this.show('hunger', 'Fome', () => `A fome está baixando. Coma com ${K('food')}. Se zerar, você perde vida aos poucos.`);
    if (p.fatigue >= 60) this.show('fatigue', 'Cansaço', 'Com 80 de cansaço, seu dano e velocidade caem 20%. Descanse numa fogueira ou durma na estalagem da vila.');
    if (p.points > 0) this.show('attrs', 'Subiu de nível!', () => `Você tem pontos de atributo. Abra a mochila com ${K('bag')} e clique em <b>+</b> para distribuir.`);
    if ((p.skillPts || 0) > 0) this.show('skills', 'Ponto de habilidade!', () => `A cada 5 níveis você ganha um ponto. Abra as habilidades com ${K('skills')} e use-as com ${K('skill1')}.`);
    if (p.bag.length >= p.bagSize) this.show('bagfull', 'Mochila cheia', 'Volte à vila para vender tesouros, guarde itens no baú ou aumente a mochila no alfaiate. Se morrer, você perde tudo o que está na mochila.');
    if (p.slowT > 0) this.show('slow', 'Você está lento', 'Teias e golpes de zumbi deixam você lento por alguns segundos. Afaste-se e espere passar.');
  },
};
