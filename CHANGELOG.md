# Changelog

Todas las entradas documentan cambios técnicos relevantes de LIVE Launchpad.

## [Unreleased] · Sprint de Hiperrealismo y Caos Orgánico

### Added
- **Pool masivo de chat procedimental (`lib/data.ts`).**
  - Se eliminó el `CHAT_SCRIPT` fijo en bucle de 46 s (24 líneas, siempre
    los mismos usuarios y el mismo orden) por un motor 100% generativo.
  - `CHAT_MESSAGE_POOL`: 195 mensajes construidos programáticamente a partir
    de 4 fuentes combinadas — reacciones cortas (~58), preguntas (~19),
    cadenas de emoji tipo `🔥🔥`/`💀💀💀` (30 combinaciones de 15 emojis ×
    2-3 repeticiones) y variantes con énfasis/mayúsculas del set de
    reacciones — para evitar texto hardcodeado repetitivo.
  - `generateUsername()`: combina 44 raíces (`maria`, `juanperez`, `user`...)
    con 20 sufijos (`.gzz`, `_mx`, `cocina`...) y, en ~55% de los casos, un
    número aleatorio (`user84729`, `maria.gzz`, `juanperez_23`).
  - `REGULAR_VIEWERS` (11 handles recurrentes) aparecen ~40% del tiempo
    para dar sensación de continuidad; el resto son identidades frescas
    generadas al vuelo — así ningún patrón se siente ni 100% aleatorio ni
    100% repetido.
  - `GIFT_CATALOG` con 7 regalos y probabilidades realistas (85% rosas
    sueltas de bajo valor vía `randomGift()`, 15% algo más caro) más
    `generateViralSurgeGift()`, reservado a regalos de ≥400 diamantes
    (León / Cohete / Universo) para el modo Ráfaga Viral.

- **Motor de cadencia estocástica: `useOrganicChat` (`lib/hooks.ts`).**
  - Reemplaza el `setInterval` fijo de 250 ms que recorría `CHAT_SCRIPT`.
    Agenda cada mensaje con un retardo aleatorio de 50-600 ms
    (`randomInt(minDelayMs, maxDelayMs)`), y ~12% de las veces dispara una
    "ráfaga" de 3-5 mensajes de golpe para simular picos de emoción.
    Nunca hace `fetch` ni trabajo asíncrono: solo genera objetos en memoria.
  - Expone `surge(count, windowMs)`, usado por el Viral Surge de God Mode
    para inyectar `count` mensajes espaciados uniformemente dentro de
    `windowMs` (por defecto 15 mensajes en ~1000 ms).

- **God Mode: botón "Forzar Ráfaga Viral".**
  - `components/GodModeDrawer.tsx` suma un botón (solo habilitado en la
    pantalla LIVE Room) que dispara `window.dispatchEvent(new
    CustomEvent("godmode:viral-surge"))`.
  - `LiveRoomScreen.tsx` escucha ese evento e inyecta 15 mensajes en ~1 s
    (`surgeChat(15, 1000)`) + un regalo de alto valor
    (`generateViralSurgeGift()`, acreditado a diamantes/rosas y con
    banner grande porque supera el umbral de 60 diamantes).
  - `HeartsField` (ver abajo) escucha el mismo evento de forma
    independiente y suelta 20 corazones simultáneos, sin que
    `LiveRoomScreen` tenga que coordinar ese estado.

- **`HeartsField`: corazones flotantes totalmente aislados.**
  - Antes, los "likes" vivían en el estado de `LiveRoomScreen`
    (`hearts`/`setHearts`), por lo que cada tick del intervalo (620 ms)
    re-renderizaba toda la pantalla LIVE. Ahora es su propio componente
    memoizado (`memo`) con su propio `useInterval` (420 ms) y su propio
    estado — sus renders quedan aislados a su subárbol.
  - Cada corazón (`FloatingHeart`, también memoizado) recorre una
    trayectoria en 3 puntos vía keyframes de Framer Motion
    (`y: [0,-130,-260]`, `x: [inicio, deriva-media, deriva-final]`,
    `scale`/`opacity` variables) que aproxima una curva bezier sin depender
    de cálculos de path SVG.
  - Máximo 14 corazones vivos en todo momento (`.slice(-13)` + el nuevo);
    cada uno se autodestruye con `setTimeout` al terminar su recorrido
    (3.4 s), así el DOM nunca acumula nodos de partículas.

### Changed
- **Rendimiento del chat.** `ChatRow` ahora usa `React.memo`: como los
  mensajes ya emitidos nunca se mutan (solo se agregan o se recortan del
  array), las filas viejas no se vuelven a pintar cuando llega un mensaje
  nuevo. El límite de mensajes montados subió de 22 a `MAX_CHAT_NODES = 40`,
  dentro del presupuesto de 30-50 nodos DOM exigido.
- **`LiveRoomScreen.tsx`.** Se eliminó el "reloj maestro" (`clockRef`,
  `firedChat`, el bucle de `CHAT_LOOP_SECONDS`) y su `useInterval` de
  250 ms; la emisión de chat ahora vive enteramente en `useOrganicChat`.
  Los efectos secundarios de un regalo (diamantes, rosas, banner grande)
  se centralizaron en un único `handleChatEvent` memoizado con
  `useCallback`, reutilizado tanto por el flujo orgánico normal como por
  el Viral Surge.

### Verified
- `npm run build` y `npm run lint` sin errores ni advertencias
  (Next.js 16.3.3, Turbopack).
- No se agregó ningún `fetch`/trabajo asíncrono al bucle de chat ni al
  emisor de corazones; se mantiene la meta de 60fps.
- No se tocó el estado global de Zustand (`lib/store.ts`) ni la ruta de
  Vercel AI SDK (`app/api/generate-runsheet`) de esta sesión.

## [Unreleased] · Sprint de Producción

### Added
- **Generación de Runsheets con IA (Vercel AI SDK).**
  - Nueva ruta `app/api/generate-runsheet/route.ts` (`POST`), que usa
    `generateObject` de `ai` + `@ai-sdk/openai` (`gpt-4o-mini`) con un schema
    `zod` para devolver 3 formatos de escaleta (`qa`, `goal`, `cookalong`)
    estructurados a partir del contexto del video viral (caption, hashtags,
    vistas, comentarios, multiplicador).
  - Si `OPENAI_API_KEY` no está configurada, o si la generación falla por
    cualquier motivo (red, timeout, respuesta inválida), la ruta responde
    `200 { ok: false }` — nunca un error 5xx — para no romper la demo.
  - `components/RunsheetScreen.tsx` ahora llama a este endpoint al montar
    (en paralelo a la animación de análisis de 2.5 s), con un
    `AbortController` de 6 s de timeout. Arranca siempre con los mocks de
    `lib/data.ts` (`RUNSHEET_FORMATS`) y solo los reemplaza si la API
    responde `ok: true` con 3 formatos válidos (`isValidFormats`). El
    creador nunca ve un mensaje de error ni una pantalla en blanco.
  - Dependencias nuevas: `ai@7.0.77`, `@ai-sdk/openai@4.0.46`, `zod@4.4.3`
    (versiones fijadas, no floating ranges).

- **God Mode: panel de control para pitches y demos.**
  - `components/GodModeDrawer.tsx` — bottom-sheet activable con `Shift + D`
    (o `Esc` para cerrar), consistente visualmente con el resto de
    bottom-sheets de la app.
  - Permite: saltar directamente a cualquier pantalla del flujo
    (Feed / Runsheet / Waiting Room / LIVE Room / Post-LIVE) sin cumplir
    los pasos previos, forzar la próxima sugerencia del LIVE Copilot sin
    esperar su cadencia de 17 s, y borrar el estado persistido
    (`localStorage` + reset de la sesión de Zustand) con confirmación de
    dos pasos.
  - Cuando God Mode salta a una pantalla que requiere `format` o `stats`
    y estos aún no existen (porque se saltó el flujo normal), se rellenan
    con defaults sensatos (`RUNSHEET_FORMATS[0]`, métricas placeholder)
    para que la pantalla no quede en blanco.
  - El disparo forzado del Copilot se comunica mediante un
    `CustomEvent("godmode:trigger-copilot")` en `window`, escuchado por
    `LiveRoomScreen`. `lib/hooks.ts` (`useCopilotMessages`) expone ahora
    `trigger()` para emitir la siguiente sugerencia de la cola a demanda,
    sin alterar la cadencia normal cuando God Mode no se usa.
  - Es una herramienta de desarrollo/demo, no parte del producto: no
    aparece en ningún flujo del creador y no se referencia desde ninguna
    pantalla salvo el atajo de teclado global en `app/page.tsx`.

### Changed
- **Refactor de layout en `LiveRoomScreen.tsx`: fin de las colisiones de z-index.**
  - El banner grande de regalo (antes `absolute top-[248px]`) y la
    pregunta destacada (antes `absolute top-[300px]`) se integraron al
    mismo contenedor flex (`flex flex-col gap-2`, anclado en `top-[94px]`)
    que ya apilaba el Copilot, el aviso de opt-out, la meta de regalos y
    el comentario fijado.
  - Todos estos overlays ahora reflowan en flujo normal de documento con
    `layout` de Framer Motion animando la reordenación, en vez de flotar
    en coordenadas absolutas fijas que podían solaparse cuando dos
    eventos coincidían (p. ej. un regalo grande de >60 diamantes mientras
    la meta de 500 Rosas ya estaba anunciada).
  - Sin impacto de rendimiento: sigue sin haber `fetch` ni trabajo
    asíncrono dentro del reloj maestro del guion (`useInterval` a 250 ms)
    ni en el emisor del Copilot; los cambios son puramente de
    disposición visual.

### Verified
- `npm run build` compila sin errores de TypeScript ni de SSR
  (Next.js 16.3.3, Turbopack). Ruta `/api/generate-runsheet` se reporta
  como `ƒ` (dinámica, server-rendered on demand); `/` sigue siendo
  estática.
- `npm run lint` sin advertencias ni errores.
