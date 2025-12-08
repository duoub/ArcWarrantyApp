# Design Pattern & Style Guide

## Tổng quan

Để giảm độ dài file và tăng khả năng tái sử dụng code, project sử dụng pattern sau:

### 1. Common Styles (`src/styles/commonStyles.ts`)

File chứa tất cả styles được dùng chung giữa các màn hình:
- Container styles
- Background effects
- Card styles
- Input styles
- Button styles
- Text styles
- Error styles

**Cách sử dụng:**
```typescript
import { commonStyles } from '../../../styles/commonStyles';

<View style={commonStyles.container}>
  <View style={commonStyles.card}>
    <Text style={commonStyles.title}>Title</Text>
  </View>
</View>
```

### 2. Reusable Components (`src/components/common/`)

Các component UI được tái sử dụng:

#### FormInput
```typescript
import { FormInput } from '../../../components/common';

<FormInput
  label="Email"
  placeholder="vd: user@akito.com"
  value={value}
  onChangeText={onChange}
  isFocused={focusedField === 'email'}
  hasError={!!errors.email}
  error={errors.email?.message}
  icon="📧"  // Optional
  rightElement={<Button />}  // Optional
/>
```

#### PrimaryButton
```typescript
import { PrimaryButton } from '../../../components/common';

<PrimaryButton
  title="Đăng nhập"
  onPress={handleSubmit}
  isLoading={isLoading}
/>
```

#### SecondaryButton
```typescript
import { SecondaryButton } from '../../../components/common';

<SecondaryButton
  title="Gửi lại email"
  onPress={handleResend}
  isLoading={isLoading}
/>
```

#### Card
```typescript
import { Card } from '../../../components/common';

<Card size="large">  {/* or "small" */}
  {/* Card content */}
</Card>
```

#### BackButton
```typescript
import { BackButton } from '../../../components/common';

<BackButton
  onPress={() => navigation.goBack()}
  disabled={isLoading}
/>
```

#### InfoBox
```typescript
import { InfoBox } from '../../../components/common';

<InfoBox
  message="Link đặt lại mật khẩu sẽ hết hạn sau 15 phút"
  icon="ℹ️"
  type="info"  // "info" | "warning" | "error" | "success"
/>
```

## So sánh trước và sau

### Trước khi refactor

**LoginScreen.tsx:** 519 dòng
- Logic: ~70 dòng
- JSX: ~200 dòng
- Styles: ~249 dòng

**ForgotPasswordScreen.tsx:** 661 dòng
- Logic: ~100 dòng
- JSX: ~200 dòng
- Styles: ~361 dòng

### Sau khi refactor

**LoginScreen.tsx:** ~280 dòng (giảm 46%)
- Logic: ~70 dòng
- JSX với common components: ~160 dòng
- Styles riêng biệt: ~50 dòng

**ForgotPasswordScreen.tsx:** ~320 dòng (giảm 52%)
- Logic: ~100 dòng
- JSX với common components: ~170 dòng
- Styles riêng biệt: ~50 dòng

## Lợi ích

1. **Giảm độ dài file:** 40-50% ngắn hơn
2. **Dễ bảo trì:** Thay đổi 1 lần, áp dụng toàn bộ app
3. **Tính nhất quán:** UI/UX đồng bộ giữa các màn hình
4. **Tái sử dụng:** Component có thể dùng ở nhiều nơi
5. **Dễ test:** Component nhỏ dễ test hơn

## Best Practices

### 1. Ưu tiên dùng Common Styles

```typescript
// ❌ Không tốt - định nghĩa lại styles đã có
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

// ✅ Tốt - dùng common styles
import { commonStyles } from '../../../styles/commonStyles';
<View style={commonStyles.container}>
```

### 2. Ưu tiên dùng Common Components

```typescript
// ❌ Không tốt - tự viết input từ đầu
<View style={styles.inputContainer}>
  <Text style={styles.label}>Email</Text>
  <TextInput style={styles.input} />
  {error && <Text style={styles.error}>{error}</Text>}
</View>

// ✅ Tốt - dùng FormInput component
<FormInput
  label="Email"
  error={error}
/>
```

### 3. Chỉ định nghĩa styles riêng khi cần thiết

Chỉ thêm styles mới khi:
- Style đó chỉ dùng cho màn hình hiện tại
- Style đó không thể tổng quát hóa

```typescript
// Styles riêng cho LoginScreen
const styles = StyleSheet.create({
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 180,
    height: 60,
  },
  // ... các styles khác chỉ dành riêng cho Login
});
```

### 4. Kết hợp styles khi cần

```typescript
// Kết hợp common style với style riêng
<View style={[commonStyles.card, styles.customCard]}>
```

## Cấu trúc thư mục đề xuất

```
src/
├── components/
│   └── common/           # Reusable components
│       ├── FormInput.tsx
│       ├── PrimaryButton.tsx
│       ├── SecondaryButton.tsx
│       ├── BackButton.tsx
│       ├── Card.tsx
│       ├── InfoBox.tsx
│       └── index.ts      # Export tất cả
├── styles/
│   └── commonStyles.ts   # Common styles
├── screens/
│   └── auth/
│       ├── LoginScreen/
│       │   └── LoginScreen.tsx    # Chỉ chứa logic + styles riêng
│       └── ForgotPasswordScreen/
│           └── ForgotPasswordScreen.tsx
```

## Ví dụ refactor hoàn chỉnh

Xem file:
- [LoginScreen.refactored.tsx](./src/screens/auth/LoginScreen/LoginScreen.refactored.tsx)
- [ForgotPasswordScreen.refactored.tsx](./src/screens/auth/ForgotPasswordScreen/ForgotPasswordScreen.refactored.tsx)

## Migration Guide

Để chuyển đổi một màn hình hiện có:

1. Import common styles và components:
```typescript
import { commonStyles } from '../../../styles/commonStyles';
import { FormInput, PrimaryButton, Card } from '../../../components/common';
```

2. Thay thế styles container, background, card bằng commonStyles

3. Thay thế TextInput thủ công bằng FormInput component

4. Thay thế button thủ công bằng PrimaryButton/SecondaryButton

5. Xóa các styles đã được thay thế

6. Giữ lại chỉ các styles riêng biệt

## Notes

- Tất cả common components đã support Controller từ react-hook-form
- Tất cả common styles đã được test với theme hiện tại
- Components đã support disabled state và loading state
- Components đã có error handling built-in
