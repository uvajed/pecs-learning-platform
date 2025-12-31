"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { AchievementDefinition } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { playSound } from "@/lib/audio/sounds";

interface AchievementPopupProps {
  achievement: AchievementDefinition | null;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function AchievementPopup({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { soundEnabled, animationsEnabled } = useUIStore();

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      // Play celebration sound
      if (soundEnabled) {
        playSound("reward");
      }

      // Auto close after delay
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for exit animation
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, autoClose, autoCloseDelay, onClose, soundEnabled]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!achievement) return null;

  const categoryColors: Record<string, string> = {
    milestone: "from-yellow-400 to-amber-500",
    streak: "from-orange-400 to-red-500",
    effort: "from-blue-400 to-indigo-500",
    mastery: "from-purple-400 to-pink-500",
    special: "from-emerald-400 to-teal-500",
    category: "from-sky-400 to-cyan-500",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={animationsEnabled ? { scale: 0.5, y: 50, opacity: 0 } : {}}
            animate={animationsEnabled ? { scale: 1, y: 0, opacity: 1 } : {}}
            exit={animationsEnabled ? { scale: 0.5, y: 50, opacity: 0 } : {}}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative bg-[var(--card)] rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>

            {/* Celebration text */}
            <motion.p
              initial={animationsEnabled ? { scale: 0.8, opacity: 0 } : {}}
              animate={animationsEnabled ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="text-lg font-bold text-[var(--primary)] mb-4"
            >
              Achievement Unlocked!
            </motion.p>

            {/* Achievement icon */}
            <motion.div
              initial={animationsEnabled ? { scale: 0, rotate: -180 } : {}}
              animate={animationsEnabled ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: "spring", delay: 0.2, damping: 10 }}
              className={cn(
                "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
                `bg-gradient-to-br ${categoryColors[achievement.category]}`,
                "shadow-lg"
              )}
            >
              <span className="text-5xl">{achievement.icon}</span>
            </motion.div>

            {/* Achievement name */}
            <motion.h3
              initial={animationsEnabled ? { y: 20, opacity: 0 } : {}}
              animate={animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-[var(--foreground)] mb-2"
            >
              {achievement.name}
            </motion.h3>

            {/* Achievement description */}
            <motion.p
              initial={animationsEnabled ? { y: 20, opacity: 0 } : {}}
              animate={animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="text-[var(--muted-foreground)] mb-6"
            >
              {achievement.description}
            </motion.p>

            {/* Category badge */}
            <motion.div
              initial={animationsEnabled ? { y: 20, opacity: 0 } : {}}
              animate={animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-4"
            >
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium capitalize text-white",
                  `bg-gradient-to-r ${categoryColors[achievement.category]}`
                )}
              >
                {achievement.category}
              </span>
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={animationsEnabled ? { y: 20, opacity: 0 } : {}}
              animate={animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={handleClose} className="w-full">
                Awesome!
              </Button>
            </motion.div>

            {/* Confetti effect (animated dots) */}
            {animationsEnabled && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.2 + i * 0.1,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "absolute w-3 h-3 rounded-full",
                      i % 3 === 0
                        ? "bg-yellow-400"
                        : i % 3 === 1
                        ? "bg-pink-400"
                        : "bg-blue-400"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
