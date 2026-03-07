
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
    console.log("api/auth response: ",res)

    if (res.ok === false) {
      throw new Error(`Login failed with status ${res.status}`);
    }
    
    let data = null;
    try {
      data = await res.json();
      console.log(data)
    } catch (e) {

    }

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
