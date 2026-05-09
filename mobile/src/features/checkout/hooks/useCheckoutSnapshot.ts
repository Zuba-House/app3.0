import { useSyncExternalStore } from 'react';
import { checkoutStore } from '../store/checkoutStore';

export function useCheckoutSnapshot() {
  return useSyncExternalStore(checkoutStore.subscribe, checkoutStore.getState, checkoutStore.getState);
}

