/**
 * Warranty Lookup API Service
 * API calls for warranty tracking and lookup
 */

import { buildTrackingApiUrl, getUserCredentials } from '../utils/apiHelper';
import { API_CONFIG } from '../config/constants';
import {
  WarrantyLookupRequest,
  WarrantyLookupResponse,
  WarrantyInfoRaw,
  WarrantyInfo,
  RepairLookupRequest,
  RepairLookupResponse,
  RepairInfoRaw,
  RepairInfo,
} from '../types/warrantyLookup';

/**
 * Parse location info from listThuocTinh
 * Format: ["15837048?Tỉnh An Giang", "15837051?Huyện Chợ Mới", "15837052?Xã Hòa Bình"]
 */
const parseLocationInfo = (listThuocTinh?: string[]): { province: string; district: string; ward: string } => {
  const result = { province: '', district: '', ward: '' };

  if (!listThuocTinh || listThuocTinh.length === 0) {
    return result;
  }

  listThuocTinh.forEach(item => {
    // Split by "?" to get the location name
    const parts = item.split('?');
    if (parts.length !== 2) return;

    const locationName = parts[1];

    // Determine location type by prefix
    if (locationName.startsWith('Tỉnh ') || locationName.startsWith('Thành phố ')) {
      result.province = locationName;
    } else if (locationName.startsWith('Huyện ') || locationName.startsWith('Quận ') || locationName.startsWith('Thị xã ') || locationName.startsWith('Thành phố ')) {
      result.district = locationName;
    } else if (locationName.startsWith('Xã ') || locationName.startsWith('Phường ') || locationName.startsWith('Thị trấn ')) {
      result.ward = locationName;
    }
  });

  return result;
};

/**
 * Format full address with location info
 * Format: xxx - Xã xxx - Huyện xxx - Tỉnh xxx
 */
const formatFullAddress = (baseAddress: string, location: { province: string; district: string; ward: string }): string => {
  const parts: string[] = [];

  // Add base address if available
  if (baseAddress) {
    parts.push(baseAddress);
  }

  // Add ward, district, province in order
  if (location.ward) {
    parts.push(location.ward);
  }
  if (location.district) {
    parts.push(location.district);
  }
  if (location.province) {
    parts.push(location.province);
  }

  return parts.join(' - ');
};

/**
 * Parse and transform raw repair API data to clean app format
 */
const parseRepairInfo = (raw: RepairInfoRaw): RepairInfo => {
  // Remove HTML tags from product name
  const cleanProductName = (name: string): string => {
    return name.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '').trim();
  };

  return {
    ticketCode: raw.ticketcode || '',
    ticketName: raw.ticketname || '',
    productName: cleanProductName(raw.productname2 || raw.productname || ''),
    serial: raw.serial || '',
    serviceName: raw.servicename || '',
    createDate: raw.createdate || '',
    returnDate: raw.returndate || '',
    dueDate: raw.duedate || '',
    updateDate: raw.updatedate || '',
    status: raw.status || '',
    ticketPrice: raw.ticketprice || '0',
    assignName: raw.assignname || '',
    imgUrl: raw.img_url || '',
    linkPrint: raw.linkprint || '',
    customerName: raw.customername || '',
    customerAddress: raw.customeraddress || '',
    warrantyPlace: raw.warrantyplace || '',
    step: raw.step || 0,
  };
};

/**
 * Parse and transform raw API data to clean app format
 */
const parseWarrantyInfo = (raw: WarrantyInfoRaw): WarrantyInfo => {
  // Determine warranty status based on expiry date
  const getWarrantyStatus = (expiryDate: string): 'active' | 'expired' | 'not_found' => {
    if (!expiryDate) return 'not_found';

    try {
      // Parse dd/mm/yyyy format
      const parts = expiryDate.split('/');
      if (parts.length !== 3) return 'not_found';

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2], 10);

      const expiry = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return expiry >= today ? 'active' : 'expired';
    } catch {
      return 'not_found';
    }
  };

  // Parse location info from listThuocTinh
  const location = parseLocationInfo(raw.listThuocTinh);
  const formattedAddress = formatFullAddress(raw.customeraddress || '', location);

  return {
    code: raw.code || '',
    name: raw.name || raw.namesp || '',
    namesp: raw.namesp || raw.name || '',
    activeDate: raw.activedate || '',
    warrantyTime: raw.warrantytime || '',
    expiryDate: raw.expirydate || '',
    serial: raw.serial || '',
    customerName: raw.customername || '',
    customerMobile: raw.customermobile || '',
    customerPhone: raw.customerphone || '',
    customerAddress: raw.customeraddress || '',
    note: raw.note || '',
    type: raw.type || '',
    status: getWarrantyStatus(raw.expirydate),
    formattedAddress: formattedAddress || raw.customeraddress || '',
  };
};

export const warrantyLookupService = {
  /**
   * Lookup warranty information
   * API: /warranty?token=xxx&keyword=xxx&fromdate=ddmmyyyy&todate=ddmmyyyy
   */
  lookupWarranty: async (
    params: WarrantyLookupRequest
  ): Promise<WarrantyLookupResponse> => {
    try {
      // const credentials = getUserCredentials();
      const { keyword, fromdate, todate } = params;

      // Build API URL with query params
      const apiParams: Record<string, string> = {
        token: API_CONFIG.STORE_ID,
        keyword: keyword,
      };

      if (fromdate) {
        apiParams.fromdate = fromdate;
      }

      if (todate) {
        apiParams.todate = todate;
      }

      const url = buildTrackingApiUrl('/warranty', apiParams);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // API returns array directly
      if (!Array.isArray(result)) {
        throw new Error('Invalid response format');
      }

      // Parse raw data to clean format
      const parsedData: WarrantyInfo[] = result.map(parseWarrantyInfo);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },

  /**
   * Lookup repair information
   * API: /tracking/repair?token=xxx&keyword=xxx
   */
  lookupRepair: async (
    params: RepairLookupRequest
  ): Promise<RepairLookupResponse> => {
    try {
      // const credentials = getUserCredentials();
      const { keyword } = params;

      // Build API URL with query params
      const apiParams: Record<string, string> = {
        token: API_CONFIG.STORE_ID,
        keyword: keyword,
      };

      const url = buildTrackingApiUrl('/repair', apiParams);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // API returns array directly
      if (!Array.isArray(result)) {
        throw new Error('Invalid response format');
      }

      // Parse raw data to clean format
      const parsedData: RepairInfo[] = result.map(parseRepairInfo);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
