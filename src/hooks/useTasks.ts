/**
 * useTasks - React hook for StudyPilot state management
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskFormData, UserSettings, StudyPlan, Progress, TabType } from '../lib/types';
import { generateStudyPlan } from '../lib/scheduling';
import { loadState, saveTasks, saveSettings } from '../lib/storage';

export function useTasks() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ availableMinutes: 120 });
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    const state = loadState();
    setTasks(state.tasks);
    setSettings(state.settings);
    setIsLoaded(true);
  }, []);

  // Derived state: tasks due today or overdue
  const todayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (task.completed) return false;
      return task.deadline <= todayStr;
    }).sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tasks]);

  // Derived state: future incomplete tasks
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (task.completed) return false;
      return task.deadline > todayStr;
    }).sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tasks]);

  // Derived state: completed tasks
  const completedTasks = useMemo(() => {
    return tasks
      .filter(task => task.completed)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tasks]);

  // Derived state: progress
  const progress = useMemo((): Progress => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [tasks]);

  // Action: Add task
  const addTask = useCallback((data: TaskFormData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: data.title.trim(),
      subject: data.subject.trim(),
      deadline: data.deadline,
      priority: data.priority,
      duration: data.duration,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks(prev => {
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Action: Update task
  const updateTask = useCallback((id: string, data: TaskFormData) => {
    const now = new Date().toISOString();
    
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            title: data.title.trim(),
            subject: data.subject.trim(),
            deadline: data.deadline,
            priority: data.priority,
            duration: data.duration,
            updatedAt: now,
          };
        }
        return task;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Action: Delete task
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter(task => task.id !== id);
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Action: Toggle completion
  const toggleCompletion = useCallback((id: string) => {
    const now = new Date().toISOString();
    
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            completed: !task.completed,
            updatedAt: now,
          };
        }
        return task;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Action: Set available minutes
  const setAvailableMinutes = useCallback((minutes: number) => {
    const newSettings = { availableMinutes: minutes };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Action: Generate study plan
  const generatePlan = useCallback(() => {
    const plan = generateStudyPlan(tasks, settings.availableMinutes);
    setStudyPlan(plan);
  }, [tasks, settings.availableMinutes]);

  // Action: Clear study plan
  const clearPlan = useCallback(() => {
    setStudyPlan(null);
  }, []);

  return {
    // State
    tasks,
    settings,
    studyPlan,
    activeTab,
    isLoaded,
    
    // Derived state
    todayTasks,
    upcomingTasks,
    completedTasks,
    progress,
    
    // Actions
    addTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    setAvailableMinutes,
    generatePlan,
    clearPlan,
    setActiveTab,
  };
}

export type UseTasksReturn = ReturnType<typeof useTasks>;