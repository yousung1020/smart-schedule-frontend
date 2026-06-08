import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { TaskList } from '../components/dashboard/TaskList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { scheduleService } from '../services/scheduleService';
import { ScheduleFormModal } from '../components/dashboard/ScheduleFormModal';
import { apiClient } from '../api/apiClient';
import type { ApiResponse, Schedule } from '../types';

export const TasksPage = () => {
  const location = useLocation();

  const [tasks, setTasks] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // 다차원 필터용 추가 상태
  const [categories, setCategories] = useState<{ id: number; name: string; color: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // 카테고리 목록 동적 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<ApiResponse<{ categories: { id: number; name: string; color: string }[] }>>('/categories');
        if (response.data.isSuccess && response.data.result) {
          setCategories(response.data.result.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await scheduleService.getAllSchedules();
      setTasks(res);
    } catch (err) {
      console.error('전체 할 일 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const refresh = fetchTasks;

  // 일정 등록 및 수정 모달 제어용 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // 상세 정보 조회를 위한 비동기 로딩 상태
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // 검색어 입력 상태
  const [searchQuery, setSearchQuery] = useState('');

  // 일정 완료 여부 토글 핸들러
  const handleToggleCompletion = async (id: number, currentStatus: boolean) => {
    try {
      await scheduleService.toggleCompletion(id, !currentStatus);
      refresh(); // 할 일 목록 데이터 실시간 갱신
    } catch (err) {
      console.error('Failed to toggle completion status', err);
    }
  };

  // 일정 클릭 시 상세 조회를 마친 뒤 수정 모달 오픈
  const handleEditSchedule = async (task: Schedule) => {
    if (fetchingDetail) return; // 중복 요청 방지
    try {
      setFetchingDetail(true);
      const response = await apiClient.get<ApiResponse<any>>(`/schedules/${task.id}`);
      if (response.data.isSuccess && response.data.result) {
        setSelectedSchedule(response.data.result);
        setIsModalOpen(true);
      } else {
        alert('일정 상세 정보를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch schedule detail', err);
      alert('네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setFetchingDetail(false);
    }
  };

  // 상세 정보를 비동기로 불러오는 동안 커서 상태 변경 피드백
  useEffect(() => {
    if (fetchingDetail) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [fetchingDetail]);

  const [filter, setFilter] = useState('all');

  // 검색어 및 다차원 필터 조건에 따른 할 일 목록 동적 필터링
  const filteredTasks = tasks.filter(task => {
    // 검색어 필터
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 완료 여부 필터
    if (filter === 'completed' && !task.isCompleted) return false;
    if (filter === 'active' && task.isCompleted) return false;

    // 카테고리 필터
    if (selectedCategory !== 'ALL' && task.category !== selectedCategory) return false;

    // 우선순위 필터
    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) return false;

    // 일정 구분 필터
    if (selectedType !== 'ALL' && task.type !== selectedType) return false;

    return true;
  });

  if (loading) {
    return <LoadingSpinner message="일정 데이터를 불러오는 중..." />;
  }

  return (
    <div key={location.pathname} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">할 일 목록</h1>
          <p className="text-slate-500 font-medium mt-1">총 {tasks.length}개의 일정이 있습니다.</p>
        </div>
        <button
          onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>일정 추가</span>
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4">
          {/* 첫 번째 행: 검색 및 진행상태 탭 필터 */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="일정 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-full md:w-auto shrink-0">
              <FilterButton active={filter === 'all'} label="전체" onClick={() => setFilter('all')} />
              <FilterButton active={filter === 'active'} label="진행 중" onClick={() => setFilter('active')} />
              <FilterButton active={filter === 'completed'} label="완료" onClick={() => setFilter('completed')} />
            </div>
          </div>

          {/* 두 번째 행: 다차원 추가 필터 컨트롤 */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100/60">
            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 pr-8 py-2 bg-slate-50 text-slate-600 border border-slate-200/50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer hover:bg-slate-100/50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_8px_center]"
            >
              <option value="ALL">카테고리: 전체</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 우선순위 필터 */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 pr-8 py-2 bg-slate-50 text-slate-600 border border-slate-200/50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer hover:bg-slate-100/50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_8px_center]"
            >
              <option value="ALL">우선순위: 전체</option>
              <option value="high">우선순위: 높음</option>
              <option value="med">우선순위: 중간</option>
              <option value="low">우선순위: 낮음</option>
            </select>

            {/* 일정 구분 필터 */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 pr-8 py-2 bg-slate-50 text-slate-600 border border-slate-200/50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer hover:bg-slate-100/50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[right_8px_center]"
            >
              <option value="ALL">일정 구분: 전체</option>
              <option value="start">시작 일정</option>
              <option value="deadline">마감 일정</option>
            </select>

            {/* 필터 전체 초기화 단축키 */}
            {(selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedType !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedPriority('ALL');
                  setSelectedType('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 hover:underline transition-all ml-auto"
              >
                필터 조건 초기화
              </button>
            )}
          </div>
        </div>

        <div className="min-h-[400px]">
          <TaskList
            tasks={filteredTasks}
            onToggleCompletion={handleToggleCompletion}
            onEditSchedule={handleEditSchedule}
          />
        </div>
      </div>

      {/* 일정 생성 및 수정을 처리하는 공통 폼 모달 */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSchedule(null); }}
        onSuccess={refresh}
        scheduleToEdit={selectedSchedule}
      />
    </div>
  );
};

const FilterButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
  >
    {label}
  </button>
);
