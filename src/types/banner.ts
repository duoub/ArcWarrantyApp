/**
 * Banner Type Definitions
 */

export interface BannerItem {
  id: number;
  title: string;
  banner: string;
  bannerurl: string;
  bannerurl668_429: string;
  storeid: string;
  link: string;
  codelink: string;
}

export interface GetHomeBannerResponse {
  status: boolean;
  showquydinh: boolean;
  banners: string[];
  banners2: string[];
  banners3: BannerItem[];
  message?: string | null;
}
