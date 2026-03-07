import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { authLogout } from '../app/action';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
export default function ProfileScreen() {
  const dispatch = useDispatch();
  return (
    <View
      style={styles.container}   >
      <Text>THIS IS PROFILE PAGE</Text>
      {/* DEVELOPMENT TOOLS */}
      {__DEV__ && (
        <TouchableOpacity style={styles.devLogoutButton} onPress={() => dispatch(authLogout())}>
          <Icon name="logout" size={18} color="#EF4444" />
          <Text style={styles.devLogoutText}>Developer Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  devLogoutButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  devLogoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
});