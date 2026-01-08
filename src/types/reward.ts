/**
 * Reward Detail Type Definitions
 */

// Transaction type for reward details
export type RewardTransactionType = '3' | '4' | '5';
// 3: Sell out products
// 4: Sell in products
// 5: Activated warranty products

// Raw API response from backend (reusing inventory structure)
export interface RewardTransactionRaw {
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
  // Additional fields
  diemtichluy: string | null;
  tensanpham: string | null;
  tendlnpp: string | null;
  hangsanxuat: string | null;
  model: string | null;
  [key: string]: any;
}

// App's clean interface
export interface RewardTransaction {
  id: number;
  serial: string;
  manufacturer: string;
  model: string;
  warrantyPeriod: string;
  warehouseDate: string;
  purchaseDate: string;
  activationStatus: number;
  activationStatusName: string;
  activationDate: string;
  warrantyExpiry: string;
  statusColor: string;
  productName: string;
  distributorName: string;
}

// API Request/Response types
export interface GetRewardTransactionsRequest {
  upage: number;
  type: RewardTransactionType;
}

export interface GetRewardTransactionsResponse {
  status: boolean;
  list: RewardTransaction[];
  count: number;
  nextpage: boolean;
  message?: string;
}
