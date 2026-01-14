/**
 * Ranking API Service
 * API calls for dealer ranking data
 */

import { buildApiUrl } from '../utils/apiHelper';
import { RankingMember, GetRankingResponse } from '../types/ranking';
import { API_CONFIG } from '../config/constants';

export const rankingService = {
  /**
   * Get dealer ranking list
   * API: /getlistthanhvien?storeid=xxx
   */
  getListThanhVien: async (): Promise<{ status: boolean; members: RankingMember[] }> => {
    try {
      const url = buildApiUrl('/getlistthanhvien', {
        storeid: API_CONFIG.STORE_ID,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: GetRankingResponse = await response.json();

      if (result && result.listthanhvien && result.listthanhvien.length > 0) {
        return {
          status: true,
          members: result.listthanhvien,
        };
      } else {
        return {
          status: false,
          members: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        members: [],
      };
    }
  },
};
