This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**LIVE Launchpad** es una simulación frontend mobile-first que emula la
interfaz de TikTok para guiar a un creador desde un pico viral hasta su
primer LIVE (Feed → Runsheet → Waiting Room → LIVE Room con Copilot →
resumen Post-LIVE).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Variables de entorno

Copia `.env.local` (o créalo) y define, si quieres generación real de
Runsheets por IA:

```bash
OPENAI_API_KEY=sk-...
```

Esta variable es **opcional**. `app/api/generate-runsheet/route.ts` usa
[Vercel AI SDK](https://sdk.vercel.ai) (`generateObject` + `@ai-sdk/openai`,
modelo `gpt-4o-mini`) para generar los 3 formatos de escaleta del Runsheet
a partir del video viral. Si `OPENAI_API_KEY` no está definida, o si la
llamada falla por cualquier motivo (red, timeout, respuesta inválida), la
app cae automáticamente en los mocks locales de `lib/data.ts`
(`RUNSHEET_FORMATS`) sin mostrar ningún error al usuario — la demo nunca
se rompe por falta de conectividad o de API key.

## God Mode (panel de control para demos)

Presiona **`Shift + D`** en cualquier pantalla para abrir el panel God
Mode (`components/GodModeDrawer.tsx`). Pensado para pitches y
demostraciones en vivo, permite:

- **Saltar de pantalla** directamente (Feed / Runsheet / Waiting Room /
  LIVE Room / Post-LIVE) sin completar los pasos previos del flujo.
- **Forzar una sugerencia del LIVE Copilot** al instante, sin esperar su
  cadencia normal de ~17 s (solo disponible en la pantalla LIVE Room).
- **Forzar Ráfaga Viral**: inyecta 15 mensajes de chat en ~1 s, suelta 20
  corazones flotantes simultáneos y dispara un regalo de alto valor
  (León / Cohete / Universo), para mostrar en vivo el "pico de emoción"
  de un LIVE viral durante el pitch (solo disponible en LIVE Room).
- **Borrar el estado persistido**: limpia `localStorage` y reinicia la
  sesión (moderador elegido, categorías silenciadas del Copilot, etc.),
  con confirmación de dos pasos para evitar borrados accidentales.

Cierra el panel con `Esc`, tocando fuera, o volviendo a presionar
`Shift + D`. Es una herramienta de desarrollo interna: no aparece en
ningún flujo de cara al creador.

## Simulación del chat LIVE

El chat de la sala LIVE (`components/LiveRoomScreen.tsx`) no usa un guion
fijo en bucle: cada mensaje se genera al vuelo con `useOrganicChat`
(`lib/hooks.ts`), con retardos aleatorios de 50-600 ms y ráfagas
ocasionales de 3-5 mensajes para simular picos de emoción reales. Los
usuarios se generan con `generateUsername()` (`lib/data.ts`) mezclando
handles con números (`user84729`, `maria.gzz`, `juanperez_23`...) y un
pool de ~195 mensajes/emoji-chains variados, con un 40% de probabilidad de
reutilizar uno de 11 "espectadores regulares" para dar continuidad. Los
corazones flotantes viven en su propio componente aislado (`HeartsField`)
para no re-renderizar el resto de la sala.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
