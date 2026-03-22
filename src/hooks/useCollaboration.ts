import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export const useCollaboration = () => {
  const { tasks, collaborationUsers, updateCollaborationUsers } = useTaskStore();
  const timerRef = useRef<number>();

  useEffect(() => {
    if (!tasks.length) return;

    const simulateMovement = () => {
      const updatedUsers = collaborationUsers.map((user) => {
        // 30% chance of staying, 70% chance of moving
        if (Math.random() > 0.7) return user;

        // Pick a random task from the current list
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        return {
          ...user,
          currentTaskId: randomTask.id,
        };
      });

      updateCollaborationUsers(updatedUsers);
      
      const nextMove = 2000 + Math.random() * 5000; // Move every 2-7 seconds
      timerRef.current = window.setTimeout(simulateMovement, nextMove);
    };

    timerRef.current = window.setTimeout(simulateMovement, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tasks.length, collaborationUsers, updateCollaborationUsers]);

  return null;
};
