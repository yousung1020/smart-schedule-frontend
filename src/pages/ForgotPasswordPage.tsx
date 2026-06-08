import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.requestPasswordReset(email);
      if (response.isSuccess) {
        setIsSent(true);
      } else {
        setError(response.message || '요청에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 relative overflow-hidden py-6 md:py-10">
        <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] p-8 md:p-10 shadow-2xl shadow-slate-200/60 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">이메일 발송 완료</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              비밀번호 재설정 링크를 <strong>{email}</strong> 주소로 보냈습니다. 메일함(또는 스팸함)을 확인해주세요.
            </p>
            <Link 
              to="/login"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              로그인 페이지로 돌아가기
            </Link>
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">비밀번호를 잊으셨나요?</h1>
          <p className="text-slate-500 font-medium">가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] p-6 md:p-9 shadow-2xl shadow-slate-200/60">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">이메일 주소</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-13 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
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
                  재설정 메일 보내기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-indigo-600 transition-colors py-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};
