import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, styles } from "./styles";

// ─── Local Assets ─────────────────────────────────────────────────────────────
const MASCOT_IMAGE = require("../assets/images/mur-jur.webp");

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBackBtn}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-back" size={24} color={colors.ink} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, styles.headerTitleNormal]}>Self Assessment</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function MascotSection() {
  return (
    <View style={styles.mascotSection}>
      <View style={styles.mascotWrapper}>
        <Image
          source={MASCOT_IMAGE}
          style={styles.assesmenMascotImage}
          contentFit="contain"
          accessibilityLabel="Spirit Mushroom mascot"
        />
      </View>
    </View>
  );
}

function InstructionCard() {
  return (
    <View style={styles.instructionCard}>
      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={[styles.displayTitle, styles.fontBold]}>DASS-21</Text>
        <View style={styles.timeRow}>
          <Text style={styles.timeIcon}>⏱</Text>
          <Text style={[styles.timeText, styles.fontRegular]}>Estimasi pengerjaan: ~3 menit</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Description */}
      <View style={styles.descBlock}>
        <Text style={[styles.descText, styles.fontRegular]}>
          Tes ini terdiri dari 21 pertanyaan yang dirancang untuk mengukur tingkat{" "}
          <Text style={[styles.descTextBold, styles.fontBold]}>Depresi, Kecemasan, dan Stres</Text>{" "}
          yang mungkin kamu rasakan.
        </Text>
      </View>
    </View>
  );
}

function Tagline() {
  return (
    <Text style={[styles.taglineAssesmen, styles.fontRegular, { fontStyle: "italic" }]}>
      {'"Ambil napas dalam-dalam sebelum memulai..."'}
    </Text>
  );
}

function Footer() {
  return (
    <View style={styles.assesmenFooter}>
      <Link href="./questions-dass-21" asChild>
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnText, styles.fontBold]}>Mulai Sekarang</Text>
          <Text style={styles.startBtnIcon}>›</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Dass21IntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />
      <View style={styles.wrapper}>
        {/* Sticky header */}
        <Header onBack={() => router.back()} />

        {/* Scrollable main content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MascotSection />
          <InstructionCard />
          <Tagline />
        </ScrollView>

        {/* Fixed CTA footer */}
        <Footer />
      </View>
    </SafeAreaView>
  );
}