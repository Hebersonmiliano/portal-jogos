'use strict';
// =====================================================================
//  INTERFACE.JS — HUD, loja, menus, mensagens e sons
// =====================================================================

const $ = id => document.getElementById(id);
let pausado = false;

// ---------------------------------------------------------------------
// Sons gerados na hora (sem arquivos)
// ---------------------------------------------------------------------
let audio = null;
const SONS = {
  pegar: [520, 0.06], soltar: [380, 0.07], caixa: [660, 0.12], venda: [880, 0.18],
  compra: [990, 0.15], erro: [150, 0.18], missao: [1175, 0.4],
};

function tocar(nome) {
  if (!E.som || !SONS[nome]) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const [freq, dur] = SONS[nome];
    const osc = audio.createOscillator(), vol = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0.05, audio.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    osc.connect(vol).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  } catch (e) { /* navegador sem áudio */ }
}

// ---------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------
function atualizarHud() {
  $('hud-dinheiro').textContent = reais(E.dinheiro);
  $('hud-papelao').textContent = `Papelão ${E.papelao}`;
  $('hud-estoque').textContent = `Estoque ${E.estoque}/${capEstoque()}`;
  $('hud-produzidas').textContent = `Produzidas ${E.produzidas}`;
  $('hud-funcionarios').textContent = `Funcionários ${E.funcionarios}`;
  $('hud-funcionarios').classList.toggle('alerta', E.salarioAtrasado);
  $('hud-dia').textContent = `Dia ${E.dia}`;
  const cafe = [];
  if (E.energiaJogador > 0) cafe.push(`você ${Math.ceil(E.energiaJogador)}s`);
  if (E.energiaEquipe > 0) cafe.push(`equipe ${Math.ceil(E.energiaEquipe)}s`);
  $('hud-energia').classList.toggle('oculto', cafe.length === 0);
  $('hud-energia').textContent = '☕ ' + cafe.join(' · ');
  const n = nivel();
  $('hud-nivel').textContent = `Nível ${n}: ${NIVEIS[n]}`;
  $('hud-missao').textContent = textoMissao();

  const pedido = $('hud-pedido');
  pedido.classList.toggle('oculto', !E.pedido);
  if (E.pedido) {
    const s = Math.max(0, Math.floor(E.pedido.tempo));
    pedido.textContent = `PEDIDO ${E.pedido.cliente}: ${E.pedido.qtd} caixas (${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')})`;
    pedido.classList.toggle('pronto', podeEntregarPedido());
  }
}

function dica(texto, pos) {
  const el = $('dica');
  el.classList.toggle('oculto', !texto);
  if (!texto) return;
  if (el.textContent !== texto) el.textContent = texto;
  const p = paraTela(new THREE.Vector3(pos.x, 0, pos.z));
  el.style.left = p.x + 'px';
  el.style.top = (p.y + 18) + 'px';
}

let timerAviso = null;
function aviso(texto, tipo) {
  const el = $('aviso');
  el.textContent = texto;
  el.className = 'aviso ' + (tipo || '');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => el.classList.add('oculto'), 4000);
}

// texto que sobe e some a partir de um ponto 3D
function flutuar(texto, x, y, z, cor) {
  const p = paraTela(new THREE.Vector3(x, y, z));
  const el = document.createElement('div');
  el.className = 'flutuante';
  el.style.color = cor;
  el.style.left = p.x + 'px';
  el.style.top = p.y + 'px';
  el.textContent = texto;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ---------------------------------------------------------------------
// Loja
// ---------------------------------------------------------------------
function montarLoja() {
  $('lista-loja').innerHTML = itensLoja().map(item => `
    <div class="item" id="item-${item.id}">
      <div class="item-topo"><span class="item-nome"></span>
        <button data-acao="comprar" data-id="${item.id}"></button></div>
      <div class="item-desc"></div>
    </div>`).join('');
  atualizarLoja();
}

function atualizarLoja() {
  for (const item of itensLoja()) {
    const el = $('item-' + item.id);
    const botao = el.querySelector('button');
    el.querySelector('.item-nome').textContent = item.nome;
    el.querySelector('.item-desc').textContent = item.desc;
    el.classList.toggle('comprado', item.comprado);
    el.classList.toggle('bloqueado', !item.comprado && !!item.motivo);
    if (item.comprado) { botao.textContent = 'Comprado'; botao.disabled = true; }
    else if (item.motivo) { botao.textContent = item.motivo; botao.disabled = true; }
    else { botao.textContent = reais(item.preco); botao.disabled = E.dinheiro < item.preco; }
  }
}

const lojaAberta = () => !$('loja').classList.contains('oculto');

function alternarLoja() {
  $('loja').classList.toggle('oculto');
  if (lojaAberta()) atualizarLoja();
}

// ---------------------------------------------------------------------
// Pausa, janelas e menus
// ---------------------------------------------------------------------
function alternarPausa() {
  pausado = !pausado;
  $('menu').classList.toggle('oculto', !pausado);
  $('btn-som').textContent = E.som ? 'Som: ligado' : 'Som: desligado';
}

const janelaAberta = () => !$('modal').classList.contains('oculto');

function abrirJanela(titulo, html, botoes) {
  $('modal-titulo').textContent = titulo;
  $('modal-texto').innerHTML = html;
  const area = $('modal-botoes');
  area.innerHTML = '';
  for (const [texto, acao] of botoes) {
    const b = document.createElement('button');
    b.textContent = texto;
    b.onclick = acao;
    area.appendChild(b);
  }
  $('modal').classList.remove('oculto');
  pausado = true;
}

function fecharJanela() {
  $('modal').classList.add('oculto');
  pausado = false;
}

function mostrarAjuda() {
  $('menu').classList.add('oculto');
  abrirJanela('DO ZERO AO IMPÉRIO INDUSTRIAL', `
    <p>Você tem <b>R$ 100</b> e uma pequena fábrica de caixas de papelão.</p>
    <ol>
      <li><b>Comprar:</b> no balcão do FORNECEDOR, aperte <kbd>E</kbd> (10 papelões = R$ 20).</li>
      <li><b>Transportar:</b> pegue o papelão no PALETE e leve até a BANCADA.</li>
      <li><b>Fabricar:</b> segure <kbd>E</kbd> na bancada para montar as caixas.</li>
      <li><b>Armazenar:</b> leve as caixas prontas até o ESTOQUE.</li>
      <li><b>Entregar:</b> na EXPEDIÇÃO, aperte <kbd>E</kbd> para vender (R$ 5 por caixa).</li>
    </ol>
    <p>Cansou? Tome um <b>cafezinho</b> na COPA (R$ 5): fica mais rápido por 30 s.</p>
    <p>Ande com <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou setas. <kbd>L</kbd> abre a loja:
    compre equipamentos, máquinas, contrate funcionários e automatize tudo.
    <kbd>Esc</kbd> pausa. O jogo salva sozinho.</p>`,
    [['Começar!', () => { E.viuAjuda = true; fecharJanela(); }]]);
}

function mostrarVitoria() {
  abrirJanela('INDÚSTRIA TOTALMENTE AUTOMATIZADA!', `
    <p>Você começou com R$ 100 e uma bancada. Agora comanda uma indústria moderna!</p>
    <ul>
      <li>Tempo de jogo: ${Math.floor(E.tempoJogo / 60)} min</li>
      <li>Caixas produzidas: ${E.produzidas}</li>
      <li>Caixas vendidas: ${E.vendidas}</li>
      <li>Faturamento total: ${reais(E.faturamento)}</li>
      <li>Funcionários: ${E.funcionarios} · Máquinas: ${E.maquinas.length}</li>
    </ul>`,
    [['Novo jogo', novoJogo], ['Continuar jogando', fecharJanela]]);
}

function confirmarNovoJogo() {
  $('menu').classList.add('oculto');
  abrirJanela('COMEÇAR DE NOVO?', '<p>Todo o progresso salvo será apagado.</p>',
    [['Cancelar', () => { fecharJanela(); alternarPausa(); }], ['Apagar e recomeçar', novoJogo]]);
}

function novoJogo() {
  E = estadoInicial();
  E.viuAjuda = true;
  salvar();
  location.reload();
}

// um único "ouvinte" para todos os botões com data-acao
document.addEventListener('click', ev => {
  const btn = ev.target.closest('[data-acao]');
  if (!btn || btn.disabled) return;
  switch (btn.dataset.acao) {
    case 'comprar': comprar(btn.dataset.id); atualizarLoja(); break;
    case 'fechar-loja': alternarLoja(); break;
    case 'continuar': alternarPausa(); break;
    case 'ajuda': pausado = false; mostrarAjuda(); break;
    case 'som': E.som = !E.som; btn.textContent = E.som ? 'Som: ligado' : 'Som: desligado'; break;
    case 'novo': confirmarNovoJogo(); break;
  }
});
