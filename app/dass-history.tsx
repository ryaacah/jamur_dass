import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';
import BottomNav from '../components/BottomNav';
import { BAR_COLORS, colors, styles } from './styles';

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

const HISTORY_LIST = [
  { id: '1', date: '20 Feb 2026', total: 42, category: 'Sedang' },
  { id: '2', date: '15 Jan 2026', total: 20, category: 'Normal' },
  { id: '3', date: '10 Dec 2025', total: 54, category: 'Tinggi' },
  { id: '4', date: '05 Nov 2025', total: 60, category: 'Sangat Tinggi' },
  { id: '5', date: '01 Oct 2025', total: 30, category: 'Ringan' },
  { id: '6', date: '12 Sep 2025', total: 42, category: 'Sedang' },
];

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
  const [data, setData] = useState<DassData>(MOCK_DATA);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const router = useRouter();

  const chartData = data.scores.map((item) => ({
    x: item.label,
    y: item.value,
  }));

  const { width } = Dimensions.get('window');
  const chartWidth = width - 64;

  return (
    <SafeAreaView style={styles.safeArea}>
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
          onPress={() => setHistoryModalVisible(true)}
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
            width={chartWidth}
            height={220}
            domainPadding={{ x: 40 }}
            padding={{ top: 20, bottom: 40, left: 56, right: 40 }}
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
                tickLabels: { fontSize: 12, fill: colors.ink, fontFamily: 'System' },
                grid: { stroke: '#E8E0D0', strokeWidth: 0.5, strokeDasharray: '4,4' },
              }}
            />

            {/* X-Axis */}
            <VictoryAxis
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 13, fill: colors.ink, fontFamily: 'System' },
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

      {/* ── Modal Riwayat Tes (Ala Mutasi Bank) ── */}
      <Modal visible={isHistoryModalVisible} transparent animationType="fade" onRequestClose={() => setHistoryModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setHistoryModalVisible(false)}>
          <View style={[styles.modalCard, { maxHeight: '70%', padding: 20 }]} onStartShouldSetResponder={() => true}>
            
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Riwayat Tes</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Icon name="close" size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            {/* List Riwayat */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {HISTORY_LIST.map((hist) => (
                <TouchableOpacity
                  key={hist.id}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderDefault,
                  }}
                  onPress={() => {
                    // Mengubah data yang ditampilkan
                    setData({ ...data, date: hist.date, total: hist.total, totalCategory: hist.category as ScoreCategory });
                    setHistoryModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink }}>{hist.date}</Text>
                  <Text style={{ fontSize: 16, color: colors.inkSoft }}>Skor: {hist.total} ({hist.category})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}