// Salvamento versionado no navegador (localStorage). Só dados: não importa o Three.js.
// Cada versão nova do formato ganha uma entrada em MIGRACOES, para saves antigos continuarem abrindo.

export const CHAVE_SAVE = 'imperio-industrial-2:save';
export const CHAVE_BACKUP = 'imperio-industrial-2:save:backup'; // cópia de segurança (v0.6.3)
const PREFIXO_CODIGO = 'II2-';
export const VERSAO_SAVE = 5;

// MIGRACOES[n] converte um save da versão n para n + 1.
const MIGRACOES = {
  // v1 → v2 (contratos): o pedido genérico some; os pedidos cumpridos viram contratos cumpridos
  // e dão um pouco de reputação, para quem já jogava não começar do zero.
  1(save) {
    const cumpridos = Math.max(0, Math.floor(Number(save.economia?.pedidosCumpridos) || 0));
    const { pedido, pedidosCumpridos, ...economia } = save.economia ?? {};
    return {
      ...save,
      versao: 2,
      economia,
      contratos: { reputacao: Math.min(100, 20 + cumpridos * 5), cumpridos },
    };
  },
  // v2 → v3 (qualidade e energia): máquinas começam sem desgaste, estoque sem defeitos e conta de luz zerada.
  2(save) {
    return { ...save, versao: 3, refugo: 0, energia: null };
  },
  // v3 → v4 (veículos): começa com uma van livre na doca.
  3(save) {
    return { ...save, versao: 4, frota: null };
  },
  // v4 → v5 (construção avançada): partidas antigas começam na oficina original.
  4(save) {
    return { ...save, versao: 5, construcao: { nivel: 0 } };
  },
};

const numero = (v, padrao = 0) => (Number.isFinite(v) ? v : padrao);
const dentro = (v, limite) => Math.max(-limite, Math.min(limite, numero(v)));

// Monta o objeto salvo a partir das partes do jogo.
export function montarSave({ economia, estoque, escolha, contratos, energia = null, frota = null, construcao = null, servicos = null, campanha = 0, nivelEstoque = 0, refugo = 0, maquinas, funcionarios, jogador, caixas, relogio = 0 }) {
  return {
    versao: VERSAO_SAVE,
    salvoEm: new Date().toISOString(),
    economia,
    estoque,
    escolha,
    contratos,
    energia,
    frota,
    construcao,
    campanha,
    nivelEstoque,
    servicos,
    refugo,
    caixas,
    relogio,
    jogador: { x: jogador.x, z: jogador.z },
    // Caixas em trânsito na esteira voltam para a saída: assim nenhuma se perde ao recarregar.
    maquinas: maquinas.map((m) => ({
      x: m.x,
      tipo: m.tipo === 'prensa' ? 'prensa' : 'bancada',
      z: m.z,
      // Caixa com defeito ganha um * no fim da chave (ex.: "M-1-0*").
      saida: [...m.saida, ...(m.transito ?? [])].map((item) => item.produto.chave + (item.defeito ? '*' : '')),
      esteira: !!m.esteira,
      automatica: !!m.automatica,
      inspecao: !!m.inspecao,
      desgaste: m.desgaste ?? 0,
      quebrada: !!m.quebrada,
      produto: m.produto?.chave ?? null,
    })),
    funcionarios: funcionarios.map((f) => ({ x: f.x, z: f.z })),
  };
}

// Lê e valida um save. Devolve null se o texto não for um save utilizável.
export function lerSave(texto, { limite = 11.5, capacidade = 8, maxFuncionarios = 10 } = {}) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!dados || typeof dados !== 'object' || !Number.isInteger(dados.versao)) return null;
  if (dados.versao > VERSAO_SAVE) return null; // save de uma versão mais nova do jogo
  while (dados.versao < VERSAO_SAVE) {
    const migrar = MIGRACOES[dados.versao];
    if (!migrar) return null;
    dados = migrar(dados);
  }

  const lista = (v) => (Array.isArray(v) ? v : []);
  const nivelConstrucao = Math.max(0, Math.min(3, Math.floor(numero(dados.construcao?.nivel))));
  const dentroX = (v) => Math.max(-limite, Math.min(nivelConstrucao >= 1 ? 19.5 : limite, numero(v)));
  const vistas = new Set();
  const maquinas = [];
  for (const m of lista(dados.maquinas)) {
    if (!m || typeof m !== 'object') continue;
    const x = Math.round(dentroX(m.x));
    const z = Math.round(dentro(m.z, limite));
    if (vistas.has(`${x},${z}`)) continue; // duas máquinas na mesma célula
    vistas.add(`${x},${z}`);
    maquinas.push({
      tipo: m.tipo === 'prensa' ? 'prensa' : 'bancada',
      x,
      z,
      saida: lista(m.saida)
        .filter((c) => typeof c === 'string')
        .slice(0, Math.max(capacidade, dados.nivelEstoque >= 2 ? 32 : dados.nivelEstoque >= 1 ? 16 : 8))
        .map((c) => ({ chave: c.replace(/\*$/, ''), defeito: c.endsWith('*') })),
      esteira: !!m.esteira,
      automatica: !!m.automatica,
      inspecao: !!m.inspecao,
      desgaste: Math.max(0, Math.min(100, numero(m.desgaste))),
      quebrada: !!m.quebrada,
      produto: typeof m.produto === 'string' ? m.produto : null,
    });
  }

  return {
    versao: dados.versao,
    economia: dados.economia ?? {},
    estoque: lista(dados.estoque).filter((e) => Array.isArray(e) && typeof e[0] === 'string'),
    escolha: dados.escolha ?? {},
    contratos: dados.contratos ?? null,
    energia: dados.energia ?? null,
    frota: dados.frota ?? null,
    construcao: { nivel: nivelConstrucao },
    campanha: Math.max(0, Math.min(8, Math.floor(numero(dados.campanha)))),
    nivelEstoque: Math.max(0, Math.min(2, Math.floor(numero(dados.nivelEstoque)))),
    servicos: dados.servicos && typeof dados.servicos === 'object' ? dados.servicos : null,
    refugo: Math.max(0, Math.floor(numero(dados.refugo))),
    caixas: Math.max(0, Math.floor(numero(dados.caixas))),
    relogio: Math.max(0, numero(dados.relogio)), // segundos de jogo desde o início do dia 1
    jogador: { x: dentroX(dados.jogador?.x), z: dentro(dados.jogador?.z ?? 4, limite) },
    maquinas,
    funcionarios: lista(dados.funcionarios)
      .slice(0, Math.min(maxFuncionarios, nivelConstrucao >= 2 ? 10 : nivelConstrucao >= 1 ? 6 : 3))
      .map((f) => ({ x: dentroX(f?.x), z: dentro(f?.z, limite) })),
  };
}

// Acesso ao armazenamento do navegador. Falhas (modo privado, armazenamento bloqueado) não quebram o jogo.
// Em alguns navegadores só ler window.localStorage já lança erro, por isso o acesso fica dentro de try.
function padrao(armazenamento) {
  if (armazenamento) return armazenamento;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// Cada gravação também atualiza a cópia de segurança quando backup = true.
export function gravar(save, armazenamento, { backup = false } = {}) {
  try {
    armazenamento = padrao(armazenamento);
    const texto = JSON.stringify(save);
    armazenamento.setItem(CHAVE_SAVE, texto);
    if (backup) armazenamento.setItem(CHAVE_BACKUP, texto);
    return true;
  } catch {
    return false;
  }
}

// Lê o save principal; se ele faltar ou estiver estragado, tenta a cópia de segurança.
export function carregar(armazenamento, opcoes) {
  armazenamento = padrao(armazenamento);
  if (!armazenamento) return null;
  for (const chave of [CHAVE_SAVE, CHAVE_BACKUP]) {
    try {
      const texto = armazenamento.getItem(chave);
      const save = texto ? lerSave(texto, opcoes) : null;
      if (save) return save;
    } catch {
      /* tenta a próxima */
    }
  }
  return null;
}

// Novo jogo: apaga o save e a cópia de segurança.
export function apagar(armazenamento) {
  armazenamento = padrao(armazenamento);
  if (!armazenamento) return;
  for (const chave of [CHAVE_SAVE, CHAVE_BACKUP]) {
    try {
      armazenamento.removeItem(chave);
    } catch {
      /* sem armazenamento: nada a apagar */
    }
  }
}

// Testa se o navegador deixa gravar (falha em alguns modos anônimos e com armazenamento bloqueado).
export function armazenamentoDisponivel(armazenamento) {
  try {
    armazenamento = padrao(armazenamento);
    const teste = 'imperio-industrial-2:teste';
    armazenamento.setItem(teste, '1');
    armazenamento.removeItem(teste);
    return true;
  } catch {
    return false;
  }
}

// Código do progresso: o save em texto, para guardar ou levar a outro navegador.
export function codigoDoSave(save) {
  const bytes = new TextEncoder().encode(JSON.stringify(save));
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return PREFIXO_CODIGO + btoa(binario);
}

// Lê um código colado pelo jogador. Devolve o save validado ou null.
export function lerCodigo(codigo, opcoes) {
  try {
    const limpo = String(codigo).replace(/\s+/g, '');
    if (!limpo.startsWith(PREFIXO_CODIGO)) return null;
    const binario = atob(limpo.slice(PREFIXO_CODIGO.length));
    const texto = new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
    return lerSave(texto, opcoes) ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

