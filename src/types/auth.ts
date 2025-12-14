/**
 * Authentication Type Definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'technician' | 'dealer' | 'customer';
  avatar?: string;
  // Personal Information
  cccd?: string; // CCCD/CMND
  address?: string;
  city?: string; // Tỉnh/Thành phố
  // Business Information
  taxCode?: string; // Mã số thuế
  // Bank Information
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
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
