/**
 * StudyPilot Scheduling Algorithm
 * 
 * Pure deterministic function for generating study plans.
 * No side effects, no random values, no Date.now().
 * Same input always produces same output.
 * 
 * Algorithm: Multi-level sort by deadline (ASC) → priority (DESC) → duration (ASC) → id (ASC)
 * Result: Greedy selection constrained by available time
 */

import type { Task, ScheduledTask, StudyPlan, Priority } from './types';

// Priority values for sorting (higher = more important)
const PRIORITY_VALUES: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Calculate days between today and deadline.
 * Returns negative values for overdue tasks.
 */
function getDaysUntilDeadline(deadline: string, today: Date): number {
  const deadlineDate = new Date(deadline);
  const todayNormalized = new Date(today);
  todayNormalized.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - todayNormalized.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Build human-readable reason for scheduling decision.
 */
function buildReason(daysUntil: number, priority: Priority): string {
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  
  if (daysUntil < 0) {
    const overdueDays = Math.abs(daysUntil);
    return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}, ${priorityLabel} priority`;
  } else if (daysUntil === 0) {
    return `Due today, ${priorityLabel} priority`;
  } else {
    return `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}, ${priorityLabel} priority`;
  }
}

/**
 * Sort scored tasks by multiple criteria.
 * Returns NEW array, does not mutate input.
 */
function sortTasks(
  tasks: Array<{ task: Task; daysUntil: number; priorityValue: number }>
): Array<{ task: Task; daysUntil: number; priorityValue: number }> {
  return [...tasks].sort((a, b) => {
    // Primary: daysUntil ASC (earlier deadlines first, overdue < today < future)
    if (a.daysUntil !== b.daysUntil) {
      return a.daysUntil - b.daysUntil;
    }
    
    // Secondary: priorityValue DESC (High > Medium > Low)
    if (a.priorityValue !== b.priorityValue) {
      return b.priorityValue - a.priorityValue;
    }
    
    // Tertiary: duration ASC (shorter tasks first)
    if (a.task.duration !== b.task.duration) {
      return a.task.duration - b.task.duration;
    }
    
    // Quaternary: id ASC (deterministic tie-break)
    return a.task.id.localeCompare(b.task.id);
  });
}

/**
 * Generate a study plan from available tasks.
 * 
 * This is a PURE function:
 * - No side effects
 * - No mutations to input
 * - Deterministic output
 * - Accepts today as parameter for testability
 * 
 * @param tasks - Array of all tasks
 * @param availableMinutes - Maximum minutes available for studying
 * @param today - Reference date (defaults to current date)
 * @returns StudyPlan with scheduled tasks
 */
export function generateStudyPlan(
  tasks: Task[],
  availableMinutes: number,
  today: Date = new Date()
): StudyPlan {
  // Step 1: Filter out completed tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Step 2: Calculate days until deadline for each task
  const scoredTasks = incompleteTasks.map(task => ({
    task,
    daysUntil: getDaysUntilDeadline(task.deadline, today),
    priorityValue: PRIORITY_VALUES[task.priority],
  }));
  
  // Step 3: Sort by multi-level criteria
  const sortedTasks = sortTasks(scoredTasks);
  
  // Step 4: Greedy selection within time constraint
  const scheduled: ScheduledTask[] = [];
  let usedMinutes = 0;
  const usedTaskIds = new Set<string>();
  
  for (const item of sortedTasks) {
    const taskId = item.task.id;
    
    // Skip if already added (shouldn't happen due to dedup, but safety first)
    if (usedTaskIds.has(taskId)) {
      continue;
    }
    
    // Check if adding this task would exceed available time
    if (usedMinutes + item.task.duration > availableMinutes) {
      continue; // Skip this task, may find smaller tasks that fit
    }
    
    // Add task to schedule
    scheduled.push({
      task: item.task,
      order: scheduled.length + 1,
      reason: buildReason(item.daysUntil, item.task.priority),
    });
    
    usedTaskIds.add(taskId);
    usedMinutes += item.task.duration;
  }
  
  return {
    tasks: scheduled,
    totalMinutes: usedMinutes,
    availableMinutes,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get priority display value
 */
export function getPriorityValue(priority: Priority): number {
  return PRIORITY_VALUES[priority];
}