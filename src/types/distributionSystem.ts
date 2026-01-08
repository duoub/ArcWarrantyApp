/**
 * Distribution System Type Definitions
 */

import { UserType } from "./user";

// Distributor type
// export type DistributorType = 'npp' | 'dl';


// Raw API response from backend
export interface DistributorRaw {
  MaTram: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
}

// App's clean interface
export interface Distributor {
  id: string;
  TenTram: string;
  SoDienThoai: string;
  DiaChi: string;
}

// API Request/Response types
export interface GetDistributorsRequest {
  page: number;
  tentinhthanh: string; // Province name, "Tỉnh thành" for all
  keyword?: string;
  type?: UserType;
}

export interface GetDistributorsResponse {
  status: boolean;
  list: Distributor[];
  nextpage: boolean;
  message?: string;
}
