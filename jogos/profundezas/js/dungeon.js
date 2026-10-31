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

  rooms.forEach(carve);
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

  return {
    floor, map, rooms, isBoss,
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
      if (map[j] && d[j] < 0) { d[j] = d[i] + 1; q.push(j); }
    }
  }
  return d;
}

// Ponto de chão aleatório dentro de uma sala (com margem)
function randomPointIn(room, margin = 1) {
  const x = room.x + margin + ri(Math.max(1, room.w - margin * 2));
  const y = room.y + margin + ri(Math.max(1, room.h - margin * 2));
  return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
}

// Desenha o mapa inteiro num canvas (feito uma vez por andar)
function renderFloorCanvas(level) {
  const tiles = makeTiles(level.biome);
  const c = document.createElement('canvas');
  c.width = MAP_W * TILE; c.height = MAP_H * TILE;
  const x = c.getContext('2d');
  const m = level.map;
  const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) ? 0 : m[ty * MAP_W + tx];
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
  // sombra no pé das paredes
  x.fillStyle = 'rgba(0,0,0,0.25)';
  for (let ty = 1; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++)
    if (at(tx, ty) && !at(tx, ty - 1)) x.fillRect(tx * TILE, ty * TILE, TILE, 3);
  return c;
}
