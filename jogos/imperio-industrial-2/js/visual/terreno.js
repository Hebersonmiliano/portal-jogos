// Terreno da oficina (24 x 24 m): piso de concreto em placas, faixas de segurança,
// cerca com portão para a rua, grade discreta e o cursor que mostra onde a máquina vai ficar.
import * as THREE from 'three';
import { PALETA, bloco, cilindro, lampada, mat, texturaConcreto, texturaZebrada } from './materiais.js';
import { registrarObstaculo } from '../grade.js';

const MEIO = 12;

function faixa(x0, z0, x1, z1, cor, pai, largura = 0.12) {
  const w = Math.abs(x1 - x0) || largura;
  const d = Math.abs(z1 - z0) || largura;
  bloco(w, 0.012, d, mat(cor, { aspereza: 0.6 }), (x0 + x1) / 2, 0.003, (z0 + z1) / 2, pai).castShadow = false;
}

export function criarTerreno(cena) {
  const g = new THREE.Group();

  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(MEIO * 2, MEIO * 2),
    new THREE.MeshStandardMaterial({ map: texturaConcreto(MEIO), roughness: 0.92 }),
  );
  piso.rotation.x = -Math.PI / 2;
  piso.receiveShadow = true;
  g.add(piso);

  // Meio-fio em volta do terreno.
  for (const s of [-1, 1]) {
    bloco(MEIO * 2 + 0.4, 0.1, 0.2, PALETA.concretoClaro, 0, 0, s * (MEIO + 0.1), g);
    bloco(0.2, 0.1, MEIO * 2, PALETA.concretoClaro, s * (MEIO + 0.1), 0, 0, g);
  }

  // Faixa de circulação amarela contornando a oficina e caminho até o portão.
  const am = PALETA.amarelo;
  faixa(-3.5, -2.5, 3.5, -2.5, am, g);
  faixa(-3.5, 2.5, 3.5, 2.5, am, g);
  faixa(-3.5, -2.5, -3.5, 2.5, am, g);
  faixa(3.5, -2.5, 3.5, 2.5, am, g);
  faixa(-9.5, 6.5, -6.5, 6.5, am, g);
  // Área de carga zebrada diante da expedição.
  const zebra = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 0.5),
    new THREE.MeshStandardMaterial({ map: texturaZebrada(6), roughness: 0.7 }),
  );
  zebra.rotation.x = -Math.PI / 2;
  zebra.position.set(-8, 0.006, 5.6);
  zebra.receiveShadow = true;
  g.add(zebra);
  // Vaga da van e área do estoque.
  faixa(-10.2, 7.2, -10.2, 11.6, '#f2efe6', g, 0.1);
  faixa(-5.8, 7.2, -5.8, 11.6, '#f2efe6', g, 0.1);
  faixa(-10, -7.4, -6, -7.4, am, g);
  faixa(-10, -4.6, -6, -4.6, am, g);

  // Cerca de tela com postes, aberta no portão diante da expedição (x de -10 a -6).
  const poste = mat(PALETA.acoEscuro, { aspereza: 0.5, metal: 0.6 });
  const tela = new THREE.MeshStandardMaterial({ color: '#6f7a7e', transparent: true, opacity: 0.32, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide, depthWrite: false });
  function trecho(x0, z0, x1, z1) {
    const comp = Math.hypot(x1 - x0, z1 - z0);
    const pano = new THREE.Mesh(new THREE.PlaneGeometry(comp, 1.3), tela);
    pano.position.set((x0 + x1) / 2, 0.75, (z0 + z1) / 2);
    pano.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    g.add(pano);
    const n = Math.max(1, Math.round(comp / 2));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      bloco(0.08, 1.5, 0.08, poste, x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, g);
    }
    const trilho = bloco(comp, 0.05, 0.05, poste, (x0 + x1) / 2, 1.42, (z0 + z1) / 2, g);
    trilho.rotation.y = pano.rotation.y;
  }
  const L = MEIO + 0.35;
  trecho(-L, -L, L, -L);
  trecho(-L, -L, -L, L);
  const inicioCercaLeste = g.children.length;
  trecho(L, -L, L, L);
  const cercaLeste = g.children.slice(inicioCercaLeste);
  g.userData.expandir = (ativo) => cercaLeste.forEach((objeto) => { objeto.visible = !ativo; });
  trecho(-L, L, -10.2, L);
  trecho(-5.8, L, L, L);
  // Portão: dois pilares com placa.
  for (const x of [-10.2, -5.8]) {
    bloco(0.3, 2.2, 0.3, PALETA.petroleo, x, 0, L, g);
    lampada(x, 2.35, L, g, { alcance: 8, intensidade: 12, raio: 0.12 });
  }

  // Postes de luz dentro do terreno.
  for (const [x, z] of [[8, 8], [8, -8], [-3, -9]]) {
    cilindro(0.07, 4.2, poste, x, 0, z, g, 10);
    bloco(0.7, 0.08, 0.16, poste, x + 0.3, 4.2, z, g);
    lampada(x + 0.55, 4.12, z, g, { alcance: 13, intensidade: 30, raio: 0.12 });
    registrarObstaculo(x - 0.15, x + 0.15, z - 0.15, z + 0.15);
  }

  // Grade discreta: as células de 1 m usadas para posicionar máquinas.
  const grade = new THREE.GridHelper(MEIO * 2, MEIO * 2, PALETA.petroleo, PALETA.petroleo);
  grade.material.transparent = true;
  grade.material.opacity = 0.1;
  grade.material.depthWrite = false;
  grade.position.set(0.5, 0.008, 0.5);
  g.add(grade);

  cena.add(g);
  return g;
}

// Cursor no chão mostrando a célula onde B vai colocar a máquina: verde livre, vermelho ocupado.
export function criarCursor(cena) {
  const material = new THREE.MeshBasicMaterial({ color: '#3cc46a', transparent: true, opacity: 0.35, depthWrite: false });
  const cursor = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), material);
  cursor.rotation.x = -Math.PI / 2;
  cursor.position.y = 0.02;
  const borda = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.96, 0.96)),
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }),
  );
  cursor.add(borda);
  cena.add(cursor);
  return {
    mostrar(x, z, livre) {
      cursor.visible = true;
      cursor.position.x = x;
      cursor.position.z = z;
      material.color.set(livre ? '#3cc46a' : '#e0453a');
    },
    esconder() {
      cursor.visible = false;
    },
  };
}

