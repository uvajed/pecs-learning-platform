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
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speakCardLabel } from "@/lib/audio/tts";
import type { PictureCard } from "@/types";

// Sample cards for demo
const DEMO_CARDS: PictureCard[] = [
  {
    id: "1",
    label: "Cookie",
    imageUrl: "/cards/cookie.svg",
    ttsEnabled: true,
    isSystem: true,
    isPublic: true,
    cardType: "noun",
    categoryIds: ["food"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    label: "Juice",
    imageUrl: "/cards/juice.svg",
    ttsEnabled: true,
    isSystem: true,
    isPublic: true,
    cardType: "noun",
    categoryIds: ["food"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    label: "Ball",
    imageUrl: "/cards/ball.svg",
    ttsEnabled: true,
    isSystem: true,
    isPublic: true,
    cardType: "noun",
    categoryIds: ["toys"],
    createdAt: new Date().toISOString(),
  },
];

interface DraggableCardProps {
  card: PictureCard;
  isDragging: boolean;
}

function DraggableCard({ card, isDragging }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: card,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-3 bg-white cursor-grab active:cursor-grabbing transition-all touch-target-lg card-shadow",
        isDragging ? "opacity-50 scale-105" : "hover:scale-105",
        "border-[var(--border)]"
      )}
    >
      <div className="w-24 h-24 relative">
        <Image
          src={card.imageUrl}
          alt={card.label}
          fill
          className="object-contain"
          draggable={false}
        />
      </div>
      <span className="font-semibold text-center">{card.label}</span>
    </div>
  );
}

interface ExchangeZoneProps {
  isOver: boolean;
}

function ExchangeZone({ isOver }: ExchangeZoneProps) {
  const { setNodeRef } = useDroppable({
    id: "exchange-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col items-center justify-center w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-dashed transition-all",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/20 scale-110"
          : "border-[var(--border)] bg-[var(--muted)]/30"
      )}
    >
      <Hand
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 transition-colors",
          isOver ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
        )}
      />
      <p
        className={cn(
          "text-center mt-4 font-medium transition-colors",
          isOver ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
        )}
      >
        {isOver ? "Release to exchange!" : "Give card here"}
      </p>
    </div>
  );
}

interface Phase1ActivityProps {
  cards?: PictureCard[];
  onExchange?: (card: PictureCard, wasSuccessful: boolean) => void;
  onComplete?: () => void;
}

export function Phase1Activity({
  cards = DEMO_CARDS,
  onExchange,
  onComplete,
}: Phase1ActivityProps) {
  const [activeCard, setActiveCard] = React.useState<PictureCard | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [exchangedCard, setExchangedCard] = React.useState<PictureCard | null>(null);
  const [completedExchanges, setCompletedExchanges] = React.useState(0);

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    if (card) {
      setActiveCard(card);
      playSound("click", 0.5);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over?.id === "exchange-zone" && active) {
      const card = cards.find((c) => c.id === active.id);
      if (card) {
        // Successful exchange!
        setExchangedCard(card);
        setShowSuccess(true);
        setCompletedExchanges((prev) => prev + 1);

        // Speak the card label
        speakCardLabel(card.label);

        // Report exchange
        onExchange?.(card, true);
      }
    }

    setActiveCard(null);
    setIsOver(false);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "exchange-zone");
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setExchangedCard(null);

    // Check if session should end
    if (completedExchanges >= 5) {
      onComplete?.();
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center gap-8 py-8">
        {/* Instructions */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Pick up a card and give it to the hand
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Exchanges: {completedExchanges} / 5
          </p>
        </div>

        {/* Exchange Zone */}
        <ExchangeZone isOver={isOver} />

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {cards.map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              isDragging={activeCard?.id === card.id}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-3 border-[var(--primary)] bg-white shadow-xl scale-110">
              <div className="w-24 h-24 relative">
                <Image
                  src={activeCard.imageUrl}
                  alt={activeCard.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold">{activeCard.label}</span>
            </div>
          )}
        </DragOverlay>

        {/* Success animation */}
        <SuccessAnimation
          show={showSuccess}
          onComplete={handleSuccessComplete}
          message={exchangedCard ? `Great! You want ${exchangedCard.label}!` : undefined}
        />
      </div>
    </DndContext>
  );
}
