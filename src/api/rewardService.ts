/**
 * Reward API Service
 * API calls for reward transaction details
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetRewardTransactionsRequest,
  GetRewardTransactionsResponse,
  RewardTransactionRaw,
  RewardTransaction,
} from '../types/reward';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseRewardTransaction = (raw: RewardTransactionRaw): RewardTransaction => {
  return {
    id: raw.id,
    serial: raw.serial || '',
    manufacturer: raw.tenhangsanxuat || '',
    model: raw.tenmodel || '',
    warrantyPeriod: raw.thoigianbaohanh ? `${raw.thoigianbaohanh} tháng` : '',
    warehouseDate: raw.ngaynhapkho || '',
    purchaseDate: raw.ngaymua || '',
    activationStatus: raw.kichhoatbaohanh === '' || raw.kichhoatbaohanh === null
      ? 1
      : Number(raw.kichhoatbaohanh),
    activationStatusName: raw.kichhoatbaohanhname || 'Chưa kích hoạt',
    activationDate: raw.ngaykichhoat || '',
    warrantyExpiry: raw.hanbaohanh || '',
    statusColor: raw.statuscolor || '#367fa9',
    productName: raw.tensanpham || '',
    distributorName: raw.tendlnpp || '',
  };
};

export const rewardService = {
  /**
   * Get list of reward transactions
   * API: /getlistgiaodich?userid=xxx&storeid=xxx&upage=1&type=
   * type=5: Activated warranty products
   * type=3: Sell out products
   * type=4: Sell in products
   */
  getRewardTransactions: async (
    params: GetRewardTransactionsRequest
  ): Promise<GetRewardTransactionsResponse> => {
    try {
      const credentials = getUserCredentials();
      const { upage, type } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlistgiaodich', {
        userid: credentials.username,
        storeid: API_CONFIG.STORE_ID,
        upage: upage,
        type: type,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Check if we got valid data
      const hasData = result.list !== undefined;

      if (!hasData && result.message) {
        throw new Error(result.message);
      }

      // Parse raw data to clean format
      const parsedList: RewardTransaction[] = (result.list || []).map(
        parseRewardTransaction
      );

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
};
