/**
 * Inventory Type Definitions
 */

// API Response from backend
export interface InventoryItemRaw {
  id: number;
  serial: string;
  tenhangsanxuat: string;
  tenmodel: string;
  thoigianbaohanh: string;
  ngaynhapkho: string;
  ngaymua: string;
  kichhoatbaohanh: string | number;
  kichhoatbaohanhname: string;
  ngaykichhoat: string;
  hanbaohanh: string;
  statuscolor: string;
  // Additional fields from API
  diemtichluy: string | null;
  dienthoaikhachhang: string | null;
  tenkhachhang: string | null;
  diachikhachhang: string | null;
  idkhachhang: string | null;
  emailkhachhang: string | null;
  thongtinxe: string | null;
  tensanpham: string | null;
  nguonkichhoat: string | null;
  tendlnpp: string | null;
  loaibaohanh: string | null;
  quydinhbaohanh: string | null;
  diachinhanbaohanh: string | null;
  cactruonghopkhongnhanbaohanh: string | null;
  ghichubaohanh: string | null;
  hangsanxuat: string | null;
  model: string | null;
  nhomsp: string | null;
  seriallinhkien: any[];
}

// App's clean interface
export interface InventoryItem {
  id: number;
  serial: string;
  tenhangsanxuat: string;
  tenmodel: string;
  thoigianbaohanh: string;
  ngaynhapkho: string;
  ngaymua: string;
  kichhoatbaohanh: number;
  kichhoatbaohanhname: string;
  ngaykichhoat: string;
  hanbaohanh: string;
  statuscolor: string;
}

export interface GetInventoryListRequest {
  page: number;
  type: '1' | '2'; // 1: Còn trong kho, 2: Đã bán
  keyword?: string;
}

export interface GetInventoryListResponse {
  status: boolean;
  list: InventoryItem[];
  count: number;
  nextpage: boolean;
  message?: string;
}

export interface ActivateWarrantyRequest {
  id: string;
}

export interface ActivateWarrantyResponse {
  status: boolean;
  message: string;
}
