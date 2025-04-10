export type Timestamp = string; // ISO 8601 format

export interface BaseEntity {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};