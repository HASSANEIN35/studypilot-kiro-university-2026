---
inclusion: auto
name: StudyPilot Project
description: Smart study planner for students
---

# StudyPilot Project Steering

## Project Overview

**Name:** StudyPilot  
**Purpose:** A small, reliable smart study planner for students  
**Demo Target:** 30-second to 3-minute challenge demo video

## Technology Stack

- **Frontend:** React 18+
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite
- **Storage:** Browser localStorage
- **No:** Backend, authentication, Firebase, Supabase, external database, paid APIs

## Repository Structure

```
StudyPilot/
├── .kiro/
│   ├── specs/studypilot/       # Feature Spec (Requirements, Design, Tasks)
│   └── steering/               # This file
├── src/
│   ├── components/             # UI Layer (React components)
│   │   ├── App/                # Main app container
│   │   ├── Layout/             # Header, TabNavigation
│   │   ├── TaskForm/           # Create/Edit task form
│   │   ├── TaskList/           # Task list and items
│   │   ├── StudyPlan/          # Generated study plan display
│   │   └── Settings/           # Study time setter
│   ├── hooks/                  # State management
│   │   └── useTasks.ts         # Task CRUD, settings, derived state
│   ├── lib/                    # Core domain logic
│   │   ├── types.ts            # TypeScript interfaces (domain types)
│   │   ├── scheduling.ts       # Pure deterministic scheduling algorithm
│   │   ├── storage.ts          # localStorage read/write operations
│   │   └── validation.ts       # Form validation utilities
│   ├── __tests__/              # Unit tests
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Directory Ownership

| Directory | Responsibility |
|-----------|----------------|
| `src/components/` | UI - React components, views, user interactions |
| `src/lib/types.ts` | Domain types - All TypeScript interfaces |
| `src/lib/scheduling.ts` | Scheduling - Pure function for task prioritization |
| `src/lib/storage.ts` | Persistence - localStorage operations |
| `src/lib/validation.ts` | Validation - Form input validation |
| `src/hooks/useTasks.ts` | State - React hook managing tasks and settings |
| `src/__tests__/` | Testing - Unit tests for core logic |

## Engineering Rules

### TypeScript
- Use strict mode
- Avoid `any` unless absolutely unavoidable
- Prefer small typed functions
- All public APIs must have return types

### Scheduling Module (src/lib/scheduling.ts)
- Must be a **pure function** (no side effects)
- No random values
- No `Date.now()` - accept date as parameter
- Identical input → identical output
- Never mutate input arrays or task objects
- Return new result object

### Persistence (src/lib/storage.ts)
- Isolated from domain logic
- Catch quota errors gracefully
- Never crash UI on persistence failure

### Accessibility
- Semantic HTML controls
- Labels for all form fields
- Keyboard-accessible actions
- Visible focus states
- ARIA labels where needed

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (tablet), 1024px (desktop)

## Features (Per Spec)

### Task Management
- Add task with: id, title, subject, deadline, priority, duration, completed
- Edit existing tasks
- Delete tasks (with confirmation)
- Toggle completion status

### Study Time
- Set available minutes (15-720)
- Persists in localStorage

### Study Plan Generation
- Uses scheduling module
- Excludes completed tasks
- Never exceeds available time
- No duplicate tasks
- Deterministic output

### Views
- Today (due today or overdue)
- Upcoming (future incomplete)
- Completed
- Study Plan

### Progress
- Shows "X of Y tasks completed"

## Validation Rules

| Field | Rule |
|-------|------|
| title | Required, 1-100 chars |
| subject | Required, 1-50 chars |
| deadline | Required, today or future |
| priority | Required: low, medium, or high |
| duration | Required, 5-480 minutes |
| availableMinutes | 15-720 |

## Out of Scope

- User authentication
- Backend services
- Real-time sync
- Multiple study sessions
- Notifications
- Export/import
- Pomodoro timer
- Analytics
- Dark mode

## Testing Strategy

### Unit Tests (Normal)
- Scheduling algorithm correctness
- Deadline ordering
- Priority ordering
- Determinism
- Time constraints
- No duplicates

### Manual Testing
- Add/edit/delete tasks
- Generate study plan
- Persistence across refresh
- Responsive layout
- Empty states

---

*This steering file is automatically included in agent context for StudyPilot development.*