/**
 * Password API Service
 * API calls for password management
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';

interface UpdatePasswordRequest {
  oldpass: string;
  newpass: string;
}

interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export const passwordService = {
  /**
   * Update user password
   * API: POST /forza/updatepassword
   * Body: { storeid, userid, oldpass, newpass }
   */
  updatePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<UpdatePasswordResponse> => {
    try {
      const credentials = getUserCredentials();

      // Build API URL without query params
      const url = buildApiUrl('/updatepassword');

      // Prepare request body
      const requestBody = {
        storeid: credentials.storeid,
        userid: credentials.userid,
        oldpass: oldPassword,
        newpass: newPassword,
      };

      console.log('🔑 Updating password:', {
        storeid: credentials.storeid,
        userid: credentials.userid,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      console.log('🔑 Update password response:', result);

      // Check if update was successful
      if (result.status || result.status === 'true') {
        return {
          success: true,
          message: result.message || 'Cập nhật mật khẩu thành công',
        };
      } else {
        throw new Error(result.message || 'Không thể cập nhật mật khẩu');
      }
    } catch (error) {
      console.error('❌ Update password error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
