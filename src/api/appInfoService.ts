/**
 * App Info API Service
 * API calls for app information data
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import { GetInfoAppResponse, AppInfo } from '../types/appInfo';
import { API_CONFIG } from '../config/constants';

export const appInfoService = {
  /**
   * Get app info
   * API: /getinfoapp?storeid=xxx&userid=xxx
   */
  getInfoApp: async (): Promise<{ status: boolean; info: AppInfo | null }> => {
    try {
      const credentials = getUserCredentials();

      const url = buildApiUrl('/getinfoapp', {
        storeid: API_CONFIG.STORE_ID,
        userid: credentials.username,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: GetInfoAppResponse = await response.json();

      if (result && result.status) {
        return {
          status: true,
          info: {
            hotline: result.hotline,
            website: result.website,
            titleApp: result.titleApp,
            address: result.address,
            phone: result.phone,
          },
        };
      } else {
        return {
          status: false,
          info: null,
        };
      }
    } catch (error) {
      return {
        status: false,
        info: null,
      };
    }
  },
};
