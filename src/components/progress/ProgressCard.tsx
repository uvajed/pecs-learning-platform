"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  color?: "primary" | "success" | "warning" | "info";
  className?: string;
}

export function ProgressCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  color = "primary",
  className,
}: ProgressCardProps) {
  const colorStyles = {
    primary: {
      bg: "bg-[var(--primary)]/5",
      border: "border-[var(--primary)]/20",
      text: "text-[var(--primary)]",
      progressBg: "bg-[var(--primary)]",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      progressBg: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      progressBg: "bg-amber-500",
    },
    info: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-600",
      progressBg: "bg-sky-500",
    },
  };

  const styles = colorStyles[color];

  const trendColors = {
    up: "text-emerald-600 bg-emerald-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-[var(--muted-foreground)] bg-[var(--muted)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[var(--radius-lg)] p-4 border",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-3xl font-bold", styles.text)}>{value}</span>
            {subtitle && (
              <span className="text-sm text-[var(--muted-foreground)]">
                {subtitle}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2",
                trendColors[trend.direction]
              )}
            >
              <span>
                {trend.direction === "up"
                  ? "↑"
                  : trend.direction === "down"
                  ? "↓"
                  : "→"}
              </span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-[var(--muted-foreground)]">{trend.label}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <motion.span
            className="text-3xl select-none"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            {icon}
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
            <span>{progress.label || "Progress"}</span>
            <span>
              {progress.current} / {progress.max}
            </span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", styles.progressBg)}
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.max) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
