import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types/sleep';
import { calculateSleepDuration } from '../utils/time';

const STORAGE_KEY = '@restlog_entries_v1';

export async function fetchSleepEntries(): Promise<SleepEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SleepEntry[] = JSON.parse(raw);
    // Sort descending by date, then createdAt
    return parsed.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error('Failed to load sleep entries from storage:', error);
    return [];
  }
}

export async function saveSleepEntry(
  entryData: Omit<SleepEntry, 'id' | 'createdAt' | 'durationMinutes'>
): Promise<SleepEntry> {
  const durationMinutes = calculateSleepDuration(entryData.bedtime, entryData.wakeTime);
  const newEntry: SleepEntry = {
    ...entryData,
    id: `rest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    durationMinutes,
    createdAt: Date.now(),
  };

  const current = await fetchSleepEntries();
  const updated = [newEntry, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newEntry;
}

export async function deleteSleepEntry(id: string): Promise<void> {
  const current = await fetchSleepEntries();
  const filtered = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearAllSleepEntries(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function seedDemoWeek(): Promise<SleepEntry[]> {
  const now = new Date();
  const demoDays: Array<{
    daysAgo: number;
    bed: string;
    wake: string;
    quality: 1 | 2 | 3 | 4 | 5;
    note: string;
    tags: string[];
  }> = [
    {
      daysAgo: 6,
      bed: '23:15',
      wake: '07:10',
      quality: 4,
      note: 'Read 25 mins of fiction. Felt calm and woke naturally before alarm.',
      tags: ['Reading', 'Wind-down'],
    },
    {
      daysAgo: 5,
      bed: '23:45',
      wake: '06:45',
      quality: 3,
      note: 'Slightly restless around 4 AM due to room heat. Needed morning espresso.',
      tags: ['Warm room'],
    },
    {
      daysAgo: 4,
      bed: '00:20',
      wake: '06:30',
      quality: 2,
      note: 'Late work session on laptop. Screen glare delayed sleep onset.',
      tags: ['Screen time', 'Late work'],
    },
    {
      daysAgo: 3,
      bed: '22:50',
      wake: '07:20',
      quality: 5,
      note: 'Evening magnesium tea and 19°C thermostat. Deep unbroken recovery.',
      tags: ['Chamomile tea', 'Cool room'],
    },
    {
      daysAgo: 2,
      bed: '23:30',
      wake: '07:45',
      quality: 4,
      note: 'Post-gym tiredness helped fall asleep in minutes. Woke up energized.',
      tags: ['Workout'],
    },
    {
      daysAgo: 1,
      bed: '01:00',
      wake: '08:30',
      quality: 3,
      note: 'Weekend dinner with friends. Good total sleep duration though slightly shifted rhythm.',
      tags: ['Social evening'],
    },
  ];

  const generatedEntries: SleepEntry[] = demoDays.map((item, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - item.daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const duration = calculateSleepDuration(item.bed, item.wake);

    return {
      id: `demo_${Date.now()}_${idx}`,
      date: dateStr,
      bedtime: item.bed,
      wakeTime: item.wake,
      durationMinutes: duration,
      quality: item.quality,
      note: item.note,
      tags: item.tags,
      createdAt: d.getTime(),
    };
  });

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(generatedEntries));
  return generatedEntries;
}
