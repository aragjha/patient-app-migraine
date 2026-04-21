import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type FontScale = "small" | "medium" | "large";

const scales: { id: FontScale; label: string; multiplier: number; fontSize: string }[] = [
  { id: "small", label: "A", multiplier: 0.875, fontSize: "text-sm" },
  { id: "medium", label: "A", multiplier: 1, fontSize: "text-lg" },
  { id: "large", label: "A", multiplier: 1.125, fontSize: "text-2xl" },
];

function applyFontScale(multiplier: number) {
  document.documentElement.style.setProperty("--font-scale", String(multiplier));
  localStorage.setItem("font-scale", String(multiplier));
}

export function initFontScale() {
  const saved = localStorage.getItem("font-scale");
  if (saved) {
    document.documentElement.style.setProperty("--font-scale", saved);
  }
}

const FontSizeSelector = () => {
  const [active, setActive] = useState<FontScale>("medium");

  useEffect(() => {
    const saved = localStorage.getItem("font-scale");
    if (saved) {
      const match = scales.find((s) => String(s.multiplier) === saved);
      if (match) setActive(match.id);
    }
  }, []);

  const handleSelect = (scale: typeof scales[number]) => {
    setActive(scale.id);
    applyFontScale(scale.multiplier);
  };

  return (
    <div className="flex items-center gap-2">
      {scales.map((scale) => (
        <motion.button
          key={scale.id}
          onClick={() => handleSelect(scale)}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${
            active === scale.id
              ? "border-accent bg-accent/15 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-accent/30"
          }`}
        >
          <span className={`font-bold ${scale.fontSize}`}>{scale.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default FontSizeSelector;
