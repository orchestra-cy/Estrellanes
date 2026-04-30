export interface DentistAppointmentItem {
  id: string;
  date: string;
  time?: string;
  day_of_week?: string;
  time_slot?: string;
  status: string;
  appointment_type_id: number;
  patient_name: string;
  email?: string;
  phone?: string;
  emergency?: boolean;
  message?: string;
  created_at?: string;
  appointment_date?: string;
  service_name?: string;
}

export interface DentistScheduleSlot {
  id?: string | number;
  scheduleID?: number;
  time: string;
}

export interface DentistScheduleDay {
  day_of_week: string;
  dentistID?: number;
  time_slots: DentistScheduleSlot[];
}
