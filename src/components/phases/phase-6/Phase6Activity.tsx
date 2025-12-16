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
import { Eye, Ear, Volume2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuccessAnimation } from "@/components/feedback/SuccessAnimation";
import { playSound } from "@/lib/audio/sounds";
import { speak } from "@/lib/audio/tts";
import { Button } from "@/components/ui/Button";
import { FOOD_CARDS, TOY_CARDS, STARTER_CARDS, getRandomCards } from "@/lib/cards/cardData";
import type { PictureCard } from "@/types";

// Comment starter cards - "I see" and "I hear"
const I_SEE_CARD = STARTER_CARDS.find(c => c.id === "i-see")!;
const I_HEAR_CARD = STARTER_CARDS.find(c => c.id === "i-hear")!;

// Get a variety of item cards for Phase 6 commenting
const DEFAULT_CARDS = getRandomCards([...FOOD_CARDS, ...TOY_CARDS], 8);

type StimulusType = "visual" | "auditory";

interface Stimulus {
  type: StimulusType;
  card: PictureCard;
  question: string;
}

interface MiniCardProps {
  card: PictureCard;
  isStarter?: boolean;
  icon?: React.ReactNode;
}

function MiniCard({ card, isStarter, icon }: MiniCardProps) {
  return (
    <div className="relative flex flex-col items-center gap-1 p-2 rounded-[var(--radius)] bg-white border-2 border-[var(--border)]">
      {isStarter && icon ? (
        <div className="w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 relative">
          <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
        </div>
      )}
      <span className="text-xs font-medium text-center">{card.label}</span>
    </div>
  );
}

interface StarterButtonProps {
  starter: PictureCard;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function StarterButton({ starter, icon, isSelected, onClick }: StarterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border-3 transition-all touch-target-lg",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-105"
          : "border-[var(--border)] bg-white hover:scale-105 hover:border-[var(--primary)]"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center",
        isSelected ? "bg-[var(--primary)]/20" : "bg-[var(--muted)]"
      )}>
        {icon}
      </div>
      <span className="font-semibold">{starter.label}</span>
    </button>
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
      <div className="w-14 h-14 relative">
        <Image src={card.imageUrl} alt={card.label} fill className="object-contain" />
      </div>
      <span className="font-medium text-sm">{card.label}</span>
    </div>
  );
}

interface SentenceStripProps {
  cards: PictureCard[];
  starterIcon: React.ReactNode | null;
  isOver: boolean;
}

function SentenceStrip({ cards, starterIcon, isOver }: SentenceStripProps) {
  const { setNodeRef } = useDroppable({ id: "sentence-strip" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-3 p-4 min-h-[90px] rounded-[var(--radius-lg)] border-2 border-dashed transition-all",
        isOver
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] bg-[var(--muted)]/30"
      )}
    >
      {cards.length === 0 ? (
        <p className="w-full text-center text-[var(--muted-foreground)] italic">
          First select "I see" or "I hear", then add what you observed
        </p>
      ) : (
        cards.map((card, index) => (
          <MiniCard
            key={`${card.id}-${index}`}
            card={card}
            isStarter={index === 0}
            icon={index === 0 ? starterIcon : undefined}
          />
        ))
      )}
    </div>
  );
}

interface Phase6ActivityProps {
  itemCards?: PictureCard[];
  onComment?: (sentence: PictureCard[], stimulusType: StimulusType) => void;
  onComplete?: () => void;
}

export function Phase6Activity({
  itemCards = DEFAULT_CARDS,
  onComment,
  onComplete,
}: Phase6ActivityProps) {
  const [selectedStarter, setSelectedStarter] = React.useState<PictureCard | null>(null);
  const [sentenceCards, setSentenceCards] = React.useState<PictureCard[]>([]);
  const [activeCard, setActiveCard] = React.useState<PictureCard | null>(null);
  const [isOver, setIsOver] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [completedComments, setCompletedComments] = React.useState(0);
  const [currentStimulus, setCurrentStimulus] = React.useState<Stimulus | null>(null);
  const [showStimulus, setShowStimulus] = React.useState(false);

  const sentence = sentenceCards.map((c) => c.label).join(" ");

  // Generate a new stimulus
  const generateStimulus = React.useCallback(() => {
    const type: StimulusType = Math.random() > 0.3 ? "visual" : "auditory";
    const card = itemCards[Math.floor(Math.random() * itemCards.length)];
    const question = type === "visual"
      ? "What do you see?"
      : "What do you hear?";

    setCurrentStimulus({ type, card, question });
    setShowStimulus(true);
    setSentenceCards([]);
    setSelectedStarter(null);

    // For auditory, speak what they "hear"
    if (type === "auditory") {
      setTimeout(() => {
        speak(card.label, { rate: 0.9 });
      }, 500);
    }

    // Speak the question
    setTimeout(() => {
      speak(question, { rate: 0.9 });
    }, type === "auditory" ? 1500 : 500);
  }, [itemCards]);

  React.useEffect(() => {
    generateStimulus();
  }, [generateStimulus]);

  const handleSelectStarter = (starter: PictureCard) => {
    setSelectedStarter(starter);
    setSentenceCards([starter]);
    playSound("click", 0.5);
    speak(starter.label);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!selectedStarter) return;
    const card = itemCards.find((c) => c.id === event.active.id);
    if (card) {
      setActiveCard(card);
      playSound("click", 0.5);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "sentence-strip" && activeCard && selectedStarter) {
      setSentenceCards([selectedStarter, activeCard]);
      playSound("drop", 0.5);
    }
    setActiveCard(null);
    setIsOver(false);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "sentence-strip");
  };

  const handleExchange = async () => {
    if (sentenceCards.length < 2 || !currentStimulus) return;

    // Check if correct
    const isCorrect = sentenceCards[1].id === currentStimulus.card.id;
    const correctStarter = currentStimulus.type === "visual" ? "I see" : "I hear";
    const usedCorrectStarter = sentenceCards[0].label === correctStarter;

    // Speak the sentence
    await speak(sentence, { rate: 0.8 });

    if (isCorrect && usedCorrectStarter) {
      setShowSuccess(true);
      setCompletedComments((prev) => prev + 1);
      onComment?.(sentenceCards, currentStimulus.type);
    } else {
      // Provide feedback
      if (!usedCorrectStarter) {
        await speak(`Try using "${correctStarter}" for this one`, { rate: 0.9 });
      } else {
        await speak(`Look again! What do you ${currentStimulus.type === "visual" ? "see" : "hear"}?`, { rate: 0.9 });
      }
      setSentenceCards([]);
      setSelectedStarter(null);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);

    if (completedComments >= 5) {
      onComplete?.();
    } else {
      generateStimulus();
    }
  };

  const getStarterIcon = (starter: PictureCard | null) => {
    if (!starter) return null;
    return starter.id === "i-see"
      ? <Eye className="w-8 h-8 text-[var(--primary)]" />
      : <Ear className="w-8 h-8 text-[var(--secondary)]" />;
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
          <h2 className="text-xl font-semibold mb-2">Make a Comment</h2>
          <p className="text-[var(--muted-foreground)]">
            {currentStimulus?.type === "visual"
              ? "Look at the picture and say what you see"
              : "Listen and say what you hear"}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Comments: {completedComments} / 6
          </p>
        </div>

        {/* Stimulus display */}
        {showStimulus && currentStimulus && (
          <div className={cn(
            "flex flex-col items-center gap-4 p-6 rounded-[var(--radius-lg)] border-2",
            currentStimulus.type === "visual"
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--secondary)] bg-[var(--secondary)]/5"
          )}>
            <div className="flex items-center gap-2">
              {currentStimulus.type === "visual" ? (
                <Eye className="w-6 h-6 text-[var(--primary)]" />
              ) : (
                <Ear className="w-6 h-6 text-[var(--secondary)]" />
              )}
              <span className="font-medium">{currentStimulus.question}</span>
            </div>

            {currentStimulus.type === "visual" ? (
              <div className="w-32 h-32 relative">
                <Image
                  src={currentStimulus.card.imageUrl}
                  alt={currentStimulus.card.label}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center animate-pulse">
                  <Volume2 className="w-12 h-12 text-[var(--secondary)]" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak(currentStimulus.card.label)}
                >
                  Play Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Starter selection */}
        <div>
          <h3 className="text-center font-medium mb-3">
            Step 1: Choose how to start your comment
          </h3>
          <div className="flex justify-center gap-4">
            <StarterButton
              starter={I_SEE_CARD}
              icon={<Eye className="w-8 h-8 text-[var(--primary)]" />}
              isSelected={selectedStarter?.id === "i-see"}
              onClick={() => handleSelectStarter(I_SEE_CARD)}
            />
            <StarterButton
              starter={I_HEAR_CARD}
              icon={<Ear className="w-8 h-8 text-[var(--secondary)]" />}
              isSelected={selectedStarter?.id === "i-hear"}
              onClick={() => handleSelectStarter(I_HEAR_CARD)}
            />
          </div>
        </div>

        {/* Sentence Strip */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-4 shadow-lg">
          <SentenceStrip
            cards={sentenceCards}
            starterIcon={getStarterIcon(selectedStarter)}
            isOver={isOver}
          />

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSentenceCards([]);
                setSelectedStarter(null);
              }}
            >
              Clear
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={generateStimulus}
              >
                <RefreshCw className="w-5 h-5" />
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
        {selectedStarter && (
          <div>
            <h3 className="text-center font-medium mb-3">
              Step 2: Drag what you {currentStimulus?.type === "visual" ? "see" : "hear"}
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
        )}

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-2 border-[var(--primary)] bg-white shadow-xl">
              <div className="w-14 h-14 relative">
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
          message={sentence}
        />
      </div>
    </DndContext>
  );
}
