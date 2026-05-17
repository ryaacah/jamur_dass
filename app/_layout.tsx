import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold
} from '@expo-google-fonts/fredoka';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import SplashScreen from "./splash-screen";

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;

    // Tunggu sampai font selesai dimuat sebelum menjalankan timer splash screen
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        ExpoSplashScreen.hideAsync();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  // Tampilkan splash screen selama showSplash bernilai true atau font belum dimuat
  if (showSplash || !fontsLoaded) {
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