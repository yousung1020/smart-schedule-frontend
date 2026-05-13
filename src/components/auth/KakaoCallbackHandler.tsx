import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

// 인가 코드 중복 처리 방지를 위한 모듈 레벨 세트
const handledCodes = new Set<string>();

export const KakaoCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && !hasCalled.current && !handledCodes.has(code)) {
      hasCalled.current = true;
      handledCodes.add(code);
      handleKakaoLogin(code);
    } else if (!code) {
      navigate('/login');
    }
  }, [searchParams]);

  const handleKakaoLogin = async (code: string) => {
    try {
      const response = await authService.socialLogin('kakao', { authorizationCode: code });
      if (response.isSuccess) {
        await setAuth(response.result.accessToken);
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true, state: { error: response.message || '카카오 로그인에 실패했습니다.' } });
      }
    } catch (error: any) {
      console.error('카카오 로그인 오류:', error);
      navigate('/login', { state: { error: '서버와의 통신 중 오류가 발생했습니다.' } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-bold animate-pulse text-lg">카카오 로그인 처리 중...</p>
    </div>
  );
};
