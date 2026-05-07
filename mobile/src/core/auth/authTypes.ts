import { User } from '../../types/user.types';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest' | 'refreshing';

export interface SessionDTO {
  accessToken: string;
  refreshToken: string;
}

export interface UserDTO extends User {}

export interface AuthResponse {
  session: SessionDTO;
  user: UserDTO;
}

export interface RefreshResponse {
  session: SessionDTO;
}

export interface ApiResponse<T> {
  success: boolean;
  error: boolean;
  message?: string;
  data?: T;
}

export interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  isHydrated: boolean;
}
