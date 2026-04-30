import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { ROUTES } from '../utils';

import DentistBottomNav from '../components/DentistBottomNav';
import DentistDashboardScreen from '../screens/dentist/DentistDashboardScreen';
import DentistAppointmentsScreen from '../screens/dentist/DentistAppointmentsScreen';
import DentistHistoryScreen from '../screens/dentist/DentistHistoryScreen';
import DentistReminderScreen from '../screens/dentist/DentistReminderScreen';
import DentistSettingsScreen from '../screens/dentist/DentistSettingsScreen';
import ProfileScreen from '../screens/global/ProfileScreen';

const Stack = createStackNavigator();

export default function DentistNavigation() {
  return (
    <View className="flex-1">
      <View className="flex-1">
        <Stack.Navigator
          initialRouteName={ROUTES.DENTIST_HOME}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name={ROUTES.DENTIST_HOME}
            component={DentistDashboardScreen}
          />
          <Stack.Screen
            name={ROUTES.DENTIST_APPOINTMENTS}
            component={DentistAppointmentsScreen}
          />
         
          <Stack.Screen
            name={ROUTES.DENTIST_HISTORY}
            component={DentistHistoryScreen}
          />
          <Stack.Screen
            name={ROUTES.DENTIST_SETTINGS}
            component={DentistSettingsScreen}
          />
          <Stack.Screen
            name={ROUTES.PROFILE}
            component={ProfileScreen}
          />
        </Stack.Navigator>
      </View>

      <DentistBottomNav />
    </View>
  );
}
