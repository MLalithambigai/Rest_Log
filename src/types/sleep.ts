export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface SleepEntry {
  id: string;
  date: string; // ISO date string 'YYYY-MM-DD' representing the session night
  bedtime: string; // 24h format 'HH:mm'
  wakeTime: string; // 24h format 'HH:mm'
  durationMinutes: number;
  quality: SleepQuality;
  note: string;
  tags?: string[];
  createdAt: number;
}

export interface DaySleepPoint {
  dayLabel: string; // 'Mon', 'Tue', etc.
  dateStr: string; // 'YYYY-MM-DD'
  durationMinutes: number;
  durationHours: number;
  quality: SleepQuality | null;
  hasEntry: boolean;
}

export interface WeeklyInsightSummary {
  averageDurationMinutes: number;
  averageQuality: number;
  totalEntries: number;
  targetMetCount: number;
  bestDayLabel: string;
  sleepDebtHours: number;
}
