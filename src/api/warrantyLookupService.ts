/**
 * Warranty Lookup API Service
 * API calls for warranty tracking and lookup
 */

import { buildTrackingApiUrl, getUserCredentials } from '../utils/apiHelper';
import { API_CONFIG } from '../config/constants';
import {
  WarrantyLookupRequest,
  WarrantyLookupResponse,
  WarrantyInfoRaw,
  WarrantyInfo,
} from '../types/warrantyLookup';

/**
 * Parse and transform raw API data to clean app format
 */
const parseWarrantyInfo = (raw: WarrantyInfoRaw): WarrantyInfo => {
  // Determine warranty status based on expiry date
  const getWarrantyStatus = (expiryDate: string): 'active' | 'expired' | 'not_found' => {
    if (!expiryDate) return 'not_found';

    try {
      // Parse dd/mm/yyyy format
      const parts = expiryDate.split('/');
      if (parts.length !== 3) return 'not_found';

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2], 10);

      const expiry = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return expiry >= today ? 'active' : 'expired';
    } catch {
      return 'not_found';
    }
  };

  return {
    code: raw.code || '',
    name: raw.name || raw.namesp || '',
    namesp: raw.namesp || raw.name || '',
    activeDate: raw.activedate || '',
    warrantyTime: raw.warrantytime || '',
    expiryDate: raw.expirydate || '',
    serial: raw.serial || '',
    customerName: raw.customername || '',
    customerMobile: raw.customermobile || '',
    customerPhone: raw.customerphone || '',
    customerAddress: raw.customeraddress || '',
    note: raw.note || '',
    type: raw.type || '',
    status: getWarrantyStatus(raw.expirydate),
  };
};

export const warrantyLookupService = {
  /**
   * Lookup warranty information
   * API: /warranty?token=xxx&keyword=xxx&fromdate=ddmmyyyy&todate=ddmmyyyy
   */
  lookupWarranty: async (
    params: WarrantyLookupRequest
  ): Promise<WarrantyLookupResponse> => {
    try {
      const credentials = getUserCredentials();
      const { keyword, fromdate, todate } = params;

      // Build API URL with query params
      const apiParams: Record<string, string> = {
        token: credentials.storeid,
        keyword: keyword,
      };

      if (fromdate) {
        apiParams.fromdate = fromdate;
      }

      if (todate) {
        apiParams.todate = todate;
      }

      const url = buildTrackingApiUrl('/warranty', apiParams);

      console.log('🔍 Fetching warranty info:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('🔍 Warranty lookup response:', {
        resultType: Array.isArray(result) ? 'array' : typeof result,
        count: Array.isArray(result) ? result.length : 0,
        firstItem: Array.isArray(result) && result.length > 0 ? result[0] : null,
      });

      // API returns array directly
      if (!Array.isArray(result)) {
        throw new Error('Invalid response format');
      }

      // Parse raw data to clean format
      const parsedData: WarrantyInfo[] = result.map(parseWarrantyInfo);

      console.log('✅ Parsed warranty info:', parsedData);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      console.error('❌ Warranty lookup error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
