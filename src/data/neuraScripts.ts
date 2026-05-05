import { WidgetConfig } from "@/components/NeuraInlineWidget";
import { pickPhrase } from "./neuraPhrasePool";

export type ScriptId =
  | "headache-log"
  | "daily-checkin"
  | "daily-discovery"
  | "diary-triggers"
  | "diary-pain"
  | "diary-aura"
  | "diary-symptoms"
  | "diary-relief"
  | "diary-sleep"
  | "diary-mood"
  | "medication-check"
  | "medication-add"
  | "trigger-insights"
  | "last-attack";

export interface StepDisplay {
  /** Bold serif headline at the top of the modal. */
  question: string;
  /** Smaller helper line under the question. */
  subtitle?: string;
  /** Italic Neura "coach" line for warmth. */
  coach?: string;
}

export interface ScriptStep {
  stepId: string;
  phraseKey: string;
  widget?: WidgetConfig;
  /** Display metadata for the modal — title, subtitle, Neura coach line. */
  display?: StepDisplay;
}

export interface Script {
  id: ScriptId;
  name: string;
  steps: ScriptStep[];
  openPhraseKey: string;
  closePhraseKey: string;
}

export const scripts: Record<ScriptId, Script> = {
  "headache-log": {
    id: "headache-log",
    name: "Log a headache",
    openPhraseKey: "headache.open",
    closePhraseKey: "headache.close",
    steps: [
      {
        stepId: "location",
        phraseKey: "headache.location",
        widget: { type: "head-diagram" },
        display: {
          question: "Where is the pain located?",
          subtitle: "Select all areas that apply.",
          coach: "Tap a zone or just tell me where it hurts.",
        },
      },
      {
        stepId: "painLevel",
        phraseKey: "headache.painLevel",
        widget: { type: "pain-slider" },
        display: {
          question: "How intense is the pain?",
          subtitle: "Select a number on a scale of 1–10.",
        },
      },
      {
        stepId: "timing",
        phraseKey: "headache.timing",
        widget: { type: "timing-picker" },
        display: {
          question: "When did it start?",
          subtitle: "Roughly is fine.",
        },
      },
      {
        stepId: "symptoms",
        phraseKey: "headache.symptoms",
        widget: { type: "symptom-chips", multiSelect: true },
        display: {
          question: "Any other symptoms?",
          subtitle: "Select all that apply.",
        },
      },
      {
        stepId: "trigger",
        phraseKey: "headache.trigger",
        widget: { type: "trigger-chips", multiSelect: true },
        display: {
          question: "What do you think triggered it?",
          subtitle: "Select all that apply.",
        },
      },
    ],
  },
  "daily-checkin": {
    id: "daily-checkin",
    name: "Daily check-in",
    openPhraseKey: "checkin.open",
    closePhraseKey: "checkin.close",
    steps: [
      {
        stepId: "overall",
        phraseKey: "checkin.overall",
        widget: { type: "pain-slider" },
        display: {
          question: "How are you feeling overall?",
          subtitle: "1 = rough, 10 = great.",
        },
      },
      {
        stepId: "headache",
        phraseKey: "checkin.headache",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "none", label: "No headache", icon: "✨" },
            { id: "mild", label: "Mild", icon: "😐" },
            { id: "moderate", label: "Moderate", icon: "😣" },
            { id: "severe", label: "Severe", icon: "😫" },
          ],
        },
        display: {
          question: "Any headache today?",
          subtitle: "Pick the closest option.",
        },
      },
      {
        stepId: "sleep",
        phraseKey: "checkin.sleep",
        widget: { type: "sleep-quality" },
        display: { question: "How was your sleep?" },
      },
      {
        stepId: "meds",
        phraseKey: "checkin.meds",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "yes_all", label: "Yes, all", icon: "✅" },
            { id: "missed_some", label: "Missed some", icon: "⚠️" },
            { id: "none_today", label: "No meds today", icon: "❌" },
          ],
        },
        display: { question: "Did you take your meds?" },
      },
      {
        stepId: "mood",
        phraseKey: "checkin.mood",
        widget: { type: "mood-picker" },
        display: { question: "How's your mood?" },
      },
    ],
  },
  "diary-triggers": {
    id: "diary-triggers",
    name: "Trigger diary",
    openPhraseKey: "triggers.open",
    closePhraseKey: "triggers.close",
    steps: [
      {
        stepId: "triggers",
        phraseKey: "triggers.prompt",
        widget: { type: "trigger-chips", multiSelect: true },
        display: {
          question: "What do you think triggered it?",
          subtitle: "Select all that apply.",
        },
      },
    ],
  },
  "diary-pain": {
    id: "diary-pain",
    name: "Pain diary",
    openPhraseKey: "headache.location",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "location",
        phraseKey: "headache.location",
        widget: { type: "head-diagram" },
        display: {
          question: "Where is the pain located?",
          subtitle: "Select all areas that apply.",
        },
      },
      {
        stepId: "painLevel",
        phraseKey: "headache.painLevel",
        widget: { type: "pain-slider" },
        display: {
          question: "How intense is the pain?",
          subtitle: "Select a number on a scale of 1–10.",
        },
      },
    ],
  },
  "diary-aura": {
    id: "diary-aura",
    name: "Aura diary",
    openPhraseKey: "ack.gotIt",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "aura",
        phraseKey: "headache.symptoms",
        widget: {
          type: "symptom-chips",
          multiSelect: true,
          options: [
            { id: "visual", label: "Visual changes", icon: "👁️" },
            { id: "tingling", label: "Tingling/numbness", icon: "✋" },
            { id: "weakness", label: "Weakness", icon: "⚠️" },
            { id: "fatigue", label: "Fatigue", icon: "😓" },
            { id: "yawning", label: "Excessive yawning", icon: "😮" },
            { id: "irritability", label: "Irritability", icon: "😤" },
            { id: "none", label: "None", icon: "✨" },
          ],
        },
        display: {
          question: "Any aura before the pain?",
          subtitle: "Select all that apply.",
        },
      },
    ],
  },
  "diary-symptoms": {
    id: "diary-symptoms",
    name: "Symptoms diary",
    openPhraseKey: "headache.symptoms",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "symptoms",
        phraseKey: "headache.symptoms",
        widget: { type: "symptom-chips", multiSelect: true },
        display: {
          question: "Any other symptoms?",
          subtitle: "Select all that apply.",
        },
      },
    ],
  },
  "diary-relief": {
    id: "diary-relief",
    name: "Relief diary",
    openPhraseKey: "ack.gotIt",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "relief",
        phraseKey: "headache.symptoms",
        widget: { type: "relief-chips", multiSelect: true },
        display: {
          question: "What helped you feel better?",
          subtitle: "Select all that apply.",
        },
      },
    ],
  },
  "diary-sleep": {
    id: "diary-sleep",
    name: "Sleep diary",
    openPhraseKey: "checkin.sleep",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "quality",
        phraseKey: "checkin.sleep",
        widget: { type: "sleep-quality" },
        display: { question: "How was your sleep?" },
      },
    ],
  },
  "diary-mood": {
    id: "diary-mood",
    name: "Mood diary",
    openPhraseKey: "checkin.mood",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "mood",
        phraseKey: "checkin.mood",
        widget: { type: "mood-picker" },
        display: { question: "How's your mood?" },
      },
    ],
  },
  "medication-check": {
    id: "medication-check",
    name: "Medication check",
    openPhraseKey: "meds.open",
    closePhraseKey: "meds.close",
    steps: [
      {
        stepId: "meds",
        phraseKey: "meds.open",
        widget: {
          type: "medication-check",
          multiSelect: true,
          options: [
            { id: "topiramate", label: "Topiramate 100mg", icon: "💊" },
            { id: "sumatriptan", label: "Sumatriptan 50mg", icon: "💊" },
            { id: "ibuprofen", label: "Ibuprofen 400mg", icon: "💊" },
          ],
        },
        display: {
          question: "Which meds have you taken?",
          subtitle: "Tap each that you took today.",
        },
      },
    ],
  },
  "trigger-insights": {
    id: "trigger-insights",
    name: "Trigger insights",
    openPhraseKey: "ack.gotIt",
    closePhraseKey: "ack.gotIt",
    steps: [],
  },
  "medication-add": {
    id: "medication-add",
    name: "Add medication",
    openPhraseKey: "meds.open",
    closePhraseKey: "meds.close",
    steps: [
      {
        stepId: "name",
        phraseKey: "meds.open",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "topiramate", label: "Topiramate", icon: "💊" },
            { id: "sumatriptan", label: "Sumatriptan", icon: "💊" },
            { id: "rizatriptan", label: "Rizatriptan", icon: "💊" },
            { id: "ibuprofen", label: "Ibuprofen", icon: "💊" },
            { id: "frovatriptan", label: "Frovatriptan", icon: "💊" },
            { id: "other", label: "Something else", icon: "✏️" },
          ],
        },
        display: {
          question: "Which medication?",
          subtitle: "Pick a common one or tap 'Something else'.",
        },
      },
      {
        stepId: "role",
        phraseKey: "meds.open",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "preventive", label: "Preventive", icon: "🛡" },
            { id: "acute", label: "Acute (during attack)", icon: "⚡" },
            { id: "rescue", label: "Rescue", icon: "🚨" },
          ],
        },
        display: {
          question: "What's it for?",
          subtitle: "How do you typically use this med?",
        },
      },
      {
        stepId: "schedule",
        phraseKey: "meds.open",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "daily", label: "Daily", icon: "📅" },
            { id: "weekly", label: "Weekly", icon: "🗓" },
            { id: "asneeded", label: "Only as needed", icon: "🤚" },
          ],
        },
        display: { question: "How often do you take it?" },
      },
      {
        stepId: "reminders",
        phraseKey: "meds.open",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "yes", label: "Yes, remind me", icon: "🔔" },
            { id: "no", label: "No reminders", icon: "🔕" },
          ],
        },
        display: { question: "Do you want reminders?" },
      },
    ],
  },
  "daily-discovery": {
    id: "daily-discovery",
    name: "Daily check-in",
    openPhraseKey: "discovery.open",
    closePhraseKey: "discovery.close",
    steps: [
      {
        stepId: "lifestyle",
        phraseKey: "discovery.lifestyle",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "under5", label: "Under 5h", icon: "😴" },
            { id: "5to6", label: "5–6h", icon: "😐" },
            { id: "7to8", label: "7–8h", icon: "🙂" },
            { id: "over8", label: "8h+", icon: "😊" },
          ],
        },
        display: {
          question: "How many hours did you sleep?",
          subtitle: "Rough estimate is fine.",
        },
      },
      {
        stepId: "headPain",
        phraseKey: "discovery.headPain",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "none", label: "No pain", icon: "✨" },
            { id: "mild", label: "Mild", icon: "😐" },
            { id: "moderate", label: "Moderate", icon: "😣" },
            { id: "severe", label: "Severe", icon: "😫" },
          ],
        },
        display: { question: "Any head pain today?" },
      },
      {
        stepId: "quickFactor",
        phraseKey: "discovery.quickFactor",
        widget: { type: "mood-picker" },
        display: { question: "How's your mood today?" },
      },
    ],
  },
  "last-attack": {
    id: "last-attack",
    name: "Last attack",
    openPhraseKey: "ack.gotIt",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "when",
        phraseKey: "headache.timing",
        widget: {
          type: "timing-picker",
          options: [
            { id: "today", label: "Today", icon: "📍" },
            { id: "yesterday", label: "Yesterday", icon: "📆" },
            { id: "2to3days", label: "2–3 days ago", icon: "🗓" },
            { id: "lastweek", label: "Last week", icon: "📅" },
            { id: "cant_recall", label: "Can't remember", icon: "❓" },
          ],
        },
        display: {
          question: "When was your last migraine?",
          subtitle: "Rough is fine.",
        },
      },
      {
        stepId: "duration",
        phraseKey: "headache.timing",
        widget: {
          type: "timing-picker",
          options: [
            { id: "under4h", label: "Under 4 hours", icon: "⏱" },
            { id: "4to12h", label: "4–12 hours", icon: "🕓" },
            { id: "12to24h", label: "12–24 hours", icon: "🕛" },
            { id: "morethanday", label: "More than a day", icon: "📆" },
            { id: "still", label: "Still going", icon: "⚠️" },
          ],
        },
        display: { question: "How long did it last?" },
      },
      {
        stepId: "pain",
        phraseKey: "headache.painLevel",
        widget: { type: "pain-slider" },
        display: {
          question: "Peak pain level?",
          subtitle: "Slide to your typical worst.",
        },
      },
      {
        stepId: "relief",
        phraseKey: "headache.symptoms",
        widget: {
          type: "symptom-chips",
          multiSelect: false,
          options: [
            { id: "breathing", label: "Breathing exercises", icon: "🫁" },
            { id: "audio", label: "Calming audio", icon: "🎵" },
            { id: "meditation", label: "Guided meditation", icon: "🧘" },
            { id: "rest", label: "Just rest, no prompts", icon: "💤" },
          ],
        },
        display: {
          question: "What soothes you during a migraine?",
          subtitle: "Neura will suggest this when you're in an attack.",
        },
      },
    ],
  },
};

export function getScript(id: ScriptId): Script {
  return scripts[id];
}

export function getStepPhrase(stepId: string, script: Script): string {
  const step = script.steps.find((s) => s.stepId === stepId);
  if (!step) return "";
  return pickPhrase(step.phraseKey);
}

/** Get display metadata (question/subtitle/coach) for a step, with fallbacks. */
export function getStepDisplay(script: Script, stepIdx: number): StepDisplay {
  const step = script.steps[stepIdx];
  if (!step) return { question: "" };
  if (step.display) return step.display;
  return { question: pickPhrase(step.phraseKey) };
}
