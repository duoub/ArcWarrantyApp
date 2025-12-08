/**
 * Warranty Types
 */

export interface WarrantyActivationRequest {
  serial: string;
  customerName: string;
  phone: string;
  address: string;
  email?: string;
}

export interface WarrantyActivationResponse {
  status: boolean;
  message: string;
  data?: {
    serial: string;
    activatedAt: string;
  };
}
