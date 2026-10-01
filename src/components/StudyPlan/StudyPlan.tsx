import type { StudyPlan as StudyPlanType } from '../../lib/types';
import { EmptyState } from '../TaskList/EmptyState';

interface StudyPlanProps {
  plan: StudyPlanType | null;
  onRegenerate: () => void;
}

export function StudyPlanDisplay({ plan, onRegenerate }: StudyPlanProps) {
  if (!plan || plan.tasks.length === 0) {
    return (
      <div className="study-plan-empty">
        <EmptyState
          message="No tasks fit in your study time. Adjust your available time or add more tasks."
          icon="📋"
        />
        <button className="btn-primary" onClick={onRegenerate}>
          Try Again
        </button>
      </div>
    );
  }

  const remainingMinutes = plan.availableMinutes - plan.totalMinutes;

  return (
    <div className="study-plan">
      <div className="plan-summary">
        <div className="plan-time-info">
          <span className="plan-used">
            <strong>{plan.totalMinutes}</strong> minutes scheduled
          </span>
          <span className="plan-available">
            of <strong>{plan.availableMinutes}</strong> available
          </span>
          {remainingMinutes > 0 && (
            <span className="plan-remaining">
              ({remainingMinutes} minutes remaining)
            </span>
          )}
        </div>
        <button className="btn-secondary" onClick={onRegenerate}>
          Regenerate
        </button>
      </div>

      <div className="plan-tasks" role="list" aria-label="Scheduled tasks">
        {plan.tasks.map(({ task, order, reason }) => (
          <div key={task.id} className="scheduled-task" role="listitem">
            <div className="scheduled-order">{order}</div>
            <div className="scheduled-content">
              <div className="scheduled-header">
                <h4 className="scheduled-title">{task.title}</h4>
                <span className="scheduled-duration">{task.duration} min</span>
              </div>
              <div className="scheduled-meta">
                <span className="scheduled-subject">{task.subject}</span>
                <span className="scheduled-reason">{reason}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}