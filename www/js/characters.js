// Ростер из пяти бойцов: у каждого свой стиль, статы и спец-атака.

export const CHARACTERS = {
  volt: {
    id: 'volt',
    name: 'ВОЛЬТ',
    style: 'volt',
    tagline: 'СКОРОСТЬ · ПЛАЗМА',
    color: '#35f0ff',
    accent: '#c9fbff',
    deep: '#0a2a33',
    altColor: '#ff5ac8',
    altAccent: '#ffd1f0',
    hp: 100,
    walkSpeed: 340,
    airSpeed: 255,
    jumpV: 1140,
    damageMul: 1,
    startupMul: 1,
    recoveryMul: 1,
    reachMul: 1,
    special: 'plasma',
    specialName: 'ПЛАЗМЕННЫЙ ЗАРЯД',
    specialDesc: 'Летящий снаряд. Держи дистанцию.',
    badge: 'БЫСТРЫЙ',
    short: 'ПЛАЗМА',
    stats: { speed: 5, power: 3, range: 4 }
  },
  blaze: {
    id: 'blaze',
    name: 'БЛЕЙЗ',
    style: 'heavy',
    tagline: 'СИЛА · УДАРНАЯ ВОЛНА',
    color: '#ff8a3d',
    accent: '#ffe0a8',
    deep: '#3a1608',
    altColor: '#ff4d4d',
    altAccent: '#ffd0d0',
    hp: 112,
    walkSpeed: 300,
    airSpeed: 225,
    jumpV: 1080,
    damageMul: 1.12,
    startupMul: 1.08,
    recoveryMul: 1.1,
    reachMul: 1.04,
    special: 'wave',
    specialName: 'УДАРНАЯ ВОЛНА',
    specialDesc: 'Идёт по земле. Перепрыгни!',
    badge: 'ТЯЖЁЛЫЙ',
    short: 'ВОЛНА',
    stats: { speed: 3, power: 5, range: 3 }
  },
  nyx: {
    id: 'nyx',
    name: 'НИКС',
    style: 'nyx',
    tagline: 'ТЕНЬ · РЫВОК',
    color: '#b06bff',
    accent: '#e8d6ff',
    deep: '#1b0b33',
    altColor: '#5ad8ff',
    altAccent: '#d8f6ff',
    hp: 96,
    walkSpeed: 355,
    airSpeed: 270,
    jumpV: 1160,
    damageMul: 0.95,
    startupMul: 0.94,
    recoveryMul: 0.94,
    reachMul: 1,
    special: 'dash',
    specialName: 'ТЕНЕВОЙ РЫВОК',
    specialDesc: 'Быстрый рывок сквозь соперника. Ближний бой.',
    badge: 'СКРЫТНЫЙ',
    short: 'РЫВОК',
    stats: { speed: 5, power: 4, range: 2 }
  },
  mira: {
    id: 'mira',
    name: 'МИРА',
    style: 'mira',
    tagline: 'ЛЁД · ВЕЕР ОСКОЛКОВ',
    color: '#6fffd2',
    accent: '#dcfff6',
    deep: '#062a24',
    altColor: '#9fa8ff',
    altAccent: '#e6e8ff',
    hp: 100,
    walkSpeed: 315,
    airSpeed: 235,
    jumpV: 1110,
    damageMul: 0.9,
    startupMul: 1,
    recoveryMul: 1,
    reachMul: 1.03,
    special: 'fan',
    specialName: 'ЛЕДЯНОЙ ВЕЕР',
    specialDesc: 'Три осколка: вверх, вперёд и вниз.',
    badge: 'ЛЕДЯНОЙ',
    short: 'ВЕЕР',
    stats: { speed: 4, power: 3, range: 5 }
  },
  storm: {
    id: 'storm',
    name: 'СТОРМ',
    style: 'storm',
    tagline: 'ГРОЗА · МОЛНИЯ',
    color: '#ffd23f',
    accent: '#fff6c2',
    deep: '#33260a',
    altColor: '#b8ff5a',
    altAccent: '#f0ffd0',
    hp: 104,
    walkSpeed: 320,
    airSpeed: 240,
    jumpV: 1120,
    damageMul: 1.05,
    startupMul: 1.02,
    recoveryMul: 1.02,
    reachMul: 1,
    special: 'lightning',
    specialName: 'НЕБЕСНЫЙ РАЗРЯД',
    specialDesc: 'Молния бьёт в точку — успей уйти.',
    badge: 'ГРОЗОВОЙ',
    short: 'МОЛНИЯ',
    stats: { speed: 4, power: 4, range: 5 }
  },
  kai: {
    id: 'kai', name: 'KAI', style: 'nyx', gear: 'bunny',
    tagline: 'ENERGY · RUSH', color: '#4d8dff', accent: '#d6ecff', deep: '#081a3a',
    altColor: '#ff8a3d', altAccent: '#ffe0c0',
    hp: 92, walkSpeed: 370, airSpeed: 275, jumpV: 1170,
    damageMul: 0.92, startupMul: 0.9, recoveryMul: 0.9, reachMul: 1,
    special: 'dash', specialName: 'SPARK RUSH', specialDesc: 'A lightning-fast dash through the opponent.',
    badge: 'AGILE', short: 'RUSH', stats: { speed: 5, power: 3, range: 3 }
  },
  cyber: {
    id: 'cyber', name: 'CYBER-C', style: 'heavy', gear: 'cyber',
    tagline: 'TECH · AEGIS', color: '#d94dff', accent: '#f4d6ff', deep: '#2a0b3a',
    altColor: '#35f0ff', altAccent: '#d8fbff',
    hp: 118, walkSpeed: 300, airSpeed: 225, jumpV: 1060,
    damageMul: 1.1, startupMul: 1.08, recoveryMul: 1.1, reachMul: 1.06,
    special: 'wave', specialName: 'AEGIS WAVE', specialDesc: 'A heavy energy wave that hugs the ground.',
    badge: 'CYBER', short: 'AEGIS', stats: { speed: 3, power: 5, range: 4 }
  },
  neko: {
    id: 'neko', name: 'NEKO', style: 'mira', gear: 'cat',
    tagline: 'SPIRIT · FAN', color: '#5dff7a', accent: '#d8ffe0', deep: '#0a3318',
    altColor: '#ffd23f', altAccent: '#fff6c2',
    hp: 96, walkSpeed: 340, airSpeed: 250, jumpV: 1130,
    damageMul: 0.96, startupMul: 1, recoveryMul: 0.95, reachMul: 1.08,
    special: 'fan', specialName: 'SPIRIT FAN', specialDesc: 'Three spirit shards: high, forward and low.',
    badge: 'TRICKY', short: 'FAN', stats: { speed: 4, power: 3, range: 5 }
  },
  orc: {
    id: 'orc', name: 'ORC-F', style: 'heavy', gear: 'orc',
    tagline: 'BRUTE · QUAKE', color: '#ff4d3d', accent: '#ffd0c0', deep: '#3a0a08',
    altColor: '#b8ff3d', altAccent: '#f0ffd0',
    hp: 126, walkSpeed: 285, airSpeed: 215, jumpV: 1040,
    damageMul: 1.2, startupMul: 1.12, recoveryMul: 1.15, reachMul: 1.1,
    special: 'shockwave', specialName: 'GROUND SLAM', specialDesc: 'A brutal ground slam. Jump over the shockwave.',
    badge: 'BRUTE', short: 'SLAM', stats: { speed: 2, power: 5, range: 4 }
  },
  rogue: {
    id: 'rogue', name: 'ROGUE-K', style: 'nyx', gear: 'rogue',
    tagline: 'SHADOW · BLADES', color: '#ff4fd8', accent: '#ffd6f5', deep: '#3a0830',
    altColor: '#b8ff3d', altAccent: '#f0ffd0',
    hp: 94, walkSpeed: 360, airSpeed: 265, jumpV: 1150,
    damageMul: 0.94, startupMul: 0.92, recoveryMul: 0.92, reachMul: 1.02,
    special: 'dash', specialName: 'SHADOW CUT', specialDesc: 'A quick blade dash through the enemy.',
    badge: 'ROGUE', short: 'CUT', stats: { speed: 5, power: 4, range: 2 }
  }
};

export const BOSS_CHARACTER = {
  id: 'boss',
  name: 'OVERLORD',
  style: 'nyx',
  boss: true,
  scale: 1.09,
  tagline: 'VOID · BOSS',
  color: '#ff2f4f',
  accent: '#ffd6d6',
  deep: '#2b0508',
  altColor: '#ff2f4f',
  altAccent: '#ffd6d6',
  hp: 150,
  walkSpeed: 320,
  airSpeed: 240,
  jumpV: 1100,
  damageMul: 1.4,
  startupMul: 0.94,
  recoveryMul: 0.96,
  reachMul: 1.12,
  special: 'lightning',
  specialName: 'VOID STRIKE',
  specialDesc: 'The final boss. Hits harder than anyone.',
  badge: 'BOSS',
  short: 'VOID',
  stats: { speed: 4, power: 5, range: 5 }
};

export const ALL_CHARACTERS = { ...CHARACTERS, boss: BOSS_CHARACTER };

export const CHARACTER_LIST = Object.values(CHARACTERS);

export function getCharacter(id) {
  return ALL_CHARACTERS[id] || CHARACTERS.volt;
}

export function otherCharacter(id) {
  const c = getCharacter(id);
  return c.id === 'volt' ? CHARACTERS.blaze : CHARACTERS.volt;
}

export function randomCharacterExcept(id) {
  const list = CHARACTER_LIST.filter(c => c.id !== id);
  return list[Math.floor(Math.random() * list.length)] || CHARACTERS.volt;
}
