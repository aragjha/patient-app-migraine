import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getStreakData, seedStreakDemoData } from "@/data/streakEngine";
import { ensureDemoData } from "@/data/triggerIdentificationEngine";
import {
  Sun,
  Moon,
  Eye,
  Waves,
  Palette,
  Heart,
  Sparkles,
  Info,
  Calendar,
  User,
  Pill,
  ChevronRight,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Profile — editorial hero + three grouped sections (Appearance / Data & consent /
 * Connected) matching the prototype in /tmp/design_extract/.../screens/profile.jsx.
 */

interface ProfilePageProps {
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenRewards?: () => void;
  onRestartOnboarding?: () => void;
  onOpenNeura?: () => void;
  onOpenDiary?: () => void;
  onOpenReport?: () => void;
  onLog?: () => void;
}

type IconKey =
  | "sun"
  | "moon"
  | "eye"
  | "waveform"
  | "palette"
  | "heart"
  | "sparkle"
  | "info"
  | "calendar"
  | "user"
  | "pill";

const IconByKey = ({ name, size = 15 }: { name: IconKey; size?: number }) => {
  const cls = `w-[${size}px] h-[${size}px]`;
  const common = { strokeWidth: 2, className: cls } as const;
  const style = { width: size, height: size };
  switch (name) {
    case "sun":
      return <Sun {...common} style={style} />;
    case "moon":
      return <Moon {...common} style={style} />;
    case "eye":
      return <Eye {...common} style={style} />;
    case "waveform":
      return <Waves {...common} style={style} />;
    case "palette":
      return <Palette {...common} style={style} />;
    case "heart":
      return <Heart {...common} style={style} />;
    case "sparkle":
      return <Sparkles {...common} style={style} />;
    case "info":
      return <Info {...common} style={style} />;
    case "calendar":
      return <Calendar {...common} style={style} />;
    case "user":
      return <User {...common} style={style} />;
    case "pill":
      return <Pill {...common} style={style} />;
    default:
      return null;
  }
};

// 44×26 toggle with 20×20 white pill, matching prototype exactly.
const ProtoToggle = ({ on, onClick }: { on: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-pressed={on}
    className="relative shrink-0 border-0 cursor-pointer"
    style={{
      width: 44,
      height: 26,
      borderRadius: 999,
      background: on ? "var(--nc-accent)" : "var(--nc-border)",
      transition: "background .2s",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: 3,
        left: on ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        transition: "left .2s",
        display: "block",
      }}
    />
  </button>
);

type ProfileRow =
  | { kind: "chev"; icon: IconKey; label: string; detail?: string; onClick?: () => void }
  | {
      kind: "toggle";
      icon: IconKey;
      label: string;
      value: boolean;
      onToggle: () => void;
    };

const ProfilePage = ({
  onNavigate,
  onOpenRewards,
  onRestartOnboarding,
  onOpenNeura,
  onOpenDiary,
  onOpenReport,
  onLog,
}: ProfilePageProps) => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark"),
  );
  const [reducedMotion, setReducedMotion] = usePersistedState(
    "nc-reduced-motion",
    false,
  );
  const [highContrast, setHighContrast] = usePersistedState(
    "nc-high-contrast",
    false,
  );
  const [shareClinician, setShareClinician] = usePersistedState(
    "nc-share-clinician",
    true,
  );
  const [allowNeura, setAllowNeura] = usePersistedState(
    "nc-allow-neura",
    true,
  );
  const [allowResearch, setAllowResearch] = usePersistedState(
    "nc-allow-research",
    false,
  );
  const [streak] = usePersistedState("nc-streak", 12);
  const [liveStreak, setLiveStreak] = useState(streak);
  const [attackCount, setAttackCount] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem("nc-demo-mode") === "true");

  useEffect(() => {
    const sd = getStreakData();
    setLiveStreak(sd.currentStreak);
    setAttackCount(sd.activities.filter((a) => a.type === "attack-log").length);
    const uniqueDays = new Set(sd.activities.map((a) => a.date)).size;
    setDaysActive(uniqueDays);
  }, []);

  const activateDemo = () => {
    localStorage.setItem("nc-demo-mode", "true");
    // Seed all demo data
    seedStreakDemoData();
    ensureDemoData();
    // Mark onboarding complete with migraine diagnosis
    localStorage.setItem("nc-onboarding-complete", "true");
    localStorage.setItem("nc-migraine-profile", JSON.stringify({ diagnosis: "migraine", sex: "female", menstrualEnabled: true, goals: ["triggers", "relief"], frequency: "15plus", painLevel: 7 }));
    localStorage.setItem("nc-consent-at", new Date().toISOString());
    localStorage.setItem("nc-last-attack-dismissed", "true");
    localStorage.setItem("nc-guide-shown", "true");
    setIsDemoMode(true);
    window.location.reload();
  };

  const exitDemo = () => {
    // Clear the full nc-* namespace so the user returns to a clean first-time state
    Object.keys(localStorage)
      .filter((k) => k.startsWith("nc-"))
      .forEach((k) => localStorage.removeItem(k));
    setIsDemoMode(false);
    window.location.reload();
  };

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to log out");
    }
  };

  const sections: { title: string; items: ProfileRow[] }[] = [
    {
      title: "Appearance",
      items: [
        {
          kind: "chev",
          icon: isDark ? "moon" : "sun",
          label: "Theme",
          detail: isDark ? "Dark" : "Light",
          onClick: toggleDarkMode,
        },
        {
          kind: "chev",
          icon: "eye",
          label: "Font size",
          detail: "Large",
          onClick: () =>
            toast("Font size", {
              description: "Adjust in Settings → Display.",
            }),
        },
        {
          kind: "toggle",
          icon: "waveform",
          label: "Reduced motion",
          value: reducedMotion,
          onToggle: () => setReducedMotion(!reducedMotion),
        },
        {
          kind: "toggle",
          icon: "palette",
          label: "High contrast",
          value: highContrast,
          onToggle: () => setHighContrast(!highContrast),
        },
      ],
    },
    {
      title: "Data & consent",
      items: [
        {
          kind: "toggle",
          icon: "heart",
          label: "Share with clinician",
          value: shareClinician,
          onToggle: () => setShareClinician(!shareClinician),
        },
        {
          kind: "toggle",
          icon: "sparkle",
          label: "Allow Neura to use my data",
          value: allowNeura,
          onToggle: () => setAllowNeura(!allowNeura),
        },
        {
          kind: "toggle",
          icon: "info",
          label: "Research (anonymized)",
          value: allowResearch,
          onToggle: () => setAllowResearch(!allowResearch),
        },
      ],
    },
    {
      title: "Connected",
      items: [
        {
          kind: "chev",
          icon: "calendar",
          label: "Apple Health",
          detail: "Connected",
          onClick: () =>
            toast("Apple Health", { description: "Sync settings open soon." }),
        },
        {
          kind: "chev",
          icon: "user",
          label: "Dr. Patel · Neurology",
          detail: "Active",
          onClick: () =>
            toast("Clinician sharing", {
              description: "Dr. Patel has read access to your diary.",
            }),
        },
        {
          kind: "chev",
          icon: "pill",
          label: "CVS Pharmacy",
          detail: "Synced",
          onClick: () =>
            toast("Pharmacy", { description: "Last sync 2h ago." }),
        },
      ],
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <motion.div
        className="flex-1 overflow-y-auto pb-28"
        style={{ padding: "4px 20px 20px" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Hero */}
        <div
          className="flex items-center"
          style={{ gap: 14, marginBottom: 20, padding: "12px 0" }}
        >
          <div
            className="flex items-center justify-center text-white shrink-0"
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "linear-gradient(135deg, #1B2A4E, #7C3AED)",
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "'Fraunces', Georgia, serif",
            }}
          >
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-extrabold text-foreground truncate">
              Maya Chen
            </div>
            <div className="text-xs text-muted-foreground">
              Chronic migraine · since 2021
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <span
                className="font-bold"
                style={{
                  fontSize: 10,
                  background: "var(--nc-accent-soft)",
                  color: "var(--nc-accent)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                Beta tester
              </span>
              <span
                className="font-bold"
                style={{
                  fontSize: 10,
                  background: "var(--green-soft)",
                  color: "var(--green)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {liveStreak}d streak
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Attacks", value: attackCount },
            { label: "Day streak", value: `${liveStreak}🔥` },
            { label: "Days active", value: daysActive },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* My data quick links */}
        <div style={{ background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
          {[
            { label: "Generate report", onClick: onOpenReport },
            { label: "View history", onClick: onOpenDiary },
            { label: "Rewards & streak", onClick: onOpenRewards },
          ].map(({ label, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: i > 0 ? "1px solid hsl(var(--border))" : "none", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--foreground))" }}>{label}</span>
              <span style={{ fontSize: 16, color: "hsl(var(--muted-foreground))" }}>›</span>
            </button>
          ))}
        </div>

        {/* Demo mode */}
        <div style={{ marginBottom: 20 }}>
          {isDemoMode ? (
            <button
              onClick={exitDemo}
              style={{ width: "100%", height: 48, borderRadius: 24, border: "1.5px solid hsl(var(--border))", cursor: "pointer", color: "hsl(var(--muted-foreground))", fontSize: 14, fontWeight: 600, background: "hsl(var(--card))" }}
            >
              Exit demo mode
            </button>
          ) : (
            <button
              onClick={activateDemo}
              style={{ width: "100%", height: 48, borderRadius: 24, border: "1.5px solid rgba(59,130,246,0.4)", cursor: "pointer", color: "#3B82F6", fontSize: 14, fontWeight: 700, background: "rgba(59,130,246,0.07)" }}
            >
              Try Demo Mode
            </button>
          )}
          <div style={{ fontSize: 11, textAlign: "center", color: "hsl(var(--muted-foreground))", marginTop: 6 }}>
            {isDemoMode ? "Demo mode active — pre-filled with sample data" : "Fills app with sample data for testing & demos"}
          </div>
        </div>

        {/* Sections */}
        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 18 }}>
            <div
              className="eyebrow"
              style={{ marginBottom: 8, paddingLeft: 4 }}
            >
              {s.title}
            </div>
            <div
              style={{
                background: "var(--nc-card)",
                border: "1px solid var(--nc-border)",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {s.items.map((it, j) => (
                <div
                  key={j}
                  onClick={it.kind === "chev" ? it.onClick : undefined}
                  className="flex items-center"
                  style={{
                    gap: 12,
                    padding: "14px 16px",
                    minHeight: 56,
                    cursor: it.kind === "chev" && it.onClick ? "pointer" : "default",
                    borderBottom:
                      j < s.items.length - 1 ? "1px solid var(--border-2)" : 0,
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "var(--bg-deep)",
                      color: "var(--ink)",
                    }}
                  >
                    <IconByKey name={it.icon} size={15} />
                  </div>
                  <div
                    className="flex-1 text-foreground font-semibold"
                    style={{ fontSize: 14 }}
                  >
                    {it.label}
                  </div>
                  {it.kind === "chev" && it.detail && (
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: 12, marginRight: 6 }}
                    >
                      {it.detail}
                    </span>
                  )}
                  {it.kind === "chev" && (
                    <ChevronRight
                      className="shrink-0"
                      style={{ width: 14, height: 14, color: "var(--muted-2)" }}
                    />
                  )}
                  {it.kind === "toggle" && (
                    <ProtoToggle on={it.value} onClick={it.onToggle} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer card */}
        <div
          style={{
            background: "var(--bg-deep)",
            borderRadius: 18,
            padding: 16,
            fontSize: 11,
            color: "var(--nc-muted)",
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          <b style={{ color: "var(--ink)" }}>Neura is not a doctor.</b> It
          surfaces patterns from your diary to help you and your clinician. Not
          a substitute for medical advice.
        </div>

        {/* Rewards — additive, but styled like proto replay button */}
        {onOpenRewards && (
          <button
            onClick={onOpenRewards}
            className="flex items-center justify-center w-full cursor-pointer"
            style={{
              width: "100%",
              padding: 14,
              background: "var(--nc-card)",
              color: "var(--ink)",
              border: "1px solid var(--nc-border)",
              borderRadius: 18,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 10,
              gap: 8,
            }}
          >
            <Sparkles className="w-[14px] h-[14px]" strokeWidth={2.2} />
            Rewards &amp; progress
          </button>
        )}

        {/* Replay onboarding */}
        {onRestartOnboarding && (
          <button
            onClick={() => {
              if (confirm("Restart from the splash screen? Your data stays.")) {
                onRestartOnboarding();
              }
            }}
            className="flex items-center justify-center w-full cursor-pointer"
            style={{
              width: "100%",
              padding: 14,
              background: "var(--nc-accent-soft)",
              color: "var(--accent-ink)",
              border: "1px solid rgba(59,130,246,0.20)",
              borderRadius: 18,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 10,
              gap: 8,
            }}
          >
            <RotateCcw className="w-[14px] h-[14px]" strokeWidth={2.2} />
            Replay onboarding from the start
          </button>
        )}

        {/* Withdraw from beta */}
        <button
          onClick={() =>
            toast("Withdraw from beta", {
              description: "Contact support@neuracare.app to exit the beta.",
            })
          }
          style={{
            width: "100%",
            padding: 14,
            background: "transparent",
            color: "var(--nc-muted)",
            border: "1px solid var(--nc-border)",
            borderRadius: 18,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Withdraw from beta
        </button>

        {/* Logout — auth lifecycle (additive, acceptable) */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full"
          style={{
            width: "100%",
            padding: 14,
            background: "transparent",
            color: "hsl(var(--destructive))",
            border: "0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            gap: 8,
            marginTop: 4,
          }}
        >
          <LogOut className="w-[14px] h-[14px]" />
          Log out
        </button>

        {/* Disclaimer */}
        <div style={{ marginTop: 16, padding: "12px 14px", background: "hsl(var(--muted)/0.5)", borderRadius: 14, fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.55, textAlign: "center" }}>
          Neura surfaces patterns to help you and your care team. It is not a substitute for medical advice.
        </div>
      </motion.div>

      <BottomNav
        activeTab="profile"
        onTabChange={onNavigate}
        onOpenDiary={onOpenDiary}
        onOpenNeura={onOpenNeura}
        onLog={onLog}
      />
    </div>
  );
};

export default ProfilePage;
