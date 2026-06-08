import { useState, useEffect } from 'react';
import { statsService } from '../services/scheduleService';
import { apiClient } from '../api/apiClient';
import type { ApiResponse, CalendarListResultDTO, WeeklyActivity, Category } from '../types';

// 날짜 범위를 생성
const getAnalyticsRange = (pastDays: number = 30) => {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - pastDays);

  const queryEnd = new Date();
  queryEnd.setFullYear(queryEnd.getFullYear() + 1);

  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    start,
    end,
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    endDate: `${queryEnd.getFullYear()}-${pad(queryEnd.getMonth() + 1)}-${pad(queryEnd.getDate())}`
  };
}

export interface RecentCompletedTask {
  label: string;
  category: string;
  status: string;
  date: string;
  isCancel?: boolean;
}

export const useAnalyticsData = () => {
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<{ name: string; count: number }[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<Category[]>([]);
  const [completionStats, setCompletionStats] = useState({ rate: 0, completed: 0, total: 0 });
  const [busiestDay, setBusiestDay] = useState({ name: '-', count: 0 });
  const [streak, setStreak] = useState(0);
  const [recentCompleted, setRecentCompleted] = useState<RecentCompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const { start, end, startDate, endDate } = getAnalyticsRange(30);
        const range = { startDate, endDate };

        // 기존 통계 API 동시 요청
        const [weekly, monthly, categories, completion] = await Promise.all([
          statsService.getWeeklyActivity(),
          statsService.getMonthlyActivity(),
          statsService.getCategoryDistribution(),
          statsService.getCompletionRate(range.startDate, range.endDate)
        ]);

        setWeeklyActivity(weekly);
        setMonthlyActivity(monthly);
        setCategoryDistribution(categories);
        setCompletionStats(completion);

        const queryRange = {
          startDate: `${range.startDate}T00:00:00`,
          endDate: `${range.endDate}T23:59:59`
        };

        const response = await apiClient.get<ApiResponse<CalendarListResultDTO>>('/schedules/calendar', { params: queryRange });

        if (response.data.isSuccess && response.data.result) {
          const schedules = response.data.result.schedules;

          // 통계(바쁜 요일, Streak) 계산은 오늘(end) 자정 시점 이하의 일정들만 필터링하여 활용
          const todayLimit = new Date(end);
          todayLimit.setHours(23, 59, 59, 999);
          const schedulesForStats = schedules.filter(s => {
            if (!s.startTime) return false;
            return new Date(s.startTime) <= todayLimit;
          });

          // 가장 바쁜 요일 동적 계산
          const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
          const dayCounts = Array(7).fill(0);
          const dayOccurrences = Array(7).fill(0);

          schedulesForStats.forEach(s => {
            if (s.startTime) {
              const d = new Date(s.startTime);
              dayCounts[d.getDay()]++;
            }
          });

          // 30일 범위 내 요일별 실제 등장 횟수 계산
          const tempDate = new Date(start);
          while (tempDate <= end) {
            dayOccurrences[tempDate.getDay()]++;
            tempDate.setDate(tempDate.getDate() + 1);
          }

          let busiestIdx = -1;
          let maxAvg = 0;
          for (let i = 0; i < 7; i++) {
            const avg = dayOccurrences[i] > 0 ? dayCounts[i] / dayOccurrences[i] : 0;
            if (avg > maxAvg) {
              maxAvg = avg;
              busiestIdx = i;
            }
          }

          if (busiestIdx !== -1 && maxAvg > 0) {
            setBusiestDay({
              name: daysOfWeek[busiestIdx],
              count: Math.round(maxAvg * 10) / 10
            });
          } else {
            setBusiestDay({
              name: '-',
              count: 0
            });
          }

          // 연속 달성일(Streak) 동적 계산
          const dateMap: Record<string, { total: number; completed: number }> = {};
          schedulesForStats.forEach(s => {
            if (s.startTime) {
              const dateStr = s.startTime.split('T')[0];
              if (!dateMap[dateStr]) {
                dateMap[dateStr] = { total: 0, completed: 0 };
              }
              dateMap[dateStr].total++;
              if (s.isCompleted) {
                dateMap[dateStr].completed++;
              }
            }
          });

          let consecutiveCompletedDays = 0;
          const checkDate = new Date();
          const todayStr = checkDate.toISOString().split('T')[0];
          const todayStats = dateMap[todayStr];

          // 오늘 등록된 일정이 있고 아직 미완료 상태라면 어제부터 계산 시작
          if (todayStats && todayStats.total > 0 && todayStats.completed < todayStats.total) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const stats = dateMap[dateStr];

            if (stats && stats.total > 0) {
              if (stats.completed === stats.total) {
                consecutiveCompletedDays++;
              } else {
                break; // 연속성 깨짐
              }
            }
            checkDate.setDate(checkDate.getDate() - 1);
          }
          setStreak(consecutiveCompletedDays);

          // 최근 완료 상세 통계 (상위 4개)
          const getRelativeDateLabel = (dateStr: string) => {
            const d = new Date(dateStr);
            const now = new Date();

            // 시각 비교를 위해 날짜 시작 지점으로 초기화
            const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const diffTime = nowDate.getTime() - dDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return '오늘';
            if (diffDays === 1) return '어제';
            if (diffDays < 0) {
              return `${Math.abs(diffDays)}일 후`;
            }
            return `${diffDays}일 전`;
          };

          const today = new Date();
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setDate(today.getDate() - 30);
          const oneMonthLater = new Date(today);
          oneMonthLater.setDate(today.getDate() + 30);

          const completedSchedules = schedules
            .filter(s => {
              if (!s.isCompleted || !s.startTime) return false;
              const sDate = new Date(s.startTime);
              return sDate >= oneMonthAgo && sDate <= oneMonthLater;
            })
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map(s => ({
              label: s.title,
              category: s.categoryName || '기타',
              status: '완료',
              date: getRelativeDateLabel(s.startTime)
            }));

          setRecentCompleted(completedSchedules);
        }
      } catch (err) {
        setError('통계 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    weeklyActivity,
    monthlyActivity,
    categoryDistribution,
    completionStats,
    busiestDay,
    streak,
    recentCompleted,
    loading,
    error
  };
};