/**
 * Property-Based Tests for StudyPilot Scheduling Algorithm
 * 
 * These tests verify universal invariants that must hold for ANY valid input combination.
 * Each property validates a requirement from:
 * .kiro/specs/studypilot/requirements.md
 * .kiro/specs/studypilot/design.md
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateStudyPlan } from '../lib/scheduling';
import type { Task, Priority } from '../lib/types';

/**
 * Generators for property-based testing
 */

// Generate a valid priority
const priorityArbitrary = fc.oneof(
  fc.constant<Priority>('low'),
  fc.constant<Priority>('medium'),
  fc.constant<Priority>('high')
);

// Generate a valid duration (5-480 minutes)
const durationArbitrary = fc.integer({ min: 5, max: 480 });

// Generate a valid date string (today to 365 days in future)
const deadlineArbitrary = fc.integer({ min: 0, max: 365 }).map(daysFromToday => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
});

// Generate a valid task
const taskArbitrary = (id: string): fc.Arbitrary<Task> => {
  return fc
    .tuple(
      fc.stringMatching(/^[a-zA-Z0-9\s\-]{1,100}$/), // title
      fc.stringMatching(/^[a-zA-Z0-9\s]{1,50}$/),     // subject
      deadlineArbitrary,
      priorityArbitrary,
      durationArbitrary,
      fc.boolean()                                     // completed
    )
    .map(([title, subject, deadline, priority, duration, completed]) => {
      const now = new Date().toISOString();
      return {
        id,
        title: title.trim() || 'Untitled',
        subject: subject.trim() || 'General',
        deadline,
        priority,
        duration,
        completed,
        createdAt: now,
        updatedAt: now,
      };
    });
};

// Generate a non-empty array of tasks with unique IDs
const tasksArbitrary = fc
  .array(fc.uuid(), { minLength: 1, maxLength: 30 })
  .chain(uuids =>
    fc.array(
      fc.integer({ min: 0, max: uuids.length - 1 }).chain(uuidIndex =>
        taskArbitrary(uuids[uuidIndex])
      ),
      { minLength: 1, maxLength: uuids.length }
    )
  );

// Generate valid available minutes (15-720)
const availableMinutesArbitrary = fc.integer({ min: 15, max: 720 });

/**
 * PROPERTY 1: Available Time Safety (FR-016)
 * 
 * Requirement: FR-016 - "WHEN generating a study plan, THE SYSTEM SHALL never exceed
 * the user's available study minutes."
 * 
 * Property: For any valid collection of tasks and any valid available study time,
 * the total scheduled duration must never exceed the available minutes.
 */
describe('Property 1: Available Time Safety', () => {
  it('should never schedule more minutes than available (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        const plan = generateStudyPlan(tasks, availableMinutes);
        
        // Total scheduled minutes must not exceed available
        expect(plan.totalMinutes).toBeLessThanOrEqual(availableMinutes);
        
        // Verify by summing individual task durations
        const summed = plan.tasks.reduce((acc, st) => acc + st.task.duration, 0);
        expect(summed).toBeLessThanOrEqual(availableMinutes);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 2: Completed Task Exclusion (FR-014)
 * 
 * Requirement: FR-014 - "WHEN generating a study plan, THE SYSTEM SHALL exclude
 * completed tasks."
 * 
 * Property: For any valid collection of tasks, no task marked completed may appear
 * in the generated plan.
 */
describe('Property 2: Completed Task Exclusion', () => {
  it('should never include completed tasks in the plan (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        const plan = generateStudyPlan(tasks, availableMinutes);
        
        // No scheduled task should be marked completed
        for (const scheduledTask of plan.tasks) {
          expect(scheduledTask.task.completed).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 3: Uniqueness (FR-015)
 * 
 * Requirement: FR-015 - "WHEN generating a study plan, THE SYSTEM SHALL never include
 * the same task twice."
 * 
 * Property: For any generated plan, a task ID must never appear more than once.
 */
describe('Property 3: Uniqueness', () => {
  it('should never duplicate tasks in the plan (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        const plan = generateStudyPlan(tasks, availableMinutes);
        
        // Collect all task IDs in the plan
        const taskIds = plan.tasks.map(st => st.task.id);
        
        // All IDs must be unique
        const uniqueIds = new Set(taskIds);
        expect(uniqueIds.size).toBe(taskIds.length);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 4: Determinism (FR-017)
 * 
 * Requirement: FR-017 - "WHEN generating a study plan with the same input, THE SYSTEM SHALL
 * produce the same output."
 * 
 * Property: For identical task input and identical available minutes, the scheduling function
 * must always return the same result.
 */
describe('Property 4: Determinism', () => {
  it('should produce identical results for identical inputs (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        // Generate same plan multiple times
        const today = new Date();
        const plan1 = generateStudyPlan(tasks, availableMinutes, today);
        const plan2 = generateStudyPlan(tasks, availableMinutes, today);
        const plan3 = generateStudyPlan(tasks, availableMinutes, today);
        
        // All plans must have same task count
        expect(plan1.tasks).toHaveLength(plan2.tasks.length);
        expect(plan2.tasks).toHaveLength(plan3.tasks.length);
        
        // All plans must have same task IDs in same order
        const ids1 = plan1.tasks.map(st => st.task.id);
        const ids2 = plan2.tasks.map(st => st.task.id);
        const ids3 = plan3.tasks.map(st => st.task.id);
        
        expect(ids1).toEqual(ids2);
        expect(ids2).toEqual(ids3);
        
        // Total minutes must be identical
        expect(plan1.totalMinutes).toBe(plan2.totalMinutes);
        expect(plan2.totalMinutes).toBe(plan3.totalMinutes);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 5: Input Immutability
 * 
 * Requirement: Design requirement - scheduling must be a pure function
 * 
 * Property: For any valid input, calling the scheduling function must not mutate
 * the original task array or task objects.
 */
describe('Property 5: Input Immutability', () => {
  it('should not mutate input tasks or array (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        // Deep copy to compare
        const tasksCopy = JSON.parse(JSON.stringify(tasks));
        
        generateStudyPlan(tasks, availableMinutes);
        
        // Original array length should be unchanged
        expect(tasks).toHaveLength(tasksCopy.length);
        
        // Each task object should be unchanged
        for (let i = 0; i < tasks.length; i++) {
          expect(tasks[i]).toEqual(tasksCopy[i]);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 6: Deadline Ordering (FR-018)
 * 
 * Requirement: FR-018 - "WHEN scheduling tasks, THE SYSTEM SHALL rank earlier deadlines
 * higher than later deadlines when other factors are equal."
 * 
 * Property: For two otherwise equivalent incomplete tasks that both fit, the task with
 * the earlier deadline must rank before the task with the later deadline.
 */
describe('Property 6: Deadline Ordering', () => {
  it('should prioritize earlier deadlines when priority and duration equal (50+ generated cases)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 5, max: 480 }), priorityArbitrary, (duration, priority) => {
        // Create two tasks with same priority and duration but different deadlines
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const now = new Date().toISOString();
        const tasks: Task[] = [
          {
            id: 'later',
            title: 'Later Deadline',
            subject: 'Test',
            deadline: tomorrowStr,
            priority,
            duration,
            completed: false,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'earlier',
            title: 'Earlier Deadline',
            subject: 'Test',
            deadline: todayStr,
            priority,
            duration,
            completed: false,
            createdAt: now,
            updatedAt: now,
          },
        ];
        
        const plan = generateStudyPlan(tasks, 1000, today); // Large available time
        
        // Both should fit since we have enough time
        if (plan.tasks.length >= 2) {
          expect(plan.tasks[0].task.id).toBe('earlier');
          expect(plan.tasks[1].task.id).toBe('later');
        }
      }),
      { numRuns: 50 }
    );
  });
});

/**
 * PROPERTY 7: Priority Ordering (FR-019)
 * 
 * Requirement: FR-019 - "WHEN scheduling tasks, THE SYSTEM SHALL rank High priority above
 * Medium, and Medium above Low when other factors are equal."
 * 
 * Property: For two incomplete tasks with the same deadline and otherwise equivalent values,
 * High must rank before Medium and Medium before Low.
 */
describe('Property 7: Priority Ordering', () => {
  it('should prioritize high > medium > low for same deadline (50+ generated cases)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 5, max: 480 }), (duration) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const now = new Date().toISOString();
        
        const priorities: Priority[] = ['low', 'medium', 'high'];
        const tasks: Task[] = priorities.map(priority => ({
          id: `${priority}-task`,
          title: `${priority} Priority Task`,
          subject: 'Test',
          deadline: todayStr,
          priority,
          duration,
          completed: false,
          createdAt: now,
          updatedAt: now,
        }));
        
        const plan = generateStudyPlan(tasks, 1000, today); // Large available time
        
        // All three should fit
        if (plan.tasks.length >= 3) {
          expect(plan.tasks[0].task.priority).toBe('high');
          expect(plan.tasks[1].task.priority).toBe('medium');
          expect(plan.tasks[2].task.priority).toBe('low');
        }
      }),
      { numRuns: 50 }
    );
  });
});

/**
 * PROPERTY 8: Valid Output Subset (Design requirement)
 * 
 * Property: Every task returned in a plan must correspond to an input task.
 */
describe('Property 8: Valid Output Subset', () => {
  it('should only schedule tasks from the input set (100+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        const plan = generateStudyPlan(tasks, availableMinutes);
        
        // Create set of input task IDs
        const inputIds = new Set(tasks.map(t => t.id));
        
        // Every scheduled task must be in the input set
        for (const scheduledTask of plan.tasks) {
          expect(inputIds.has(scheduledTask.task.id)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * PROPERTY 9: Duration Safety
 * 
 * Property: No invalid or non-positive duration should create an invalid schedule result.
 */
describe('Property 9: Duration Safety', () => {
  it('should handle edge case durations correctly (50+ generated cases)', () => {
    fc.assert(
      fc.property(
        fc.array(durationArbitrary, { minLength: 1, maxLength: 20 }),
        availableMinutesArbitrary,
        (durations, availableMinutes) => {
          const now = new Date().toISOString();
          const todayStr = new Date().toISOString().split('T')[0];
          
          const tasks: Task[] = durations.map((duration, index) => ({
            id: `task-${index}`,
            title: 'Test',
            subject: 'Test',
            deadline: todayStr,
            priority: 'medium',
            duration,
            completed: false,
            createdAt: now,
            updatedAt: now,
          }));
          
          const plan = generateStudyPlan(tasks, availableMinutes);
          
          // Plan must be valid
          expect(plan.totalMinutes).toBeGreaterThanOrEqual(0);
          expect(plan.totalMinutes).toBeLessThanOrEqual(availableMinutes);
          
          // Each scheduled task duration must be valid
          for (const scheduled of plan.tasks) {
            expect(scheduled.task.duration).toBeGreaterThanOrEqual(5);
            expect(scheduled.task.duration).toBeLessThanOrEqual(480);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * INTEGRATION PROPERTY: No Greedy Failure
 * 
 * Property: The greedy algorithm should pack tasks effectively.
 * If a smaller task would fit in available time, it should be included
 * if later tasks were skipped that wouldn't fit.
 */
describe('Integration: Greedy Packing', () => {
  it('should find effective packing of tasks (50+ generated cases)', () => {
    fc.assert(
      fc.property(tasksArbitrary, availableMinutesArbitrary, (tasks, availableMinutes) => {
        const plan = generateStudyPlan(tasks, availableMinutes);
        
        // Verify the greedy property: remaining available time is less than
        // the duration of any unscheduled incomplete task (or plan is full)
        const scheduledIds = new Set(plan.tasks.map(st => st.task.id));
        const remaining = availableMinutes - plan.totalMinutes;
        
        const unscheduledIncomplete = tasks.filter(
          t => !t.completed && !scheduledIds.has(t.id)
        );
        
        // Either all incomplete tasks are scheduled, or remaining time is insufficient
        // for any unscheduled task
        if (unscheduledIncomplete.length > 0) {
          const minDuration = Math.min(...unscheduledIncomplete.map(t => t.duration));
          expect(remaining).toBeLessThan(minDuration);
        }
      }),
      { numRuns: 50 }
    );
  });
});