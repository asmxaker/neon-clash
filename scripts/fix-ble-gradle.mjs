// Gradle 9 убрал jcenter(); плагин @capgo/capacitor-bluetooth-low-energy
// всё ещё объявляет его в android/build.gradle. Убираем мёртвый репозиторий.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(
  'node_modules/@capgo/capacitor-bluetooth-low-energy/android/build.gradle'
);

if (!existsSync(file)) {
  console.log('[fix-ble-gradle] плагин не установлен — пропускаем');
  process.exit(0);
}

const src = readFileSync(file, 'utf8');
const out = src.replace(/^[ \t]*jcenter\(\)[ \t]*\r?\n/gm, '');
if (out === src) {
  console.log('[fix-ble-gradle] уже исправлено');
} else {
  writeFileSync(file, out);
  console.log('[fix-ble-gradle] убрали jcenter() из build.gradle');
}
