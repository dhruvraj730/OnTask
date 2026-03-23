import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const NotificationManager = () => {
  const { user } = useContext(AuthContext);
  usePushNotifications(user);
  return null; // Invisible component acting as logic wrapper
};
