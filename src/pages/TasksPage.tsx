import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { TaskList } from '../components/dashboard/TaskList';
import { useDashboardData } from '../hooks/useDashboardData';

export const TasksPage = () => {
  const { tasks, loading } = useDashboardData();
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'active') return !task.isCompleted;
    return true;
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">할 일 목록</h1>
          <p className="text-slate-500 font-medium mt-1">총 {tasks.length}개의 일정이 있습니다.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} />
          <span>새 할 일 추가</span>
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="일정 검색..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-full md:w-auto">
            <FilterButton active={filter === 'all'} label="전체" onClick={() => setFilter('all')} />
            <FilterButton active={filter === 'active'} label="진행 중" onClick={() => setFilter('active')} />
            <FilterButton active={filter === 'completed'} label="완료" onClick={() => setFilter('completed')} />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-[400px]">
            <TaskList tasks={filteredTasks} />
          </div>
        )}
      </div>
    </div>
  );
};

const FilterButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
      active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);
