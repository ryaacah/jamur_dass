import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import { colors, styles } from './index.styles';

// ─── Component ────────────────────────────────────────────────────────────────
export default function AturPernapasan() {
  const router = useRouter();

  // Animated scale for the breathing button press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* ── Top App Bar ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Kembali"
          accessibilityRole="button"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Atur Pernapasan</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ── Main Scrollable Content ──────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Instruction Card ─────────────────────────────────────────── */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionBoxTitle}>Cara Kerja</Text>

          <View style={styles.descBlock}>
            <Text style={styles.descText}>
              Atur pernafasan mu dengan teknik 4 menarik nafas – 7 menahan
              nafas – 8 menghembuskan nafas
            </Text>
            <Text style={styles.descText}>
              Tenangkan pikiran mu dengan menggunakan teknik pernafasan 4-7-8
            </Text>
          </View>
        </View>

        {/* ── Breathing Trigger Button ─────────────────────────────────── */}
        <View style={styles.breathingArea}>
          <TouchableOpacity
            onPress={() => {}} // TODO: Tambahkan trigger animasi kedepannya
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            accessibilityLabel="Mulai latihan pernapasan"
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.breathingButton,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.breathingButtonText}>Mulai</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Navigation Bar ────────────────────────────────────────── */}
      <BottomNav />
    </SafeAreaView>
  );
}