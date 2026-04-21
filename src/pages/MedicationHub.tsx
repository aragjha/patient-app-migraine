import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Bell, BellOff, ChevronRight, Edit2, Lightbulb } from "lucide-react";
import { Medication, getTimeLabel, getFrequencyLabel, timeOptions, formatDosage, getTypeIcon } from "@/data/medicationContent";
import MedicationScheduleCard from "@/components/medication/MedicationScheduleCard";
import CTAButton from "@/components/CTAButton";
import { WeeklyAdherenceChart, generateMockAdherenceData } from "@/components/AdherenceChart";

interface MedicationHubProps {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (med: Medication) => void;
  onToggleReminder: (medId: string) => void;
  onOpenLog: () => void;
  onBack: () => void;
}

interface LogStatus {
  [key: string]: { [time: string]: "pending" | "taken" | "skipped" };
}

const MedicationHub = ({ 
  medications, 
  onAddMedication, 
  onEditMedication, 
  onToggleReminder,
  onOpenLog,
  onBack 
}: MedicationHubProps) => {
  const [view, setView] = useState<"schedule" | "list">("schedule");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logStatus, setLogStatus] = useState<LogStatus>({});

  const toggleExpand = (medId: string) => {
    setExpandedId(expandedId === medId ? null : medId);
  };

  // Get schedule items for a specific time
  const getScheduleForTime = (timeId: string) => {
    return medications
      .filter((med) => med.times.includes(timeId as any))
      .map((med) => ({
        medication: med,
        status: logStatus[med.id]?.[timeId] || "pending" as const,
      }));
  };

  const handleLogMedication = (medId: string, timeId: string, status: "taken" | "skipped") => {
    setLogStatus((prev) => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        [timeId]: status,
      },
    }));
  };

  // Calculate today's progress
  const totalDoses = medications.reduce((acc, med) => acc + med.times.length, 0);
  const loggedDoses = Object.values(logStatus).reduce((acc, timeStatuses) => {
    return acc + Object.values(timeStatuses).filter(s => s !== "pending").length;
  }, 0);
  const progressPercent = totalDoses > 0 ? (loggedDoses / totalDoses) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background safe-layout">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-h2 text-foreground font-semibold">
            Medications
          </h1>
          <button
            onClick={onAddMedication}
            className="p-2 -mr-2 text-accent hover:text-accent/80 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        {medications.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-helper text-muted-foreground">Today's Progress</span>
              <span className="text-helper font-medium text-foreground">{loggedDoses}/{totalDoses} doses</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Weekly Adherence Chart */}
        {medications.length > 0 && (
          <div className="mb-4">
            <WeeklyAdherenceChart
              title="Medication Adherence"
              percentage={Math.round(progressPercent) || 72}
              data={generateMockAdherenceData()}
              missedCount={totalDoses - loggedDoses}
            />
          </div>
        )}

        {/* View Toggle */}
        {medications.length > 0 && (
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setView("schedule")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "schedule"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Today's Schedule
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              All Medications
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {medications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-16"
          >
            <span className="text-6xl mb-4">💊</span>
            <h2 className="text-h2 text-foreground mb-2">No medications yet</h2>
            <p className="text-body text-muted-foreground text-center mb-6">
              Add your medications to track and get reminders
            </p>
            <CTAButton onClick={onAddMedication}>
              <Plus className="w-5 h-5 mr-2" />
              Add Medication
            </CTAButton>
          </motion.div>
        ) : view === "schedule" ? (
          // Schedule View - Shows medications by time with inline logging
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mt-4"
          >
            {timeOptions.map((time) => {
              const items = getScheduleForTime(time.id);
              if (items.length === 0) return null;
              
              return (
                <MedicationScheduleCard
                  key={time.id}
                  time={time}
                  items={items}
                  onLogMedication={(medId, status) => handleLogMedication(medId, time.id, status)}
                />
              );
            })}
          </motion.div>
        ) : (
          // List View - Shows all medications with edit options
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mt-4"
          >
            {medications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Main card content */}
                <button
                  onClick={() => toggleExpand(med.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${med.color}20` }}
                  >
                    {getTypeIcon(med.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body font-semibold text-foreground truncate">
                      {med.name}
                    </h3>
                    <p className="text-helper text-muted-foreground">
                      {formatDosage(med.dosage, med.quantity, med.type)} • {getFrequencyLabel(med.frequency)}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {med.times.map((time) => (
                        <span 
                          key={time}
                          className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                        >
                          {getTimeLabel(time)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedId === med.id ? "rotate-90" : ""
                    }`}
                  />
                </button>
                
                {/* Expanded actions */}
                {expandedId === med.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-3 flex gap-2">
                      <button
                        onClick={() => onEditMedication(med)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-helper-lg font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => onToggleReminder(med.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                          med.reminderEnabled 
                            ? "bg-accent/20 text-accent" 
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {med.reminderEnabled ? (
                          <>
                            <Bell className="w-4 h-4" />
                            <span className="text-helper-lg font-medium">Reminder On</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4" />
                            <span className="text-helper-lg font-medium">Reminder Off</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Tips */}
      {medications.length > 0 && (
        <div className="px-5 pb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tips</h3>
          {["Take medications at the same time every day for best results", "Don't skip preventive doses even on headache-free days", "Keep a 2-week supply as backup when traveling"].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card border border-border/50 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Action Button */}
      {medications.length > 0 && view === "schedule" && loggedDoses < totalDoses && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <p className="text-center text-helper text-muted-foreground mb-2">
            {totalDoses - loggedDoses} doses remaining today
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationHub;