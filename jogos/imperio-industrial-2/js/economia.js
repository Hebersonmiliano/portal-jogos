// Economia da primeira campanha: dinheiro, custos e meta de vendas. Pedidos de clientes ficam em contratos.js.

export const DINHEIRO_INICIAL = 100; // R$
export const CUSTO_PRODUCAO = 2; // R$ de papelão por caixa produzida
export const CUSTO_MAQUINA = 60; // R$ por máquina posicionada
export const CUSTO_FUNCIONARIO = 80; // R$ para contratar um funcionário
export const CUSTO_ESTEIRA = 40; // R$ para ligar a saída de uma máquina ao estoque
export const META_VENDAS = 1000; // R$ em vendas para vencer a campanha

let dinheiro = DINHEIRO_INICIAL;
let vendido = 0;

export function getDinheiro() {
  return dinheiro;
}

export function getVendido() {
  return vendido;
}

// Desconta o valor se houver dinheiro. Devolve false sem descontar nada caso contrário.
export function pagar(valor) {
  if (dinheiro < valor) return false;
  dinheiro -= valor;
  return true;
}

// Cobra uma multa. Tira o que houver, sem deixar o dinheiro negativo. Devolve o valor cobrado.
export function cobrarMulta(valor) {
  const cobrado = Math.min(dinheiro, valor);
  dinheiro -= cobrado;
  return cobrado;
}

// Recebe uma venda da expedição.
export function receber(valor) {
  dinheiro += valor;
  vendido += valor;
}

// Salvamento: estado da economia como dados simples.
export function exportarEconomia() {
  return { dinheiro, vendido };
}

// Restaura a economia a partir de um save já validado. Valores inválidos voltam ao padrão.
export function importarEconomia(d = {}) {
  const numero = (v, padrao) => (Number.isFinite(v) && v >= 0 ? v : padrao);
  dinheiro = numero(d.dinheiro, DINHEIRO_INICIAL);
  vendido = numero(d.vendido, 0);
}

export function venceu() {
  return vendido >= META_VENDAS;
}
