export interface Category {
  name: string;
  value: number; // 점유율 백분율
  color: string;
}

// 카테고리 DTO 규격

// 카테고리 단건 조회 DTO
export interface CategoryResultDTO {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

// 카테고리 리스트 응답 DTO
export interface CategoryListResultDTO {
  categories: CategoryResultDTO[];
}
