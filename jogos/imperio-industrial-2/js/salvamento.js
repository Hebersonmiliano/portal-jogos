// Salvamento versionado no navegador (localStorage). Só dados: não importa o Three.js.
// Cada versão nova do formato ganha uma entrada em MIGRACOES, para saves antigos continuarem abrindo.

export const CHAVE_SAVE = 'imperio-industrial-2:save';
export const VERSAO_SAVE = 3;

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
};

const numero = (v, padrao = 0) => (Number.isFinite(v) ? v : padrao);
const dentro = (v, limite) => Math.max(-limite, Math.min(limite, numero(v)));

// Monta o objeto salvo a partir das partes do jogo.
export function montarSave({ economia, estoque, escolha, contratos, energia = null, refugo = 0, maquinas, funcionarios, jogador, caixas, relogio = 0 }) {
  return {
    versao: VERSAO_SAVE,
    salvoEm: new Date().toISOString(),
    economia,
    estoque,
    escolha,
    contratos,
    energia,
    refugo,
    caixas,
    relogio,
    jogador: { x: jogador.x, z: jogador.z },
    // Caixas em trânsito na esteira voltam para a saída: assim nenhuma se perde ao recarregar.
    maquinas: maquinas.map((m) => ({
      x: m.x,
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
export function lerSave(texto, { limite = 11.5, capacidade = 8, maxFuncionarios = 3 } = {}) {
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
  const vistas = new Set();
  const maquinas = [];
  for (const m of lista(dados.maquinas)) {
    if (!m || typeof m !== 'object') continue;
    const x = Math.round(dentro(m.x, limite));
    const z = Math.round(dentro(m.z, limite));
    if (vistas.has(`${x},${z}`)) continue; // duas máquinas na mesma célula
    vistas.add(`${x},${z}`);
    maquinas.push({
      x,
      z,
      saida: lista(m.saida)
        .filter((c) => typeof c === 'string')
        .slice(0, capacidade)
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
    refugo: Math.max(0, Math.floor(numero(dados.refugo))),
    caixas: Math.max(0, Math.floor(numero(dados.caixas))),
    relogio: Math.max(0, numero(dados.relogio)), // segundos de jogo desde o início do dia 1
    jogador: { x: dentro(dados.jogador?.x, limite), z: dentro(dados.jogador?.z ?? 4, limite) },
    maquinas,
    funcionarios: lista(dados.funcionarios)
      .slice(0, maxFuncionarios)
      .map((f) => ({ x: dentro(f?.x, limite), z: dentro(f?.z, limite) })),
  };
}

// Acesso ao armazenamento do navegador. Falhas (modo privado, armazenamento bloqueado) não quebram o jogo.
export function gravar(save, armazenamento = globalThis.localStorage) {
  try {
    armazenamento.setItem(CHAVE_SAVE, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function carregar(armazenamento = globalThis.localStorage, opcoes) {
  try {
    const texto = armazenamento.getItem(CHAVE_SAVE);
    return texto ? lerSave(texto, opcoes) : null;
  } catch {
    return null;
  }
}

export function apagar(armazenamento = globalThis.localStorage) {
  try {
    armazenamento.removeItem(CHAVE_SAVE);
  } catch {
    /* sem armazenamento: nada a apagar */
  }
}
