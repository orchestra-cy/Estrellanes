import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import type { AuthUser } from '../../types/reducer.auth.types';

//nav
import { ROUTES } from '../../utils';
import { useNavigation } from '@react-navigation/native';

interface RootState {
  auth?: {
    userData?: AuthUser | null;
  };
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth?.userData || null);
  const displayName = user?.firstName || user?.username || 'there';

  const clinicServices = [
    'Routine Checkup & Cleaning',
    'Dental X-Ray',
    'Braces Consultation',
    'Teeth Whitening',
    'Wisdom Tooth Extraction',
    'Dental Implant Surgery',
    'Deep Cleaning (Scaling)',
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-2">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* HEADER WITH NOTIFICATIONS */}
      <View className="flex-row justify-between items-center px-6 mt-4">
        <View>
          <Text className="text-sm text-slate-500 font-medium tracking-wide">
            Good morning,
          </Text>
          <Text className="text-2xl font-extrabold text-slate-800 mt-0.5">
            {displayName}
          </Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity
          className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-sm elevation-2 relative"
          activeOpacity={0.7}
        >
          <Icon name="bell-outline" size={24} color="#64748b" />
          <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
      >
        {/* HERO CTA: THE PRIMARY ACTION */}
        <View className="px-5 mb-8">
          <TouchableOpacity
            activeOpacity={0.9}
            className="w-full bg-sky-500 rounded-[32px] p-6 shadow-lg shadow-sky-500/40 relative overflow-hidden"
            onPress={() => navigation.navigate(ROUTES.APPOINTMENTS as never)}
          >
            <Icon
              name="tooth-outline"
              size={120}
              color="rgba(255,255,255,0.1)"
              style={{ position: 'absolute', right: -20, bottom: -20 }}
            />

            <View className="pr-12">
              <Text className="text-white text-xl font-bold mb-2">
                Need a checkup?
              </Text>
              <Text className="text-sky-100 text-sm font-medium leading-5 mb-6">
                Book your next dental visit in seconds and manage your smile
                journey.
              </Text>
            </View>

            <View className="bg-white/20 self-start px-5 py-3 rounded-2xl flex-row items-center">
              <Text className="text-white font-bold mr-2">
                Book Appointment
              </Text>
              <Icon name="arrow-right" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* TEAM / SPECIALISTS */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-800 mb-4 px-6">
            Meet Our Specialists
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {/* Doctor 1 */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white p-4 rounded-3xl mr-4 shadow-sm elevation-2 items-center w-36"
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop',
                }}
                className="w-16 h-16 rounded-full mb-3 border-2 border-slate-100 bg-slate-50"
                resizeMode="cover"
              />
              <Text className="font-bold text-slate-800 text-center">
                Dr. Wilson
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-1">
                Orthodontics
              </Text>
            </TouchableOpacity>

            {/* Doctor 2 */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white p-4 rounded-3xl mr-4 shadow-sm elevation-2 items-center w-36"
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop',
                }}
                className="w-16 h-16 rounded-full mb-3 border-2 border-slate-100 bg-slate-50"
                resizeMode="cover"
              />
              <Text className="font-bold text-slate-800 text-center">
                Dr. Sarah
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-1">
                Oral Surgeon
              </Text>
            </TouchableOpacity>

            {/* Doctor 3 */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white p-4 rounded-3xl mr-4 shadow-sm elevation-2 items-center w-36"
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop',
                }}
                className="w-16 h-16 rounded-full mb-3 border-2 border-slate-100 bg-slate-50"
                resizeMode="cover"
              />
              <Text className="font-bold text-slate-800 text-center">
                Dr. James
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-1">
                General Dentist
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* OUR SERVICES */}
        <View className="px-5 mb-4">
          <View className="flex-row justify-between items-center mb-4 ml-1">
            <Text className="text-lg font-bold text-slate-800">
              Our Services
            </Text>
            <TouchableOpacity>
              <Text className="text-sm font-bold text-sky-500">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {clinicServices.map((service, index) => (
              <View
                key={index}
                className="bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm"
              >
                <Text className="text-slate-700 text-xs font-semibold">
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
