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
import {
  ScheduleItem,
  EditableAppointmentResponse,
  EditAppointmentModalProps,
} from '../../../types/patient.appointment.types';

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
      <View className="flex-1 bg-slate-900/60 justify-end">
        <SafeAreaView className="bg-white rounded-t-[32px] max-h-[95%] shadow-2xl">
          {/* Drag Handle Indicator */}
          <View className="items-center pt-3 pb-1">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-100">
            <Text className="text-xl font-extrabold text-slate-800 tracking-tight">
              Reschedule Visit
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text className="mt-4 text-slate-500 font-medium tracking-wide">
                Loading schedule...
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="space-y-7">
                {/* Dentist Info Card */}
                <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                  <View className="w-12 h-12 bg-sky-100 rounded-full items-center justify-center mr-4">
                    <Icon name="doctor" size={24} color="#0ea5e9" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Dentist
                    </Text>
                    <Text className="text-base font-bold text-slate-800">
                      Dr. {appointmentData?.dentist?.first_name}{' '}
                      {appointmentData?.dentist?.last_name}
                    </Text>
                    <Text className="text-sm font-medium text-slate-500">
                      {appointmentData?.dentist?.specialty || 'General Dentistry'}
                    </Text>
                  </View>
                </View>

                {/* Toggles Group */}
                <View className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 my-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-slate-700">
                      Emergency Visit
                    </Text>
                    <Switch
                      value={isEmergency}
                      onValueChange={setIsEmergency}
                      trackColor={{ true: '#0ea5e9', false: '#cbd5e1' }}
                    />
                  </View>
                  <View className="h-[1px] w-full bg-slate-100" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-slate-700">
                      Family Visit
                    </Text>
                    <Switch
                      value={isFamily}
                      onValueChange={setIsFamily}
                      trackColor={{ true: '#0ea5e9', false: '#cbd5e1' }}
                    />
                  </View>
                </View>

                {/* Available Slots Section */}
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Available Slots
                  </Text>
                  {Object.keys(scheduleMap).length === 0 ? (
                    <Text className="text-sm text-slate-500 mt-2 ml-1 italic">
                      No schedules available.
                    </Text>
                  ) : (
                    Object.entries(scheduleMap).map(([dayKey, slots]) => (
                      <View key={dayKey} className="mt-3">
                        <Text className="text-xs text-slate-500 uppercase font-bold ml-1">
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
                                activeOpacity={0.7}
                                className={`px-4 py-2.5 rounded-xl border ${
                                  active
                                    ? 'bg-sky-500 border-sky-500 shadow-sm'
                                    : isOriginal
                                    ? 'bg-sky-50 border-sky-200'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <Text
                                  className={`text-sm font-bold ${
                                    active
                                      ? 'text-white'
                                      : isOriginal
                                      ? 'text-sky-700'
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

                {/* Date Selection (Only shows if a schedule is selected) */}
                {selectedSchedule ? (
                  <View>
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center justify-between"
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base font-medium ${
                          date ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {date ? date.toLocaleDateString() : 'Pick a date...'}
                      </Text>
                      <Icon name="calendar" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Message Input */}
                <View>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Message (Optional)
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-base text-slate-900 font-medium"
                    placeholder="Add any additional notes..."
                    placeholderTextColor="#94a3b8"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                    style={{ minHeight: 100 }}
                  />
                </View>

                {/* Error Display */}
                {error ? (
                  <View className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <Text className="text-rose-600 text-sm font-semibold text-center">
                      {error}
                    </Text>
                  </View>
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

          {/* Bottom Action Buttons */}
          {!loading && (
            <View className="flex-row gap-3 px-6 py-5 border-t border-slate-100 bg-white">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-white border-2 border-slate-200 rounded-2xl py-4 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-slate-600 font-bold tracking-wide">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-sky-500 rounded-2xl py-4 items-center justify-center shadow-sm shadow-sky-500/30"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold tracking-wide text-base">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}