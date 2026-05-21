/**
 * Keeps an active app session registered for admin "Active Sessions" metrics.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analytics.service';
import { loadPrivacySettings } from '../utils/settingsStorage';
import { useAuthState } from '../core/auth/authGuards';

const SESSION_KEY = 'zuba_analytics_session_id';
const HEARTBEAT_MS = 2 * 60 * 1000;

async function getOrCreateSessionId(): Promise<string> {
  const existing = await AsyncStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(SESSION_KEY, id);
  return id;
}

export function useAppSessionHeartbeat(): void {
  const { user } = useAuthState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sendHeartbeat = async () => {
      const prefs = await loadPrivacySettings();
      if (!prefs.analyticsUsage) return;

      const sessionId = await getOrCreateSessionId();
      if (cancelled) return;

      analyticsService.setSessionId(sessionId);
      if (user?._id) analyticsService.setUserId(String(user._id));

      await analyticsService.sessionHeartbeat(sessionId);
    };

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        void sendHeartbeat();
      }, HEARTBEAT_MS);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void sendHeartbeat();
        startInterval();
      } else {
        stopInterval();
      }
    };

    if (AppState.currentState === 'active') {
      void sendHeartbeat();
      startInterval();
    }

    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      stopInterval();
      sub.remove();
    };
  }, [user?._id]);
}
