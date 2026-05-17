import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeleteAppointmentAPI, {
  FetchAppointment,
} from '../../app/api/appointment';
import { AppointmentDOT } from '../../types/screen.appointment.types';
import BookAppointmentModal from './crud_appointment/BookAppointmentModal';
import AppointmentDetailsModal from './crud_appointment/AppointmentDetailsModal';
import EditAppointmentModal from './crud_appointment/EditAppointmentModal';
import { wsManager } from '../../utils/WebsocketManager';

// alert

// types
import { WebSocketMessage } from '../../types/websockets.types';
import { showInfo } from '../../components/alert_message';

// Helper to format the date to "May 16, 2026"
const formatAppointmentDate = (dateString?: string) => {
  if (!dateString) return 'Date TBD';
  try {
    const date = new Date(dateString);
    // Check if valid date
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

// Helper to extract time (if available in your date string), otherwise fallback
const formatAppointmentTime = (dateString?: string, fallbackTime?: string) => {
  if (!dateString) return fallbackTime || 'Time TBD';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallbackTime || 'Time TBD';

    // Only return time if the string likely contains it (e.g., includes 'T' or a colon)
    if (dateString.includes('T') || dateString.includes(':')) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return fallbackTime || 'Time TBD';
  } catch (e) {
    return fallbackTime || 'Time TBD';
  }
};

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-700',
      };
    case 'rejected':
    case 'cancelled':
      return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' };
    default:
      return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' };
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
    const unsubscribe = wsManager.on(
      'notification',
      (payload: WebSocketMessage) => {
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
      },
    );

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

  const handleOpenEdit = (item: any, id: string | null) => {
    setSelectedAppointment(item);
    setSelectedAppointmentId(id);
    setShowEditModal(true);
  };

  const handleOpenDetails = (item: any, id: string | null) => {
    setSelectedAppointment(item);
    setSelectedAppointmentId(id);
    setShowDetailsModal(true);
  };

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
      {/* Enhanced Premium Header */}
      <View className="flex-row justify-between items-end px-5 pt-6 pb-4">
        <View>
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            My Visits
          </Text>
          <Text className="text-sm font-semibold text-slate-500 mt-1">
            Manage your dental schedule
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-sky-500 py-2.5 px-4 rounded-full shadow-md shadow-sky-500/40"
          onPress={() => setShowBookingModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="calendar-plus" size={18} color="#FFF" />
          <Text className="text-white font-bold ml-1.5 text-sm tracking-wide">
            New Visit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 10,
        }}
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
          <View className="mt-10 justify-center items-center px-8 py-12 bg-white rounded-[28px] border-2 border-dashed border-slate-200">
            <Icon name="calendar-blank-outline" size={32} color="#0ea5e9" />
            <Text className="text-lg font-bold text-slate-800 mt-4">
              No upcoming visits
            </Text>
            <TouchableOpacity
              className="mt-6 bg-sky-50 py-3 px-5 rounded-xl"
              onPress={() => setShowBookingModal(true)}
            >
              <Text className="text-sky-600 text-sm font-bold">
                Schedule a visit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointmentsData.map((item: AppointmentDOT, index: number) => {
            const { appointment, dentist } = item;
            const status = appointment?.status || 'Pending';
            const appointmentId = appointment?.id
              ? String(appointment.id)
              : null;
            const statusStyle = getStatusStyles(status);

            return (
              <View
                key={appointment?.id || index}
                className="bg-white p-5 rounded-[28px] shadow-sm elevation-3 mb-4 border border-slate-50"
              >
                {/* Top Row: Formatted Date & Status */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center bg-sky-50 px-3 py-1.5 rounded-xl">
                    <Icon name="calendar-month" size={16} color="#0ea5e9" />
                    <Text className="text-sm font-bold text-sky-600 ml-2">
                      {formatAppointmentDate(appointment?.appointment_date)}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    className={`px-2.5 py-1 rounded-lg border ${statusStyle.bg}`}
                  >
                    <Text
                      className={`text-[10px] uppercase font-extrabold tracking-wider ${statusStyle.text}`}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {/* Middle Row: Details (Time replaced Location) */}
                <View className="mb-5">
                  <Text className="text-lg text-slate-900 font-bold mb-1">
                    {appointment.service_name || 'Dental Appointment'}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Icon name="doctor" size={16} color="#64748b" />
                    <Text className="text-sm text-slate-500 ml-2 font-medium">
                      Dr. {dentist?.first_name} {dentist?.last_name || ''}
                    </Text>
                  </View>

                  {/* Time replaces the generic Location */}
                  <View className="flex-row items-center mt-1.5">
                    <Icon name="clock-outline" size={16} color="#64748b" />
                    <Text className="text-sm text-slate-500 ml-2 font-medium">
                      {formatAppointmentTime(
                        appointment?.appointment_date,
                        appointment?.time,
                      )}
                    </Text>
                  </View>
                </View>

                {/* Bottom Row: Actions */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
                    activeOpacity={0.7}
                    onPress={() => handleOpenEdit(item, appointmentId)}
                  >
                    <Text className="text-slate-700 text-sm font-bold">
                      Reschedule
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-sky-50 py-3.5 rounded-2xl items-center"
                    activeOpacity={0.7}
                    onPress={() => handleOpenDetails(item, appointmentId)}
                  >
                    <Text className="text-sky-600 text-sm font-bold">
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modals */}
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
          setTimeout(() => setShowEditModal(true), 300);
        }}
        onDelete={async () => {
          const delete_status = await DeleteAppointmentAPI(
            selectedAppointmentId,
          );
          console.log(delete_status)
          if (delete_status.status === 'success') {
            showInfo({
              title: 'Appointment Cancelled',
              message: 'Your appointment has been cancelled successfully.',
              type: 'info',
              position: 'top',
              visibilityTime: 3000,
            });
            setShowDetailsModal(false);
            loadAppointments();
          } else {
            console.error(
              'Failed to delete appointment:',
              delete_status.message,
            );
          }
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
