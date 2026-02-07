"use client";

import type { Status, Priority } from "@/lib/tasks";

interface TaskFilterProps {
  statusFilter: Status | "all";
  priorityFilter: Priority | "all";
  onStatusChange: (status: Status | "all") => void;
  onPriorityChange: (priority: Priority | "all") => void;
}

export default function TaskFilter({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: TaskFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as Status | "all")}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as Priority | "all")}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}
