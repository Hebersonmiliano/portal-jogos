// =============================================================
// Interface em HTML: HUD, menus, mochila, avisos
// =============================================================
'use strict';

const UI = {
  open: false,
  onBack: null,
  invSel: { area: 'bag', i: 0 },
  invCtx: 'dungeon',
  _hudT: 0,

  $(id) { return document.getElementById(id); },
  anyOpen() { return this.open; },

  show(html, opts = {}) {
    const ov = this.$('overlay');
    const panel = this.$('panel');
    panel.className = 'panel ' + (opts.cls || '');
    panel.innerHTML = html;
    ov.classList.remove('hidden');
    ov.classList.toggle('full', !!opts.full);
    this.open = true;
    this.keyHook = null;
    this.onBack = opts.onBack || null;
    panel.querySelectorAll('[data-act]').forEach(b => {
      b.addEventListener('click', ev => {
        ev.stopPropagation();
        Sfx.init(); Sfx.click();
        const fn = opts.actions && opts.actions[b.dataset.act];
        if (fn) fn(b.dataset.arg, b);
      });
    });
    const f = panel.querySelector('[data-focus]') || panel.querySelector('button:not([disabled])');
    if (f && !Input.isTouch) f.focus({ preventScroll: true });
  },

  close() {
    this.$('overlay').classList.add('hidden');
    this.$('panel').innerHTML = '';
    this.open = false;
    this.onBack = null;
    this.keyHook = null;
  },

  back() { if (this.onBack) this.onBack(); },

  // Navegação por teclado dentro dos painéis
  handleKey(e) {
    if (!this.open) return;
    e._ui = true;
    const k = e.key;
    const panel = this.$('panel');
    if (k === 'Escape') { e.preventDefault(); this.back(); return; }
    if (this.keyHook && this.keyHook(e)) return;
    const btns = [...panel.querySelectorAll('button:not([disabled])')];
    if (!btns.length) return;
    const cur = document.activeElement;
    let idx = btns.indexOf(cur);
    const grid = cur && cur.dataset.grid !== undefined;
    let next = null;
    if (grid && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) {
      const cells = [...panel.querySelectorAll('[data-grid]')];
      const gi = cells.indexOf(cur);
      const cols = 6;
      let ni = gi;
      if (k === 'ArrowLeft') ni = gi - 1;
      if (k === 'ArrowRight') ni = gi + 1;
      if (k === 'ArrowUp') ni = gi - cols;
      if (k === 'ArrowDown') ni = gi + cols;
      if (ni >= 0 && ni < cells.length) next = cells[ni];
      else if (k === 'ArrowDown' || k === 'ArrowRight') next = btns[btns.indexOf(cells[cells.length - 1]) + 1] || null;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') next = btns[btns.indexOf(cells[0]) - 1] || null;
    } else if (k === 'ArrowDown' || k === 'ArrowRight') next = btns[(idx + 1) % btns.length];
    else if (k === 'ArrowUp' || k === 'ArrowLeft') next = btns[(idx - 1 + btns.length) % btns.length];
    if (next) { e.preventDefault(); next.focus(); if (next.dataset.grid !== undefined) next.dispatchEvent(new Event('focusSel')); }
  },

  // ---------- Menu genérico ----------
  menu(cfg) {
    const items = cfg.items.map((it, i) => `
      <button class="mitem" ${it.disabled ? 'disabled' : ''} data-act="m" data-arg="${i}" ${i === (cfg.focus || 0) ? 'data-focus' : ''}>
        ${it.icon ? `<img class="ico" src="${it.icon}">` : ''}
        <span class="ml" style="${it.color ? 'color:' + it.color : ''}">${it.label}${it.sub ? `<small>${it.sub}</small>` : ''}</span>
        ${it.right !== undefined ? `<span class="mr">${it.right}</span>` : ''}
      </button>`).join('');
    const html = `
      <h2>${cfg.title}</h2>
      ${cfg.text ? `<p class="mtext">${cfg.text}</p>` : ''}
      <div class="mlist">${items || '<p class="mtext">Nada aqui.</p>'}</div>
      ${cfg.back ? `<button class="mback" data-act="back">${cfg.backLabel || 'Voltar'}</button>` : ''}`;
    this.show(html, {
      cls: cfg.cls,
      onBack: cfg.back || null,
      actions: {
        m: i => { const it = cfg.items[+i]; if (it && !it.disabled && it.act) it.act(); },
        back: () => cfg.back && cfg.back(),
      },
    });
  },

  // ---------- Mochila e atributos ----------
  inventory(ctx) {
    this.invCtx = ctx;
    const p = G.p;
    const st = playerStats(p);
    const sel = this.invSel;
    if (sel.area === 'bag' && sel.i >= Math.max(1, p.bagSize)) sel.i = 0;
    const slotHtml = (item, area, i, label) => {
      const isSel = sel.area === area && sel.i === i;
      if (!item) return `<button class="slot empty ${isSel ? 'sel' : ''}" data-act="sel" data-arg="${area}:${i}" ${area === 'bag' ? 'data-grid' : ''}>${label ? `<i>${label}</i>` : ''}</button>`;
      return `<button class="slot ${isSel ? 'sel' : ''}" style="--rc:${RARITIES[item.rarity].color}" data-act="sel" data-arg="${area}:${i}" ${area === 'bag' ? 'data-grid' : ''} title="${item.name}">
        <img src="${itemIconURL(item)}">${item.qty > 1 ? `<b>${item.qty}</b>` : ''}${item.up ? `<b class="up">+${item.up}</b>` : ''}</button>`;
    };
    const eqSlots = ['weapon', 'armor', 'ring'];
    const eqLabels = { weapon: 'Arma', armor: 'Armadura', ring: 'Acessório' };
    let bagHtml = '';
    for (let i = 0; i < p.bagSize; i++) bagHtml += slotHtml(p.bag[i], 'bag', i);

    const selItem = sel.area === 'bag' ? p.bag[sel.i] : p.eq[eqSlots[sel.i]];
    let detail = '<p class="mtext">Selecione um item.</p>';
    let acts = '';
    if (selItem) {
      const lines = itemStatLines(selItem).map(l => `<li>${l}</li>`).join('');
      let cmp = '';
      if (sel.area === 'bag' && isEquip(selItem) && p.eq[selItem.kind]) {
        const cur = p.eq[selItem.kind];
        if (selItem.kind === 'weapon') {
          const a = selItem.dmg * (1 + 0.08 * (selItem.up || 0)), b = cur.dmg * (1 + 0.08 * (cur.up || 0));
          cmp = `<p class="cmp ${a >= b ? 'good' : 'bad'}">Dano ${a >= b ? '▲' : '▼'} ${(a - b).toFixed(1)} em relação à arma atual</p>`;
        } else if (selItem.kind === 'armor') {
          const a = selItem.def * (1 + 0.08 * (selItem.up || 0)), b = cur.def * (1 + 0.08 * (cur.up || 0));
          cmp = `<p class="cmp ${a >= b ? 'good' : 'bad'}">Defesa ${a >= b ? '▲' : '▼'} ${Math.round(a - b)} em relação à atual</p>`;
        }
      }
      detail = `<h3 style="color:${RARITIES[selItem.rarity].color}">${itemDisplayName(selItem)}</h3>
        <p class="rar">${isConsumable(selItem) ? 'Consumível' : RARITIES[selItem.rarity].name} · vale ${selItem.value * (selItem.qty || 1)} ouro</p>
        <ul class="stats">${lines}</ul>${cmp}`;
      if (sel.area === 'bag') {
        if (isEquip(selItem)) acts += `<button data-act="use" data-focus>Equipar</button>`;
        else if (isConsumable(selItem)) {
          const can = !(selItem.kind === 'scroll' && ctx !== 'dungeon');
          acts += `<button data-act="use" ${can ? '' : 'disabled'} data-focus>Usar</button>`;
        }
        acts += `<button data-act="drop" class="danger">${ctx === 'dungeon' ? 'Largar' : 'Descartar'}</button>`;
      } else {
        acts += `<button data-act="unequip" data-focus>Desequipar</button>`;
      }
    }

    const attr = (k, label, desc) => `<div class="attr"><span>${label} <b>${p[k]}</b></span><small>${desc}</small>
      ${p.points > 0 ? `<button class="plus" data-act="pt" data-arg="${k}">+</button>` : ''}</div>`;

    const html = `
      <div class="invhead"><h2>Mochila</h2><span class="gold">◆ ${p.gold} ouro</span><button class="x" data-act="close">✕</button></div>
      <div class="invgrid">
        <div class="col-left">
          <div class="eqrow">${eqSlots.map((s, i) => `<div class="eqc">${slotHtml(p.eq[s], 'eq', i, eqLabels[s])}<small>${eqLabels[s]}</small></div>`).join('')}</div>
          <div class="attrs">
            <p class="lvl">Nível ${p.level} · XP ${p.xp}/${xpNext(p.level)}${p.points > 0 ? ` · <span class="pts">${p.points} pontos!</span>` : ''}</p>
            ${attr('str', 'Força', 'dano')}
            ${attr('vit', 'Vitalidade', 'vida e fome')}
            ${attr('agi', 'Agilidade', 'velocidade e crítico')}
            ${attr('luck', 'Sorte', 'drops raros')}
            <p class="sum">Vida ${Math.ceil(p.hp)}/${st.maxHp} · Dano ${(st.weaponDmg * st.dmgMul).toFixed(1)} · Def ${Math.round(st.def)} · Crít ${Math.round(st.crit * 100)}%</p>
          </div>
        </div>
        <div class="col-right">
          <p class="bagtitle">Mochila ${p.bag.length}/${p.bagSize}</p>
          <div class="bag">${bagHtml}</div>
          <div class="detail">${detail}<div class="acts">${acts}</div></div>
        </div>
      </div>
      <p class="hint">${Input.isTouch ? 'Toque num item para ver detalhes.' : 'Setas: navegar · Enter: escolher · U: usar/equipar · X: largar · I ou Esc: fechar'}</p>`;

    const rerender = () => this.inventory(ctx);
    this.show(html, {
      cls: 'inv',
      onBack: () => { this.keyHook = null; this.close(); G.resumeFromMenu(); },
      actions: {
        close: () => { this.keyHook = null; this.close(); G.resumeFromMenu(); },
        sel: arg => {
          const [area, i] = arg.split(':');
          const same = sel.area === area && sel.i === +i;
          sel.area = area; sel.i = +i;
          if (same && !Input.isTouch) { this.invUse(); }
          rerender();
          const btn = document.querySelector(`[data-arg="${area}:${i}"]`);
          if (btn) btn.focus({ preventScroll: true });
        },
        use: () => { this.invUse(); if (G.state === 'dungeon' || ctx !== 'dungeon') rerender(); },
        drop: () => { this.invDrop(); rerender(); },
        unequip: () => { this.invUnequip(); rerender(); },
        pt: k => { if (p.points > 0) { p[k]++; p.points--; if (k === 'vit') p.hp += 10; } rerender(); },
      },
    });
    // foca no item selecionado
    const fb = document.querySelector(`[data-arg="${sel.area}:${sel.i}"]`);
    if (fb && !Input.isTouch) fb.focus({ preventScroll: true });
    // atalhos
    this.keyHook = e => {
      const k = e.key.toLowerCase();
      if (k === 'i' || k === 'tab') { e.preventDefault(); this.back(); return true; }
      if (k === 'u') { this.invUse(); if (G.state === 'dungeon' || ctx !== 'dungeon') rerender(); return true; }
      if (k === 'x') { this.invDrop(); rerender(); return true; }
      return false;
    };
    // seleção acompanha o foco das setas
    document.querySelectorAll('[data-grid]').forEach(b => b.addEventListener('focusSel', () => {
      const [area, i] = b.dataset.arg.split(':'); sel.area = area; sel.i = +i; rerender();
    }));
  },

  invUse() {
    const p = G.p, sel = this.invSel;
    if (sel.area !== 'bag') return;
    const it = p.bag[sel.i];
    if (!it) return;
    if (isEquip(it)) {
      const old = p.eq[it.kind];
      p.eq[it.kind] = it;
      if (old) p.bag[sel.i] = old; else p.bag.splice(sel.i, 1);
      const st = playerStats(p);
      p.hp = Math.min(p.hp, st.maxHp);
      Sfx.pickup();
    } else if (isConsumable(it)) {
      if (it.kind === 'scroll' && this.invCtx !== 'dungeon') return;
      useConsumable(it);
      if (it.qty <= 0) p.bag.splice(sel.i, 1);
    }
  },

  invDrop() {
    const p = G.p, sel = this.invSel;
    if (sel.area !== 'bag') return;
    const it = p.bag[sel.i];
    if (!it) return;
    p.bag.splice(sel.i, 1);
    if (this.invCtx === 'dungeon') G.drops.push(makeDrop(p.x + rr(-6, 6), p.y + 8, it, 1.2));
  },

  invUnequip() {
    const p = G.p, slot = ['weapon', 'armor', 'ring'][this.invSel.i];
    const it = p.eq[slot];
    if (!it) return;
    if (p.bag.length >= p.bagSize) { this.toast('Mochila cheia!', '#f87171'); return; }
    p.bag.push(it); p.eq[slot] = null;
    p.hp = Math.min(p.hp, playerStats(p).maxHp);
  },

  // ---------- Avisos ----------
  toast(msg, color = '#fff') {
    const box = this.$('toasts');
    const d = document.createElement('div');
    d.className = 'toast';
    d.style.color = color;
    d.textContent = msg;
    box.appendChild(d);
    while (box.children.length > 5) box.removeChild(box.firstChild);
    setTimeout(() => d.classList.add('fade'), 2600);
    setTimeout(() => d.remove(), 3300);
  },

  // ---------- HUD ----------
  updateHud(dt, force) {
    this._hudT -= dt;
    if (this._hudT > 0 && !force) return;
    this._hudT = 0.08;
    const p = G.p, st = playerStats(p);
    const set = (id, pct) => { this.$(id).style.width = clamp(pct, 0, 100) + '%'; };
    set('hpFill', p.hp / st.maxHp * 100);
    set('foodFill', p.hunger);
    set('tiredFill', p.fatigue);
    set('xpFill', p.xp / xpNext(p.level) * 100);
    this.$('hpTxt').textContent = `${Math.ceil(p.hp)}/${st.maxHp}`;
    this.$('foodTxt').textContent = Math.ceil(p.hunger);
    this.$('tiredTxt').textContent = Math.floor(p.fatigue);
    this.$('lvTxt').textContent = 'NV ' + p.level;
    this.$('xpTxt').textContent = p.points > 0 ? `+${p.points} pts` : '';
    this.$('tiredFill').classList.toggle('warn', p.fatigue >= 80);
    this.$('foodFill').classList.toggle('warn', p.hunger <= 20);
    this.$('hpFill').classList.toggle('warn', p.hp / st.maxHp < 0.3);
    if (G.level) {
      this.$('floorTxt').innerHTML = `ANDAR ${G.level.floor}<small>${G.level.biome.name}</small>${G.blessing ? `<small class="bless">${BLESSINGS[G.blessing].name}</small>` : ''}`;
    }
    this.$('goldTxt').textContent = `◆ ${p.gold}`;
    const count = k => p.bag.filter(i => i.kind === k).reduce((a, i) => a + i.qty, 0);
    this.$('qPotion').textContent = count('potion');
    this.$('qFood').textContent = count('food');
    this.$('qScroll').textContent = count('scroll');
    this.$('bagTxt').textContent = `${p.bag.length}/${p.bagSize}`;
    const b = G.boss;
    if (b && !b.dead) {
      this.$('bossBar').classList.remove('hidden');
      this.$('bossName').textContent = b.name;
      this.$('bossFill').style.width = (b.hp / b.maxHp * 100) + '%';
    } else this.$('bossBar').classList.add('hidden');
  },

  drawMinimap() {
    const c = this.$('minimap');
    const x = c.getContext('2d');
    const L = G.level;
    if (!L) return;
    const s = 2;
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = 'rgba(0,0,0,0.55)';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = 'rgba(200,190,170,0.55)';
    for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
      const i = ty * MAP_W + tx;
      if (L.explored[i] && L.map[i] === 1) x.fillRect(tx * s, ty * s, s, s);
    }
    const mark = (wx, wy, col, sz = 3) => {
      const tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
      if (!L.explored[ty * MAP_W + tx]) return;
      x.fillStyle = col; x.fillRect(tx * s - 1, ty * s - 1, sz, sz);
    };
    if (L.stairs) mark(L.stairs.x, L.stairs.y, '#38bdf8', 4);
    for (const pr of G.props) {
      if (pr.type === 'campfire' && !pr.used) mark(pr.x, pr.y, '#f97316');
      if (pr.type === 'shrine' && !pr.used) mark(pr.x, pr.y, '#c4b5fd');
      if (pr.type === 'merchant') mark(pr.x, pr.y, '#fde047');
      if (pr.type === 'pedestal' && !pr.done) mark(pr.x, pr.y, '#ef4444');
    }
    for (const ch of G.chests) if (!ch.open) mark(ch.x, ch.y, '#facc15');
    if (G.tombEnt) mark(G.tombEnt.x, G.tombEnt.y, '#e5e7eb');
    x.fillStyle = '#4ade80';
    x.fillRect(Math.floor(G.p.x / TILE) * s - 1, Math.floor(G.p.y / TILE) * s - 1, 4, 4);
  },
};

document.addEventListener('keydown', e => UI.handleKey(e));
