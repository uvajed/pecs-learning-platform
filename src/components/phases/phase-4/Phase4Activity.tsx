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
import { Volume2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speak, speakCardLabel } from "@/lib/audio/tts";
import { Button } from "@/components/ui/Button";
import { FOOD_CARDS, TOY_CARDS, STARTER_CARDS, getRandomCards } from "@/lib/cards/cardData";
import type { PictureCard } from "@/types";

// Sentence starter card - "I want"
const I_WANT_CARD = STARTER_CARDS.find(c => c.id === "i-want")!;

// Get a variety of item cards for Phase 4
const DEFAULT_CARDS = getRandomCards([...FOOD_CARDS, ...TOY_CARDS], 8);

interface MiniCardProps {
  card: PictureCard;
  isDragging?: boolean;
  onRemove?: () => void;
  showRemove?: boolean;
}

function MiniCard({ card, isDragging, onRemove, showRemove }: MiniCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-[var(--radius)] bg-white border-2",
        isDragging ? "border-[var(--primary)] opacity-50" : "border-[var(--border)]"
      )}
    >
      <div className="w-16 h-16 relative">
        <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
      </div>
      <span className="text-xs font-medium text-center">{card.label}</span>
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--error)] text-white flex items-center justify-center"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
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
      <div className="w-20 h-20 relative">
        <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
      </div>
      <span className="font-medium">{card.label}</span>
    </div>
  );
}

interface SentenceStripDropZoneProps {
  cards: PictureCard[];
  isOver: boolean;
  onRemoveCard: (index: number) => void;
}

function SentenceStripDropZone({ cards, isOver, onRemoveCard }: SentenceStripDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: "sentence-strip" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-3 p-4 min-h-[120px] rounded-[var(--radius-lg)] border-2 border-dashed transition-all",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] bg-[var(--muted)]/30"
      )}
    >
      {cards.length === 0 ? (
        <p className="w-full text-center text-[var(--muted-foreground)] italic">
          Drag cards here to build: "I want ___"
        </p>
      ) : (
        cards.map((card, index) => (
          <MiniCard
            key={`${card.id}-${index}`}
            card={card}
            showRemove={index > 0} // Can't remove "I want"
            onRemove={() => onRemoveCard(index)}
          />
        ))
      )}
    </div>
  );
}

interface Phase4ActivityProps {
  itemCards?: PictureCard[];
  onSentenceComplete?: (sentence: PictureCard[]) => void;
  onComplete?: () => void;
}

export function Phase4Activity({
  itemCards = DEFAULT_CARDS,
  onSentenceComplete,
  onComplete,
}: Phase4ActivityProps) {
  const [sentenceCards, setSentenceCards] = React.useState<PictureCard[]>([I_WANT_CARD]);
  const [activeCard, setActiveCard] = React.useState<PictureCard | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [completedSentences, setCompletedSentences] = React.useState(0);

  const sentence = sentenceCards.map((c) => c.label).join(" ");

  const handleDragStart = (event: DragStartEvent) => {
    const card = itemCards.find((c) => c.id === event.active.id);
    if (card) {
      setActiveCard(card);
      playSound("click", 0.5);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "sentence-strip" && activeCard) {
      // Add card to sentence
      setSentenceCards((prev) => [...prev, activeCard]);
      playSound("drop", 0.5);
    }
    setActiveCard(null);
    setIsOver(false);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "sentence-strip");
  };

  const handleRemoveCard = (index: number) => {
    if (index === 0) return; // Can't remove "I want"
    setSentenceCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpeak = async () => {
    await speak(sentence, { rate: 0.8 });
  };

  const handleExchange = async () => {
    if (sentenceCards.length < 2) return;

    // Speak the sentence
    await speak(sentence, { rate: 0.8 });

    // Show success
    setShowSuccess(true);
    setCompletedSentences((prev) => prev + 1);
    onSentenceComplete?.(sentenceCards);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);

    // Reset for next sentence
    setSentenceCards([I_WANT_CARD]);

    if (completedSentences >= 4) {
      onComplete?.();
    }
  };

  const handleClear = () => {
    setSentenceCards([I_WANT_CARD]);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col gap-8 py-8 max-w-2xl mx-auto">
        {/* Instructions */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Build a Sentence</h2>
          <p className="text-[var(--muted-foreground)]">
            Drag a picture to complete "I want ___" then press Exchange
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Sentences: {completedSentences} / 5
          </p>
        </div>

        {/* Sentence Strip */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-4 shadow-lg">
          <SentenceStripDropZone
            cards={sentenceCards}
            isOver={isOver}
            onRemoveCard={handleRemoveCard}
          />

          {/* Action buttons */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleSpeak} disabled={sentenceCards.length < 2}>
                <Volume2 className="w-5 h-5" />
              </Button>
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
          <div className="flex flex-wrap justify-center gap-4">
            {itemCards.map((card) => (
              <DraggableItemCard
                key={card.id}
                card={card}
                isDragging={activeCard?.id === card.id}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-2 border-[var(--primary)] bg-white shadow-xl">
              <div className="w-20 h-20 relative">
                <Image src={activeCard.imageUrl} alt={activeCard.label} fill className="object-contain" />
              </div>
              <span className="font-medium">{activeCard.label}</span>
            </div>
          )}
        </DragOverlay>

        {/* Success */}
        <SuccessAnimation
          show={showSuccess}
          onComplete={handleSuccessComplete}
          message={sentence}
        />
      </div>
    </DndContext>
  );
}
