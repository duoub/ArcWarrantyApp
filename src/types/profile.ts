/**
 * Profile Type Definitions
 */

// Raw API response from backend
export interface ProfileDataRaw {
  // Reward/commission data (formatted as strings)
  thuongchuongtrinhsaleFormat?: string;
  hoahongkichhoatFormat?: string;
  hoahongsellinFormat?: string;
  hoahongselloutFormat?: string;
  totalFormat?: string;
  paymentFormat?: string;
  diemtichluyFormat?: string;

  // Notification count
  countThongBaoChuaDoc?: number;

  // Points
  diemtichluy?: number;

  // Any other fields from the API
  [key: string]: any;
}

// App's clean interface
export interface ProfileData {
  // Reward/commission data
  salesProgram: string;
  warrantyCommission: string;
  sellInCommission: string;
  sellOutCommission: string;
  total: string;
  paid: string;

  // Points
  rewardPoints: number;

  // Notification count
  unreadCount: number;
}

// API Request/Response types
export interface GetProfileRequest {
  typeget: number; // Type parameter for profile endpoint (5 in this case)
}

export interface GetProfileResponse {
  status: boolean;
  data: ProfileData;
  message?: string;
}
