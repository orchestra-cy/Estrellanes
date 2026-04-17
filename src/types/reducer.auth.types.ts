import {
  USER_LOGIN,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGOUT,
} from '../app/action';
import { LoginDOT } from './api.auth.types';

export interface AuthUser {
  id?: number | string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

export interface AuthPayload {
  token?: string | null;
  access_token?: string | null;
  user?: AuthUser | null;
  data?: AuthUser | null;
  [key: string]: unknown;
}

export interface AuthState {
  error: string | null;
  isLoading: boolean;
  token: string | null;
  userData: AuthUser | null;
}

export interface UserLoginAction {
  type: typeof USER_LOGIN;
  payload: LoginDOT;
}

export interface UserLoginRequestAction {
  type: typeof USER_LOGIN_REQUEST;
}

export interface UserLoginSuccessAction {
  type: typeof USER_LOGIN_SUCCESS;
  payload: AuthPayload;
}

export interface UserLoginFailureAction {
  type: typeof USER_LOGIN_FAILURE;
  error: string;
  payload?: AuthPayload | null;
}

export interface UserLogoutAction {
  type: typeof USER_LOGOUT;
}

export type AuthAction =
  | UserLoginAction
  | UserLoginRequestAction
  | UserLoginSuccessAction
  | UserLoginFailureAction
  | UserLogoutAction;
