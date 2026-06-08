import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { StatCard, Card } from '../components/dashboard/StatCard';
import { TaskList } from '../components/dashboard/TaskList';
import { CategoryList } from '../components/dashboard/CategoryList';
import { MiniCalendar } from '../components/dashboard/MiniCalendar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { scheduleService } from '../services/scheduleService';
import { ScheduleFormModal } from '../components/dashboard/ScheduleFormModal';
import { apiClient } from '../api/apiClient';
import type { ApiResponse, Schedule } from '../types';
import { CategoryFormModal } from '../components/dashboard/CategoryFormModal';

export const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, weeklyData, categories, loading, error, refresh } = useDashboardData();
  const { user } = useAuth();

  // 일정 등록 및 수정 모달 제어용 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // 카테고리 등록 모달 제어용 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // 상세 정보 조회를 위한 비동기 로딩 상태
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // 일정 완료 여부 토글 핸들러
  const handleToggleCompletion = async (id: number, currentStatus: boolean) => {
    try {
      await scheduleService.toggleCompletion(id, !currentStatus);
      refresh(); // 대시보드 데이터 실시간 갱신
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

  // 미니 캘린더 날짜 클릭 시 신규 일정 등록 모달 오픈 (날짜 기본값 주입)
  const handleDateClick = (dateStr: string) => {
    setSelectedSchedule({
      startTime: `${dateStr}T09:00:00`,
      endTime: `${dateStr}T18:00:00`
    });
    setIsModalOpen(true);
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

  if (loading) {
    return <LoadingSpinner message="데이터를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center gap-3 max-w-md text-center">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const incompleteTasksCount = tasks.filter(t => !t.isCompleted).length;
  const totalTasksCount = tasks.length;
  const completedTasksCount = totalTasksCount - incompleteTasksCount;
  
  // 오늘의 완료율 계산 (일정이 없는 경우 0% 처리)
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const remainingRate = 100 - completionRate;

  return (
    <div key={location.pathname} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className="text-3xl tracking-tight text-slate-900">반가워요, {user?.nickname || '사용자'}님!</h1>
        <p className="text-slate-500 font-medium">
          {incompleteTasksCount > 0 
            ? `오늘 완료해야 할 일정이 ${incompleteTasksCount}개 있습니다.` 
            : '오늘의 모든 일정을 완료했습니다!'}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="오늘의 완료율" className="lg:col-span-1">
          <div className="relative w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: '완료', value: completionRate, color: '#5c51ff' },
                    { name: '남음', value: remainingRate, color: '#f5f7ff' },
                  ].filter(item => item.value > 0)}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={[
                    { name: '완료', value: completionRate },
                    { name: '남음', value: remainingRate },
                  ].filter(item => item.value > 0).length > 1 ? 5 : 0}
                  dataKey="value"
                >
                  {[
                    { name: '완료', value: completionRate, color: '#5c51ff' },
                    { name: '남음', value: remainingRate, color: '#f5f7ff' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900">{completionRate}%</span>
            </div>
          </div>
        </StatCard>

        <StatCard title="주간 활동량" className="md:col-span-1 lg:col-span-2">
          <div className="w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fontWeight: 700, fill: '#475569' }} 
                  dy={12}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="count" fill="#5c51ff" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StatCard>

        <Card title="캘린더" className="lg:col-span-1">
          <MiniCalendar onDateClick={handleDateClick} />
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <Card title="오늘의 일정" className="xl:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">활성 스케줄</span>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 group"
            >
              전체보기
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
          <TaskList 
            tasks={tasks.filter(t => t.time.includes('오늘'))} 
            isDashboard={true} 
            onToggleCompletion={handleToggleCompletion} 
            onEditSchedule={handleEditSchedule}
          />
        </Card>

        <Card title="카테고리" className="xl:col-span-1">
          <CategoryList 
            categories={categories} 
            onAddCategory={() => setIsCategoryModalOpen(true)} 
          />
        </Card>
      </section>

      {/* 일정 생성 및 수정을 처리하는 공통 폼 모달 */}
      <ScheduleFormModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSchedule(null); }}
        onSuccess={refresh}
        scheduleToEdit={selectedSchedule}
      />

      {/* 카테고리 생성을 처리하는 폼 모달 */}
      <CategoryFormModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
};
