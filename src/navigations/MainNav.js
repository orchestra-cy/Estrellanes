import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import { ROUTES } from '../utils';
import BottomNav from '../components/BottomNav';
const Stack = createStackNavigator();

export default function MainNavigation() {
  return (
    <View className='flex-1'>
      <View className="flex-1">
        <Stack.Navigator
          initialRouteName={ROUTES.HOME}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
          <Stack.Screen
            name={ROUTES.APPOINTMENTS}
            component={AppointmentsScreen}
          />
          <Stack.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
          <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
        </Stack.Navigator>
      </View>

      <BottomNav />
    </View>
  );
}


