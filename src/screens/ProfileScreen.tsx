import React, { useState, useEffect } from 'react';
import { UserInfo } from '../types/api.user.types';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';


import { useDispatch } from 'react-redux';
import { authLogout } from '../app/action';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GetUserInfo, ChangePassword } from '../app/api/user';
import { Alert, ActivityIndicator } from 'react-native';


import { ChangePassDOT } from '../types/api.user.types';


export default function ProfileScreen() {
  const dispatch = useDispatch();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [loading, setLoading] = useState<boolean>(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r: UserInfo = await GetUserInfo();
        console.log(r);
        setUserInfo(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getRoleDisplay = (roles: string[] | undefined) => {
    if (!roles || roles.length === 0) return 'User';
    const roleString = Array.isArray(roles) ? roles[0] : roles;
    if (typeof roleString === 'string' && roleString.includes('ADMIN'))
      return 'Administrator';
    return 'Standard User';
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const payload: ChangePassDOT = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };
      const result = await ChangePassword(payload);

      if (result.status === 'ok') {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        Alert.alert('Success', 'Your password was successfully changed.');
      } else {
        Alert.alert('Error', result.message || 'Make sure passwords match!');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.' + error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-4">
          <Text className="text-2xl font-bold text-slate-900">
            Profile Settings
          </Text>
        </View>

        {/* Header Card */}
        <View className="bg-white mx-5 mt-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <View className="h-24 bg-blue-500 relative" />
          <View className="px-6 pb-6 relative">
            <View className="relative -mt-12 mb-3 flex-row justify-between items-end">
              <View className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow-md items-center justify-center overflow-hidden">
                <Icon name="account" size={48} color="#CBD5E1" />
              </View>
            </View>

            <View>
              <Text className="text-2xl font-bold text-slate-900">
                {userInfo?.user?.firstName} {userInfo?.user?.lastName}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded">
                  <Text className="text-blue-700 text-xs font-bold uppercase">
                    {getRoleDisplay(userInfo?.user?.roles)}
                  </Text>
                </View>
                <Text className="text-slate-400 text-sm ml-2">
                  #{userInfo?.user?.username}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-white mx-5 mt-6 rounded-2xl shadow-sm border border-slate-200 p-5">
          <View className="flex-row items-center border-b border-slate-100 pb-3 mb-4">
            <Icon name="account-outline" size={20} color="#3B82F6" />
            <Text className="text-lg font-semibold text-slate-800 ml-2">
              Personal Information
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Text className="text-xs text-slate-400 uppercase font-bold mb-1">
                  First Name
                </Text>
                <Text className="text-slate-800 font-medium">
                  {userInfo?.user?.firstName}
                </Text>
              </View>
              <View className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Text className="text-xs text-slate-400 uppercase font-bold mb-1">
                  Last Name
                </Text>
                <Text className="text-slate-800 font-medium">
                  {userInfo?.user?.lastName}
                </Text>
              </View>
            </View>

            <View className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-4">
              <Text className="text-xs text-slate-400 uppercase font-bold mb-1">
                Email Address
              </Text>
              <View className="flex-row items-center">
                <Icon name="email-outline" size={16} color="#94A3B8" />
                <Text className="text-slate-800 font-medium ml-2">
                  {userInfo?.user?.email || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security / Password */}
        <View className="bg-white mx-5 mt-6 rounded-2xl shadow-sm border border-slate-200 p-5">
          <View className="flex-row items-center border-b border-slate-100 pb-3 mb-4">
            <Icon name="shield-lock-outline" size={20} color="#3B82F6" />
            <Text className="text-lg font-semibold text-slate-800 ml-2">
              Security
            </Text>
          </View>

          {!isChangingPassword ? (
            <View className="items-center py-2">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3">
                <Icon name="lock-outline" size={24} color="#3B82F6" />
              </View>
              <Text className="font-medium text-slate-900">Password</Text>
              <Text className="text-slate-500 text-sm text-center mb-4 px-4 mt-1">
                Update your password regularly to keep your account secure.
              </Text>
              <TouchableOpacity
                onPress={() => setIsChangingPassword(true)}
                className="w-full bg-white border border-slate-300 py-3 rounded-xl items-center"
              >
                <Text className="text-slate-700 font-medium text-sm">
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3 mt-2">
              <View className="mb-3">
                <Text className="text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                  Current Password
                </Text>
                <TextInput
                  secureTextEntry
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900"
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                  value={passwordData.currentPassword}
                  onChangeText={text =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                />
              </View>
              <View className="mb-3">
                <Text className="text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                  New Password
                </Text>
                <TextInput
                  secureTextEntry
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900"
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  value={passwordData.newPassword}
                  onChangeText={text =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                />
              </View>
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                  Confirm Password
                </Text>
                <TextInput
                  secureTextEntry
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900"
                  placeholder="Confirm new password"
                  placeholderTextColor="#94A3B8"
                  value={passwordData.confirmPassword}
                  onChangeText={text =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                />
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-3 rounded-xl items-center flex-row justify-center shadow-sm shadow-blue-200"
                  onPress={handlePasswordChange}
                >
                  <Icon name="content-save-outline" size={18} color="#FFF" />
                  <Text className="text-white font-medium text-sm ml-2">
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3 border border-slate-300 rounded-xl items-center justify-center bg-white"
                  onPress={() => setIsChangingPassword(false)}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Development Tools */}
        {__DEV__ && (
          <TouchableOpacity
            className="flex-row items-center justify-center mx-5 mt-8 p-4 bg-red-50 rounded-xl border border-red-100"
            onPress={() => dispatch(authLogout())}
          >
            <Icon name="logout" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold ml-2">
              Developer Logout
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
