// Jogador: modelo, movimento com WASD ou setas relativo à câmera e colisão com obstáculos da grade.
import { bloqueado, limitesAtuais } from './grade.js';
import { PALETA } from './visual/materiais.js';
import { animarPessoa, criarPessoa } from './visual/pessoa.js';

const VELOCIDADE = 4; // unidades por segundo

// Busca em células de meio metro; os trechos são checados para não cortar quinas.
export function andarAte(jogador, x, z) {
  const inicio = { x: Math.round(jogador.position.x * 2), z: Math.round(jogador.position.z * 2) };
  const fim = { x: Math.round(x * 2), z: Math.round(z * 2) };
  const chave = (p) => `${p.x},${p.z}`;
  if (bloqueado(fim.x / 2, fim.z / 2)) return false;
  const fila = [inicio], pais = new Map([[chave(inicio), null]]);
  let encontrado = null;
  for (let i = 0; i < fila.length && i < 6500; i++) {
    const p = fila[i];
    if (chave(p) === chave(fim)) { encontrado = p; break; }
    for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const q = { x: p.x + dx, z: p.z + dz };
      if (pais.has(chave(q)) || bloqueado(q.x/2,q.z/2) || bloqueado((p.x+q.x)/4,(p.z+q.z)/4)) continue;
      pais.set(chave(q), p); fila.push(q);
    }
  }
  if (!encontrado) return false;
  const rota = [];
  for (let p = encontrado; p; p = pais.get(chave(p))) rota.unshift({ x: p.x/2, z: p.z/2 });
  jogador.userData.rotaMouse = rota;
  return true;
}

// Personagem do jogador: colete laranja com faixas refletivas e capacete branco, para se destacar.
export function criarJogador(x, z) {
  const jogador = criarPessoa({ tronco: PALETA.laranja, calca: '#2b3440', capacete: '#ffffff', faixa: '#f4f4ec' });
  jogador.position.set(x, 0, z);
  // Direção para onde o jogador olha (eixo dominante), usada para posicionar máquinas à frente.
  jogador.userData.frente = { x: 0, z: 1 };
  return jogador;
}

// giro: ângulo da câmera em volta do jogador. W anda para longe da câmera, D para a direita da tela.
// analogico: analógico do controle ({x, y} de -1 a 1); inclinar pouco anda devagar.
export function atualizarJogador(jogador, teclas, dt, giro = 0, analogico = { x: 0, y: 0 }) {
  let ex = 0;
  let ez = 0;
  if (teclas.has('KeyA') || teclas.has('ArrowLeft')) ex -= 1;
  if (teclas.has('KeyD') || teclas.has('ArrowRight')) ex += 1;
  if (teclas.has('KeyW') || teclas.has('ArrowUp')) ez -= 1;
  if (teclas.has('KeyS') || teclas.has('ArrowDown')) ez += 1;
  let intensidade = 1;
  if (ex === 0 && ez === 0 && (analogico.x || analogico.y)) {
    ex = analogico.x;
    ez = analogico.y;
    intensidade = Math.min(1, Math.hypot(ex, ez));
  }
  const manual = ex !== 0 || ez !== 0;
  if (manual) jogador.userData.rotaMouse = [];
  const rota = jogador.userData.rotaMouse ?? [];
  while (rota.length && Math.hypot(rota[0].x-jogador.position.x,rota[0].z-jogador.position.z) < 0.08) rota.shift();
  if (!manual && rota.length) {
    const dx = rota[0].x-jogador.position.x, dz = rota[0].z-jogador.position.z;
    ex = dx*Math.cos(giro)-dz*Math.sin(giro);
    ez = dx*Math.sin(giro)+dz*Math.cos(giro);
    intensidade = Math.min(1, Math.hypot(dx,dz)/(VELOCIDADE*dt));
  }
  if (ex === 0 && ez === 0) {
    animarPessoa(jogador, dt, false);
    return;
  }

  // Converte a entrada da tela para o mundo: frente = da câmera para o jogador.
  const sen = Math.sin(giro);
  const cos = Math.cos(giro);
  let dx = ex * cos + ez * sen;
  let dz = -ex * sen + ez * cos;

  jogador.userData.frente = Math.abs(dx) >= Math.abs(dz)
    ? { x: Math.sign(dx), z: 0 }
    : { x: 0, z: Math.sign(dz) };

  // Normaliza a diagonal para não andar mais rápido.
  const tamanho = Math.hypot(dx, dz);
  const passo = Math.min(VELOCIDADE * intensidade * dt * (jogador.userData.bonusVelocidade ?? 1), manual ? Infinity : Math.hypot(rota[0]?.x-jogador.position.x,rota[0]?.z-jogador.position.z)) / tamanho;
  dx *= passo;
  dz *= passo;

  const p = jogador.position;
  // Move cada eixo separadamente para deslizar ao longo de obstáculos.
  const limites = limitesAtuais();
  if (!bloqueado(p.x + dx, p.z)) p.x = Math.max(limites.xMin, Math.min(limites.xMax, p.x + dx));
  if (!bloqueado(p.x, p.z + dz)) p.z = Math.max(limites.zMin, Math.min(limites.zMax, p.z + dz));
  // Gira a pessoa para a direção do movimento.
  jogador.rotation.y = Math.atan2(dx, dz);
  animarPessoa(jogador, dt, true);
}

