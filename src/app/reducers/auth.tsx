import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGOUT,
} from '../action';

import {
  AuthAction,
  AuthState,
  AuthPayload,
} from '../../types/reducer.auth.types';

const initialState: AuthState = {
  userData: null,
  token: null,
  isLoading: false,
  error: null,
};

export default function authReducer(
  state: AuthState = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case USER_LOGIN_SUCCESS: {
      const payload: AuthPayload = action.payload || {};
      const token =
        payload.token ||
        payload.access_token ||
        ((payload.data as { token?: string | null } | null | undefined)
          ?.token ??
          null);
      const user =
        payload.user ||
        payload.data ||
        ((payload && !token ? payload : null) as AuthState['userData']);

      return {
        ...state,
        isLoading: false,
        userData: user,
        token,
        error: null,
      };
    }

    case USER_LOGIN_FAILURE: {
      const errorMessage =
        action.error ||
        (typeof action.payload === 'string' ? action.payload : null) ||
        'Login failed';
      return {
        ...state,
        isLoading: false,
        error: errorMessage,
      };
    }
    // custom
    case USER_LOGOUT: {
      return {
        ...state,
        isLoading: false,
        userData: null,
        token: null,
        error: null,
      };
    }

    default:
      return state;
  }
}
