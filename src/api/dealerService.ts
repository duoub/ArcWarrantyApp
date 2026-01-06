/**
 * Dealer API Service
 * API calls for dealer list and management
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  DealerListRequest,
  DealerListResponse,
  DealerInfoRaw,
  DealerInfo,
} from '../types/dealer';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseDealerInfo = (raw: DealerInfoRaw): DealerInfo => {
  return {
    id: raw.id,
    name: raw.name || '',
    phone: raw.phone || '',
    address: raw.address || '',
  };
};

export const dealerService = {
  /**
   * Get dealer list
   * API: /forza/getlistdaily?storeid=xxx&userid=xxx&upage=1&TicketRange=&keyword=
   */
  getDealerList: async (
    params?: DealerListRequest
  ): Promise<DealerListResponse> => {
    try {
      const credentials = getUserCredentials();

      // Build API URL with query params
      const apiParams: Record<string, string> = {
        storeid: API_CONFIG.STORE_ID,
        userid: credentials.userid,
        upage: String(params?.upage || 1),
        TicketRange: params?.TicketRange || '',
        keyword: params?.keyword || '',
      };

      const url = buildApiUrl('/getlistdaily', apiParams);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Validate response
      if (!result.list || !Array.isArray(result.list)) {
        throw new Error('Invalid response format');
      }

      // Parse raw data to clean format
      const parsedData: DealerInfo[] = result.list.map(parseDealerInfo);

      return {
        nextpage: result.nextpage || false,
        list: parsedData,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
