import { MoreVertical } from 'lucide-react';
import type { Schedule } from '../../types';

interface TaskListProps {
  tasks: Schedule[];
  isDashboard?: boolean;
  onToggleCompletion?: (id: number, currentStatus: boolean) => void;
  onEditSchedule?: (task: Schedule) => void;
}

export const TaskList = ({ tasks, isDashboard = false, onToggleCompletion, onEditSchedule }: TaskListProps) => {
  return (
    <div className="w-full">
      {/* 열 헤더 */}
      <div className="grid grid-cols-[64px_1fr_180px_100px_120px_40px] items-center px-4 py-4 border-b border-slate-100 mb-2">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">상태</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-2">일정명</div>
        <div className={`text-sm font-bold text-slate-500 uppercase tracking-wider ${isDashboard ? 'pl-20' : ''}`}>수행 일정</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">구분</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">중요도</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider text-right">관리</div>
      </div>

      <div className="space-y-1">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="grid grid-cols-[64px_1fr_180px_100px_120px_40px] items-center p-4 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
          >
            {/* 일정 완료 상태 체크박스 */}
            <div className="flex justify-start pl-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // 행 클릭 이벤트 전파 차단
                  onToggleCompletion?.(task.id, task.isCompleted);
                }}
                className={`w-5 h-5 border-2 rounded-md cursor-pointer transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                  ${task.isCompleted ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'border-slate-300 hover:border-indigo-400'}`}
              >
                {task.isCompleted && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* 일정 타이틀 및 카테고리 표시 */}
            <div className="min-w-0 pr-4">
              <p className={`font-bold text-base truncate ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-bold uppercase tracking-wider">
                {task.category}
              </span>
            </div>

            {/* 수행 예정 날짜 및 시간 */}
            <div className={`flex flex-col ${isDashboard ? 'pl-20' : ''}`}>
              {task.time.includes('오늘') ? (
                <>
                  <span className="text-sm font-bold text-indigo-600">오늘</span>
                  <span className="text-xs font-semibold text-slate-400 mt-1">{task.time.replace('오늘 ', '')}</span>
                </>
              ) : task.time.includes('내일') ? (
                <>
                  <span className="text-sm font-bold text-amber-600">내일</span>
                  <span className="text-xs font-semibold text-slate-400 mt-1">{task.time.replace('내일 ', '')}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-700">{task.time}</span>
              )}
            </div>

            {/* 일정 구분 (시작 및 마감) */}
            <div className="flex justify-center">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border
                ${task.type === 'deadline' 
                  ? 'bg-rose-50 text-rose-600 border-rose-100' 
                  : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {task.type === 'deadline' ? '마감' : '시작'}
              </span>
            </div>

            {/* 중요도 우선순위 뱃지 */}
            <div className="flex justify-center">
              <PriorityBadge priority={task.priority} />
            </div>

            {/* 상세 관리 액션 버튼 */}
            <div className="flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // 행 클릭 이벤트 전파 차단
                  onEditSchedule?.(task);
                }}
                className="text-slate-300 hover:text-slate-600 transition-colors p-1 hover:bg-white rounded-lg cursor-pointer"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    high: 'bg-red-50 text-red-600',
    med: 'bg-amber-50 text-amber-600',
    low: 'bg-emerald-50 text-emerald-600',
  }[priority] || 'bg-slate-50 text-slate-600';

  const labels: Record<string, string> = {
    high: '높음',
    med: '중간',
    low: '낮음',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${styles}`}>
      {labels[priority] || priority}
    </span>
  );
};
