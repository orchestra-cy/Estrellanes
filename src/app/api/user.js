import AsyncStorage from '@react-native-async-storage/async-storage';

const BaseUrl = 'http://127.0.0.1:8000/api';

const getToken = async () => {
  try {
    const authDataString = await AsyncStorage.getItem('persist:auth');
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData && authData.token) {
        // Redux persist stores strings as JSON stringified values
        return JSON.parse(authData.token);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting token from AsyncStorage', error);
    return null;
  }
};

export async function GetUserInfo() {
  const url = `${BaseUrl}/get-user-info`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`GetUserInfo failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.log('GetUserInfo error:', error);
    throw error;
  }
}

export async function ChangePassword(currentPassword, newPassword, confirmPassword) {
  const url = `${BaseUrl}/change-pass`;
  console.log('data send change password: ', { currentPassword, newPassword, confirmPassword })
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await res.json();
    console.log("the data respone by server: ",data)
    return data;
  } catch (error) {
    console.log('ChangePassword error:', error);
    return { status: 'error', message: error.message };
  }
}
