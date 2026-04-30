
export interface AppointmentResponseItem {
  appointment?: {
    id?: number;
    appointment_id?: number;
    user_set_date?: string;
    appointment_date?: string;
    status?: string;
    appointment_type_id?: number;
    emergency?: number | boolean;
    message?: string;
    created_at?: string;
    service_name?: string;
  };
  patient?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  schedule?: {
    day_of_week?: string;
    time_slot?: string;
  };
  schedules?: {
    day_of_week?: string;
    time_slot?: string;
  }[];
}

export interface AppointmentResponse {
  status?: string;
  appointments?: AppointmentResponseItem[];
}