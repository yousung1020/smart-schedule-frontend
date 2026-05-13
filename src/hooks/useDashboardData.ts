import { useState, useEffect } from 'react';
import { scheduleService, statsService } from '../services/scheduleService';
import type { Schedule, WeeklyActivity, Category } from '../types';

export const useDashboardData = () => {
  const [tasks, setTasks] = useState<Schedule[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyActivity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, weeklyRes, categoriesRes] = await Promise.all([
        scheduleService.getTodaySchedules(),
        statsService.getWeeklyActivity(),
        statsService.getCategoryDistribution()
      ]);
      setTasks(tasksRes);
      setWeeklyData(weeklyRes);
      setCategories(categoriesRes);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tasks,
    weeklyData,
    categories,
    loading,
    error,
    refresh: fetchData
  };
};
