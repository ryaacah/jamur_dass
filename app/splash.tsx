import React from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import { styles } from "./index.styles";

// ─── Local Assets ─────────────────────────────────────────────────────────────
const BG_IMAGE = require("../assets/images/bg_splash.png");
const MASCOT_IMAGE = require("../assets/images/splash_icon.png");

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen background texture */}
      <Image
        source={BG_IMAGE}
        style={styles.bgImage}
        resizeMode="cover"
        accessibilityElementsHidden
      />

      {/* Decorative cream blob — bottom left */}
      <View style={styles.blobBottomLeft} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Mushroom mascot */}
        <View style={styles.mascotContainer}>
          <Image
            source={MASCOT_IMAGE}
            style={styles.mascotImage}
            resizeMode="contain"
            accessibilityLabel="Mushroom Mascot"
          />
        </View>

        {/* Brand name + tagline */}
        <View style={styles.textBlock}>
          <Text style={styles.appName}>Mushroom Mood</Text>
          <Text style={styles.tagline}>Ruang aman untuk perasaanmu.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}