/**
 * StudyPilot - Main App Component
 */

import { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Header } from '../Layout/Header';
import { TabNavigation } from '../Layout/TabNavigation';
import { TaskForm } from '../TaskForm/TaskForm';
import { TaskList } from '../TaskList/TaskList';
import { StudyPlanDisplay } from '../StudyPlan/StudyPlan';
import { StudyTimeSetter } from '../Settings/StudyTimeSetter';
import type { Task, TaskFormData, TabType } from '../../lib/types';

const EMPTY_MESSAGES: Record<TabType, string> = {
  today: 'No tasks due today. Enjoy your free time!',
  upcoming: 'No upcoming tasks. Add some study tasks!',
  completed: 'No completed tasks yet. Keep studying!',
  plan: 'Generate a study plan to get started.',
};

export function App() {
  const {
    settings,
    studyPlan,
    activeTab,
    isLoaded,
    todayTasks,
    upcomingTasks,
    completedTasks,
    progress,
    addTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    setAvailableMinutes,
    generatePlan,
    setActiveTab,
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleGeneratePlan = () => {
    generatePlan();
    setActiveTab('plan');
  };

  if (!isLoaded) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const tabCounts = {
    today: todayTasks.length,
    upcoming: upcomingTasks.length,
    completed: completedTasks.length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TaskList
            tasks={todayTasks}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleComplete={toggleCompletion}
            emptyMessage={EMPTY_MESSAGES.today}
          />
        );
      case 'upcoming':
        return (
          <TaskList
            tasks={upcomingTasks}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleComplete={toggleCompletion}
            emptyMessage={EMPTY_MESSAGES.upcoming}
          />
        );
      case 'completed':
        return (
          <TaskList
            tasks={completedTasks}
            onEdit={handleEdit}
            onDelete={deleteTask}
            onToggleComplete={toggleCompletion}
            emptyMessage={EMPTY_MESSAGES.completed}
          />
        );
      case 'plan':
        return (
          <StudyPlanDisplay
            plan={studyPlan}
            onRegenerate={generatePlan}
          />
        );
    }
  };

  return (
    <div className="app">
      <Header progress={progress} />
      
      <main className="main-content">
        <section className="controls-section">
          <StudyTimeSetter
            value={settings.availableMinutes}
            onChange={setAvailableMinutes}
          />
          <button
            className="btn-primary generate-btn"
            onClick={handleGeneratePlan}
          >
            Generate Study Plan
          </button>
        </section>

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        <section className="content-section" role="tabpanel" aria-label={activeTab}>
          {renderContent()}
        </section>

        {showForm && (
          <div className="modal-overlay" onClick={handleCancelForm}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <TaskForm
                task={editingTask}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        )}

        {!showForm && (
          <button
            className="btn-primary add-task-btn"
            onClick={handleAddClick}
          >
            + Add Task
          </button>
        )}
      </main>
    </div>
  );
}

export default App;