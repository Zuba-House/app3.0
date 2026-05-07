import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { authManager } from './authManager';
import { AuthState } from './authTypes';
import { useAuthGate } from './authGate';

interface AuthContextValue extends AuthState {
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    authManager.bootstrap().catch(() => authManager.forceLogout('bootstrap_error'));
  }, []);

  const state = useSyncExternalStore(authManager.subscribe, authManager.getState, authManager.getState);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: authManager.login.bind(authManager),
      register: authManager.register.bind(authManager),
      logout: authManager.logout.bind(authManager),
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthState(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthState must be used inside AuthProvider');
  return context;
}

export function useAuthSelector<T>(selector: (state: AuthContextValue) => T): T {
  const state = useAuthState();
  return selector(state);
}

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authStatus } = useAuthState();
  const { openAuth } = useAuthGate();

  if (authStatus !== 'authenticated') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.background }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.primary }}>Sign in required</Text>
        <Button mode="contained" onPress={() => openAuth()} style={{ marginTop: 16 }}>
          Go to Login
        </Button>
      </View>
    );
  }

  return <>{children}</>;
};
