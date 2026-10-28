// Oficina alugada: prédio pequeno no centro do terreno, com portão de enrolar, porta, janelas,
// letreiro, telhado com ar-condicionado e luz na fachada. Ocupa a mesma área do bloco da v0.1
// (x de -2,5 a 2,5 e z de -1,5 a 1,5), então a colisão não muda.
import * as THREE from 'three';
import { PALETA, bloco, cilindro, lampada, mat, registrarNoturno, texturaPlaca, vidroJanela } from './materiais.js';

export function criarOficina(cena) {
  const g = new THREE.Group();
  const parede = mat(PALETA.concretoClaro, { aspereza: 0.9 });
  const faixa = mat(PALETA.petroleo, { aspereza: 0.7 });
  const escuro = mat('#20282b', { aspereza: 0.95 });
  const caixilho = mat(PALETA.acoEscuro, { aspereza: 0.5, metal: 0.6 });

  // Base e corpo.
  bloco(5.2, 0.12, 3.2, PALETA.concretoEscuro, 0, 0, 0, g);
  bloco(5, 2.9, 3, parede, 0, 0.12, 0, g);
  bloco(5.02, 0.7, 3.02, faixa, 0, 0.12, 0, g);

  // Nervuras verticais nas laterais e no fundo (chapa de galpão).
  for (let z = -1.3; z <= 1.31; z += 0.26) {
    bloco(0.04, 2.1, 0.06, parede, -2.52, 0.82, z, g);
    bloco(0.04, 2.1, 0.06, parede, 2.52, 0.82, z, g);
  }
  for (let x = -2.3; x <= 2.31; x += 0.26) bloco(0.06, 2.1, 0.04, parede, x, 0.82, -1.52, g);

  // Telhado: laje com beiral, platibanda e ar-condicionado.
  bloco(5.4, 0.16, 3.4, PALETA.petroleoEscuro, 0, 3.02, 0, g);
  bloco(5.4, 0.3, 0.1, PALETA.petroleoEscuro, 0, 3.18, 1.65, g);
  bloco(5.4, 0.3, 0.1, PALETA.petroleoEscuro, 0, 3.18, -1.65, g);
  bloco(0.1, 0.3, 3.4, PALETA.petroleoEscuro, -2.65, 3.18, 0, g);
  bloco(0.1, 0.3, 3.4, PALETA.petroleoEscuro, 2.65, 3.18, 0, g);
  bloco(1.1, 0.55, 0.8, PALETA.concretoClaro, 1.3, 3.18, -0.5, g);
  for (let x = 0.85; x <= 1.76; x += 0.13) bloco(0.04, 0.4, 0.02, PALETA.acoEscuro, x, 3.25, -0.09, g);
  cilindro(0.18, 0.6, PALETA.aco, -1.6, 3.18, -0.7, g);
  cilindro(0.22, 0.08, PALETA.acoEscuro, -1.6, 3.78, -0.7, g);

  // Fachada (+z): portão de enrolar meio aberto à esquerda.
  const fz = 1.51;
  bloco(2.2, 2.2, 0.06, escuro, -1.15, 0.12, fz - 0.02, g);
  for (let i = 0; i < 7; i++) {
    bloco(2.2, 0.11, 0.05, i % 2 ? PALETA.aco : PALETA.concretoEscuro, -1.15, 1.55 + i * 0.11, fz + 0.02, g);
  }
  bloco(2.4, 0.22, 0.2, PALETA.acoEscuro, -1.15, 2.32, fz + 0.04, g);
  bloco(0.1, 2.3, 0.12, caixilho, -2.3, 0.12, fz + 0.03, g);
  bloco(0.1, 2.3, 0.12, caixilho, 0, 0.12, fz + 0.03, g);
  // Luz quente do interior pelo vão do portão.
  const interior = new THREE.MeshStandardMaterial({ color: '#2a2a22', emissive: new THREE.Color('#ffb661'), emissiveIntensity: 0.15 });
  bloco(2.0, 1.4, 0.02, interior, -1.15, 0.12, fz + 0.01, g);
  registrarNoturno((e) => (interior.emissiveIntensity = 0.15 + 0.9 * e));
  // Bancada e caixas vistas pelo portão.
  bloco(1.2, 0.5, 0.3, PALETA.madeira, -1.3, 0.12, fz - 0.1, g);
  bloco(0.32, 0.26, 0.28, PALETA.papelao, -0.85, 0.62, fz - 0.1, g);

  // Porta de entrada e janela à direita.
  bloco(0.8, 1.9, 0.06, mat(PALETA.petroleoClaro, { aspereza: 0.5 }), 0.65, 0.12, fz + 0.01, g);
  bloco(0.06, 0.06, 0.08, PALETA.amarelo, 0.92, 1.0, fz + 0.06, g);
  bloco(1.4, 1.0, 0.04, vidroJanela, 1.75, 1.1, fz + 0.01, g);
  bloco(1.5, 0.08, 0.1, caixilho, 1.75, 1.05, fz + 0.03, g);
  bloco(1.5, 0.08, 0.1, caixilho, 1.75, 2.1, fz + 0.03, g);
  bloco(0.06, 1.0, 0.08, caixilho, 1.75, 1.1, fz + 0.04, g);
  // Janelas da lateral direita.
  for (const z of [-0.6, 0.6]) bloco(0.04, 0.8, 0.9, vidroJanela, 2.53, 1.4, z, g);

  // Letreiro aceso.
  const placa = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.6),
    new THREE.MeshStandardMaterial({
      map: texturaPlaca('OFICINA 01 · DISTRITO INDUSTRIAL', { fonte: 46, largura: 1024 }),
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: texturaPlaca('OFICINA 01 · DISTRITO INDUSTRIAL', { fonte: 46, largura: 1024 }),
      emissiveIntensity: 0.25,
      roughness: 0.6,
    }),
  );
  placa.position.set(0, 2.62, fz + 0.06);
  registrarNoturno((e) => (placa.material.emissiveIntensity = 0.25 + 0.75 * e));
  g.add(placa);

  // Calha e luminária sobre a porta.
  cilindro(0.05, 3, PALETA.acoEscuro, 2.45, 0.1, fz + 0.08, g, 8);
  bloco(0.3, 0.08, 0.25, PALETA.acoEscuro, 0.65, 2.1, fz + 0.12, g);
  lampada(0.65, 2.05, fz + 0.2, g, { alcance: 7, intensidade: 10, raio: 0.08 });

  cena.add(g);
  return g;
}
