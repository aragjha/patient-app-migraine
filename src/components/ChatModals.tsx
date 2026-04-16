import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

export type ChatModalType =
  | "diary-quick"
  | "medication-check"
  | "trigger-log"
  | "pain-scale"
  | "summary-card"
  | null;

interface ChatModalProps {
  type: ChatModalType;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

// --- Diary Quick Modal ---

const symptoms = [
  "Nausea",
  "Light sensitivity",
  "Sound sensitivity",
  "Fatigue",
  "Dizziness",
  "Neck pain",
];

const DiaryQuickModal = ({
  onSubmit,
}: {
  onSubmit: (data: Record<string, unknown>) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  return (
    <div className="px-5 pb-6">
      <h3 className="text-lg font-bold text-white mb-1">Quick symptom check</h3>
      <p className="text-sm text-[hsl(220,14%,60%)] mb-4">
        Tap everything you're feeling right now.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {symptoms.map((s) => {
          const active = selected.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-accent text-accent-foreground ring-2 ring-accent/40"
                  : "bg-[hsl(221,28%,20%)] text-[hsl(220,14%,75%)] hover:bg-[hsl(221,28%,25%)]"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSubmit({ symptoms: selected })}
        disabled={selected.length === 0}
        className="w-full mt-5 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-opacity disabled:opacity-40"
      >
        Log symptoms
      </button>
    </div>
  );
};

// --- Pain Scale Modal ---

const painEmojis = ["😌", "😐", "😕", "😣", "😖", "😫", "🤯"];

const PainScaleModal = ({
  onSubmit,
}: {
  onSubmit: (data: Record<string, unknown>) => void;
}) => {
  const [pain, setPain] = useState(5);

  const emoji = painEmojis[Math.min(Math.floor(pain / 1.6), painEmojis.length - 1)];

  return (
    <div className="px-5 pb-6 text-center">
      <h3 className="text-lg font-bold text-white mb-1">Rate your pain</h3>
      <p className="text-sm text-[hsl(220,14%,60%)] mb-5">
        Slide to match how you feel.
      </p>
      <div className="text-5xl mb-2">{emoji}</div>
      <div className="text-5xl font-extrabold text-white mb-5">{pain}</div>
      <input
        type="range"
        min={0}
        max={10}
        value={pain}
        onChange={(e) => setPain(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-[hsl(221,28%,25%)] accent-accent cursor-pointer [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div className="flex justify-between text-xs text-[hsl(220,14%,50%)] mt-1 mb-5">
        <span>None</span>
        <span>Worst</span>
      </div>
      <button
        onClick={() => onSubmit({ painLevel: pain })}
        className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm"
      >
        Log pain level
      </button>
    </div>
  );
};

// --- Medication Check Modal ---

interface MedCheck {
  name: string;
  dose: string;
  time: string;
  taken: boolean;
}

const MedicationCheckModal = ({
  onSubmit,
}: {
  onSubmit: (data: Record<string, unknown>) => void;
}) => {
  const [meds, setMeds] = useState<MedCheck[]>([
    { name: "Topiramate", dose: "100 mg", time: "Evening", taken: false },
    { name: "Sumatriptan", dose: "50 mg", time: "As needed", taken: false },
  ]);

  const toggle = (idx: number) =>
    setMeds((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, taken: !m.taken } : m))
    );

  return (
    <div className="px-5 pb-6">
      <h3 className="text-lg font-bold text-white mb-1">Today's medications</h3>
      <p className="text-sm text-[hsl(220,14%,60%)] mb-4">
        Tap to mark as taken.
      </p>
      <div className="space-y-2.5">
        {meds.map((med, i) => (
          <button
            key={med.name}
            onClick={() => toggle(i)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
              med.taken
                ? "bg-accent/15 border border-accent/30"
                : "bg-[hsl(221,28%,20%)] border border-transparent"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                med.taken ? "bg-accent" : "bg-[hsl(221,28%,28%)] border border-[hsl(221,28%,35%)]"
              }`}
            >
              {med.taken && <Check className="w-4 h-4 text-accent-foreground" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{med.name} {med.dose}</p>
              <p className="text-xs text-[hsl(220,14%,55%)]">{med.time}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() =>
          onSubmit({
            medications: meds.map((m) => ({ name: m.name, taken: m.taken })),
          })
        }
        className="w-full mt-5 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm"
      >
        Save
      </button>
    </div>
  );
};

// --- Modal Wrapper ---

const ChatModal = ({ type, onClose, onSubmit }: ChatModalProps) => {
  return (
    <AnimatePresence>
      {type && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto bg-[hsl(221,28%,14%)] rounded-t-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[hsl(221,28%,30%)]" />
            </div>

            {/* Close button */}
            <div className="flex justify-end px-4 pb-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[hsl(221,28%,22%)] flex items-center justify-center hover:bg-[hsl(221,28%,28%)] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[hsl(220,14%,65%)]" />
              </button>
            </div>

            {/* Content */}
            {type === "diary-quick" && <DiaryQuickModal onSubmit={onSubmit} />}
            {type === "pain-scale" && <PainScaleModal onSubmit={onSubmit} />}
            {type === "medication-check" && (
              <MedicationCheckModal onSubmit={onSubmit} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
