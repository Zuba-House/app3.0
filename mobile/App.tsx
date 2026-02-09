/**
 * Zuba Mobile App
 * Main entry point
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import Colors from './src/constants/colors';

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
        <AppNavigator />
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;

