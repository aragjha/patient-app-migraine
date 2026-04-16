import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import FontSizeSelector from "@/components/FontSizeSelector";
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Sun, Moon, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePageProps {
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
}

const menuItems = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Sharing", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [smartDark, setSmartDark] = useState(() => localStorage.getItem("smart-dark-mode") === "true");

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleSmartDark = () => {
    const next = !smartDark;
    setSmartDark(next);
    localStorage.setItem("smart-dark-mode", String(next));
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
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
        {/* Profile Card */}
        <motion.div
          className="glass-card flex flex-col items-center text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-h2 text-foreground mb-1">NeuroCare User</h1>
          <p className="text-body text-muted-foreground">Member since Feb 2026</p>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Display</h2>

          {/* Dark Mode Toggle */}
          <div className="glass-card p-4 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <div className="text-sm font-semibold text-foreground">Dark Mode</div>
                  <div className="text-[11px] text-muted-foreground">Easier during episodes</div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? "bg-accent" : "bg-muted"}`}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm"
                  animate={{ left: isDark ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </button>
            </div>

            {/* Smart Dark Mode sub-option */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div className="text-xs text-muted-foreground">Auto-darken when migraine logged</div>
              <button
                onClick={toggleSmartDark}
                className={`relative w-10 h-6 rounded-full transition-colors ${smartDark ? "bg-accent" : "bg-muted"}`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: smartDark ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </button>
            </div>
          </div>

          {/* Font Size Selector */}
          <div className="glass-card p-4">
            <div className="text-sm font-semibold text-foreground mb-1">Text Size</div>
            <div className="text-[11px] text-muted-foreground mb-3">Choose what feels comfortable</div>
            <FontSizeSelector />
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                className="w-full glass-card flex items-center gap-4 p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left text-body font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* My Data */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">My Data</h2>
          <div className="space-y-2">
            <button
              onClick={() => toast("Coming soon!", { description: "Data export will be available in a future update." })}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left"
            >
              <Download className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">Export My Data</div>
                <div className="text-xs text-muted-foreground">Download diary, attacks & medication logs</div>
              </div>
            </button>
            <button
              onClick={() => toast("Coming soon!", { description: "Doctor sharing will be available in a future update." })}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left"
            >
              <Share2 className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">Share with Doctor</div>
                <div className="text-xs text-muted-foreground">Generate a report for your next appointment</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 py-4 text-destructive font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </motion.button>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="profile" onTabChange={onNavigate} />
    </div>
  );
};

export default ProfilePage;
