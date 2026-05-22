/**
 * Zuba Mobile App
 * Main entry point
 */

import './src/i18n';
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import Colors from './src/constants/colors';
import { AuthProvider } from './src/core/auth/authGuards';
import { ThemeProvider } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CartHydrator } from './src/components/CartHydrator';
import { toastConfig } from './src/components/toastConfig';
import { loadSavedLanguage } from './src/i18n';

const theme = {
  colors: {
    primary: Colors.primary,
    accent: Colors.secondary,
    background: Colors.background,
    surface: Colors.white,
    text: Colors.primary,
    onSurface: Colors.primary,
    disabled: Colors.primary,
    placeholder: Colors.primary,
    backdrop: Colors.primary,
    notification: Colors.secondary,
  },
  roundness: 16,
};

const App: React.FC = () => {
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[UnhandledPromiseRejection]', event.reason);
    };

    const g = globalThis as typeof globalThis & {
      onunhandledrejection?: ((event: PromiseRejectionEvent) => void) | null;
    };
    const previous = g.onunhandledrejection;
    g.onunhandledrejection = onUnhandledRejection;

    return () => {
      g.onunhandledrejection = previous ?? null;
    };
  }, []);

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <CurrencyProvider>
            <PaperProvider theme={theme}>
              <AuthProvider>
                <CartHydrator />
                <RootNavigator />
                <Toast config={toastConfig} />
              </AuthProvider>
            </PaperProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default App;
