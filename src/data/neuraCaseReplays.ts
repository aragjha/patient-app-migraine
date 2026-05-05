import { ScriptId } from "./neuraScripts";
import { NeuraAnswer, NeuraAnswerKind } from "@/components/neura/NeuraInlineAnswer";

/**
 * Case replays — pre-baked, tap-paced demo flows for each chat case the
 * product needs to show off. Driven by `NeuraReplayDirector` overlay
 * (Next → button) and dispatched action-by-action inside NeuraChat.
 *
 * Each replay covers roughly: invoke → modal/info → compress → off-topic
 * recovery → end-with-what-else → new-activity-while-active. Not every
 * action shows in every replay (some cases don't need all six).
 */

export type ReplayAction =
  | { kind: "note"; text: string }
  | { kind: "user"; text: string }
  | { kind: "neura"; text: string }
  | { kind: "start-script"; scriptId: ScriptId }
  | { kind: "auto-submit"; value: string[] | number }
  | { kind: "close-modal" }
  | { kind: "tap-resume" }
  | { kind: "show-card"; answer: NeuraAnswer; actionKey?: NeuraAnswerKind }
  | { kind: "what-else"; chips?: string[] }
  | { kind: "guardrail"; userText: string }
  | { kind: "switch-script"; scriptId: ScriptId };

export interface CaseReplay {
  id: string;
  name: string;
  description: string;
  actions: ReplayAction[];
}

const SAMPLE_TRIGGER_SESSION = {
  kind: "previous-trigger-log" as const,
  dateLabel: "Wednesday, Apr 30",
  daysAgo: 5,
  triggers: [
    { id: "stress", label: "Stress", icon: "😰" },
    { id: "poor_sleep", label: "Poor sleep", icon: "😴" },
    { id: "weather", label: "Weather shift", icon: "🌦️" },
  ],
  context: { sleep: "5h", stress: "High", mood: "Low" },
};

const SAMPLE_LAST_ATTACK = {
  kind: "last-attack" as const,
  dateLabel: "Tuesday, Apr 29",
  durationLabel: "4h 20m",
  peakPain: 7,
  zones: ["Right temple", "Behind right eye"],
  whatHelped: "Dark room + sumatriptan",
  trigger: "Stress + poor sleep",
};

const SAMPLE_TOP_TRIGGERS = {
  kind: "top-triggers" as const,
  triggers: [
    { id: "stress", label: "Stress", icon: "😰", correlation: 0.78, observations: 14 },
    { id: "poor_sleep", label: "Poor sleep", icon: "😴", correlation: 0.65, observations: 11 },
    { id: "caffeine", label: "Caffeine", icon: "☕", correlation: 0.52, observations: 8 },
  ],
};

const SAMPLE_ADHERENCE = {
  kind: "adherence" as const,
  weekPct: 87,
  missedDoses: 4,
  totalDoses: 28,
  byMed: [
    { name: "Topiramate 100mg", taken: 7, total: 7 },
    { name: "Sumatriptan 50mg", taken: 2, total: 4 },
    { name: "Ibuprofen 400mg", taken: 12, total: 14 },
  ],
};

export const CASE_REPLAYS: CaseReplay[] = [
  {
    id: "log-attack",
    name: "5a · Log attack",
    description:
      "Open Neura, full attack-log via modal, dismiss → resume pill, off-topic → guardrail, finish → what else?",
    actions: [
      { kind: "note", text: "User taps mic — Neura opens the log-attack flow." },
      { kind: "user", text: "Log a headache" },
      { kind: "neura", text: "Sorry to hear that. Let's log it — 30 seconds." },
      { kind: "start-script", scriptId: "headache-log" },
      { kind: "note", text: "Modal opens at step 1: 'Where is the pain?'" },
      { kind: "auto-submit", value: ["right-temple", "right-eye"] },
      { kind: "auto-submit", value: 7 },
      { kind: "note", text: "User dismisses the modal — should compress to a resume pill." },
      { kind: "close-modal" },
      { kind: "note", text: "User digresses — Neura answers briefly without losing context." },
      { kind: "guardrail", userText: "What's the cricket score?" },
      { kind: "note", text: "Resume pill restores the modal at the parked step." },
      { kind: "tap-resume" },
      { kind: "auto-submit", value: ["1h"] },
      { kind: "auto-submit", value: ["nausea", "light"] },
      { kind: "auto-submit", value: ["stress", "sleep"] },
      { kind: "note", text: "Script complete — 'what else?' chips appear." },
    ],
  },
  {
    id: "diary",
    name: "5b · Migraine diary / MIDAS",
    description:
      "Pain diary entry via modal + impact (MIDAS-like) free-chat answer + transition to symptoms diary mid-flow.",
    actions: [
      { kind: "user", text: "Open my pain diary" },
      { kind: "neura", text: "Same spot as last time, or somewhere new?" },
      { kind: "start-script", scriptId: "diary-pain" },
      { kind: "auto-submit", value: ["forehead", "temples"] },
      { kind: "auto-submit", value: 6 },
      { kind: "note", text: "User asks a MIDAS-style impact question — Neura answers in chat." },
      { kind: "user", text: "How much did it affect my day?" },
      {
        kind: "neura",
        text: "Based on your last 4 attacks, you missed work twice and modified plans the other two days. That's a moderate MIDAS impact — about 9.",
      },
      { kind: "note", text: "While in the diary, user pivots to symptoms — confirm + switch." },
      { kind: "user", text: "Actually let me log symptoms instead" },
      {
        kind: "neura",
        text: "Got it — saving the pain entry, switching to symptoms.",
      },
      { kind: "switch-script", scriptId: "diary-symptoms" },
      { kind: "auto-submit", value: ["nausea", "light", "sound"] },
    ],
  },
  {
    id: "trigger",
    name: "5c · Trigger identification",
    description:
      "Show previous trigger log, run the trigger diary, surface top correlations.",
    actions: [
      {
        kind: "note",
        text: "User asks about previous triggers — Neura recalls last session inline.",
      },
      { kind: "user", text: "Show my last trigger log" },
      { kind: "neura", text: "Pulled your last trigger session —" },
      { kind: "show-card", answer: SAMPLE_TRIGGER_SESSION, actionKey: "previous-trigger-log" },
      { kind: "note", text: "Now run a fresh trigger diary." },
      { kind: "user", text: "Log triggers for today" },
      { kind: "start-script", scriptId: "diary-triggers" },
      { kind: "auto-submit", value: ["stress", "screen"] },
      {
        kind: "neura",
        text: "Logged. Stress + screen time — that pattern's showing up across your last 5 sessions.",
      },
      { kind: "show-card", answer: SAMPLE_TOP_TRIGGERS, actionKey: "top-triggers" },
    ],
  },
  {
    id: "med-add",
    name: "5d · Add medication",
    description:
      "Voice-driven add-medication flow: name → role → schedule → reminders.",
    actions: [
      { kind: "user", text: "Add a new medication" },
      { kind: "neura", text: "Let's check your meds for today." },
      { kind: "start-script", scriptId: "medication-add" },
      { kind: "auto-submit", value: ["frovatriptan"] },
      { kind: "auto-submit", value: ["acute"] },
      { kind: "auto-submit", value: ["asneeded"] },
      { kind: "auto-submit", value: ["yes"] },
      {
        kind: "neura",
        text: "Saved. Frovatriptan — acute, as-needed, reminders on. I'll watch how it pairs with your attacks.",
      },
    ],
  },
  {
    id: "med-check",
    name: "5d · Med check + adherence",
    description:
      "Run the medication check script, then surface adherence chart inline.",
    actions: [
      { kind: "user", text: "Did I take my meds?" },
      { kind: "start-script", scriptId: "medication-check" },
      { kind: "auto-submit", value: ["topiramate"] },
      { kind: "neura", text: "Logged Topiramate. Missed Sumatriptan and Ibuprofen so far this week." },
      { kind: "user", text: "How's my adherence?" },
      { kind: "show-card", answer: SAMPLE_ADHERENCE, actionKey: "adherence" },
    ],
  },
  {
    id: "adherence",
    name: "5e · Adherence query",
    description: "Free-chat 'how are my meds' → inline adherence card → what-else.",
    actions: [
      { kind: "user", text: "How are my meds this week?" },
      { kind: "neura", text: "Here's your week — pretty mixed." },
      { kind: "show-card", answer: SAMPLE_ADHERENCE, actionKey: "adherence" },
      { kind: "what-else" },
    ],
  },
  {
    id: "normal",
    name: "5f · Normal question",
    description: "Free-chat health question → inline answer card.",
    actions: [
      { kind: "user", text: "Tell me about my last attack" },
      { kind: "neura", text: "Pulled the most recent log —" },
      { kind: "show-card", answer: SAMPLE_LAST_ATTACK, actionKey: "last-attack" },
    ],
  },
  {
    id: "guardrail",
    name: "5g · Off-topic / guardrail",
    description:
      "Off-topic question (cricket / weather) → polite refusal + redirect chips.",
    actions: [
      { kind: "user", text: "What's the cricket score today?" },
      { kind: "guardrail", userText: "What's the cricket score today?" },
    ],
  },
  {
    id: "what-else",
    name: "5h · End → what else?",
    description: "Finish a quick check-in, then prompt for what's next.",
    actions: [
      { kind: "user", text: "Quick check-in" },
      { kind: "start-script", scriptId: "daily-discovery" },
      { kind: "auto-submit", value: ["7to8"] },
      { kind: "auto-submit", value: ["none"] },
      { kind: "auto-submit", value: ["good"] },
      { kind: "note", text: "Script closes — what-else chips appear automatically." },
    ],
  },
  {
    id: "interrupt",
    name: "5i · Interrupt mid-activity",
    description:
      "User starts a check-in, then asks to log a headache mid-script — Neura confirms switch.",
    actions: [
      { kind: "user", text: "Daily check-in" },
      { kind: "start-script", scriptId: "daily-discovery" },
      { kind: "auto-submit", value: ["7to8"] },
      { kind: "user", text: "Wait — I need to log a headache instead" },
      {
        kind: "neura",
        text: "Pausing the check-in. Switching to a headache log.",
      },
      { kind: "switch-script", scriptId: "headache-log" },
      { kind: "auto-submit", value: ["forehead"] },
    ],
  },
];

export function getReplayById(id: string): CaseReplay | null {
  return CASE_REPLAYS.find((r) => r.id === id) ?? null;
}
