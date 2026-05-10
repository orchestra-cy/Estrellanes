const BaseUrl = 'http://127.0.0.1:8000/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getToken = async () => {
  try {
    const authDataString = await AsyncStorage.getItem('persist:auth');
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData && authData.token) {
        return JSON.parse(authData.token);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting token from AsyncStorage', error);
    return null;
  }
};

export const update_fcm_token = async (token: string) => {
  try {
    const result = await fetch(BaseUrl + '/user/update-token', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcmToken: token }),
    });
    const data = await result.json();
    console.log('updating token: ', data);
  } catch (e) {
    console.log(e);
  }
};
