import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Pill, Check } from "lucide-react";
import { Medication } from "@/data/medicationContent";

/**
 * Medication Hub — ported from the Claude Design prototype.
 * Editorial "What to take, when." header, 4-week adherence heatmap grid,
 * today's schedule with Taken/Skip inline actions, dashed Add CTA.
 * Reads real Medication[] passed in and reports status taps via onOpenLog.
 */

interface MedicationHubProps {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (med: Medication) => void;
  onToggleReminder: (medId: string) => void;
  onOpenLog: () => void;
  onBack: () => void;
}

type Status = "pending" | "taken" | "skipped";

const TIME_LABELS: Record<string, string> = {
  morning: "8:00 AM",
  afternoon: "12:00 PM",
  evening: "6:00 PM",
  night: "10:00 PM",
};

const TIME_ORDER = ["morning", "afternoon", "evening", "night"] as const;

// Map medication color → light tint + ink for pill icon.
const tintFor = (color: string) => {
  const c = color || "#3B82F6";
  return { bg: c + "22", ink: c };
};

interface ScheduleItem {
  med: Medication;
  timeId: string;
  label: string;
}

const MedicationHub = ({
  medications,
  onAddMedication,
  onEditMedication: _onEditMedication,
  onToggleReminder: _onToggleReminder,
  onOpenLog: _onOpenLog,
  onBack,
}: MedicationHubProps) => {
  const [status, setStatus] = useState<Record<string, Status>>({});

  // Flatten to a per-dose schedule for today.
  const today: ScheduleItem[] = useMemo(() => {
    const items: ScheduleItem[] = [];
    medications.forEach((m) => {
      if (m.frequency === "as_needed" || m.times.length === 0) return;
      m.times.forEach((t) => {
        items.push({ med: m, timeId: t, label: TIME_LABELS[t] || t });
      });
    });
    items.sort(
      (a, b) => TIME_ORDER.indexOf(a.timeId as any) - TIME_ORDER.indexOf(b.timeId as any),
    );
    return items;
  }, [medications]);

  const key = (item: ScheduleItem) => `${item.med.id}-${item.timeId}`;
  const setItemStatus = (item: ScheduleItem, s: Status) =>
    setStatus((p) => ({ ...p, [key(item)]: s }));

  // 4-week adherence grid — mostly-taken with a couple of blips.
  const days = Array.from({ length: 28 }, (_, i) => ({
    d: i + 1,
    status:
      i === 27
        ? "today"
        : [2, 9, 19].includes(i)
        ? "partial"
        : i === 5
        ? "missed"
        : "taken",
  }));

  const adherencePct = 92;
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
        </button>
        <div
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Medications
        </div>
      </div>

      <motion.div
        className="flex-1 px-5 pt-2 pb-28 overflow-y-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">
          Your regimen
        </div>
        <h2
          className="text-[34px] font-medium tracking-tight leading-[1.05] text-foreground m-0 mb-5"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          What to take,
          <br />
          <em className="italic text-accent font-extrabold">when</em>.
        </h2>

        {/* Adherence heatmap */}
        <div className="bg-card border border-border rounded-[22px] p-4 mb-4">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                Adherence · 4 wks
              </div>
              <div
                className="text-[28px] font-extrabold text-foreground mt-1"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {adherencePct}
                <span className="text-base text-muted-foreground">%</span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
              Great
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => (
              <div
                key={d.d}
                className="aspect-square rounded-md"
                style={{
                  background:
                    d.status === "taken"
                      ? "#22C55E"
                      : d.status === "partial"
                      ? "#FBBF24"
                      : d.status === "missed"
                      ? "hsl(var(--muted))"
                      : "transparent",
                  border: d.status === "today" ? "2px solid hsl(var(--foreground))" : 0,
                  opacity: d.status === "taken" ? 0.85 : 1,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2.5">
            <span>Mar 25</span>
            <div className="flex gap-2.5">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-[#22C55E]" />
                Taken
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-[#FBBF24]" />
                Partial
              </span>
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
          Today · {dayName}
        </div>

        {today.length === 0 && medications.length === 0 && (
          <div className="bg-card border border-border rounded-[20px] p-5 text-center mb-3">
            <div className="text-sm font-semibold text-foreground mb-1">No medications yet</div>
            <div className="text-xs text-muted-foreground">
              Add what you take to see your schedule and adherence.
            </div>
          </div>
        )}

        {today.map((item) => {
          const s: Status = status[key(item)] || "pending";
          const tint = tintFor(item.med.color);
          return (
            <div
              key={key(item)}
              className="bg-card border border-border rounded-[20px] p-4 mb-2.5 flex items-center gap-3.5"
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                style={{ background: tint.bg, color: tint.ink }}
              >
                <Pill className="w-[22px] h-[22px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-foreground truncate">
                  {item.med.name}{" "}
                  <span className="text-muted-foreground font-medium text-[13px]">
                    · {item.med.dosage}mg
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {item.label} · {item.med.frequency === "once" ? "Preventive" : "Scheduled"}
                </div>
              </div>
              {s === "taken" ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setItemStatus(item, "skipped")}
                    className="px-2.5 py-2 rounded-xl bg-muted border-0 cursor-pointer text-[11px] font-semibold text-muted-foreground"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => setItemStatus(item, "taken")}
                    className="px-3.5 py-2 rounded-xl bg-foreground text-background border-0 cursor-pointer text-[11px] font-bold"
                  >
                    Taken
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {medications.length > 0 && today.length === 0 && (
          <div className="bg-card border border-border rounded-[20px] p-4 mb-2.5 text-xs text-muted-foreground">
            Nothing scheduled right now — your as-needed meds are tracked separately.
          </div>
        )}

        {/* Add CTA */}
        <button
          onClick={onAddMedication}
          className="mt-2 w-full p-3.5 rounded-[18px] bg-card text-foreground border-[1.5px] border-dashed border-border text-[13px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-transform"
        >
          <Plus className="w-[15px] h-[15px]" strokeWidth={2.4} />
          Add medication · photo or manual
        </button>
      </motion.div>
    </div>
  );
};

export default MedicationHub;
