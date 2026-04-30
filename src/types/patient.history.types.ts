export interface HistoryItem {
  action?: string;
  logged_at: string | number | Date;
  actor_type?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  dentist_first_name?: string;
  dentist_last_name?: string;
}

export interface HistoryResponse {
  status?: string;
  data?: HistoryItem[];
}