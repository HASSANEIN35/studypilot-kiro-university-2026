/**
 * Unit tests for StudyPilot Scheduling Algorithm
 */

import { describe, it, expect } from 'vitest';
import { generateStudyPlan } from '../lib/scheduling';
import type { Task } from '../lib/types';

function createTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    title: 'Test Task',
    subject: 'Test Subject',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'medium',
    duration: 60,
    completed: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function toDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
}

describe('Scheduling Algorithm', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  describe('generateStudyPlan', () => {
    it('should exclude completed tasks', () => {
      const tasks: Task[] = [
        createTask({ id: '1', completed: true, deadline: toDate(-1) }),
        createTask({ id: '2', completed: false, deadline: toDate(0) }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].task.id).toBe('2');
    });

    it('should sort by deadline ascending (earlier first)', () => {
      const tasks: Task[] = [
        createTask({ id: 'task3', deadline: toDate(3), priority: 'low', duration: 30 }),
        createTask({ id: 'task1', deadline: toDate(1), priority: 'low', duration: 30 }),
        createTask({ id: 'task2', deadline: toDate(2), priority: 'low', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks).toHaveLength(3);
      expect(plan.tasks[0].task.id).toBe('task1');
      expect(plan.tasks[1].task.id).toBe('task2');
      expect(plan.tasks[2].task.id).toBe('task3');
    });

    it('should sort overdue tasks before today tasks', () => {
      const tasks: Task[] = [
        createTask({ id: 'today', deadline: toDate(0), priority: 'low', duration: 30 }),
        createTask({ id: 'overdue', deadline: toDate(-1), priority: 'low', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].task.id).toBe('overdue');
      expect(plan.tasks[1].task.id).toBe('today');
    });

    it('should sort by priority descending (high > medium > low) when deadlines equal', () => {
      const tasks: Task[] = [
        createTask({ id: 'low', deadline: toDate(1), priority: 'low', duration: 30 }),
        createTask({ id: 'high', deadline: toDate(1), priority: 'high', duration: 30 }),
        createTask({ id: 'medium', deadline: toDate(1), priority: 'medium', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].task.id).toBe('high');
      expect(plan.tasks[1].task.id).toBe('medium');
      expect(plan.tasks[2].task.id).toBe('low');
    });

    it('should sort by duration ascending when deadline and priority equal', () => {
      const tasks: Task[] = [
        createTask({ id: 'long', deadline: toDate(1), priority: 'medium', duration: 90 }),
        createTask({ id: 'short', deadline: toDate(1), priority: 'medium', duration: 30 }),
        createTask({ id: 'medium', deadline: toDate(1), priority: 'medium', duration: 60 }),
      ];
      
      const plan = generateStudyPlan(tasks, 200, today);
      
      expect(plan.tasks[0].task.id).toBe('short');
      expect(plan.tasks[1].task.id).toBe('medium');
      expect(plan.tasks[2].task.id).toBe('long');
    });

    it('should use ID for deterministic tie-breaking', () => {
      const tasks: Task[] = [
        createTask({ id: 'aaa', deadline: toDate(1), priority: 'low', duration: 30 }),
        createTask({ id: 'ccc', deadline: toDate(1), priority: 'low', duration: 30 }),
        createTask({ id: 'bbb', deadline: toDate(1), priority: 'low', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].task.id).toBe('aaa');
      expect(plan.tasks[1].task.id).toBe('bbb');
      expect(plan.tasks[2].task.id).toBe('ccc');
    });

    it('should never exceed available minutes', () => {
      const tasks: Task[] = [
        createTask({ id: 'big', duration: 100 }),
        createTask({ id: 'small', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 60, today);
      
      expect(plan.totalMinutes).toBeLessThanOrEqual(60);
    });

    it('should not duplicate tasks', () => {
      const tasks: Task[] = [
        createTask({ id: 'task1', duration: 30 }),
        createTask({ id: 'task2', duration: 30 }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      const ids = plan.tasks.map(t => t.task.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should be deterministic - same input yields same output', () => {
      const tasks: Task[] = [
        createTask({ id: 'a', deadline: toDate(2), priority: 'medium', duration: 45 }),
        createTask({ id: 'b', deadline: toDate(1), priority: 'high', duration: 30 }),
        createTask({ id: 'c', deadline: toDate(3), priority: 'low', duration: 60 }),
      ];
      
      const plan1 = generateStudyPlan(tasks, 120, today);
      const plan2 = generateStudyPlan(tasks, 120, today);
      
      expect(plan1.tasks.map(t => t.task.id)).toEqual(plan2.tasks.map(t => t.task.id));
      expect(plan1.totalMinutes).toBe(plan2.totalMinutes);
    });

    it('should skip tasks that do not fit and find ones that do', () => {
      const tasks: Task[] = [
        createTask({ id: 'big1', duration: 80 }),
        createTask({ id: 'small', duration: 20 }),
        createTask({ id: 'big2', duration: 80 }),
      ];
      
      const plan = generateStudyPlan(tasks, 60, today);
      
      // Should only fit the small task
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].task.id).toBe('small');
      expect(plan.totalMinutes).toBe(20);
    });

    it('should not mutate input array', () => {
      const tasks: Task[] = [
        createTask({ id: '1', completed: false }),
      ];
      const originalLength = tasks.length;
      
      generateStudyPlan(tasks, 120, today);
      
      expect(tasks.length).toBe(originalLength);
      expect(tasks[0].completed).toBe(false);
    });

    it('should handle empty task list', () => {
      const plan = generateStudyPlan([], 120, today);
      
      expect(plan.tasks).toHaveLength(0);
      expect(plan.totalMinutes).toBe(0);
    });

    it('should handle all tasks completed', () => {
      const tasks: Task[] = [
        createTask({ completed: true }),
        createTask({ completed: true }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks).toHaveLength(0);
    });

    it('should generate correct reason for overdue tasks', () => {
      const tasks: Task[] = [
        createTask({ id: 'overdue', deadline: toDate(-2), priority: 'high' }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].reason).toContain('Overdue by 2 days');
      expect(plan.tasks[0].reason).toContain('High priority');
    });

    it('should generate correct reason for today tasks', () => {
      const tasks: Task[] = [
        createTask({ id: 'today', deadline: toDate(0), priority: 'medium' }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].reason).toBe('Due today, Medium priority');
    });

    it('should generate correct reason for future tasks', () => {
      const tasks: Task[] = [
        createTask({ id: 'future', deadline: toDate(5), priority: 'low' }),
      ];
      
      const plan = generateStudyPlan(tasks, 120, today);
      
      expect(plan.tasks[0].reason).toContain('Due in 5 days');
      expect(plan.tasks[0].reason).toContain('Low priority');
    });
  });
});