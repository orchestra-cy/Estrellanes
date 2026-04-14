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

export async function FetchAppointment() {
  const url = `${BaseUrl}/get-appointment`;
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
      throw new Error(`FetchAppointment failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("Appointment data:", data);
    return data;
  } catch (error) {
    console.log('FetchAppointment error:', error);
    return { status: 'error', appointments: [] };
  }
}

export async function fetchHistory(userID, role) {
  const url = `${BaseUrl}/get-history`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userID, role }),
    });

    if (!res.ok) {
        throw new Error(`fetchHistory failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.log('fetchHistory error:', error);
    return { status: 'error', data: [] };
  }
}
