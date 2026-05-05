import { motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import HeroCard from "@/components/HeroCard";

interface ToolsHubProps {
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onStartCheckin: () => void;
  onOpenChat: () => void;
  onOpenDiaries: () => void;
  onOpenMedications: () => void;
  onOpenAppointments: () => void;
}

// Medications intentionally omitted — entry point lives on Home (per spec).
const tools = [
  { id: "diaries", title: "Diaries", subtitle: "Track daily symptoms", icon: "📓" },
  { id: "appointments", title: "Appointments", subtitle: "Track & prep for visits", icon: "📅" },
  { id: "chat", title: "Talk to Neura", subtitle: "Ask anything about migraines", icon: "💬" },
  { id: "activity", title: "Activity Tracker", subtitle: "Log exercise & movement", icon: "🏃", comingSoon: true },
];

const ToolsHub = ({ onNavigate, onStartCheckin, onOpenChat, onOpenDiaries, onOpenMedications, onOpenAppointments }: ToolsHubProps) => {
  const handleToolClick = (toolId: string) => {
    if (toolId === "diaries") {
      onOpenDiaries();
    } else if (toolId === "chat") {
      onOpenChat();
    } else if (toolId === "medication") {
      onOpenMedications();
    } else if (toolId === "appointments") {
      onOpenAppointments();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-safe-top">
        <Header />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        <motion.h1
          className="text-h1-lg text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tools 🛠️
        </motion.h1>

        <div className="space-y-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <HeroCard
                title={tool.title}
                subtitle={tool.subtitle}
                icon={tool.icon}
                onClick={() => handleToolClick(tool.id)}
                variant={tool.id === "diaries" ? "primary" : "secondary"}
              />
              {tool.comingSoon && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-helper-lg font-medium">
                    Coming Soon
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="tools" onTabChange={onNavigate} />
    </div>
  );
};

export default ToolsHub;
