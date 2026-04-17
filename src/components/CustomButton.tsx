import React, { useState } from 'react';
import { Text, TextInput, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../utils';

interface CustomButtonInterface {
  containerStyle: ViewStyle;
  textStyle: ViewStyle;
  label: string;
  onPress: () => void;
}

export default function CustomButton({
  containerStyle,
  textStyle,
  label,
  onPress,
}: CustomButtonInterface) {
  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}
