/**
 * Zuba Mobile App
 * Main entry point
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import Colors from './src/constants/colors';
import { AuthProvider } from './src/core/auth/authGuards';

// Custom theme for React Native Paper
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
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;

