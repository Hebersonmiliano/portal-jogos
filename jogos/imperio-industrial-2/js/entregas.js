// Veículos, trânsito e entregas (v0.7). Regras puras, sem Three.js nem DOM.
import { GANHO_REPUTACAO, MULTA, PERDA_POR_DEFEITO, PERDA_REPUTACAO } from './contratos.js';

export const ROTAS = {
  mercadinho: { nome: 'Bairro Aurora', distancia: 3, tempo: 12 },
  presentes: { nome: 'Centro Comercial', distancia: 5, tempo: 16 },
  confeitaria: { nome: 'Vila do Grão', distancia: 6, tempo: 19 },
  transportadora: { nome: 'Terminal Sul', distancia: 9, tempo: 25 },
  'loja-virtual': { nome: 'Centro de Distribuição', distancia: 12, tempo: 32 },
  rede: { nome: 'Anel Regional', distancia: 18, tempo: 42 },
};
export const TRANSITOS = [
  { nome: 'livre', fator: 0.8 }, { nome: 'normal', fator: 1 }, { nome: 'intenso', fator: 1.35 },
];
const limitar = (v) => Math.max(0, Math.min(100, v));

export function novaFrota() {
  return { veiculos: [{ id: 1, tipo: 'van', estado: 'doca' }], viagens: [], concluidas: 0, km: 0 };
}
export function veiculoLivre(frota) { return frota.veiculos.find((v) => v.estado === 'doca') ?? null; }

export function despachar(quadro, estoque, frota, rng = Math.random) {
  const veiculo = veiculoLivre(frota);
  if (!veiculo) return { erro: 'A van ainda está em uma entrega.' };
  const contrato = [...quadro.ativos].filter((c) => estoque.quantidade(c.chave) >= c.quantidade).sort((a, b) => a.restante - b.restante)[0];
  if (!contrato) return { erro: 'Nenhum contrato está pronto para carregar.' };
  const retirada = estoque.retirar(contrato.chave, contrato.quantidade);
  const rota = ROTAS[contrato.cliente] ?? ROTAS.mercadinho;
  const transito = TRANSITOS[Math.min(TRANSITOS.length - 1, Math.floor(rng() * TRANSITOS.length))];
  const duracaoIda = Math.max(1, Math.round(rota.tempo * transito.fator));
  const viagem = { id: contrato.id, veiculo: veiculo.id, contrato: { ...contrato }, devolvidas: retirada?.defeituosas ?? 0,
    rota: contrato.cliente, transito: transito.nome, distancia: rota.distancia, fase: 'ida', duracaoIda, restante: duracaoIda, progresso: 0 };
  quadro.ativos.splice(quadro.ativos.indexOf(contrato), 1);
  veiculo.estado = 'entrega'; frota.viagens.push(viagem);
  return { viagem };
}

export function atualizarEntregas(frota, quadro, dt) {
  const eventos = { chegadas: [], vencidos: [], retornos: [] };
  for (const viagem of [...frota.viagens]) {
    const veiculo = frota.veiculos.find((v) => v.id === viagem.veiculo);
    viagem.restante -= dt;
    if (viagem.fase === 'ida') viagem.contrato.restante -= dt;
    const duracao = viagem.duracaoIda || 1;
    viagem.progresso = viagem.fase === 'ida' ? Math.min(1, 1 - viagem.restante / duracao) : Math.max(0, viagem.restante / duracao);
    if (viagem.fase === 'ida' && viagem.contrato.restante <= 0) {
      quadro.vencidos += 1; quadro.reputacao = limitar(quadro.reputacao - PERDA_REPUTACAO);
      eventos.vencidos.push({ contrato: viagem.contrato, multa: Math.round(viagem.contrato.pagamento * MULTA) });
      viagem.fase = 'volta'; viagem.restante = duracao; viagem.progresso = 1;
      if (veiculo) veiculo.estado = 'retorno';
      continue;
    }
    if (viagem.restante > 0) continue;
    if (viagem.fase === 'ida') {
      const c = viagem.contrato, devolvidas = viagem.devolvidas;
      const recebido = Math.round((c.pagamento * (c.quantidade - devolvidas)) / c.quantidade);
      quadro.cumpridos += 1;
      if (devolvidas > 0) { quadro.devolucoes = (quadro.devolucoes ?? 0) + devolvidas; quadro.reputacao = limitar(quadro.reputacao - Math.min(PERDA_REPUTACAO, PERDA_POR_DEFEITO * devolvidas)); }
      else quadro.reputacao = limitar(quadro.reputacao + GANHO_REPUTACAO);
      frota.concluidas += 1; frota.km += viagem.distancia;
      eventos.chegadas.push({ ...c, recebido, devolvidas, rota: viagem.rota, transito: viagem.transito });
      viagem.fase = 'volta'; viagem.restante = duracao; viagem.progresso = 1;
      if (veiculo) veiculo.estado = 'retorno';
    } else {
      frota.viagens.splice(frota.viagens.indexOf(viagem), 1);
      if (veiculo) veiculo.estado = 'doca';
      eventos.retornos.push(veiculo);
    }
  }
  return eventos;
}

export const exportarFrota = (frota) => JSON.parse(JSON.stringify(frota));
export function importarFrota(d) {
  const f = novaFrota(); if (!d || typeof d !== 'object') return f;
  f.concluidas = Math.max(0, Math.floor(Number(d.concluidas) || 0)); f.km = Math.max(0, Number(d.km) || 0);
  const viagens = Array.isArray(d.viagens) ? d.viagens : [];
  f.viagens = viagens.filter((v) => v && ROTAS[v.rota] && v.contrato && Number.isFinite(v.restante)).slice(0, 1)
    .map((v) => ({ ...v, fase: v.fase === 'volta' ? 'volta' : 'ida', restante: Math.max(0.1, v.restante), duracaoIda: Math.max(1, Number(v.duracaoIda) || ROTAS[v.rota].tempo), progresso: Math.max(0, Math.min(1, Number(v.progresso) || 0)) }));
  f.veiculos[0].estado = f.viagens[0]?.fase === 'volta' ? 'retorno' : f.viagens.length ? 'entrega' : 'doca'; return f;
}

