/**
 * Warranty Station Type Definitions
 */

// Raw API response from backend
export interface WarrantyStationRaw {
  id: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
  TinhThanh: string;
  // Add any additional fields from API response if needed
}

// App's clean interface
export interface WarrantyStation {
  id: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
  TinhThanh: string;
}

export interface Province {
  id: string;
  TenDiaBan: string;
}

// API Request/Response types
export interface GetWarrantyStationsRequest {
  page: number;
  tentinhthanh: string; // Province name, "Tỉnh thành" for all
  keyword?: string;
}

export interface GetWarrantyStationsResponse {
  status: boolean;
  list: WarrantyStation[];
  nextpage: boolean;
  count: number;
  message?: string;
}
