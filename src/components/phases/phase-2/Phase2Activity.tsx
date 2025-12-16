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
import { Hand, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speakCardLabel, speak } from "@/lib/audio/tts";
import { Button } from "@/components/ui/Button";
import { FOOD_CARDS, TOY_CARDS, getRandomCards } from "@/lib/cards/cardData";
import type { PictureCard } from "@/types";

// Get a mix of food and toy cards for Phase 2
const DEFAULT_CARDS = getRandomCards([...FOOD_CARDS.slice(0, 6), ...TOY_CARDS.slice(0, 6)], 6);

type Stage = "go-to-book" | "pick-card" | "go-to-partner" | "exchange";

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
    ? { transform: CSS.Translate.toString(transform) }
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
      <div className="w-20 h-20 relative">
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

interface PartnerZoneProps {
  isOver: boolean;
  isActive: boolean;
}

function PartnerZone({ isOver, isActive }: PartnerZoneProps) {
  const { setNodeRef } = useDroppable({
    id: "partner-zone",
    disabled: !isActive,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-dashed transition-all",
        !isActive && "opacity-40",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/20 scale-110"
          : isActive
          ? "border-[var(--success)] bg-[var(--success)]/10"
          : "border-[var(--border)] bg-[var(--muted)]/30"
      )}
    >
      <Hand
        className={cn(
          "w-12 h-12 md:w-16 md:h-16 transition-colors",
          isOver ? "text-[var(--primary)]" : isActive ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
        )}
      />
      <p className={cn(
        "text-center mt-2 font-medium text-sm",
        isOver ? "text-[var(--primary)]" : isActive ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
      )}>
        {isOver ? "Release!" : isActive ? "Bring card here" : "Partner"}
      </p>
    </div>
  );
}

interface CommunicationBookProps {
  isActive: boolean;
  onClick: () => void;
}

function CommunicationBook({ isActive, onClick }: CommunicationBookProps) {
  return (
    <button
      onClick={isActive ? onClick : undefined}
      disabled={!isActive}
      className={cn(
        "flex flex-col items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-[var(--radius-lg)] border-4 transition-all",
        !isActive && "opacity-40 cursor-not-allowed",
        isActive && "border-[var(--primary)] bg-[var(--primary)]/10 cursor-pointer hover:scale-105 hover:bg-[var(--primary)]/20"
      )}
    >
      <BookOpen
        className={cn(
          "w-12 h-12 md:w-16 md:h-16",
          isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
        )}
      />
      <p className={cn(
        "text-center mt-2 font-medium text-sm",
        isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
      )}>
        {isActive ? "Tap to open" : "Communication Book"}
      </p>
    </button>
  );
}

interface Phase2ActivityProps {
  cards?: PictureCard[];
  onExchange?: (card: PictureCard, wasSuccessful: boolean) => void;
  onComplete?: () => void;
}

export function Phase2Activity({
  cards = DEFAULT_CARDS,
  onExchange,
  onComplete,
}: Phase2ActivityProps) {
  const [stage, setStage] = React.useState<Stage>("go-to-book");
  const [selectedCard, setSelectedCard] = React.useState<PictureCard | null>(null);
  const [activeCard, setActiveCard] = React.useState<PictureCard | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [completedExchanges, setCompletedExchanges] = React.useState(0);
  const [distance, setDistance] = React.useState<"near" | "far">("near");

  React.useEffect(() => {
    // Speak instructions when stage changes
    if (stage === "go-to-book") {
      speak("Go to your communication book");
    } else if (stage === "pick-card") {
      speak("Pick a card for what you want");
    } else if (stage === "go-to-partner") {
      speak("Now bring the card to your partner");
    }
  }, [stage]);

  const handleOpenBook = () => {
    playSound("click", 0.5);
    setStage("pick-card");
  };

  const handleSelectCard = (card: PictureCard) => {
    playSound("click", 0.5);
    setSelectedCard(card);
    setStage("go-to-partner");
    speakCardLabel(card.label);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (stage !== "go-to-partner") return;
    const card = selectedCard;
    if (card && event.active.id === card.id) {
      setActiveCard(card);
      playSound("click", 0.5);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "partner-zone" && activeCard) {
      // Successful exchange!
      setShowSuccess(true);
      setCompletedExchanges((prev) => prev + 1);
      speakCardLabel(activeCard.label);
      onExchange?.(activeCard, true);
    }
    setActiveCard(null);
    setIsOver(false);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "partner-zone");
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setSelectedCard(null);

    // Increase distance every 2 exchanges
    if ((completedExchanges + 1) % 2 === 0) {
      setDistance((prev) => (prev === "near" ? "far" : "near"));
    }

    // Reset to start
    setStage("go-to-book");

    if (completedExchanges >= 4) {
      onComplete?.();
    }
  };

  const getInstructions = () => {
    switch (stage) {
      case "go-to-book":
        return "Step 1: Go to your communication book";
      case "pick-card":
        return "Step 2: Pick a card for what you want";
      case "go-to-partner":
        return "Step 3: Bring the card to your partner";
      default:
        return "";
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Instructions */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {getInstructions()}
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Exchanges: {completedExchanges} / 5 | Distance: {distance === "near" ? "Close" : "Far"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            stage === "go-to-book" ? "bg-[var(--primary)] text-white" : "bg-[var(--success)] text-white"
          )}>
            1
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            stage === "pick-card" ? "bg-[var(--primary)] text-white" :
            stage === "go-to-partner" ? "bg-[var(--success)] text-white" :
            "bg-[var(--muted)] text-[var(--muted-foreground)]"
          )}>
            2
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            stage === "go-to-partner" ? "bg-[var(--primary)] text-white" :
            "bg-[var(--muted)] text-[var(--muted-foreground)]"
          )}>
            3
          </div>
        </div>

        {/* Main interaction area */}
        <div className={cn(
          "flex items-center justify-between w-full max-w-4xl px-8",
          distance === "far" ? "gap-32" : "gap-16"
        )}>
          {/* Communication Book (left side) */}
          <CommunicationBook
            isActive={stage === "go-to-book"}
            onClick={handleOpenBook}
          />

          {/* Partner Zone (right side) */}
          <PartnerZone
            isOver={isOver}
            isActive={stage === "go-to-partner"}
          />
        </div>

        {/* Card selection (shown after opening book) */}
        {stage === "pick-card" && (
          <div className="mt-8 p-6 bg-[var(--card)] rounded-[var(--radius-lg)] shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-center">
              What do you want? Tap a card:
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-3 bg-white hover:scale-105 hover:border-[var(--primary)] transition-all touch-target-lg card-shadow border-[var(--border)]"
                >
                  <div className="w-20 h-20 relative">
                    <Image
                      src={card.imageUrl}
                      alt={card.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-semibold">{card.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected card to drag (shown after picking) */}
        {stage === "go-to-partner" && selectedCard && (
          <div className="mt-8">
            <p className="text-center text-[var(--muted-foreground)] mb-4">
              Drag your card to the partner:
            </p>
            <DraggableCard
              card={selectedCard}
              isDragging={activeCard?.id === selectedCard.id}
            />
          </div>
        )}

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-3 border-[var(--primary)] bg-white shadow-xl scale-110">
              <div className="w-20 h-20 relative">
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
          message={selectedCard ? `Great! You traveled to get ${selectedCard.label}!` : undefined}
        />

        {/* Reset button */}
        {stage !== "go-to-book" && (
          <Button
            variant="outline"
            onClick={() => {
              setStage("go-to-book");
              setSelectedCard(null);
            }}
            className="mt-4"
          >
            Start Over
          </Button>
        )}
      </div>
    </DndContext>
  );
}
