import { WidgetConfig } from "@/components/NeuraInlineWidget";
import { pickPhrase } from "./neuraPhrasePool";

export type ScriptId =
  | "headache-log"
  | "daily-checkin"
  | "diary-triggers"
  | "diary-pain"
  | "diary-aura"
  | "diary-symptoms"
  | "diary-relief"
  | "diary-sleep"
  | "diary-mood"
  | "medication-check"
  | "trigger-insights";

export interface ScriptStep {
  stepId: string;
  phraseKey: string; // key into phrasePool
  widget?: WidgetConfig;
  // If no widget, step just says something and auto-advances to next.
  // If widget present, renders the widget and waits for submission.
}

export interface Script {
  id: ScriptId;
  name: string;
  steps: ScriptStep[];
  openPhraseKey: string; // what Neura says when script starts (in addition to first step)
  closePhraseKey: string; // what Neura says when script completes
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
      },
      {
        stepId: "painLevel",
        phraseKey: "headache.painLevel",
        widget: { type: "pain-slider" },
      },
      {
        stepId: "timing",
        phraseKey: "headache.timing",
        widget: { type: "timing-picker" },
      },
      {
        stepId: "symptoms",
        phraseKey: "headache.symptoms",
        widget: { type: "symptom-chips", multiSelect: true },
      },
      {
        stepId: "trigger",
        phraseKey: "headache.trigger",
        widget: { type: "trigger-chips", multiSelect: true },
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
      },
      {
        stepId: "sleep",
        phraseKey: "checkin.sleep",
        widget: { type: "sleep-quality" },
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
      },
      {
        stepId: "mood",
        phraseKey: "checkin.mood",
        widget: { type: "mood-picker" },
      },
    ],
  },
  "diary-triggers": {
    id: "diary-triggers",
    name: "Triggers diary",
    openPhraseKey: "triggers.open",
    closePhraseKey: "triggers.close",
    steps: [
      {
        stepId: "triggers",
        phraseKey: "triggers.prompt",
        widget: { type: "trigger-chips", multiSelect: true },
      },
    ],
  },
  "diary-pain": {
    id: "diary-pain",
    name: "Headache pain diary",
    openPhraseKey: "headache.location",
    closePhraseKey: "ack.gotIt",
    steps: [
      { stepId: "location", phraseKey: "headache.location", widget: { type: "head-diagram" } },
      { stepId: "painLevel", phraseKey: "headache.painLevel", widget: { type: "pain-slider" } },
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
      },
    ],
  },
  "diary-symptoms": {
    id: "diary-symptoms",
    name: "Associated symptoms",
    openPhraseKey: "headache.symptoms",
    closePhraseKey: "ack.gotIt",
    steps: [
      { stepId: "symptoms", phraseKey: "headache.symptoms", widget: { type: "symptom-chips", multiSelect: true } },
    ],
  },
  "diary-relief": {
    id: "diary-relief",
    name: "Relief methods",
    openPhraseKey: "ack.gotIt",
    closePhraseKey: "ack.gotIt",
    steps: [
      {
        stepId: "relief",
        phraseKey: "headache.symptoms",
        widget: { type: "relief-chips", multiSelect: true },
      },
    ],
  },
  "diary-sleep": {
    id: "diary-sleep",
    name: "Sleep diary",
    openPhraseKey: "checkin.sleep",
    closePhraseKey: "ack.gotIt",
    steps: [
      { stepId: "quality", phraseKey: "checkin.sleep", widget: { type: "sleep-quality" } },
    ],
  },
  "diary-mood": {
    id: "diary-mood",
    name: "Mood & stress diary",
    openPhraseKey: "checkin.mood",
    closePhraseKey: "ack.gotIt",
    steps: [
      { stepId: "mood", phraseKey: "checkin.mood", widget: { type: "mood-picker" } },
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
      },
    ],
  },
  "trigger-insights": {
    id: "trigger-insights",
    name: "Trigger insights",
    openPhraseKey: "ack.gotIt", // overridden dynamically in intent handler
    closePhraseKey: "ack.gotIt",
    steps: [], // this script just surfaces insights, no widgets
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
