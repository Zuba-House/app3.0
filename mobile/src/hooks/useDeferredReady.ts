import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

/** Defer below-the-fold UI until after navigation/animations finish. */
export function useDeferredReady(delayMs = 0): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const task = InteractionManager.runAfterInteractions(() => {
      if (delayMs <= 0) {
        if (!cancelled) setReady(true);
        return;
      }
      timeoutId = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, delayMs);
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      task.cancel();
    };
  }, [delayMs]);

  return ready;
}
