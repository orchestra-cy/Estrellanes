import { all } from 'redux-saga/effects';
import { userLoginAction, userLogoutAction } from './auth';

export default function* rootSaga() {
  yield all([
    userLoginAction(),
    // userLogoutAction(),
  ]);
}