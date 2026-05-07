import { AuthState, UserDTO } from './authTypes';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  authStatus: 'idle',
  isLoading: false,
  isHydrated: false,
};

type Listener = (state: AuthState) => void;

class AuthSessionStore {
  private state: AuthState = initialState;
  private refreshToken: string | null = null;
  private listeners = new Set<Listener>();

  getState(): AuthState {
    return this.state;
  }

  getAccessToken(): string | null {
    return this.state.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  clearSensitiveMemory(): void {
    this.refreshToken = null;
    this.state = {
      ...this.state,
      accessToken: null,
      user: null,
    };
  }

  setState(next: Partial<AuthState>): void {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener(this.state));
  }

  setAuthenticated(user: UserDTO, accessToken: string): void {
    this.setState({
      user,
      accessToken,
      authStatus: 'authenticated',
      isLoading: false,
      isHydrated: true,
    });
  }

  setGuest(isHydrated = true): void {
    this.setState({
      user: null,
      accessToken: null,
      authStatus: 'guest',
      isLoading: false,
      isHydrated,
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetForTests(): void {
    this.state = { ...initialState };
    this.refreshToken = null;
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const authSession = new AuthSessionStore();
