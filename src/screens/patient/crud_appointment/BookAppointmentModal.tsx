import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Switch,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getAllDentist,
  getAppointmentTypes,
  getServices,
  submitAppointment,
} from '../../../app/api/patient';
import { showInfo } from '../../../components/alert_message';

// types
import {
  ServiceItem,
  AppointmentType,
  DentistItem,
  BookAppointmentModalProps,
} from '../../../types/patient.appointment.types';

const normalizeServiceItem = (service: any): ServiceItem => {
  const serviceId = service.service_id ?? service.serviceID;
  const serviceName = service.service_name ?? service.serviceName;
  const serviceTypeId = service.serviceTypeId ?? service.service_type_id;
  const serviceTypeName =
    service.serviceTypeName ??
    service.service_type_name ??
    service.serviceType ??
    'Other';

  return {
    ...service,
    service_id: Number(serviceId),
    service_name: serviceName,
    serviceTypeId: serviceTypeId ? Number(serviceTypeId) : undefined,
    serviceTypeName,
  };
};

const buildScheduleMap = (dentist: DentistItem): Record<string, string[]> => {
  if (!dentist) return {};
  const schedule = dentist.schedule ?? dentist.schedules ?? [];

  if (Array.isArray(schedule)) {
    return schedule.reduce<Record<string, string[]>>((acc, item) => {
      const day = item.day_of_week;
      const time = item.time_slot;
      if (!day || !time) return acc;
      if (!acc[day]) acc[day] = [];
      acc[day].push(time);
      return acc;
    }, {});
  }

  if (typeof schedule === 'object' && schedule !== null) {
    return schedule as Record<string, string[]>;
  }

  return {};
};

const getDayIndex = (day: string) => {
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[day] ?? -1;
};

export default function BookAppointmentModal({
  visible,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingMethod, setBookingMethod] = useState<
    'operator' | 'self' | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [servicesCatalog, setServicesCatalog] = useState<ServiceItem[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    [],
  );
  const [dentists, setDentists] = useState<DentistItem[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<DentistItem[]>([]);

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const [pickDentist, setPickDentist] = useState<string | number>('');
  const [pickDay, setPickDay] = useState('');
  const [pickTime, setPickTime] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<
    number | null
  >(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [message, setMessage] = useState('');

  const selectedDentist = dentists.find(d => d.id === pickDentist);

  const servicesByType = useMemo(() => {
    return servicesCatalog.reduce<Record<string, ServiceItem[]>>((acc, s) => {
      const type = s.serviceTypeName || 'Other';
      acc[type] = acc[type] || [];
      acc[type].push(s);
      return acc;
    }, {});
  }, [servicesCatalog]);

  const canContinue =
    !!selectedService && !!pickDentist && !!pickDay && !!pickTime && !!date;

  const canSubmit = canContinue && !!selectedAppointmentTypeId;

  const resetState = () => {
    setStep(1);
    setBookingMethod(null);
    setError('');
    setSelectedService(null);
    setPickDentist('');
    setPickDay('');
    setPickTime('');
    setDate(null);
    setSelectedAppointmentTypeId(null);
    setIsEmergency(false);
    setMessage('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    if (pickDay) {
      const dayIndex = getDayIndex(pickDay);
      if (dayIndex !== -1 && selectedDate.getDay() !== dayIndex) {
        setError('Selected date does not match the chosen day.');
        return;
      }
    }
    setError('');
    setDate(selectedDate);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [serviceRes, typeRes, dentistRes] = await Promise.all([
        getServices(),
        getAppointmentTypes(),
        getAllDentist(),
      ]);

      const services = Array.isArray(serviceRes?.data)
        ? serviceRes.data.map(normalizeServiceItem)
        : [];
      const types = Array.isArray(typeRes?.data) ? typeRes.data : [];
      const dentistList = Array.isArray(dentistRes?.dentists)
        ? dentistRes.dentists.map((dentist: DentistItem) => ({
            ...dentist,
            specialty: dentist.specialty ?? dentist.specialization,
            services: (dentist.services || []).map(normalizeServiceItem),
          }))
        : [];

      setServicesCatalog(services);
      setAppointmentTypes(types);
      if (types.length > 0) setSelectedAppointmentTypeId(types[0].id);
      setDentists(dentistList);
      setFilteredDentists(dentistList);
    } catch (e) {
      console.error(e);
      setError('Failed to load booking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    if (!selectedService) {
      setFilteredDentists(dentists);
      return;
    }
    const filtered = dentists.filter(dentist =>
      dentist.services?.some(
        service => service.service_id === selectedService.service_id,
      ),
    );
    setFilteredDentists(filtered);
  }, [selectedService, dentists]);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedService || !selectedAppointmentTypeId) {
      setError('Please complete all required fields.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    const formattedDate = date.toLocaleDateString('en-CA');
    const composedMessage = message.trim();

    try {
      await submitAppointment({
        dentistID: String(pickDentist),
        day: pickDay,
        time: pickTime,
        emergency: isEmergency,
        appointmentTypeId: selectedAppointmentTypeId,
        date: formattedDate,
        message: composedMessage,
        serviceID: String(selectedService.service_id),
      });

      showInfo({
        title: 'Appointment Submitted',
        message: 'Your appointment request has been submitted successfully.',
        type: 'info',
        position: 'top',
        visibilityTime: 3000,
      });

      onSuccess();
      handleClose();
    } catch (e) {
      console.error(e);
      setError((e as Error)?.message || 'Failed to submit appointment.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <SafeAreaView className="bg-white rounded-t-[32px] h-[95%] overflow-hidden shadow-lg">
          {/* Drag Handle Indicator */}
          <View className="items-center pt-3 pb-1">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
            <View>
              <Text className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Book Appointment
              </Text>
              <Text className="text-sm font-medium text-slate-500 mt-0.5">
                {step > 1 ? `Step ${step} of 3` : 'Schedule your dental visit'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text className="mt-4 text-slate-500 font-medium tracking-wide">
                Loading booking details...
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
              showsVerticalScrollIndicator={false}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <View className="space-y-6">
                  <View>
                    <Text className="text-xl font-bold text-slate-800">
                      Choose Booking Method
                    </Text>
                    <Text className="text-sm text-slate-500 mt-1">
                      Continue with self booking or contact an operator.
                    </Text>
                  </View>

                  <View className="space-y-4">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setBookingMethod('self');
                        setStep(2);
                      }}
                      className="bg-white border-2 border-slate-100 rounded-[24px] p-5 flex-row items-center mb-2"
                    >
                      <View className="w-14 h-14 bg-sky-50 rounded-full items-center justify-center mr-4">
                        <Icon name="calendar-check" size={28} color="#0ea5e9" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-800">
                          Self Booking
                        </Text>
                        <Text className="text-sm text-slate-500 mt-0.5 leading-5">
                          Choose service, dentist, and time instantly.
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setBookingMethod('operator');
                        Linking.openURL('tel:09453690012');
                      }}
                      className="bg-white border-2 border-slate-100 rounded-[24px] p-5 flex-row items-center"
                    >
                      <View className="w-14 h-14 bg-emerald-50 rounded-full items-center justify-center mr-4">
                        <Icon name="phone" size={28} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-800">
                          Call Operator
                        </Text>
                        <Text className="text-sm text-slate-500 mt-0.5 leading-5">
                          Get direct assistance from our clinic staff.
                        </Text>
                      </View>
                      <Icon name="open-in-new" size={22} color="#cbd5e1" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <View className="space-y-8">
                  <View>
                    <Text className="text-xl font-bold text-slate-800 mb-5">
                      1. Select Service
                    </Text>

                    {Object.keys(servicesByType).map(typeName => (
                      <View key={typeName} className="mb-5">
                        <Text className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 ml-1">
                          {typeName}
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                          {servicesByType[typeName].map(service => {
                            const active =
                              selectedService?.service_id ===
                              service.service_id;

                            return (
                              <TouchableOpacity
                                key={service.service_id}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setSelectedService(service);
                                  setPickDentist('');
                                  setPickDay('');
                                  setPickTime('');
                                  setDate(null);
                                  setError('');
                                }}
                                className={`px-4 py-3 rounded-2xl border-2 ${
                                  active
                                    ? 'bg-sky-500 border-sky-500'
                                    : 'bg-white border-slate-100'
                                }`}
                              >
                                <Text
                                  className={`text-sm font-bold ${
                                    active ? 'text-white' : 'text-slate-600'
                                  }`}
                                >
                                  {service.service_name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>

                  <View>
                    <Text className="text-xl font-bold text-slate-800 mb-4">
                      2. Select Dentist
                    </Text>

                    {filteredDentists.length === 0 ? (
                      <Text className="text-sm text-slate-500 italic ml-1">
                        Please select a service first, or no dentists are
                        available.
                      </Text>
                    ) : (
                      filteredDentists.map(dentist => {
                        const scheduleMap = buildScheduleMap(dentist);
                        const isSelected = pickDentist === dentist.id;

                        return (
                          <View
                            key={String(dentist.id)}
                            className={`rounded-3xl border-2 p-5 mb-4 ${
                              isSelected
                                ? 'border-sky-400 bg-sky-50'
                                : 'border-slate-100 bg-white'
                            }`}
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                setPickDentist(dentist.id);
                                setPickDay('');
                                setPickTime('');
                                setDate(null);
                                setError('');
                              }}
                              className="flex-row justify-between items-center"
                            >
                              <View className="flex-row items-center flex-1">
                                <View
                                  className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                                    isSelected ? 'bg-sky-200' : 'bg-slate-100'
                                  }`}
                                >
                                  <Icon
                                    name="account"
                                    size={24}
                                    color={isSelected ? '#0369a1' : '#94a3b8'}
                                  />
                                </View>
                                <View className="flex-1 pr-2">
                                  <Text className="text-lg font-bold text-slate-800">
                                    Dr. {dentist.first_name} {dentist.last_name}
                                  </Text>
                                  <Text className="text-sm font-medium text-slate-500 mt-0.5">
                                    {dentist.specialty || 'General Dentistry'}
                                  </Text>
                                </View>
                              </View>

                              {isSelected && (
                                <View className="w-7 h-7 rounded-full items-center justify-center bg-sky-500">
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                            </TouchableOpacity>

                            {isSelected && (
                              <View className="mt-5 pt-5 border-t border-slate-200">
                                {Object.keys(scheduleMap).length === 0 ? (
                                  <Text className="text-sm text-slate-500 italic">
                                    No schedules available right now.
                                  </Text>
                                ) : (
                                  Object.entries(scheduleMap).map(
                                    ([day, times]) => (
                                      <View
                                        key={day}
                                        className="mb-5 last:mb-0"
                                      >
                                        <Text className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                                          {day}
                                        </Text>

                                        <View className="flex-row flex-wrap gap-2">
                                          {times.map(time => {
                                            const active =
                                              pickDay === day &&
                                              pickTime === time;

                                            return (
                                              <TouchableOpacity
                                                key={time}
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                  setPickDay(day);
                                                  setPickTime(time);
                                                  setDate(null);
                                                  setError('');
                                                }}
                                                className={`px-4 py-2.5 rounded-xl border-2 ${
                                                  active
                                                    ? 'bg-sky-500 border-sky-500'
                                                    : 'bg-white border-slate-200'
                                                }`}
                                              >
                                                <Text
                                                  className={`text-sm font-bold ${
                                                    active
                                                      ? 'text-white'
                                                      : 'text-slate-600'
                                                  }`}
                                                >
                                                  {time}
                                                </Text>
                                              </TouchableOpacity>
                                            );
                                          })}
                                        </View>
                                      </View>
                                    ),
                                  )
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}

                    {pickDentist && pickDay && pickTime && (
                      <View className="mt-4">
                        <Text className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                          3. Confirm Date
                        </Text>

                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          activeOpacity={0.7}
                          className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex-row items-center justify-between"
                        >
                          <Text
                            className={`text-base font-medium ${
                              date ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {date
                              ? date.toLocaleDateString()
                              : 'Pick a specific date...'}
                          </Text>
                          <Icon name="calendar" size={22} color="#94a3b8" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={date || new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <View className="space-y-8">
                  {/* Section Header */}
                  <View>
                    <Text className="text-2xl font-black text-slate-800 tracking-tight">
                      Review & Confirm
                    </Text>
                    <Text className="text-sm font-medium text-slate-500 mt-1">
                      Please verify your appointment details below.
                    </Text>
                  </View>

                  {/* Details Summary Card */}
                  <View className="bg-white border border-slate-100 rounded-[28px] shadow-sm shadow-slate-100 overflow-hidden">
                    {/* Service Row */}
                    <View className="flex-row items-center p-5 border-b border-slate-50">
                      <View className="w-10 h-10 rounded-full bg-sky-50 items-center justify-center mr-4 border border-sky-100">
                        <Icon name="tooth-outline" size={20} color="#0ea5e9" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                          Service
                        </Text>
                        <Text className="text-base font-bold text-slate-800">
                          {selectedService?.service_name || 'General Dentistry'}
                        </Text>
                      </View>
                    </View>

                    {/* Dentist Row */}
                    <View className="flex-row items-center p-5 border-b border-slate-50">
                      <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
                        <Icon name="doctor" size={20} color="#6366f1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                          Dentist
                        </Text>
                        <Text className="text-base font-bold text-slate-800">
                          {selectedDentist
                            ? `Dr. ${selectedDentist.first_name} ${selectedDentist.last_name}`
                            : 'Unassigned Dentist'}
                        </Text>
                      </View>
                    </View>

                    {/* Schedule Row */}
                    <View className="flex-row items-center p-5 bg-slate-50/50">
                      <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-4 border border-emerald-100">
                        <Icon name="calendar-clock" size={20} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                          Date & Time
                        </Text>
                        <Text className="text-base font-bold text-slate-800">
                          {date?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          • {pickTime}
                        </Text>
                        <Text className="text-sm font-medium text-slate-500 mt-0.5">
                          {pickDay}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Options Section */}
                  <View className="space-y-6">
                    {/* Patient Type */}
                    <View>
                      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">
                        Patient Type
                      </Text>
                      <View className="flex-row flex-wrap gap-3">
                        {appointmentTypes.map(type => {
                          const active = selectedAppointmentTypeId === type.id;
                          return (
                            <TouchableOpacity
                              key={type.id}
                              activeOpacity={0.7}
                              onPress={() =>
                                setSelectedAppointmentTypeId(type.id)
                              }
                              className={`flex-1 min-w-[140px] px-4 py-4 rounded-[20px] border-2 flex-row items-center justify-center shadow-sm ${
                                active
                                  ? 'bg-sky-500 border-sky-500 shadow-sky-500/30'
                                  : 'bg-white border-slate-100 shadow-slate-50'
                              }`}
                            >
                              <Icon
                                name={
                                  type.id === 2 ? 'account-group' : 'account'
                                }
                                size={20}
                                color={active ? '#fff' : '#64748b'}
                                className="mr-2.5"
                              />
                              <Text
                                className={`text-sm font-bold ${
                                  active ? 'text-white' : 'text-slate-700'
                                }`}
                              >
                                {type.appointment_name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Emergency Toggle Card */}
                    <View className="bg-white border border-slate-100 rounded-[24px] p-5 flex-row items-center justify-between shadow-sm shadow-slate-50">
                      <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-10 h-10 bg-rose-50 rounded-full items-center justify-center mr-3 border border-rose-100">
                          <Icon
                            name="alert-plus-outline"
                            size={20}
                            color="#f43f5e"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-slate-800">
                            Emergency Visit
                          </Text>
                          <Text className="text-sm font-medium text-slate-500 mt-0.5 leading-5">
                            Flag this booking as urgent
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={isEmergency}
                        onValueChange={setIsEmergency}
                        trackColor={{ true: '#0ea5e9', false: '#e2e8f0' }}
                        thumbColor={
                          Platform.OS === 'android' ? '#fff' : undefined
                        }
                      />
                    </View>

                    {/* Additional Notes */}
                    <View>
                      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">
                        Additional Notes (Optional)
                      </Text>
                      <TextInput
                        className="bg-white border border-slate-200 rounded-[24px] px-5 py-4 min-h-[120px] text-base text-slate-900 shadow-sm shadow-slate-50"
                        placeholder="Symptoms, concerns, or special requests..."
                        placeholderTextColor="#94a3b8"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  {/* Error Display */}
                  {error ? (
                    <View className="bg-rose-50 border border-rose-100 rounded-[20px] px-5 py-4 flex-row items-center mt-2">
                      <Icon
                        name="alert-circle-outline"
                        size={20}
                        color="#e11d48"
                        className="mr-3"
                      />
                      <Text className="text-rose-600 font-bold flex-1 leading-5 text-sm">
                        {error}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Error Display */}
              {error ? (
                <View className="mt-6 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 flex-row items-center">
                  <Icon
                    name="alert-circle-outline"
                    size={20}
                    color="#e11d48"
                    className="mr-3"
                  />
                  <Text className="text-rose-600 font-semibold flex-1 leading-5">
                    {error}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          )}

          {/* Absolute Footer */}
          {!loading && (
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-5 flex-row gap-4">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (step === 1) {
                    handleClose();
                  } else {
                    setStep(prev => (prev === 2 ? 1 : 2));
                  }
                }}
                className="flex-1 bg-white border-2 border-slate-200 rounded-2xl py-4 items-center justify-center"
              >
                <Text className="font-bold text-slate-600 tracking-wide">
                  {step === 1 ? 'Cancel' : 'Go Back'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (step === 1) {
                    if (bookingMethod !== 'self') {
                      setError('Please choose self booking to continue.');
                      return;
                    }
                    setError('');
                    setStep(2);
                    return;
                  }

                  if (step === 2) {
                    if (!canContinue) {
                      setError(
                        'Please complete service, dentist, time, and date.',
                      );
                      return;
                    }
                    setError('');
                    setStep(3);
                    return;
                  }

                  if (step === 3) {
                    handleSubmit();
                  }
                }}
                className="flex-1 bg-sky-500 rounded-2xl py-4 items-center justify-center"
              >
                <Text className="font-bold text-white tracking-wide text-base">
                  {step === 3 ? 'Confirm Visit' : 'Next Step'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
