// Céu, sol, neblina e ciclo de dia e noite. Um dia de jogo dura 6 minutos.
// À noite as janelas, letreiros, faróis e postes acendem (lista "noturnos" em materiais.js).
import * as THREE from 'three';
import { noturnos } from './materiais.js';

export const DURACAO_DIA = 360; // segundos de jogo por dia
const HORA_INICIAL = 7;

const CEU = {
  dia: new THREE.Color('#bfe0ea'),
  tarde: new THREE.Color('#f0b98f'),
  noite: new THREE.Color('#16233a'),
};

const suave = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Escuridão de 0 (dia claro) a 1 (noite), pela hora.
export function escuridao(hora) {
  if (hora < 12) return 1 - suave(4.5, 7, hora);
  return suave(17.5, 19.5, hora);
}

export function criarAmbiente(cena, renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const ceu = new THREE.Color().copy(CEU.dia);
  cena.background = ceu;
  cena.fog = new THREE.Fog(ceu, 45, 120);

  const hemisferio = new THREE.HemisphereLight('#eaf6ff', '#7d8a6a', 1.1);
  cena.add(hemisferio);

  const sol = new THREE.DirectionalLight('#fff1d6', 2.4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.bias = -0.0008;
  sol.shadow.normalBias = 0.06;
  Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  cena.add(sol, sol.target);

  let tempo = (HORA_INICIAL / 24) * DURACAO_DIA; // segundos desde o início do dia 1
  const corSol = new THREE.Color();
  const corLua = new THREE.Color('#9fb5e0');
  const corPoente = new THREE.Color('#ffb070');
  const corDia = new THREE.Color('#fff1d6');

  function aplicar() {
    const h = hora();
    const e = escuridao(h);
    // Sol percorre o céu das 6h às 18h; à noite a luz vem da lua, fraca e azulada.
    const angulo = ((h - 6) / 12) * Math.PI;
    const alto = Math.sin(angulo);
    if (alto > 0.05) {
      sol.position.set(Math.cos(angulo) * 40, 10 + alto * 35, 18);
      const poente = 1 - suave(0.1, 0.5, alto);
      corSol.copy(corDia).lerp(corPoente, poente);
      sol.color.copy(corSol);
      sol.intensity = 2.4 * (1 - e * 0.85);
    } else {
      sol.position.set(-20, 40, -10);
      sol.color.copy(corLua);
      sol.intensity = 0.45;
    }
    hemisferio.intensity = 1.1 - 0.75 * e;
    const tarde = Math.max(0, 1 - Math.abs(h - 18) / 1.5) + Math.max(0, 1 - Math.abs(h - 6) / 1.2);
    ceu.copy(CEU.dia).lerp(CEU.tarde, Math.min(1, tarde) * 0.6).lerp(CEU.noite, e);
    cena.fog.color.copy(ceu);
    renderer.toneMappingExposure = 1.05 + 0.25 * e;
    for (const item of noturnos) item(e);
  }

  function hora() {
    return ((tempo / DURACAO_DIA) * 24) % 24;
  }

  aplicar();
  let acumulado = 0;
  return {
    sol,
    atualizar(dt) {
      tempo += dt;
      acumulado += dt;
      if (acumulado > 0.1) {
        acumulado = 0;
        aplicar();
      }
    },
    hora,
    dia: () => Math.floor(tempo / DURACAO_DIA) + 1,
    texto() {
      const h = hora();
      const hh = String(Math.floor(h)).padStart(2, '0');
      const mm = String(Math.floor((h % 1) * 6) * 10).padStart(2, '0');
      return `Dia ${Math.floor(tempo / DURACAO_DIA) + 1} · ${hh}:${mm}`;
    },
    exportar: () => tempo,
    importar(t) {
      if (Number.isFinite(t) && t > 0) tempo = t; // saves antigos (sem relógio) começam às 7h
      aplicar();
    },
  };
}
