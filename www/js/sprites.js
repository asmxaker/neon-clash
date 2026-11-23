// Загрузчик внешних спрайт-листов. Если ассетов нет — игра рисует бойца процедурно.

// Чтобы включить спрайты, добавь id после того, как PNG-файлы будут готовы:
const SPRITE_ENABLED = new Set(['kai']);
const sets = new Map();

export function enableSprite(charId) {
  SPRITE_ENABLED.add(charId);
  ensureSet(charId);
}

function ensureSet(charId) {
  if (sets.has(charId)) return sets.get(charId);
  const set = { ready: false, failed: false, manifest: null, images: {} };
  sets.set(charId, set);

  fetch(`sprites/${charId}/manifest.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`sprite manifest ${res.status}`);
      return res.json();
    })
    .then((manifest) => {
      set.manifest = manifest;
      const entries = Object.entries(manifest.animations || {});
      return Promise.all(entries.map(([name, anim]) => {
        return loadImage(`sprites/${charId}/${anim.file}`)
          .then((img) => { set.images[name] = img; })
          .catch(() => { /* одна анимация может отсутствовать */ });
      }));
    })
    .then(() => {
      set.ready = true;
    })
    .catch(() => {
      set.failed = true;
    });

  return set;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sprite ${src}`));
    img.src = src;
  });
}

function chooseAnimation(f) {
  if (f.state === 'ko') return 'ko';
  if (f.state === 'hit') return 'hit';
  if (f.state === 'block') return 'block';
  if (f.state === 'attack') {
    const kind = f.attack?.kind;
    if (kind === 'punch') return 'punch';
    if (kind === 'kick' || kind === 'airkick') return 'kick';
    return 'special';
  }
  if (f.state === 'jump') return 'jump';
  if (f.state === 'walk') return 'walk';
  return 'idle';
}

function frameTime(f) {
  const anim = chooseAnimation(f);
  if (anim === 'ko') return f.koTime;
  if (anim === 'hit') return f.stateTime;
  if (f.state === 'attack') return f.attackT;
  if (anim === 'walk') return f.animT;
  if (anim === 'idle') return f.animT;
  return f.stateTime;
}

export function getSpriteFrame(f) {
  const charId = f.charId;
  if (!SPRITE_ENABLED.has(charId)) return null;
  const set = sets.get(charId) || ensureSet(charId);
  if (!set.ready || !set.manifest) return null;

  const animName = chooseAnimation(f);
  const anim = set.manifest.animations?.[animName];
  const img = set.images[animName];
  if (!anim || !img) return null;

  const total = Math.max(0.001, anim.frames / Math.max(1, anim.fps));
  let frame;
  if (anim.loop) {
    frame = Math.floor((frameTime(f) / total) * anim.frames) % anim.frames;
  } else if (f.state === 'attack' && f.attack) {
    const totalAtk = f.attack.startup + f.attack.active + f.attack.recovery;
    frame = Math.min(anim.frames - 1, Math.floor((f.attackT / totalAtk) * anim.frames));
  } else {
    frame = Math.min(anim.frames - 1, Math.floor((frameTime(f) / total) * anim.frames));
  }
  if (frame < 0) frame = 0;

  const start = anim.start || 0;
  return {
    img,
    sx: (start + frame) * set.manifest.frameW,
    sy: 0,
    sw: set.manifest.frameW,
    sh: set.manifest.frameH,
    anchorX: set.manifest.anchorX,
    anchorY: set.manifest.anchorY,
    scale: set.manifest.scale || 1
  };
}

// прогреваем включённые спрайты сразу при старте
for (const id of SPRITE_ENABLED) ensureSet(id);
