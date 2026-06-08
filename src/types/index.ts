// 공통 API 응답 규격
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export * from './auth';
export * from './schedule';
export * from './category';
export * from './statistics';
