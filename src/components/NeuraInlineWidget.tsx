import { useState } from "react";
import { motion } from "framer-motion";
import HeadDiagram, { HEAD_ZONES, BACK_ZONES } from "@/components/HeadDiagram";

export type WidgetType =
  | "head-diagram"
  | "pain-slider"
  | "symptom-chips"
  | "trigger-chips"
  | "timing-picker"
  | "medication-check"
  | "relief-chips"
  | "sleep-quality"
  | "mood-picker";

export interface WidgetOption {
  id: string;
  label: string;
  icon?: string;
}

export interface WidgetConfig {
  type: WidgetType;
  options?: WidgetOption[]; // for chip-based widgets
  multiSelect?: boolean;
  max?: number; // max selections
}

export interface WidgetSubmission {
  type: WidgetType;
  value: string[] | number; // chip IDs for multi, single chip ID, or slider number
  summary: string; // human-readable for summary chip
}

interface NeuraInlineWidgetProps {
  config: WidgetConfig;
  onSubmit: (result: WidgetSubmission) => void;
}

const painEmojis = ["😊", "🙂", "😐", "🙁", "😣", "😖", "😫"];
const painColors = [
  "#16A34A", "#65A30D", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
];

const symptomOptions: WidgetOption[] = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "light_sensitivity", label: "Light sensitivity", icon: "💡" },
  { id: "sound_sensitivity", label: "Sound sensitivity", icon: "🔊" },
  { id: "dizziness", label: "Dizziness", icon: "💫" },
  { id: "fatigue", label: "Fatigue", icon: "😓" },
  { id: "neck_stiffness", label: "Neck stiffness", icon: "🦴" },
];

const triggerOptions: WidgetOption[] = [
  { id: "stress", label: "Stress", icon: "😰" },
  { id: "poor_sleep", label: "Poor sleep", icon: "😴" },
  { id: "skipped_meal", label: "Skipped meal", icon: "🍽️" },
  { id: "weather", label: "Weather change", icon: "🌦️" },
  { id: "hormonal", label: "Hormonal", icon: "📅" },
  { id: "screen_time", label: "Screen time", icon: "📱" },
  { id: "alcohol", label: "Alcohol", icon: "🍷" },
  { id: "unknown", label: "Not sure", icon: "❓" },
];

const timingOptions: WidgetOption[] = [
  { id: "just_now", label: "Just now" },
  { id: "1h_ago", label: "1 hour ago" },
  { id: "2h_ago", label: "2 hours ago" },
  { id: "morning", label: "This morning" },
  { id: "still_going", label: "Still going" },
];

const reliefOptions: WidgetOption[] = [
  { id: "dark_room", label: "Dark room", icon: "🌑" },
  { id: "sleep", label: "Sleep", icon: "💤" },
  { id: "ice_pack", label: "Ice pack", icon: "🧊" },
  { id: "hot_compress", label: "Hot compress", icon: "🔥" },
  { id: "caffeine", label: "Caffeine", icon: "☕" },
  { id: "water", label: "Hydration", icon: "💧" },
  { id: "massage", label: "Massage", icon: "💆" },
];

const sleepQualityOptions: WidgetOption[] = [
  { id: "great", label: "Great", icon: "😊" },
  { id: "ok", label: "Okay", icon: "😐" },
  { id: "poor", label: "Poor", icon: "😔" },
  { id: "barely", label: "Barely slept", icon: "😩" },
];

const moodOptions: WidgetOption[] = [
  { id: "good", label: "Good", icon: "😊" },
  { id: "neutral", label: "Neutral", icon: "😐" },
  { id: "low", label: "Low", icon: "😔" },
  { id: "anxious", label: "Anxious", icon: "😰" },
];

const NeuraInlineWidget = ({ config, onSubmit }: NeuraInlineWidgetProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(5);
  const [headView, setHeadView] = useState<"front" | "back">("front");
  const [painZones, setPainZones] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (config.max && prev.length >= config.max) return prev;
      return [...prev, id];
    });
  };

  const renderChips = (options: WidgetOption[], allowMulti: boolean) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => (allowMulti ? toggleSelect(opt.id) : setSelected([opt.id]))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-colors text-sm font-medium ${
              isSelected
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-background text-foreground hover:border-accent/40"
            }`}
            style={{ minHeight: 44 }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  const handleDone = () => {
    switch (config.type) {
      case "head-diagram": {
        const labels = painZones.map((z) => {
          const zone = [...HEAD_ZONES, ...BACK_ZONES].find((zd) => zd.id === z);
          return zone?.label ?? z;
        });
        onSubmit({
          type: "head-diagram",
          value: painZones,
          summary: labels.join(", ") || "No areas selected",
        });
        break;
      }
      case "pain-slider": {
        onSubmit({
          type: "pain-slider",
          value: painLevel,
          summary: `${painLevel}/10`,
        });
        break;
      }
      case "symptom-chips":
      case "trigger-chips":
      case "relief-chips":
      case "timing-picker":
      case "sleep-quality":
      case "mood-picker":
      case "medication-check": {
        const options = config.options || [];
        const labels = selected.map((id) => options.find((o) => o.id === id)?.label ?? id);
        onSubmit({
          type: config.type,
          value: selected,
          summary: labels.length > 0 ? labels.join(", ") : "Skipped",
        });
        break;
      }
    }
  };

  const painEmoji = painEmojis[Math.min(Math.floor(painLevel / 1.5), 6)];
  const painColor = painColors[painLevel];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-card border border-border p-3 my-2 shadow-sm-soft"
    >
      {config.type === "head-diagram" && (
        <div>
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => setHeadView("front")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                headView === "front"
                  ? "bg-accent/15 text-accent border border-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setHeadView("back")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                headView === "back"
                  ? "bg-accent/15 text-accent border border-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Back
            </button>
          </div>
          <div className="flex justify-center" style={{ maxHeight: 220 }}>
            <div className="scale-75 origin-center">
              <HeadDiagram
                selectedZones={painZones}
                onToggleZone={(z) =>
                  setPainZones((prev) =>
                    prev.includes(z) ? prev.filter((p) => p !== z) : [...prev, z]
                  )
                }
                view={headView}
              />
            </div>
          </div>
        </div>
      )}

      {config.type === "pain-slider" && (
        <div className="py-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl">{painEmoji}</span>
            <span className="text-2xl font-bold" style={{ color: painColor }}>
              {painLevel}/10
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full accent-accent"
            style={{ height: 44 }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>No pain</span>
            <span>Worst</span>
          </div>
        </div>
      )}

      {(config.type === "symptom-chips" ||
        config.type === "trigger-chips" ||
        config.type === "relief-chips" ||
        config.type === "medication-check") &&
        renderChips(
          config.options ??
            (config.type === "symptom-chips"
              ? symptomOptions
              : config.type === "trigger-chips"
              ? triggerOptions
              : config.type === "relief-chips"
              ? reliefOptions
              : []),
          config.multiSelect ?? true
        )}

      {config.type === "timing-picker" && renderChips(timingOptions, false)}
      {config.type === "sleep-quality" && renderChips(sleepQualityOptions, false)}
      {config.type === "mood-picker" && renderChips(moodOptions, false)}

      <button
        onClick={handleDone}
        className="w-full mt-3 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-cta active:scale-[0.98] transition-transform"
        style={{ minHeight: 44 }}
      >
        Done
      </button>
    </motion.div>
  );
};

export {
  NeuraInlineWidget,
  symptomOptions,
  triggerOptions,
  timingOptions,
  reliefOptions,
  sleepQualityOptions,
  moodOptions,
};
export default NeuraInlineWidget;
