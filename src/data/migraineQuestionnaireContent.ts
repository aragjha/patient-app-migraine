// Migraine questionnaire content derived from clinical headache assessment tools
// (Headache Calendar, MIDAS, Headache History Survey)

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
}

export interface CheckinQuestion {
  id: string;
  title: string;
  helper?: string;
  type: "single" | "multi" | "slider";
  options: QuestionOption[];
  /** If set, this question only appears when the given condition is met */
  showIf?: string;
}

export interface AttackStep {
  id: string;
  title: string;
  helper?: string;
  type: "single" | "multi" | "slider" | "time" | "text";
  options: QuestionOption[];
}

export interface MIDASQuestion {
  id: string;
  title: string;
  helper?: string;
  type: "number";
  unit: string;
  /** Range hint shown to the user */
  range: { min: number; max: number };
  /** Whether this is one of the 5 core MIDAS items (vs. supplementary A/B) */
  core: boolean;
}

export interface CalendarField {
  id: string;
  label: string;
  type: "scale" | "multi" | "single" | "boolean" | "number";
  options?: QuestionOption[];
  range?: { min: number; max: number };
  helper?: string;
}

export interface HeadPainLocation {
  id: string;
  label: string;
  /** SVG description — viewBox-relative coordinates for a 200x250 front-view head */
  area: {
    cx: number;
    cy: number;
    /** Radius of the tappable zone */
    r: number;
  };
}

// ─── 1. Daily Migraine Check-in Questions ────────────────────────────────────

export const migraineDailyCheckinQuestions: CheckinQuestion[] = [
  {
    id: "overall_feeling",
    title: "How are you feeling overall today?",
    helper: "Slide to rate your day so far.",
    type: "slider",
    options: [],
  },
  {
    id: "headache_today",
    title: "Did you have a headache today?",
    helper: "Any head pain at all.",
    type: "single",
    options: [
      { id: "yes", label: "Yes", icon: "🤕" },
      { id: "no", label: "No headache", icon: "✅" },
    ],
  },
  {
    id: "severity",
    title: "How severe was it at its worst?",
    helper: "Rate the peak intensity.",
    type: "single",
    showIf: "headache_today_yes",
    options: [
      { id: "1", label: "Mild — noticeable but manageable", icon: "1️⃣" },
      { id: "2", label: "Moderate — hard to ignore", icon: "2️⃣" },
      { id: "3", label: "Severe — debilitating", icon: "3️⃣" },
    ],
  },
  {
    id: "location",
    title: "Where was the pain?",
    helper: "Select all areas that apply.",
    type: "multi",
    showIf: "headache_today_yes",
    options: [
      { id: "right_side", label: "Right side", icon: "➡️" },
      { id: "left_side", label: "Left side", icon: "⬅️" },
      { id: "both_sides", label: "Both sides", icon: "↔️" },
      { id: "forehead", label: "Forehead", icon: "🔲" },
      { id: "temples", label: "Temples", icon: "🔘" },
      { id: "behind_eyes", label: "Behind the eyes", icon: "👁️" },
      { id: "back_of_head", label: "Back of head", icon: "🔙" },
      { id: "neck", label: "Neck", icon: "🦴" },
    ],
  },
  {
    id: "associated_symptoms",
    title: "Did you experience any of these?",
    helper: "Select all that apply.",
    type: "multi",
    showIf: "headache_today_yes",
    options: [
      { id: "nausea", label: "Nausea / vomiting", icon: "🤢" },
      { id: "light_sensitivity", label: "Light sensitivity", icon: "💡" },
      { id: "sound_sensitivity", label: "Sound sensitivity", icon: "🔊" },
      { id: "aura", label: "Visual aura", icon: "✨" },
      { id: "dizziness", label: "Dizziness", icon: "😵‍💫" },
      { id: "fatigue", label: "Fatigue", icon: "😓" },
      { id: "none", label: "None of these", icon: "🎉" },
    ],
  },
  {
    id: "triggers_today",
    title: "Any possible triggers today?",
    helper: "Pick what you think contributed.",
    type: "multi",
    options: [
      { id: "poor_sleep", label: "Poor sleep", icon: "😴" },
      { id: "stress", label: "Stress", icon: "😰" },
      { id: "skipped_meal", label: "Skipped a meal", icon: "🍽️" },
      { id: "weather", label: "Weather change", icon: "🌦️" },
      { id: "screen_time", label: "Screen time", icon: "📱" },
      { id: "dehydration", label: "Dehydration", icon: "💧" },
      { id: "hormonal", label: "Hormonal / menstrual", icon: "♀️" },
      { id: "alcohol", label: "Alcohol", icon: "🍷" },
      { id: "none", label: "Nothing obvious", icon: "🤷" },
    ],
  },
  {
    id: "medication_taken",
    title: "Did you take any medication?",
    helper: "Acute or preventive.",
    type: "single",
    options: [
      { id: "acute", label: "Acute (for the attack)", icon: "💊" },
      { id: "preventive", label: "Preventive (daily med)", icon: "🛡️" },
      { id: "both", label: "Both", icon: "💊🛡️" },
      { id: "none", label: "No medication", icon: "❌" },
    ],
  },
  {
    id: "disability",
    title: "How much did it affect your day?",
    helper: "Rate the overall impact.",
    type: "single",
    options: [
      { id: "0", label: "No effect — carried on as normal", icon: "✅" },
      { id: "1", label: "Managed fairly well", icon: "👍" },
      { id: "2", label: "Had to modify or cancel activities", icon: "⚠️" },
      { id: "3", label: "Missed work or stayed in bed", icon: "🛏️" },
    ],
  },
];

// ─── 2. Migraine Attack Recording (Migraine-Buddy Style) ────────────────────

export const migraineAttackQuestions: AttackStep[] = [
  {
    id: "attack_start",
    title: "When did the attack start?",
    helper: "Tap to set the start time.",
    type: "time",
    options: [],
  },
  {
    id: "attack_end",
    title: "When did it end (or is it ongoing)?",
    helper: "Leave blank if it's still happening.",
    type: "time",
    options: [
      { id: "ongoing", label: "Still happening", icon: "⏳" },
    ],
  },
  {
    id: "pain_level",
    title: "Rate your pain at its worst",
    helper: "Slide from 0 (none) to 10 (worst imaginable).",
    type: "slider",
    options: [],
  },
  {
    id: "pain_location",
    title: "Where is the pain?",
    helper: "Select all areas.",
    type: "multi",
    options: [
      { id: "right_side", label: "Right side", icon: "➡️" },
      { id: "left_side", label: "Left side", icon: "⬅️" },
      { id: "both_sides", label: "Both sides", icon: "↔️" },
      { id: "forehead", label: "Forehead", icon: "🔲" },
      { id: "temples", label: "Temples", icon: "🔘" },
      { id: "behind_eyes", label: "Behind the eyes", icon: "👁️" },
      { id: "top_of_head", label: "Top of head", icon: "⬆️" },
      { id: "back_of_head", label: "Back of head", icon: "🔙" },
      { id: "face", label: "Face / sinus area", icon: "😶" },
      { id: "neck", label: "Neck", icon: "🦴" },
    ],
  },
  {
    id: "symptoms_during",
    title: "Symptoms during the attack",
    helper: "Select all that apply.",
    type: "multi",
    options: [
      // Visual
      { id: "visual_aura", label: "Visual aura (flashes, blind spots)", icon: "✨" },
      { id: "blurred_vision", label: "Blurred vision", icon: "👓" },
      // Auditory
      { id: "sound_sensitivity", label: "Sound sensitivity", icon: "🔊" },
      { id: "tinnitus", label: "Ringing in ears", icon: "🔔" },
      // GI
      { id: "nausea", label: "Nausea", icon: "🤢" },
      { id: "vomiting", label: "Vomiting", icon: "🤮" },
      // Neurological
      { id: "light_sensitivity", label: "Light sensitivity", icon: "💡" },
      { id: "dizziness", label: "Dizziness / vertigo", icon: "😵‍💫" },
      { id: "numbness", label: "Numbness or tingling", icon: "🫠" },
      { id: "difficulty_speaking", label: "Difficulty speaking", icon: "🗣️" },
      { id: "confusion", label: "Confusion", icon: "😶‍🌫️" },
      // Autonomic
      { id: "nasal_congestion", label: "Nasal congestion", icon: "🤧" },
      { id: "watery_eyes", label: "Watery / red eyes", icon: "😢" },
      // General
      { id: "fatigue", label: "Fatigue", icon: "😓" },
      { id: "neck_stiffness", label: "Neck stiffness", icon: "🦴" },
    ],
  },
  {
    id: "triggers",
    title: "What may have triggered it?",
    helper: "Select any suspected triggers.",
    type: "multi",
    options: [
      // Sleep
      { id: "too_little_sleep", label: "Too little sleep", icon: "😴" },
      { id: "too_much_sleep", label: "Too much sleep", icon: "🛌" },
      // Stress & mood
      { id: "stress", label: "Stress / anxiety", icon: "😰" },
      { id: "depression", label: "Low mood / depression", icon: "😞" },
      { id: "emotional", label: "Emotional upset", icon: "😢" },
      // Physical
      { id: "physical_activity", label: "Physical exertion", icon: "🏋️" },
      { id: "neck_shoulder", label: "Neck / shoulder tension", icon: "💪" },
      // Dietary
      { id: "skipped_meal", label: "Skipped meal", icon: "🍽️" },
      { id: "dehydration", label: "Dehydration", icon: "💧" },
      { id: "caffeine", label: "Caffeine", icon: "☕" },
      { id: "alcohol", label: "Alcohol", icon: "🍷" },
      { id: "chocolate", label: "Chocolate", icon: "🍫" },
      { id: "aged_cheese", label: "Aged cheese", icon: "🧀" },
      { id: "processed_food", label: "Processed / nitrate food", icon: "🌭" },
      // Environmental
      { id: "weather", label: "Weather / barometric change", icon: "🌦️" },
      { id: "bright_light", label: "Bright or flickering light", icon: "☀️" },
      { id: "strong_odor", label: "Strong odor", icon: "👃" },
      { id: "screen_time", label: "Screen time", icon: "📱" },
      // Hormonal
      { id: "menstrual", label: "Menstrual / hormonal", icon: "♀️" },
      // Unknown
      { id: "unknown", label: "Not sure", icon: "🤷" },
    ],
  },
  {
    id: "medications_taken",
    title: "What medications did you take?",
    helper: "Select all that apply.",
    type: "multi",
    options: [
      { id: "otc_painkiller", label: "OTC painkiller (ibuprofen, acetaminophen)", icon: "💊" },
      { id: "triptan", label: "Triptan (sumatriptan, rizatriptan, etc.)", icon: "💊" },
      { id: "gepant", label: "Gepant (ubrogepant, rimegepant)", icon: "💊" },
      { id: "anti_nausea", label: "Anti-nausea medication", icon: "🤢" },
      { id: "muscle_relaxant", label: "Muscle relaxant", icon: "💪" },
      { id: "steroid", label: "Steroid", icon: "💉" },
      { id: "other_rx", label: "Other prescription", icon: "📝" },
      { id: "none", label: "No medication taken", icon: "❌" },
    ],
  },
  {
    id: "relief_methods",
    title: "What else helped?",
    helper: "Non-medication relief.",
    type: "multi",
    options: [
      { id: "dark_room", label: "Dark, quiet room", icon: "🌑" },
      { id: "sleep", label: "Sleep / nap", icon: "😴" },
      { id: "cold_pack", label: "Cold pack on head", icon: "🧊" },
      { id: "hot_compress", label: "Hot compress on neck", icon: "♨️" },
      { id: "caffeine_relief", label: "Caffeine", icon: "☕" },
      { id: "hydration", label: "Hydration", icon: "💧" },
      { id: "massage", label: "Massage", icon: "👐" },
      { id: "breathing", label: "Breathing / relaxation", icon: "🧘" },
      { id: "nothing", label: "Nothing helped", icon: "😔" },
    ],
  },
  {
    id: "notes",
    title: "Anything else to note?",
    helper: "Optional — free-text about this attack.",
    type: "text",
    options: [],
  },
];

// ─── 3. MIDAS Disability Assessment (5 core + 2 supplementary) ──────────────

export const migraineMIDASQuestions: MIDASQuestion[] = [
  {
    id: "midas_1",
    title: "On how many days in the last 3 months did you miss work or school because of your headaches?",
    helper: "Include only full days missed.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: true,
  },
  {
    id: "midas_2",
    title: "How many days in the last 3 months was your productivity at work or school reduced by half or more?",
    helper: "Days you were there but couldn't fully function.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: true,
  },
  {
    id: "midas_3",
    title: "On how many days in the last 3 months did you not do household work because of your headaches?",
    helper: "Cleaning, cooking, laundry, shopping, etc.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: true,
  },
  {
    id: "midas_4",
    title: "How many days in the last 3 months was your household productivity reduced by half or more?",
    helper: "Days you managed some chores but not fully.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: true,
  },
  {
    id: "midas_5",
    title: "On how many days in the last 3 months did you miss family, social, or leisure activities?",
    helper: "Events, outings, hobbies, or gatherings.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: true,
  },
  {
    id: "midas_a",
    title: "On how many days in the last 3 months did you have a headache?",
    helper: "Include even mild headaches.",
    type: "number",
    unit: "days",
    range: { min: 0, max: 90 },
    core: false,
  },
  {
    id: "midas_b",
    title: "On a scale of 0–10, how painful were these headaches on average?",
    helper: "0 = no pain, 10 = worst imaginable.",
    type: "number",
    unit: "score",
    range: { min: 0, max: 10 },
    core: false,
  },
];

/**
 * Compute the MIDAS grade from the 5 core question totals.
 * Grade I  (0–5):   Little or no disability
 * Grade II (6–10):  Mild disability
 * Grade III (11–20): Moderate disability
 * Grade IV (21+):   Severe disability
 */
export const getMIDASGrade = (
  totalScore: number
): { grade: number; label: string; description: string } => {
  if (totalScore <= 5) {
    return { grade: 1, label: "Grade I", description: "Little or no disability" };
  }
  if (totalScore <= 10) {
    return { grade: 2, label: "Grade II", description: "Mild disability" };
  }
  if (totalScore <= 20) {
    return { grade: 3, label: "Grade III", description: "Moderate disability" };
  }
  return { grade: 4, label: "Grade IV", description: "Severe disability" };
};

// ─── 4. Headache Calendar Daily Fields ───────────────────────────────────────

export const migraineHeadacheCalendarFields: CalendarField[] = [
  {
    id: "cal_headache",
    label: "Headache today?",
    type: "boolean",
    helper: "Did you experience any headache?",
  },
  {
    id: "cal_severity",
    label: "Severity",
    type: "scale",
    range: { min: 1, max: 3 },
    helper: "1 = Mild, 2 = Moderate, 3 = Severe",
    options: [
      { id: "1", label: "Mild", icon: "🟡" },
      { id: "2", label: "Moderate", icon: "🟠" },
      { id: "3", label: "Severe", icon: "🔴" },
    ],
  },
  {
    id: "cal_disability",
    label: "Disability level",
    type: "scale",
    range: { min: 0, max: 3 },
    helper: "How much did it limit you?",
    options: [
      { id: "0", label: "No effect", icon: "✅" },
      { id: "1", label: "Managed fairly well", icon: "👍" },
      { id: "2", label: "Difficulty / cancelled activities", icon: "⚠️" },
      { id: "3", label: "Missed work / stayed in bed", icon: "🛏️" },
    ],
  },
  {
    id: "cal_triggers",
    label: "Triggers",
    type: "multi",
    helper: "What may have contributed?",
    options: [
      { id: "1", label: "Stress", icon: "😰" },
      { id: "2", label: "Poor sleep", icon: "😴" },
      { id: "3", label: "Skipped meal", icon: "🍽️" },
      { id: "4", label: "Weather", icon: "🌦️" },
      { id: "5", label: "Alcohol", icon: "🍷" },
      { id: "6", label: "Caffeine", icon: "☕" },
      { id: "7", label: "Bright light", icon: "☀️" },
      { id: "8", label: "Strong odor", icon: "👃" },
      { id: "9", label: "Hormonal / menstrual", icon: "♀️" },
      { id: "10", label: "Neck tension", icon: "🦴" },
      { id: "11", label: "Dehydration", icon: "💧" },
      { id: "12", label: "Screen time", icon: "📱" },
    ],
  },
  {
    id: "cal_menstrual",
    label: "Menstrual period",
    type: "boolean",
    helper: "Currently on your period?",
  },
  {
    id: "cal_acute_med",
    label: "Acute medication taken",
    type: "boolean",
    helper: "Did you take rescue / acute medication?",
  },
  {
    id: "cal_acute_relief",
    label: "Medication relief",
    type: "scale",
    range: { min: 0, max: 3 },
    helper: "How much did the acute medication help?",
    options: [
      { id: "0", label: "No relief", icon: "❌" },
      { id: "1", label: "Slight relief", icon: "🤏" },
      { id: "2", label: "Moderate relief", icon: "👌" },
      { id: "3", label: "Complete relief", icon: "✅" },
    ],
  },
  {
    id: "cal_preventive_taken",
    label: "Preventive medication taken",
    type: "boolean",
    helper: "Did you take your daily preventive?",
  },
  {
    id: "cal_overall_severity",
    label: "Overall day rating",
    type: "number",
    range: { min: 0, max: 10 },
    helper: "0 = best day, 10 = worst day.",
  },
];

// ─── 5. Head Pain Location Zones (SVG front-view, 200×250 viewBox) ──────────

export const headPainLocations: HeadPainLocation[] = [
  {
    id: "forehead",
    label: "Forehead",
    area: { cx: 100, cy: 55, r: 30 },
  },
  {
    id: "right_temple",
    label: "Right temple",
    area: { cx: 155, cy: 85, r: 18 },
  },
  {
    id: "left_temple",
    label: "Left temple",
    area: { cx: 45, cy: 85, r: 18 },
  },
  {
    id: "top_of_head",
    label: "Top of head",
    area: { cx: 100, cy: 25, r: 22 },
  },
  {
    id: "right_side",
    label: "Right side",
    area: { cx: 160, cy: 110, r: 20 },
  },
  {
    id: "left_side",
    label: "Left side",
    area: { cx: 40, cy: 110, r: 20 },
  },
  {
    id: "behind_right_eye",
    label: "Behind right eye",
    area: { cx: 125, cy: 95, r: 14 },
  },
  {
    id: "behind_left_eye",
    label: "Behind left eye",
    area: { cx: 75, cy: 95, r: 14 },
  },
  {
    id: "back_of_head",
    label: "Back of head",
    area: { cx: 100, cy: 140, r: 25 },
  },
  {
    id: "face_sinus",
    label: "Face / sinus",
    area: { cx: 100, cy: 120, r: 18 },
  },
  {
    id: "neck",
    label: "Neck",
    area: { cx: 100, cy: 195, r: 22 },
  },
];

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Pain description labels (used in headache history) */
export const painDescriptions: QuestionOption[] = [
  { id: "throbbing", label: "Throbbing / pulsating", icon: "💓" },
  { id: "pressing", label: "Pressing / tightening", icon: "🔧" },
  { id: "stabbing", label: "Stabbing / piercing", icon: "🗡️" },
  { id: "sharp", label: "Sharp", icon: "⚡" },
  { id: "dull", label: "Dull ache", icon: "😶" },
  { id: "other", label: "Other", icon: "📝" },
];

/** Duration categories (used in headache history) */
export const durationOptions: QuestionOption[] = [
  { id: "minutes", label: "Minutes", icon: "⏱️" },
  { id: "hours", label: "Hours", icon: "🕐" },
  { id: "days", label: "Days", icon: "📅" },
  { id: "constant", label: "Constant", icon: "♾️" },
];

/** Frequency categories (used in headache history) */
export const headacheFrequencyOptions: QuestionOption[] = [
  { id: "per_day", label: "Multiple per day", icon: "📈" },
  { id: "daily", label: "Daily", icon: "📅" },
  { id: "per_week", label: "A few per week", icon: "🗓️" },
  { id: "per_month", label: "A few per month", icon: "📆" },
  { id: "per_year", label: "A few per year", icon: "🗒️" },
  { id: "constant", label: "Constant / never stops", icon: "♾️" },
];
