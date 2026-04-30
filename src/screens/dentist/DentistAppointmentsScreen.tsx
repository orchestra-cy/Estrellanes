import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
// api
import {
  fetchDentistAppointments,
  updateDentistAppointmentStatus,
  saveReminder,
  getReminder,
  updateReminder,
} from '../../app/api/dentist';

// types
import type {
  DentistAppointmentItem,
  ReminderDay,
} from '../../types/dentist.types'
import { AppointmentResponseItem, AppointmentResponse } from '../../types/dentist.appointment.types';
import { ReminderSlot } from '../../types/reminder';


const formatName = (first?: string, last?: string) => {
  const full = `${first || ''} ${last || ''}`.trim();
  return full || 'Unknown Patient';
};

export default function DentistAppointmentsScreen() {
  const [appointments, setAppointments] = useState<DentistAppointmentItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<DentistAppointmentItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderError, setReminderError] = useState('');
  const [savingReminder, setSavingReminder] = useState(false);
  const [editableReminders, setEditableReminders] = useState<ReminderDay[]>([]);
  const [hasExistingReminders, setHasExistingReminders] = useState(false);
  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    mode: 'date' | 'time';
    dayId: string;
    slotIndex?: number;
    field?: 'startTime' | 'endTime';
  }>({
    visible: false,
    mode: 'date',
    dayId: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = (await fetchDentistAppointments()) as AppointmentResponse;
      if (data?.status === 'ok' && Array.isArray(data.appointments)) {
        const formatted = data.appointments.map(item => {
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
    } catch (e) {
      console.error(e);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetReminderForm = () => {
    setReminderError('');
  };

  const createEmptyReminderDay = (): ReminderDay => ({
    id: `${Date.now()}-${Math.random()}`,
    date: '',
    slots: [{ startTime: '', endTime: '', message: '' }],
  });

  const parseDate = (value: string) => {
    if (!value) return new Date();
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
  };

  const parseTime = (value: string) => {
    const date = new Date();
    if (!value) return date;
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return date;
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatDate = (value: Date | null) => {
    if (!value) return '';
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (value: Date | null) => {
    if (!value) return '';
    const hours = `${value.getHours()}`.padStart(2, '0');
    const minutes = `${value.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseReminderResponse = (response: unknown): ReminderDay[] => {
    const data = (response as { data?: ReminderDay[] })?.data;
    if (!Array.isArray(data)) return [];
    return data.map(day => ({
      id: String(day.id || Date.now()),
      date: day.date || '',
      slots: Array.isArray(day.slots)
        ? day.slots.map((slot: ReminderSlot) => ({
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            message: slot.message || '',
          }))
        : [],
    }));
  };

  const updateDayDate = (dayId: string, date: string) => {
    setEditableReminders(prev =>
      prev.map(day => (day.id === dayId ? { ...day, date } : day)),
    );
  };

  const updateSlot = (
    dayId: string,
    slotIndex: number,
    field: 'startTime' | 'endTime' | 'message',
    value: string,
  ) => {
    setEditableReminders(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const slots = day.slots.map((slot: ReminderSlot, index:number) =>
          index === slotIndex ? { ...slot, [field]: value } : slot,
        );
        return { ...day, slots };
      }),
    );
  };

  const addDay = () => {
    setEditableReminders(prev => [...prev, createEmptyReminderDay()]);
  };

  const removeDay = (dayId: string) => {
    setEditableReminders(prev => prev.filter(day => day.id !== dayId));
  };

  const addSlot = (dayId: string) => {
    setEditableReminders(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
              ...day,
              slots: [
                ...day.slots,
                { startTime: '', endTime: '', message: '' },
              ],
            }
          : day,
      ),
    );
  };

  const removeSlot = (dayId: string, slotIndex: number) => {
    setEditableReminders(prev =>
      prev.map(day => {
        if (day.id !== dayId) return day;
        const slots = day.slots.filter((_:ReminderSlot, index:number) => index !== slotIndex);
        return { ...day, slots };
      }),
    );
  };

  const validateReminders = () => {
    if (!editableReminders.length) return 'Add at least one reminder.';
    for (const day of editableReminders) {
      if (!day.date) return 'Please select a date for each reminder.';
      if (!day.slots.length) return 'Add at least one time slot.';
      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime || !slot.message) {
          return 'Please complete all reminder fields.';
        }
      }
    }
    return '';
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await updateDentistAppointmentStatus(selected.id, status);
      if (res?.status === 'success' || res?.status === 'ok') {
        setAppointments(prev =>
          prev.map(appt =>
            appt.id === selected.id ? { ...appt, status } : appt,
          ),
        );
        setSelected(prev => (prev ? { ...prev, status } : prev));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const openReminder = async () => {
    resetReminderForm();
    setReminderOpen(true);

    if (!selected) return;
    try {
      const response = await getReminder(selected.id);
      const reminders = parseReminderResponse(response);
      setEditableReminders(
        reminders.length ? reminders : [createEmptyReminderDay()],
      );
      setHasExistingReminders(reminders.length > 0);
    } catch (e) {
      console.error(e);
      setEditableReminders([createEmptyReminderDay()]);
      setHasExistingReminders(false);
    }
  };

  const handleSaveReminder = async () => {
    if (!selected) return;
    const error = validateReminders();
    if (error) {
      setReminderError(error);
      return;
    }

    setSavingReminder(true);
    setReminderError('');
    try {
      const response = hasExistingReminders
        ? await updateReminder(selected.id, editableReminders)
        : await saveReminder(editableReminders, selected.id);

      if (response?.status === 'success' || response?.status === 'ok') {
        setReminderOpen(false);
      } else {
        setReminderError('Failed to save reminder.');
      }
    } catch (e) {
      console.error(e);
      setReminderError('Failed to save reminder.');
    } finally {
      setSavingReminder(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading appointments...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <View className="bg-red-50 p-4 rounded-full mb-4">
          <Icon name="alert" size={32} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-slate-900 mb-2">
          Unable to load appointments
        </Text>
        <Text className="text-slate-500 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-slate-900 py-3 px-6 rounded-xl"
          onPress={load}
        >
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-slate-900">
          Dentist Appointments
        </Text>
        <TouchableOpacity onPress={load}>
          <Text className="text-sm text-indigo-600 font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 mx-5 mb-5 bg-white rounded-3xl border border-dashed border-slate-200">
          <View className="w-20 h-20 rounded-full bg-slate-50 justify-center items-center mb-4">
            <Icon name="calendar-blank" size={40} color="#94A3B8" />
          </View>
          <Text className="text-lg font-semibold text-slate-900 mb-2">
            No appointments scheduled
          </Text>
          <Text className="text-sm text-slate-400 text-center mb-6">
            Patient bookings will show up here once they are confirmed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelected(item)}
              className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-100"
              activeOpacity={0.8}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-bold text-slate-900 mb-1">
                    {item.patient_name}
                  </Text>
                  <Text className="text-sm text-slate-500 mb-2">
                    {item.service_name || 'General Dentistry'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Icon name="calendar" size={16} color="#4F46E5" />
                    <Text className="text-sm text-slate-700 font-medium">
                      {item.date || 'TBD'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <View className="px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
                    <Text className="text-xs font-bold text-indigo-700">
                      {item.status}
                    </Text>
                  </View>
                  {item.emergency ? (
                    <View className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100">
                      <Text className="text-[10px] font-bold text-rose-600">
                        Emergency
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            <View className="flex-row justify-between items-start">
              <Text className="text-xl font-bold text-slate-900">
                Appointment Details
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Icon name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selected && (
              <View className="mt-4">
                <Text className="text-xs text-slate-400">#{selected.id}</Text>

                <View className="mt-4">
                  <Text className="text-sm font-semibold text-slate-900">
                    Patient Information
                  </Text>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">Full Name</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.patient_name}
                    </Text>
                  </View>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">Phone Number</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.phone || 'Not provided'}
                    </Text>
                  </View>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">
                      Email Address
                    </Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.email || 'Not provided'}
                    </Text>
                  </View>
                </View>

                <View className="mt-5">
                  <Text className="text-sm font-semibold text-slate-900">
                    Session Details
                  </Text>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">Date</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.date || 'TBD'}
                    </Text>
                    {selected.day_of_week ? (
                      <Text className="text-xs text-slate-400">
                        {selected.day_of_week}
                      </Text>
                    ) : null}
                  </View>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">Time Slot</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.time_slot || 'TBD'}
                    </Text>
                  </View>
                  <View className="mt-3">
                    <Text className="text-xs text-slate-400">Service</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selected.service_name || 'General Dentistry'}
                    </Text>
                  </View>
                </View>

                <View className="mt-5 flex-row flex-wrap gap-2">
                  <View className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <Text className="text-xs font-semibold text-blue-700">
                      {selected.appointment_type_id === 2
                        ? 'Family Type'
                        : 'Normal Type'}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <Text className="text-xs font-semibold text-emerald-700">
                      {selected.status}
                    </Text>
                  </View>
                </View>

                {selected.message ? (
                  <View className="mt-4">
                    <Text className="text-sm font-semibold text-slate-900">
                      Message
                    </Text>
                    <Text className="text-sm text-slate-700 mt-2">
                      {selected.message}
                    </Text>
                  </View>
                ) : null}

                {selected.status === 'Approved' ? (
                  <TouchableOpacity
                    onPress={openReminder}
                    className="mt-4 py-3 rounded-xl items-center bg-blue-50 border border-blue-100"
                  >
                    <Text className="text-blue-700 font-semibold">
                      Add Reminder
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    disabled={updating || selected.status === 'Approved'}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      selected.status === 'Approved'
                        ? 'bg-slate-100'
                        : 'bg-emerald-600'
                    }`}
                    onPress={() => handleStatusUpdate('Approved')}
                  >
                    {updating && selected.status !== 'Approved' ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold">Approve</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={updating || selected.status === 'Rejected'}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      selected.status === 'Rejected'
                        ? 'bg-slate-100 border-slate-200'
                        : 'border-rose-200'
                    }`}
                    onPress={() => handleStatusUpdate('Rejected')}
                  >
                    {updating && selected.status !== 'Rejected' ? (
                      <ActivityIndicator color="#E11D48" />
                    ) : (
                      <Text className="text-rose-600 font-semibold">
                        Reject
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={reminderOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReminderOpen(false)}
      >
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            <View className="flex-row justify-between items-start">
              <Text className="text-xl font-bold text-slate-900">
                Create Reminder
              </Text>
              <TouchableOpacity onPress={() => setReminderOpen(false)}>
                <Icon name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-slate-900">
                  Reminders
                </Text>
                <TouchableOpacity
                  onPress={addDay}
                  className="px-3 py-1 rounded-full bg-slate-100"
                >
                  <Text className="text-xs text-slate-600">Add Day</Text>
                </TouchableOpacity>
              </View>

              {editableReminders.length === 0 ? (
                <View className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4">
                  <Text className="text-sm text-slate-500">
                    No reminders yet.
                  </Text>
                </View>
              ) : (
                editableReminders.map(day => (
                  <View
                    key={day.id}
                    className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-slate-400">Date</Text>
                      <TouchableOpacity onPress={() => removeDay(day.id)}>
                        <Icon name="close" size={18} color="#E11D48" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setPickerState({
                          visible: true,
                          mode: 'date',
                          dayId: day.id,
                        })
                      }
                      className="border border-slate-200 rounded-xl px-3 py-3 mt-2 bg-white"
                    >
                      <Text className="text-slate-900">
                        {day.date || 'Select date'}
                      </Text>
                    </TouchableOpacity>

                    {day.slots.map((slot: ReminderSlot, slotIndex:number) => (
                      <View key={`${day.id}-${slotIndex}`} className="mt-4">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-slate-400">
                            Time Slot
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeSlot(day.id, slotIndex)}
                          >
                            <Icon name="close" size={18} color="#E11D48" />
                          </TouchableOpacity>
                        </View>
                        <View className="flex-row gap-3 mt-2">
                          <TouchableOpacity
                            onPress={() =>
                              setPickerState({
                                visible: true,
                                mode: 'time',
                                dayId: day.id,
                                slotIndex,
                                field: 'startTime',
                              })
                            }
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-3 bg-white"
                          >
                            <Text className="text-slate-900">
                              {slot.startTime || 'Start'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              setPickerState({
                                visible: true,
                                mode: 'time',
                                dayId: day.id,
                                slotIndex,
                                field: 'endTime',
                              })
                            }
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-3 bg-white"
                          >
                            <Text className="text-slate-900">
                              {slot.endTime || 'End'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View className="mt-3">
                          <Text className="text-xs text-slate-400">
                            Message
                          </Text>
                          <TextInput
                            className="border border-slate-200 rounded-xl px-3 py-2 mt-2 text-slate-900 bg-white"
                            value={slot.message}
                            onChangeText={value =>
                              updateSlot(day.id, slotIndex, 'message', value)
                            }
                            placeholder="Reminder message..."
                            multiline
                          />
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={() => addSlot(day.id)}
                      className="mt-3 p-3 rounded-xl border border-dashed border-slate-200 items-center"
                    >
                      <Text className="text-sm text-slate-500">Add Slot</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {reminderError ? (
                <Text className="text-rose-600 text-sm mt-3">
                  {reminderError}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleSaveReminder}
                disabled={savingReminder}
                className="mt-5 bg-slate-900 rounded-xl p-4 items-center"
              >
                {savingReminder ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    Save Reminder
                  </Text>
                )}
              </TouchableOpacity>

              {pickerState.visible ? (
                <DateTimePicker
                  value={
                    pickerState.mode === 'date'
                      ? parseDate(
                          editableReminders.find(
                            day => day.id === pickerState.dayId,
                          )?.date || '',
                        )
                      : parseTime(
                          editableReminders.find(
                            day => day.id === pickerState.dayId,
                          )?.slots[pickerState.slotIndex || 0]?.[
                            pickerState.field || 'startTime'
                          ] || '',
                        )
                  }
                  mode={pickerState.mode}
                  display={
                    pickerState.mode === 'date'
                      ? Platform.OS === 'ios'
                        ? 'inline'
                        : 'default'
                      : Platform.OS === 'ios'
                        ? 'spinner'
                        : 'default'
                  }
                  onChange={(_, date) => {
                    setPickerState(prev => ({ ...prev, visible: false }));
                    if (!date) return;
                    if (pickerState.mode === 'date') {
                      updateDayDate(pickerState.dayId, formatDate(date));
                      return;
                    }
                    if (
                      pickerState.field &&
                      pickerState.slotIndex !== undefined
                    ) {
                      updateSlot(
                        pickerState.dayId,
                        pickerState.slotIndex,
                        pickerState.field,
                        formatTime(date),
                      );
                    }
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
