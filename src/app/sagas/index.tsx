import { all } from 'redux-saga/effects';
import { userLoginAction } from './auth';

export default function* rootSaga() {
  yield all([
    userLoginAction(),
    // userLogoutAction(),
  ]);
}