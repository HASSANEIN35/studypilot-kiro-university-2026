import type { Task } from '../../lib/types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const PRIORITY_CLASSES: Record<string, string> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export function TaskItem({ task, onEdit, onDelete, onToggleComplete }: TaskItemProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'completed'}`}
        />
      </div>
      
      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <span className={`priority-badge ${PRIORITY_CLASSES[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="task-meta">
          <span className="task-subject">{task.subject}</span>
          <span className="task-separator">•</span>
          <span className="task-deadline">
            {task.completed ? 'Completed' : formatDate(task.deadline)}
          </span>
          <span className="task-separator">•</span>
          <span className="task-duration">{task.duration} min</span>
        </div>
      </div>
      
      <div className="task-actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-danger"
          onClick={handleDelete}
          aria-label={`Delete "${task.title}"`}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}