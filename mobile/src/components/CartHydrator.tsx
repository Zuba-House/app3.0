/**
 * Loads cart into Redux on app start (guest: AsyncStorage, auth: API).
 * Fixes badge/cart screen showing empty until Cart tab is opened.
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCart } from '../store/slices/cartSlice';
import { useAuthState } from '../core/auth/authGuards';
import { cartService } from '../services/cart.service';
import { loadGuestCartFromStorage } from '../utils/guestCart';

export function CartHydrator() {
  const dispatch = useAppDispatch();
  const { authStatus } = useAuthState();
  const lastAuthRef = useRef<string | null>(null);

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (lastAuthRef.current === authStatus) return;
    lastAuthRef.current = authStatus;

    (async () => {
      if (authStatus === 'authenticated') {
        try {
          const response = await cartService.getCart();
          if (response.success && Array.isArray(response.data)) {
            dispatch(setCart(response.data));
          }
        } catch {
          // Cart hydrate is best-effort
        }
        return;
      }

      const items = await loadGuestCartFromStorage();
      if (items.length > 0) {
        dispatch(setCart({ items }));
      }
    })();
  }, [authStatus, dispatch]);

  return null;
}

export default CartHydrator;
