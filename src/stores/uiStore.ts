import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Audio settings
  soundEnabled: boolean;
  ttsEnabled: boolean;
  volume: number;

  // Visual settings
  animationsEnabled: boolean;
  highContrast: boolean;

  // Actions
  toggleSound: () => void;
  toggleTTS: () => void;
  setVolume: (volume: number) => void;
  toggleAnimations: () => void;
  toggleHighContrast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Default settings
      soundEnabled: true,
      ttsEnabled: true,
      volume: 0.8,
      animationsEnabled: true,
      highContrast: false,

      // Actions
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleTTS: () => set((state) => ({ ttsEnabled: !state.ttsEnabled })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
    }),
    {
      name: "pecs-ui-settings",
    }
  )
);
