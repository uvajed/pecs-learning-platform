"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDates: Date[];
  className?: string;
}

export function StreakCalendar({ activeDates, className }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isActiveDay = (date: Date) =>
    activeDates.some((d) => isSameDay(d, date));

  // Calculate current streak for highlighting
  const getStreakStatus = (date: Date): "active" | "today" | "future" | "inactive" | "past" => {
    if (isToday(date)) return "today";
    if (!isBefore(date, new Date())) return "future";
    if (isActiveDay(date)) return "active";
    return "past";
  };

  return (
    <div className={cn("bg-[var(--card)] rounded-[var(--radius-lg)] p-4 border border-[var(--border)]", className)}>
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius)] transition-colors"
        >
          ←
        </button>
        <h3 className="font-semibold text-lg">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius)] transition-colors"
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[var(--muted-foreground)] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const status = getStreakStatus(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={cn(
                "aspect-square flex items-center justify-center rounded-[var(--radius)] text-sm relative",
                !isCurrentMonth && "opacity-30",
                status === "active" && "bg-[var(--primary)] text-white font-semibold",
                status === "today" && !isActiveDay(date) && "ring-2 ring-[var(--primary)] ring-offset-2",
                status === "today" && isActiveDay(date) && "bg-[var(--primary)] text-white font-semibold ring-2 ring-[var(--primary)] ring-offset-2",
                status === "future" && "text-[var(--muted-foreground)]",
                status === "past" && "text-[var(--muted-foreground)]"
              )}
            >
              {format(date, "d")}

              {/* Fire indicator for active days */}
              {status === "active" && (
                <span className="absolute -top-1 -right-1 text-xs">🔥</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-[var(--primary)]" />
          <span className="text-[var(--muted-foreground)]">Practice day</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded ring-2 ring-[var(--primary)]" />
          <span className="text-[var(--muted-foreground)]">Today</span>
        </div>
      </div>
    </div>
  );
}
