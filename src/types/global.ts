export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  status: number;
}

export type ApiError = {
  error: string;
  status: number;
}; 