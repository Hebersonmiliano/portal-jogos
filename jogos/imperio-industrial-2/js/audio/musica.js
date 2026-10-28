// Motor da trilha sonora (v0.6.1): toca a partitura de composicao.js com instrumentos sintetizados
// pela Web Audio API, sem arquivos de som. Camadas entram conforme a fábrica cresce, e à noite
// o arranjo fica mais suave. Também toca os efeitos sonoros do jogo.
import {
  BAIXO, BATERIA, DURACAO_PASSO, PASSOS_POR_COMPASSO, PIANO, SWING, TOTAL_COMPASSOS, compasso, frequencia,
} from './composicao.js';

const ANTECEDENCIA = 0.15; // segundos agendados à frente
const CHAVE_PREFERENCIA = 'imperio-industrial-2:som';

// Camadas e a intensidade mínima em que cada uma entra.
// 0: oficina parada (piano e pad) · 1: baixo e chimbal · 2: bateria completa · 3: melodia.
const CAMADAS = { pad: 0, piano: 0, baixo: 1, chimbal: 1, bateria: 2, melodia: 3 };
const VOLUMES = { pad: 0.16, piano: 0.22, baixo: 0.34, chimbal: 0.12, bateria: 0.42, melodia: 0.2 };

function lerPreferencia() {
  try {
    return localStorage.getItem(CHAVE_PREFERENCIA) !== 'desligado';
  } catch {
    return true;
  }
}

function gravarPreferencia(ligado) {
  try {
    localStorage.setItem(CHAVE_PREFERENCIA, ligado ? 'ligado' : 'desligado');
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

export function criarMusica() {
  const Contexto = globalThis.AudioContext || globalThis.webkitAudioContext;
  const estado = {
    ligado: lerPreferencia(),
    intensidade: 0,
    noite: false,
    ctx: null,
    passo: 0, // passo global desde o início
    proximo: 0, // tempo do próximo passo
    timer: null,
  };
  let saida, mestre, filtroNoite, envioReverb, envioEco, efeitos, camadas, ruido;

  // Monta a mesa de som: camadas → filtro da noite → mestre (com compressor), mais reverb e eco.
  function montar() {
    if (estado.ctx || !Contexto) return !!estado.ctx;
    const ctx = new Contexto();
    estado.ctx = ctx;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 3.5;
    saida = ctx.createGain();
    saida.gain.value = estado.ligado ? 0.8 : 0;
    saida.connect(compressor).connect(ctx.destination);

    mestre = ctx.createGain();
    mestre.gain.value = 0.9;
    filtroNoite = ctx.createBiquadFilter();
    filtroNoite.type = 'lowpass';
    filtroNoite.frequency.value = 18000;
    filtroNoite.Q.value = 0.4;
    mestre.connect(filtroNoite).connect(saida);

    // Reverb: resposta ao impulso feita de ruído que decai (2,4 s), em estéreo.
    const reverb = ctx.createConvolver();
    const dur = 2.4;
    const ir = ctx.createBuffer(2, ctx.sampleRate * dur, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    }
    reverb.buffer = ir;
    envioReverb = ctx.createGain();
    envioReverb.gain.value = 0.32;
    envioReverb.connect(reverb).connect(filtroNoite);

    // Eco em colcheia pontuada, com realimentação filtrada.
    const eco = ctx.createDelay(1);
    eco.delayTime.value = DURACAO_PASSO * 3;
    const realimentacao = ctx.createGain();
    realimentacao.gain.value = 0.32;
    const tom = ctx.createBiquadFilter();
    tom.type = 'lowpass';
    tom.frequency.value = 2800;
    eco.connect(tom).connect(realimentacao).connect(eco);
    envioEco = ctx.createGain();
    envioEco.gain.value = 0.22;
    envioEco.connect(eco);
    tom.connect(filtroNoite);

    camadas = {};
    for (const nome of Object.keys(CAMADAS)) {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(mestre);
      camadas[nome] = g;
    }
    efeitos = ctx.createGain();
    efeitos.gain.value = 0.55;
    efeitos.connect(saida);

    // Ruído branco reaproveitado pela bateria e pelos efeitos.
    ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const r = ruido.getChannelData(0);
    for (let i = 0; i < r.length; i++) r[i] = Math.random() * 2 - 1;

    aplicarCamadas(0);
    return true;
  }

  // ===== Instrumentos =====

  function env(g, t, ataque, pico, queda, fim) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(pico, t + ataque);
    g.gain.setTargetAtTime(0.0001, t + ataque + queda, fim);
  }

  function pan(destino, valor) {
    const p = estado.ctx.createStereoPanner();
    p.pan.value = valor;
    p.connect(destino);
    return p;
  }

  // Piano elétrico: fundamental + harmônico com sino curto e trêmolo leve.
  function piano(nota, t, dur, vel, destino) {
    const ctx = estado.ctx;
    const g = ctx.createGain();
    env(g, t, 0.006, vel, 0.05, dur * 0.45 + 0.1);
    const lado = pan(destino, ((nota % 7) - 3) * 0.08);
    g.connect(lado);
    g.connect(envioReverb);
    const trem = ctx.createOscillator();
    const tremG = ctx.createGain();
    trem.frequency.value = 5;
    tremG.gain.value = vel * 0.15;
    trem.connect(tremG).connect(g.gain);
    const f = frequencia(nota);
    for (const [mult, ganho, tipo] of [[1, 1, 'sine'], [2, 0.35, 'sine'], [7, 0.06, 'sine']]) {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = tipo;
      o.frequency.value = f * mult;
      og.gain.value = ganho;
      if (mult === 7) og.gain.setTargetAtTime(0, t, 0.03);
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 1.5);
    }
    trem.start(t);
    trem.stop(t + dur + 1.5);
  }

  // Pad: dois serrotes desafinados num filtro que abre devagar.
  function pad(nota, t, dur, destino) {
    const ctx = estado.ctx;
    const g = ctx.createGain();
    env(g, t, 0.9, 0.09, dur - 0.5, 0.6);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(400, t);
    filtro.frequency.linearRampToValueAtTime(1400, t + dur * 0.6);
    filtro.connect(g);
    g.connect(destino);
    g.connect(envioReverb);
    for (const desvio of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = frequencia(nota);
      o.detune.value = desvio;
      o.connect(filtro);
      o.start(t);
      o.stop(t + dur + 2);
    }
  }

  // Baixo: serrote filtrado com ataque marcado.
  function baixo(nota, t, dur, destino) {
    const ctx = estado.ctx;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = frequencia(nota);
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = frequencia(nota);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.Q.value = 6;
    filtro.frequency.setValueAtTime(900, t);
    filtro.frequency.setTargetAtTime(220, t, 0.08);
    const g = ctx.createGain();
    env(g, t, 0.005, 0.6, dur * 0.7, 0.05);
    o.connect(filtro);
    sub.connect(filtro);
    filtro.connect(g).connect(destino);
    for (const x of [o, sub]) {
      x.start(t);
      x.stop(t + dur + 0.4);
    }
  }

  // Melodia: de dia, onda quadrada suave com vibrato; à noite, sino.
  function melodia(nota, t, dur, destino) {
    const ctx = estado.ctx;
    const g = ctx.createGain();
    const lado = pan(destino, 0.12);
    g.connect(lado);
    g.connect(envioEco);
    g.connect(envioReverb);
    const f = frequencia(nota);
    if (estado.noite) {
      env(g, t, 0.004, 0.32, 0.02, 0.45);
      for (const [mult, ganho] of [[1, 1], [2.76, 0.25], [5.4, 0.08]]) {
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.frequency.value = f * mult;
        og.gain.value = ganho;
        o.connect(og).connect(g);
        o.start(t);
        o.stop(t + 2.5);
      }
      return;
    }
    env(g, t, 0.02, 0.18, dur * 0.8, 0.08);
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = f;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 2400;
    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();
    vib.frequency.value = 5.5;
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(f * 0.006, t + 0.25);
    vib.connect(vibG).connect(o.frequency);
    o.connect(filtro).connect(g);
    for (const x of [o, vib]) {
      x.start(t);
      x.stop(t + dur + 0.6);
    }
  }

  function bumbo(t, destino) {
    const ctx = estado.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    env(g, t, 0.002, 1, 0.04, 0.09);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + 0.5);
  }

  function ruidoFiltrado(t, destino, { tipo, freq, q = 1, dur, volume }) {
    const ctx = estado.ctx;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.value = freq;
    filtro.Q.value = q;
    const g = ctx.createGain();
    env(g, t, 0.001, volume, 0.005, dur);
    fonte.connect(filtro).connect(g).connect(destino);
    fonte.start(t, Math.random() * 0.5);
    fonte.stop(t + dur * 6 + 0.05);
    return g;
  }

  function caixa(t, destino, volume = 0.7) {
    const g = ruidoFiltrado(t, destino, { tipo: 'bandpass', freq: 1900, q: 0.8, dur: 0.06, volume });
    g.connect(envioReverb);
    const o = estado.ctx.createOscillator();
    const og = estado.ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 190;
    env(og, t, 0.001, volume * 0.5, 0.01, 0.04);
    o.connect(og).connect(destino);
    o.start(t);
    o.stop(t + 0.3);
  }

  function chimbal(t, destino, aberto = false, volume = 0.5) {
    ruidoFiltrado(t, pan(destino, -0.25), { tipo: 'highpass', freq: 7500, dur: aberto ? 0.12 : 0.025, volume });
  }

  // ===== Sequenciador =====

  function agendarPasso(passoGlobal, t) {
    const noCompasso = passoGlobal % PASSOS_POR_COMPASSO;
    const indice = Math.floor(passoGlobal / PASSOS_POR_COMPASSO) % TOTAL_COMPASSOS;
    const c = compasso(indice);
    const periodo = estado.noite ? 'noite' : 'dia';
    const tempoPasso = DURACAO_PASSO;

    // Pad: um acorde por compasso.
    if (noCompasso === 0) for (const v of c.vozes) pad(v - 12, t, tempoPasso * 16, camadas.pad);
    // Piano.
    for (const [p, d] of PIANO[periodo]) {
      if (p !== noCompasso) continue;
      c.vozes.forEach((v, i) => piano(v, t + i * 0.008, d * tempoPasso, p === 0 ? 0.16 : 0.12, camadas.piano));
    }
    // Baixo (à noite só nas notas principais).
    for (const [p, semitons, d] of BAIXO) {
      if (p !== noCompasso || (estado.noite && ![0, 8].includes(p))) continue;
      baixo(c.baixo + semitons, t, d * tempoPasso, camadas.baixo);
    }
    // Bateria.
    const lev = BATERIA[periodo];
    if (lev.chimbal.includes(noCompasso)) chimbal(t, camadas.chimbal, false, noCompasso % 4 === 2 ? 0.55 : 0.35);
    if (lev.aberto.includes(noCompasso)) chimbal(t, camadas.chimbal, true, 0.4);
    if (lev.bumbo.includes(noCompasso)) bumbo(t, camadas.bateria);
    if (lev.caixa.includes(noCompasso)) caixa(t, camadas.bateria, estado.noite ? 0.4 : 0.7);
    if (lev.fantasma.includes(noCompasso)) caixa(t, camadas.bateria, 0.15);
    // Melodia.
    for (const n of c.melodia) if (n.passo === noCompasso) melodia(n.nota, t, n.dur * tempoPasso, camadas.melodia);
  }

  function agendar() {
    const ctx = estado.ctx;
    while (estado.proximo < ctx.currentTime + ANTECEDENCIA) {
      const impar = estado.passo % 2 === 1;
      agendarPasso(estado.passo, estado.proximo + (impar ? SWING * DURACAO_PASSO : 0));
      estado.passo += 1;
      estado.proximo += DURACAO_PASSO;
    }
  }

  function aplicarCamadas(transicao = 2) {
    if (!estado.ctx) return;
    const t = estado.ctx.currentTime;
    for (const [nome, minimo] of Object.entries(CAMADAS)) {
      const alvo = estado.intensidade >= minimo ? VOLUMES[nome] * (estado.noite && nome === 'bateria' ? 0.7 : 1) : 0;
      camadas[nome].gain.cancelScheduledValues(t);
      camadas[nome].gain.setTargetAtTime(alvo, t, transicao / 3 || 0.01);
    }
    filtroNoite.frequency.setTargetAtTime(estado.noite ? 2200 : 18000, t, 1.5);
  }

  function iniciarSequenciador() {
    if (estado.timer || !estado.ctx) return;
    estado.proximo = estado.ctx.currentTime + 0.1;
    estado.timer = setInterval(agendar, 25);
  }

  // ===== Efeitos sonoros =====

  function nota(freq, t, dur, { tipo = 'sine', volume = 0.3, destino = efeitos } = {}) {
    const ctx = estado.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo;
    o.frequency.value = freq;
    env(g, t, 0.003, volume, 0.02, dur);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + dur * 6 + 0.1);
    return o;
  }

  const EFEITOS = {
    // Prensa fechando: batida grave com estalo metálico.
    caixa(t, forca = 1) {
      const o = nota(150, t, 0.06, { volume: 0.5 * forca });
      o.frequency.exponentialRampToValueAtTime(60, t + 0.1);
      ruidoFiltrado(t, efeitos, { tipo: 'bandpass', freq: 3200, q: 3, dur: 0.02, volume: 0.25 * forca });
    },
    // Caixa registradora: dois sinos e o tilintar das moedas.
    venda(t) {
      nota(1568, t, 0.25, { volume: 0.22 });
      nota(2093, t + 0.09, 0.4, { volume: 0.22 });
      for (let i = 0; i < 4; i++) ruidoFiltrado(t + 0.05 + i * 0.04, efeitos, { tipo: 'bandpass', freq: 6000 + i * 700, q: 8, dur: 0.03, volume: 0.15 });
    },
    // Contrato aceito: arpejo ascendente de ré maior.
    contrato(t) {
      [587, 740, 880, 1175].forEach((f, i) => nota(f, t + i * 0.07, 0.25, { tipo: 'triangle', volume: 0.2 }));
    },
    // Compra de equipamento: moeda.
    compra(t) {
      nota(988, t, 0.06, { tipo: 'square', volume: 0.08 });
      nota(1319, t + 0.07, 0.25, { tipo: 'square', volume: 0.08 });
    },
    // Máquina colocada no chão.
    maquina(t) {
      const o = nota(90, t, 0.12, { volume: 0.5 });
      o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
      ruidoFiltrado(t, efeitos, { tipo: 'lowpass', freq: 800, dur: 0.08, volume: 0.3 });
    },
    // Quebra: estalo metálico e chiado.
    quebra(t) {
      for (const f of [233, 247, 311]) nota(f, t, 0.3, { tipo: 'sawtooth', volume: 0.1 });
      ruidoFiltrado(t, efeitos, { tipo: 'bandpass', freq: 2500, q: 2, dur: 0.25, volume: 0.35 });
    },
    // Manutenção: catraca de chave.
    manutencao(t) {
      for (let i = 0; i < 5; i++) ruidoFiltrado(t + i * 0.06, efeitos, { tipo: 'bandpass', freq: 4200, q: 6, dur: 0.012, volume: 0.3 });
      nota(1047, t + 0.35, 0.2, { tipo: 'triangle', volume: 0.15 });
    },
    // Erro: dois bipes graves.
    erro(t) {
      nota(196, t, 0.07, { tipo: 'square', volume: 0.07 });
      nota(165, t + 0.1, 0.1, { tipo: 'square', volume: 0.07 });
    },
    // Novo cliente com oferta.
    cliente(t) {
      nota(880, t, 0.15, { tipo: 'triangle', volume: 0.12 });
      nota(1320, t + 0.12, 0.2, { tipo: 'triangle', volume: 0.12 });
    },
  };

  return {
    // Chamado no primeiro clique ou tecla: o navegador só libera o áudio depois de um gesto.
    desbloquear() {
      if (!montar()) return;
      if (estado.ctx.state === 'suspended') estado.ctx.resume().catch(() => {});
      iniciarSequenciador();
    },
    get ligado() {
      return estado.ligado;
    },
    alternar() {
      estado.ligado = !estado.ligado;
      gravarPreferencia(estado.ligado);
      if (estado.ctx) saida.gain.setTargetAtTime(estado.ligado ? 0.8 : 0, estado.ctx.currentTime, 0.15);
      return estado.ligado;
    },
    // Intensidade de 0 a 3, conforme a fábrica (máquinas automáticas produzindo).
    definirIntensidade(n) {
      const nova = Math.max(0, Math.min(3, n));
      if (nova === estado.intensidade) return;
      estado.intensidade = nova;
      aplicarCamadas();
    },
    definirNoite(noite) {
      if (noite === estado.noite) return;
      estado.noite = noite;
      aplicarCamadas(4);
    },
    // Pausa a música quando a aba fica escondida.
    pausar(pausado) {
      if (!estado.ctx) return;
      if (pausado) estado.ctx.suspend().catch(() => {});
      else estado.ctx.resume().catch(() => {});
    },
    tocar(nome, forca) {
      if (!estado.ctx || !estado.ligado || !EFEITOS[nome]) return;
      try {
        EFEITOS[nome](estado.ctx.currentTime + 0.01, forca);
      } catch {
        /* navegador sem áudio */
      }
    },
  };
}
