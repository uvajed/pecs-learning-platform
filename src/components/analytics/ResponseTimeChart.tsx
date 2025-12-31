"use client";

import {
  AreaChart,
  Area,
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
  avgResponseTime: number; // in seconds
  fastResponses: number; // count of responses under target
  totalResponses: number;
}

interface ResponseTimeChartProps {
  data: DataPoint[];
  targetTime?: number; // Target response time in seconds
  className?: string;
}

export function ResponseTimeChart({
  data,
  targetTime = 5,
  className,
}: ResponseTimeChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateFormatted: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => `${value}s`}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}s`, "Avg Response Time"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <ReferenceLine
            y={targetTime}
            stroke="var(--success, #22c55e)"
            strokeDasharray="5 5"
            label={{
              value: `Target: ${targetTime}s`,
              position: "right",
              fill: "var(--success, #22c55e)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="avgResponseTime"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#responseTimeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
