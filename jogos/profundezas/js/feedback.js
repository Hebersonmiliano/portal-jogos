// =============================================================
// "Dar opinião": formulário curto para quem testa o jogo.
// Junta as respostas com dados da partida (classe, andar, mortes, tempo)
// num texto pronto para copiar e mandar ao professor.
// =============================================================
'use strict';

const FB_LIKES = ['Combate', 'Armas e classes', 'Loot e equipamento', 'Conjuntos', 'Asas', 'Habilidades', 'Vila e história', 'Alquimista e joalheiro', 'Chefes', 'Música'];
const FB_HARD = ['Nada', 'Chefes', 'Inimigos comuns', 'Fome e cansaço', 'Entender os itens', 'Controles', 'Mochila cheia', 'Achar o Guardião da Chave'];
const FB_LEVEL = ['Muito fácil', 'Fácil', 'Na medida', 'Difícil', 'Muito difícil'];

// ---------- Dados da partida ----------
function fbTrackDeath(p) {
  p.deaths = (p.deaths || 0) + 1;
  p.deathLog = (p.deathLog || []).concat([{ f: G.level ? G.level.floor : p.floor, by: p.lastHitBy || '?' }]).slice(-12);
}
function fbTrackTime(dt) { if (G.p && (G.state === 'dungeon' || G.state === 'village')) G.p.playTime = (G.p.playTime || 0) + dt; }
function fbTime(s) { const m = Math.round((s || 0) / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; }

function fbGameLine(p) {
  if (!p) return 'Ainda não jogou.';
  const cls = p.cls ? CLASS_INFO[p.cls].name : 'sem classe';
  const deaths = p.deaths ? `${p.deaths} (${(p.deathLog || []).slice(-4).map(d => `andar ${d.f}: ${d.by}`).join('; ')})` : '0';
  return `${cls} nível ${p.level} · andar mais fundo ${p.maxFloor || 1} · chefes ${(p.beaten || []).length} · mortes ${deaths} · tempo ${fbTime(p.playTime)}`;
}

// ---------- Formulário ----------
const FB = { nota: 0, likes: [], hard: [], level: '', name: '', text: '' };

function feedbackMenu(back) {
  const p = G.p || (typeof hasSave === 'function' && hasSave() ? loadGame() : null);
  const chips = (list, sel, act) => list.map(x => `<button class="fbchip ${sel.includes(x) ? 'on' : ''}" data-act="${act}" data-arg="${x}" aria-pressed="${sel.includes(x)}">${x}</button>`).join('');
  UI.show(`<h2>Dar opinião</h2>
    <p class="mtext">Leva 1 minuto. No fim, aperte <b>Copiar respostas</b> e envie para o professor.</p>
    <div class="fb">
      <label class="fbq" for="fbName">Seu nome ou turma <small>(opcional)</small></label>
      <input id="fbName" class="fbin" maxlength="40" value="${FB.name.replace(/"/g, '&quot;')}" placeholder="Ex.: Ana · 2º ano">
      <p class="fbq">Que nota você dá para o jogo?</p>
      <div class="fbrow">${[1, 2, 3, 4, 5].map(n => `<button class="fbstar ${FB.nota >= n ? 'on' : ''}" data-act="nota" data-arg="${n}" aria-label="Nota ${n}">★</button>`).join('')}</div>
      <p class="fbq">O que você mais gostou? <small>(pode marcar vários)</small></p>
      <div class="fbrow">${chips(FB_LIKES, FB.likes, 'like')}</div>
      <p class="fbq">O que foi mais difícil?</p>
      <div class="fbrow">${chips(FB_HARD, FB.hard, 'hard')}</div>
      <p class="fbq">A dificuldade está...</p>
      <div class="fbrow">${chips(FB_LEVEL, [FB.level], 'level')}</div>
      <label class="fbq" for="fbText">Sugestão, problema ou ideia</label>
      <textarea id="fbText" class="fbin" rows="3" maxlength="500" placeholder="Ex.: o chefe do andar 20 é rápido demais">${FB.text.replace(/</g, '&lt;')}</textarea>
      <p class="fbauto"><b>Sua partida (vai junto):</b> ${fbGameLine(p)}</p>
      <textarea id="fbOut" class="fbin fbout" rows="6" readonly hidden></textarea>
      <div class="acts"><button data-act="copy" class="fbcopy">Copiar respostas</button><button data-act="close">Voltar</button></div>
    </div>`, {
    cls: 'fbpanel',
    onBack: () => { fbSave(); back(); },
    actions: {
      nota: n => { FB.nota = +n; document.querySelectorAll('.fbstar').forEach(e => e.classList.toggle('on', +e.dataset.arg <= FB.nota)); },
      like: (x, el) => { FB.likes = FB.likes.includes(x) ? FB.likes.filter(y => y !== x) : FB.likes.concat([x]); fbPaint('like', FB.likes); },
      hard: x => { if (x === 'Nada') FB.hard = FB.hard.includes('Nada') ? [] : ['Nada']; else FB.hard = (FB.hard.includes(x) ? FB.hard.filter(y => y !== x) : FB.hard.concat([x])).filter(y => y !== 'Nada'); fbPaint('hard', FB.hard); },
      level: x => { FB.level = FB.level === x ? '' : x; fbPaint('level', [FB.level]); },
      copy: () => { fbSave(); fbCopy(p); },
      close: () => { fbSave(); back(); },
    },
  });
}
function fbPaint(act, sel) { document.querySelectorAll(`.fbchip[data-act="${act}"]`).forEach(e => { const on = sel.includes(e.dataset.arg); e.classList.toggle('on', on); e.setAttribute('aria-pressed', on); }); }
function fbSave() {
  const n = document.getElementById('fbName'), t = document.getElementById('fbText');
  if (n) FB.name = n.value.trim();
  if (t) FB.text = t.value.trim();
}
function fbText(p) {
  return [
    `Profundezas ${VERSION} · opinião de ${FB.name || 'anônimo'}`,
    `Nota: ${FB.nota ? FB.nota + '/5' : 'sem nota'} · Dificuldade: ${FB.level || 'não marcou'}`,
    `Gostei: ${FB.likes.join(', ') || '—'}`,
    `Difícil: ${FB.hard.join(', ') || '—'}`,
    `Sugestão: ${FB.text || '—'}`,
    `Partida: ${fbGameLine(p)}`,
  ].join('\n');
}
function fbCopy(p) {
  const txt = fbText(p);
  const out = document.getElementById('fbOut');
  const showText = msg => { out.hidden = false; out.value = txt; out.focus(); out.select(); UI.toast(msg, '#fde68a'); };
  try {
    navigator.clipboard.writeText(txt).then(() => { UI.toast('Respostas copiadas! Cole na mensagem para o professor. Obrigado!', '#4ade80'); Sfx.level(); out.hidden = false; out.value = txt; },
      () => showText('Não deu para copiar sozinho: o texto está selecionado, aperte Ctrl+C (ou segure e copie no celular).'));
  } catch (e) { showText('Não deu para copiar sozinho: o texto está selecionado, aperte Ctrl+C (ou segure e copie no celular).'); }
}
