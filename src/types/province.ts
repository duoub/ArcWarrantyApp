export interface ProvinceRaw {
  MaDiaBan: string;
  TenDiaBan: string;
  MaDiaBanCha: string;
}

export interface Province {
  MaDiaBan: string;
  TenDiaBan: string;
  MaDiaBanCha: string;
}

export interface GetProvincesResponse {
  status: boolean;
  list: Province[];
  message?: string;
}
