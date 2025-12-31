"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getThemeById, Theme } from "@/lib/themes/themeData";
import { useThemeStore } from "@/stores/themeStore";

interface ThemeUnlockNotificationProps {
  themeId: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export function ThemeUnlockNotification({
  themeId,
  isOpen,
  onClose,
  onApply,
}: ThemeUnlockNotificationProps) {
  const theme = getThemeById(themeId);
  const { setTheme } = useThemeStore();

  if (!theme) return null;

  const handleApply = () => {
    setTheme(themeId);
    onApply();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-[var(--background)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
              {/* Header with confetti effect */}
              <div
                className="relative p-6 text-center"
                style={{ backgroundColor: theme.preview.primary }}
              >
                {/* Sparkle effects */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute inset-0 overflow-hidden"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-white/40"
                      initial={{
                        x: Math.random() * 100 - 50 + "%",
                        y: "100%",
                        opacity: 0,
                      }}
                      animate={{
                        y: "-20%",
                        opacity: [0, 1, 0],
                        rotate: [0, 180],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="text-4xl">{theme.icon}</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white"
                >
                  Theme Unlocked!
                </motion.h2>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">{theme.name}</h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  {theme.description}
                </p>

                {/* Color preview */}
                <div className="flex justify-center gap-2 mb-6">
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: theme.preview.secondary }}
                  />
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: theme.preview.accent }}
                  />
                  <div
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: theme.preview.background }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Later
                  </Button>
                  <Button onClick={handleApply} className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage theme unlock notifications
export function useThemeUnlockNotification() {
  const [unlockedTheme, setUnlockedTheme] = React.useState<string | null>(null);

  const showNotification = (themeId: string) => {
    setUnlockedTheme(themeId);
  };

  const closeNotification = () => {
    setUnlockedTheme(null);
  };

  return {
    unlockedTheme,
    showNotification,
    closeNotification,
    isOpen: unlockedTheme !== null,
  };
}
