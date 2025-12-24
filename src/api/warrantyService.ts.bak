/**
 * Warranty Service
 * API calls for warranty activation and management
 */

import { storage, StorageKeys } from '../utils/storage';
import {
  WarrantyActivationRequest,
  WarrantyActivationResponse,
} from '../types/warranty';

export const warrantyService = {
  /**
   * Activate warranty using AsiaticVn API
   * API: https://scell1.qbis.vn/api/forza/activeserial
   */
  activate: async (
    data: WarrantyActivationRequest
  ): Promise<WarrantyActivationResponse> => {
    const apiUrl = 'https://scell1.qbis.vn/api/forza';
    const storeId = '022665047387'; //'022665066528';

    try {
      // Get user info from storage
      const userDataString = storage.getString(StorageKeys.USER_DATA);
      let userId = '';
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.email || userData.username || '';
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }

      const response = await fetch(`${apiUrl}/activeserial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeid: storeId,
          keyword: data.serial,
          cusname: data.customerName,
          cusmobile: data.phone,
          cusaddress: data.address,
          cusemail: data.email || '',
          userid: userId,
        }),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Kích hoạt bảo hành thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Kích hoạt bảo hành thành công',
        data: result.data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
