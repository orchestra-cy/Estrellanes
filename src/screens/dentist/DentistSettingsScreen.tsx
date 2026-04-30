import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getDentistData,
  updateDentistSchedule,
  getServices,
  getDentistServices,
  updateDentistServices,
} from '../../app/api/dentist';
import type { DentistScheduleDay } from '../../types/dentist.types';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface Service {
  service_id: number;
  service_name: string;
  serviceTypeName: string;
}

interface DentistService {
  service_id: number;
}

interface ServiceResponse {
  data?: Service[];
}

interface DentistServiceResponse {
  dentistServices?: DentistService[];
}

interface ScheduleApiItem {
  day_of_week: string;
  dentistID?: number;
  scheduleID?: number;
  time_slot: string;
}

interface SchedulePayload {
  scheduleID: number | null;
  day_of_week: string;
  time_slot: string;
  dentistID: number | null;
}

interface DentistInfoResponse {
  status?: string;
  dentist?: {
    id?: number;
  };
  schedule?: ScheduleApiItem[];
}

export default function DentistSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dentistId, setDentistId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<DentistScheduleDay[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(
    new Set(),
  );
  const [originalServices, setOriginalServices] = useState<number[]>([]);
  const [savingServices, setSavingServices] = useState(false);

  const transformScheduleData = (apiSchedules: ScheduleApiItem[]) => {
    const groupedByDay: { [key: string]: DentistScheduleDay } = {};

    apiSchedules.forEach(schedule => {
      const day = schedule.day_of_week;
      if (!groupedByDay[day]) {
        groupedByDay[day] = {
          day_of_week: day,
          dentistID: schedule.dentistID,
          time_slots: [],
        };
      }

      groupedByDay[day].time_slots.push({
        id: schedule.scheduleID,
        scheduleID: schedule.scheduleID,
        time: schedule.time_slot,
      });
    });

    return Object.values(groupedByDay);
  };

  const convertToApiFormat = (groupedSchedules: DentistScheduleDay[]) => {
    const apiSchedules: SchedulePayload[] = [];

    groupedSchedules.forEach(daySchedule => {
      daySchedule.time_slots.forEach(timeSlot => {
        apiSchedules.push({
          scheduleID: timeSlot.scheduleID || null,
          day_of_week: daySchedule.day_of_week,
          time_slot: timeSlot.time,
          dentistID: dentistId,
        });
      });
    });

    return apiSchedules;
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = (await getDentistData()) as DentistInfoResponse;
      if (result?.status === 'ok') {
        setDentistId(result?.dentist?.id ?? null);
        const transformed = transformScheduleData(result.schedule || []);
        setSchedules(transformed);
      } else {
        setSchedules([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError('');
      try {
        const [svcRes, dentRes] = (await Promise.all([
          getServices(),
          getDentistServices(),
        ])) as [ServiceResponse, DentistServiceResponse];

        const serviceList = Array.isArray(svcRes?.data) ? svcRes.data : [];
        const selectedIds = Array.isArray(dentRes?.dentistServices)
          ? dentRes.dentistServices.map(d => d.service_id)
          : [];

        if (isMounted) {
          setAllServices(serviceList);
          setSelectedServices(new Set(selectedIds));
          setOriginalServices(selectedIds);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setServicesError('Failed to load services.');
      } finally {
        if (isMounted) setServicesLoading(false);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddSchedule = () => {
    const usedDays = schedules.map(s => s.day_of_week);
    const available = DAYS.filter(day => !usedDays.includes(day));
    const nextDay = available[0] || 'Monday';

    setSchedules(prev => [
      ...prev,
      {
        day_of_week: nextDay,
        dentistID: dentistId ?? undefined,
        time_slots: [{ id: Date.now(), time: '09:00-10:00' }],
      },
    ]);
  };

  const handleEditDay = (index: number, day: string) => {
    const updated = [...schedules];
    updated[index].day_of_week = day;
    setSchedules(updated);
  };

  const handleAddTimeSlot = (dayIndex: number) => {
    const updated = [...schedules];
    updated[dayIndex].time_slots.push({
      id: Date.now() + Math.random(),
      time: '09:00-10:00',
    });
    setSchedules(updated);
  };

  const handleEditTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    value: string,
  ) => {
    const updated = [...schedules];
    updated[dayIndex].time_slots[slotIndex].time = value;
    setSchedules(updated);
  };

  const handleDeleteTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...schedules];
    updated[dayIndex].time_slots.splice(slotIndex, 1);
    if (updated[dayIndex].time_slots.length === 0) {
      updated.splice(dayIndex, 1);
    }
    setSchedules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiFormat = convertToApiFormat(schedules);
      await updateDentistSchedule(apiFormat);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (id: number) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const servicesChanged = () => {
    const current = Array.from(selectedServices).sort((a, b) => a - b);
    const original = [...originalServices].sort((a, b) => a - b);
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  const handleSaveServices = async () => {
    if (!servicesChanged()) return;
    setSavingServices(true);
    try {
      const payload = Array.from(selectedServices).map(service_id => ({
        service_id,
      }));
      await updateDentistServices(payload);
      setOriginalServices(Array.from(selectedServices));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingServices(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pt-5 pb-4">
          <Text className="text-2xl font-bold text-slate-900">
            Dentist Settings
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            Manage your weekly availability.
          </Text>
        </View>

        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">
              Weekly Schedule
            </Text>
            <TouchableOpacity onPress={load}>
              <Text className="text-sm text-indigo-600 font-semibold">
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {schedules.length === 0 ? (
            <View className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 items-center">
              <Icon name="calendar-blank" size={32} color="#94A3B8" />
              <Text className="text-slate-900 font-semibold mt-2">
                No schedules configured
              </Text>
              <Text className="text-slate-500 text-sm mt-1 text-center">
                Tap add to create your first availability block.
              </Text>
            </View>
          ) : (
            schedules.map((schedule, dayIndex) => (
              <View
                key={`${schedule.day_of_week}-${dayIndex}`}
                className="bg-white rounded-2xl border border-slate-100 p-4 mb-4"
              >
                <Text className="text-xs text-slate-400 uppercase font-semibold">
                  Day
                </Text>
                <TextInput
                  className="border border-slate-200 rounded-xl px-3 py-2 mt-2 text-slate-900"
                  value={schedule.day_of_week}
                  onChangeText={text => handleEditDay(dayIndex, text)}
                />

                <View className="mt-4">
                  <Text className="text-xs text-slate-400 uppercase font-semibold">
                    Time Slots
                  </Text>
                  {schedule.time_slots.map((slot, slotIndex) => (
                    <View
                      key={`${slot.id}-${slotIndex}`}
                      className="flex-row items-center gap-2 mt-2"
                    >
                      <TextInput
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        value={slot.time}
                        onChangeText={text =>
                          handleEditTimeSlot(dayIndex, slotIndex, text)
                        }
                        placeholder="09:00-10:00"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteTimeSlot(dayIndex, slotIndex)
                        }
                        className="p-2 rounded-xl bg-rose-50"
                      >
                        <Icon name="close" size={16} color="#E11D48" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => handleAddTimeSlot(dayIndex)}
                    className="mt-3 p-3 rounded-xl border border-dashed border-slate-200 items-center"
                  >
                    <Text className="text-sm text-slate-500">Add Slot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            onPress={handleAddSchedule}
            className="mt-2 bg-white border border-slate-200 rounded-xl p-3 items-center"
          >
            <Text className="text-sm text-slate-600 font-semibold">
              Add Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="mt-4 bg-slate-900 rounded-xl p-4 items-center"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Save Changes</Text>
            )}
          </TouchableOpacity>

          <View className="mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                Clinical Services
              </Text>
            </View>

            {servicesLoading ? (
              <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center">
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text className="text-slate-500 text-sm mt-2">
                  Loading services...
                </Text>
              </View>
            ) : servicesError ? (
              <View className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 items-center">
                <Icon name="alert" size={28} color="#E11D48" />
                <Text className="text-slate-500 text-sm mt-2">
                  {servicesError}
                </Text>
              </View>
            ) : (
              Object.entries(
                allServices.reduce<Record<string, Service[]>>(
                  (acc, service) => {
                    const key = service.serviceTypeName || 'Other';
                    acc[key] = acc[key] || [];
                    acc[key].push(service);
                    return acc;
                  },
                  {},
                ),
              ).map(([type, list]) => (
                <View
                  key={type}
                  className="bg-white rounded-2xl border border-slate-100 p-4 mb-4"
                >
                  <Text className="text-sm font-semibold text-slate-700 mb-3">
                    {type}
                  </Text>
                  {list.map(service => {
                    const isSelected = selectedServices.has(service.service_id);
                    return (
                      <TouchableOpacity
                        key={service.service_id}
                        onPress={() => toggleService(service.service_id)}
                        className={`flex-row items-center justify-between py-2 border-b border-slate-100 ${
                          isSelected ? 'bg-indigo-50 px-2 rounded-lg' : ''
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected
                              ? 'text-indigo-700 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {service.service_name}
                        </Text>
                        {isSelected ? (
                          <Icon name="check" size={18} color="#4F46E5" />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}

            <TouchableOpacity
              onPress={handleSaveServices}
              disabled={savingServices || !servicesChanged()}
              className={`mt-2 rounded-xl p-4 items-center ${
                savingServices || !servicesChanged()
                  ? 'bg-slate-200'
                  : 'bg-indigo-600'
              }`}
            >
              {savingServices ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Save Services</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
