// Expansão do terreno e melhorias do galpão (v0.8). Regras puras.
export const MELHORIAS = [
  { id: 'terreno', nome: 'Terreno vizinho', custo: 350 },
  { id: 'escritorio', nome: 'Escritório administrativo', custo: 180 },
  { id: 'fachada', nome: 'Fachada corporativa', custo: 120 },
];

export const novaConstrucao = () => ({ nivel: 0 });
export const proximaMelhoria = (estado) => MELHORIAS[estado.nivel] ?? null;

export function melhorar(estado, pagar) {
  const melhoria = proximaMelhoria(estado);
  if (!melhoria) return { erro: 'Todas as melhorias já foram construídas.' };
  if (!pagar(melhoria.custo)) return { erro: `${melhoria.nome} custa R$ ${melhoria.custo}.` };
  estado.nivel += 1;
  return { melhoria };
}

export const temTerreno = (estado) => estado.nivel >= 1;
export const temEscritorio = (estado) => estado.nivel >= 2;
export const temFachada = (estado) => estado.nivel >= 3;
export const exportarConstrucao = (estado) => ({ nivel: estado.nivel });
export const importarConstrucao = (d) => ({ nivel: Math.max(0, Math.min(MELHORIAS.length, Math.floor(Number(d?.nivel) || 0))) });

