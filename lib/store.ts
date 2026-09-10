"use client";

// ---------------------------------------------------------------------------
// Estado global de la sesión (zustand + localStorage)
// Persiste: moderador de confianza, categorías silenciadas del Copilot y
// si el moderador quedó fijado para futuros LIVEs.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CopilotCue, ModCandidate, VerticalId } from "@/lib/tiktok-sdk";
import { DEFAULT_VERTICAL } from "@/lib/tiktok-sdk";

type LiveState = {
  /** Moderador de confianza elegido en el Waiting Room (o null). */
  moderator: ModCandidate | null;
  /** Categorías de sugerencias del Copilot silenciadas por el creador. */
  mutedCategories: CopilotCue["id"][];
  /** true si el creador fijó al moderador para futuros LIVEs (Post-LIVE). */
  moderatorPinned: boolean;
  /** Vertical de contenido activa (Beauty, Fashion, Food, DIY, Electronics). */
  activeVertical: VerticalId;
  setModerator: (m: ModCandidate | null) => void;
  muteCategory: (id: CopilotCue["id"]) => void;
  setModeratorPinned: (v: boolean) => void;
  setActiveVertical: (v: VerticalId) => void;
  /** Limpia la sesión al reiniciar la demo desde el resumen. */
  resetSession: () => void;
};

export const useLiveStore = create<LiveState>()(
  persist(
    (set) => ({
      moderator: null,
      mutedCategories: [],
      moderatorPinned: false,
      activeVertical: DEFAULT_VERTICAL,
      setModerator: (moderator) => set({ moderator }),
      muteCategory: (id) =>
        set((s) =>
          s.mutedCategories.includes(id)
            ? s
            : { mutedCategories: [...s.mutedCategories, id] }
        ),
      setModeratorPinned: (moderatorPinned) => set({ moderatorPinned }),
      setActiveVertical: (activeVertical) => set({ activeVertical }),
      resetSession: () =>
        set({ moderator: null, mutedCategories: [], moderatorPinned: false }),
    }),
    { name: "live-launchpad-session" }
  )
);
