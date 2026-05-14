import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, styles } from './index.styles';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScoreCategory = 'Normal' | 'Ringan' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

interface ScoreItem {
  label: string;
  value: number;
  category: ScoreCategory;
  /** fraction 0–1 relative to chart height */
  heightRatio: number;
  barStyle: object;
}

interface DassData {
  date: string;
  scores: ScoreItem[];
  total: number;
  totalCategory: ScoreCategory;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Category → Y-axis position mapping (0 = bottom = Normal)
const LEVEL_RATIOS: Record<ScoreCategory, number> = {
  Normal: 0.15,
  Ringan: 0.38,
  Sedang: 0.62,
  Tinggi: 0.82,
  'Sangat Tinggi': 0.95,
};

const MOCK_DATA: DassData = {
  date: '20 Feb 2026',
  scores: [
    {
      label: 'Depresi',
      value: 14,
      category: 'Sedang',
      heightRatio: LEVEL_RATIOS['Sedang'],
      barStyle: styles.barDepresi,
    },
    {
      label: 'Kecemasan',
      value: 14,
      category: 'Sedang',
      heightRatio: LEVEL_RATIOS['Sedang'],
      barStyle: styles.barKecemasan,
    },
    {
      label: 'Stres',
      value: 14,
      category: 'Sedang',
      heightRatio: LEVEL_RATIOS['Sedang'],
      barStyle: styles.barStres,
    },
  ],
  total: 42,
  totalCategory: 'Sedang',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRow({
  label,
  value,
  category,
  isTotal = false,
}: {
  label: string;
  value: number;
  category: ScoreCategory;
  isTotal?: boolean;
}) {
  return (
    <View style={styles.scoreRow}>
      <Text style={isTotal ? styles.totalLabel : styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreValueGroup}>
        <Text style={isTotal ? styles.totalValue : styles.scoreValue}>: {value}</Text>
        <Text style={isTotal ? styles.totalCategory : styles.scoreCategory}>{category}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DassHistoryScreen() {
  const [activeNav, setActiveNav] = useState<'home' | 'chart'>('chart');
  const [data] = useState<DassData>(MOCK_DATA);
  const router = useRouter();

  const handleDateSelect = () => {
    // TODO: open date picker
    console.log('Open date picker');
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Riwayat Skor DASS-21
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Date Selector ── */}
        <TouchableOpacity
          style={[styles.card, styles.dateSelectorCard]}
          onPress={handleDateSelect}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Pilih tanggal, saat ini ${data.date}`}
        >
          <Text style={styles.dateSelectorText}>{data.date}</Text>
          <View style={styles.dateSelectorButton}>
            <Icon name="keyboard-arrow-down" size={24} color={colors.ink} />
          </View>
        </TouchableOpacity>

        {/* ── Bar Chart Card ── */}
        <View style={[styles.card, { gap: 16 }]}>
          <View style={styles.chartContainer}>
            {/* Y-Axis Labels */}
            <View style={styles.yAxis}>
              {(['Tinggi', 'Sedang', 'Ringan', 'Normal'] as const).map((level) => (
                <Text key={level} style={styles.yLabel}>
                  {level}
                </Text>
              ))}
            </View>

            {/* Chart Area */}
            <View style={styles.barsArea}>
              {/* Grid Lines */}
              {[0, 33, 66, 100].map((pct) => (
                <View
                  key={pct}
                  style={[
                    styles.gridLine,
                    { bottom: `${pct}%` as any },
                  ]}
                />
              ))}

              {/* Bars */}
              {data.scores.map((item) => {
                const barHeight = Math.max(100 * item.heightRatio, 16);
                return (
                  <View key={item.label} style={styles.barWrapper}>
                    <View style={[styles.bar, item.barStyle, { height: barHeight }]} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* X-Axis Labels */}
          <View style={styles.xAxis}>
            {data.scores.map((item) => (
              <Text key={item.label} style={styles.xLabel}>
                {item.label}
              </Text>
            ))}
          </View>
        </View>

        {/* ── Score Breakdown Card ── */}
        <View style={[styles.card, styles.breakdownCard]}>
          <Text style={styles.breakdownTitle}>Skor Hasil Tes DASS-21</Text>

          {data.scores.map((item) => (
            <ScoreRow
              key={item.label}
              label={`Skor ${item.label}`}
              value={item.value}
              category={item.category}
            />
          ))}

          <View style={styles.divider} />

          <ScoreRow
            label="Total Skor"
            value={data.total}
            category={data.totalCategory}
            isTotal
          />
        </View>

        {/* ── Warning Card ── */}
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Hasil skor kamu termasuk kedalam kategori sedang jika kamu merasa kondisi ini
            mengganggu aktivitas sehari-hari, kamu dapat mempertimbangkan untuk berkonsultasi
            dengan profesional.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Nav Bar ── */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, activeNav === 'home' && styles.navItemActive]}
            activeOpacity={0.7}
            onPress={() => router.push('/')}
          >
            <Text style={[styles.navIcon, activeNav === 'home' && { color: colors.ink }]}>
              ⌂
            </Text>
          </TouchableOpacity>

          <View style={styles.navDivider} />

          <TouchableOpacity
            style={[styles.navItem, activeNav === 'chart' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navIcon, activeNav === 'chart' && { color: colors.ink }]}>
              ▦
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}