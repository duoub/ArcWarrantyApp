/**
 * Banner API Service
 * API calls for home banner data
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import { BannerItem, GetHomeBannerResponse } from '../types/banner';
import { API_CONFIG } from '../config/constants';

export const bannerService = {
  /**
   * Get home banner list
   * API: /getlisthomebanner?storeid=xxx&userid=xxx
   */
  getHomeBanner: async (): Promise<{ status: boolean; banners: BannerItem[] }> => {
    try {
      const credentials = getUserCredentials();

      const url = buildApiUrl('/getlisthomebanner', {
        storeid: API_CONFIG.STORE_ID,
        userid: credentials.username,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: GetHomeBannerResponse = await response.json();

      if (result && result.banners3 && result.banners3.length > 0) {
        return {
          status: true,
          banners: result.banners3,
        };
      } else {
        return {
          status: false,
          banners: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        banners: [],
      };
    }
  },
};
