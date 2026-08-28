"use client";

import { Wifi } from "lucide-react";

/** Barra de estado iOS simulada (hora canónica fija para evitar hidratación). */
export function StatusBar({ light = true }: { light?: boolean }) {
  const color = light ? "text-white" : "text-black";
  return (
    <div
      className={`relative z-30 flex h-11 items-center justify-between px-6 pt-2 ${color}`}
    >
      <span className="text-[15px] font-semibold tracking-wide">9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalBars />
        <Wifi size={15} strokeWidth={2.5} />
        <Battery />
      </div>
    </div>
  );
}

function SignalBars() {
  return (
    <div className="flex items-end gap-[2px]">
      {[4, 6, 8, 10].map((h) => (
        <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: h }} />
      ))}
    </div>
  );
}

function Battery() {
  return (
    <div className="flex items-center gap-[2px]">
      <div className="flex h-[11px] w-[22px] items-center rounded-[3px] border border-current/60 p-[1.5px]">
        <div className="h-full w-[70%] rounded-[1.5px] bg-current" />
      </div>
      <span className="h-[4px] w-[1.5px] rounded-r-sm bg-current/60" />
    </div>
  );
}

/** Avatar circular con gradiente + emoji, determinista por hue. */
export function Avatar({
  emoji,
  hue,
  size = 24,
  ring = false,
}: {
  emoji: string;
  hue: number;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${
        ring ? "border-[1.5px] border-white" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        background: `linear-gradient(135deg, hsl(${hue} 80% 55%), hsl(${(hue + 60) % 360} 80% 40%))`,
      }}
    >
      {emoji}
    </span>
  );
}

/**
 * "Video" simulado: fondo oscuro animado (permitido por brief) con escena
 * de cocina abstracta — plato + vapor + luz cálida con paneo lento.
 */
export function VideoBackdrop({ dim = 0 }: { dim?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0 animate-[gradpan_14s_ease-in-out_infinite]"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 20% 10%, #2a1a10 0%, transparent 55%)," +
            "radial-gradient(110% 80% at 85% 25%, #101c22 0%, transparent 60%)," +
            "radial-gradient(130% 100% at 50% 95%, #1d1206 0%, #0a0a0a 70%)",
          backgroundSize: "180% 180%",
        }}
      />
      {/* Escena: plato de pasta con vapor */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative -mt-14 animate-[kenburns_16s_ease-in-out_infinite]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute -top-12 left-1/2 h-14 w-4 rounded-full bg-white/25 blur-md"
              style={{
                marginLeft: (i - 1) * 22 - 8,
                animation: `steam 3.2s ease-out ${i * 1.1}s infinite`,
              }}
            />
          ))}
          <div
            className="flex size-52 items-center justify-center rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
            style={{
              background:
                "radial-gradient(circle at 38% 32%, #fdf6e6 0%, #efe2c4 45%, #d9c79e 72%, #b39a6b 100%)",
            }}
          >
            <span className="text-[104px] leading-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]">
              🍝
            </span>
          </div>
        </div>
      </div>
      {/* Viñeta + atenuación opcional (sala LIVE) */}
      <div className="absolute inset-0 shadow-[inset_0_0_140px_60px_rgba(0,0,0,0.65)]" />
      {dim > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: dim }} />
      )}
    </div>
  );
}
