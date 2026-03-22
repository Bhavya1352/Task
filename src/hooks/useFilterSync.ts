import { useEffect, useCallback } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Status, Priority } from '../types';

export const useFilterSync = () => {
  const { filters, setFilters } = useTaskStore();

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.priority.length > 0) params.set('priority', filters.priority.join(','));
    if (filters.assignees.length > 0) params.set('assignees', filters.assignees.join(','));
    if (filters.dateRange.from) params.set('from', filters.dateRange.from);
    if (filters.dateRange.to) params.set('to', filters.dateRange.to);

    const newPath = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, path: newPath }, '', newPath);
  }, [filters]);

  useEffect(() => {
    // Initial sync from URL
    const params = new URLSearchParams(window.location.search);
    const urlFilters = {
      status: (params.get('status')?.split(',') as Status[]) || [],
      priority: (params.get('priority')?.split(',') as Priority[]) || [],
      assignees: params.get('assignees')?.split(',') || [],
      dateRange: {
        from: params.get('from') || '',
        to: params.get('to') || '',
      },
    };
    
    // Only update if there's something in the URL
    if (params.toString()) {
      setFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    syncToUrl();
  }, [filters, syncToUrl]);

  return null;
};
