import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import SplashScreen from "./splash";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mengatur waktu tampil splash screen (misal: 3000 ms / 3 detik)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
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
