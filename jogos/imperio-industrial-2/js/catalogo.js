// Catálogo de caixas: tamanho, cor e material. A escolha atual define o que a máquina produz.

export const TAMANHOS = [
  { id: 'P', nome: 'Pequena', escala: 0.75, valor: 6 },
  { id: 'M', nome: 'Média', escala: 1, valor: 10 },
  { id: 'G', nome: 'Grande', escala: 1.3, valor: 16 },
];

export const CORES = [
  { nome: 'Parda', hex: 0xc89b5a },
  { nome: 'Azul', hex: 0x4f7fb8 },
  { nome: 'Vermelha', hex: 0xc0453b },
];

export const MATERIAIS = [
  { nome: 'Papelão simples', altura: 1, multiplicador: 1 },
  { nome: 'Reforçado', altura: 1.4, multiplicador: 2 },
];

const escolha = { tamanho: 0, cor: 0, material: 0 };
const listas = { tamanho: TAMANHOS, cor: CORES, material: MATERIAIS };

// Avança para a próxima opção do campo ('tamanho', 'cor' ou 'material'), dando a volta no fim.
export function ciclar(campo) {
  escolha[campo] = (escolha[campo] + 1) % listas[campo].length;
}

// Salvamento: índices da escolha atual.
export function exportarEscolha() {
  return { ...escolha };
}

export function importarEscolha(e = {}) {
  for (const campo of Object.keys(listas)) {
    const i = e[campo];
    escolha[campo] = Number.isInteger(i) && i >= 0 && i < listas[campo].length ? i : 0;
  }
}

// Reconstrói um produto a partir da chave salva (ex.: "M-1-0"). Devolve null se a chave não existe.
export function produtoPorChave(chave) {
  const [id, cor, material] = String(chave).split('-');
  const t = TAMANHOS.findIndex((x) => x.id === id);
  const c = Number(cor);
  const m = Number(material);
  if (t < 0 || !CORES[c] || !MATERIAIS[m] || cor === '' || material === '') return null;
  return montarProduto(t, c, m);
}

// Produto definido pela escolha atual: chave para o estoque, nome para a tela e aparência para a malha.
export function produtoAtual() {
  return montarProduto(escolha.tamanho, escolha.cor, escolha.material);
}

function montarProduto(it, ic, im) {
  const t = TAMANHOS[it];
  const c = CORES[ic];
  const m = MATERIAIS[im];
  return {
    chave: `${t.id}-${ic}-${im}`,
    nome: `${t.nome} ${c.nome.toLowerCase()}, ${m.nome.toLowerCase()}`,
    escala: t.escala,
    altura: m.altura,
    cor: c.hex,
    valor: t.valor * m.multiplicador, // preço de venda na expedição, em R$
  };
}
