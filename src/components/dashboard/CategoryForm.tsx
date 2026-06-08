import { useState } from 'react';
import { apiClient } from '../../api/apiClient';
import type { ApiResponse } from '../../types';

interface CategoryFormProps {
  onClose: () => void;
  onCategoryCreated: (newCategory: { id: number; name: string; color: string }) => void;
}

export const CategoryForm = ({ onClose, onCategoryCreated }: CategoryFormProps) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#bae1ff');

  const pastelPresets = [
    '#FFB3BA', // 파스텔 로즈
    '#FFDFBA', // 파스텔 오렌지
    '#FFFFBA', // 파스텔 옐로우
    '#BAFFC9', // 파스텔 민트
    '#BAE1FF', // 파스텔 하늘
    '#E8C4FF', // 파스텔 라벤더
    '#F1F5F9'  // 라이트 그레이
  ];

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#475569';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#ffffff';
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력해 주세요.');
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<{ id: number; name: string; color: string }>>('/categories', {
        name: newCategoryName.trim(),
        color: newCategoryColor
      });

      if (response.data.isSuccess && response.data.result) {
        onCategoryCreated(response.data.result);
        setNewCategoryName('');
      } else {
        alert(response.data.message || '카테고리 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('카테고리 생성 실패:', err);
      alert('카테고리 생성 중 예상치 못한 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 mt-4">
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">카테고리 이름</span>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="예: 사이드 프로젝트, 취미, 건강"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
        />
      </div>

      <div className="space-y-2.5">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">색상 지정 (파스텔 프리셋 & 컬러 피커)</span>
        <div className="flex items-center gap-3 flex-wrap">
          {pastelPresets.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setNewCategoryColor(preset)}
              className={`w-8 h-8 rounded-full border transition-all ${newCategoryColor === preset ? 'border-slate-800 scale-110 shadow-md ring-4 ring-indigo-400/20' : 'border-slate-200 hover:scale-105'
                }`}
              style={{ backgroundColor: preset }}
            />
          ))}

          {/* 커스텀 컬러 피커 조합 */}
          <div className="relative w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:scale-105 transition-all shadow-sm ml-2">
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <div
              className="w-5 h-5 rounded-full border border-slate-200/50 shadow-inner"
              style={{ backgroundColor: newCategoryColor }}
            />
          </div>

          {/* 헥사 코드 프리뷰 뱃지 */}
          <span
            className="ml-auto px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider shadow-sm transition-all duration-300"
            style={{
              backgroundColor: newCategoryColor,
              color: getContrastColor(newCategoryColor),
              borderColor: 'transparent'
            }}
          >
            {newCategoryColor}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleCreateCategory}
          className="px-5 py-2.5 bg-indigo-400 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm"
        >
          카테고리 등록
        </button>
      </div>
    </div>
  );
};
