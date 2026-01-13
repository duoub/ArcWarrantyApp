/**
 * Authentication API Service
 * All auth-related API calls
 */

import { apiRequest } from './client';
import { API_CONFIG } from '../config/constants';
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
  CustomerSignupRequest,
  CustomerSignupResponse,
  CustomerLoginRequest,
  CustomerLoginResponse,
  User,
  UserProfileRaw,
} from '../types/auth';
import { buildApiUrl, buildStoreApiUrl } from '../utils/apiHelper';
import { SimultaneousGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gestureComposition';

export const authService = {
  /**
   * Get user profile
   * API: /forza/getprofile?userid=xxx&storeid=xxx&typeget=1
   */
  getProfile: async (userid: string, storeid: string): Promise<UserProfileRaw> => {
    try {
      const apiParams: Record<string, string> = {
        userid,
        storeid,
        typeget: '1',
      };

      const url = buildApiUrl('/getprofile', apiParams);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: UserProfileRaw = await response.json();

      // Transform API response to User interface
      return {
        // name: result.name || '',
        // email: result.email || '',
        codenpp: result.codenpp || 'codenpp',
        address: result.address || '',
        tinhthanh: result.tinhthanh || '',
        taxcode: result.taxcode || '',
        nganhang: result.nganhang || '',
        sotaikhoan: result.sotaikhoan || '',
        tentaikhoan: result.tentaikhoan || '',
        countThongBaoChuaDoc: result.countThongBaoChuaDoc || '0',
      };
    } catch (error) {
      throw new Error('Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Login user using AsiaticVn API
   * API: /login?storeid=xxx
   * After successful login, fetch user profile from /forza/getprofile
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const url = buildApiUrl(`/login?storeid=${API_CONFIG.STORE_ID}`);
      const response = await fetch(url, {
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

      // Fetch user profile after successful login
      const userProfile = await authService.getProfile(result.username, API_CONFIG.STORE_ID);


      // Transform API response to match our LoginResponse interface
      return {
        token: result.token || '', // Add token if available
        user: {
          ...userProfile,
          id: result.username,
          username: result.username,
          name: result.name,
          phone: result.phone,
          email: result.email || '',
          role: result.namemembertype || 'Đại lý',
          avatar: result.avatar,
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
   * Register new user (Dealer/Distributor)
   * API: /signup?storeid=xxx
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      const url = buildApiUrl(`/signup?storeid=${API_CONFIG.STORE_ID}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Đăng ký thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Đăng ký thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
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

  /**
   * Register new customer
   * API: /signup?storeid=xxx&storeidapp=xxx (using SSTORE_BASE_URL)
   */
  customerSignup: async (data: CustomerSignupRequest): Promise<CustomerSignupResponse> => {
    try {
      const url = buildStoreApiUrl('/signup', {
        storeid: API_CONFIG.STORE_ID,
        storeidapp: API_CONFIG.STORE_ID,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Đăng ký thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Đăng ký thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Login customer
   * API: /login?storeid=xxx (using SSTORE_BASE_URL)
   */
  customerLogin: async (data: CustomerLoginRequest): Promise<LoginResponse> => {
    try {
      const url = buildStoreApiUrl('/login', {
        storeid: API_CONFIG.STORE_ID,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }

      // Transform API response to match our LoginResponse interface
      return {
        token: result.token || '',
        user: {
          id: result.username || result.email,
          username: result.username || result.email,
          name: result.name || result.hoten || '',
          phone: result.phone || '',
          email: result.email || '',
          role: 'Khách hàng',
          birthday: result.birthday || '',
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
};
