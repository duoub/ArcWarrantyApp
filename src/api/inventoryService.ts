/**
 * Inventory API Service
 * All inventory-related API calls
 */

import { getUserCredentials, buildApiUrl } from '../utils/apiHelper';
import {
  GetInventoryListRequest,
  GetInventoryListResponse,
  ActivateWarrantyRequest,
  ActivateWarrantyResponse,
  InventoryItemRaw,
  InventoryItem,
} from '../types/inventory';

/**
 * Parse and transform raw API data to clean app format
 */
const parseInventoryItem = (raw: InventoryItemRaw): InventoryItem => {
  return {
    id: raw.id,
    serial: raw.serial || '',
    tenhangsanxuat: raw.tenhangsanxuat || '',
    tenmodel: raw.tenmodel || '',
    thoigianbaohanh: raw.thoigianbaohanh ? `${raw.thoigianbaohanh} tháng` : '',
    ngaynhapkho: raw.ngaynhapkho || '',
    ngaymua: raw.ngaymua || '',
    kichhoatbaohanh: raw.kichhoatbaohanh === '' || raw.kichhoatbaohanh === null
      ? 1
      : Number(raw.kichhoatbaohanh),
    kichhoatbaohanhname: raw.kichhoatbaohanhname || 'Chưa kích hoạt',
    ngaykichhoat: raw.ngaykichhoat || '',
    hanbaohanh: raw.hanbaohanh || '',
    statuscolor: raw.statuscolor || '#367fa9',
  };
};

export const inventoryService = {
  /**
   * Get list of inventory items (giao dịch)
   * API: /getlistgiaodich?storeid=xxx&userid=xxx&upage=1&type=1&keyword=
   */
  getInventoryList: async (
    params: GetInventoryListRequest
  ): Promise<GetInventoryListResponse> => {
    try {
      const credentials = getUserCredentials();
      const { page, type, keyword = '' } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistgiaodich', {
        storeid: credentials.storeid,
        userid: credentials.username,
        upage: page,
        type: type,
        keyword: keyword,
      });

      console.log('📦 Fetching inventory:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('📦 Inventory response:', {
        count: result.count,
        nextpage: result.nextpage,
        listLength: result.list?.length,
        firstItem: result.list?.[0],
      });

      // API doesn't return status field, check if we have data
      const hasData = result.list !== undefined;

      if (!hasData && result.message) {
        throw new Error(result.message);
      }

      // Parse raw data to clean format
      const parsedList: InventoryItem[] = (result.list || []).map(parseInventoryItem);

      console.log('✅ Parsed first item:', parsedList[0]);

      return {
        status: true,
        list: parsedList,
        count: result.count || 0,
        nextpage: result.nextpage || false,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Activate warranty for a product
   * API: /guikichhoatbaohanh
   */
  activateWarranty: async (
    params: ActivateWarrantyRequest
  ): Promise<ActivateWarrantyResponse> => {
    try {
      const credentials = getUserCredentials();
      const url = buildApiUrl('/guikichhoatbaohanh');

      const requestData = {
        storeid: credentials.storeid,
        username: credentials.username,
        id: params.id,
      };

      console.log('🔓 Activating warranty:', requestData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      console.log('🔓 Warranty activation response:', result);

      if (!result.status) {
        throw new Error(result.message || 'Không thể kích hoạt bảo hành');
      }

      return {
        status: result.status,
        message: result.message || 'Kích hoạt bảo hành thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
