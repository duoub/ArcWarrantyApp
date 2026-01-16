/**
 * InOut API Service
 * API calls for sell-in/sell-out operations
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import { API_CONFIG } from '../config/constants';

export interface CustomerInfo {
  id: number | string;
  name: string;
  phone: string;
  address: string;
}

export interface LeadStep {
  name: string;
  id: string;
}

export interface LeadInfo {
  title: string; // serial numbers content
  mota: string;
  step: LeadStep;
  stepid: string;
}

export interface SendLeadRequest {
  customer: CustomerInfo;
  lead: LeadInfo;
  fields?: unknown[];
  fieldskhachhang?: unknown[];
  sellout?: 0 | 1; // 1 if sellout mode
}

export interface SendLeadResponse {
  status: boolean;
  message: string | null;
  strError?: string | null;
}

export const inOutService = {
  /**
   * Send lead (serial numbers) for sell-in or sell-out
   * API: /sendlead?customer=xxx&lead=xxx&storeid=xxx&userid=xxx&sellout=1
   */
  sendLead: async (params: SendLeadRequest): Promise<SendLeadResponse> => {
    try {
      const credentials = getUserCredentials();

      const url = buildApiUrl('/sendlead', {});

      const bodyParams = {
        customer: params.customer,
        lead: params.lead,
        fields: params.fields || [],
        fieldskhachhang: params.fieldskhachhang || [],
        storeid: API_CONFIG.STORE_ID,
        userid: credentials.userid,
        ...(params.sellout === 1 && { sellout: '1' }),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyParams),
      });

      const result = await response.json();

      return {
        status: result.status ?? false,
        message: result.message || null,
        strError: result.strError || null,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
