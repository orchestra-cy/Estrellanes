import AsyncStorage from '@react-native-async-storage/async-storage';

const BaseUrl = 'https://toothalie-production.up.railway.app/api';

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

export async function getServices() {
  const url = `${BaseUrl}/get-services`;
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
      throw new Error(`getServices failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getServices error:', error);
    return { status: 'error', data: [] };
  }
}

export async function getAppointmentTypes() {
  const url = `${BaseUrl}/get-appointment-types`;
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
      throw new Error(`getAppointmentTypes failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getAppointmentTypes error:', error);
    return { status: 'error', data: [] };
  }
}

export async function getAllDentist() {
  const url = `${BaseUrl}/dentists`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`getAllDentist failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getAllDentist error:', error);
    return { status: 'error', dentists: [] };
  }
}

export async function submitAppointment(payload: {
  dentistID: string;
  day: string;
  time: string;
  emergency: boolean;
  appointmentTypeId: number;
  date: string;
  message: string;
  serviceID: string;
}) {
  const url = `${BaseUrl}/add-appointment`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to submit appointment');
    }

    return await res.json();
  } catch (error) {
    console.log('submitAppointment error:', error);
    throw error;
  }
}

export async function fetchEditableAppointment(appointmentID: string) {
  const url = `${BaseUrl}/specified-appointment`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appointmentID }),
    });

    if (!res.ok) {
      throw new Error(
        `fetchEditableAppointment failed with status ${res.status}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.log('fetchEditableAppointment error:', error);
    throw error;
  }
}

export async function updateAppointment(payload: {
  appointmentID: string;
  scheduleID: string;
  date: string;
  isEmergency: boolean;
  isFamilyBooking: boolean;
  message: string;
}) {
  const url = `${BaseUrl}/update-appointment`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`updateAppointment failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('updateAppointment error:', error);
    throw error;
  }
}

export async function deleteAppointment(appointmentID: string) {
  const url = `${BaseUrl}/delete-appointment`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appointmentID }),
    });

    if (!res.ok) {
      throw new Error(`deleteAppointment failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('deleteAppointment error:', error);
    throw error;
  }
}
