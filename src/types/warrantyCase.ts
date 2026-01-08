/**
 * Warranty Case Type Definitions
 */

// Raw API response from backend
export interface WarrantyCaseRaw {
  NgayTao: string;
  MaPhieu: string;
  ImageUrls: string[];
  HienTuongHuHong: string;
  Serial: string;
  TrangThaiXuLy: string;
  MoTaXuLy: string;
}

// App's clean interface
export interface WarrantyCase {
  id: string;
  createdDate: string;
  caseNumber: string;
  imageUrls: string[];
  issueDescription: string;
  serial: string;
  processingStatus: string;
  processingDescription: string;
}

// API Request/Response types
export interface GetWarrantyCaseListRequest {
  upage: number;
}

export interface GetWarrantyCaseListResponse {
  status: boolean;
  list: WarrantyCase[];
  nextpage: boolean;
  message?: string;
}
