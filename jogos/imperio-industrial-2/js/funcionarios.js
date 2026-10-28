// Funcionários: andam até as máquinas, produzem caixas e levam a saída ao estoque, sem o jogador.
import { PALETA } from './visual/materiais.js';
import { animarPessoa, criarPessoa, mostrarCarga } from './visual/pessoa.js';
import { saidaCheia } from './automacao.js';

const VELOCIDADE = 2.5; // unidades por segundo
const PAUSA = 1; // segundos entre ações
export const ESTOQUE_PONTO = { x: -8, z: -6 }; // prateleira de estoque, na cena

// Funcionário: macacão azul-petróleo e capacete amarelo. Mostra nas mãos as caixas que carrega.
export function criarFuncionario(x, z) {
  const grupo = criarPessoa({ tronco: PALETA.petroleoClaro, calca: PALETA.petroleoEscuro, capacete: PALETA.amarelo });
  grupo.position.set(x, 0, z);
  return { malha: grupo, fase: null, alvo: null, espera: 0, carga: [] };
}

// Escolhe a próxima tarefa: recolher a saída de uma máquina sem esteira, ou produzir numa máquina manual com espaço.
// Máquinas automáticas produzem sozinhas, e as que têm esteira não precisam de transporte.
function escolherTarefa(f, maquinas, acoes) {
  const comSaida = maquinas.find((m) => m.saida.length > 0 && !m.esteira);
  if (comSaida) {
    f.fase = 'recolher';
    f.alvo = { pos: { x: comSaida.x, z: comSaida.z + 0.8 }, maquina: comSaida };
    return;
  }
  const destino = maquinas.find((m) => !m.automatica && !m.quebrada && !saidaCheia(m));
  if (destino && acoes.podeProduzir()) {
    f.fase = 'produzir';
    f.alvo = { pos: { x: destino.x, z: destino.z + 0.8 }, maquina: destino };
  }
}

// Anda em direção ao ponto. Devolve true quando chega.
function andarAte(f, pos, dt) {
  const p = f.malha.position;
  const dx = pos.x - p.x;
  const dz = pos.z - p.z;
  const distancia = Math.hypot(dx, dz);
  if (distancia < 0.05) return true;
  f.malha.rotation.y = Math.atan2(dx, dz);
  const passo = VELOCIDADE * dt;
  if (passo >= distancia) {
    p.x = pos.x;
    p.z = pos.z;
    return true;
  }
  p.x += (dx / distancia) * passo;
  p.z += (dz / distancia) * passo;
  return false;
}

// Executa a ação da fase atual quando o funcionário chega ao destino.
function executar(f, acoes) {
  if (f.fase === 'produzir') {
    acoes.produzir(f.alvo.maquina);
    f.espera = PAUSA;
    f.fase = null;
    f.alvo = null;
  } else if (f.fase === 'recolher') {
    f.carga = acoes.recolher(f.alvo.maquina);
    f.espera = PAUSA;
    if (f.carga.length > 0) {
      f.fase = 'estoque';
      f.alvo = { pos: ESTOQUE_PONTO };
    } else {
      f.fase = null;
      f.alvo = null;
    }
  } else if (f.fase === 'estoque') {
    acoes.depositar(f.carga);
    f.carga = [];
    f.espera = PAUSA;
    f.fase = null;
    f.alvo = null;
  }
}

// Avança o funcionário em dt segundos. acoes é o conjunto de funções da cena (produzir, recolher, depositar).
export function atualizarFuncionario(f, dt, maquinas, acoes) {
  mostrarCarga(f.malha, f.carga.map((item) => item.produto ?? item));
  if (f.espera > 0) {
    f.espera -= dt;
    animarPessoa(f.malha, dt, false);
    return;
  }
  if (!f.alvo) escolherTarefa(f, maquinas, acoes);
  if (!f.alvo) {
    animarPessoa(f.malha, dt, false);
    return;
  }
  const chegou = andarAte(f, f.alvo.pos, dt);
  animarPessoa(f.malha, dt, !chegou);
  if (chegou) executar(f, acoes);
}
