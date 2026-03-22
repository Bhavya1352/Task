import React, { useEffect, useRef } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { USERS } from '../../lib/data-generator';
import { Avatar } from '../ui/Avatar';
import { Badge, cn } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, Clock, Calendar, User, AlignLeft, BarChart2, MessageSquare, History } from 'lucide-react';
import { format } from 'date-fns';

export function TaskDetailSidebar() {
  const { selectedTaskId, setSelectedTaskId, tasks, updateTaskStatus } = useTaskStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const task = tasks.find(t => t.id === selectedTaskId);

  // Close on outside click is tricky since we want internal clicks to work
  // We'll rely on the X button and Escape key

  if (!task) return null;

  const assignee = USERS.find(u => u.id === task.assigneeId);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[1px] transition-all animate-in fade-in duration-300"
        onClick={() => setSelectedTaskId(null)}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-0 z-[70] h-full sm:w-[450px] w-full bg-white shadow-2xl border-l border-gray-100 flex flex-col transition-all duration-300 transform animate-in slide-in-from-right duration-500 ease-out dark:bg-slate-900 dark:border-slate-800",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary dark:bg-blue-900/30">
               <AlignLeft size={18} />
             </div>
             <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Task ID: {task.id.split('-')[1]}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 rounded-full px-0 dark:hover:bg-slate-800" 
            onClick={() => setSelectedTaskId(null)}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Title & Status */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight dark:text-white">
              {task.title}
            </h2>
            <div className="flex items-center gap-4">
               <Badge variant={task.priority as any} className="px-3 py-1 uppercase text-[10px] font-black tracking-tighter">
                 {task.priority} Priority
               </Badge>
               <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
               <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                 <Clock size={16} className="text-primary" />
                 {task.status.replace('-', ' ').toUpperCase()}
               </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-50 dark:border-slate-800">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                <User size={12} /> Assignee
              </label>
              {assignee && (
                <div className="flex items-center gap-3">
                  <Avatar name={assignee.name} color={assignee.color} size="sm" />
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{assignee.name}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                <Calendar size={12} /> Due Date
              </label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-900/20">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
              <AlignLeft size={12} /> Description
            </label>
            <p className="text-sm leading-relaxed text-gray-600 font-medium dark:text-slate-400">
              {task.description}
            </p>
            <p className="text-sm leading-relaxed text-gray-600 font-medium dark:text-slate-400">
              This task involves cross-functional collaboration. Please ensure that all dependencies are resolved before moving to In Review.
            </p>
          </div>

          {/* Activity Hook (Skeleton History) */}
          <div className="space-y-6 pt-4">
            <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
              <History size={12} /> Activity Log
            </label>
            <div className="space-y-6 relative ml-1 pl-6">
               <div className="absolute left-0 top-0 w-px h-full bg-gray-100 dark:bg-slate-800" />
               
               <div className="relative">
                  <div className="absolute -left-[28px] top-0 w-4 h-4 rounded-full border-2 border-white bg-blue-500 dark:border-slate-900" />
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-200">Task was created</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">2 days ago by System Admin</p>
               </div>

               <div className="relative">
                  <div className="absolute -left-[28px] top-0 w-4 h-4 rounded-full border-2 border-white bg-orange-500 dark:border-slate-900" />
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-200">Moved to In Progress</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">1 day ago by {assignee?.name}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3 dark:bg-slate-900/50 dark:border-slate-800">
           <Button className="flex-1 font-bold" onClick={() => setSelectedTaskId(null)}>Close Details</Button>
           <Button variant="outline" className="w-12 px-0 h-10 border-gray-200 dark:border-slate-700">
             <BarChart2 size={18} />
           </Button>
        </div>
      </div>
    </>
  );
}
