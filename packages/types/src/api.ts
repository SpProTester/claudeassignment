export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
