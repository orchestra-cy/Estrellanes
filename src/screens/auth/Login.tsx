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
  const [showPassword, setShowPassword] = useState(false); // Added state for password toggle

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  
  const handleLogin = () => {
    setLoading(true);
    console.log('Credentials', `u: ${username} p: ${password}`);
    
    // Pass an onComplete callback so the Saga can notify this component when done
    const payload: LoginDOT = { 
      username:username.trim(), 
      password:password.trim(),
      onComplete: () => setLoading(false) 
    };
    
    const response = dispatch(authLogin(payload));
    console.log(response)
  };

  const handleLoginGoogle = async () => {
    setLoading(true);
    console.log('Login function==================');
    try {
      const response = await sign_in_with_google();
      if (response) {
        const idToken = response?.userInfo?.idToken;
        if (!idToken) {
          console.log('No token received from Google Sign-In');
          setLoading(false);
          return;
        }

        const apiResponse = await google_auth_api(idToken);
        const data = await apiResponse.json();
        
        if (data?.token) {
          setLoading(false);
          
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
          setLoading(false);
        }
      } else {
        console.log('Sign-in cancelled by user.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign-in crashed:', error);
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={IMG.BACKGROUND}
      className="flex-1"
      resizeMode="cover"
    >
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
            <View className="bg-white rounded-[32px] px-6 py-8 shadow-2xl elevation-5 my-10 mx-1">
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

              <View className="space-y-5">
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

                {/* Password Input with Toggle */}
                <View>
                  <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Password
                  </Text>
                  <View className="relative justify-center">
                    <TextInput
                      // Added pr-16 to make room for the absolute button so text doesn't overlap
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-16 py-4 text-base text-slate-900 font-medium"
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      className="absolute right-4 py-2 px-2"
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-slate-400 font-bold text-xs tracking-widest">
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity className="self-end mt-2">
                  <Text className="text-sky-500 text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="w-full bg-sky-500 py-4 rounded-2xl items-center mt-6 shadow-md shadow-sky-500/30"
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text className="text-white text-lg font-bold tracking-wide">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-slate-200" />
                <Text className="text-slate-400 font-medium px-4 text-xs uppercase tracking-wider">
                  Or continue with
                </Text>
                <View className="flex-1 h-[1px] bg-slate-200" />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
                onPress={handleLoginGoogle}
                disabled={loading}
              >
                <Text className="text-[#4285F4] text-xl font-extrabold mr-3">
                  G
                </Text>
                <Text className="text-slate-700 text-base font-bold">
                  Continue with Google
                </Text>
              </TouchableOpacity>

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