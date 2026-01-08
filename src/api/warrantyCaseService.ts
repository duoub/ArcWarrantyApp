/**
 * Warranty Case API Service
 * API calls for warranty case management
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetWarrantyCaseListRequest,
  GetWarrantyCaseListResponse,
  WarrantyCaseRaw,
  WarrantyCase,
} from '../types/warrantyCase';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseWarrantyCase = (raw: WarrantyCaseRaw, index: number): WarrantyCase => {
  return {
    id: `${raw.MaPhieu}-${index}`,
    createdDate: raw.NgayTao || '',
    caseNumber: raw.MaPhieu || '',
    imageUrls: raw.ImageUrls || [],
    issueDescription: raw.HienTuongHuHong || '',
    serial: raw.Serial || '',
    processingStatus: raw.TrangThaiXuLy || '',
    processingDescription: raw.MoTaXuLy || '',
  };
};

export const warrantyCaseService = {
  /**
   * Get list of warranty cases
   * API: /getlistcabaohanh?userid=xxx&storeid=xxx&upage=1
   */
  getWarrantyCaseList: async (
    params: GetWarrantyCaseListRequest
  ): Promise<GetWarrantyCaseListResponse> => {
    try {
      const credentials = getUserCredentials();
      const { upage } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistcabaohanh', {
        userid: credentials.username,
        storeid: API_CONFIG.STORE_ID,
        upage: upage,
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
      const parsedList: WarrantyCase[] = (result.list || []).map(
        (item: WarrantyCaseRaw, index: number) => parseWarrantyCase(item, index)
      );

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
