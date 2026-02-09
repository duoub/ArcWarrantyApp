# Fix-1: Sales Program Detail Screen & Banner Click Handler

## Summary
- Add SalesProgramDetailScreen to display HTML content from API
- Implement banner click handler (login/non-login)
- Add loading states and prevent multiple clicks

---

## 1. Install Dependencies

```bash
npm install react-native-render-html
```

---

## 2. Update Types

### `src/types/salesProgram.ts`

Add field to `SalesProgramItem`:
```typescript
export interface SalesProgramItem {
  // ... existing fields
  noidungchitiet: string; // HTML content for detail view
}
```

Add new request/response types:
```typescript
export interface GetSalesProgramDetailRequest {
  typeget: number; // Type parameter (1 for sales program detail)
  idct: string; // Program ID from banner
}

export interface GetSalesProgramDetailResponse {
  status: boolean;
  data: SalesProgramItem | null;
  message?: string;
}
```

---

## 3. Update API Service

### `src/api/salesProgramService.ts`

**Import new types:**
```typescript
import {
  // ... existing imports
  GetSalesProgramDetailRequest,
  GetSalesProgramDetailResponse,
} from '../types/salesProgram';
```

**Update parseSalesProgramItem:**
```typescript
const parseSalesProgramItem = (raw: SalesProgramItemRaw): SalesProgramItem => {
  return {
    // ... existing fields
    noidungchitiet: raw.noidungchitiet || '',
  };
};
```

**Add new method:**
```typescript
/**
 * Get sales program detail by ID (for banner click)
 * API: /getprofile?userid=xxx&storeid=xxx&typeget=1&idct=xxx
 */
getSalesProgramDetail: async (
  params: GetSalesProgramDetailRequest
): Promise<GetSalesProgramDetailResponse> => {
  try {
    const credentials = getUserCredentials();
    const { typeget, idct } = params;

    const url = buildApiUrl('/getprofile', {
      userid: credentials.username,
      storeid: API_CONFIG.STORE_ID,
      typeget: typeget,
      idct: idct,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: SalesProgramDataRaw = await response.json();

    if (result && Array.isArray(result.listchuongtrinhsale) && result.listchuongtrinhsale.length > 0) {
      const program = parseSalesProgramItem(result.listchuongtrinhsale[0]);

      return {
        status: true,
        data: program,
      };
    } else {
      return {
        status: false,
        data: null,
        message: 'Không tìm thấy thông tin chương trình',
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
  }
},
```

---

## 4. Create Detail Screen

### `src/screens/main/SalesProgramDetailScreen/SalesProgramDetailScreen.tsx`

<details>
<summary>Full file content (click to expand)</summary>

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type SalesProgramDetailRouteProp = RouteProp<
  HomeStackParamList,
  'SalesProgramDetail'
>;

const SalesProgramDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SalesProgramDetailRouteProp>();
  const { width } = useWindowDimensions();

  const { programName, htmlContent } = route.params;

  const decodeHtml = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  // Mock data for testing (remove when API returns real HTML)
  const mockHtmlContent = `
    <h1>Chương trình khuyến mãi đặc biệt</h1>
    <img src="https://picsum.photos/600/300" alt="Banner" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" />
    <h2>Thông tin chương trình</h2>
    <p><strong>Thời gian:</strong> 01/02/2026 - 28/02/2026</p>
    <p><strong>Đối tượng:</strong> Tất cả các đại lý</p>
    <h2>Nội dung khuyến mãi</h2>
    <ul>
      <li>Tặng thêm <strong>5%</strong> hoa hồng cho đơn hàng trên 100 triệu</li>
      <li>Tặng thêm <strong>7%</strong> hoa hồng cho đơn hàng trên 200 triệu</li>
      <li>Tặng thêm <strong>10%</strong> hoa hồng cho đơn hàng trên 500 triệu</li>
    </ul>
  `;

  const decodedHtml = decodeHtml(htmlContent || mockHtmlContent);

  const tagsStyles = {
    body: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },
    h1: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' as const, marginBottom: SPACING.sm },
    h2: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' as const, marginBottom: SPACING.sm },
    h3: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' as const, marginBottom: SPACING.sm },
    p: { marginBottom: SPACING.sm, lineHeight: 22 },
    ul: { marginBottom: SPACING.sm },
    ol: { marginBottom: SPACING.sm },
    li: { marginBottom: SPACING.xs, lineHeight: 22 },
    strong: { fontWeight: '700' as const, color: COLORS.textPrimary },
    em: { fontStyle: 'italic' as const },
    a: { color: COLORS.primary, textDecorationLine: 'underline' as const },
    img: { borderRadius: 8, marginVertical: SPACING.sm },
  };

  const classesStyles = {
    'text-center': { textAlign: 'center' as const },
    'text-right': { textAlign: 'right' as const },
    'text-bold': { fontWeight: '700' as const },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <CustomHeader
        title={programName}
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          <RenderHtml
            contentWidth={width - SPACING.screen_lg * 2 - SPACING.lg * 2}
            source={{ html: decodedHtml }}
            tagsStyles={tagsStyles}
            classesStyles={classesStyles}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: SPACING.md },
  backIcon: { fontSize: 32, color: COLORS.white, fontWeight: '300' },
  contentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.screen_lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  bottomSpacing: { height: SPACING.xl },
});

export default SalesProgramDetailScreen;
```

</details>

---

## 5. Update Navigation

### `src/navigation/MainNavigator.tsx`

**Import:**
```typescript
import SalesProgramDetailScreen from '../screens/main/SalesProgramDetailScreen/SalesProgramDetailScreen';
```

**Add to HomeStackParamList:**
```typescript
export type HomeStackParamList = {
  // ... existing screens
  SalesProgramDetail: {
    programName: string;
    htmlContent: string;
  };
};
```

**Add to HomeStackNavigator:**
```typescript
<HomeStack.Screen name="SalesProgramDetail" component={SalesProgramDetailScreen} />
```

---

## 6. Update SalesProgramScreen

### `src/screens/main/SalesProgramScreen/SalesProgramScreen.tsx`

**Import:**
```typescript
import type { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigation/MainNavigator';

type SalesProgramNavigationProp = StackNavigationProp<HomeStackParamList, 'SalesProgram'>;
```

**Update navigation:**
```typescript
const navigation = useNavigation<SalesProgramNavigationProp>();
```

**Update handleViewDetail:**
```typescript
const handleViewDetail = (program: SalesProgramItem) => {
  navigation.navigate('SalesProgramDetail', {
    programName: program.name,
    htmlContent: program.noidungchitiet,
  });
};
```

**Update button calls:**
```typescript
onPress={() => handleViewDetail(item)}  // Pass full item, not just item.id
```

---

## 7. Update HomeScreen - Banner Click (Logged In)

### `src/screens/main/HomeScreen/HomeScreen.tsx`

**Import:**
```typescript
import { salesProgramService } from '../../../api/salesProgramService';
```

**Add state:**
```typescript
const [isBannerLoading, setIsBannerLoading] = useState(false);
```

**Update handleBannerPress:**
```typescript
const handleBannerPress = async (banner: BannerItem) => {
  if (isBannerLoading) return;

  try {
    setIsBannerLoading(true);

    const response = await salesProgramService.getSalesProgramDetail({
      typeget: 1,
      idct: banner.id.toString(),
    });

    if (response.status && response.data) {
      navigation.navigate('SalesProgramDetail', {
        programName: response.data.name || banner.title,
        htmlContent: response.data.noidungchitiet,
      });
    } else {
      Alert.alert('Thông báo', response.message || 'Không tìm thấy thông tin chương trình');
    }
  } catch (error) {
    Alert.alert(
      'Lỗi',
      error instanceof Error ? error.message : 'Không thể tải thông tin chương trình'
    );
  } finally {
    setIsBannerLoading(false);
  }
};
```

**Update renderBanner:**
```typescript
const renderBanner = ({ item }: { item: BannerItem }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => handleBannerPress(item)}
    style={styles.bannerItem}
    disabled={isBannerLoading}
  >
    <Image
      source={{ uri: item.bannerurl }}
      style={styles.bannerImage}
      resizeMode="cover"
      defaultSource={DEFAULT_BANNER_IMAGE}
    />
    {isBannerLoading && (
      <View style={styles.bannerLoadingOverlay}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )}
  </TouchableOpacity>
);
```

**Add style:**
```typescript
bannerLoadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
```

---

## 8. Update LoginScreen - Banner Click (Not Logged In)

### `src/screens/auth/LoginScreen/LoginScreen.tsx`

**Import:**
```typescript
import { Linking } from 'react-native';
```

**Add state:**
```typescript
const [isBannerLoading, setIsBannerLoading] = useState(false);
```

**Add handleBannerPress:**
```typescript
const handleBannerPress = async (banner: BannerItem) => {
  if (isBannerLoading) return;

  if (!banner.link || banner.link.trim() === '') {
    Alert.alert('Thông báo', 'Banner không có liên kết');
    return;
  }

  try {
    setIsBannerLoading(true);

    const canOpen = await Linking.canOpenURL(banner.link);
    if (canOpen) {
      await Linking.openURL(banner.link);
    } else {
      Alert.alert('Lỗi', 'Không thể mở liên kết này');
    }
  } catch (error) {
    Alert.alert(
      'Lỗi',
      error instanceof Error ? error.message : 'Không thể mở liên kết'
    );
  } finally {
    setIsBannerLoading(false);
  }
};
```

**Update renderBanner (replace View with TouchableOpacity):**
```typescript
const renderBanner = ({ item }: { item: BannerItem }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => handleBannerPress(item)}
    style={styles.bannerItem}
    disabled={isBannerLoading}
  >
    <Image
      source={{ uri: item.bannerurl }}
      style={styles.bannerImage}
      resizeMode="cover"
      defaultSource={DEFAULT_BANNER_IMAGE}
    />
    {isBannerLoading && (
      <View style={styles.bannerLoadingOverlay}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )}
  </TouchableOpacity>
);
```

**Add style:**
```typescript
bannerLoadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
```

---

## Testing

1. **Non-login banner click:**
   - Open app (not logged in)
   - Click banner → Opens browser with `banner.link`
   - Shows loading overlay during process

2. **Login banner click:**
   - Login to app
   - Click banner on HomeScreen
   - Shows loading overlay
   - API call to get program detail
   - Navigate to SalesProgramDetailScreen
   - HTML content rendered with images, lists, formatting

3. **SalesProgram screen:**
   - Navigate to Chương trình bán hàng
   - Click "XEM CHI TIẾT" button
   - Shows detail screen with HTML content

---

## Key Features

✅ HTML rendering with images, lists, tables
✅ Loading states with overlay + spinner
✅ Prevent multiple clicks
✅ Error handling with user-friendly messages
✅ Mock data for testing when API returns empty
✅ Type-safe navigation
✅ Decode HTML entities

---

## Brand Customization

When porting to another project, update:
- Replace `COLORS.primary` with your brand color
- Update API endpoints if different
- Adjust theme values in `src/config/theme.ts`
- Update mock HTML content in SalesProgramDetailScreen
