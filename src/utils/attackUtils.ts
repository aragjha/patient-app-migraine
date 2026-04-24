import { HeadacheLog } from "@/types/logs";

export function hasAttackToday(logs: HeadacheLog[]): boolean {
  const today = new Date().toDateString();
  return logs.some((l) => new Date(l.startTime).toDateString() === today);
}

export function timingToStartTime(timingId: string): string {
  const now = new Date();
  switch (timingId) {
    case "1h_ago":
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case "2h_ago":
      return new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    case "this_morning": {
      const m = new Date(now);
      m.setHours(7, 0, 0, 0);
      return m.toISOString();
    }
    default:
      return now.toISOString();
  }
}
