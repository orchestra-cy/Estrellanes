import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import type { ReminderDay } from '../../../../types/reminder.types';
import type { PickerState, ReminderSlotField } from '../../../../types/reminder.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reminderDays: ReminderDay[];
  errorMessage: string;
  isSaving: boolean;
  pickerState: PickerState;
  setPickerState: React.Dispatch<React.SetStateAction<PickerState>>;
  onAddDay: () => void;
  onRemoveDay: (dayId: string) => void;
  onAddSlot: (dayId: string) => void;
  onRemoveSlot: (dayId: string, slotIndex: number) => void;
  onUpdateSlot: (
    dayId: string,
    slotIndex: number,
    field: ReminderSlotField,
    value: string,
  ) => void;
  onUpdateDayDate: (dayId: string, date: string) => void;
  parseDate: (value: string) => Date;
  parseTime: (value: string) => Date;
  formatDate: (value: Date | null) => string;
  formatTime: (value: Date | null) => string;
  onSave: () => void;
};

export default function ReminderModal({
  isOpen,
  onClose,
  reminderDays,
  errorMessage,
  isSaving,
  pickerState,
  setPickerState,
  onAddDay,
  onRemoveDay,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
  onUpdateDayDate,
  parseDate,
  parseTime,
  formatDate,
  formatTime,
  onSave,
}: Props) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <SafeAreaView className="bg-white rounded-t-3xl max-h-[85%] flex-shrink">
          <View className="items-center py-3">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>
          <View className="flex-row justify-between items-center px-5 pb-3 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-800">
              Setup Reminders
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
            >
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="shrink"
            contentContainerStyle={{ padding: 20 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase">
                Scheduled Days
              </Text>
              <TouchableOpacity
                onPress={onAddDay}
                className="px-3 py-1.5 rounded-lg bg-sky-50 flex-row items-center border border-sky-100"
              >
                <Icon name="plus" size={14} color="#0ea5e9" className="mr-1" />
                <Text className="text-[10px] font-bold text-sky-700 uppercase">
                  Add Day
                </Text>
              </TouchableOpacity>
            </View>

            {reminderDays.map((reminderDay, dayIndex) => (
              <View
                key={reminderDay.id}
                className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm font-bold">Day {dayIndex + 1}</Text>
                  <TouchableOpacity
                    onPress={() => onRemoveDay(reminderDay.id)}
                    className="p-1"
                  >
                    <Icon name="trash-can-outline" size={16} color="#e11d48" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setPickerState({
                      visible: true,
                      mode: 'date',
                      dayId: reminderDay.id,
                    })
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 flex-row justify-between mb-3"
                >
                  <Text
                    className={
                      reminderDay.date ? 'text-slate-900' : 'text-slate-400'
                    }
                  >
                    {reminderDay.date || 'Pick a date...'}
                  </Text>
                  <Icon name="calendar" size={16} color="#94a3b8" />
                </TouchableOpacity>

                <View className="border-t border-slate-100 pt-3">
                  {reminderDay.slots.map((reminderSlot, slotIndex) => (
                    <View
                      key={slotIndex}
                      className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-[10px] font-bold text-sky-500 uppercase">
                          Slot {slotIndex + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            onRemoveSlot(reminderDay.id, slotIndex)
                          }
                        >
                          <Icon name="close" size={14} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row gap-2 mb-2">
                        <TouchableOpacity
                          onPress={() =>
                            setPickerState({
                              visible: true,
                              mode: 'time',
                              dayId: reminderDay.id,
                              slotIndex,
                              field: 'startTime',
                            })
                          }
                          className="flex-1 bg-white border border-slate-200 rounded p-2 items-center"
                        >
                          <Text className="text-xs">
                            {reminderSlot.startTime || 'Start'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            setPickerState({
                              visible: true,
                              mode: 'time',
                              dayId: reminderDay.id,
                              slotIndex,
                              field: 'endTime',
                            })
                          }
                          className="flex-1 bg-white border border-slate-200 rounded p-2 items-center"
                        >
                          <Text className="text-xs">
                            {reminderSlot.endTime || 'End'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        className="bg-white border border-slate-200 rounded p-2 text-xs"
                        value={reminderSlot.message}
                        onChangeText={value =>
                          onUpdateSlot(
                            reminderDay.id,
                            slotIndex,
                            'message',
                            value,
                          )
                        }
                        placeholder="Reminder message..."
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => onAddSlot(reminderDay.id)}
                    className="py-2 items-center border border-dashed border-slate-300 rounded-lg bg-slate-50"
                  >
                    <Text className="text-xs text-slate-500 font-bold">
                      Add Time Slot
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {errorMessage ? (
              <Text className="text-rose-500 text-xs text-center mt-2 font-bold">
                {errorMessage}
              </Text>
            ) : null}

            {pickerState.visible && (
              <DateTimePicker
                value={
                  pickerState.mode === 'date'
                    ? parseDate(
                        reminderDays.find(day => day.id === pickerState.dayId)
                          ?.date || '',
                      )
                    : parseTime(
                        reminderDays.find(day => day.id === pickerState.dayId)
                          ?.slots[pickerState.slotIndex || 0]?.[
                          pickerState.field || 'startTime'
                        ] || '',
                      )
                }
                mode={pickerState.mode}
                display={
                  Platform.OS === 'ios'
                    ? pickerState.mode === 'date'
                      ? 'inline'
                      : 'spinner'
                    : 'default'
                }
                onChange={(_, date) => {
                  setPickerState(prev => ({ ...prev, visible: false }));
                  if (!date) return;
                  if (pickerState.mode === 'date')
                    onUpdateDayDate(pickerState.dayId, formatDate(date));
                  else if (
                    pickerState.field &&
                    pickerState.slotIndex !== undefined
                  )
                    onUpdateSlot(
                      pickerState.dayId,
                      pickerState.slotIndex,
                      pickerState.field,
                      formatTime(date),
                    );
                }}
              />
            )}
          </ScrollView>

          <View className="px-5 py-3 border-t border-slate-100 bg-white">
            <TouchableOpacity
              disabled={isSaving}
              onPress={onSave}
              className="bg-sky-500 py-3.5 rounded-xl items-center"
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  Save Reminders
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
