# StudyPilot - Design

**Project:** StudyPilot  
**Version:** 1.0  
**Generated:** 2026-09-26

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React App                         │
├─────────────┬─────────────┬─────────────────────────┤
│   UI Layer  │   Hooks     │    Components           │
│   (Views)   │ (useTasks)  │ (TaskForm, TaskList...) │
├─────────────┴─────────────┴─────────────────────────┤
│  Types        │  Scheduling    │  Persistence       │
│  (types.ts)   │  (scheduling.ts)│  (storage.ts)     │
└──────────────┴────────────────┴─────────────────────┘
```

**Layer Responsibilities:**
- **UI Layer**: React components, user interactions, rendering
- **Hooks**: State management, business logic orchestration
- **Types**: TypeScript interfaces only
- **Scheduling**: Pure functions for task prioritization (testable in isolation)
- **Storage**: localStorage read/write operations

---

## 2. Data Models

### 2.1 Task

```typescript
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;           // UUID v4
  title: string;        // 1-100 characters
  subject: string;      // 1-50 characters
  deadline: string;     // ISO 8601 date (YYYY-MM-DD)
  priority: Priority;
  duration: number;     // minutes, 5-480
  completed: boolean;   // default false
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

### 2.2 Scheduled Task

```typescript
interface ScheduledTask {
  task: Task;
  order: number;        // 1-based position in plan
  reason: string;       // Human-readable scheduling explanation
}
```

### 2.3 Study Plan

```typescript
interface StudyPlan {
  tasks: ScheduledTask[];
  totalMinutes: number;
  availableMinutes: number;
  generatedAt: string;  // ISO 8601 timestamp
}
```

### 2.4 User Settings

```typescript
interface UserSettings {
  availableMinutes: number;  // 15-720, default 120
}
```

### 2.5 App State

```typescript
interface AppState {
  tasks: Task[];
  settings: UserSettings;
}
```

### 2.6 Form Data

```typescript
interface TaskFormData {
  title: string;
  subject: string;
  deadline: string;
  priority: Priority;
  duration: number;
}
```

### 2.7 Validation Error

```typescript
interface ValidationError {
  field: string;
  message: string;
}
```

---

## 3. Scheduling Algorithm

### 3.1 Design Goals

The scheduling algorithm must satisfy these properties:

1. **Completeness**: Excludes completed tasks
2. **No Duplicates**: Same task never appears twice
3. **Time Bound**: Total duration ≤ available minutes
4. **Deterministic**: Same input → same output
5. **Correct Ordering**: Overdue → Today → Future; High → Medium → Low

### 3.2 Sorting Rules (Multi-Level Sort)

The algorithm uses explicit sorting rules instead of a scoring formula. This approach is provably correct because each rule is applied in order:

**Primary Sort: Deadline (ascending)**
- Earlier deadlines appear first
- Overdue tasks (deadline < today) naturally sort before today
- Today sorts before future dates
- Formula: `daysUntilDeadline = (deadline - today) in days`

**Secondary Sort: Priority (descending)**
- High priority appears before Medium
- Medium appears before Low
- Values: High=3, Medium=2, Low=1

**Tertiary Sort: Duration (ascending)**
- Shorter tasks appear first (better fill-in candidates)
- Range: 5-480 minutes

**Quaternary Sort: ID (ascending)**
- Full determinism when all other factors are equal
- Lexicographic string comparison

### 3.3 Algorithm Pseudocode

```
FUNCTION generateStudyPlan(tasks, availableMinutes):
  today = date of "today" at midnight

  // Step 1: Filter incomplete tasks
  incomplete = tasks.filter(t => NOT t.completed)

  // Step 2: Calculate days until deadline for each task
  scored = incomplete.map(task => {
    daysUntil = daysBetween(today, task.deadline)
    priorityValue = { high: 3, medium: 2, low: 1 }[task.priority]
    RETURN {
      task,
      daysUntil,           // can be negative (overdue)
      priorityValue,       // 3, 2, or 1
      duration: task.duration,
      id: task.id
    }
  })

  // Step 3: Multi-level sort (stable sort, applied in order)
  scored.sortBy(
    ASC by daysUntil,      // earlier deadlines first
    DESC by priorityValue, // High (3) > Medium (2) > Low (1)
    ASC by duration,       // shorter first
    ASC by id              // deterministic tie-break
  )

  // Step 4: Greedy selection within time constraint
  scheduled = []
  usedMinutes = 0

  FOR each item IN scored:
    IF usedMinutes + item.task.duration > availableMinutes:
      CONTINUE  // Skip - would exceed time

    scheduled.push({
      task: item.task,
      order: scheduled.length + 1,
      reason: buildReason(item)
    })
    usedMinutes += item.task.duration

  RETURN {
    tasks: scheduled,
    totalMinutes: usedMinutes,
    availableMinutes,
    generatedAt: NOW()
  }

FUNCTION buildReason(item):
  IF item.daysUntil < 0:
    overdueDays = ABS(item.daysUntil)
    RETURN "Overdue by {overdueDays} day(s), {priority} priority"
  ELSE IF item.daysUntil == 0:
    RETURN "Due today, {priority} priority"
  ELSE:
    RETURN "Due in {item.daysUntil} day(s), {priority} priority"
```

### 3.4 Proof of Correctness

| Requirement | How It's Satisfied |
|-------------|-------------------|
| Completed tasks excluded | Step 1 filters `t.completed === false` |
| Earlier deadlines first | Primary sort `ASC by daysUntil` (negative = overdue) |
| High > Medium > Low | Secondary sort `DESC by priorityValue` |
| No duplicates | Each task has unique ID; greedy selection adds once |
| Time bound | Step 4 checks `usedMinutes + duration <= availableMinutes` |
| Deterministic | Four-level sort provides total ordering; no random values |

### 3.5 Pure Function Contract

```typescript
// The scheduling function is a pure function - no side effects
function generateStudyPlan(
  tasks: Task[],
  availableMinutes: number
): StudyPlan

// Properties:
// - Same inputs always produce same outputs
// - No external state dependencies
// - No mutations to input array
// - Can be tested with property-based testing
```

---

## 4. localStorage Schema

### 4.1 Storage Keys

| Key | Type | Description | Default |
|-----|------|-------------|---------|
| `studypilot_tasks` | `Task[]` | All tasks | `[]` |
| `studypilot_settings` | `UserSettings` | User preferences | `{ availableMinutes: 120 }` |

### 4.2 Persistence Functions

```typescript
// Load all data
function loadState(): AppState

// Save operations
function saveTasks(tasks: Task[]): void
function saveSettings(settings: UserSettings): void
```

### 4.3 Error Handling

- Catch `QuotaExceededError` when localStorage is full
- Show user-friendly message: "Storage full. Please delete some tasks."
- Graceful degradation: in-memory state only for current session

---

## 5. Component Structure

```
src/
├── components/
│   ├── App/
│   │   └── App.tsx              # Main container, tab routing
│   ├── TaskList/
│   │   ├── TaskList.tsx         # Task container
│   │   ├── TaskItem.tsx         # Individual task
│   │   └── EmptyState.tsx       # Empty state messages
│   ├── TaskForm/
│   │   └── TaskForm.tsx         # Create/edit form
│   ├── StudyPlan/
│   │   └── StudyPlan.tsx        # Plan display
│   ├── Settings/
│   │   └── StudyTimeSetter.tsx  # Time input
│   └── Layout/
│       ├── Header.tsx           # App header with progress
│       └── TabNavigation.tsx    # View tabs
├── hooks/
│   └── useTasks.ts              # State management hook
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   ├── scheduling.ts            # Pure scheduling algorithm
│   ├── storage.ts               # localStorage operations
│   └── validation.ts            # Form validation
├── index.css                    # Global styles
└── main.tsx                     # Entry point
```

---

## 6. UI/UX Design

### 6.1 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Indigo | `#4F46E5` |
| Primary Hover | Dark Indigo | `#4338CA` |
| Success | Emerald | `#10B981` |
| Warning | Amber | `#F59E0B` |
| Danger | Red | `#EF4444` |
| Background | White | `#FFFFFF` |
| Surface | Gray 50 | `#F8FAFC` |
| Border | Gray 200 | `#E2E8F0` |
| Text Primary | Gray 900 | `#0F172A` |
| Text Secondary | Gray 500 | `#64748B` |

### 6.2 Priority Badge Colors

| Priority | Background | Text |
|----------|------------|------|
| High | `#FEF2F2` | `#B91C1C` |
| Medium | `#FFFBEB` | `#B45309` |
| Low | `#F0FDF4` | `#15803D` |

### 6.3 Layout Structure

```
┌─────────────────────────────────────────┐
│ Header: StudyPilot + Progress Badge     │
├─────────────────────────────────────────┤
│ Study Time Setter    │ Generate Plan    │
├─────────────────────────────────────────┤
│ [Today] [Upcoming] [Completed] [Plan]   │
├─────────────────────────────────────────┤
│                                         │
│          Content Area                   │
│    (TaskList or StudyPlan)              │
│                                         │
├─────────────────────────────────────────┤
│           [+ Add Task]                  │
└─────────────────────────────────────────┘
```

### 6.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column |
| Tablet | 640-1024px | Two columns where appropriate |
| Desktop | > 1024px | Full dashboard |

---

## 7. Validation Rules

### 7.1 Task Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required | "Title is required" |
| title | ≤ 100 chars | "Title must be 100 characters or less" |
| subject | Required | "Subject is required" |
| subject | ≤ 50 chars | "Subject must be 50 characters or less" |
| deadline | Required | "Deadline is required" |
| deadline | ≥ today | "Deadline must be today or later" |
| priority | Required | "Please select a priority" |
| duration | Required | "Duration is required" |
| duration | 5-480 | "Duration must be between 5 and 480 minutes" |

### 7.2 Settings Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| availableMinutes | 15-720 | "Must be between 15 and 720 minutes" |

---

## 8. Testing Strategy

### 8.1 Scheduling Module Tests (Priority: Critical)

The scheduling module must be thoroughly testable:

| Test Category | Test Cases |
|---------------|------------|
| Sorting | Tasks sorted by deadline, priority, duration, ID |
| Filtering | Completed tasks excluded |
| Time Constraint | Plan never exceeds available minutes |
| No Duplicates | Same task never appears twice |
| Determinism | Same input yields same output |
| Overdue Handling | Overdue tasks rank highest |
| Edge Cases | Empty task list, single task, all completed |

### 8.2 Integration Tests

| Test Category | Test Cases |
|---------------|------------|
| CRUD Operations | Create, read, update, delete tasks |
| Persistence | Data survives refresh |
| Views | Correct filtering in each tab |

---

## 9. Dependencies

### Production
- `react` ^18.x
- `react-dom` ^18.x
- `uuid` ^9.x (for task IDs)

### Development
- `typescript` ^5.x
- `vite` ^5.x
- `@types/react` ^18.x
- `@types/react-dom` ^18.x
- `@types/uuid` ^9.x

---

## 10. File Summary

| File | Purpose | Public API |
|------|---------|------------|
| `lib/types.ts` | Type definitions | Interfaces only |
| `lib/scheduling.ts` | Scheduling logic | `generateStudyPlan(tasks, availableMinutes)` |
| `lib/storage.ts` | localStorage ops | `loadState()`, `saveTasks()`, `saveSettings()` |
| `lib/validation.ts` | Form validation | `validateTask(data)`, `validateSettings(minutes)` |
| `hooks/useTasks.ts` | State management | Task CRUD, settings, derived state |
| `components/*` | UI components | React components |