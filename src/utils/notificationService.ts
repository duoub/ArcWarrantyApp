import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export class NotificationService {
  /**
   * Request permission to send notifications
   * For Android 13+ (API 33+), this will request POST_NOTIFICATIONS permission
   */
  static async requestUserPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
          }
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get FCM token
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  static setupNotificationListeners() {
    // Handle notification when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      // Show alert or custom notification UI
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Thông báo',
          remoteMessage.notification.body || '',
        );
      }
    });

    // Handle notification when app is opened from background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      // Navigate to specific screen if needed based on remoteMessage.data
    });

    // Check if app was opened from a notification (when app was completely closed)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // Navigate to specific screen if needed based on remoteMessage.data
        }
      });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
    });

    return unsubscribeForeground;
  }

  /**
   * Subscribe to a topic
   */
  static async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
    } catch (error) {
    }
  }

  /**
   * Unsubscribe from a topic
   */
  static async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
    } catch (error) {
    }
  }
}
