import { useEffect, useState, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axios from 'axios';
import toast from 'react-hot-toast';

export const usePushNotifications = (user) => {
  const [fcmToken, setFcmToken] = useState(null);
  const hasRequested = useRef(false);

  useEffect(() => {
    // Only request tokens if we have a logged-in user and messaging is supported
    if (!user || !messaging || hasRequested.current) return;

    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          hasRequested.current = true;
          
          let registration;
          try {
            // Explicitly register the service worker before letting Firebase touch it
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;
          } catch (swErr) {
            console.error('Failed to register service worker:', swErr);
            return;
          }

          // Your VAPID Public Key here
          const currentToken = await getToken(messaging, { 
            vapidKey: 'BPLJa_s5cDPyU1XzMyu-kRLu1HWovm0hlNLcGuxrhUmI7nqu0l_UbH347BilPu28IzGkx0bSmzp50ZtNTVZjRN4',
            serviceWorkerRegistration: registration
          });
          
          if (currentToken) {
            setFcmToken(currentToken);
            // Send the token to the backend
            await axios.put('/api/notifications/fcm-token', { fcmToken: currentToken });
            console.log("FCM Token securely saved to database.");
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Push notification permission denied by user.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token or saving it: ', err);
      }
    };

    requestPermissionAndGetToken();

    // Listen to foreground messages and show toast alerts
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Force native OS push notification even when the tab is currently open and focused!
      if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'OnTask Notification', {
              body: payload.notification?.body,
              icon: '/vite.svg'
          });
      }

      toast(
        (t) => (
          <div className="flex flex-col cursor-pointer" onClick={() => {
            const link = payload.data?.link || payload.webpush?.fcmOptions?.link;
            if (link) {
              window.location.href = link;
            }
            toast.dismiss(t.id);
          }}>
            <strong className="text-sm font-semibold">{payload.notification?.title}</strong>
            <span className="text-sm">{payload.notification?.body}</span>
          </div>
        ),
        { duration: 5000, position: 'top-center' }
      );
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return { fcmToken };
};

export default usePushNotifications;
