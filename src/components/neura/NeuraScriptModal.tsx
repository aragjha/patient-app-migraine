import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import HeadDiagram, { HEAD_ZONES, BACK_ZONES } from "@/components/HeadDiagram";
import { WidgetConfig, WidgetSubmission, WidgetOption } from "@/components/NeuraInlineWidget";
import {
  symptomOptions,
  triggerOptions,
  timingOptions,
  reliefOptions,
  sleepQualityOptions,
  moodOptions,
} from "@/components/NeuraInlineWidget";

interface NeuraScriptModalProps {
  open: boolean;
  scriptName: string;
  scriptId: string;
  stepIdx: number;
  totalSteps: number;
  question: string;
  /** One-line subtitle: "Select all that apply." / "Tap a zone or just speak." */
  subtitle?: string;
  /** Coach line shown right below subtitle (italic, muted) — Neura's lead-in. */
  coach?: string;
  widget: WidgetConfig;
  /** Pre-filled value when reopening the modal at this step. */
  initialValue?: string[] | number;
  /** Voice pre-selection from canned transcript (highlight + auto-confirm path). */
  speakHint?: string;
  isSpeaking: boolean;
  onSubmit: (value: WidgetSubmission) => void;
  onClose: () => void;
  onSpeak: () => void;
  /** Optional escape hatch — open the equivalent standalone form. */
  onSwitchToForm?: () => void;
}

const PAIN_COLORS = [
  "#16A34A", "#65A30D", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
];
const PAIN_FACES = ["😊", "🙂", "🙂", "😐", "😐", "🙁", "😣", "😣", "😖", "😫", "😭"];
const PAIN_LABELS = ["None", "", "Mild", "", "", "Moderate", "", "", "Severe", "", "Worst"];

const optionsForType = (config: WidgetConfig): WidgetOption[] => {
  if (config.options && config.options.length) return config.options;
  switch (config.type) {
    case "symptom-chips":
      return symptomOptions;
    case "trigger-chips":
      return triggerOptions;
    case "timing-picker":
      return timingOptions;
    case "relief-chips":
      return reliefOptions;
    case "sleep-quality":
      return sleepQualityOptions;
    case "mood-picker":
      return moodOptions;
    default:
      return [];
  }
};

/**
 * Full-page script question modal — matches Patient App v3 reference.
 * Sits over the chat as a rounded card with progress bar at top, X to close,
 * serif question, subtitle, widget, and a Confirm CTA at the bottom.
 *
 * Voice coexists with tap: when isSpeaking is true, the modal stays mounted
 * (the voice pill below the modal is the listening surface). When the
 * speakHint resolves to a matching option, that option highlights briefly
 * and then auto-submits.
 */
const NeuraScriptModal = ({
  open,
  scriptName,
  scriptId,
  stepIdx,
  totalSteps,
  question,
  subtitle,
  coach,
  widget,
  initialValue,
  speakHint,
  isSpeaking,
  onSubmit,
  onClose,
  onSpeak,
  onSwitchToForm,
}: NeuraScriptModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [headView, setHeadView] = useState<"front" | "back">("front");
  const [painZones, setPainZones] = useState<string[]>([]);
  const [showOverflow, setShowOverflow] = useState(false);

  const widgetOptions = useMemo(() => optionsForType(widget), [widget]);

  // Reset on step change
  useEffect(() => {
    if (!open) return;
    if (Array.isArray(initialValue)) {
      setSelected(initialValue as string[]);
      setPainZones(initialValue as string[]);
    } else if (typeof initialValue === "number") {
      setPainLevel(initialValue);
    } else {
      setSelected([]);
      setPainZones([]);
      setPainLevel(widget.type === "pain-slider" ? 5 : 5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIdx, scriptId]);

  const isMulti = (() => {
    if (typeof widget.multiSelect === "boolean") return widget.multiSelect;
    switch (widget.type) {
      case "timing-picker":
      case "sleep-quality":
      case "mood-picker":
        return false;
      default:
        return true;
    }
  })();

  const toggleOption = (id: string) => {
    if (!isMulti) {
      setSelected([id]);
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleZone = (id: string) => {
    setPainZones((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canConfirm = (() => {
    if (widget.type === "head-diagram") return painZones.length > 0;
    if (widget.type === "pain-slider") return true;
    return selected.length > 0;
  })();

  const buildSubmission = (): WidgetSubmission => {
    if (widget.type === "head-diagram") {
      const allZones = [...HEAD_ZONES, ...BACK_ZONES];
      const labels = painZones.map(
        (z) => allZones.find((zd) => zd.id === z)?.label ?? z,
      );
      return {
        type: widget.type,
        value: painZones,
        summary:
          labels.length === 0
            ? "Unspecified"
            : labels.slice(0, 2).join(", ") +
              (labels.length > 2 ? ` +${labels.length - 2}` : ""),
      };
    }
    if (widget.type === "pain-slider") {
      return { type: widget.type, value: painLevel, summary: `${painLevel}/10` };
    }
    const labels = selected
      .map((id) => widgetOptions.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    return {
      type: widget.type,
      value: selected,
      summary:
        labels.length === 0
          ? "—"
          : labels.slice(0, 2).join(", ") +
            (labels.length > 2 ? ` +${labels.length - 2}` : ""),
    };
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onSubmit(buildSubmission());
  };

  // ── Voice → option matcher ────────────────────────────────────────────────
  // When speakHint changes, parse the transcript, write the matched option to
  // state, then auto-confirm AFTER state settles. We can't call handleConfirm
  // from inside the same effect (the React-batched state update wouldn't be
  // visible yet), so we set a flag and let a follow-up effect read fresh
  // state to build the submission.
  const submittedOnceRef = useRef<string | null>(null);
  const [pendingAutoConfirm, setPendingAutoConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!speakHint) return;
    // Guard: only auto-confirm once per (script, step, hint) tuple
    const key = `${scriptId}:${stepIdx}:${speakHint}`;
    if (submittedOnceRef.current === key) return;
    const lower = speakHint.toLowerCase();
    if (widget.type === "pain-slider") {
      const m = lower.match(/(\d{1,2})/);
      if (m) {
        const n = Math.max(0, Math.min(10, parseInt(m[1], 10)));
        setPainLevel(n);
      }
    } else if (widget.type === "head-diagram") {
      const allZones = [...HEAD_ZONES, ...BACK_ZONES];
      const matched = allZones
        .filter((z) => lower.includes(z.label.toLowerCase().split(" ")[0]))
        .map((z) => z.id);
      if (matched.length) setPainZones(matched);
    } else {
      const matched = widgetOptions
        .filter((o) =>
          lower.includes(o.label.toLowerCase()) ||
          lower.includes(o.id.toLowerCase()),
        )
        .map((o) => o.id);
      if (matched.length) {
        setSelected(isMulti ? matched : [matched[0]]);
      }
    }
    submittedOnceRef.current = key;
    setPendingAutoConfirm(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakHint, open, scriptId, stepIdx]);

  // After state has flushed, fire the confirm in a fresh closure that reads
  // the latest selected/painZones/painLevel.
  useEffect(() => {
    if (!pendingAutoConfirm) return;
    if (!open) {
      setPendingAutoConfirm(false);
      return;
    }
    const timer = setTimeout(() => {
      // Recompute canConfirm with fresh state
      const ok =
        widget.type === "head-diagram"
          ? painZones.length > 0
          : widget.type === "pain-slider"
            ? true
            : selected.length > 0;
      if (!ok) {
        setPendingAutoConfirm(false);
        return;
      }
      // Build submission inline (closes over fresh state, not stale)
      let submission: WidgetSubmission;
      if (widget.type === "head-diagram") {
        const allZones = [...HEAD_ZONES, ...BACK_ZONES];
        const labels = painZones.map(
          (z) => allZones.find((zd) => zd.id === z)?.label ?? z,
        );
        submission = {
          type: widget.type,
          value: painZones,
          summary:
            labels.slice(0, 2).join(", ") +
            (labels.length > 2 ? ` +${labels.length - 2}` : ""),
        };
      } else if (widget.type === "pain-slider") {
        submission = {
          type: widget.type,
          value: painLevel,
          summary: `${painLevel}/10`,
        };
      } else {
        const labels = selected
          .map((id) => widgetOptions.find((o) => o.id === id)?.label)
          .filter(Boolean) as string[];
        submission = {
          type: widget.type,
          value: selected,
          summary:
            labels.slice(0, 2).join(", ") +
            (labels.length > 2 ? ` +${labels.length - 2}` : ""),
        };
      }
      setPendingAutoConfirm(false);
      onSubmit(submission);
    }, 900);
    return () => clearTimeout(timer);
  }, [
    pendingAutoConfirm,
    open,
    widget.type,
    selected,
    painZones,
    painLevel,
    widgetOptions,
    onSubmit,
  ]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderHead = () => (
    <div>
      <div className="flex justify-center gap-1.5 mb-2">
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setHeadView(v)}
            className="px-4 py-1.5 rounded-full border-0 cursor-pointer text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background: headView === v ? "var(--ink)" : "transparent",
              color: headView === v ? "#fff" : "var(--ink-2)",
            }}
          >
            {v === "front" ? "Front" : "Back"}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="scale-[0.95] origin-center w-full">
          <HeadDiagram
            selectedZones={painZones}
            onToggleZone={toggleZone}
            view={headView}
          />
        </div>
      </div>
    </div>
  );

  const renderPain = () => {
    const color = PAIN_COLORS[painLevel];
    const label = PAIN_LABELS[painLevel] || "—";
    const face = PAIN_FACES[painLevel];
    return (
      <div className="flex flex-col items-center py-3">
        <div
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 84,
            fontWeight: 600,
            color,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {painLevel}
        </div>
        <div style={{ fontSize: 36, marginTop: 4 }}>{face}</div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-2)",
            marginTop: 6,
          }}
        >
          {label}
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={painLevel}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          style={{ width: "100%", accentColor: color, marginTop: 18 }}
        />
        <div
          className="w-full flex justify-between"
          style={{
            fontSize: 11,
            color: "var(--muted-2)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            marginTop: 4,
          }}
        >
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    );
  };

  const renderRowOptions = () => (
    <div className="flex flex-col gap-2">
      {widgetOptions.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => toggleOption(opt.id)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer active:scale-[0.99] transition-all"
            style={{
              background: on ? "var(--nc-accent-soft)" : "hsl(var(--card))",
              borderColor: on ? "var(--nc-accent)" : "hsl(var(--border))",
              borderWidth: on ? 1.5 : 1,
              minHeight: 54,
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {opt.icon && <span style={{ fontSize: 18 }}>{opt.icon}</span>}
              <span
                className="truncate"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontFamily: "inherit",
                }}
              >
                {opt.label}
              </span>
            </div>
            {/* Selection indicator */}
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: on
                  ? "5px solid var(--nc-accent)"
                  : "1.5px solid var(--muted-2)",
                background: on ? "#fff" : "transparent",
                transition: "all .15s",
              }}
            />
          </button>
        );
      })}
    </div>
  );

  const renderMoodPills = () => (
    <div className="flex justify-between gap-2">
      {widgetOptions.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => toggleOption(opt.id)}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border cursor-pointer active:scale-95 transition-all"
            style={{
              background: on ? "var(--nc-accent-soft)" : "hsl(var(--card))",
              borderColor: on ? "var(--nc-accent)" : "hsl(var(--border))",
              borderWidth: on ? 1.5 : 1,
            }}
          >
            <span style={{ fontSize: 30 }}>{opt.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: on ? "var(--nc-accent)" : "var(--ink)",
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderWidget = () => {
    if (widget.type === "head-diagram") return renderHead();
    if (widget.type === "pain-slider") return renderPain();
    if (widget.type === "mood-picker") return renderMoodPills();
    return renderRowOptions();
  };

  const progress = ((stepIdx + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={`modal-${scriptId}-${stepIdx}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-40 flex items-start justify-center"
          style={{
            // Responsive padding: small viewports get tighter sides so the
            // card doesn't get squeezed into a thin column.
            paddingLeft: "max(8px, env(safe-area-inset-left))",
            paddingRight: "max(8px, env(safe-area-inset-right))",
            paddingTop: "calc(env(safe-area-inset-top) + 32px)",
            paddingBottom: 168,
            background:
              "linear-gradient(to bottom, rgba(15,18,32,0.18) 0%, rgba(15,18,32,0.10) 70%, rgba(15,18,32,0) 86%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            pointerEvents: "auto",
          }}
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col"
            style={{
              // Width: fill the viewport on phones, cap on tablets/desktops.
              width: "min(100%, 480px)",
              flex: 1,
              // Fallback to vh first, dvh second — iOS Safari < 15.4 doesn't
              // know dvh and would otherwise fall through to no constraint.
              maxHeight: "calc(100vh - 220px)",
              background: "hsl(var(--card))",
              borderRadius: 22,
              boxShadow:
                "0 1px 2px rgba(16,24,40,0.04), 0 24px 48px rgba(16,24,40,0.18)",
              border: "1px solid hsl(var(--border))",
              overflow: "hidden",
            }}
          >
            {/* Header — progress + X.
                Padding scales with viewport via clamp so narrow phones
                (320–360px) don't lose readable horizontal room. */}
            <div style={{ padding: "16px clamp(14px, 5vw, 22px) 8px" }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div
                  className="flex-1 h-[3px] rounded-full overflow-hidden"
                  style={{ background: "var(--bg-deep)" }}
                >
                  <motion.div
                    layout
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "var(--ink)",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 flex items-center justify-center bg-transparent border-0 cursor-pointer active:opacity-70"
                  style={{ width: 28, height: 28, color: "var(--ink-2)" }}
                >
                  <X className="w-4 h-4" strokeWidth={2.2} />
                </button>
              </div>

              {/* Eyebrow */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink-2)",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
              >
                {scriptName} · Step {stepIdx + 1} of {totalSteps}
              </div>

              {/* Question */}
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--ink)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  margin: "8px 0 0",
                }}
              >
                {question}
              </h2>

              {subtitle && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-2)",
                    marginTop: 6,
                  }}
                >
                  {subtitle}
                </div>
              )}

              {coach && (
                <div
                  style={{
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "var(--muted-foreground)",
                    marginTop: 4,
                  }}
                >
                  Neura · "{coach}"
                </div>
              )}
            </div>

            {/* Body — widget area, scrolls if tall */}
            <div
              className="overflow-y-auto"
              style={{
                flex: 1,
                padding: "12px clamp(14px, 5vw, 22px)",
              }}
            >
              {renderWidget()}
            </div>

            {/* Footer — confirm CTA + speak hint band */}
            <div
              style={{
                padding: "10px clamp(14px, 5vw, 22px) 16px",
                borderTop: "1px solid hsl(var(--border))",
              }}
            >
              {isSpeaking ? (
                <div
                  className="rounded-2xl flex items-center gap-3 px-3 py-2.5 mb-3"
                  style={{
                    background: "var(--nc-accent-soft)",
                    border: "1px solid var(--nc-accent)",
                  }}
                >
                  <div className="flex gap-[3px] items-end h-5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        className="block rounded-sm"
                        style={{ width: 3, background: "var(--nc-accent)" }}
                        animate={{ height: ["30%", "100%", "30%"] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--nc-accent)",
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      }}
                    >
                      Listening
                    </div>
                    <div
                      className="truncate"
                      style={{
                        fontSize: 13,
                        color: "var(--ink)",
                        marginTop: 2,
                        fontStyle: "italic",
                      }}
                    >
                      {speakHint || "..."}
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full border-0 transition-all active:scale-[0.99]"
                style={{
                  // Hard-coded navy gradient when enabled so it stays
                  // legible across both light and dark themes.
                  background: canConfirm
                    ? "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)"
                    : "rgba(127,127,140,0.16)",
                  color: canConfirm ? "#fff" : "rgba(127,127,140,0.85)",
                  boxShadow: canConfirm
                    ? "0 8px 22px rgba(59,130,246,0.32)"
                    : "none",
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                  borderRadius: 999,
                  padding: "14px 20px",
                  cursor: canConfirm ? "pointer" : "not-allowed",
                }}
              >
                Confirm
              </button>

              <div className="flex items-center justify-between mt-2.5">
                <button
                  onClick={onSpeak}
                  className="bg-transparent border-0 cursor-pointer active:opacity-70"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--nc-accent)",
                    padding: "4px 0",
                  }}
                >
                  🎙 Speak instead
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowOverflow((v) => !v)}
                    aria-label="More options"
                    className="bg-transparent border-0 cursor-pointer text-muted-foreground"
                    style={{ fontSize: 16, padding: "0 6px" }}
                  >
                    ⋯
                  </button>
                  {showOverflow && (
                    <div
                      className="absolute right-0 bottom-full mb-2 rounded-xl py-1.5 min-w-[180px]"
                      style={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 12px 24px rgba(16,24,40,0.14)",
                      }}
                    >
                      {onSwitchToForm && (
                        <button
                          onClick={() => {
                            setShowOverflow(false);
                            onSwitchToForm();
                          }}
                          className="block w-full text-left bg-transparent border-0 cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                          style={{ color: "var(--ink)" }}
                        >
                          Switch to form
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowOverflow(false);
                          onClose();
                        }}
                        className="block w-full text-left bg-transparent border-0 cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                        style={{ color: "var(--ink)" }}
                      >
                        Pause for now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuraScriptModal;
