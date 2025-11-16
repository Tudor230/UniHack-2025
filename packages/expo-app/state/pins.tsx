import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import historyData from '@/assets/data/history-pins.json';

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
  eventDate?: number;
};

type PinStoreState = {
  wantToGo: Pin[];
  events: Pin[];
};

type PinStore = {
  state: PinStoreState;
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
  clearAll: () => void;
};

const initialState: PinStoreState = { wantToGo: [], events: []};
const STORAGE_KEY = 'pinStore:v1';

const Ctx = createContext<PinStore | null>(null);

function getDefaultHistoryPins(): Pin[] {
  console.log('Generating default history pins from JSON...');
  return historyData.map((item: any) => ({
    id: `hist-${item.name.replace(/\s+/g, '-')}`,
    type: 'history',
    coords: { latitude: item.latitude, longitude: item.longitude },
    title: item.name,
    source: 'api',
    createdAt: Date.now(),
  }));
}

export function PinStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PinStoreState>(initialState);

  useEffect(() => {
    (async () => {
      let loadedState = initialState;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (raw) {
          loadedState = JSON.parse(raw);
          console.log('Loaded user state from storage.');
        } else {
          console.log('No user state found (first load or cleared).');
        }
        
        const historyPins = getDefaultHistoryPins();

        setState({
          ...loadedState,
          events: historyPins,
        });

      } catch (error) {
        console.error('Failed to load pin data:', error);
        setState({
          ...initialState,
          events: getDefaultHistoryPins(),
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    })();
  }, [state]);

  const addPin = useCallback((pin: Pin) => {
    setState((prev) => {
      const next = { ...prev };
      if (pin.type === 'want') next.wantToGo = [pin, ...prev.wantToGo];
      else next.events = [pin, ...prev.events];
      return next;
    });
  }, []);

  const removePin = useCallback((id: string) => {
    setState((prev) => ({
      wantToGo: prev.wantToGo.filter((p) => p.id !== id),
      events: prev.events.filter((p) => p.id !== id)
    }));
  }, []);

  const clearAll = useCallback(() => {
    console.log('Clearing all user pins, resetting history pins.');
    const historyPins = getDefaultHistoryPins();
    setState({
      ...initialState,
      events: historyPins,
    });
  }, []);

  const value: PinStore = useMemo(() => ({
    state,
    addPin,
    removePin,
    clearAll,
  }), [state, addPin, removePin, clearAll]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePins() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('PinStoreProvider missing');
  return ctx;
}