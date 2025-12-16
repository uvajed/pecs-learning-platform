"use client";

import * as React from "react";
import Link from "next/link";
import { X, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useUIStore } from "@/stores/uiStore";
import { useSessionStore } from "@/stores/sessionStore";

interface LearningShellProps {
  children: React.ReactNode;
  title?: string;
  phaseNumber?: number;
  showProgress?: boolean;
  progress?: number;
  onExit?: () => void;
  className?: string;
}

export function LearningShell({
  children,
  title,
  phaseNumber,
  showProgress = true,
  progress = 0,
  onExit,
  className,
}: LearningShellProps) {
  const { soundEnabled, toggleSound } = useUIStore();
  const { isPaused, togglePause, currentChild } = useSessionStore();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Exit and child name */}
          <div className="flex items-center gap-3">
            <Link href="/" onClick={onExit}>
              <Button variant="ghost" size="icon" aria-label="Exit session">
                <X className="h-6 w-6" />
              </Button>
            </Link>
            {currentChild && (
              <span className="text-sm font-medium text-[var(--muted-foreground)]">
                {currentChild.name}
              </span>
            )}
          </div>

          {/* Center: Title and phase */}
          <div className="text-center">
            {phaseNumber && (
              <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
                Phase {phaseNumber}
              </span>
            )}
            {title && (
              <h1 className="text-base font-semibold text-[var(--foreground)]">
                {title}
              </h1>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePause}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="px-4 pb-2">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </header>

      {/* Main content */}
      <main className={cn("flex-1 p-4 md:p-6", className)}>
        {isPaused ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Session Paused
              </h2>
              <p className="text-[var(--muted-foreground)]">
                Take a break! Press play when you're ready to continue.
              </p>
            </div>
            <Button size="xl" onClick={togglePause}>
              <Play className="w-6 h-6 mr-2" />
              Continue
            </Button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
