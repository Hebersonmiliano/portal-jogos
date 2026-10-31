// =============================================================
// Entrada: teclado, mouse e controles de toque
// =============================================================
'use strict';

const Input = {
  keys: {},
  pressed: {},          // teclas apertadas neste quadro
  mouse: { x: 0, y: 0, down: false, clicked: false },
  joy: { x: 0, y: 0, active: false },
  touchBtn: {},         // botões de toque apertados neste quadro
  isTouch: false,

  init(canvas) {
    window.addEventListener('keydown', e => {
      Sfx.init();
      const k = e.key.toLowerCase();
      if (!this.keys[k] && !e._ui) this.pressed[k] = true;
      this.keys[k] = true;
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k) && !UI.anyOpen()) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });

    canvas.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.lastMove = performance.now(); });
    canvas.addEventListener('mousedown', e => {
      Sfx.init();
      this.mouse.x = e.clientX; this.mouse.y = e.clientY;
      if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    this.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (this.isTouch) this.initTouch();
  },

  initTouch() {
    document.body.classList.add('touch');
    const zone = document.getElementById('joyZone');
    const base = document.getElementById('joyBase');
    const knob = document.getElementById('joyKnob');
    let id = null, ox = 0, oy = 0;
    const R = 46;
    zone.addEventListener('touchstart', e => {
      Sfx.init();
      const t = e.changedTouches[0];
      id = t.identifier; ox = t.clientX; oy = t.clientY;
      base.style.left = (ox - 55) + 'px'; base.style.top = (oy - 55) + 'px';
      base.style.display = 'block';
      knob.style.transform = 'translate(0px,0px)';
      this.joy.active = true;
      e.preventDefault();
    }, { passive: false });
    zone.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        let dx = t.clientX - ox, dy = t.clientY - oy;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx = dx / d * R; dy = dy / d * R; }
        knob.style.transform = `translate(${dx}px,${dy}px)`;
        this.joy.x = Math.abs(dx) > 8 ? dx / R : 0;
        this.joy.y = Math.abs(dy) > 8 ? dy / R : 0;
      }
      e.preventDefault();
    }, { passive: false });
    const end = e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== id) continue;
        id = null; this.joy.x = 0; this.joy.y = 0; this.joy.active = false;
        base.style.display = 'none';
      }
    };
    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);

    document.querySelectorAll('[data-tbtn]').forEach(b => {
      const name = b.dataset.tbtn;
      b.addEventListener('touchstart', e => {
        Sfx.init();
        this.touchBtn[name] = true;
        this.keys['t_' + name] = true;
        b.classList.add('on');
        e.preventDefault();
      }, { passive: false });
      const up = () => { this.keys['t_' + name] = false; b.classList.remove('on'); };
      b.addEventListener('touchend', up);
      b.addEventListener('touchcancel', up);
    });
  },

  // Vetor de movimento normalizado
  move() {
    let x = 0, y = 0;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;
    if (this.keys['w'] || this.keys['arrowup']) y -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) y += 1;
    if (this.joy.active) { x = this.joy.x; y = this.joy.y; }
    const d = Math.hypot(x, y);
    if (d > 1) { x /= d; y /= d; }
    return { x, y };
  },

  hit(k) { return !!this.pressed[k]; },
  tb(name) { return !!this.touchBtn[name]; },
  held(name) { return !!this.keys['t_' + name]; },

  endFrame() {
    this.pressed = {};
    this.touchBtn = {};
    this.mouse.clicked = false;
  },
};
