/**
 * Authentication API Service
 * All auth-related API calls
 */

import { apiRequest } from './client';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResendOTPRequest,
  ResendOTPResponse,
} from '../types/auth';

export const authService = {
  /**
   * Login user using AsiaticVn API
   * API: https://scell1.qbis.vn/api/forza/login?storeid=022665066528
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Using the AsiaticVn API configuration
    const apiUrl = 'https://scell1.qbis.vn/api/forza';
    const storeId = '022665066528';

    try {
      const response = await fetch(`${apiUrl}/login?storeid=${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.username, // API expects 'email' field but we use username
          pasword: data.password, // Note: API has typo 'pasword' not 'password'
        }),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }

      // Transform API response to match our LoginResponse interface
      return {
        token: result.token || '', // Add token if available
        user: {
          id: result.id || result.user?.id || '',
          email: result.email || result.user?.email || data.username,
          name: result.name || result.user?.name || data.username,
          phone: result.phone || result.user?.phone,
          role: result.role || result.user?.role || 'customer',
          avatar: result.avatar || result.user?.avatar,
        },
        message: result.message || 'Đăng nhập thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Register new user
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    return apiRequest<SignupResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  },

  /**
   * Verify OTP code
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    return apiRequest<VerifyOTPResponse>({
      method: 'POST',
      url: '/auth/verify-otp',
      data,
    });
  },

  /**
   * Resend OTP code
   */
  resendOTP: async (data: ResendOTPRequest): Promise<ResendOTPResponse> => {
    return apiRequest<ResendOTPResponse>({
      method: 'POST',
      url: '/auth/resend-otp',
      data,
    });
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return apiRequest<ForgotPasswordResponse>({
      method: 'POST',
      url: '/auth/forgot-password',
      data,
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      url: '/auth/logout',
    });
  },
};
