/**
 * Product Lookup Type Definitions
 */

// Raw API response from backend
export interface ProductInfoRaw {
  code: string; // Mã sản phẩm
  name: string; // Tên sản phẩm
  thoigianbaohanh: string; // Thời gian bảo hành
  ngayxuatkho: string; // Ngày xuất kho công ty
  noiban: string; // NPP/ĐL bán
}

// App's clean interface
export interface ProductInfo {
  code: string;
  name: string;
  warrantyTime: string;
  exportDate: string;
  seller: string;
  serial: string;
  isAuthentic: boolean;
  status: 'authentic' | 'not_found';
}

// API Request/Response types
export interface ProductLookupRequest {
  imeiserial: string; // IMEI or Serial number
}

export interface ProductLookupResponse {
  success: boolean;
  data: ProductInfo | null;
  message?: string;
}
