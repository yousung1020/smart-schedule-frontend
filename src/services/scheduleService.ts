import type { Schedule, WeeklyActivity, Category } from '../types';

// Mock data for initial implementation
const MOCK_TASKS: Schedule[] = [
  { id: 1, title: '프로젝트 제안서 마무리', category: '업무', priority: 'high', time: '오늘 오전 10:00', isCompleted: false, type: 'deadline' },
  { id: 2, title: '주간 팀 회의', category: '업무', priority: 'med', time: '오늘 오후 02:00', isCompleted: true, type: 'start' },
  { id: 3, title: '식료품 장보기', category: '개인', priority: 'low', time: '내일 오후 06:00', isCompleted: false, type: 'deadline' },
  { id: 4, title: '헬스장 하체 운동', category: '건강', priority: 'med', time: '5월 13일 오전 07:00', isCompleted: false, type: 'start' },
  { id: 5, title: '리액트 성능 최적화 공부', category: '학습', priority: 'high', time: '5월 15일 오후 09:00', isCompleted: false, type: 'deadline' },
];

const MOCK_WEEKLY: WeeklyActivity[] = [
  { name: '월', count: 5 },
  { name: '화', count: 8 },
  { name: '수', count: 6 },
  { name: '목', count: 9 },
  { name: '금', count: 4 },
  { name: '토', count: 2 },
  { name: '일', count: 3 },
];

const MOCK_CATEGORIES: Category[] = [
  { name: '업무', value: 45, color: '#4f46e5' },
  { name: '개인', value: 25, color: '#10b981' },
  { name: '학습', value: 20, color: '#f59e0b' },
  { name: '기타', value: 10, color: '#9ca3af' },
];

export const scheduleService = {
  getTodaySchedules: async (): Promise<Schedule[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_TASKS), 300);
    });
  },
};

export const statsService = {
  getWeeklyActivity: async (): Promise<WeeklyActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_WEEKLY), 300);
    });
  },
  getCategoryDistribution: async (): Promise<Category[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CATEGORIES), 300);
    });
  }
};
