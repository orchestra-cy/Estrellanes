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
          onPress={() => navigation.navigate(ROUTES.HOME)}
        >
          <Icon name="home" size={26} color="#333" />
          <Text style={styles.label}>Home </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(ROUTES.APPOINTMENTS)}
        >
          <Icon name="calendar-check" size={26} color="#333" />
          <Text style={styles.label}>Appointments </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(ROUTES.HISTORY)}
        >
          <Icon name="history" size={26} color="#333" />
          <Text style={styles.label}>History </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Icon name="account" size={26} color="#333" />
          <Text style={styles.label}>Profile </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  container: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
});
