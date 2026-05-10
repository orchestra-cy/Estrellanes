/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// This handles messages when the app is in the background or quit state
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Toothalie Background Message:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
