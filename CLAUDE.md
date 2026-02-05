# Arc Warranty App - Project Context

## Tech Stack
- **React Native** 0.83.0 with **Expo**
- **React** 19.2.0
- **TypeScript**
- **React Navigation** 7.x (Stack + Bottom Tabs)
- **Zustand** 5.0.9 for state management
- **Axios** for API calls (client with interceptors)
- **react-native-mmkv** for secure storage
- **react-hook-form** + **Zod** for form validation
- **react-native-vector-icons** for icons

## Project Structure
```
src/
├── api/           # API services → See inventoryService.ts as reference
├── config/        # constants.ts, theme.ts
├── navigation/    # MainNavigator.tsx (5 tabs)
├── screens/main/  # Each screen in separate folder
├── store/         # authStore.ts (Zustand)
├── types/         # TypeScript interfaces
├── components/    # CustomHeader, Avatar, common/Icon
├── utils/         # storage.ts, apiHelper.ts, validation.ts
└── styles/        # commonStyles.ts
```

## Commands
```bash
cd ArcWarrantyApp && npx expo start
npx expo start --clear
```

---

## File References

### API Configuration
| What | File | Lines |
|------|------|-------|
| API URLs & Store ID | [constants.ts](src/config/constants.ts) | L6-23 |
| Axios client & interceptors | [client.ts](src/api/client.ts) | L1-76 |
| API helpers (buildApiUrl, getUserCredentials) | [apiHelper.ts](src/utils/apiHelper.ts) | L1-101 |

### API Service Pattern (use as template)
| What | File | Lines |
|------|------|-------|
| Full service example | [inventoryService.ts](src/api/inventoryService.ts) | L1-136 |
| Simple service example | [bannerService.ts](src/api/bannerService.ts) | L1-51 |

### Types Pattern
| What | File | Lines |
|------|------|-------|
| User & Auth types | [auth.ts](src/types/auth.ts) | L1-141 |
| Inventory types (Raw + Clean) | [inventory.ts](src/types/inventory.ts) | Full file |

### State Management
| What | File | Lines |
|------|------|-------|
| Zustand auth store | [authStore.ts](src/store/authStore.ts) | L1-107 |
| MMKV storage wrapper | [storage.ts](src/utils/storage.ts) | L1-19 |

### UI/Styling
| What | File | Lines |
|------|------|-------|
| Colors, Spacing, Typography | [theme.ts](src/config/theme.ts) | L1-249 |
| Common reusable styles | [commonStyles.ts](src/styles/commonStyles.ts) | L1-819 |

### Screen Pattern (use as template)
| What | File | Lines |
|------|------|-------|
| Full screen with API, state, UI | [HomeScreen.tsx](src/screens/main/HomeScreen/HomeScreen.tsx) | L1-545 |
| Simple list screen | [NewsScreen.tsx](src/screens/main/NewsScreen/NewsScreen.tsx) | L1-253 |

### Navigation
| What | File | Lines |
|------|------|-------|
| Tab navigator & all stacks | [MainNavigator.tsx](src/navigation/MainNavigator.tsx) | L1-322 |
| ParamList types | [MainNavigator.tsx](src/navigation/MainNavigator.tsx) | L36-90 |

### Components
| What | File |
|------|------|
| Header component | [CustomHeader.tsx](src/components/CustomHeader.tsx) |
| Icon component | [common/Icon.tsx](src/components/common/Icon.tsx) |
| Avatar component | [Avatar.tsx](src/components/Avatar.tsx) |

### Form Validation
| What | File |
|------|------|
| Zod schemas | [validation.ts](src/utils/validation.ts) |

---

## Quick Patterns

### API Service Structure
```
1. Import: getUserCredentials, buildApiUrl, API_CONFIG
2. Define parseXxxItem() to transform raw API → clean format
3. Export xxxService object with async methods
4. Each method: try/catch, fetch, parse, return typed response
```

### Screen Structure
```
1. Imports: theme, commonStyles, CustomHeader, Icon, useAuthStore
2. State: data[], isLoading, refreshing, page, keyword
3. useEffect → loadData()
4. loadData(): call API, setData, handle pagination
5. Render: StatusBar, CustomHeader, SearchBar?, ScrollView with RefreshControl
6. Handle: loading state, empty state, data list
7. StyleSheet at bottom
```

### Standard Imports
```typescript
// Config
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { API_CONFIG } from '../../../config/constants';
// Utils
import { getUserCredentials, buildApiUrl } from '../../../utils/apiHelper';
// Store
import { useAuthStore } from '../../../store/authStore';
// Styles
import { commonStyles } from '../../../styles/commonStyles';
// Components
import CustomHeader from '../../../components/CustomHeader';
import { Icon } from '../../../components/common';
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `NewsScreen.tsx` |
| Services | camelCase + Service | `newsService.ts` |
| Types | camelCase | `news.ts` |
| Folders | PascalCase for screens | `NewsScreen/` |

---

## API Response Format

```typescript
// List: { status, list[], count, nextpage, message? }
// Single: { status, data, message? }
// Action: { status, message }
```

---

## Checklist: New Screen

1. Create `src/screens/main/XxxScreen/XxxScreen.tsx`
2. Create `src/api/xxxService.ts` (ref: inventoryService.ts)
3. Create `src/types/xxx.ts` (ref: inventory.ts)
4. Add to MainNavigator.tsx: import, ParamList type, Stack.Screen
5. Navigate from MenuScreen or other

---

## Notes

- UI text: Vietnamese
- API fields: Vietnamese without diacritics (`hoten`, `tinhthanh`)
- Primary color: `#E31E24` (ARC Red)
- Always use `commonStyles` for consistent UI
