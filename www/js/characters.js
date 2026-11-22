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
