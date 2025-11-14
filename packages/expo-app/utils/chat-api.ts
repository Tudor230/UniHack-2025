import { ChatMessage } from '@/components/chat/types';

export async function sendChat(query: string, history: ChatMessage[]) {
  const res = await fetch('/n8n/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
  });
  if (!res.ok) throw new Error('Chat API failed');
  return res.json();
}