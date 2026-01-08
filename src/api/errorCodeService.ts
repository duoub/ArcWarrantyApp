/**
 * Error Code API Service
 * API calls for error code lookup
 */

import { buildApiUrl } from '../utils/apiHelper';
import {
  GetErrorCodeListRequest,
  GetErrorCodeListResponse,
  ErrorCodeRaw,
  ErrorCode,
} from '../types/errorCode';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseErrorCode = (raw: ErrorCodeRaw): ErrorCode => {
  return {
    id: raw.MaLoi || '',
    code: raw.MaLoi || '',
    name: raw.TenLoi || '',
    category: raw.DanhMuc || '',
    cause: raw.NguyenNhan || '',
    solution: raw.CachKhacPhuc || '',
  };
};

export const errorCodeService = {
  /**
   * Get list of error codes
   * API: /getlistmaloi?storeid=xxx&page=1&keyword=
   */
  getErrorCodeList: async (
    params: GetErrorCodeListRequest
  ): Promise<GetErrorCodeListResponse> => {
    try {
      const { page, keyword = '' } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistmaloi', {
        storeid: API_CONFIG.STORE_ID,
        page: page,
        keyword: keyword,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Check if we got valid data
      const hasData = result.list !== undefined;

      if (!hasData && result.message) {
        throw new Error(result.message);
      }

      // Parse raw data to clean format
      const parsedList: ErrorCode[] = (result.list || []).map(parseErrorCode);

      return {
        status: true,
        list: parsedList,
        nextpage: result.nextpage || false,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
