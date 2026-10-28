// Estações fixas do terreno: prateleira do estoque (mostra as caixas guardadas),
// doca de expedição com palete e a van de entregas estacionada.
import * as THREE from 'three';
import { PALETA, bloco, cilindro, lampada, mat, registrarNoturno, texturaPlaca, texturaZebrada } from './materiais.js';

const aco = () => mat(PALETA.acoEscuro, { aspereza: 0.45, metal: 0.7 });

// Caixa de papelão com fita. Usada nas estações e nas máquinas.
export function modeloCaixa(w, h, d, cor) {
  const caixa = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cor, { aspereza: 0.85 }));
  caixa.castShadow = true;
  caixa.receiveShadow = true;
  const fita = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 1.01, d * 1.01), mat(PALETA.fita, { aspereza: 0.4 }));
  caixa.add(fita);
  return caixa;
}

// Prateleira de aço com 3 níveis. atualizar(lista) mostra até 24 caixas com as cores dos produtos.
export function criarPrateleira(cena, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const laranja = mat(PALETA.laranja, { aspereza: 0.5, metal: 0.3 });
  for (const px of [-0.97, 0.97]) for (const pz of [-0.45, 0.45]) bloco(0.07, 2.3, 0.07, laranja, px, 0, pz, g);
  const niveis = [0.15, 0.85, 1.55];
  for (const y of niveis) {
    bloco(2.0, 0.05, 0.95, aco(), 0, y, 0, g);
    bloco(2.0, 0.08, 0.05, laranja, 0, y - 0.03, 0.47, g);
  }
  bloco(2.0, 0.05, 0.95, aco(), 0, 2.25, 0, g);
  const caixas = new THREE.Group();
  g.add(caixas);
  cena.add(g);

  let assinatura = '';
  return {
    atualizar(lista) {
      const cores = [];
      for (const { cor, quantidade } of lista) for (let i = 0; i < quantidade && cores.length < 24; i++) cores.push(cor);
      const nova = cores.join(',');
      if (nova === assinatura) return;
      assinatura = nova;
      caixas.clear();
      cores.forEach((cor, i) => {
        const nivel = Math.floor(i / 8);
        const pos = i % 8;
        const c = modeloCaixa(0.4, 0.3, 0.38, cor);
        c.position.set(-0.75 + (pos % 4) * 0.5, niveis[nivel] + 0.2, pos < 4 ? -0.22 : 0.22);
        c.rotation.y = ((i * 37) % 7 - 3) * 0.02;
        caixas.add(c);
      });
    },
  };
}

// Doca de expedição: plataforma com borda zebrada, para-choques, palete com caixas e carrinho.
export function criarExpedicao(cena, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  bloco(2, 0.75, 2, PALETA.concreto, 0, 0, 0, g);
  const zebra = new THREE.Mesh(new THREE.BoxGeometry(2, 0.18, 0.04), new THREE.MeshStandardMaterial({ map: texturaZebrada(3), roughness: 0.7 }));
  zebra.position.set(0, 0.62, 1.01);
  g.add(zebra);
  for (const bx of [-0.65, 0.65]) bloco(0.25, 0.3, 0.12, '#1d1f20', bx, 0.2, 1.05, g);
  // Palete com caixas prontas para sair.
  bloco(1.1, 0.12, 0.9, PALETA.madeira, -0.25, 0.75, -0.2, g);
  for (let i = 0; i < 5; i++) {
    const c = modeloCaixa(0.45, 0.32, 0.4, PALETA.papelao);
    c.position.set(-0.5 + (i % 3) * 0.48, 1.03 + Math.floor(i / 3) * 0.33, -0.2);
    g.add(c);
  }
  // Carrinho de carga.
  bloco(0.06, 0.9, 0.06, aco(), 0.75, 0.75, 0.55, g);
  bloco(0.06, 0.9, 0.06, aco(), 0.55, 0.75, 0.55, g);
  bloco(0.32, 0.04, 0.3, aco(), 0.65, 0.77, 0.7, g);
  // Placa da doca.
  const placa = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.36),
    new THREE.MeshStandardMaterial({ map: texturaPlaca('EXPEDIÇÃO', { fundo: PALETA.petroleo, fonte: 70 }), roughness: 0.6 }),
  );
  placa.position.set(0, 2.4, -0.98);
  g.add(placa);
  for (const px of [-0.9, 0.9]) bloco(0.08, 2.6, 0.08, aco(), px, 0, -0.98, g);
  lampada(0, 2.15, -0.85, g, { alcance: 6, intensidade: 8, raio: 0.08 });
  cena.add(g);
  return g;
}

// Van de entregas da empresa, de ré para a doca.
export function criarVan(cena, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const lataria = mat('#eef1f0', { aspereza: 0.35, metal: 0.2 });
  bloco(1.7, 1.6, 3.4, lataria, 0, 0.35, 0.2, g);
  bloco(1.72, 0.22, 3.42, mat(PALETA.laranja, { aspereza: 0.4 }), 0, 0.85, 0.2, g);
  bloco(1.72, 0.08, 3.42, mat(PALETA.petroleo, { aspereza: 0.4 }), 0, 1.07, 0.2, g);
  // Cabine e para-brisa (frente para +z, a traseira encosta na doca).
  bloco(1.7, 1.0, 0.9, lataria, 0, 0.35, 2.3, g);
  const parabrisa = bloco(1.5, 0.55, 0.05, mat('#26363c', { aspereza: 0.1, metal: 0.5 }), 0, 0.95, 2.77, g);
  parabrisa.rotation.x = -0.35;
  for (const s of [-1, 1]) bloco(0.04, 0.4, 0.6, mat('#26363c', { aspereza: 0.1, metal: 0.5 }), s * 0.86, 1.0, 2.3, g);
  bloco(1.7, 0.22, 0.12, PALETA.acoEscuro, 0, 0.3, 2.8, g);
  // Rodas.
  const roda = mat('#1c1e1f', { aspereza: 0.9 });
  for (const wz of [-0.9, 2.1]) for (const s of [-1, 1]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 16), roda);
    r.rotation.z = Math.PI / 2;
    r.position.set(s * 0.82, 0.34, wz);
    r.castShadow = true;
    g.add(r);
  }
  // Faróis e lanternas acendem à noite.
  const farol = new THREE.MeshStandardMaterial({ color: '#fff6dd', emissive: new THREE.Color('#fff2c4'), emissiveIntensity: 0.1 });
  const lanterna = new THREE.MeshStandardMaterial({ color: '#b3261e', emissive: new THREE.Color('#ff3b2f'), emissiveIntensity: 0.1 });
  for (const s of [-1, 1]) {
    bloco(0.3, 0.14, 0.04, farol, s * 0.6, 0.62, 2.85, g);
    bloco(0.14, 0.3, 0.04, lanterna, s * 0.75, 0.75, -1.52, g);
  }
  registrarNoturno((e) => {
    farol.emissiveIntensity = 0.1 + 1.6 * e;
    lanterna.emissiveIntensity = 0.1 + 0.9 * e;
  });
  // Logotipo na lateral.
  for (const s of [-1, 1]) {
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),
      new THREE.MeshStandardMaterial({ map: texturaPlaca('IMPÉRIO · ENTREGAS', { fundo: '#eef1f0', cor: PALETA.petroleo, fonte: 62 }), roughness: 0.5 }),
    );
    logo.position.set(s * 0.861, 1.45, 0.2);
    logo.rotation.y = s * Math.PI / 2;
    g.add(logo);
  }
  cena.add(g);
  return g;
}

// Caçamba de refugo: recebe as caixas defeituosas separadas na inspeção. atualizar(n) mostra a pilha.
export function criarCacamba(cena, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const verde = mat('#3f6b4a', { aspereza: 0.6, metal: 0.4 });
  bloco(0.9, 0.08, 0.9, verde, 0, 0, 0, g);
  for (const [w, d, px, pz] of [[0.9, 0.06, 0, 0.42], [0.9, 0.06, 0, -0.42], [0.06, 0.9, 0.42, 0], [0.06, 0.9, -0.42, 0]]) {
    bloco(w, 0.62, d, verde, px, 0.08, pz, g);
  }
  const placa = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.2),
    new THREE.MeshStandardMaterial({ map: texturaPlaca('REFUGO', { fundo: '#2b2f31', fonte: 80 }), roughness: 0.6 }),
  );
  placa.position.set(0, 0.45, 0.455);
  g.add(placa);
  const pilha = new THREE.Group();
  g.add(pilha);
  cena.add(g);
  let atual = -1;
  return {
    atualizar(n) {
      const mostrar = Math.min(12, n);
      if (mostrar === atual) return;
      atual = mostrar;
      pilha.clear();
      for (let i = 0; i < mostrar; i++) {
        const c = modeloCaixa(0.28, 0.2, 0.26, '#6e5634');
        c.position.set(-0.22 + (i % 3) * 0.22, 0.2 + Math.floor(i / 3) * 0.12, -0.18 + ((i * 5) % 3) * 0.18);
        c.rotation.set(i * 0.4, i * 1.3, i * 0.2);
        pilha.add(c);
      }
    },
  };
}
