import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';

// Register background handler at module level (must be outside of any function)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export class NotificationService {
  /**
   * Request permission to send notifications
   * For Android 13+ (API 33+), this will request POST_NOTIFICATIONS permission
   */
  static async requestUserPermission(): Promise<boolean> {
    try {
      // iOS Simulator check
      if (Platform.OS === 'ios') {
        const { PlatformConstants } = NativeModules;
        const isSimulator = PlatformConstants?.interfaceIdiom === 'pad' ||
                           PlatformConstants?.interfaceIdiom === 'phone';

        if (isSimulator) {
          console.log('⚠️ Running on iOS Simulator - Skipping FCM setup');
          console.log('📱 Push notifications require a real iOS device');
          return false;
        }
      }

      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('❌ Notification permission denied');
            return false;
          }
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted:', authStatus);
        return true;
      }

      console.log('❌ Notification permission not granted');
      return false;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  static async getToken(): Promise<string | null> {
    try {
      // iOS Simulator doesn't support push notifications
      if (Platform.OS === 'ios') {
        const { PlatformConstants } = NativeModules;
        const isSimulator = PlatformConstants?.interfaceIdiom === 'pad' ||
                           PlatformConstants?.interfaceIdiom === 'phone';

        if (isSimulator) {
          console.log('⚠️ Running on iOS Simulator - Push notifications not supported');
          console.log('📱 Please test on a real iOS device for FCM token');
          return null;
        }

        // On real iOS device, register for remote messages first
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
      }

      const token = await messaging().getToken();
      console.log('✅ FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  static setupNotificationListeners() {
    // Handle notification when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);

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
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
      // Navigate to specific screen if needed based on remoteMessage.data
    });

    // Check if app was opened from a notification (when app was completely closed)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          // Navigate to specific screen if needed based on remoteMessage.data
        }
      });

    return unsubscribeForeground;
  }

  /**
   * Subscribe to a topic
   */
  static async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from a topic
   */
  static async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }
}
