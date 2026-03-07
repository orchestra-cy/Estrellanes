import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ROUTES } from '../utils';
import BottomNav from '../components/BottomNav';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createStackNavigator();

export default function MainNavigation() {
  return (
    <View style={styles.container}>
      {/* The Stack handles the screen transitions */}
      <View style={styles.content}>
        <Stack.Navigator 
          initialRouteName={ROUTES.HOME}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
          <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
        </Stack.Navigator>
      </View>

      {/* The BottomNav stays fixed at the bottom */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1, // Takes up all space except what BottomNav uses
  },
});