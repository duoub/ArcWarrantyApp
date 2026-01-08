/**
 * Error Code Type Definitions
 */

// Raw API response from backend
export interface ErrorCodeRaw {
  MaLoi: string;
  TenLoi: string;
  DanhMuc: string;
  NguyenNhan: string;
  CachKhacPhuc: string;
}

// App's clean interface
export interface ErrorCode {
  id: string;
  code: string;
  name: string;
  category: string;
  cause: string;
  solution: string;
}

// API Request/Response types
export interface GetErrorCodeListRequest {
  page: number;
  keyword?: string;
}

export interface GetErrorCodeListResponse {
  status: boolean;
  list: ErrorCode[];
  nextpage: boolean;
  message?: string;
}
