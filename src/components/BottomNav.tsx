import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ROUTES } from '../utils';

export default function BottomNav() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.HOME)}
        >
          <Icon name="home-outline" size={28} color="#64748b" />
          <Text style={styles.label}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.APPOINTMENTS)}
        >
          <Icon name="calendar-blank-outline" size={28} color="#64748b" />
          <Text style={styles.label}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.HISTORY)}
        >
          <Icon name="clock-time-four-outline" size={28} color="#64748b" />
          <Text style={styles.label}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Icon name="account-outline" size={28} color="#64748b" />
          <Text style={styles.label}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    // Added soft shadow for a seamless, floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8, 
  },
  container: {
    flexDirection: 'row',
    height: 70, // Slightly taller for better touch targets
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    color: '#64748b', // Modern slate gray
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});