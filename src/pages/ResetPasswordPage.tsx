import { useState, useEffect, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 접근입니다. 재설정 링크를 다시 요청해주세요.');
    }
  }, [token]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword({ token, newPassword: password });
      if (response.isSuccess) {
        setIsSuccess(true);
        setTimeout(() => navigate('/login', { state: { message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.' } }), 3000);
      } else {
        setError(response.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 relative overflow-hidden py-6 md:py-10">
        <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] p-8 md:p-10 shadow-2xl shadow-slate-200/60 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">비밀번호 변경 완료</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              성공적으로 비밀번호가 변경되었습니다.<br />잠시 후 로그인 페이지로 이동합니다.
            </p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full animate-[progress_3s_linear]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 relative overflow-hidden py-6 md:py-10">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-linear-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-linear-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">새 비밀번호 설정</h1>
          <p className="text-slate-500 font-medium">기억하기 쉬운 새로운 비밀번호를 입력해주세요.</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] p-6 md:p-9 shadow-2xl shadow-slate-200/60">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">새 비밀번호</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-13 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                  disabled={!token}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">새 비밀번호 확인</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-13 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                  disabled={!token}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  비밀번호 변경하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
