/**
 * Payment Detail Type Definitions
 */

// Raw API response from backend
export interface PaymentDetailRaw {
  ThoiGian: string;
  SoTien: string;
  ImageUrls: string[];
  PhuongThucThanhToan: string;
  SoChungTu: string;
}

// App's clean interface
export interface PaymentDetail {
  id: string;
  time: string;
  amount: string;
  imageUrls: string[];
  paymentMethod: string;
  documentNumber: string;
}

// API Request/Response types
export interface GetPaymentListRequest {
  upage: number;
}

export interface GetPaymentListResponse {
  status: boolean;
  list: PaymentDetail[];
  nextpage: boolean;
  message?: string;
}
