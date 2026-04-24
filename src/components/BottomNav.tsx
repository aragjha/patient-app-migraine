import { Home, BookOpen, Sparkles, User, Plus } from "lucide-react";

/**
 * Bottom navigation — ported from the Claude Design prototype.
 *
 * 5 slots with a raised hero "+" in the middle that opens Neura with a
 * headache-log script. Glassmorphic background with blur. The old 4-tab API
 * (home/maps/tools/profile) is preserved so every existing call site keeps
 * working; new slots (diary, neura) and the hero button are optional.
 */

export type BottomNavTab = "home" | "maps" | "tools" | "profile" | "diary" | "neura";

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenDiary?: () => void;
  onOpenNeura?: () => void;
  onLog?: () => void;
}

const BottomNav = ({
  activeTab,
  onTabChange,
  onOpenDiary,
  onOpenNeura,
  onLog,
}: BottomNavProps) => {
  const items: {
    id: BottomNavTab | "log";
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    hero?: boolean;
    onClick: () => void;
  }[] = [
    { id: "home", label: "Home", icon: Home, onClick: () => onTabChange("home") },
    {
      id: "diary",
      label: "Diary",
      icon: BookOpen,
      onClick: () => (onOpenDiary ?? (() => onTabChange("home")))(),
    },
    {
      id: "log",
      label: "",
      icon: Plus,
      hero: true,
      onClick: () => (onLog ?? (() => onTabChange("home")))(),
    },
    {
      id: "neura",
      label: "Neura",
      icon: Sparkles,
      onClick: () => (onOpenNeura ?? (() => onTabChange("home")))(),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      onClick: () => onTabChange("profile"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border"
      style={{
        height: 92,
        background: "hsl(var(--card) / 0.92)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        paddingBottom: "calc(34px + env(safe-area-inset-bottom))",
      }}
    >
      {items.map((it) => {
        const I = it.icon;
        if (it.hero) {
          return (
            <button
              key={it.id}
              onClick={it.onClick}
              aria-label="Log headache"
              className="w-14 h-14 rounded-[20px] border-0 cursor-pointer flex items-center justify-center text-white active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(135deg, #1B2A4E 0%, #3B82F6 100%)",
                boxShadow: "0 8px 20px rgba(59,130,246,0.35)",
                transform: "translateY(-10px)",
              }}
            >
              <I className="w-[26px] h-[26px]" strokeWidth={2.5} />
            </button>
          );
        }
        const on = activeTab === it.id;
        return (
          <button
            key={it.id}
            onClick={it.onClick}
            className="bg-transparent border-0 cursor-pointer flex flex-col items-center gap-1 px-1 py-1.5"
            style={{
              color: on ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
            }}
          >
            <I className="w-[22px] h-[22px]" strokeWidth={on ? 2.2 : 1.8} />
            <span
              className="text-[10px]"
              style={{ fontWeight: on ? 700 : 500 }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
