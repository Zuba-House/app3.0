import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer, NavigatorScreenParams, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../components/SplashScreen';
import AppNavigator from './AppNavigator';
import { MainStackParamList } from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthState } from '../core/auth/authGuards';
import { AUTH_EVENTS, authEvents } from '../core/auth/authEvents';
import { AuthGateProvider, AuthIntent } from '../core/auth/authGate';

export type RootStackParamList = {
  MainApp: NavigatorScreenParams<MainStackParamList> | undefined;
  AuthModal: { screen?: 'Login' | 'Register' } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { authStatus } = useAuthState();
  const [showSplash, setShowSplash] = useState(true);
  const [didShowSessionExpiredNotice, setDidShowSessionExpiredNotice] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<AuthIntent | null>(null);

  React.useEffect(() => {
    const unsubExpired = authEvents.on(AUTH_EVENTS.SESSION_EXPIRED, () => {
      if (didShowSessionExpiredNotice) return;
      setDidShowSessionExpiredNotice(true);
      Alert.alert('Session expired', 'Please sign in again to continue.');
    });
    const unsubRestored = authEvents.on(AUTH_EVENTS.SESSION_RESTORED, () => {
      setDidShowSessionExpiredNotice(false);
    });
    return () => {
      unsubExpired();
      unsubRestored();
    };
  }, [didShowSessionExpiredNotice]);

  React.useEffect(() => {
    if (authStatus !== 'authenticated') return;
    if (!pendingIntent || !rootNavigationRef.isReady()) return;
    rootNavigationRef.goBack();
    if (pendingIntent.target) {
      rootNavigationRef.navigate('MainApp', pendingIntent.target as never);
    }
    setPendingIntent(null);
  }, [authStatus, pendingIntent]);

  const openAuth = React.useCallback((intent?: AuthIntent) => {
    setPendingIntent(intent || null);
    if (rootNavigationRef.isReady()) {
      rootNavigationRef.navigate('AuthModal', { screen: 'Login' });
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} duration={1800} />;
  }

  return (
    <AuthGateProvider openAuth={openAuth}>
      <NavigationContainer ref={rootNavigationRef}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainApp" component={AppNavigator} />
          <RootStack.Screen name="AuthModal" component={AuthNavigator} options={{ presentation: 'modal' }} />
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthGateProvider>
  );
};

export default RootNavigator;
