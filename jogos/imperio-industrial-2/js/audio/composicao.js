// Partitura da trilha "Turno no Distrito" (v0.6.1). Só dados e funções puras: não toca nada.
// Ré menor, 100 BPM, compassos de 16 semicolcheias. Forma A A B A C B = 48 compassos (~1 min 55 s).

export const BPM = 100;
export const PASSOS_POR_COMPASSO = 16;
export const SWING = 0.12; // atraso das semicolcheias ímpares, em fração do passo

const NOMES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

// "A4" → 69 (MIDI).
export function midi(nome) {
  const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(nome);
  if (!m) throw new Error(`nota inválida: ${nome}`);
  return 12 * (Number(m[2]) + 1) + NOMES[m[1]];
}

export function frequencia(nota) {
  return 440 * 2 ** ((nota - 69) / 12);
}

// Acordes: vozes do piano e nota do baixo.
const ACORDES = {
  Bbmaj7: { vozes: ['D4', 'F4', 'A4', 'C5'], baixo: 'Bb1' },
  C6: { vozes: ['E4', 'G4', 'A4', 'D5'], baixo: 'C2' },
  Am7: { vozes: ['G3', 'C4', 'E4', 'A4'], baixo: 'A1' },
  Dm9: { vozes: ['F4', 'A4', 'C5', 'E5'], baixo: 'D2' },
  Gm9: { vozes: ['Bb3', 'D4', 'F4', 'A4'], baixo: 'G1' },
  C7: { vozes: ['E4', 'G4', 'Bb4', 'D5'], baixo: 'C2' },
  Fmaj7: { vozes: ['E4', 'A4', 'C5', 'G5'], baixo: 'F1' },
  A7: { vozes: ['C#4', 'G4', 'Bb4', 'E5'], baixo: 'A1' },
  Dm7: { vozes: ['F4', 'A4', 'C5', 'D5'], baixo: 'D2' },
  Gm7: { vozes: ['Bb3', 'D4', 'F4', 'G4'], baixo: 'G1' },
  A7sus: { vozes: ['D4', 'G4', 'A4', 'E5'], baixo: 'A1' },
};

// Cada seção: 8 compassos, um acorde a cada 2, e a melodia por compasso: [passo, nota, duração em passos].
const SECOES = {
  A: {
    acordes: ['Bbmaj7', 'C6', 'Am7', 'Dm9'],
    melodia: [
      [[0, 'F5', 3], [4, 'A5', 2], [6, 'G5', 2], [8, 'F5', 4], [12, 'D5', 2], [14, 'F5', 2]],
      [[0, 'E5', 6], [8, 'C5', 2], [10, 'D5', 2], [12, 'F5', 4]],
      [[0, 'G5', 3], [4, 'A5', 2], [6, 'C6', 2], [8, 'A5', 4], [12, 'G5', 2], [14, 'E5', 2]],
      [[0, 'G5', 8], [10, 'E5', 2], [12, 'D5', 2], [14, 'E5', 2]],
      [[0, 'C5', 3], [4, 'E5', 2], [6, 'G5', 2], [8, 'A5', 6], [14, 'G5', 2]],
      [[0, 'E5', 4], [4, 'D5', 2], [6, 'C5', 2], [8, 'D5', 8]],
      [[0, 'A5', 4], [4, 'F5', 2], [6, 'E5', 2], [8, 'D5', 3], [12, 'E5', 2], [14, 'F5', 2]],
      [[0, 'D5', 10]],
    ],
  },
  B: {
    acordes: ['Gm9', 'C7', 'Fmaj7', 'A7'],
    melodia: [
      [[0, 'D6', 2], [2, 'C6', 2], [4, 'Bb5', 2], [6, 'A5', 2], [8, 'G5', 4], [12, 'Bb5', 4]],
      [[0, 'A5', 4], [4, 'G5', 2], [6, 'F5', 2], [8, 'G5', 8]],
      [[0, 'E5', 2], [2, 'G5', 2], [4, 'Bb5', 4], [8, 'A5', 2], [10, 'G5', 2], [12, 'E5', 4]],
      [[0, 'C5', 4], [6, 'D5', 2], [8, 'E5', 4], [12, 'G5', 4]],
      [[0, 'A5', 6], [6, 'C6', 2], [8, 'E6', 4], [12, 'D6', 2], [14, 'C6', 2]],
      [[0, 'A5', 8], [8, 'G5', 4], [12, 'F5', 4]],
      [[0, 'E5', 4], [4, 'C#5', 2], [6, 'E5', 2], [8, 'G5', 4], [12, 'A5', 2], [14, 'Bb5', 2]],
      [[0, 'A5', 8], [10, 'E5', 2], [12, 'C#5', 4]],
    ],
  },
  C: {
    acordes: ['Dm7', 'Bbmaj7', 'Gm7', 'A7sus'],
    melodia: [
      [[0, 'A5', 2], [2, 'D6', 2], [6, 'C6', 2], [8, 'A5', 8]],
      [[4, 'F5', 2], [6, 'G5', 2], [8, 'A5', 4], [12, 'C6', 4]],
      [[0, 'D6', 6], [8, 'F6', 2], [10, 'E6', 2], [12, 'D6', 4]],
      [[0, 'A5', 12]],
      [[0, 'Bb5', 2], [2, 'D6', 2], [4, 'F6', 4], [8, 'E6', 2], [10, 'D6', 2], [12, 'Bb5', 4]],
      [[0, 'C6', 8], [8, 'A5', 8]],
      [[0, 'D6', 4], [4, 'E6', 4], [8, 'D6', 2], [10, 'C#6', 6]],
      [[0, 'E5', 2], [2, 'G5', 2], [4, 'A5', 2], [6, 'C#6', 2], [8, 'E6', 8]],
    ],
  },
};

// Na seção C o último acorde resolve em A7 no compasso final, para voltar à seção B.
const TROCAS = { 'C:7': 'A7' };

export const FORMA = ['A', 'A', 'B', 'A', 'C', 'B'];
export const TOTAL_COMPASSOS = FORMA.length * 8;

// Levadas de bateria por compasso: passos de cada peça. Dia com groove completo; noite em meio tempo.
export const BATERIA = {
  dia: { bumbo: [0, 7, 8, 10], caixa: [4, 12], chimbal: [0, 2, 4, 6, 8, 10, 12], aberto: [14], fantasma: [15] },
  noite: { bumbo: [0, 10], caixa: [8], chimbal: [0, 4, 8, 12], aberto: [], fantasma: [] },
};

// Ritmo do piano: dia em ataques curtos; noite com o acorde segurado.
export const PIANO = {
  dia: [[0, 3], [6, 2], [10, 2], [14, 2]],
  noite: [[0, 14]],
};

// Linha de baixo relativa à fundamental: [passo, semitons acima, duração].
export const BAIXO = [[0, 0, 3], [3, 0, 1], [6, 12, 2], [8, 0, 2], [11, 7, 2], [14, 10, 2]];

// Devolve tudo que toca num compasso da forma (0..47): seção, acorde e notas da melodia em MIDI.
export function compasso(indice) {
  const i = ((indice % TOTAL_COMPASSOS) + TOTAL_COMPASSOS) % TOTAL_COMPASSOS;
  const letra = FORMA[Math.floor(i / 8)];
  const local = i % 8;
  const secao = SECOES[letra];
  const nomeAcorde = TROCAS[`${letra}:${local}`] ?? secao.acordes[Math.floor(local / 2)];
  const acorde = ACORDES[nomeAcorde];
  return {
    secao: letra,
    local,
    acorde: nomeAcorde,
    vozes: acorde.vozes.map(midi),
    baixo: midi(acorde.baixo),
    melodia: secao.melodia[local].map(([passo, nota, dur]) => ({ passo, nota: midi(nota), dur })),
  };
}

// Duração de uma semicolcheia em segundos.
export const DURACAO_PASSO = 60 / BPM / 4;
