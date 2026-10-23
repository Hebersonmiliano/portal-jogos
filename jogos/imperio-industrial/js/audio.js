'use strict';

const SONS = { pegar: [520, .06], soltar: [380, .07], caixa: [660, .12], venda: [880, .18], compra: [990, .15], erro: [150, .18], missao: [1175, .4] };
const motorAudio = { contexto: null, musica: null, autorizado: false, pendente: false, erro: false, escondido: false };
const limitarVolume = v => Number.isFinite(Number(v)) ? Math.max(0, Math.min(1, Number(v))) : .35;

function prepararAudio() {
  if (!motorAudio.musica && typeof Audio === 'function') {
    const musica = new Audio('audio/fabrica-loop.wav?v=2.3');
    musica.loop = true; musica.preload = 'none';
    musica.addEventListener('error', () => { motorAudio.erro = true; atualizarBotoesAudio(); });
    motorAudio.musica = musica;
  }
  if (!motorAudio.contexto) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (Contexto) motorAudio.contexto = new Contexto();
  }
}

// Deve ser chamado diretamente de um gesto: o navegador pode bloquear autoplay.
function ativarAudio() {
  try {
    prepararAudio();
    if (motorAudio.erro) { motorAudio.musica?.load(); motorAudio.erro = false; }
    motorAudio.autorizado = true;
    if (motorAudio.contexto?.state === 'suspended') motorAudio.contexto.resume().catch(() => {});
    atualizarAudio();
  } catch (_) { motorAudio.erro = true; }
  atualizarBotoesAudio();
}

function atualizarAudio() {
  const musica = motorAudio.musica;
  if (!musica) return;
  musica.volume = limitarVolume(E.volumeMusica) * (pausado ? .3 : 1);
  const deveTocar = motorAudio.autorizado && E.som && E.musica && musica.volume > 0 && !document.hidden;
  if (!deveTocar) { if (!musica.paused) musica.pause(); return; }
  if (musica.paused && !motorAudio.pendente && !motorAudio.erro) {
    motorAudio.pendente = true;
    try {
      Promise.resolve(musica.play()).then(() => { motorAudio.erro = false; }, () => {
        // Uma nova interação real tentará liberar o áudio novamente.
        motorAudio.autorizado = false;
      }).finally(() => { motorAudio.pendente = false; atualizarBotoesAudio(); });
    } catch (_) { motorAudio.pendente = false; motorAudio.autorizado = false; }
  }
}

function atualizarBotoesAudio() {
  const geral = $('btn-som'), musica = $('btn-musica'), efeitos = $('btn-efeitos'), ativar = $('btn-ativar-audio');
  if (geral) geral.textContent = `Áudio geral: ${E.som ? 'ligado' : 'desligado'}`;
  if (musica) musica.textContent = `Música: ${E.musica ? 'ligada' : 'desligada'}`;
  if (efeitos) efeitos.textContent = `Efeitos: ${E.efeitos ? 'ligados' : 'desligados'}`;
  if (ativar) {
    ativar.textContent = motorAudio.erro ? '♪ Tentar áudio novamente' : !motorAudio.autorizado ? '♪ Ativar áudio' : E.som && E.musica ? '♪ Música ligada' : '♪ Ligar música';
    ativar.setAttribute('aria-label', 'Ativar música e áudio do jogo');
  }
  for (const [id, campo] of [['volume-musica', 'volumeMusica'], ['volume-efeitos', 'volumeEfeitos']]) {
    if ($(id)) $(id).value = Math.round(limitarVolume(E[campo]) * 100);
  }
}

function tocar(nome) {
  if (!E.som || !E.efeitos || !SONS[nome] || !motorAudio.autorizado || document.hidden) return;
  try {
    const ctx = motorAudio.contexto;
    if (!ctx || ctx.state !== 'running') return;
    const [freq, dur] = SONS[nome], osc = ctx.createOscillator(), volume = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = freq;
    volume.gain.setValueAtTime(Math.max(.0001, .12 * limitarVolume(E.volumeEfeitos)), ctx.currentTime);
    volume.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + dur);
    osc.connect(volume); volume.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + dur);
    osc.onended = () => { osc.disconnect(); volume.disconnect(); };
  } catch (_) { /* Mantém a partida jogável em navegadores sem Web Audio. */ }
}

for (const evento of ['pointerdown', 'keydown']) {
  document.addEventListener(evento, ev => {
    if (ev.isTrusted && (!motorAudio.autorizado || motorAudio.contexto?.state === 'suspended')) {
      motorAudio.erro = false; ativarAudio();
    }
  }, { capture: true });
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    motorAudio.musica?.pause();
    if (motorAudio.contexto?.state === 'running') motorAudio.contexto.suspend().catch(() => {});
  } else if (motorAudio.autorizado) ativarAudio();
});
for (const [id, campo] of [['volume-musica', 'volumeMusica'], ['volume-efeitos', 'volumeEfeitos']]) {
  $(id)?.addEventListener('input', ev => {
    E[campo] = limitarVolume(Number(ev.target.value) / 100); ativarAudio(); salvar();
  });
}
