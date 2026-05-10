import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';

class NotificationManager {
  public async requestPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  }

  public async getDeviceToken() {
    const token = await messaging().getToken();
    return token; // Send this to Symfony later
  }

  public setupForegroundHandler() {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received', remoteMessage);

      // Create a notification channel (Required for Android)
      const channelId = await notifee.createChannel({
        id: 'toothalie_appointments',
        name: 'Appointments',
        importance: AndroidImportance.HIGH,
      });

      // Manually trigger the local notification banner
      if (remoteMessage.notification) {
        await notifee.displayNotification({
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          android: {
            channelId,
            pressAction: { id: 'default' },
          },
        });
      }
    });
  }
}

export const notificationManager = new NotificationManager();