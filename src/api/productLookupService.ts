/**
 * Product Lookup API Service
 * API calls for product authenticity check
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  ProductLookupRequest,
  ProductLookupResponse,
  ProductInfoRaw,
  ProductInfo,
} from '../types/productLookup';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseProductInfo = (raw: ProductInfoRaw, serial: string): ProductInfo => {
  return {
    code: raw.code || '',
    name: raw.name || '',
    warrantyTime: raw.thoigianbaohanh || '',
    exportDate: raw.ngayxuatkho || '',
    seller: raw.noiban || '',
    serial: serial,
    isAuthentic: true, // If we get data back, the product is authentic
    status: 'authentic',
  };
};

export const productLookupService = {
  /**
   * Check product authenticity by serial/IMEI
   * API: /getlistcheckproduct?storeid=xxx&imeiserial=xxx&getjson=1
   */
  checkProduct: async (
    params: ProductLookupRequest
  ): Promise<ProductLookupResponse> => {
    try {
      // const credentials = getUserCredentials();
      const { imeiserial } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistcheckproduct', {
        storeid: API_CONFIG.STORE_ID,
        imeiserial: imeiserial,
        getjson: 1,
      });

      console.log('🔍 Checking product:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('🔍 Product check response:', {
        resultType: typeof result,
        hasCode: result?.code ? 'yes' : 'no',
        data: result,
      });

      // Check if we got valid product data
      if (result && (result.code || result.name)) {
        const productInfo = parseProductInfo(result, imeiserial);

        console.log('✅ Parsed product info:', productInfo);

        return {
          success: true,
          data: productInfo,
        };
      } else {
        // No product found or invalid data
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy thông tin sản phẩm',
        };
      }
    } catch (error) {
      console.error('❌ Product check error:', error);
      return {
        success: false,
        data: null,
        message: 'Không tìm thấy thông tin sản phẩm',
      };
      // if (error instanceof Error) {
      //   throw error;
      // }
      // throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
