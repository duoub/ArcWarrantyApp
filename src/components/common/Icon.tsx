import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { StyleProp, TextStyle } from 'react-native';

export type IconName =
  // Navigation Icons
  | 'home'
  | 'warranty-activation'
  | 'in-out'
  | 'profile'
  | 'menu'
  | 'logout'

  // Menu Icons - Thiết bị gia dụng
  | 'product-info'
  | 'sales-policy'
  | 'distribution'
  | 'dealer'
  | 'warranty-report'
  | 'warranty-report-list'
  | 'warranty-lookup'
  | 'product-lookup'
  | 'warranty-policy'
  | 'warranty-station'

  // Common Icons
  | 'notification'
  | 'news'
  | 'contact'
  | 'search'
  | 'user'
  | 'profile-detail'
  | 'phone'
  | 'mail'
  | 'location'
  | 'city'
  | 'mobile'
  | 'website'
  | 'back'
  | 'lock'
  | 'checkbox-checked'
  | 'checkbox-unchecked'
  | 'store'
  | 'list'
  | 'factory'
  | 'package'
  | 'sell-in'
  | 'sell-out'
  | 'chevron-down'
  | 'close'
  | 'camera'
  | 'image'
  | 'info'
  | 'error-code'
  | 'question'
  | 'warehouse'
  | 'bank'
  | 'account-name'
  | 'bank-account'
  | 'eye'
  | 'eye-off'
  | 'copy'
  | 'trophy'
  | 'document'
  | 'calendar'
  | 'facebook'
  | 'zalo';

interface IconConfig {
  provider: 'MaterialCommunityIcons' | 'Feather';
  name: string;
}

// Mapping icon names to vector icons - Tối ưu cho app thiết bị gia dụng
const iconMap: Record<IconName, IconConfig> = {
  // Navigation Icons
  'home': { provider: 'MaterialCommunityIcons', name: 'home' },
  'warranty-activation': { provider: 'MaterialCommunityIcons', name: 'shield-check' },
  'in-out': { provider: 'MaterialCommunityIcons', name: 'barcode-scan' },
  'profile': { provider: 'MaterialCommunityIcons', name: 'account' },
  'menu': { provider: 'MaterialCommunityIcons', name: 'menu' },
  'logout': { provider: 'MaterialCommunityIcons', name: 'logout' },

  // Menu Icons - Thiết bị gia dụng
  'product-info': { provider: 'MaterialCommunityIcons', name: 'air-conditioner' },
  'sales-policy': { provider: 'MaterialCommunityIcons', name: 'file-document' },
  'distribution': { provider: 'MaterialCommunityIcons', name: 'truck' },
  'dealer': { provider: 'MaterialCommunityIcons', name: 'store-marker' },
  'warranty-report': { provider: 'MaterialCommunityIcons', name: 'tools' },
  'warranty-report-list': { provider: 'MaterialCommunityIcons', name: 'toy-brick-search' },
  'warranty-lookup': { provider: 'MaterialCommunityIcons', name: 'shield-search' },
  'product-lookup': { provider: 'MaterialCommunityIcons', name: 'check-decagram' },
  'warranty-policy': { provider: 'MaterialCommunityIcons', name: 'shield-alert' },
  'warranty-station': { provider: 'MaterialCommunityIcons', name: 'map-marker-radius' },
  'error-code': { provider: 'MaterialCommunityIcons', name: 'alert-octagon' },

  // Common Icons
  'notification': { provider: 'MaterialCommunityIcons', name: 'bell' },
  'news': { provider: 'MaterialCommunityIcons', name: 'newspaper-variant' },
  'contact': { provider: 'MaterialCommunityIcons', name: 'phone' },
  'mail': { provider: 'Feather', name: 'mail' },
  'search': { provider: 'Feather', name: 'search' },
  'user': { provider: 'Feather', name: 'user' },
  'profile-detail': { provider: 'MaterialCommunityIcons', name: 'account-details' },
  'phone': { provider: 'Feather', name: 'phone' },
  'location': { provider: 'Feather', name: 'map-pin' },
  'city': { provider: 'MaterialCommunityIcons', name: 'city' },
  'mobile': { provider: 'Feather', name: 'smartphone' },
  'website': { provider: 'Feather', name: 'globe' },
  'back': { provider: 'Feather', name: 'chevron-left' },
  'lock': { provider: 'MaterialCommunityIcons', name: 'lock' },
  'checkbox-checked': { provider: 'Feather', name: 'check-square' },
  'checkbox-unchecked': { provider: 'Feather', name: 'square' },
  'store': { provider: 'MaterialCommunityIcons', name: 'storefront-outline' },
  'list': { provider: 'Feather', name: 'list' },
  'factory': { provider: 'MaterialCommunityIcons', name: 'factory' },
  'package': { provider: 'Feather', name: 'package' },
  'sell-in': { provider: 'MaterialCommunityIcons', name: 'import' },
  'sell-out': { provider: 'MaterialCommunityIcons', name: 'export' },
  'chevron-down': { provider: 'Feather', name: 'chevron-down' },
  'close': { provider: 'Feather', name: 'x' },
  'camera': { provider: 'Feather', name: 'camera' },
  'image': { provider: 'Feather', name: 'image' },
  'info': { provider: 'MaterialCommunityIcons', name: 'information-outline' },
  'question': { provider: 'MaterialCommunityIcons', name: 'information' },
  'warehouse': { provider: 'MaterialCommunityIcons', name: 'warehouse' },
  'bank-account': { provider: 'MaterialCommunityIcons', name: 'numeric' },
  'account-name': { provider: 'MaterialCommunityIcons', name: 'card-account-details' },
  'bank': { provider: 'MaterialCommunityIcons', name: 'bank' },
  'eye': { provider: 'MaterialCommunityIcons', name: 'eye-outline' },
  'eye-off': { provider: 'MaterialCommunityIcons', name: 'eye-off-outline' },
  'copy': { provider: 'MaterialCommunityIcons', name: 'content-copy' },
  'trophy': { provider: 'MaterialCommunityIcons', name: 'trophy' },
  'document': { provider: 'MaterialCommunityIcons', name: 'file-document' },
  'calendar': { provider: 'MaterialCommunityIcons', name: 'calendar' },
  'facebook': { provider: 'MaterialCommunityIcons', name: 'facebook' },
  'zalo': { provider: 'MaterialCommunityIcons', name: 'chat-circle-outline' },
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  const config = iconMap[name];

  if (!config) {
    return null;
  }

  const { provider, name: iconName } = config;

  if (provider === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
  }

  if (provider === 'Feather') {
    return <Feather name={iconName as any} size={size} color={color} style={style} />;
  }

  return null;
};

export default Icon;
