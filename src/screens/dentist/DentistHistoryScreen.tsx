import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchHistory } from '../../app/api/appointment';
import { GetUserInfo } from '../../app/api/user';
import type { HistoryDOT } from '../../types/history.types';

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
      id?: string | number;
      roles?: string[] | string;
    } | null;
  };
}

interface HistoryResponse {
  status?: string;
  data?: HistoryItem[];
}

const normalizeRole = (roles?: string[] | string | null) => {
  if (!roles) return null;
  const rawRoles = Array.isArray(roles) ? roles : [roles];
  const expanded = rawRoles.flatMap(entry => {
    const trimmed = String(entry).trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  });

  const normalized = expanded
    .map(role =>
      role
        .replace(/[[\]"]+/g, '')
        .replace('ROLE_', '')
        .toUpperCase(),
    )
    .filter(Boolean);

  return normalized[0] || null;
};

export default function DentistHistoryScreen() {
  const auth = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      const roleFromStore = normalizeRole(auth?.userData?.roles);
      const userIdFromStore = auth?.userData?.id;

      let userId = userIdFromStore ? String(userIdFromStore) : '';
      let role = roleFromStore || '';

      if (!userId || !role) {
        try {
          const info = await GetUserInfo();
          userId = info?.user?.id ? String(info.user.id) : userId;
          role = normalizeRole(info?.user?.roles) || role;
        } catch (e) {
          console.error(e);
        }
      }

      if (!userId || !role) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const payload: HistoryDOT = {
          userID: userId,
          role,
        };
        const response = (await fetchHistory(payload)) as HistoryResponse;
        if (isMounted) {
          setHistory(response?.data || []);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setHistory([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [auth?.userData?.id, auth?.userData?.roles]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-5">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 text-base font-medium">
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-slate-900">
          Appointment History
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
            Logs will appear here once appointments are updated.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const action = item.action?.toLowerCase() || '';
            let config = {
              icon: 'information',
              color: '#4F46E5',
              label: 'System Activity',
            };

            if (action.includes('create')) {
              config = {
                icon: 'plus',
                color: '#4F46E5',
                label: 'Appointment Created',
              };
            } else if (action.includes('update')) {
              config = {
                icon: 'pencil',
                color: '#D97706',
                label: 'Details Updated',
              };
            } else if (action.includes('cancel')) {
              config = {
                icon: 'close-circle',
                color: '#E11D48',
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
              <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
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
                <Text className="text-sm text-slate-500">
                  {item.patient_first_name || item.dentist_first_name
                    ? `${item.patient_first_name || ''} ${item.patient_last_name || ''}`.trim() ||
                      `${item.dentist_first_name || ''} ${item.dentist_last_name || ''}`.trim()
                    : 'Activity logged'}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
