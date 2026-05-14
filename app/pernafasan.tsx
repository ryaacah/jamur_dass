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
// Icon library — swap with your project's icon solution if different
// e.g. @expo/vector-icons, react-native-vector-icons, etc.
// import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './index.styles';

// ─── Props ────────────────────────────────────────────────────────────────────
interface AturPernapasanProps {
  /** Called when the back chevron is pressed */
  onBack?: () => void;
  /** Called when the "Mulai" button is pressed */
  onStart?: () => void;
  /** Called when the home nav button is pressed */
  onNavHome?: () => void;
  /** Called when the chart nav button is pressed */
  onNavChart?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AturPernapasan: React.FC<AturPernapasanProps> = ({
  onBack,
  onStart,
  onNavHome,
  onNavChart,
}) => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* ── Top App Bar ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Kembali"
          accessibilityRole="button"
        >
          {/*
            Replace the Text below with your icon component, e.g.:
            <MaterialIcons name="chevron-left" size={28} color="#47373E" />
          */}
          <Text style={{ fontSize: 28, color: '#47373E', fontWeight: '700' }}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Atur Pernapasan</Text>
        </View>
      </View>

      {/* ── Main Scrollable Content ──────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Instruction Card ─────────────────────────────────────────── */}
        {/* <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Cara Kerja</Text>

          <View style={styles.instructionTextWrapper}>
            <Text style={styles.instructionText}>
              Atur pernafasan mu dengan teknik 4 menarik nafas – 7 menahan
              nafas – 8 menghembuskan nafas
            </Text>
            <Text style={styles.instructionText}>
              Tenangkan pikiran mu dengan menggunakan teknik pernafasan 4-7-8
            </Text>
          </View>
        </View> */}

        {/* ── Breathing Trigger Button ─────────────────────────────────── */}
        <View style={styles.breathingArea}>
          <TouchableOpacity
            onPress={onStart}
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
      <View style={styles.bottomNavWrapper} pointerEvents="box-none">
        <View style={styles.bottomNav}>
          {/* Home */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNavHome}
            activeOpacity={0.7}
            accessibilityLabel="Beranda"
            accessibilityRole="button"
          >
            {/*
              Replace Text below with your icon, e.g.:
              <MaterialIcons name="home" size={30} color="#47373E" />
            */}
            <Text style={{ fontSize: 22, color: '#47373E' }}>⌂</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.navDivider} />

          {/* Chart */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNavChart}
            activeOpacity={0.7}
            accessibilityLabel="Statistik"
            accessibilityRole="button"
          >
            {/*
              Replace Text below with your icon, e.g.:
              <MaterialIcons name="bar-chart" size={30} color="#47373E" />
            */}
            <Text style={{ fontSize: 22, color: '#47373E' }}>📊</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AturPernapasan;