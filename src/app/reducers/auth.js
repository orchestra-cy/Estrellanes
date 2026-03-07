import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGOUT,
} from '../action';

const initialState = {
  userData: null, 
  token: null, 
  isLoading: false,
  error: null, 
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case USER_LOGIN_SUCCESS: {
      const payload = action.payload || {};
      const token =
        payload.token || payload.access_token || payload?.data?.token || null;
      const user =
        payload.user || payload.data || (payload && !token ? payload : null);

      return {
        ...state,
        isLoading: false,
        userData: user,
        token,
        error: null,
      };
    }

    case USER_LOGIN_FAILURE: {
      const errorMessage = action.error || action.payload || 'Login failed';
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
