import React, { createContext, useContext, useMemo, useRef } from 'react';

type UiBusState = {
  newScanResult: any | null;
  askAboutPOI: string | null;
};

type Listener<T> = (v: T) => void;

export function createEmitter<T>() {
  const listeners = new Set<Listener<T>>();
  return {
    subscribe: (l: Listener<T>) => (listeners.add(l), () => listeners.delete(l)),
    publish: (v: T) => listeners.forEach((l) => l(v)),
  };
}

const ScanEmitter = createEmitter<any | null>();
const PoiEmitter = createEmitter<string | null>();

const Ctx = createContext<{ scan: typeof ScanEmitter; poi: typeof PoiEmitter } | null>(null);

export function UiBusProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ scan: ScanEmitter, poi: PoiEmitter }), []);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUiBus() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('UiBusProvider missing');
  return ctx;
}