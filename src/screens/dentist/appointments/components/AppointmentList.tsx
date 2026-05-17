import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
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

const getStatusStyles = (status: DentistAppointmentItem['status']) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' };
    case 'rejected':
    case 'cancelled':
      return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
    default:
      return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
  }
};

export default function AppointmentList({
  appointments,
  refreshing,
  onRefresh,
  onReload,
  onSelectAppointment,
}: Props) {
  // Local state for the search bar
  const [searchQuery, setSearchQuery] = useState('');

  // Filter appointments based on patient name or service name
  const filteredAppointments = appointments.filter(appt => {
    const query = searchQuery.toLowerCase();
    const patientName = appt.patient_name?.toLowerCase() || '';
    const serviceName = appt.service_name?.toLowerCase() || '';
    return patientName.includes(query) || serviceName.includes(query);
  });

  return (
    <>
      {/* Premium Header */}
      <View className="flex-row justify-between items-end px-5 pt-6 pb-4">
        <View>
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            Appointments
          </Text>
          <Text className="text-sm font-semibold text-slate-500 mt-1">
            Manage your patient schedule
          </Text>
        </View>
        <TouchableOpacity
          onPress={onReload}
          activeOpacity={0.7}
          className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100"
        >
          <Icon name="refresh" size={22} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-2">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-[24px] px-4 py-3.5 shadow-sm shadow-slate-50">
          <Icon name="magnify" size={22} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900 font-medium p-0"
            placeholder="Search patients or services..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Icon name="close-circle" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            color="#0ea5e9" 
          />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View className="mt-6 bg-white rounded-[28px] border-2 border-dashed border-slate-200 p-10 items-center mx-1">
            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4 border border-slate-100">
              <Icon 
                name={searchQuery.length > 0 ? "magnify-close" : "calendar-blank-outline"} 
                size={32} 
                color="#94a3b8" 
              />
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-1">
              {searchQuery.length > 0 ? "No Matches Found" : "No Appointments"}
            </Text>
            <Text className="text-sm text-slate-500 font-medium text-center">
              {searchQuery.length > 0 
                ? `No patients match "${searchQuery}"` 
                : "You're all caught up for now."}
            </Text>
          </View>
        ) : (
          filteredAppointments.map(appointment => {
            const statusStyle = getStatusStyles(appointment.status);

            return (
              <TouchableOpacity
                key={appointment.id}
                onPress={() => onSelectAppointment(appointment)}
                className="bg-white p-5 rounded-[28px] mb-4 shadow-sm shadow-slate-100 border border-slate-100"
                activeOpacity={0.7}
              >
                {/* Top Row: Name & Status Badge (Moved status here to prevent overlap) */}
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-1 pr-3 flex-row items-center flex-wrap">
                    <Text
                      className="text-lg font-bold text-slate-900 mr-2"
                      numberOfLines={1}
                    >
                      {appointment.patient_name}
                    </Text>
                    {appointment.emergency && (
                      <View className="mt-1 mb-1 px-2 py-0.5 rounded-md border border-rose-100 bg-rose-50 flex-row items-center">
                        <Icon name="alert-circle" size={10} color="#e11d48" className="mr-1" />
                        <Text className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest">
                          Urgent
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Status Badge is now safely isolated in the top right corner */}
                  <View className={`px-3 py-1.5 rounded-xl border ${statusStyle.bg}`}>
                    <Text className={`text-[10px] font-extrabold uppercase tracking-widest ${statusStyle.text}`}>
                      {appointment.status}
                    </Text>
                  </View>
                </View>

                {/* Middle Row: Service Name */}
                <Text className="text-sm font-medium text-slate-500 mb-5">
                  {appointment.service_name || 'General Dentistry'}
                </Text>

                {/* Bottom Row: Date/Time Pill & Action Button (Ticket Style) */}
                <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
                  <View className="flex-row items-center bg-sky-50 px-3 py-2 rounded-xl border border-sky-100">
                    <Icon
                      name="calendar-clock"
                      size={16}
                      color="#0ea5e9"
                    />
                    <Text className="text-xs text-sky-700 font-bold ml-2">
                      {appointment.date || 'TBD'} • {appointment.time_slot || 'Time TBD'}
                    </Text>
                  </View>
                  
                  {/* Replaced floating chevron with a clean circular action button */}
                  <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
                    <Icon
                      name="arrow-right"
                      size={16}
                      color="#64748b"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </>
  );
}