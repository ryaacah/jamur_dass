import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { 
  Fredoka_400Regular, 
  Fredoka_500Medium, 
  Fredoka_600SemiBold, 
  Fredoka_700Bold 
} from '@expo-google-fonts/fredoka';
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import SplashScreen from "./splash";

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    // Tunggu sampai font selesai dimuat sebelum menjalankan timer splash screen
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        ExpoSplashScreen.hideAsync();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  // Tampilkan splash screen selama showSplash bernilai true atau font belum dimuat
  if (showSplash || !fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="jurnal" />
      <Stack.Screen name="assesmen" />
      <Stack.Screen name="pertanyaan" />
      <Stack.Screen name="riwayat_dass" />
      <Stack.Screen
        name="tanggal_mood"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
      <Stack.Screen
        name="tanggal_hasil"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </Stack>
  );
}