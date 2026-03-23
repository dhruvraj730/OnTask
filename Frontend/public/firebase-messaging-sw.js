importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCCjhThDQuoF5XO8pFZFt51JbXdpD9mbhk",
  authDomain: "ontask-c8d08.firebaseapp.com",
  projectId: "ontask-c8d08",
  storageBucket: "ontask-c8d08.firebasestorage.app",
  messagingSenderId: "524549832040",
  appId: "1:524549832040:web:41ce11f36f77c477f1aadd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Assuming vite.svg or a logo is present
    data: payload.data || (payload.webpush?.fcmOptions?.link ? { link: payload.webpush.fcmOptions.link } : {})
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Extract link or fall back to home
  const link = event.notification.data?.link || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If an existing window points at the intended route, focus it
      for (const client of clientList) {
        if (client.url.includes(link) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});
