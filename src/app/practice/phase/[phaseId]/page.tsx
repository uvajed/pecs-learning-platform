"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PhaseWrapper, PhaseIntro } from "@/components/phases/PhaseWrapper";
import { Phase1Activity } from "@/components/phases/phase-1/Phase1Activity";
import { Phase3Activity } from "@/components/phases/phase-3/Phase3Activity";
import { Phase4Activity } from "@/components/phases/phase-4/Phase4Activity";
import { useSessionStore } from "@/stores/sessionStore";
import { PECS_PHASES, type PECSPhase, type Child } from "@/types";

// Mock child data
const mockChild: Child = {
  id: "1",
  parentId: "user1",
  name: "Alex",
  currentPhase: 2,
  preferences: {
    colorScheme: "calm",
    soundEnabled: true,
    animationsEnabled: true,
    reinforcementStyle: "both",
  },
  createdAt: new Date().toISOString(),
};

export default function PhasePracticePage() {
  const params = useParams();
  const router = useRouter();
  const phaseId = parseInt(params.phaseId as string) as PECSPhase;
  const { startSession, endSession, recordActivity } = useSessionStore();

  const [showIntro, setShowIntro] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const phaseInfo = PECS_PHASES.find((p) => p.id === phaseId);

  const handleStart = () => {
    setShowIntro(false);
    startSession(mockChild, phaseId);
  };

  const handleExit = () => {
    const summary = endSession();
    console.log("Session summary:", summary);
    router.push("/practice");
  };

  const handleComplete = () => {
    const summary = endSession();
    console.log("Session completed:", summary);
    router.push("/practice");
  };

  const handleActivity = (data: any) => {
    recordActivity({
      activityType: "exchange_success",
      wasSuccessful: true,
      promptLevel: "independent",
    });
    setProgress((prev) => Math.min(100, prev + 20));
  };

  if (!phaseInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Phase not found</p>
      </div>
    );
  }

  if (showIntro) {
    return (
      <PhaseWrapper phase={phaseId} onExit={handleExit}>
        <PhaseIntro phase={phaseId} onStart={handleStart} />
      </PhaseWrapper>
    );
  }

  return (
    <PhaseWrapper phase={phaseId} progress={progress} onExit={handleExit}>
      {phaseId === 1 && (
        <Phase1Activity
          onExchange={(card, success) => handleActivity({ card, success })}
          onComplete={handleComplete}
        />
      )}
      {phaseId === 2 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Phase 2: Distance & Persistence</h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            This phase builds on Phase 1 by adding distance between the learner and the communication partner.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Coming soon - practice Phase 1 to build foundational skills.
          </p>
        </div>
      )}
      {phaseId === 3 && (
        <Phase3Activity
          onAnswer={(selected, target, correct) => handleActivity({ selected, target, correct })}
          onComplete={handleComplete}
        />
      )}
      {phaseId === 4 && (
        <Phase4Activity
          onSentenceComplete={(cards) => handleActivity({ cards })}
          onComplete={handleComplete}
        />
      )}
      {(phaseId === 5 || phaseId === 6) && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">
            Phase {phaseId}: {phaseInfo.name}
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            {phaseInfo.description}
          </p>
          <p className="text-[var(--muted-foreground)]">
            Advanced phases coming soon.
          </p>
        </div>
      )}
    </PhaseWrapper>
  );
}
