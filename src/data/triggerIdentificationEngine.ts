// Trigger Identification Engine
// Tracks conversational observations → correlation scores per lifestyle/biological factor

export interface TriggerObservation {
  factorId: string;
  present: boolean;
  hadMigraineWithin24h: boolean;
  timestamp: string;
  notes?: string;
}

export interface TriggerSession {
  id: string;
  date: string;
  source: "chat" | "diary" | "headache-log";
  observations: TriggerObservation[];
}

export interface TriggerCorrelation {
  factorId: string;
  label: string;
  emoji: string;
  category: string;
  correlation: number; // 0–100
  observations: number;
  totalPresent: number;
  migrainesWhenPresent: number;
  migrainesWhenAbsent: number;
  signalStrength: "strong" | "building" | "early";
}

export const TRIGGER_FACTORS: {
  id: string;
  label: string;
  emoji: string;
  category: string;
  description: string;
  solutions: string[];
}[] = [
  {
    id: "stress",
    label: "High stress",
    emoji: "🧠",
    category: "Mental",
    description: "Elevated stress levels in the 24–48h before a migraine",
    solutions: [
      "10-min breathing or body-scan meditation before sleep",
      "Progressive muscle relaxation (PMR) during high-stress periods",
      "Talk to a therapist — CBT halves migraine frequency in studies",
    ],
  },
  {
    id: "sleep_poor",
    label: "Poor sleep",
    emoji: "😴",
    category: "Sleep",
    description: "Less than 7h or fragmented sleep the night before",
    solutions: [
      "Keep wake time consistent — even on weekends",
      "Avoid screens 60 min before bed",
      "Magnesium glycinate 400 mg at night improves sleep depth",
    ],
  },
  {
    id: "dehydration",
    label: "Dehydration",
    emoji: "💧",
    category: "Diet",
    description: "Low fluid intake or forgetting to drink during the day",
    solutions: [
      "Target 2.5L water daily — set hourly reminders",
      "Add electrolytes to morning glass on high-risk days",
      "Carry a 1L bottle as a visual cue",
    ],
  },
  {
    id: "caffeine_change",
    label: "Caffeine shift",
    emoji: "☕",
    category: "Diet",
    description: "Change in usual caffeine amount — skipping or doubling",
    solutions: [
      "Keep daily caffeine consistent — same time, same dose",
      "If reducing, taper by 25 mg/week to avoid withdrawal",
      "Cap caffeine at 200 mg/day; avoid after 2 pm",
    ],
  },
  {
    id: "alcohol",
    label: "Alcohol",
    emoji: "🍷",
    category: "Diet",
    description: "Any alcohol, especially red wine, spirits, or beer",
    solutions: [
      "Limit to 1 unit; drink equal parts water alongside",
      "Avoid red wine and dark spirits (highest tyramine)",
      "Note next-day migraine risk on alcohol days in your diary",
    ],
  },
  {
    id: "skipped_meal",
    label: "Skipped meals",
    emoji: "🍽️",
    category: "Diet",
    description: "Going more than 4 hours without eating",
    solutions: [
      "Eat every 3–4 h — set a soft alarm if you forget",
      "Keep a protein bar in your bag for emergencies",
      "Never skip breakfast; blood sugar dips spike cortisol",
    ],
  },
  {
    id: "weather",
    label: "Weather change",
    emoji: "🌦️",
    category: "Environment",
    description: "Barometric pressure drops or rapid temperature swings",
    solutions: [
      "Install a barometric pressure app and check before high-risk days",
      "Pre-treat with ibuprofen when pressure drops > 5 hPa",
      "Stay extra hydrated and avoid other triggers during weather events",
    ],
  },
  {
    id: "screen_time",
    label: "Excess screen time",
    emoji: "💻",
    category: "Lifestyle",
    description: "More than 8 hours of screen exposure in a day",
    solutions: [
      "Use the 20-20-20 rule: every 20 min look 20 ft away for 20 s",
      "Enable night mode and reduce brightness after 6 pm",
      "Set a daily screen-time limit; take a 10-min break every 90 min",
    ],
  },
  {
    id: "hormonal",
    label: "Hormonal phase",
    emoji: "🌙",
    category: "Biological",
    description: "Luteal phase (days 22–28) or start of menstruation",
    solutions: [
      "Track your cycle and flag high-risk days in the app",
      "Mini-pill or hormonal patch can stabilise oestrogen — ask your doctor",
      "Pre-emptive triptan or NSAID on days 22–26 (perimenstrual approach)",
    ],
  },
  {
    id: "exercise_skip",
    label: "Skipping exercise",
    emoji: "🏃",
    category: "Lifestyle",
    description: "Sedentary day after a normally active routine",
    solutions: [
      "A 20-min brisk walk daily lowers cortisol over time",
      "Avoid intense exercise during aura — it can worsen attacks",
      "Morning movement reduces stress-hormone build-up through the day",
    ],
  },
  {
    id: "neck_tension",
    label: "Neck / shoulder tension",
    emoji: "💪",
    category: "Physical",
    description: "Stiffness or pain in the upper neck and trapezius",
    solutions: [
      "Daily neck stretches morning and evening (chin tucks + lateral flexion)",
      "Check desk ergonomics — screen at eye level, chair height",
      "Physiotherapy for cervicogenic component is highly evidence-based",
    ],
  },
  {
    id: "bright_light",
    label: "Glaring light",
    emoji: "☀️",
    category: "Environment",
    description: "Prolonged exposure to bright, flickering, or blue-shifted light",
    solutions: [
      "FL-41 tinted lenses (rose-tinted) reduce photosensitivity significantly",
      "Adjust monitor to warm colour temperature; reduce contrast ratio",
      "Polarised sunglasses for driving; avoid fluorescent overhead lighting",
    ],
  },
];

// ─── Correlation engine ───

export function computeCorrelations(sessions: TriggerSession[]): TriggerCorrelation[] {
  const stats: Record<
    string,
    { pm: number; pnm: number; am: number; anm: number }
  > = {};

  sessions.forEach((s) => {
    s.observations.forEach((obs) => {
      if (!stats[obs.factorId]) stats[obs.factorId] = { pm: 0, pnm: 0, am: 0, anm: 0 };
      const f = stats[obs.factorId];
      if (obs.present && obs.hadMigraineWithin24h) f.pm++;
      if (obs.present && !obs.hadMigraineWithin24h) f.pnm++;
      if (!obs.present && obs.hadMigraineWithin24h) f.am++;
      if (!obs.present && !obs.hadMigraineWithin24h) f.anm++;
    });
  });

  return TRIGGER_FACTORS.map((factor) => {
    const f = stats[factor.id];
    if (!f) {
      return {
        factorId: factor.id,
        label: factor.label,
        emoji: factor.emoji,
        category: factor.category,
        correlation: 0,
        observations: 0,
        totalPresent: 0,
        migrainesWhenPresent: 0,
        migrainesWhenAbsent: 0,
        signalStrength: "early" as const,
      };
    }
    const totalPresent = f.pm + f.pnm;
    const totalAbsent = f.am + f.anm;
    const ratePresent = totalPresent > 0 ? f.pm / totalPresent : 0;
    const rateAbsent = totalAbsent > 0 ? f.am / totalAbsent : 0;
    const lift = rateAbsent > 0 ? ratePresent / rateAbsent : ratePresent > 0 ? 3 : 1;
    const raw = Math.min(100, Math.round((Math.min(lift, 4) / 4) * 100));
    const totalObs = totalPresent + totalAbsent;
    const dampen = Math.min(1, totalObs / 8);
    const correlation = Math.round(raw * dampen);
    const signalStrength: TriggerCorrelation["signalStrength"] =
      correlation >= 60 && totalObs >= 5 ? "strong" :
      correlation >= 35 && totalObs >= 3 ? "building" : "early";

    return {
      factorId: factor.id,
      label: factor.label,
      emoji: factor.emoji,
      category: factor.category,
      correlation,
      observations: totalObs,
      totalPresent,
      migrainesWhenPresent: f.pm,
      migrainesWhenAbsent: f.am,
      signalStrength,
    };
  })
    .filter((c) => c.observations > 0)
    .sort((a, b) => b.correlation - a.correlation);
}

export function getSolutions(factorId: string): string[] {
  return TRIGGER_FACTORS.find((f) => f.id === factorId)?.solutions ?? [];
}

export function getFactorDescription(factorId: string): string {
  return TRIGGER_FACTORS.find((f) => f.id === factorId)?.description ?? "";
}

// ─── localStorage persistence ───

const STORAGE_KEY = "nc-trigger-sessions-v1";

export function getStoredSessions(): TriggerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: TriggerSession): void {
  try {
    const sessions = getStoredSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage quota exceeded or unavailable — silently drop
  }
}

// Seed demo data on first use so the UI has substance
export function ensureDemoData(): void {
  if (getStoredSessions().length > 0) return;

  const demos: TriggerSession[] = [
    {
      id: "demo-1",
      date: "2026-04-20",
      source: "chat",
      observations: [
        { factorId: "stress", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:00:00Z" },
        { factorId: "sleep_poor", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:01:00Z" },
        { factorId: "dehydration", present: false, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:02:00Z" },
        { factorId: "caffeine_change", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:03:00Z" },
        { factorId: "skipped_meal", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:04:00Z" },
        { factorId: "screen_time", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-20T10:05:00Z" },
        { factorId: "neck_tension", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-20T10:06:00Z" },
        { factorId: "bright_light", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-20T10:07:00Z" },
      ],
    },
    {
      id: "demo-2",
      date: "2026-04-22",
      source: "diary",
      observations: [
        { factorId: "stress", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-22T14:00:00Z" },
        { factorId: "sleep_poor", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-22T14:01:00Z" },
        { factorId: "dehydration", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-22T14:02:00Z" },
        { factorId: "caffeine_change", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-22T14:03:00Z" },
        { factorId: "skipped_meal", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-22T14:04:00Z" },
        { factorId: "hormonal", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-22T14:05:00Z" },
        { factorId: "weather", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-22T14:06:00Z" },
      ],
    },
    {
      id: "demo-3",
      date: "2026-04-25",
      source: "headache-log",
      observations: [
        { factorId: "stress", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-25T09:00:00Z" },
        { factorId: "sleep_poor", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-25T09:01:00Z" },
        { factorId: "caffeine_change", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-25T09:02:00Z" },
        { factorId: "alcohol", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-25T09:03:00Z" },
        { factorId: "neck_tension", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-25T09:04:00Z" },
        { factorId: "bright_light", present: true, hadMigraineWithin24h: false, timestamp: "2026-04-25T09:05:00Z" },
        { factorId: "weather", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-25T09:06:00Z" },
        { factorId: "dehydration", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-25T09:07:00Z" },
      ],
    },
    {
      id: "demo-4",
      date: "2026-04-27",
      source: "chat",
      observations: [
        { factorId: "stress", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-27T16:00:00Z" },
        { factorId: "sleep_poor", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-27T16:01:00Z" },
        { factorId: "exercise_skip", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-27T16:02:00Z" },
        { factorId: "skipped_meal", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-27T16:03:00Z" },
        { factorId: "hormonal", present: true, hadMigraineWithin24h: true, timestamp: "2026-04-27T16:04:00Z" },
        { factorId: "bright_light", present: false, hadMigraineWithin24h: false, timestamp: "2026-04-27T16:05:00Z" },
        { factorId: "neck_tension", present: true, hadMigraineWithin24h: false, timestamp: "2026-04-27T16:06:00Z" },
        { factorId: "screen_time", present: true, hadMigraineWithin24h: false, timestamp: "2026-04-27T16:07:00Z" },
      ],
    },
  ];

  demos.forEach(saveSession);
}

// ─── Insight popup helpers ───

const INSIGHT_SHOWN_KEY = "nc-trigger-insight-shown-v1";
export const INSIGHT_SESSION_THRESHOLD = 3;

export function shouldShowInsightPopup(): boolean {
  const sessions = getStoredSessions();
  if (sessions.length < INSIGHT_SESSION_THRESHOLD) return false;
  if (localStorage.getItem(INSIGHT_SHOWN_KEY)) return false;
  const correlations = computeCorrelations(sessions);
  return correlations.some((c) => c.signalStrength === "strong" || c.signalStrength === "building");
}

export function markInsightPopupShown(): void {
  localStorage.setItem(INSIGHT_SHOWN_KEY, "true");
}

export function resetInsightPopup(): void {
  localStorage.removeItem(INSIGHT_SHOWN_KEY);
}

export function getTopTriggerForInsight(): TriggerCorrelation | null {
  const sessions = getStoredSessions();
  const correlations = computeCorrelations(sessions);
  return correlations.find((c) => c.signalStrength === "strong" || c.signalStrength === "building") ?? correlations[0] ?? null;
}

// Map questionnaire trigger option IDs → engine factor IDs
const QUESTIONNAIRE_FACTOR_MAP: Record<string, string> = {
  too_little_sleep: "sleep_poor",
  stress: "stress",
  dehydration: "dehydration",
  caffeine: "caffeine_change",
  alcohol: "alcohol",
  skipped_meal: "skipped_meal",
  weather: "weather",
  bright_light: "bright_light",
  neck_shoulder: "neck_tension",
};

// The full set of questionnaire trigger option IDs that map to engine factors
const MAPPED_QUESTIONNAIRE_IDS = Object.keys(QUESTIONNAIRE_FACTOR_MAP);

// Call this after a headache log is completed to wire real data into the engine.
// selectedTriggerIds: the trigger option IDs the user selected in the questionnaire.
// All observations have hadMigraineWithin24h = true (it's a headache log).
export function saveHeadacheTriggerSession(selectedTriggerIds: string[]): void {
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split("T")[0];
  const observations: TriggerObservation[] = MAPPED_QUESTIONNAIRE_IDS.map((qId) => ({
    factorId: QUESTIONNAIRE_FACTOR_MAP[qId],
    present: selectedTriggerIds.includes(qId),
    hadMigraineWithin24h: true,
    timestamp,
  }));
  saveSession({
    id: `headache-log-${Date.now()}`,
    date: dateStr,
    source: "headache-log",
    observations,
  });
}
