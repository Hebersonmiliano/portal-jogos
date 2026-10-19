'use strict';
// =====================================================================
//  PRINCIPAL.JS — liga tudo: teclado, interação (tecla E) e laço do jogo
// =====================================================================

const DISTANCIA_INTERACAO = 1.4;

// ---------------------------------------------------------------------
// Teclado
// ---------------------------------------------------------------------
let ePressionado = false;   // E (ou Espaço) foi apertado neste quadro

addEventListener('keydown', ev => {
  const interagir = ev.code === 'KeyE' || ev.code === 'Space';
  if (interagir || ev.code.startsWith('Arrow') || ev.code === 'Tab') ev.preventDefault();
  if (ev.code === 'Escape' || ev.code === 'KeyP') {
    if (!janelaAberta()) alternarPausa();
    return;
  }
  if ((ev.code === 'KeyL' || ev.code === 'Tab') && !pausado) { alternarLoja(); return; }
  if (interagir && !teclas.Interagir) ePressionado = true;
  if (interagir) teclas.Interagir = true;
  teclas[ev.code] = true;
});

addEventListener('keyup', ev => {
  if (ev.code === 'KeyE' || ev.code === 'Space') teclas.Interagir = false;
  teclas[ev.code] = false;
});

addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });

// ---------------------------------------------------------------------
// Interação com as estações
// ---------------------------------------------------------------------
function estacaoProxima() {
  const candidatos = ['balcao', 'palete', 'bancada', 'copa', 'estoque', 'expedicao', ...E.maquinas.map((m, i) => 'm' + i)];
  let melhor = '', menor = DISTANCIA_INTERACAO;
  for (const id of candidatos) {
    const p = pontoDe(id);
    const d = Math.hypot(jogador.x - p.x, jogador.z - p.z);
    if (d < menor) { menor = d; melhor = id; }
  }
  return melhor;
}

const info = texto => ({ acao: '', texto });

// decide o que a tecla E faz em cada estação (e o texto da dica)
function acaoEm(alvo) {
  const livre = capCarga() - E.cargaQtd;
  switch (alvo) {
    case 'balcao':
      return { acao: 'comprar', texto: `E: comprar 10 papelões (${reais(CUSTO_PAPELAO * LOTE_PAPELAO)})` };
    case 'palete':
      if (E.cargaTipo === 'caixa') return info('Mãos ocupadas com caixas');
      if (E.cargaTipo === 'papelao' && (livre <= 0 || E.papelao <= 0))
        return { acao: 'devolver', texto: `E: devolver ${E.cargaQtd} papelão(ões) ao palete` };
      if (E.papelao <= 0) return info('Palete vazio: compre papelão no fornecedor');
      return { acao: 'pegar_papelao', texto: `E: pegar papelão (${E.papelao} no palete)` };
    case 'copa':
      if (E.energiaJogador > 0) return info(`Cheio de energia! Mais ${Math.ceil(E.energiaJogador)} s de cafezinho`);
      return { acao: 'cafe', texto: `E: tomar um cafezinho (${reais(PRECO_CAFE)}): fica mais rápido por ${DURACAO_CAFE} s` };
    case 'estoque':
      if (E.cargaTipo === 'caixa') {
        if (E.estoque >= capEstoque()) return info('Estoque cheio! Venda na expedição');
        return { acao: 'guardar', texto: `E: guardar ${E.cargaQtd} caixa(s) no estoque` };
      }
      return info(`Estoque: ${E.estoque}/${capEstoque()} caixas`);
    case 'expedicao':
      if (E.cargaTipo === 'caixa') return { acao: 'vender_carga', texto: `E: vender ${E.cargaQtd} caixa(s) por ${reais(E.cargaQtd * PRECO_CAIXA)}` };
      if (podeEntregarPedido()) return { acao: 'pedido', texto: `E: entregar o pedido (${E.pedido.qtd} caixas)` };
      if (E.estoque > 0) return { acao: 'vender_estoque', texto: `E: vender o estoque (${E.estoque} caixas)` };
      return info('Guarde caixas no estoque para vender');
  }
  // bancada e máquinas
  const p = produtor(alvo);
  const nome = alvo === 'bancada' ? 'bancada' : 'máquina';
  if (E.cargaTipo === 'papelao') {
    if (p.entrada >= capProdutor(alvo)) {
      if (alvo === 'bancada' && podeMontar()) return { acao: 'montar', texto: 'Bancada cheia! Segure E para montar caixas' };
      return info(`A ${nome} já está cheia de papelão`);
    }
    return { acao: 'abastecer', texto: `E: colocar papelão na ${nome}` };
  }
  if (E.cargaTipo === 'caixa' && p.saida > 0 && livre > 0) return { acao: 'pegar_caixas', texto: `E: pegar caixas (${p.saida} prontas)` };
  if (alvo === 'bancada' && podeMontar()) return { acao: 'montar', texto: `Segure E: montar caixa (${p.entrada} papelão)` };
  if (p.saida > 0 && livre > 0) return { acao: 'pegar_caixas', texto: `E: pegar caixas (${p.saida} prontas)` };
  if (alvo === 'bancada') return info('Traga papelão do palete para a bancada');
  if (p.entrada > 0) return info(`Máquina trabalhando (${p.entrada} papelão)`);
  return info('Máquina parada: traga papelão');
}

function executar(acao, alvo) {
  switch (acao) {
    case 'comprar':
      if (comprarPapelao()) { tocar('compra'); flutuar('+10 papelão', -11.5, 2.6, -3.5, '#e0b070'); }
      else tocar('erro');
      break;
    case 'cafe':
      if (tomarCafe()) { tocar('missao'); flutuar('☕ Energia!', ESTACOES.copa.x, 2.6, ESTACOES.copa.z, '#f2c94c'); }
      else tocar('erro');
      break;
    case 'pegar_papelao': if (jogadorPegarPapelao() > 0) tocar('pegar'); break;
    case 'devolver': if (jogadorDevolverPapelao() > 0) tocar('soltar'); break;
    case 'abastecer': if (jogadorAbastecer(alvo) > 0) tocar('soltar'); break;
    case 'pegar_caixas': if (jogadorPegarCaixas(alvo) > 0) tocar('pegar'); break;
    case 'guardar': if (jogadorGuardar() > 0) tocar('soltar'); break;
    case 'vender_carga': jogadorVenderCarga(); break;
    case 'pedido': entregarPedido(); break;
    case 'vender_estoque': venderEstoque(); break;
  }
}

function atualizarInteracao(dt) {
  jogador.trabalhando = false;
  const alvo = estacaoProxima();
  if (!alvo) { dica(''); ePressionado = false; return; }
  const a = acaoEm(alvo);
  dica(a.texto, jogador);
  if (a.acao === 'montar') {
    if (teclas.Interagir) {
      jogador.trabalhando = true;
      avancarBancada(dt, ritmoJogador());
    }
  } else if (a.acao && ePressionado) {
    executar(a.acao, alvo);
  }
  ePressionado = false;
}

// ---------------------------------------------------------------------
// Reações aos eventos do jogo
// ---------------------------------------------------------------------
ouvir('mensagem', aviso);
ouvir('caixa', origem => {
  if (origem !== 'bancada') return;
  tocar('caixa');
  flutuar('+1 caixa', ESTACOES.bancada.x, 2.6, ESTACOES.bancada.z, '#f2c94c');
});
ouvir('venda', (qtd, valor) => {
  tocar('venda');
  flutuar('+' + reais(valor), ESTACOES.expedicao.x, 2, ESTACOES.expedicao.z, '#5cd68a');
  chamarCaminhao();
});
ouvir('esteira', novoItemEsteira);
ouvir('estrutura', () => { sincronizarEstrutura(); sincronizarFuncionarios(); montarLoja(); });
ouvir('venceu', mostrarVitoria);

// ---------------------------------------------------------------------
// Início e laço principal
// ---------------------------------------------------------------------
function iniciar() {
  carregar();
  try {
    criarCena($('palco'));
  } catch (e) {
    $('erro3d').classList.remove('oculto');
    return;
  }
  criarJogador();
  sincronizarEstrutura();
  sincronizarFuncionarios();
  montarLoja();
  atualizarHud();
  if (!E.viuAjuda) mostrarAjuda();
  addEventListener('beforeunload', salvar);

  let ultimo = performance.now(), timerLoja = 0;
  function quadro(agora) {
    const dt = Math.min(0.1, (agora - ultimo) / 1000);
    ultimo = agora;
    const t = agora / 1000;
    if (!pausado) {
      atualizarSimulacao(dt);
      atualizarJogador(dt, t);
      atualizarInteracao(dt);
      atualizarFuncionarios(dt, t);
    } else {
      ePressionado = false;
      dica('');
    }
    atualizarCena(t, pausado ? 0 : dt);
    atualizarHud();
    timerLoja -= dt;
    if (lojaAberta() && timerLoja <= 0) { atualizarLoja(); timerLoja = 0.2; }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
}

iniciar();
