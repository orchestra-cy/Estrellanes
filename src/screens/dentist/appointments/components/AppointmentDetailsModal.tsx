import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { DentistAppointmentItem } from '../../../../types/dentist.types';
import type { AppointmentStatusUpdate } from '../../../../types/appointment.types';

type Props = {
  appointment: DentistAppointmentItem | null;
  isUpdating: boolean;
  onClose: () => void;
  onUpdateStatus: (status: AppointmentStatusUpdate) => void;
  onOpenReminders: () => void;
};

// Helper for dynamic status colors
const getStatusStyles = (status: string) => {
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

export default function AppointmentDetailsModal({
  appointment,
  isUpdating,
  onClose,
  onUpdateStatus,
  onOpenReminders,
}: Props) {
  const statusStyle = appointment ? getStatusStyles(appointment.status) : null;

  return (
    <Modal
      visible={!!appointment}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Removed dark background, added relative positioning */}
      <View className="flex-1 justify-end relative">
        
        {/* Invisible backdrop to allow tapping outside to close */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Stronger shadow (elevation-24) to float above the screen */}
        <SafeAreaView className="bg-white rounded-t-[36px] max-h-[90%] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] elevation-24 flex-shrink">
          
          {/* Drag Handle Indicator */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pb-4 border-b border-slate-50">
            <Text className="text-2xl font-black text-slate-800 tracking-tight">
              Request Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-9 h-9 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
            >
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="shrink"
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {appointment && (
              <View className="space-y-5">
                
                {/* Top Status & Service */}
                <View>
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Requested Service
                  </Text>
                  <Text className="text-2xl font-extrabold text-slate-800 ml-1 mb-3">
                    {appointment.service_name || 'General Dentistry'}
                  </Text>
                  
                  <View className="flex-row flex-wrap gap-2 ml-1">
                    <View className={`px-3 py-1.5 rounded-xl border ${statusStyle?.bg}`}>
                      <Text className={`text-xs font-extrabold uppercase tracking-wider ${statusStyle?.text}`}>
                        {appointment.status || 'Pending'}
                      </Text>
                    </View>
                    {appointment.emergency && (
                      <View className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 flex-row items-center">
                        <Icon name="alert-circle" size={12} color="#e11d48" className="mr-1.5" />
                        <Text className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                          Urgent
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Patient Profile Card */}
                <View className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100 flex-row items-center my-2">
                  <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mr-4 border border-indigo-100">
                    <Icon name="account" size={28} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Patient Info
                    </Text>
                    <Text className="text-lg font-bold text-slate-800 mb-0.5">
                      {appointment.patient_name}
                    </Text>
                    <Text className="text-xs font-medium text-slate-500 mb-0.5">
                      <Icon name="phone" size={12} color="#94a3b8" /> {appointment.phone || 'No phone provided'}
                    </Text>
                    <Text className="text-xs font-medium text-slate-500">
                      <Icon name="email" size={12} color="#94a3b8" /> {appointment.email || 'No email provided'}
                    </Text>
                  </View>
                </View>

                {/* Session Date/Time Split */}
                <View className="flex-row gap-3 mb-2">
                  <View className="flex-1 bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm shadow-slate-100">
                    <View className="w-10 h-10 bg-sky-50 rounded-full items-center justify-center mb-3">
                      <Icon name="calendar-month" size={20} color="#0ea5e9" />
                    </View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Date
                    </Text>
                    <Text className="text-base font-bold text-slate-800 mt-0.5">
                      {appointment.date || 'TBD'}
                    </Text>
                  </View>

                  <View className="flex-1 bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm shadow-slate-100">
                    <View className="w-10 h-10 bg-sky-50 rounded-full items-center justify-center mb-3">
                      <Icon name="clock-time-four" size={20} color="#0ea5e9" />
                    </View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Time
                    </Text>
                    <Text className="text-base font-bold text-slate-800 mt-0.5">
                      {appointment.time_slot || 'TBD'}
                    </Text>
                  </View>
                </View>

                {/* Message / Notes */}
                <View className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100">
                  <View className="flex-row items-center mb-2">
                    <Icon name="text-box-outline" size={18} color="#94a3b8" />
                    <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">
                      Patient Notes
                    </Text>
                  </View>
                  <Text className="text-sm text-slate-700 leading-6 font-medium">
                    {appointment.message
                      ? `"${appointment.message}"`
                      : 'No additional notes provided by the patient.'}
                  </Text>
                </View>

                {/* Manage Reminders Button */}
                {appointment.status === 'Approved' && (
                  <TouchableOpacity
                    onPress={onOpenReminders}
                    activeOpacity={0.7}
                    className="mt-2 py-4 rounded-[20px] flex-row items-center justify-center bg-slate-50 border border-slate-200"
                  >
                    <Icon
                      name="bell-ring-outline"
                      size={18}
                      color="#64748b"
                      className="mr-2.5"
                    />
                    <Text className="text-slate-600 font-bold text-sm tracking-wide">
                      Manage Reminders
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons Footer */}
          {appointment && (
            <View className="flex-row gap-3 px-6 py-5 border-t border-slate-50 bg-white rounded-b-[36px]">
              <TouchableOpacity
                disabled={isUpdating || appointment.status === 'Rejected'}
                onPress={() => onUpdateStatus('Rejected')}
                activeOpacity={0.7}
                className={`flex-1 py-4 rounded-[20px] items-center border-2 ${
                  appointment.status === 'Rejected' 
                    ? 'border-slate-100 bg-slate-50' 
                    : 'border-rose-100 bg-white'
                }`}
              >
                <Text
                  className={`font-bold tracking-wide ${
                    appointment.status === 'Rejected' ? 'text-slate-400' : 'text-rose-500'
                  }`}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isUpdating || appointment.status === 'Approved'}
                onPress={() => onUpdateStatus('Approved')}
                activeOpacity={0.8}
                className={`flex-[1.5] py-4 rounded-[20px] items-center shadow-md ${
                  appointment.status === 'Approved' 
                    ? 'bg-emerald-100 border border-emerald-200 shadow-none' 
                    : 'bg-emerald-500 shadow-emerald-500/30'
                }`}
              >
                <Text
                  className={`font-bold tracking-wide ${
                    appointment.status === 'Approved' ? 'text-emerald-700' : 'text-white'
                  }`}
                >
                  Approve
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}