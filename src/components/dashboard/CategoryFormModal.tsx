import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import type { ApiResponse } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryFormModal = ({ isOpen, onClose, onSuccess }: CategoryFormModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FFB3BA'); // 파스텔 로즈 기본값
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pastelPresets = [
    '#FFB3BA', // 파스텔 로즈
    '#FFDFBA', // 파스텔 오렌지
    '#FFFFBA', // 파스텔 옐로우
    '#BAFFC9', // 파스텔 민트
    '#BAE1FF', // 파스텔 하늘
    '#E8C4FF', // 파스텔 라벤더
    '#F1F5F9'  // 라이트 그레이
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('카테고리 이름을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post<ApiResponse<any>>('/categories', {
        name: name.trim(),
        color
      });

      if (response.data.isSuccess) {
        onSuccess();
        setName('');
        onClose();
      } else {
        setError(response.data.message || '카테고리 등록에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('카테고리 생성 실패:', err);
      setError('카테고리 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-50 transition-[visibility] ${isOpen ? 'visible pointer-events-auto duration-500' : 'invisible pointer-events-none duration-300'}`}>
      {/* 전체 화면 흐림(블러) 및 투명 배경 처리 레이어 */}
      <div className={`absolute -inset-10 bg-white/85 backdrop-blur-[40px] transition-opacity ${isOpen ? 'opacity-100 duration-500 ease-out' : 'opacity-0 duration-300 ease-in'}`} />
      
      {/* 스크롤 및 컨텐츠 레이어 */}
      <div className="absolute inset-0 overflow-y-auto flex justify-center lg:pl-64 px-4">
        <div className={`w-full max-w-md my-auto flex flex-col p-6 sm:p-12 transition-all transform ${isOpen ? 'opacity-100 translate-y-0 scale-100 duration-500 ease-out' : 'opacity-0 translate-y-12 scale-[0.98] duration-300 ease-in'}`}>
          
          {/* 헤더 바 */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 shrink-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
              <Tag className="text-indigo-400" size={24} />
              새 카테고리 등록
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="p-2.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-600 text-sm font-semibold rounded-2xl flex items-center gap-2 border border-rose-100">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* 폼 필드 입력 영역 */}
          <form onSubmit={handleSave} className="flex-1 flex flex-col space-y-6 pt-6">
            
            {/* 카테고리 이름 입력 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                카테고리 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 업무, 취미, 운동"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm"
                required
              />
            </div>

            {/* 카테고리 색상 지정 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                테마 색상 지정
              </label>
              <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {pastelPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className="w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center"
                    style={{ 
                      backgroundColor: preset,
                      borderColor: color === preset ? '#4f46e5' : 'transparent',
                      transform: color === preset ? 'scale(1.1)' : 'none'
                    }}
                  >
                    {color === preset && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 하단 제어 버튼 영역 */}
            <div className="pt-6 border-t border-slate-200/60 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 rounded-2xl text-sm font-bold transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200/80 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? '등록 중...' : '등록하기'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
