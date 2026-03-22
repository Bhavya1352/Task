export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface User {
  id: string;
  name: string;
  avatarId: string; // Used for initials fallback
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  startDate?: string;
  dueDate: string;
}

export interface FilterState {
  status: Status[];
  priority: Priority[];
  assignees: string[];
  dateRange: {
    from: string;
    to: string;
  };
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  currentTaskId?: string;
}
