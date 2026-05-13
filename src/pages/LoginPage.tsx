import { useState, useEffect, type SubmitEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
const IS_KAKAO_CONFIGURED = Boolean(KAKAO_CLIENT_ID && KAKAO_REDIRECT_URI);
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const locationState = location.state as any;
  const [error, setError] = useState<string | null>(null);
  const successMessage = locationState?.message;

  // 네비게이션 상태에서 에러 메시지 동기화
  useEffect(() => {
    if (locationState?.error) {
      setError(locationState.error);
      // 새로고침 시 에러가 다시 표시되지 않도록 상태 정리
      navigate(location.pathname, { replace: true, state: { ...locationState, error: null } });
    }
  }, [locationState?.error, navigate, location.pathname]);

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      if (response.isSuccess) {
        await setAuth(response.result.accessToken, rememberMe);
        navigate('/');
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'kakao') {
      if (!IS_KAKAO_CONFIGURED) {
        setError('카카오 로그인 설정이 누락되었습니다. 관리자에게 문의하세요.');
        return;
      }
      window.location.href = KAKAO_AUTH_URL;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 relative overflow-hidden py-6 md:py-10">
      {/* 메쉬 그라데이션 효과 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-linear-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-linear-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-[120px] animate-pulse duration-[12s]"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-100/10 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-500 font-extrabold text-xl md:text-2xl tracking-tight">
            스마트 스케줄러와 함께 오늘을 관리하세요
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] p-6 md:p-9 shadow-2xl shadow-slate-200/60">
          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">이메일 주소</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-13 pr-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">비밀번호</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-13 pr-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-0.5">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all" 
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <span className="ml-3 text-slate-500 font-semibold group-hover:text-slate-700 transition-colors">로그인 유지</span>
              </label>
              <Link to="/forgot-password" title="비밀번호 찾기" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">비밀번호 찾기</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  로그인하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/0 px-4 text-slate-400 font-bold tracking-widest backdrop-blur-sm">또는 소셜 로그인</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              className="flex items-center justify-center gap-3 py-3.5 bg-[#FEE500] hover:bg-[#FDD835] active:scale-[0.98] text-[#3C1E1E] rounded-xl font-bold transition-all w-full shadow-lg shadow-yellow-100/50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.315 6.055-.188.702-.68 2.531-.779 2.898-.125.466.16.46.337.342.138-.093 2.193-1.488 3.078-2.091.344.05.694.076 1.049.076 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
              </svg>
              카카오로 시작하기
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium text-lg">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors ml-1">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
};
