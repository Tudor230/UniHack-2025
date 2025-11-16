import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PinType = 'want' | 'events';

export type Pin = {
  id: string;
  type: PinType;
  coords: { latitude: number; longitude: number };
  title: string;
  notes?: string;
  createdAt: number;
  eventDate?: number;
  source?: 'user' | 'eye' | 'chat' | 'api';
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
const EVENTS_API_URL = 'https://backend-507j.onrender.com/events';

const Ctx = createContext<PinStore | null>(null);

async function fetchEvents(): Promise<Pin[]> {
  console.log('Fetching events from API...');
  try {
    const response = await fetch(EVENTS_API_URL);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Fetched event data is not an array:', data);
      return [];
    }

    // Transform the API data into Pin objects
    return data.map((item: any) => {
      
      const safeDate = item.scheduledTime ? new Date(item.scheduledTime) : null;
      const eventTimestamp = safeDate ? safeDate.getTime() : undefined;
      
      // --- THIS IS THE CHANGE ---
      // Format the date for the 'notes' field
      let formattedDate: string | undefined = undefined;
      if (safeDate) {
        // Creates a string like "October 21, 2025, 7:12 AM"
        // You can adjust these options if you prefer a different format
        formattedDate = safeDate.toLocaleString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      // --- END OF CHANGE ---

      return {
        id: String(item.id),
        type: 'events',
        title: item.name || 'Untitled Event',
        coords: { 
          latitude: item.location.lat, 
          longitude: item.location.lng 
        },
        eventDate: eventTimestamp, // Keep the timestamp for logic
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        notes: formattedDate, // Use the formatted date as the note
        source: 'api',
      };
    });

  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export function PinStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PinStoreState>(initialState);

  // This hook loads user state AND fetches events
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
        
        const eventPins = await fetchEvents();

        setState({
          ...loadedState, // Loads saved 'wantToGo' pins
          events: eventPins,  // Overwrites 'events' with fresh API data
        });

      } catch (error) {
        console.error('Failed to load pin data:', error);
        setState({
          ...initialState,
          events: [],
        });
      }
    })();
  }, []);

  // This hook *only* saves 'wantToGo' pins
  useEffect(() => {
    (async () => {
      try {
        const stateToSave = {
          ...state,
          events: [], // Don't save API events to local storage
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {}
    })();
  }, [state]);

  // This function is UNCHANGED
  const addPin = useCallback((pin: Pin) => {
    setState((prev) => {
      const next = { ...prev };
      if (pin.type === 'want') next.wantToGo = [pin, ...prev.wantToGo];
      else next.events = [pin, ...prev.events];
      return next;
    });
  }, []);

  // This function is UNCHANGED
  const removePin = useCallback((id: string) => {
    setState((prev) => ({
      wantToGo: prev.wantToGo.filter((p) => p.id !== id),
      events: prev.events.filter((p) => p.id !== id)
    }));
  }, []);

  // 'clearAll' now re-fetches events
  const clearAll = useCallback(() => {
    (async () => {
      console.log('Clearing all user pins, re-fetching events.');
      const eventPins = await fetchEvents();
      setState({
        ...initialState, // Clears 'wantToGo'
        events: eventPins, // Re-loads events from the API
      });
    })();
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