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

type ChatSessionPayload = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export async function createChatSession(session: ChatSessionPayload) {
  const res = await fetch('/n8n/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error('Create session failed');
  return res.json();
}

export async function syncChatSession(session: ChatSessionPayload) {
  const res = await fetch(`/n8n/chat/sessions/${encodeURIComponent(session.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error('Sync session failed');
  return res.json();
}

export async function fetchChatSession(id: string) {
  const res = await fetch(`/n8n/chat/sessions/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Fetch session failed');
  return res.json();
}

export async function listChatSessions() {
  const res = await fetch('/n8n/chat/sessions');
  if (!res.ok) throw new Error('List sessions failed');
  return res.json();
}