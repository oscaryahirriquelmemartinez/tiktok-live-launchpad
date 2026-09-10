"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatEvent,
  COPILOT_FIRST_DELAY_MS,
  COPILOT_INTERVAL_MS,
  CopilotCue,
  randomInt,
  ViewerChannel,
} from "@/lib/tiktok-sdk";

/** Contador animado con easing (rAF). Arranca al montar o al cambiar target. */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = Math.round(from + (target - from) * eased);
      setValue(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

/** setInterval declarativo que se limpia solo. delay=null lo pausa. */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Generador de sugerencias del LIVE Copilot con cadencia relajada.
 * Emite una sugerencia cada ~17 s (la primera a los 7 s), saltando las
 * categorías silenciadas (opt-out) y las marcadas en `skip` (estado de sala).
 */
export function useCopilotMessages(opts: {
  cues: CopilotCue[];
  muted: CopilotCue["id"][];
  skip?: Partial<Record<CopilotCue["id"], boolean>>;
  autoHideMs?: number;
}) {
  const { autoHideMs = 9000 } = opts;
  const [cue, setCue] = useState<CopilotCue | null>(null);
  const [cueSeq, setCueSeq] = useState(0);
  const [started, setStarted] = useState(false);
  const queueRef = useRef(0);
  const optsRef = useRef(opts);
  const emitRef = useRef(() => {});

  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  useEffect(() => {
    emitRef.current = () => {
      const { cues, muted, skip } = optsRef.current;
      for (let n = 0; n < cues.length; n++) {
        const next = cues[queueRef.current % cues.length];
        queueRef.current += 1;
        if (muted.includes(next.id) || skip?.[next.id]) continue;
        setCue(next);
        setCueSeq((s) => s + 1);
        return;
      }
    };
  }, []);

  // Primera sugerencia tras un breve delay; luego cadencia fija
  useEffect(() => {
    const t = setTimeout(() => {
      emitRef.current();
      setStarted(true);
    }, COPILOT_FIRST_DELAY_MS);
    return () => clearTimeout(t);
  }, []);
  useInterval(() => emitRef.current(), started ? COPILOT_INTERVAL_MS : null);

  // Auto-dismiss si el creador no actúa
  useEffect(() => {
    if (!cue) return;
    const t = setTimeout(() => setCue(null), autoHideMs);
    return () => clearTimeout(t);
  }, [cue, cueSeq, autoHideMs]);

  return {
    cue,
    cueSeq,
    dismiss: () => setCue(null),
    /** Fuerza la siguiente sugerencia de la cola ahora mismo (usado por God Mode). */
    trigger: () => emitRef.current(),
  };
}

/**
 * Motor de chat orgánico: en vez de un `setInterval` con cadencia fija,
 * agenda el siguiente mensaje con un retardo aleatorio (`minDelayMs`–
 * `maxDelayMs`) y de vez en cuando ("ráfagas") suelta 3-5 mensajes de golpe
 * para simular picos de emoción reales de un LIVE viral.
 *
 * Los eventos se piden a un `ViewerChannel` ya conectado (`TikTokSDK.Viewer
 * .connect()`), no a `lib/data.ts` directamente — la capa de datos queda
 * detrás del adaptador del SDK. El propio `next()`/`surge()` del canal no
 * tiene latencia añadida (solo el `connect()` inicial la paga, como un
 * WebSocket real), así que este hook sigue sin hacer fetch ni trabajo
 * pesado dentro de su bucle: solo pide eventos ya generados y llama
 * `onEvent`. Si el canal todavía no conectó (`channel === null`), el motor
 * sigue agendando pero no emite nada, para no bloquear el timing.
 */
export function useOrganicChat(opts: {
  channel: ViewerChannel | null;
  onEvent: (ev: ChatEvent) => void;
  minDelayMs?: number;
  maxDelayMs?: number;
  burstChance?: number;
  paused?: boolean;
}) {
  const { minDelayMs = 50, maxDelayMs = 600, burstChance = 0.12, paused = false } = opts;
  const onEventRef = useRef(opts.onEvent);
  const channelRef = useRef(opts.channel);
  const pausedRef = useRef(paused);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onEventRef.current = opts.onEvent;
  }, [opts.onEvent]);
  useEffect(() => {
    channelRef.current = opts.channel;
  }, [opts.channel]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let active = true;

    const scheduleNext = () => {
      const delay = randomInt(minDelayMs, maxDelayMs);
      timeoutRef.current = setTimeout(() => {
        if (!active) return;
        const channel = channelRef.current;
        if (!pausedRef.current && channel) {
          const isBurst = Math.random() < burstChance;
          const count = isBurst ? randomInt(3, 5) : 1;
          for (let i = 0; i < count; i++) onEventRef.current(channel.next());
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      active = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [minDelayMs, maxDelayMs, burstChance]);

  /** Inyecta `count` mensajes espaciados en ~1 s (usado por God Mode: Viral Surge). */
  const surge = useCallback((count = 15, windowMs = 1000) => {
    const channel = channelRef.current;
    if (!channel) return;
    const step = Math.max(20, Math.floor(windowMs / count));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const c = channelRef.current;
        if (c) onEventRef.current(c.next());
      }, i * step);
    }
  }, []);

  return { surge };
}
