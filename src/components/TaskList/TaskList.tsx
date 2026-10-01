import type { Task } from '../../lib/types';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  emptyMessage: string;
}

export function TaskList({ tasks, onEdit, onDelete, onToggleComplete, emptyMessage }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="task-list" role="list" aria-label="Tasks">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}