/**
 * Ranking Type Definitions
 */

export interface RankingMember {
  name: string;
  avatar: string;
  tongdiemkichhoat: string;
  diemhientai: string;
  doanhsodat: string;
  khuvuckinhdoanh: string;
}

export interface GetRankingResponse {
  thanhvienavatar1: string;
  thanhvienavatar2: string;
  thanhvienavatar3: string;
  thanhvien1: string;
  thanhvien2: string;
  thanhvien3: string;
  listthanhvien: RankingMember[];
}
