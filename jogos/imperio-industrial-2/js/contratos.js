// Clientes, contratos e reputação (v0.5). Só regras: não importa o Three.js nem o DOM.
// O tempo dos contratos é o tempo de jogo, em segundos, avançado por atualizarContratos(dt).

export const REPUTACAO_INICIAL = 20;
export const MAX_OFERTAS = 3;
export const MAX_ATIVOS = 3;
export const INTERVALO_OFERTA = 30; // segundos entre ofertas novas
export const INTERVALO_QUADRO_VAZIO = 10; // sem nenhuma oferta, o próximo cliente chega mais rápido
export const VALIDADE_OFERTA = 60; // segundos que uma oferta fica disponível
export const GANHO_REPUTACAO = 5; // entrega no prazo
export const PERDA_REPUTACAO = 10; // prazo vencido
export const MULTA = 0.25; // fração do pagamento cobrada se o prazo vencer
export const PERDA_POR_DEFEITO = 2; // reputação perdida por caixa defeituosa devolvida (v0.6)

// Faixas de reputação: nomes mostrados no HUD.
export const NIVEIS = [
  { minimo: 0, nome: 'Bairro' },
  { minimo: 30, nome: 'Distrito' },
  { minimo: 60, nome: 'Regional' },
  { minimo: 85, nome: 'Referência' },
];

// Perfis de clientes. tamanhos usa os ids do catálogo; cores e materiais, os índices.
// margem multiplica o preço de venda avulsa da caixa.
export const CLIENTES = [
  { id: 'mercadinho', nome: 'Mercadinho Aurora', reputacao: 0, tamanhos: ['P', 'M'], cores: [0], materiais: [0], quantidade: [4, 8], prazo: 90, margem: 1.3 },
  { id: 'presentes', nome: 'Loja Bom Presente', reputacao: 0, tamanhos: ['P', 'M'], cores: [1, 2], materiais: [0], quantidade: [3, 6], prazo: 100, margem: 1.5 },
  { id: 'confeitaria', nome: 'Confeitaria Doce Grão', reputacao: 15, tamanhos: ['P'], cores: [2], materiais: [0, 1], quantidade: [6, 10], prazo: 90, margem: 1.6 },
  { id: 'transportadora', nome: 'Transportadora Rota Sul', reputacao: 30, tamanhos: ['G'], cores: [0], materiais: [1], quantidade: [6, 12], prazo: 150, margem: 1.5 },
  { id: 'loja-virtual', nome: 'Loja Virtual Clique', reputacao: 50, tamanhos: ['M', 'G'], cores: [0, 1, 2], materiais: [1], quantidade: [10, 16], prazo: 160, margem: 1.7 },
  { id: 'rede', nome: 'Rede Varejo Centro', reputacao: 70, tamanhos: ['M', 'G'], cores: [0, 1], materiais: [0, 1], quantidade: [18, 30], prazo: 240, margem: 1.9 },
];

const sortear = (lista, rng) => lista[Math.floor(rng() * lista.length)];
const limitar = (v) => Math.max(0, Math.min(100, v));

export function nivel(reputacao) {
  return [...NIVEIS].reverse().find((n) => reputacao >= n.minimo).nome;
}

export function clientesDisponiveis(reputacao) {
  return CLIENTES.filter((c) => reputacao >= c.reputacao);
}

// Estado inicial do quadro de contratos.
export function novoQuadro() {
  return { reputacao: REPUTACAO_INICIAL, ofertas: [], ativos: [], cumpridos: 0, vencidos: 0, devolucoes: 0, cronometro: INTERVALO_OFERTA, proximoId: 1 };
}

// Gera uma oferta de um cliente disponível. produtoPorChave vem do catálogo.
export function gerarOferta(quadro, produtoPorChave, rng = Math.random) {
  const cliente = sortear(clientesDisponiveis(quadro.reputacao), rng);
  const chave = `${sortear(cliente.tamanhos, rng)}-${sortear(cliente.cores, rng)}-${sortear(cliente.materiais, rng)}`;
  const produto = produtoPorChave(chave);
  const [min, max] = cliente.quantidade;
  const quantidade = min + Math.floor(rng() * (max - min + 1));
  // Reputação alta paga até 50% a mais.
  const unitario = Math.round(produto.valor * cliente.margem * (1 + quadro.reputacao / 200));
  return {
    id: quadro.proximoId++,
    cliente: cliente.id,
    chave,
    quantidade,
    pagamento: unitario * quantidade,
    prazo: cliente.prazo,
    validade: VALIDADE_OFERTA,
  };
}

export function nomeCliente(id) {
  return CLIENTES.find((c) => c.id === id)?.nome ?? 'Cliente';
}

// Aceita a oferta na posição (0, 1 ou 2). Devolve o contrato ou um texto explicando por que não deu.
export function aceitar(quadro, posicao) {
  const oferta = quadro.ofertas[posicao];
  if (!oferta) return { erro: 'Não há oferta nessa posição.' };
  if (quadro.ativos.length >= MAX_ATIVOS) return { erro: `Limite de ${MAX_ATIVOS} contratos ao mesmo tempo.` };
  quadro.ofertas.splice(posicao, 1);
  const contrato = { ...oferta, restante: oferta.prazo };
  delete contrato.validade;
  quadro.ativos.push(contrato);
  return { contrato };
}

// Avança o tempo: ofertas expiram, novas aparecem e contratos podem vencer.
// Devolve os eventos do passo: { novas: [...], expiradas: [...], vencidos: [{ contrato, multa }] }
export function atualizarContratos(quadro, dt, produtoPorChave, rng = Math.random) {
  const eventos = { novas: [], expiradas: [], vencidos: [] };
  for (const o of [...quadro.ofertas]) {
    o.validade -= dt;
    if (o.validade <= 0) {
      quadro.ofertas.splice(quadro.ofertas.indexOf(o), 1);
      eventos.expiradas.push(o);
    }
  }
  quadro.cronometro += dt;
  const intervalo = quadro.ofertas.length === 0 ? INTERVALO_QUADRO_VAZIO : INTERVALO_OFERTA;
  if (quadro.ofertas.length < MAX_OFERTAS && quadro.cronometro >= intervalo) {
    quadro.cronometro = 0;
    const oferta = gerarOferta(quadro, produtoPorChave, rng);
    quadro.ofertas.push(oferta);
    eventos.novas.push(oferta);
  }
  for (const c of [...quadro.ativos]) {
    c.restante -= dt;
    if (c.restante <= 0) {
      quadro.ativos.splice(quadro.ativos.indexOf(c), 1);
      quadro.vencidos += 1;
      quadro.reputacao = limitar(quadro.reputacao - PERDA_REPUTACAO);
      eventos.vencidos.push({ contrato: c, multa: Math.round(c.pagamento * MULTA) });
    }
  }
  return eventos;
}

// Entrega na expedição os contratos que o estoque já cobre, do prazo mais curto para o mais longo.
// estoque: { quantidade(chave), retirar(chave, q) → { defeituosas } }.
// Caixas defeituosas voltam como devolução: o cliente não paga por elas e a reputação cai
// (2 pontos por caixa, até 10) em vez de subir. Devolve os contratos entregues com
// recebido (R$ pagos) e devolvidas (caixas com defeito).
export function entregar(quadro, estoque) {
  const entregues = [];
  const ordem = [...quadro.ativos].sort((a, b) => a.restante - b.restante);
  for (const c of ordem) {
    if (estoque.quantidade(c.chave) < c.quantidade) continue;
    const retirada = estoque.retirar(c.chave, c.quantidade);
    const devolvidas = retirada?.defeituosas ?? 0;
    quadro.ativos.splice(quadro.ativos.indexOf(c), 1);
    quadro.cumpridos += 1;
    if (devolvidas > 0) {
      quadro.devolucoes = (quadro.devolucoes ?? 0) + devolvidas;
      quadro.reputacao = limitar(quadro.reputacao - Math.min(PERDA_REPUTACAO, PERDA_POR_DEFEITO * devolvidas));
    } else {
      quadro.reputacao = limitar(quadro.reputacao + GANHO_REPUTACAO);
    }
    const recebido = Math.round((c.pagamento * (c.quantidade - devolvidas)) / c.quantidade);
    entregues.push({ ...c, recebido, devolvidas });
  }
  return entregues;
}

// Produtos que algum contrato ativo pede: ficam fora da venda avulsa.
export function chavesReservadas(quadro) {
  return new Set(quadro.ativos.map((c) => c.chave));
}

// Salvamento.
export function exportarQuadro(quadro) {
  return JSON.parse(JSON.stringify(quadro));
}

// Restaura o quadro a partir do save. Ofertas e contratos com produto ou cliente desconhecido são descartados.
export function importarQuadro(d, produtoPorChave) {
  const q = novoQuadro();
  if (!d || typeof d !== 'object') return q;
  const num = (v, padrao) => (Number.isFinite(v) ? v : padrao);
  const valido = (c) =>
    c && typeof c === 'object' && produtoPorChave(c.chave) && CLIENTES.some((x) => x.id === c.cliente) &&
    Number.isInteger(c.quantidade) && c.quantidade > 0 && Number.isFinite(c.pagamento) && c.pagamento >= 0;
  q.reputacao = limitar(num(d.reputacao, REPUTACAO_INICIAL));
  q.cumpridos = Math.max(0, Math.floor(num(d.cumpridos, 0)));
  q.vencidos = Math.max(0, Math.floor(num(d.vencidos, 0)));
  q.devolucoes = Math.max(0, Math.floor(num(d.devolucoes, 0)));
  q.cronometro = Math.max(0, num(d.cronometro, INTERVALO_OFERTA));
  q.ofertas = (Array.isArray(d.ofertas) ? d.ofertas : []).filter(valido).slice(0, MAX_OFERTAS)
    .map((o) => ({ ...o, prazo: Math.max(1, num(o.prazo, 90)), validade: Math.max(1, num(o.validade, VALIDADE_OFERTA)) }));
  q.ativos = (Array.isArray(d.ativos) ? d.ativos : []).filter(valido).slice(0, MAX_ATIVOS)
    .map((c) => ({ ...c, prazo: Math.max(1, num(c.prazo, 90)), restante: Math.max(1, num(c.restante, 90)) }));
  const ids = [...q.ofertas, ...q.ativos].map((c) => num(c.id, 0));
  q.proximoId = Math.max(num(d.proximoId, 1), ...ids.map((i) => i + 1), 1);
  return q;
}
