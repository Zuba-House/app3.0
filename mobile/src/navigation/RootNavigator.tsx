import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../components/SplashScreen';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { RootStackParamList, rootNavigationRef } from './rootNavigationRef';
import { useAuthState } from '../core/auth/authGuards';
import { AUTH_EVENTS, authEvents } from '../core/auth/authEvents';
import { AuthGateProvider, AuthIntent } from '../core/auth/authGate';
import { subscribePaymentDeepLinks } from './paymentDeepLinks';
import { showError } from '../utils/toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAppSessionHeartbeat } from '../hooks/useAppSessionHeartbeat';
import { useAppTheme } from '../context/ThemeContext';

export type { RootStackParamList } from './rootNavigationRef';
export { rootNavigationRef } from './rootNavigationRef';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { navigationTheme } = useAppTheme();
  const { authStatus } = useAuthState();
  const [showSplash, setShowSplash] = useState(true);
  const [didShowSessionExpiredNotice, setDidShowSessionExpiredNotice] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<AuthIntent | null>(null);

  React.useEffect(() => subscribePaymentDeepLinks(), []);
  usePushNotifications();
  useAppSessionHeartbeat();

  React.useEffect(() => {
    const unsubExpired = authEvents.on(AUTH_EVENTS.SESSION_EXPIRED, () => {
      if (didShowSessionExpiredNotice) return;
      setDidShowSessionExpiredNotice(true);
      showError('Session expired. Please sign in again to continue.');
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
      <ErrorBoundary>
        <NavigationContainer ref={rootNavigationRef} theme={navigationTheme}>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainApp" component={AppNavigator} />
            <RootStack.Screen name="AuthModal" component={AuthNavigator} options={{ presentation: 'modal' }} />
          </RootStack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </AuthGateProvider>
  );
};

export default RootNavigator;
