// Rotas das esteiras (v0.5.1). Só regras: não importa o Three.js.

// Áreas que a esteira contorna: o prédio da oficina, a doca de expedição, a van e a caçamba (com folga).
export const BLOQUEIOS = [
  { x0: -2.9, x1: 2.9, z0: -1.9, z1: 1.9 },
  { x0: -9.4, x1: -6.6, z0: 2.6, z1: 5.4 },
  { x0: -9.1, x1: -6.9, z0: 7.6, z1: 12.4 }, // van estacionada
  { x0: -11.2, x1: -10.0, z0: -7.5, z1: -6.4 }, // caçamba de refugo (v0.6)
];

export function cruza(a, b) {
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
  const z0 = Math.min(a.z, b.z), z1 = Math.max(a.z, b.z);
  return BLOQUEIOS.some((r) => x1 > r.x0 && x0 < r.x1 && z1 > r.z0 && z0 < r.z1);
}

// Rota da máquina ao destino em L, ou com um desvio, sem atravessar nenhum bloqueio.
// Entre as rotas livres, fica a mais curta.
export function rotaEsteira(origem, destino) {
  const a = { x: origem.x, z: origem.z };
  const b = { x: destino.x, z: destino.z };
  const opcoes = [
    [a, { x: b.x, z: a.z }, b],
    [a, { x: a.x, z: b.z }, b],
  ];
  for (const z of [2.5, -2.5, 6, -4]) opcoes.push([a, { x: a.x, z }, { x: b.x, z }, b]);
  for (const x of [-5.5, -10.6, 3.5, -3.5]) opcoes.push([a, { x, z: a.z }, { x, z: b.z }, b]);
  const comprimento = (r) => r.reduce((t, p, i) => (i ? t + Math.abs(p.x - r[i - 1].x) + Math.abs(p.z - r[i - 1].z) : 0), 0);
  const livres = opcoes.filter((rota) => rota.every((p, i) => i === 0 || !cruza(rota[i - 1], p)));
  const escolhida = livres.sort((r1, r2) => comprimento(r1) - comprimento(r2))[0] ?? opcoes[0];
  return escolhida.filter((p, i, r) => i === 0 || p.x !== r[i - 1].x || p.z !== r[i - 1].z);
}
