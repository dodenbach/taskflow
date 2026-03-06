'use client';

import type { Task, TaskStatus } from '@/lib/types';

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 shrink-0 text-xs"
          title="Delete task"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </span>
          {task.assignee && (
            <span className="text-xs text-gray-500">{task.assignee.name}</span>
          )}
        </div>
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          title={`Move to ${nextStatus[task.status].replace('_', ' ')}`}
        >
          {task.status === 'todo' && '▶ Start'}
          {task.status === 'in_progress' && '✓ Done'}
          {task.status === 'done' && '↩ Reset'}
        </button>
      </div>
    </div>
  );
}
