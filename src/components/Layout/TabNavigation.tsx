import type { TabType } from '../../lib/types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    today: number;
    upcoming: number;
    completed: number;
  };
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'plan', label: 'Study Plan' },
];

export function TabNavigation({ activeTab, onTabChange, counts }: TabNavigationProps) {
  const getCount = (tab: TabType): number => {
    switch (tab) {
      case 'today':
        return counts.today;
      case 'upcoming':
        return counts.upcoming;
      case 'completed':
        return counts.completed;
      case 'plan':
        return 0;
    }
  };

  return (
    <nav className="tab-navigation" role="tablist" aria-label="Task views">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {getCount(tab.id) > 0 && (
            <span className="tab-count">{getCount(tab.id)}</span>
          )}
        </button>
      ))}
    </nav>
  );
}