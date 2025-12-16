"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LearningShell } from "@/components/layout/LearningShell";
import { PECS_PHASES, type PECSPhase } from "@/types";

interface PhaseWrapperProps {
  phase: PECSPhase;
  children: React.ReactNode;
  progress?: number;
  onExit?: () => void;
  className?: string;
}

export function PhaseWrapper({
  phase,
  children,
  progress = 0,
  onExit,
  className,
}: PhaseWrapperProps) {
  const phaseInfo = PECS_PHASES.find((p) => p.id === phase);

  return (
    <LearningShell
      title={phaseInfo?.name}
      phaseNumber={phase}
      progress={progress}
      onExit={onExit}
      className={className}
    >
      {children}
    </LearningShell>
  );
}

// Phase introduction screen
interface PhaseIntroProps {
  phase: PECSPhase;
  onStart: () => void;
  className?: string;
}

export function PhaseIntro({ phase, onStart, className }: PhaseIntroProps) {
  const phaseInfo = PECS_PHASES.find((p) => p.id === phase);

  if (!phaseInfo) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] text-center px-4",
        className
      )}
    >
      <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-white">{phase}</span>
      </div>

      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
        Phase {phase}: {phaseInfo.name}
      </h1>

      <p className="text-lg text-[var(--muted-foreground)] max-w-md mb-8">
        {phaseInfo.description}
      </p>

      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-6 max-w-md w-full mb-8">
        <h2 className="font-semibold mb-3">Learning Objectives:</h2>
        <ul className="text-left space-y-2">
          {phaseInfo.objectives.map((objective, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-[var(--foreground)]">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 bg-[var(--primary)] text-white text-xl font-semibold rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity touch-target-lg"
      >
        Start Practice
      </button>
    </div>
  );
}
