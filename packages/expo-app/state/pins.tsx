import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PinType = 'want' | 'history' | 'bookable';

export type Pin = {
  id: string;
  type: PinType;
  coords: { latitude: number; longitude: number };
  placeId?: string;
  title: string;
  notes?: string;
  source: 'user' | 'eye' | 'chat' | 'api';
  createdAt: number;
};

type PinStoreState = {
  wantToGo: Pin[];
  history: Pin[];
  bookable: Pin[];
};

type PinStore = {
  state: PinStoreState;
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
  clearAll: () => void;
};

const initialState: PinStoreState = { wantToGo: [], history: [], bookable: [] };
const STORAGE_KEY = 'pinStore:v1';

const Ctx = createContext<PinStore | null>(null);

export function PinStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PinStoreState>(initialState);

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

  const value: PinStore = useMemo(() => ({
    state,
    addPin: (pin: Pin) => {
      setState((prev) => {
        const next = { ...prev };
        if (pin.type === 'want') next.wantToGo = [pin, ...prev.wantToGo];
        else if (pin.type === 'history') next.history = [pin, ...prev.history];
        else next.bookable = [pin, ...prev.bookable];
        return next;
      });
    },
    removePin: (id: string) => {
      setState((prev) => ({
        wantToGo: prev.wantToGo.filter((p) => p.id !== id),
        history: prev.history.filter((p) => p.id !== id),
        bookable: prev.bookable.filter((p) => p.id !== id),
      }));
    },
    clearAll: () => setState(initialState),
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePins() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('PinStoreProvider missing');
  return ctx;
}