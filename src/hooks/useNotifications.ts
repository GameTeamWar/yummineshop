import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '@/lib/firebase';

export const useNotifications = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR kontrolü

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey || vapidKey === 'your-vapid-key-here') {
      console.warn('VAPID key ayarlanmamış. Firebase Console\'dan VAPID key alın ve .env.local\'a NEXT_PUBLIC_FIREBASE_VAPID_KEY olarak ekleyin.');
      return;
    }

    const messaging = getMessaging(app);

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey,
          });
          console.log('FCM Token:', token);
          // Token'ı Firestore'a kaydet
        }
      } catch (error) {
        console.error('Bildirim izni alınamadı:', error);
      }
    };

    requestPermission();

    // Mesaj dinleme
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mesaj alındı:', payload);
      // Bildirim göster
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Yummine', {
          body: payload.notification?.body,
          icon: '/favicon.ico',
        });
      }
    });

    return () => unsubscribe();
  }, []);
};