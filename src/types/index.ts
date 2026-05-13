export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export type Priority = 'high' | 'med' | 'low';

export interface Schedule {
  id: number;
  title: string;
  category: string;
  priority: Priority;
  time: string;
  isCompleted: boolean;
  type?: 'start' | 'deadline';
}

export interface Category {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyActivity {
  name: string;
  count: number;
}

export * from './auth';
