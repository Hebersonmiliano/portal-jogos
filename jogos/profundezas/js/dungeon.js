// =============================================================
// Geração procedural dos andares (salas + corredores)
// =============================================================
'use strict';

function generateFloor(floor) {
  const map = new Uint8Array(MAP_W * MAP_H); // 0 = parede, 1 = chão
  const rooms = [];
  const isBoss = floor % 10 === 0;

  const carve = r => {
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++) map[y * MAP_W + x] = 1;
  };
  const center = r => ({ x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) });
  const corridor = (a, b) => {
    const horizFirst = Math.random() < 0.5;
    const hLine = (x1, x2, y) => { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) { map[y * MAP_W + x] = 1; map[(y + 1) * MAP_W + x] = 1; } };
    const vLine = (y1, y2, x) => { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) { map[y * MAP_W + x] = 1; map[y * MAP_W + x + 1] = 1; } };
    if (horizFirst) { hLine(a.x, b.x, a.y); vLine(a.y, b.y, b.x); }
    else { vLine(a.y, b.y, a.x); hLine(a.x, b.x, b.y); }
  };

  if (isBoss) {
    rooms.push({ x: 4, y: 20, w: 8, h: 7 });
    rooms.push({ x: 22, y: 9, w: 32, h: 28 });
  } else {
    const target = 8 + ri(7);
    let tries = 0;
    while (rooms.length < target && tries < 600) {
      tries++;
      const w = 6 + ri(7), h = 5 + ri(5);
      const x = 2 + ri(MAP_W - w - 4), y = 2 + ri(MAP_H - h - 4);
      if (rooms.some(o => x < o.x + o.w + 2 && x + w + 2 > o.x && y < o.y + o.h + 2 && y + h + 2 > o.y)) continue;
      rooms.push({ x, y, w, h });
    }
    rooms.sort((a, b) => (a.x + a.w / 2) - (b.x + b.w / 2));
  }

  // Formatos: retangular, com pilares, redonda, em cruz ou caverna irregular
  const carveShape = r => {
    const n = Math.random();
    r.shape = isBoss ? 'rect' : n < 0.35 ? 'rect' : n < 0.55 ? 'pillars' : n < 0.72 ? 'circle' : n < 0.86 ? 'cross' : 'cave';
    if (r.shape === 'pillars' && (r.w < 8 || r.h < 7)) r.shape = 'rect';
    if (r.shape === 'cross' && (r.w < 7 || r.h < 7)) r.shape = 'rect';
    const cx = r.x + (r.w - 1) / 2, cy = r.y + (r.h - 1) / 2;
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
      let ok = true;
      if (r.shape === 'circle') { const dx = (x - cx) / (r.w / 2), dy = (y - cy) / (r.h / 2); ok = dx * dx + dy * dy <= 1.05; }
      else if (r.shape === 'cross') ok = Math.abs(x - cx) <= r.w / 4 || Math.abs(y - cy) <= r.h / 4;
      else if (r.shape === 'cave') { const edge = x === r.x || y === r.y || x === r.x + r.w - 1 || y === r.y + r.h - 1; ok = !(edge && Math.random() < 0.45); }
      if (ok) map[y * MAP_W + x] = 1;
    }
    if (r.shape === 'pillars') {
      for (let y = r.y + 2; y < r.y + r.h - 2; y += 3) for (let x = r.x + 2; x < r.x + r.w - 2; x += 3) map[y * MAP_W + x] = 0;
    }
    // o centro sempre é chão (os corredores ligam os centros)
    map[Math.floor(cy) * MAP_W + Math.floor(cx)] = 1;
  };
  rooms.forEach(carveShape);
  for (let i = 1; i < rooms.length; i++) corridor(center(rooms[i - 1]), center(rooms[i]));
  if (!isBoss) for (let k = 0; k < 2; k++) {
    const a = pick(rooms), b = pick(rooms);
    if (a !== b) corridor(center(a), center(b));
  }

  // Bordas sempre são parede
  for (let x = 0; x < MAP_W; x++) { map[x] = 0; map[(MAP_H - 1) * MAP_W + x] = 0; }
  for (let y = 0; y < MAP_H; y++) { map[y * MAP_W] = 0; map[y * MAP_W + MAP_W - 1] = 0; }

  // Sala inicial e escada (sala mais distante pelo caminho)
  const startRoom = isBoss ? rooms[0] : rooms[ri(Math.min(2, rooms.length))];
  const sc = center(startRoom);
  const distMap = bfs(map, sc.x, sc.y);
  let stairsRoom = rooms[rooms.length - 1], best = -1;
  for (const r of rooms) {
    const c = center(r);
    const d = distMap[c.y * MAP_W + c.x];
    if (d > best) { best = d; stairsRoom = r; }
  }

  // Sala secreta: separada de uma sala por uma parede rachada (valor 2)
  let secret = null;
  if (!isBoss && Math.random() < 0.6) {
    for (let tries = 0; tries < 80 && !secret; tries++) {
      const r = pick(rooms);
      if (r === startRoom) continue;
      const w = 5, h = 4, side = ri(4);
      let sx, sy, gx, gy;
      if (side === 0) { sx = Math.floor(r.x + r.w / 2 - w / 2); sy = r.y - h - 1; gx = Math.floor(r.x + r.w / 2); gy = r.y - 1; }
      else if (side === 1) { sx = Math.floor(r.x + r.w / 2 - w / 2); sy = r.y + r.h + 1; gx = Math.floor(r.x + r.w / 2); gy = r.y + r.h; }
      else if (side === 2) { sx = r.x - w - 1; sy = Math.floor(r.y + r.h / 2 - h / 2); gx = r.x - 1; gy = Math.floor(r.y + r.h / 2); }
      else { sx = r.x + r.w + 1; sy = Math.floor(r.y + r.h / 2 - h / 2); gx = r.x + r.w; gy = Math.floor(r.y + r.h / 2); }
      if (sx < 2 || sy < 2 || sx + w > MAP_W - 2 || sy + h > MAP_H - 2) continue;
      let free = true;
      for (let y = sy - 1; y <= sy + h && free; y++) for (let x = sx - 1; x <= sx + w; x++) if (map[y * MAP_W + x]) { free = false; break; }
      // o lado de dentro da parede rachada precisa ser chão da sala
      const ix = side === 2 ? gx + 1 : side === 3 ? gx - 1 : gx, iy = side === 0 ? gy + 1 : side === 1 ? gy - 1 : gy;
      if (!free || map[iy * MAP_W + ix] !== 1) continue;
      for (let y = sy; y < sy + h; y++) for (let x = sx; x < sx + w; x++) map[y * MAP_W + x] = 1;
      map[gy * MAP_W + gx] = 2;
      secret = { x: sx, y: sy, w, h, gate: { x: gx, y: gy }, hits: 0 };
    }
  }

  return {
    floor, map, rooms, isBoss, secret,
    biome: biomeOf(floor),
    start: { x: sc.x * TILE + TILE / 2, y: sc.y * TILE + TILE / 2 },
    startRoom,
    stairsRoom,
    stairs: isBoss ? null : { x: center(stairsRoom).x * TILE + TILE / 2, y: center(stairsRoom).y * TILE + TILE / 2 },
    explored: new Uint8Array(MAP_W * MAP_H),
  };
}

function bfs(map, sx, sy) {
  const d = new Int32Array(MAP_W * MAP_H).fill(-1);
  const q = [sy * MAP_W + sx];
  d[q[0]] = 0;
  let h = 0;
  while (h < q.length) {
    const i = q[h++];
    const x = i % MAP_W, y = (i / MAP_W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      const j = ny * MAP_W + nx;
      if (map[j] === 1 && d[j] < 0) { d[j] = d[i] + 1; q.push(j); }
    }
  }
  return d;
}

// Ponto de chão aleatório dentro de uma sala (com margem)
function randomPointIn(room, margin = 1) {
  const m = G.level && G.level.map;
  for (let k = 0; k < 30; k++) {
    const x = room.x + margin + ri(Math.max(1, room.w - margin * 2));
    const y = room.y + margin + ri(Math.max(1, room.h - margin * 2));
    if (!m || m[y * MAP_W + x] === 1) return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
  }
  return { x: Math.floor(room.x + room.w / 2) * TILE + TILE / 2, y: Math.floor(room.y + room.h / 2) * TILE + TILE / 2 };
}

function drawCrack(x, level, tiles) {
  const g = level.secret.gate, px = g.x * TILE, py = g.y * TILE;
  x.drawImage(tiles.face, px, py);
  x.fillStyle = 'rgba(0,0,0,0.75)';
  const pts = [[7, 1], [8, 3], [6, 5], [8, 7], [9, 9], [7, 11], [8, 13], [6, 15]];
  for (const [cx, cy] of pts) x.fillRect(px + cx, py + cy, 2, 2);
  x.fillRect(px + 9, py + 6, 3, 1); x.fillRect(px + 4, py + 10, 3, 1);
}

// Abre a parede rachada (desenha chão no lugar)
function openSecret(level) {
  const g = level.secret.gate;
  level.map[g.y * MAP_W + g.x] = 1;
  const x = G.floorCanvas.getContext('2d');
  x.drawImage(level.tiles.floors[0], g.x * TILE, g.y * TILE);
}

// Desenha o mapa inteiro num canvas (feito uma vez por andar)
function renderFloorCanvas(level) {
  const tiles = makeTiles(level.biome);
  const c = document.createElement('canvas');
  c.width = MAP_W * TILE; c.height = MAP_H * TILE;
  const x = c.getContext('2d');
  const m = level.map;
  const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) ? 0 : m[ty * MAP_W + tx] === 1 ? 1 : 0;
  level.tiles = tiles;
  x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const px = tx * TILE, py = ty * TILE;
      if (at(tx, ty)) {
        const v = ((tx * 7 + ty * 13) ^ (tx * ty)) % 11;
        x.drawImage(tiles.floors[v < 6 ? 0 : v < 9 ? 1 : v < 10 ? 2 : 3], px, py);
      } else if (at(tx, ty + 1)) {
        x.drawImage(tiles.face, px, py);
      } else {
        let near = false;
        for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (at(tx + dx, ty + dy)) { near = true; break; }
        if (near) x.drawImage(tiles.top, px, py);
      }
    }
  }
  // parede rachada da sala secreta
  if (level.secret) drawCrack(x, level, tiles);
  // sombra no pé das paredes
  x.fillStyle = 'rgba(0,0,0,0.25)';
  for (let ty = 1; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++)
    if (at(tx, ty) && !at(tx, ty - 1)) x.fillRect(tx * TILE, ty * TILE, TILE, 3);
  return c;
}
