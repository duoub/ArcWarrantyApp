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

  /**
   * Upload single image for warranty/report screens
   * API: /Mobile/uploadImagev2?storeid=
   * Returns image URL on success
   */
  uploadImage: async (imageData: string | UploadImageData): Promise<UploadImageResponse> => {
    try {
      const credentials = getUserCredentials();

      // Build the upload URL
      const url = `${API_CONFIG.BASE_URL_MOBILE}/uploadImagev2?storeid=${credentials.storeid}`;

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

      console.log('📤 Uploading image:', {
        filename,
        platform: Platform.OS,
        mimeType,
        url,
      });

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

      console.log('📤 Upload complete: ', response);
      console.log('📤 Upload response status:', response.respInfo.status);

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
          console.log('📤 Response is not JSON, using as plain text');
        }
      }

      console.log('📤 Image uploaded successfully:', imageUrl);

      return {
        status: true,
        message: 'Upload ảnh thành công',
        data: imageUrl,
      };
    } catch (error: any) {
      console.error('❌ Image upload error:', error);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.');
    }
  },

  /**
   * Upload multiple images sequentially
   * Returns array of uploaded image URLs
   */
  uploadMultipleImages: async (imagePaths: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    console.log(`📤 Starting upload of ${imagePaths.length} images...`);

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`📤 Uploading image ${i + 1}/${imagePaths.length}...`);

      try {
        const response = await uploadService.uploadImage(imagePath);

        if (response.status && response.data) {
          uploadedUrls.push(response.data);
          console.log(`✅ Image ${i + 1} uploaded successfully`);
        } else {
          throw new Error(`Upload image ${i + 1} failed`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to upload image ${i + 1}:`, error);
        throw new Error(`Upload ảnh thứ ${i + 1} thất bại: ${error.message}`);
      }
    }

    console.log(`✅ All ${uploadedUrls.length} images uploaded successfully`);
    return uploadedUrls;
  },
};
