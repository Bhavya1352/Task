import { addDays, format, subDays } from 'date-fns';
import { Task, Priority, Status, User } from '../types';

export const USERS: User[] = [
  { id: '1', name: 'Alice Smith', avatarId: 'AS', color: '#3B82F6' },
  { id: '2', name: 'Bob Johnson', avatarId: 'BJ', color: '#10B981' },
  { id: '3', name: 'Charlie Brown', avatarId: 'CB', color: '#F59E0B' },
  { id: '4', name: 'Diana Prince', avatarId: 'DP', color: '#8B5CF6' },
  { id: '5', name: 'Emma Watson', avatarId: 'EW', color: '#EF4444' },
  { id: '6', name: 'Frank Miller', avatarId: 'FM', color: '#6366F1' }
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

const ADJECTIVES = ['Sleek', 'Reliable', 'Express', 'Quick', 'Secure', 'Modular', 'Dynamic', 'Optimal', 'Efficient', 'Agile'];
const NOUNS = ['System', 'Interface', 'Module', 'Project', 'Tracker', 'Platform', 'Engine', 'Pipeline', 'Framework', 'Application'];
const VERBS = ['Develop', 'Analyze', 'Deploy', 'Enhance', 'Debug', 'Research', 'Integrate', 'Streamline', 'Verify', 'Optimize'];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomTitle() {
  const v = VERBS[getRandomInt(0, VERBS.length - 1)];
  const a = ADJECTIVES[getRandomInt(0, ADJECTIVES.length - 1)];
  const n = NOUNS[getRandomInt(0, NOUNS.length - 1)];
  return `${v} ${a} ${n}`;
}

export function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const status = STATUSES[getRandomInt(0, STATUSES.length - 1)];
    const priority = PRIORITIES[getRandomInt(0, PRIORITIES.length - 1)];
    const assignee = USERS[getRandomInt(0, USERS.length - 1)];
    
    // Mix of overdue, today, future
    const dayOffset = getRandomInt(-20, 20);
    const dueDate = addDays(today, dayOffset);
    
    // Some tasks have no start date
    const hasStartDate = Math.random() > 0.3;
    const startDate = hasStartDate ? subDays(dueDate, getRandomInt(2, 10)) : undefined;

    tasks.push({
      id: `task-${i}`,
      title: generateRandomTitle(),
      description: `This is a description for task ${i}. It involves a lot of work.`,
      status,
      priority,
      assigneeId: assignee.id,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    });
  }

  return tasks;
}
