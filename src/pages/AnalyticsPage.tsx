import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, CheckCircle2, ListTodo, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

export const AnalyticsPage = () => {
  const location = useLocation();
  const { 
    weeklyActivity, 
    monthlyActivity,
    categoryDistribution, 
    completionStats, 
    busiestDay, 
    streak, 
    recentCompleted, 
    loading, 
    error 
  } = useAnalyticsData();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasCategoryData = categoryDistribution.some(item => item.value > 0);
  const pieData = hasCategoryData 
    ? categoryDistribution 
    : [{ name: '완료된 일정 없음', value: 100, color: '#f1f5f9' }];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-bold text-lg animate-pulse tracking-tight">통계 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50/50 backdrop-blur-xl text-red-600 p-8 rounded-[32px] border border-red-100 flex flex-col items-center gap-4 max-w-md text-center shadow-2xl shadow-red-100">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <TrendingUp className="rotate-180" />
          </div>
          <p className="font-bold text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div key={location.pathname} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">활동 분석 및 통계</h1>
        <p className="text-slate-500 font-medium">당신의 생산성을 시각화하고 목표 달성률을 확인하세요.</p>
      </header>

      {/* 요약 카드 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard 
          title="전체 완료율" 
          value={`${completionStats.rate}%`} 
          icon={<CheckCircle2 className="text-emerald-500" />}
          trend="+5.2%"
          trendUp={true}
          description="지난 달 대비 상승"
        />
        <AnalyticsStatCard 
          title="완료된 일정" 
          value={completionStats.completed.toString()} 
          icon={<ListTodo className="text-indigo-500" />}
          description={`총 ${completionStats.total}개 중`}
        />
        <AnalyticsStatCard 
          title="가장 바쁜 날" 
          value={busiestDay.name} 
          icon={<CalendarIcon className="text-blue-500" />}
          description={`평균 ${busiestDay.count}개 일정`}
        />
        <AnalyticsStatCard 
          title="연속 달성일" 
          value={`${streak}일`} 
          icon={<TrendingUp className="text-orange-500" />}
          trend={streak > 0 ? "New Record!" : undefined}
          trendUp={true}
          description="최고 기록 경신 중"
        />
      </section>

      {/* 메인 차트 섹션 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 활동량 추이 */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {activeTab === 'weekly' ? '주간 활동 추이' : '월간 활동 추이'}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {activeTab === 'weekly' ? '최근 2주간의 일정 완료 추이' : '3개월간의 일정 완료 추이'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'weekly' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                주간
              </button>
              <button 
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'monthly' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                월간
              </button>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTab === 'weekly' ? weeklyActivity : monthlyActivity}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,1)', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }} 
                  itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 카테고리 분포 */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">카테고리별 비중</h2>
            <p className="text-slate-500 text-sm font-medium">가장 많은 시간을 투자한 분야</p>
          </div>
          <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={hasCategoryData && categoryDistribution.length > 1 ? 8 : 0}
                  cornerRadius={6}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px'
                  }} 
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xs font-bold text-slate-400 transition-all duration-300">
                {activeIndex === -1 ? '전체 분야' : pieData[activeIndex]?.name}
              </span>
              <span className="text-2xl font-black text-slate-800 tracking-tight transition-all duration-300">
                {activeIndex === -1 
                  ? `${categoryDistribution.length}개` 
                  : (hasCategoryData ? `${pieData[activeIndex]?.value}%` : '0%')}
              </span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {categoryDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최근 한 달 완료 상세 통계 섹션 */}
      <section className="mt-8">
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">최근 한 달 완료 상세 통계</h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">완료 처리된 일정 목록을 확인하고 관리합니다.</p>
            </div>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-600 px-3.5 py-1.5 rounded-full border border-indigo-100 shadow-sm shadow-indigo-100/55">
              총 {recentCompleted.length}개 완료
            </span>
          </div>

          {recentCompleted.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500">
                {(isExpanded ? recentCompleted : recentCompleted.slice(0, 6)).map((task, index) => (
                  <StatRow 
                    key={index} 
                    label={task.label} 
                    category={task.category} 
                    status={task.status} 
                    date={task.date} 
                    isCancel={task.isCancel} 
                  />
                ))}
              </div>

              {recentCompleted.length > 6 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/80 rounded-full text-indigo-600 font-extrabold text-sm transition-all duration-300 shadow-md shadow-indigo-100/50 hover:shadow-lg hover:shadow-indigo-200/60 active:scale-[0.97] group"
                  >
                    {isExpanded ? (
                      <>
                        접기 <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    ) : (
                      <>
                        {recentCompleted.length - 6}개 더 보기 <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold">
              최근 한 달간 완료한 일정이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const AnalyticsStatCard = ({ title, value, icon, trend, trendUp, description }: any) => (
  <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      <p className="text-slate-500 text-xs font-medium">{description}</p>
    </div>
  </div>
);

const StatRow = ({ label, category, status, date, isCancel }: any) => (
  <div className="flex items-center justify-between p-4.5 bg-slate-50/40 hover:bg-white border border-slate-100/70 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/40 rounded-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-0.5">
    <div className="flex items-center gap-4">
      <div className={`w-1.5 h-10 rounded-full transition-transform group-hover:scale-y-110 ${isCancel ? 'bg-slate-200' : 'bg-indigo-500'}`}></div>
      <div>
        <p className={`font-extrabold text-sm ${isCancel ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{label}</p>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">{category}</p>
      </div>
    </div>
    <div className="text-right">
      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${isCancel ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
        {status}
      </span>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{date}</p>
    </div>
  </div>
);
