import React, { useState } from 'react';
import { RegisterDOT } from '../../types/api.auth.types';
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES, IMG } from '../../utils';
import { RegisterUser } from '../../app/api/auth';

export default function Register() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    contact_no: '',
    email: '',
    password: '',
    confPassword: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (
      !form.username ||
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.password
    ) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    if (form.password.trim() !== form.confPassword.trim()) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }

    setIsLoading(true);

    const created_at = new Date().toISOString();

    const payload: RegisterDOT = {
      email: form.email,
      password: form.password,
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      contact_no: form.contact_no,
      created_at,
    };

    const res = await RegisterUser(payload);

    setIsLoading(false);

    if (!res || res.status !== 'ok') {
      Alert.alert(
        'Failed to Register',
        res.error || 'Failed to register account. Please try again later.',
      );
      return;
    } else {
      Alert.alert('Registration Complete', 'Registered account successfully.');
      navigation.navigate(ROUTES.LOGIN);
    }
  };

  return (
    <ImageBackground
      source={IMG.BACKGROUND}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Semi-transparent overlay */}
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
            <View className="bg-white rounded-[32px] px-6 py-8 shadow-2xl elevation-5 my-10">
              {/* Header */}
              <View className="items-center mb-6">
                <Image
                  source={IMG.LOGO}
                  className="w-20 h-20 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                  Create your account
                </Text>
                <Text className="text-slate-500 text-xs font-medium text-center leading-5 px-4">
                  Fill out the details below to register your account
                </Text>
              </View>

              {/* Form Container */}
              <View className="space-y-4">
                {/* Username */}
                <View>
                  <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                    Username
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                    placeholder="Enter username"
                    placeholderTextColor="#94a3b8"
                    value={form.username}
                    onChangeText={text => handleChange('username', text)}
                    autoCapitalize="none"
                  />
                </View>

                {/* First and Last Name */}
                <View className="flex-row space-x-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                      First Name
                    </Text>
                    <TextInput
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                      placeholder="First Name"
                      placeholderTextColor="#94a3b8"
                      value={form.first_name}
                      onChangeText={text => handleChange('first_name', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                      Last Name
                    </Text>
                    <TextInput
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                      placeholder="Last Name"
                      placeholderTextColor="#94a3b8"
                      value={form.last_name}
                      onChangeText={text => handleChange('last_name', text)}
                    />
                  </View>
                </View>

                {/* Contact Number */}
                <View>
                  <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                    Contact Number
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={11}
                    value={form.contact_no}
                    onChangeText={text => handleChange('contact_no', text)}
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                    Email
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                    placeholder="m@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={text => handleChange('email', text)}
                  />
                </View>

                {/* Password */}
                <View>
                  <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                    Password
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={form.password}
                    onChangeText={text => handleChange('password', text)}
                  />
                </View>

                {/* Confirm Password */}
                <View>
                  <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium"
                    placeholder="Re-enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={form.confPassword}
                    onChangeText={text => handleChange('confPassword', text)}
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center mt-8 shadow-md shadow-sky-500/30 ${
                  isLoading ? 'bg-sky-400' : 'bg-sky-500'
                }`}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-white text-base font-bold tracking-wide">
                  {isLoading ? 'Registering...' : 'Register'}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-slate-500 text-sm font-medium">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.LOGIN)}
                >
                  <Text className="text-sky-500 text-sm font-bold underline">
                    Login
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
