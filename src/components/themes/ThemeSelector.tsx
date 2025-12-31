"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { THEMES, Theme, getUnlockProgress, UserProgress } from "@/lib/themes/themeData";

interface ThemeSelectorProps {
  className?: string;
  userProgress?: UserProgress;
}

export function ThemeSelector({ className, userProgress }: ThemeSelectorProps) {
  const { currentThemeId, setTheme, isThemeUnlocked } = useThemeStore();
  const [previewTheme, setPreviewTheme] = React.useState<string | null>(null);

  // Default progress for demo
  const progress = userProgress || {
    currentPhase: 1,
    completedPhases: [],
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    totalExchanges: 0,
    earnedAchievements: [],
  };

  const handleThemeSelect = (themeId: string) => {
    if (isThemeUnlocked(themeId)) {
      setTheme(themeId);
    }
  };

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
  };

  const clearPreview = () => {
    setPreviewTheme(null);
  };

  const unlockedThemes = THEMES.filter((t) => isThemeUnlocked(t.id));
  const lockedThemes = THEMES.filter((t) => !isThemeUnlocked(t.id));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Unlocked Themes */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Your Themes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {unlockedThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={currentThemeId === theme.id}
              isPreviewing={previewTheme === theme.id}
              isUnlocked={true}
              progress={100}
              onSelect={() => handleThemeSelect(theme.id)}
              onPreview={() => handlePreview(theme.id)}
              onClearPreview={clearPreview}
            />
          ))}
        </div>
      </div>

      {/* Locked Themes */}
      {lockedThemes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-[var(--muted-foreground)]">
            Unlock More Themes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lockedThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={false}
                isPreviewing={previewTheme === theme.id}
                isUnlocked={false}
                progress={getUnlockProgress(theme, progress)}
                onSelect={() => {}}
                onPreview={() => handlePreview(theme.id)}
                onClearPreview={clearPreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  isPreviewing: boolean;
  isUnlocked: boolean;
  progress: number;
  onSelect: () => void;
  onPreview: () => void;
  onClearPreview: () => void;
}

function ThemeCard({
  theme,
  isSelected,
  isPreviewing,
  isUnlocked,
  progress,
  onSelect,
  onPreview,
  onClearPreview,
}: ThemeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={onPreview}
      onMouseLeave={onClearPreview}
      disabled={!isUnlocked}
      className={cn(
        "relative p-3 rounded-[var(--radius-lg)] border-2 transition-all text-left",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : isUnlocked
          ? "border-[var(--border)] hover:border-[var(--primary)]/50"
          : "border-[var(--border)] opacity-70 cursor-not-allowed"
      )}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
    >
      {/* Color preview */}
      <div className="flex gap-1 mb-2">
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: theme.preview.primary }}
        />
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: theme.preview.secondary }}
        />
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: theme.preview.accent }}
        />
      </div>

      {/* Theme info */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{theme.icon}</span>
        <span className="font-medium text-sm">{theme.name}</span>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
        {isUnlocked ? theme.description : theme.unlockRequirement.description}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}

      {/* Lock indicator with progress */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <Lock className="w-3 h-3 text-[var(--muted-foreground)]" />
          </div>
          {progress > 0 && progress < 100 && (
            <div className="text-[10px] text-[var(--muted-foreground)] font-medium">
              {Math.round(progress)}%
            </div>
          )}
        </div>
      )}

      {/* Progress bar for locked themes */}
      {!isUnlocked && progress > 0 && progress < 100 && (
        <div className="mt-2 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[var(--primary)]/60 rounded-full"
          />
        </div>
      )}
    </motion.button>
  );
}
