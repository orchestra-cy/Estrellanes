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
  Pressable,
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
      <View className="flex-1 justify-end relative">
        {/* Invisible backdrop for tap-to-close */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Floating Modal Container */}
        <SafeAreaView className="bg-white rounded-t-[36px] max-h-[90%] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] elevation-24 flex-shrink">
          
          {/* Drag Handle Indicator */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pb-4 border-b border-slate-50">
            <Text className="text-2xl font-black text-slate-800 tracking-tight">
              Setup Reminders
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-9 h-9 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
            >
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="shrink"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Header & Add Day Button */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Scheduled Days
              </Text>
              <TouchableOpacity
                onPress={onAddDay}
                activeOpacity={0.7}
                className="px-3.5 py-1.5 rounded-full bg-sky-50 flex-row items-center border border-sky-100"
              >
                <Icon name="plus" size={14} color="#0ea5e9" className="mr-1" />
                <Text className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">
                  Add Day
                </Text>
              </TouchableOpacity>
            </View>

            {reminderDays.map((reminderDay, dayIndex) => (
              <View
                key={reminderDay.id}
                className="mb-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
              >
                {/* Day Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-extrabold text-slate-800">
                    Day {dayIndex + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemoveDay(reminderDay.id)}
                    className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center border border-rose-100"
                    activeOpacity={0.7}
                  >
                    <Icon name="trash-can-outline" size={16} color="#e11d48" />
                  </TouchableOpacity>
                </View>

                {/* Date Picker */}
                <View className="mb-5">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Reminder Date
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setPickerState({
                        visible: true,
                        mode: 'date',
                        dayId: reminderDay.id,
                      })
                    }
                    activeOpacity={0.7}
                    className="border border-slate-200 rounded-[20px] px-5 py-4 bg-white flex-row justify-between items-center shadow-sm shadow-slate-50"
                  >
                    <Text
                      className={`text-base font-semibold ${
                        reminderDay.date ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {reminderDay.date || 'Pick a date...'}
                    </Text>
                    <Icon name="calendar-month-outline" size={20} color={reminderDay.date ? "#0ea5e9" : "#94a3b8"} />
                  </TouchableOpacity>
                </View>

                {/* Slots Section */}
                <View className="border-t border-slate-50 pt-5">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    Time Slots
                  </Text>
                  
                  {reminderDay.slots.map((reminderSlot, slotIndex) => (
                    <View
                      key={slotIndex}
                      className="mb-4 p-4 bg-slate-50 rounded-[20px] border border-slate-100"
                    >
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest">
                          Slot {slotIndex + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onRemoveSlot(reminderDay.id, slotIndex)}
                          className="p-1"
                        >
                          <Icon name="close-circle-outline" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Time Pickers */}
                      <View className="flex-row gap-3 mb-3">
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
                          activeOpacity={0.7}
                          className="flex-1 bg-white border border-slate-200 rounded-[16px] p-3 flex-row justify-between items-center shadow-sm shadow-slate-50"
                        >
                          <Text className={`text-sm font-medium ${reminderSlot.startTime ? 'text-slate-800' : 'text-slate-400'}`}>
                            {reminderSlot.startTime || 'Start'}
                          </Text>
                          <Icon name="clock-outline" size={14} color="#94a3b8" />
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
                          activeOpacity={0.7}
                          className="flex-1 bg-white border border-slate-200 rounded-[16px] p-3 flex-row justify-between items-center shadow-sm shadow-slate-50"
                        >
                          <Text className={`text-sm font-medium ${reminderSlot.endTime ? 'text-slate-800' : 'text-slate-400'}`}>
                            {reminderSlot.endTime || 'End'}
                          </Text>
                          <Icon name="clock-outline" size={14} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Message Input */}
                      <TextInput
                        className="bg-white border border-slate-200 rounded-[16px] px-4 py-3 text-sm text-slate-800 shadow-sm shadow-slate-50 font-medium"
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
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  ))}
                  
                  {/* Add Slot Button */}
                  <TouchableOpacity
                    onPress={() => onAddSlot(reminderDay.id)}
                    activeOpacity={0.7}
                    className="py-3.5 mt-1 items-center border border-dashed border-sky-300 rounded-[16px] bg-sky-50/50"
                  >
                    <Text className="text-xs text-sky-600 font-bold tracking-wide">
                      + Add Time Slot
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Error Message Display */}
            {errorMessage ? (
              <View className="bg-rose-50 border border-rose-100 rounded-[20px] px-5 py-4 flex-row items-center mt-2">
                <Icon name="alert-circle-outline" size={20} color="#e11d48" className="mr-3" />
                <Text className="text-rose-600 font-bold flex-1 leading-5 text-sm">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* DateTimePicker Component */}
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

          {/* Action Buttons Footer */}
          <View className="px-6 py-5 border-t border-slate-50 bg-white rounded-b-[36px]">
            <TouchableOpacity
              disabled={isSaving}
              onPress={onSave}
              activeOpacity={0.8}
              className="bg-sky-500 py-4 rounded-[20px] items-center shadow-md shadow-sky-500/30"
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold tracking-wide text-base">
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