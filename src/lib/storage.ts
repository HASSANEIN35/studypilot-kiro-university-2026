/**
 * localStorage persistence layer for StudyPilot
 */

import type { Task, UserSettings, AppState } from './types';

const STORAGE_KEYS = {
  TASKS: 'studypilot_tasks',
  SETTINGS: 'studypilot_settings',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  availableMinutes: 120,
};

/**
 * Load tasks from localStorage
 */
export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Failed to load tasks from localStorage');
    return [];
  }
}

/**
 * Save tasks to localStorage
 */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
    return false;
  }
}

/**
 * Load user settings from localStorage
 */
export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    if (typeof parsed?.availableMinutes !== 'number') {
      return DEFAULT_SETTINGS;
    }
    return parsed;
  } catch {
    console.warn('Failed to load settings from localStorage');
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings to localStorage
 */
export function saveSettings(settings: UserSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    return false;
  }
}

/**
 * Load entire app state from localStorage
 */
export function loadState(): AppState {
  return {
    tasks: loadTasks(),
    settings: loadSettings(),
  };
}