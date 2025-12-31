"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DataPoint {
  date: string;
  successRate: number;
  sessions: number;
}

interface SuccessRateChartProps {
  data: DataPoint[];
  targetRate?: number;
  className?: string;
}

export function SuccessRateChart({
  data,
  targetRate = 80,
  className,
}: SuccessRateChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateFormatted: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="dateFormatted"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
            formatter={(value) => [`${value}%`, "Success Rate"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <ReferenceLine
            y={targetRate}
            stroke="var(--primary)"
            strokeDasharray="5 5"
            label={{
              value: `Target: ${targetRate}%`,
              position: "right",
              fill: "var(--primary)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="successRate"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "var(--primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
