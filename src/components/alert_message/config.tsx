import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfig, ToastProps } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// A shared base layout for all toasts to ensure perfect consistency
const ToastCard = ({ 
  props, 
  iconName, 
  iconColor, 
  bgClass, 
  borderClass 
}: { 
  props: ToastProps; 
  iconName: string; 
  iconColor: string; 
  bgClass: string; 
  borderClass: string;
}) => (
  <View className="w-[92%] bg-white rounded-[20px] shadow-lg shadow-slate-200/50 elevation-10 border border-slate-100 flex-row items-center p-4">
    {/* Colored Icon Badge */}
    <View className={`w-10 h-10 rounded-full ${bgClass} ${borderClass} border items-center justify-center mr-3`}>
      <Icon name={iconName} size={22} color={iconColor} />
    </View>
    
    {/* Text Content */}
    <View className="flex-1 justify-center">
      <Text className="text-sm font-extrabold text-slate-800 tracking-wide">
        {props.text1}
      </Text>
      {!!props.text2 && (
        <Text className="text-xs font-medium text-slate-500 mt-0.5 leading-4">
          {props.text2}
        </Text>
      )}
    </View>
  </View>
);

const toastConfig: ToastConfig = {
  success: (props) => (
    <ToastCard 
      props={props}
      iconName="check-circle"
      iconColor="#10b981" // emerald-500
      bgClass="bg-emerald-50"
      borderClass="border-emerald-100"
    />
  ),

  error: (props) => (
    <ToastCard 
      props={props}
      iconName="alert-circle"
      iconColor="#f43f5e" // rose-500
      bgClass="bg-rose-50"
      borderClass="border-rose-100"
    />
  ),

  info: (props) => (
    <ToastCard 
      props={props}
      iconName="information"
      iconColor="#0ea5e9" // sky-500
      bgClass="bg-sky-50"
      borderClass="border-sky-100"
    />
  ),

  // You can even add custom types easily now, like a warning!
  warning: (props) => (
    <ToastCard 
      props={props}
      iconName="alert"
      iconColor="#f59e0b" // amber-500
      bgClass="bg-amber-50"
      borderClass="border-amber-100"
    />
  ),
};

export default toastConfig;