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
