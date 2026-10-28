// Cena do Distrito Industrial: terreno, oficina, jogador, máquinas, funcionários, linha automática e contratos.
// O visual (modelos, luz, câmera e rótulos) fica em js/visual/; aqui ficam as regras ligadas à cena.
import * as THREE from 'three';
import { registrarObstaculo, cabeAqui, definirTerrenoExpandido } from './grade.js';
import { criarJogador, atualizarJogador } from './jogador.js';
import {
  criarMaquina,
  criarCaixa,
  criarEsteira,
  maquinaProxima,
  marcarAutomatica,
  mostrarEstado,
  posicionarNaEsteira,
  animarEsteiras,
  animarMaquina,
  adicionarInspetor,
} from './producao.js';
import {
  CAPACIDADE_SAIDA,
  CUSTO_AUTOMACAO,
  atualizarAutomacao,
  estadoMaquina,
  programar,
  saidaCheia,
} from './automacao.js';
import { ciclar, produtoAtual, produtoPorChave, exportarEscolha, importarEscolha } from './catalogo.js';
import {
  guardarNoEstoque,
  totalNoEstoque,
  resumoEstoque,
  venderTudo,
  quantidadeDe,
  retirar,
  exportarEstoque,
  importarEstoque,
  defeituosasNoEstoque,
  separarDefeituosas,
} from './estoque.js';
import {
  apagar,
  armazenamentoDisponivel,
  carregar,
  codigoDoSave,
  gravar,
  lerCodigo,
  montarSave,
} from './salvamento.js';
import {
  MAX_ATIVOS,
  aceitar,
  atualizarContratos,
  chavesReservadas,
  exportarQuadro,
  importarQuadro,
  nivel,
  nomeCliente,
  novoQuadro,
} from './contratos.js';
import { ROTAS, atualizarEntregas, despachar, exportarFrota, importarFrota, novaFrota } from './entregas.js';
import { exportarConstrucao, importarConstrucao, melhorar, novaConstrucao, proximaMelhoria, temTerreno } from './construcao.js';
import { criarFuncionario, atualizarFuncionario, ESTOQUE_PONTO } from './funcionarios.js';
import {
  CUSTO_INSPETOR,
  custoInspecaoManual,
  custoManutencao,
  fazerManutencao,
  registrarProducao,
} from './qualidade.js';
import {
  consumir,
  energiaCortada,
  exportarEnergia,
  importarEnergia,
  novaEnergia,
  pagarDivida,
  tarifa,
  virarDia,
} from './energia.js';
import { criarCenario } from './cenario.js';
import { DURACAO_DIA, criarAmbiente, escuridao } from './visual/ambiente.js';
import { lerControle, primeiroControle } from './entrada.js';
import { criarMusica } from './audio/musica.js';
import { criarCameraJogo } from './visual/camera.js';
import { criarRotulos } from './visual/rotulos.js';
import { criarOficina } from './visual/oficina.js';
import { criarCursor, criarTerreno } from './visual/terreno.js';
import { criarExpansao } from './visual/expansao.js';
import { criarCacamba, criarExpedicao, criarPrateleira, criarVan } from './visual/estacoes.js';
import {
  CUSTO_ESTEIRA,
  CUSTO_FUNCIONARIO,
  CUSTO_MAQUINA,
  CUSTO_PRODUCAO,
  META_VENDAS,
  cobrarMulta,
  exportarEconomia,
  importarEconomia,
  getDinheiro,
  getVendido,
  pagar,
  receber,
  venceu,
} from './economia.js';

const palco = document.getElementById('palco');
const elCaixas = document.getElementById('caixas');
const elMaquinas = document.getElementById('maquinas');
const elMensagem = document.getElementById('mensagem');
const elProduto = document.getElementById('produto');
const elEstoque = document.getElementById('estoque');
const elDetalheEstoque = document.getElementById('detalhe-estoque');
const elDinheiro = document.getElementById('dinheiro');
const elMeta = document.getElementById('meta');
const elFuncionarios = document.getElementById('funcionarios');
const elReputacao = document.getElementById('reputacao');
const elOfertas = document.getElementById('ofertas');
const elAtivos = document.getElementById('ativos');
const elHistorico = document.getElementById('historico-contratos');
const elLinha = document.getElementById('linha');
const elRelogio = document.getElementById('relogio');
const elBarraMeta = document.getElementById('barra-meta');
const elCorProduto = document.getElementById('cor-produto');
const elAjuda = document.getElementById('ajuda');
const elEnergia = document.getElementById('energia');
const elQualidade = document.getElementById('qualidade');
const elBotaoSom = document.getElementById('botao-som');
const elFrota = document.getElementById('frota');
const elMapaRota = document.getElementById('mapa-rota');
const elVeiculoMapa = document.getElementById('veiculo-mapa');
const elPropriedade = document.getElementById('propriedade');

// Trilha sonora e efeitos (v0.6.1). O áudio só começa depois do primeiro clique ou tecla.
const musica = criarMusica();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
palco.appendChild(renderer.domElement);

const cena = new THREE.Scene();
const ambiente = criarAmbiente(cena, renderer);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);

criarCenario(cena);
criarTerreno(cena);
const visualExpansao = criarExpansao(cena);
const cursor = criarCursor(cena);

// Oficina alugada no centro do terreno (5 x 3 células).
criarOficina(cena);
registrarObstaculo(-2.5, 2.5, -1.5, 1.5);

// Expedição: doca onde contratos são carregados na van e o estoque livre é vendido (tecla V, perto do ponto).
const EXPEDICAO = { x: -8, z: 4 };
criarExpedicao(cena, EXPEDICAO.x, EXPEDICAO.z);
registrarObstaculo(EXPEDICAO.x - 1, EXPEDICAO.x + 1, EXPEDICAO.z - 1, EXPEDICAO.z + 1);
const van = criarVan(cena, EXPEDICAO.x, 9.4);
registrarObstaculo(EXPEDICAO.x - 0.9, EXPEDICAO.x + 0.9, 7.85, 12.2);

// Prateleira do estoque: onde os funcionários e as esteiras deixam as caixas.
const prateleira = criarPrateleira(cena, ESTOQUE_PONTO.x, ESTOQUE_PONTO.z);
registrarObstaculo(ESTOQUE_PONTO.x - 1, ESTOQUE_PONTO.x + 1, ESTOQUE_PONTO.z - 0.5, ESTOQUE_PONTO.z + 0.5);

// Caçamba de refugo ao lado do estoque: destino das caixas defeituosas separadas na inspeção (v0.6).
const CACAMBA = { x: -10.6, z: -6.95 };
const cacamba = criarCacamba(cena, CACAMBA.x, CACAMBA.z);
registrarObstaculo(CACAMBA.x - 0.45, CACAMBA.x + 0.45, CACAMBA.z - 0.45, CACAMBA.z + 0.45);
let refugo = 0;
let energia = novaEnergia();
let frota = novaFrota();
let construcao = novaConstrucao();
visualExpansao.atualizar(construcao.nivel);
let escritorioRegistrado = false;

function sincronizarConstrucaoVisual() {
  definirTerrenoExpandido(temTerreno(construcao));
  visualExpansao.atualizar(construcao.nivel);
  if (construcao.nivel >= 2 && !escritorioRegistrado) {
    registrarObstaculo(13.25, 18.75, -9.75, -5.25);
    escritorioRegistrado = true;
  }
}

const rotulos = criarRotulos(document.getElementById('rotulos'), camera);
rotulos.adicionar({ x: ESTOQUE_PONTO.x, y: 2.8, z: ESTOQUE_PONTO.z }, { texto: () => `ESTOQUE · ${totalNoEstoque()}`, classe: 'estacao' });
rotulos.adicionar({ x: EXPEDICAO.x, y: 3.1, z: EXPEDICAO.z }, {
  texto: () => (quadro.ativos.some((c) => quantidadeDe(c.chave) >= c.quantidade) ? 'EXPEDIÇÃO · contrato pronto!' : 'EXPEDIÇÃO'),
  classe: () => (quadro.ativos.some((c) => quantidadeDe(c.chave) >= c.quantidade) ? 'estacao pronto' : 'estacao'),
});

const jogador = criarJogador(0, 4);
cena.add(jogador);
const cameraJogo = criarCameraJogo(camera, renderer.domElement, jogador.position);

const maquinas = [];
const funcionarios = [];
const LIMITE_FUNCIONARIOS = 3;
let caixas = 0;

const teclas = new Set();
let timerMensagem = null;

// Aviso de algo que não deu certo: mensagem com som de erro.
function falha(texto) {
  musica.tocar('erro');
  vibrar(0.3, 0, 80);
  mensagem(texto);
}

function mensagem(texto) {
  elMensagem.textContent = texto;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => (elMensagem.textContent = ''), 3000);
}

const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
const corCss = (hex) => `#${hex.toString(16).padStart(6, '0')}`;

function atualizarPlacar() {
  elCaixas.textContent = caixas;
  elMaquinas.textContent = maquinas.length;
  const produto = produtoAtual();
  elProduto.textContent = produto.nome;
  elCorProduto.style.background = corCss(produto.cor);
  elEstoque.textContent = totalNoEstoque();
  elDetalheEstoque.textContent = resumoEstoque();
  elDinheiro.textContent = reais(getDinheiro());
  elMeta.textContent = `${reais(getVendido())} de ${reais(META_VENDAS)}`;
  elBarraMeta.style.width = `${Math.min(100, (getVendido() / META_VENDAS) * 100)}%`;
  elFuncionarios.textContent = funcionarios.length;
  elLinha.textContent = resumoLinha();
  cacamba.atualizar(refugo);
  const defeitos = defeituosasNoEstoque();
  elQualidade.textContent = defeitos
    ? `${defeitos} caixa(s) com defeito no estoque · I no estoque inspeciona`
    : `Estoque sem defeitos · refugo: ${refugo}`;
  elQualidade.className = defeitos ? 'alerta' : '';
  const proxima = proximaMelhoria(construcao);
  elPropriedade.textContent = proxima
    ? `Nível ${construcao.nivel}/3 · próxima: ${proxima.nome} (R$ ${proxima.custo})`
    : 'Nível 3/3 · complexo industrial concluído';
  atualizarPainelFrota();
  prateleira.atualizar(
    exportarEstoque().map(([chave, quantidade]) => ({ cor: produtoPorChave(chave)?.cor ?? 0xc89b5a, quantidade })),
  );
}

function melhorarPropriedade() {
  const proxima = proximaMelhoria(construcao);
  if (proxima?.id === 'escritorio') {
    const ocupado = maquinas.some((m) => m.x > 13.25 && m.x < 18.75 && m.z > -9.75 && m.z < -5.25);
    if (ocupado) { falha('Retire as máquinas da área marcada do escritório antes de construir.'); return; }
  }
  const { melhoria, erro } = melhorar(construcao, pagar);
  if (erro) { falha(erro); return; }
  sincronizarConstrucaoVisual();
  musica.tocar('compra');
  atualizarPlacar();
  mensagem(`${melhoria.nome} construído. Propriedade nível ${construcao.nivel}/3.`);
}

// Resumo da linha para o HUD: quantas máquinas são automáticas e onde a produção travou.
function resumoLinha() {
  if (maquinas.length === 0) return 'sem máquinas';
  const podePagar = getDinheiro() >= CUSTO_PRODUCAO;
  const semEnergia = energiaCortada(energia);
  const conta = { produzindo: 0, 'sem-dinheiro': 0, cheia: 0, quebrada: 0, 'sem-energia': 0 };
  for (const m of maquinas) {
    const estado = estadoMaquina(m, podePagar, semEnergia);
    if (estado in conta) conta[estado] += 1;
  }
  const automaticas = maquinas.filter((m) => m.automatica).length;
  const partes = [`${automaticas} automática(s)`];
  if (conta.produzindo) partes.push(`${conta.produzindo} produzindo`);
  if (conta.quebrada) partes.push(`${conta.quebrada} quebrada(s)`);
  if (conta['sem-energia']) partes.push(`${conta['sem-energia']} sem energia`);
  if (conta.cheia) partes.push(`${conta.cheia} parada(s): saída cheia`);
  if (conta['sem-dinheiro']) partes.push(`${conta['sem-dinheiro']} sem papelão`);
  return partes.join(' · ');
}

// Atualiza a luz de cada máquina e o resumo da linha quando alguma situação muda.
let assinaturaLinha = '';
function atualizarLuzes() {
  const podePagar = getDinheiro() >= CUSTO_PRODUCAO;
  const semEnergia = energiaCortada(energia);
  const estados = maquinas.map((m) => estadoMaquina(m, podePagar, semEnergia));
  maquinas.forEach((m, i) => mostrarEstado(m, estados[i]));
  const assinatura = estados.join(',');
  if (assinatura !== assinaturaLinha) {
    assinaturaLinha = assinatura;
    elLinha.textContent = resumoLinha();
  }
}

// Fabrica uma caixa na máquina: paga o papelão, desgasta a máquina e sorteia defeito e quebra (v0.6).
// Usada pela produção manual (E), pelos funcionários e pelas máquinas automáticas.
function fabricar(maquina, produto) {
  if (maquina.quebrada || saidaCheia(maquina) || !pagar(CUSTO_PRODUCAO)) return false;
  const { defeito, quebrou } = registrarProducao(maquina);
  cena.add(criarCaixa(maquina, produto, defeito));
  caixas += 1;
  if (quebrou) {
    musica.tocar('quebra');
    vibrar(1, 0.6, 400);
  }
  if (quebrou) mensagem(`Uma máquina quebrou! Chegue perto e aperte K para consertar (R$ ${custoManutencao(maquina)}).`);
  atualizarPlacar();
  return true;
}

// Ações que os funcionários usam na cena: produzir, recolher a saída e depositar no estoque.
const acoesFuncionario = {
  podeProduzir: () => getDinheiro() >= CUSTO_PRODUCAO,
  produzir(maquina) {
    if (fabricar(maquina, produtoAtual())) tocarPerto('caixa', maquina, 0.4);
  },
  recolher(maquina) {
    const levadas = maquina.saida.splice(0);
    for (const { malha } of levadas) cena.remove(malha);
    return levadas.map(({ produto, defeito }) => ({ produto, defeito }));
  },
  depositar(itens) {
    for (const { produto, defeito } of itens) guardarNoEstoque(produto, 1, defeito ? 1 : 0);
    atualizarPlacar();
  },
};

// Liga a esteira da máquina mais próxima: a saída passa a ir sozinha ao estoque.
function ligarEsteira() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para ligar a esteira.');
    return;
  }
  if (maquina.esteira) {
    mensagem('Esta máquina já tem esteira.');
    return;
  }
  if (!pagar(CUSTO_ESTEIRA)) {
    falha(`Esteira custa R$ ${CUSTO_ESTEIRA}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  maquina.esteira = criarEsteira(maquina, ESTOQUE_PONTO);
  cena.add(maquina.esteira);
  atualizarPlacar();
  musica.tocar('compra');
  mensagem('Esteira ligada ao estoque.');
}

// Linha automática: máquinas automáticas produzem e as esteiras levam as caixas, uma a uma, ao estoque.
const acoesLinha = {
  podePagar: () => getDinheiro() >= CUSTO_PRODUCAO,
  semEnergia: () => energiaCortada(energia),
  produzir(maquina, produto) {
    if (fabricar(maquina, produto)) tocarPerto('caixa', maquina, 0.35);
  },
  descartar(item) {
    cena.remove(item.malha);
    refugo += 1;
    atualizarPlacar();
  },
  posicionar(item, maquina, progresso) {
    posicionarNaEsteira(item.malha, maquina, progresso);
  },
  entregar(item) {
    cena.remove(item.malha);
    guardarNoEstoque(item.produto, 1, item.defeito ? 1 : 0);
    atualizarPlacar();
  },
};

// Torna automática a máquina mais próxima ou troca o produto que ela fabrica.
function automatizarMaquina() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para automatizar.');
    return;
  }
  if (maquina.automatica) {
    programar(maquina, produtoAtual());
    mensagem(`Máquina reprogramada: ${produtoAtual().nome}.`);
    return;
  }
  if (!pagar(CUSTO_AUTOMACAO)) {
    falha(`Automação custa R$ ${CUSTO_AUTOMACAO}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  programar(maquina, produtoAtual());
  marcarAutomatica(maquina);
  musica.tocar('compra');
  atualizarPlacar();
  mensagem(
    maquina.esteira
      ? 'Máquina automática: a linha roda sozinha.'
      : 'Máquina automática. Ligue uma esteira (L) para a saída não encher.',
  );
}

// Contrata um funcionário que aparece perto da oficina e trabalha sozinho.
function contratarFuncionario() {
  if (funcionarios.length >= LIMITE_FUNCIONARIOS) {
    falha(`Limite de ${LIMITE_FUNCIONARIOS} funcionários.`);
    return;
  }
  if (!pagar(CUSTO_FUNCIONARIO)) {
    falha(`Funcionário custa R$ ${CUSTO_FUNCIONARIO}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  const f = criarFuncionario(-3 + funcionarios.length, 3.5);
  cena.add(f.malha);
  funcionarios.push(f);
  atualizarPlacar();
  musica.tocar('compra');
  mensagem('Funcionário contratado.');
}

// ===== Manutenção e inspeção (v0.6) =====

// K perto da máquina: manutenção preventiva (zera o desgaste) ou conserto, se estiver quebrada.
function manutencao() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para fazer manutenção.');
    return;
  }
  if (!maquina.quebrada && maquina.desgaste < 1) {
    mensagem('Esta máquina está nova. Ainda não precisa de manutenção.');
    return;
  }
  const custo = custoManutencao(maquina);
  if (!pagar(custo)) {
    falha(`${maquina.quebrada ? 'Conserto' : 'Manutenção'} custa R$ ${custo}. Você tem ${reais(getDinheiro())}.`);
    return;
  }
  const estavaQuebrada = maquina.quebrada;
  fazerManutencao(maquina);
  atualizarPlacar();
  musica.tocar('manutencao');
  mensagem(estavaQuebrada ? `Máquina consertada por R$ ${custo}.` : `Manutenção feita por R$ ${custo}: desgaste zerado.`);
}

// I perto do estoque: inspeção manual de todo o estoque. Perto de uma máquina com esteira:
// instala o inspetor automático, que separa os defeitos antes de chegarem ao estoque.
function inspecionar() {
  const p = jogador.position;
  if (Math.hypot(p.x - ESTOQUE_PONTO.x, p.z - ESTOQUE_PONTO.z) < 2.4) {
    const total = totalNoEstoque();
    if (total === 0) {
      mensagem('O estoque está vazio.');
      return;
    }
    const custo = custoInspecaoManual(total);
    if (!pagar(custo)) {
      falha(`Inspecionar ${total} caixas custa R$ ${custo}. Você tem ${reais(getDinheiro())}.`);
      return;
    }
    const separadas = separarDefeituosas();
    refugo += separadas;
    atualizarPlacar();
    mensagem(separadas ? `Inspeção (R$ ${custo}): ${separadas} caixa(s) com defeito foram para o refugo.` : `Inspeção (R$ ${custo}): nenhum defeito.`);
    return;
  }
  const maquina = maquinaProxima(p, maquinas);
  if (!maquina) {
    mensagem('Aperte I perto do estoque para inspecionar, ou perto de uma máquina com esteira para instalar o inspetor.');
    return;
  }
  if (!maquina.esteira) {
    mensagem('O inspetor automático fica na esteira. Ligue uma esteira (L) primeiro.');
    return;
  }
  if (maquina.inspecao) {
    mensagem('Esta esteira já tem inspetor.');
    return;
  }
  if (!pagar(CUSTO_INSPETOR)) {
    falha(`Inspetor custa R$ ${CUSTO_INSPETOR}. Você tem ${reais(getDinheiro())}.`);
    return;
  }
  maquina.inspecao = true;
  adicionarInspetor(maquina);
  atualizarPlacar();
  musica.tocar('compra');
  mensagem('Inspetor instalado: caixas com defeito vão direto para o refugo.');
}

// Rótulo sobre a máquina: caixas na saída, com a cor da situação.
function rotularMaquina(maquina) {
  rotulos.adicionar({ x: maquina.x, y: 2.15, z: maquina.z }, {
    texto: () => {
      if (maquina.quebrada) return `QUEBRADA · K conserta (R$ ${custoManutencao(maquina)})`;
      const partes = [];
      if (maquina.saida.length) partes.push(`${maquina.saida.length}/${CAPACIDADE_SAIDA}`);
      if (maquina.desgaste >= 50) partes.push(`desgaste ${Math.round(maquina.desgaste)}%`);
      return partes.join(' · ');
    },
    classe: () => `maquina ${maquina.luz.userData.estado ?? 'manual'}`,
  });
}

// Coloca uma máquina na célula à frente do jogador (1,5 célula), se a célula estiver livre.
function posicionarMaquina() {
  const p = jogador.position;
  const f = jogador.userData.frente;
  const cx = Math.round(p.x + f.x * 1.5);
  const cz = Math.round(p.z + f.z * 1.5);
  if (!cabeAqui(cx, cz)) {
    falha('Sem espaço aqui.');
    return;
  }
  if (!pagar(CUSTO_MAQUINA)) {
    falha(`Máquina custa R$ ${CUSTO_MAQUINA}. Você tem R$ ${getDinheiro()}.`);
    return;
  }
  const maquina = criarMaquina(cx, cz);
  cena.add(maquina.malha);
  maquinas.push(maquina);
  rotularMaquina(maquina);
  registrarObstaculo(cx - 0.45, cx + 0.45, cz - 0.45, cz + 0.45);
  atualizarPlacar();
  musica.tocar('maquina');
  mensagem('Máquina posicionada.');
}

// Produz uma caixa do produto escolhido na máquina mais próxima do jogador.
function produzirCaixa() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para produzir.');
    return;
  }
  if (maquina.quebrada) {
    falha(`Máquina quebrada. Aperte K para consertar (R$ ${custoManutencao(maquina)}).`);
    return;
  }
  if (saidaCheia(maquina)) {
    falha(`Saída cheia (${CAPACIDADE_SAIDA} caixas). Recolha com R ou ligue uma esteira.`);
    return;
  }
  if (getDinheiro() < CUSTO_PRODUCAO) {
    falha(`Sem dinheiro para papelão (R$ ${CUSTO_PRODUCAO}).`);
    return;
  }
  if (fabricar(maquina, produtoAtual())) musica.tocar('caixa');
  if (!maquina.quebrada) mensagem(maquina.saida.at(-1)?.defeito ? 'Caixa produzida, mas saiu com defeito.' : 'Caixa produzida.');
}

// Leva a saída da máquina mais próxima para o estoque, separado da produção.
function recolherSaida() {
  const maquina = maquinaProxima(jogador.position, maquinas);
  if (!maquina) {
    mensagem('Chegue perto de uma máquina para recolher.');
    return;
  }
  if (maquina.saida.length === 0) {
    mensagem('A saída desta máquina está vazia.');
    return;
  }
  const levadas = maquina.saida.splice(0);
  for (const { malha, produto, defeito } of levadas) {
    cena.remove(malha);
    guardarNoEstoque(produto, 1, defeito ? 1 : 0);
  }
  atualizarPlacar();
  mensagem(`${levadas.length} caixa(s) levada(s) ao estoque.`);
}

// Recebe um valor na expedição e avisa se a campanha acabou de ser vencida.
function registrarVenda(valor, texto) {
  const jaVencida = venceu();
  receber(valor);
  rotulos.flutuar({ x: EXPEDICAO.x, y: 2.2, z: EXPEDICAO.z }, `+${reais(valor)}`);
  musica.tocar('venda');
  vibrar(0.2, 0.6, 180);
  atualizarPlacar();
  mensagem(
    !jaVencida && venceu()
      ? `${texto} Meta de R$ ${META_VENDAS} atingida: campanha vencida!`
      : texto,
  );
}

// Na expedição: carrega na van o contrato pronto. O pagamento acontece na chegada.
function venderNaExpedicao() {
  const p = jogador.position;
  if (Math.hypot(p.x - EXPEDICAO.x, p.z - EXPEDICAO.z) > 2.2) {
    mensagem('Leve o estoque à expedição (laranja) para carregar a van.');
    return;
  }
  const prontos = quadro.ativos.some((c) => quantidadeDe(c.chave) >= c.quantidade);
  if (prontos) {
    const { viagem, erro } = despachar(quadro, { quantidade: quantidadeDe, retirar }, frota);
    if (erro) { falha(erro); return; }
    const rota = ROTAS[viagem.rota];
    musica.tocar('contrato');
    mensagem('Van despachada para ' + rota.nome + ' · ' + rota.distancia + ' km · trânsito ' + viagem.transito + '.');
    atualizarPlacar(); mostrarContratos();
    return;
  }
  const valor = venderTudo(chavesReservadas(quadro));
  if (valor === 0) {
    mensagem(totalNoEstoque() > 0 ? 'O estoque está reservado para contratos ainda incompletos.' : 'Nada no estoque para vender.');
    return;
  }
  registrarVenda(valor, 'Venda avulsa: R$ ' + valor + '.');
}

function atualizarPainelFrota() {
  if (!elFrota) return;
  const viagem = frota.viagens[0];
  if (!viagem) {
    elFrota.textContent = 'Van na doca · pronta para carregar';
    elMapaRota?.classList.remove('ativa');
    van.visible = true; van.position.set(EXPEDICAO.x, 0, 9.4);
    return;
  }
  const rota = ROTAS[viagem.rota];
  const acao = viagem.fase === 'ida' ? 'indo para' : 'voltando de';
  elFrota.textContent = 'Van ' + acao + ' ' + rota.nome + ' · trânsito ' + viagem.transito + ' · ' + tempo(viagem.restante);
  elMapaRota?.classList.add('ativa');
  if (elVeiculoMapa) elVeiculoMapa.style.left = (8 + viagem.progresso * 82) + '%';
  van.visible = viagem.progresso < 0.35;
  van.position.z = 9.4 + viagem.progresso * 18;
}

function avancarEntregas(dt) {
  const eventos = atualizarEntregas(frota, quadro, dt);
  for (const c of eventos.chegadas) {
    registrarVenda(c.recebido, c.devolvidas
      ? 'Entrega chegou, mas ' + c.devolvidas + ' caixa(s) voltaram: R$ ' + c.recebido + '. Reputação ' + quadro.reputacao + '.'
      : 'Entrega chegou a ' + ROTAS[c.rota].nome + ': R$ ' + c.recebido + '. Reputação ' + quadro.reputacao + '.');
  }
  for (const { contrato, multa } of eventos.vencidos) {
    const cobrado = cobrarMulta(multa);
    mensagem('A van atrasou a entrega de ' + nomeCliente(contrato.cliente) + ': multa de R$ ' + cobrado + '.');
  }
  if (eventos.retornos.length) mensagem('A van voltou à doca e está pronta para outra entrega.');
  if (eventos.chegadas.length || eventos.vencidos.length || eventos.retornos.length) { mostrarContratos(); atualizarPlacar(); }
  atualizarPainelFrota();
}
// ===== Contratos =====

let quadro = novoQuadro();

function tempo(segundos) {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function nomeProduto(chave) {
  return produtoPorChave(chave)?.nome ?? chave;
}

// Desenha o painel de contratos: reputação, ofertas (teclas 1 a 3) e contratos em andamento.
function mostrarContratos() {
  elReputacao.textContent = `${quadro.reputacao} · ${nivel(quadro.reputacao)}`;
  elOfertas.replaceChildren(
    ...quadro.ofertas.map((o, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<kbd>${i + 1}</kbd> <b></b><span></span><small></small>`;
      li.dataset.comando = `Digit${i + 1}`;
      li.title = 'Clique para aceitar';
      li.querySelector('b').textContent = nomeCliente(o.cliente);
      li.querySelector('span').textContent = `${o.quantidade}× ${nomeProduto(o.chave)} · R$ ${o.pagamento}`;
      li.querySelector('small').textContent = `Prazo ${tempo(o.prazo)} · oferta some em ${tempo(o.validade)}`;
      return li;
    }),
  );
  if (quadro.ofertas.length === 0) elOfertas.innerHTML = '<li class="vazio">Aguardando clientes…</li>';
  elAtivos.replaceChildren(
    ...quadro.ativos.map((c) => {
      const li = document.createElement('li');
      const tem = Math.min(quantidadeDe(c.chave), c.quantidade);
      li.className = c.restante < 20 ? 'urgente' : tem >= c.quantidade ? 'pronto' : '';
      li.innerHTML = '<b></b><span></span><small></small>';
      li.querySelector('b').textContent = nomeCliente(c.cliente);
      li.querySelector('span').textContent = `${tem}/${c.quantidade} ${nomeProduto(c.chave)} · R$ ${c.pagamento}`;
      li.querySelector('small').textContent =
        tem >= c.quantidade ? `Pronto: carregue na van (V) · ${tempo(c.restante)}` : `Faltam ${tempo(c.restante)}`;
      return li;
    }),
  );
  if (quadro.ativos.length === 0) elAtivos.innerHTML = `<li class="vazio">Nenhum. Aceite até ${MAX_ATIVOS} ofertas.</li>`;
  elHistorico.textContent = `${quadro.cumpridos} cumprido(s) · ${quadro.vencidos} vencido(s)`;
}

function aceitarOferta(posicao) {
  const { contrato, erro } = aceitar(quadro, posicao);
  if (erro) {
    falha(erro);
    return;
  }
  musica.tocar('contrato');
  mensagem(`Contrato aceito: ${contrato.quantidade}× ${nomeProduto(contrato.chave)} para ${nomeCliente(contrato.cliente)}.`);
  mostrarContratos();
}

let cronometroPainel = 0;
function avancarContratos(dt) {
  const eventos = atualizarContratos(quadro, dt, produtoPorChave);
  if (eventos.novas.length) musica.tocar('cliente');
  if (eventos.novas.length) mensagem(`Novo cliente: ${nomeCliente(eventos.novas[0].cliente)} quer um contrato.`);
  for (const { contrato, multa } of eventos.vencidos) {
    const cobrado = cobrarMulta(multa);
    mensagem(`Prazo vencido (${nomeCliente(contrato.cliente)}): multa de R$ ${cobrado}, reputação ${quadro.reputacao}.`);
  }
  cronometroPainel += dt;
  if (cronometroPainel >= 0.25 || eventos.novas.length || eventos.expiradas.length || eventos.vencidos.length) {
    cronometroPainel = 0;
    mostrarContratos();
    if (eventos.vencidos.length) atualizarPlacar();
  }
}

// Troca um campo do catálogo (tamanho, cor ou material) e mostra a nova escolha.
function trocarCatalogo(campo, rotulo) {
  ciclar(campo);
  atualizarPlacar();
  mensagem(`${rotulo}: ${produtoAtual().nome}`);
}

const teclasDeAcao = {
  KeyB: posicionarMaquina,
  KeyE: produzirCaixa,
  KeyR: recolherSaida,
  KeyV: venderNaExpedicao,
  KeyF: contratarFuncionario,
  KeyG: melhorarPropriedade,
  KeyL: ligarEsteira,
  KeyU: automatizarMaquina,
  KeyK: manutencao,
  KeyO: alternarSom,
  KeyI: inspecionar,
  KeyN: novoJogo,
  KeyQ: () => cameraJogo.girar(-1),
  KeyZ: () => cameraJogo.girar(1),
  Equal: () => cameraJogo.zoom(1 / 1.15),
  NumpadAdd: () => cameraJogo.zoom(1 / 1.15),
  Minus: () => cameraJogo.zoom(1.15),
  NumpadSubtract: () => cameraJogo.zoom(1.15),
  KeyH: () => elAjuda.classList.toggle('aberta'),
  Digit1: () => aceitarOferta(0),
  Digit2: () => aceitarOferta(1),
  Digit3: () => aceitarOferta(2),
  Numpad1: () => aceitarOferta(0),
  Numpad2: () => aceitarOferta(1),
  Numpad3: () => aceitarOferta(2),
  KeyT: () => trocarCatalogo('tamanho', 'Tamanho'),
  KeyC: () => trocarCatalogo('cor', 'Cor'),
  KeyM: () => trocarCatalogo('material', 'Material'),
};

// Som: tecla O ou botão na barra. O primeiro gesto do jogador libera o áudio no navegador.
function alternarSom() {
  musica.desbloquear();
  const ligado = musica.alternar();
  mostrarBotaoSom();
  mensagem(ligado ? 'Som ligado.' : 'Som desligado.');
}
function mostrarBotaoSom() {
  elBotaoSom.textContent = musica.ligado ? 'Som ligado' : 'Som desligado';
  elBotaoSom.setAttribute('aria-pressed', String(musica.ligado));
}
elBotaoSom.addEventListener('click', (e) => {
  e.stopPropagation();
  alternarSom();
  elBotaoSom.blur();
});
mostrarBotaoSom();
window.addEventListener('pointerdown', () => musica.desbloquear());
document.addEventListener('visibilitychange', () => musica.pausar(document.visibilityState === 'hidden'));

// Tela inicial: o primeiro clique em Jogar libera som e teclado (necessário dentro do portal).
const elInicio = document.getElementById('inicio');
const elBotaoJogar = document.getElementById('botao-jogar');
function comecar() {
  if (elInicio.hidden) return;
  elInicio.hidden = true;
  musica.desbloquear();
  window.focus();
  renderer.domElement.focus?.();
}
elBotaoJogar.addEventListener('click', comecar);
elBotaoJogar.focus();

// ===== Entrada: teclado, mouse e controle (v0.6.2) =====
// Todas as formas de jogar passam por executarComando, com o mesmo código de tecla.

const elMenu = document.getElementById('menu-comandos');
const botoesMenu = [...elMenu.querySelectorAll('.menu-lista button')];
let selecaoMenu = 0;

function abrirMenu() {
  elPainelCodigo.hidden = true;
  elMenu.querySelector('.menu-caixa').classList.remove('com-codigo');
  document.getElementById('menu-som').textContent = musica.ligado ? 'Desligar o som' : 'Ligar o som';
  document.getElementById('menu-novo').textContent = 'Novo jogo (apaga o progresso)';
  elMenu.hidden = false;
  teclas.clear();
  selecionarMenu(0);
}
function fecharMenu() {
  elMenu.hidden = true;
  renderer.domElement.focus?.();
}
function selecionarMenu(i) {
  selecaoMenu = (i + botoesMenu.length) % botoesMenu.length;
  botoesMenu.forEach((b, k) => b.classList.toggle('selecionado', k === selecaoMenu));
  if (!usandoControle) botoesMenu[selecaoMenu].focus();
}

// Código do progresso (v0.6.3): copiar a partida como texto ou carregar uma colada.
const elPainelCodigo = document.getElementById('painel-codigo');
const elCampoCodigo = document.getElementById('campo-codigo');
const elAvisoCodigo = document.getElementById('aviso-codigo');
function mostrarPainelCodigo(texto, aviso) {
  elPainelCodigo.hidden = false;
  elMenu.querySelector('.menu-caixa').classList.add('com-codigo');
  elCampoCodigo.value = texto;
  elAvisoCodigo.textContent = aviso;
  elCampoCodigo.focus();
  if (texto) elCampoCodigo.select();
}
function copiarCodigo() {
  const codigo = codigoDoSave(montarSaveAtual());
  mostrarPainelCodigo(codigo, 'Guarde este código. Para continuar em outro navegador, abra o menu e use “Carregar progresso de um código”.');
  navigator.clipboard?.writeText(codigo).then(
    () => (elAvisoCodigo.textContent = 'Código copiado. ' + elAvisoCodigo.textContent),
    () => {},
  );
}
function carregarCodigo() {
  const save = lerCodigo(elCampoCodigo.value, { capacidade: CAPACIDADE_SAIDA, maxFuncionarios: LIMITE_FUNCIONARIOS });
  if (!save) {
    elAvisoCodigo.textContent = 'Código inválido. Confira se copiou o texto inteiro, começando por II2-.';
    return;
  }
  salvarAoSair = false;
  clearInterval(timerSalvamento);
  gravar(save, undefined, { backup: true });
  location.reload();
}

const comandosEspeciais = {
  CopiarCodigo: copiarCodigo,
  CarregarCodigo: () => {
    mostrarPainelCodigo('', 'Cole o código do progresso abaixo e clique em Carregar. A partida atual será substituída.');
  },
  ConfirmarCodigo: carregarCodigo,
  FecharCodigo: () => {
    elPainelCodigo.hidden = true;
    elMenu.querySelector('.menu-caixa').classList.remove('com-codigo');
  },
  Menu: () => (elMenu.hidden ? abrirMenu() : fecharMenu()),
  Fechar: fecharMenu,
  NovoJogo: () => {
    document.getElementById('menu-novo').textContent = 'Confirme: apagar tudo e recomeçar';
    novoJogo();
  },
};

function executarComando(codigo) {
  if (!elInicio.hidden) return;
  musica.desbloquear();
  const especial = comandosEspeciais[codigo];
  if (especial) {
    especial();
    return;
  }
  // Comandos do menu fecham o menu antes de agir (exceto alternar controles e som, que ficam visíveis).
  if (!elMenu.hidden && !['KeyH', 'KeyO'].includes(codigo)) fecharMenu();
  teclasDeAcao[codigo]?.();
  if (!elMenu.hidden && codigo === 'KeyO') document.getElementById('menu-som').textContent = musica.ligado ? 'Desligar o som' : 'Ligar o som';
}

// Dicas na tela: mostra teclas ou botões do controle conforme o que foi usado por último.
let usandoControle = false;
function modoControle(ativo) {
  if (ativo === usandoControle) return;
  usandoControle = ativo;
  document.body.classList.toggle('usando-controle', ativo);
}

window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('textarea, input')) return; // digitando o código do progresso
  modoControle(false);
  if (!elInicio.hidden) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      comecar();
    }
    return;
  }
  if (!elMenu.hidden) {
    if (e.code === 'Escape') fecharMenu();
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') selecionarMenu(selecaoMenu + 1);
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') selecionarMenu(selecaoMenu - 1);
    else return; // Enter e espaço ativam o botão focado normalmente.
    e.preventDefault();
    return;
  }
  musica.desbloquear();
  if (e.code === 'Escape') {
    abrirMenu();
    return;
  }
  teclas.add(e.code);
  if (e.repeat) return;
  teclasDeAcao[e.code]?.();
});
window.addEventListener('keyup', (e) => teclas.delete(e.code));
window.addEventListener('blur', () => teclas.clear());

// Mouse: qualquer botão com data-comando (barra de ações, catálogo, menu) e as ofertas de contrato.
// As ofertas são redesenhadas várias vezes por segundo, então reagem ao apertar do botão
// (um clique completo poderia cair entre dois redesenhos e se perder).
document.addEventListener('pointerdown', (e) => {
  const oferta = e.target.closest('#ofertas li[data-comando]');
  if (!oferta) return;
  e.preventDefault();
  modoControle(false);
  executarComando(oferta.dataset.comando);
});
document.addEventListener('click', (e) => {
  const alvo = e.target.closest('[data-comando]');
  if (!alvo || alvo.closest('#ofertas')) return;
  modoControle(false);
  executarComando(alvo.dataset.comando);
  alvo.blur(); // devolve as teclas ao jogo (espaço e Enter não repetem o botão)
});
window.addEventListener('mousemove', () => modoControle(false), { passive: true });

// Controle: lido a cada quadro. Devolve o analógico esquerdo para o movimento.
let botoesAnteriores = new Set();
function lerEntradaControle(dt) {
  const leitura = lerControle(primeiroControle(navigator.getGamepads?.() ?? []), botoesAnteriores);
  botoesAnteriores = leitura.apertados;
  if (!leitura.ativo) return { x: 0, y: 0 };
  modoControle(true);
  if (!elInicio.hidden) {
    if (leitura.novos.includes(0) || leitura.novos.includes(9)) comecar();
    return { x: 0, y: 0 };
  }
  if (!elMenu.hidden) {
    // No menu: direcional escolhe, A confirma, B ou Menu fecham.
    for (const i of leitura.novos) {
      if (i === 13) selecionarMenu(selecaoMenu + 1);
      else if (i === 12) selecionarMenu(selecaoMenu - 1);
      else if (i === 0) executarComando(botoesMenu[selecaoMenu].dataset.comando);
      else if (i === 1 || i === 9) fecharMenu();
    }
    return { x: 0, y: 0 };
  }
  for (const codigo of leitura.acoes) executarComando(codigo);
  if (leitura.camera.x) cameraJogo.girarContinuo(-leitura.camera.x * dt * 2.4);
  if (leitura.camera.y) cameraJogo.zoom(1 + leitura.camera.y * dt * 1.6);
  return leitura.mover;
}

// Vibração do controle em momentos marcantes (venda, quebra, erro), quando o controle suporta.
function vibrar(forte, fraco, duracao) {
  const g = primeiroControle(navigator.getGamepads?.() ?? []);
  if (!usandoControle || !g?.vibrationActuator) return;
  g.vibrationActuator.playEffect?.('dual-rumble', { duration: duracao, strongMagnitude: forte, weakMagnitude: fraco })?.catch?.(() => {});
}

function ajustarTamanho() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', ajustarTamanho);

// ===== Energia (v0.6) =====

const reaisCentavos = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let textoEnergia = '';

// Soma o consumo da linha, cobra a conta na virada do dia e paga a dívida assim que entra dinheiro.
function avancarEnergia(dt) {
  const cortada = energiaCortada(energia);
  const carga = { produzindo: 0, esteiras: 0, paradas: 0 };
  for (const m of maquinas) {
    if (m.quebrada) continue;
    if (!cortada && m.luz.userData.estado === 'produzindo') carga.produzindo += 1;
    else carga.paradas += 1;
    if (!cortada && m.esteira && (m.saida.length || m.transito?.length)) carga.esteiras += 1;
  }
  consumir(energia, carga, (dt * 24) / DURACAO_DIA, ambiente.hora());

  const virada = virarDia(energia, ambiente.dia(), cobrarMulta);
  if (virada && virada.fatura > 0) {
    mensagem(
      energiaCortada(energia)
        ? `Conta de luz de ${reaisCentavos(virada.fatura)} sem pagar: energia cortada até quitar a dívida.`
        : `Conta de luz do dia paga: ${reaisCentavos(virada.fatura)}.`,
    );
    atualizarPlacar();
  }
  if (energiaCortada(energia) && getDinheiro() > 0) {
    pagarDivida(energia, cobrarMulta);
    if (!energiaCortada(energia)) mensagem('Dívida de energia paga. A linha voltou a funcionar.');
    atualizarPlacar();
  }

  const t = tarifa(ambiente.hora());
  const texto = energiaCortada(energia)
    ? `CORTADA · dívida de ${reaisCentavos(energia.divida)}`
    : `${reaisCentavos(energia.contaDia)} hoje · tarifa ${t.nome}${t.fator !== 1 ? ` (×${String(t.fator).replace('.', ',')})` : ''}`;
  if (texto !== textoEnergia) {
    textoEnergia = texto;
    elEnergia.textContent = texto;
    elEnergia.className = energiaCortada(energia) ? 'alerta' : t.nome === 'pico' ? 'aviso' : '';
  }
}

// Efeito que só soa se a máquina estiver perto do jogador, mais baixo quanto mais longe.
function tocarPerto(nome, maquina, forca) {
  const d = Math.hypot(maquina.x - jogador.position.x, maquina.z - jogador.position.z);
  if (d < 9) musica.tocar(nome, forca * (1 - d / 9));
}

// A trilha acompanha a fábrica: mais camadas com mais máquinas automáticas produzindo, e arranjo noturno.
function atualizarMusica() {
  const produzindo = maquinas.filter((m) => m.luz.userData.estado === 'produzindo').length;
  musica.definirIntensidade(maquinas.length === 0 ? 0 : produzindo === 0 ? 1 : produzindo === 1 ? 2 : 3);
  musica.definirNoite(escuridao(ambiente.hora()) > 0.5);
}

// Partes só visuais: dia e noite, câmera, esteiras, máquinas, cursor, rótulos e relógio.
let textoRelogio = '';
function animarCena(dt) {
  ambiente.atualizar(dt);
  atualizarMusica();
  cameraJogo.atualizar(dt, jogador.position);
  animarEsteiras(dt);
  for (const m of maquinas) animarMaquina(m, dt, m.luz.userData.estado === 'produzindo');
  const f = jogador.userData.frente;
  const cx = Math.round(jogador.position.x + f.x * 1.5);
  const cz = Math.round(jogador.position.z + f.z * 1.5);
  if (Math.abs(cx) <= 11 && Math.abs(cz) <= 11) cursor.mostrar(cx, cz, cabeAqui(cx, cz));
  else cursor.esconder();
  rotulos.atualizar();
  const texto = ambiente.texto();
  if (texto !== textoRelogio) {
    textoRelogio = texto;
    elRelogio.textContent = texto;
  }
}

const relogio = new THREE.Timer();
// ===== Salvamento =====

function montarSaveAtual() {
  return montarSave({
    economia: exportarEconomia(),
    estoque: exportarEstoque(),
    escolha: exportarEscolha(),
    contratos: exportarQuadro(quadro),
    frota: exportarFrota(frota),
    construcao: exportarConstrucao(construcao),
    energia: exportarEnergia(energia),
    refugo,
    caixas,
    relogio: ambiente.exportar(),
    jogador: jogador.position,
    maquinas,
    funcionarios: funcionarios.map((f) => f.malha.position),
  });
}

// Salva no navegador. A cada minuto também atualiza a cópia de segurança (v0.6.3).
const elStatusSave = document.getElementById('status-save');
let salvamentos = 0;
let ultimoSalvamento = 0;
let salvamentoFalhou = false;
let persistenciaPedida = false;
function salvarJogo() {
  const ok = gravar(montarSaveAtual(), undefined, { backup: salvamentos % 12 === 0 });
  salvamentos += 1;
  if (ok) {
    ultimoSalvamento = performance.now();
    if (!persistenciaPedida) {
      // Pede ao navegador para não apagar os dados do jogo sozinho quando faltar espaço.
      persistenciaPedida = true;
      navigator.storage?.persist?.().catch(() => {});
    }
  } else if (!salvamentoFalhou) {
    mensagem('Este navegador não está deixando o jogo salvar. Use o código do progresso no menu (Esc) para guardar sua partida.');
  }
  salvamentoFalhou = !ok;
  mostrarStatusSave();
  return ok;
}

function mostrarStatusSave() {
  if (salvamentoFalhou) {
    elStatusSave.textContent = 'Não está salvando';
    elStatusSave.className = 'alerta';
    elStatusSave.title = 'O navegador está bloqueando o armazenamento (janela anônima ou dados do site bloqueados). Copie o código do progresso no menu.';
    return;
  }
  const s = Math.round((performance.now() - ultimoSalvamento) / 1000);
  elStatusSave.textContent = !ultimoSalvamento ? 'Salva sozinho' : s < 3 ? 'Salvo agora' : `Salvo há ${s} s`;
  elStatusSave.className = '';
  elStatusSave.title = 'O progresso é salvo neste navegador a cada 5 segundos.';
}
setInterval(mostrarStatusSave, 1000);

// Recria a oficina a partir do save: máquinas com saída, esteira e automação, funcionários e jogador.
function restaurarJogo() {
  const save = carregar(undefined, { capacidade: CAPACIDADE_SAIDA, maxFuncionarios: LIMITE_FUNCIONARIOS });
  if (!save) return false;
  importarEconomia(save.economia);
  importarEstoque(save.estoque, produtoPorChave);
  importarEscolha(save.escolha);
  quadro = importarQuadro(save.contratos, produtoPorChave);
  frota = importarFrota(save.frota);
  construcao = importarConstrucao(save.construcao);
  sincronizarConstrucaoVisual();
  caixas = save.caixas;
  ambiente.importar(save.relogio);
  energia = importarEnergia(save.energia);
  refugo = save.refugo;
  for (const dados of save.maquinas) {
    if (!cabeAqui(dados.x, dados.z)) continue;
    const maquina = criarMaquina(dados.x, dados.z);
    cena.add(maquina.malha);
    maquinas.push(maquina);
    rotularMaquina(maquina);
    registrarObstaculo(dados.x - 0.45, dados.x + 0.45, dados.z - 0.45, dados.z + 0.45);
    for (const { chave, defeito } of dados.saida) {
      const produto = produtoPorChave(chave);
      if (produto) cena.add(criarCaixa(maquina, produto, defeito));
    }
    maquina.desgaste = dados.desgaste;
    maquina.quebrada = dados.quebrada;
    if (dados.esteira) {
      maquina.esteira = criarEsteira(maquina, ESTOQUE_PONTO);
      cena.add(maquina.esteira);
    }
    const produto = dados.produto && produtoPorChave(dados.produto);
    if (dados.automatica && produto) {
      programar(maquina, produto);
      marcarAutomatica(maquina);
    }
    if (dados.inspecao && maquina.esteira) {
      maquina.inspecao = true;
      adicionarInspetor(maquina);
    }
  }
  for (const pos of save.funcionarios) {
    const f = criarFuncionario(pos.x, pos.z);
    cena.add(f.malha);
    funcionarios.push(f);
  }
  jogador.position.set(save.jogador.x, 0, save.jogador.z);
  return true;
}

// Novo jogo: apertar N duas vezes em 3 segundos apaga o save e recomeça.
let pedidoNovoJogo = 0;
function novoJogo() {
  const agora = performance.now();
  if (agora - pedidoNovoJogo > 3000) {
    pedidoNovoJogo = agora;
    mensagem('Aperte N de novo para apagar o progresso e recomeçar.');
    return;
  }
  salvarAoSair = false;
  clearInterval(timerSalvamento);
  apagar();
  location.reload();
}

let salvarAoSair = true;
const INTERVALO_SALVAMENTO = 5000; // ms
const timerSalvamento = setInterval(() => salvarAoSair && salvarJogo(), INTERVALO_SALVAMENTO);
window.addEventListener('pagehide', () => salvarAoSair && salvarJogo());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && salvarAoSair) salvarJogo();
});

if (!armazenamentoDisponivel()) {
  salvamentoFalhou = true;
  document.getElementById('inicio-save').textContent = 'Atenção: este navegador não está deixando o jogo salvar (janela anônima ou dados bloqueados). Use o código do progresso no menu para guardar a partida.';
  mostrarStatusSave();
}
if (restaurarJogo()) {
  elBotaoJogar.textContent = 'Continuar';
  document.getElementById('inicio-save').textContent = `Partida salva: ${ambiente.texto()} · ${reais(getDinheiro())} em caixa.`;
}

renderer.setAnimationLoop(() => {
  relogio.update();
  const dt = Math.min(relogio.getDelta(), 0.05);
  const analogico = lerEntradaControle(dt);
  atualizarJogador(jogador, teclas, dt, cameraJogo.giro, analogico);
  for (const f of funcionarios) atualizarFuncionario(f, dt, maquinas, acoesFuncionario);
  atualizarAutomacao(maquinas, dt, acoesLinha);
  avancarContratos(dt);
  avancarEntregas(dt);
  avancarEnergia(dt);
  atualizarLuzes();
  animarCena(dt);
  renderer.render(cena, camera);
});

atualizarPlacar();
mostrarContratos();

