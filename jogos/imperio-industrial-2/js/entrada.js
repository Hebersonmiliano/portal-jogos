// Controle (v0.6.2): lê um gamepad com o mapeamento padrão (Xbox, PlayStation e similares)
// e traduz em movimento, câmera e as mesmas ações do teclado. Só regras: não importa o Three.js.

export const ZONA_MORTA = 0.18; // analógicos abaixo disso contam como parados
export const LIMIAR_GATILHO = 0.5; // LT e RT contam como apertados a partir daqui

// Botões do mapeamento padrão → tecla equivalente (as ações reaproveitam o teclado).
export const BOTOES = {
  0: 'KeyE', // A: produzir
  1: 'KeyR', // B: levar a saída ao estoque
  2: 'KeyV', // X: entregar ou vender na expedição
  3: 'KeyB', // Y: colocar máquina
  4: 'KeyK', // LB: manutenção ou conserto
  5: 'KeyI', // RB: inspecionar
  6: 'KeyU', // LT: automatizar ou reprogramar
  7: 'KeyL', // RT: esteira
  8: 'KeyH', // View/Back: mostrar controles
  9: 'Menu', // Menu/Start: menu de comandos
  12: 'KeyT', // direcional ↑: tamanho
  13: 'Digit1', // direcional ↓: aceitar a primeira oferta
  14: 'KeyC', // direcional ←: cor
  15: 'KeyM', // direcional →: material
};

// Nomes mostrados nas dicas da tela.
export const NOMES_BOTOES = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'View', 9: 'Menu', 12: '↑', 13: '↓', 14: '←', 15: '→' };

// Aplica a zona morta de forma radial e reescala para 0..1, para o movimento começar suave.
export function analogico(x, y, zona = ZONA_MORTA) {
  const tamanho = Math.hypot(x, y);
  if (tamanho < zona) return { x: 0, y: 0 };
  const escala = Math.min(1, (tamanho - zona) / (1 - zona)) / tamanho;
  return { x: x * escala, y: y * escala };
}

function apertado(botao, indice) {
  if (!botao) return false;
  if (indice === 6 || indice === 7) return (botao.value ?? (botao.pressed ? 1 : 0)) >= LIMIAR_GATILHO;
  return !!botao.pressed;
}

// Lê o controle num quadro. anterior: o que estava apertado no quadro passado (Set de índices).
// Devolve { mover: {x, y}, camera: {x, y}, acoes: [teclas apertadas agora], apertados, ativo }.
export function lerControle(gamepad, anterior = new Set()) {
  const vazio = { mover: { x: 0, y: 0 }, camera: { x: 0, y: 0 }, acoes: [], novos: [], apertados: new Set(), ativo: false };
  if (!gamepad || !gamepad.connected) return vazio;
  const eixos = gamepad.axes ?? [];
  const mover = analogico(eixos[0] ?? 0, eixos[1] ?? 0);
  const camera = analogico(eixos[2] ?? 0, eixos[3] ?? 0);
  const apertados = new Set();
  (gamepad.buttons ?? []).forEach((b, i) => {
    if (apertado(b, i)) apertados.add(i);
  });
  // Ação só no quadro em que o botão desce (não repete enquanto segura).
  const acoes = [...apertados].filter((i) => !anterior.has(i) && BOTOES[i]).map((i) => BOTOES[i]);
  const ativo = apertados.size > 0 || mover.x !== 0 || mover.y !== 0 || camera.x !== 0 || camera.y !== 0;
  const novos = [...apertados].filter((i) => !anterior.has(i));
  return { mover, camera, acoes, novos, apertados, ativo };
}

// Primeiro controle conectado na lista do navegador.
export function primeiroControle(lista) {
  return [...(lista ?? [])].find((g) => g && g.connected) ?? null;
}
