// Máquinas, caixas na saída e esteiras. A produção começa manual; a partir da v0.4 a máquina pode ser
// automática (regras em automacao.js). Aqui ficam os modelos 3D e onde cada caixa aparece.
import * as THREE from 'three';
import { PALETA, bloco, cilindro, mat, texturaEsteira } from './visual/materiais.js';
import { modeloCaixa } from './visual/estacoes.js';
import { rotaEsteira } from './rotas.js';

const ALCANCE = 1.8; // distância máxima do jogador para usar uma máquina
const MESA = 0.82; // altura do tampo onde as caixas prontas se acumulam
const ALTURA_ESTEIRA = 0.16; // altura da lona da esteira

export const CORES_LUZ = {
  manual: 0x6b7378,
  produzindo: 0x3cc46a,
  'sem-dinheiro': 0xf2c230,
  cheia: 0xe0453a,
  quebrada: 0xff7a1a, // pisca, com fumaça saindo da máquina (v0.6)
  'sem-energia': 0x5b7cff,
};

// Máquina de montar caixas: gabinete com painel, mesa de aço, prensa com cabeçote laranja
// e torre de luz. Ocupa uma célula (0,9 m).
export function criarMaquina(x, z) {
  const malha = new THREE.Group();
  malha.position.set(x, 0, z);
  const aco = mat(PALETA.aco, { aspereza: 0.35, metal: 0.75 });
  const acoEscuro = mat(PALETA.acoEscuro, { aspereza: 0.45, metal: 0.6 });

  bloco(0.92, 0.08, 0.92, '#2a3033', 0, 0, 0, malha);
  bloco(0.86, 0.66, 0.86, mat(PALETA.petroleo, { aspereza: 0.55, metal: 0.2 }), 0, 0.08, 0, malha);
  // Grelhas de ventilação nas laterais.
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) bloco(0.02, 0.04, 0.5, acoEscuro, s * 0.435, 0.25 + i * 0.08, 0, malha);
  // Mesa de aço.
  bloco(0.94, 0.06, 0.94, aco, 0, 0.74, 0, malha);
  // Painel de controle com tela.
  const painel = bloco(0.34, 0.22, 0.06, acoEscuro, 0.22, 0.42, 0.44, malha);
  painel.rotation.x = -0.25;
  const tela = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.1),
    new THREE.MeshStandardMaterial({ color: '#0e2a30', emissive: new THREE.Color('#38c6d9'), emissiveIntensity: 0.9 }),
  );
  tela.position.set(0.18, 0.54, 0.475);
  tela.rotation.x = -0.25;
  malha.add(tela);
  for (const [bx, cor] of [[0.32, '#e0453a'], [0.37, '#3cc46a']]) {
    const botao = cilindro(0.018, 0.02, cor, bx, 0.47, 0.48, malha, 8);
    botao.rotation.x = Math.PI / 2 - 0.25;
  }
  // Prensa: coluna atrás e cabeçote sobre a mesa.
  bloco(0.16, 1.05, 0.16, aco, 0, 0.8, -0.36, malha);
  bloco(0.5, 0.16, 0.56, mat(PALETA.laranja, { aspereza: 0.45, metal: 0.3 }), 0, 1.72, -0.1, malha);
  const pistao = cilindro(0.05, 0.22, aco, 0, 1.5, 0.02, malha, 10);
  bloco(0.36, 0.04, 0.36, acoEscuro, 0, 1.46, 0.02, malha);

  // Torre de luz: cinza (manual), verde, amarela ou vermelha (ver CORES_LUZ).
  cilindro(0.025, 0.55, acoEscuro, -0.36, 0.8, -0.36, malha, 8);
  const luz = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.16, 16),
    new THREE.MeshStandardMaterial({ color: CORES_LUZ.manual, emissive: 0x000000, roughness: 0.3 }),
  );
  luz.position.set(-0.36, 1.43, -0.36);
  malha.add(luz);
  cilindro(0.08, 0.03, acoEscuro, -0.36, 1.51, -0.36, malha, 16);
  malha.userData.pistao = pistao;

  // Fumaça da máquina quebrada: bolinhas cinza que sobem em ciclo, escondidas até quebrar.
  const fumaca = [];
  for (let i = 0; i < 5; i++) {
    const bola = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6),
      new THREE.MeshStandardMaterial({ color: '#7d8386', transparent: true, opacity: 0.6, depthWrite: false }),
    );
    bola.visible = false;
    malha.add(bola);
    fumaca.push(bola);
  }
  malha.userData.fumaca = fumaca;

  // saída: caixas prontas, ainda não levadas ao estoque; esteira: transporte automático até o estoque
  return {
    x, z, malha, luz, saida: [], esteira: null, comprimentoEsteira: 0, transito: [],
    automatica: false, produto: null, cronometroProducao: 0, cronometroEsteira: 0, batida: 0,
    desgaste: 0, quebrada: false, inspecao: false,
  };
}

// Pinta a luz da máquina conforme a situação (estadoMaquina, em automacao.js).
export function mostrarEstado(maquina, estado) {
  if (maquina.luz.userData.estado === estado) return;
  maquina.luz.userData.estado = estado;
  const cor = CORES_LUZ[estado];
  maquina.luz.material.color.setHex(cor);
  maquina.luz.material.emissive.setHex(estado === 'manual' ? 0x000000 : cor);
  maquina.luz.material.emissiveIntensity = 1.4;
}

// Braço robótico laranja ao lado da mesa: marca visual de máquina automática.
export function marcarAutomatica(maquina) {
  if (maquina.malha.userData.braco) return;
  const braco = new THREE.Group();
  braco.position.set(0.36, 0.8, -0.3);
  const laranja = mat(PALETA.laranja, { aspereza: 0.4, metal: 0.3 });
  cilindro(0.09, 0.1, mat(PALETA.acoEscuro, { metal: 0.6 }), 0, 0, 0, braco, 12);
  const segmento1 = bloco(0.08, 0.5, 0.08, laranja, 0, 0.08, 0, braco);
  segmento1.rotation.z = 0.35;
  const segmento2 = bloco(0.07, 0.42, 0.07, laranja, -0.17, 0.5, 0.1, braco);
  segmento2.rotation.x = 1.1;
  bloco(0.12, 0.05, 0.1, mat(PALETA.acoEscuro), -0.17, 0.62, 0.32, braco);
  maquina.malha.add(braco);
  maquina.malha.userData.braco = braco;
  // Faixa verde no gabinete: automação instalada.
  bloco(0.87, 0.06, 0.87, mat('#3cc46a', { aspereza: 0.5 }), 0, 0.62, 0, maquina.malha);
}

// Pistão desce e sobe a cada caixa; braço balança enquanto a máquina automática produz.
// Quebrada, a luz pisca e sai fumaça.
export function animarMaquina(maquina, dt, produzindo) {
  const t = performance.now() / 1000;
  const fumaca = maquina.malha.userData.fumaca;
  fumaca.forEach((bola, i) => {
    bola.visible = maquina.quebrada;
    if (!maquina.quebrada) return;
    const fase = (t * 0.6 + i / fumaca.length) % 1;
    bola.position.set(0.1 + Math.sin(fase * 6 + i) * 0.12, 1.9 + fase * 1.4, -0.1);
    bola.scale.setScalar(0.6 + fase * 1.6);
    bola.material.opacity = 0.55 * (1 - fase);
  });
  if (maquina.quebrada) maquina.luz.material.emissiveIntensity = Math.sin(t * 10) > 0 ? 2 : 0.2;
  maquina.batida = Math.max(0, maquina.batida - dt * 3);
  const pistao = maquina.malha.userData.pistao;
  pistao.position.y = 1.61 - Math.sin(maquina.batida * Math.PI) * 0.18;
  const braco = maquina.malha.userData.braco;
  if (braco) braco.rotation.y = produzindo ? Math.sin(performance.now() / 600 + maquina.x) * 0.6 : braco.rotation.y * 0.95;
}

// ===== Esteiras =====

const esteiras = []; // lonas animadas

// Desenha a esteira seguindo a rota: lona animada, laterais, pés e roletes nas pontas.
export function criarEsteira(maquina, destino) {
  const rota = rotaEsteira(maquina, destino);
  const grupo = new THREE.Group();
  const lateral = mat(PALETA.amarelo, { aspereza: 0.5, metal: 0.3 });
  const pe = mat(PALETA.acoEscuro, { aspereza: 0.5, metal: 0.6 });
  let comprimento = 0;
  for (let i = 1; i < rota.length; i++) {
    const p = rota[i - 1], q = rota[i];
    const dx = q.x - p.x, dz = q.z - p.z;
    const trecho = Math.hypot(dx, dz);
    comprimento += trecho;
    const seg = new THREE.Group();
    seg.position.set((p.x + q.x) / 2, 0, (p.z + q.z) / 2);
    seg.rotation.y = -Math.atan2(dz, dx);
    const textura = texturaEsteira(trecho);
    const lona = new THREE.Mesh(
      new THREE.BoxGeometry(trecho + 0.5, 0.04, 0.46),
      new THREE.MeshStandardMaterial({ map: textura, roughness: 0.8 }),
    );
    lona.position.y = ALTURA_ESTEIRA - 0.02;
    lona.receiveShadow = true;
    seg.add(lona);
    esteiras.push(textura);
    for (const s of [-1, 1]) bloco(trecho + 0.5, 0.07, 0.04, lateral, 0, ALTURA_ESTEIRA - 0.04, s * 0.25, seg);
    const pes = Math.max(1, Math.round(trecho));
    for (let k = 0; k <= pes; k++) {
      const px = -trecho / 2 + (trecho * k) / pes;
      for (const s of [-1, 1]) bloco(0.04, ALTURA_ESTEIRA - 0.04, 0.04, pe, px, 0, s * 0.22, seg);
    }
    grupo.add(seg);
  }
  maquina.rotaEsteira = rota;
  maquina.comprimentoEsteira = comprimento;
  maquina.destinoEsteira = { x: destino.x, z: destino.z };
  return grupo;
}

// Inspetor automático: pórtico sobre o começo da esteira com um sensor que acende (v0.6).
export function adicionarInspetor(maquina) {
  if (!maquina.esteira || maquina.malha.userData.inspetor) return;
  const [p, q] = maquina.rotaEsteira;
  const trecho = Math.hypot(q.x - p.x, q.z - p.z) || 1;
  const d = Math.min(0.9, trecho / 2);
  const g = new THREE.Group();
  g.position.set(p.x + ((q.x - p.x) / trecho) * d, 0, p.z + ((q.z - p.z) / trecho) * d);
  g.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x);
  const azul = mat(PALETA.petroleoClaro, { aspereza: 0.4, metal: 0.4 });
  for (const s of [-1, 1]) bloco(0.06, 0.62, 0.06, azul, 0, 0, s * 0.3, g);
  bloco(0.12, 0.1, 0.68, azul, 0, 0.62, 0, g);
  const sensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.03, 0.5),
    new THREE.MeshStandardMaterial({ color: '#7dffb0', emissive: new THREE.Color('#3cff8a'), emissiveIntensity: 1.6 }),
  );
  sensor.position.y = 0.6;
  g.add(sensor);
  maquina.esteira.add(g);
  maquina.malha.userData.inspetor = g;
}

// Faz as lonas andarem. A velocidade visual acompanha a velocidade real da esteira (1,5 m/s).
export function animarEsteiras(dt) {
  for (const t of esteiras) t.offset.x -= dt * 1.5 * 2;
}

// Posição de uma caixa na esteira: progresso 0 na máquina, 1 no estoque, seguindo a rota.
export function posicionarNaEsteira(malha, maquina, progresso) {
  const rota = maquina.rotaEsteira ?? [maquina, maquina.destinoEsteira];
  let falta = progresso * maquina.comprimentoEsteira;
  for (let i = 1; i < rota.length; i++) {
    const p = rota[i - 1], q = rota[i];
    const trecho = Math.hypot(q.x - p.x, q.z - p.z);
    if (falta <= trecho || i === rota.length - 1) {
      const t = trecho > 0 ? Math.min(1, falta / trecho) : 1;
      malha.position.set(p.x + (q.x - p.x) * t, ALTURA_ESTEIRA + malha.geometry.parameters.height / 2, p.z + (q.z - p.z) * t);
      malha.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x);
      return;
    }
    falta -= trecho;
  }
}

// Cria a caixa do produto sobre a mesa da máquina, empilhando em camadas de 4.
// Caixa defeituosa sai mais escura e torta (v0.6).
export function criarCaixa(maquina, produto, defeito = false) {
  const n = maquina.saida.length;
  const w = 0.36 * produto.escala;
  const h = 0.28 * produto.altura;
  const cor = defeito ? `#${new THREE.Color(produto.cor).multiplyScalar(0.55).getHexString()}` : produto.cor;
  const malha = modeloCaixa(w, h, w, cor);
  if (defeito) malha.rotation.z = 0.12;
  malha.position.set(
    maquina.x + ((n % 2) - 0.5) * 0.4,
    MESA + h / 2 + Math.floor(n / 4) * h,
    maquina.z + 0.12 + (((n >> 1) % 2) - 0.5) * 0.4,
  );
  maquina.saida.push({ malha, produto, defeito });
  maquina.batida = 1;
  return malha;
}

// Devolve a máquina mais próxima dentro do alcance, ou null.
export function maquinaProxima(posicao, maquinas) {
  let melhor = null;
  let melhorDistancia = ALCANCE;
  for (const m of maquinas) {
    const distancia = Math.hypot(posicao.x - m.x, posicao.z - m.z);
    if (distancia <= melhorDistancia) {
      melhor = m;
      melhorDistancia = distancia;
    }
  }
  return melhor;
}
