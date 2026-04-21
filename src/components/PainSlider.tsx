import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const painConfig: Record<number, { label: string; emoji: string; color: string }> = {
  0: { label: "No pain", emoji: "😊", color: "#22c55e" },
  1: { label: "Barely there", emoji: "🙂", color: "#22c55e" },
  2: { label: "Hurts a bit", emoji: "🙂", color: "#84cc16" },
  3: { label: "Mild", emoji: "😐", color: "#eab308" },
  4: { label: "Uncomfortable", emoji: "🙁", color: "#f59e0b" },
  5: { label: "Moderate", emoji: "😣", color: "#f97316" },
  6: { label: "Mod-Severe", emoji: "😣", color: "#f97316" },
  7: { label: "Severe", emoji: "😖", color: "#ef4444" },
  8: { label: "Very Severe", emoji: "😖", color: "#dc2626" },
  9: { label: "Extreme", emoji: "😫", color: "#b91c1c" },
  10: { label: "Worst imaginable", emoji: "😫", color: "#991b1b" },
};

interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
  showLabel?: boolean;
}

const PainSlider = ({ value, onChange, showLabel = true }: PainSliderProps) => {
  const info = painConfig[value] || painConfig[5];
  const percentage = (value / 10) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Emoji + Number + Label */}
      {showLabel && (
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-center"
          >
            <div className="text-6xl mb-2">{info.emoji}</div>
            <div className="text-4xl font-black text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{info.label}</div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Slider Track */}
      <div className="w-full relative px-2">
        {/* Gradient track background */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{
          background: "linear-gradient(90deg, #22c55e 0%, #84cc16 20%, #eab308 35%, #f97316 50%, #ef4444 70%, #dc2626 85%, #991b1b 100%)"
        }}>
          {/* Gray overlay for unfilled portion */}
          <div
            className="absolute top-0 right-0 h-3 rounded-r-full transition-all duration-150"
            style={{
              width: `${100 - percentage}%`,
              background: "hsl(var(--muted))",
              opacity: 0.7,
            }}
          />
        </div>

        {/* Range input (invisible, on top) */}
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-[3px] border-white shadow-lg pointer-events-none"
          style={{
            left: `calc(${percentage}% - 14px + 8px)`,
            backgroundColor: info.color,
            boxShadow: `0 2px 8px ${info.color}66`,
          }}
          animate={{ left: `calc(${percentage}% - 14px + 8px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Scale numbers */}
      <div className="w-full flex justify-between px-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`text-[10px] font-semibold transition-colors ${
              i === value ? "text-foreground" : "text-muted-foreground/50"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PainSlider;
export { painConfig };
