import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '@/components/chat/types';
import { createChatSession, syncChatSession, fetchChatSession } from '@/utils/chat-api';

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  unsynced: boolean;
};

type ChatHistoryState = {
  sessions: ChatSession[];
};

type ChatHistoryStore = {
  state: ChatHistoryState;
  listSessions: () => ChatSession[];
  getSession: (id: string) => ChatSession | null;
  loadSession: (id: string) => Promise<ChatSession | null>;
  createSession: (firstUserMessage: ChatMessage) => string;
  appendMessage: (id: string, message: ChatMessage) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  trySyncSession: (id: string) => Promise<void>;
  adoptSessionId: (oldId: string, newId: string) => void;
};

const STORAGE_KEY = 'chatHistory:v1';
const initialState: ChatHistoryState = { sessions: [] };

const Ctx = createContext<ChatHistoryStore | null>(null);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatHistoryState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    })();
  }, [state]);

  const value: ChatHistoryStore = useMemo(() => ({
    state,
    listSessions: () => state.sessions,
    getSession: (id: string) => state.sessions.find(s => s.id === id) ?? null,
    loadSession: async (id: string) => {
      const local = state.sessions.find(s => s.id === id);
      if (local) return local;
      try {
        const remote = await fetchChatSession(id);
        if (!remote) return null;
        setState(prev => ({ sessions: [remote, ...prev.sessions] }));
        return remote;
      } catch {
        return null;
      }
    },
    createSession: (firstUserMessage: ChatMessage) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const title = (firstUserMessage.text ?? 'New Chat').slice(0, 40);
      const now = Date.now();
      const session: ChatSession = {
        id,
        title: title.length ? title : 'New Chat',
        createdAt: now,
        updatedAt: now,
        messages: [firstUserMessage],
        unsynced: true,
      };
      setState(prev => ({ sessions: [session, ...prev.sessions] }));
      return id;
    },
    appendMessage: (id: string, message: ChatMessage) => {
      setState(prev => {
        const next = prev.sessions.map(s => s.id === id ? { ...s, messages: [message, ...s.messages], updatedAt: Date.now(), unsynced: true } : s);
        return { sessions: next };
      });
    },
    deleteSession: (id: string) => {
      setState(prev => ({ sessions: prev.sessions.filter(s => s.id !== id) }));
    },
    renameSession: (id: string, title: string) => {
      setState(prev => ({ sessions: prev.sessions.map(s => s.id === id ? { ...s, title, updatedAt: Date.now(), unsynced: true } : s) }));
    },
    trySyncSession: async (id: string) => {
      const session = state.sessions.find(s => s.id === id);
      if (!session) return;
      try {
        if (session.createdAt === session.updatedAt) {
          await createChatSession({ id: session.id, title: session.title, createdAt: session.createdAt, updatedAt: session.updatedAt, messages: session.messages });
        } else {
          await syncChatSession({ id: session.id, title: session.title, createdAt: session.createdAt, updatedAt: session.updatedAt, messages: session.messages });
        }
        setState(prev => ({ sessions: prev.sessions.map(s => s.id === id ? { ...s, unsynced: false } : s) }));
      } catch {
        setState(prev => ({ sessions: prev.sessions.map(s => s.id === id ? { ...s, unsynced: true } : s) }));
      }
    },
    adoptSessionId: (oldId: string, newId: string) => {
      if (!oldId || !newId || oldId === newId) return;
      setState(prev => {
        const exists = prev.sessions.some(s => s.id === newId);
        if (exists) {
          return { sessions: prev.sessions.filter(s => s.id !== oldId) };
        }
        const next = prev.sessions.map(s => s.id === oldId ? { ...s, id: newId, unsynced: true } : s);
        return { sessions: next };
      });
    },
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChatHistory() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ChatHistoryProvider missing');
  return ctx;
}