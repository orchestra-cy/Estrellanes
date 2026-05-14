import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DentistAppointmentItem } from '../../../../types/dentist.types';

type Props = {
  appointments: DentistAppointmentItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onReload: () => void;
  onSelectAppointment: (appointment: DentistAppointmentItem) => void;
};

const getStatusColor = (status: DentistAppointmentItem['status']) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-rose-50 border-rose-100 text-rose-700';
    default:
      return 'bg-amber-50 border-amber-100 text-amber-700';
  }
};

export default function AppointmentList({
  appointments,
  refreshing,
  onRefresh,
  onReload,
  onSelectAppointment,
}: Props) {
  return (
    <>
      <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
        <Text className="text-2xl font-extrabold text-slate-800">
          Appointments
        </Text>
        <TouchableOpacity
          onPress={onReload}
          className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
        >
          <Icon name="refresh" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {appointments.length === 0 ? (
          <View className="mt-10 items-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Icon name="calendar-blank-outline" size={32} color="#94a3b8" />
            <Text className="text-slate-500 mt-2 font-medium">
              No appointments pending.
            </Text>
          </View>
        ) : (
          appointments.map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              onPress={() => onSelectAppointment(appointment)}
              className="bg-white p-3.5 rounded-xl mb-2.5 shadow-sm border border-slate-100 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Text
                    className="text-sm font-bold text-slate-800"
                    numberOfLines={1}
                  >
                    {appointment.patient_name}
                  </Text>
                  {appointment.emergency && (
                    <View className="ml-2 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100">
                      <Text className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">
                        Urgent
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-[11px] text-slate-500 mb-2">
                  {appointment.service_name || 'General Dentistry'}
                </Text>
                <View className="flex-row items-center bg-slate-50 self-start px-2 py-1 rounded border border-slate-100">
                  <Icon
                    name="calendar-clock-outline"
                    size={12}
                    color="#0ea5e9"
                  />
                  <Text className="text-[10px] text-slate-600 font-bold ml-1.5">
                    {appointment.date} • {appointment.time_slot}
                  </Text>
                </View>
              </View>
              <View className="items-end justify-between py-0.5">
                <View
                  className={`px-2 py-1 rounded border ${getStatusColor(appointment.status)}`}
                >
                  <Text className="text-[9px] font-extrabold uppercase">
                    {appointment.status}
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={16}
                  color="#94a3b8"
                  style={{ marginTop: 8 }}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
  );
}
