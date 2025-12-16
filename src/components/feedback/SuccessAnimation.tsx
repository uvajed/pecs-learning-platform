"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/audio/sounds";
import { speakEncouragement, getRandomEncouragement } from "@/lib/audio/tts";
import { useUIStore } from "@/stores/uiStore";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  variant?: "stars" | "hearts" | "sparkles";
  message?: string;
  enableSound?: boolean;
  enableTTS?: boolean;
  className?: string;
}

export function SuccessAnimation({
  show,
  onComplete,
  variant = "stars",
  message,
  enableSound = true,
  enableTTS = true,
  className,
}: SuccessAnimationProps) {
  const { soundEnabled, ttsEnabled } = useUIStore();

  React.useEffect(() => {
    if (show) {
      // Play success sound
      if (enableSound && soundEnabled) {
        playSound("success", 0.7);
      }

      // Speak encouragement
      if (enableTTS && ttsEnabled) {
        const phrase = message || getRandomEncouragement();
        speakEncouragement(phrase);
      }

      // Complete animation after delay
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, enableSound, enableTTS, soundEnabled, ttsEnabled, message, onComplete]);

  const IconComponent = {
    stars: Star,
    hearts: Heart,
    sparkles: Sparkles,
  }[variant];

  const iconColor = {
    stars: "text-yellow-400",
    hearts: "text-red-400",
    sparkles: "text-purple-400",
  }[variant];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/20",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative"
          >
            {/* Main celebration icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5, repeat: 2 }}
              className={cn("w-32 h-32", iconColor)}
            >
              <IconComponent className="w-full h-full fill-current" />
            </motion.div>

            {/* Floating icons */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 4) * 100,
                  y: Math.sin((i * Math.PI) / 4) * 100 - 50,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.2 + i * 0.1,
                }}
                className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", iconColor)}
              >
                <IconComponent className="w-8 h-8 fill-current" />
              </motion.div>
            ))}

            {/* Message */}
            {(message || true) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className="text-2xl font-bold text-[var(--foreground)] bg-white px-6 py-2 rounded-full shadow-lg">
                  {message || getRandomEncouragement()}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple checkmark animation for smaller successes
interface CheckmarkAnimationProps {
  show: boolean;
  onComplete?: () => void;
  size?: "small" | "medium" | "large";
}

export function CheckmarkAnimation({
  show,
  onComplete,
  size = "medium",
}: CheckmarkAnimationProps) {
  const sizeClass = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-28 h-28",
  }[size];

  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={cn(
            "flex items-center justify-center rounded-full bg-[var(--success)]",
            sizeClass
          )}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-3/5 h-3/5 text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
