import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Avatar, AvatarGroup } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LayoutGrid, List, Calendar as CalendarIcon, Users, Moon, Sun, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import { cn } from '../ui/Badge';
import { TaskDetailSidebar } from './TaskDetailSidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeView, setActiveView, collaborationUsers, tasks, isDarkMode, toggleDarkMode } = useTaskStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => {
    const due = new Date(t.dueDate);
    const today = new Date();
    const isToday = due.getDate() === today.getDate() &&
                    due.getMonth() === today.getMonth() &&
                    due.getFullYear() === today.getFullYear();
    return due < today && !isToday && t.status !== 'done';
  }).length;

  return (
    <div className={cn("flex min-h-screen flex-col bg-slate-50 transition-colors duration-300 dark:bg-slate-950", isDarkMode && "dark")}>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <LayoutGrid size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Project Tracker</h1>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-6 ml-4 min-w-0">
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex -space-x-1.5 overflow-hidden">
                {collaborationUsers.slice(0, 4).map((user) => (
                  <Avatar key={user.id} name={user.name} color={user.color} size="sm" className="ring-offset-1 dark:ring-slate-900" />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {collaborationUsers.length} online
              </span>
              <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>

            <nav className="flex items-center rounded-xl bg-gray-100 p-1 shadow-inner overflow-x-auto custom-scrollbar-hide max-w-full dark:bg-slate-800">
              <Button
                variant={activeView === 'kanban' ? 'primary' : 'ghost'}
                size="sm"
                className={cn('rounded-lg px-3 py-1.5 flex-shrink-0', activeView !== 'kanban' && 'hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-slate-400')}
                onClick={() => setActiveView('kanban')}
              >
                <LayoutGrid size={16} className="mr-2" />
                Kanban
              </Button>
              <Button
                variant={activeView === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className={cn('rounded-lg px-3 py-1.5 flex-shrink-0', activeView !== 'list' && 'hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-slate-400')}
                onClick={() => setActiveView('list')}
              >
                <List size={16} className="mr-2" />
                List
              </Button>
              <Button
                variant={activeView === 'timeline' ? 'primary' : 'ghost'}
                size="sm"
                className={cn('rounded-lg px-3 py-1.5 flex-shrink-0', activeView !== 'timeline' && 'hover:bg-gray-200 dark:hover:bg-slate-700 dark:text-slate-400')}
                onClick={() => setActiveView('timeline')}
              >
                <CalendarIcon size={16} className="mr-2" />
                Timeline
              </Button>
            </nav>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mx-auto flex h-10 w-full max-w-7xl items-center gap-4 sm:gap-8 border-t border-gray-100 px-4 sm:px-8 py-1 overflow-x-auto custom-scrollbar-hide dark:border-slate-800">
          <div className="flex flex-shrink-0 items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
            <BarChart2 size={14} className="text-primary" />
            <span>Total: <span className="text-gray-900 dark:text-white font-bold">{totalTasks}</span></span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Done: <span className="text-gray-900 dark:text-white font-bold">{completedTasks}</span></span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
            <Clock size={14} className="text-red-500" />
            <span>Overdue: <span className="text-gray-900 dark:text-white font-bold">{overdueTasks}</span></span>
          </div>
          <div className="ml-auto hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-slate-600">
            Live Updates Enabled
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full w-full max-w-7xl">
          {children}
        </div>
      </main>

      {/* Task Details Side Panel */}
      <TaskDetailSidebar />
    </div>
  );
}
