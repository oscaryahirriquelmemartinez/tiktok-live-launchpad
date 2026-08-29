"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellOff,
  Gift,
  Heart,
  MoreHorizontal,
  Pin,
  Share2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Avatar, StatusBar, VideoBackdrop } from "@/components/chrome";
import {
  CHAT_LOOP_SECONDS,
  CHAT_SCRIPT,
  ChatEvent,
  COPILOT_ACTIONS,
  CREATOR,
  GIFT_GOAL,
  RunsheetFormat,
} from "@/lib/data";
import { dots, mmss } from "@/lib/format";
import { useCopilotMessages, useInterval } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";

export type LiveStats = {
  seconds: number;
  maxViewers: number;
  diamonds: number;
  followers: number;
};

type Props = {
  format: RunsheetFormat;
  startViewers: number;
  onEnd: (stats: LiveStats) => void;
};

type Message = { id: number; ev: ChatEvent; creator?: boolean };
type HeartParticle = { id: number; x: number; drift: number; size: number; pink: boolean };

const CONFETTI = ["🎉", "🌹", "✨", "🎊", "💎", "🌹", "✨", "🎉", "💖", "🎊", "🌹", "✨"];

export function LiveRoomScreen({ format, startViewers, onEnd }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [viewers, setViewers] = useState(startViewers);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinned, setPinned] = useState<string | null>(null);
  const [question, setQuestion] = useState<{ user: string; text: string } | null>(null);
  const [goalAnnounced, setGoalAnnounced] = useState(format.id === "goal");
  const [roses, setRoses] = useState(87);
  const [diamonds, setDiamonds] = useState(214);
  const [giftBanner, setGiftBanner] = useState<ChatEvent | null>(null);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);
  const [copilotDone, setCopilotDone] = useState(0);
  const [muteNotice, setMuteNotice] = useState(false);

  // Estado global persistido: categorías silenciadas del Copilot (opt-out)
  const mutedCategories = useLiveStore((s) => s.mutedCategories);
  const muteCategory = useLiveStore((s) => s.muteCategory);

  // Copilot con cadencia relajada (~17 s) que respeta la lista negra
  const { cue, cueSeq, dismiss } = useCopilotMessages({
    muted: mutedCategories,
    skip: { pin: !!pinned, goal: goalAnnounced },
  });

  const clockRef = useRef(0);
  const idRef = useRef(0);
  const maxViewersRef = useRef(startViewers);
  const firedChat = useRef(new Set<number>());
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const pushMessage = (ev: ChatEvent, creator = false) =>
    setMessages((m) => [...m, { id: ++idRef.current, ev, creator }].slice(-22));

  // ---- Reloj maestro del guion (bucle infinito) --------------------------
  useInterval(() => {
    const prevLoop = clockRef.current % CHAT_LOOP_SECONDS;
    clockRef.current += 0.25;
    const loopT = clockRef.current % CHAT_LOOP_SECONDS;
    if (loopT < prevLoop) {
      firedChat.current.clear();
    }

    CHAT_SCRIPT.forEach((ev, i) => {
      if (ev.at <= loopT && !firedChat.current.has(i)) {
        firedChat.current.add(i);
        pushMessage(ev);
        if (ev.kind === "gift" && ev.gift) {
          setDiamonds((d) => d + ev.gift!.diamonds);
          if (ev.gift.name === "Rosa") setRoses((r) => r + ev.gift!.count);
          if (ev.gift.diamonds >= 60) {
            setGiftBanner(ev);
            setTimeout(() => setGiftBanner(null), 3400);
          }
        }
      }
    });
  }, 250);

  // ---- Métricas vivas -----------------------------------------------------
  useInterval(() => setElapsed((e) => e + 1), 1000);
  useInterval(() => {
    setViewers((v) => {
      const next = v + (Math.random() > 0.82 ? -Math.floor(Math.random() * 20) : 15 + Math.floor(Math.random() * 60));
      maxViewersRef.current = Math.max(maxViewersRef.current, next);
      return next;
    });
  }, 900);
  useInterval(() => {
    const id = ++idRef.current;
    setHearts((h) => [
      ...h.slice(-9),
      { id, x: Math.random() * 26 - 13, drift: Math.random() * 44 - 22, size: 16 + Math.random() * 14, pink: Math.random() > 0.4 },
    ]);
    setTimeout(() => setHearts((h) => h.filter((p) => p.id !== id)), 2500);
  }, 620);

  // Auto-scroll del chat
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // ---- Acción del Copilot -------------------------------------------------
  const runCueAction = () => {
    if (!cue) return;
    const fx = COPILOT_ACTIONS[cue.id];
    if (fx.pin) setPinned(fx.pin);
    if (fx.chat)
      pushMessage(
        { at: 0, kind: "chat", user: CREATOR.handle, avatar: CREATOR.emoji, hue: 12, text: fx.chat },
        true
      );
    if (cue.id === "question") {
      setQuestion({ user: "maria.fit", text: "¿se puede hacer sin crema? 🤔" });
      setTimeout(() => setQuestion(null), 6000);
    }
    if (cue.id === "goal") {
      setGoalAnnounced(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
    if (cue.id === "welcome") setViewers((v) => v + 300);
    setCopilotDone((n) => n + 1);
    dismiss();
  };

  // Opt-out: silencia la categoría del cue actual por el resto de la sesión
  const muteCue = () => {
    if (!cue) return;
    muteCategory(cue.id);
    dismiss();
    setMuteNotice(true);
    setTimeout(() => setMuteNotice(false), 2600);
  };

  const finish = () =>
    onEnd({
      seconds: elapsed,
      maxViewers: maxViewersRef.current,
      diamonds,
      followers: Math.round(maxViewersRef.current * 0.16),
    });

  const rosesPct = Math.min(100, (roses / GIFT_GOAL) * 100);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <VideoBackdrop dim={0.32} />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-72 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <StatusBar />

      {/* ---- Cabecera de la sala ---- */}
      <div className="absolute inset-x-0 top-11 z-30 flex items-center gap-2 px-3 py-1.5">
        <div className="flex items-center gap-2 rounded-full bg-black/40 py-1 pl-1 pr-3 backdrop-blur">
          <Avatar emoji={CREATOR.emoji} hue={12} size={30} />
          <div className="leading-tight">
            <p className="text-[12.5px] font-bold">{CREATOR.handle}</p>
            <p className="text-[10px] text-white/60">{dots(diamonds)} 💎</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-tt-pink px-1.5 py-[3px] text-[10px] font-black tracking-wider">
          LIVE <span className="tabular-nums">{mmss(elapsed)}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <motion.span
            key={Math.floor(viewers / 100)}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1.5 text-[12px] font-bold tabular-nums backdrop-blur"
          >
            <UsersRound size={13} /> {dots(viewers)}
          </motion.span>
          <button
            onClick={() => setEndConfirm(true)}
            className="flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ---- Stack superior: Copilot (anclado arriba) + meta + fijado ---- */}
      <div className="absolute inset-x-3 top-[94px] z-30 flex flex-col gap-2">
        {/* LIVE Copilot: entra deslizándose desde arriba, sin tapar la cara */}
        <AnimatePresence mode="popLayout">
          {cue && (
            <motion.div
              key={`${cue.id}-${cueSeq}`}
              initial={{ y: -28, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -18, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="rounded-2xl border border-tt-cyan/45 bg-[#0e0f16]/95 p-3 shadow-[0_0_28px_rgba(37,244,238,0.16)] backdrop-blur-md"
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-tt-cyan" fill="#25f4ee" />
                <span className="text-[10px] font-black tracking-[0.16em] text-tt-cyan">
                  LIVE COPILOT
                </span>
                <span className="relative ml-0.5 flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tt-cyan opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-tt-cyan" />
                </span>
                <button
                  onClick={muteCue}
                  title="No volver a sugerir esto"
                  className="ml-auto flex items-center gap-1 rounded-full bg-white/8 px-2 py-[3px] text-[10px] font-semibold text-white/45"
                >
                  <BellOff size={11} /> Silenciar
                </button>
                <button onClick={dismiss} className="text-white/40">
                  <X size={15} />
                </button>
              </div>
              <div className="mb-2.5 flex items-start gap-2.5">
                <span className="text-[22px] leading-none">{cue.icon}</span>
                <div>
                  <p className="text-[13.5px] font-bold leading-tight">{cue.title}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-white/65">{cue.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={runCueAction}
                  className="h-8 rounded-full bg-tt-pink px-4 text-[12px] font-bold"
                >
                  {cue.action}
                </motion.button>
                <button onClick={dismiss} className="text-[12px] font-semibold text-white/45">
                  Omitir
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmación de opt-out */}
        <AnimatePresence>
          {muteNotice && (
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 self-center rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur"
            >
              <BellOff size={12} className="text-tt-cyan" />
              <span className="text-[11.5px] font-semibold text-white/80">
                Listo, no verás más sugerencias de este tipo
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meta de regalos */}
        <AnimatePresence>
          {goalAnnounced && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur"
            >
              <span className="text-[14px]">🌹</span>
              <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-tt-pink to-[#ff7a9e]"
                  animate={{ width: `${rosesPct}%` }}
                  transition={{ type: "spring", damping: 20 }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-white/85">
                {roses}/{GIFT_GOAL} · secreto 🤫
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comentario fijado */}
        <AnimatePresence>
          {pinned && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-tt-cyan/30 bg-black/55 p-2.5 backdrop-blur"
            >
              <Pin size={13} className="mt-[2px] shrink-0 text-tt-cyan" fill="#25f4ee" />
              <p className="text-[12px] font-semibold leading-snug">{pinned}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Banner de regalo grande ---- */}
      <AnimatePresence>
        {giftBanner?.gift && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 18 }}
            className="absolute left-3 top-[248px] z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-tt-pink/85 to-[#7a2bfe]/85 py-1.5 pl-1.5 pr-4 backdrop-blur"
          >
            <Avatar emoji={giftBanner.avatar} hue={giftBanner.hue} size={28} />
            <div className="leading-tight">
              <p className="text-[11.5px] font-bold">@{giftBanner.user}</p>
              <p className="text-[10.5px] text-white/85">
                envió {giftBanner.gift.name} ×{giftBanner.gift.count}
              </p>
            </div>
            <span className="ml-1 text-[22px]">{giftBanner.gift.emoji}</span>
            <span className="text-[11px] font-black text-yellow-200">
              +{giftBanner.gift.diamonds} 💎
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Pregunta destacada ---- */}
      <AnimatePresence>
        {question && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="absolute left-1/2 top-[300px] z-20 w-[78%] -translate-x-1/2 rounded-2xl border border-tt-cyan/40 bg-black/70 p-3.5 text-center backdrop-blur-md"
          >
            <p className="mb-1 text-[10px] font-black tracking-[0.16em] text-tt-cyan">
              PREGUNTA DESTACADA
            </p>
            <p className="text-[15px] font-bold leading-snug">«{question.text}»</p>
            <p className="mt-1 text-[11px] text-white/55">@{question.user}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Confetti ---- */}
      {confetti && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-40 flex justify-center">
          {CONFETTI.map((c, i) => (
            <motion.span
              key={i}
              className="absolute text-[22px]"
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: 190 + (i % 4) * 40,
                x: (i - CONFETTI.length / 2) * 30,
                opacity: 0,
                rotate: i % 2 ? 220 : -220,
              }}
              transition={{ duration: 1.9, ease: "easeOut", delay: i * 0.04 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      )}

      {/* ---- Chat ---- */}
      <div
        ref={chatBoxRef}
        className="absolute bottom-[62px] left-3 z-20 flex h-[236px] w-[74%] flex-col gap-1.5 overflow-y-auto pr-2"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 18%)" }}
      >
        {messages.map((m) => (
          <ChatRow key={m.id} msg={m} />
        ))}
      </div>

      {/* ---- Corazones flotantes ---- */}
      <div className="pointer-events-none absolute bottom-[70px] right-7 z-20">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              className="absolute bottom-0 right-0"
              initial={{ y: 0, x: h.x, opacity: 0.95, scale: 0.6 }}
              animate={{ y: -250, x: h.x + h.drift, opacity: 0, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
            >
              <Heart
                size={h.size}
                strokeWidth={0}
                fill={h.pink ? "#fe2c55" : "#ffffff"}
                style={{ opacity: h.pink ? 1 : 0.85 }}
              />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* ---- Barra inferior ---- */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 px-3 pb-4 pt-1">
        <div className="flex h-10 flex-1 items-center rounded-full bg-white/12 px-4 text-[13px] text-white/55 backdrop-blur">
          Añade un comentario…
        </div>
        <button className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-tt-pink to-[#a02bfe]">
          <Gift size={19} />
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white/12 backdrop-blur">
          <Share2 size={18} />
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-white/12 backdrop-blur">
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* ---- Confirmación de cierre ---- */}
      <AnimatePresence>
        {endConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEndConfirm(false)}
              className="absolute inset-0 z-40 bg-black/65 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl bg-tt-sheet p-5 pb-8"
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/25" />
              <h3 className="mb-1 text-center text-[17px] font-bold">¿Terminar tu LIVE?</h3>
              <p className="mb-5 text-center text-[13px] text-white/60">
                Todavía hay <b className="text-white">{dots(viewers)} personas</b> en tu sala ·
                el Copilot te asistió {copilotDone} veces
              </p>
              <button
                onClick={() => setEndConfirm(false)}
                className="mb-2.5 h-12 w-full rounded-lg bg-tt-pink text-[15px] font-bold"
              >
                Seguir en vivo
              </button>
              <button
                onClick={finish}
                className="h-12 w-full rounded-lg bg-white/10 text-[15px] font-semibold text-white/80"
              >
                Terminar ahora
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatRow({ msg }: { msg: Message }) {
  const { ev, creator } = msg;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 380 }}
      className={`w-fit max-w-full rounded-2xl px-2.5 py-1.5 ${
        ev.kind === "gift"
          ? "border border-tt-pink/40 bg-tt-pink/20"
          : creator
            ? "border border-tt-cyan/35 bg-tt-cyan/10"
            : "bg-black/35"
      }`}
    >
      <div className="flex items-start gap-2">
        <Avatar emoji={ev.avatar} hue={ev.hue} size={21} />
        <p className="min-w-0 text-[12.5px] leading-[1.35]">
          <span className={`mr-1.5 font-semibold ${creator ? "text-tt-cyan" : "text-white/55"}`}>
            {ev.user}
            {creator && (
              <span className="ml-1 rounded bg-tt-cyan/20 px-1 py-[1px] text-[9px] font-black text-tt-cyan">
                CREADORA
              </span>
            )}
          </span>
          {ev.kind === "join" && <span className="italic text-white/50">se unió 👋</span>}
          {ev.kind === "chat" && <span className="text-white/95">{ev.text}</span>}
          {ev.kind === "gift" && ev.gift && (
            <span className="font-semibold text-white">
              envió {ev.gift.name} {ev.gift.emoji} ×{ev.gift.count}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
