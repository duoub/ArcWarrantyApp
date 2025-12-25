/**
 * Warranty Service
 * API calls for warranty activation and management
 */

import { getUserCredentials, buildApiUrl } from '../utils/apiHelper';
import {
  WarrantyActivationRequest,
  WarrantyActivationResponse,
} from '../types/warranty';

export const warrantyService = {
  /**
   * Activate warranty
   * API: /activeserial
   */
  activate: async (
    data: WarrantyActivationRequest
  ): Promise<WarrantyActivationResponse> => {
    try {
      const credentials = getUserCredentials();
      const url = buildApiUrl('/activeserial');

      const requestData = {
        storeid: credentials.storeid,
        keyword: data.serial,
        cusname: data.customerName,
        cusmobile: data.phone,
        tinhthanh: data.tinhthanh,
        quanhuyen: data.quanhuyen,
        xaphuong: data.xaphuong,
        cusaddress: data.address,
        cusemail: data.email || '',
        userid: credentials.userid,
      };

      console.log('🔐 Activating warranty:', {
        serial: data.serial,
        customer: data.customerName,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      console.log('🔐 Warranty activation response:', {
        status: result.status,
        message: result.message,
      });

      if (!result.status) {
        throw new Error(result.message || 'Kích hoạt bảo hành thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Kích hoạt bảo hành thành công',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ Warranty activation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
