import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchHistory } from '../../app/api/appointment';
import { GetUserInfo } from '../../app/api/user';

//types
import type { HistoryDOT } from '../../types/history.types';
import type {
  HistoryItem,
  HistoryResponse,
} from '../../types/patient.history.types';

interface RootState {
  auth: {
    userData?: {
      id?: string | number;
      roles?: string[] | string;
    } | null;
  };
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

export default function HistoryScreen() {
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
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="mt-4 text-slate-500 text-base font-medium tracking-wide">
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Activity History
        </Text>
      </View>

      {history.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8 mx-6 mb-6 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
          <View className="w-20 h-20 rounded-full bg-slate-50 justify-center items-center mb-5">
            <Icon name="history" size={36} color="#94a3b8" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-2">
            No History Yet
          </Text>
          <Text className="text-sm text-slate-500 text-center leading-5 px-2">
            Your appointment logs and account activities will appear here once
            you start booking.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const action = item.action?.toLowerCase() || '';
            
            // Dynamic configuration based on the action type
            let config = {
              icon: 'information-variant',
              iconColor: '#64748b', // slate-500
              bg: 'bg-slate-100',
              label: 'System Activity',
            };

            if (action.includes('create')) {
              config = {
                icon: 'calendar-plus',
                iconColor: '#0ea5e9', // sky-500
                bg: 'bg-sky-50',
                label: 'Appointment Created',
              };
            } else if (action.includes('update')) {
              config = {
                icon: 'calendar-edit',
                iconColor: '#f59e0b', // amber-500
                bg: 'bg-amber-50',
                label: 'Details Updated',
              };
            } else if (action.includes('cancel')) {
              config = {
                icon: 'calendar-remove',
                iconColor: '#e11d48', // rose-600
                bg: 'bg-rose-50',
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

            // Extract the name safely
            const personName = item.patient_first_name || item.dentist_first_name
              ? `${item.patient_first_name || ''} ${item.patient_last_name || ''}`.trim() ||
                `${item.dentist_first_name || ''} ${item.dentist_last_name || ''}`.trim()
              : 'System update';

            return (
              <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4 flex-row items-start">
                {/* Circular Icon Container */}
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${config.bg}`}
                >
                  <Icon name={config.icon} size={24} color={config.iconColor} />
                </View>

                {/* Content */}
                <View className="flex-1 pt-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-base font-bold text-slate-800 flex-1 pr-2">
                      {config.label}
                    </Text>
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                      {dateStr}
                    </Text>
                  </View>
                  
                  <Text className="text-sm font-medium text-slate-500 mb-1">
                    {personName}
                  </Text>
                  
                  <View className="flex-row items-center mt-1">
                    <Icon name="clock-outline" size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-400 font-bold ml-1">
                      {timeStr}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}