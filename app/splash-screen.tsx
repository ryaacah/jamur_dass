import React from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import { styles } from "./styles";

// ─── Local Assets ─────────────────────────────────────────────────────────────
const BG_IMAGE = require("../assets/images/bg_splash.webp");
const MASCOT_IMAGE = require("../assets/images/splash_icon.webp");

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={BG_IMAGE}
        style={styles.bgImage}
        resizeMode="cover"
        accessibilityElementsHidden
      />

      <View style={styles.blobBottomLeft} />

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Image
            source={MASCOT_IMAGE}
            style={styles.mascotImage}
            resizeMode="contain"
            accessibilityLabel="Mushroom Mascot"
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.appName}>Naung</Text>
          <Text style={styles.tagline}>Satu langkah kecil untuk mengenal dirimu lebih dalam.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}