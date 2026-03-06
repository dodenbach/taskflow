export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string;
  created_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'active' | 'completed';
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string | null;
  sprint_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee?: TeamMember | null;
  sprint?: Sprint | null;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
