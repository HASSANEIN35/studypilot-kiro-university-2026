# StudyPilot - Requirements

**Project:** StudyPilot  
**Version:** 1.0  
**Status:** Approved for Implementation  
**Generated:** 2026-09-26

---

## 1. Overview

StudyPilot is a smart study planner that helps students organize study tasks and generate optimized daily study plans based on deadline, priority, and available time.

---

## 2. User Stories

### 2.1 Task Management

| ID | Story |
|----|-------|
| US-001 | As a student, I want to create study tasks so that I can track what I need to study. |
| US-002 | As a student, I want to edit existing tasks so that I can update information when plans change. |
| US-003 | As a student, I want to delete tasks so that I can remove tasks that are no longer relevant. |
| US-004 | As a student, I want to mark tasks as completed so that I can track my progress. |

### 2.2 Study Planning

| ID | Story |
|----|-------|
| US-005 | As a student, I want to set my available study minutes so that the system knows my time constraint. |
| US-006 | As a student, I want to generate a study plan so that I know which tasks to study today. |
| US-007 | As a student, I want my study plan to fit within my available time so that I can complete it. |

### 2.3 Data & Views

| ID | Story |
|----|-------|
| US-008 | As a student, I want my tasks to persist across browser sessions so that I don't lose data. |
| US-009 | As a student, I want to view tasks by category (Today/Upcoming/Completed) so that I can focus on what matters. |
| US-010 | As a student, I want to see my overall progress so that I stay motivated. |

---

## 3. Functional Requirements

### 3.1 Task Creation

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-001 | **WHEN** a user enters a task title, subject, deadline, priority, and duration, **THE SYSTEM SHALL** create a new task. | AC-001: Task appears in task list after creation. |
| FR-002 | **WHEN** a user creates a task with missing required fields, **THE SYSTEM SHALL** display validation errors. | AC-002: Each invalid field shows an appropriate error message. |

### 3.2 Task Fields

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-003 | **WHEN** creating a task, **THE SYSTEM SHALL** require a title (1-100 characters). | AC-003: Title is required; longer than 100 chars shows error. |
| FR-004 | **WHEN** creating a task, **THE SYSTEM SHALL** require a subject (1-50 characters). | AC-004: Subject is required; longer than 50 chars shows error. |
| FR-005 | **WHEN** creating a task, **THE SYSTEM SHALL** require a deadline that is today or a future date. | AC-006: Past dates show "Deadline must be today or later". |
| FR-006 | **WHEN** creating a task, **THE SYSTEM SHALL** require a priority of Low, Medium, or High. | AC-007: Default selection shown; must choose one. |
| FR-007 | **WHEN** creating a task, **THE SYSTEM SHALL** require a duration between 5 and 480 minutes. | AC-008: Values outside range show appropriate error. |

### 3.3 Task Editing and Deletion

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-008 | **WHEN** a user clicks edit on a task, **THE SYSTEM SHALL** populate the form with that task's data. | AC-009: Form shows existing values; changes save correctly. |
| FR-009 | **WHEN** a user clicks delete on a task, **THE SYSTEM SHALL** remove the task after confirmation. | AC-010: Task is removed from all views after deletion. |

### 3.4 Task Completion

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-010 | **WHEN** a user marks a task as completed, **THE SYSTEM SHALL** update the task's completed status. | AC-011: Task moves to Completed view; checkbox shows checked state. |

### 3.5 Study Time Setting

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-011 | **WHEN** a user enters available study minutes, **THE SYSTEM SHALL** store the value (15-720 range). | AC-012: Setting persists after page refresh. |
| FR-012 | **WHEN** a user enters invalid minutes, **THE SYSTEM SHALL** show a validation error. | AC-013: Values outside 15-720 show error message. |

### 3.6 Study Plan Generation

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-013 | **WHEN** a user requests a study plan, **THE SYSTEM SHALL** generate a list of tasks to study today. | AC-014: Plan displays within 1 second of request. |
| FR-014 | **WHEN** generating a study plan, **THE SYSTEM SHALL** exclude completed tasks. | AC-015: No completed tasks appear in the plan. |
| FR-015 | **WHEN** generating a study plan, **THE SYSTEM SHALL** never include the same task twice. | AC-016: Each task ID appears exactly once in the plan. |
| FR-016 | **WHEN** generating a study plan, **THE SYSTEM SHALL** never exceed the user's available study minutes. | AC-017: Sum of scheduled durations ≤ available minutes. |
| FR-017 | **WHEN** generating a study plan with the same input, **THE SYSTEM SHALL** produce the same output. | AC-018: Multiple calls with identical tasks and available minutes yield identical plans. |

### 3.7 Scheduling Algorithm

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-018 | **WHEN** scheduling tasks, **THE SYSTEM SHALL** rank earlier deadlines higher than later deadlines when other factors are equal. | AC-019: Two tasks with same priority and similar duration, the one with earlier deadline appears first. |
| FR-019 | **WHEN** scheduling tasks, **THE SYSTEM SHALL** rank High priority above Medium, and Medium above Low when other factors are equal. | AC-020: Task with High priority appears before Medium; Medium before Low. |
| FR-020 | **WHEN** scheduling tasks, **THE SYSTEM SHALL** handle overdue tasks by ranking them highest. | AC-021: Overdue tasks appear before tasks due today; today's tasks appear before future tasks. |

### 3.8 Task Views

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-021 | **WHEN** a user views "Today", **THE SYSTEM SHALL** show tasks due today or overdue. | AC-022: View shows only tasks with deadline ≤ today that are not completed. |
| FR-022 | **WHEN** a user views "Upcoming", **THE SYSTEM SHALL** show incomplete tasks due in the future. | AC-023: View shows only tasks with deadline > today and not completed. |
| FR-023 | **WHEN** a user views "Completed", **THE SYSTEM SHALL** show all completed tasks. | AC-024: View shows only tasks with completed=true. |

### 3.9 Progress Display

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-024 | **WHEN** displaying progress, **THE SYSTEM SHALL** show "X of Y tasks completed". | AC-025: Progress badge shows accurate count and percentage. |

### 3.10 Persistence

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-025 | **WHEN** a task is created, edited, deleted, or completed, **THE SYSTEM SHALL** persist the change to localStorage. | AC-026: Changes survive browser refresh. |
| FR-026 | **WHEN** available minutes change, **THE SYSTEM SHALL** persist the setting to localStorage. | AC-027: Setting survives browser refresh. |
| FR-027 | **WHEN** the app loads, **THE SYSTEM SHALL** load tasks and settings from localStorage. | AC-028: Previous data appears on page load. |

---

## 4. Non-Functional Requirements

### 4.1 Empty States

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-001 | **WHEN** there are no tasks, **THE SYSTEM SHALL** show "No tasks yet. Add your first study task!" | AC-029: Message displays in main view when task list is empty. |
| NFR-002 | **WHEN** there are no tasks due today, **THE SYSTEM SHALL** show "No tasks due today. Enjoy your free time!" | AC-030: Message displays in Today view when empty. |
| NFR-003 | **WHEN** there are no completed tasks, **THE SYSTEM SHALL** show "No completed tasks yet. Keep studying!" | AC-031: Message displays in Completed view when empty. |
| NFR-004 | **WHEN** no tasks fit in available time, **THE SYSTEM SHALL** show "No tasks fit in your study time." | AC-032: Message displays in Study Plan when empty. |

### 4.2 Accessibility

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-005 | **WHEN** using a screen reader, **THE SYSTEM SHALL** have proper ARIA labels on all interactive elements. | AC-033: All buttons, inputs, and controls have accessible names. |
| NFR-006 | **WHEN** navigating with keyboard, **THE SYSTEM SHALL** allow full operation without a mouse. | AC-034: Tab order is logical; all functions accessible via keyboard. |

### 4.3 Responsive Design

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-007 | **WHEN** viewing on mobile (under 640px), **THE SYSTEM SHALL** display a single-column layout. | AC-035: Content stacks vertically; no horizontal scroll. |
| NFR-008 | **WHEN** viewing on tablet (640-1024px), **THE SYSTEM SHALL** adapt to two-column where appropriate. | AC-036: Layout adapts without breaking. |
| NFR-009 | **WHEN** viewing on desktop (over 1024px), **THE SYSTEM SHALL** display a full dashboard layout. | AC-037: Multi-column layout with proper spacing. |

---

## 5. Out of Scope

The following are explicitly NOT part of this version:

- User authentication
- Backend services or cloud APIs
- Real-time sync across devices
- Multiple study sessions per day
- Recurring tasks
- Notifications or reminders
- Export/import functionality
- Pomodoro timer
- Analytics or statistics
- Dark mode
- Task categories or tags beyond subject

---

## 6. Acceptance Criteria Summary

| ID | Category | Description |
|----|----------|-------------|
| AC-001 | Task Creation | Task appears in list after creation |
| AC-002 | Validation | Invalid fields show error messages |
| AC-003 | Title | Required, 1-100 characters |
| AC-004 | Subject | Required, 1-50 characters |
| AC-005 | Deadline | Required, today or future |
| AC-006 | Deadline | Past dates show error |
| AC-007 | Priority | Required, must select |
| AC-008 | Duration | Required, 5-480 minutes |
| AC-009 | Edit | Form populates with existing data |
| AC-010 | Delete | Task removed after confirmation |
| AC-011 | Completion | Task moves to Completed view |
| AC-012 | Settings | Minutes persist after refresh |
| AC-013 | Settings | Invalid values show error |
| AC-014 | Plan | Displays within 1 second |
| AC-015 | Plan | Excludes completed tasks |
| AC-016 | Plan | No duplicate tasks |
| AC-017 | Plan | Never exceeds available time |
| AC-018 | Plan | Deterministic output |
| AC-019 | Scheduling | Earlier deadline ranks higher |
| AC-020 | Scheduling | Priority ranking (H > M > L) |
| AC-021 | Scheduling | Overdue tasks handled explicitly |
| AC-022 | Today View | Shows due today or overdue |
| AC-023 | Upcoming View | Shows future incomplete |
| AC-024 | Completed View | Shows completed tasks |
| AC-025 | Progress | Shows accurate count/percentage |
| AC-026 | Persistence | Task changes persist |
| AC-027 | Persistence | Settings persist |
| AC-028 | Persistence | Data loads on refresh |
| AC-029 | Empty State | No tasks message |
| AC-030 | Empty State | No tasks due today message |
| AC-031 | Empty State | No completed tasks message |
| AC-032 | Empty State | No fitting tasks message |
| AC-033 | Accessibility | ARIA labels present |
| AC-034 | Accessibility | Keyboard navigable |
| AC-035 | Responsive | Mobile layout works |
| AC-036 | Responsive | Tablet layout works |
| AC-037 | Responsive | Desktop layout works |