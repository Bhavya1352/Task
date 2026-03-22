import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Status, Task } from '../../types';
import { USERS } from '../../lib/data-generator';
import { Avatar } from '../ui/Avatar';
import { Badge, cn } from '../ui/Badge';
import { BadgeVariant } from '../ui/Badge';
import { format, isToday, isPast, differenceInDays } from 'date-fns';
import { Clock, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const COLUMNS: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
const COLUMN_NAMES: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

export function KanbanView() {
  const { tasks, filters, search, selectedTaskId, setSelectedTaskId, updateTaskStatus, collaborationUsers } = useTaskStore();
  
  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedTaskPos, setDraggedTaskPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTargetColumn, setDragTargetColumn] = useState<Status | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { todo: [], 'in-progress': [], 'in-review': [], done: [] };
    filteredTasks.forEach(t => map[t.status].push(t));
    return map;
  }, [filteredTasks]);

  const [isSnapping, setIsSnapping] = useState(false);
  const originalPosRef = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent, taskId: string) => {
    // Only drag with left click
    if (e.button !== 0) return;
    
    setSelectedTaskId(taskId);
    
    const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    originalPosRef.current = { x: cardRect.left, y: cardRect.top };
    
    setDraggedTaskId(taskId);
    setDragOffset({ x: e.clientX - cardRect.left, y: e.clientY - cardRect.top });
    setDraggedTaskPos({ x: cardRect.left, y: cardRect.top });
    setIsDragging(false); 
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggedTaskId || isSnapping) return;

    if (!isDragging) {
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 5) {
        setIsDragging(true);
      } else {
        return;
      }
    }

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    setDraggedTaskPos({ x, y });

    const columns = document.querySelectorAll('[data-column]');
    let foundColumn: Status | null = null;
    
    columns.forEach(col => {
      const rect = col.getBoundingClientRect();
      if (
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom
      ) {
        foundColumn = col.getAttribute('data-column') as Status;
      }
    });
    
    setDragTargetColumn(foundColumn);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggedTaskId) return;

    const finalize = () => {
      if (dragTargetColumn) {
        updateTaskStatus(draggedTaskId, dragTargetColumn);
      }
      setDraggedTaskId(null);
      setIsDragging(false);
      setDragTargetColumn(null);
      setIsSnapping(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    };

    if (isDragging && !dragTargetColumn) {
      // Snap back animation
      setIsSnapping(true);
      setDraggedTaskPos(originalPosRef.current);
      setTimeout(finalize, 300); // Wait for transition
    } else {
      finalize();
    }
  };

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Due Today";
    if (isPast(date)) {
      const days = differenceInDays(new Date(), date);
      if (days >= 7) return `${days} days overdue`;
      return format(date, 'MMM d');
    }
    return format(date, 'MMM d');
  };

  const draggedTaskData = useMemo(() => 
    draggedTaskId ? tasks.find(t => t.id === draggedTaskId) : null, 
  [draggedTaskId, tasks]);

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full gap-4 overflow-x-auto pb-4 pt-2">
      {COLUMNS.map((col) => (
        <div
          key={col}
          data-column={col}
          className={cn(
            'flex h-full w-80 flex-shrink-0 flex-col rounded-2xl bg-gray-100/50 p-3 transition-colors duration-200 dark:bg-slate-800/40',
            dragTargetColumn === col && 'bg-blue-100/80 ring-2 ring-primary/40 ring-inset shadow-inner dark:bg-blue-900/20'
          )}
        >
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-slate-400">
              {COLUMN_NAMES[col]}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500 font-bold dark:bg-slate-700 dark:text-slate-500">
                {tasksByStatus[col].length}
              </span>
            </h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {tasksByStatus[col].length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                  <MessageSquare size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-600">No tasks here</p>
                <Button variant="ghost" size="sm" className="mt-2 text-[10px] dark:hover:bg-slate-800" onClick={() => useTaskStore.getState().clearFilters()}>Clear filters</Button>
              </div>
            )}

            {tasksByStatus[col].map((task) => {
              const assignee = USERS.find((u) => u.id === task.assigneeId);
              const isBeingDragged = draggedTaskId === task.id;
              const isSelected = selectedTaskId === task.id;
              const peopleOnTask = collaborationUsers.filter(u => u.currentTaskId === task.id);
              const isOverdue = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

              return (
                <div
                  key={task.id}
                  className={cn(
                    'relative rounded-xl bg-white p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-gray-200 group dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700',
                    isBeingDragged && isDragging ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100',
                    isSelected && 'ring-2 ring-primary border-transparent bg-blue-50/50 shadow-lg dark:bg-primary/10 dark:ring-primary/60'
                  )}
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onPointerDown(e, task.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <div className="mb-3 flex items-start justify-between gap-1">
                    <Badge variant={task.priority as BadgeVariant} className="uppercase text-[10px] font-extrabold tracking-tighter">
                      {task.priority}
                    </Badge>
                    <div className="flex -space-x-1">
                      {peopleOnTask.map(u => (
                         <div key={u.id} className="w-5 h-5 rounded-full ring-2 ring-white animate-pulse dark:ring-slate-900" style={{ backgroundColor: u.color }} title={`${u.name} is editing`} />
                      ))}
                    </div>
                  </div>
                  
                  <h4 className={cn("mb-3 text-sm font-semibold leading-relaxed text-gray-900 line-clamp-2 dark:text-slate-100", isSelected && "text-primary dark:text-primary")}>
                    {task.title}
                  </h4>
                  
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                       <Clock size={12} className={isOverdue ? "text-red-500" : "text-gray-400 dark:text-slate-600"} />
                       <span className={cn(isOverdue ? "text-red-600 font-bold dark:text-red-400" : "dark:text-slate-500")}>
                         {getDueDateLabel(task.dueDate)}
                       </span>
                    </div>
                    {assignee && (
                      <Avatar name={assignee.name} color={assignee.color} size="sm" className={cn(isSelected && "ring-primary ring-2 ring-offset-1 dark:ring-offset-slate-900")} />
                    )}
                  </div>

                  {/* Selection Indicator Dot */}
                  {isSelected && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-slate-900 shadow-sm shadow-primary/50 animate-in fade-in zoom-in" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Dragging Preview */}
      {isDragging && draggedTaskData && (
        <div
          className={cn(
            "pointer-events-none fixed z-[1000] w-80 rounded-xl bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-blue-200 scale-105 backdrop-blur-md opacity-80 dark:bg-slate-900/95 dark:border-primary/30",
            isSnapping && "transition-all duration-300 ease-in-out opacity-0 scale-95"
          )}
          style={{
            left: draggedTaskPos.x,
            top: draggedTaskPos.y,
          }}
        >
          <div className="mb-3">
            <Badge variant={draggedTaskData.priority as BadgeVariant} className="uppercase text-[10px] font-extrabold tracking-tighter">
              {draggedTaskData.priority}
            </Badge>
          </div>
          <h4 className="text-sm font-bold leading-relaxed text-gray-900 dark:text-white">
            {draggedTaskData.title}
          </h4>
        </div>
      )}
    </div>
  );
}
