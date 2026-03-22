import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Status, Priority } from '../../types';
import { USERS } from '../../lib/data-generator';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters, clearFilters, search, setSearch } = useTaskStore();

  const toggleStatus = (status: Status) => {
    const next = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    setFilters({ status: next });
  };

  const togglePriority = (priority: Priority) => {
    const next = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    setFilters({ priority: next });
  };

  const toggleAssignee = (id: string) => {
    const next = filters.assignees.includes(id)
      ? filters.assignees.filter((a) => a !== id)
      : [...filters.assignees, id];
    setFilters({ assignees: next });
  };

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.assignees.length > 0 ||
    filters.dateRange.from !== '' ||
    filters.dateRange.to !== '';

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <Dropdown
        trigger={
          <Button variant="outline" size="sm" className="gap-2 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            Status
            {filters.status.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {filters.status.length}
              </span>
            )}
            <ChevronDown size={14} />
          </Button>
        }
      >
        <div className="dark:bg-slate-900 dark:border-slate-800">
          {(['todo', 'in-progress', 'in-review', 'done'] as Status[]).map((s) => (
            <DropdownItem key={s} onClick={() => toggleStatus(s)} active={filters.status.includes(s)} className="dark:hover:bg-slate-800">
              <span className="dark:text-slate-300">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </DropdownItem>
          ))}
        </div>
      </Dropdown>

      <Dropdown
        trigger={
          <Button variant="outline" size="sm" className="gap-2 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            Priority
            {filters.priority.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {filters.priority.length}
              </span>
            )}
            <ChevronDown size={14} />
          </Button>
        }
      >
        <div className="dark:bg-slate-900 dark:border-slate-800">
          {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
            <DropdownItem key={p} onClick={() => togglePriority(p)} active={filters.priority.includes(p)} className="dark:hover:bg-slate-800">
              <span className="dark:text-slate-300">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            </DropdownItem>
          ))}
        </div>
      </Dropdown>

      <Dropdown
        trigger={
          <Button variant="outline" size="sm" className="gap-2 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            Assignee
            {filters.assignees.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {filters.assignees.length}
              </span>
            )}
            <ChevronDown size={14} />
          </Button>
        }
      >
        <div className="max-h-60 overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          {USERS.map((u) => (
            <DropdownItem key={u.id} onClick={() => toggleAssignee(u.id)} active={filters.assignees.includes(u.id)} className="dark:hover:bg-slate-800">
              <span className="dark:text-slate-300">{u.name}</span>
            </DropdownItem>
          ))}
        </div>
      </Dropdown>

      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-800 dark:bg-slate-900">
        <label className="text-xs font-medium text-gray-500 dark:text-slate-500">From:</label>
        <input
          type="date"
          className="bg-transparent text-sm focus:outline-none dark:text-slate-300"
          value={filters.dateRange.from}
          onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, from: e.target.value } })}
        />
        <label className="text-xs font-medium text-gray-500 dark:text-slate-500">To:</label>
        <input
          type="date"
          className="bg-transparent text-sm focus:outline-none dark:text-slate-300"
          value={filters.dateRange.to}
          onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, to: e.target.value } })}
        />
      </div>

      <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 min-w-[200px] dark:border-slate-800 dark:bg-slate-900">
        <Search size={16} className="text-gray-400 dark:text-slate-600" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-transparent text-sm focus:outline-none dark:text-slate-300 dark:placeholder:text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={clearFilters}>
          <X size={16} className="mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
