"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { BellRing, Clock3, Gem, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { Avatar, StatusBar } from "@/components/chrome";
import { CREATOR } from "@/lib/data";
import { dots, mmss } from "@/lib/format";
import { useLiveStore } from "@/lib/store";
import type { LiveStats } from "@/components/LiveRoomScreen";

type Props = {
  stats: LiveStats;
  onRestart: () => void;
};

export function LiveSummaryScreen({ stats, onRestart }: Props) {
  const moderator = useLiveStore((s) => s.moderator);
  const moderatorPinned = useLiveStore((s) => s.moderatorPinned);
  const setModeratorPinned = useLiveStore((s) => s.setModeratorPinned);
  const cards = [
    { icon: <Clock3 size={16} />, label: "Duración", value: mmss(stats.seconds) },
    { icon: <UsersRound size={16} />, label: "Espectadores máx.", value: dots(stats.maxViewers) },
    { icon: <Gem size={16} />, label: "Diamantes", value: `${dots(stats.diamonds)} 💎` },
    { icon: <UserPlus size={16} />, label: "Nuevos seguidores", value: `+${dots(stats.followers)}` },
  ];

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden bg-tt-bg px-6">
      <div className="pointer-events-none absolute -top-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-tt-cyan/12 blur-[90px]" />
      <StatusBar />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 16 }}
        className="mt-8 flex flex-col items-center"
      >
        <div className="relative">
          <Avatar emoji={CREATOR.emoji} hue={12} size={84} ring />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-white px-2 py-[2px] text-[10px] font-black text-black">
            ¡PRIMER LIVE! 🎉
          </span>
        </div>
        <img src="/assets/tiktok-live-logo.svg" alt="TikTok LIVE" className="mt-7 h-6" />
        <h1 className="mt-3 text-center text-[22px] font-bold leading-tight">
          Lo lograste, {CREATOR.name}
        </h1>
        <p className="mt-1 text-center text-[13px] text-white/60">
          Convertiste tu pico viral en tu primera transmisión
        </p>
      </motion.div>

      <div className="mt-7 grid w-full grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.1 }}
            className="rounded-xl border border-white/10 bg-tt-card p-3.5"
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-white/50">
              {c.icon}
              <span className="text-[11px] font-semibold">{c.label}</span>
            </div>
            <p className="text-[20px] font-black tabular-nums">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Fijar moderador de confianza para futuros LIVEs */}
      {moderator && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-4 w-full rounded-2xl border border-tt-cyan/30 bg-tt-cyan/8 p-3.5"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar emoji={moderator.avatar} hue={moderator.hue} size={40} />
              <span className="absolute -bottom-1 -right-1 flex size-[17px] items-center justify-center rounded-full bg-tt-cyan">
                <ShieldCheck size={11} className="text-black" />
              </span>
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[12.5px] font-bold leading-snug">
                Fijar a @{moderator.handle} como moderador de confianza
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/55">
                {moderatorPinned ? (
                  <>
                    <BellRing size={11} className="text-tt-cyan" /> Le avisaremos en
                    tus futuros LIVEs
                  </>
                ) : (
                  "Te ayudó hoy · notifícale tus futuros LIVEs"
                )}
              </p>
            </div>
            <button
              onClick={() => setModeratorPinned(!moderatorPinned)}
              className={`flex h-[28px] w-[48px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
                moderatorPinned ? "justify-end bg-tt-cyan" : "justify-start bg-white/20"
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", damping: 26, stiffness: 500 }}
                className="block size-[22px] rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 rounded-full bg-white/8 px-4 py-2 text-center text-[12px] text-white/70"
      >
        📌 Mejor momento: cuando fijaste la receta · retención +38%
      </motion.p>

      <div className="mt-auto w-full pb-8">
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="h-12 w-full rounded-lg bg-tt-pink text-[15px] font-bold"
        >
          Volver al feed
        </motion.button>
        <p className="mt-2.5 text-center text-[11px] text-white/40">
          Launchpad te avisará en tu próximo pico viral 🚀
        </p>
      </div>
    </div>
  );
}
