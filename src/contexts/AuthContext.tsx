import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserInfo } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  login: (accessToken: string, rememberMe?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const response = await authService.getMe();
      if (response.isSuccess) {
        setUser(response.result);
      } else {
        throw new Error(response.message || '사용자 정보 조회 실패');
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error; // 에러를 상위로 전파하여 initAuth에서 처리하게 함
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (accessToken) {
          await fetchUserInfo();
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        await logout(); // 에러 발생 시(토큰 만료 등) 세션 정리
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token: string, rememberMe: boolean = false) => {
    try {
      setAccessToken(token);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', token);
      await fetchUserInfo();
    } catch (error) {
      // 사용자 정보를 가져오는데 실패하면 로그인 상태 초기화
      setAccessToken(null);
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authService.logout();
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};
