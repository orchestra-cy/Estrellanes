export const USER_LOGIN = 'USER_LOGIN'; 
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';
export const USER_LOGOUT = 'USER_LOGOUT'; 
export const USER_LOGIN_GOOGLE = 'USER_LOGIN_GOOGLE';

import { LoginDOT } from "../types/api.auth.types";
import { UserLoginResult } from "../types/api.user.types";

export const authLogin = (payload: LoginDOT) => ({
  type: USER_LOGIN,
  payload,
});

export const authLoginRequest = () => ({
  type: USER_LOGIN_REQUEST,
});

export const authLoginSuccess = (payload:UserLoginResult) => ({
  type: USER_LOGIN_SUCCESS,
  payload,
});

export const authLoginFailure = (error: string, payload = null) => ({
  type: USER_LOGIN_FAILURE,
  error,
  payload,
});

export const authLogout = () => ({
  type: USER_LOGOUT,
});

export const authLoginGoogle = (tokenID: string) => ({
  type: USER_LOGIN_GOOGLE,
  payload: tokenID,
});