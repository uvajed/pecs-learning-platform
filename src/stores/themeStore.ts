import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme, getThemeById, getDefaultTheme, THEMES } from "@/lib/themes/themeData";

interface ThemeState {
  currentThemeId: string;
  unlockedThemeIds: string[];

  // Actions
  setTheme: (themeId: string) => void;
  unlockTheme: (themeId: string) => void;
  getCurrentTheme: () => Theme;
  isThemeUnlocked: (themeId: string) => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: "calm-ocean",
      unlockedThemeIds: ["calm-ocean"], // Default theme always unlocked

      setTheme: (themeId: string) => {
        const theme = getThemeById(themeId);
        if (theme && get().isThemeUnlocked(themeId)) {
          set({ currentThemeId: themeId });
          applyTheme(theme);
        }
      },

      unlockTheme: (themeId: string) => {
        const currentUnlocked = get().unlockedThemeIds;
        if (!currentUnlocked.includes(themeId)) {
          set({ unlockedThemeIds: [...currentUnlocked, themeId] });
        }
      },

      getCurrentTheme: () => {
        const theme = getThemeById(get().currentThemeId);
        return theme || getDefaultTheme();
      },

      isThemeUnlocked: (themeId: string) => {
        return get().unlockedThemeIds.includes(themeId);
      },
    }),
    {
      name: "pecs-theme-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme on load
        if (state) {
          const theme = getThemeById(state.currentThemeId);
          if (theme) {
            applyTheme(theme);
          }
        }
      },
    }
  )
);

// Apply theme colors to CSS variables
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const colors = theme.colors;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--success", colors.success);
  root.style.setProperty("--warning", colors.warning);
  root.style.setProperty("--error", colors.error);
}

// Hook to check and unlock themes based on progress
export function checkAndUnlockThemes(progress: {
  completedPhases: number[];
  longestStreak: number;
  totalSessions: number;
  earnedAchievements: string[];
}): string[] {
  const store = useThemeStore.getState();
  const newlyUnlocked: string[] = [];

  for (const theme of THEMES) {
    if (store.isThemeUnlocked(theme.id)) continue;

    const req = theme.unlockRequirement;
    let shouldUnlock = false;

    switch (req.type) {
      case "free":
        shouldUnlock = true;
        break;
      case "phase":
        shouldUnlock = progress.completedPhases.includes(req.value as number);
        break;
      case "streak":
        shouldUnlock = progress.longestStreak >= (req.value as number);
        break;
      case "sessions":
        shouldUnlock = progress.totalSessions >= (req.value as number);
        break;
      case "achievement":
        shouldUnlock = progress.earnedAchievements.includes(req.value as string);
        break;
    }

    if (shouldUnlock) {
      store.unlockTheme(theme.id);
      newlyUnlocked.push(theme.id);
    }
  }

  return newlyUnlocked;
}
