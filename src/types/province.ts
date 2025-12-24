// Raw API response for location data (Province/District/Ward)
export interface ProvinceRaw {
  MaDiaBan: string;
  TenDiaBan: string;
  MaDiaBanCha: string;
}

// Clean location data interface (works for Province/District/Ward)
export interface Province {
  MaDiaBan: string;
  TenDiaBan: string;
  MaDiaBanCha: string;
}

// Alias for clarity in different contexts
export type Location = Province;
export type District = Province;
export type Ward = Province;

export interface GetProvincesResponse {
  status: boolean;
  list: Province[];
  message?: string;
}

// Generic location response (for Province/District/Ward)
export interface GetLocationsResponse {
  status: boolean;
  list: Location[];
  message?: string;
}
