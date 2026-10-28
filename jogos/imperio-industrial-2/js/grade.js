// Grade da fábrica: limites do terreno e obstáculos (oficina e máquinas).
// Células têm 1 unidade e o centro de cada célula cai em coordenadas inteiras.

export const LIMITE = 11.5;

const MARGEM_JOGADOR = 0.3;
const obstaculos = []; // retângulos { x0, x1, z0, z1 }

export function registrarObstaculo(x0, x1, z0, z1) {
  obstaculos.push({ x0, x1, z0, z1 });
}

// Um ponto está bloqueado se estiver fora do terreno ou dentro de um obstáculo (com folga do jogador).
export function bloqueado(x, z) {
  if (Math.abs(x) > LIMITE || Math.abs(z) > LIMITE) return true;
  return obstaculos.some(
    (o) =>
      x > o.x0 - MARGEM_JOGADOR &&
      x < o.x1 + MARGEM_JOGADOR &&
      z > o.z0 - MARGEM_JOGADOR &&
      z < o.z1 + MARGEM_JOGADOR,
  );
}

// Uma célula inteira (centro em x, z) cabe se não sobrepõe nenhum obstáculo e está no terreno.
export function cabeAqui(x, z) {
  if (Math.abs(x) > LIMITE - 0.5 || Math.abs(z) > LIMITE - 0.5) return false;
  return obstaculos.every(
    (o) => x + 0.5 <= o.x0 || x - 0.5 >= o.x1 || z + 0.5 <= o.z0 || z - 0.5 >= o.z1,
  );
}
