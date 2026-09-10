"use client";

// ---------------------------------------------------------------------------
// God Mode · panel de control para pitches/demos en vivo.
// Se activa con Shift+D. Permite saltar de pantalla, forzar una sugerencia
// del Copilot y reiniciar el estado persistido, sin depender del guion
// normal del flujo (5 s de espera, cadencia del Copilot, etc).
// No forma parte del producto: es una herramienta de demostración interna.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Radio, RotateCcw, Sparkles, Wand2, X } from "lucide-react";

export type GodModeStage = "feed" | "runsheet" | "bridge" | "live" | "summary";

const STAGES: { id: GodModeStage; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "runsheet", label: "Runsheet" },
  { id: "bridge", label: "Waiting Room" },
  { id: "live", label: "LIVE Room" },
  { id: "summary", label: "Post-LIVE" },
];

type Props = {
  currentStage: GodModeStage;
  onJumpStage: (stage: GodModeStage) => void;
  onTriggerCopilot: () => void;
  onTriggerViralSurge: () => void;
  onClearStorage: () => void;
};

/** Hook: escucha Shift+D en toda la app y devuelve el estado abierto/cerrado. */
export function useGodModeShortcut() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
}

export function GodModeDrawer({
  currentStage,
  onJumpStage,
  onTriggerCopilot,
  onTriggerViralSurge,
  onClearStorage,
  open,
  onClose,
}: Props & { open: boolean; onClose: () => void }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-w-[400px] rounded-t-3xl border-t border-white/10 bg-zinc-950 px-5 pb-8 pt-3"
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/25" />

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={16} className="text-tt-cyan" />
                <h3 className="text-[15px] font-black tracking-wide">GOD MODE</h3>
                <span className="rounded bg-tt-cyan/15 px-1.5 py-[2px] text-[9px] font-black tracking-wider text-tt-cyan">
                  DEV
                </span>
              </div>
              <button onClick={onClose} className="text-white/50">
                <X size={18} />
              </button>
            </div>

            {/* Saltos de pantalla */}
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Saltar a pantalla
            </p>
            <div className="mb-4 grid grid-cols-3 gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onJumpStage(s.id)}
                  className={`rounded-lg border px-2 py-2 text-[11.5px] font-semibold transition-colors ${
                    currentStage === s.id
                      ? "border-tt-cyan/60 bg-tt-cyan/10 text-tt-cyan"
                      : "border-white/10 bg-white/5 text-white/75"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Acciones de sala LIVE */}
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Sala LIVE
            </p>
            <button
              onClick={onTriggerCopilot}
              disabled={currentStage !== "live"}
              className="mb-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/8 text-[13px] font-bold text-white disabled:opacity-30"
            >
              <Sparkles size={15} className="text-tt-cyan" /> Forzar sugerencia del Copilot
            </button>
            <button
              onClick={onTriggerViralSurge}
              disabled={currentStage !== "live"}
              className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-tt-pink/25 to-orange-500/25 text-[13px] font-bold text-white disabled:opacity-30"
              title="15 mensajes en 1s + 20 corazones + un regalo de alto valor"
            >
              <Flame size={15} className="text-tt-pink" fill="#fe2c55" /> Forzar Ráfaga Viral
            </button>

            {/* Reset de estado */}
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Estado persistido
            </p>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/8 text-[13px] font-bold text-white/85"
              >
                <RotateCcw size={15} /> Borrar localStorage y reiniciar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="h-11 flex-1 rounded-lg bg-white/8 text-[13px] font-semibold text-white/70"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onClearStorage();
                    setConfirmClear(false);
                  }}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-tt-pink text-[13px] font-bold"
                >
                  <Radio size={14} /> Confirmar
                </button>
              </div>
            )}

            <p className="mt-4 text-center text-[10.5px] text-white/30">
              Shift + D para abrir/cerrar · Esc para cerrar
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
