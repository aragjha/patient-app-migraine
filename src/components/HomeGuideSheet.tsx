import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Activity, Pill, BarChart2, BookOpen, HelpCircle } from "lucide-react";

interface HomeGuideSheetProps {
  open: boolean;
  onClose: () => void;
}

const guides = [
  {
    icon: Activity,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    title: "Log a headache",
    body: "Tap the hero card or + button when a migraine starts. Neura walks you through it — location, pain level, triggers, and meds taken. Takes about 45 seconds.",
    tip: "Log at onset for the most accurate picture.",
  },
  {
    icon: Sparkles,
    color: "#E8A838",
    bg: "rgba(232,168,56,0.12)",
    title: "Daily check-in",
    body: "Every day Neura asks 2–3 quick questions about sleep, stress, and lifestyle. This builds your trigger profile over time. Just 1 minute.",
    tip: "Daily check-ins build your streak and keep patterns clear.",
  },
  {
    icon: Pill,
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    title: "Medications",
    body: "Add your preventive and acute medications. NeuroCare tracks reminders at the right times and helps you see which meds work best for relief.",
    tip: "Set reminders to stay consistent with your routine.",
  },
  {
    icon: BarChart2,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.12)",
    title: "Trigger discovery",
    body: "After a few sessions, patterns emerge. Neura surfaces what consistently shows up before your migraines — like stress or poor sleep. Tap Trigger Diary to explore.",
    tip: "Clearer patterns appear after 5+ logs. Keep going.",
  },
  {
    icon: BookOpen,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    title: "Reports",
    body: "Generate a summary of your episodes, top triggers, and medication patterns. Share with your doctor to guide your care plan.",
    tip: "Reports are text-based — easy to email or print.",
  },
  {
    icon: HelpCircle,
    color: "#64748B",
    bg: "rgba(100,116,139,0.12)",
    title: "During an attack",
    body: "When a migraine is active, the home screen shows relief options. Choose breathing exercises, guided audio, or ambient sound to help you through it.",
    tip: "Tell Neura what soothes you — it'll remember your preference.",
  },
];

const HomeGuideSheet = ({ open, onClose }: HomeGuideSheetProps) => {
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
            padding: "0 0 0",
          }}
          onClick={onClose}
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
            <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.13em", color: "hsl(var(--muted-foreground))", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 4 }}>
                  HOW IT WORKS
                </div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", color: "hsl(var(--foreground))", margin: 0, lineHeight: 1.1 }}>
                  Your guide to<br /><em className="italic">NeuroCare</em>
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "hsl(var(--muted))", border: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Scrollable cards */}
            <div style={{ overflowY: "auto", flex: 1, padding: "4px 20px calc(32px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 12 }}>
              {guides.map((g, i) => {
                const Icon = g.icon;
                return (
                  <motion.div
                    key={g.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{
                      background: "hsl(var(--muted) / 0.4)",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 20,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                          background: g.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Icon style={{ width: 18, height: 18, color: g.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 4 }}>
                          {g.title}
                        </div>
                        <div style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: 8 }}>
                          {g.body}
                        </div>
                        <div
                          style={{
                            fontSize: 11, fontWeight: 600, color: g.color,
                            background: g.bg, borderRadius: 8, padding: "4px 8px",
                            display: "inline-block",
                          }}
                        >
                          💡 {g.tip}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomeGuideSheet;
