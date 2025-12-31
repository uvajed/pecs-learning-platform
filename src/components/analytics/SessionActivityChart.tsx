"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO, isToday, isYesterday } from "date-fns";

interface DataPoint {
  date: string;
  sessions: number;
  duration: number; // in minutes
}

interface SessionActivityChartProps {
  data: DataPoint[];
  className?: string;
}

export function SessionActivityChart({
  data,
  className,
}: SessionActivityChartProps) {
  const formattedData = data.map((d) => {
    const date = parseISO(d.date);
    let label: string;
    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else {
      label = format(date, "EEE");
    }
    return {
      ...d,
      label,
      dateFormatted: format(date, "MMM d"),
    };
  });

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
            formatter={(value, name) => [
              name === "sessions" ? `${value} sessions` : `${value} min`,
              name === "sessions" ? "Sessions" : "Duration",
            ]}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.dateFormatted;
              }
              return "";
            }}
          />
          <Bar
            dataKey="sessions"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.label === "Today"
                    ? "var(--primary)"
                    : "var(--primary-light, hsl(142 45% 70%))"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
