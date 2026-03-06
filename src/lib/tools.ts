import { supabaseAdmin } from './supabase-server';
import type { ToolDefinition } from '@stewrd/sdk';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'get_tasks',
    description: 'Get tasks from the project board. Can filter by status, assignee_id, or priority. Returns all tasks if no filters provided.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'Filter by task status',
        },
        assignee_id: {
          type: 'string',
          description: 'Filter by assignee UUID',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority level',
        },
      },
    },
  },
  {
    name: 'get_team_members',
    description: 'List all team members with their names, emails, and roles.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task on the project board.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title (required)',
        },
        description: {
          type: 'string',
          description: 'Task description',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level. Defaults to medium.',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'Task status. Defaults to todo.',
        },
        assignee_id: {
          type: 'string',
          description: 'UUID of the team member to assign',
        },
        sprint_id: {
          type: 'string',
          description: 'UUID of the sprint to add the task to',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task. Can change status, priority, assignee, or description.',
    parameters: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'UUID of the task to update (required)',
        },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'New status',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'New priority',
        },
        assignee_id: {
          type: 'string',
          description: 'UUID of the new assignee, or null to unassign',
        },
        sprint_id: {
          type: 'string',
          description: 'UUID of the sprint, or null to remove from sprint',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task from the project board.',
    parameters: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'UUID of the task to delete (required)',
        },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'get_sprint_summary',
    description:
      'Get a summary of the current active sprint, including total tasks, breakdown by status, and tasks per assignee.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleToolCall(toolCall: {
  name: string;
  arguments: Record<string, unknown>;
}): Promise<string> {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case 'get_tasks': {
      let query = supabaseAdmin
        .from('tf_tasks')
        .select('*, assignee:tf_team_members(id, name, email, role)')
        .order('created_at', { ascending: false });

      if (args.status) query = query.eq('status', args.status as string);
      if (args.assignee_id) query = query.eq('assignee_id', args.assignee_id as string);
      if (args.priority) query = query.eq('priority', args.priority as string);

      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }

    case 'get_team_members': {
      const { data, error } = await supabaseAdmin
        .from('tf_team_members')
        .select('*')
        .order('name');
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }

    case 'create_task': {
      const { data, error } = await supabaseAdmin.from('tf_tasks').insert({
        title: args.title as string,
        description: (args.description as string) || null,
        priority: (args.priority as string) || 'medium',
        status: (args.status as string) || 'todo',
        assignee_id: (args.assignee_id as string) || null,
        sprint_id: (args.sprint_id as string) || null,
      }).select().single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ success: true, task: data });
    }

    case 'update_task': {
      const taskId = args.task_id as string;
      const updates: Record<string, unknown> = {};
      if ('title' in args) updates.title = args.title;
      if ('description' in args) updates.description = args.description;
      if ('status' in args) updates.status = args.status;
      if ('priority' in args) updates.priority = args.priority;
      if ('assignee_id' in args) updates.assignee_id = args.assignee_id || null;
      if ('sprint_id' in args) updates.sprint_id = args.sprint_id || null;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('tf_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      if (!data) return JSON.stringify({ error: 'Task not found' });
      return JSON.stringify({ success: true, task: data });
    }

    case 'delete_task': {
      const { error } = await supabaseAdmin
        .from('tf_tasks')
        .delete()
        .eq('id', args.task_id as string);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ success: true });
    }

    case 'get_sprint_summary': {
      // Get the active sprint
      const { data: sprint } = await supabaseAdmin
        .from('tf_sprints')
        .select('*')
        .eq('status', 'active')
        .single();

      if (!sprint) {
        // Fallback: get all tasks regardless of sprint
        const { data: allTasks } = await supabaseAdmin
          .from('tf_tasks')
          .select('*, assignee:tf_team_members(id, name)');

        const tasks = allTasks || [];
        const byStatus = { todo: 0, in_progress: 0, done: 0 };
        const byAssignee: Record<string, number> = {};

        for (const t of tasks) {
          byStatus[t.status as keyof typeof byStatus]++;
          const name = t.assignee?.name || 'Unassigned';
          byAssignee[name] = (byAssignee[name] || 0) + 1;
        }

        return JSON.stringify({
          sprint: null,
          note: 'No active sprint found. Showing summary of all tasks.',
          total_tasks: tasks.length,
          by_status: byStatus,
          by_assignee: byAssignee,
        });
      }

      const { data: tasks } = await supabaseAdmin
        .from('tf_tasks')
        .select('*, assignee:tf_team_members(id, name)')
        .eq('sprint_id', sprint.id);

      const sprintTasks = tasks || [];
      const byStatus = { todo: 0, in_progress: 0, done: 0 };
      const byAssignee: Record<string, number> = {};

      for (const t of sprintTasks) {
        byStatus[t.status as keyof typeof byStatus]++;
        const name = t.assignee?.name || 'Unassigned';
        byAssignee[name] = (byAssignee[name] || 0) + 1;
      }

      return JSON.stringify({
        sprint: { id: sprint.id, name: sprint.name, status: sprint.status },
        total_tasks: sprintTasks.length,
        by_status: byStatus,
        by_assignee: byAssignee,
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
