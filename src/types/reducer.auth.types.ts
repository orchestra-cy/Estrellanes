import {
  USER_LOGIN,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGIN_GOOGLE,
  USER_LOGOUT,
  USER_INFO_SUCCESS,
} from '../app/action';
import { LoginDOT, LoginGoogleDOT } from './api.auth.types';

export interface AuthUser {
  id?: number | string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[] | string | null;
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

export interface UserLoginGoogleAction {
  type: typeof USER_LOGIN_GOOGLE;
  payload: LoginGoogleDOT;
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

export interface UserInfoSuccessAction {
  type: typeof USER_INFO_SUCCESS;
  payload: AuthUser | null;
}

export type AuthAction =
  | UserLoginAction
  | UserLoginRequestAction
  | UserLoginSuccessAction
  | UserLoginFailureAction
  | UserLogoutAction
  | UserInfoSuccessAction;
