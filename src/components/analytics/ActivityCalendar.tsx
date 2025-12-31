"use client";

import { useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityDay {
  date: string;
  sessions: number;
  successRate: number;
}

interface ActivityCalendarProps {
  data: ActivityDay[];
  weeks?: number;
  className?: string;
}

export function ActivityCalendar({
  data,
  weeks = 12,
  className,
}: ActivityCalendarProps) {
  const today = new Date();

  // Generate all days for the calendar
  const calendarData = useMemo(() => {
    const startDate = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 0 });
    const endDate = endOfWeek(today, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Create a map for quick lookup
    const activityMap = new Map(
      data.map((d) => [format(parseISO(d.date), "yyyy-MM-dd"), d])
    );

    return allDays.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const activity = activityMap.get(dateKey);
      return {
        date: day,
        sessions: activity?.sessions || 0,
        successRate: activity?.successRate || 0,
      };
    });
  }, [data, weeks, today]);

  // Group by weeks
  const weekData = useMemo(() => {
    const result: typeof calendarData[] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
    return result;
  }, [calendarData]);

  // Get intensity level (0-4) based on sessions
  const getIntensityLevel = (sessions: number): number => {
    if (sessions === 0) return 0;
    if (sessions === 1) return 1;
    if (sessions <= 2) return 2;
    if (sessions <= 4) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-gray-100",           // 0 sessions
    "bg-green-200",          // 1 session
    "bg-green-300",          // 2 sessions
    "bg-green-400",          // 3-4 sessions
    "bg-green-600",          // 5+ sessions
  ];

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className={cn("", className)}>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((day, i) => (
            <div
              key={i}
              className="w-3 h-3 text-[10px] text-[var(--muted-foreground)] flex items-center"
            >
              {i % 2 === 1 ? day : ""}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const isToday = isSameDay(day.date, today);
                const intensity = getIntensityLevel(day.sessions);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                      intensityColors[intensity],
                      isToday && "ring-2 ring-[var(--primary)] ring-offset-1"
                    )}
                    title={`${format(day.date, "MMM d, yyyy")}: ${day.sessions} sessions${
                      day.sessions > 0 ? `, ${day.successRate}% success` : ""
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-[var(--muted-foreground)]">
        <span>Less</span>
        {intensityColors.map((color, i) => (
          <div
            key={i}
            className={cn("w-3 h-3 rounded-sm", color)}
            title={
              i === 0
                ? "No activity"
                : i === 1
                ? "1 session"
                : i === 2
                ? "2 sessions"
                : i === 3
                ? "3-4 sessions"
                : "5+ sessions"
            }
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
