import { API_ENDPOINTS } from '../constants/config';
import { editData, postData, deleteData, uploadImage } from './api';
import { authManager } from '../core/auth/authManager';
import { authSession } from '../core/auth/authSession';
import { authStorage } from '../core/auth/authStorage';
import type { User } from '../types/user.types';

export type ProfileUpdatePayload = {
  name?: string;
  mobile?: string;
  bio?: string;
  avatar?: string;
};

export const userService = {
  async updateProfile(payload: ProfileUpdatePayload): Promise<User> {
    const res = await editData<{ user: User }>(API_ENDPOINTS.UPDATE_PROFILE, {
      name: payload.name,
      mobile: payload.mobile,
      email: undefined,
    });
    const raw = res.data as unknown;
    const user =
      raw && typeof raw === 'object' && 'user' in raw
        ? (raw as { user: User }).user
        : (raw as User);
    if (user?._id) {
      const current = authSession.getState().user;
      const merged = { ...current, ...user, ...payload } as User;
      authSession.setAuthenticated(merged, authSession.getAccessToken()!);
      await authStorage.setUserCache(merged);
      return merged;
    }
    await authManager.fetchCurrentUser();
    return authSession.getState().user as User;
  },

  async uploadAvatar(uri: string): Promise<string | null> {
    try {
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      const file = { uri, name: filename, type } as unknown as Blob;
      const res = await uploadImage(file);
      const url =
        (res.data as { url?: string })?.url ??
        (res.data as { image?: string })?.image ??
        (res.data as string);
      return typeof url === 'string' ? url : null;
    } catch {
      return null;
    }
  },

  async changePassword(input: {
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string }> {
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, message: 'New passwords must match' };
    }
    try {
      const res = await postData(API_ENDPOINTS.CHANGE_PASSWORD, {
        email: input.email,
        newPassword: input.newPassword,
        confirmPassword: input.confirmPassword,
      });
      return {
        success: res.success !== false && res.error !== true,
        message: res.message,
      };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Failed to update password',
      };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await deleteData(API_ENDPOINTS.DELETE_ACCOUNT);
      return {
        success: response.success !== false && response.error !== true,
        message: response.message,
      };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Could not delete account',
      };
    }
  },
};
