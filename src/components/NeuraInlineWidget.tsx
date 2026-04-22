import { useState } from "react";
import { motion } from "framer-motion";

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

// ─── Prototype value tables (neuragpt.jsx:109-111) ───────────────────────────
const PAIN_COLORS = [
  "#16A34A", "#65A30D", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
];
const PAIN_FACES = ["😊", "🙂", "🙂", "😐", "😐", "🙁", "😣", "😣", "😖", "😫", "😭"];
const PAIN_LABELS = ["None", "", "Mild", "", "", "Moderate", "", "", "Severe", "", "Worst"];

// ─── Prototype head-zone geometry (neuragpt.jsx:48-62) ───────────────────────
interface HeadZone { id: string; cx: number; cy: number; r: number; label: string; }
const FRONT_ZONES: HeadZone[] = [
  { id: "left-temple", cx: 68, cy: 120, r: 22, label: "L. temple" },
  { id: "right-temple", cx: 192, cy: 120, r: 22, label: "R. temple" },
  { id: "forehead", cx: 130, cy: 80, r: 28, label: "Forehead" },
  { id: "left-eye", cx: 100, cy: 145, r: 15, label: "L. eye" },
  { id: "right-eye", cx: 160, cy: 145, r: 15, label: "R. eye" },
  { id: "sinus", cx: 130, cy: 170, r: 17, label: "Sinus" },
  { id: "jaw", cx: 130, cy: 220, r: 20, label: "Jaw" },
];
const BACK_ZONES_PROTO: HeadZone[] = [
  { id: "crown", cx: 130, cy: 60, r: 28, label: "Crown" },
  { id: "left-back", cx: 80, cy: 130, r: 22, label: "L. back" },
  { id: "right-back", cx: 180, cy: 130, r: 22, label: "R. back" },
  { id: "occipital", cx: 130, cy: 170, r: 22, label: "Occipital" },
  { id: "neck", cx: 130, cy: 230, r: 22, label: "Neck" },
];

// ─── Prototype option sets (neuragpt.jsx:161-202) ────────────────────────────
const symptomOptions: WidgetOption[] = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "light", label: "Light sensitivity", icon: "💡" },
  { id: "sound", label: "Sound sensitivity", icon: "🔊" },
  { id: "dizzy", label: "Dizziness", icon: "💫" },
  { id: "fatigue", label: "Fatigue", icon: "😓" },
  { id: "neck", label: "Neck stiffness", icon: "🦴" },
  { id: "aura", label: "Visual aura", icon: "👁️" },
];

const triggerOptions: WidgetOption[] = [
  { id: "stress", label: "Stress", icon: "😰" },
  { id: "sleep", label: "Poor sleep", icon: "😴" },
  { id: "meal", label: "Skipped meal", icon: "🍽️" },
  { id: "weather", label: "Weather", icon: "🌦️" },
  { id: "hormone", label: "Hormonal", icon: "📅" },
  { id: "screen", label: "Screen time", icon: "📱" },
  { id: "alcohol", label: "Alcohol", icon: "🍷" },
  { id: "unknown", label: "Not sure", icon: "❓" },
];

const timingOptions: WidgetOption[] = [
  { id: "now", label: "Just now", icon: "⏱" },
  { id: "1h", label: "~1 hour ago", icon: "🕐" },
  { id: "3h", label: "~3 hours ago", icon: "🕒" },
  { id: "morning", label: "This morning", icon: "🌅" },
  { id: "yesterday", label: "Yesterday", icon: "📆" },
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
  { id: "great", label: "Great", icon: "😴" },
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

// ─── Shared element styles (prototype tokens) ────────────────────────────────
const widgetCardStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 14,
  boxShadow: "var(--shadow-sm)",
};

const chipPillStyle = (on: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "7px 12px",
  borderRadius: 999,
  background: on ? "var(--ink)" : "var(--bg-deep)",
  border: `1.5px solid ${on ? "var(--ink)" : "transparent"}`,
  color: on ? "#fff" : "var(--ink)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all .12s",
});

const segStyle = (on: boolean): React.CSSProperties => ({
  padding: "5px 14px",
  borderRadius: 999,
  background: on ? "var(--ink)" : "transparent",
  border: 0,
  fontSize: 11,
  fontWeight: 600,
  color: on ? "#fff" : "var(--muted-foreground)",
  cursor: "pointer",
  fontFamily: "inherit",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

const submitStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  background: disabled ? "var(--border)" : "var(--ink)",
  color: disabled ? "var(--muted-foreground)" : "#fff",
  border: 0,
  borderRadius: 14,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  transition: "all .15s",
  minHeight: 44,
});

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

  const handleDone = () => {
    switch (config.type) {
      case "head-diagram": {
        const allZones = [...FRONT_ZONES, ...BACK_ZONES_PROTO];
        const labels = painZones
          .map((z) => allZones.find((zd) => zd.id === z)?.label ?? z);
        const summary =
          labels.length === 0
            ? "Unspecified"
            : labels.slice(0, 2).join(", ") +
              (labels.length > 2 ? ` +${labels.length - 2}` : "");
        onSubmit({ type: "head-diagram", value: painZones, summary });
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
      default: {
        const options = config.options || [];
        const labels = selected
          .map((id) => options.find((o) => o.id === id)?.label)
          .filter(Boolean) as string[];
        const summary =
          labels.length === 0
            ? "None"
            : labels.slice(0, 2).join(", ") +
              (labels.length > 2 ? ` +${labels.length - 2}` : "");
        onSubmit({ type: config.type, value: selected, summary });
        break;
      }
    }
  };

  // ─── Head widget ───────────────────────────────────────────────────────────
  const renderHead = () => {
    const Z = headView === "front" ? FRONT_ZONES : BACK_ZONES_PROTO;
    return (
      <div className="fade-up">
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4 }}>
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setHeadView(v)}
              style={segStyle(headView === v)}
            >
              {v === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 260 280" width="200" height="220">
            <ellipse cx="130" cy="130" rx="90" ry="110" fill="#F3EEE8" stroke="#EAE4DC" strokeWidth="2" />
            {headView === "front" && (
              <>
                <ellipse cx="100" cy="145" rx="9" ry="5" fill="none" stroke="#CFC6BA" strokeWidth="1.5" />
                <ellipse cx="160" cy="145" rx="9" ry="5" fill="none" stroke="#CFC6BA" strokeWidth="1.5" />
                <path d="M115 175 Q130 180 145 175" fill="none" stroke="#CFC6BA" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M120 210 Q130 215 140 210" fill="none" stroke="#CFC6BA" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
            {Z.map((z) => {
              const on = painZones.includes(z.id);
              return (
                <g
                  key={z.id}
                  onClick={() =>
                    setPainZones((prev) =>
                      prev.includes(z.id) ? prev.filter((p) => p !== z.id) : [...prev, z.id]
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={z.cx}
                    cy={z.cy}
                    r={z.r}
                    fill={on ? "rgba(255,107,92,0.35)" : "rgba(59,130,246,0.08)"}
                    stroke={on ? "#FF6B5C" : "rgba(59,130,246,0.3)"}
                    strokeWidth={on ? 2.5 : 1.5}
                    strokeDasharray={on ? "0" : "3 3"}
                  />
                  {on && <circle cx={z.cx} cy={z.cy} r={3.5} fill="#FF6B5C" />}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // ─── Pain widget ───────────────────────────────────────────────────────────
  const renderPain = () => {
    const color = PAIN_COLORS[painLevel];
    const face = PAIN_FACES[painLevel];
    const lbl = PAIN_LABELS[painLevel] || "—";
    return (
      <div className="fade-up">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color,
              fontFamily: "'Fraunces', Georgia, serif",
              lineHeight: 1,
            }}
          >
            {painLevel}
          </div>
          <div style={{ fontSize: 28 }}>{face}</div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {lbl}
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={painLevel}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          style={{ width: "100%", accentColor: color }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "var(--muted-2)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            marginTop: 2,
            marginBottom: 10,
          }}
        >
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    );
  };

  // ─── Chips widget ──────────────────────────────────────────────────────────
  const renderChips = (options: WidgetOption[], allowMulti: boolean) => (
    <div
      className="fade-up"
      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
    >
      {options.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => (allowMulti ? toggleSelect(opt.id) : setSelected([opt.id]))}
            style={chipPillStyle(on)}
          >
            {opt.icon && <span style={{ fontSize: 14 }}>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  // ─── Submit label per prototype ────────────────────────────────────────────
  const submitLabel = (): string => {
    switch (config.type) {
      case "head-diagram": {
        const n = painZones.length;
        return n === 0 ? "Tap a spot" : `Continue · ${n} spot${n > 1 ? "s" : ""}`;
      }
      case "pain-slider":
        return `Continue · ${painLevel}/10`;
      default: {
        const n = selected.length;
        return n === 0 ? "Tap to select" : `Continue · ${n}`;
      }
    }
  };

  const submitDisabled = (): boolean => {
    if (config.type === "head-diagram") return painZones.length === 0;
    if (config.type === "pain-slider") return false;
    return selected.length === 0;
  };

  const chipOptions: WidgetOption[] | null = (() => {
    switch (config.type) {
      case "symptom-chips":
        return config.options ?? symptomOptions;
      case "trigger-chips":
        return config.options ?? triggerOptions;
      case "relief-chips":
        return config.options ?? reliefOptions;
      case "timing-picker":
        return config.options ?? timingOptions;
      case "sleep-quality":
        return config.options ?? sleepQualityOptions;
      case "mood-picker":
        return config.options ?? moodOptions;
      case "medication-check":
        return config.options ?? [];
      default:
        return null;
    }
  })();

  const chipMulti = (() => {
    if (typeof config.multiSelect === "boolean") return config.multiSelect;
    switch (config.type) {
      case "timing-picker":
      case "sleep-quality":
      case "mood-picker":
        return false;
      default:
        return true;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ ...widgetCardStyle, margin: "8px 0" }}
    >
      {config.type === "head-diagram" && renderHead()}
      {config.type === "pain-slider" && renderPain()}
      {chipOptions && renderChips(chipOptions, chipMulti)}

      <button
        onClick={handleDone}
        disabled={submitDisabled()}
        style={submitStyle(submitDisabled())}
      >
        {submitLabel()}
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
