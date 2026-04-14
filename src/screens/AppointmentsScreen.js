import React, { useState, useEffect } from 'react';
import { FetchAppointment } from '../app/api/appointment';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AppointmentsScreen() {
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await FetchAppointment();
        if (data && data.status === 'ok' && Array.isArray(data.appointments)) {
          setAppointmentsData(data.appointments);
        } else {
          setAppointmentsData([]);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading Schedule...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <View className="bg-red-50 p-4 rounded-full mb-4">
          <Icon name="alert" size={32} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-slate-900 mb-2">
          Oops! Something went wrong.
        </Text>
        <Text className="text-slate-500 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-slate-900 py-3 px-6 rounded-xl"
          onPress={() => {}}
        >
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-slate-900">
          My Appointments
        </Text>
        <TouchableOpacity
          className="flex-row items-center bg-indigo-600 py-2.5 px-4 rounded-xl shadow-md shadow-indigo-500/20"
          activeOpacity={0.8}
        >
          <Icon name="plus" size={20} color="#FFF" />
          <Text className="text-white font-semibold ml-1.5 text-sm">
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>

      {appointmentsData.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 mx-5 mb-5 bg-white rounded-3xl border border-dashed border-slate-200">
          <View className="w-20 h-20 rounded-full bg-slate-50 justify-center items-center mb-4">
            <Icon name="calendar-blank" size={40} color="#94A3B8" />
          </View>
          <Text className="text-lg font-semibold text-slate-900 mb-2">
            No upcoming appointments
          </Text>
          <Text className="text-sm text-slate-400 text-center mb-6">
            You are all caught up! Need to see a doctor?
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-indigo-600 text-base font-semibold">
              Schedule a visit now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointmentsData}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const { appointment, dentist } = item;
            return (
              <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-100 flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-slate-900 mb-1">
                    Dr. {dentist?.first_name}{' '}
                    {dentist?.last_name || 'Unassigned'}
                  </Text>
                  <Text className="text-sm text-slate-500 mb-2">
                    {dentist?.specialty || 'General Dentistry'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Icon name="calendar" size={16} color="#4F46E5" />
                    <Text className="text-sm text-slate-700 font-medium">
                      {appointment?.appointment_date || 'Time TBD'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <View className="px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
                    <Text className="text-xs font-bold text-indigo-700">
                      {appointment?.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
