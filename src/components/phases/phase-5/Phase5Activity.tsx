"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Volume2, MessageCircleQuestion, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speak } from "@/lib/audio/tts";
import { Button } from "@/components/ui/Button";
import { FOOD_CARDS, TOY_CARDS, STARTER_CARDS, getRandomCards } from "@/lib/cards/cardData";
import type { PictureCard } from "@/types";

// Sentence starter card - "I want"
const I_WANT_CARD = STARTER_CARDS.find(c => c.id === "i-want")!;

// Get a variety of item cards for Phase 5
const DEFAULT_CARDS = getRandomCards([...FOOD_CARDS, ...TOY_CARDS], 8);

type TrialType = "prompted" | "spontaneous";

interface MiniCardProps {
  card: PictureCard;
  isDragging?: boolean;
}

function MiniCard({ card, isDragging }: MiniCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-[var(--radius)] bg-white border-2",
        isDragging ? "border-[var(--primary)] opacity-50" : "border-[var(--border)]"
      )}
    >
      <div className="w-14 h-14 relative">
        <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
      </div>
      <span className="text-xs font-medium text-center">{card.label}</span>
    </div>
  );
}

interface DraggableItemCardProps {
  card: PictureCard;
  isDragging: boolean;
}

function DraggableItemCard({ card, isDragging }: DraggableItemCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: card,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-2 bg-white cursor-grab active:cursor-grabbing transition-all touch-target-lg card-shadow",
        isDragging ? "opacity-50 scale-105" : "hover:scale-105",
        "border-[var(--border)]"
      )}
    >
      <div className="w-16 h-16 relative">
        <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
      </div>
      <span className="font-medium text-sm">{card.label}</span>
    </div>
  );
}

interface SentenceStripDropZoneProps {
  cards: PictureCard[];
  isOver: boolean;
}

function SentenceStripDropZone({ cards, isOver }: SentenceStripDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: "sentence-strip" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-3 p-4 min-h-[100px] rounded-[var(--radius-lg)] border-2 border-dashed transition-all",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] bg-[var(--muted)]/30"
      )}
    >
      {cards.length === 0 ? (
        <p className="w-full text-center text-[var(--muted-foreground)] italic">
          Build your response here
        </p>
      ) : (
        cards.map((card, index) => (
          <MiniCard key={`${card.id}-${index}`} card={card} />
        ))
      )}
    </div>
  );
}

interface Phase5ActivityProps {
  itemCards?: PictureCard[];
  onResponse?: (sentence: PictureCard[], responseTimeMs: number, trialType: TrialType) => void;
  onComplete?: () => void;
}

export function Phase5Activity({
  itemCards = DEFAULT_CARDS,
  onResponse,
  onComplete,
}: Phase5ActivityProps) {
  const [sentenceCards, setSentenceCards] = React.useState<PictureCard[]>([]);
  const [activeCard, setActiveCard] = React.useState<PictureCard | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [completedTrials, setCompletedTrials] = React.useState(0);
  const [trialType, setTrialType] = React.useState<TrialType>("prompted");
  const [isWaiting, setIsWaiting] = React.useState(true);
  const [responseTimer, setResponseTimer] = React.useState(0);
  const [trialStartTime, setTrialStartTime] = React.useState<number | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);

  const sentence = sentenceCards.map((c) => c.label).join(" ");

  // Timer for response time
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trialStartTime && !showSuccess) {
      interval = setInterval(() => {
        setResponseTimer(Math.floor((Date.now() - trialStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trialStartTime, showSuccess]);

  const startTrial = React.useCallback(async () => {
    setIsWaiting(false);
    setShowPrompt(true);
    setSentenceCards([I_WANT_CARD]);
    setTrialStartTime(Date.now());
    setResponseTimer(0);

    if (trialType === "prompted") {
      await speak("What do you want?", { rate: 0.9 });
    }

    // Hide prompt after speaking
    setTimeout(() => setShowPrompt(false), 2000);
  }, [trialType]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = itemCards.find((c) => c.id === event.active.id);
    if (card) {
      setActiveCard(card);
      playSound("click", 0.5);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "sentence-strip" && activeCard) {
      setSentenceCards((prev) => [...prev, activeCard]);
      playSound("drop", 0.5);
    }
    setActiveCard(null);
    setIsOver(false);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "sentence-strip");
  };

  const handleExchange = async () => {
    if (sentenceCards.length < 2) return;

    const responseTimeMs = trialStartTime ? Date.now() - trialStartTime : 0;

    // Speak the sentence
    await speak(sentence, { rate: 0.8 });

    // Show success
    setShowSuccess(true);
    setCompletedTrials((prev) => prev + 1);
    onResponse?.(sentenceCards, responseTimeMs, trialType);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setSentenceCards([]);
    setTrialStartTime(null);
    setIsWaiting(true);

    // Alternate between prompted and spontaneous trials
    setTrialType((prev) => (prev === "prompted" ? "spontaneous" : "prompted"));

    if (completedTrials >= 5) {
      onComplete?.();
    }
  };

  const handleRepeatQuestion = async () => {
    await speak("What do you want?", { rate: 0.9 });
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col gap-6 py-8 max-w-2xl mx-auto">
        {/* Instructions */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {trialType === "prompted" ? "Respond to the Question" : "Request What You Want"}
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {trialType === "prompted"
              ? "Listen to the question and answer by building a sentence"
              : "Make a request on your own without being asked"}
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-sm text-[var(--muted-foreground)]">
              Trials: {completedTrials} / 6
            </span>
            {trialStartTime && (
              <span className={cn(
                "flex items-center gap-1 text-sm",
                responseTimer > 5 ? "text-[var(--warning)]" : "text-[var(--muted-foreground)]"
              )}>
                <Timer className="w-4 h-4" />
                {responseTimer}s
              </span>
            )}
          </div>
        </div>

        {/* Waiting state - Start trial button */}
        {isWaiting && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              trialType === "prompted" ? "bg-[var(--primary)]/20" : "bg-[var(--success)]/20"
            )}>
              <MessageCircleQuestion className={cn(
                "w-12 h-12",
                trialType === "prompted" ? "text-[var(--primary)]" : "text-[var(--success)]"
              )} />
            </div>
            <p className="text-center text-[var(--muted-foreground)]">
              {trialType === "prompted"
                ? "Get ready to answer a question!"
                : "Make a request on your own!"}
            </p>
            <Button onClick={startTrial} size="lg">
              {trialType === "prompted" ? "Ask Me" : "Start Request"}
            </Button>
          </div>
        )}

        {/* Active trial */}
        {!isWaiting && (
          <>
            {/* Prompt display */}
            {showPrompt && trialType === "prompted" && (
              <div className="bg-[var(--primary)]/10 border-2 border-[var(--primary)] rounded-[var(--radius-lg)] p-4 text-center animate-pulse">
                <p className="text-xl font-semibold text-[var(--primary)]">
                  "What do you want?"
                </p>
              </div>
            )}

            {/* Sentence Strip */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-4 shadow-lg">
              <SentenceStripDropZone cards={sentenceCards} isOver={isOver} />

              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm" onClick={() => setSentenceCards([I_WANT_CARD])}>
                  Clear
                </Button>

                <div className="flex gap-2">
                  {trialType === "prompted" && (
                    <Button variant="ghost" size="icon" onClick={handleRepeatQuestion}>
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    onClick={handleExchange}
                    disabled={sentenceCards.length < 2}
                    size="lg"
                  >
                    Exchange
                  </Button>
                </div>
              </div>
            </div>

            {/* Available cards */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-center">
                Choose what you want:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {itemCards.map((card) => (
                  <DraggableItemCard
                    key={card.id}
                    card={card}
                    isDragging={activeCard?.id === card.id}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-2 border-[var(--primary)] bg-white shadow-xl">
              <div className="w-16 h-16 relative">
                <Image src={activeCard.imageUrl} alt={activeCard.label} fill className="object-contain" />
              </div>
              <span className="font-medium text-sm">{activeCard.label}</span>
            </div>
          )}
        </DragOverlay>

        {/* Success */}
        <SuccessAnimation
          show={showSuccess}
          onComplete={handleSuccessComplete}
          message={responseTimer <= 5 ? `Fast response! ${sentence}` : sentence}
        />
      </div>
    </DndContext>
  );
}
