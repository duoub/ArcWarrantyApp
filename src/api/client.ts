/**
 * API Client Configuration
 * Axios instance with interceptors for auth and error handling
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/constants';
import { storage } from '../utils/storage';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = storage.getString('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      storage.remove('auth_token');
      storage.remove('user_data');
    }
    return Promise.reject(error);
  }
);

// API Error Handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    if (axiosError.response) {
      // Server responded with error
      return axiosError.response.data?.message ||
        axiosError.response.data?.error ||
        'Đã có lỗi xảy ra';
    } else if (axiosError.request) {
      // No response received
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
    }
  }

  return 'Đã có lỗi không xác định';
};

// Generic API request wrapper
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
