import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import CustomeTextInput from '../../components/CustomTextInput';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../utils';
import { IMG } from '../../utils';
import CustomButton from '../../components/CustomButton';
import { useDispatch } from 'react-redux';
import { authLogin } from '../../app/action';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
      }}
    >
      <Image
        source={IMG.LOGO}
        style={{
          width: '30%',
          height: '13%',
          margin: '20',
        }}
      />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '20%',
          // borderWidth: 1,
          width: '100%',
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <CustomeTextInput
          label={'Enter Username'}
          placeholder={'Enter your username'}
          onChangeText={setUsername}
          labelStyle={{ color: 'black' }}
          TextInputStyle={{
            borderBottomWidth: 1,
            color: 'black',
            // borderWidth: 1,
            // borderColor: 'gray',
          }}
          containerStyle={{
            width: '100%',
          }}
        />

        <CustomeTextInput
          label={'Enter Password'}
          placeholder={'Enter your Password'}
          onChangeText={setPassword}
          labelStyle={{ color: 'black' }}
          TextInputStyle={{
            borderBottomWidth: 1,
            color: 'black',
            // borderWidth: 1,
            // borderColor: 'gray',
          }}
          containerStyle={{
            width: '100%',
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <CustomButton
          label={'Login'}
          containerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0377FF',
            padding: 10,
            borderRadius: 20,
          }}
          textStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
          onPress={() => {
            console.log('Credentials', `u: ${username} p: ${password} `);
            dispatch(authLogin({ username, password }));
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Create an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{ color: 'red', marginLeft: 10, fontWeight: 'bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
