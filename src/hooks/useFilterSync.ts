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
    // Only push if different from current to avoid history bloating
    if (window.location.search !== `?${params.toString()}`) {
      window.history.pushState({ ...window.history.state, path: newPath }, '', newPath);
    }
  }, [filters]);

  const syncFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters = {
      status: (params.get('status')?.split(',').filter(Boolean) as Status[]) || [],
      priority: (params.get('priority')?.split(',').filter(Boolean) as Priority[]) || [],
      assignees: params.get('assignees')?.split(',').filter(Boolean) || [],
      dateRange: {
        from: params.get('from') || '',
        to: params.get('to') || '',
      },
    };
    
    setFilters(urlFilters);
  }, [setFilters]);

  useEffect(() => {
    // Initial sync from URL
    syncFromUrl();

    // Listen for back/forward navigation
    const handlePopState = () => syncFromUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncFromUrl]);

  useEffect(() => {
    syncToUrl();
  }, [filters, syncToUrl]);

  return null;
};
