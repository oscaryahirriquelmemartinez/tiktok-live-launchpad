"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ForYouScreen } from "@/components/ForYouScreen";
import { SpikePromptModal } from "@/components/SpikePromptModal";
import { RunsheetScreen } from "@/components/RunsheetScreen";
import { AudienceBridgeScreen } from "@/components/AudienceBridgeScreen";
import { LiveRoomScreen, LiveStats } from "@/components/LiveRoomScreen";
import { LiveSummaryScreen } from "@/components/LiveSummaryScreen";
import { GodModeDrawer, useGodModeShortcut } from "@/components/GodModeDrawer";
import { useLiveStore } from "@/lib/store";
import { LiveSession, RunsheetFormat, TikTokSDK } from "@/lib/tiktok-sdk";

type Stage = "feed" | "runsheet" | "bridge" | "live" | "summary";

export default function Home() {
  // stage + dirección de navegación (1 = avanzar, -1 = volver) en un solo estado
  const [nav, setNav] = useState<{ stage: Stage; dir: 1 | -1 }>({ stage: "feed", dir: 1 });
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptSeen, setPromptSeen] = useState(false);
  const [format, setFormat] = useState<RunsheetFormat | null>(null);
  const [startViewers, setStartViewers] = useState(0);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const stage = nav.stage;

  // ---- Bootstrap de sesión vía TikTokSDK (compliance mock layer) ----------
  // Nada de esto llama a un backend real: `TikTokSDK.Live.createSession()`
  // y `TikTokSDK.Runsheet.getDefaultFormats()` son adaptadores locales sobre
  // `lib/data.ts` con latencia de red simulada. Ver lib/tiktok-sdk/index.ts.
  const [session, setSession] = useState<LiveSession | null>(null);
  const [defaultFormats, setDefaultFormats] = useState<RunsheetFormat[]>([]);

  useEffect(() => {
    (async () => {
      const [s, formats] = await Promise.all([
        TikTokSDK.Live.createSession(),
        TikTokSDK.Runsheet.getDefaultFormats(),
      ]);
      setSession(s);
      setDefaultFormats(formats);
      setStartViewers(s.liveConfig.defaultStartViewers);
    })();
  }, []);

  // Disparador del Spike Prompt: exactamente 5 s en el feed
  useEffect(() => {
    if (stage !== "feed" || promptSeen || !session) return;
    const t = setTimeout(() => setPromptOpen(true), 5000);
    return () => clearTimeout(t);
  }, [stage, promptSeen, session]);

  const go = (next: Stage, dir: 1 | -1 = 1) => setNav({ stage: next, dir });

  const resetDemo = () => {
    setPromptSeen(false);
    setPromptOpen(false);
    setFormat(null);
    setStats(null);
    setStartViewers(session?.liveConfig.defaultStartViewers ?? 0);
    useLiveStore.getState().resetSession();
    go("feed", -1);
  };

  // ---- God Mode (Shift+D): control de pitch/demo ---------------------------
  const godMode = useGodModeShortcut();

  const handleGodModeJump = (next: Stage) => {
    // Cualquier pantalla posterior al feed necesita un formato elegido;
    // God Mode rellena defaults sensatos (del SDK) para poder saltar libremente.
    if ((next === "bridge" || next === "live" || next === "summary") && !format) {
      setFormat(defaultFormats[0] ?? null);
    }
    if (next === "summary" && !stats) {
      setStats({ seconds: 620, maxViewers: startViewers, diamonds: 214, followers: Math.round(startViewers * 0.16) });
    }
    if (next === "feed") {
      setPromptSeen(true);
      setPromptOpen(false);
    }
    go(next, 1);
    godMode.setOpen(false);
  };

  const handleGodModeClearStorage = () => {
    resetDemo();
    if (typeof window !== "undefined") window.localStorage.clear();
    godMode.setOpen(false);
  };

  const handleGodModeTriggerCopilot = () => {
    window.dispatchEvent(new CustomEvent("godmode:trigger-copilot"));
  };

  const handleGodModeViralSurge = () => {
    window.dispatchEvent(new CustomEvent("godmode:viral-surge"));
  };

  // Sesión aún "conectando" (latencia simulada del SDK, ~300ms) — evita
  // renderizar pantallas que dependen de `session`/`defaultFormats`.
  if (!session) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <span className="text-[12px] font-semibold tracking-wide text-white/40">
          Conectando con TikTok LIVE…
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <AnimatePresence custom={nav.dir} initial={false}>
        <motion.div
          key={stage}
          custom={nav.dir}
          variants={{
            enter: (d: number) => ({ x: d * 70, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d * -70, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="absolute inset-0"
        >
          {stage === "feed" && (
            <ForYouScreen
              creator={session.creator}
              viralVideo={session.viralVideo}
              spikeAvailable={promptSeen && !promptOpen}
              onOpenSpike={() => setPromptOpen(true)}
            />
          )}

          {stage === "runsheet" && (
            <RunsheetScreen
              viralVideo={session.viralVideo}
              defaultFormats={defaultFormats}
              selected={format}
              onSelect={setFormat}
              onBack={() => go("feed", -1)}
              onContinue={() => format && go("bridge", 1)}
            />
          )}

          {stage === "bridge" && format && (
            <AudienceBridgeScreen
              creator={session.creator}
              viralVideo={session.viralVideo}
              format={format}
              onBack={() => go("runsheet", -1)}
              onStart={(viewers) => {
                setStartViewers(viewers);
                go("live", 1);
              }}
            />
          )}

          {stage === "live" && format && (
            <LiveRoomScreen
              sessionId={session.sessionId}
              creator={session.creator}
              giftGoal={session.liveConfig.giftGoal}
              format={format}
              startViewers={startViewers}
              onEnd={(s) => {
                setStats(s);
                go("summary", 1);
              }}
            />
          )}

          {stage === "summary" && stats && (
            <LiveSummaryScreen creator={session.creator} stats={stats} onRestart={resetDemo} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Spike Prompt: modal invasivo sobre el feed */}
      {stage === "feed" && (
        <SpikePromptModal
          viralVideo={session.viralVideo}
          open={promptOpen}
          onAccept={() => {
            setPromptOpen(false);
            setPromptSeen(true);
            go("runsheet", 1);
          }}
          onDismiss={() => {
            setPromptOpen(false);
            setPromptSeen(true);
          }}
        />
      )}

      {/* God Mode: panel de control de pitch/demo, oculto tras Shift+D */}
      <GodModeDrawer
        open={godMode.open}
        onClose={() => godMode.setOpen(false)}
        currentStage={stage}
        onJumpStage={handleGodModeJump}
        onTriggerCopilot={handleGodModeTriggerCopilot}
        onTriggerViralSurge={handleGodModeViralSurge}
        onClearStorage={handleGodModeClearStorage}
      />
    </div>
  );
}
