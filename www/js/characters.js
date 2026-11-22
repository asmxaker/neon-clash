// Ростер бойцов. Два характера: быстрый Вольт и тяжёлый Блейз.

export const CHARACTERS = {
  volt: {
    id: 'volt',
    name: 'ВОЛЬТ',
    style: 'volt',
    tagline: 'СКОРОСТЬ · ПЛАЗМА',
    color: '#35f0ff',
    accent: '#c9fbff',
    deep: '#0a2a33',
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
    stats: { speed: 3, power: 5, range: 3 }
  }
};

export const CHARACTER_LIST = [CHARACTERS.volt, CHARACTERS.blaze];

export function getCharacter(id) {
  return CHARACTERS[id] || CHARACTERS.volt;
}

export function otherCharacter(id) {
  return getCharacter(id).id === 'volt' ? CHARACTERS.blaze : CHARACTERS.volt;
}
