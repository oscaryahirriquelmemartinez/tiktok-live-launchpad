// ---------------------------------------------------------------------------
// POST /api/generate-runsheet
// Genera 3 formatos de escaleta (runsheet) en base al contexto del video
// viral, usando Vercel AI SDK (`generateObject`) contra OpenAI.
//
// Esta ruta es "best effort": si falta OPENAI_API_KEY o la llamada falla,
// devuelve 200 con `{ ok: false }` para que el cliente (RunsheetScreen)
// caiga de vuelta a los mocks locales de lib/data.ts SIN romper la demo.
// ---------------------------------------------------------------------------

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RunsheetStepSchema = z.object({
  t: z.string().describe("Rango de tiempo, ej. '0–2\\''"),
  label: z.string().describe("Qué hace el creador en ese tramo"),
});

const RunsheetFormatSchema = z.object({
  id: z.enum(["qa", "goal", "cookalong"]),
  tag: z.string().describe("Etiqueta corta en mayúsculas, ej. 'Q&A EN VIVO'"),
  emoji: z.string(),
  title: z.string(),
  signal: z.string().describe("Por qué este formato conviene, basado en datos del video"),
  best: z.string().describe("Frase corta 'Mejor para: X'"),
  steps: z.array(RunsheetStepSchema).min(3).max(3),
});

const ResponseSchema = z.object({
  formats: z.array(RunsheetFormatSchema).min(3).max(3),
});

export type GenerateRunsheetInput = {
  caption: string;
  hashtags: string[];
  views: number;
  comments: number;
  multiplier: number;
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, reason: "missing_api_key" }, { status: 200 });
  }

  try {
    const body = (await req.json()) as Partial<GenerateRunsheetInput>;
    const { caption, hashtags = [], views = 0, comments = 0, multiplier = 1 } = body;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ResponseSchema,
      prompt: [
        "Eres el motor de sugerencias de 'LIVE Launchpad', una función de TikTok",
        "que convierte el pico viral de un video corto en un LIVE. Analiza el",
        "siguiente video y genera EXACTAMENTE 3 formatos de escaleta (runsheet)",
        "para un LIVE de ~20 minutos, con ids fijos 'qa', 'goal' y 'cookalong',",
        "en español latinoamericano, con tono cercano y accionable.",
        "",
        `Caption: ${caption ?? "(sin caption)"}`,
        `Hashtags: ${hashtags.join(" ")}`,
        `Vistas: ${views} (${multiplier}x su promedio)`,
        `Comentarios: ${comments}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true, formats: object.formats });
  } catch (err) {
    console.error("[generate-runsheet] fallback a mocks:", err);
    return NextResponse.json({ ok: false, reason: "generation_failed" }, { status: 200 });
  }
}
