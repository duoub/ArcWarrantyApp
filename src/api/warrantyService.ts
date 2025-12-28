/**
 * Warranty Service
 * API calls for warranty activation and management
 */

import { getUserCredentials, buildApiUrl } from '../utils/apiHelper';
import {
  WarrantyActivationRequest,
  WarrantyActivationResponse,
  WarrantyReportRequest,
  WarrantyReportResponse,
} from '../types/warranty';
import { API_CONFIG } from '../config/constants';

export const warrantyService = {
  /**
   * Activate warranty
   * API: /activeserial
   */
  activate: async (
    data: WarrantyActivationRequest
  ): Promise<WarrantyActivationResponse> => {
    try {
      const credentials = getUserCredentials();
      const url = buildApiUrl('/activeserial');

      const requestData = {
        storeid: API_CONFIG.STORE_ID,
        keyword: data.serial,
        cusname: data.customerName,
        cusmobile: data.phone,
        tinhthanh: data.tinhthanh,
        quanhuyen: data.quanhuyen,
        xaphuong: data.xaphuong,
        cusaddress: data.address,
        cusemail: data.email || '',
        userid: credentials.userid,
      };

      console.log('🔐 Activating warranty:', {
        serial: data.serial,
        customer: data.customerName,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      console.log('🔐 Warranty activation response:', {
        status: result.status,
        message: result.message,
      });

      if (!result.status) {
        throw new Error(result.message || 'Kích hoạt bảo hành thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Kích hoạt bảo hành thành công',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ Warranty activation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Report warranty issue
   * API: /arepairserial?v=2
   */
  report: async (
    data: WarrantyReportRequest
  ): Promise<WarrantyReportResponse> => {
    try {
      const credentials = getUserCredentials();
      const url = buildApiUrl('/arepairserial?v=2');

      const requestData = {
        storeid: API_CONFIG.STORE_ID,
        keyword: data.serial,
        custask: data.issueDescription,
        cusname: data.customerName,
        cusmobile: data.phone,
        cusaddress: data.address,
        dailyid: credentials.userid,
        imgs: data.images || [],
        tinhthanh: data.tinhthanh,
        quanhuyen: data.quanhuyen,
        xaphuong: data.xaphuong,
      };

      console.log('🔧 Reporting warranty issue:', {
        serial: data.serial,
        customer: data.customerName,
        images: data.images?.length || 0,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      console.log('🔧 Warranty report response:', {
        status: result.status,
        message: result.message,
      });

      if (!result.status) {
        throw new Error(result.message || 'Gửi báo cáo bảo hành thất bại');
      }

      return {
        status: result.status,
        message: result.message || 'Gửi báo cáo bảo hành thành công',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ Warranty report error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
