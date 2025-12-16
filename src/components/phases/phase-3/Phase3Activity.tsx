"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SuccessAnimation, CheckmarkAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speakCardLabel, speak } from "@/lib/audio/tts";
import { FOOD_CARDS, TOY_CARDS } from "@/lib/cards/cardData";
import type { PictureCard } from "@/types";

// Get a variety of cards for Phase 3 discrimination
const DEFAULT_CARDS: PictureCard[] = [
  ...FOOD_CARDS.slice(0, 6),
  ...TOY_CARDS.slice(0, 6),
];

interface Phase3ActivityProps {
  cards?: PictureCard[];
  arraySize?: 2 | 3 | 4 | 5;
  onAnswer?: (selectedCard: PictureCard, targetCard: PictureCard, isCorrect: boolean) => void;
  onComplete?: () => void;
}

export function Phase3Activity({
  cards = DEFAULT_CARDS,
  arraySize = 3,
  onAnswer,
  onComplete,
}: Phase3ActivityProps) {
  const [targetCard, setTargetCard] = React.useState<PictureCard | null>(null);
  const [displayCards, setDisplayCards] = React.useState<PictureCard[]>([]);
  const [selectedCard, setSelectedCard] = React.useState<PictureCard | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [totalTrials, setTotalTrials] = React.useState(0);

  // Initialize a new trial
  const startNewTrial = React.useCallback(() => {
    // Pick a random target card
    const target = cards[Math.floor(Math.random() * cards.length)];
    setTargetCard(target);

    // Create array with target and distractors
    const otherCards = cards.filter((c) => c.id !== target.id);
    const shuffledOthers = otherCards.sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, arraySize - 1);

    // Combine and shuffle
    const allCards = [target, ...distractors].sort(() => Math.random() - 0.5);
    setDisplayCards(allCards);

    // Reset state
    setSelectedCard(null);
    setIsCorrect(null);

    // Speak the prompt
    setTimeout(() => {
      speak(`Find the ${target.label}`);
    }, 500);
  }, [cards, arraySize]);

  // Start first trial on mount
  React.useEffect(() => {
    startNewTrial();
  }, [startNewTrial]);

  const handleCardSelect = async (card: PictureCard) => {
    if (selectedCard) return; // Already selected

    setSelectedCard(card);
    const correct = card.id === targetCard?.id;
    setIsCorrect(correct);
    setTotalTrials((prev) => prev + 1);

    playSound(correct ? "success" : "error", 0.6);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setShowSuccess(true);
      await speakCardLabel(card.label);
    } else {
      // Gentle correction
      await speak(`That's ${card.label}. Let's try again.`);

      // Highlight correct answer briefly
      setTimeout(() => {
        setSelectedCard(targetCard);
        speakCardLabel(targetCard?.label || "");
      }, 1500);
    }

    onAnswer?.(card, targetCard!, correct);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);

    // Check if we should complete
    if (totalTrials >= 10 && correctCount / totalTrials >= 0.8) {
      onComplete?.();
    } else {
      // Start next trial
      setTimeout(startNewTrial, 500);
    }
  };

  const handleContinue = () => {
    startNewTrial();
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Progress */}
      <div className="text-center">
        <p className="text-[var(--muted-foreground)]">
          Score: {correctCount} / {totalTrials}
        </p>
      </div>

      {/* Target prompt */}
      {targetCard && (
        <div className="text-center bg-[var(--card)] rounded-[var(--radius-lg)] p-6 shadow-lg">
          <p className="text-lg text-[var(--muted-foreground)] mb-2">Find the:</p>
          <h2 className="text-3xl font-bold text-[var(--primary)]">
            {targetCard.label}
          </h2>
          <button
            onClick={() => speak(`Find the ${targetCard.label}`)}
            className="mt-4 text-sm text-[var(--primary)] underline"
          >
            Hear again
          </button>
        </div>
      )}

      {/* Card array */}
      <div
        className={cn(
          "grid gap-6 mt-8",
          arraySize <= 2 && "grid-cols-2",
          arraySize === 3 && "grid-cols-3",
          arraySize >= 4 && "grid-cols-2 md:grid-cols-4"
        )}
      >
        {displayCards.map((card) => {
          const isSelected = selectedCard?.id === card.id;
          const isTarget = card.id === targetCard?.id;
          const showResult = selectedCard !== null;

          return (
            <button
              key={card.id}
              onClick={() => handleCardSelect(card)}
              disabled={selectedCard !== null}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border-3 bg-white transition-all touch-target-lg",
                !showResult && "hover:scale-105 cursor-pointer",
                showResult && isSelected && isCorrect && "border-[var(--success)] bg-[var(--success)]/10",
                showResult && isSelected && !isCorrect && "border-[var(--error)] bg-[var(--error)]/10",
                showResult && !isSelected && isTarget && "border-[var(--primary)] ring-2 ring-[var(--primary)]",
                !showResult && "border-[var(--border)] hover:border-[var(--primary)]",
                "card-shadow"
              )}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 relative">
                <Image
                  src={card.imageUrl}
                  alt={card.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-lg">{card.label}</span>

              {/* Result indicator */}
              {showResult && isSelected && (
                <div className="absolute -top-3 -right-3">
                  <CheckmarkAnimation show={isCorrect === true} size="small" />
                  {!isCorrect && (
                    <div className="w-8 h-8 rounded-full bg-[var(--error)] flex items-center justify-center">
                      <span className="text-white font-bold">✕</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue button after incorrect */}
      {selectedCard && !isCorrect && (
        <button
          onClick={handleContinue}
          className="mt-8 px-8 py-4 bg-[var(--primary)] text-white text-lg font-semibold rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity touch-target-lg"
        >
          Try Again
        </button>
      )}

      {/* Success animation */}
      <SuccessAnimation
        show={showSuccess}
        onComplete={handleSuccessComplete}
        message={`Yes! That's the ${targetCard?.label}!`}
      />
    </div>
  );
}
