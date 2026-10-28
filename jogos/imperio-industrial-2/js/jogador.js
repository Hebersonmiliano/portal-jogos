// Jogador: modelo, movimento com WASD ou setas relativo à câmera e colisão com obstáculos da grade.
import { bloqueado, LIMITE } from './grade.js';
import { PALETA } from './visual/materiais.js';
import { animarPessoa, criarPessoa } from './visual/pessoa.js';

const VELOCIDADE = 4; // unidades por segundo

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
  const passo = (VELOCIDADE * intensidade * dt) / tamanho;
  dx *= passo;
  dz *= passo;

  const p = jogador.position;
  // Move cada eixo separadamente para deslizar ao longo de obstáculos.
  if (!bloqueado(p.x + dx, p.z)) p.x = Math.max(-LIMITE, Math.min(LIMITE, p.x + dx));
  if (!bloqueado(p.x, p.z + dz)) p.z = Math.max(-LIMITE, Math.min(LIMITE, p.z + dz));
  // Gira a pessoa para a direção do movimento.
  jogador.rotation.y = Math.atan2(dx, dz);
  animarPessoa(jogador, dt, true);
}
