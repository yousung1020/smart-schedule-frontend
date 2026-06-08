import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { scheduleService } from '../services/scheduleService';
import type { ApiResponse, CalendarListResultDTO } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ScheduleFormModal } from '../components/dashboard/ScheduleFormModal';

// 배경색의 밝기(Relative Luminance)를 계산해 가장 시인성이 높은 텍스트 컬러(어두운 슬레이트 또는 흰색)를 결정하는 헬퍼 함수
const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return '#ffffff';
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#ffffff';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // YIQ 상대 휘도 공식 가중치 적용
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#1e293b' : '#ffffff';
};

export const CalendarPage = () => {
  const location = useLocation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 일정 등록 및 수정 모달 제어용 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // 일정 유형 필터 상태 (ALL: 전체, START: 시작, DEADLINE: 마감)
  const [filterType, setFilterType] = useState<'ALL' | 'START' | 'DEADLINE'>('ALL');

  // 다차원 필터용 추가 상태
  const [categories, setCategories] = useState<{ id: number; name: string; color: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

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

  // 일정 목록 조회 함수 격상
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      const pad = (n: number) => String(n).padStart(2, '0');
      const formatLocalISO = (d: Date) => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
      };

      const range = {
        startDate: formatLocalISO(start),
        endDate: formatLocalISO(end)
      };

      const response = await apiClient.get<ApiResponse<CalendarListResultDTO>>('/schedules/calendar', { params: range });

      if (response.data.isSuccess && response.data.result) {
        const formattedEvents = response.data.result.schedules.map(s => {
          // 일정 자체에 지정된 고유 색상을 최우선으로 적용하고 없을 시 카테고리 색상 및 기본 테마 폴백 적용
          const bgColor = s.color || s.categoryColor || (s.categoryName === '업무' ? '#818cf8' : s.categoryName === '개인' ? '#34d399' : '#fbbf24');

          // 시작일과 종료일의 날짜가 다른 다년일 일정인 경우, 주간 뷰 등에서 하루 종일 그리드를 덮지 않도록 allDay를 true로 판정
          let isAllDay = false;
          let adjustedEnd = s.endTime;
          if (s.startTime && s.endTime) {
            const startStr = s.startTime.split('T')[0];
            const endStr = s.endTime.split('T')[0];
            if (startStr !== endStr) {
              isAllDay = true;
              
              // FullCalendar의 종일(allDay) 이벤트 렌더링 독점 종료일 스펙 보정 (+1일 가산)
              // 종료일 당일까지 온전히 캘린더에 표시하기 위해 하루를 늘려 캘린더에 넘김
              const endDateObj = new Date(s.endTime);
              endDateObj.setDate(endDateObj.getDate() + 1);
              const pad = (n: number) => String(n).padStart(2, '0');
              adjustedEnd = `${endDateObj.getFullYear()}-${pad(endDateObj.getMonth() + 1)}-${pad(endDateObj.getDate())}T${s.endTime.split('T')[1] || '00:00:00'}`;
            }
          }

          return {
            id: s.id.toString(),
            title: s.title,
            start: s.startTime,
            end: adjustedEnd,
            allDay: isAllDay,
            backgroundColor: bgColor,
            borderColor: bgColor,
            extendedProps: {
              rawDto: s // 수정 모달에 원본 객체를 통째로 넘기기 위해 저장
            }
          };
        });
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 일정을 마우스 드래그 앤 드롭으로 이동하거나 늘렸을(Resize) 때, 실제 데이터베이스 시간 정보도 함께 갱신 처리
  const handleEventDropOrResize = async (info: any) => {
    const { event } = info;
    const rawDto = event.extendedProps.rawDto;
    if (!rawDto || !rawDto.id) return;

    try {
      setLoading(true);

      if (!event.start) return;

      const pad = (n: number) => String(n).padStart(2, '0');
      
      // 기존 원본 일정에 설정되어 있던 고유 시간 정보 추출 (기본값: 시작 09:00, 종료 18:00)
      const origStartTimeStr = rawDto.startTime ? rawDto.startTime.split('T')[1]?.slice(0, 5) : '09:00';
      const origEndTimeStr = rawDto.endTime ? rawDto.endTime.split('T')[1]?.slice(0, 5) : '18:00';

      // 시작 시간 보정 조립
      const startD = event.start;
      let startTimePart = origStartTimeStr;
      
      // 종일 일정이 아니고 시간 그리드 상에서 이동된 경우 실제 이동된 시간을 채택
      if (!event.allDay) {
        startTimePart = `${pad(startD.getHours())}:${pad(startD.getMinutes())}`;
      }
      const newStart = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}T${startTimePart}:00`;

      // 종료 시간 보정 조립
      let newEnd = '';
      if (event.end) {
        const endD = new Date(event.end.getTime());
        
        // 종일 일정일 때 FullCalendar 독점(exclusive) 종료일 처리 보정 (-1일 감산)
        if (event.allDay) {
          endD.setDate(endD.getDate() - 1);
        }
        
        let endTimePart = origEndTimeStr;
        if (!event.allDay) {
          endTimePart = `${pad(endD.getHours())}:${pad(endD.getMinutes())}`;
        }
        newEnd = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${endTimePart}:00`;
      } else {
        // 단일일 종일 일정의 드래그일 경우 시작일과 동일한 날짜에 종료 시간을 합성
        const endD = new Date(startD.getTime());
        newEnd = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${origEndTimeStr}:00`;
      }

      const scheduleData = {
        title: rawDto.title,
        content: rawDto.content,
        startTime: newStart,
        endTime: newEnd,
        priority: rawDto.priority || 'MEDIUM',
        categoryId: rawDto.categoryId || undefined,
        scheduleType: rawDto.scheduleType || 'START',
        notifyBeforeMinutes: rawDto.notifyBeforeMinutes || [],
        color: rawDto.color || rawDto.categoryColor || undefined
      };

      const res = await scheduleService.updateSchedule(rawDto.id, scheduleData);

      if (res.isSuccess) {
        await fetchEvents();
      } else {
        alert(res.message || '일정 일시 변경에 실패했습니다.');
        info.revert();
      }
    } catch (err) {
      console.error('Failed to update event time on drop/resize', err);
      alert('일정 시간 변경 중 예기치 못한 오류가 발생했습니다.');
      info.revert();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="일정을 불러오는 중..." />;
  }

  return (
    <div key={location.pathname} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-80px)] flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">캘린더 스케줄</h1>
          <p className="text-slate-500 font-medium mt-1">월간 및 주간 일정을 한눈에 관리하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 일정 구분 필터 */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm cursor-pointer hover:bg-slate-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center]"
          >
            <option value="ALL">일정 구분: 전체</option>
            <option value="START">시작 일정만</option>
            <option value="DEADLINE">마감 일정만</option>
          </select>

          {/* 카테고리 필터 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm cursor-pointer hover:bg-slate-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center]"
          >
            <option value="ALL">카테고리: 전체</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 우선순위 필터 */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm cursor-pointer hover:bg-slate-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center]"
          >
            <option value="ALL">우선순위: 전체</option>
            <option value="HIGH">우선순위: 높음</option>
            <option value="MEDIUM">우선순위: 중간</option>
            <option value="LOW">우선순위: 낮음</option>
          </select>

          <button
            onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm"
          >
            <Plus size={18} />
            <span>일정 추가</span>
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="calendar-container flex-1">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events.filter(e => {
              const raw = e.extendedProps?.rawDto;
              if (!raw) return false;

              // 일정 유형 필터
              if (filterType !== 'ALL') {
                const isDeadline = raw.scheduleType === 'DEADLINE';
                const typeMatch = filterType === 'START' ? !isDeadline : isDeadline;
                if (!typeMatch) return false;
              }

              // 카테고리 필터
              if (selectedCategory !== 'ALL') {
                const categoryId = raw.categoryId?.toString();
                if (categoryId !== selectedCategory) return false;
              }

              // 우선순위 필터
              if (selectedPriority !== 'ALL') {
                if (raw.priority !== selectedPriority) return false;
              }

              return true;
            })}
            height="100%"
            slotEventOverlap={false}
            editable={true}
            selectable={true}
            selectMirror={true}
            eventDrop={handleEventDropOrResize}
            eventResize={handleEventDropOrResize}
            dayMaxEvents={true}
            locale="ko"
            displayEventTime={false} // 시간 문자열 숨김
            eventClassNames="rounded-xl border-none p-1 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
            eventDidMount={(info) => {
              const color = info.event.backgroundColor;
              if (color) {
                info.el.style.borderLeftColor = color;
                // 모든 일정(단일일 및 다년일 블록 포함)의 배경색을 일정 고유 색상의 15% 투명도 버전으로 은은하게 채움
                // 이렇게 함으로써 내부의 100% 불투명 뱃지/글머리표와 확실한 대비(Contrast)를 이루어 시인성 증가
                info.el.style.backgroundColor = `${color}26`; // 26은 16진수 기준 15%의 투명도
              }
            }}
            eventClick={(info) => {
              // 캘린더에서 클릭한 일정의 원본 DTO를 모달에 넘기고 모달 활성화
              setSelectedSchedule(info.event.extendedProps.rawDto);
              setIsModalOpen(true);
            }}
            select={(selectInfo) => {
              // 마우스 드래그 또는 날짜 칸 선택 시 해당 범위 날짜를 가진 모달 활성화
              const start = selectInfo.startStr;
              const end = selectInfo.endStr;

              let formattedStart = start.length === 10 ? `${start}T09:00` : start.slice(0, 16);
              let formattedEnd = end.length === 10 ? `${end}T18:00` : end.slice(0, 16);

              // 캘린더 하루 드래그 보정
              if (end.length === 10) {
                const endDate = new Date(end);
                endDate.setDate(endDate.getDate() - 1);
                const pad = (n: number) => String(n).padStart(2, '0');
                formattedEnd = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T18:00`;
              }

              setSelectedSchedule({
                startTime: formattedStart,
                endTime: formattedEnd
              });
              setIsModalOpen(true);
            }}
            eventContent={(eventInfo) => {
              // 마감 일정과 시작 일정을 직관적으로 구별하게 뱃지 및 심볼 커스텀 렌더링
              const rawDto = eventInfo.event.extendedProps.rawDto;
              const isDeadline = rawDto?.scheduleType === 'DEADLINE';
              const eventColor = eventInfo.event.backgroundColor || '#818cf8';
              const themeColor = isDeadline ? '#f43f5e' : eventColor;

              return (
                <div className="flex items-center gap-1.5 overflow-hidden w-full px-1 flex-nowrap">
                  <span
                    className="shrink-0 w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-extrabold shrink-0 tracking-tighter"
                    style={{ backgroundColor: themeColor, color: getContrastColor(themeColor) }}
                  >
                    {isDeadline ? '마감' : '시작'}
                  </span>
                  <span className="truncate font-bold text-slate-800 text-[11px]">
                    {eventInfo.event.title}
                  </span>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* 일정 생성 및 수정을 처리하는 공통 폼 모달 */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSchedule(null); }}
        onSuccess={fetchEvents}
        scheduleToEdit={selectedSchedule}
      />
    </div>
  );
};
