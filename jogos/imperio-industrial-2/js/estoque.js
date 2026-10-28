// Estoque: caixas prontas guardadas separadas da saída das máquinas, agrupadas por produto.
// Desde a v0.6 cada produto conta também quantas das suas caixas têm defeito (ainda não inspecionadas).

import { VALOR_DEFEITUOSA } from './qualidade.js';

const itens = new Map(); // chave do produto -> { nome, valor, quantidade, defeituosas }

export function guardarNoEstoque(produto, quantidade = 1, defeituosas = 0) {
  const atual = itens.get(produto.chave) ?? { nome: produto.nome, valor: produto.valor, quantidade: 0, defeituosas: 0 };
  atual.quantidade += quantidade;
  atual.defeituosas += Math.min(defeituosas, quantidade);
  itens.set(produto.chave, atual);
}

export function totalNoEstoque() {
  let total = 0;
  for (const item of itens.values()) total += item.quantidade;
  return total;
}

export function defeituosasNoEstoque() {
  let total = 0;
  for (const item of itens.values()) total += item.defeituosas;
  return total;
}

export function resumoEstoque() {
  if (itens.size === 0) return 'vazio';
  return [...itens.values()].map((i) => `${i.quantidade}× ${i.nome}`).join(' · ');
}

// Salvamento: lista de [chave do produto, quantidade, defeituosas].
export function exportarEstoque() {
  return [...itens.entries()].map(([chave, item]) => [chave, item.quantidade, item.defeituosas]);
}

// Restaura o estoque. produtoPorChave reconstrói nome e valor pelo catálogo atual; chaves desconhecidas são ignoradas.
export function importarEstoque(lista, produtoPorChave) {
  itens.clear();
  for (const [chave, quantidade, defeituosas = 0] of Array.isArray(lista) ? lista : []) {
    const produto = produtoPorChave(chave);
    const q = Math.floor(quantidade);
    const d = Number.isFinite(defeituosas) ? Math.max(0, Math.floor(defeituosas)) : 0;
    if (produto && q > 0) guardarNoEstoque(produto, q, d);
  }
}

export function quantidadeDe(chave) {
  return itens.get(chave)?.quantidade ?? 0;
}

// Retira caixas de um produto exato (entrega de contrato). Sem inspeção, as defeituosas vão
// misturadas: sai a mesma proporção que existe no estoque. Devolve false sem mexer se faltar,
// ou { defeituosas } com quantas das caixas retiradas tinham defeito.
export function retirar(chave, quantidade) {
  const item = itens.get(chave);
  if (!item || item.quantidade < quantidade) return false;
  const defeituosas = Math.min(item.defeituosas, Math.round((quantidade * item.defeituosas) / item.quantidade));
  item.quantidade -= quantidade;
  item.defeituosas -= defeituosas;
  if (item.quantidade === 0) itens.delete(chave);
  return { defeituosas };
}

// Inspeção manual: tira as caixas defeituosas do estoque. Devolve quantas foram para o refugo.
export function separarDefeituosas() {
  let removidas = 0;
  for (const [chave, item] of [...itens.entries()]) {
    removidas += item.defeituosas;
    item.quantidade -= item.defeituosas;
    item.defeituosas = 0;
    if (item.quantidade === 0) itens.delete(chave);
  }
  return removidas;
}

// Vende todo o estoque, menos os produtos reservados para contratos. Caixas defeituosas valem metade.
export function venderTudo(reservadas = new Set()) {
  let valor = 0;
  for (const [chave, item] of [...itens.entries()]) {
    if (reservadas.has(chave)) continue;
    valor += (item.quantidade - item.defeituosas) * item.valor + item.defeituosas * item.valor * VALOR_DEFEITUOSA;
    itens.delete(chave);
  }
  return Math.round(valor);
}
