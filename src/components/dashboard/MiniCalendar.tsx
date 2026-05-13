import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MiniCalendar = () => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const today = date.getDate();

  // 월별 일수를 가져오기 위한 간단한 로직 (UI 목업용)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="font-bold text-slate-900">{currentYear}년 {currentMonth + 1}월</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center">
        {days.map(day => (
          <span key={day} className="text-[10px] font-bold text-slate-400 uppercase pb-2">{day}</span>
        ))}
        {calendarDays.map((day, i) => (
          <div key={i} className="py-1.5 flex items-center justify-center">
            {day ? (
              <span className={`
                text-xs w-7 h-7 flex items-center justify-center rounded-full transition-all
                ${day === today 
                  ? 'bg-indigo-600 text-white font-bold shadow-indigo-200 shadow-lg' 
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'}
              `}>
                {day}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
