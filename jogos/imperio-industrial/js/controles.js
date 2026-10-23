'use strict';

const controle = { h: 0, v: 0, agir: false, anterior: [], indice: null, bloquear: false, repeticao: 0, nome: '' };
const ZONA_MORTA_CONTROLE = .22;
function eixosControle() { return { h: controle.h, v: controle.v }; }
function controleAgindo() { return controle.agir; }
function zerarControle() {
  controle.h = controle.v = 0; controle.agir = false; controle.bloquear = true;
}

function mostrarControles() {
  const opcoes = [['automatico', 'Automático: teclado, toque e controle'], ['teclado', 'Teclado e toque'], ['controle', 'Controle + teclado e toque']];
  const botoes = opcoes.map(([id, texto]) => `<button data-acao="modo-controle" data-id="${id}" aria-pressed="${E.modoControle === id}">${E.modoControle === id ? '✓ ' : ''}${texto}</button>`).join('');
  const estado = controle.nome || 'Nenhum controle detectado. Conecte por USB ou Bluetooth e pressione um botão.';
  $('menu').classList.add('oculto');
  abrirJanela('CONTROLES', `<div class="config-controles"><p>${estado}</p>${botoes}
    <h3>Teclado</h3><p>WASD ou setas: andar · E ou Espaço: interagir / segurar para fabricar · Q: retirar caixas · L ou Tab: loja · Esc ou P: pausa.</p>
    <h3>Xbox e outros controles com mapeamento padrão</h3>
    <p>Analógico esquerdo ou direcional: andar · A / botão inferior: interagir e fabricar · X / botão esquerdo: retirar caixas · Y / botão superior: loja · View / Select: produção e contratos · Menu / Start: pausa.</p>
    <p>Nos menus: direcional ou analógico para selecionar, A para confirmar e B para voltar. Em controles PlayStation: × confirma, ○ volta, □ retira caixas e △ abre a loja.</p>
    <p>O teclado e o toque continuam disponíveis. Controles genéricos precisam ser reconhecidos pelo navegador com mapeamento padrão (modo XInput, quando disponível).</p></div>`, [['Voltar à fábrica', fecharJanela]]);
}

function botoesControleVisiveis() {
  const raiz = janelaAberta() ? $('modal') : pausado ? $('menu') : lojaAberta() ? $('loja') : null;
  return raiz ? [...raiz.querySelectorAll('button')].filter(b => !b.disabled && b.getClientRects().length > 0) : [];
}

function atualizarControle(dt) {
  const estavaAgindo = controle.agir;
  controle.h = controle.v = 0; controle.agir = false;
  if (E.modoControle === 'teclado' || document.hidden) { controle.anterior = []; return; }
  let pads = [];
  try { pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; } catch (_) { return; }
  const pad = pads.find(p => p.index === controle.indice && p.connected !== false) || pads.find(p => p.connected !== false && p.mapping === 'standard');
  if (!pad || pad.mapping !== 'standard') {
    if (controle.indice !== null) { controle.indice = null; controle.nome = ''; suspenderJogo(); mensagem('Controle desconectado. Use o teclado ou conecte novamente.'); }
    controle.anterior = []; return;
  }
  if (controle.indice !== pad.index) {
    controle.indice = pad.index;
    // Não inserir o identificador fornecido pelo dispositivo no HTML.
    controle.nome = 'Controle compatível conectado.';
    controle.anterior = []; controle.bloquear = true;
    mensagem('Controle conectado! Menu/Start pausa; consulte Controles no menu.', 'bom');
  }
  const pressionado = i => !!pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > .5);
  const agora = Array.from({ length: 16 }, (_, i) => pressionado(i));
  const novo = i => agora[i] && !controle.anterior[i];
  const eixo = i => Math.abs(pad.axes[i] || 0) > ZONA_MORTA_CONTROLE ? pad.axes[i] : 0;
  const h = pressionado(14) ? -1 : pressionado(15) ? 1 : eixo(0);
  const v = pressionado(12) ? 1 : pressionado(13) ? -1 : -eixo(1);
  if (controle.bloquear) {
    controle.bloquear = agora.some(Boolean) || h !== 0 || v !== 0;
    controle.anterior = agora; return;
  }
  if (novo(9) && !janelaAberta()) alternarPausa();
  else if (janelaAberta() || pausado || lojaAberta()) {
    const botoes = botoesControleVisiveis();
    let indice = botoes.indexOf(document.activeElement);
    controle.repeticao -= dt;
    const direcao = v > .5 || h < -.5 ? -1 : v < -.5 || h > .5 ? 1 : 0;
    if (!direcao) controle.repeticao = 0;
    if (direcao && controle.repeticao <= 0 && botoes.length) {
      indice = indice < 0 ? (direcao > 0 ? 0 : botoes.length - 1) : (indice + direcao + botoes.length) % botoes.length;
      botoes[indice].focus(); botoes[indice].scrollIntoView({ block: 'nearest' }); controle.repeticao = .22;
    }
    if (novo(0) && botoes.length) (botoes[indice < 0 ? 0 : indice]).click();
    if (novo(1)) {
      if (janelaAberta()) $('modal-botoes').querySelector('button')?.click();
      else if (pausado) alternarPausa();
      else alternarLoja();
    }
    if (novo(3) && lojaAberta() && !pausado) alternarLoja();
  } else {
    controle.h = h; controle.v = v;
    controle.agir = pressionado(0);
    if (controle.agir && !estavaAgindo) ePressionado = true;
    if (novo(2)) coletarProximo();
    if (novo(3)) { zerarControle(); alternarLoja(); }
    if (novo(8)) abrirGestao();
  }
  controle.anterior = agora;
}

function sairDoJogo() {
  limparComandos();
  if (!salvar()) { aviso('Não foi possível salvar. A partida continua aberta; libere o armazenamento do navegador e tente novamente.', 'ruim'); return false; }
  if (window.parent !== window) {
    window.parent.postMessage({ tipo: 'imperio-industrial:sair' }, location.protocol === 'file:' ? '*' : location.origin);
  } else location.assign('../../index.html');
  return true;
}
