// Theme definitions with unlock requirements

export interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  unlockRequirement: ThemeUnlockRequirement;
  category: "default" | "achievement" | "seasonal" | "premium";
}

export interface ThemeUnlockRequirement {
  type: "free" | "achievement" | "streak" | "phase" | "sessions" | "special";
  value?: string | number;
  description: string;
}

export const THEMES: Theme[] = [
  // Default theme - always available
  {
    id: "calm-ocean",
    name: "Calm Ocean",
    description: "A soothing blue theme perfect for focused learning",
    icon: "🌊",
    preview: {
      primary: "#4A90A4",
      secondary: "#E8F4F8",
      accent: "#FF9F43",
      background: "#FAFCFD",
    },
    colors: {
      primary: "#4A90A4",
      primaryForeground: "#FFFFFF",
      secondary: "#E8F4F8",
      secondaryForeground: "#2C5F6E",
      accent: "#FF9F43",
      accentForeground: "#FFFFFF",
      background: "#FAFCFD",
      foreground: "#1A1A2E",
      muted: "#E8EEF1",
      mutedForeground: "#64748B",
      border: "#D1E0E5",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    unlockRequirement: {
      type: "free",
      description: "Default theme",
    },
    category: "default",
  },

  // Forest theme - unlock with Phase 2 completion
  {
    id: "forest-friend",
    name: "Forest Friend",
    description: "Earthy greens inspired by nature walks",
    icon: "🌲",
    preview: {
      primary: "#4CAF50",
      secondary: "#E8F5E9",
      accent: "#FF7043",
      background: "#FAFFF9",
    },
    colors: {
      primary: "#4CAF50",
      primaryForeground: "#FFFFFF",
      secondary: "#E8F5E9",
      secondaryForeground: "#2E7D32",
      accent: "#FF7043",
      accentForeground: "#FFFFFF",
      background: "#FAFFF9",
      foreground: "#1B2E1C",
      muted: "#E0EDE1",
      mutedForeground: "#5D7A5E",
      border: "#C8E6C9",
      success: "#66BB6A",
      warning: "#FFA726",
      error: "#EF5350",
    },
    unlockRequirement: {
      type: "phase",
      value: 2,
      description: "Complete Phase 2",
    },
    category: "achievement",
  },

  // Sunset theme - unlock with 7-day streak
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    description: "Warm oranges and purples like a beautiful sunset",
    icon: "🌅",
    preview: {
      primary: "#FF6B6B",
      secondary: "#FFF0E6",
      accent: "#6C5CE7",
      background: "#FFFAF8",
    },
    colors: {
      primary: "#FF6B6B",
      primaryForeground: "#FFFFFF",
      secondary: "#FFF0E6",
      secondaryForeground: "#D84315",
      accent: "#6C5CE7",
      accentForeground: "#FFFFFF",
      background: "#FFFAF8",
      foreground: "#2D1F1F",
      muted: "#F5E6E0",
      mutedForeground: "#8D6E63",
      border: "#FFCCBC",
      success: "#26A69A",
      warning: "#FFB74D",
      error: "#E57373",
    },
    unlockRequirement: {
      type: "streak",
      value: 7,
      description: "Achieve a 7-day practice streak",
    },
    category: "achievement",
  },

  // Space theme - unlock with Phase 4 completion
  {
    id: "space-explorer",
    name: "Space Explorer",
    description: "Deep purples and cosmic blues for adventurers",
    icon: "🚀",
    preview: {
      primary: "#7C4DFF",
      secondary: "#EDE7F6",
      accent: "#00BCD4",
      background: "#F8F6FF",
    },
    colors: {
      primary: "#7C4DFF",
      primaryForeground: "#FFFFFF",
      secondary: "#EDE7F6",
      secondaryForeground: "#512DA8",
      accent: "#00BCD4",
      accentForeground: "#FFFFFF",
      background: "#F8F6FF",
      foreground: "#1A1A2E",
      muted: "#E8E0F0",
      mutedForeground: "#7E57C2",
      border: "#D1C4E9",
      success: "#4DB6AC",
      warning: "#FFB300",
      error: "#FF5252",
    },
    unlockRequirement: {
      type: "phase",
      value: 4,
      description: "Complete Phase 4",
    },
    category: "achievement",
  },

  // Rainbow theme - unlock with 20 sessions
  {
    id: "rainbow-joy",
    name: "Rainbow Joy",
    description: "Colorful and cheerful for celebration",
    icon: "🌈",
    preview: {
      primary: "#E91E63",
      secondary: "#FCE4EC",
      accent: "#00BFA5",
      background: "#FFFBFC",
    },
    colors: {
      primary: "#E91E63",
      primaryForeground: "#FFFFFF",
      secondary: "#FCE4EC",
      secondaryForeground: "#AD1457",
      accent: "#00BFA5",
      accentForeground: "#FFFFFF",
      background: "#FFFBFC",
      foreground: "#2C1520",
      muted: "#F8E1E8",
      mutedForeground: "#C2185B",
      border: "#F8BBD9",
      success: "#00C853",
      warning: "#FFD600",
      error: "#FF1744",
    },
    unlockRequirement: {
      type: "sessions",
      value: 20,
      description: "Complete 20 practice sessions",
    },
    category: "achievement",
  },

  // Candy theme - unlock with 50 successful exchanges
  {
    id: "candy-land",
    name: "Candy Land",
    description: "Sweet pinks and playful colors",
    icon: "🍭",
    preview: {
      primary: "#FF69B4",
      secondary: "#FFF0F5",
      accent: "#40E0D0",
      background: "#FFFAFC",
    },
    colors: {
      primary: "#FF69B4",
      primaryForeground: "#FFFFFF",
      secondary: "#FFF0F5",
      secondaryForeground: "#C71585",
      accent: "#40E0D0",
      accentForeground: "#1A1A2E",
      background: "#FFFAFC",
      foreground: "#2D1A24",
      muted: "#FFE4EC",
      mutedForeground: "#DB7093",
      border: "#FFB6C1",
      success: "#98FB98",
      warning: "#FFD700",
      error: "#FF6B6B",
    },
    unlockRequirement: {
      type: "achievement",
      value: "EXCHANGES_50",
      description: "Complete 50 successful exchanges",
    },
    category: "achievement",
  },

  // Superhero theme - unlock with Phase 6 completion
  {
    id: "superhero",
    name: "Superhero",
    description: "Bold reds and blues for champions",
    icon: "🦸",
    preview: {
      primary: "#D32F2F",
      secondary: "#FFEBEE",
      accent: "#1976D2",
      background: "#FFFAFA",
    },
    colors: {
      primary: "#D32F2F",
      primaryForeground: "#FFFFFF",
      secondary: "#FFEBEE",
      secondaryForeground: "#B71C1C",
      accent: "#1976D2",
      accentForeground: "#FFFFFF",
      background: "#FFFAFA",
      foreground: "#1A1A1A",
      muted: "#FFCDD2",
      mutedForeground: "#C62828",
      border: "#EF9A9A",
      success: "#43A047",
      warning: "#FFA000",
      error: "#E53935",
    },
    unlockRequirement: {
      type: "phase",
      value: 6,
      description: "Complete Phase 6 - Master Communicator!",
    },
    category: "achievement",
  },

  // Night mode - unlock with 30-day streak
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Dark mode for comfortable viewing",
    icon: "🦉",
    preview: {
      primary: "#BB86FC",
      secondary: "#1E1E2E",
      accent: "#03DAC6",
      background: "#121218",
    },
    colors: {
      primary: "#BB86FC",
      primaryForeground: "#000000",
      secondary: "#1E1E2E",
      secondaryForeground: "#E0E0E0",
      accent: "#03DAC6",
      accentForeground: "#000000",
      background: "#121218",
      foreground: "#E0E0E0",
      muted: "#2A2A3A",
      mutedForeground: "#9E9E9E",
      border: "#3A3A4A",
      success: "#4CAF50",
      warning: "#FFB74D",
      error: "#CF6679",
    },
    unlockRequirement: {
      type: "streak",
      value: 30,
      description: "Achieve a 30-day practice streak",
    },
    category: "achievement",
  },
];

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function getDefaultTheme(): Theme {
  return THEMES[0];
}

export function getUnlockedThemes(progress: UserProgress): Theme[] {
  return THEMES.filter((theme) => isThemeUnlocked(theme, progress));
}

export function getLockedThemes(progress: UserProgress): Theme[] {
  return THEMES.filter((theme) => !isThemeUnlocked(theme, progress));
}

export interface UserProgress {
  currentPhase: number;
  completedPhases: number[];
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalExchanges: number;
  earnedAchievements: string[];
}

export function isThemeUnlocked(theme: Theme, progress: UserProgress): boolean {
  const req = theme.unlockRequirement;

  switch (req.type) {
    case "free":
      return true;

    case "phase":
      return progress.completedPhases.includes(req.value as number);

    case "streak":
      return progress.longestStreak >= (req.value as number);

    case "sessions":
      return progress.totalSessions >= (req.value as number);

    case "achievement":
      return progress.earnedAchievements.includes(req.value as string);

    case "special":
      // Special themes might be unlocked via codes or events
      return false;

    default:
      return false;
  }
}

export function getUnlockProgress(theme: Theme, progress: UserProgress): number {
  const req = theme.unlockRequirement;

  switch (req.type) {
    case "free":
      return 100;

    case "phase":
      // Progress based on current phase vs required
      const requiredPhase = req.value as number;
      if (progress.completedPhases.includes(requiredPhase)) return 100;
      return Math.min(99, (progress.currentPhase / requiredPhase) * 100);

    case "streak":
      return Math.min(100, (progress.longestStreak / (req.value as number)) * 100);

    case "sessions":
      return Math.min(100, (progress.totalSessions / (req.value as number)) * 100);

    case "achievement":
      return progress.earnedAchievements.includes(req.value as string) ? 100 : 0;

    case "special":
      return 0;

    default:
      return 0;
  }
}
