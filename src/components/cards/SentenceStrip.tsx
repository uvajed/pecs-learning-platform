"use client";

import * as React from "react";
import { X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/audio/tts";
import type { PictureCard } from "@/types";
import Image from "next/image";

export interface SentenceStripProps {
  cards: PictureCard[];
  onRemoveCard?: (index: number) => void;
  onSpeak?: () => void;
  editable?: boolean;
  className?: string;
}

export function SentenceStrip({
  cards,
  onRemoveCard,
  onSpeak,
  editable = true,
  className,
}: SentenceStripProps) {
  const sentence = cards.map((card) => card.label).join(" ");

  const handleSpeak = React.useCallback(async () => {
    if (sentence) {
      await speak(sentence, { rate: 0.8 });
      onSpeak?.();
    }
  }, [sentence, onSpeak]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-4 rounded-[var(--radius-lg)] bg-white border-2 border-[var(--border)] min-h-[100px]",
        className
      )}
    >
      {/* Cards in strip */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {cards.length === 0 ? (
          <p className="text-[var(--muted-foreground)] italic">
            Drag cards here to build a sentence
          </p>
        ) : (
          cards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="relative flex flex-col items-center gap-1 p-2 rounded-[var(--radius)] bg-[var(--muted)] border border-[var(--border)]"
            >
              <div className="w-16 h-16 relative">
                <Image
                  src={card.imageUrl}
                  alt={card.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-center">{card.label}</span>

              {editable && onRemoveCard && (
                <button
                  onClick={() => onRemoveCard(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--error)] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label={`Remove ${card.label}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Speak button */}
      {cards.length > 0 && (
        <button
          onClick={handleSpeak}
          className="flex-shrink-0 p-3 rounded-full bg-[var(--primary)] text-white hover:opacity-90 transition-opacity touch-target"
          aria-label="Speak sentence"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// Drop zone for sentence strip in Phase 4+
export interface SentenceStripDropZoneProps {
  children?: React.ReactNode;
  isOver?: boolean;
  className?: string;
}

export function SentenceStripDropZone({
  children,
  isOver = false,
  className,
}: SentenceStripDropZoneProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-[var(--radius-lg)] border-2 border-dashed transition-colors min-h-[120px]",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] bg-[var(--muted)]/30",
        className
      )}
    >
      {children || (
        <p className="text-center text-[var(--muted-foreground)] italic">
          Drop cards here to build your sentence
        </p>
      )}
    </div>
  );
}
