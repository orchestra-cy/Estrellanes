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
  ScrollView,
} from 'react-native';

//api
import { google_auth_api } from '../../app/api/auth';

import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { ROUTES, IMG } from '../../utils';
import { authLogin, authLoginGoogle } from '../../app/action';
import { LoginDOT } from '../../types/api.auth.types';
import sign_in_with_google from '../../utils/firebase';

import { showSuccess } from '../../components/alert_message';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = () => {
    console.log('Credentials', `u: ${username} p: ${password}`);
    const payload: LoginDOT = { username, password };
    dispatch(authLogin(payload));
  };

  const handleLoginGoogle = async () => {
    console.log('Login function==================');
    try {
      const response = await sign_in_with_google();
      if (response) {
        const idToken = response?.userInfo?.idToken;
        if (!idToken) {
          console.log('No token received from Google Sign-In');
          return;
        }

        const apiResponse = await google_auth_api(idToken);
        const data = await apiResponse.json();
        
        if (data?.token) {
          dispatch(authLoginGoogle(data.token));
          showSuccess({
            title: 'Google Sign-In successful',
            message: 'Welcome back!',
            type: 'success',
            position: 'top',
            visibilityTime: 3000,
          });
        } else {
          console.log('No token returned by backend');
        }
      } else {
        console.log('Sign-in cancelled by user.');
      }
    } catch (error) {
      console.error('Sign-in crashed:', error);
    }
  };

  return (
    <ImageBackground
      source={IMG.BACKGROUND}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Darkened overlay to ensure the white card pops */}
      <View className="flex-1 bg-slate-900/60 justify-center">
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
            <View className="bg-white rounded-[32px] px-6 py-8 shadow-2xl elevation-5 my-10 mx-1">
              {/* Logo & Enhanced Welcome Header */}
              <View className="items-center mb-8">
                <Image
                  source={IMG.LOGO}
                  className="w-20 h-20 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                  Welcome Back
                </Text>
                <Text className="text-slate-500 text-sm font-medium text-center leading-5 px-4">
                  Sign in to manage your Toothalie records and book your next
                  dental appointment
                </Text>
              </View>

              {/* Form Container */}
              <View className="space-y-5">
                {/* Username Input */}
                <View>
                  <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Username
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900 font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900 font-medium"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity className="self-end mt-2">
                  <Text className="text-sky-500 text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Primary Login Button */}
              <TouchableOpacity
                className="w-full bg-sky-500 py-4 rounded-2xl items-center mt-6 shadow-md shadow-sky-500/30"
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold tracking-wide">
                  Sign In
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-slate-200" />
                <Text className="text-slate-400 font-medium px-4 text-xs uppercase tracking-wider">
                  Or continue with
                </Text>
                <View className="flex-1 h-[1px] bg-slate-200" />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
                onPress={handleLoginGoogle}
              >
                <Text className="text-[#4285F4] text-xl font-extrabold mr-3">
                  G
                </Text>
                <Text className="text-slate-700 text-base font-bold">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row items-center justify-center mt-8">
                <Text className="text-slate-500 text-sm font-medium">
                  New to the clinic?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.REGISTER)}
                >
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