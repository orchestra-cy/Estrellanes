import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchHistory } from '../app/api/appointment';
import type { HistoryDOT } from '../types/history.types';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface HistoryItem {
  action?: string;
  logged_at: string | number | Date;
  actor_type?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  dentist_first_name?: string;
  dentist_last_name?: string;
}

interface RootState {
  auth: {
    userData?: {
      id: string;
      roles: string | string[];
    };
  };
}

export default function HistoryScreen() {
  console.log('history screen');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);
  console.log('auth', auth);
  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.userData?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const roleRaw = auth.userData.roles;
        const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
        const normalizedRole = role
          ? String(role)
              .replace(/[[\]"]+/g, '')
              .replace('ROLE_', '')
          : 'USER';

        const payload: HistoryDOT = {
          userID: auth.userData.id,
          role: normalizedRole,
        };
        const response = await fetchHistory(payload);
        console.log('history ya');
        console.log(response);
        if (response?.status === 'ok') {
          console.log(response.data);
          setHistory(response.data || []);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth?.userData?.id, auth?.userData?.roles]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading timeline...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-slate-900">
          Activity History
        </Text>
      </View>

      {history.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 mx-5 mb-5 bg-white rounded-3xl border border-dashed border-slate-200">
          <View className="w-16 h-16 rounded-full bg-slate-50 justify-center items-center mb-4">
            <Icon name="clock-outline" size={32} color="#CBD5E1" />
          </View>
          <Text className="text-xl font-bold text-slate-900 mb-2">
            No History Yet
          </Text>
          <Text className="text-sm text-slate-500 text-center">
            Once you create, update, or cancel appointments, the detailed logs
            will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isLast = index === history.length - 1;

            let config = {
              icon: 'information',
              color: '#4F46E5', // Indigo 600
              bgColor: 'bg-indigo-50',
              dotColor: 'bg-indigo-400',
              label: 'System Activity',
            };

            const action = item.action?.toLowerCase() || '';
            if (action.includes('create')) {
              config = {
                icon: 'plus',
                color: '#4F46E5', // Indigo 600
                bgColor: 'bg-indigo-50',
                dotColor: 'bg-indigo-400',
                label: 'Appointment Created',
              };
            } else if (action.includes('update')) {
              config = {
                icon: 'pencil',
                color: '#D97706', // Amber 600
                bgColor: 'bg-amber-50',
                dotColor: 'bg-amber-400',
                label: 'Details Updated',
              };
            } else if (action.includes('cancel')) {
              config = {
                icon: 'close-circle',
                color: '#E11D48', // Rose 600
                bgColor: 'bg-rose-50',
                dotColor: 'bg-rose-400',
                label: 'Appointment Cancelled',
              };
            }

            const logDate = new Date(item.logged_at);
            const dateStr = logDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const timeStr = logDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <View className="relative pl-8 mb-6">
                {/* Timeline Line */}
                {!isLast && (
                  <View className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-200" />
                )}

                {/* Timeline Dot */}
                <View
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-slate-50 shadow-sm flex items-center justify-center z-10 ${config.bgColor}`}
                >
                  <View className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                </View>

                {/* Card */}
                <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                      <Icon name={config.icon} size={20} color={config.color} />
                      <Text className="text-base font-bold text-slate-900">
                        {config.label}
                      </Text>
                    </View>
                    <View className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <Text className="text-xs text-slate-500 font-medium">
                        {dateStr} • {timeStr}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2 mt-2">
                    <View
                      className={`px-2 py-0.5 rounded-full border ${item.actor_type === 'PATIENT' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase ${item.actor_type === 'PATIENT' ? 'text-blue-600' : 'text-emerald-600'}`}
                      >
                        {item.actor_type}
                      </Text>
                    </View>
                    <Text className="text-sm text-slate-600 font-medium">
                      {item.actor_type === 'PATIENT'
                        ? `${item.patient_first_name || ''} ${item.patient_last_name || ''}`
                        : `Dr. ${item.dentist_first_name || ''} ${item.dentist_last_name || ''}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            history.length > 0 ? (
              <View className="flex-row items-center ml-1 mt-2 opacity-50">
                <View className="w-2 h-2 rounded-full bg-slate-300 mr-3" />
                <Text className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Start of Records
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
