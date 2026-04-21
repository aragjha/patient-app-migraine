import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayData {
  day: string;
  value: number;
}

interface WeeklyAdherenceChartProps {
  title: string;
  percentage: number;
  data: DayData[];
  color?: string;
  missedCount?: number;
  className?: string;
}

interface AdherenceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

// ---------------------------------------------------------------------------
// AdherenceRing
// ---------------------------------------------------------------------------

const getRingColor = (pct: number): string => {
  if (pct > 80) return "hsl(142, 76%, 36%)"; // success green
  if (pct >= 50) return "hsl(38, 92%, 50%)"; // warning yellow
  return "hsl(0, 84%, 60%)"; // destructive red
};

const getRingTrackColor = (): string => {
  // Muted background that works in both light and dark
  return "hsl(var(--muted))";
};

export const AdherenceRing = ({
  percentage,
  size = 120,
  strokeWidth = 10,
}: AdherenceRingProps) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const ringColor = getRingColor(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getRingTrackColor()}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-h1 text-foreground leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {Math.round(clamped)}%
        </motion.span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Mock data generator
// ---------------------------------------------------------------------------

export const generateMockAdherenceData = (): DayData[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    // Realistic spread: mostly 70-100% with occasional dips
    value: Math.min(100, Math.max(0, Math.round(70 + Math.random() * 35 - Math.random() * 15))),
  }));
};

// ---------------------------------------------------------------------------
// WeeklyAdherenceChart
// ---------------------------------------------------------------------------

export const WeeklyAdherenceChart = ({
  title,
  percentage,
  data,
  color,
  missedCount,
  className = "",
}: WeeklyAdherenceChartProps) => {
  const barColor = color ?? getRingColor(percentage);

  // Determine bar fill per cell: dim bars that are zero
  const cellColors = useMemo(
    () =>
      data.map((d) => (d.value === 0 ? "hsl(var(--muted))" : barColor)),
    [data, barColor],
  );

  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Title */}
      <h3 className="text-h2 text-foreground mb-4">{title}</h3>

      {/* Ring + summary row */}
      <div className="flex items-center gap-6 mb-6">
        <AdherenceRing percentage={percentage} size={100} strokeWidth={8} />

        <div className="flex-1 min-w-0">
          <p className="text-body text-foreground font-semibold">
            {percentage >= 80
              ? "Great job!"
              : percentage >= 50
                ? "Keep going"
                : "Needs attention"}
          </p>
          <p className="text-helper text-muted-foreground mt-1">
            {percentage}% completed this week
          </p>
          {typeof missedCount === "number" && missedCount > 0 && (
            <p className="text-helper text-destructive mt-1">
              {missedCount} missed
            </p>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div className="w-full" style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              hide
              domain={[0, 100]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={cellColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeeklyAdherenceChart;
