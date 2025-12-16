"use client";

import * as React from "react";
import Image from "next/image";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakCardLabel } from "@/lib/audio/tts";
import { playSound } from "@/lib/audio/sounds";
import type { PictureCard as PictureCardType } from "@/types";

export interface PictureCardProps {
  card: PictureCardType;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  interactive?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  enableTTS?: boolean;
  className?: string;
}

const sizeClasses = {
  small: "w-20 h-20",
  medium: "w-28 h-28 md:w-32 md:h-32",
  large: "w-36 h-36 md:w-44 md:h-44",
};

const imageSizes = {
  small: 80,
  medium: 128,
  large: 176,
};

export function PictureCard({
  card,
  size = "medium",
  showLabel = true,
  interactive = true,
  isSelected = false,
  isDragging = false,
  onPress,
  onLongPress,
  enableTTS = true,
  className,
}: PictureCardProps) {
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleTTS = React.useCallback(async () => {
    if (enableTTS && card.ttsEnabled) {
      await speakCardLabel(card.label);
    }
  }, [card.label, card.ttsEnabled, enableTTS]);

  const handlePress = React.useCallback(() => {
    if (!interactive) return;
    playSound("click", 0.5);
    onPress?.();
  }, [interactive, onPress]);

  const handlePointerDown = React.useCallback(() => {
    if (!interactive) return;
    setIsPressed(true);

    longPressTimer.current = setTimeout(() => {
      handleTTS();
      onLongPress?.();
    }, 500);
  }, [interactive, handleTTS, onLongPress]);

  const handlePointerUp = React.useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = React.useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={handlePress}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePress();
        }
      }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border-3 bg-white p-2 transition-all duration-200",
        sizeClasses[size],
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        isSelected && "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-offset-2",
        !isSelected && "border-[var(--border)]",
        isDragging && "opacity-50 scale-105 shadow-xl",
        isPressed && "scale-95",
        "touch-target-lg card-shadow hover:card-shadow-hover",
        className
      )}
      aria-label={card.label}
      aria-pressed={isSelected}
    >
      {/* Card Image */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-[var(--radius)]">
        <Image
          src={card.imageUrl}
          alt={card.label}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-contain"
          draggable={false}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="w-full text-center">
          <span
            className={cn(
              "font-semibold text-[var(--foreground)] leading-tight block truncate",
              size === "small" && "text-xs",
              size === "medium" && "text-sm",
              size === "large" && "text-base"
            )}
          >
            {card.label}
          </span>
        </div>
      )}

      {/* TTS Indicator */}
      {enableTTS && card.ttsEnabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTTS();
          }}
          className="absolute top-1 right-1 p-1 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors touch-target"
          aria-label={`Speak ${card.label}`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Grid wrapper for displaying multiple cards
export interface CardGridProps {
  cards: PictureCardType[];
  size?: "small" | "medium" | "large";
  selectedIds?: string[];
  onCardPress?: (card: PictureCardType) => void;
  enableTTS?: boolean;
  className?: string;
}

export function CardGrid({
  cards,
  size = "medium",
  selectedIds = [],
  onCardPress,
  enableTTS = true,
  className,
}: CardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        size === "small" && "grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
        size === "medium" && "grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        size === "large" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <PictureCard
          key={card.id}
          card={card}
          size={size}
          isSelected={selectedIds.includes(card.id)}
          onPress={() => onCardPress?.(card)}
          enableTTS={enableTTS}
        />
      ))}
    </div>
  );
}
