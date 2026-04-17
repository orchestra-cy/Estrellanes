import React, { useState } from 'react';
import { ViewStyle,Text, TextInput, View } from 'react-native';

interface CustomTextInterface {
  containerStyle: ViewStyle;
  label: string;
  placeholder: string;
  onChangeText: ()=> void;
  labelStyle: ViewStyle;
  TextInputStyle: ViewStyle;
}

export default function CustomTextInput({
  containerStyle,
  label,
  placeholder,
  onChangeText,
  labelStyle,
  TextInputStyle,
}:CustomTextInterface) {
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={'gray'}
        onChangeText={e => onChangeText(e)}
        style={TextInputStyle}
      />
    </View>
  );
}
