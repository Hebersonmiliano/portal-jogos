'use strict';
// =====================================================================
//  PERSONAGENS.JS — jogador (WASD) e funcionários (inteligência simples)
// =====================================================================

// ---------------------------------------------------------------------
// Boneco 3D feito de blocos, com braços e pernas que giram
// ---------------------------------------------------------------------
function criarBoneco(camisa, capacete) {
  const g = new THREE.Group();
  cena.add(g);
  const membro = (x, y, w, h, d, cor, maoCor) => {
    const pivo = new THREE.Group();     // gira a partir do ombro/quadril
    pivo.position.set(x, y, 0);
    bloco(w, h, d, cor, 0, -h, 0, pivo);
    if (maoCor) bloco(w, 0.12, d, maoCor, 0, -h - 0.12, 0, pivo);
    g.add(pivo);
    return pivo;
  };
  const b = {
    g,
    pernaE: membro(-0.15, 0.6, 0.22, 0.6, 0.25, '#2e3a5a'),
    pernaD: membro(0.15, 0.6, 0.22, 0.6, 0.25, '#2e3a5a'),
    bracoE: membro(-0.4, 1.25, 0.16, 0.58, 0.18, camisa, '#f0c09a'),
    bracoD: membro(0.4, 1.25, 0.16, 0.58, 0.18, camisa, '#f0c09a'),
    carga: new THREE.Group(),
    chaveCarga: '',
  };
  bloco(0.62, 0.7, 0.36, camisa, 0, 0.6, 0, g);
  bloco(0.5, 0.48, 0.46, '#f0c09a', 0, 1.32, 0, g);
  bloco(0.07, 0.07, 0.02, '#1f1b2e', -0.11, 1.55, 0.235, g);
  bloco(0.07, 0.07, 0.02, '#1f1b2e', 0.11, 1.55, 0.235, g);
  if (capacete) {
    bloco(0.58, 0.18, 0.54, '#f2c94c', 0, 1.78, 0, g);
    bloco(0.66, 0.05, 0.66, '#d9a92c', 0, 1.76, 0.05, g);
  } else {
    bloco(0.54, 0.16, 0.5, '#6b3e1f', 0, 1.78, 0, g);
    bloco(0.54, 0.3, 0.1, '#6b3e1f', 0, 1.5, -0.22, g);
  }
  b.carga.position.y = 2.05;
  g.add(b.carga);
  return b;
}

function animarBoneco(b, x, z, direcao, estado, t) {
  b.g.position.set(x, 0, z);
  b.g.rotation.y = Math.atan2(direcao.x, direcao.z);
  const passo = estado.andando ? Math.sin(t * 11) * 0.6 : 0;
  b.pernaE.rotation.x = passo;
  b.pernaD.rotation.x = -passo;
  if (estado.carregando) {
    b.bracoE.rotation.x = b.bracoD.rotation.x = Math.PI;       // braços para cima
  } else if (estado.trabalhando) {
    b.bracoE.rotation.x = -1.2 + Math.sin(t * 14) * 0.35;      // braços na bancada
    b.bracoD.rotation.x = -1.2 - Math.sin(t * 14) * 0.35;
  } else {
    b.bracoE.rotation.x = -passo;
    b.bracoD.rotation.x = passo;
  }
}

// desenha o que o boneco carrega acima da cabeça
function mostrarCarga(b, tipo, qtd) {
  const chave = tipo + qtd;
  if (b.chaveCarga === chave) return;
  b.chaveCarga = chave;
  while (b.carga.children.length) b.carga.remove(b.carga.children[0]);
  if (tipo === 'papelao') for (let i = 0; i < Math.min(qtd, 6); i++) folha(0, i * 0.08, 0, i, b.carga, 1.0, 0.75);
  if (tipo === 'caixa') for (let i = 0; i < Math.min(qtd, 3); i++) caixa(0, i * 0.76, 0, b.carga);
}

// ---------------------------------------------------------------------
// Colisão: círculo do personagem contra os retângulos do galpão
// ---------------------------------------------------------------------
function obstaculos() {
  const lista = Object.values(ESTACOES);
  E.maquinas.forEach((m, i) => lista.push({ x: VAGAS[i].x, z: VAGAS[i].z, w: TAM_VAGA.w, d: TAM_VAGA.d }));
  if (!tem('expansao')) lista.push(AREA_OBRAS);
  return lista;
}

function resolverColisao(p, raio) {
  p.x = Math.min(Math.max(p.x, LIMITES.x0 + raio), LIMITES.x1 - raio);
  p.z = Math.min(Math.max(p.z, LIMITES.z0 + raio), LIMITES.z1 - raio);
  for (const o of obstaculos()) {
    const cx = Math.min(Math.max(p.x, o.x - o.w / 2), o.x + o.w / 2);
    const cz = Math.min(Math.max(p.z, o.z - o.d / 2), o.z + o.d / 2);
    const dx = p.x - cx, dz = p.z - cz, dist = Math.hypot(dx, dz);
    if (dist >= raio) continue;
    if (dist > 0.0001) {
      p.x = cx + dx / dist * raio;
      p.z = cz + dz / dist * raio;
    } else {
      // centro dentro do retângulo: empurra pelo lado mais próximo
      const saidas = [
        [o.x - o.w / 2 - raio - p.x, 0], [o.x + o.w / 2 + raio - p.x, 0],
        [0, o.z - o.d / 2 - raio - p.z], [0, o.z + o.d / 2 + raio - p.z],
      ].sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
      p.x += saidas[0][0];
      p.z += saidas[0][1];
    }
  }
}

// ---------------------------------------------------------------------
// Jogador
// ---------------------------------------------------------------------
const teclas = {};
const jogador = { x: 0, z: 0, direcao: { x: 0, z: 1 }, andando: false, trabalhando: false, boneco: null };
const VELOCIDADE_JOGADOR = 4.5;

// direções da tela convertidas para o chão (a câmera é diagonal)
function direcoesDaCamera() {
  const frente = new THREE.Vector3();
  camera.getWorldDirection(frente);
  const cima = { x: frente.x, z: frente.z };
  const tam = Math.hypot(cima.x, cima.z);
  cima.x /= tam; cima.z /= tam;
  return { cima, direita: { x: -cima.z, z: cima.x } };
}

function criarJogador() {
  jogador.boneco = criarBoneco('#3b7dd8', false);
  jogador.x = E.posJogador.x;
  jogador.z = E.posJogador.z;
  resolverColisao(jogador, 0.35);
}

function atualizarJogador(dt, t) {
  let h = 0, v = 0;
  if (teclas.KeyA || teclas.ArrowLeft) h -= 1;
  if (teclas.KeyD || teclas.ArrowRight) h += 1;
  if (teclas.KeyW || teclas.ArrowUp) v += 1;
  if (teclas.KeyS || teclas.ArrowDown) v -= 1;
  jogador.andando = (h !== 0 || v !== 0) && !jogador.trabalhando;
  if (jogador.andando) {
    const { cima, direita } = direcoesDaCamera();
    let mx = cima.x * v + direita.x * h, mz = cima.z * v + direita.z * h;
    const tam = Math.hypot(mx, mz);
    mx /= tam; mz /= tam;
    jogador.x += mx * VELOCIDADE_JOGADOR * dt;
    jogador.z += mz * VELOCIDADE_JOGADOR * dt;
    jogador.direcao = { x: mx, z: mz };
    resolverColisao(jogador, 0.35);
  }
  if (jogador.trabalhando) jogador.direcao = { x: 0, z: -1 };   // olhando para a bancada
  E.posJogador = { x: jogador.x, z: jogador.z };
  mostrarCarga(jogador.boneco, E.cargaTipo, E.cargaQtd);
  animarBoneco(jogador.boneco, jogador.x, jogador.z, jogador.direcao,
    { andando: jogador.andando, trabalhando: jogador.trabalhando, carregando: E.cargaQtd > 0 }, t);
}

// ---------------------------------------------------------------------
// Funcionários
// Prioridades: 1) levar caixas prontas ao estoque, 2) abastecer com papelão,
// 3) montar caixas na bancada, 4) descansar na copa.
// ---------------------------------------------------------------------
const CORES_FUNCIONARIOS = ['#e8792b', '#3fa36b', '#8a5cd6', '#d94f70', '#2f9fd0', '#b5892a'];
const VELOCIDADE_FUNCIONARIO = 2.8;
const CARGA_FUNCIONARIO = 5;
const RITMO_MONTAGEM = 0.8;
const funcionarios = [];
const reservas = {};             // produtor -> funcionário cuidando dele
let bancadaOcupante = null;

function pontoDe(id) {
  if (id === 'bancada_func') return PONTO_BANCADA_FUNC;
  if (id[0] === 'm') { const v = VAGAS[Number(id.slice(1))]; return { x: v.x, z: v.z - 1.7 }; }
  return ESTACOES[id].ponto;
}

const reservado = (id, quem) => reservas[id] && reservas[id] !== quem;

function liberar(quem) {
  for (const id in reservas) if (reservas[id] === quem) delete reservas[id];
  if (bancadaOcupante === quem) bancadaOcupante = null;
}

function sincronizarFuncionarios() {
  while (funcionarios.length < E.funcionarios) {
    const n = funcionarios.length;
    funcionarios.push({
      x: -1 + n * 0.6, z: -6.6, direcao: { x: 0, z: 1 }, estado: 'escolher',
      alvo: null, origem: '', destino: '', cargaTipo: '', cargaQtd: 0, espera: 0, andando: false,
      boneco: criarBoneco(CORES_FUNCIONARIOS[n % CORES_FUNCIONARIOS.length], true),
    });
  }
}

function andarAte(f, dt) {
  const dx = f.alvo.x - f.x, dz = f.alvo.z - f.z, dist = Math.hypot(dx, dz);
  if (dist < 0.05) { f.x = f.alvo.x; f.z = f.alvo.z; return true; }
  const passo = Math.min(dist, VELOCIDADE_FUNCIONARIO * dt);
  f.x += dx / dist * passo;
  f.z += dz / dist * passo;
  f.direcao = { x: dx / dist, z: dz / dist };
  f.andando = true;
  return false;
}

function iniciarTarefa(f, de, tipo, para, reserva) {
  f.origem = de; f.destino = para; f.cargaTipo = tipo;
  reservas[reserva] = f;
  f.alvo = pontoDe(de);
  f.estado = 'indo_pegar';
}

function terminarTarefa(f) {
  f.cargaTipo = '';
  f.cargaQtd = 0;
  liberar(f);
  f.estado = 'escolher';
}

function escolherTarefa(f) {
  const esteira = tem('esteira');   // com esteira, as máquinas se abastecem sozinhas
  const candidatos = idsProdutores().filter(id => !(esteira && id !== 'bancada') && !reservado(id, f));

  // 1. caixas prontas vão para o estoque
  if (E.estoque < capEstoque()) {
    let melhor = '', mais = 0;
    for (const id of candidatos) if (produtor(id).saida > mais) { mais = produtor(id).saida; melhor = id; }
    if (melhor) return iniciarTarefa(f, melhor, 'caixa', 'estoque', melhor);
  }
  // 2. papelão do palete vai para quem está com pouco material
  if (E.papelao > 0) {
    let melhor = '', menor = 4;
    for (const id of candidatos) if (produtor(id).entrada < menor) { menor = produtor(id).entrada; melhor = id; }
    if (melhor) return iniciarTarefa(f, 'palete', 'papelao', melhor, melhor);
  }
  // 3. montar caixas na bancada
  if (podeMontar() && !bancadaOcupante) {
    bancadaOcupante = f;
    f.alvo = pontoDe('bancada_func');
    f.estado = 'indo_montar';
    return;
  }
  // 4. descansar na copa
  f.alvo = { x: -1.2 + Math.random() * 2.4, z: -6.9 + Math.random() * 0.8 };
  f.espera = 1 + Math.random();
  f.estado = 'descansando';
}

function pegarCarga(f) {
  let q = 0;
  if (f.cargaTipo === 'papelao') {
    const p = produtor(f.destino);
    if (p) q = retirarPapelao(Math.min(CARGA_FUNCIONARIO, capProdutor(f.destino) - p.entrada));
  } else {
    q = retirarCaixas(f.origem, Math.min(CARGA_FUNCIONARIO, capEstoque() - E.estoque));
  }
  if (q <= 0) return terminarTarefa(f);
  f.cargaQtd = q;
  f.alvo = pontoDe(f.destino);
  f.estado = 'indo_entregar';
}

function entregarCarga(f) {
  if (f.cargaTipo === 'papelao') E.papelao += f.cargaQtd - abastecer(f.destino, f.cargaQtd);   // sobra volta ao palete
  else E.estoque += f.cargaQtd - armazenar(f.cargaQtd);                                          // sobra fica no chão do estoque
  terminarTarefa(f);
}

function atualizarFuncionarios(dt, t) {
  for (const f of funcionarios) {
    f.andando = false;
    if (!E.salarioAtrasado) {
      switch (f.estado) {
        case 'escolher': escolherTarefa(f); break;
        case 'indo_pegar': if (andarAte(f, dt)) pegarCarga(f); break;
        case 'indo_entregar': if (andarAte(f, dt)) entregarCarga(f); break;
        case 'indo_montar':
          if (!podeMontar()) terminarTarefa(f);
          else if (andarAte(f, dt)) { f.direcao = { x: 0, z: -1 }; f.estado = 'montando'; }
          break;
        case 'montando':
          if (!podeMontar() || avancarBancada(dt, RITMO_MONTAGEM)) terminarTarefa(f);
          break;
        case 'descansando':
          if (andarAte(f, dt)) { f.espera -= dt; if (f.espera <= 0) f.estado = 'escolher'; }
          break;
      }
    }
    const carregando = f.cargaQtd > 0;
    mostrarCarga(f.boneco, carregando ? f.cargaTipo : '', f.cargaQtd);
    animarBoneco(f.boneco, f.x, f.z, f.direcao,
      { andando: f.andando, trabalhando: f.estado === 'montando', carregando }, t);
  }
}
