"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Flame,
  Forward,
  Heart,
  Home,
  MessageCircle,
  Music2,
  Plus,
  Search,
  Tv,
  User,
  UsersRound,
  MessageSquareText,
} from "lucide-react";
import { Avatar, StatusBar, VideoBackdrop } from "@/components/chrome";
import { Creator, ViralVideo } from "@/lib/tiktok-sdk";
import { compact } from "@/lib/format";
import { useInterval } from "@/lib/hooks";

type Props = {
  creator: Creator;
  viralVideo: ViralVideo;
  spikeAvailable: boolean; // el prompt fue cerrado: mostrar pill para reabrirlo
  onOpenSpike: () => void;
};

export function ForYouScreen({ creator, viralVideo, spikeAvailable, onOpenSpike }: Props) {
  // Inercia viral simulada: contadores subiendo en vivo (solo cliente)
  const [likes, setLikes] = useState(viralVideo.likesStart);
  const [comments, setComments] = useState(viralVideo.comments);
  const [shares, setShares] = useState(viralVideo.shares);

  // Si cambia la vertical activa (God Mode), reinicia los contadores al
  // punto de partida del nuevo video viral en vez de arrastrar el anterior.
  useEffect(() => {
    setLikes(viralVideo.likesStart);
    setComments(viralVideo.comments);
    setShares(viralVideo.shares);
  }, [viralVideo]);

  useInterval(() => {
    setLikes((v) => v + 40 + Math.floor(Math.random() * 90));
    if (Math.random() > 0.45) setComments((v) => v + 1 + Math.floor(Math.random() * 3));
    if (Math.random() > 0.6) setShares((v) => v + 1 + Math.floor(Math.random() * 2));
  }, 300);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <VideoBackdrop />

      {/* Gradientes de legibilidad */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <StatusBar />

      {/* Barra superior: LIVE · Siguiendo | Para ti · Buscar */}
      <div className="absolute inset-x-0 top-11 z-20 flex items-center justify-between px-4 py-1.5">
        <Tv size={24} strokeWidth={1.8} className="text-white" />
        <div className="flex items-end gap-5">
          <span className="text-[16px] font-semibold text-white/60">Siguiendo</span>
          <div className="relative">
            <span className="text-[17px] font-bold">Para ti</span>
            <span className="absolute -bottom-[7px] left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-white" />
          </div>
        </div>
        <Search size={24} strokeWidth={2.2} className="text-white" />
      </div>

      {/* Pill de pico viral (si el creador cerró el prompt) */}
      {spikeAvailable && (
        <motion.button
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={onOpenSpike}
          className="absolute left-1/2 top-24 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-tt-pink px-3.5 py-1.5 text-[12px] font-bold shadow-[0_6px_20px_rgba(254,44,85,0.45)]"
        >
          <Flame size={13} fill="white" /> Pico viral en curso · Ir al LIVE
        </motion.button>
      )}

      {/* Botonera derecha */}
      <div className="absolute bottom-[120px] right-1.5 z-20 flex w-16 flex-col items-center gap-[18px]">
        <div className="relative mb-1">
          <Avatar emoji={creator.emoji} hue={12} size={47} ring />
          <span className="absolute -bottom-2 left-1/2 flex size-[18px] -translate-x-1/2 items-center justify-center rounded-full bg-tt-pink">
            <Plus size={12} strokeWidth={4} />
          </span>
        </div>
        <RailStat icon={<Heart size={35} fill="white" strokeWidth={0} />} value={compact(likes)} pulse />
        <RailStat icon={<MessageCircle size={33} fill="white" strokeWidth={0} className="-scale-x-100" />} value={compact(comments)} />
        <RailStat icon={<Bookmark size={31} fill="white" strokeWidth={0} />} value={compact(viralVideo.saves)} />
        <RailStat icon={<Forward size={35} fill="white" strokeWidth={0} />} value={compact(shares)} />
        <div
          className="mt-1 flex size-11 animate-[spin_6s_linear_infinite] items-center justify-center rounded-full border-[6px] border-[#1b1b1b]"
          style={{ background: "radial-gradient(circle, #4a4a4a 0%, #161616 62%)" }}
        >
          <Avatar emoji={creator.emoji} hue={12} size={20} />
        </div>
      </div>

      {/* Caption inferior */}
      <div className="absolute bottom-[60px] left-3 right-20 z-20 flex flex-col gap-1.5">
        <span className="text-[16px] font-bold">@{creator.handle}</span>
        <p className="text-[14px] leading-snug text-white/95">
          {viralVideo.caption}{" "}
          <span className="font-semibold">{viralVideo.hashtags.join(" ")}</span>
        </p>
        <div className="flex items-center gap-2">
          <Music2 size={15} />
          <div className="w-44 overflow-hidden">
            <div className="flex w-max animate-[marquee_7s_linear_infinite] gap-8 text-[13px]">
              <span>{viralVideo.sound}</span>
              <span>{viralVideo.sound}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso del video */}
      <div className="absolute inset-x-0 bottom-[50px] z-20 h-[2.5px] bg-white/20">
        <motion.div
          className="h-full bg-white/90"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Barra de navegación inferior */}
      <nav className="absolute inset-x-0 bottom-0 z-20 flex h-[50px] items-start justify-between bg-black px-1 pt-1.5">
        <NavItem icon={<Home size={23} fill="white" strokeWidth={0} />} label="Inicio" active />
        <NavItem icon={<UsersRound size={23} strokeWidth={1.8} />} label="Amigos" />
        <CreateButton />
        <NavItem icon={<MessageSquareText size={23} strokeWidth={1.8} />} label="Buzón" badge="12" />
        <NavItem icon={<User size={23} strokeWidth={1.8} />} label="Perfil" />
      </nav>
    </div>
  );
}

function RailStat({
  icon,
  value,
  pulse = false,
}: {
  icon: React.ReactNode;
  value: string;
  pulse?: boolean;
}) {
  return (
    <button className="flex flex-col items-center gap-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
      {icon}
      <motion.span
        key={pulse ? value : "static"}
        initial={pulse ? { scale: 1.18, color: "#fe2c55" } : false}
        animate={{ scale: 1, color: "#ffffff" }}
        transition={{ duration: 0.35 }}
        className="text-[12px] font-semibold tabular-nums"
      >
        {value}
      </motion.span>
    </button>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button className={`relative flex w-16 flex-col items-center gap-[3px] ${active ? "text-white" : "text-white/55"}`}>
      {icon}
      <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>{label}</span>
      {badge && (
        <span className="absolute -top-1 right-3.5 rounded-full bg-tt-pink px-[5px] py-[1px] text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function CreateButton() {
  return (
    <button className="relative mt-[3px] h-[27px] w-[46px]">
      <span className="absolute inset-y-0 left-0 w-[42px] rounded-[8px] bg-tt-cyan" />
      <span className="absolute inset-y-0 right-0 w-[42px] rounded-[8px] bg-tt-pink" />
      <span className="absolute inset-y-0 left-1/2 flex w-[42px] -translate-x-1/2 items-center justify-center rounded-[8px] bg-white">
        <Plus size={19} strokeWidth={3} className="text-black" />
      </span>
    </button>
  );
}
