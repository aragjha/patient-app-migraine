import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight } from "lucide-react";
import { TriggerCorrelation, getSolutions, markInsightPopupShown } from "@/data/triggerIdentificationEngine";

interface TriggerInsightPopupProps {
  trigger: TriggerCorrelation;
  open: boolean;
  onOpenDiary: () => void;
  onDismiss: () => void;
}

const TriggerInsightPopup = ({ trigger, open, onOpenDiary, onDismiss }: TriggerInsightPopupProps) => {
  const solutions = getSolutions(trigger.factorId);

  const handleDismiss = () => {
    markInsightPopupShown();
    onDismiss();
  };

  const handleOpenDiary = () => {
    markInsightPopupShown();
    onOpenDiary();
  };

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
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(10, 13, 28, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "0 16px 24px",
          }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "hsl(var(--card))",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              border: "1.5px solid hsl(var(--border))",
            }}
          >
            {/* Gold gradient header band */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(232,168,56,0.18) 0%, rgba(255,107,92,0.12) 100%)",
                borderBottom: "1px solid rgba(232,168,56,0.20)",
                padding: "20px 20px 16px",
                position: "relative",
              }}
            >
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "hsl(var(--muted))",
                  border: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--muted-foreground))",
                }}
                aria-label="Dismiss"
              >
                <X style={{ width: 13, height: 13 }} />
              </button>

              {/* Eyebrow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: "#E8A838",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}
              >
                <Zap style={{ width: 11, height: 11 }} />
                Trigger Insight Discovered
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Big emoji in ring */}
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(232,168,56,0.22), rgba(255,107,92,0.15))",
                    border: "2px solid rgba(232,168,56,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {trigger.emoji}
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: 24,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.05,
                      color: "hsl(var(--foreground))",
                      marginBottom: 4,
                    }}
                  >
                    {trigger.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#E8A838",
                        lineHeight: 1,
                      }}
                    >
                      {trigger.correlation}%
                    </span>
                    <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>correlation</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
                Neura found that <strong style={{ color: "hsl(var(--foreground))" }}>{trigger.label.toLowerCase()}</strong> appears
                before <strong style={{ color: "#E8A838" }}>{trigger.correlation}%</strong> of your migraines across{" "}
                {trigger.observations} logged events.
              </p>
            </div>

            {/* Solutions body */}
            <div style={{ padding: "16px 20px 0" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.13em",
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Next steps
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {solutions.slice(0, 2).map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      background: "hsl(var(--muted) / 0.5)",
                      borderRadius: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 8,
                        background: i === 0
                          ? "linear-gradient(135deg, #E8A838, #FF6B5C)"
                          : "linear-gradient(135deg, #7C3AED, #3B82F6)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: "hsl(var(--foreground))", lineHeight: 1.45 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ padding: "16px 20px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={handleOpenDiary}
                style={{
                  width: "100%",
                  height: 50,
                  borderRadius: 25,
                  border: 0,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #1B2A4E 0%, #7C3AED 50%, #3B82F6 100%)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 22px rgba(124,58,237,0.32)",
                }}
              >
                Explore in Trigger Diary
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 20,
                  border: 0,
                  cursor: "pointer",
                  background: "transparent",
                  color: "hsl(var(--muted-foreground))",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TriggerInsightPopup;
