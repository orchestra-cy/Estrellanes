import type { ReminderDay, ReminderSlot, } from './reminder.types';

type ReminderResponse = {
  data?: ReminderDay[];
};

export const formatName = (firstName?: string, lastName?: string) => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  return fullName || 'Unknown Patient';
};

export const createEmptyReminderDay = (): ReminderDay => ({
  id: `${Date.now()}-${Math.random()}`,
  date: '',
  slots: [{ startTime: '', endTime: '', message: '' }],
});

export const parseDate = (dateValue: string) => {
  if (!dateValue) return new Date();
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

export const parseTime = (timeValue: string) => {
  if (!timeValue) return new Date();
  const [hours = 0, minutes = 0] = timeValue.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatDate = (dateValue: Date | null) =>
  dateValue
    ? `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(dateValue.getDate()).padStart(2, '0')}`
    : '';

export const formatTime = (dateValue: Date | null) =>
  dateValue
    ? `${String(dateValue.getHours()).padStart(2, '0')}:${String(dateValue.getMinutes()).padStart(2, '0')}`
    : '';

export const validateReminders = (reminders: ReminderDay[]) => {
  if (!reminders.length) return 'Add at least one reminder.';
  for (const reminderDay of reminders) {
    if (!reminderDay.date) return 'Please select a date for each reminder.';
    if (!reminderDay.slots.length) return 'Add at least one time slot.';
    for (const reminderSlot of reminderDay.slots) {
      if (
        !reminderSlot.startTime ||
        !reminderSlot.endTime ||
        !reminderSlot.message
      )
        return 'Complete all reminder fields.';
    }
  }
  return '';
};

export const parseReminderResponse = (response: unknown): ReminderDay[] => {
  const reminderResponse = response as ReminderResponse | null;
  const reminderDays = reminderResponse?.data;
  if (!Array.isArray(reminderDays)) return [];

  return reminderDays.map(reminderDay => ({
    id: String(reminderDay.id ?? Date.now()),
    date: reminderDay.date ?? '',
    slots: Array.isArray(reminderDay.slots)
      ? reminderDay.slots.map((slot: ReminderSlot) => ({
          startTime: slot.startTime ?? '',
          endTime: slot.endTime ?? '',
          message: slot.message ?? '',
        }))
      : [],
  }));
};


export type AppointmentStatusUpdate = 'Approved' | 'Rejected' | 'Pending';
