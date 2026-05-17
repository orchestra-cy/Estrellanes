export interface AppointmentDataItem {
  appointment?: {
    id?: number;
    user_set_date?: string;
    appointment_date?: string;
    appointment_type_id?: number;
    service_name?: string;
    status?: string;
    message?: string;
    reminder_info?: string;
  };
  dentist?: {
    first_name?: string;
    last_name?: string;
    specialty?: string;
  };
  schedules?: {
    day_of_week?: string;
    time_slot?: string;
  }[];
}

export interface AppointmentDetailsModalProps {
  visible: boolean;
  appointmentData: AppointmentDataItem | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// book appointment
// book appointment
// book appointment

export interface ServiceItem {
  service_id: number;
  service_name: string;
  serviceTypeId?: number;
  serviceTypeName: string;
}

export interface AppointmentType {
  id: number;
  appointment_name: string;
}

export interface DentistScheduleItem {
  day_of_week?: string;
  time_slot?: string;
}

export interface DentistItem {
  id: string | number;
  first_name?: string;
  last_name?: string;
  specialty?: string;
  specialization?: string;
  services?: ServiceItem[];
  schedule?: Record<string, string[]> | DentistScheduleItem[];
  schedules?: DentistScheduleItem[];
}

export interface BookAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

//edit appointment
//edit appointment
//edit appointment
export interface ScheduleItem {
  id?: string | number;
  time_slot?: string;
  day_of_week?: string;
}

export interface EditableAppointmentResponse {
  appointment?: {
    user_set_date?: string;
    day_of_week?: string;
    emergency?: number | boolean;
    appointment_type_id?: number;
    message?: string;
  };
  dentist?: {
    first_name?: string;
    last_name?: string;
    specialty?: string;
  };
  scheduleDetails?: {
    id?: string | number;
  };
  schedules?: Record<string, ScheduleItem[]> | ScheduleItem[];
}

export interface EditAppointmentModalProps {
  visible: boolean;
  appointmentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}
