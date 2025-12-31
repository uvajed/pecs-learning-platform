"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SuccessAnimation, CheckmarkAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speakCardLabel, speak } from "@/lib/audio/tts";
import { FOOD_CARDS, TOY_CARDS } from "@/lib/cards/cardData";
import { useAdaptiveDifficulty } from "@/hooks/useAdaptiveDifficulty";
import type { PictureCard } from "@/types";

// Get a variety of cards for Phase 3 discrimination
const DEFAULT_CARDS: PictureCard[] = [
  ...FOOD_CARDS.slice(0, 6),
  ...TOY_CARDS.slice(0, 6),
];

interface Phase3ActivityProps {
  cards?: PictureCard[];
  initialArraySize?: 2 | 3 | 4 | 5;
  adaptiveDifficulty?: boolean;
  onAnswer?: (selectedCard: PictureCard, targetCard: PictureCard, isCorrect: boolean) => void;
  onComplete?: () => void;
  onDifficultyChange?: (newSize: number, message: string) => void;
}

export function Phase3Activity({
  cards = DEFAULT_CARDS,
  initialArraySize = 2,
  adaptiveDifficulty = true,
  onAnswer,
  onComplete,
  onDifficultyChange,
}: Phase3ActivityProps) {
  const [targetCard, setTargetCard] = React.useState<PictureCard | null>(null);
  const [displayCards, setDisplayCards] = React.useState<PictureCard[]>([]);
  const [selectedCard, setSelectedCard] = React.useState<PictureCard | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [totalTrials, setTotalTrials] = React.useState(0);
  const [difficultyMessage, setDifficultyMessage] = React.useState<string | null>(null);
  const trialStartTime = React.useRef<number>(0);

  // Adaptive difficulty hook
  const {
    currentDifficulty,
    successRate,
    trend,
    recordTrial,
  } = useAdaptiveDifficulty({
    initialDifficulty: initialArraySize,
    onDifficultyChange: (newDifficulty, message) => {
      setDifficultyMessage(message);
      onDifficultyChange?.(newDifficulty, message);
      // Clear message after 3 seconds
      setTimeout(() => setDifficultyMessage(null), 3000);
    },
  });

  // Use adaptive difficulty or fixed
  const arraySize = adaptiveDifficulty
    ? (currentDifficulty as 2 | 3 | 4 | 5)
    : initialArraySize;

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

    // Track trial start time for response time measurement
    trialStartTime.current = Date.now();

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

    // Calculate response time
    const responseTimeMs = Date.now() - trialStartTime.current;

    setSelectedCard(card);
    const correct = card.id === targetCard?.id;
    setIsCorrect(correct);
    setTotalTrials((prev) => prev + 1);

    // Record trial for adaptive difficulty
    if (adaptiveDifficulty) {
      recordTrial(correct, responseTimeMs);
    }

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

  // Trend indicator
  const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Progress and difficulty indicator */}
      <div className="text-center space-y-2">
        <p className="text-[var(--muted-foreground)]">
          Score: {correctCount} / {totalTrials}
          {adaptiveDifficulty && totalTrials >= 5 && (
            <span className="ml-2">
              ({Math.round(successRate * 100)}% {trendIcon})
            </span>
          )}
        </p>

        {/* Difficulty level indicator */}
        {adaptiveDifficulty && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-[var(--muted-foreground)]">Level:</span>
            <div className="flex gap-1">
              {[2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    level <= arraySize
                      ? "bg-[var(--primary)]"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{arraySize} cards</span>
          </div>
        )}

        {/* Difficulty change message */}
        <AnimatePresence>
          {difficultyMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-medium"
            >
              <span>{arraySize > (initialArraySize || 2) ? '⬆️' : '⬇️'}</span>
              {difficultyMessage}
            </motion.div>
          )}
        </AnimatePresence>
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
