import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import HeroCard from "@/components/HeroCard";
import DiaryTile from "@/components/DiaryTile";
import BottomNav from "@/components/BottomNav";
import { diaryCategories } from "@/data/diaryContent";
import { migraineDiaryCategories } from "@/data/migraineDiaryContent";
import { WeeklyAdherenceChart, generateMockAdherenceData } from "@/components/AdherenceChart";
import { Diagnosis } from "@/components/OnboardingFlow";
import { Lightbulb } from "lucide-react";

const migraineTips = [
  "Consistent sleep schedule reduces migraine frequency by up to 30%",
  "Staying hydrated — aim for 8 glasses of water daily",
  "Regular meals prevent blood sugar drops that trigger attacks",
  "Track your triggers for 2 weeks to find patterns",
];

const pdTips = [
  "Regular exercise helps manage motor symptoms",
  "Consistent medication timing improves effectiveness",
  "Deep breathing reduces tremor intensity",
];

interface DiariesHubProps {
  onStartCheckin: () => void;
  onNavigate: (tab: "home" | "maps" | "tools" | "profile") => void;
  onOpenDiary: (diaryId: string) => void;
  diagnosis?: Diagnosis | null;
}

const DiariesHub = ({ onStartCheckin, onNavigate, onOpenDiary, diagnosis }: DiariesHubProps) => {
  const [todayCompleted, setTodayCompleted] = useState(false);
  const isMigraine = diagnosis === "migraine";
  const categories = isMigraine ? migraineDiaryCategories : diaryCategories;
  const tips = isMigraine ? migraineTips : pdTips;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="px-5 pt-3">
        <Header />
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        <motion.h1
          className="text-xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isMigraine ? "Migraine Diaries" : "Diaries"}
        </motion.h1>

        {/* Weekly Diary Completion Tracker */}
        <motion.div
          className="rounded-2xl bg-card border border-border/50 p-4 mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">This Week's Diaries</h2>
            <span className="text-sm font-medium text-accent">4/7 days</span>
          </div>
          <div className="flex items-end gap-2">
            {[
              { label: "Mon", status: "completed" },
              { label: "Tue", status: "completed" },
              { label: "Wed", status: "current" },
              { label: "Thu", status: "completed" },
              { label: "Fri", status: "completed" },
              { label: "Sat", status: "empty" },
              { label: "Sun", status: "empty" },
            ].map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-16 rounded-lg ${
                    day.status === "completed"
                      ? "bg-accent"
                      : day.status === "current"
                      ? "bg-accent/30"
                      : "bg-muted"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Complete 5+ days this week to earn the <span className="font-medium text-foreground">Dedicated Tracker</span> badge
          </p>
        </motion.div>

        {/* Graph at TOP */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeeklyAdherenceChart
            title="Diary Completion"
            percentage={65}
            data={generateMockAdherenceData()}
            missedCount={2}
          />
        </motion.section>

        {/* Today's Check-in */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <HeroCard
            title={todayCompleted ? "Done for today ✅" : "Today's Check-in"}
            subtitle={todayCompleted ? "Great job!" : isMigraine ? "Quick headache check" : "Quick symptom check"}
            duration={todayCompleted ? undefined : "~3 mins"}
            icon="📝"
            onClick={onStartCheckin}
            variant="primary"
            completed={todayCompleted}
          />
        </motion.section>

        {/* All Diaries */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Diaries</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((diary, index) => (
              <DiaryTile
                key={diary.id}
                title={diary.title}
                icon={diary.icon}
                onClick={() => onOpenDiary(diary.id)}
                delay={0.03 * index}
              />
            ))}
          </div>
        </motion.section>

        {/* Suggestions */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tips to improve</h2>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <BottomNav activeTab="tools" onTabChange={onNavigate} />
    </div>
  );
};

export default DiariesHub;
