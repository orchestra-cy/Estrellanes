import Toast from 'react-native-toast-message';

interface AlertMessageProps {
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  visibilityTime?: number;
}

export const showError = ({
  title,
  message,
  type,
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type: type,
    position: position,
    visibilityTime: visibilityTime,
  });
};

export const showSuccess = ({
  title,
  message,
  type,
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type: type,
    position: position,
    visibilityTime: visibilityTime,
  });
};

export const showInfo = ({
  title,
  message,
  type,
  position,
  visibilityTime,
}: AlertMessageProps) => {
  Toast.show({
    text1: title,
    text2: message,
    type: type,
    position: position,
    visibilityTime: visibilityTime,
  });
};

