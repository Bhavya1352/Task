import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Task, Status, Priority } from '../../types';
import { USERS } from '../../lib/data-generator';
import { Badge, cn } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { format, isToday, isPast, differenceInDays } from 'date-fns';

const ROW_HEIGHT = 60;
const BUFFER_SIZE = 5;

type SortKey = 'title' | 'priority' | 'due' | 'status';
type SortDir = 'asc' | 'desc';

export function ListView() {
  const { tasks, filters, search, selectedTaskId, setSelectedTaskId, updateTaskStatus, collaborationUsers } = useTaskStore();
  const [sortField, setSortField] = useState<SortKey>('due');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Filter tasks
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
    });
  }, [tasks, filters, search]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') comparison = a.title.localeCompare(b.title);
      if (sortField === 'priority') comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortField === 'status') comparison = a.status.localeCompare(b.status);
      if (sortField === 'due') comparison = a.dueDate.localeCompare(b.dueDate);

      return sortDir === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredTasks, sortField, sortDir]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = sortedTasks.length * ROW_HEIGHT;
  const viewportHeight = 600; // Expected height of the scroll container
  
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    sortedTasks.length,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER_SIZE
  );

  const visibleTasks = sortedTasks.slice(startIndex, endIndex);

  const toggleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return <span className="text-orange-600 font-semibold">Due Today</span>;
    if (isPast(date)) {
      const days = differenceInDays(new Date(), date);
      if (days >= 7) return <span className="text-red-500 font-bold">{days} days overdue</span>;
      return <span className="text-red-500 font-medium">{format(date, 'MMM d, yyyy')}</span>;
    }
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="flex flex-col h-[700px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-tighter dark:border-slate-800 dark:bg-slate-900/80">
        <div 
          className={cn("col-span-5 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors dark:text-slate-500 dark:hover:text-primary", sortField === 'title' && "text-primary")} 
          onClick={() => toggleSort('title')}
        >
          Task Name {sortField === 'title' && <ArrowUpDown size={12} className={sortDir === 'desc' ? 'rotate-180' : ''} />}
        </div>
        <div 
          className={cn("col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors dark:text-slate-500 dark:hover:text-primary", sortField === 'priority' && "text-primary")} 
          onClick={() => toggleSort('priority')}
        >
          Priority {sortField === 'priority' && <ArrowUpDown size={12} className={sortDir === 'desc' ? 'rotate-180' : ''} />}
        </div>
        <div 
          className={cn("col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors dark:text-slate-500 dark:hover:text-primary", sortField === 'due' && "text-primary")} 
          onClick={() => toggleSort('due')}
        >
          Due Date {sortField === 'due' && <ArrowUpDown size={12} className={sortDir === 'desc' ? 'rotate-180' : ''} />}
        </div>
        <div 
          className={cn("col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors dark:text-slate-500 dark:hover:text-primary", sortField === 'status' && "text-primary")} 
          onClick={() => toggleSort('status')}
        >
          Status {sortField === 'status' && <ArrowUpDown size={12} className={sortDir === 'desc' ? 'rotate-180' : ''} />}
        </div>
        <div className="col-span-1 dark:text-slate-500">Assignee</div>
      </div>

      {/* Scrollable Area */}
      <div 
        className="flex-1 overflow-y-auto relative custom-scrollbar" 
        onScroll={handleScroll}
        ref={containerRef}
      >
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 bg-gray-50/20 dark:bg-slate-900/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
               <List size={32} className="text-gray-200 dark:text-slate-700" />
            </div>
            <p className="text-lg font-semibold text-gray-400 dark:text-slate-600">No matching tasks found</p>
            <Button variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => useTaskStore.getState().clearFilters()}>Clear filters</Button>
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div 
              style={{ 
                position: 'absolute', 
                top: startIndex * ROW_HEIGHT, 
                left: 0, 
                right: 0, 
              }}
            >
              {visibleTasks.map((task) => {
                const assignee = USERS.find(u => u.id === task.assigneeId);
                const peopleOnTask = collaborationUsers.filter(u => u.currentTaskId === task.id);
                const isSelected = selectedTaskId === task.id;
                
                return (
                  <div 
                    key={task.id} 
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 items-center border-b border-gray-50 hover:bg-slate-50 transition-all group relative cursor-pointer dark:border-slate-800/50 dark:hover:bg-slate-800/50",
                      isSelected && "bg-blue-50/50 border-l-4 border-l-primary ring-1 ring-inset ring-primary/10 shadow-sm dark:bg-primary/5 dark:ring-primary/20 dark:border-l-primary"
                    )}
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                      <span className={cn("truncate text-sm font-medium text-gray-900 transition-colors dark:text-slate-200", isSelected && "text-primary dark:text-primary")}>
                        {task.title}
                      </span>
                      {peopleOnTask.length > 0 && (
                        <div className="flex -space-x-1">
                          {peopleOnTask.slice(0, 2).map(u => (
                            <div key={u.id} className="w-5 h-5 rounded-full ring-2 ring-white animate-pulse dark:ring-slate-900" style={{ backgroundColor: u.color }} title={`${u.name} is viewing`} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                       <Badge variant={task.priority as BadgeVariant} size="sm" className="dark:bg-opacity-20 dark:border-opacity-30 uppercase text-[10px] font-bold">
                         {task.priority}
                       </Badge>
                    </div>

                    <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                      {getDueDateLabel(task.dueDate)}
                    </div>

                    <div className="col-span-2">
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="sm" className="w-full justify-between h-8 border border-gray-100 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                            <span className="text-[10px] uppercase font-bold tracking-wider">{task.status.replace('-', ' ')}</span>
                            <ChevronDown size={12} />
                          </Button>
                        }
                      >
                        <div className="dark:bg-slate-900 dark:border-slate-800">
                          {(['todo', 'in-progress', 'in-review', 'done'] as Status[]).map((s) => (
                            <DropdownItem key={s} onClick={() => updateTaskStatus(task.id, s)} active={task.status === s} className="dark:hover:bg-slate-800 dark:text-slate-300">
                              {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                            </DropdownItem>
                          ))}
                        </div>
                      </Dropdown>
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      {assignee && <Avatar name={assignee.name} color={assignee.color} size="xs" className="dark:ring-slate-900" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer / Count */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 font-medium">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
}
