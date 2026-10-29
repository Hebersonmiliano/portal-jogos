// Modelo de pessoa usado pelo jogador e pelos funcionários: pernas e braços que balançam ao andar,
// capacete e um ponto nas mãos para carregar caixas.
import * as THREE from 'three';
import { PALETA, bloco, mat } from './materiais.js';
import { modeloCaixa } from './estacoes.js';

const PELE = '#e0b08a';

export function criarPessoa({ tronco, calca = '#2b2b3a', capacete = '#ffffff', faixa = null, genero = 'homem' }) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);

  const pernas = [-0.13, 0.13].map((x) => {
    const pivo = new THREE.Group();
    pivo.position.set(x, 0.62, 0);
    bloco(0.2, 0.58, 0.24, calca, 0, -0.6, 0, pivo);
    bloco(0.22, 0.1, 0.3, '#2a2422', 0, -0.62, 0.03, pivo);
    corpo.add(pivo);
    return pivo;
  });
  bloco(0.56, 0.7, 0.34, mat(tronco, { aspereza: 0.8 }), 0, 0.62, 0, corpo);
  if (faixa) {
    bloco(0.57, 0.07, 0.35, mat(faixa, { aspereza: 0.4, emissivo: faixa, intensidade: 0.15 }), 0, 0.82, 0, corpo);
    bloco(0.57, 0.07, 0.35, mat(faixa, { aspereza: 0.4, emissivo: faixa, intensidade: 0.15 }), 0, 1.02, 0, corpo);
  }
  const bracos = [-0.36, 0.36].map((x) => {
    const pivo = new THREE.Group();
    pivo.position.set(x, 1.25, 0);
    bloco(0.15, 0.55, 0.18, mat(tronco, { aspereza: 0.8 }), 0, -0.55, 0, pivo);
    bloco(0.13, 0.12, 0.15, PELE, 0, -0.66, 0, pivo);
    corpo.add(pivo);
    return pivo;
  });
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10), mat(PELE, { aspereza: 0.7 }));
  cabeca.position.y = 1.55;
  cabeca.castShadow = true;
  corpo.add(cabeca);
  if (genero === 'mulher') {
    // Cabelo preso abaixo do capacete, mantendo o mesmo uniforme e proteção.
    const cabelo = new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),mat('#422b22'));
    cabelo.scale.set(.8,1.3,1); cabelo.position.set(0,1.4,-.22); corpo.add(cabelo);
    bloco(.38,.13,.12,'#422b22',0,1.49,-.16,corpo);
  }
  for (const s of [-1, 1]) bloco(0.04, 0.05, 0.02, '#2a2422', s * 0.08, 1.56, 0.2, corpo);
  const casco = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(capacete, { aspereza: 0.35, metal: 0.1 }),
  );
  casco.position.y = 1.6;
  casco.castShadow = true;
  corpo.add(casco);
  bloco(0.5, 0.03, 0.28, mat(capacete, { aspereza: 0.35 }), 0, 1.58, 0.1, corpo);

  const carga = new THREE.Group();
  carga.position.set(0, 0.95, 0.32);
  corpo.add(carga);

  g.userData = { corpo, pernas, bracos, carga, fase: 0, cargaAtual: '' };
  return g;
}

// Anima o passo. velocidade: 0 parado, 1 andando.
export function animarPessoa(pessoa, dt, andando) {
  const u = pessoa.userData;
  u.fase = andando ? u.fase + dt * 11 : u.fase * 0.85;
  const balanco = andando ? Math.sin(u.fase) * 0.6 : 0;
  u.pernas[0].rotation.x = balanco;
  u.pernas[1].rotation.x = -balanco;
  const carregando = u.carga.children.length > 0;
  u.bracos[0].rotation.x = carregando ? -1.2 : -balanco * 0.8;
  u.bracos[1].rotation.x = carregando ? -1.2 : balanco * 0.8;
  u.corpo.position.y = andando ? Math.abs(Math.sin(u.fase)) * 0.05 : 0;
}

// Mostra até 3 caixas nas mãos, com as cores dos produtos carregados.
export function mostrarCarga(pessoa, produtos) {
  const u = pessoa.userData;
  const chave = produtos.slice(0, 3).map((p) => p.chave).join(',');
  if (chave === u.cargaAtual) return;
  u.cargaAtual = chave;
  u.carga.clear();
  produtos.slice(0, 3).forEach((p, i) => {
    const c = modeloCaixa(0.34, 0.24, 0.3, p.cor);
    c.position.y = i * 0.25;
    u.carga.add(c);
  });
}

