importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "muslim-8c21a",
  appId: "1:1000232871603:android:44af7003192d8950a2f2c6",
  apiKey: "AIzaSyB-jsL6kQqpwiMnYZvGEec3r6cKwIVvzOY",
  authDomain: "muslim-8c21a.firebaseapp.com",
  storageBucket: "muslim-8c21a.firebasestorage.app",
  messagingSenderId: "1000232871603"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Helper to save to IndexedDB
function saveNotificationToDB(notification) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AppNotificationsDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      
      const newNotif = {
        id: Math.random().toString(36).substring(2, 15),
        title: notification.title || 'New Notification',
        body: notification.body || '',
        data: notification.data || {},
        timestamp: Date.now(),
        read: false
      };
      
      store.add(newNotif);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = (err) => reject(err);
    };
    
    request.onerror = (err) => reject(err);
  });
}

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/vite.svg',
    data: payload.data
  };

  // Save to IndexedDB
  saveNotificationToDB({
    title: notificationTitle,
    body: notificationOptions.body,
    data: payload.data
  }).catch(console.error);

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Intercept fetch requests for caching offline media
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // We want to intercept media requests if they are in cache
  const isTargetEndpoint = url.pathname.includes('/api/telegram/file/') || 
                           url.pathname.includes('/api/telegram/upload') ||
                           url.pathname.includes('/audio/') || 
                           url.hostname.includes('res.cloudinary.com');

  if (isTargetEndpoint) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch((err) => {
          console.log('[SW] Fetch failed for', url.href, err);
          return new Response(null, { status: 404, statusText: 'Offline and not cached' });
        });
      })
    );
  }
});

