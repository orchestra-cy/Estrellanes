import { takeLatest, call, put } from 'redux-saga/effects';
import {
  USER_LOGIN,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGOUT,
} from '../action';
import { UserLogin } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function* userLoginAsync(action) {
  try {
    console.log('USER_LOGIN');
    yield put({ type: USER_LOGIN_REQUEST });
    console.log('USER_LOGIN_REQUEST');
    const result = yield call(UserLogin, action.payload);
    console.log("result is: ",result)
    if (result) {
      if (result.ok === true) {
        const payload = result.data || { token: result.token };
        console.log('USER_LOGIN_SUCCESS');
        yield put({ type: USER_LOGIN_SUCCESS, payload });
        return;
      } else {
        console.log('USER_LOGIN_FAILURE');
      }

      const token = result.token || null;
      const dataPayload = result.data || result;
      if (token || dataPayload) {
        const payload = { ...(dataPayload || {}), token: token || undefined };
        yield put({ type: USER_LOGIN_SUCCESS, payload });
        return;
      }

      const message =
        result.error ||
        (result.data && (result.data.message || result.data.error)) ||
        'Invalid credentials';
      yield put({ type: USER_LOGIN_FAILURE, error: message });
      console.log('USER_LOGIN_FAILURE');
      return;
    }

    yield put({ type: USER_LOGIN_FAILURE, error: 'No response from server' });
    console.log('USER_LOGIN_FAILURE');
  } catch (error) {
    yield put({
      type: USER_LOGIN_FAILURE,
      error: error?.message || 'An unexpected error occurred',
    });
    console.log('USER_LOGIN_FAILURE');
  }
}

export function* userLogoutAsync() {
  try {
    // console.log('USER_LOGOUT - performing cleanup');
    console.log('USER_LOGOUT');
    yield call(AsyncStorage.removeItem, 'persist:root');

    yield call(AsyncStorage.removeItem, 'persist:auth');

  } catch (error) {
    console.log('Error during logout cleanup:', error);
  }
}

export function* userLoginAction() {
  yield takeLatest(USER_LOGIN, userLoginAsync);
}

export function* userLogoutAction() {
  yield takeLatest(USER_LOGOUT, userLogoutAsync);
}
