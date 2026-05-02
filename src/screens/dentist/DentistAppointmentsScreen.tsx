import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  fetchDentistAppointments,
  updateDentistAppointmentStatus,
  saveReminder,
  getReminder,
  updateReminder,
} from '../../app/api/dentist';

import type { DentistAppointmentItem, ReminderDay } from '../../types/dentist.types';
import { AppointmentResponse } from '../../types/dentist.appointment.types';
import { ReminderSlot } from '../../types/reminder';

const formatName = (first?: string, last?: string) => {
  const full = `${first || ''} ${last || ''}`.trim();
  return full || 'Unknown Patient';
};

export default function DentistAppointmentsScreen() {
  const [appointments, setAppointments] = useState<DentistAppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
  }>({ visible: false, mode: 'date', dayId: '' });

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = (await fetchDentistAppointments()) as AppointmentResponse;
      if (data?.status === 'ok' && Array.isArray(data.appointments)) {
        const formatted = data.appointments.map(item => {
          const appt = item.appointment || {};
          const patient = item.patient || {};
          const schedule = item.schedule || (Array.isArray(item.schedules) ? item.schedules[0] : {});
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
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const createEmptyReminderDay = (): ReminderDay => ({ id: `${Date.now()}-${Math.random()}`, date: '', slots: [{ startTime: '', endTime: '', message: '' }] });
  const parseDate = (v: string) => v ? new Date(v.split('-').map(Number)[0], v.split('-').map(Number)[1] - 1, v.split('-').map(Number)[2]) : new Date();
  const formatDate = (v: Date | null) => v ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}` : '';
  const formatTime = (v: Date | null) => v ? `${String(v.getHours()).padStart(2, '0')}:${String(v.getMinutes()).padStart(2, '0')}` : '';

  const updateDayDate = (dayId: string, date: string) => setEditableReminders(prev => prev.map(d => d.id === dayId ? { ...d, date } : d));
  const addDay = () => setEditableReminders(prev => [...prev, createEmptyReminderDay()]);
  const removeDay = (id: string) => setEditableReminders(prev => prev.filter(d => d.id !== id));
  const addSlot = (dayId: string) => setEditableReminders(prev => prev.map(d => d.id === dayId ? { ...d, slots: [...d.slots, { startTime: '', endTime: '', message: '' }] } : d));
  const updateSlot = (dayId: string, idx: number, field: string, val: string) => setEditableReminders(prev => prev.map(d => d.id === dayId ? { ...d, slots: d.slots.map((s, i) => i === idx ? { ...s, [field]: val } : s) } : d));
  const removeSlot = (dayId: string, idx: number) => setEditableReminders(prev => prev.map(d => d.id === dayId ? { ...d, slots: d.slots.filter((_, i) => i !== idx) } : d));

  const validateReminders = () => {
    if (!editableReminders.length) return 'Add at least one reminder.';
    for (const day of editableReminders) {
      if (!day.date) return 'Please select a date for each reminder.';
      if (!day.slots.length) return 'Add at least one time slot.';
      for (const slot of day.slots) if (!slot.startTime || !slot.endTime || !slot.message) return 'Complete all reminder fields.';
    }
    return '';
  };

  const parseReminderResponse = (response: unknown): ReminderDay[] => {
    const data = (response as { data?: ReminderDay[] })?.data;
    if (!Array.isArray(data)) return [];
    return data.map(day => ({
      id: String(day.id || Date.now()),
      date: day.date || '',
      slots: Array.isArray(day.slots) ? day.slots.map((slot: ReminderSlot) => ({ startTime: slot.startTime || '', endTime: slot.endTime || '', message: slot.message || '' })) : [],
    }));
  };

  const openReminder = async () => {
    setReminderError('');
    setReminderOpen(true);
    if (!selected) return;
    try {
      const response = await getReminder(selected.id);
      const reminders = parseReminderResponse(response);
      setEditableReminders(reminders.length ? reminders : [createEmptyReminderDay()]);
      setHasExistingReminders(reminders.length > 0);
    } catch (e) {
      setEditableReminders([createEmptyReminderDay()]);
      setHasExistingReminders(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await updateDentistAppointmentStatus(selected.id, status);
      if (res?.status === 'success' || res?.status === 'ok') {
        setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, status } : a));
        setSelected(prev => (prev ? { ...prev, status } : prev));
      }
    } finally { setUpdating(false); }
  };

  const handleSaveReminder = async () => {
    if (!selected) return;
    const err = validateReminders();
    if (err) return setReminderError(err);
    setSavingReminder(true);
    setReminderError('');
    try {
      const response = hasExistingReminders ? await updateReminder(selected.id, editableReminders) : await saveReminder(editableReminders, selected.id);
      if (response?.status === 'success' || response?.status === 'ok') setReminderOpen(false);
    } finally { setSavingReminder(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-amber-50 border-amber-100 text-amber-700';
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
        <Text className="text-2xl font-extrabold text-slate-800">Appointments</Text>
        <TouchableOpacity onPress={() => load(true)} className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
          <Icon name="refresh" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {appointments.length === 0 ? (
          <View className="mt-10 items-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Icon name="calendar-blank-outline" size={32} color="#94a3b8" />
            <Text className="text-slate-500 mt-2 font-medium">No appointments pending.</Text>
          </View>
        ) : (
          appointments.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelected(item)}
              className="bg-white p-3.5 rounded-xl mb-2.5 shadow-sm border border-slate-100 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{item.patient_name}</Text>
                  {item.emergency && (
                    <View className="ml-2 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100">
                      <Text className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Urgent</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[11px] text-slate-500 mb-2">{item.service_name || 'General Dentistry'}</Text>
                <View className="flex-row items-center bg-slate-50 self-start px-2 py-1 rounded border border-slate-100">
                  <Icon name="calendar-clock-outline" size={12} color="#0ea5e9" />
                  <Text className="text-[10px] text-slate-600 font-bold ml-1.5">{item.date} • {item.time_slot}</Text>
                </View>
              </View>
              <View className="items-end justify-between py-0.5">
                <View className={`px-2 py-1 rounded border ${getStatusColor(item.status)}`}>
                  <Text className="text-[9px] font-extrabold uppercase">{item.status}</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#94a3b8" style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Appointment Details Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <SafeAreaView className="bg-white rounded-t-3xl max-h-[85%] flex-shrink">
            <View className="items-center py-3"><View className="w-12 h-1.5 bg-slate-200 rounded-full" /></View>
            <View className="flex-row justify-between items-center px-5 pb-3 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">Appointment Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView className="shrink" contentContainerStyle={{ padding: 20 }}>
              {selected && (
                <View className="space-y-4">
                  <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Patient Info</Text>
                    <Text className="text-sm font-bold text-slate-800 mb-1">{selected.patient_name}</Text>
                    <Text className="text-[11px] text-slate-500">Phone: {selected.phone || 'N/A'}</Text>
                    <Text className="text-[11px] text-slate-500">Email: {selected.email || 'N/A'}</Text>
                  </View>

                  <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Session</Text>
                    <Text className="text-sm font-bold text-slate-800 mb-1">{selected.service_name}</Text>
                    <Text className="text-xs text-slate-600">{selected.date} • {selected.time_slot}</Text>
                    {selected.message && (
                       <Text className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
                         "{selected.message}"
                       </Text>
                    )}
                  </View>

                  {selected.status === 'Approved' && (
                    <TouchableOpacity onPress={openReminder} className="mt-2 py-3 rounded-xl flex-row items-center justify-center bg-white border border-slate-200 shadow-sm">
                      <Icon name="bell-ring-outline" size={16} color="#64748b" className="mr-2" />
                      <Text className="text-slate-600 font-bold">Manage Reminders</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>

            {selected && (
              <View className="flex-row gap-2 px-5 py-3 border-t border-slate-100 bg-white">
                <TouchableOpacity
                  disabled={updating || selected.status === 'Rejected'}
                  onPress={() => handleStatusUpdate('Rejected')}
                  className={`flex-1 py-3 rounded-xl items-center border-2 ${selected.status === 'Rejected' ? 'border-slate-100 bg-slate-50' : 'border-rose-100 bg-white'}`}
                >
                  <Text className={`font-bold ${selected.status === 'Rejected' ? 'text-slate-400' : 'text-rose-500'}`}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={updating || selected.status === 'Approved'}
                  onPress={() => handleStatusUpdate('Approved')}
                  className={`flex-1 py-3 rounded-xl items-center ${selected.status === 'Approved' ? 'bg-emerald-100 border border-emerald-200' : 'bg-emerald-500'}`}
                >
                  <Text className={`font-bold ${selected.status === 'Approved' ? 'text-emerald-700' : 'text-white'}`}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Reminder Modal */}
      <Modal visible={reminderOpen} transparent animationType="slide" onRequestClose={() => setReminderOpen(false)}>
        <View className="flex-1 bg-slate-900/60 justify-end">
          <SafeAreaView className="bg-white rounded-t-3xl max-h-[85%] flex-shrink">
            <View className="items-center py-3"><View className="w-12 h-1.5 bg-slate-200 rounded-full" /></View>
            <View className="flex-row justify-between items-center px-5 pb-3 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">Setup Reminders</Text>
              <TouchableOpacity onPress={() => setReminderOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView className="shrink" contentContainerStyle={{ padding: 20 }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xs font-bold text-slate-500 uppercase">Scheduled Days</Text>
                <TouchableOpacity onPress={addDay} className="px-3 py-1.5 rounded-lg bg-sky-50 flex-row items-center border border-sky-100">
                  <Icon name="plus" size={14} color="#0ea5e9" className="mr-1" />
                  <Text className="text-[10px] font-bold text-sky-700 uppercase">Add Day</Text>
                </TouchableOpacity>
              </View>

              {editableReminders.map((day, dayIndex) => (
                <View key={day.id} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-bold">Day {dayIndex + 1}</Text>
                    <TouchableOpacity onPress={() => removeDay(day.id)} className="p-1"><Icon name="trash-can-outline" size={16} color="#e11d48" /></TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => setPickerState({ visible: true, mode: 'date', dayId: day.id })} className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 flex-row justify-between mb-3">
                    <Text className={day.date ? 'text-slate-900' : 'text-slate-400'}>{day.date || 'Pick a date...'}</Text>
                    <Icon name="calendar" size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  <View className="border-t border-slate-100 pt-3">
                    {day.slots.map((slot, slotIndex) => (
                      <View key={slotIndex} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <View className="flex-row justify-between mb-2">
                           <Text className="text-[10px] font-bold text-sky-500 uppercase">Slot {slotIndex + 1}</Text>
                           <TouchableOpacity onPress={() => removeSlot(day.id, slotIndex)}><Icon name="close" size={14} color="#94a3b8" /></TouchableOpacity>
                         </View>
                         <View className="flex-row gap-2 mb-2">
                           <TouchableOpacity onPress={() => setPickerState({ visible: true, mode: 'time', dayId: day.id, slotIndex, field: 'startTime' })} className="flex-1 bg-white border border-slate-200 rounded p-2 items-center">
                             <Text className="text-xs">{slot.startTime || 'Start'}</Text>
                           </TouchableOpacity>
                           <TouchableOpacity onPress={() => setPickerState({ visible: true, mode: 'time', dayId: day.id, slotIndex, field: 'endTime' })} className="flex-1 bg-white border border-slate-200 rounded p-2 items-center">
                             <Text className="text-xs">{slot.endTime || 'End'}</Text>
                           </TouchableOpacity>
                         </View>
                         <TextInput
                           className="bg-white border border-slate-200 rounded p-2 text-xs"
                           value={slot.message}
                           onChangeText={val => updateSlot(day.id, slotIndex, 'message', val)}
                           placeholder="Reminder message..."
                         />
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addSlot(day.id)} className="py-2 items-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <Text className="text-xs text-slate-500 font-bold">Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {reminderError ? <Text className="text-rose-500 text-xs text-center mt-2 font-bold">{reminderError}</Text> : null}

              {pickerState.visible && (
                <DateTimePicker
                  value={pickerState.mode === 'date' 
                    ? parseDate(editableReminders.find(d => d.id === pickerState.dayId)?.date || '') 
                    : parseTime(editableReminders.find(d => d.id === pickerState.dayId)?.slots[pickerState.slotIndex || 0]?.[pickerState.field || 'startTime'] || '')}
                  mode={pickerState.mode}
                  display={Platform.OS === 'ios' ? (pickerState.mode === 'date' ? 'inline' : 'spinner') : 'default'}
                  onChange={(_, date) => {
                    setPickerState(prev => ({ ...prev, visible: false }));
                    if (!date) return;
                    if (pickerState.mode === 'date') updateDayDate(pickerState.dayId, formatDate(date));
                    else if (pickerState.field && pickerState.slotIndex !== undefined) updateSlot(pickerState.dayId, pickerState.slotIndex, pickerState.field, formatTime(date));
                  }}
                />
              )}
            </ScrollView>

            <View className="px-5 py-3 border-t border-slate-100 bg-white">
              <TouchableOpacity disabled={savingReminder} onPress={handleSaveReminder} className="bg-sky-500 py-3.5 rounded-xl items-center">
                {savingReminder ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-sm">Save Reminders</Text>}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}