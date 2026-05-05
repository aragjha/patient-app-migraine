import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PainSlider from "./PainSlider";

interface LastAttackSheetProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: LastAttackData) => void;
}

export interface LastAttackData {
  when: string;
  duration: string;
  pain: number;
  reliefPref: string;
}

const WHEN_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "2-3-days", label: "2–3 days ago" },
  { id: "last-week", label: "Last week" },
  { id: "dont-remember", label: "Can't remember" },
];

const DURATION_OPTIONS = [
  { id: "under-4h", label: "Under 4 hours" },
  { id: "4-12h", label: "4–12 hours" },
  { id: "12-24h", label: "12–24 hours" },
  { id: "more-than-day", label: "More than a day" },
  { id: "still-going", label: "Still going" },
];

const RELIEF_OPTIONS = [
  { id: "breathing", label: "🫁 Breathing exercises" },
  { id: "audio", label: "🎵 Calming audio" },
  { id: "meditation", label: "🧘 Guided meditation" },
  { id: "rest", label: "💤 Just rest — no prompts" },
];

const LastAttackSheet = ({ open, onClose, onComplete }: LastAttackSheetProps) => {
  const [step, setStep] = useState(0); // 0=when, 1=duration, 2=pain, 3=relief
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("");
  const [pain, setPain] = useState(5);
  const [relief, setRelief] = useState("");

  const handleClose = () => {
    // Dismiss banner permanently — user explicitly closed the sheet
    try { localStorage.setItem("nc-last-attack-dismissed", "true"); } catch {}
    setStep(0);
    setWhen("");
    setDuration("");
    setPain(5);
    setRelief("");
    onClose();
  };

  const handleComplete = () => {
    onComplete({ when, duration, pain, reliefPref: relief });
    handleClose();
  };

  const stepTitles = [
    "When was your last migraine?",
    "How long did it last?",
    "Peak pain level?",
    "What soothes you during a migraine?",
  ];

  const stepSubtitles = [
    undefined,
    undefined,
    undefined,
    "Neura will suggest this when you're in an attack. You can change it anytime.",
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(10,13,28,0.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "hsl(var(--card))",
              borderRadius: "28px 28px 0 0",
              overflow: "hidden",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Handle */}
            <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "hsl(var(--border))" }} />
            </div>

            {/* Header */}
            <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                {/* Progress dots */}
                <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 3,
                        flex: 1,
                        borderRadius: 2,
                        background: i <= step ? "#3B82F6" : "hsl(var(--border))",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", color: "hsl(var(--foreground))", margin: 0, lineHeight: 1.2 }}>
                  {stepTitles[step]}
                </h2>
                {stepSubtitles[step] && (
                  <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginTop: 6, lineHeight: 1.5 }}>
                    {stepSubtitles[step]}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "hsl(var(--muted))", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px calc(28px + env(safe-area-inset-bottom))" }}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="when" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {WHEN_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setWhen(opt.id); setStep(1); }}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 14,
                            border: `1.5px solid ${when === opt.id ? "#3B82F6" : "hsl(var(--border))"}`,
                            background: when === opt.id ? "rgba(59,130,246,0.08)" : "hsl(var(--muted)/0.4)",
                            color: "hsl(var(--foreground))",
                            fontSize: 15,
                            fontWeight: 500,
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setDuration(opt.id); setStep(2); }}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 14,
                            border: `1.5px solid ${duration === opt.id ? "#3B82F6" : "hsl(var(--border))"}`,
                            background: duration === opt.id ? "rgba(59,130,246,0.08)" : "hsl(var(--muted)/0.4)",
                            color: "hsl(var(--foreground))",
                            fontSize: 15,
                            fontWeight: 500,
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="pain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ padding: "8px 0 24px" }}>
                      <PainSlider value={pain} onChange={setPain} />
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      style={{
                        width: "100%",
                        height: 52,
                        borderRadius: 26,
                        border: 0,
                        cursor: "pointer",
                        color: "white",
                        fontSize: 16,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                        boxShadow: "0 8px 22px rgba(59,130,246,0.32)",
                      }}
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="relief" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {RELIEF_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setRelief(opt.id)}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 14,
                            border: `1.5px solid ${relief === opt.id ? "#3B82F6" : "hsl(var(--border))"}`,
                            background: relief === opt.id ? "rgba(59,130,246,0.08)" : "hsl(var(--muted)/0.4)",
                            color: "hsl(var(--foreground))",
                            fontSize: 15,
                            fontWeight: 500,
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleComplete}
                      disabled={!relief}
                      style={{
                        width: "100%",
                        height: 52,
                        borderRadius: 26,
                        border: 0,
                        cursor: relief ? "pointer" : "default",
                        color: "white",
                        fontSize: 16,
                        fontWeight: 700,
                        background: relief ? "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)" : "hsl(var(--muted))",
                        boxShadow: relief ? "0 8px 22px rgba(59,130,246,0.32)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      Save & close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LastAttackSheet;
