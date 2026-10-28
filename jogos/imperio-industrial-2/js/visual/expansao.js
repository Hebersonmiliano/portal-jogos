// Evolução visual da propriedade (v0.8): lote vizinho, escritório e fachada.
import * as THREE from 'three';
import { PALETA, bloco, lampada, mat, texturaConcreto, texturaPlaca, vidroJanela } from './materiais.js';

export function criarExpansao(cena) {
  const terreno = new THREE.Group();
  terreno.position.x = 16;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(8, 24), new THREE.MeshStandardMaterial({ map: texturaConcreto(8), roughness: 0.92 }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; terreno.add(piso);
  const grade = new THREE.GridHelper(24, 24, PALETA.petroleo, PALETA.petroleo);
  grade.scale.x = 1 / 3; grade.material.transparent = true; grade.material.opacity = 0.1; grade.position.y = 0.008; terreno.add(grade);
  bloco(0.18, 0.1, 24, PALETA.concretoClaro, 4.05, 0, 0, terreno);
  const placaLote = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.55), new THREE.MeshStandardMaterial({ map: texturaPlaca('LOTE 02 · IMPÉRIO', { fonte: 58 }), roughness: 0.6 }));
  placaLote.position.set(0, 2.4, -10.8); terreno.add(placaLote);
  for (const x of [-3.5, 3.5]) lampada(x, 3.8, -9.5, terreno, { alcance: 11, intensidade: 22, raio: 0.1 });
  cena.add(terreno);

  const escritorio = new THREE.Group();
  escritorio.position.set(16, 0, -7.5);
  bloco(5.5, 0.15, 4.5, PALETA.concretoEscuro, 0, 0, 0, escritorio);
  bloco(5.2, 2.8, 4.2, mat(PALETA.concretoClaro, { aspereza: 0.85 }), 0, 0.12, 0, escritorio);
  bloco(5.4, 0.18, 4.4, PALETA.petroleoEscuro, 0, 3.0, 0, escritorio);
  bloco(1, 2.1, 0.08, PALETA.petroleoClaro, -1.7, 0.12, 2.12, escritorio);
  for (const x of [-0.25, 1.5]) bloco(1.35, 1.1, 0.05, vidroJanela, x, 1.0, 2.13, escritorio);
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.55), new THREE.MeshStandardMaterial({ map: texturaPlaca('ADMINISTRAÇÃO', { fonte: 62 }), roughness: 0.55 }));
  placa.position.set(0, 2.55, 2.15); escritorio.add(placa);
  cena.add(escritorio);

  const fachada = new THREE.Group();
  fachada.position.set(0, 0, 0);
  for (const x of [-2.35, 2.35]) bloco(0.22, 3.8, 0.22, PALETA.laranja, x, 0, 1.72, fachada);
  const letreiro = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.75), new THREE.MeshStandardMaterial({ map: texturaPlaca('IMPÉRIO INDUSTRIAL', { fundo: PALETA.laranja, cor: PALETA.petroleoEscuro, fonte: 62 }), roughness: 0.45 }));
  letreiro.position.set(0, 3.45, 1.75); fachada.add(letreiro);
  lampada(-2, 3.3, 1.9, fachada, { alcance: 8, intensidade: 16, raio: 0.09 });
  lampada(2, 3.3, 1.9, fachada, { alcance: 8, intensidade: 16, raio: 0.09 });
  cena.add(fachada);

  return {
    atualizar(nivel) {
      terreno.visible = nivel >= 1;
      escritorio.visible = nivel >= 2;
      fachada.visible = nivel >= 3;
    },
  };
}

