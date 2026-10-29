// Câmera que acompanha o jogador, gira em volta dele e dá zoom.
// Arrastar com o mouse gira, a roda aproxima e afasta. Teclas: Q e Z giram 45°, + e - fazem zoom.
// No controle, o analógico direito gira (esquerda e direita) e aproxima ou afasta (cima e baixo).
const ZOOM_MIN = 10;
const ZOOM_MAX = 42;
const INCLINACAO_MIN = 0.45;
const INCLINACAO_MAX = 1.25;

export function criarCameraJogo(camera, elemento, alvoInicial) {
  const estado = {
    giro: Math.PI / 4, // ângulo em volta do jogador (0 = câmera ao sul, olhando para o norte)
    giroAlvo: Math.PI / 4,
    inclinacao: 0.82,
    distancia: 24,
    distanciaAlvo: 24,
    alvo: { x: alvoInicial.x, z: alvoInicial.z },
  };

  let arrastando = null;
  elemento.addEventListener('pointerdown', (e) => {
    if (e.button !== 2) return;
    arrastando = { x: e.clientX, y: e.clientY };
    elemento.setPointerCapture?.(e.pointerId);
  });
  elemento.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    estado.giroAlvo -= (e.clientX - arrastando.x) * 0.006;
    estado.inclinacao = Math.min(INCLINACAO_MAX, Math.max(INCLINACAO_MIN, estado.inclinacao + (e.clientY - arrastando.y) * 0.004));
    arrastando = { x: e.clientX, y: e.clientY };
  });
  const soltar = () => (arrastando = null);
  elemento.addEventListener('pointerup', soltar);
  elemento.addEventListener('pointercancel', soltar);
  elemento.addEventListener('contextmenu', (e) => e.preventDefault());
  elemento.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });

  function zoom(fator) {
    estado.distanciaAlvo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, estado.distanciaAlvo * fator));
  }

  return {
    girar(sentido) {
      estado.giroAlvo += sentido * (Math.PI / 4);
    },
    // Giro contínuo, usado pelo analógico direito do controle (radianos).
    girarContinuo(angulo) {
      estado.giroAlvo += angulo;
    },
    zoom,
    // Ângulo usado para converter WASD em direções relativas à câmera.
    get giro() {
      return estado.giro;
    },
    atualizar(dt, jogador) {
      const k = 1 - Math.exp(-dt * 6);
      estado.giro += (estado.giroAlvo - estado.giro) * k;
      estado.distancia += (estado.distanciaAlvo - estado.distancia) * k;
      estado.alvo.x += (jogador.x - estado.alvo.x) * (1 - Math.exp(-dt * 3));
      estado.alvo.z += (jogador.z - estado.alvo.z) * (1 - Math.exp(-dt * 3));
      const horizontal = Math.cos(estado.inclinacao) * estado.distancia;
      camera.position.set(
        estado.alvo.x + Math.sin(estado.giro) * horizontal,
        Math.sin(estado.inclinacao) * estado.distancia,
        estado.alvo.z + Math.cos(estado.giro) * horizontal,
      );
      camera.lookAt(estado.alvo.x, 0.6, estado.alvo.z);
    },
  };
}

