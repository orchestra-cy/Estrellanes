import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { ROUTES, IMG } from '../../utils';
import { authLogin } from '../../app/action';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = () => {
    console.log('Credentials', `u: ${username} p: ${password}`);
    dispatch(authLogin({ username, password }));
  };

  return (
    <ImageBackground 
      source={IMG.BACKGROUND} 
      className="flex-1" 
      resizeMode="cover"
    >
      {/* Semi-transparent overlay to ensure background doesn't overpower the foreground */}
      <View className="flex-1 bg-slate-900/40 justify-center">
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            showsVerticalScrollIndicator={false}
            className="px-5"
          >
            {/* Main Floating Card */}
            <View className="bg-white rounded-[32px] px-8 py-10 shadow-2xl elevation-5 my-10">
              
              {/* Logo & Enhanced Welcome Header */}
              <View className="items-center mb-8">
                <Image
                  source={IMG.LOGO}
                  className="w-24 h-24 mb-6"
                  resizeMode="contain"
                />
                <Text className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                  Welcome Back
                </Text>
                <Text className="text-slate-500 text-sm font-medium text-center leading-5 px-4">
                  Sign in to manage your Toothalie records and book your next dental appointment
                </Text>
              </View>

              {/* Form Container */}
              <View className="space-y-6">
                
                {/* Username Input */}
                <View>
                  <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Username
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 font-medium"
                    placeholder="Enter your username"
                    placeholderTextColor="#94a3b8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Password
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 font-medium"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {/* Optional: Forgot Password Link */}
                <TouchableOpacity className="self-end mt-1">
                  <Text className="text-sky-500 text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className="w-full bg-sky-500 py-4 rounded-2xl items-center mt-8 shadow-md shadow-sky-500/30"
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold tracking-wide">
                  Sign In
                </Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row items-center justify-center mt-8">
                <Text className="text-slate-500 text-sm font-medium">
                  New to the clinic?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                  <Text className="text-sky-500 text-sm font-bold">
                    Create an account
                  </Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}