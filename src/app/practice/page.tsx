"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Play, Lock, CheckCircle } from "lucide-react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PECS_PHASES, type PECSPhase } from "@/types";
import { cn } from "@/lib/utils";

// Mock user data
const mockUser = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
};

// Mock progress - in real app, this would come from the database
// All phases unlocked so users can practice any phase
const mockProgress: Record<number, "locked" | "in_progress" | "completed"> = {
  1: "in_progress",
  2: "in_progress",
  3: "in_progress",
  4: "in_progress",
  5: "in_progress",
  6: "in_progress",
};

export default function PracticePage() {
  const [selectedChild, setSelectedChild] = React.useState("Alex");

  return (
    <DashboardShell user={mockUser}>
      <PageHeader
        title="Practice Session"
        description={`Choose a phase to practice with ${selectedChild}`}
        action={
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      {/* Child selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Practicing with:
        </label>
        <div className="flex gap-3">
          {["Alex", "Emma"].map((name) => (
            <button
              key={name}
              onClick={() => setSelectedChild(name)}
              className={cn(
                "px-4 py-2 rounded-[var(--radius)] font-medium transition-colors",
                selectedChild === name
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Phase selection grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PECS_PHASES.map((phase) => {
          const status = mockProgress[phase.id];
          const isLocked = status === "locked";
          const isCompleted = status === "completed";

          return (
            <Card
              key={phase.id}
              className={cn(
                "relative overflow-hidden transition-all",
                isLocked && "opacity-60",
                !isLocked && "hover:border-[var(--primary)] hover:shadow-lg"
              )}
            >
              <CardContent className="p-6">
                {/* Phase number badge */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                    isCompleted && "bg-[var(--success)]",
                    status === "in_progress" && "bg-[var(--primary)]",
                    isLocked && "bg-[var(--muted)]"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 text-[var(--muted-foreground)]" />
                  ) : (
                    <span className="text-xl font-bold text-white">{phase.id}</span>
                  )}
                </div>

                {/* Phase info */}
                <h3 className="text-lg font-semibold mb-2">{phase.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  {phase.description}
                </p>

                {/* Objectives preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                    Objectives:
                  </p>
                  <ul className="text-sm space-y-1">
                    {phase.objectives.slice(0, 2).map((obj, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        <span className="truncate">{obj}</span>
                      </li>
                    ))}
                    {phase.objectives.length > 2 && (
                      <li className="text-[var(--muted-foreground)]">
                        +{phase.objectives.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action button */}
                {isLocked ? (
                  <Button disabled className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Phase {phase.id - 1} First
                  </Button>
                ) : (
                  <Link href={`/practice/phase/${phase.id}`}>
                    <Button
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? "Practice Again" : "Start Phase"}
                    </Button>
                  </Link>
                )}

                {/* Status badge */}
                {status === "in_progress" && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded">
                    In Progress
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Free play option */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Free Play Mode</h3>
              <p className="text-[var(--muted-foreground)]">
                Practice with all cards without structured phases
              </p>
            </div>
            <Link href="/practice/free">
              <Button variant="secondary" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Free Play
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
