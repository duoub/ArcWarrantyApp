# API Reference - AKITO Warranty App

## API Configuration

Tất cả cấu hình API được quản lý tập trung trong file `src/config/constants.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://scell1.qbis.vn/api/forza',
  STORE_ID: '022665047387',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

## API Helper Utilities

File `src/utils/apiHelper.ts` cung cấp các helper functions chung:

### `getUserCredentials()`
Lấy thông tin user từ storage cho API calls
```typescript
const credentials = getUserCredentials();
// Returns: { storeid: string, username: string, userid: string }
```

### `buildApiUrl(endpoint, params?)`
Tạo API URL với query parameters
```typescript
const url = buildApiUrl('/getlistgiaodich', {
  storeid: '022665047387',
  userid: 'username',
  upage: 1,
  type: '1',
  keyword: '',
});
```

### `apiFetch<T>(url, options?)`
Wrapper cho fetch API với error handling
```typescript
const result = await apiFetch<ResponseType>(url, {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## Available APIs

### 1. Authentication API (`authService.ts`)

#### Login
- **Endpoint**: `/login?storeid={STORE_ID}`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "username",
    "pasword": "password"
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "username": "...",
    "email": "...",
    "name": "...",
    "message": "Login successful"
  }
  ```

### 2. Inventory API (`inventoryService.ts`)

#### Get Inventory List
- **Endpoint**: `/getlistgiaodich`
- **Method**: GET
- **Query Params**:
  - `storeid`: Store ID (from config)
  - `userid`: Username (from storage)
  - `upage`: Page number (1, 2, 3, ...)
  - `type`: '1' (Còn trong kho) hoặc '2' (Đã bán)
  - `keyword`: Search keyword (optional)
- **Response**:
  ```json
  {
    "nextpage": false,
    "count": 1,
    "list": [
      {
        "id": 62049145,
        "serial": "0904601040",
        "tenhangsanxuat": "AKITO",
        "tenmodel": "Điều hòa AKITO AKC-C36OC",
        "thoigianbaohanh": "24",
        "ngaynhapkho": "21/12/2025",
        "ngaymua": "",
        "kichhoatbaohanh": "",
        "kichhoatbaohanhname": "Chưa kích hoạt",
        "ngaykichhoat": "",
        "hanbaohanh": "",
        "statuscolor": "#367fa9",
        ...
      }
    ]
  }
  ```

#### Activate Warranty
- **Endpoint**: `/guikichhoatbaohanh`
- **Method**: POST
- **Body**:
  ```json
  {
    "storeid": "022665047387",
    "username": "username",
    "id": "62049145"
  }
  ```
- **Response**:
  ```json
  {
    "status": true,
    "message": "Kích hoạt bảo hành thành công"
  }
  ```

## Sử dụng trong Services

### Example: Tạo một API service mới

```typescript
// src/api/newService.ts
import { getUserCredentials, buildApiUrl } from '../utils/apiHelper';

export const newService = {
  getData: async (params: any) => {
    try {
      const credentials = getUserCredentials();

      const url = buildApiUrl('/endpoint', {
        storeid: credentials.storeid,
        userid: credentials.username,
        ...params,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};
```

## Notes

- Tất cả API calls đều sử dụng `getUserCredentials()` để lấy thông tin user
- Base URL và Store ID được config tập trung trong `constants.ts`
- Mỗi service nên có:
  - Type definitions trong `src/types/`
  - Error handling đầy đủ
  - Console logs để debug
  - Transform data từ raw API sang clean format (nếu cần)
