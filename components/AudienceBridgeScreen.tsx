"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  BellRing,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Info,
  Radio,
  ShieldAlert,
  ShieldCheck,
  VideoOff,
} from "lucide-react";
import { Avatar, StatusBar } from "@/components/chrome";
import {
  BRIDGE_AVATARS,
  BRIDGE_PHASES,
  BRIDGE_TARGET,
  Creator,
  ModCandidate,
  RunsheetFormat,
  TikTokSDK,
  ViralVideo,
} from "@/lib/tiktok-sdk";
import { compact, dots } from "@/lib/format";
import { useInterval } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";

type Props = {
  creator: Creator;
  viralVideo: ViralVideo;
  format: RunsheetFormat;
  onBack: () => void;
  onStart: (viewers: number) => void;
};

// Normas comunitarias mostradas obligatoriamente antes de iniciar cualquier LIVE.
const LIVE_GUIDELINES: { icon: React.ReactNode; text: string }[] = [
  {
    icon: <Ban size={15} className="text-red-400" />,
    text: "Nada de desnudos, contenido sexual o violencia explícita.",
  },
  {
    icon: <Ban size={15} className="text-red-400" />,
    text: "No insultes, amenaces, acoses ni discrimines a otras personas.",
  },
  {
    icon: <AlertTriangle size={15} className="text-amber-400" />,
    text: "No hagas retos o actividades peligrosas, ilegales o que puedan causar daño.",
  },
  {
    icon: <Gift size={15} className="text-tt-pink" />,
    text: "No engañes a tu audiencia ni manipules regalos, ventas, vistas o interacciones.",
  },
  {
    icon: <VideoOff size={15} className="text-tt-cyan" />,
    text: "No transmitas contenido pregrabado, robado o de terceros sin autorización.",
  },
];

export function AudienceBridgeScreen({ creator, viralVideo, format, onBack, onStart }: Props) {
  const activeVertical = useLiveStore((s) => s.activeVertical);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Aviso obligatorio de normas comunitarias: se muestra al presionar
  // "Iniciar LIVE" y debe aceptarse explícitamente antes de la cuenta regresiva.
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const moderator = useLiveStore((s) => s.moderator);
  const setModerator = useLiveStore((s) => s.setModerator);
  const ready = count >= 1200;
  const estimating = count < BRIDGE_TARGET;

  // Teaser de la notificación push + candidatos a moderador: dependen del
  // adaptador del SDK (simula latencia de red, no hace fetch real).
  const [bridgeTeaser, setBridgeTeaser] = useState(viralVideo.caption);
  const [modCandidates, setModCandidates] = useState<ModCandidate[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [bridgeConfig, candidates] = await Promise.all([
        TikTokSDK.Bridge.getConfig(activeVertical),
        TikTokSDK.Bridge.getModCandidates(),
      ]);
      if (!active) return;
      setBridgeTeaser(bridgeConfig.teaser);
      setModCandidates(candidates);
    })();
    return () => {
      active = false;
    };
  }, [activeVertical]);

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

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-2 pt-2">
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
            <Avatar emoji={creator.emoji} hue={12} size={76} ring />
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

        {/* Banner de expectativas: transparente, estilo aviso nativo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-3 flex w-full items-start gap-2.5 rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 backdrop-blur"
        >
          <Info size={14} className="mt-[1px] shrink-0 text-tt-cyan" />
          <AnimatePresence mode="wait">
            <motion.p
              key={estimating ? "calc" : "est"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11.5px] leading-snug text-white/70"
            >
              {estimating ? (
                "Calculando audiencia estimada…"
              ) : (
                <>
                  Se estima que <b className="text-white/90">una parte</b> de los ~
                  {compact(viralVideo.watchingNow)} usuarios viendo tu video se
                  unan. El número final puede variar · preparando tu sala…
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Notificación push simulada */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <img src="/assets/tiktok-icon.svg" alt="TikTok" className="size-9 rounded-[9px] bg-black p-1.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/50">TikTok · ahora</span>
                <BellRing size={12} className="text-white/40" />
              </div>
              <p className="text-[13px] font-bold leading-tight">
                🔴 {creator.handle} está EN VIVO
              </p>
              <p className="truncate text-[12px] text-white/65">{bridgeTeaser}</p>
            </div>
          </div>
        </motion.div>

        {/* ⚠️ Aviso obligatorio de normas comunitarias — visible siempre en la pantalla */}
        <div className="mt-3 w-full rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3.5 backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert size={15} className="text-amber-400" />
            <h3 className="text-[12.5px] font-black uppercase tracking-wide text-amber-300">
              Antes de hacer LIVE
            </h3>
          </div>
          <ul className="flex flex-col gap-1.5">
            {LIVE_GUIDELINES.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-[11.5px] leading-snug text-white/85">
                <span className="mt-[1px] shrink-0">{g.icon}</span>
                <span className="font-medium">{g.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-start gap-1.5 text-[10.5px] leading-snug text-red-300/85">
            <AlertTriangle size={11} className="mt-[1px] shrink-0" />
            Incumplir estas reglas puede resultar en una advertencia, la
            interrupción del LIVE o restricciones en tu cuenta.
          </p>
        </div>

        {/* Panel de configuración Pre-LIVE */}
        <div className="mt-3 w-full divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/8 backdrop-blur">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            <span className="text-[16px]">{format.emoji}</span>
            <div className="flex-1 leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Formato elegido
              </p>
              <p className="text-[12.5px] font-bold">{format.tag}</p>
            </div>
            <Check size={15} className="text-tt-cyan" />
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tt-cyan/12">
              <ShieldCheck size={16} className="text-tt-cyan" />
            </span>
            {moderator ? (
              <>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                    Moderador de confianza
                  </p>
                  <p className="text-[12.5px] font-bold">@{moderator.handle}</p>
                </div>
                <Avatar emoji={moderator.avatar} hue={moderator.hue} size={26} />
                <span className="text-[11px] font-semibold text-tt-cyan">Cambiar</span>
              </>
            ) : (
              <>
                <div className="flex-1 leading-tight">
                  <p className="text-[12.5px] font-bold">Agregar moderador de confianza</p>
                  <p className="text-[10.5px] text-white/45">
                    Silencia spam y fija comentarios por ti
                  </p>
                </div>
                <ChevronRight size={16} className="text-white/40" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* CTA: abre el aviso de normas comunitarias antes de la cuenta regresiva */}
      <div className="px-4 pb-7">
        <AnimatePresence>
          {ready && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setGuidelinesOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tt-pink text-[15px] font-bold shadow-[0_8px_30px_rgba(254,44,85,0.45)]"
            >
              <Radio size={18} /> Iniciar LIVE · {dots(count)} notificados
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-sheet: elegir moderador de confianza */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 z-50 bg-black/65 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-zinc-900 px-5 pb-8 pt-3"
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/25" />
              <h3 className="text-center text-[17px] font-bold">
                Moderador de confianza
              </h3>
              <p className="mb-4 mt-1 text-center text-[12px] text-white/55">
                Podrá silenciar spam y fijar comentarios mientras tú cocinas
              </p>
              <div className="flex flex-col gap-1.5">
                {modCandidates.map((c) => {
                  const active = moderator?.handle === c.handle;
                  return (
                    <button
                      key={c.handle}
                      onClick={() => {
                        setModerator(c);
                        setTimeout(() => setSheetOpen(false), 280);
                      }}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "border-tt-cyan/50 bg-tt-cyan/10"
                          : "border-white/8 bg-white/5"
                      }`}
                    >
                      <Avatar emoji={c.avatar} hue={c.hue} size={40} />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="flex items-center gap-1.5 text-[13.5px] font-bold">
                          @{c.handle}
                          {c.badge && (
                            <span className="rounded bg-tt-cyan/15 px-1.5 py-[1px] text-[9px] font-black tracking-wide text-tt-cyan">
                              {c.badge.toUpperCase()}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-white/50">{c.meta}</p>
                      </div>
                      <span
                        className={`flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                          active ? "border-tt-cyan bg-tt-cyan" : "border-white/25"
                        }`}
                      >
                        {active && <Check size={13} strokeWidth={3.5} className="text-black" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Aviso obligatorio de normas comunitarias: debe aceptarse antes de
          que arranque la cuenta regresiva 3-2-1. */}
      <AnimatePresence>
        {guidelinesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-[3px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 z-50 flex max-h-[88%] flex-col rounded-t-3xl border-t border-amber-400/25 bg-zinc-950 px-5 pb-7 pt-3"
            >
              <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/25" />

              <div className="flex flex-col items-center pb-1 pt-1">
                <span className="flex size-14 items-center justify-center rounded-full bg-amber-400/12 ring-1 ring-amber-400/30">
                  <ShieldAlert size={26} className="text-amber-400" />
                </span>
                <h2 className="mt-3 text-center text-[19px] font-black leading-tight">
                  Antes de hacer LIVE
                </h2>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-2.5">
                  {LIVE_GUIDELINES.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-3.5 py-3"
                    >
                      <span className="mt-[1px] flex size-7 shrink-0 items-center justify-center rounded-full bg-black/40">
                        {g.icon}
                      </span>
                      <p className="text-[13px] font-semibold leading-snug text-white/90">
                        {g.text}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-500/10 px-3.5 py-3 text-[11.5px] leading-snug text-red-300/90">
                  <AlertTriangle size={14} className="mt-[1px] shrink-0" />
                  Incumplir estas reglas puede resultar en una advertencia, la
                  interrupción del LIVE o restricciones en tu cuenta.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setGuidelinesOpen(false);
                    setCountdown(3);
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tt-pink text-[15px] font-bold shadow-[0_8px_30px_rgba(254,44,85,0.4)]"
                >
                  <Check size={18} /> Entendido, ir LIVE
                </motion.button>
                <button
                  onClick={() => setGuidelinesOpen(false)}
                  className="py-1 text-center text-[13px] font-semibold text-white/50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
