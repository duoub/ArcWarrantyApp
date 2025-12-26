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
        storeid: credentials.storeid,
        typeget: typeget,
      });

      console.log('👤 Fetching profile:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('👤 Profile response:', {
        resultType: typeof result,
        data: result,
      });

      // Check if we got valid data
      if (result) {
        const profileData = parseProfileData(result);

        console.log('✅ Parsed profile data:', profileData);

        return {
          status: true,
          data: profileData,
        };
      } else {
        throw new Error('Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
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
        storeid: credentials.storeid,
      };

      // Build API URL
      const url = buildApiUrl('/editnotification');

      console.log('🔔 Updating notification settings:', url, body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      console.log('🔔 Notification update response:', result);

      return {
        status: true,
      };
    } catch (error) {
      console.error('❌ Edit notification error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
