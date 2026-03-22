import { create } from 'zustand';
import { Task, Status, Priority, FilterState, CollaborationUser } from '../types';
import { generateTasks, USERS } from '../lib/data-generator';

interface TaskStore {
  tasks: Task[];
  filters: FilterState;
  activeView: 'kanban' | 'list' | 'timeline';
  collaborationUsers: CollaborationUser[];
  search: string;
  selectedTaskId: string | null;
  isDarkMode: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setSearch: (search: string) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  toggleDarkMode: () => void;
  setActiveView: (view: 'kanban' | 'list' | 'timeline') => void;
  updateCollaborationUsers: (users: CollaborationUser[]) => void;
  clearFilters: () => void;
}

const initialFilters: FilterState = {
  status: [],
  priority: [],
  assignees: [],
  dateRange: { from: '', to: '' },
};

const initialCollabUsers: CollaborationUser[] = [
  { id: 'u1', name: 'Zoe', color: '#EC4899' },
  { id: 'u2', name: 'Liam', color: '#8B5CF6' },
  { id: 'u3', name: 'Noah', color: '#10B981' },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: generateTasks(500),
  filters: initialFilters,
  activeView: (localStorage.getItem('tracker-view') as any) || 'kanban',
  collaborationUsers: initialCollabUsers,
  search: '',
  selectedTaskId: null,
  isDarkMode: localStorage.getItem('tracker-dark-mode') === 'true',

  setTasks: (tasks) => set({ tasks }),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
  })),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setSearch: (search) => set({ search }),

  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),

  toggleDarkMode: () => set((state) => {
    const next = !state.isDarkMode;
    localStorage.setItem('tracker-dark-mode', String(next));
    
    // Apply theme immediately
    if (typeof document !== 'undefined') {
      if (next) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
      }
    }
    
    return { isDarkMode: next };
  }),

  setActiveView: (activeView) => {
    localStorage.setItem('tracker-view', activeView);
    set({ activeView });
  },

  updateCollaborationUsers: (collaborationUsers) => set({ collaborationUsers }),

  clearFilters: () => set({ filters: initialFilters }),
}));
