/**
 * Validation Schemas using Zod
 */

import { z } from 'zod';
import { VALIDATION } from '../config/constants';

// Login Schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự`),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema - Step 1 (Personal Info)
export const signupStep1Schema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(VALIDATION.PHONE_REGEX, 'Số điện thoại không hợp lệ'),
});

// Signup Schema - Step 2 (Password)
export const signupStep2Schema = z.object({
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự`),
  passwordConfirm: z
    .string()
    .min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['passwordConfirm'],
});

// Signup Schema - Step 3 (Verification Method)
export const signupStep3Schema = z.object({
  verificationMethod: z.enum(['email', 'sms'], {
    required_error: 'Vui lòng chọn phương thức xác thực',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng',
  }),
});

// Complete Signup Schema
export const signupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema);

export type SignupFormData = z.infer<typeof signupSchema>;

// OTP Schema
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
});

export type OTPFormData = z.infer<typeof otpSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(VALIDATION.PHONE_REGEX, 'Số điện thoại không hợp lệ'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Password Strength Calculator
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';

  let strength = 0;

  // Check length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;

  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;

  // Check for numbers
  if (/\d/.test(password)) strength++;

  // Check for special characters
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};
