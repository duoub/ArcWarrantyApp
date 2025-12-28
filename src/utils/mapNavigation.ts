/**
 * Map Navigation Utility
 * Handles opening map applications for directions
 */

import { Platform, Linking, Alert } from 'react-native';

/**
 * Opens map application with directions to specified address
 * Priority: Google Maps > Apple Maps (iOS only)
 *
 * @param address - The destination address
 * @param label - Optional label for the destination
 */
export const openMapDirections = async (address: string, label?: string): Promise<void> => {
  if (!address || address.trim() === '') {
    Alert.alert('Lỗi', 'Không có địa chỉ để chỉ đường');
    return;
  }

  const encodedAddress = encodeURIComponent(address);
  const encodedLabel = label ? encodeURIComponent(label) : encodedAddress;

  try {
    // Apple Maps URL (iOS only) - No LSApplicationQueriesSchemes needed
    const appleMapsUrl = `maps://maps.apple.com/?q=${encodedLabel}&address=${encodedAddress}`;

    // Google Maps URLs
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?q=${encodedAddress}&center=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });

    // Web fallback URLs
    const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    // On iOS, try Apple Maps first (always available, no Info.plist config needed)
    if (Platform.OS === 'ios') {
      try {
        const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
        if (canOpenAppleMaps) {
          await Linking.openURL(appleMapsUrl);
          return;
        }
      } catch (error) {
        console.log('Apple Maps not available, trying Google Maps');
      }
    }

    // Try Google Maps
    if (googleMapsUrl) {
      try {
        const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
        if (canOpenGoogleMaps) {
          await Linking.openURL(googleMapsUrl);
          return;
        }
      } catch (error) {
        console.log('Google Maps app not available, falling back to web');
      }
    }

    // Fallback to Google Maps web (always works)
    try {
      await Linking.openURL(googleMapsWebUrl);
      return;
    } catch (error) {
      console.error('Failed to open web browser:', error);
    }

    // If nothing works, show error
    Alert.alert(
      'Lỗi',
      'Không thể mở ứng dụng bản đồ. Vui lòng kiểm tra kết nối internet.'
    );
  } catch (error) {
    console.error('Error opening map:', error);
    Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ. Vui lòng thử lại.');
  }
};

/**
 * Opens map application with directions using coordinates
 * Priority: Google Maps > Apple Maps (iOS only)
 *
 * @param latitude - Destination latitude
 * @param longitude - Destination longitude
 * @param label - Optional label for the destination
 */
export const openMapDirectionsByCoordinates = async (
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> => {
  if (!latitude || !longitude) {
    Alert.alert('Lỗi', 'Không có tọa độ để chỉ đường');
    return;
  }

  const encodedLabel = label ? encodeURIComponent(label) : 'Điểm đến';

  try {
    // Apple Maps URL (iOS only) - No LSApplicationQueriesSchemes needed
    const appleMapsUrl = `maps://maps.apple.com/?q=${encodedLabel}&ll=${latitude},${longitude}`;

    // Google Maps URLs
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?q=${latitude},${longitude}&center=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    });

    // Web fallback URLs
    const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    // On iOS, try Apple Maps first (always available, no Info.plist config needed)
    if (Platform.OS === 'ios') {
      try {
        const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
        if (canOpenAppleMaps) {
          await Linking.openURL(appleMapsUrl);
          return;
        }
      } catch (error) {
        console.log('Apple Maps not available, trying Google Maps');
      }
    }

    // Try Google Maps
    if (googleMapsUrl) {
      try {
        const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
        if (canOpenGoogleMaps) {
          await Linking.openURL(googleMapsUrl);
          return;
        }
      } catch (error) {
        console.log('Google Maps app not available, falling back to web');
      }
    }

    // Fallback to Google Maps web (always works)
    try {
      await Linking.openURL(googleMapsWebUrl);
      return;
    } catch (error) {
      console.error('Failed to open web browser:', error);
    }

    // If nothing works, show error
    Alert.alert(
      'Lỗi',
      'Không thể mở ứng dụng bản đồ. Vui lòng kiểm tra kết nối internet.'
    );
  } catch (error) {
    console.error('Error opening map:', error);
    Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ. Vui lòng thử lại.');
  }
};
