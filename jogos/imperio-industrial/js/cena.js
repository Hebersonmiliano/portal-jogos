'use strict';
// =====================================================================
//  CENA.JS — monta a fábrica 3D com Three.js e atualiza o que muda
//  (pilhas de papelão, caixas, máquinas, esteira e caminhão).
//  Medidas em metros: o piso vai de x -14 a 14 e de z -9 a 9.
// =====================================================================

// "x, z, w, d" = retângulo que bloqueia a passagem; "ponto" = onde se fica para usar
const ESTACOES = {
  balcao:    { x: -11.5, z: -7.4, w: 3,   d: 1.4, ponto: { x: -11.5, z: -5.9 } },
  palete:    { x: -11.5, z: -3.5, w: 3,   d: 2.2, ponto: { x: -11.5, z: -1.6 } },
  bancada:   { x: -5,    z: -5.2, w: 4.4, d: 1.6, ponto: { x: -5.8,  z: -3.7 } },
  copa:      { x: 0,     z: -8.3, w: 3,   d: 1,   ponto: { x: 0,     z: -6.8 } },
  estoque:   { x: 8,     z: -7.8, w: 5,   d: 1.4, ponto: { x: 6.6,   z: -6.0 } },
  expedicao: { x: 13.2,  z: -2,   w: 1.4, d: 5,   ponto: { x: 11.7,  z: -2 } },
};
const PONTO_BANCADA_FUNC = { x: -3.9, z: -3.7 };
const VAGAS = [{ x: -7, z: 3.4 }, { x: -3, z: 3.4 }, { x: 2.4, z: 3.4 }, { x: 6.4, z: 3.4 }];
const TAM_VAGA = { w: 2.8, d: 2.0 };
const AREA_OBRAS = { x: 4.4, z: 3.4, w: 8.6, d: 3.2 };
const CAMINHO_ESTEIRA = [{ x: -10, z: -3.5 }, { x: -9.3, z: -3.5 }, { x: -9.3, z: 5.9 }, { x: 8.9, z: 5.9 }, { x: 8.9, z: -7.0 }];
const LIMITES = { x0: -13.9, x1: 13.8, z0: -8.85, z1: 8.8 };

let renderer, cena, camera;
const V = { maquinas: [], rotulosMaquinas: [], itensEsteira: [] };   // objetos visuais que mudam
const caminhao = { ativo: false, z: 20, fase: '', espera: 0 };

// ---------------------------------------------------------------------
// Ajudantes de construção
// ---------------------------------------------------------------------
const cacheMateriais = {};
const geoCubo = new THREE.BoxGeometry(1, 1, 1);

function mat(cor) {
  return cacheMateriais[cor] || (cacheMateriais[cor] = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75, metalness: 0.05 }));
}

// bloco com a base apoiada em y (como se fosse colocado no chão)
function bloco(w, h, d, cor, x, y, z, pai = cena) {
  const m = new THREE.Mesh(geoCubo, typeof cor === 'string' ? mat(cor) : cor);
  m.scale.set(w, h, d);
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  pai.add(m);
  return m;
}

function caixa(x, y, z, pai = cena) {
  const g = new THREE.Group();
  bloco(0.9, 0.75, 0.9, '#c8954f', 0, 0, 0, g);
  bloco(0.2, 0.77, 0.92, '#8a5a2b', 0, 0, 0, g);
  g.position.set(x, y, z);
  pai.add(g);
  return g;
}

function folha(x, y, z, i, pai = cena, w = 1.1, d = 0.9) {
  return bloco(w, 0.07, d, i % 2 ? '#c9a26b' : '#a07a45', x, y, z, pai);
}

function luzMaterial(cor) {
  return new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.8 });
}

// ---------------------------------------------------------------------
// Rótulos em HTML que acompanham posições 3D
// ---------------------------------------------------------------------
const rotulos = [];

function rotulo(x, y, z, opcoes) {
  const el = document.createElement('div');
  el.className = 'rotulo ' + (opcoes.classe || '');
  if (opcoes.barra) el.innerHTML = '<i></i>';
  document.getElementById('rotulos').appendChild(el);
  const r = Object.assign({ el, pos: new THREE.Vector3(x, y, z), ultimo: null }, opcoes);
  rotulos.push(r);
  return r;
}

function removerRotulo(r) {
  r.el.remove();
  rotulos.splice(rotulos.indexOf(r), 1);
}

function paraTela(v) {
  const p = v.clone().project(camera);
  return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight };
}

function atualizarRotulos() {
  for (const r of rotulos) {
    const visivel = !r.visivel || r.visivel();
    r.el.style.display = visivel ? '' : 'none';
    if (!visivel) continue;
    if (r.barra) {
      r.el.firstChild.style.width = Math.round(r.barra() * 100) + '%';
    } else {
      const texto = typeof r.texto === 'function' ? r.texto() : r.texto;
      if (texto !== r.ultimo) { r.el.textContent = texto; r.ultimo = texto; }
    }
    const p = paraTela(r.pos);
    r.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
  }
}

// ---------------------------------------------------------------------
// Criação da cena
// ---------------------------------------------------------------------
function criarCena(container) {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  cena = new THREE.Scene();
  cena.background = new THREE.Color('#1b1a2b');
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.set(30, 32, 34);
  camera.lookAt(2, 0, -1.6);

  cena.add(new THREE.HemisphereLight('#dfe6ff', '#4a4258', 0.75));
  const sol = new THREE.DirectionalLight('#fff3dc', 0.85);
  sol.position.set(18, 30, 14);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26 });
  cena.add(sol);

  construirGalpao();
  construirEstacoes();
  construirEsteira();
  construirObrasEVagas();
  construirCaminhao();

  ajustarTela();
  window.addEventListener('resize', ajustarTela);
}

function ajustarTela() {
  const w = innerWidth, h = innerHeight, aspecto = w / h;
  renderer.setSize(w, h);
  const zoom = Math.max(11.2, 11.2 * (16 / 9) / aspecto);
  Object.assign(camera, { left: -zoom * aspecto, right: zoom * aspecto, top: zoom, bottom: -zoom });
  camera.updateProjectionMatrix();
}

function construirGalpao() {
  // piso quadriculado (textura desenhada num canvas)
  const tex = document.createElement('canvas');
  tex.width = tex.height = 64;
  const c = tex.getContext('2d');
  c.fillStyle = '#6f6a80'; c.fillRect(0, 0, 64, 64);
  c.fillStyle = '#655f78'; c.fillRect(0, 0, 32, 32); c.fillRect(32, 32, 32, 32);
  const textura = new THREE.CanvasTexture(tex);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(14, 9);
  textura.magFilter = THREE.NearestFilter;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(28.6, 18.4), new THREE.MeshStandardMaterial({ map: textura, roughness: 0.9 }));
  piso.rotation.x = -Math.PI / 2;
  piso.receiveShadow = true;
  cena.add(piso);
  bloco(17, 0.02, 0.12, '#f2c94c', -1, 0, 0.6);   // faixa de circulação

  // paredes altas no fundo e à esquerda, muretas na frente e à direita
  bloco(28.6, 5, 0.6, '#3a3656', 0, 0, -9.5);
  bloco(0.6, 5, 18.6, '#34304f', -14.5, 0, 0);
  bloco(0.3, 0.8, 4.8, '#3a3656', 14.15, 0, -6.9);
  bloco(0.3, 0.8, 8.6, '#3a3656', 14.15, 0, 4.7);
  bloco(28.9, 0.3, 0.3, '#3a3656', 0, 0, 9.35);
  const vidro = new THREE.MeshBasicMaterial({ color: '#9fdcff' });
  for (const x of [-7, 0, 7]) {
    const j = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.8), vidro);
    j.position.set(x, 3.2, -9.18);
    cena.add(j);
    bloco(0.15, 1.8, 0.05, '#2a2740', x, 2.3, -9.15);
  }
  for (const z of [-4, 3]) {
    const j = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.8), vidro);
    j.rotation.y = Math.PI / 2;
    j.position.set(-14.18, 3.2, z);
    cena.add(j);
  }

  // pátio de caminhões do lado de fora
  const asfalto = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 40), mat('#4a4d55'));
  asfalto.rotation.x = -Math.PI / 2;
  asfalto.position.set(17.6, -0.01, -2);
  asfalto.receiveShadow = true;
  cena.add(asfalto);
  for (let z = -20; z < 18; z += 2.4) bloco(0.15, 0.01, 1.2, '#d9d9d9', 19.4, 0, z);
}

function construirEstacoes() {
  // fornecedor (balcão com computador e telefone)
  const b = ESTACOES.balcao;
  bloco(3, 1, 1.4, '#a8743f', b.x, 0, b.z);
  bloco(0.9, 0.7, 0.1, '#2a2f3a', b.x - 0.7, 1, b.z - 0.2);
  bloco(0.8, 0.55, 0.02, luzMaterial('#5cd6ff'), b.x - 0.7, 1.08, b.z - 0.14);
  bloco(0.4, 0.15, 0.3, '#d33b3b', b.x + 0.8, 1, b.z);
  rotulo(b.x, 2.1, b.z, { texto: 'FORNECEDOR' });

  // palete de papelão (até 14 camadas visíveis)
  const p = ESTACOES.palete;
  bloco(3, 0.3, 2.2, '#7a6044', p.x, 0, p.z);
  V.camadasPalete = [];
  for (let i = 0; i < 14; i++) V.camadasPalete.push(folha(p.x, 0.3 + i * 0.1, p.z, i, cena, 2.8, 2));
  rotulo(p.x, 2.3, p.z, { texto: () => `PAPELÃO ${E.papelao}` });

  // bancada
  const bc = ESTACOES.bancada;
  bloco(4.4, 0.18, 1.6, '#c99258', bc.x, 1.1, bc.z);
  for (const [dx, dz] of [[-2, -0.6], [2, -0.6], [-2, 0.6], [2, 0.6]]) bloco(0.18, 1.1, 0.18, '#7a5230', bc.x + dx, 0, bc.z + dz);
  V.reforcoBancada = bloco(4.3, 0.12, 0.12, '#c0c6d0', bc.x, 0.5, bc.z + 0.75);
  V.folhasBancada = [];
  for (let i = 0; i < 6; i++) V.folhasBancada.push(folha(bc.x - 1.5, 1.28 + i * 0.08, bc.z, i));
  // caixa sendo montada: as paredes crescem com o progresso
  V.montando = new THREE.Group();
  V.montando.position.set(bc.x, 1.28, bc.z);
  cena.add(V.montando);
  bloco(1.1, 0.05, 1.1, '#c8954f', 0, 0, 0, V.montando);
  V.paredesMontando = new THREE.Group();
  V.montando.add(V.paredesMontando);
  bloco(0.9, 0.7, 0.08, '#b07d3c', 0, 0, -0.42, V.paredesMontando);
  bloco(0.9, 0.7, 0.08, '#b07d3c', 0, 0, 0.42, V.paredesMontando);
  bloco(0.08, 0.7, 0.9, '#c8954f', -0.42, 0, 0, V.paredesMontando);
  bloco(0.08, 0.7, 0.9, '#c8954f', 0.42, 0, 0, V.paredesMontando);
  V.caixasBancada = [];
  for (let i = 0; i < 6; i++) V.caixasBancada.push(caixa(bc.x + 1.2 + (i % 2) * 0.95, 1.28 + Math.floor(i / 2) * 0.76, bc.z));
  rotulo(bc.x, 3.4, bc.z, { texto: 'BANCADA' });
  rotulo(bc.x, 2.9, bc.z, { classe: 'barra', barra: () => E.bancada.progresso, visivel: () => E.bancada.progresso > 0 && E.bancada.entrada > 0 });

  // copa (descanso dos funcionários)
  const cp = ESTACOES.copa;
  bloco(3, 0.9, 1, '#8a8fa0', cp.x, 0, cp.z);
  bloco(0.5, 1.4, 0.5, '#cfe8ff', cp.x - 1.1, 0.9, cp.z);
  bloco(0.4, 0.4, 0.4, '#6fb0ff', cp.x - 1.1, 2.3, cp.z);
  bloco(0.18, 0.2, 0.18, '#ffffff', cp.x + 0.4, 0.9, cp.z);
  bloco(0.18, 0.2, 0.18, '#ffffff', cp.x + 0.8, 0.9, cp.z);
  rotulo(cp.x, 2.6, cp.z, { texto: 'COPA' });

  // estoque: prateleira de 3 andares com 15 lugares visíveis
  const es = ESTACOES.estoque;
  for (const dx of [-2.4, 2.4]) bloco(0.15, 3.4, 1.4, '#8a8fa0', es.x + dx, 0, es.z);
  V.caixasEstoque = [];
  for (let n = 0; n < 3; n++) {
    bloco(4.9, 0.1, 1.4, '#8a8fa0', es.x, 0.2 + n * 1.1, es.z);
    for (let i = 0; i < 5; i++) V.caixasEstoque.push(caixa(es.x - 1.9 + i * 0.95, 0.3 + n * 1.1, es.z));
  }
  rotulo(es.x, 4.1, es.z, { texto: () => `ESTOQUE ${E.estoque}/${capEstoque()}` });

  // expedição (doca com faixas)
  const ex = ESTACOES.expedicao;
  bloco(1.4, 0.4, 5, '#555b66', ex.x, 0, ex.z);
  for (let i = 0; i < 5; i++) bloco(0.3, 0.42, 0.5, i % 2 ? '#222222' : '#f2c94c', ex.x - 0.6, 0, ex.z - 2 + i);
  rotulo(ex.x, 1.6, ex.z, { texto: 'EXPEDIÇÃO' });
}

function construirEsteira() {
  V.esteira = new THREE.Group();
  cena.add(V.esteira);
  for (let i = 0; i < CAMINHO_ESTEIRA.length - 1; i++) {
    const a = CAMINHO_ESTEIRA[i], b = CAMINHO_ESTEIRA[i + 1];
    const w = Math.abs(b.x - a.x) + 1.1, d = Math.abs(b.z - a.z) + 1.1;
    bloco(w, 0.5, d, '#2b2b33', (a.x + b.x) / 2, 0.15, (a.z + b.z) / 2, V.esteira);
  }
  for (let x = -9; x < 8.9; x += 1.5) bloco(0.15, 0.15, 0.15, '#555555', x, 0, 6.5, V.esteira);
}

function construirObrasEVagas() {
  // marcas no chão das vagas livres
  V.vagas = VAGAS.map((v, i) => {
    const g = new THREE.Group();
    g.position.set(v.x, 0, v.z);
    cena.add(g);
    const cor = '#a59fc0';
    bloco(TAM_VAGA.w, 0.02, 0.08, cor, 0, 0, -TAM_VAGA.d / 2, g);
    bloco(TAM_VAGA.w, 0.02, 0.08, cor, 0, 0, TAM_VAGA.d / 2, g);
    bloco(0.08, 0.02, TAM_VAGA.d, cor, -TAM_VAGA.w / 2, 0, 0, g);
    bloco(0.08, 0.02, TAM_VAGA.d, cor, TAM_VAGA.w / 2, 0, 0, g);
    rotulo(v.x, 0.3, v.z, { texto: 'VAGA', classe: 'fraco', visivel: () => g.visible });
    return g;
  });

  // área de expansão cercada
  const o = AREA_OBRAS;
  V.obras = new THREE.Group();
  V.obras.position.set(o.x, 0, o.z);
  cena.add(V.obras);
  for (let x = -o.w / 2; x <= o.w / 2 + 0.01; x += o.w / 6) {
    bloco(0.15, 1, 0.15, '#f2c94c', x, 0, -o.d / 2, V.obras);
    bloco(0.15, 1, 0.15, '#f2c94c', x, 0, o.d / 2, V.obras);
  }
  for (const z of [-o.d / 2, o.d / 2]) {
    bloco(o.w, 0.12, 0.05, '#f2c94c', 0, 0.75, z, V.obras);
    bloco(o.w, 0.12, 0.05, '#222222', 0, 0.55, z, V.obras);
  }
  for (const x of [-o.w / 2, o.w / 2]) {
    bloco(0.05, 0.12, o.d, '#f2c94c', x, 0.75, 0, V.obras);
    bloco(0.05, 0.12, o.d, '#222222', x, 0.55, 0, V.obras);
  }
  bloco(1.2, 0.9, 1.2, '#7a6044', -2.5, 0, 0.3, V.obras);
  bloco(1.6, 1.3, 1.2, '#7a6044', 2.6, 0, -0.2, V.obras);
  bloco(0.6, 0.6, 0.6, '#f06464', 0.4, 0, 0.6, V.obras);
  rotulo(o.x, 1.8, o.z, { texto: () => `ÁREA DE EXPANSÃO · ${reais(MELHORIAS.expansao.preco)}`, visivel: () => V.obras.visible });
}

function construirCaminhao() {
  const g = new THREE.Group();
  g.position.set(17, 0, 20);
  g.visible = false;
  cena.add(g);
  bloco(2.6, 2.6, 5.4, '#eeeeee', 0, 0.5, 0.6, g);
  bloco(2.62, 0.4, 5.42, '#d9822b', 0, 1.6, 0.6, g);
  bloco(2.4, 1.9, 1.6, '#d33b3b', 0, 0.5, -2.9, g);
  bloco(2.2, 0.7, 0.05, '#8fd3ff', 0, 1.5, -3.72, g);
  const roda = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
  for (const [x, z] of [[-1.25, -2.8], [1.25, -2.8], [-1.25, 1.8], [1.25, 1.8]]) {
    const r = new THREE.Mesh(roda, mat('#222222'));
    r.rotation.z = Math.PI / 2;
    r.position.set(x, 0.5, z);
    r.castShadow = true;
    g.add(r);
  }
  V.caminhao = g;
}

// ---------------------------------------------------------------------
// Máquinas
// ---------------------------------------------------------------------
function criarMaquina(tipo, i) {
  const v = VAGAS[i];
  const g = new THREE.Group();
  g.position.set(v.x, 0, v.z);
  cena.add(g);
  const m = { g, tipo, luz: bloco(0.2, 0.2, 0.05, luzMaterial('#5cf28a'), 1.0, 0.8, 0.98, g) };
  if (tipo === 'dobradeira') {
    bloco(2.6, 1.3, 1.8, '#7d8696', 0, 0, 0, g);
    bloco(0.2, 2.4, 0.2, '#4b5260', -1.1, 1.3, 0, g);
    bloco(0.2, 2.4, 0.2, '#4b5260', 1.1, 1.3, 0, g);
    bloco(2.6, 0.25, 0.4, '#4b5260', 0, 3.6, 0, g);
    m.prensa = bloco(1.5, 0.25, 1.2, '#c0c6d0', 0, 2.2, 0, g);
    bloco(0.6, 0.4, 0.05, '#2a2f3a', -0.7, 0.5, 0.92, g);
  } else {
    bloco(2.8, 1.1, 2, '#3f9a5a', 0, 0, 0, g);
    bloco(0.5, 0.4, 0.5, '#2a2f3a', -0.8, 1.1, 0, g);
    m.ombro = new THREE.Group();
    m.ombro.position.set(-0.8, 1.5, 0);
    g.add(m.ombro);
    bloco(0.25, 1.3, 0.25, '#f2c94c', 0, 0, 0, m.ombro);
    m.cotovelo = new THREE.Group();
    m.cotovelo.position.y = 1.3;
    m.ombro.add(m.cotovelo);
    bloco(0.22, 1.1, 0.22, '#e0a92c', 0, 0, 0, m.cotovelo);
    bloco(0.5, 0.15, 0.3, '#555555', 0, 1.1, 0, m.cotovelo);
    caixa(0.7, 1.1, 0, g);
  }
  return m;
}

function sincronizarEstrutura() {
  for (const m of V.maquinas) cena.remove(m.g);
  for (const r of V.rotulosMaquinas) removerRotulo(r);
  V.maquinas = E.maquinas.map((dados, i) => criarMaquina(dados.tipo, i));
  V.rotulosMaquinas = [];
  E.maquinas.forEach((dados, i) => {
    const v = VAGAS[i];
    V.rotulosMaquinas.push(rotulo(v.x, 0.2, v.z + 1.5, { classe: 'fraco', texto: () => {
      const m = E.maquinas[i];
      return m ? `papelão ${m.entrada} · caixas ${m.saida}` : '';
    } }));
    V.rotulosMaquinas.push(rotulo(v.x, 4.1, v.z, { classe: 'barra verde', barra: () => E.maquinas[i] ? E.maquinas[i].progresso : 0,
      visivel: () => !!E.maquinas[i] && maquinaTrabalhando(i) }));
  });
  V.vagas.forEach((g, i) => { g.visible = i >= E.maquinas.length && i < vagas(); });
  V.obras.visible = !tem('expansao');
  V.esteira.visible = tem('esteira');
  V.reforcoBancada.visible = tem('bancada_pro');
}

// ---------------------------------------------------------------------
// Esteira: itens que andam pelo caminho
// ---------------------------------------------------------------------
function comprimentoAte(x) {
  const c = CAMINHO_ESTEIRA;
  return Math.abs(c[1].x - c[0].x) + Math.abs(c[2].z - c[1].z) + (x - c[2].x);
}

function comprimentoEsteira() {
  let total = 0;
  for (let i = 0; i < CAMINHO_ESTEIRA.length - 1; i++) {
    const a = CAMINHO_ESTEIRA[i], b = CAMINHO_ESTEIRA[i + 1];
    total += Math.hypot(b.x - a.x, b.z - a.z);
  }
  return total;
}

function pontoEsteira(d) {
  for (let i = 0; i < CAMINHO_ESTEIRA.length - 1; i++) {
    const a = CAMINHO_ESTEIRA[i], b = CAMINHO_ESTEIRA[i + 1];
    const seg = Math.hypot(b.x - a.x, b.z - a.z);
    if (d <= seg) return { x: a.x + (b.x - a.x) * d / seg, z: a.z + (b.z - a.z) * d / seg };
    d -= seg;
  }
  return CAMINHO_ESTEIRA[CAMINHO_ESTEIRA.length - 1];
}

function novoItemEsteira(tipo, vaga) {
  if (V.itensEsteira.length > 40) return;
  const dv = comprimentoAte(VAGAS[vaga].x);
  const objeto = tipo === 'papelao' ? folha(0, 0, 0, 1, cena, 0.9, 0.7) : caixa(0, 0, 0);
  V.itensEsteira.push(tipo === 'papelao'
    ? { objeto, d: 0, fim: dv, altura: 0.68 }
    : { objeto, d: dv, fim: comprimentoEsteira(), altura: 0.65 });
}

// ---------------------------------------------------------------------
// Atualização a cada quadro
// ---------------------------------------------------------------------
function chamarCaminhao() {
  if (caminhao.ativo) return;
  Object.assign(caminhao, { ativo: true, z: 16, fase: 'chegando', espera: 0 });
}

function atualizarCena(t, dt) {
  // pilhas e caixas visíveis
  const camadas = Math.min(14, Math.ceil(E.papelao / 4));
  V.camadasPalete.forEach((m, i) => { m.visible = i < camadas; });
  V.folhasBancada.forEach((m, i) => { m.visible = i < E.bancada.entrada; });
  V.caixasBancada.forEach((g, i) => { g.visible = i < E.bancada.saida; });
  V.montando.visible = E.bancada.entrada > 0;
  V.paredesMontando.scale.y = Math.max(0.05, E.bancada.progresso);
  const cheias = E.estoque > 0 ? Math.max(1, Math.min(15, Math.ceil(E.estoque / capEstoque() * 15))) : 0;
  V.caixasEstoque.forEach((g, i) => { g.visible = i < cheias; });

  // máquinas: animação e luz de status
  V.maquinas.forEach((m, i) => {
    const dados = E.maquinas[i];
    if (!dados) return;
    const ativa = maquinaTrabalhando(i);
    if (m.prensa) m.prensa.position.y = 2.325 - (ativa ? Math.abs(Math.sin(t * 5)) * 0.8 : 0);
    if (m.ombro) {
      m.ombro.rotation.z = -0.5 + (ativa ? Math.sin(t * 3) * 0.5 : 0);
      m.cotovelo.rotation.z = 1.2 + (ativa ? Math.cos(t * 3) * 0.5 : 0);
    }
    let cor = '#5cf28a';
    if (dados.saida >= capMaquina()) cor = Math.floor(t * 4) % 2 ? '#f06464' : '#400000';
    else if (!ativa) cor = '#f2c94c';
    m.luz.material.color.set(cor);
    m.luz.material.emissive.set(cor);
  });

  // itens andando na esteira
  for (let i = V.itensEsteira.length - 1; i >= 0; i--) {
    const item = V.itensEsteira[i];
    item.d += 3 * dt;
    if (item.d >= item.fim || !V.esteira.visible) {
      cena.remove(item.objeto);
      V.itensEsteira.splice(i, 1);
      continue;
    }
    const p = pontoEsteira(item.d);
    item.objeto.position.set(p.x, item.altura, p.z);
  }

  // caminhão da expedição
  if (caminhao.ativo) {
    if (caminhao.fase === 'chegando') {
      caminhao.z -= 10 * dt;
      if (caminhao.z <= -2) { caminhao.z = -2; caminhao.fase = 'parado'; caminhao.espera = 1; }
    } else if (caminhao.fase === 'parado') {
      caminhao.espera -= dt;
      if (caminhao.espera <= 0) caminhao.fase = 'saindo';
    } else {
      caminhao.z -= 10 * dt;
      if (caminhao.z < -24) caminhao.ativo = false;
    }
  }
  V.caminhao.visible = caminhao.ativo;
  V.caminhao.position.z = caminhao.z;

  renderer.render(cena, camera);
  atualizarRotulos();
}
