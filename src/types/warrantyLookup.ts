/**
 * Warranty Lookup Type Definitions
 */

// Raw API response from tracking backend
export interface WarrantyInfoRaw {
  code: string; // mã sản phẩm
  name: string; // tên sản phẩm
  namesp: string; // tên sản phẩm
  activedate: string; // ngày kích hoạt bảo hành dd/mm/yyyy
  warrantytime: string; // thời gian bảo hành
  expirydate: string; // ngày hết hạn bảo hành dd/mm/yyyy
  serial: string; // serial sản phẩm
  customername: string; // tên KH
  customermobile: string; // SĐT KH
  customerphone: string; // SĐT KH (trường bổ sung)
  customeraddress: string; // Địa chỉ KH
  note: string; // ghi chú bảo hành
  type: string; // chủng loại
}

// App's clean interface
export interface WarrantyInfo {
  code: string;
  name: string;
  namesp: string;
  activeDate: string;
  warrantyTime: string;
  expiryDate: string;
  serial: string;
  customerName: string;
  customerMobile: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
  type: string;
  status: 'active' | 'expired' | 'not_found';
}

// API Request/Response types
export interface WarrantyLookupRequest {
  keyword: string; // Serial or customer info
  fromdate?: string; // ddmmyyyy format
  todate?: string; // ddmmyyyy format
}

export interface WarrantyLookupResponse {
  success: boolean;
  data: WarrantyInfo[];
  message?: string;
}
