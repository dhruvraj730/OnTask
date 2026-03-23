const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

try {
  // First attempt: look for explicitly provided path
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
  } else {
    // Second attempt: load the JSON file directly assuming it's in the root of backend
    serviceAccount = require('../firebase-service-account.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin. Push notifications may not work:', error.message);
}

/**
 * Sends a push notification to a specific device via FCM token
 * @param {string} fcmToken - The FCM token of the recipient device
 * @param {string} title - The notification title
 * @param {string} body - The notification body
 * @param {string} link - The URL to open when notification is clicked
 */
const sendPushNotification = async (fcmToken, title, body, link = '/') => {
  if (!fcmToken) return;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    webpush: {
      fcmOptions: {
        link: link
      },
      notification: {
        icon: '/vite.svg', // Chrome silently drops push notifications if the icon 404s!
      }
    },
    token: fcmToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification');
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error.message);
    // Suppress throws here so it doesn't crash the main flow if push fails
  }
};

module.exports = {
  sendPushNotification
};
