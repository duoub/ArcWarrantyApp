# WebView HTML Content Pattern

## Vấn đề
Content từ Word export HTML có:
- `background: white` inline trên mọi `<span>`, `<p>`, `<li>` → loang lổ nền
- Bảng có fixed width vượt màn hình
- `react-native-render-html` không handle được Word HTML phức tạp

## Giải pháp: WebView flex:1

Dùng `react-native-webview` thay `react-native-render-html`. WebView `flex: 1` tự scroll, không cần đo height.

**Package cần cài:**
```bash
npm install react-native-webview
# Sau đó rebuild native:
cd android && ./gradlew clean && cd .. && npx react-native run-android
cd ios && pod install && cd .. && npx react-native run-ios
```

## CSS Template (dùng cho mọi màn hình có Word HTML)

```css
* { background: transparent !important; }
body { font-family: 'Times New Roman', serif; font-size: 14px; color: #222; margin: 0; padding: 16px 16px 60px 16px; word-wrap: break-word; background: #f5f5f5 !important; }
table { border-collapse: collapse; width: 100% !important; max-width: 100%; }
td, th { border: 1px solid #ccc; padding: 6px 8px; background: transparent !important; }
img { max-width: 100% !important; height: auto; }
p { margin: 6px 0; line-height: 1.6; }
ul, ol { padding-left: 20px; }
h1,h2,h3 { line-height: 1.4; }
```

Key: `* { background: transparent !important; }` override hết inline background từ Word.

## NewsDetailScreen pattern

File: `src/screens/main/NewsDetailScreen/NewsDetailScreen.tsx`

- Title và meta (date, views) render native bên ngoài WebView
- Icon `calendar` và `eye` từ `Icon` component giống NewsScreen
- WebView chỉ render `article.content`

```tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
import { commonStyles } from '../../../styles/commonStyles';
import { NewsItem } from '../../../types/news';

type NewsDetailRouteParams = { NewsDetail: { article: NewsItem } };

const buildHtml = (content: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { background: transparent !important; }
  body { font-family: 'Times New Roman', serif; font-size: 14px; color: #222; margin: 0; padding: 16px 16px 60px 16px; word-wrap: break-word; background: #f5f5f5 !important; }
  table { border-collapse: collapse; width: 100% !important; max-width: 100%; }
  td, th { border: 1px solid #ccc; padding: 6px 8px; background: transparent !important; }
  img { max-width: 100% !important; height: auto; }
  p { margin: 6px 0; line-height: 1.6; }
  ul, ol { padding-left: 20px; }
  h1,h2,h3 { line-height: 1.4; }
</style>
</head>
<body>${'${content}'}</body></html>
`;

const NewsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<NewsDetailRouteParams, 'NewsDetail'>>();
  const { article } = route.params;
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <CustomHeader
        title="Chi tiết tin tức"  // ← ĐỔI BRAND
        leftIcon={<Text style={commonStyles.backIconMedium}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      {article.imgurl ? (
        <Image source={{ uri: article.imgurl }} style={[styles.image, { width }]} resizeMode="cover" />
      ) : null}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{article.title}</Text>
      </View>
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
          <Text style={styles.metaText}>{article.createdate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="eye" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
          <Text style={styles.metaText}>{article.luotview} lượt xem</Text>
        </View>
      </View>
      <WebView
        style={styles.webview}
        source={{ html: buildHtml(article.content || '') }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  image: { height: 220, backgroundColor: COLORS.gray200 },
  titleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 28 },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { marginRight: SPACING.xs },
  metaText: { fontSize: 13, color: COLORS.textSecondary },
  webview: { flex: 1, backgroundColor: COLORS.background },
});

export default NewsDetailScreen;
```

## SalesProgramDetailScreen pattern

File: `src/screens/main/SalesProgramDetailScreen/SalesProgramDetailScreen.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../../config/theme';
import CustomHeader from '../../../components/CustomHeader';
import { HomeStackParamList } from '../../../navigation/MainNavigator';  // ← ĐỔI BRAND

type SalesProgramDetailRouteProp = RouteProp<HomeStackParamList, 'SalesProgramDetail'>;  // ← ĐỔI BRAND

const buildHtml = (content: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { background: transparent !important; }
  body { font-family: 'Times New Roman', serif; font-size: 14px; color: #222; margin: 0; padding: 16px 16px 60px 16px; word-wrap: break-word; background: #f5f5f5 !important; }
  table { border-collapse: collapse; width: 100% !important; max-width: 100%; }
  td, th { border: 1px solid #ccc; padding: 6px 8px; background: transparent !important; }
  img { max-width: 100% !important; height: auto; }
  p { margin: 6px 0; line-height: 1.6; }
  ul, ol { padding-left: 20px; }
  h1,h2,h3 { line-height: 1.4; }
</style>
</head>
<body>${'${content}'}</body></html>
`;

const SalesProgramDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SalesProgramDetailRouteProp>();
  const { programName, htmlContent } = route.params;  // ← ĐỔI BRAND: tên params theo project

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <CustomHeader
        title={programName}
        leftIcon={<Text style={styles.backIcon}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <WebView
        style={styles.webview}
        source={{ html: buildHtml(htmlContent || '') }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backIcon: { fontSize: 32, color: COLORS.white, fontWeight: '300' },
  webview: { flex: 1, backgroundColor: COLORS.background },
});

export default SalesProgramDetailScreen;
```

## Checklist khi apply sang project khác

- [ ] `npm install react-native-webview` + rebuild native
- [ ] Thay `COLORS.primary`, `COLORS.background`, `COLORS.gray200`, `COLORS.textPrimary`, `COLORS.textSecondary` theo brand color
- [ ] `NewsDetailScreen`: đổi title header `"Chi tiết tin tức"` → tên brand
- [ ] `SalesProgramDetailScreen`: đổi import `HomeStackParamList` và tên route `'SalesProgramDetail'` theo đúng navigator của project mới
- [ ] Đổi tên params (`programName`, `htmlContent`) nếu project mới dùng tên khác
- [ ] Kiểm tra `NewsItem` type có đủ fields: `title`, `content`, `imgurl`, `createdate`, `luotview`, `description`
- [ ] `Icon` component phải có sẵn icon tên `calendar` và `eye`
