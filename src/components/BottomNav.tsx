import { Home, BookOpen, Sparkles, User, Wrench } from "lucide-react";

/**
 * Bottom navigation — 5-tab v3 layout: Home · Diaries · Neura · Tools · Profile.
 * No hero `+` button. Logging is initiated from the Home hero card.
 *
 * Active state: pill background with darker label (matches Patient App v3 ref).
 */

export type BottomNavTab =
  | "home"
  | "maps"
  | "tools"
  | "profile"
  | "diary"
  | "neura";

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenDiary?: () => void;
  onOpenNeura?: () => void;
  /** No-op: kept for backwards compatibility but the hero `+` is gone. */
  onLog?: () => void;
}

const BottomNav = ({
  activeTab,
  onTabChange,
  onOpenDiary,
  onOpenNeura,
}: BottomNavProps) => {
  const items: {
    id: BottomNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    onClick: () => void;
  }[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      onClick: () => onTabChange("home"),
    },
    {
      id: "diary",
      label: "Diaries",
      icon: BookOpen,
      onClick: () => (onOpenDiary ?? (() => onTabChange("home")))(),
    },
    {
      id: "neura",
      label: "Neura",
      icon: Sparkles,
      onClick: () => (onOpenNeura ?? (() => onTabChange("home")))(),
    },
    {
      id: "tools",
      label: "Tools",
      icon: Wrench,
      onClick: () => onTabChange("tools"),
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
        background: "hsl(var(--card) / 0.96)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        paddingBottom: "calc(34px + env(safe-area-inset-bottom))",
      }}
    >
      {items.map((it) => {
        const I = it.icon;
        const on = activeTab === it.id;
        return (
          <button
            key={it.id}
            data-coach={it.id === "neura" ? "neura-tab" : undefined}
            onClick={it.onClick}
            className="bg-transparent border-0 cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            style={{
              padding: "6px 10px",
              borderRadius: 20,
              background: on ? "hsl(var(--bg-deep, var(--muted)))" : "transparent",
              color: on
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground))",
              minWidth: 56,
            }}
          >
            <I className="w-[20px] h-[20px]" strokeWidth={on ? 2.4 : 1.8} />
            <span
              style={{
                fontSize: 10,
                fontWeight: on ? 700 : 500,
                lineHeight: 1,
              }}
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
