/**
 * Form validation utilities for StudyPilot
 */

import type { TaskFormData, ValidationError } from './types';

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validate task title
 */
export function validateTitle(title: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = title.trim();
  
  if (!trimmed) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (trimmed.length > 100) {
    errors.push({ field: 'title', message: 'Title must be 100 characters or less' });
  }
  
  return errors;
}

/**
 * Validate subject
 */
export function validateSubject(subject: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = subject.trim();
  
  if (!trimmed) {
    errors.push({ field: 'subject', message: 'Subject is required' });
  } else if (trimmed.length > 50) {
    errors.push({ field: 'subject', message: 'Subject must be 50 characters or less' });
  }
  
  return errors;
}

/**
 * Validate deadline
 */
export function validateDeadline(deadline: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!deadline) {
    errors.push({ field: 'deadline', message: 'Deadline is required' });
    return errors;
  }
  
  const today = getTodayDateString();
  if (deadline < today) {
    errors.push({ field: 'deadline', message: 'Deadline must be today or later' });
  }
  
  return errors;
}

/**
 * Validate priority
 */
export function validatePriority(priority: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const validPriorities = ['low', 'medium', 'high'];
  
  if (!priority || !validPriorities.includes(priority)) {
    errors.push({ field: 'priority', message: 'Please select a priority' });
  }
  
  return errors;
}

/**
 * Validate duration
 */
export function validateDuration(duration: number | string): ValidationError[] {
  const errors: ValidationError[] = [];
  const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  
  if (isNaN(durationNum)) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  } else if (durationNum < 5 || durationNum > 480) {
    errors.push({ field: 'duration', message: 'Duration must be between 5 and 480 minutes' });
  }
  
  return errors;
}

/**
 * Validate all task fields
 */
export function validateTask(data: TaskFormData): ValidationError[] {
  const errors: ValidationError[] = [
    ...validateTitle(data.title),
    ...validateSubject(data.subject),
    ...validateDeadline(data.deadline),
    ...validatePriority(data.priority),
    ...validateDuration(data.duration),
  ];
  
  return errors;
}

/**
 * Validate available study minutes
 */
export function validateAvailableMinutes(minutes: number | string): ValidationError[] {
  const errors: ValidationError[] = [];
  const minutesNum = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
  
  if (isNaN(minutesNum)) {
    errors.push({ field: 'availableMinutes', message: 'Must be a valid number' });
  } else if (minutesNum < 15 || minutesNum > 720) {
    errors.push({ field: 'availableMinutes', message: 'Must be between 15 and 720 minutes' });
  }
  
  return errors;
}

/**
 * Check if form data is valid
 */
export function isValidTask(data: TaskFormData): boolean {
  return validateTask(data).length === 0;
}