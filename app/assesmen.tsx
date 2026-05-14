import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image } from "expo-image";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, styles } from "./index.styles";

// ─── Local Assets ─────────────────────────────────────────────────────────────
const MASCOT_IMAGE = require("../assets/images/splash_icon.png");

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
      <Text style={styles.headerTitle}>Self Assessment</Text>
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
        {/* Speech bubble */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>Kamu bisa!</Text>
        </View>
      </View>
    </View>
  );
}

function BentoMetaGrid() {
  return (
    <View style={styles.bentoGrid}>
      {/* 21 Soal */}
      <View style={[styles.assesmenBentoCell, styles.bentoCellTertiary]}>
        <Text style={styles.bentoIcon}>❓</Text>
        <Text style={styles.bentoValueTertiary}>21 Soal</Text>
        <Text style={styles.bentoLabelTertiary}>Singkat & Padat</Text>
      </View>

      {/* Privasi */}
      <View style={[styles.assesmenBentoCell, styles.bentoCellSecondary]}>
        <Text style={styles.bentoIcon}>🛡️</Text>
        <Text style={styles.bentoValueSecondary}>Privasi</Text>
        <Text style={styles.bentoLabelSecondary}>100% Aman</Text>
      </View>
    </View>
  );
}

function InstructionCard() {
  return (
    <View style={styles.instructionCard}>
      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={styles.displayTitle}>DASS-21</Text>
        <View style={styles.timeRow}>
          <Text style={styles.timeIcon}>⏱</Text>
          <Text style={styles.timeText}>Estimasi waktu: ~3 menit</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Description */}
      <View style={styles.descBlock}>
        <Text style={styles.descText}>
          Kuesioner ini terdiri dari 21 pertanyaan singkat yang dirancang untuk
          membantumu mengukur tingkat{" "}
          <Text style={styles.descTextBold}>depresi, kecemasan,</Text> dan{" "}
          <Text style={styles.descTextBold}>stres</Text> yang mungkin kamu
          rasakan.
        </Text>

        {/* Instruction box */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionBoxTitle}>Petunjuk Pengerjaan:</Text>
          <Text style={styles.instructionBoxText}>
            Pilihlah jawaban yang paling menggambarkan perasaanmu selama{" "}
            <Text style={{ fontWeight: "700" }}>seminggu terakhir</Text>.{" "}
            Tidak ada jawaban benar atau salah, cukup pilih yang paling jujur
            menurut hatimu.
          </Text>
        </View>
      </View>

      {/* Bento meta */}
      <BentoMetaGrid />
    </View>
  );
}

function Tagline() {
  return (
    <Text style={styles.taglineAssesmen}>
      {'"Ambil napas dalam-dalam sebelum memulai..."'}
    </Text>
  );
}

function Footer({ onStart }: { onStart?: () => void }) {
  return (
    <View style={styles.assesmenFooter}>
      <TouchableOpacity
        style={styles.startBtn}
        onPress={onStart}
        activeOpacity={0.85}
      >
        <Text style={styles.startBtnText}>Mulai Sekarang</Text>
        <Text style={styles.startBtnIcon}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Dass21IntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Footer onStart={() => router.push("/pertanyaan")} />
      </View>
    </SafeAreaView>
  );
}