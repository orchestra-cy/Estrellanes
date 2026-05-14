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

// Global Services
import { notificationManager } from '../utils/NotificationManager';
import { update_fcm_token } from '../app/api/fcm_token';
import { wsManager } from '../utils/WebsocketManager';
import { showSuccess } from '../components/alert_message';

// types
import { UserInfoDOT } from '../types/api.auth.types';
import { WebSocketMessage } from '../types/websockets.types';

// function 
import { authLogout } from '../app/action';
import { useDispatch } from 'react-redux';
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

  // initialize
  const hasAuth = Boolean(auth?.token);
  const roleFromStore = normalizeRole(auth?.userData?.roles);
  const activeRole = roleFromStore || fetchedRole;
  const authToken = typeof auth?.token === 'string' ? auth.token : null;

  // authentication studd
  const dispatch = useDispatch();
  
  // get user
  useEffect(() => {
    if (!hasAuth) {
      setFetchedRole(null);
      setIsFetchingRole(false);
      return;
    }

    if (roleFromStore) {
      setIsFetchingRole(false);
      return;
    }

    let isMounted = true;
    setIsFetchingRole(true);

    GetUserInfo(authToken)
      .then((info: UserInfoDOT) => {
        if (!isMounted) return;
        if (info?.code == 401) {
          dispatch(authLogout());
          return;
        }
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
  }, [authToken, hasAuth, roleFromStore]);

  // fcm support notificaiton
  useEffect(() => {
    let unsubscribeFCM: (() => void) | undefined;

    const initializeNotifications = async () => {
      try {
        const hasPermission = await notificationManager.requestPermission();
        if (!hasPermission) return;

        const token = await notificationManager.getDeviceToken();
        await update_fcm_token(token.toString());

        unsubscribeFCM = notificationManager.setupForegroundHandler();
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    initializeNotifications();

    return () => {
      unsubscribeFCM?.();
    };
  }, []);

  // websocket auto-connect and disconnect 
  useEffect(() => {
    let unsubscribeNotification: (() => void) | undefined;
    let unsubscribeConnected: (() => void) | undefined;
    let unsubscribeDisconnected: (() => void) | undefined;
    let unsubscribeJWTChecker: (() => void) | undefined;

    try {
      if (!authToken) {
        wsManager.disconnect();
        console.log('Logged out: WebSocket disconnected natively via Redux');
        return;
      }

      wsManager.connect(authToken);
      console.log('WebSocket connected with token');

      unsubscribeNotification = wsManager.on(
        'notification',
        (payload: WebSocketMessage) => {
          console.log('payload is', payload);
          showSuccess({
            title: payload.title,
            message: payload.message,
            type: 'success',
            position: 'top',
            visibilityTime: 3000,
          });
        },
      );

      unsubscribeJWTChecker = wsManager.on(
        'auth_error',
        (payload: WebSocketMessage) => {
          console.log('payload is', payload);
          dispatch(authLogout());
        },
      );

      unsubscribeConnected = wsManager.on('connected', () =>
        console.log('WebSocket Connected'),
      );
      
      unsubscribeDisconnected = wsManager.on('disconnected', () =>
        console.log('WebSocket Disconnected'),
      );
      
    } catch (error) {
      console.error('WebSocket error:', error);
    }

    return () => {
      unsubscribeNotification?.();
      unsubscribeConnected?.();
      unsubscribeDisconnected?.();
      wsManager.disconnect();
    };
  }, [authToken]); 

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