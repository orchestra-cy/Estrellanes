import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './MainNav';
import DentistNavigation from './DentistNav';
import AuthNav from './auth/AuthNav';

import configureStore from '../app/reducers';
import rootSaga from '../app/sagas';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GetUserInfo } from '../app/api/user';

// types
import { UserInfoDOT } from '../types/api.auth.types';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

interface RootState {
  auth?: {
    token?: string | null;
    userData?: {
      roles?: string[] | string | null;
    } | null;
  };
}

type Role = 'DENTIST' | 'PATIENT';

const normalizeRole = (roles?: string[] | string | null): Role | null => {
  if (!roles) return null;

  const rawRoles = Array.isArray(roles) ? roles : [roles];
  const expanded = rawRoles.flatMap(entry => {
    const trimmed = String(entry).trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  });

  const normalized = expanded
    .map(role =>
      role
        .replace(/[[\]"]+/g, '')
        .replace('ROLE_', '')
        .toUpperCase(),
    )
    .filter(Boolean);

  const primary = normalized[0];
  return primary === 'DENTIST' || primary === 'PATIENT' ? primary : null;
};

function GateContent() {
  const auth = useSelector((state: RootState) => state.auth || {});
  const [fetchedRole, setFetchedRole] = useState<Role | null>(null);
  const [isFetchingRole, setIsFetchingRole] = useState(false);

  const hasAuth = Boolean(auth?.token);
  const roleFromStore = normalizeRole(auth?.userData?.roles);

  const activeRole = roleFromStore || fetchedRole;

  useEffect(() => {
    if (!hasAuth) {
      setFetchedRole(null);
      setIsFetchingRole(false);
      return;
    }

    // If Redux already knows the role upon login, skip the API call entirely
    if (roleFromStore) {
      setIsFetchingRole(false);
      return;
    }

    let isMounted = true;
    setIsFetchingRole(true);

    const tokenOverride = typeof auth?.token === 'string' ? auth.token : null;

    GetUserInfo(tokenOverride)
      .then((info: UserInfoDOT) => {
        if (!isMounted) return;
        setFetchedRole(normalizeRole(info?.user?.roles));
      })
      .catch(err => {
        console.error('Error fetching user role for navigation:', err);
        if (!isMounted) return;
        setFetchedRole(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsFetchingRole(false);
      });

    return () => {
      isMounted = false;
    };
  }, [auth?.token, hasAuth, roleFromStore]);

  if (hasAuth && (!activeRole || isFetchingRole)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  let CurrentNavigator = AuthNav;

  if (hasAuth) {
    if (activeRole === 'DENTIST') {
      CurrentNavigator = DentistNavigation;
    } else if (activeRole === 'PATIENT') {
      CurrentNavigator = MainNavigation;
    }
  }

  return (
    <NavigationContainer>
      <CurrentNavigator />
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
