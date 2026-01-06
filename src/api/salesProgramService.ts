/**
 * Sales Program API Service
 * API calls for sales program data
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetSalesProgramRequest,
  GetSalesProgramResponse,
  RegisterProgramRequest,
  RegisterProgramResponse,
  SalesProgramDataRaw,
  SalesProgramItemRaw,
  SalesProgramItem,
} from '../types/salesProgram';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseSalesProgramItem = (raw: SalesProgramItemRaw): SalesProgramItem => {
  return {
    id: raw.id,
    name: raw.name || '',
    tenchitieu: raw.tenchitieu || '',
    doanhsochitieu: raw.doanhsochitieu || '0',
    doanhsodat: raw.doanhsodat || '0',
    doanhsoconlai: raw.doanhsoconlai || '0',
    limittime: raw.limittime || '0 ngày',
    tyledat: typeof raw.tyledat === 'string' ? parseFloat(raw.tyledat) || 0 : raw.tyledat || 0,
    thamgia: raw.thamgia || 0,
    quyendangky: raw.quyendangky || 0,
  };
};

export const salesProgramService = {
  /**
   * Get sales programs data
   * API: /getprofile?userid=xxx&storeid=xxx&typeget=1
   */
  getSalesPrograms: async (
    params: GetSalesProgramRequest
  ): Promise<GetSalesProgramResponse> => {
    try {
      const credentials = getUserCredentials();
      const { typeget } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getprofile', {
        userid: credentials.username,
        storeid: API_CONFIG.STORE_ID,
        typeget: typeget,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: SalesProgramDataRaw = await response.json();

      // Check if we got valid data
      if (result && Array.isArray(result.listchuongtrinhsale)) {
        const programs = result.listchuongtrinhsale.map(parseSalesProgramItem);

        return {
          status: true,
          data: programs,
        };
      } else {
        throw new Error('Không thể tải danh sách chương trình bán hàng');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Register for a sales program
   * API: /dangkygoichuongtrinh
   */
  registerProgram: async (
    params: RegisterProgramRequest
  ): Promise<RegisterProgramResponse> => {
    try {
      const credentials = getUserCredentials();
      const url = buildApiUrl('/dangkygoichuongtrinh');

      const requestData = {
        idct: params.idct,
        storeid: API_CONFIG.STORE_ID,
        userid: credentials.username,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Không thể đăng ký chương trình');
      }

      return {
        status: result.status,
        message: result.message || 'Đăng ký chương trình thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
