/**
 * Sales Program Type Definitions
 */

// Raw API response from backend
export interface SalesProgramDataRaw {
  // Commission summary
  amounthoahongdathanhtoan?: string;
  amounthoahongconlai?: string;
  countHoaHong?: string;

  // User banking info
  address?: string;
  taxcode?: string;
  sotaikhoan?: string;
  tentaikhoan?: string;
  tinhthanh?: string;
  nganhang?: string;
  birthday?: string;

  // Stats
  countThongBaoChuaDoc?: string;
  diemhientai?: string;
  countserialkichhoat?: number;
  tienquydoi?: string;
  tongdiemkichhoat?: string;

  // Sales programs list
  listchuongtrinhsale?: SalesProgramItemRaw[];
  listGroupSanPhamKichHoat?: any[];
}

// Raw sales program item
export interface SalesProgramItemRaw {
  id: string;
  name: string;
  tenchitieu: string;
  doanhsochitieu: string;
  limittime: string;
  tyledat: string | number;
  doanhsodat: string;
  sosanphamdat: number;
  doanhsoconlai: string;
  thamgia: 0 | 1;
  noidungchitiet: string;
  quyendangky: 0 | 1;
  listquatang: any[];
}

// App's clean interface for sales program item
export interface SalesProgramItem {
  id: string;
  name: string;
  tenchitieu: string;
  doanhsochitieu: string;
  doanhsodat: string;
  doanhsoconlai: string;
  limittime: string;
  tyledat: number;
  thamgia: 0 | 1;
  quyendangky: 0 | 1;
}

// API Request/Response types
export interface GetSalesProgramRequest {
  typeget: number; // Type parameter for profile endpoint (1 for sales program)
}

export interface GetSalesProgramResponse {
  status: boolean;
  data: SalesProgramItem[];
  message?: string;
}

export interface RegisterProgramRequest {
  idct: string; // Program ID
}

export interface RegisterProgramResponse {
  status: boolean;
  message?: string;
}
