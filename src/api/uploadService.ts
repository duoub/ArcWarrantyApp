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

export interface UploadImageResponse {
  status: boolean;
  message: string;
  data?: string; // Image URL
}

export interface UploadedFile {
  fileid: string;
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
      const url = `${API_CONFIG.BASE_URL}/uploadavatar?storeid=${API_CONFIG.STORE_ID}&userid=${credentials.username}`;

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
        } catch (e) {
          // Response is not JSON, using as plain text
        }
      }

      return {
        status: true,
        message: 'Upload ảnh thành công',
        data: avatarUrl,
      };
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
    }
  },

  /**
   * Upload single image for warranty/report screens
   * API: /Mobile/uploadImagev2?storeid=
   * Returns image URL on success
   */
  uploadImage: async (imageData: string | UploadImageData): Promise<UploadImageResponse> => {
    try {
      // Build the upload URL
      const url = `${API_CONFIG.BASE_URL_MOBILE}/uploadImagev2?storeid=${API_CONFIG.STORE_ID}`;

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
        normalizedPath = fileUri.replace('file://', '');
      }

      // Use react-native-blob-util for proper multipart upload
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        url,
        {},
        [
          {
            name: 'file',
            filename: filename,
            type: mimeType,
            data: ReactNativeBlobUtil.wrap(normalizedPath),
          },
        ]
      );

      if (response.respInfo.status < 200 || response.respInfo.status >= 300) {
        throw new Error(`Upload ảnh thất bại: ${response.respInfo.status}`);
      }

      // Parse response
      const responseText = response.data;
      let imageUrl = responseText;

      // Try to parse as JSON if it looks like JSON
      if (responseText.startsWith('{') || responseText.startsWith('[')) {
        try {
          const result = JSON.parse(responseText);
          imageUrl = result.response || result.data || result.url || responseText;
        } catch (e) {
          // Response is not JSON, using as plain text
        }
      }

      return {
        status: true,
        message: 'Upload ảnh thành công',
        data: imageUrl,
      };
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
    }
  },

  /**
   * Upload multiple images sequentially
   * Returns array of uploaded files with format [{ fileid: url }, { fileid: url }, ...]
   */
  uploadMultipleImages: async (imagePaths: string[]): Promise<UploadedFile[]> => {
    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];

      try {
        const response = await uploadService.uploadImage(imagePath);

        if (response.status && response.data) {
          uploadedFiles.push({ fileid: response.data });
        } else {
          throw new Error(`Upload image ${i + 1} failed`);
        }
      } catch (error: any) {
        throw new Error(`Upload ảnh thứ ${i + 1} thất bại: ${error.message}`);
      }
    }

    return uploadedFiles;
  },
};
