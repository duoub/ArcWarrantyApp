/**
 * Warranty Lookup Type Definitions
 */

// Raw API response from tracking backend
export interface WarrantyInfoRaw {
  code: string; // mã sản phẩm
  name: string; // tên sản phẩm
  namesp: string; // tên sản phẩm
  activedate: string; // ngày kích hoạt bảo hành dd/mm/yyyy
  warrantytime: string; // thời gian bảo hành
  expirydate: string; // ngày hết hạn bảo hành dd/mm/yyyy
  serial: string; // serial sản phẩm
  customername: string; // tên KH
  customermobile: string; // SĐT KH
  customerphone: string; // SĐT KH (trường bổ sung)
  customeraddress: string; // Địa chỉ KH
  note: string; // ghi chú bảo hành
  type: string; // chủng loại
  listThuocTinh?: string[]; // Danh sách thuộc tính (province, district, ward)
}

// App's clean interface
export interface WarrantyInfo {
  code: string;
  name: string;
  namesp: string;
  activeDate: string;
  warrantyTime: string;
  expiryDate: string;
  serial: string;
  customerName: string;
  customerMobile: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
  type: string;
  status: 'active' | 'expired' | 'not_found';
  formattedAddress?: string; // Formatted address with province, district, ward
}

// API Request/Response types
export interface WarrantyLookupRequest {
  keyword: string; // Serial or customer info
  fromdate?: string; // ddmmyyyy format
  todate?: string; // ddmmyyyy format
}

export interface WarrantyLookupResponse {
  success: boolean;
  data: WarrantyInfo[];
  message?: string;
}

// Raw API response from repair tracking backend
export interface RepairInfoRaw {
  ticketcode: string; // mã phiếu
  ticketname: string; // tên phiếu
  productname2: string; // tên sản phẩm
  serial: string; // serial sản phẩm
  productname: string; // tên sản phẩm (có thể chứa HTML)
  servicename: string; // tên dịch vụ
  createdate: string; // ngày tạo dd/mm/yyyy
  returndate: string; // ngày trả
  duedate: string; // ngày hẹn dd/mm/yyyy
  updatedate: string; // ngày cập nhật dd/mm/yyyy
  status: string; // trạng thái
  ticketprice: string; // giá vé
  assignname: string; // người xử lý
  img_url: string; // URL ảnh
  groupimg: string; // nhóm ảnh
  groupname: string; // tên nhóm
  linkprint: string; // link in
  customername: string; // tên khách hàng
  customeraddress: string; // địa chỉ khách hàng
  warrantyplace: string; // nơi bảo hành
  step: number; // bước
}

// App's clean interface for repair info
export interface RepairInfo {
  ticketCode: string;
  ticketName: string;
  productName: string;
  serial: string;
  serviceName: string;
  createDate: string;
  returnDate: string;
  dueDate: string;
  updateDate: string;
  status: string;
  ticketPrice: string;
  assignName: string;
  imgUrl: string;
  linkPrint: string;
  customerName: string;
  customerAddress: string;
  warrantyPlace: string;
  step: number;
}

// API Request/Response types for repair lookup
export interface RepairLookupRequest {
  keyword: string; // Serial or customer info
}

export interface RepairLookupResponse {
  success: boolean;
  data: RepairInfo[];
  message?: string;
}
