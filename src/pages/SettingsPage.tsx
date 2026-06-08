import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mail, ShieldAlert, Check, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Modal } from '../components/common/Modal';

export const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (confirmText !== '탈퇴') {
      setError('탈퇴 확인을 위해 "탈퇴"라고 입력해주세요.');
      return;
    }

    setIsWithdrawing(true);
    setError(null);
    
    try {
      const response = await authService.withdraw();
      if (response.isSuccess) {
        // 성공 시 로그아웃 처리 및 로그인 페이지로 이동
        alert('회원 탈퇴가 정상적으로 처리되었습니다. 그동안 서비스를 이용해주셔서 감사합니다.');
        await logout();
        navigate('/login');
      } else {
        setError(response.message || '회원 탈퇴 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      console.error('Withdraw error:', err);
      setError(err.response?.data?.message || '서버와의 통신에 실패했습니다.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div key={location.pathname} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">마이페이지</h1>
        <p className="text-slate-500 font-medium">내 계정 정보를 확인하고 계정을 관리할 수 있습니다.</p>
      </header>

      {/* 회원 정보 카드 */}
      <section className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-linear-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100 overflow-hidden select-none">
                {user?.nickname?.[0] || 'U'}
              </div>
            </div>
            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <h3 className="text-2xl font-black text-slate-950">{user?.nickname || '사용자'}</h3>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-extrabold rounded-full border border-indigo-100 flex items-center gap-1">
                  <Check size={12} /> 서비스 멤버
                </span>
              </div>
              <p className="text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1.5 text-sm">
                <Mail size={16} className="text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">닉네임</span>
              <div className="w-full px-5 py-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl text-slate-950 font-bold select-all">
                {user?.nickname || ''}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">이메일 계정</span>
              <div className="w-full px-5 py-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl text-slate-500 font-medium select-all">
                {user?.email || ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 탈퇴하기 섹션 */}
      <section className="bg-red-50/30 border border-red-200/50 rounded-[32px] p-8 shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-100/10 rounded-full blur-[100px] group-hover:bg-red-100/20 transition-colors duration-700"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100/80 rounded-2xl flex items-center justify-center text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-950">계정 삭제 및 탈퇴</h2>
              <p className="text-xs text-red-500 font-semibold">이 작업은 취소할 수 없습니다.</p>
            </div>
          </div>
          
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">
            회원 탈퇴 시 작성하신 모든 일정 스케줄, 카테고리 정보, 개인 생산성 분석 데이터가 영구적으로 완전 소멸되며 복구할 수 없습니다. 
          </p>

          <div className="flex justify-start">
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="px-6 py-3.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold transition-all shadow-xs hover:shadow-sm active:scale-[0.98] flex items-center gap-2 group-hover:border-red-300"
            >
              <span>회원 탈퇴하기</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 회원 탈퇴 모달 */}
      <Modal 
        isOpen={showWithdrawModal} 
        onClose={() => {
          if (!isWithdrawing) {
            setShowWithdrawModal(false);
            setConfirmText('');
            setError(null);
          }
        }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950">정말 탈퇴하시겠습니까?</h3>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              탈퇴 시 계정 정보 및 모든 데이터가 완전히 삭제됩니다.<br />
              다시 복구할 수 없습니다.
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center">
            계속 진행하려면 아래에 <span className="text-red-600 font-extrabold">"탈퇴"</span>를 입력해주세요.
          </label>
          <input 
            type="text" 
            placeholder="탈퇴"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isWithdrawing}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-950 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none"
          />
          {error && (
            <p className="text-xs font-bold text-red-600 text-center">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 mt-6">
          <button 
            onClick={() => {
              setShowWithdrawModal(false);
              setConfirmText('');
              setError(null);
            }}
            disabled={isWithdrawing}
            className="py-4 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-2xl font-bold transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || confirmText !== '탈퇴'}
            className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200/50 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isWithdrawing ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              '탈퇴 완료'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};
