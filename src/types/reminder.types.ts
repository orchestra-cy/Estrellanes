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

export interface ReminderSlot {
  startTime: string;
  endTime: string;
  message: string;
}

export interface ReminderDay {
  id: string;
  date: string;
  slots: ReminderSlot[];
}

export type PickerState = {
  visible: boolean;
  mode: 'date' | 'time';
  dayId: string;
  slotIndex?: number;
  field?: ReminderSlotField;
};


export type ReminderSlotField = keyof ReminderSlot;
