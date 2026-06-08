import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  onDateClick?: (dateStr: string) => void;
}

export const MiniCalendar = ({ onDateClick }: MiniCalendarProps) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 현재 조회 중인 연월 상태
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 실제 오늘 날짜 정보 (오늘 날짜 하이라이트용)
  const realToday = new Date();
  const isCurrentMonthYear = 
    realToday.getFullYear() === currentYear && 
    realToday.getMonth() === currentMonth;
  const todayDate = realToday.getDate();

  // 이전달 / 다음달 네비게이션
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 날짜 클릭 시 포맷팅 전달
  const handleDayClick = (day: number) => {
    if (!onDateClick) return;
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
    onDateClick(dateStr);
  };

  // 월별 일수를 가져오기 위한 로직
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between px-1">
        <span className="font-bold text-slate-900">{currentYear}년 {currentMonth + 1}월</span>
        <div className="flex gap-1">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
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
              <span 
                onClick={() => handleDayClick(day)}
                className={`
                  text-xs w-7 h-7 flex items-center justify-center rounded-full transition-all
                  ${isCurrentMonthYear && day === todayDate 
                    ? 'bg-indigo-600 text-white font-bold shadow-indigo-200 shadow-lg cursor-pointer hover:bg-indigo-700' 
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'}
                `}
              >
                {day}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
