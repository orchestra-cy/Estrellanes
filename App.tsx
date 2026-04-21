import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNav from './src/navigations';
import toastConfig from './src/components/alert_message/config';
import './global.css';

function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AppNav />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                // Takes up the full screen height
    // backgroundColor: '#fff', // White background
    // justifyContent: 'center', // Centers content vertically
    // alignItems: 'center',     // Centers content horizontally
  },
});

export default App;
