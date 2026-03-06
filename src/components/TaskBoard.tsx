'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Task, TaskStatus, TeamMember } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { CreateTaskForm } from './CreateTaskForm';

const columns: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'border-gray-300' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-400' },
  { key: 'done', label: 'Done', color: 'border-green-400' },
];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data } = await getSupabase()
      .from('tf_tasks')
      .select('*, assignee:tf_team_members(id, name, email, role)')
      .order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    const { data } = await getSupabase().from('tf_team_members').select('*').order('name');
    if (data) setTeamMembers(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchTeamMembers()]).then(() => setLoading(false));
  }, [fetchTasks, fetchTeamMembers]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await getSupabase()
      .from('tf_tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await getSupabase().from('tf_tasks').delete().eq('id', taskId);
  };

  const handleCreateTask = async (task: {
    title: string;
    description: string;
    priority: string;
    assignee_id: string | null;
  }) => {
    const { data } = await getSupabase()
      .from('tf_tasks')
      .insert({
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        assignee_id: task.assignee_id,
      })
      .select('*, assignee:tf_team_members(id, name, email, role)')
      .single();
    if (data) {
      setTasks((prev) => [data as Task, ...prev]);
    }
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className={`border-t-2 ${col.color} pt-3 mb-3`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-gray-700">{col.label}</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {colTasks.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <CreateTaskForm
          teamMembers={teamMembers}
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
