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

//alert
import { showInfo } from '../../components/alert_message';
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

interface DentistSettingsScreenProps {
  embedded?: boolean;
}

export default function DentistSettingsScreen({
  embedded = false,
}: DentistSettingsScreenProps) {
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

  const loadingContainerClass = embedded
    ? 'justify-center items-center bg-slate-50 p-5'
    : 'flex-1 justify-center items-center bg-slate-50 p-5';

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
      const save_data = await updateDentistSchedule(apiFormat);
      console.log(save_data);
      if (save_data.status === 'ok') {
        showInfo({
          title: 'Schedule Updated',
          message: 'Your schedule has been updated successfully.',
          type: 'info',
          position: 'top',
          visibilityTime: 3000,
        });
      }
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
      const result = await updateDentistServices(payload);
      console.log(result);
      
      if (result.status === 'success') {
        showInfo({
          title: 'Services Updated',
          message: 'Your clinical services have been updated successfully.',
          type: 'info',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      setOriginalServices(Array.from(selectedServices));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingServices(false);
    }
  };

  if (loading) {
    return (
      <View className={loadingContainerClass}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-slate-500 font-medium tracking-wide">
          Loading settings...
        </Text>
      </View>
    );
  }

  const content = (
    <>
      {/* Header */}
      <View className="flex-row justify-between items-end px-6 pt-6 pb-5">
        <View>
          <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Settings
          </Text>
          <Text className="text-sm font-medium text-slate-500 mt-1">
            Manage your schedule & services
          </Text>
        </View>
      </View>

      {/* Weekly Schedule Section */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center">
            <Icon
              name="calendar-clock"
              size={24}
              color="#0ea5e9"
              className="mr-2"
            />
            <Text className="text-xl font-bold text-slate-800">
              Weekly Schedule
            </Text>
          </View>
          <TouchableOpacity
            onPress={load}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full bg-white items-center justify-center border border-slate-200"
          >
            <Icon name="refresh" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {schedules.length === 0 ? (
          <View className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-3">
              <Icon name="calendar-blank" size={32} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-slate-800 mt-1">
              No schedules configured
            </Text>
            <Text className="text-sm text-slate-500 mt-1 text-center">
              Tap add below to create your first availability block.
            </Text>
          </View>
        ) : (
          schedules.map((schedule, dayIndex) => (
            <View
              key={`${schedule.day_of_week}-${dayIndex}`}
              className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] text-slate-400 uppercase tracking-widest font-extrabold ml-1">
                  Day of Week
                </Text>
              </View>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-800"
                value={schedule.day_of_week}
                onChangeText={text => handleEditDay(dayIndex, text)}
              />

              <View className="mt-5 border-t border-slate-100 pt-4">
                <Text className="text-[11px] text-slate-400 uppercase tracking-widest font-extrabold mb-1 ml-1">
                  Time Slots
                </Text>

                {schedule.time_slots.map((slot, slotIndex) => (
                  <View
                    key={`${slot.id}-${slotIndex}`}
                    className="flex-row items-center gap-3 mt-3"
                  >
                    <TextInput
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-base font-medium text-slate-800"
                      value={slot.time}
                      onChangeText={text =>
                        handleEditTimeSlot(dayIndex, slotIndex, text)
                      }
                      placeholder="09:00-10:00"
                      placeholderTextColor="#cbd5e1"
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDeleteTimeSlot(dayIndex, slotIndex)}
                      className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center"
                    >
                      <Icon
                        name="trash-can-outline"
                        size={20}
                        color="#e11d48"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAddTimeSlot(dayIndex)}
                  className="mt-4 py-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex-row items-center justify-center"
                >
                  <Icon
                    name="plus"
                    size={18}
                    color="#64748b"
                    className="mr-1"
                  />
                  <Text className="text-sm font-bold text-slate-500">
                    Add Time Slot
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddSchedule}
            className="flex-1 bg-sky-50 border border-sky-100 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Icon
              name="calendar-plus"
              size={18}
              color="#0ea5e9"
              className="mr-2"
            />
            <Text className="text-sm text-sky-600 font-bold tracking-wide">
              Add Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
            className={`flex-1 rounded-2xl py-4 items-center justify-center flex-row shadow-sm ${
              saving ? 'bg-slate-300' : 'bg-sky-500 shadow-sky-500/30'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon
                  name="content-save-outline"
                  size={18}
                  color="#fff"
                  className="mr-2"
                />
                <Text className="text-white font-bold tracking-wide">
                  Save Schedule
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Clinical Services Section */}
      <View className="px-6 mt-2">
        <View className="flex-row items-center mb-5">
          <Icon
            name="tooth-outline"
            size={24}
            color="#0ea5e9"
            className="mr-2"
          />
          <Text className="text-xl font-bold text-slate-800">
            Clinical Services
          </Text>
        </View>

        {servicesLoading ? (
          <View className="bg-white rounded-[24px] border border-slate-100 p-8 items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="text-slate-500 font-medium mt-3">
              Loading services...
            </Text>
          </View>
        ) : servicesError ? (
          <View className="bg-rose-50 rounded-[24px] border border-rose-100 p-6 flex-row items-center">
            <Icon
              name="alert-circle-outline"
              size={24}
              color="#e11d48"
              className="mr-3"
            />
            <Text className="text-rose-600 font-semibold flex-1">
              {servicesError}
            </Text>
          </View>
        ) : (
          <View className="space-y-6">
            {Object.entries(
              allServices.reduce<Record<string, Service[]>>((acc, service) => {
                const key = service.serviceTypeName || 'Other';
                acc[key] = acc[key] || [];
                acc[key].push(service);
                return acc;
              }, {}),
            ).map(([type, list]) => (
              <View key={type}>
                <Text className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 ml-1">
                  {type}
                </Text>
                <View className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  {list.map((service, index) => {
                    const isSelected = selectedServices.has(service.service_id);
                    const isLast = index === list.length - 1;

                    return (
                      <TouchableOpacity
                        key={service.service_id}
                        activeOpacity={0.7}
                        onPress={() => toggleService(service.service_id)}
                        className={`flex-row items-center justify-between p-4 ${
                          !isLast ? 'border-b border-slate-100' : ''
                        } ${isSelected ? 'bg-sky-50/50' : 'bg-white'}`}
                      >
                        <Text
                          className={`text-sm font-bold flex-1 pr-4 ${
                            isSelected ? 'text-sky-700' : 'text-slate-700'
                          }`}
                        >
                          {service.service_name}
                        </Text>
                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? 'border-sky-500 bg-sky-500'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <Icon name="check" size={14} color="#fff" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveServices}
              disabled={savingServices || !servicesChanged()}
              className={`mt-4 rounded-2xl py-4 items-center flex-row justify-center shadow-sm ${
                savingServices || !servicesChanged()
                  ? 'bg-slate-200'
                  : 'bg-sky-500 shadow-sky-500/30'
              }`}
            >
              {savingServices ? (
                <ActivityIndicator
                  color={!servicesChanged() ? '#94a3b8' : '#fff'}
                  size="small"
                />
              ) : (
                <>
                  <Icon
                    name="check-all"
                    size={18}
                    color={!servicesChanged() ? '#94a3b8' : '#fff'}
                    className="mr-2"
                  />
                  <Text
                    className={`font-bold tracking-wide ${
                      !servicesChanged() ? 'text-slate-400' : 'text-white'
                    }`}
                  >
                    Save Selected Services
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );

  if (embedded) {
    return <View className="bg-slate-50">{content}</View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}
