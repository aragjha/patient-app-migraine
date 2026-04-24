export interface HeadacheLog {
  id: string;
  startTime: string;       // ISO string
  endTime?: string;
  duration?: number;       // minutes
  zones: string[];
  painPeak: number;        // 0-10
  painEnd?: number;
  symptoms: string[];
  triggers: string[];
  medications: string[];
  reliefEffectiveness?: number;
  lingeringSymptoms?: string[];
  notes?: string;
  status: "active" | "ended";
}

export interface CheckInLog {
  id: string;
  date: string;            // YYYY-MM-DD
  feeling: number;         // overall slider 0-10
  hadHeadache: boolean;
  headacheSeverity?: string;
  sleepQuality?: string;
  medicationTaken?: string;
  mood?: string;
  disability?: number;     // 0-3 MIDAS
  painLocations?: string[];
  symptoms?: string[];
  triggers?: string[];
}
