import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchDentistAppointments } from '../../app/api/dentist';
import type { DentistAppointmentItem } from '../../types/dentist.types';

const formatName = (first?: string, last?: string) => {
  const full = `${first || ''} ${last || ''}`.trim();
  return full || 'Unknown Patient';
};

export default function DentistDashboardScreen() {
  const [appointments, setAppointments] = useState<DentistAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDentistAppointments();
      if (data?.status === 'ok' && Array.isArray(data.appointments)) {
        const formatted = data.appointments.map((item: any) => {
          const appt = item.appointment || {};
          const patient = item.patient || {};
          const schedule = item.schedule || (Array.isArray(item.schedules) ? item.schedules[0] : {});

          return {
            id: String(appt.id ?? appt.appointment_id ?? ''),
            date: appt.user_set_date,
            time: appt.appointment_date?.split(' ')[1],
            day_of_week: schedule.day_of_week,
            time_slot: schedule.time_slot,
            status: appt.status || 'Pending',
            appointment_type_id: Number(appt.appointment_type_id) || 1,
            patient_name: formatName(patient.first_name, patient.last_name),
            email: patient.email,
            phone: patient.phone,
            emergency: !!appt.emergency,
            message: appt.message,
            created_at: appt.created_at,
            appointment_date: appt.appointment_date,
            service_name: appt.service_name,
          } as DentistAppointmentItem;
        });

        setAppointments(formatted);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load dentist dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const uniquePatients = new Set(appointments.map((a) => a.patient_name)).size;
    const emergencies = appointments.filter((a) => a.emergency).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = appointments.filter((a) => a.date?.startsWith(todayStr)).length;

    return { total, uniquePatients, emergencies, todayCount };
  }, [appointments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading dentist dashboard...
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
          Something went wrong
        </Text>
        <Text className="text-slate-500 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-slate-900 py-3 px-6 rounded-xl"
          onPress={load}
        >
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pt-5 pb-4">
          <Text className="text-2xl font-bold text-slate-900">
            Dentist Dashboard
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            Overview of today and upcoming appointments.
          </Text>
        </View>

        <View className="px-5">
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <Text className="text-xs uppercase text-slate-400 font-semibold">
                Total Appointments
              </Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">
                {stats.total}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <Text className="text-xs uppercase text-slate-400 font-semibold">
                Unique Patients
              </Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">
                {stats.uniquePatients}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <Text className="text-xs uppercase text-slate-400 font-semibold">
                Scheduled Today
              </Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">
                {stats.todayCount}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <Text className="text-xs uppercase text-slate-400 font-semibold">
                Emergencies
              </Text>
              <Text className="text-2xl font-bold text-slate-900 mt-1">
                {stats.emergencies}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-slate-900">
              Latest Requests
            </Text>
            <TouchableOpacity onPress={load}>
              <Text className="text-sm text-indigo-600 font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {appointments.length === 0 ? (
            <View className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 items-center">
              <Icon name="calendar-blank" size={36} color="#94A3B8" />
              <Text className="text-slate-900 font-semibold mt-2">
                No appointments yet
              </Text>
              <Text className="text-slate-500 text-sm mt-1 text-center">
                New bookings will appear here once patients schedule visits.
              </Text>
            </View>
          ) : (
            appointments.slice(0, 5).map((appt) => (
              <View
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">
                      {appt.patient_name}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {appt.service_name || 'General Checkup'}
                    </Text>
                  </View>
                  <View className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                    <Text className="text-xs font-bold text-indigo-700">
                      {appt.status}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mt-3">
                  <Icon name="calendar" size={16} color="#4F46E5" />
                  <Text className="text-sm text-slate-700 ml-2">
                    {appt.date || 'TBD'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
