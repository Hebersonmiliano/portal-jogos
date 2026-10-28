// Materiais, texturas desenhadas em canvas e ajudantes de modelagem compartilhados pelo visual.
import * as THREE from 'three';

// Paleta da série no Distrito Industrial: azul-petróleo, laranja industrial e cinza-concreto.
export const PALETA = {
  petroleo: '#1f4e5a',
  petroleoEscuro: '#163a43',
  petroleoClaro: '#2f6f7d',
  laranja: '#f28c28',
  laranjaEscuro: '#c96a12',
  concreto: '#9aa3a8',
  concretoClaro: '#c3c8c9',
  concretoEscuro: '#6e777c',
  aco: '#8d979c',
  acoEscuro: '#4a5357',
  amarelo: '#f2c230',
  papelao: '#c89b5a',
  fita: '#e8d9b0',
  madeira: '#a77b4b',
  vidro: '#9fd3e0',
};

const cache = new Map();

// Material padrão com cache por cor e acabamento.
export function mat(cor, { aspereza = 0.8, metal = 0.05, emissivo = null, intensidade = 1 } = {}) {
  const chave = `${cor}|${aspereza}|${metal}|${emissivo}|${intensidade}`;
  if (!cache.has(chave)) {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: aspereza, metalness: metal });
    if (emissivo) {
      m.emissive = new THREE.Color(emissivo);
      m.emissiveIntensity = intensidade;
    }
    cache.set(chave, m);
  }
  return cache.get(chave);
}

const cubo = new THREE.BoxGeometry(1, 1, 1);

// Bloco com a base apoiada em y. Recebe e projeta sombra.
export function bloco(w, h, d, material, x, y, z, pai) {
  const m = new THREE.Mesh(cubo, typeof material === 'string' ? mat(material) : material);
  m.scale.set(w, h, d);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (pai) pai.add(m);
  return m;
}

// Cilindro em pé com a base em y.
export function cilindro(raio, h, material, x, y, z, pai, lados = 16) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(raio, raio, h, lados),
    typeof material === 'string' ? mat(material) : material,
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (pai) pai.add(m);
  return m;
}

function canvasTextura(tamanho, desenhar, { repetir = [1, 1], nitido = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tamanho;
  desenhar(canvas.getContext('2d'), tamanho);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repetir);
  t.anisotropy = 4;
  if (nitido) t.magFilter = THREE.NearestFilter;
  return t;
}

// Gerador pseudoaleatório com semente: a textura sai igual toda vez.
function sorteador(semente) {
  let s = semente;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// Piso de concreto do pátio: placas de 2 m com juntas, manchas e grãos.
export function texturaConcreto(repeticao) {
  return canvasTextura(256, (c, n) => {
    const r = sorteador(7);
    c.fillStyle = '#a7aeb0';
    c.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) {
      const v = 150 + Math.floor(r() * 40);
      c.fillStyle = `rgba(${v},${v + 4},${v + 6},0.35)`;
      c.fillRect(r() * n, r() * n, 2, 2);
    }
    for (let i = 0; i < 5; i++) {
      const cx = r() * n;
      const cy = r() * n;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 30 + r() * 40);
      g.addColorStop(0, 'rgba(70,75,78,0.18)');
      g.addColorStop(1, 'rgba(70,75,78,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, n, n);
    }
    c.strokeStyle = 'rgba(60,66,70,0.55)';
    c.lineWidth = 2;
    c.strokeRect(1, 1, n - 2, n - 2);
  }, { repetir: [repeticao, repeticao] });
}

// Piso epóxi da área de produção: verde-petróleo com reflexo suave.
export function texturaEpoxi(repeticao) {
  return canvasTextura(128, (c, n) => {
    const r = sorteador(11);
    c.fillStyle = '#5f7f80';
    c.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.05})`;
      c.fillRect(r() * n, r() * n, 1, 1);
    }
    c.strokeStyle = 'rgba(30,50,52,0.35)';
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, n - 1, n - 1);
  }, { repetir: [repeticao, repeticao] });
}

// Faixa zebrada amarela e preta (áreas de carga e bordas).
export function texturaZebrada(repeticao = 4) {
  return canvasTextura(64, (c, n) => {
    c.fillStyle = '#1d1f20';
    c.fillRect(0, 0, n, n);
    c.fillStyle = PALETA.amarelo;
    for (let i = -n; i < n * 2; i += 16) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i + 8, 0);
      c.lineTo(i + 8 - n, n);
      c.lineTo(i - n, n);
      c.fill();
    }
  }, { repetir: [repeticao, 1] });
}

// Lona da esteira: listras transversais. O deslocamento da textura anima o movimento.
export function texturaEsteira(comprimento) {
  return canvasTextura(64, (c, n) => {
    c.fillStyle = '#2b3134';
    c.fillRect(0, 0, n, n);
    c.fillStyle = '#3a4246';
    for (let i = 0; i < n; i += 16) c.fillRect(i, 0, 6, n);
  }, { repetir: [Math.max(1, comprimento * 2), 1] });
}

// Placa com texto pintado, para letreiros.
export function texturaPlaca(texto, { fundo = PALETA.laranja, cor = '#ffffff', largura = 512, altura = 128, fonte = 64 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const c = canvas.getContext('2d');
  c.fillStyle = fundo;
  c.fillRect(0, 0, largura, altura);
  c.fillStyle = cor;
  c.font = `800 ${fonte}px "Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(texto, largura / 2, altura / 2 + 4);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Janela: vidro levemente emissivo, para acender à noite.
export const vidroJanela = new THREE.MeshStandardMaterial({
  color: PALETA.vidro,
  roughness: 0.15,
  metalness: 0.3,
  emissive: new THREE.Color('#ffd58a'),
  emissiveIntensity: 0,
});

// Coisas que acendem à noite. Cada função recebe a escuridão (0 de dia, 1 à noite).
export const noturnos = [(escuro) => (vidroJanela.emissiveIntensity = 0.9 * escuro)];
export function registrarNoturno(item) {
  noturnos.push(item);
}

// Luz de poste ou luminária: material emissivo + luz pontual que acendem juntos.
export function lampada(x, y, z, pai, { cor = '#ffd58a', alcance = 9, intensidade = 18, raio = 0.14 } = {}) {
  const material = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: new THREE.Color(cor), emissiveIntensity: 0 });
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(raio, 12, 8), material);
  bulbo.position.set(x, y, z);
  pai.add(bulbo);
  const luz = new THREE.PointLight(cor, 0, alcance, 2);
  luz.position.set(x, y - 0.1, z);
  pai.add(luz);
  registrarNoturno((escuro) => {
    material.emissiveIntensity = 2.5 * escuro;
    luz.intensity = intensidade * escuro;
  });
  return bulbo;
}
