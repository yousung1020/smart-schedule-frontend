import { apiClient, publicApiClient } from '../api/apiClient';
import type { 
  SignupData, 
  LoginData, 
  SocialLoginData, 
  AuthResponse, 
  UserInfoResponse,
  ApiResponse,
  PasswordResetData
} from '../types';

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await publicApiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await publicApiClient.post('/auth/login', data);
    return response.data;
  },

  socialLogin: async (provider: string, data: SocialLoginData): Promise<AuthResponse> => {
    const response = await publicApiClient.post(`/auth/login/${provider}`, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  reissue: async (): Promise<AuthResponse> => {
    const response = await publicApiClient.post('/auth/reissue');
    return response.data;
  },

  getMe: async (): Promise<UserInfoResponse> => {
    const response = await apiClient.get('/members/me');
    return response.data;
  },

  withdraw: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete('/members/me');
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse<null>> => {
    const response = await publicApiClient.post('/auth/password/reset-request', { email });
    return response.data;
  },

  resetPassword: async (data: PasswordResetData): Promise<ApiResponse<null>> => {
    const response = await publicApiClient.post('/auth/password/reset', data);
    return response.data;
  }
};
