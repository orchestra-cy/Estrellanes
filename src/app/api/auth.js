export async function UserLogin({ username, password }) {
  const BaseUrl = 'http://127.0.0.1:8000/api';
  const url = `${BaseUrl}/login-auth`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    console.log('api/auth response: ', res);

    if (res.ok === false) {
      throw new Error(`Login failed with status ${res.status}`);
    }

    let data = null;
    try {
      data = await res.json();
      console.log(data);
    } catch (e) {}

    const token = data?.token || null;

    return { ok: true, status: res.status, token };
  } catch (error) {
    console.log('UserLogin error:', error);
    return {
      ok: false,
      status: null,
      data: null,
      error: error.message || String(error),
    };
  }
}

export async function RegisterUser(
  email,
  password,
  username,
  first_name,
  last_name,
  created_at,
) {
  console.log('[API] Sending data to register: ', {
    email,
    password,
    username,
    first_name,
    last_name,
    created_at,
  });
  const BaseUrl = 'http://127.0.0.1:8000/api';
  const url = `${BaseUrl}/register`;
  console.log('register api called');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        username,
        first_name,
        last_name,
        created_at,
      }),
    });

    let data = null;
    try {
      data = await res.json();
      console.log('data register: ', data);
    } catch (e) {}

    if (res.ok === false) {
      return { status: 'error', data };
    }

    return { status: 'ok', data };
  } catch (error) {
    console.log('RegisterUser error:', error);
    return {
      status: 'error',
      error: error.message || String(error),
    };
  }
}
