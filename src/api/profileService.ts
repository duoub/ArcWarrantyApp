/**
 * Profile API Service
 * API calls for user profile and rewards data
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetProfileRequest,
  GetProfileResponse,
  ProfileDataRaw,
  ProfileData,
} from '../types/profile';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseProfileData = (raw: ProfileDataRaw): ProfileData => {
  return {
    salesProgram: raw.thuongchuongtrinhsaleFormat || '0',
    warrantyCommission: raw.hoahongkichhoatFormat || '0',
    total: raw.totalFormat || '0',
    paid: raw.paymentFormat || '0',
    unreadCount: raw.countThongBaoChuaDoc || 0,
  };
};

export const profileService = {
  /**
   * Get user profile and rewards data
   * API: /getprofile?userid=xxx&storeid=xxx&typeget=5
   */
  getProfile: async (
    params: GetProfileRequest
  ): Promise<GetProfileResponse> => {
    try {
      const credentials = getUserCredentials();
      const { typeget } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getprofile', {
        userid: credentials.username,
        storeid: API_CONFIG.STORE_ID,
        typeget: typeget,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Check if we got valid data
      if (result) {
        const profileData = parseProfileData(result);

        return {
          status: true,
          data: profileData,
        };
      } else {
        throw new Error('Không thể tải thông tin người dùng');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Edit notification settings
   * API: /editnotification
   */
  editNotification: async (enablenotification: boolean): Promise<{ status: boolean }> => {
    try {
      const credentials = getUserCredentials();

      const body = {
        userid: credentials.username,
        token: credentials.username,
        enablenotification: enablenotification,
        storeid: API_CONFIG.STORE_ID,
      };

      // Build API URL
      const url = buildApiUrl('/editnotification');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      await response.json();

      return {
        status: true,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Update personal information
   * API: POST /forza/updateprofile
   */
  updateProfile: async (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    tinhthanh: string;
    taxcode: string;
    sotaikhoan: string;
    tentaikhoan: string;
    nganhang: string;
  }): Promise<{ status: boolean; message?: string }> => {
    try {
      const credentials = getUserCredentials();

      const body = {
        userid: credentials.userid,
        token: credentials.userid,
        storeid: API_CONFIG.STORE_ID,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        tinhthanh: data.tinhthanh,
        taxcode: data.taxcode,
        sotaikhoan: data.sotaikhoan,
        tentaikhoan: data.tentaikhoan,
        nganhang: data.nganhang,
      };

      const url = buildApiUrl('/updateprofile');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.status || result.status === 'true') {
        return {
          status: true,
          message: result.message || 'Cập nhật thông tin thành công',
        };
      } else {
        throw new Error(result.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  }
};
