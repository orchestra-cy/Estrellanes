import { takeLatest, call, put } from 'redux-saga/effects';
import {
  USER_LOGIN,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGIN_GOOGLE,
  USER_LOGOUT,
} from '../action';
import { UserLogin } from '../api/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';

import { LoginDOT } from '../../types/api.auth.types';
import {
  UserLoginGoogleAction,
  UserLoginAction,
} from '../../types/reducer.auth.types';
import { UserLoginResult } from '../../types/api.user.types';

export function* userLoginAsync(action: UserLoginAction) {
  try {
    console.log('USER_LOGIN');
    yield put({ type: USER_LOGIN_REQUEST });
    console.log('USER_LOGIN_REQUEST');
    const payload_login: LoginDOT = action.payload;
    const result: UserLoginResult = yield call(UserLogin, payload_login);
    // const result =  {
    //   ok: true,
    //   status: 200,
    //   token: "test",
    //   error: "", 
    // }
    
    console.log('the result is', result);
    if (result) {
      if (result.ok === true) {
        const payload: { token: string } = { token: result.token };
        console.log('Login successful, payload:', result.token);
        console.log('USER_LOGIN_SUCCESS');
        yield put({ type: USER_LOGIN_SUCCESS, payload });
        return;
      } else {
        console.log('USER_LOGIN_FAILURE');
      }

      const message: string = result.error
        ? result.error
        : 'Invalid credentials';
      yield put({ type: USER_LOGIN_FAILURE, error: message });
      console.log('USER_LOGIN_FAILURE');
      return;
    }

    yield put({ type: USER_LOGIN_FAILURE, error: 'No response from server' });
    console.log('USER_LOGIN_FAILURE');
  } catch (error) {
    yield put({
      type: USER_LOGIN_FAILURE,
      error: error || 'An unexpected error occurred',
    });
    console.log('USER_LOGIN_FAILURE');
  }
}

// export function* userLogoutAsync() {
//   try {
//     // console.log('USER_LOGOUT - performing cleanup');
//     console.log('USER_LOGOUT');
//     // yield call(AsyncStorage.removeItem, 'persist:root');

//     // yield call(AsyncStorage.removeItem, 'persist:auth');

//   } catch (error) {
//     console.log('Error during logout cleanup:', error);
//   }
// }

export function* userLoginGoogleAsync(action: UserLoginGoogleAction) {
  try {
    console.log('USER_LOGIN_GOOGLE action:', action);
    yield put({ type: USER_LOGIN_REQUEST });

    const token = (action.payload as unknown as string) || '';
    if (!token) {
      yield put({ type: USER_LOGIN_FAILURE, error: 'Missing auth token' });
      return;
    }

    const payload = { token };
    yield put({ type: USER_LOGIN_SUCCESS, payload });
  } catch (error) {
    yield put({
      type: USER_LOGIN_FAILURE,
      error: (error as Error)?.message || 'Google login failed',
    });
  }
}

export function* userLoginAction() {
  yield takeLatest(USER_LOGIN, userLoginAsync);
}

export function* userLoginGoogleAction() {
  yield takeLatest(USER_LOGIN_GOOGLE, userLoginGoogleAsync);
}

// export function* userLogoutAction() {
//   yield takeLatest(USER_LOGOUT, userLogoutAsync);
// }
