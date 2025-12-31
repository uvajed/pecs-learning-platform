"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { SessionRecommendation } from "@/lib/ai/recommendations";

interface RecommendationCardProps {
  recommendation: SessionRecommendation;
  onAction?: (recommendation: SessionRecommendation) => void;
  onDismiss?: (id: string) => void;
}

const typeIcons: Record<SessionRecommendation["type"], string> = {
  phase: "🎯",
  cards: "🃏",
  duration: "⏱️",
  difficulty: "📊",
  break: "☕",
  reinforcement: "⭐",
};

const priorityStyles: Record<SessionRecommendation["priority"], string> = {
  high: "border-l-4 border-l-orange-500 bg-orange-50",
  medium: "border-l-4 border-l-sky-500 bg-sky-50",
  low: "border-l-4 border-l-[var(--border)] bg-[var(--muted)]/30",
};

export function RecommendationCard({
  recommendation,
  onAction,
  onDismiss,
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "rounded-[var(--radius-lg)] p-4",
        priorityStyles[recommendation.priority]
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeIcons[recommendation.type]}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{recommendation.title}</h3>
            {onDismiss && (
              <button
                onClick={() => onDismiss(recommendation.id)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {recommendation.description}
          </p>

          {recommendation.actionText && onAction && (
            <Button
              size="sm"
              variant={recommendation.priority === "high" ? "default" : "outline"}
              className="mt-3"
              onClick={() => onAction(recommendation)}
            >
              {recommendation.actionText}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
