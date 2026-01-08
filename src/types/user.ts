/**
 * User Type Definitions
 */

// User type for signup and user management
export type UserType = 'NPP' | 'DL' | 'THO' | '1';

// User type labels for display
export const USER_TYPE_LABELS: Record<UserType, string> = {
  NPP: 'Nhà phân phối',
  DL: 'Đại lý',
  THO: 'Thợ',
  '1': 'Khách',
};

// User type constants for easy reference
export const USER_TYPES = {
  DISTRIBUTOR: 'NPP' as UserType, // Nhà phân phối
  DEALER: 'DL' as UserType,        // Đại lý
  TECHNICIAN: 'THO' as UserType,   // Thợ
  CUSTOMER: '1' as UserType,       // Khách
} as const;
