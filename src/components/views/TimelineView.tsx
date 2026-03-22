import React, { useMemo, useRef, useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Task } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, differenceInDays } from 'date-fns';
import { cn } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { USERS } from '../../lib/data-generator';

const DAY_WIDTH = 40;
const CHART_LEFT_WIDTH = 250;
const ROW_HEIGHT = 48;

export function TimelineView() {
  const { tasks, filters, search, selectedTaskId, setSelectedTaskId, collaborationUsers } = useTaskStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({
    start: currentMonthStart,
    end: currentMonthEnd,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(task.status);
      const priorityMatch = filters.priority.length === 0 || filters.priority.includes(task.priority);
      const assigneeMatch = filters.assignees.length === 0 || filters.assignees.includes(task.assigneeId);
      const searchMatch = !search || task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase());
      
      const taskDate = new Date(task.dueDate);
      const fromMatch = !filters.dateRange.from || taskDate >= new Date(filters.dateRange.from);
      const toMatch = !filters.dateRange.to || taskDate <= new Date(filters.dateRange.to);

      return statusMatch && priorityMatch && assigneeMatch && searchMatch && fromMatch && toMatch;
    }).slice(0, 50); // Limit to 50 for even better timeline performance
  }, [tasks, filters, search]);

  useEffect(() => {
    // Scroll to today's date on mount
    if (timelineRef.current) {
      const todayIndex = daysInMonth.findIndex(d => isSameDay(d, today));
      if (todayIndex !== -1) {
        timelineRef.current.scrollLeft = (todayIndex * DAY_WIDTH) - 400;
      }
    }
  }, []);

  const getTaskStyle = (task: Task) => {
    const start = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
    const end = new Date(task.dueDate);
    
    // Calculate position
    const offsetDays = differenceInDays(start, currentMonthStart);
    const durationDays = Math.max(1, differenceInDays(end, start) + 1);

    const left = offsetDays * DAY_WIDTH;
    const width = durationDays * DAY_WIDTH;

    const colors = {
      critical: '#EF4444',
      high: '#F97316',
      medium: '#EAB308',
      low: '#22C55E',
    };

    return {
      left: `${left}px`,
      width: `${width}px`,
      backgroundColor: colors[task.priority],
    };
  };

  return (
    <div className="flex h-[700px] flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 dark:border-slate-800 dark:bg-slate-900">
      {/* Scrollable Area */}
      <div className="flex flex-1 overflow-auto timeline-scroll custom-scrollbar" ref={timelineRef}>
        {/* Left Column - Names */}
        <div className="sticky left-0 z-30 w-[250px] flex-shrink-0 border-r border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center px-4 text-xs font-bold text-gray-500 uppercase tracking-tighter dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">
            Task Title
          </div>
          <div className="flex-1">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex h-12 items-center border-b border-gray-50 px-4 text-sm font-medium text-gray-700 truncate hover:bg-gray-50 transition-colors cursor-pointer dark:border-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/50",
                  selectedTaskId === task.id ? "bg-blue-50 text-primary border-l-4 border-l-primary dark:bg-primary/10 dark:text-primary" : ""
                )}
                onClick={() => setSelectedTaskId(task.id)}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Timeline Grid */}
        <div className="relative">
          {/* Timeline Header */}
          <div className="sticky top-0 z-20 flex h-12 border-b border-gray-100 bg-gray-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            {daysInMonth.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex w-[40px] flex-shrink-0 flex-col items-center justify-center border-r border-gray-100/50 text-[10px] font-bold transition-colors',
                  isSameDay(day, today) 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-slate-600'
                )}
              >
                <span className="uppercase">{format(day, 'EEE')}</span>
                <span className="text-xs">{format(day, 'd')}</span>
              </div>
            ))}
          </div>

          {/* Timeline Body */}
          <div className="relative flex flex-col pt-2">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 flex h-full">
              {daysInMonth.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'w-[40px] flex-shrink-0 border-r border-gray-50/50 dark:border-slate-800/30',
                    isSameDay(day, today) && 'bg-blue-50/30 ring-1 ring-blue-100 ring-inset dark:bg-blue-900/10 dark:ring-blue-900/30'
                  )}
                />
              ))}
            </div>

            {/* Today's Line */}
            {daysInMonth.findIndex(d => isSameDay(d, today)) !== -1 && (
              <div 
                className="absolute z-10 w-px bg-blue-500 h-full pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:bg-blue-400"
                style={{ 
                  left: `${daysInMonth.findIndex(d => isSameDay(d, today)) * DAY_WIDTH + 20}px` 
                }}
              />
            )}

            {/* Task Bars */}
            <div className="relative z-10 w-full space-y-0">
              {filteredTasks.map((task) => {
                const assignee = USERS.find(u => u.id === task.assigneeId);
                const peopleOnTask = collaborationUsers.filter(u => u.currentTaskId === task.id);
                const isSelected = selectedTaskId === task.id;
                
                return (
                  <div key={task.id} className={cn("group relative flex h-12 items-center transition-colors px-0 cursor-pointer", isSelected && "bg-blue-50/30 dark:bg-primary/5")} onClick={() => setSelectedTaskId(task.id)}>
                    <div
                      className={cn(
                        "absolute h-7 rounded-lg shadow-sm border border-black/5 transition-all hover:scale-[1.02] hover:shadow-md flex items-center px-3",
                        isSelected && "ring-2 ring-primary ring-offset-1 z-30 opacity-100 scale-[1.03] dark:ring-offset-slate-900"
                      )}
                      style={getTaskStyle(task)}
                    >
                      <span className="text-[10px] font-extrabold text-white uppercase tracking-tighter truncate whitespace-nowrap">
                        {task.status}
                      </span>
                      {peopleOnTask.length > 0 && (
                        <div className="ml-2 flex -space-x-1">
                          {peopleOnTask.map(u => (
                            <div key={u.id} className="w-4 h-4 rounded-full ring-1 ring-white animate-pulse dark:ring-slate-900" style={{ backgroundColor: u.color }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Info */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-500">
        Timeline shows tasks across {format(currentMonthStart, 'MMMM yyyy')}. Horizontally scroll to see more dates.
      </div>
    </div>
  );
}
