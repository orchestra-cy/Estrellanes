import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './MainNav';
import AuthNav from './auth/AuthNav';

import configureStore from '../app/reducers';
import rootSaga from '../app/sagas';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

function GateContent() {
  const auth = useSelector(state => state.auth || {});
  console.log("auth status",auth)
  const hasAuth = Boolean(
   auth.token
  );
  
  return (
    <NavigationContainer>
      {hasAuth ? <MainNavigation /> : <AuthNav />}
    </NavigationContainer>
  );
}

export default function AppNav() {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <GateContent />
      </PersistGate>
    </Provider>
  );
}
