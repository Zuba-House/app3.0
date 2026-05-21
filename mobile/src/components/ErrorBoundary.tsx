import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, DevSettings } from 'react-native';
import Colors from '../constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Reload without expo-updates (not in current dev client native build). */
function restartApp(): void {
  if (__DEV__ && DevSettings.reload) {
    DevSettings.reload();
    return;
  }
  console.log('[ErrorBoundary] restart requested — reload unavailable without expo-updates native module');
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  private handleRestart = (): void => {
    this.setState({ hasError: false });
    restartApp();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app hit an unexpected error. You can try restarting to continue.
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
          <Text style={styles.buttonText}>Restart app</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4A5A66',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
