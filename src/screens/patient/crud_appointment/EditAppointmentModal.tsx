import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fetchEditableAppointment,
  updateAppointment,
} from '../../../app/api/patient';


//types
import { ScheduleItem,EditableAppointmentResponse,EditAppointmentModalProps } from '../../../types/patient.appointment.types';


const buildScheduleMap = (
  schedules?: Record<string, ScheduleItem[]> | ScheduleItem[],
): Record<string, ScheduleItem[]> => {
  if (!schedules) return {};
  if (Array.isArray(schedules)) {
    return schedules.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
      const day = item.day_of_week;
      if (!day) return acc;
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
  }
  return schedules;
};

const getDayIndex = (day: string) => {
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[day] ?? -1;
};

export default function EditAppointmentModal({
  visible,
  appointmentId,
  onClose,
  onSuccess,
}: EditAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentData, setAppointmentData] =
    useState<EditableAppointmentResponse | null>(null);

  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [originalSchedule, setOriginalSchedule] = useState<string>('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isFamily, setIsFamily] = useState(false);
  const [message, setMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scheduleMap = useMemo(
    () => buildScheduleMap(appointmentData?.schedules),
    [appointmentData?.schedules],
  );

  useEffect(() => {
    if (!visible || !appointmentId) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = (await fetchEditableAppointment(
          appointmentId,
        )) as EditableAppointmentResponse;
        setAppointmentData(response);

        const userDate = response?.appointment?.user_set_date;
        setDate(userDate ? new Date(userDate) : null);
        setDay(response?.appointment?.day_of_week || '');
        setIsEmergency(response?.appointment?.emergency === 1);
        setIsFamily(response?.appointment?.appointment_type_id === 2);
        setMessage(response?.appointment?.message || '');

        const scheduleId = response?.scheduleDetails?.id;
        if (scheduleId) {
          const scheduleString = String(scheduleId);
          setSelectedSchedule(scheduleString);
          setOriginalSchedule(scheduleString);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible, appointmentId]);

  const handleDateChange = (_: unknown, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    if (day) {
      const dayIndex = getDayIndex(day);
      if (dayIndex !== -1 && selected.getDay() !== dayIndex) {
        setError('Selected date does not match the chosen day.');
        return;
      }
    }
    setError('');
    setDate(selected);
  };

  const handleSave = async () => {
    if (!appointmentId || !selectedSchedule || !date) {
      setError('Please select a schedule and date.');
      return;
    }

    try {
      await updateAppointment({
        appointmentID: appointmentId,
        scheduleID: selectedSchedule,
        date: date.toLocaleDateString('en-CA'),
        isEmergency,
        isFamilyBooking: isFamily,
        message: message.trim(),
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Failed to update appointment.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40">
        <SafeAreaView className="flex-1 bg-white rounded-t-3xl mt-auto">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">
              Reschedule Appointment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-3 text-slate-500">Loading...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="space-y-5">
                <View>
                  <Text className="text-xs text-slate-400 uppercase">
                    Dentist
                  </Text>
                  <Text className="text-base font-semibold text-slate-900 mt-1">
                    Dr. {appointmentData?.dentist?.first_name}{' '}
                    {appointmentData?.dentist?.last_name}
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {appointmentData?.dentist?.specialty || 'General Dentistry'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-slate-900">
                    Emergency
                  </Text>
                  <Switch value={isEmergency} onValueChange={setIsEmergency} />
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-slate-900">
                    Family Visit
                  </Text>
                  <Switch value={isFamily} onValueChange={setIsFamily} />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-900">
                    Available Slots
                  </Text>
                  {Object.keys(scheduleMap).length === 0 ? (
                    <Text className="text-sm text-slate-500 mt-2">
                      No schedules available.
                    </Text>
                  ) : (
                    Object.entries(scheduleMap).map(([dayKey, slots]) => (
                      <View key={dayKey} className="mt-3">
                        <Text className="text-xs text-slate-400 uppercase font-semibold">
                          {dayKey}
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mt-2">
                          {slots.map((slot, index) => {
                            const slotId = String(slot.id ?? `${dayKey}-${index}`);
                            const active = selectedSchedule === slotId;
                            const isOriginal = originalSchedule === slotId;
                            return (
                              <TouchableOpacity
                                key={slotId}
                                onPress={() => {
                                  setSelectedSchedule(slotId);
                                  setDay(dayKey);
                                  setDate(null);
                                  setError('');
                                }}
                                className={`px-3 py-1.5 rounded-lg border ${
                                  active
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : isOriginal
                                      ? 'bg-indigo-50 border-indigo-200'
                                      : 'bg-white border-slate-200'
                                }`}
                              >
                                <Text
                                  className={`text-xs font-semibold ${
                                    active
                                      ? 'text-white'
                                      : isOriginal
                                        ? 'text-indigo-700'
                                        : 'text-slate-600'
                                  }`}
                                >
                                  {slot.time_slot || 'TBD'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {selectedSchedule ? (
                  <View>
                    <Text className="text-xs text-slate-400 uppercase font-semibold">
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="border border-slate-200 rounded-xl px-3 py-3 mt-2"
                    >
                      <Text className="text-slate-900">
                        {date
                          ? date.toLocaleDateString()
                          : 'Pick a date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View>
                  <Text className="text-sm font-semibold text-slate-900">
                    Message (optional)
                  </Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3 py-2 text-slate-900 mt-2"
                    placeholder="Additional notes..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                  />
                </View>

                {error ? (
                  <Text className="text-rose-600 text-sm">{error}</Text>
                ) : null}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </ScrollView>
          )}

          {!loading && (
            <View className="flex-row gap-3 px-5 py-4 border-t border-slate-100">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 border border-slate-200 rounded-xl py-3 items-center"
              >
                <Text className="text-slate-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-indigo-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
