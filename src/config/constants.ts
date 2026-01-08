/**
 * App Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'https://scell1.qbis.vn/api/forza'
    : 'https://scell1.qbis.vn/api/forza',
  BASE_URL_MOBILE: __DEV__
    ? 'https://scell.qbis.vn/Mobile'
    : 'https://scell.qbis.vn/Mobile',
  TRACKING_BASE_URL: __DEV__
    ? 'https://tracking.qbis.vn/api/tracking'
    : 'https://tracking.qbis.vn/api/tracking',
  SSTORE_BASE_URL: __DEV__
    ? 'https://ferroliapp.qbis.vn/api/mobileapp'
    : 'https://ferroliapp.qbis.vn/api/mobileapp',
  TRACKING_TOKEN: '', // Token for tracking API
  STORE_ID: '022665047387', // Store ID for API calls
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 32,
  PHONE_LENGTH: 10,
  OTP_LENGTH: 6,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^(0[3|5|7|8|9])+([0-9]{8})$/,
};

// User Types
export const USER_TYPE = {
  DEALER: '2',
};
