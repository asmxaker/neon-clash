// Арены с готовыми фонами. Если изображение не загрузилось, рисуется тёмный
// градиент, а игра продолжает работать.

const ARENA_DATA = {
  wastes:  { file: 'arenas/wastes.jpg',  edge: '255, 196, 120' },
  neon:    { file: 'arenas/neon.jpg',    edge: '255, 122, 210' },
  market:  { file: 'arenas/market.jpg',  edge: '112, 255, 222' },
  station: { file: 'arenas/station.jpg', edge: '120, 232, 255' },
  bar:     { file: 'arenas/bar.jpg',     edge: '255, 120, 210' }
};

const images = new Map();

export const ARENA_STAGE_IDS = Object.keys(ARENA_DATA);

export function isImageStage(stageId) {
  return Object.prototype.hasOwnProperty.call(ARENA_DATA, stageId);
}

function ensureImage(stageId) {
  if (images.has(stageId)) return images.get(stageId);
  const data = ARENA_DATA[stageId];
  if (!data) return null;
  const img = new Image();
  img.decoding = 'async';
  img.src = data.file;
  images.set(stageId, img);
  return img;
}

export function preloadArenas() {
  for (const id of ARENA_STAGE_IDS) ensureImage(id);
}

export function drawArenaBackground(ctx, stageId, viewW, viewH, worldW, groundY, t, camX) {
  const data = ARENA_DATA[stageId];
  const img = ensureImage(stageId);
  if (!data) return;

  if (!img || !img.complete || !img.naturalWidth) {
    const fallback = ctx.createLinearGradient(0, 0, 0, viewH);
    fallback.addColorStop(0, '#06030f');
    fallback.addColorStop(0.6, '#0b0618');
    fallback.addColorStop(1, '#02010a');
    ctx.fillStyle = fallback;
    ctx.fillRect(0, 0, viewW, viewH);
    return;
  }

  // Фон шире экрана: центральная часть совпадает с видом на старте,
  // а при движении камеры сцена отстаёт (параллакс).
  const p = 0.55;
  const offset = -camX * p - (worldW - viewW) / 2 * (1 - p);
  const drift = Math.sin(t * 0.06) * 7;
  ctx.drawImage(img, offset + drift, 0, worldW, viewH);

  // Верхний скрим под HUD: на неоновых вывесках иначе теряются полосы HP.
  const topScrim = ctx.createLinearGradient(0, 0, 0, 210);
  topScrim.addColorStop(0, 'rgba(2, 1, 8, 0.64)');
  topScrim.addColorStop(0.55, 'rgba(2, 1, 8, 0.30)');
  topScrim.addColorStop(1, 'rgba(2, 1, 8, 0)');
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, viewW, 210);

  // Нижний скрим: приглушает толпу/интерьер за бойцами и у пола.
  const bottomScrim = ctx.createLinearGradient(0, viewH - 320, 0, viewH);
  bottomScrim.addColorStop(0, 'rgba(2, 1, 8, 0)');
  bottomScrim.addColorStop(0.45, 'rgba(2, 1, 8, 0.10)');
  bottomScrim.addColorStop(1, 'rgba(2, 1, 8, 0.44)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, viewH - 320, viewW, 320);

  // Тонкая световая линия пола, чтобы бойцы не «висели».
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const edge = ctx.createLinearGradient(0, groundY - 9, 0, groundY + 9);
  edge.addColorStop(0, `rgba(${data.edge}, 0)`);
  edge.addColorStop(0.46, `rgba(${data.edge}, 0.10)`);
  edge.addColorStop(0.5, `rgba(${data.edge}, 0.26)`);
  edge.addColorStop(0.54, `rgba(${data.edge}, 0.10)`);
  edge.addColorStop(1, `rgba(${data.edge}, 0)`);
  ctx.fillStyle = edge;
  ctx.fillRect(0, groundY - 9, viewW, 18);
  ctx.restore();
}

preloadArenas();
