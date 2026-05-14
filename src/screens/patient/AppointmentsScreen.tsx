import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView, // Changed from FlatList
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl, // Added for pull-to-refresh
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FetchAppointment } from '../../app/api/appointment';
import { AppointmentDOT } from '../../types/screen.appointment.types';
import BookAppointmentModal from './crud_appointment/BookAppointmentModal';
import AppointmentDetailsModal from './crud_appointment/AppointmentDetailsModal';
import EditAppointmentModal from './crud_appointment/EditAppointmentModal';
import { wsManager } from '../../utils/WebsocketManager';


// types
import { WebSocketMessage } from '../../types/websockets.types';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    case 'rejected':
    case 'cancelled':
      return 'bg-rose-50 border-rose-100 text-rose-700';
    default:
      return 'bg-amber-50 border-amber-100 text-amber-700';
  }
};

export default function AppointmentsScreen() {
  const [appointmentsData, setAppointmentsData] = useState<AppointmentDOT>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null,
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  useEffect(() => {
  // listens to notification and extracts data
    const unsubscribe = wsManager.on('notification', (payload:WebSocketMessage) => {
      if (payload.type === 'appointment_update') {
        setAppointmentsData((prevData: AppointmentDOT) =>
          prevData.map((item: AppointmentDOT) => {
            if (
              item.appointment &&
              item.appointment.id === payload.appointmentId
            ) {
              return {
                ...item,
                appointment: {
                  ...item.appointment,
                  status: payload.newStatus.toLowerCase(), 
                },
              };
            }
            return item; 
          }),
        );
      }
    });

    // Cleanup the listener when the user leaves the screen
    return () => unsubscribe();
  }, []);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FetchAppointment();
      if (data && data.status === 'ok' && Array.isArray(data.appointments)) {
        setAppointmentsData(data.appointments);
      } else {
        setAppointmentsData([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  }, [loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="mt-4 text-slate-500 text-base font-medium">
            Loading Schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Static Header */}
      <View className="flex-row justify-between items-center px-5 pt-4 pb-3">
        <View>
          <Text className="text-2xl font-extrabold text-slate-800">
            My Visits
          </Text>
          <Text className="text-xs font-medium text-slate-500">
            Manage your dental appointments
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-sky-500 py-2 px-3.5 rounded-xl"
          onPress={() => setShowBookingModal(true)}
        >
          <Icon name="plus" size={16} color="#FFF" />
          <Text className="text-white font-bold ml-1 text-xs">Book</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content using Map */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            color="#0ea5e9"
          />
        }
      >
        {appointmentsData.length === 0 ? (
          <View className="mt-10 justify-center items-center px-8 py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Icon name="calendar-blank-outline" size={32} color="#0ea5e9" />
            <Text className="text-lg font-bold text-slate-800 mt-4">
              No upcoming visits
            </Text>
            <TouchableOpacity
              className="mt-6 bg-sky-50 py-3 px-5 rounded-xl"
              onPress={() => setShowBookingModal(true)}
            >
              <Text className="text-sky-600 text-xs font-bold">
                Schedule a visit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointmentsData.map((item, index) => {
            const { appointment, dentist } = item;
            const status = appointment?.status || 'Pending';

            return (
              <TouchableOpacity
                key={appointment?.id || index}
                onPress={() => {
                  setSelectedAppointment(item);
                  setSelectedAppointmentId(
                    appointment?.id ? String(appointment.id) : null,
                  );
                  setShowDetailsModal(true);
                }}
                className="bg-white p-2.5 rounded-xl mb-2 shadow-sm border border-slate-100 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-8 h-8 rounded-full bg-sky-50 items-center justify-center mr-2.5">
                    <Icon name="doctor" size={16} color="#0ea5e9" />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm font-bold text-slate-800"
                      numberOfLines={1}
                    >
                      Dr. {dentist?.first_name} {dentist?.last_name || ''}
                    </Text>
                    <Text className="text-[10px] text-slate-500 mb-1">
                      {dentist?.specialty || 'General Dentistry'}
                    </Text>
                    <View className="flex-row items-center bg-slate-50 self-start px-1.5 py-0.5 rounded border border-slate-100">
                      <Icon
                        name="calendar-clock-outline"
                        size={10}
                        color="#0ea5e9"
                      />
                      <Text className="text-[9px] text-slate-600 font-bold ml-1">
                        {appointment?.appointment_date || 'Time TBD'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-end">
                  <View
                    className={`px-1.5 py-0.5 rounded border ${getStatusColor(status)}`}
                  >
                    <Text className="text-[8px] uppercase font-extrabold">
                      {status}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={14}
                    color="#94a3b8"
                    style={{ marginTop: 8 }}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modals remain exactly the same */}
      <BookAppointmentModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={loadAppointments}
      />
      <AppointmentDetailsModal
        visible={showDetailsModal}
        appointmentData={selectedAppointment}
        onClose={() => setShowDetailsModal(false)}
        onEdit={() => {
          setShowDetailsModal(false);
          setShowEditModal(true);
        }}
        onDelete={() => {
          /* ... existing delete logic ... */
        }}
      />
      <EditAppointmentModal
        visible={showEditModal}
        appointmentId={selectedAppointmentId}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadAppointments}
      />
    </SafeAreaView>
  );
}
