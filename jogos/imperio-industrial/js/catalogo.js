'use strict';

const PRODUTOS = {
  simples: { nome: 'Caixa simples', material: 1, preco: 5, ritmo: 1, nivel: 1, cor: '#c8954f', desc: 'Produção rápida para começar a fábrica.' },
  reforcada: { nome: 'Caixa reforçada', material: 2, preco: 9, ritmo: .8, nivel: 2, cor: '#b27c44', desc: 'Mais resistente: usa duas folhas e leva 25% mais tempo.' },
  personalizada: { nome: 'Caixa personalizada', material: 2, preco: 12, ritmo: .6, nivel: 3, cor: '#4c9bb2', desc: 'Embalagem premium: usa duas folhas e leva 67% mais tempo.' },
};

function produtoAtual() { return PRODUTOS[E.produto] || PRODUTOS.simples; }

function motivoTrocaProduto(id) {
  if (!PRODUTOS[id]) return 'Produto inválido.';
  if (nivel() < PRODUTOS[id].nivel) return `Libera no nível ${PRODUTOS[id].nivel}.`;
  if (E.pedido) return 'Conclua ou aguarde o término do contrato ativo.';
  const cargaEquipe = typeof funcionarios !== 'undefined' && funcionarios.some(f => f.cargaTipo === 'caixa' && f.cargaQtd > 0);
  if (E.cargaTipo === 'caixa' || E.estoque > 0 || cargaEquipe || idsProdutores().some(id => produtor(id).saida > 0))
    return 'Recolha e venda todas as caixas, inclusive as transportadas pela equipe.';
  return '';
}

function selecionarProduto(id) {
  if (id === E.produto) return false;
  const motivo = motivoTrocaProduto(id);
  if (motivo) { mensagem(motivo, 'ruim'); return false; }
  idsProdutores().forEach(id => { produtor(id).progresso = 0; });
  E.produto = id;
  E.ofertas = [];
  E.timerPedido = 20;
  // Itens na esteira são apenas visuais. Removê-los evita mostrar a linha antiga.
  if (typeof V !== 'undefined') {
    for (const item of V.itensEsteira) cena.remove(item.objeto);
    V.itensEsteira = [];
  }
  mensagem(`Linha alterada: ${produtoAtual().nome}.`, 'bom');
  salvar();
  return true;
}

function gerarOfertas() {
  if (E.pedido || E.ofertas.length) return;
  const p = produtoAtual();
  let ritmo = velocidadeBancada() + E.funcionarios * .3;
  for (const m of E.maquinas) ritmo += MAQUINAS[m.tipo].velocidade;
  const base = Math.max(5, Math.min(Math.floor(capEstoque() * .4 / 5) * 5, Math.round(ritmo * p.ritmo * 12 / 5) * 5));
  const inicio = Math.floor(Math.random() * CLIENTES.length);
  E.ofertas = [
    { nome: 'Entrega rápida', qtd: base, prazo: 90, multiplicador: 1.4 },
    { nome: 'Lote comercial', qtd: Math.min(capEstoque(), base * 2), prazo: 180, multiplicador: 1.6 },
    { nome: 'Grande encomenda', qtd: Math.min(capEstoque(), base * 3), prazo: 240, multiplicador: 1.8 },
  ].map((d, i) => ({ id: ++E.serialOferta, nome: d.nome, cliente: CLIENTES[(inicio + i) % CLIENTES.length],
    produto: E.produto, qtd: d.qtd, prazo: d.prazo, preco: Math.round(p.preco * d.multiplicador) }));
}

function aceitarContrato(id) {
  if (E.pedido) return false;
  const oferta = E.ofertas.find(o => o.id === id);
  if (!oferta || oferta.produto !== E.produto) return false;
  E.pedido = { ...oferta, tempo: oferta.prazo };
  E.ofertas = [];
  mensagem(`Contrato aceito: ${oferta.qtd} caixas para ${oferta.cliente}.`, 'bom');
  salvar();
  return true;
}

function abrirGestao() {
  // O prazo só começa quando o jogador aceita e volta à fábrica.
  if (!E.pedido && !E.ofertas.length) gerarOfertas();
  const p = produtoAtual();
  const catalogo = Object.entries(PRODUTOS).map(([id, produto]) => {
    const atual = id === E.produto, motivo = atual ? '' : motivoTrocaProduto(id);
    return `<article class="produto-card ${atual ? 'selecionado' : ''}">
      <div class="produto-titulo"><strong>${produto.nome}</strong><span>${reais(produto.preco)} / caixa</span></div>
      <p>${produto.desc}</p><p>${produto.material} papelão(ões) · custo ${reais(produto.material * CUSTO_PAPELAO)} · margem bruta ${reais(produto.preco - produto.material * CUSTO_PAPELAO)}</p>
      <button data-acao="produto" data-id="${id}" ${atual || motivo ? 'disabled' : ''}>${atual ? 'Linha ativa' : motivo || 'Produzir este produto'}</button></article>`;
  }).join('');
  const contratos = E.pedido
    ? `<article class="contrato-card"><strong>Contrato ativo · ${E.pedido.cliente}</strong><p>${E.pedido.qtd} ${p.nome.toLowerCase()} · ${reais((E.pedido.preco || PRECO_PEDIDO) * E.pedido.qtd)} no total</p><p>Estoque ${Math.min(E.estoque, E.pedido.qtd)}/${E.pedido.qtd} · restam ${Math.ceil(E.pedido.tempo)} segundos de jogo. Entregue na EXPEDIÇÃO.</p></article>`
    : E.ofertas.map(o => `<article class="contrato-card"><div class="produto-titulo"><strong>${o.nome}</strong><span>${reais(o.qtd * o.preco)}</span></div>
      <p>${o.cliente} · ${o.qtd} caixas · ${o.prazo} s</p><p>${reais(o.preco)} por caixa. Sem multa por expiração.</p>
      <button data-acao="aceitar-contrato" data-id="${o.id}">Aceitar contrato</button></article>`).join('');
  abrirJanela('PRODUÇÃO E CONTRATOS', `<div class="gestao"><p>Uma linha de produto por vez. Venda todas as caixas antes de trocar. Montagens parciais recomeçam sem perder papelão. A margem não inclui salários.</p>
    <div class="catalogo">${catalogo}</div><h3>Escolha seu próximo cliente</h3><p>O relógio fica pausado neste painel. Contratos entregues: ${E.contratosEntregues}.</p>
    <div class="catalogo">${contratos}</div></div>`, [['Voltar à fábrica', fecharJanela]]);
}
