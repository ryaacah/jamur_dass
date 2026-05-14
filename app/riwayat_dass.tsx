import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import BottomNav from '../components/BottomNav';
import { BAR_COLORS, colors, styles } from './index.styles';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScoreCategory = 'Normal' | 'Ringan' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

interface ScoreItem {
  label: string;
  value: number;
  category: ScoreCategory;
}

interface DassData {
  date: string;
  scores: ScoreItem[];
  total: number;
  totalCategory: ScoreCategory;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MOCK_DATA: DassData = {
  date: '20 Feb 2026',
  scores: [
    { label: 'Depresi', value: 14, category: 'Sedang' },
    { label: 'Kecemasan', value: 14, category: 'Sedang' },
    { label: 'Stres', value: 14, category: 'Sedang' },
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

function ChartLegend() {
  return (
    <View style={styles.chartLegendContainer}>
      {Object.entries(BAR_COLORS).map(([label, color]) => (
        <View key={label} style={styles.chartLegendItem}>
          <View style={[styles.chartLegendColorBox, { backgroundColor: color }]} />
          <Text style={styles.chartLegendLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DassHistoryScreen() {
  const [data] = useState<DassData>(MOCK_DATA);
  const router = useRouter();

  const chartData = data.scores.map((item) => ({
    x: item.label,
    y: item.value,
  }));

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

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
          onPress={() => router.push('/tanggal_hasil')}
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
        <View style={StyleSheet.flatten([styles.card, styles.chartCard])}>
          <VictoryChart
            height={220}
            domainPadding={{ x: 40 }}
            padding={{ top: 20, bottom: 40, left: 56, right: 20 }}
            domain={{ y: [0, 21] }}
          >
            {/* Y-Axis */}
            <VictoryAxis
              dependentAxis
              tickValues={[0, 7, 14, 21]}
              tickFormat={(t: number) => {
                if (t === 0) return 'Normal';
                if (t === 7) return 'Ringan';
                if (t === 14) return 'Sedang';
                if (t === 21) return 'Tinggi';
                return '';
              }}
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 10, fill: colors.ink, fontFamily: 'System' },
                grid: { stroke: '#E8E0D0', strokeWidth: 0.5, strokeDasharray: '4,4' },
              }}
            />

            {/* X-Axis */}
            <VictoryAxis
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 11, fill: colors.ink, fontFamily: 'System' },
                grid: { stroke: 'transparent' },
              }}
            />

            {/* Bars */}
            <VictoryBar
              data={chartData}
              cornerRadius={{ top: 6 }}
              style={{
                data: {
                  fill: ({ datum }: any) =>
                    BAR_COLORS[datum?.x] ?? '#C4B49A',
                  width: 32,
                },
              }}
            />
          </VictoryChart>

          <ChartLegend />
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
      <BottomNav active="chart" />
    </SafeAreaView>
  );
}