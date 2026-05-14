import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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

export default function AppointmentDetailsModal({
  appointment,
  isUpdating,
  onClose,
  onUpdateStatus,
  onOpenReminders,
}: Props) {
  return (
    <Modal
      visible={!!appointment}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <SafeAreaView className="bg-white rounded-t-3xl max-h-[85%] flex-shrink">
          <View className="items-center py-3">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>
          <View className="flex-row justify-between items-center px-5 pb-3 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-800">
              Appointment Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
            >
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="shrink"
            contentContainerStyle={{ padding: 20 }}
          >
            {appointment && (
              <View className="space-y-4">
                <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Patient Info
                  </Text>
                  <Text className="text-sm font-bold text-slate-800 mb-1">
                    {appointment.patient_name}
                  </Text>
                  <Text className="text-[11px] text-slate-500">
                    Phone: {appointment.phone || 'N/A'}
                  </Text>
                  <Text className="text-[11px] text-slate-500">
                    Email: {appointment.email || 'N/A'}
                  </Text>
                </View>

                <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Text className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Session
                  </Text>
                  <Text className="text-sm font-bold text-slate-800 mb-1">
                    {appointment.service_name}
                  </Text>
                  <Text className="text-xs text-slate-600">
                    {appointment.date} • {appointment.time_slot}
                  </Text>
                  {appointment.message && (
                    <Text className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
                      "{appointment.message}"
                    </Text>
                  )}
                </View>

                {appointment.status === 'Approved' && (
                  <TouchableOpacity
                    onPress={onOpenReminders}
                    className="mt-2 py-3 rounded-xl flex-row items-center justify-center bg-white border border-slate-200 shadow-sm"
                  >
                    <Icon
                      name="bell-ring-outline"
                      size={16}
                      color="#64748b"
                      className="mr-2"
                    />
                    <Text className="text-slate-600 font-bold">
                      Manage Reminders
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {appointment && (
            <View className="flex-row gap-2 px-5 py-3 border-t border-slate-100 bg-white">
              <TouchableOpacity
                disabled={isUpdating || appointment.status === 'Rejected'}
                onPress={() => onUpdateStatus('Rejected')}
                className={`flex-1 py-3 rounded-xl items-center border-2 ${appointment.status === 'Rejected' ? 'border-slate-100 bg-slate-50' : 'border-rose-100 bg-white'}`}
              >
                <Text
                  className={`font-bold ${appointment.status === 'Rejected' ? 'text-slate-400' : 'text-rose-500'}`}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isUpdating || appointment.status === 'Approved'}
                onPress={() => onUpdateStatus('Approved')}
                className={`flex-1 py-3 rounded-xl items-center ${appointment.status === 'Approved' ? 'bg-emerald-100 border border-emerald-200' : 'bg-emerald-500'}`}
              >
                <Text
                  className={`font-bold ${appointment.status === 'Approved' ? 'text-emerald-700' : 'text-white'}`}
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
