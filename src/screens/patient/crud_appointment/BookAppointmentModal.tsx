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

// types
import { ServiceItem,AppointmentType,DentistItem,BookAppointmentModalProps } from '../../../types/patient.appointment.types'; 
  
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
      <View className="flex-1 bg-black/40">
        <SafeAreaView className="flex-1 bg-white rounded-t-3xl mt-auto">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">
              Book Appointment
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-3 text-slate-500">Loading...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              {step === 1 && (
                <View className="space-y-4">
                  <Text className="text-xl font-bold text-slate-900">
                    How would you like to proceed?
                  </Text>
                  <Text className="text-sm text-slate-500">
                    Choose your booking method.
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setBookingMethod('self');
                      setStep(2);
                    }}
                    className="bg-white border border-slate-200 rounded-2xl p-4"
                  >
                    <Text className="text-base font-semibold text-slate-900">
                      Self Booking
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      Pick a dentist and schedule instantly.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setBookingMethod('operator');
                      Linking.openURL('tel:09453690012');
                    }}
                    className="bg-white border border-slate-200 rounded-2xl p-4"
                  >
                    <Text className="text-base font-semibold text-slate-900">
                      Call Operator
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      Speak with our team for assistance.
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === 2 && (
                <View className="space-y-5">
                  <Text className="text-lg font-bold text-slate-900">
                    Select Service
                  </Text>
                  {Object.keys(servicesByType).map(typeName => (
                    <View key={typeName}>
                      <Text className="text-xs text-slate-400 uppercase font-semibold mb-2">
                        {typeName}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {servicesByType[typeName].map(service => {
                          const active =
                            selectedService?.service_id === service.service_id;
                          return (
                            <TouchableOpacity
                              key={service.service_id}
                              onPress={() => {
                                setSelectedService(service);
                                setPickDentist('');
                                setPickDay('');
                                setPickTime('');
                                setDate(null);
                                setError('');
                              }}
                              className={`px-3 py-2 rounded-xl border ${
                                active
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  active ? 'text-white' : 'text-slate-700'
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

                  <Text className="text-lg font-bold text-slate-900 mt-4">
                    Select Dentist & Schedule
                  </Text>

                  {filteredDentists.length === 0 ? (
                    <Text className="text-sm text-slate-500">
                      No dentists available for the selected service.
                    </Text>
                  ) : (
                    filteredDentists.map(dentist => {
                      const scheduleMap = buildScheduleMap(dentist);
                      const isSelected = pickDentist === dentist.id;
                      return (
                        <View
                          key={String(dentist.id)}
                          className="border border-slate-200 rounded-2xl p-4 mb-3"
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setPickDentist(dentist.id);
                              setPickDay('');
                              setPickTime('');
                              setDate(null);
                              setError('');
                            }}
                            className="flex-row justify-between items-center"
                          >
                            <View>
                              <Text className="text-base font-semibold text-slate-900">
                                Dr. {dentist.first_name} {dentist.last_name}
                              </Text>
                              <Text className="text-xs text-slate-500">
                                {dentist.specialty || 'General Dentistry'}
                              </Text>
                            </View>
                            {isSelected ? (
                              <Icon
                                name="check-circle"
                                size={20}
                                color="#4F46E5"
                              />
                            ) : null}
                          </TouchableOpacity>

                          {isSelected && (
                            <View className="mt-3">
                              {Object.keys(scheduleMap).length === 0 ? (
                                <Text className="text-xs text-slate-500">
                                  No schedules available.
                                </Text>
                              ) : (
                                Object.entries(scheduleMap).map(
                                  ([day, times]) => (
                                    <View key={day} className="mt-3">
                                      <Text className="text-xs text-slate-400 uppercase font-semibold">
                                        {day}
                                      </Text>
                                      <View className="flex-row flex-wrap gap-2 mt-2">
                                        {times.map(time => {
                                          const active =
                                            pickDay === day &&
                                            pickTime === time;
                                          return (
                                            <TouchableOpacity
                                              key={time}
                                              onPress={() => {
                                                setPickDay(day);
                                                setPickTime(time);
                                                setDate(null);
                                                setError('');
                                              }}
                                              className={`px-3 py-1.5 rounded-lg border ${
                                                active
                                                  ? 'bg-indigo-50 border-indigo-200'
                                                  : 'bg-white border-slate-200'
                                              }`}
                                            >
                                              <Text
                                                className={`text-xs font-semibold ${
                                                  active
                                                    ? 'text-indigo-700'
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

                              {pickDentist === dentist.id &&
                                pickDay &&
                                pickTime && (
                                  <View className="mt-4">
                                    <Text className="text-xs text-slate-400 uppercase font-semibold">
                                      Select Date
                                    </Text>
                                    <TouchableOpacity
                                      onPress={() => setShowDatePicker(true)}
                                      className="border border-slate-200 rounded-xl px-3 py-3 mt-2"
                                    >
                                      <Text className="text-slate-900">
                                        {date
                                          ? date.toLocaleDateString()
                                          : 'Pick a date'}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}

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

              {step === 3 && (
                <View className="space-y-5">
                  <Text className="text-lg font-bold text-slate-900">
                    Appointment Details
                  </Text>

                  <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <Text className="text-xs text-slate-400 uppercase font-semibold">
                      Summary
                    </Text>
                    <Text className="text-sm text-slate-700 mt-2">
                      {selectedService?.service_name || 'Service'} •{' '}
                      {selectedDentist
                        ? `Dr. ${selectedDentist.first_name} ${selectedDentist.last_name}`
                        : 'Dentist'}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {date ? date.toLocaleDateString() : 'Date'} •{' '}
                      {pickTime || 'Time'} ({pickDay || 'Day'})
                    </Text>
                  </View>

                  <Text className="text-sm font-semibold text-slate-900">
                    Appointment Type
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {appointmentTypes.map(type => {
                      const active = selectedAppointmentTypeId === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => setSelectedAppointmentTypeId(type.id)}
                          className={`px-3 py-2 rounded-xl border ${
                            active
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              active ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {type.appointment_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-900">
                      Emergency
                    </Text>
                    <Switch
                      value={isEmergency}
                      onValueChange={setIsEmergency}
                    />
                  </View>

                  <Text className="text-sm font-semibold text-slate-900">
                    Message (optional)
                  </Text>
                  <TextInput
                    className="border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="Additional notes..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                  />
                </View>
              )}

              {error ? (
                <Text className="text-rose-600 text-sm mt-4">{error}</Text>
              ) : null}
            </ScrollView>
          )}

          {!loading && (
            <View className="flex-row gap-3 px-5 py-4 border-t border-slate-100">
              <TouchableOpacity
                onPress={() => {
                  if (step === 1) {
                    handleClose();
                  } else {
                    setStep(prev => (prev === 2 ? 1 : 2));
                  }
                }}
                className="flex-1 border border-slate-200 rounded-xl py-3 items-center"
              >
                <Text className="text-slate-600 font-semibold">
                  {step === 1 ? 'Close' : 'Back'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
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
                    return;
                  }
                }}
                className="flex-1 bg-indigo-600 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {step === 3 ? 'Submit' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
