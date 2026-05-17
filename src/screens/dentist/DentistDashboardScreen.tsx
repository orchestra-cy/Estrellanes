import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../utils';

import { fetchDentistAppointments } from '../../app/api/dentist';
import type { DentistAppointmentItem } from '../../types/dentist.types';
import type { AuthUser } from '../../types/reducer.auth.types';

// websocket manager & types
import { wsManager } from '../../utils/WebsocketManager';
import { WebSocketMessage } from '../../types/websockets.types';

interface RootState {
  auth?: {
    userData?: AuthUser | null;
  };
}

const formatName = (first?: string, last?: string) => {
  const full = `${first || ''} ${last || ''}`.trim();
  return full || 'Unknown Patient';
};

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-700',
      };
    case 'rejected':
    case 'cancelled':
      return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
    default:
      return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DentistDashboardScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth?.userData || null);
  const displayName = user?.firstName || user?.username || 'Doctor';
  const [appointments, setAppointments] = useState<DentistAppointmentItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ----- Realtime update guards -----
  const isFetchingRef = useRef(false); // prevents overlapping API calls
  const needsRefreshRef = useRef(false); // true if WS message arrived during a fetch
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null); // debounce timer

  const load = useCallback(async (isBackgroundRefresh = false) => {
    // Avoid duplicate in‑flight requests
    if (isFetchingRef.current) {
      console.log('Skipping load: already fetching');
      return;
    }

    isFetchingRef.current = true;

    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError('');

    try {
      console.log('Fetching latest appointments...');
      const data = await fetchDentistAppointments({ forceRefresh: true });

      if (data?.status === 'ok' && Array.isArray(data.appointments)) {
        const formatted = data.appointments.map((item: any) => {
          const appt = item.appointment || {};
          const patient = item.patient || {};
          const schedule =
            item.schedule ||
            (Array.isArray(item.schedules) ? item.schedules[0] : {});

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
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError('Failed to load dentist dashboard.');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);

      // If a refresh was requested while we were busy, run it now
      if (needsRefreshRef.current) {
        needsRefreshRef.current = false;
        // Tiny delay to avoid any recursion spikes
        setTimeout(() => load(true), 100);
      }
    }
  }, []);

  // ----- WebSocket listener with debounce + queue -----
  useEffect(() => {
    load();

    const unsubscribe = wsManager.on(
      'notification',
      (payload: WebSocketMessage) => {
        console.log('WebSocket Received:', payload);

        const shouldRefresh =
          payload.type === 'new_appointment' ||
          payload.type === 'appointment_updated_by_patient' ||
          payload.type === 'appointment_update' ||
          payload.type === 'appointment_cancelled';

        if (!shouldRefresh) return;

        console.log('Realtime refresh triggered:', payload.type);

        if (isFetchingRef.current) {
          needsRefreshRef.current = true;
        } else {
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          refreshTimeoutRef.current = setTimeout(() => {
            load(true);
          }, 300);
        }
      },
    );

    return () => {
      unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [load]);

  const total = appointments.length;
  const uniquePatientsCount = new Set(appointments.map(a => a.patient_name))
    .size;
  const emergenciesCount = appointments.filter(a => a.emergency).length;
  const getLocalTodayString = () => {
    const today = new Date();

    return today.toLocaleDateString('en-CA'); 
  };
  
  const todayStr = getLocalTodayString();
  console.log(todayStr)
  const todaysCount = appointments.filter(
    appointment => appointment.date.trim() === todayStr,
  ).length;
  console.log(appointments);
  console.log(todaysCount);

  const stats = {
    appointmentCount: total,
    uniquePatients: uniquePatientsCount,
    emergencies: emergenciesCount,
    todayCount: todaysCount,
  };

  if (loading && appointments.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-slate-500 font-bold tracking-wide">
          Syncing Schedule...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50 p-5">
        <View className="bg-rose-50 p-6 rounded-[32px] mb-5 border border-rose-100">
          <Icon name="alert-circle-outline" size={48} color="#e11d48" />
        </View>
        <Text className="text-2xl font-black text-slate-800 mb-2">
          Unable to load dashboard
        </Text>
        <Text className="text-slate-500 font-medium text-center mb-8 px-4 leading-6">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-sky-500 py-4 px-10 rounded-[20px] shadow-md shadow-sky-500/30"
          onPress={() => load()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold tracking-wide text-base">
            Try Again
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Exciting / Dynamic Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-bold text-sky-500 uppercase tracking-widest mb-1">
                {getGreeting()}
              </Text>
              <Text className="text-3xl font-black text-slate-900 tracking-tight">
                Welcome, Dr. {displayName}.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => load()}
              activeOpacity={0.7}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100"
            >
              <Icon name="refresh" size={22} color="#0ea5e9" />
            </TouchableOpacity>
          </View>

          <Text className="text-base font-semibold text-slate-500 mt-1">
            {stats.todayCount > 0
              ? `Ready to create some smiles? You have ${stats.todayCount} ${stats.todayCount === 1 ? 'patient' : 'patients'} scheduled for today.`
              : 'Your schedule is clear for today. Great time to catch up on records!'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-5 mb-8">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {/* Total Appointments */}
            <View className="w-[48%] bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm shadow-slate-100 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-5">
                <Icon name="calendar-multiple" size={100} color="#0ea5e9" />
              </View>
              <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center mb-4 border border-sky-100">
                <Icon name="calendar-multiple" size={24} color="#0ea5e9" />
              </View>
              <Text className="text-3xl font-black text-slate-800">
                {stats.appointmentCount}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Total Visits
              </Text>
            </View>

            {/* Unique Patients */}
            <View className="w-[48%] bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm shadow-slate-100 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-5">
                <Icon name="account-group" size={100} color="#6366f1" />
              </View>
              <View className="w-12 h-12 rounded-full bg-indigo-50 items-center justify-center mb-4 border border-indigo-100">
                <Icon name="account-group-outline" size={24} color="#6366f1" />
              </View>
              <Text className="text-3xl font-black text-slate-800">
                {stats.uniquePatients}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Patients
              </Text>
            </View>

            {/* Scheduled Today */}
            <View className="w-[48%] bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm shadow-slate-100 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-5">
                <Icon name="calendar-star" size={100} color="#10b981" />
              </View>
              <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-4 border border-emerald-100">
                <Icon name="calendar-today" size={24} color="#10b981" />
              </View>
              <Text className="text-3xl font-black text-slate-800">
                {stats.todayCount}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Today
              </Text>
            </View>

            {/* Emergencies */}
            <View className="w-[48%] bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm shadow-slate-100 relative overflow-hidden">
              <View className="absolute -right-4 -top-4 opacity-5">
                <Icon name="alert-decagram" size={100} color="#e11d48" />
              </View>
              <View className="w-12 h-12 rounded-full bg-rose-50 items-center justify-center mb-4 border border-rose-100">
                <Icon name="alert-plus-outline" size={24} color="#e11d48" />
              </View>
              <Text className="text-3xl font-black text-slate-800">
                {stats.emergencies}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Emergencies
              </Text>
            </View>
          </View>
        </View>

        {/* Latest Requests */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-5 ml-1">
            <Text className="text-xl font-black text-slate-800">
              Latest Requests
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(ROUTES.DENTIST_APPOINTMENTS as never)
              }
              className="bg-sky-50 px-4 py-2 rounded-full border border-sky-100"
            >
              <Text className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {appointments.length === 0 ? (
            <View className="bg-white rounded-[28px] border-2 border-dashed border-slate-200 p-8 items-center mt-2">
              <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4 border border-slate-100">
                <Icon name="calendar-check-outline" size={32} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-800 mb-1">
                All caught up
              </Text>
              <Text className="text-sm font-medium text-slate-500 text-center">
                New booking requests will appear here.
              </Text>
            </View>
          ) : (
            appointments.slice(0, 5).map(appt => {
              const statusStyle = getStatusStyles(appt.status);

              return (
                <View
                  key={appt.id}
                  className="bg-white p-5 rounded-[24px] mb-4 shadow-sm shadow-slate-100 border border-slate-100 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center mb-1">
                      <Text
                        className="text-lg font-bold text-slate-900"
                        numberOfLines={1}
                      >
                        {appt.patient_name}
                      </Text>
                      {appt.emergency && (
                        <View className="ml-2 px-2 py-0.5 rounded-md border border-rose-100 bg-rose-50 flex-row items-center">
                          <Icon
                            name="alert-circle"
                            size={10}
                            color="#e11d48"
                            className="mr-1"
                          />
                          <Text className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest">
                            Urgent
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-sm font-medium text-slate-500 mb-3">
                      {appt.service_name || 'General Checkup'}
                    </Text>

                    <View className="flex-row items-center bg-sky-50 self-start px-2.5 py-1.5 rounded-xl border border-sky-100">
                      <Icon name="calendar-clock" size={14} color="#0ea5e9" />
                      <Text className="text-[11px] text-sky-700 font-bold ml-1.5">
                        {appt.date || 'TBD'} • {appt.time_slot || 'Time TBD'}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end justify-center">
                    <View
                      className={`px-3 py-1.5 rounded-xl border ${statusStyle.bg}`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold uppercase tracking-widest ${statusStyle.text}`}
                      >
                        {appt.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
