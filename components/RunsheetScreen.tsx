"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, Zap } from "lucide-react";
import { StatusBar } from "@/components/chrome";
import { RUNSHEET_FORMATS, RunsheetFormat, VIRAL_VIDEO } from "@/lib/data";

type Props = {
  selected: RunsheetFormat | null;
  onSelect: (f: RunsheetFormat) => void;
  onBack: () => void;
  onContinue: () => void;
};

const ANALYSIS_STEPS = [
  { doneAt: 700, label: "Leyendo 1.240 comentarios de tu video" },
  { doneAt: 1400, label: "Tema detectado: receta de pasta 🍝" },
  { doneAt: 2100, label: "Eligiendo formatos con mejor retención" },
];

export function RunsheetScreen({ selected, onSelect, onBack, onContinue }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const ready = elapsed >= 2500;

  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 100), 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col bg-tt-bg">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full bg-white/8"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <img src="/assets/tiktok-live-logo.svg" alt="TikTok LIVE" className="h-5" />
          <span className="rounded-md bg-gradient-to-r from-tt-cyan to-tt-pink px-1.5 py-0.5 text-[10px] font-black tracking-wide text-black">
            LAUNCHPAD
          </span>
        </div>
        <span className="size-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Tarjeta del video analizado */}
        <div className="relative mb-4 mt-1 flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-tt-card p-3">
          <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#2a1a10] to-[#0d0d0d]">
            <span className="text-2xl">🍝</span>
            {!ready && (
              <span className="absolute inset-x-0 h-8 animate-[scanline_1.3s_linear_infinite] bg-gradient-to-b from-transparent via-tt-cyan/50 to-transparent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{VIRAL_VIDEO.caption}</p>
            <p className="text-[12px] text-white/50">
              412.8K vistas · 12× tu promedio · en pico ahora
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!ready ? (
            /* ------------ FASE 1 · Analizando ------------ */
            <motion.div key="analysis" exit={{ opacity: 0, y: -8 }} className="px-1 pt-2">
              <h1 className="mb-1 text-[20px] font-bold">Generando tu escaleta…</h1>
              <p className="mb-5 text-[13px] text-white/60">
                Nada de hoja en blanco: convertimos tu video en un plan de LIVE.
              </p>
              <div className="flex flex-col gap-3.5">
                {ANALYSIS_STEPS.map((s, i) => {
                  const started = elapsed >= s.doneAt - 600;
                  const done = elapsed >= s.doneAt;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: started ? 1 : 0.25, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      {done ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-tt-cyan">
                          <Check size={13} strokeWidth={3.5} className="text-black" />
                        </span>
                      ) : (
                        <Loader2 size={18} className="animate-spin text-white/40" />
                      )}
                      <span className={`text-[13.5px] ${done ? "text-white" : "text-white/50"}`}>
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ------------ FASE 2 · 3 formatos sugeridos ------------ */
            <motion.div key="formats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="mb-1 px-1 text-[20px] font-bold">Tu escaleta está lista ✨</h1>
              <p className="mb-4 px-1 text-[13px] text-white/60">
                3 formatos generados desde tu video. Elige uno para empezar.
              </p>
              <div className="flex flex-col gap-3">
                {RUNSHEET_FORMATS.map((f, i) => (
                  <FormatCard
                    key={f.id}
                    format={f}
                    index={i}
                    active={selected?.id === f.id}
                    onSelect={() => onSelect(f)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA fija */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-tt-bg via-tt-bg/95 to-transparent px-4 pb-6 pt-8">
        <motion.button
          onClick={onContinue}
          disabled={!selected || !ready}
          whileTap={{ scale: 0.97 }}
          className={`flex h-12 w-full items-center justify-center gap-1.5 rounded-lg text-[15px] font-bold transition-colors ${
            selected && ready ? "bg-tt-pink text-white" : "bg-white/10 text-white/35"
          }`}
        >
          {selected ? "Invitar a mi audiencia" : "Elige un formato"}
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}

function FormatCard({
  format,
  index,
  active,
  onSelect,
}: {
  format: RunsheetFormat;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", damping: 20 }}
      onClick={onSelect}
      className={`relative rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-tt-pink bg-tt-pink/8 shadow-[0_0_0_1px_#fe2c55,0_8px_28px_rgba(254,44,85,0.18)]"
          : "border-white/10 bg-tt-card"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-tt-pink">
          <Check size={13} strokeWidth={3.5} />
        </span>
      )}
      <div className="mb-2.5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-white/8 text-xl">
          {format.emoji}
        </span>
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-tt-cyan">{format.tag}</p>
          <p className="text-[15px] font-bold leading-tight">{format.title}</p>
        </div>
      </div>
      <p className="mb-3 flex items-start gap-1.5 text-[12px] leading-snug text-white/60">
        <Zap size={13} className="mt-[1px] shrink-0 text-tt-pink" fill="#fe2c55" />
        {format.signal}
      </p>
      <div className="mb-2.5 flex flex-col gap-1.5 rounded-lg bg-black/25 p-2.5">
        {format.steps.map((s) => (
          <div key={s.t} className="flex items-baseline gap-2.5">
            <span className="w-11 shrink-0 text-[10.5px] font-bold tabular-nums text-tt-cyan">
              {s.t}
            </span>
            <span className="text-[12px] text-white/85">{s.label}</span>
          </div>
        ))}
      </div>
      <span className="inline-block rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-white/70">
        {format.best}
      </span>
    </motion.button>
  );
}
