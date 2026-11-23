# Ассеты и форматы

Документ для тех, кто добавляет музыку, звуки, спрайты, иконки или фоны. Все пути указаны относительно `www/`.

## 1. Музыка

Музыкальные треки лежат в `www/audio/` в **OGG Vorbis**. `audio.js` скачивает их через `fetch`, декодирует через WebAudio и играет бесшовным лупом.

| Файл | Сцена | Длительность |
| --- | --- | --- |
| `audio/menu.ogg` | Главное меню, выбор бойца, лобби связи | ~60 сек |
| `audio/battle_city.ogg` | Neon City | ~63 сек |
| `audio/battle_dojo.ogg` | Sunset Dojo | ~67 сек |
| `audio/battle_reactor.ogg` | Toxic Reactor | ~65 сек |
| `audio/battle_orbit.ogg` | Orbit Station | ~80 сек |
| `audio/battle_tundra.ogg` | Frozen Tundra | ~58 сек |
| `audio/battle_boss.ogg` | Финальный босс | ~61 сек |
| `audio/victory.ogg` | Экран победы | ~63 сек |

### Формат

| Параметр | Значение |
| --- | --- |
| Контейнер / кодек | OGG Vorbis |
| Частота | 44.1 или 48 кГц |
| Каналы | стерео |
| Битрейт | 96–160 kbps |
| Громкость | примерно −16 LUFS |
| true peak | не выше −1.5 dBTP |
| Луп | бесшовный, без тишины и fade на стыке |

Если OGG не загрузился, `audio.js` включает синтезированный fallback из `TRACKS`. Это защищает игру от пустой тишины, но fallback звучит проще.

### Замена трека

1. Положить новый файл с тем же именем в `www/audio/`.
2. Если меняется имя — обновить `MUSIC_FILES` в `www/js/audio.js`.
3. Обновить `CACHE` в `www/sw.js`, если нужно сбросить PWA-кэш.
4. Для APK выполнить `npm run apk` или `npx cap sync android`.

### Если трек не зацикливается

Лучше присылать отдельно intro + loop:

```text
audio/menu_intro.ogg
audio/menu_loop.ogg
```

Сейчас плеер рассчитан на один бесшовный файл. Для intro+loop нужно расширить `playFileTrack()` и хранить две точки старта.

## 2. Звуковые эффекты

Короткие SFX сейчас синтезируются в `audio.js`:

| Метод | Где используется |
| --- | --- |
| `ui()` | кнопки и меню |
| `whiff()` | промах |
| `hit(power)` | попадание |
| `block()` | блок |
| `jump()` | прыжок |
| `specialCharge()` | замах спец-атаки |
| `fire()` | выстрел снаряда |
| `shockwave()` | ударная волна |
| `dash()` | рывок |
| `shard()` | ледяные осколки |
| `thunder()` | молния |
| `ko()` | нокаут |
| `round()` / `fight()` | начало раунда |
| `win()` | победа |
| `timeout()` | конец времени |
| `combo()` | комбо |
| `command()` | motion-команда |
| `kick(delay, vol)` | бочка в синтезированной музыке |

### Формат внешних SFX

Если добавлять WAV/OGG-сэмплы:

| Параметр | Значение |
| --- | --- |
| Формат | WAV PCM 16/24 бит или OGG |
| Частота | 44.1 / 48 кГц |
| Каналы | моно или стерео |
| Длина | 0.05–1.5 сек |
| Пики | −3…−6 dBFS |
| Начало | без тишины |
| Конец | fade-out 5–15 мс |
| Файлы | латиница, нижний регистр, `_01`, `_02` для вариантов |

Рекомендуемая структура:

```text
www/audio/sfx/
  hit_light_01.wav
  hit_light_02.wav
  hit_heavy_01.wav
  block_01.wav
  whiff_punch_01.wav
  jump.wav
  land.wav
  ko.wav
  special_charge.wav
  projectile_plasma.wav
  projectile_wave.wav
  projectile_shard.wav
  thunder.wav
  dash.wav
  combo_hit.wav
  ui_select.wav
  win.wav
  timeout.wav
```

После добавления файлов нужно расширить `audio.js`: загрузить буферы по аналогии с музыкой и проигрывать их в соответствующих методах. Пока fallback — синтез.

## 3. Спрайты бойцов

KAI подключён к спрайтовому рендеру: `www/js/sprites.js` загружает PNG из `www/sprites/kai/`, а `drawFighter()` рисует кадр вместо процедурного бойца. Остальные бойцы пока процедурные.

Если PNG, manifest или отдельная анимация не загрузились, игра автоматически возвращается к процедурной отрисовке для этого состояния.

KAI:

- дизайн-бриф: [`CHARACTER_KAI.md`](CHARACTER_KAI.md);
- manifest: [`www/sprites/kai/manifest.json`](../www/sprites/kai/manifest.json);
- шаблон сетки: [`www/sprites/kai/_layout.svg`](../www/sprites/kai/_layout.svg);
- инструкция: [`www/sprites/README.md`](../www/sprites/README.md).

Файлы KAI:

```text
www/sprites/kai/
  manifest.json
  idle.png      6 кадров
  walk.png      8 кадров
  punch.png     5 кадров
  kick.png      5 кадров
  _layout.svg
```

`jump`, `special`, `block`, `hit` и `ko` собираются из этих же полос через `start` в manifest. Это позволяет держать один художественный стиль без девяти отдельных файлов.

| Параметр | Значение |
| --- | --- |
| Формат | PNG с прозрачностью |
| Кадр | 256×256 |
| Раскладка | горизонтальная полоса |
| Взгляд | вправо |
| Anchor | X=128, Y=242 (ступни) |
| Масштаб | одинаковый внутри полосы |
| Фон | прозрачный |
| Тени | не включать |
| Текст/UI | не включать |

Manifest лежит **в папке персонажа**:

```json
{
  "charId": "kai",
  "frameW": 256,
  "frameH": 256,
  "anchorX": 128,
  "anchorY": 242,
  "scale": 0.96,
  "animations": {
    "idle": { "file": "idle.png", "frames": 6, "start": 0, "fps": 10, "loop": true },
    "hit":  { "file": "punch.png", "frames": 1, "start": 4, "fps": 8, "loop": false }
  }
}
```

Загрузчик умеет:

1. Читать `manifest.json` и загружать PNG-полосы.
2. Выбирать анимацию по `f.state` и `f.attack.kind`.
3. Брать нужный диапазон кадров через `start`/`frames`.
4. Рисовать кадр с anchor и flip по `f.facing`.
5. Тонировать mirror-вариант (`f.variant === 1`).
6. Оставлять процедурный fallback для отсутствующих кадров.

Включение нового бойца: добавить id в `SPRITE_ENABLED` в `www/js/sprites.js`, положить файлы и обновить `ASSETS`/`CACHE` в `www/sw.js`.

## 4. Иконки и PWA

- `www/icons/icon-192.png`, `icon-512.png`, `icon-1024.png` — PWA/Android.
- `www/manifest.webmanifest` — имя, цвета, ориентация.
- `www/sw.js` — service worker; при изменении списка файлов обновить `CACHE`.

## 5. Добавление ассетов в APK

1. Положить файлы в `www/`.
2. Обновить код/манифест ассетов.
3. Проверить размер APK.
4. `npm run apk`.
5. Установить `dist/NeonClash-MVP.apk`.

`android/app/src/main/assets/public/` генерируется Capacitor и не редактируется вручную.
