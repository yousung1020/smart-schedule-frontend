export type Priority = 'high' | 'med' | 'low';

export interface Schedule {
  id: number;
  title: string;
  category: string;
  priority: Priority;
  time: string;
  isCompleted: boolean;
  type?: 'start' | 'deadline';
  color?: string; // 일정 고유 색상
}

// 일정 DTO 규격

export type BackendPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type BackendScheduleType = 'START' | 'DEADLINE';

// 일정 생성 요청 DTO
export interface ScheduleCreateDTO {
  title: string;
  content?: string;
  startTime: string; // ISO 8601 (LocalDateTime)
  endTime: string;   // ISO 8601 (LocalDateTime)
  priority: BackendPriority;
  categoryId?: number;
  scheduleType: BackendScheduleType;
  notifyBeforeMinutes?: number[];
  color?: string; // 일정 고유 색상
}

// 일정 수정 요청 DTO
export interface ScheduleUpdateDTO {
  title: string;
  content?: string;
  startTime: string; // ISO 8601 (LocalDateTime)
  endTime: string;   // ISO 8601 (LocalDateTime)
  priority: BackendPriority;
  categoryId?: number;
  scheduleType: BackendScheduleType;
  notifyBeforeMinutes?: number[];
  color?: string; // 일정 고유 색상
}

// 일정 단건 조회 상세 결과 DTO
export interface ScheduleResultDTO {
  id: number;
  title: string;
  content: string;
  startTime: string; // ISO 8601 (LocalDateTime)
  endTime: string;   // ISO 8601 (LocalDateTime)
  priority: BackendPriority;
  isCompleted: boolean;
  scheduleType: BackendScheduleType;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  color?: string; // 일정 고유 색상
  createdAt: string;
  updatedAt: string;
}

// 캘린더 뷰를 위한 리스트 응답 DTO
export interface CalendarListResultDTO {
  schedules: ScheduleResultDTO[];
}

// 검색/리스트 뷰를 위한 페이징 응답 DTO
export interface PagedListResultDTO {
  content: ScheduleResultDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

