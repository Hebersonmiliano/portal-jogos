// Qualidade e manutenção (v0.6): desgaste das máquinas, defeitos, quebras, conserto e inspeção.
// Só regras: não importa o Three.js. O sorteio vem de fora (rng) para os testes serem previsíveis.

export const DESGASTE_POR_CAIXA = 2; // % de desgaste a cada caixa produzida
export const DEFEITO_BASE = 0.03; // chance de defeito com a máquina nova
export const DEFEITO_POR_DESGASTE = 0.0025; // chance extra por ponto de desgaste (100% → 28%)
export const LIMIAR_QUEBRA = 70; // a partir deste desgaste a máquina pode quebrar
export const CUSTO_CONSERTO = 60; // R$ para consertar uma máquina quebrada
export const CUSTO_INSPETOR = 80; // R$ para instalar o inspetor automático numa esteira
export const CAIXAS_POR_REAL = 5; // inspeção manual: R$ 1 a cada 5 caixas
export const VALOR_DEFEITUOSA = 0.5; // caixa defeituosa vendida avulsa vale metade

export function chanceDefeito(desgaste) {
  return DEFEITO_BASE + DEFEITO_POR_DESGASTE * Math.max(0, Math.min(100, desgaste));
}

// Chance de quebrar a cada caixa: zero abaixo de 70%, sobe 1 ponto por % e é certa em 100%.
export function chanceQuebra(desgaste) {
  if (desgaste >= 100) return 1;
  if (desgaste < LIMIAR_QUEBRA) return 0;
  return (desgaste - LIMIAR_QUEBRA) / 100;
}

// Registra uma caixa produzida: desgasta a máquina, sorteia defeito e quebra.
export function registrarProducao(maquina, rng = Math.random) {
  const defeito = rng() < chanceDefeito(maquina.desgaste ?? 0);
  maquina.desgaste = Math.min(100, (maquina.desgaste ?? 0) + DESGASTE_POR_CAIXA);
  const quebrou = rng() < chanceQuebra(maquina.desgaste);
  if (quebrou) maquina.quebrada = true;
  return { defeito, quebrou };
}

// Manutenção preventiva custa pouco (até R$ 30); consertar uma máquina quebrada custa R$ 60.
export function custoManutencao(maquina) {
  if (maquina.quebrada) return CUSTO_CONSERTO;
  return Math.max(5, Math.round((maquina.desgaste ?? 0) * 0.3));
}

export function fazerManutencao(maquina) {
  maquina.desgaste = 0;
  maquina.quebrada = false;
}

export function custoInspecaoManual(caixas) {
  return Math.ceil(caixas / CAIXAS_POR_REAL);
}
