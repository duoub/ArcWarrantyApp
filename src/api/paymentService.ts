/**
 * Payment API Service
 * API calls for payment details and history
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetPaymentListRequest,
  GetPaymentListResponse,
  PaymentDetailRaw,
  PaymentDetail,
} from '../types/payment';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parsePaymentDetail = (raw: PaymentDetailRaw, index: number): PaymentDetail => {
  return {
    id: `${raw.SoChungTu || ''}-${index}`,
    time: raw.ThoiGian || '',
    amount: raw.SoTien || '0',
    imageUrls: raw.ImageUrls || [],
    paymentMethod: raw.PhuongThucThanhToan || '',
    documentNumber: raw.SoChungTu || '',
  };
};

export const paymentService = {
  /**
   * Get list of payment details
   * API: /getlistthanhtoan?userid=xxx&storeid=xxx&upage=1
   */
  getPaymentList: async (
    params: GetPaymentListRequest
  ): Promise<GetPaymentListResponse> => {
    try {
      const credentials = getUserCredentials();
      const { upage } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistthanhtoan', {
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
      const parsedList: PaymentDetail[] = (result.list || []).map(
        (item: PaymentDetailRaw, index: number) => parsePaymentDetail(item, index)
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
