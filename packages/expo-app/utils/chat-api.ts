import { ChatMessage } from '@/components/chat/types';

export async function sendChat(query: string, attachmentUri?: string, sessionId?: string) {
  const endpoint = 'https://tudor230.app.n8n.cloud/webhook-test/74ee0fbe-6bde-42c4-aa42-cef9de496ce6';
  const userId = '875812bb4985dff0ea018c65afc14ddf';
  const location = { latitude: 46.766667, longitude: 23.583333 };

  if (attachmentUri) {
    const form = new FormData();
    const coords = `${location.latitude} ${location.longitude}`;
    form.append('userId', userId);
    form.append('coords', coords);
    if (sessionId) form.append('sessionId', String(sessionId));
    const ext = (() => {
      const match = attachmentUri.split('?')[0].split('#')[0].match(/\.([a-zA-Z0-9]+)$/);
      return match ? match[1].toLowerCase() : 'jpg';
    })();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    form.append('image', { uri: attachmentUri, name: `image.${ext}`, type: mime } as any);
    try { console.log('Chat API request (attachment)', { endpoint, userId, coords, sessionId }); } catch {}
    const res = await fetch(endpoint, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Chat API failed');
    const json = await res.json();
    console.log('Chat API response:', json);
    return json;
  } else {
    try { console.log('Chat API request (text)', { endpoint, userId, query, sessionId, location }); } catch {}
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: query,
        sessionId: sessionId ?? null,
        location,
      }),
    });
    if (!res.ok) throw new Error('Chat API failed');
    const json = await res.json();
    console.log('Chat API response:', json);
    return json;
  }
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