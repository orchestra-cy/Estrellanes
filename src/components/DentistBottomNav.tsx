import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { safeNavigate } from '../navigations/navigationRef';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ROUTES } from '../utils';

const tabs = [
  {
    key: 'dashboard',
    icon: 'view-dashboard-outline',
    route: ROUTES.DENTIST_HOME,
  },
  {
    key: 'schedule',
    icon: 'calendar-check-outline',
    route: ROUTES.DENTIST_APPOINTMENTS,
  },
  {
    key: 'history',
    icon: 'clock-time-four-outline',
    route: ROUTES.DENTIST_HISTORY,
  },
  // {
  //   key: 'settings',
  //   icon: 'cog-outline',
  //   route: ROUTES.DENTIST_SETTINGS,
  // },
  {
    key: 'profile',
    icon: 'account-outline',
    route: ROUTES.PROFILE,
  },
];

const PRIMARY = '#2563eb';

export default function DentistBottomNav() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handlePress = tab => {
    setActiveTab(tab.key);
    safeNavigate(tab.route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={styles.tab}
                onPress={() => handlePress(tab)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isActive && styles.activeIconContainer,
                  ]}
                >
                  <Icon
                    name={tab.icon}
                    size={isActive ? 32 : 28}
                    color={isActive ? '#ffffff' : '#94a3b8'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },

  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,

    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  activeIconContainer: {
    backgroundColor: PRIMARY,
    borderRadius: 999,

    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});