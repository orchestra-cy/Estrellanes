export interface appointmentDOT {
  status: string;
  appointments: {
    appointment: {
      id: number;
      appointment_date: string;
      appointment_type_id: number;
      dentist_id: number;
      patient_id: number;
      schedule_id: number;
      service_id: number;
      service_name: string;
      status: string;
      message: string;
      emergency: number;
      user_set_date: string;
      reminder_id: number | null;
      reminder_viewed: boolean | null;
      deleted_on: string | null;
      /** Stringified JSON: ReminderInfoParsed[] */
      reminder_info: string; 
    };
    dentist: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      /** Stringified JSON: string[] */
      roles: string;
    };
    schedules: {
      id: number;
      dentistID: number;
      day_of_week: string;
      time_slot: string;
    }[];
  }[];
}

/**
 * For better DX (Developer Experience), you can use these 
 * when parsing the stringified 'reminder_info' field.
 */
export interface ReminderInfoParsed {
  id: string;
  date: string;
  slots: {
    startTime: string;
    endTime: string;
    message: string;
  }[];
}