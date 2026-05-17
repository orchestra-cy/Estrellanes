import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ReminderInfoParsed } from '../../../types/screen.appointment.types';
import { SafeAreaView } from 'react-native-safe-area-context';
//types
import {
  AppointmentDataItem,
  AppointmentDetailsModalProps,
} from '../../../types/patient.appointment.types';

const parseReminderInfo = (raw?: string): ReminderInfoParsed[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDateParts = (value?: string) => {
  if (!value) return { primary: 'TBD', year: '' };
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return { primary: value, year: '' };
  }
  return {
    primary: dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    year: `${dateObj.getFullYear()}`,
  };
};

export default function AppointmentDetailsModal({
  visible,
  appointmentData,
  onClose,
  onEdit,
  onDelete,
}: AppointmentDetailsModalProps) {
  const appointment = appointmentData?.appointment;
  const dentist = appointmentData?.dentist;
  const schedule = appointmentData?.schedules?.[0];

  const dateValue = appointment?.user_set_date || appointment?.appointment_date;
  const dateParts = formatDateParts(dateValue);

  const dayLabel =
    schedule?.day_of_week ||
    (dateValue
      ? new Date(dateValue).toLocaleDateString('en-US', { weekday: 'long' })
      : '');

  const reminders = useMemo(
    () => parseReminderInfo(appointment?.reminder_info),
    [appointment?.reminder_info],
  );

  if (!visible || !appointmentData) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <SafeAreaView className="bg-white rounded-t-[32px] max-h-[90%] shadow-2xl">
          {/* Drag Handle Indicator */}
          <View className="items-center pt-3 pb-1">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-100">
            <Text className="text-xl font-extrabold text-slate-800 tracking-tight">
              Appointment Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-7">
              {/* Dentist Profile Card */}
              <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                <View className="w-14 h-14 bg-sky-100 rounded-full items-center justify-center mr-4">
                  <Icon name="doctor" size={28} color="#0ea5e9" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Dentist
                  </Text>
                  <Text className="text-lg font-bold text-slate-800">
                    Dr. {dentist?.first_name} {dentist?.last_name}
                  </Text>
                  <Text className="text-sm font-medium text-slate-500">
                    {dentist?.specialty || 'General Dentistry'}
                  </Text>
                </View>
              </View>

              {/* Service & Badges */}
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Scheduled Service
                </Text>
                <Text className="text-xl font-bold text-slate-800 ml-1">
                  {appointment?.service_name || 'General Dentistry'}
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-3 ml-1 m-2">
                  <View className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100">
                    <Text className="text-xs font-extrabold uppercase tracking-wider text-sky-600">
                      {appointment?.status || 'Pending'}
                    </Text>
                  </View>
                  <View className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                    <Text className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      {appointment?.appointment_type_id === 2
                        ? 'Family Visit'
                        : 'Normal Visit'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date and Time Split Cards */}
              <View className="flex-row gap-4">
                <View className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm my-2">
                  <Icon name="calendar-month" size={24} color="#0ea5e9" className="mb-2" />
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Date
                  </Text>
                  <Text className="text-base font-bold text-slate-800 mt-1">
                    {dateParts.primary}
                  </Text>
                  {dateParts.year ? (
                    <Text className="text-sm font-medium text-slate-500">
                      {dateParts.year}
                    </Text>
                  ) : null}
                </View>

                <View className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm my-2">
                  <Icon name="clock-time-four" size={24} color="#0ea5e9" className="mb-2" />
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Time
                  </Text>
                  <Text className="text-base font-bold text-slate-800 mt-1">
                    {schedule?.time_slot || 'TBD'}
                  </Text>
                  {dayLabel ? (
                    <Text className="text-sm font-medium text-slate-500">
                      {dayLabel}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Reason for Visit */}
              <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <View className="flex-row items-center mb-2">
                  <Icon name="text-box-outline" size={18} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">
                    Reason for Visit
                  </Text>
                </View>
                <Text className="text-sm text-slate-700 leading-5">
                  {appointment?.message
                    ? `"${appointment.message}"`
                    : 'No additional notes provided.'}
                </Text>
              </View>

              {/* Reminders Section */}
              <View>
                <View className="flex-row items-center mb-3 ml-1">
                  <Icon name="bell-outline" size={18} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">
                    Reminders
                  </Text>
                </View>
                {reminders.length === 0 ? (
                  <Text className="text-sm text-slate-500 ml-1 italic">
                    No reminders set.
                  </Text>
                ) : (
                  reminders.map(reminder => (
                    <View
                      key={reminder.id}
                      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <Text className="text-xs font-bold text-sky-600 mb-2">
                        {reminder.date}
                      </Text>
                      {reminder.slots.map((slot, index) => (
                        <View key={`${reminder.id}-${index}`} className="mt-1">
                          <Text className="text-sm text-slate-800 font-bold">
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {slot.message}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 px-6 py-5 border-t border-slate-100 bg-white">
            <TouchableOpacity
              onPress={onDelete}
              className="flex-1 bg-white border-2 border-rose-100 rounded-2xl py-4 items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-rose-500 font-bold tracking-wide">
                Cancel Visit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onEdit}
              className="flex-1 bg-sky-500 rounded-2xl py-4 items-center justify-center shadow-sm shadow-sky-500/30"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold tracking-wide text-base">
                Edit Details
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}