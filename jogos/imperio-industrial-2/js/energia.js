// Energia (v0.6): consumo da linha, tarifa por hora do dia, conta diária, dívida e corte.
// Só regras: não importa o Three.js. O tempo chega em horas de jogo.

// Custo em R$ por hora de jogo, na tarifa normal.
export const CONSUMO = {
  produzindo: 1.0, // máquina automática fabricando
  esteira: 0.35, // esteira levando caixas
  parada: 0.08, // máquina ligada sem produzir
};

// Tarifa varia com a hora: noite mais barata, pico no começo da noite.
export function tarifa(hora) {
  if (hora >= 18 && hora < 21) return { nome: 'pico', fator: 1.5 };
  if (hora >= 22 || hora < 6) return { nome: 'noturna', fator: 0.6 };
  return { nome: 'normal', fator: 1 };
}

export function novaEnergia() {
  return { contaDia: 0, divida: 0, dia: 1, ontem: 0 };
}

// Soma o consumo de um intervalo. carga: { produzindo, esteiras, paradas } (quantidades).
export function consumir(energia, carga, horas, hora) {
  const porHora =
    carga.produzindo * CONSUMO.produzindo + carga.esteiras * CONSUMO.esteira + carga.paradas * CONSUMO.parada;
  const custo = porHora * tarifa(hora).fator * horas;
  energia.contaDia += custo;
  return custo;
}

// Na virada do dia a conta é cobrada. cobrar(valor) devolve quanto conseguiu tirar do caixa.
// O que faltar vira dívida, e a dívida corta a energia.
export function virarDia(energia, dia, cobrar) {
  if (dia <= energia.dia) return null;
  const fatura = Math.round(energia.contaDia * 100) / 100;
  const pago = fatura > 0 ? cobrar(fatura) : 0;
  energia.divida = Math.round((energia.divida + fatura - pago) * 100) / 100;
  energia.ontem = fatura;
  energia.contaDia = 0;
  energia.dia = dia;
  return { fatura, pago };
}

// Paga a dívida com o dinheiro disponível. cobrar(valor) devolve o que conseguiu pagar.
export function pagarDivida(energia, cobrar) {
  if (energia.divida <= 0) return 0;
  const pago = cobrar(energia.divida);
  energia.divida = Math.max(0, Math.round((energia.divida - pago) * 100) / 100);
  return pago;
}

export function energiaCortada(energia) {
  return energia.divida > 0;
}

export function exportarEnergia(energia) {
  return { ...energia };
}

export function importarEnergia(d) {
  const e = novaEnergia();
  if (!d || typeof d !== 'object') return e;
  for (const k of Object.keys(e)) if (Number.isFinite(d[k]) && d[k] >= 0) e[k] = d[k];
  e.dia = Math.max(1, Math.floor(e.dia));
  return e;
}
