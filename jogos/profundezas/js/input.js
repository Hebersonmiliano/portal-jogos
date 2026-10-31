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

    this.initPad();
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
    if (this.pad.move && (Math.abs(this.pad.move.x) > 0 || Math.abs(this.pad.move.y) > 0)) { x = this.pad.move.x; y = this.pad.move.y; }
    const d = Math.hypot(x, y);
    if (d > 1) { x /= d; y /= d; }
    return { x, y };
  },

  hit(k) { return !!this.pressed[k]; },

  // ---------- Controle (Xbox, PlayStation e genéricos) ----------
  // Padrão "standard" da Gamepad API:
  // 0 A/✕  1 B/○  2 X/□  3 Y/△  4 LB  5 RB  6 LT  7 RT  8 View/Share  9 Menu/Options
  // 10 L3  11 R3  12-15 direcional (cima, baixo, esquerda, direita)
  pad: { connected: false, prev: [], move: null, aim: null, aimT: 0, navT: 0, navDir: null, name: '' },
  lastDevice: 'keyboard',

  initPad() {
    window.addEventListener('gamepadconnected', e => {
      this.pad.connected = true; this.pad.name = e.gamepad.id;
      this.lastDevice = 'pad';
      document.body.classList.add('pad');
      if (typeof UI !== 'undefined') UI.toast('Controle conectado!', '#4ade80');
    });
    window.addEventListener('gamepaddisconnected', () => {
      const any = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean);
      if (!any) { this.pad.connected = false; this.pad.move = null; this.keys['p_atk'] = false; UI.toast('Controle desconectado.', '#9ca3af'); }
    });
    window.addEventListener('keydown', () => { this.lastDevice = 'keyboard'; });
    window.addEventListener('mousedown', () => { this.lastDevice = 'keyboard'; });
    window.addEventListener('touchstart', () => { this.lastDevice = 'touch'; });
  },

  pollPad(dt) {
    if (!navigator.getGamepads) return;
    const gp = [...navigator.getGamepads()].find(g => g && g.connected);
    if (!gp) { this.pad.move = null; this.keys['p_atk'] = false; return; }
    const btn = i => { const b = gp.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
    const prev = this.pad.prev;
    const just = i => btn(i) && !prev[i];
    const dz = v => Math.abs(v) < 0.22 ? 0 : (v - Math.sign(v) * 0.22) / 0.78;
    const lx = dz(gp.axes[0] || 0), ly = dz(gp.axes[1] || 0);
    const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    let mx = lx + (btn(15) ? 1 : 0) - (btn(14) ? 1 : 0), my = ly + (btn(13) ? 1 : 0) - (btn(12) ? 1 : 0);
    const anyInput = gp.buttons.some((b, i) => btn(i)) || Math.abs(lx) + Math.abs(ly) > 0 || Math.hypot(rx, ry) > 0.4;
    if (anyInput) { this.lastDevice = 'pad'; Sfx.init(); }

    if (typeof UI !== 'undefined' && UI.anyOpen()) {
      // navegação nos menus
      this.pad.move = null; this.keys['p_atk'] = false;
      const dir = my < -0.5 ? 'ArrowUp' : my > 0.5 ? 'ArrowDown' : mx < -0.5 ? 'ArrowLeft' : mx > 0.5 ? 'ArrowRight' : null;
      if (dir) {
        this.pad.navT -= dt;
        if (dir !== this.pad.navDir || this.pad.navT <= 0) {
          this.pad.navT = dir !== this.pad.navDir ? 0.3 : 0.12;
          this.pad.navDir = dir;
          const focus = document.activeElement;
          if (!focus || focus === document.body) { const b = document.querySelector('#panel button:not([disabled])'); if (b) b.focus(); }
          else UI.handleKey({ key: dir, preventDefault() {} });
        }
      } else { this.pad.navDir = null; this.pad.navT = 0; }
      if (just(0)) {
        const el = document.activeElement;
        if (el && el.tagName === 'BUTTON' && document.getElementById('panel').contains(el)) el.click();
        else { const b = document.querySelector('#panel button:not([disabled])'); if (b) b.focus(); }
      }
      if (just(1) || just(9)) UI.handleKey({ key: 'Escape', preventDefault() {} });
      if (just(8) || just(11)) UI.handleKey({ key: 'Escape', preventDefault() {} });
      if (just(2)) UI.handleKey({ key: 'u', preventDefault() {} });
      if (just(3)) UI.handleKey({ key: 'x', preventDefault() {} });
      if (just(5)) UI.handleKey({ key: 'b', preventDefault() {} });
    } else {
      const len = Math.hypot(mx, my);
      if (len > 1) { mx /= len; my /= len; }
      this.pad.move = { x: mx, y: my };
      this.keys['p_atk'] = btn(0);
      const map = { 1: ' ', 2: 'e', 3: 'q', 6: 'f', 4: '1', 5: '2', 7: '3', 8: 'i', 9: 'escape', 10: 'r', 11: 'h' };
      for (const k in map) if (just(+k)) this.pressed[map[k]] = true;
      if (Math.hypot(rx, ry) > 0.4) { this.pad.aim = Math.atan2(ry, rx); this.pad.aimT = performance.now(); }
    }
    this.pad.prev = gp.buttons.map((b, i) => btn(i));
  },

  padAim() { return this.pad.aim !== null && performance.now() - this.pad.aimT < 400 ? this.pad.aim : null; },

  rumble(ms = 120, strong = 0.5) {
    if (!navigator.getGamepads) return;
    const gp = [...navigator.getGamepads()].find(g => g && g.connected);
    const act = gp && gp.vibrationActuator;
    if (act && act.playEffect) act.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: strong * 0.7 }).catch(() => {});
  },
  tb(name) { return !!this.touchBtn[name]; },
  held(name) { return !!this.keys['t_' + name]; },

  endFrame() {
    this.pressed = {};
    this.touchBtn = {};
    this.mouse.clicked = false;
  },
};
