/**
 * User Types
 * Matches the backend user model
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
}

export interface Address {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressType?: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  addresses?: Address[];
  vendorId?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

