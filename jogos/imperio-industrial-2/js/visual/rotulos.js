// Rótulos em HTML que acompanham pontos do mundo 3D, e números que sobem ao vender ("+R$ 84").
import * as THREE from 'three';

export function criarRotulos(container, camera) {
  const lista = [];
  const v = new THREE.Vector3();

  function paraTela(pos) {
    v.set(pos.x, pos.y, pos.z).project(camera);
    return { x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight, atras: v.z > 1 };
  }

  return {
    // texto pode ser uma função; classe pode ser uma função que devolve a classe do momento.
    adicionar(pos, { texto, classe = '' }) {
      const el = document.createElement('div');
      el.className = 'rotulo';
      container.appendChild(el);
      const r = { el, pos, texto, classe, ultimo: null, ultimaClasse: null };
      lista.push(r);
      return r;
    },
    remover(r) {
      r.el.remove();
      lista.splice(lista.indexOf(r), 1);
    },
    flutuar(pos, texto, classe = 'ganho') {
      const el = document.createElement('div');
      el.className = `rotulo flutuante ${classe}`;
      el.textContent = texto;
      container.appendChild(el);
      const p = paraTela(pos);
      el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
      setTimeout(() => el.remove(), 1600);
    },
    atualizar() {
      for (const r of lista) {
        const texto = typeof r.texto === 'function' ? r.texto() : r.texto;
        const classe = typeof r.classe === 'function' ? r.classe() : r.classe;
        if (texto !== r.ultimo) {
          r.el.textContent = texto;
          r.ultimo = texto;
        }
        if (classe !== r.ultimaClasse) {
          r.el.className = `rotulo ${classe}`;
          r.ultimaClasse = classe;
        }
        const p = paraTela(r.pos);
        r.el.hidden = p.atras || !texto || p.y < 80; // atrás da câmera ou sob a barra superior
        r.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    },
  };
}
