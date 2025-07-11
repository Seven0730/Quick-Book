'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProviderContextValue {
  providerId: number | null;
  setProviderId: (id: number | null) => void;
}

const ProviderContext = createContext<ProviderContextValue | undefined>(undefined);

export function ProviderContextProvider({ children }: { children: ReactNode }) {
  const [providerId, setProviderId] = useState<number | null>(null);
  return (
    <ProviderContext.Provider value={{ providerId, setProviderId }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviderContext() {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProviderContext must be used under ProviderContextProvider');
  return ctx;
}
