import { LoginDOT,RegisterDOT } from "../../types/api.auth.types";
const BaseUrl = 'https://toothalie-production.up.railway.app/api';

export async function UserLogin({ username, password }: LoginDOT) {
  const url = `${BaseUrl}/login-auth`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const res = await response.json();
    console.log("response is",res)
    const token = res?.token || null;
    if (res.code === 401) { 
      return { ok: false, status: res.code, token: null, error: res.message };
    }
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

export async function google_auth_api(tokenID: string) {
  const result = await fetch(BaseUrl + "/auth/google/mobile", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      tokenId: tokenID,
    }),
  });
  return result;
}

export async function RegisterUser(
  { email,
    password,
    username,
    first_name,
    last_name,
    created_at }: RegisterDOT
) {
  console.log('[API] Sending data to register: ', {
    email,
    password,
    username,
    first_name,
    last_name,
    created_at,
  });
  // const BaseUrl = 'http://127.0.0.1:8000/api';
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
        email:email.trim(),
        password:password.trim(),
        username:username.trim(),
        first_name:first_name.trim(),
        last_name:last_name.trim(),  
        created_at,
      }),
    });
    console.log('api/auth register response: ', res);
    let data = null;
    try {
      data = await res.json();
      console.log('data register: ', data);
    } catch (e) {console.log(e)}

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
