import { HistoricalAttack, getMockAttacks } from "./mockUserData";

export interface TriggerFrequency {
  trigger: string;
  count: number;
  percentage: number; // % of attacks in window
}

export interface TriggerCoOccurrence {
  triggerA: string;
  triggerB: string;
  count: number; // how often both appeared together
  percentage: number; // % of attacks where both appeared
}

export interface CycleCorrelation {
  menstrualWindowAttacks: number; // attacks in days 25-28 + 1-3
  nonMenstrualWindowAttacks: number;
  menstrualWindowAttackRate: number; // attacks per day
  nonMenstrualWindowAttackRate: number;
  multiplier: number; // how many x more likely during menstrual window
}

export interface WeeklySummary {
  weekStart: string; // YYYY-MM-DD
  attackCount: number;
  avgPainLevel: number;
  topTriggers: string[]; // top 3
}

export interface MonthlyInsights {
  month: string; // YYYY-MM
  attackCount: number;
  prevMonthAttackCount: number;
  delta: number; // positive = more attacks
  avgPainLevel: number;
  topTrigger: { trigger: string; count: number } | null;
  medicationAdherenceRate: number;
}

/** Filter attacks to a date range */
export function filterAttacks(
  attacks: HistoricalAttack[],
  fromDate: Date,
  toDate: Date
): HistoricalAttack[] {
  return attacks.filter((a) => {
    const d = new Date(a.date);
    return d >= fromDate && d <= toDate;
  });
}

/** Top N triggers by frequency in a given attack set */
export function getTopTriggers(
  attacks: HistoricalAttack[],
  limit: number = 5
): TriggerFrequency[] {
  const counts: Record<string, number> = {};
  attacks.forEach((a) => a.triggers.forEach((t) => {
    counts[t] = (counts[t] || 0) + 1;
  }));
  const total = attacks.length;
  return Object.entries(counts)
    .map(([trigger, count]) => ({
      trigger,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Co-occurrence matrix: which trigger pairs appear together most */
export function getCoOccurrence(
  attacks: HistoricalAttack[],
  limit: number = 5
): TriggerCoOccurrence[] {
  const pairCounts: Record<string, number> = {};
  attacks.forEach((a) => {
    const triggers = [...new Set(a.triggers)].sort();
    for (let i = 0; i < triggers.length; i++) {
      for (let j = i + 1; j < triggers.length; j++) {
        const key = `${triggers[i]}|${triggers[j]}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  });
  const total = attacks.length;
  return Object.entries(pairCounts)
    .map(([key, count]) => {
      const [triggerA, triggerB] = key.split("|");
      return {
        triggerA,
        triggerB,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Menstrual window correlation (days 25-28 or 1-3 of each month) */
export function getCycleCorrelation(attacks: HistoricalAttack[]): CycleCorrelation {
  const menstrualWindow: HistoricalAttack[] = [];
  const other: HistoricalAttack[] = [];

  attacks.forEach((a) => {
    const day = new Date(a.date).getDate();
    if (day >= 25 || day <= 3) {
      menstrualWindow.push(a);
    } else {
      other.push(a);
    }
  });

  // Approximate: 7 days in menstrual window per ~30-day month
  const menstrualDaysInPeriod = Math.max(1, (attacks.length > 0 ? getDaySpan(attacks) * 7 / 30 : 1));
  const otherDaysInPeriod = Math.max(1, (attacks.length > 0 ? getDaySpan(attacks) * 23 / 30 : 1));

  const menstrualRate = menstrualWindow.length / menstrualDaysInPeriod;
  const otherRate = other.length / otherDaysInPeriod;

  return {
    menstrualWindowAttacks: menstrualWindow.length,
    nonMenstrualWindowAttacks: other.length,
    menstrualWindowAttackRate: Math.round(menstrualRate * 100) / 100,
    nonMenstrualWindowAttackRate: Math.round(otherRate * 100) / 100,
    multiplier: otherRate > 0 ? Math.round((menstrualRate / otherRate) * 10) / 10 : 0,
  };
}

/** Number of days covered by an attack set */
function getDaySpan(attacks: HistoricalAttack[]): number {
  if (attacks.length === 0) return 0;
  const dates = attacks.map((a) => new Date(a.date).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  return Math.max(1, Math.ceil((max - min) / 86400000) + 1);
}

/** Current month vs previous month insights */
export function getMonthlyInsights(
  attacks: HistoricalAttack[],
  referenceDate: Date = new Date("2026-04-15")
): MonthlyInsights {
  const currentMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const nextMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);

  const currentAttacks = filterAttacks(attacks, currentMonth, nextMonth);
  const prevAttacks = filterAttacks(attacks, prevMonth, currentMonth);

  const topTriggers = getTopTriggers(currentAttacks, 1);
  const avgPain = currentAttacks.length > 0
    ? Math.round((currentAttacks.reduce((s, a) => s + a.painLevel, 0) / currentAttacks.length) * 10) / 10
    : 0;

  const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  return {
    month: monthStr,
    attackCount: currentAttacks.length,
    prevMonthAttackCount: prevAttacks.length,
    delta: currentAttacks.length - prevAttacks.length,
    avgPainLevel: avgPain,
    topTrigger: topTriggers[0] ? { trigger: topTriggers[0].trigger, count: topTriggers[0].count } : null,
    medicationAdherenceRate: 85, // mock for now; real implementation would consume getMockAdherence()
  };
}

/** Whether we have enough data to show insights (10+ attacks with triggers) */
export function hasEnoughDataForInsights(attacks: HistoricalAttack[]): boolean {
  const withTriggers = attacks.filter((a) => a.triggers.length > 0);
  return withTriggers.length >= 10;
}

/** Current progress toward trigger discovery (0-10+ attacks logged) */
export function getTriggerDiscoveryProgress(attacks: HistoricalAttack[]): { logged: number; target: number } {
  const withTriggers = attacks.filter((a) => a.triggers.length > 0);
  return { logged: Math.min(withTriggers.length, 10), target: 10 };
}

// Convenience wrappers for using with mock data
export function getInsightsFromMockData(referenceDate: Date = new Date("2026-04-15")) {
  const attacks = getMockAttacks();
  return {
    hasEnoughData: hasEnoughDataForInsights(attacks),
    progress: getTriggerDiscoveryProgress(attacks),
    topTriggers: getTopTriggers(attacks, 5),
    coOccurrence: getCoOccurrence(attacks, 5),
    cycleCorrelation: getCycleCorrelation(attacks),
    monthlyInsights: getMonthlyInsights(attacks, referenceDate),
  };
}

/** Friendly labels for trigger IDs used in mock data */
export const triggerLabels: Record<string, string> = {
  stress: "Stress",
  lack_of_sleep: "Poor sleep",
  poor_sleep: "Poor sleep",
  hormonal_changes: "Hormonal changes",
  weather: "Weather change",
  skipped_meal: "Skipped meal",
  bright_lights: "Bright lights",
  alcohol: "Alcohol",
  neck_pain: "Neck pain",
  anxiety: "Anxiety",
  screen_time: "Screen time",
  depressed_mood: "Low mood",
};

export function getTriggerLabel(id: string): string {
  return triggerLabels[id] || id.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}
