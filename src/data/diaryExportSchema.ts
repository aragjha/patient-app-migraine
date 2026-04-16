export interface PharmaExportRecord {
  patientId: string;
  recordType: "attack" | "daily-checkin" | "diary-entry" | "medication-log";
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  demographics: {
    ageAtRecord: number;
    gender: string;
    diagnosisType: string;
    migraineSubtype: string; // episodic, chronic, menstrual, with-aura
    yearsWithDiagnosis: number;
  };
  attack?: {
    painLevel: number;
    painLocations: string[];
    painQuality: string[];
    durationMinutes: number;
    auraPresent: boolean;
    auraTypes: string[];
    triggers: string[];
    symptoms: string[];
    medicationsTaken: { name: string; dose: string; category: string; effectiveRating: number }[];
    reliefMethods: string[];
    disabilityScore: number;
    functionalImpact: string;
  };
  checkin?: {
    overallWellbeing: number;
    headachePresent: boolean;
    headacheSeverity: string;
    associatedSymptoms: string[];
    triggersNoticed: string[];
    medicationTaken: boolean;
    medicationEffective: boolean;
    sleepQuality: number;
    stressLevel: number;
    menstrualDay?: number;
  };
  medicationLog?: {
    medicationName: string;
    medicationCategory: string;
    scheduledTime: string;
    taken: boolean;
    timeTaken?: string;
    sideEffects?: string[];
  };
  diaryEntry?: {
    categoryId: string;
    categoryName: string;
    selectedSymptoms: string[];
    frequency: number;
    impact: number;
    worstTime: string;
  };
}

export interface PharmaExportPackage {
  exportVersion: "1.0";
  exportDate: string;
  patientId: string;
  dateRange: { start: string; end: string };
  totalRecords: number;
  summary: {
    totalAttacks: number;
    averagePainLevel: number;
    attacksPerMonth: number;
    topTriggers: { trigger: string; frequency: number }[];
    medicationAdherenceRate: number;
    midasScore: number;
    diaryCompletionRate: number;
  };
  records: PharmaExportRecord[];
}

export const calculateMIDAS = (attacks: { disabilityScore: number; date: string }[]): number => {
  const last90Days = attacks.filter((a) => {
    const d = new Date(a.date);
    return d >= new Date(Date.now() - 90 * 86400000);
  });
  const totalDisabilityDays = last90Days.reduce((sum, a) => sum + a.disabilityScore, 0);
  if (totalDisabilityDays <= 5) return 1;
  if (totalDisabilityDays <= 10) return 2;
  if (totalDisabilityDays <= 20) return 3;
  return 4;
};
