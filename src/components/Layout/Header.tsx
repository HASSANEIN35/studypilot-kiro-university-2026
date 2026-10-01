import type { Progress } from '../../lib/types';

interface HeaderProps {
  progress: Progress;
}

export function Header({ progress }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">StudyPilot</h1>
        <div className="progress-badge">
          <span className="progress-text">
            {progress.completed} of {progress.total} tasks completed
          </span>
          {progress.total > 0 && (
            <span className="progress-percentage">{progress.percentage}%</span>
          )}
        </div>
      </div>
    </header>
  );
}