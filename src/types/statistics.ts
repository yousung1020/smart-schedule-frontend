export interface WeeklyActivity {
  name: string;
  count: number;
}

// 통계 DTO 규격

// 일정 완료율 통계 DTO
export interface CompletionRateResultDTO {
  completionRate: number;
  totalCount: number;
  doneCount: number;
}

// 카테고리별 일정 점유율 통계 DTO
export interface CategoryDistributionResultDTO {
  categoryId: number;
  categoryName: string;
  count: number;
  share: number;
}

// 주차별 활동량 통계 DTO
export interface WeeklyActivityResultDTO {
  weekLabel: string;
  count: number;
}
