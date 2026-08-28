"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ForYouScreen } from "@/components/ForYouScreen";
import { SpikePromptModal } from "@/components/SpikePromptModal";
import { RunsheetScreen } from "@/components/RunsheetScreen";
import { AudienceBridgeScreen } from "@/components/AudienceBridgeScreen";
import { LiveRoomScreen, LiveStats } from "@/components/LiveRoomScreen";
import { LiveSummaryScreen } from "@/components/LiveSummaryScreen";
import { LIVE_START_VIEWERS, RunsheetFormat } from "@/lib/data";

type Stage = "feed" | "runsheet" | "bridge" | "live" | "summary";

export default function Home() {
  // stage + dirección de navegación (1 = avanzar, -1 = volver) en un solo estado
  const [nav, setNav] = useState<{ stage: Stage; dir: 1 | -1 }>({ stage: "feed", dir: 1 });
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptSeen, setPromptSeen] = useState(false);
  const [format, setFormat] = useState<RunsheetFormat | null>(null);
  const [startViewers, setStartViewers] = useState(LIVE_START_VIEWERS);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const stage = nav.stage;

  // Disparador del Spike Prompt: exactamente 5 s en el feed
  useEffect(() => {
    if (stage !== "feed" || promptSeen) return;
    const t = setTimeout(() => setPromptOpen(true), 5000);
    return () => clearTimeout(t);
  }, [stage, promptSeen]);

  const go = (next: Stage, dir: 1 | -1 = 1) => setNav({ stage: next, dir });

  const resetDemo = () => {
    setPromptSeen(false);
    setPromptOpen(false);
    setFormat(null);
    setStats(null);
    setStartViewers(LIVE_START_VIEWERS);
    go("feed", -1);
  };

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
              spikeAvailable={promptSeen && !promptOpen}
              onOpenSpike={() => setPromptOpen(true)}
            />
          )}

          {stage === "runsheet" && (
            <RunsheetScreen
              selected={format}
              onSelect={setFormat}
              onBack={() => go("feed", -1)}
              onContinue={() => format && go("bridge", 1)}
            />
          )}

          {stage === "bridge" && format && (
            <AudienceBridgeScreen
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
              format={format}
              startViewers={startViewers}
              onEnd={(s) => {
                setStats(s);
                go("summary", 1);
              }}
            />
          )}

          {stage === "summary" && stats && (
            <LiveSummaryScreen stats={stats} onRestart={resetDemo} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Spike Prompt: modal invasivo sobre el feed */}
      {stage === "feed" && (
        <SpikePromptModal
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
    </div>
  );
}
