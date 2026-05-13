import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { StatCard, Card } from '../components/dashboard/StatCard';
import { TaskList } from '../components/dashboard/TaskList';
import { CategoryList } from '../components/dashboard/CategoryList';
import { MiniCalendar } from '../components/dashboard/MiniCalendar';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage = () => {
  const { tasks, weeklyData, categories, loading, error } = useDashboardData();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-slate-400 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    { name: '완료', value: 84 },
                    { name: '남음', value: 16 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#5c51ff" stroke="none" />
                  <Cell fill="#f5f7ff" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900">84%</span>
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
          <MiniCalendar />
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <Card title="오늘의 일정" className="xl:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">활성 스케줄</span>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 group">
              전체보기
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
          <TaskList tasks={tasks.filter(t => t.time.includes('오늘'))} isDashboard={true} />
        </Card>

        <Card title="카테고리" className="xl:col-span-1">
          <CategoryList categories={categories} />
        </Card>
      </section>
    </div>
  );
};
