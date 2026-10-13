export function parseTimeToMinutes(time24: string): number {
  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hours * 60 + minutes;
}

export function calculateSleepDuration(bedtime24: string, wakeTime24: string): number {
  const bedMinutes = parseTimeToMinutes(bedtime24);
  const wakeMinutes = parseTimeToMinutes(wakeTime24);

  if (wakeMinutes >= bedMinutes) {
    return wakeMinutes - bedMinutes;
  }
  // Crosses midnight (e.g., 23:00 to 07:00)
  return 24 * 60 - bedMinutes + wakeMinutes;
}

export function formatDurationCompact(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hrs}h`;
  }
  return `${hrs}h ${mins}m`;
}

export function formatDurationVerbose(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) {
    return `${mins} mins`;
  }
  if (mins === 0) {
    return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  }
  return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins} mins`;
}

export function format24To12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;

  const paddedH = h < 10 ? `0${h}` : `${h}`;
  const paddedM = m < 10 ? `0${m}` : `${m}`;
  return `${paddedH}:${paddedM} ${period}`;
}

export function formatPartsTo24(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let h24 = hour12 % 12;
  if (period === 'PM') {
    h24 += 12;
  }
  const paddedH = h24 < 10 ? `0${h24}` : `${h24}`;
  const paddedM = minute < 10 ? `0${minute}` : `${minute}`;
  return `${paddedH}:${paddedM}`;
}

export function parse24ToParts(time24: string): { hour12: number; minute: number; period: 'AM' | 'PM' } {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return { hour12: h, minute: m, period };
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeDayTag(dateStr: string): string {
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return 'Today';

  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) return 'Yesterday';

  return formatDateLabel(dateStr);
}

export function getLast7DaysRolling(): { dayLabel: string; dateStr: string }[] {
  const result: { dayLabel: string; dateStr: string }[] = [];
  const now = new Date();

  // 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const target = new Date(now);
    target.setDate(now.getDate() - i);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayLabel = target.toLocaleDateString('en-US', { weekday: 'short' });
    result.push({ dayLabel, dateStr });
  }

  return result;
}
