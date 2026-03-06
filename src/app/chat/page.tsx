import { ChatInterface } from '@/components/ChatInterface';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <ChatInterface />
    </>
  );
}
