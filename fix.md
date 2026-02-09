# Fix: Role-based Access Control for InOut Feature

## Summary
Implement role-based permissions for InOut screen:
- **Nhà phân phối**: Only Sell Out tab (Sell In shows alert)
- **Đại lý**: Only Sell In tab (Sell Out shows alert)
- **Thợ**: No access (tab hidden, FAB hidden)

## Files to Modify

### 1. InOutScreen.tsx
**Location**: `src/screens/main/InOutScreen/InOutScreen.tsx`

**Changes**:
```typescript
// Add initial tab logic based on role
const getInitialTab = (): TabMode => {
  const role = user?.role?.toLowerCase();
  if (role === 'nhà phân phối') return 'sell-out';
  if (role === 'đại lý') return 'sell-in';
  return 'sell-in';
};
const [activeTab, setActiveTab] = useState<TabMode>(getInitialTab());

// Add permission check in handleTabChange
const handleTabChange = (tab: TabMode) => {
  const role = user?.role?.toLowerCase();

  if (tab === 'sell-out' && role === 'đại lý') {
    Alert.alert('Chức năng không khả dụng', '');
    return;
  }

  if (tab === 'sell-in' && role === 'nhà phân phối') {
    Alert.alert('Chức năng không khả dụng', '');
    return;
  }

  setActiveTab(tab);
  if (tab === 'sell-in') {
    setSelectedDealer(null);
  }
};

// Wrap Tab Switcher to hide for "Thợ"
{user?.role?.toLowerCase() !== 'thợ' && (
  <View style={styles.tabContainer}>
    {/* Tab buttons here - keep original style, no disabled state */}
  </View>
)}
```

### 2. InventoryScreen.tsx
**Location**: `src/screens/main/InventoryScreen/InventoryScreen.tsx`

**Changes**:
```typescript
// Add import
import { useAuthStore } from '../../../store/authStore';

// Add in component
const { user } = useAuthStore();

// Update FAB button handler
const handleAddInventory = () => {
  const role = user?.role?.toLowerCase();

  if (role === 'thợ') {
    Alert.alert('Không có quyền', 'Thợ không được phép truy cập chức năng IN/OUT');
    return;
  }

  const parent = navigation.getParent();
  if (parent) {
    parent.navigate('InOutStack');
  }
};

// Wrap FAB button to hide for "Thợ"
{user?.role?.toLowerCase() !== 'thợ' && (
  <TouchableOpacity style={commonStyles.fab} onPress={handleAddInventory}>
    <Text style={commonStyles.fabIcon}>+</Text>
  </TouchableOpacity>
)}
```

### 3. MainNavigator.tsx
**Location**: `src/navigation/MainNavigator.tsx`

**Changes**:
```typescript
// Add import
import { useAuthStore } from '../store/authStore';

// Add in MainNavigator component
const { user } = useAuthStore();
const userRole = user?.role?.toLowerCase();

// Wrap InOutStack Tab.Screen
{userRole !== 'thợ' && (
  <Tab.Screen
    name="InOutStack"
    component={InOutStackNavigator}
    options={{...}}
  />
)}
```

## Role Values
- Nhà phân phối: `user.role` = "Nhà phân phối"
- Đại lý: `user.role` = "Đại lý"
- Thợ: `user.role` = "Thợ"

## Key Points
- Use `.toLowerCase()` for role comparison
- Keep tab styles normal (no opacity/disabled visual)
- Alert shown when clicking forbidden tab
- "Thợ" has complete UI hidden (no tab, no FAB)
- Initial tab selected based on role

---

# Fix: Add Product Lookup to Warranty Lookup Screen

## Summary
Add `productLookupService.checkProduct` API to WarrantyLookupScreen alongside existing warranty and repair lookups. Display product authenticity information in a separate card at the top when data is available.

## Files to Modify

### 1. WarrantyLookupScreen.tsx
**Location**: `src/screens/main/WarrantyLookupScreen/WarrantyLookupScreen.tsx`

**Step 1: Add imports**
```typescript
// Add these imports at the top
import { productLookupService } from '../../../api/productLookupService';
import { ProductInfo } from '../../../types/productLookup';
import { Icon, IconName } from '../../../components/common';
```

**Step 2: Add state**
```typescript
// Add this state with other useState hooks
const [productResult, setProductResult] = useState<ProductInfo | null>(null);
```

**Step 3: Update handleSearch to call 3 APIs in parallel**
```typescript
const handleSearch = async () => {
  if (!keyword.trim()) {
    Alert.alert('Thông báo', 'Vui lòng nhập số serial hoặc thông tin khách hàng');
    return;
  }

  try {
    setIsLoading(true);
    setResults([]);
    setRepairResults([]);
    setProductResult(null); // ADD THIS

    // Fetch warranty, repair, and product data in parallel
    const [warrantyResponse, repairResponse, productResponse] = await Promise.all([
      warrantyLookupService.lookupWarranty({
        keyword: keyword.trim(),
      }),
      warrantyLookupService.lookupRepair({
        keyword: keyword.trim(),
      }),
      productLookupService.checkProduct({        // ADD THIS API CALL
        imeiserial: keyword.trim(),
      }),
    ]);

    const hasWarrantyData = warrantyResponse.data && warrantyResponse.data.length > 0;
    const hasRepairData = repairResponse.data && repairResponse.data.length > 0;
    const hasProductData = productResponse.success && productResponse.data; // ADD THIS

    if (hasWarrantyData || hasRepairData || hasProductData) { // UPDATE THIS LINE
      // Set all results
      if (hasWarrantyData) {
        setResults(warrantyResponse.data);
      }
      if (hasRepairData) {
        setRepairResults(repairResponse.data);
      }
      if (hasProductData) {                      // ADD THIS BLOCK
        setProductResult(productResponse.data);
      }
    } else {
      Alert.alert(
        'Không tìm thấy',
        'Không tìm thấy thông tin bảo hành, sửa chữa hoặc sản phẩm cho từ khóa này.' // UPDATE MESSAGE
      );
    }
  } catch (error) {
    Alert.alert(
      'Lỗi',
      error instanceof Error ? error.message : 'Không thể tra cứu thông tin. Vui lòng thử lại.'
    );
  } finally {
    setIsLoading(false);
  }
};
```

**Step 4: Add Product Information Card UI (insert BEFORE Warranty Result Cards)**
```tsx
{/* Product Information Card */}
{productResult && productResult.isAuthentic && (
  <View style={commonStyles.cardWithMarginLarge}>
    {/* Status Header */}
    <View style={[styles.productHeader]}>
      <View style={styles.productIconContainer}>
        <Icon name="product-lookup" size={80} color={COLORS.success} />
      </View>
      <Text style={styles.productTitle}>
        Thông tin sản phẩm chính hãng
      </Text>
    </View>

    {/* Product Details */}
    <View style={styles.resultBody}>
      {/* Serial */}
      <View style={commonStyles.infoRowHorizontal}>
        <Text style={commonStyles.infoLabelFixed}>Số serial:</Text>
        <Text style={commonStyles.infoValueFlex}>{productResult.serial}</Text>
      </View>

      {/* Product Code */}
      {productResult.code && (
        <View style={commonStyles.infoRowHorizontal}>
          <Text style={commonStyles.infoLabelFixed}>Mã sản phẩm:</Text>
          <Text style={commonStyles.infoValueFlex}>{productResult.code}</Text>
        </View>
      )}

      {/* Product Name */}
      <View style={commonStyles.infoRowHorizontal}>
        <Text style={commonStyles.infoLabelFixed}>Tên sản phẩm:</Text>
        <Text style={commonStyles.infoValueFlex}>{productResult.name}</Text>
      </View>

      {/* Warranty Time */}
      {productResult.warrantyTime && (
        <View style={commonStyles.infoRowHorizontal}>
          <Text style={commonStyles.infoLabelFixed}>Thời gian BH:</Text>
          <Text style={commonStyles.infoValueFlex}>{productResult.warrantyTime}</Text>
        </View>
      )}

      {/* Export Date */}
      {productResult.exportDate && (
        <View style={commonStyles.infoRowHorizontal}>
          <Text style={commonStyles.infoLabelFixed}>Ngày xuất kho:</Text>
          <Text style={commonStyles.infoValueFlex}>{productResult.exportDate}</Text>
        </View>
      )}

      {/* Seller */}
      {productResult.seller && (
        <View style={commonStyles.infoRowHorizontal}>
          <Text style={commonStyles.infoLabelFixed}>Nơi bán:</Text>
          <Text style={commonStyles.infoValueFlex}>{productResult.seller}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Authenticity Note */}
      <View style={styles.authenticNote}>
        <Text style={styles.authenticNoteText}>
          Sản phẩm này đã được xác thực là hàng chính hãng của ARC.
          Quý khách được hưởng đầy đủ chính sách bảo hành theo quy định.
        </Text>
      </View>
    </View>
  </View>
)}
```

**Step 5: Fix header title alignment**
```typescript
// Replace commonStyles.sectionTitle with styles.headerTitle in both resultHeader and repairHeader

// For Warranty card header:
<Text style={styles.headerTitle}>
  Thông tin bảo hành {results.length > 1 ? `(${index + 1}/${results.length})` : ''}
</Text>

// For Repair card header:
<Text style={styles.headerTitle}>
  Thông tin sửa chữa {repairResults.length > 1 ? `(${index + 1}/${repairResults.length})` : ''}
</Text>
```

**Step 6: Add styles to StyleSheet**
```typescript
const styles = StyleSheet.create({
  // ... existing styles ...

  // Add this new style for header titles (no marginBottom for proper vertical centering)
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Update resultHeader - add minHeight
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '12',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    minHeight: 56, // ADD THIS
  },

  // Update repairHeader - add minHeight
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '12',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    minHeight: 56, // ADD THIS
  },

  // Add new styles for product card
  productHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.screen_lg,
    backgroundColor: '#E8F5E9',
  },
  productIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.success,
  },
  authenticNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  authenticNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.success,
    lineHeight: 18,
    fontWeight: '500',
  },
});
```

## Key Features
- **3 parallel API calls**: warranty lookup, repair lookup, and product check
- **Product card displayed first**: Shows at top when product data is available
- **Vertical alignment fix**: Header titles properly centered with badges using `headerTitle` style without `marginBottom`
- **Authentic product badge**: Green success color scheme with icon
- **Conditional rendering**: Only shows when `productResult.isAuthentic === true`

## Display Order
1. Product Information Card (if available) - NEW
2. Warranty Result Cards (existing)
3. Repair Result Cards (existing)

## Brand Note
Remember to update the authenticity note text to match your brand name:
```typescript
Sản phẩm này đã được xác thực là hàng chính hãng của [YOUR_BRAND_NAME].
Quý khách được hưởng đầy đủ chính sách bảo hành theo quy định.
```
