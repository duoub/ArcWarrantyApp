/**
 * Dealer Type Definitions
 */

// Raw API response from dealer list backend
export interface DealerInfoRaw {
  id: number;
  name: string;
  phone: string;
  address: string;
}

// App's clean interface
export interface DealerInfo {
  id: number;
  name: string;
  phone: string;
  address: string;
}

// API Request/Response types
export interface DealerListRequest {
  keyword?: string;
  upage?: number;
  TicketRange?: string;
}

export interface DealerListResponse {
  nextpage: boolean;
  list: DealerInfo[];
}
