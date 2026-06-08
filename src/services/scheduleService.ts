import { apiClient } from '../api/apiClient';
import type { 
  ApiResponse,
  Schedule, 
  WeeklyActivity, 
  Category,
  ScheduleResultDTO,
  CalendarListResultDTO,
  WeeklyActivityResultDTO,
  CategoryDistributionResultDTO,
  CompletionRateResultDTO,
  BackendPriority,
  ScheduleCreateDTO,
  ScheduleUpdateDTO
} from '../types';

// 우선순위 매퍼 (Backend -> UI)
const mapPriorityToUI = (priority: BackendPriority): 'high' | 'med' | 'low' => {
  switch (priority) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'med';
    case 'LOW': return 'low';
    default: return 'med';
  }
};

// 날짜 포맷 어댑터 (Backend -> UI)
// ISO 시간 문자열을 UI에서 쓰이는 친근한 날짜/시간(예: 오늘 오전 10:00, 내일 오후 06:00) 문자열로 가공
const mapTimeToUI = (startTime: string): string => {
  const start = new Date(startTime);
  const now = new Date();
  
  const isToday = start.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = start.toDateString() === tomorrow.toDateString();
  
  const formatTime = (d: Date) => {
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${ampm} ${displayHours}:${minutes}`;
  };

  const dayLabel = isToday ? '오늘' : isTomorrow ? '내일' : `${start.getMonth() + 1}월 ${start.getDate()}일`;
  return `${dayLabel} ${formatTime(start)}`;
};

// 일정 상세 데이터 DTO -> UI Model 변환 어댑터
const mapScheduleToUI = (dto: ScheduleResultDTO): Schedule => {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.categoryName || '기타',
    priority: mapPriorityToUI(dto.priority),
    time: mapTimeToUI(dto.startTime),
    isCompleted: dto.isCompleted,
    type: dto.scheduleType === 'DEADLINE' ? 'deadline' : 'start'
  };
};

// YYYY-MM-DD 날짜 포맷 생성 헬퍼
const formatDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 최근 통계 기간(30일) 계산용 헬퍼
const getRecentPeriod = (daysOffset: number = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysOffset);
  return {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  };
};

// 로컬 시간대 ISO 8601 포맷 생성 헬퍼
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatLocalISO = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  
  return {
    startDate: formatLocalISO(start),
    endDate: formatLocalISO(end)
  };
};

// 일정 서비스
export const scheduleService = {
  // 오늘 하루 일정 목록 조회
  getTodaySchedules: async (): Promise<Schedule[]> => {
    const range = getTodayRange();
    const response = await apiClient.get<ApiResponse<CalendarListResultDTO>>('/schedules/calendar', { params: range });
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.schedules.map(mapScheduleToUI);
    }
    return [];
  },

  // 전체 기간 일정 목록 조회 (캘린더용, 과거 1년부터 미래 1년 범위)
  getAllSchedules: async (): Promise<Schedule[]> => {
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
      return response.data.result.schedules.map(mapScheduleToUI);
    }
    return [];
  },

  // 일정 신규 생성
  createSchedule: async (data: ScheduleCreateDTO): Promise<ApiResponse<ScheduleResultDTO>> => {
    const response = await apiClient.post<ApiResponse<ScheduleResultDTO>>('/schedules', data);
    return response.data;
  },

  // 일정 정보 수정
  updateSchedule: async (id: number, data: ScheduleUpdateDTO): Promise<ApiResponse<ScheduleResultDTO>> => {
    const response = await apiClient.patch<ApiResponse<ScheduleResultDTO>>(`/schedules/${id}`, data);
    return response.data;
  },

  // 일정 완료 여부 토글
  toggleCompletion: async (id: number, isCompleted: boolean): Promise<ApiResponse<ScheduleResultDTO>> => {
    const response = await apiClient.patch<ApiResponse<ScheduleResultDTO>>(`/schedules/${id}/completion`, { isCompleted });
    return response.data;
  },

  // 일정 삭제
  deleteSchedule: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedules/${id}`);
    return response.data;
  }
};

// 통계 서비스
export const statsService = {
  // 주간 활동량 통계 조회 (기본값: 최근 28일 트렌드 조회)
  getWeeklyActivity: async (startDate?: string, endDate?: string): Promise<WeeklyActivity[]> => {
    const period = startDate && endDate ? { startDate, endDate } : getRecentPeriod(28);
    const response = await apiClient.get<ApiResponse<WeeklyActivityResultDTO[]>>('/stats/weekly-activity', { params: period });
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.map(item => ({
        name: item.weekLabel,
        count: Number(item.count)
      }));
    }
    return [];
  },

  // 월간 활동량 통계 조회 (기본값: 최근 6개월 트렌드 조회)
  getMonthlyActivity: async (startDate?: string, endDate?: string): Promise<{ name: string; count: number }[]> => {
    const period = startDate && endDate ? { startDate, endDate } : getRecentPeriod(180);
    const response = await apiClient.get<ApiResponse<{ monthLabel: string; count: number }[]>>('/stats/monthly-activity', { params: period });
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.map(item => ({
        name: item.monthLabel,
        count: Number(item.count)
      }));
    }
    return [];
  },

  // 카테고리별 일정 점유율 조회 (기본값: 전체 기간)
  getCategoryDistribution: async (startDate?: string, endDate?: string): Promise<Category[]> => {
    const period = startDate && endDate ? { startDate, endDate } : { startDate: '2000-01-01', endDate: '2099-12-31' };
    
    // 카테고리 점유율 수치와 백엔드 카테고리 색상 설정을 동시에 요청
    const [statsRes, categoriesRes] = await Promise.all([
      apiClient.get<ApiResponse<CategoryDistributionResultDTO[]>>('/stats/category-distribution', { params: period }),
      apiClient.get<ApiResponse<{ categories: { name: string; color: string }[] }>>('/categories')
    ]);

    const categoryColorMap: Record<string, string> = {};
    if (categoriesRes.data.isSuccess && categoriesRes.data.result) {
      categoriesRes.data.result.categories.forEach(cat => {
        categoryColorMap[cat.name] = cat.color;
      });
    }

    const DEFAULT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#9ca3af', '#ec4899', '#3b82f6'];

    if (statsRes.data.isSuccess && statsRes.data.result) {
      return statsRes.data.result.map((item, idx) => ({
        name: item.categoryName,
        value: Math.round(item.share),
        color: categoryColorMap[item.categoryName] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
      }));
    }
    return [];
  },

  // 일정 완료율 정보 조회 (기본값: 최근 30일)
  getCompletionRate: async (startDate?: string, endDate?: string): Promise<{ rate: number; completed: number; total: number }> => {
    const period = startDate && endDate ? { startDate, endDate } : getRecentPeriod(30);
    const response = await apiClient.get<ApiResponse<CompletionRateResultDTO>>('/stats/completion-rate', { params: period });
    if (response.data.isSuccess && response.data.result) {
      const res = response.data.result;
      return {
        rate: Math.round(res.completionRate),
        completed: Number(res.doneCount),
        total: Number(res.totalCount)
      };
    }
    return { rate: 0, completed: 0, total: 0 };
  }
};
