export interface TriggerType {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  subtypes: TriggerSubtype[];
}

export interface TriggerSubtype {
  id: string;
  label: string;
  icon: string;
}

export interface WarningSymptom {
  id: string;
  label: string;
  icon: string;
}

export interface ReminderOption {
  id: string;
  label: string;
  description: string;
}

export interface TriggerProfile {
  id: string;
  type: "activity" | "event" | "periodical";
  subtype: string;
  name: string;
  dateRange?: { start: number; end: number };
  cycleLength?: number;
  lastPeriodStart?: string;
  medications: string[];
  warningSymptoms: string[];
  frequency: string;
  reminderBefore: string;
}

export const triggerTypes: TriggerType[] = [
  {
    id: "activity",
    label: "Activity",
    icon: "🏃",
    description: "Regular activities that may trigger migraines",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    subtypes: [
      { id: "travel", label: "Travel / Flying", icon: "✈️" },
      { id: "function", label: "Social Function", icon: "🎉" },
      { id: "job_stress", label: "Job Stress / Deadlines", icon: "💼" },
      { id: "meeting", label: "Long Meetings", icon: "🗣️" },
      { id: "exercise", label: "Intense Exercise", icon: "🏋️" },
      { id: "screen_time", label: "Extended Screen Time", icon: "💻" },
      { id: "other_activity", label: "Other", icon: "📌" },
    ],
  },
  {
    id: "event",
    label: "Event",
    icon: "📅",
    description: "Specific upcoming events",
    color: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
    subtypes: [
      { id: "conference", label: "Conference / Expo", icon: "🎤" },
      { id: "wedding", label: "Wedding / Ceremony", icon: "💍" },
      { id: "exam", label: "Exam / Test", icon: "📝" },
      { id: "presentation", label: "Presentation", icon: "📊" },
      { id: "other_event", label: "Other Event", icon: "📌" },
    ],
  },
  {
    id: "periodical",
    label: "Periodical",
    icon: "🔄",
    description: "Recurring patterns like menstrual cycle",
    color: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
    subtypes: [
      { id: "menstrual", label: "Menstrual Cycle", icon: "🌸" },
      { id: "monthly_dates", label: "Specific Dates Each Month", icon: "📅" },
      { id: "seasonal", label: "Seasonal Pattern", icon: "🍂" },
      { id: "weekly", label: "Certain Day of Week", icon: "📆" },
    ],
  },
];

export const menstrualQuestions = [
  {
    id: "has_menstrual_migraine",
    question: "Do you get migraines associated with your menstrual cycle?",
    type: "single" as const,
    options: [
      { id: "yes", label: "Yes, regularly", icon: "✅" },
      { id: "sometimes", label: "Sometimes", icon: "🔄" },
      { id: "not_sure", label: "Not sure yet", icon: "🤔" },
      { id: "no", label: "No", icon: "❌" },
    ],
  },
  {
    id: "cycle_length",
    question: "What is your typical cycle length?",
    type: "single" as const,
    options: [
      { id: "24-26", label: "24-26 days", icon: "📅" },
      { id: "27-29", label: "27-29 days", icon: "📅" },
      { id: "30-32", label: "30-32 days", icon: "📅" },
      { id: "irregular", label: "Irregular", icon: "🔀" },
    ],
  },
  {
    id: "migraine_timing",
    question: "When during your cycle do migraines typically occur?",
    type: "multi" as const,
    options: [
      { id: "before", label: "1-2 days before period", icon: "⏪" },
      { id: "during_start", label: "First 2-3 days of period", icon: "🔴" },
      { id: "during_end", label: "End of period", icon: "🟡" },
      { id: "ovulation", label: "Around ovulation (mid-cycle)", icon: "🟢" },
      { id: "varies", label: "Varies / not sure", icon: "❓" },
    ],
  },
  {
    id: "warning_before_period",
    question: "Any warning signs 1-2 days before your period? Examples of warning signs may include: fatigue, mood changes, neck stiffness, food cravings, bloating.",
    type: "multi" as const,
    options: [
      { id: "fatigue", label: "Fatigue", icon: "😴" },
      { id: "mood_change", label: "Mood changes", icon: "😤" },
      { id: "neck_stiffness", label: "Neck stiffness", icon: "🦴" },
      { id: "food_cravings", label: "Food cravings", icon: "🍫" },
      { id: "bloating", label: "Bloating", icon: "💨" },
      { id: "none", label: "None in particular", icon: "🤷" },
    ],
  },
];

export const warningSymptoms: WarningSymptom[] = [
  { id: "fatigue", label: "Fatigue / Low energy", icon: "😴" },
  { id: "mood_change", label: "Mood changes", icon: "😤" },
  { id: "neck_stiffness", label: "Neck stiffness", icon: "🦴" },
  { id: "food_cravings", label: "Food cravings", icon: "🍫" },
  { id: "yawning", label: "Excessive yawning", icon: "🥱" },
  { id: "concentration", label: "Difficulty concentrating", icon: "🧠" },
  { id: "light_sensitivity", label: "Light sensitivity", icon: "☀️" },
  { id: "none", label: "No warning signs", icon: "🤷" },
];

export const triggerFrequencyOptions = [
  { id: "always", label: "Almost always triggers a migraine", icon: "🔴" },
  { id: "often", label: "Often triggers one", icon: "🟠" },
  { id: "sometimes", label: "Sometimes", icon: "🟡" },
  { id: "rarely", label: "Rarely", icon: "🟢" },
];

export const reminderOptions: ReminderOption[] = [
  { id: "1h", label: "1 hour before", description: "Quick heads up" },
  { id: "2h", label: "2 hours before", description: "Time to prepare & take medication" },
  { id: "morning", label: "Morning of", description: "Start of day reminder" },
  { id: "day_before", label: "Day before", description: "Plan ahead" },
  { id: "none", label: "No reminder needed", description: "I'll remember on my own" },
];

export function generateTriggerProfileId(): string {
  return `tp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
