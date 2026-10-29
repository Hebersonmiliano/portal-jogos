// Cenário do bairro em volta da área de jogo: gramado, rua com calçadas e postes, prédios
// vizinhos com janelas que acendem à noite, árvores e carros estacionados.
// Tudo fica fora da grade jogável (|x| ou |z| maior que 12), então não bloqueia o jogador.
import * as THREE from 'three';
import { PALETA, bloco, cilindro, lampada, mat, registrarNoturno, texturaPlaca } from './visual/materiais.js';

const COR = {
  grama: '#7fa86a',
  gramaEscura: '#6d955a',
  asfalto: '#3d4347',
  faixa: '#f2efe6',
  calcada: '#b8b2a6',
  tronco: '#6b4f35',
  copas: ['#4f8a4a', '#5f9a52', '#467d43'],
};

// Prédios vizinhos: posição, tamanho, cor e letreiro.
const PREDIOS = [
  { x: -17, z: -15, w: 7, h: 8, d: 6, cor: '#c9b99a', nome: 'GRÁFICA CENTRAL' },
  { x: 15, z: -17, w: 8, h: 6, d: 7, cor: '#9fb3c2', nome: 'METALÚRGICA AURORA' },
  { x: -19, z: 5, w: 6, h: 11, d: 6, cor: '#d6c7a8', nome: '' },
  { x: 27, z: 6, w: 7, h: 7, d: 7, cor: '#a9b8a0', nome: 'PAPELARIA SUL' },
  { x: 0, z: -19, w: 9, h: 5, d: 5, cor: '#b7a59a', nome: 'FORNECEDOR DISTRITAL' },
  { x: -6, z: 23, w: 8, h: 6, d: 6, cor: '#c2b6a0', nome: 'LOJA BOM PRESENTE' },
  { x: 10, z: 23, w: 7, h: 9, d: 6, cor: '#a3b2b8', nome: '' },
];

const ARVORES = [
  [-14, -4], [-14.5, 1.5], [23.8, -9], [23.5, 1], [-24, 14], [24, -2], [6, 20], [-14, 20],
  [21, 19], [-25, -6], [6, -15], [-8, -16],
];

// Janelas com brilho próprio: compartilham um material que acende ao anoitecer.
const janelaPredio = new THREE.MeshStandardMaterial({
  color: '#8fb6c2', roughness: 0.2, metalness: 0.3, emissive: new THREE.Color('#ffd58a'), emissiveIntensity: 0,
});
const janelaApagada = new THREE.MeshStandardMaterial({ color: '#6f8c95', roughness: 0.2, metalness: 0.3 });
registrarNoturno((e) => (janelaPredio.emissiveIntensity = 1.1 * e));

function predio(cena, p) {
  const g = new THREE.Group();
  g.position.set(p.x, 0, p.z);
  bloco(p.w, p.h, p.d, mat(p.cor, { aspereza: 0.9 }), 0, 0, 0, g);
  bloco(p.w + 0.2, 0.3, p.d + 0.2, mat('#5b6266', { aspereza: 0.8 }), 0, p.h, 0, g);
  bloco(p.w + 0.04, 0.5, p.d + 0.04, mat(PALETA.concretoEscuro), 0, 0, 0, g);
  // Fileiras de janelas nas quatro faces; algumas ficam apagadas à noite.
  let n = 0;
  for (let y = 1.4; y < p.h - 0.8; y += 1.6) {
    for (const [face, larg] of [['z', p.w], ['x', p.d]]) {
      for (let u = -larg / 2 + 1; u <= larg / 2 - 0.9; u += 1.4) {
        for (const s of [-1, 1]) {
          const material = (n++ * 7) % 5 === 0 ? janelaApagada : janelaPredio;
          if (face === 'z') bloco(0.8, 0.9, 0.05, material, u, y, s * (p.d / 2 + 0.01), g).castShadow = false;
          else bloco(0.05, 0.9, 0.8, material, s * (p.w / 2 + 0.01), y, u, g).castShadow = false;
        }
      }
    }
  }
  // Ar-condicionado e caixa-d'água no telhado.
  bloco(1, 0.5, 0.8, PALETA.concretoClaro, p.w / 4, p.h + 0.3, -p.d / 5, g);
  cilindro(0.6, 0.9, mat('#5d7e88', { aspereza: 0.5 }), -p.w / 4, p.h + 0.3, p.d / 6, g);
  if (p.nome) {
    // Letreiro na face voltada para o terreno do jogador.
    const frente = Math.abs(p.x) > Math.abs(p.z) ? (p.x > 0 ? -1 : 1) : 0;
    const placa = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(p.w, p.d) * 0.85, 0.7),
      new THREE.MeshStandardMaterial({ map: texturaPlaca(p.nome, { fundo: PALETA.petroleo, fonte: 56, largura: 1024 }), roughness: 0.6 }),
    );
    if (frente !== 0) {
      placa.position.set(frente * (p.w / 2 + 0.03), p.h - 0.6, 0);
      placa.rotation.y = frente * Math.PI / 2;
    } else {
      const s = p.z > 0 ? -1 : 1;
      placa.position.set(0, p.h - 0.6, s * (p.d / 2 + 0.03));
      if (s < 0) placa.rotation.y = Math.PI;
    }
    g.add(placa);
  }
  cena.add(g);
}

// Árvore estilizada: tronco e copa de poliedros em dois tons.
const geoCopa = new THREE.IcosahedronGeometry(1, 0);
function arvore(cena, x, z, i) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const escala = 0.85 + ((i * 37) % 10) / 25;
  cilindro(0.18, 1.6 * escala, COR.tronco, 0, 0, 0, g, 6);
  for (const [dx, dy, dz, r, cor] of [[0, 2.4, 0, 1.25, 0], [0.55, 2.0, 0.3, 0.85, 1], [-0.5, 2.1, -0.25, 0.8, 2]]) {
    const copa = new THREE.Mesh(geoCopa, mat(COR.copas[(cor + i) % 3], { aspereza: 0.9 }));
    copa.scale.setScalar(r * escala);
    copa.position.set(dx * escala, dy * escala, dz * escala);
    copa.rotation.set(i, i * 2, 0);
    copa.castShadow = true;
    g.add(copa);
  }
  cena.add(g);
}

function carro(cena, x, z, cor, rotacao) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotacao;
  bloco(1.6, 0.55, 3.2, mat(cor, { aspereza: 0.35, metal: 0.4 }), 0, 0.28, 0, g);
  bloco(1.4, 0.5, 1.6, mat('#2a3a40', { aspereza: 0.1, metal: 0.5 }), 0, 0.83, -0.2, g);
  const roda = mat('#1c1e1f', { aspereza: 0.9 });
  for (const wz of [-1.05, 1.05]) for (const s of [-1, 1]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), roda);
    r.rotation.z = Math.PI / 2;
    r.position.set(s * 0.75, 0.3, wz);
    g.add(r);
  }
  cena.add(g);
}

// Adiciona o cenário à cena.
export function criarCenario(cena) {
  const gramado = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(COR.grama, { aspereza: 1 }));
  gramado.rotation.x = -Math.PI / 2;
  gramado.position.y = -0.03;
  gramado.receiveShadow = true;
  cena.add(gramado);

  // Rua ao sul da área de jogo: asfalto, faixa tracejada, calçadas, meio-fio e faixa de pedestres.
  bloco(200, 0.02, 5, COR.asfalto, 0, -0.01, 15.5, cena).castShadow = false;
  for (const z of [12.75, 18.4]) bloco(200, 0.12, 1.6, COR.calcada, 0, -0.02, z, cena).castShadow = false;
  for (let x = -90; x <= 90; x += 3) bloco(1.4, 0.015, 0.12, COR.faixa, x, 0.01, 15.5, cena).castShadow = false;
  for (let x = -12.6; x <= -10.4; x += 0.55) bloco(0.3, 0.015, 3.6, COR.faixa, x, 0.01, 15.5, cena).castShadow = false;

  // Postes da rua.
  const poste = mat(PALETA.acoEscuro, { aspereza: 0.5, metal: 0.6 });
  for (let x = -24; x <= 24; x += 12) {
    cilindro(0.08, 4.6, poste, x, 0, 18.9, cena, 10);
    bloco(0.14, 0.08, 1.1, poste, x, 4.6, 18.45, cena);
    lampada(x, 4.52, 17.95, cena, { alcance: 14, intensidade: 28, raio: 0.13 });
  }

  for (const p of PREDIOS) predio(cena, p);
  ARVORES.forEach(([x, z], i) => arvore(cena, x, z, i));
  carro(cena, 6, 14.2, '#c9474f', Math.PI / 2);
  carro(cena, 14, 16.8, '#3b6fb0', -Math.PI / 2);
  carro(cena, -20, 14.2, '#e2c044', Math.PI / 2);

  // Canteiros de grama mais escura entre o terreno e os prédios.
  for (const [x, z, w, d] of [[-15.5, -8, 4, 7], [15.5, -2, 4, 9], [5, -15.5, 12, 3]]) {
    bloco(w, 0.04, d, COR.gramaEscura, x, -0.02, z, cena).castShadow = false;
  }
}

