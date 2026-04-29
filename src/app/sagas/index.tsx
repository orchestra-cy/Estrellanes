import { all } from 'redux-saga/effects';
import { userLoginAction,userLoginGoogleAction } from './auth';

export default function* rootSaga() {
  yield all([
    userLoginAction(),
    userLoginGoogleAction(),
    // userLogoutAction(),
  ]);
}