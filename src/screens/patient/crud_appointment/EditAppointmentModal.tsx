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
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fetchEditableAppointment,
  updateAppointment,
} from '../../../app/api/patient';
import { showInfo } from '../../../components/alert_message';

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

    // Prevent duplicate submissions
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await updateAppointment({
        appointmentID: appointmentId,
        scheduleID: selectedSchedule,
        date: date.toLocaleDateString('en-CA'),
        isEmergency,
        isFamilyBooking: isFamily,
        message: message.trim(),
      });

      showInfo({
        title: 'Appointment Updated',
        message: 'Your appointment has been updated successfully.',
        type: 'info',
        position: 'top',
        visibilityTime: 3000,
      });

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Failed to update appointment.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end relative">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <SafeAreaView className="bg-white rounded-t-[36px] max-h-[95%]">
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-slate-50">
            <Text className="text-2xl font-black text-slate-800 tracking-tight">
              Reschedule Visit
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
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
              <View className="space-y-6">
                <View className="bg-white p-4 rounded-[24px] flex-row items-center border border-slate-100">
                  <View className="w-14 h-14 bg-sky-50 rounded-full items-center justify-center mr-4 border border-sky-100">
                    <Icon name="doctor" size={28} color="#0ea5e9" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Attending Dentist
                    </Text>
                    <Text className="text-lg font-bold text-slate-800">
                      Dr. {appointmentData?.dentist?.first_name}{' '}
                      {appointmentData?.dentist?.last_name}
                    </Text>
                    <Text className="text-sm font-medium text-slate-500">
                      {appointmentData?.dentist?.specialty ||
                        'General Dentistry'}
                    </Text>
                  </View>
                </View>

                <View className="bg-white border border-slate-100 rounded-[24px] p-5 space-y-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-rose-50 rounded-full items-center justify-center mr-3">
                        <Icon
                          name="alert-plus-outline"
                          size={16}
                          color="#f43f5e"
                        />
                      </View>
                      <Text className="text-sm font-bold text-slate-700">
                        Emergency Visit
                      </Text>
                    </View>
                    <Switch
                      value={isEmergency}
                      onValueChange={setIsEmergency}
                      trackColor={{ true: '#0ea5e9', false: '#f1f5f9' }}
                      thumbColor={
                        Platform.OS === 'android' ? '#fff' : undefined
                      }
                    />
                  </View>

                  <View className="h-[1px] w-full bg-slate-50" />

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                        <Icon
                          name="account-group-outline"
                          size={16}
                          color="#6366f1"
                        />
                      </View>
                      <Text className="text-sm font-bold text-slate-700">
                        Family Visit
                      </Text>
                    </View>
                    <Switch
                      value={isFamily}
                      onValueChange={setIsFamily}
                      trackColor={{ true: '#0ea5e9', false: '#f1f5f9' }}
                      thumbColor={
                        Platform.OS === 'android' ? '#fff' : undefined
                      }
                    />
                  </View>
                </View>

                <View className="pt-2">
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Available Time Slots
                  </Text>
                  {Object.keys(scheduleMap).length === 0 ? (
                    <Text className="text-sm text-slate-500 mt-2 ml-1 italic font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      No schedules available.
                    </Text>
                  ) : (
                    Object.entries(scheduleMap).map(([dayKey, slots]) => (
                      <View key={dayKey} className="mt-3">
                        <Text className="text-xs text-slate-800 uppercase font-bold ml-1 mb-2">
                          {dayKey}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {slots.map((slot, index) => {
                            const slotId = String(
                              slot.id ?? `${dayKey}-${index}`,
                            );
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
                                className={`px-4 py-3 rounded-2xl border ${
                                  active
                                    ? 'bg-sky-500 border-sky-500'
                                    : isOriginal
                                      ? 'bg-sky-50 border-sky-100'
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
                                  {String(slot.time_slot || 'TBD')}
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
                  <View className="pt-2">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                      Select Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="bg-white border border-slate-200 rounded-[20px] px-5 py-4 flex-row items-center justify-between"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <View className="mr-3">
                          <Icon
                            name="calendar-month-outline"
                            size={20}
                            color={date ? '#0ea5e9' : '#94a3b8'}
                          />
                        </View>
                        <Text
                          className={`text-base font-semibold ${
                            date ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {date
                            ? date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Pick an available date...'}
                        </Text>
                      </View>
                      <Icon name="chevron-down" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View className="pt-2">
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Reason / Notes (Optional)
                  </Text>
                  <TextInput
                    className="bg-white border border-slate-200 rounded-[20px] px-5 py-4 text-base text-slate-900 font-medium min-h-[110px]"
                    placeholder="Add any specific concerns..."
                    placeholderTextColor="#94a3b8"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                {error ? (
                  <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex-row items-center">
                    <View className="mr-2">
                      <Icon
                        name="alert-circle-outline"
                        size={20}
                        color="#e11d48"
                      />
                    </View>
                    <Text className="text-rose-600 text-sm font-bold flex-1">
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

          {!loading && (
            <View className="flex-row gap-3 px-6 py-5 border-t border-slate-50 bg-white rounded-b-[36px]">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-white border-2 border-slate-100 rounded-[20px] py-4 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-slate-500 font-bold tracking-wide text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`flex-[1.5] rounded-[20px] py-4 items-center justify-center ${loading ? 'bg-sky-300' : 'bg-sky-500'}`}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold tracking-wide text-sm">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
