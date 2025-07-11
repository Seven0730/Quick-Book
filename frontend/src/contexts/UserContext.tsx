'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'customer' | 'provider' | null;

interface UserContextValue {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <UserContext.Provider value={{ 
      userRole, 
      setUserRole, 
      isAuthenticated, 
      setIsAuthenticated 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used under UserContextProvider');
  return ctx;
} 