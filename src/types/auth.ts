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
  tendangnhap: string; // Username
  pasword: string; // Password (typo from API)
  hoten: string; // Full name
  phone: string; // Phone number
  email: string; // Email
  repassword: string; // Confirm password
  address: string; // Address
  images?: Array<{ fileid: string }>;
  loai: string; // User type (1: Distributor, 2: Dealer)
  tendiaban?: string; // Dealer name (optional)
  madiaban?: string; // Dealer code (optional)
  sotaikhoan: string; // Bank account number
  nganhang: string; // Bank name
  tentaikhoan: string; // Bank account holder name
}

export interface SignupResponse {
  status: boolean;
  message: string;
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
