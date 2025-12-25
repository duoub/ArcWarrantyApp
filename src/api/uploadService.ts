/**
 * Upload Service
 * API calls for file uploads
 */

import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getUserCredentials } from '../utils/apiHelper';
import { API_CONFIG } from '../config/constants';

export interface UploadAvatarResponse {
  status: boolean;
  message: string;
  data?: string; // Avatar URL
}

/**
 * Upload image data (supports both URI and base64)
 */
export interface UploadImageData {
  uri?: string;
  base64?: string;
  filename?: string;
  mime?: string;
}

export const uploadService = {
  /**
   * Upload avatar image
   * API: /uploadavatar?storeid=&userid=
   * Supports both file URI and base64 data
   */
  uploadAvatar: async (imageData: string | UploadImageData): Promise<UploadAvatarResponse> => {
    try {
      const credentials = getUserCredentials();

      // Build the upload URL
      const url = `${API_CONFIG.BASE_URL}/uploadavatar?storeid=${credentials.storeid}&userid=${credentials.userid}`;

      // Get file path
      const imageObj = typeof imageData === 'string' ? { uri: imageData } : imageData;
      const fileUri = imageObj.uri;

      if (!fileUri) {
        throw new Error('No image URI provided');
      }

      // Extract filename
      const filename = imageObj.filename ||
        fileUri.substring(fileUri.lastIndexOf('/') + 1);

      // Determine MIME type
      const getMimeType = (uri: string): string => {
        const extension = uri.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          default:
            return 'image/jpeg';
        }
      };

      const mimeType = imageObj.mime || getMimeType(fileUri);

      // Normalize file path for Android
      let normalizedPath = fileUri;
      if (Platform.OS === 'android') {
        // Remove file:// prefix if present
        normalizedPath = fileUri.replace('file://', '');
      }

      console.log('📤 Uploading avatar:', {
        filename,
        platform: Platform.OS,
        mimeType,
        originalUri: fileUri,
        normalizedPath,
        url,
      });

      // Use react-native-blob-util for proper multipart upload
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        url,
        {
          // Don't set Content-Type - blob-util will set it with boundary
        },
        [
          {
            name: 'file',
            filename: filename,
            type: mimeType,
            data: ReactNativeBlobUtil.wrap(normalizedPath),
          },
        ]
      );

      console.log('📤 Response status:', response.respInfo.status);
      console.log('📤 Response data:', response.data);

      if (response.respInfo.status < 200 || response.respInfo.status >= 300) {
        throw new Error(`Upload ảnh thất bại: ${response.respInfo.status}`);
      }

      // Parse response
      const responseText = response.data;
      let avatarUrl = responseText;

      // Try to parse as JSON if it looks like JSON
      if (responseText.startsWith('{') || responseText.startsWith('[')) {
        try {
          const result = JSON.parse(responseText);
          avatarUrl = result.response || result.data || result.url || responseText;
          console.log('📤 Parsed JSON, avatar URL:', avatarUrl);
        } catch (e) {
          console.log('📤 Response is not JSON, using as plain text');
        }
      }

      console.log('📤 Final avatar URL:', avatarUrl);

      return {
        status: true,
        message: 'Upload ảnh thành công',
        data: avatarUrl,
      };
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
    }
  },
};
