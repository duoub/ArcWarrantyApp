/**
 * Authentication Type Definitions
 */

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  avatar?: string;
  // Personal Information
  cccd?: string; // CCCD/CMND
  address?: string;
  tinhthanh?: string; // Tỉnh/Thành phố (tinhthanh)
  birthday?: string;
  // Business Information
  taxcode?: string; // Mã số thuế (taxcode)
  // Bank Information
  nganhang?: string; // Ngân hàng (nganhang)
  sotaikhoan?: string; // Số tài khoản (sotaikhoan)
  tentaikhoan?: string; // Tên tài khoản (tentaikhoan)
  // Notification
  countThongBaoChuaDoc?: string;
}

export interface UserProfileRaw {
  // name: string;
  address: string;
  taxcode: string;
  // email: string;
  tinhthanh: string;
  sotaikhoan: string;
  tentaikhoan: string;
  nganhang: string;
  countThongBaoChuaDoc: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: UserProfileRaw;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  verificationMethod: 'email' | 'sms';
}

export interface SignupResponse {
  message: string;
  email: string;
  phone?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  phone?: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: User;
  message: string;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ForgotPasswordResponse {
  message: string;
  phone: string;
}

export interface ResendOTPRequest {
  email: string;
  phone?: string;
}

export interface ResendOTPResponse {
  message: string;
}
