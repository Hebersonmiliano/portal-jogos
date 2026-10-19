'use strict';
// =====================================================================
//  JOGO.JS — estado, economia, produção, loja, missões e salvamento.
//  Não desenha nada: as outras partes leem o estado "E" e chamam
//  as funções daqui.
// =====================================================================

// ---------------------------------------------------------------------
// ECONOMIA (mude estes números para deixar o jogo mais fácil ou difícil)
// ---------------------------------------------------------------------
const DINHEIRO_INICIAL = 100;
const CUSTO_PAPELAO = 2;            // matéria-prima de 1 caixa
const LOTE_PAPELAO = 10;
const PRECO_CAIXA = 5;              // venda na expedição
const PRECO_PEDIDO = 7;             // pedidos especiais pagam mais
const PRECO_FUNCIONARIO = 500;
const SALARIO = 25;                 // por funcionário, a cada dia
const DURACAO_DIA = 60;             // segundos
const INTERVALO_TRANSPORTADORA = 15;

const MAQUINAS = {
  dobradeira: { nome: 'Dobradeira', preco: 250, velocidade: 0.5,
    desc: 'Primeira máquina: monta 1 caixa a cada 2 s. Abasteça com papelão.' },
  montadora: { nome: 'Montadora automática', preco: 3000, velocidade: 1.5,
    desc: 'Dobra e monta 1,5 caixa por segundo.', requer: 'esteira' },
};

const MELHORIAS = {
  estilete:        { nome: 'Estilete profissional', preco: 60, desc: 'Monta caixas na bancada 60% mais rápido.' },
  carrinho:        { nome: 'Carrinho de transporte', preco: 120, desc: 'Carregue 10 itens de uma vez (antes: 3).' },
  bancada_pro:     { nome: 'Bancada profissional', preco: 400, desc: 'Bancada 2x mais rápida e com espaço para 20 papelões.' },
  fornecedor_auto: { nome: 'Contrato com fornecedor', preco: 800, desc: 'O papelão chega sozinho quando o palete está acabando.' },
  esteira:         { nome: 'Esteira transportadora', preco: 1500, desc: 'Leva papelão até as máquinas e caixas até o estoque.' },
  transportadora:  { nome: 'Transportadora contratada', preco: 2000, desc: 'Um caminhão busca e vende o estoque a cada 15 s.' },
  expansao:        { nome: 'Expansão do galpão', preco: 6000, desc: '+2 vagas de máquina, estoque de 150, palete de 200 e até 6 funcionários.' },
  automacao_total: { nome: 'Automação total', preco: 15000, desc: 'Centro de controle da indústria. Objetivo final!' },
};

const ORDEM_LOJA = ['papelao', 'estilete', 'carrinho', 'dobradeira', 'bancada_pro', 'funcionario',
  'fornecedor_auto', 'esteira', 'transportadora', 'montadora', 'expansao', 'automacao_total'];

const NIVEIS = ['', 'Produção manual', 'Primeiros equipamentos', 'Funcionários', 'Automatização', 'Grande indústria'];

const MISSOES = [
  { texto: 'Produza a primeira caixa', premio: 10 },
  { texto: 'Venda 10 caixas', premio: 20 },
  { texto: 'Acumule R$ 250', premio: 0 },
  { texto: 'Compre o primeiro equipamento', premio: 30 },
  { texto: 'Contrate o primeiro funcionário', premio: 50 },
  { texto: 'Automatize uma etapa (esteira)', premio: 200 },
  { texto: 'Expanda a fábrica', premio: 500 },
  { texto: 'Construa uma indústria totalmente automatizada', premio: 0 },
];

const CLIENTES = ['Mercadinho Bom Preço', 'Padaria Pão Quente', 'Farmácia Vida', 'Mudanças Rápidas',
  'Livraria Saber', 'Loja de Brinquedos', 'Supermercado Central', 'Loja Online Clique'];

// ---------------------------------------------------------------------
// EVENTOS: o jogo "avisa" e a interface/cena reagem
// ---------------------------------------------------------------------
const ouvintes = {};
function ouvir(nome, funcao) { (ouvintes[nome] = ouvintes[nome] || []).push(funcao); }
function avisar(nome, ...dados) { (ouvintes[nome] || []).forEach(f => f(...dados)); }
const mensagem = (texto, tipo = '') => avisar('mensagem', texto, tipo);

// ---------------------------------------------------------------------
// ESTADO (tudo que é salvo)
// ---------------------------------------------------------------------
const CHAVE_SAVE = 'imperio-industrial-3d-v1';

function estadoInicial() {
  return {
    dinheiro: DINHEIRO_INICIAL, papelao: 0, estoque: 0,
    cargaTipo: '', cargaQtd: 0,                       // o que o jogador carrega
    bancada: { entrada: 0, saida: 0, progresso: 0 },
    maquinas: [],                                     // {tipo, entrada, saida, progresso}
    melhorias: {}, funcionarios: 0,
    produzidas: 0, vendidas: 0, faturamento: 0,
    dia: 1, timerDia: DURACAO_DIA, salarioAtrasado: false,
    missao: 0, pedido: null, timerPedido: 45,
    timerTransportadora: INTERVALO_TRANSPORTADORA,
    tempoJogo: 0, viuAjuda: false, som: true,
    posJogador: { x: -8, z: -1 },
  };
}

let E = estadoInicial();

function salvar() {
  try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(E)); } catch (e) { /* navegador sem salvamento */ }
}

function carregar() {
  try {
    const texto = localStorage.getItem(CHAVE_SAVE);
    if (!texto) return false;
    E = Object.assign(estadoInicial(), JSON.parse(texto));
    return true;
  } catch (e) { return false; }
}

// ---------------------------------------------------------------------
// REGRAS
// ---------------------------------------------------------------------
const tem = id => !!E.melhorias[id];
const capCarga = () => tem('carrinho') ? 10 : 3;
const capBancada = () => tem('bancada_pro') ? 20 : 10;
const capMaquina = () => 20;
const capEstoque = () => tem('expansao') ? 150 : 30;
const capPalete = () => tem('expansao') ? 200 : 60;
const maxFuncionarios = () => tem('expansao') ? 6 : 3;
const vagas = () => tem('expansao') ? 4 : 2;
const folhaPagamento = () => E.funcionarios * SALARIO;

function velocidadeBancada() {
  let v = 0.5;
  if (tem('estilete')) v *= 1.6;
  if (tem('bancada_pro')) v *= 2;
  return v;
}

function nivel() {
  if (tem('expansao')) return 5;
  if (tem('esteira')) return 4;
  if (E.funcionarios > 0) return 3;
  if (tem('estilete') || tem('carrinho') || tem('bancada_pro') || E.maquinas.length > 0) return 2;
  return 1;
}

const reais = v => (v < 0 ? '-' : '') + 'R$ ' +
  Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------------
// PRODUTORES: a bancada ("bancada") e as máquinas ("m0", "m1"...)
// ---------------------------------------------------------------------
function produtor(id) {
  if (id === 'bancada') return E.bancada;
  return E.maquinas[Number(id.slice(1))] || null;
}
const capProdutor = id => id === 'bancada' ? capBancada() : capMaquina();
const idsProdutores = () => ['bancada', ...E.maquinas.map((m, i) => 'm' + i)];
const podeMontar = () => E.bancada.entrada > 0 && E.bancada.saida < capBancada();
const maquinaTrabalhando = i => E.maquinas[i].entrada > 0 && E.maquinas[i].saida < capMaquina();

function avancar(id, velocidade, dt) {
  const p = produtor(id);
  if (!p || p.entrada <= 0 || p.saida >= capProdutor(id)) return false;
  p.progresso += velocidade * dt;
  if (p.progresso < 1) return false;
  p.progresso = 0;
  p.entrada--;
  p.saida++;
  E.produzidas++;
  avisar('caixa', id);
  return true;
}

const avancarBancada = (dt, ritmo) => avancar('bancada', velocidadeBancada() * ritmo, dt);

// ---------------------------------------------------------------------
// MOVIMENTAÇÃO DE MATERIAIS (jogador e funcionários)
// ---------------------------------------------------------------------
function retirarPapelao(n) { const q = Math.min(n, E.papelao); E.papelao -= q; return q; }

function abastecer(id, n) {
  const p = produtor(id);
  if (!p) return 0;
  const q = Math.max(0, Math.min(n, capProdutor(id) - p.entrada));
  p.entrada += q;
  return q;
}

function retirarCaixas(id, n) {
  const p = produtor(id);
  if (!p) return 0;
  const q = Math.min(n, p.saida);
  p.saida -= q;
  return q;
}

function armazenar(n) { const q = Math.max(0, Math.min(n, capEstoque() - E.estoque)); E.estoque += q; return q; }

function comprarPapelao() {
  const custo = CUSTO_PAPELAO * LOTE_PAPELAO;
  if (E.dinheiro < custo) { mensagem('Dinheiro insuficiente para comprar papelão.', 'ruim'); return false; }
  if (E.papelao + LOTE_PAPELAO > capPalete()) { mensagem('O palete de matéria-prima está cheio.', 'ruim'); return false; }
  E.dinheiro -= custo;
  E.papelao += LOTE_PAPELAO;
  return true;
}

function limparCarga() { if (E.cargaQtd <= 0) { E.cargaQtd = 0; E.cargaTipo = ''; } }

function jogadorPegarPapelao() {
  if (E.cargaTipo === 'caixa') return 0;
  const q = retirarPapelao(capCarga() - E.cargaQtd);
  if (q > 0) { E.cargaTipo = 'papelao'; E.cargaQtd += q; }
  return q;
}

function jogadorDevolverPapelao() {
  if (E.cargaTipo !== 'papelao') return 0;
  const q = E.cargaQtd;
  E.papelao += q;
  E.cargaQtd = 0;
  limparCarga();
  return q;
}

function jogadorAbastecer(id) {
  if (E.cargaTipo !== 'papelao') return 0;
  const q = abastecer(id, E.cargaQtd);
  E.cargaQtd -= q;
  limparCarga();
  return q;
}

function jogadorPegarCaixas(id) {
  if (E.cargaTipo === 'papelao') return 0;
  const q = retirarCaixas(id, capCarga() - E.cargaQtd);
  if (q > 0) { E.cargaTipo = 'caixa'; E.cargaQtd += q; }
  return q;
}

function jogadorGuardar() {
  if (E.cargaTipo !== 'caixa') return 0;
  const q = armazenar(E.cargaQtd);
  E.cargaQtd -= q;
  limparCarga();
  return q;
}

function jogadorVenderCarga() {
  if (E.cargaTipo !== 'caixa') return;
  vender(E.cargaQtd, PRECO_CAIXA);
  E.cargaQtd = 0;
  limparCarga();
}

// ---------------------------------------------------------------------
// VENDAS E PEDIDOS
// ---------------------------------------------------------------------
function vender(qtd, preco) {
  const valor = qtd * preco;
  E.dinheiro += valor;
  E.faturamento += valor;
  E.vendidas += qtd;
  avisar('venda', qtd, valor);
}

function venderEstoque(reservar = 0) {
  const q = E.estoque - reservar;
  if (q <= 0) return 0;
  E.estoque -= q;
  vender(q, PRECO_CAIXA);
  return q;
}

const podeEntregarPedido = () => !!E.pedido && E.estoque >= E.pedido.qtd;

function entregarPedido() {
  if (!podeEntregarPedido()) return false;
  const q = E.pedido.qtd;
  E.estoque -= q;
  vender(q, PRECO_PEDIDO);
  mensagem(`Pedido de ${E.pedido.cliente} entregue: +${reais(q * PRECO_PEDIDO)}!`, 'bom');
  E.pedido = null;
  E.timerPedido = 40 + Math.random() * 30;
  return true;
}

function novoPedido() {
  let ritmo = 0.3 + E.funcionarios * 0.3;
  for (const m of E.maquinas) ritmo += MAQUINAS[m.tipo].velocidade;
  const qtd = Math.max(5, Math.min(Math.round(ritmo * 45 / 5) * 5, Math.floor(capEstoque() * 0.8)));
  E.pedido = { cliente: CLIENTES[Math.floor(Math.random() * CLIENTES.length)], qtd, tempo: 120 };
  mensagem(`Novo pedido: ${E.pedido.cliente} quer ${qtd} caixas (paga ${reais(PRECO_PEDIDO)} cada).`);
  tocar('missao');
}

// ---------------------------------------------------------------------
// LOJA
// ---------------------------------------------------------------------
function requisitoFaltando(id) {
  if (id === 'esteira' && E.maquinas.length === 0) return 'Precisa de máquina';
  if (id === 'expansao' && !tem('esteira')) return 'Precisa de esteira';
  if (id === 'automacao_total') {
    if (!tem('expansao')) return 'Precisa da expansão';
    if (!tem('fornecedor_auto') || !tem('transportadora')) return 'Automatize tudo';
    if (!E.maquinas.some(m => m.tipo === 'montadora')) return 'Precisa de montadora';
  }
  return '';
}

function itensLoja() {
  return ORDEM_LOJA.map(id => {
    const item = { id, comprado: false, motivo: '' };
    if (id === 'papelao') {
      Object.assign(item, { nome: 'Papelão (lote de 10)', preco: CUSTO_PAPELAO * LOTE_PAPELAO,
        desc: 'Matéria-prima: R$ 2 por caixa. Vai para o palete.' });
      if (E.papelao + LOTE_PAPELAO > capPalete()) item.motivo = 'Palete cheio';
    } else if (id === 'funcionario') {
      Object.assign(item, { nome: `Funcionário (${E.funcionarios}/${maxFuncionarios()})`, preco: PRECO_FUNCIONARIO,
        desc: `Transporta materiais, monta caixas e organiza o estoque. Salário: ${reais(SALARIO)} por dia.` });
      if (E.funcionarios >= maxFuncionarios()) item.motivo = 'Lotado';
    } else if (MAQUINAS[id]) {
      const d = MAQUINAS[id];
      Object.assign(item, { nome: d.nome, preco: d.preco, desc: d.desc });
      if (d.requer && !tem(d.requer)) item.motivo = 'Precisa de esteira';
      else if (E.maquinas.length >= vagas()) item.motivo = 'Sem vaga livre';
    } else {
      const m = MELHORIAS[id];
      Object.assign(item, { nome: m.nome, preco: m.preco, desc: m.desc, comprado: tem(id), motivo: requisitoFaltando(id) });
    }
    return item;
  });
}

function comprar(id) {
  const item = itensLoja().find(i => i.id === id);
  if (!item || item.comprado || item.motivo) return false;
  if (id === 'papelao') {
    if (comprarPapelao()) { tocar('compra'); return true; }
    return false;
  }
  if (E.dinheiro < item.preco) { tocar('erro'); return false; }
  E.dinheiro -= item.preco;
  if (id === 'funcionario') E.funcionarios++;
  else if (MAQUINAS[id]) E.maquinas.push({ tipo: id, entrada: 0, saida: 0, progresso: 0 });
  else E.melhorias[id] = true;
  mensagem(`Comprado: ${item.nome}!`, 'bom');
  tocar('compra');
  avisar('estrutura');
  salvar();
  return true;
}

// ---------------------------------------------------------------------
// SIMULAÇÃO (roda a cada quadro)
// ---------------------------------------------------------------------
let timerEsteira = 0, timerFornecedor = 0, timerSave = 0;

function atualizarSimulacao(dt) {
  E.tempoJogo += dt;
  E.maquinas.forEach((m, i) => avancar('m' + i, MAQUINAS[m.tipo].velocidade, dt));
  processarEsteira(dt);
  processarFornecedor(dt);
  processarTransportadora(dt);
  processarDia(dt);
  processarPedido(dt);
  checarMissao();
  timerSave += dt;
  if (timerSave >= 10) { timerSave = 0; salvar(); }
}

function processarEsteira(dt) {
  if (!tem('esteira') || E.maquinas.length === 0) return;
  const intervalo = tem('expansao') ? 0.125 : 0.25;
  timerEsteira += dt;
  while (timerEsteira >= intervalo) {
    timerEsteira -= intervalo;
    // papelão para a máquina com menos material
    let alvo = -1, menor = capMaquina();
    E.maquinas.forEach((m, i) => { if (m.entrada < menor) { menor = m.entrada; alvo = i; } });
    if (alvo >= 0 && E.papelao > 0) {
      E.papelao--;
      E.maquinas[alvo].entrada++;
      avisar('esteira', 'papelao', alvo);
    }
    // caixas prontas para o estoque
    let origem = -1, maior = 0;
    E.maquinas.forEach((m, i) => { if (m.saida > maior) { maior = m.saida; origem = i; } });
    if (origem >= 0 && E.estoque < capEstoque()) {
      E.maquinas[origem].saida--;
      E.estoque++;
      avisar('esteira', 'caixa', origem);
    }
  }
}

function processarFornecedor(dt) {
  if (!tem('fornecedor_auto')) return;
  timerFornecedor -= dt;
  if (timerFornecedor > 0) return;
  timerFornecedor = 0.5;
  const minimo = 20 + E.maquinas.length * 15;
  const custo = CUSTO_PAPELAO * LOTE_PAPELAO;
  if (E.papelao < minimo && E.papelao + LOTE_PAPELAO <= capPalete() && E.dinheiro >= custo) {
    E.dinheiro -= custo;
    E.papelao += LOTE_PAPELAO;
  }
}

function processarTransportadora(dt) {
  if (!tem('transportadora')) return;
  E.timerTransportadora -= dt;
  if (E.timerTransportadora > 0) return;
  E.timerTransportadora = INTERVALO_TRANSPORTADORA;
  entregarPedido();
  venderEstoque(E.pedido ? E.pedido.qtd : 0);
}

function processarDia(dt) {
  E.timerDia -= dt;
  if (E.timerDia <= 0) {
    E.timerDia = DURACAO_DIA;
    E.dia++;
    if (E.funcionarios > 0) {
      if (E.dinheiro >= folhaPagamento()) {
        E.dinheiro -= folhaPagamento();
        E.salarioAtrasado = false;
        mensagem(`Dia ${E.dia}: salários pagos (${reais(folhaPagamento())}).`);
      } else {
        E.salarioAtrasado = true;
        mensagem('Sem dinheiro para os salários! Os funcionários pararam.', 'ruim');
        tocar('erro');
      }
    }
  } else if (E.salarioAtrasado && E.dinheiro >= folhaPagamento()) {
    E.dinheiro -= folhaPagamento();
    E.salarioAtrasado = false;
    mensagem('Salários em dia: a equipe voltou ao trabalho.', 'bom');
  }
}

function processarPedido(dt) {
  if (!E.pedido) {
    if (E.produzidas === 0) return;
    E.timerPedido -= dt;
    if (E.timerPedido <= 0) novoPedido();
  } else {
    E.pedido.tempo -= dt;
    if (E.pedido.tempo <= 0) {
      mensagem(`O pedido de ${E.pedido.cliente} expirou.`, 'ruim');
      E.pedido = null;
      E.timerPedido = 40 + Math.random() * 30;
    }
  }
}

// ---------------------------------------------------------------------
// MISSÕES
// ---------------------------------------------------------------------
function textoMissao() {
  if (E.missao >= MISSOES.length) return 'Todas as missões concluídas!';
  return `Missão ${E.missao + 1}/${MISSOES.length}: ${MISSOES[E.missao].texto}`;
}

function missaoCumprida(i) {
  switch (i) {
    case 0: return E.produzidas >= 1;
    case 1: return E.vendidas >= 10;
    case 2: return E.dinheiro >= 250;
    case 3: return nivel() >= 2;
    case 4: return E.funcionarios >= 1;
    case 5: return tem('esteira');
    case 6: return tem('expansao');
    case 7: return tem('automacao_total');
  }
  return false;
}

function checarMissao() {
  while (E.missao < MISSOES.length && missaoCumprida(E.missao)) {
    const m = MISSOES[E.missao];
    E.dinheiro += m.premio;
    mensagem(`Missão cumprida: ${m.texto}!` + (m.premio > 0 ? ` Prêmio: +${reais(m.premio)}` : ''), 'bom');
    tocar('missao');
    E.missao++;
    if (E.missao >= MISSOES.length) { salvar(); avisar('venceu'); }
  }
}
