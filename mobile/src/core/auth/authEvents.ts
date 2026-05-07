export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_RESTORED: 'SESSION_RESTORED',
} as const;

export type AuthEventType = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];

export interface AuthEventPayloadMap {
  SESSION_EXPIRED: { reason: string };
  SESSION_RESTORED: { source: 'bootstrap' | 'refresh' | 'login' | 'register' | 'social' };
}

type AuthEventListener<T extends AuthEventType> = (payload: AuthEventPayloadMap[T]) => void;

class AuthEventBus {
  private listeners: { [K in AuthEventType]: Set<AuthEventListener<K>> } = {
    SESSION_EXPIRED: new Set(),
    SESSION_RESTORED: new Set(),
  };

  emit<T extends AuthEventType>(event: T, payload: AuthEventPayloadMap[T]): void {
    this.listeners[event].forEach((listener) => listener(payload as never));
  }

  on<T extends AuthEventType>(event: T, listener: AuthEventListener<T>): () => void {
    this.listeners[event].add(listener as never);
    return () => {
      this.listeners[event].delete(listener as never);
    };
  }
}

export const authEvents = new AuthEventBus();
