"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from "framer-motion";
import { Radio, TrendingUp, Users, Zap } from "lucide-react";
import { ViralVideo } from "@/lib/tiktok-sdk";
import { compact, dots } from "@/lib/format";

type Props = {
  viralVideo: ViralVideo;
  open: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

// Alturas del mini-gráfico de tráfico (últimas 3 h → ahora)
const BARS = [16, 14, 18, 15, 20, 24, 30, 42, 62, 88];

export function SpikePromptModal({ viralVideo, open, onAccept, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl bg-tt-sheet px-5 pb-7 pt-3"
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/25" />

            <div className="mb-4 flex items-center justify-between">
              <img src="/assets/tiktok-live-logo.svg" alt="TikTok LIVE" className="h-6" />
              <span className="flex items-center gap-1 rounded-full bg-tt-pink/15 px-2.5 py-1 text-[11px] font-bold text-tt-pink">
                <TrendingUp size={12} /> PICO DETECTADO
              </span>
            </div>

            {/* Mini gráfico del pico de tráfico */}
            <div className="mb-1 flex h-[74px] items-end gap-[7px] rounded-xl bg-white/5 px-4 pt-3">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, type: "spring", damping: 14 }}
                  className={`flex-1 origin-bottom rounded-t-sm ${
                    i >= BARS.length - 2
                      ? "bg-gradient-to-t from-tt-pink to-tt-cyan"
                      : "bg-white/25"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mb-4 flex justify-between px-1 text-[10px] text-white/40">
              <span>hace 3 h</span>
              <span className="font-bold text-tt-cyan">ahora</span>
            </div>

            <h2 className="mb-1.5 text-[20px] font-bold leading-tight">
              🚀 Tu video está despegando
            </h2>
            <p className="mb-4 text-[14px] leading-snug text-white/70">
              <b className="text-white">{compact(viralVideo.views)} vistas</b> en 3 h —{" "}
              {viralVideo.multiplier}× tu promedio.{" "}
              <b className="text-white">{dots(viralVideo.watchingNow)} personas</b> lo están
              viendo en este momento.
            </p>

            <div className="mb-5 flex gap-2">
              <StatChip icon={<TrendingUp size={12} />} label="+318% reprod." />
              <StatChip icon={<Users size={12} />} label="94% audiencia nueva" />
              <StatChip icon={<Zap size={12} />} label="1.2K comentarios/h" />
            </div>

            <motion.button
              onClick={onAccept}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ["0 0 0 rgba(254,44,85,0.4)", "0 0 26px rgba(254,44,85,0.55)", "0 0 0 rgba(254,44,85,0.4)"] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="mb-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tt-pink text-[15px] font-bold"
            >
              <Radio size={18} /> Ir al LIVE ahora
            </motion.button>
            <p className="mb-3 text-center text-[11px] text-white/45">
              Preparamos tu sala en 30 segundos — sin hoja en blanco.
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-1 text-center text-[13px] font-semibold text-white/55"
            >
              Ahora no
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 text-[10.5px] font-semibold text-white/80">
      <span className="text-tt-cyan">{icon}</span> {label}
    </span>
  );
}
