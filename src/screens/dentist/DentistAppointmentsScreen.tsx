import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';

import {
  fetchDentistAppointments,
  updateDentistAppointmentStatus,
  saveReminder,
  getReminder,
  updateReminder,
} from '../../app/api/dentist';

import type { DentistAppointmentItem } from '../../types/dentist.types';
import type { AppointmentResponse } from '../../types/dentist.appointment.types';
import type { ReminderDay } from '../../types/reminder.types';

// websocket wsManager
import { wsManager } from '../../utils/WebsocketManager';

// types
import type { WebSocketMessage } from '../../types/websockets.types';

import AppointmentDetailsModal from './appointments/components/AppointmentDetailsModal';
import AppointmentList from './appointments/components/AppointmentList';
import ReminderModal from './appointments/components/ReminderModal';
import {
  createEmptyReminderDay,
  formatDate,
  formatName,
  formatTime,
  parseDate,
  parseReminderResponse,
  parseTime,
  validateReminders,
  AppointmentStatusUpdate,
  PickerState,
  ReminderSlotField,
} from '../../types/appointment.types';

type LoadAppointmentsOptions = {
  silent?: boolean;
};

export default function DentistAppointmentsScreen() {
  const [appointments, setAppointments] = useState<DentistAppointmentItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DentistAppointmentItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderErrorMessage, setReminderErrorMessage] = useState('');
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [draftReminders, setDraftReminders] = useState<ReminderDay[]>([]);
  const [hasExistingReminders, setHasExistingReminders] = useState(false);
  const [dateTimePickerState, setDateTimePickerState] = useState<PickerState>({
    visible: false,
    mode: 'date',
    dayId: '',
  });

  const loadAppointments = useCallback(
    async ({ silent = false }: LoadAppointmentsOptions = {}) => {
      if (!silent) setIsLoading(true);

      try {
        const response =
          (await fetchDentistAppointments()) as AppointmentResponse;
        if (response?.status === 'ok' && Array.isArray(response.appointments)) {
          const formattedAppointments = response.appointments.map(item => {
            const appointment = item.appointment || {};
            const patient = item.patient || {};
            const schedule =
              item.schedule ||
              (Array.isArray(item.schedules) ? item.schedules[0] : {});

            return {
              id: String(appointment.id ?? appointment.appointment_id ?? ''),
              date: appointment.user_set_date,
              time: appointment.appointment_date?.split(' ')[1],
              day_of_week: schedule.day_of_week,
              time_slot: schedule.time_slot,
              status: appointment.status || 'Pending',
              appointment_type_id: Number(appointment.appointment_type_id) || 1,
              patient_name: formatName(patient.first_name, patient.last_name),
              email: patient.email,
              phone: patient.phone,
              emergency: !!appointment.emergency,
              message: appointment.message,
              created_at: appointment.created_at,
              appointment_date: appointment.appointment_date,
              service_name: appointment.service_name,
            } as DentistAppointmentItem;
          });

          console.log('Current formatted appointments', formattedAppointments);
          setAppointments(formattedAppointments);

          setSelectedAppointment(prevSelected => {
            if (!prevSelected) return null;
            const updatedAppointment = formattedAppointments.find(
              appointment => appointment.id === prevSelected.id,
            );
            return updatedAppointment || prevSelected;
          });
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.log('Failed to load appointments', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadAppointments();

    const unsubscribe = wsManager.on(
      'notification',
      (payload: WebSocketMessage) => {
        console.log('WebSocket Received:', payload);

        if (
          payload.type === 'appointment_update' ||
          payload.type === 'appointment_cancelled' ||
          payload.type === 'appointment_updated_by_patient'
        ) {
          loadAppointments({ silent: true });
        }
      },
    );

    return () => unsubscribe();
  }, [loadAppointments]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAppointments({ silent: true });
  };

  const setReminderDayDate = (dayId: string, date: string) =>
    setDraftReminders(prev =>
      prev.map(day => (day.id === dayId ? { ...day, date } : day)),
    );

  const addReminderDay = () =>
    setDraftReminders(prev => [...prev, createEmptyReminderDay()]);

  const removeReminderDay = (dayId: string) =>
    setDraftReminders(prev => prev.filter(day => day.id !== dayId));

  const addReminderSlot = (dayId: string) =>
    setDraftReminders(prev =>
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

  const updateReminderSlot = (
    dayId: string,
    slotIndex: number,
    field: ReminderSlotField,
    value: string,
  ) =>
    setDraftReminders(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
              ...day,
              slots: day.slots.map((slot, index) =>
                index === slotIndex ? { ...slot, [field]: value } : slot,
              ),
            }
          : day,
      ),
    );

  const removeReminderSlot = (dayId: string, slotIndex: number) =>
    setDraftReminders(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
              ...day,
              slots: day.slots.filter((_, index) => index !== slotIndex),
            }
          : day,
      ),
    );

  const openReminderModal = async () => {
    setReminderErrorMessage('');
    setIsReminderModalOpen(true);
    if (!selectedAppointment) return;
    try {
      const response = await getReminder(selectedAppointment.id);
      console.log('Reminder response', response);
      const reminders = parseReminderResponse(response);
      setDraftReminders(
        reminders.length ? reminders : [createEmptyReminderDay()],
      );
      setHasExistingReminders(reminders.length > 0);
    } catch (error) {
      console.log('Failed to load reminders', error);
      setDraftReminders([createEmptyReminderDay()]);
      setHasExistingReminders(false);
    }
  };

  const updateAppointmentStatus = async (status: AppointmentStatusUpdate) => {
    if (!selectedAppointment) return;
    setIsUpdatingStatus(true);
    try {
      const response = await updateDentistAppointmentStatus(
        selectedAppointment.id,
        status,
      );
      if (response?.status === 'success' || response?.status === 'ok') {
        setAppointments(prev =>
          prev.map(appointment =>
            appointment.id === selectedAppointment.id
              ? { ...appointment, status }
              : appointment,
          ),
        );
        setSelectedAppointment(prev => (prev ? { ...prev, status } : prev));
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const saveReminders = async () => {
    if (!selectedAppointment) return;
    const validationError = validateReminders(draftReminders);
    if (validationError) return setReminderErrorMessage(validationError);

    setIsSavingReminder(true);
    setReminderErrorMessage('');
    try {
      const response = hasExistingReminders
        ? await updateReminder(selectedAppointment.id, draftReminders)
        : await saveReminder(draftReminders, selectedAppointment.id);
      if (response?.status === 'success' || response?.status === 'ok')
        setIsReminderModalOpen(false);
    } finally {
      setIsSavingReminder(false);
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <AppointmentList
        appointments={appointments}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onReload={() => loadAppointments({ silent: true })}
        onSelectAppointment={appointment => setSelectedAppointment(appointment)}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isUpdating={isUpdatingStatus}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={updateAppointmentStatus}
        onOpenReminders={openReminderModal}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminderDays={draftReminders}
        errorMessage={reminderErrorMessage}
        isSaving={isSavingReminder}
        pickerState={dateTimePickerState}
        setPickerState={setDateTimePickerState}
        onAddDay={addReminderDay}
        onRemoveDay={removeReminderDay}
        onAddSlot={addReminderSlot}
        onRemoveSlot={removeReminderSlot}
        onUpdateSlot={updateReminderSlot}
        onUpdateDayDate={setReminderDayDate}
        parseDate={parseDate}
        parseTime={parseTime}
        formatDate={formatDate}
        formatTime={formatTime}
        onSave={saveReminders}
      />
    </SafeAreaView>
  );
}
