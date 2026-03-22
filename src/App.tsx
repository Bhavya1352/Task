import React, { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { FilterBar } from './components/filters/FilterBar';
import { KanbanView } from './components/views/KanbanView';
import { ListView } from './components/views/ListView';
import { TimelineView } from './components/views/TimelineView';
import { useTaskStore } from './store/useTaskStore';
import { useFilterSync } from './hooks/useFilterSync';
import { useCollaboration } from './hooks/useCollaboration';

function App() {
  const { activeView, setActiveView, isDarkMode, setSelectedTaskId } = useTaskStore();

  // Sync state with URL
  useFilterSync();
  
  // Simulate real-time collaboration
  useCollaboration();

  // Keyboard Shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'k') setActiveView('kanban');
      if (e.key.toLowerCase() === 'l') setActiveView('list');
      if (e.key.toLowerCase() === 't') setActiveView('timeline');
      if (e.key === 'Escape') setSelectedTaskId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, setSelectedTaskId]);

  // Manage classes on root for both html and body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanView />;
      case 'list':
        return <ListView />;
      case 'timeline':
        return <TimelineView />;
      default:
        return <KanbanView />;
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-2 overflow-hidden flex flex-col h-[calc(100vh-104px)] min-h-[500px]">
        <header className="flex-shrink-0">
          <FilterBar />
        </header>
        <div className="flex-1 overflow-hidden transition-all duration-300 animate-entrance mt-2">
          {renderView()}
        </div>
      </div>
    </Layout>
  );
}

export default App;
