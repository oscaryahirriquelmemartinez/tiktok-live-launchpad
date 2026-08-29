"use client";

import { useEffect, useRef, useState } from "react";
import {
  COPILOT_CUES,
  COPILOT_FIRST_DELAY_MS,
  COPILOT_INTERVAL_MS,
  CopilotCue,
} from "@/lib/data";

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
      const { muted, skip } = optsRef.current;
      for (let n = 0; n < COPILOT_CUES.length; n++) {
        const next = COPILOT_CUES[queueRef.current % COPILOT_CUES.length];
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

  return { cue, cueSeq, dismiss: () => setCue(null) };
}
