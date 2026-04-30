import AsyncStorage from '@react-native-async-storage/async-storage';


// types
import { ReminderPayloadSlot,ReminderPayloadDay } from '../../types/reminder';
const BaseUrl = 'http://127.0.0.1:8000/api';

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

export async function fetchDentistAppointments() {
  const url = `${BaseUrl}/get-appointment-dentist`;
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
      throw new Error(
        `fetchDentistAppointments failed with status ${res.status}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.log('fetchDentistAppointments error:', error);
    return { status: 'error', appointments: [] };
  }
}

export async function updateDentistAppointmentStatus(
  appointmentId: string,
  status: string,
) {
  const url = `${BaseUrl}/edit-appointment-dentist`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: appointmentId, status }),
    });

    if (!res.ok) {
      throw new Error(
        `updateDentistAppointmentStatus failed with status ${res.status}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.log('updateDentistAppointmentStatus error:', error);
    return { status: 'error' };
  }
}

export async function getDentistData() {
  const url = `${BaseUrl}/dentist-info`;
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
      throw new Error(`getDentistData failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getDentistData error:', error);
    return { status: 'error' };
  }
}

export async function updateDentistSchedule(
  schedulePayload: { [key: string]: unknown }[],
) {
  const url = `${BaseUrl}/update-dentist-settings`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schedules: schedulePayload }),
    });

    if (!res.ok) {
      throw new Error(`updateDentistSchedule failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('updateDentistSchedule error:', error);
    return { status: 'error' };
  }
}


export async function saveReminder(payload: ReminderPayloadDay[], id: string) {
  const url = `${BaseUrl}/save-reminder`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payload, id }),
    });

    if (!res.ok) {
      throw new Error(`saveReminder failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('saveReminder error:', error);
    return { status: 'error' };
  }
}

export async function getReminder(id: string) {
  const url = `${BaseUrl}/get-reminder`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error(`getReminder failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getReminder error:', error);
    return { status: 'error' };
  }
}

export async function updateReminder(
  appointmentID: string,
  payload: ReminderPayloadDay[],
) {
  console.log(appointmentID,payload)
  const url = `${BaseUrl}/update-reminder`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: String(appointmentID), payload }),
    });
    const data = await res.json();
    console.log("Update Reminder Response:", data);
    
    return data;
  } catch (error) {
    console.log('updateReminder error:', error);
    return { status: 'error', message: 'Network or parsing error occurred.' };
  }
}

export async function getServices() {
  const url = `${BaseUrl}/get-services`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'GET',
      headers: {
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

export async function getDentistServices() {
  const url = `${BaseUrl}/get-dentist-service`;
  try {
    const token = await getToken();
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`getDentistServices failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('getDentistServices error:', error);
    return { status: 'error', dentistServices: [] };
  }
}

export async function updateDentistServices(payload: { service_id: number }[]) {
  const url = `${BaseUrl}/edit-services`;
  try {
    const token = await getToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payload }),
    });

    if (!res.ok) {
      throw new Error(`updateDentistServices failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log('updateDentistServices error:', error);
    return { status: 'error' };
  }
}
