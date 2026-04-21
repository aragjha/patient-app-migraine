import { Home, BookOpen, LayoutGrid, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "home" | "maps" | "tools" | "profile";
  onTabChange: (tab: "home" | "maps" | "tools" | "profile") => void;
}

const tabs = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "maps" as const, label: "Learn", icon: BookOpen },
  { id: "tools" as const, label: "My Care", icon: LayoutGrid },
  { id: "profile" as const, label: "Profile", icon: User },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "bottom-nav-item relative",
              isActive && "active"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className={cn(
              "w-6 h-6 transition-colors",
              isActive ? "text-accent" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs font-medium transition-colors",
              isActive ? "text-accent" : "text-muted-foreground"
            )}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                className="absolute -bottom-1 w-8 h-0.5 rounded-full bg-accent"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
