import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, Gift, Copy, Check } from "lucide-react";
import { getStreakData } from "@/data/streakEngine";

interface RewardsPageProps {
  onBack: () => void;
  onOpenNeura?: () => void;
  onOpenNeuraWithScript?: (scriptId: string) => void;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: string;
  reward: string;
  thresholdDays: number;
  couponCode: string;
}

const MILESTONES: Milestone[] = [
  { id: "7day", name: "Daily Diary Warrior", description: "7-day streak", requirement: "Complete daily check-ins for 7 days in a row", reward: "$10 Amazon gift card", thresholdDays: 7, couponCode: "NDAI-7DAY-A1B2" },
  { id: "14day", name: "2-Week Warrior", description: "14-day streak", requirement: "Keep your streak alive for 14 days", reward: "$25 Amazon gift card", thresholdDays: 14, couponCode: "NDAI-14D-C3D4" },
  { id: "30day", name: "Month Champion", description: "30-day streak", requirement: "30 consecutive days of check-ins", reward: "$50 Amazon gift card", thresholdDays: 30, couponCode: "NDAI-30D-E5F6" },
  { id: "90day", name: "Research Partner", description: "90 days active", requirement: "90 days of consistent logging", reward: "$100 Amazon gift card", thresholdDays: 90, couponCode: "NDAI-90D-G7H8" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDots(activities: Array<{ date: string }>) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today.getTime() - ((dow === 0 ? 6 : dow - 1) * 86_400_000));
  return DAYS_OF_WEEK.map((_, i) => {
    const d = new Date(monday.getTime() + i * 86_400_000);
    const dateStr = d.toISOString().split("T")[0];
    return activities.some((a) => a.date === dateStr);
  });
}

const CouponModal = ({ milestone, onClose }: { milestone: Milestone; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(milestone.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(10,13,28,0.8)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 360, background: "hsl(var(--card))", borderRadius: 24, padding: "28px 24px", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 600, color: "hsl(var(--foreground))", margin: "0 0 6px" }}>
          You unlocked a reward!
        </h2>
        <div style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
          {milestone.name} — {milestone.description}
        </div>

        <div style={{ background: "hsl(var(--muted))", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>YOUR AMAZON CODE</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "hsl(var(--foreground))", letterSpacing: "0.08em" }}>
            {milestone.couponCode}
          </div>
        </div>

        <button
          onClick={handleCopy}
          style={{ width: "100%", height: 48, borderRadius: 24, border: 0, cursor: "pointer", color: "white", fontSize: 14, fontWeight: 700, background: copied ? "#10B981" : "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
        <div style={{ fontSize: 11.5, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
          Check your email for verification instructions to redeem.
        </div>
        <button onClick={onClose} style={{ marginTop: 14, background: "none", border: 0, cursor: "pointer", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const RewardsPage = ({ onBack }: RewardsPageProps) => {
  const [streak, setStreak] = useState(0);
  const [weekDots, setWeekDots] = useState<boolean[]>(Array(7).fill(false));
  const [activeCoupon, setActiveCoupon] = useState<Milestone | null>(null);
  const [shownCoupons, setShownCoupons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sd = getStreakData();
    setStreak(sd.currentStreak);
    setWeekDots(getWeekDots(sd.activities));

    // Auto-show coupon for the HIGHEST newly-unlocked milestone (most rewarding wins)
    const shown = JSON.parse(localStorage.getItem("nc-shown-coupons") || "[]") as string[];
    const shownSet = new Set<string>(shown);
    setShownCoupons(shownSet);
    const newlyUnlocked = MILESTONES
      .filter((m) => sd.currentStreak >= m.thresholdDays && !shownSet.has(m.id))
      .sort((a, b) => b.thresholdDays - a.thresholdDays);
    if (newlyUnlocked.length > 0) {
      const highest = newlyUnlocked[0];
      setActiveCoupon(highest);
      // Mark all newly-unlocked milestones as shown so we don't backfire on next visit
      const newShown = [...shown, ...newlyUnlocked.map((m) => m.id)];
      localStorage.setItem("nc-shown-coupons", JSON.stringify(newShown));
      setShownCoupons(new Set(newShown));
    }
  }, []);

  return (
    <>
      <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
        {/* Header */}
        <div style={{ padding: "52px 20px 0", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <button
            onClick={onBack}
            style={{ width: 40, height: 40, borderRadius: "50%", background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 4 }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "hsl(var(--muted-foreground))", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 4 }}>
              Rewards
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, fontWeight: 600, letterSpacing: "-0.025em", color: "hsl(var(--foreground))", margin: 0, lineHeight: 1.1 }}>
              Keep your <em style={{ fontStyle: "italic", color: "hsl(var(--accent))" }}>streak</em> alive
            </h1>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 60px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Streak hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: "linear-gradient(135deg, #FF9B5A 0%, #FF6B5C 100%)", borderRadius: 24, padding: "24px 20px", color: "white", textAlign: "center", boxShadow: "0 16px 40px rgba(255,107,92,0.3)" }}
          >
            <Flame style={{ width: 36, height: 36, margin: "0 auto 8px" }} />
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 52, fontWeight: 800, lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>
              {streak === 1 ? "Day streak" : "Day streak"}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>Check in daily to keep it going</div>
          </motion.div>

          {/* Weekly dots */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            style={{ background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", borderRadius: 20, padding: "16px 18px" }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 12 }}>This week</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {DAYS_OF_WEEK.map((day, i) => (
                <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: weekDots[i] ? "linear-gradient(135deg, #FF9B5A, #FF6B5C)" : "hsl(var(--muted))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: weekDots[i] ? "0 4px 10px rgba(255,107,92,0.35)" : "none",
                    }}
                  >
                    {weekDots[i] && <Check style={{ width: 14, height: 14, color: "white" }} />}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>{day}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Milestones intro card (first time) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.13em", color: "hsl(var(--muted-foreground))", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 10 }}>
              Milestones
            </div>
            <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 16, padding: "12px 14px", fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.55, marginBottom: 12 }}>
              Complete daily check-ins to unlock rewards. Amazon gift cards are sent to your email after verification.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MILESTONES.map((m, i) => {
                const unlocked = streak >= m.thresholdDays;
                const progress = Math.min(streak / m.thresholdDays, 1);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    style={{
                      background: unlocked ? "rgba(16,185,129,0.06)" : "hsl(var(--card))",
                      border: `1.5px solid ${unlocked ? "rgba(16,185,129,0.3)" : "hsl(var(--border))"}`,
                      borderRadius: 16,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: unlocked ? "rgba(16,185,129,0.15)" : "hsl(var(--muted))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {unlocked
                          ? <Gift style={{ width: 18, height: 18, color: "#10B981" }} />
                          : <Gift style={{ width: 18, height: 18, color: "hsl(var(--muted-foreground))" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{m.requirement}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? "#10B981" : "#3B82F6" }}>{m.reward}</div>
                      </div>
                      {unlocked && (
                        <button
                          onClick={() => setActiveCoupon(m)}
                          style={{ padding: "6px 12px", borderRadius: 20, border: 0, cursor: "pointer", color: "white", fontSize: 12, fontWeight: 700, background: "#10B981", flexShrink: 0 }}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 4, borderRadius: 2, background: "hsl(var(--muted))", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.7 }}
                        style={{ height: "100%", borderRadius: 2, background: unlocked ? "#10B981" : "linear-gradient(90deg, #FF9B5A, #FF6B5C)" }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 5 }}>
                      {unlocked ? "Completed ✓" : `${streak} of ${m.thresholdDays} days`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {activeCoupon && (
          <CouponModal milestone={activeCoupon} onClose={() => setActiveCoupon(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default RewardsPage;
