// Streak + points engine — persists to localStorage

export type ActivityType =
  | "check-in"
  | "attack-log"
  | "daily-discovery"
  | "medication-log"
  | "relief-session";

interface ActivityRecord {
  date: string; // YYYY-MM-DD
  type: ActivityType;
  points: number;
  timestamp: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastActiveDate: string | null;
  activities: ActivityRecord[];
}

export const POINTS_MAP: Record<ActivityType, number> = {
  "check-in": 30,
  "attack-log": 50,
  "daily-discovery": 40,
  "medication-log": 20,
  "relief-session": 25,
};

const STORAGE_KEY = "nc-streak-data-v2";

function toDateStr(d = new Date()): string {
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.round(ms / 86_400_000);
}

function loadData(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch {}
  return { currentStreak: 0, longestStreak: 0, totalPoints: 0, lastActiveDate: null, activities: [] };
}

function saveData(d: StreakData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {}
}

function recomputeStreak(activities: ActivityRecord[]): { current: number; longest: number } {
  if (activities.length === 0) return { current: 0, longest: 0 };
  const days = [...new Set(activities.map((a) => a.date))].sort();
  let current = 1;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i - 1], days[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  // current streak: count backwards from today / yesterday
  const today = toDateStr();
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  const lastDay = days[days.length - 1];
  if (lastDay !== today && lastDay !== yesterday) return { current: 0, longest };
  current = 1;
  for (let i = days.length - 2; i >= 0; i--) {
    if (daysBetween(days[i], days[i + 1]) === 1) {
      current++;
    } else {
      break;
    }
  }
  return { current, longest: Math.max(longest, current) };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function recordActivity(type: ActivityType): { pointsEarned: number; newStreak: number; totalPoints: number } {
  const data = loadData();
  const today = toDateStr();
  // Deduplicate: only award points once per type per day
  const alreadyToday = data.activities.some((a) => a.date === today && a.type === type);
  const pts = alreadyToday ? 0 : POINTS_MAP[type];
  if (!alreadyToday) {
    data.activities.push({ date: today, type, points: pts, timestamp: new Date().toISOString() });
    data.totalPoints += pts;
    data.lastActiveDate = today;
  }
  const { current, longest } = recomputeStreak(data.activities);
  data.currentStreak = current;
  data.longestStreak = Math.max(data.longestStreak, longest);
  saveData(data);
  return { pointsEarned: pts, newStreak: current, totalPoints: data.totalPoints };
}

export function getStreakData(): StreakData {
  const data = loadData();
  const { current, longest } = recomputeStreak(data.activities);
  return { ...data, currentStreak: current, longestStreak: Math.max(data.longestStreak, longest) };
}

export function getTodayActivities(): ActivityRecord[] {
  const today = toDateStr();
  return loadData().activities.filter((a) => a.date === today);
}

export function getTodayPoints(): number {
  return getTodayActivities().reduce((sum, a) => sum + a.points, 0);
}

export function getThisWeekPoints(): number {
  const data = loadData();
  const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString().split("T")[0];
  return data.activities.filter((a) => a.date >= cutoff).reduce((sum, a) => sum + a.points, 0);
}

export function hasDoneActivityToday(type: ActivityType): boolean {
  const today = toDateStr();
  return loadData().activities.some((a) => a.date === today && a.type === type);
}

// Seed realistic demo data so new users see a non-empty state
export function seedStreakDemoData() {
  const data = loadData();
  if (data.activities.length > 0) return; // already seeded
  const types: ActivityType[] = ["check-in", "attack-log", "daily-discovery", "medication-log"];
  const today = new Date();
  const newActivities: ActivityRecord[] = [];
  // 12 consecutive days ending yesterday
  for (let i = 12; i >= 1; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const dateStr = d.toISOString().split("T")[0];
    const dailyTypes = i % 3 === 0 ? types : types.slice(0, 2);
    dailyTypes.forEach((t) => {
      newActivities.push({ date: dateStr, type: t, points: POINTS_MAP[t], timestamp: d.toISOString() });
    });
  }
  const total = newActivities.reduce((s, a) => s + a.points, 0);
  const { current, longest } = recomputeStreak(newActivities);
  saveData({ currentStreak: current, longestStreak: longest, totalPoints: total, lastActiveDate: newActivities[newActivities.length - 1].date, activities: newActivities });
}
