export interface GetInfoAppResponse {
  showquydinh: boolean;
  status: boolean;
  message: string | null;
  hotline: string;
  zalo: string;
  zalo2: string;
  website: string;
  countThongBaoChuaDoc: number;
  appidStour: string;
  appidScell: string;
  appidSsale: string;
  appidSgara: string;
  version: string;
  titleApp: string;
  address: string;
  phone: string;
}

export interface AppInfo {
  hotline: string;
  website: string;
  titleApp: string;
  address: string;
  phone: string;
}
