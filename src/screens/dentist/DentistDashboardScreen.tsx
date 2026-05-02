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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-rose-50 border-rose-100 text-rose-700';
    default:
      return 'bg-amber-50 border-amber-100 text-amber-700';
  }
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
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-slate-500 font-medium tracking-wide">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <View className="bg-rose-50 p-5 rounded-full mb-5">
          <Icon name="alert-circle-outline" size={36} color="#e11d48" />
        </View>
        <Text className="text-xl font-bold text-slate-800 mb-2">
          Unable to load dashboard
        </Text>
        <Text className="text-slate-500 text-center mb-8 px-4">{error}</Text>
        <TouchableOpacity
          className="bg-sky-500 py-3.5 px-8 rounded-xl shadow-sm shadow-sky-500/30"
          onPress={load}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold tracking-wide">Try Again</Text>
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
        {/* Header */}
        <View className="flex-row justify-between items-end px-6 pt-6 pb-5">
          <View>
            <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Dashboard
            </Text>
            <Text className="text-sm font-medium text-slate-500 mt-1">
              Welcome back, Doctor.
            </Text>
          </View>
          <TouchableOpacity
            onPress={load}
            activeOpacity={0.7}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
          >
            <Icon name="refresh" size={20} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-8">
          <View className="flex-row flex-wrap justify-between">
            {/* Total Appointments */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm mb-4">
              <View className="w-10 h-10 rounded-full bg-sky-50 items-center justify-center mb-3">
                <Icon name="calendar-multiple" size={20} color="#0ea5e9" />
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">
                {stats.total}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Total Visits
              </Text>
            </View>

            {/* Unique Patients */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm mb-4">
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mb-3">
                <Icon name="account-group-outline" size={20} color="#6366f1" />
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">
                {stats.uniquePatients}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Patients
              </Text>
            </View>

            {/* Scheduled Today */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-3">
                <Icon name="calendar-today" size={20} color="#10b981" />
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">
                {stats.todayCount}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Today
              </Text>
            </View>

            {/* Emergencies */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center mb-3">
                <Icon name="alert-plus-outline" size={20} color="#e11d48" />
              </View>
              <Text className="text-2xl font-extrabold text-slate-800">
                {stats.emergencies}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Emergencies
              </Text>
            </View>
          </View>
        </View>

        {/* Latest Requests */}
        <View className="px-6">
          <Text className="text-lg font-bold text-slate-800 mb-4">
            Latest Requests
          </Text>

          {appointments.length === 0 ? (
            <View className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-8 items-center mt-2">
              <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-3">
                <Icon name="calendar-blank-outline" size={32} color="#94a3b8" />
              </View>
              <Text className="text-base font-bold text-slate-800 mb-1">
                All caught up
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                New booking requests will appear here.
              </Text>
            </View>
          ) : (
            appointments.slice(0, 5).map((appt) => (
              <View
                key={appt.id}
                className="bg-white p-4 rounded-[20px] mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                      {appt.patient_name}
                    </Text>
                    {appt.emergency && (
                      <View className="ml-2 px-1.5 py-0.5 rounded border border-rose-100 bg-rose-50">
                        <Text className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">
                          Urgent
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-xs font-medium text-slate-500 mb-2.5">
                    {appt.service_name || 'General Checkup'}
                  </Text>
                  
                  <View className="flex-row items-center bg-slate-50 self-start px-2 py-1 rounded-lg border border-slate-100">
                    <Icon name="calendar-clock-outline" size={14} color="#0ea5e9" />
                    <Text className="text-[11px] text-slate-600 font-bold ml-1.5">
                      {appt.date || 'TBD'} • {appt.time_slot || 'Time TBD'}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <View className={`px-2.5 py-1 rounded-md border ${getStatusColor(appt.status)}`}>
                    <Text className="text-[10px] font-extrabold uppercase tracking-widest">
                      {appt.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}