import { useState, useEffect, type FormEvent } from 'react';
import type { Task, TaskFormData, Priority, ValidationError } from '../../lib/types';
import { validateTask, getTodayDateString } from '../../lib/validation';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [duration, setDuration] = useState(60);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSubject(task.subject);
      setDeadline(task.deadline);
      setPriority(task.priority);
      setDuration(task.duration);
    } else {
      setTitle('');
      setSubject('');
      setDeadline(getTodayDateString());
      setPriority('medium');
      setDuration(60);
    }
    setErrors([]);
  }, [task]);

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    const data: TaskFormData = { title, subject, deadline, priority, duration };
    const validationErrors = validateTask(data);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    onSubmit(data);
    setIsSubmitting(false);
    
    // Reset form if creating new task
    if (!task) {
      setTitle('');
      setSubject('');
      setDeadline(getTodayDateString());
      setPriority('medium');
      setDuration(60);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} aria-label={task ? 'Edit task' : 'Add new task'}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Review Chapter 5"
          maxLength={100}
          aria-invalid={!!getFieldError('title')}
          aria-describedby={getFieldError('title') ? 'title-error' : undefined}
        />
        {getFieldError('title') && (
          <span id="title-error" className="error-message" role="alert">
            {getFieldError('title')}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g., Mathematics"
          maxLength={50}
          aria-invalid={!!getFieldError('subject')}
          aria-describedby={getFieldError('subject') ? 'subject-error' : undefined}
        />
        {getFieldError('subject') && (
          <span id="subject-error" className="error-message" role="alert">
            {getFieldError('subject')}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="deadline">Deadline *</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            min={getTodayDateString()}
            aria-invalid={!!getFieldError('deadline')}
            aria-describedby={getFieldError('deadline') ? 'deadline-error' : undefined}
          />
          {getFieldError('deadline') && (
            <span id="deadline-error" className="error-message" role="alert">
              {getFieldError('deadline')}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            aria-invalid={!!getFieldError('priority')}
          >
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {getFieldError('priority') && (
            <span className="error-message" role="alert">
              {getFieldError('priority')}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (minutes) *</label>
        <input
          id="duration"
          type="number"
          value={duration}
          onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
          min={5}
          max={480}
          aria-invalid={!!getFieldError('duration')}
          aria-describedby={getFieldError('duration') ? 'duration-error' : undefined}
        />
        {getFieldError('duration') && (
          <span id="duration-error" className="error-message" role="alert">
            {getFieldError('duration')}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}