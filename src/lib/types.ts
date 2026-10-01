// Domain types for StudyPilot

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string; // ISO 8601 date (YYYY-MM-DD)
  priority: Priority;
  duration: number; // minutes, 5-480
  completed: boolean;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface ScheduledTask {
  task: Task;
  order: number;
  reason: string;
}

export interface StudyPlan {
  tasks: ScheduledTask[];
  totalMinutes: number;
  availableMinutes: number;
  generatedAt: string;
}

export interface UserSettings {
  availableMinutes: number; // 15-720, default 120
}

export interface AppState {
  tasks: Task[];
  settings: UserSettings;
}

export interface TaskFormData {
  title: string;
  subject: string;
  deadline: string;
  priority: Priority;
  duration: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface Progress {
  completed: number;
  total: number;
  percentage: number;
}

export type TabType = 'today' | 'upcoming' | 'completed' | 'plan';