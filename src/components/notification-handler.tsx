'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function isSupported() {
  if (typeof window === 'undefined') {
    return false;
  }
  return ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
}

async function saveMessagingDeviceToken(userId: string, token: string) {
  if (!db) {
    console.error('Firestore DB not initialized');
    return;
  }
  const tokenRef = doc(db, 'fcmTokens', userId);
  await setDoc(tokenRef, { token }, { merge: true });
  console.log('FCM token saved for user:', userId);
}

export function NotificationHandler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !isSupported()) {
      return;
    }

    const messaging = getMessaging();

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // Get registration token. In development, this will be the browser's FCM token.
          // In production on a web app, you should use a service worker.
          // For mobile apps using Firebase SDKs, the token handling is different.
          // Replace 'YOUR_FIREBASE_VAPID_KEY' with your actual VAPID key from Firebase project settings -> Cloud Messaging -> Web configuration
          const currentToken = await getToken(messaging, { vapidKey: 'YOUR_FIREBASE_VAPID_KEY' });
          if (currentToken) {
            console.log('FCM registration token:', currentToken);
            await saveMessagingDeviceToken(user.uid, currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
            // Show permission request UI if needed.
          }
        } else {
          console.log('Notification permission denied or dismissed.');
          // Handle permission denial.
        }
      } catch (error) {
        console.error('An error occurred while retrieving token.', error);
        // Catch error while getting token.
      }
    };

    requestPermission();

  }, [user]);

  return null; // This component doesn't render anything visible
}