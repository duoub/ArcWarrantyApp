/**
 * App Constants
 */

export const APP_NAME = 'AKITO Warranty';
export const APP_VERSION = '1.0.0';
export const BUNDLE_ID = 'com.akito.warranty';

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
  TRACKING_TOKEN: '', // Token for tracking API
  STORE_ID: '022665047387', // Store ID for API calls
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  STORE_ID: 'store_id',
  LANGUAGE: 'language',
  THEME: 'theme',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

// Default Values
export const DEFAULTS = {
  LANGUAGE: 'vi',
  ITEMS_PER_PAGE: 20,
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

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  AUTH: 'Auth',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  OTP: 'OTP',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main Stack
  MAIN: 'Main',
  HOME: 'Home',
  PROFILE: 'Profile',

  // Feature Screens
  ACTIVATE_SERIAL: 'ActivateSerial',
  CUSTOMERS_LIST: 'CustomersList',
  CUSTOMER_DETAIL: 'CustomerDetail',
  PRODUCTS_LIST: 'ProductsList',
  PRODUCT_DETAIL: 'ProductDetail',
  NOTIFICATIONS: 'Notifications',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  TIMEOUT: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  SIGNUP_SUCCESS: 'Đăng ký thành công',
  OTP_SENT: 'Mã OTP đã được gửi',
  OTP_VERIFIED: 'Xác thực OTP thành công',
  PASSWORD_RESET: 'Đặt lại mật khẩu thành công',
  DATA_SAVED: 'Lưu dữ liệu thành công',
  DATA_DELETED: 'Xóa dữ liệu thành công',
  DATA_UPDATED: 'Cập nhật dữ liệu thành công',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_TIME: 'yyyy-MM-dd HH:mm:ss',
};

// User Types
export const USER_TYPE = {
  DISTRIBUTOR: '1', // Nhà phân phối
  DEALER: '2', // Đại lý
};

export default {
  APP_NAME,
  APP_VERSION,
  BUNDLE_ID,
  API_CONFIG,
  STORAGE_KEYS,
  DEFAULTS,
  VALIDATION,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  USER_TYPE,
};
