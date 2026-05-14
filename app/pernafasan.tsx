import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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

  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Animated scale for the breathing button press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const phases = [
    { label: 'Tarik napas...', time: 4, color: colors.accentGreen },
    { label: 'Tahan...', time: 7, color: colors.accentYellow },
    { label: 'Hembuskan...', time: 8, color: colors.accentBlue },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;
          
          // Pindah ke fase pernapasan berikutnya atau berhenti
          if (phaseIndex < 2) {
            const nextPhase = phaseIndex + 1;
            setPhaseIndex(nextPhase);
            triggerAnimation(nextPhase);
            return phases[nextPhase].time;
          } else {
            // Selesai 1 siklus 4-7-8
            setIsActive(false);
            setPhaseIndex(0);
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseIndex]);

  const triggerAnimation = (phase: number) => {
    scaleAnim.stopAnimation();
    if (phase === 0) {
      // Inhale (Membesar)
      Animated.timing(scaleAnim, {
        toValue: 1.25, // Lingkaran membesar 25%
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    } else if (phase === 1) {
      // Hold (Ditahan, dibiarkan di ukuran 1.25)
    } else if (phase === 2) {
      // Exhale (Mengecil kembali)
      Animated.timing(scaleAnim, {
        toValue: 1, // Kembali ke ukuran normal
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleStart = () => {
    if (isActive) return; // Abaikan klik jika animasi sedang berjalan

    // Memulai pernapasan
    setIsActive(true);
    setPhaseIndex(0);
    setTimeLeft(phases[0].time);
    triggerAnimation(0);
  };

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
            onPress={handleStart}
            activeOpacity={isActive ? 1 : 0.8}
            accessibilityLabel={isActive ? "Latihan pernapasan sedang berjalan" : "Mulai latihan pernapasan"}
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.breathingButton,
                { 
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: isActive ? phases[phaseIndex].color : colors.accentCream
                },
              ]}
            >
              {isActive ? (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.breathingPhaseLabelInside}>{phases[phaseIndex].label}</Text>
                  <Text style={styles.breathingTimerInside}>{timeLeft}</Text>
                </View>
              ) : (
                <Text style={styles.breathingButtonText}>Mulai</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Navigation Bar ────────────────────────────────────────── */}
      {!isActive && <BottomNav />}
    </SafeAreaView>
  );
}