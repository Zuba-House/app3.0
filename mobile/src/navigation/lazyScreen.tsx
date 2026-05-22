import React, { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Colors from '../constants/colors';

function ScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color={Colors.secondary} />
    </View>
  );
}

/** Defer heavy screen bundles until first navigation. */
export function lazyScreen<P extends object>(
  factory: () => Promise<{ default: React.ComponentType<P> }>
): React.ComponentType<P> {
  const Lazy = React.lazy(factory);
  return function LazyWrapped(props: P) {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
