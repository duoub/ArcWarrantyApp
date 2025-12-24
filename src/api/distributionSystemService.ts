/**
 * Distribution System API Service
 * API calls for distribution system list and management
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetDistributorsRequest,
  GetDistributorsResponse,
  DistributorRaw,
  Distributor,
} from '../types/distributionSystem';

/**
 * Parse and transform raw API data to clean app format
 */
const parseDistributor = (raw: DistributorRaw): Distributor => {
  return {
    id: raw.MaTram,
    TenTram: raw.TenTram || '',
    SoDienThoai: raw.SoDienThoai || '',
    DiaChi: raw.DiaChi || '',
  };
};

export const distributionSystemService = {
  /**
   * Get list of distributors
   * API: /getlistnhaphanphoi?storeid=xxx&page=1&tentinhthanh=xxx&keyword=
   */
  getDistributors: async (
    params: GetDistributorsRequest
  ): Promise<GetDistributorsResponse> => {
    try {
      const credentials = getUserCredentials();
      const { page, tentinhthanh, keyword = '' } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistnhaphanphoi', {
        storeid: credentials.storeid,
        page: page,
        tentinhthanh: tentinhthanh,
        keyword: keyword,
      });

      console.log('🏢 Fetching distributors:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('🏢 Distributors response:', {
        nextpage: result.nextpage,
        listLength: result.list?.length,
        firstItem: result.list?.[0],
      });

      // API doesn't return status field, check if we have data
      const hasData = result.list !== undefined;

      if (!hasData && result.message) {
        throw new Error(result.message);
      }

      // Parse raw data to clean format
      const parsedList: Distributor[] = (result.list || []).map(
        parseDistributor
      );

      console.log('✅ Parsed first distributor:', parsedList[0]);

      return {
        status: true,
        list: parsedList,
        nextpage: result.nextpage || false,
        message: result.message,
      };
    } catch (error) {
      console.error('❌ Distributors fetch error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
