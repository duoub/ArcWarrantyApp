/**
 * Warranty Types
 */

export interface WarrantyActivationRequest {
  serial: string;
  customerName: string;
  phone: string;
  tinhthanh: string;
  quanhuyen: string;
  xaphuong: string;
  address: string;
  email?: string;
}

export interface WarrantyActivationResponse {
  status: boolean;
  message: string;
  data?: {
    serial: string;
    activatedAt: string;
  };
}

export interface WarrantyReportRequest {
  serial: string;
  issueDescription: string;
  customerName: string;
  phone: string;
  tinhthanh: string;
  quanhuyen: string;
  xaphuong: string;
  address: string;
  dailyid?: string;
  images?: Array<{ fileid: string }>;
}

export interface WarrantyReportResponse {
  status: boolean;
  message: string;
  data?: any;
}
