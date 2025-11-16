import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '@/components/chat/types';

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
  overrideMapItemCoords: (sessionId: string, itemId: string | number, coords: { latitude: number; longitude: number }) => void;
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
        if (raw) {
          const loaded: ChatHistoryState = JSON.parse(raw);
          setState(loaded);
        }
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
      return null;
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
      try { console.log('appendMessage', { id, message }); } catch {}
      setState(prev => {
        const next = prev.sessions.map(s => s.id === id ? { ...s, messages: [message, ...s.messages], updatedAt: Date.now(), unsynced: true } : s);
        return { sessions: next };
      });
    },
    overrideMapItemCoords: (sessionId: string, itemId: string | number, coords: { latitude: number; longitude: number }) => {
      try { console.log('overrideMapItemCoords', { sessionId, itemId, coords }); } catch {}
      setState(prev => {
        const next = prev.sessions.map(s => {
          if (s.id !== sessionId) return s;
          const updatedMessages = s.messages.map(m => {
            if (m.type === 'map' && Array.isArray(m.mapItems)) {
              const updatedItems = m.mapItems.map(mi => {
                const match = mi.id !== undefined ? mi.id === itemId : false;
                if (match) {
                  try { console.log('overrideMapItemCoords matched', { item: mi }); } catch {}
                  return { ...mi, coords };
                }
                return mi;
              });
              return { ...m, mapItems: updatedItems } as ChatMessage;
            }
            return m;
          });
          return { ...s, messages: updatedMessages, updatedAt: Date.now(), unsynced: true };
        });
        return { sessions: next };
      });
    },
    deleteSession: (id: string) => {
      setState(prev => ({ sessions: prev.sessions.filter(s => s.id !== id) }));
    },
    renameSession: (id: string, title: string) => {
      setState(prev => ({ sessions: prev.sessions.map(s => s.id === id ? { ...s, title, updatedAt: Date.now(), unsynced: true } : s) }));
    },
    trySyncSession: async (_id: string) => {},
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