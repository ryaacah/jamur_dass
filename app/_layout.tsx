// _layout.tsx
import {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import SplashScreen from './splash-screen';

ExpoSplashScreen.preventAutoHideAsync();

// Helper cek Expo Go
function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  // ── Init notifikasi ──────────────────────────────────────────────────────
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    const initNotifications = async () => {
      // Expo Go SDK 53+ tidak support push/local notifications sama sekali
      // Inbox in-app tetap berfungsi karena hanya pakai AsyncStorage
      if (isExpoGo()) {
        console.log('Expo Go terdeteksi — sistem notifikasi dinonaktifkan. Inbox in-app tetap aktif.');
        return;
      }

      try {
        const {
          setupNotificationHandler,
          requestLocalNotifPermission,
          syncScheduledNotifications,
          addNotificationToInbox,
        } = await import('../lib/notifications');

        await setupNotificationHandler();

        const granted = await requestLocalNotifPermission();
        if (granted) {
          await syncScheduledNotifications();
        }

        const Notifications = await import('expo-notifications');

        if (typeof Notifications.addNotificationReceivedListener !== 'function') {
          console.log('addNotificationReceivedListener tidak tersedia, skip.');
          return;
        }

        const subscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            const { title, body, data } = notification.request.content;
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
              .getMinutes()
              .toString()
              .padStart(2, '0')}`;
            addNotificationToInbox({
              type: (data?.type as any) || 'mood',
              title: title || 'Notifikasi',
              body: body || '',
              time: `Hari ini, ${timeString}`,
            });
          },
        );

        cleanupFn = () => subscription.remove();
      } catch (e) {
        console.log('Init notifikasi gagal:', e);
      }
    };

    initNotifications();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, []);

  // ── Font & splash ────────────────────────────────────────────────────────
  useEffect(() => {
    if (fontError) throw fontError;

    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) return null;
  if (showSplash) return <SplashScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="questions-dass-21" />
      <Stack.Screen name="dass-history" />
      <Stack.Screen
        name="mood-date"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="result-date"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
    </Stack>
  );
}