importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCUsq3OnLz9UTRGeHhecALPCIgIw7Zy6EE",
  authDomain: "lifedrop-54676.firebaseapp.com",
  projectId: "lifedrop-54676",
  storageBucket: "lifedrop-54676.firebasestorage.app",
  messagingSenderId: "483162279996",
  appId: "1:483162279996:web:9e5f2c4d11953a3d5ff339"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
