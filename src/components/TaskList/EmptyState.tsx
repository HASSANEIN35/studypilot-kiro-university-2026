interface EmptyStateProps {
  message: string;
  icon?: string;
}

const DEFAULT_ICON = '📚';

export function EmptyState({ message, icon = DEFAULT_ICON }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <p className="empty-message">{message}</p>
    </div>
  );
}