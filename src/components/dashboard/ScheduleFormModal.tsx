import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Type, Clock, AlertCircle, Bookmark, Trash2, Tag } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { scheduleService } from '../../services/scheduleService';
import type { ApiResponse, BackendPriority, BackendScheduleType } from '../../types';
import { CategoryForm } from './CategoryForm';
import { ColorPickerPanel } from './ColorPickerPanel';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleToEdit?: any; // 수정 모드일 때 전달받는 원본 일정 DTO 객체
}

export const ScheduleFormModal = ({ isOpen, onClose, onSuccess, scheduleToEdit }: ScheduleFormModalProps) => {
  // 폼 필드 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState<BackendScheduleType>('START');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<BackendPriority>('MEDIUM');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState(false);

  // 카테고리 생성 폼 토글 상태
  const [showAddCategory, setShowAddCategory] = useState(false);

  // 일정 자체에 지정하여 캘린더 화면에 단독으로 표시될 고유 표시 색상 상태 변수
  const [color, setColor] = useState('#FFB3BA');

  // 사용자의 시인성과 톤 매칭을 적극 고려하여 엄선한 파스텔톤 컬러 프리셋 목록
  const schedulePastelPresets = [
    '#FFB3BA', // 파스텔 로즈
    '#FFDFBA', // 파스텔 오렌지
    '#FFFFBA', // 파스텔 옐로우
    '#BAFFC9', // 파스텔 민트
    '#BAE1FF', // 파스텔 하늘
    '#E8C4FF', // 파스텔 라벤더
    '#F1F5F9'  // 라이트 그레이
  ];

  // 카테고리 목록 및 에러/로딩 상태
  const [categories, setCategories] = useState<{ id: number; name: string; color: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 및 모달 오픈 시 카테고리 목록 동적 로드
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await apiClient.get<ApiResponse<{ categories: { id: number; name: string; color: string }[] }>>('/categories');
          if (response.data.isSuccess && response.data.result) {
            setCategories(response.data.result.categories);
          }
        } catch (err) {
          console.error('카테고리 목록 조회 시패:', err);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // 수정 모드와 생성 모드에 따른 폼 상태 초기값 바인딩 (렌더 단계 동기화 방식 적용)
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  // 모달이 열리는(isOpen: false -> true) 렌더링 시작 시점에 상태값들을 동기적으로 세팅
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setError('');

    if (scheduleToEdit && scheduleToEdit.id) {
      // 존재하는 일정 DTO 정보 바인딩
      setTitle(scheduleToEdit.title || '');
      setContent(scheduleToEdit.content || '');
      setScheduleType(scheduleToEdit.scheduleType || 'START');
      setStartTime(scheduleToEdit.startTime ? scheduleToEdit.startTime.slice(0, 16) : '');
      setEndTime(scheduleToEdit.endTime ? scheduleToEdit.endTime.slice(0, 16) : '');
      setPriority(scheduleToEdit.priority || 'MEDIUM');
      setCategoryId(scheduleToEdit.categoryId || undefined);
      setColor(scheduleToEdit.color || scheduleToEdit.categoryColor || '#FFB3BA');
      setIsCompleted(scheduleToEdit.isCompleted || false);
    } else {
      // 생성 모드: 초기 기본값 지정
      setTitle('');
      setContent('');
      setScheduleType('START');
      setPriority('MEDIUM');
      setCategoryId(undefined);
      setColor('#FFB3BA');
      setIsCompleted(false);

      if (scheduleToEdit && scheduleToEdit.startTime && scheduleToEdit.endTime) {
        // 캘린더 드래그 등을 통해 전달받은 날짜 범위 매핑
        setStartTime(scheduleToEdit.startTime.slice(0, 16));
        setEndTime(scheduleToEdit.endTime.slice(0, 16));
      } else {
        // 현재 시간 기준 기본 시작/종료 시간 연산
        const now = new Date();
        now.setMinutes(0, 0, 0);

        const pad = (n: number) => String(n).padStart(2, '0');
        const formatForInput = (d: Date) => {
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const defaultStart = formatForInput(now);
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const defaultEnd = formatForInput(oneHourLater);

        setStartTime(defaultStart);
        setEndTime(defaultEnd);
      }
    }
  } else if (!isOpen && prevIsOpen) {
    // 모달이 닫힐 때 (isOpen: true -> false) 이전 상태값만 false로 업데이트하고,
    // 입력 폼 상태값들은 초기화하지 않고 그대로 유지하여 닫힘 애니메이션 중 데이터가 날아가지 않도록 함
    setPrevIsOpen(false);
  }

  // 일정 저장 비동기 처리
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('일정 제목을 입력해 주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setError('일정의 시작 시간과 종료 시간을 모두 입력해 주세요.');
      return;
    }
    if (new Date(startTime) > new Date(endTime)) {
      setError('종료 시간은 시작 시간보다 빠를 수 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    const scheduleData = {
      title,
      content: content.trim() || undefined,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      priority,
      categoryId: categoryId || undefined,
      scheduleType,
      notifyBeforeMinutes: [],
      color: color // API 명세에 맞춰 개별 색상 프로퍼티 전송
    };

    try {
      if (scheduleToEdit && scheduleToEdit.id) {
        // 기존 일정 수정 요청
        const res = await scheduleService.updateSchedule(scheduleToEdit.id, scheduleData);
        if (res.isSuccess) {
          // 완료 상태가 수정 전과 변경되었다면 토글 API 호출 병행
          if (scheduleToEdit.isCompleted !== isCompleted) {
            await scheduleService.toggleCompletion(scheduleToEdit.id, isCompleted);
          }
          onSuccess();
          onClose();
        } else {
          setError(res.message || '일정 수정 중 오류가 발생했습니다.');
        }
      } else {
        // 시규 일정 생성 요청
        const res = await scheduleService.createSchedule(scheduleData);
        if (res.isSuccess) {
          onSuccess();
          onClose();
        } else {
          setError(res.message || '일정 등록 중 오류가 발생했습니다.');
        }
      }
    } catch (err: any) {
      console.error('일정 저장 오류:', err);
      setError('일정 저장 처리 중 예상치 못한 네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 일정 삭제 비동기 처리
  const handleDelete = async () => {
    if (!scheduleToEdit || !scheduleToEdit.id) return;

    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      setLoading(true);
      setError('');
      try {
        const res = await scheduleService.deleteSchedule(scheduleToEdit.id);
        if (res.isSuccess) {
          onSuccess();
          onClose();
        } else {
          setError(res.message || '일정 삭제 중 오류가 발생했습니다.');
        }
      } catch (err: any) {
        console.error('일정 삭제 오류:', err);
        setError('일정 삭제 처리 중 예상치 못한 네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };



  return createPortal(
    <div className={`fixed inset-0 z-50 transition-[visibility] ${isOpen ? 'visible pointer-events-auto duration-500' : 'invisible pointer-events-none duration-300'}`}>
      {/* 전체 화면 흐림(블러) 및 투명 배경 처리 레이어 */}
      <div className={`absolute -inset-10 bg-white/85 backdrop-blur-[40px] transition-opacity ${isOpen ? 'opacity-100 duration-500 ease-out' : 'opacity-0 duration-300 ease-in'}`} />

      {/* 스크롤 및 컨텐츠 레이어 */}
      <div className="absolute inset-0 overflow-y-auto flex justify-center px-4">
        <div className={`w-full max-w-2xl my-auto flex flex-col p-6 sm:p-12 md:p-16 lg:ml-16 transition-all transform ${isOpen ? 'opacity-100 translate-y-0 scale-100 duration-500 ease-out' : 'opacity-0 translate-y-12 scale-[0.98] duration-300 ease-in'}`}>

          {/* 헤더 바 */}
          <div className="flex items-center justify-between pb-8 border-b border-slate-200/60 shrink-0">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <Calendar className="text-indigo-400" size={32} />
              {scheduleToEdit && scheduleToEdit.id ? '일정 상세 정보 수정' : '새로운 일정 등록'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-3 hover:bg-slate-200/60 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={26} />
            </button>
          </div>

          {/* 폼 필드 입력 영역 */}
          <form onSubmit={handleSave} className="flex-1 flex flex-col space-y-8 pt-8">

            {/* 일정 제목 입력 */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                <Type size={16} />
                일정 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 프로젝트 기획 회의"
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm"
                required
              />
            </div>

            {/* 수정 모드일 때 제공되는 완료 토글 스위치 */}
            {scheduleToEdit && scheduleToEdit.id && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-2xl transition-all hover:bg-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-all ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200/60 text-slate-500'}`}>
                    <Bookmark size={20} className={isCompleted ? 'fill-emerald-600/10' : ''} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block cursor-pointer" htmlFor="modal-is-completed">
                      일정 완료 처리
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      {isCompleted ? '이 일정이 성공적으로 완료되었습니다.' : '아직 진행 중인 일정입니다.'}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  id="modal-is-completed"
                  onClick={() => setIsCompleted(!isCompleted)}
                  className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isCompleted ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* 일정 형식 및 우선순위 2열 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* 일정 구분 (시작 일정 / 마감 일정) */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={16} />
                  일정 구분
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as BackendScheduleType)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm appearance-none"
                >
                  <option value="START">시작 일정</option>
                  <option value="DEADLINE">마감 일정</option>
                </select>
              </div>

              {/* 우선순위 지정 */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <AlertCircle size={16} />
                  우선순위
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as BackendPriority)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm appearance-none"
                >
                  <option value="HIGH">높음 (High)</option>
                  <option value="MEDIUM">보통 (Medium)</option>
                  <option value="LOW">낮음 (Low)</option>
                </select>
              </div>
            </div>

            {/* 기간 시간 설정 2열 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* 시작 시각 */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar size={16} />
                  시작 시각
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm"
                  required
                />
              </div>

              {/* 종료 시각 */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={16} />
                  종료 시각
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* 카테고리 분류 & 색상 */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <Bookmark size={16} />
                  카테고리 분류 & 색상
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-sm font-extrabold text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                >
                  {showAddCategory ? '닫기' : '+ 새 카테고리'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <select
                    value={categoryId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catId = val ? Number(val) : undefined;
                      setCategoryId(catId);
                      // 카테고리 선택 시, 해당 카테고리의 고유 색상을 일정 표시 색상으로 즉시 반영
                      if (catId) {
                        const selectedCat = categories.find(c => c.id === catId);
                        if (selectedCat && selectedCat.color) {
                          setColor(selectedCat.color);
                        }
                      } else {
                        // 카테고리 선택 해제 시 기본 파스텔 로즈 색상으로 환원
                        setColor('#FFB3BA');
                      }
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-base font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all shadow-sm appearance-none"
                  >
                    <option value="">카테고리 선택 없음</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {/* 선택된 카테고리의 실시간 색상 표시 원형 뱃지 */}
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span
                      className="block w-4 h-4 rounded-full border border-slate-200 shadow-inner transition-colors duration-200"
                      style={{
                        backgroundColor: categories.find(c => c.id === categoryId)?.color || '#f1f5f9'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 파스텔 피커를 갖춘 새 카테고리 동적 추가 서브 영역 */}
              {showAddCategory && (
                <CategoryForm
                  onClose={() => setShowAddCategory(false)}
                  onCategoryCreated={(newCat) => {
                    setCategories(prev => [...prev, newCat]);
                    setCategoryId(newCat.id);
                    setShowAddCategory(false);
                  }}
                />
              )}
            </div>

            {/* 일정 자체에 지정하여 캘린더에 단독으로 노출될 일정 고유 표시 색상 피커 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                <Tag size={16} className="text-indigo-400" />
                일정 고유 표시 색상
              </label>
              <ColorPickerPanel
                color={color}
                onChangeColor={setColor}
                presets={schedulePastelPresets}
              />
            </div>

            {/* 일정 메모/상세 상세 입력 필드 */}
            <div className="space-y-2.5 flex-1">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                <Type size={16} />
                메모/상세 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="일정에 대한 세부 메모를 입력해 주세요 (선택 사항)"
                rows={5}
                className="w-full h-full min-h-[120px] px-5 py-4 bg-white border border-slate-200 rounded-2xl text-base font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all resize-none shadow-sm"
              />
            </div>

            {/* 등록 에러 메시지 시시간 노출 피드백 영역 */}
            {error && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-500 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold leading-normal">{error}</p>
              </div>
            )}

            {/* 하단 모달 최종 제어 액션 패널 */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-200/60 mt-auto pb-12">
              {scheduleToEdit && scheduleToEdit.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="mr-auto px-6 py-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-500 rounded-2xl text-sm font-extrabold transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  일정 삭제
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-500 rounded-2xl text-sm font-extrabold transition-all duration-200 shadow-sm"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-600 text-white rounded-2xl text-sm font-extrabold transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? '저장 중...' : scheduleToEdit && scheduleToEdit.id ? '수정 완료' : '일정 생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
