/**
 * News Type Definitions
 */

// Raw API response item
export interface NewsItemRaw {
  id: number;
  title: string;
  description: string;
  content: string;
  img: string;
  imgurl: string;
  imgurl180_180: string;
  imgurl180_120: string;
  imgurl500_300: string | null;
  imgfacebook: string | null;
  link: string;
  url: string | null;
  linkmedia: string;
  createdate: string;
  createdatehh: string | null;
  datemonth: string;
  year: string;
  luotview: number;
  linkdanhmuc: string;
  namedanhmuc: string | null;
  others: unknown[];
  htmlothers: string | null;
  topview: unknown[];
  htmltopview: string | null;
  sanphamlienquan: string;
  nhomsanphamlienquan: string | null;
}

// API response
export interface GetNewsListResponse {
  nextpage: boolean;
  list: NewsItemRaw[];
}

// Clean news item for app use
export interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string;
  imgurl: string;
  imgurl180_120: string;
  createdate: string;
  luotview: number;
}

// Service response
export interface GetNewsListResult {
  status: boolean;
  list: NewsItem[];
  nextpage: boolean;
}
