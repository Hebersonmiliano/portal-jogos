'use strict';
// =====================================================================
//  INTERFACE.JS — HUD, loja, menus, mensagens e sons
// =====================================================================

const $ = id => document.getElementById(id);
let pausado = false;

// ---------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------
function atualizarHud() {
  atualizarEvolucaoHud();
  if (typeof atualizarPrestigioHud === 'function') atualizarPrestigioHud();
  $('hud-produto').textContent = produtoAtual().nome;
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
  $('hud-guia').textContent = proximoPasso();
  $('hud-carga').textContent = E.cargaQtd
    ? `Carregando: ${E.cargaQtd}/${capCarga()} ${E.cargaTipo === 'caixa' ? 'caixas' : 'papelões'}`
    : `Mãos livres · capacidade ${capCarga()}`;
  $('producao').value = E.bancada.progresso;
  $('producao').textContent = Math.floor(E.bancada.progresso * 100) + '%';
  const n = nivel();
  $('hud-nivel').textContent = `Nível ${n}: ${NIVEIS[n]}`;
  $('hud-missao').textContent = textoMissao();

  const pedido = $('hud-pedido');
  pedido.classList.toggle('oculto', !E.pedido && !E.ofertas.length);
  if (!E.pedido && E.ofertas.length) { pedido.textContent = 'CONTRATOS DISPONÍVEIS · abra Produção e contratos'; pedido.classList.remove('pronto'); }
  if (E.pedido) {
    const s = Math.max(0, Math.floor(E.pedido.tempo));
    pedido.textContent = `PEDIDO ${E.pedido.cliente}: ${E.pedido.qtd} caixas · ${reais(E.pedido.preco || PRECO_PEDIDO)} cada (${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')})`;
    pedido.classList.toggle('pronto', podeEntregarPedido());
  }
}

function proximoPasso() {
  if (E.salarioAtrasado) return `Venda caixas para pagar os salários (${reais(folhaPagamento())}).`;
  if (E.cargaTipo === 'caixa') return 'Leve suas caixas à EXPEDIÇÃO para vender ou ao ESTOQUE para pedidos.';
  if (E.cargaTipo === 'papelao') return 'Leve o papelão à BANCADA ou a uma máquina para abastecer.';
  if (podeEntregarPedido()) return 'Pedido pronto! Vá à EXPEDIÇÃO e entregue para ganhar mais.';
  if (E.bancada.saida > 0) return 'Na BANCADA, aperte Q ou toque em Retirar caixas para recolher a produção.';
  if (E.estoque > 0) return 'Venda o estoque na EXPEDIÇÃO ou reserve caixas para um pedido.';
  if (podeMontar()) return 'Na BANCADA, segure E ou Agir para fabricar. Acompanhe a barra abaixo.';
  if (E.papelao > 0) return 'Pegue matéria-prima no PALETE e abasteça a BANCADA.';
  if (E.maquinas.some(m => m.entrada > 0 || m.saida > 0)) return 'Recolha a produção das máquinas ou visite a LOJA para expandir.';
  return E.dinheiro >= CUSTO_PAPELAO * LOTE_PAPELAO
    ? 'Compre 10 papelões no FORNECEDOR ou na LOJA para iniciar a produção.'
    : 'Confira as máquinas e o estoque: venda suas caixas para comprar mais papelão.';
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
  if (janelaAberta()) return;
  limparComandos();
  pausado = !pausado;
  $('menu').classList.toggle('oculto', !pausado);
  atualizarBotoesAudio();
  if (pausado) $('menu').querySelector?.('button')?.focus?.();
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
  limparComandos();
  pausado = true;
  area.parentElement?.scrollTo?.({ top: 0 });
  area.firstElementChild?.focus({ preventScroll: true });
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
      <li><b>Entregar:</b> na EXPEDIÇÃO, aperte <kbd>E</kbd> para vender (a caixa simples rende R$ 5).</li>
    </ol>
    <p>Cansou? Tome um <b>cafezinho</b> na COPA (R$ 5): fica mais rápido por 30 s.</p>
    <p>Ande com <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou setas. <kbd>L</kbd> abre a loja:
    compre equipamentos, máquinas, contrate funcionários e automatize tudo.
    <kbd>Q</kbd> retira caixas prontas sem esperar o lote inteiro. No celular, use as setas e segure Agir para produzir. <kbd>Esc</kbd> pausa. Controle Xbox e similares: analógico/direcional move, A interage (segure para montar), X retira caixas, Y abre a loja, botão View/Select abre produção e contratos, Menu/Start pausa. O jogo salva sozinho. Em <b>Produção e contratos</b>, escolha novos produtos e aceite pedidos com prazo e pagamento definidos.</p>`,
    [['Começar!', () => { E.viuAjuda = true; fecharJanela(); }]]);
}

function mostrarVitoria() {
  abrirJanela('SEU IMPÉRIO INDUSTRIAL ESTÁ PRONTO!', `
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
  if (janelaAberta()) return;
  const estavaPausado = pausado;
  const menuVisivel = !$('menu').classList.contains('oculto');
  $('menu').classList.add('oculto');
  abrirJanela('REINICIAR PARTIDA DO ZERO?',
    '<p>Seu dinheiro, máquinas, funcionários, melhorias e missões serão zerados. Você voltará ao início com <b>R$ 100</b>.</p><p>O progresso salvo desta partida será substituído. Suas conquistas, XP e desafios de carreira serão mantidos neste navegador. Deseja continuar?</p>',
    [['Cancelar', () => {
      fecharJanela();
      pausado = estavaPausado;
      $('menu').classList.toggle('oculto', !menuVisivel);
    }], ['Sim, reiniciar do zero', novoJogo]]);
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
    case 'conquistas': mostrarConquistas(); break;
    case 'filtro-conquistas': mostrarConquistas(btn.dataset.id); break;
    case 'resgatar-desafio': if (resgatarDesafio(btn.dataset.id)) mostrarConquistas(); break;
    case 'sair': sairDoJogo(); break;
    case 'controles': mostrarControles(); break;
    case 'modo-controle': E.modoControle = btn.dataset.id; salvar(); mostrarControles(); break;
    case 'gestao': if (!pausado) abrirGestao(); break;
    case 'produto': if (selecionarProduto(btn.dataset.id)) abrirGestao(); break;
    case 'aceitar-contrato': if (aceitarContrato(Number(btn.dataset.id))) abrirGestao(); break;
    case 'loja': if (!pausado) alternarLoja(); break;
    case 'pausa': alternarPausa(); break;
    case 'comprar': comprar(btn.dataset.id); atualizarLoja(); break;
    case 'fechar-loja': alternarLoja(); break;
    case 'continuar': alternarPausa(); break;
    case 'ajuda': pausado = false; mostrarAjuda(); break;
    case 'som': E.som = !E.som; ativarAudio(); atualizarBotoesAudio(); salvar(); break;
    case 'musica': E.musica = !E.musica; ativarAudio(); atualizarBotoesAudio(); salvar(); break;
    case 'efeitos': E.efeitos = !E.efeitos; ativarAudio(); atualizarBotoesAudio(); salvar(); break;
    case 'ativar-audio': E.som = true; E.musica = true; if (E.volumeMusica <= 0) E.volumeMusica = 0.35; ativarAudio(); atualizarBotoesAudio(); salvar(); break;
    case 'novo': confirmarNovoJogo(); break;
  }
});
