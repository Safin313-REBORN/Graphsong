export interface AppSettings {
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  minFreq: number;
  maxFreq: number;
  durationSec: number;
  zeroClick: boolean;
  stereoPan: boolean;
  speakDescriptions: boolean;
  noticeDismissed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  highContrast: false,
  darkMode: false,
  reducedMotion: false,
  minFreq: 200,
  maxFreq: 1000,
  durationSec: 4,
  zeroClick: true,
  stereoPan: true,
  speakDescriptions: true,
  noticeDismissed: false,
};

const SETTINGS_KEY = 'graphsong:settings:v1';
const LESSON_PROGRESS_KEY = 'graphsong:lessons:v1';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      minFreq: clampNum(parsed.minFreq, 80, 600, DEFAULT_SETTINGS.minFreq),
      maxFreq: clampNum(parsed.maxFreq, 400, 2400, DEFAULT_SETTINGS.maxFreq),
      durationSec: clampNum(parsed.durationSec, 1.5, 12, DEFAULT_SETTINGS.durationSec),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCompletedLessons(): string[] {
  try {
    const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveCompletedLessons(ids: string[]): void {
  try {
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetAllStorage(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(LESSON_PROGRESS_KEY);
  } catch {
    // Ignore
  }
}

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.min(max, Math.max(min, val));
}
