import { Stewrd } from '@stewrd/sdk';
import { TOOL_DEFINITIONS, handleToolCall } from '@/lib/tools';

const stewrd = new Stewrd(process.env.STEWRD_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await stewrd.agent.runWithTools(
      {
        message: `You are a project management AI assistant for TaskFlow. You help users manage their tasks, sprints, and team assignments on a Kanban board. Be concise and helpful. When you create, update, or delete tasks, confirm what you did.\n\nUser: ${message}`,
        tools: TOOL_DEFINITIONS,
      },
      async (toolCall) => {
        return await handleToolCall(toolCall);
      }
    );

    return Response.json({ message: response.message || 'Done.' });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
