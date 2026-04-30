import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ReminderInfoParsed } from '../../../types/screen.appointment.types';

//types
import { AppointmentDataItem,AppointmentDetailsModalProps } from '../../../types/patient.appointment.types';

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
      <View className="flex-1 bg-black/40">
        <SafeAreaView className="flex-1 bg-white rounded-t-3xl mt-auto">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">
              Appointment Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-5">
              <View>
                <Text className="text-xs text-slate-400 uppercase">
                  Dentist
                </Text>
                <Text className="text-lg font-bold text-slate-900 mt-1">
                  Dr. {dentist?.first_name} {dentist?.last_name}
                </Text>
                <Text className="text-sm text-slate-500 mt-1">
                  {dentist?.specialty || 'General Dentistry'}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-slate-400 uppercase">
                  Scheduled Service
                </Text>
                <Text className="text-lg font-bold text-slate-900 mt-1">
                  {appointment?.service_name || 'General Dentistry'}
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <Text className="text-xs font-semibold text-emerald-700">
                      {appointment?.status || 'Pending'}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <Text className="text-xs font-semibold text-blue-700">
                      {appointment?.appointment_type_id === 2
                        ? 'Family Visit'
                        : 'Normal Visit'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-6">
                <View>
                  <Text className="text-xs text-slate-400 uppercase">Date</Text>
                  <Text className="text-base font-bold text-slate-900 mt-1">
                    {dateParts.primary}
                  </Text>
                  {dateParts.year ? (
                    <Text className="text-sm text-slate-500">
                      {dateParts.year}
                    </Text>
                  ) : null}
                </View>
                <View>
                  <Text className="text-xs text-slate-400 uppercase">Time</Text>
                  <Text className="text-base font-bold text-slate-900 mt-1">
                    {schedule?.time_slot || 'TBD'}
                  </Text>
                  {dayLabel ? (
                    <Text className="text-sm text-slate-500">{dayLabel}</Text>
                  ) : null}
                </View>
              </View>

              <View>
                <Text className="text-xs text-slate-400 uppercase">
                  Reason for Visit
                </Text>
                <Text className="text-sm text-slate-700 mt-2">
                  {appointment?.message
                    ? `"${appointment.message}"`
                    : 'No additional notes.'}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-slate-400 uppercase">
                  Reminders
                </Text>
                {reminders.length === 0 ? (
                  <Text className="text-sm text-slate-500 mt-2">
                    No reminders set.
                  </Text>
                ) : (
                  reminders.map(reminder => (
                    <View
                      key={reminder.id}
                      className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <Text className="text-xs text-slate-400">
                        {reminder.date}
                      </Text>
                      {reminder.slots.map((slot, index) => (
                        <View key={`${reminder.id}-${index}`} className="mt-2">
                          <Text className="text-sm text-slate-700 font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          <Text className="text-xs text-slate-500">
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

          <View className="flex-row gap-3 px-5 py-4 border-t border-slate-100">
            <TouchableOpacity
              onPress={onEdit}
              className="flex-1 border border-slate-200 rounded-xl py-3 items-center"
            >
              <Text className="text-slate-700 font-semibold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="flex-1 bg-rose-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
