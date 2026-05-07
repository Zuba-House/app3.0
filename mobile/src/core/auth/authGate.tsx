import React, { createContext, useContext } from 'react';

export interface AuthIntent {
  target?: Record<string, unknown>;
}

interface AuthGateContextValue {
  openAuth: (intent?: AuthIntent) => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export const AuthGateProvider: React.FC<{
  children: React.ReactNode;
  openAuth: (intent?: AuthIntent) => void;
}> = ({ children, openAuth }) => {
  return <AuthGateContext.Provider value={{ openAuth }}>{children}</AuthGateContext.Provider>;
};

export function useAuthGate(): AuthGateContextValue {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error('useAuthGate must be used within AuthGateProvider');
  }
  return context;
}
