import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {

  const quickLinks = [
    { label: 'Book Visit', icon: 'calendar-check' },
    { label: 'Find Clinic', icon: 'map-marker' },
    { label: 'Shop Care', icon: 'basket' },
    { label: 'Tele-Dental', icon: 'video' },
    { label: 'Offers', icon: 'tag' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-2">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* GREETING SECTION */}
        <View className="px-5 mt-4">
          <Text className="text-sm text-slate-500 font-medium">
            Good morning,
          </Text>
          <Text className="text-2xl font-bold text-slate-900 mt-0.5">
            Clint
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-white mx-5 mt-5 rounded-2xl px-4 h-14 shadow-sm elevation-2">
          <Icon name="magnify" size={24} color="#64748B" />
          <TextInput
            className="flex-1 text-base text-slate-900 ml-3 mr-2"
            placeholder="Search services, clinics, or products"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity
            className="w-10 h-10 rounded-xl bg-slate-100 justify-center items-center"
            activeOpacity={0.7}
          >
            <Icon name="qrcode-scan" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* QUICK LINKS GRID */}
        <View className="flex-row justify-around px-4 mt-6">
          {quickLinks.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="items-center"
              activeOpacity={0.7}
            >
              <View className="w-14 h-14 rounded-full bg-white justify-center items-center shadow-sm elevation-2">
                <Icon name={item.icon} size={24} color="#007AFF" />
              </View>
              <Text className="text-xs text-slate-600 mt-2 font-medium">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FEATURED SECTION */}
        <View className="flex-row justify-between items-center px-5 mt-8 mb-4">
          <Text className="text-lg font-bold text-slate-900">
            Featured Services
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-sm text-blue-500 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="ml-5"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {/* Card 1 */}
          <TouchableOpacity
            className="w-72 bg-white rounded-3xl mr-4 shadow-sm elevation-4"
            activeOpacity={0.9}
          >
            <View className="p-4">
              <View className="h-32 rounded-2xl justify-center items-center bg-blue-50">
                {/* Fallback to 'emoticon-outline' if 'tooth' is too new for your RN version */}
                <Icon name="tooth" size={48} color="#007AFF" />
              </View>
            </View>
            <View className="px-4 pb-4">
              <Text className="text-lg font-bold text-slate-900 mb-1">
                Whitening Special
              </Text>
              <Text className="text-sm text-slate-500 mb-3 leading-5">
                Professional teeth whitening at 30% off. Includes take-home kit.
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-blue-500 font-semibold">
                  Limited time offer
                </Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            className="w-72 bg-white rounded-3xl mr-4 shadow-sm elevation-4"
            activeOpacity={0.9}
          >
            <View className="p-4">
              <View className="h-32 rounded-2xl justify-center items-center bg-pink-50">
                <Icon name="calendar-check" size={48} color="#007AFF" />
              </View>
            </View>
            <View className="px-4 pb-4">
              <Text className="text-lg font-bold text-slate-900 mb-1">
                Checkup Reminder
              </Text>
              <Text className="text-sm text-slate-500 mb-3 leading-5">
                Your next cleaning is in 2 weeks. Book now to secure your time.
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-blue-500 font-semibold">
                  Schedule now
                </Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity
            className="w-72 bg-white rounded-3xl mr-4 shadow-sm elevation-4"
            activeOpacity={0.9}
          >
            <View className="p-4">
              <View className="h-32 rounded-2xl justify-center items-center bg-green-50">
                <Icon name="shield-check" size={48} color="#007AFF" />
              </View>
            </View>
            <View className="px-4 pb-4">
              <Text className="text-lg font-bold text-slate-900 mb-1">
                Insurance Verified
              </Text>
              <Text className="text-sm text-slate-500 mb-3 leading-5">
                Your coverage is active. View benefits and remaining balance.
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-blue-500 font-semibold">
                  Check coverage
                </Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* APPOINTMENT CARD */}
        <View className="bg-white mx-5 mt-6 p-5 rounded-3xl shadow-sm elevation-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Icon name="calendar" size={22} color="#007AFF" />
              <Text className="text-base font-semibold text-slate-900">
                Upcoming Appointment
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-sm text-blue-500 font-medium">
                Reschedule
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Text className="text-base font-bold text-slate-900">
                Tomorrow
              </Text>
              <Text className="text-base text-slate-500 ml-1">• 10:30 AM</Text>
            </View>
            <Text className="text-base text-slate-900 font-medium mb-1">
              Regular Checkup & Cleaning
            </Text>
            <Text className="text-sm text-slate-500">
              with Dr. James Wilson • Main Clinic
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-500 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
            activeOpacity={0.7}
          >
            <Text className="text-white text-base font-semibold">
              Prepare for visit
            </Text>
            <Icon name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* RECOMMENDED PRODUCTS */}
        <View className="flex-row justify-between items-center px-5 mt-8 mb-4">
          <Text className="text-lg font-bold text-slate-900">
            Recommended for you
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-sm text-blue-500 font-semibold">
              Shop All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="ml-5"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[1, 2, 3].map(item => (
            <TouchableOpacity
              key={item}
              className="w-36 bg-white rounded-3xl p-3 mr-3 shadow-sm elevation-2"
              activeOpacity={0.8}
            >
              <View className="h-24 bg-slate-100 rounded-2xl justify-center items-center mb-3">
                {/* Fallback to 'flash' if 'toothbrush-electric' doesn't show */}
                <Icon name="toothbrush-electric" size={32} color="#007AFF" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 mb-1">
                Electric Toothbrush
              </Text>
              <Text className="text-base font-bold text-blue-500 mb-2">
                $89.99
              </Text>
              <TouchableOpacity
                className="bg-blue-500 w-9 h-9 rounded-full justify-center items-center self-end"
                activeOpacity={0.7}
              >
                <Icon name="cart-plus" size={18} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
