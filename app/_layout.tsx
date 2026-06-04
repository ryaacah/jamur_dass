import {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import SplashScreen from "./splash-screen";
import { addNotificationToInbox, NotificationType } from "../lib/notifications";

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    // Listener untuk notifikasi yang masuk ketika aplikasi sedang berjalan (foreground)
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      addNotificationToInbox({
        type: (data?.type as NotificationType) || 'mood',
        title: title || 'Notifikasi',
        body: body || '',
        time: `Hari ini, ${timeString}`,
      });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;

    // Tunggu sampai font selesai dimuat sebelum merender custom splash screen
    if (fontsLoaded) {
      // Sembunyikan native splash screen agar custom splash screen terlihat
      ExpoSplashScreen.hideAsync();

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  // Jika font belum dimuat, return null (native splash screen akan tetap tampil)
  if (!fontsLoaded) {
    return null;
  }

  // Setelah font dimuat, tampilkan custom splash screen selama showSplash bernilai true
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="questions-dass-21" />
      <Stack.Screen name="dass-history" />
      <Stack.Screen
        name="mood-date"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
      <Stack.Screen
        name="result-date"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </Stack>
  );
}