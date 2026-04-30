export interface ReminderPayloadSlot {
  startTime: string;
  endTime: string;
  message: string;
}

export interface ReminderPayloadDay {
  id: string;
  date: string;
  slots: ReminderPayloadSlot[];
}

export interface ReminderSlot {
  startTime: string, 
  endTime: string,
  message: string,
}