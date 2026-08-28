"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, ChevronLeft, Radio } from "lucide-react";
import { Avatar, StatusBar } from "@/components/chrome";
import {
  BRIDGE_AVATARS,
  BRIDGE_PHASES,
  BRIDGE_TARGET,
  CREATOR,
  RunsheetFormat,
} from "@/lib/data";
import { dots } from "@/lib/format";
import { useInterval } from "@/lib/hooks";

type Props = {
  format: RunsheetFormat;
  onBack: () => void;
  onStart: (viewers: number) => void;
};

export function AudienceBridgeScreen({ format, onBack, onStart }: Props) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const ready = count >= 1200;

  // Rampa rápida hacia el objetivo y luego goteo constante (audiencia "inflada")
  useInterval(
    () => setCount((c) => Math.min(BRIDGE_TARGET, c + 42 + Math.floor(Math.random() * 75))),
    count < BRIDGE_TARGET ? 90 : null
  );
  useInterval(
    () => setCount((c) => c + 2 + Math.floor(Math.random() * 8)),
    count >= BRIDGE_TARGET ? 700 : null
  );
  useInterval(
    () => setPhase((p) => Math.min(p + 1, BRIDGE_PHASES.length - 1)),
    phase < BRIDGE_PHASES.length - 1 ? 1100 : null
  );

  // Cuenta regresiva 3-2-1 al iniciar
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onStart(count);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-tt-bg">
      {/* Fondo de resplandor */}
      <div className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-tt-pink/15 blur-[90px]" />

      <StatusBar />
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full bg-white/8"
        >
          <ChevronLeft size={22} />
        </button>
        <img src="/assets/tiktok-live-logo.svg" alt="TikTok LIVE" className="h-5" />
        <span className="size-9" />
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-2">
        <h1 className="text-center text-[20px] font-bold leading-tight">
          Trayendo a tu audiencia
        </h1>
        <p className="mt-1 text-center text-[13px] text-white/60">
          Avisamos a quienes reaccionaron a tu video en las últimas 3 h
        </p>

        {/* Radar de redirección */}
        <div className="relative mt-6 flex size-56 items-center justify-center">
          {[0, 0.8, 1.6].map((d) => (
            <span
              key={d}
              className="absolute inset-0 rounded-full border-2 border-tt-cyan/35"
              style={{ animation: `pulse-ring 2.4s ease-out ${d}s infinite` }}
            />
          ))}
          {BRIDGE_AVATARS.map((emoji, i) => {
            const angle = (i / BRIDGE_AVATARS.length) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return (
              <motion.span
                key={i}
                className="absolute"
                initial={{ x: cos * 150, y: sin * 150, opacity: 0, scale: 0.5 }}
                animate={{ x: cos * 26, y: sin * 26, opacity: [0, 1, 0.9, 0], scale: 1 }}
                transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.32, ease: "easeIn" }}
              >
                <Avatar emoji={emoji} hue={(i * 47) % 360} size={30} />
              </motion.span>
            );
          })}
          <div className="relative z-10">
            <Avatar emoji={CREATOR.emoji} hue={12} size={76} ring />
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-tt-pink px-1.5 py-[1px] text-[9px] font-black tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* Contador dinámico */}
        <motion.p
          key={Math.floor(count / 120)}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className="mt-4 text-[44px] font-black leading-none tabular-nums text-white"
        >
          {dots(count)}
        </motion.p>
        <p className="mt-1 text-[13px] font-semibold text-tt-cyan">
          espectadores notificados
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-1.5 h-5 text-[12px] text-white/50"
          >
            {BRIDGE_PHASES[phase]}
          </motion.p>
        </AnimatePresence>

        {/* Notificación push simulada */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <img src="/assets/tiktok-icon.svg" alt="TikTok" className="size-9 rounded-[9px] bg-black p-1.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/50">TikTok · ahora</span>
                <BellRing size={12} className="text-white/40" />
              </div>
              <p className="text-[13px] font-bold leading-tight">
                🔴 {CREATOR.handle} está EN VIVO
              </p>
              <p className="truncate text-[12px] text-white/65">
                La pasta del video que acabas de ver… ¡en vivo! 🍝
              </p>
            </div>
          </div>
        </motion.div>

        <span className="mt-3 rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-white/70">
          Formato elegido: {format.emoji} {format.tag}
        </span>
      </div>

      {/* CTA */}
      <div className="px-4 pb-7">
        <AnimatePresence>
          {ready && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCountdown(3)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tt-pink text-[15px] font-bold shadow-[0_8px_30px_rgba(254,44,85,0.45)]"
            >
              <Radio size={18} /> Iniciar LIVE · {dots(count)} esperando
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay cuenta regresiva */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-tt-cyan to-tt-pink bg-clip-text text-[110px] font-black text-transparent"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
