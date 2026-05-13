import type { ApiResponse } from './index';

export interface SignupData {
  email: string;
  password?: string;
  nickname: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface SocialLoginData {
  authorizationCode: string;
}

export interface AuthTokenResult {
  accessToken: string;
}

export type AuthResponse = ApiResponse<AuthTokenResult>;

export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  role?: string;
}

export type UserInfoResponse = ApiResponse<UserInfo>;

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}
