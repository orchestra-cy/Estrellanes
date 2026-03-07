export const USER_LOGIN = 'USER_LOGIN'; 
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';
export const USER_LOGOUT = 'USER_LOGOUT'; 

export const authLogin = payload => ({
  type: USER_LOGIN,
  payload,
});

export const authLoginRequest = () => ({
  type: USER_LOGIN_REQUEST,
});

export const authLoginSuccess = payload => ({
  type: USER_LOGIN_SUCCESS,
  payload,
});

export const authLoginFailure = (error, payload = null) => ({
  type: USER_LOGIN_FAILURE,
  error,
  payload,
});

export const authLogout = () => ({
  type: USER_LOGOUT,
});

