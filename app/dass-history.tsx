import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
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
import { supabase } from '../lib/supabase';
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
const SEVERITY_LEVELS = ['Normal', 'Ringan', 'Sedang', 'Berat', 'Sangat Parah'];
const getMaxSeverity = (c1: string, c2: string, c3: string) => {
  const idxs = [c1, c2, c3].map(c => SEVERITY_LEVELS.indexOf(c));
  const maxIdx = Math.max(...idxs.filter(i => i >= 0));
  return SEVERITY_LEVELS[maxIdx] || 'Normal';
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
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        let currentUserId = null;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          currentUserId = session.user.id;
        } else {
          currentUserId = await AsyncStorage.getItem('user_uuid');
        }

        if (!currentUserId) return;

        const { data } = await supabase
          .from('dass_results')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setHistoryList(data);
          // Selalu reset ke data terbaru ketika pertama kali masuk ke layar ini
          setSelectedData(data[0]);
        }
      };
      fetchHistory();
    }, [])
  );

  const chartData = selectedData ? [
    { x: 'Depresi', y: selectedData.depression_score },
    { x: 'Kecemasan', y: selectedData.anxiety_score },
    { x: 'Stres', y: selectedData.stress_score },
  ] : [
    { x: 'Depresi', y: 0 },
    { x: 'Kecemasan', y: 0 },
    { x: 'Stres', y: 0 },
  ];

  const totalScore = selectedData ? selectedData.depression_score + selectedData.anxiety_score + selectedData.stress_score : 0;
  const totalCategory = selectedData ? getMaxSeverity(selectedData.depression_category, selectedData.anxiety_category, selectedData.stress_category) : 'Normal';

  const displayDate = selectedData
    ? new Date(selectedData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Belum ada data';

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
          onPress={() => { if (historyList.length > 0) setHistoryModalVisible(true) }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Pilih tanggal, saat ini ${displayDate}`}
        >
          <Text style={styles.dateSelectorText}>{displayDate}</Text>
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
            padding={{ top: 20, bottom: 40, left: 64, right: 40 }}
            domain={{ y: [0, 42] }}
          >
            {/* Y-Axis */}
            <VictoryAxis
              dependentAxis
              tickValues={[0, 14, 28, 42]}
              tickFormat={(t: number) => {
                if (t === 0) return 'Normal';
                if (t === 14) return 'Ringan';
                if (t === 28) return 'Sedang';
                if (t === 42) return 'Tinggi';
                return '';
              }}
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 12, fill: colors.ink, fontFamily: 'Fredoka_500Medium' },
                grid: { stroke: '#E8E0D0', strokeWidth: 0.5, strokeDasharray: '4,4' },
              }}
            />

            {/* X-Axis */}
            <VictoryAxis
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 13, fill: colors.ink, fontFamily: 'Fredoka_500Medium' },
                grid: { stroke: 'transparent' },
              }}
            />

            {/* Bars */}
            <VictoryBar
              data={chartData}
              cornerRadius={{ top: 6 }}
              labels={({ datum }) => (datum.y > 0 ? datum.y : "")}
              style={{
                data: {
                  fill: ({ datum }: any) =>
                    BAR_COLORS[datum?.x] ?? '#C4B49A',
                  width: 32,
                },
                labels: { fill: colors.ink, fontSize: 14, fontFamily: "Fredoka_700Bold" },
              }}
            />
          </VictoryChart>

          <ChartLegend />
        </View>

        {/* ── Score Breakdown Card ── */}
        <View style={[styles.card, styles.breakdownCard]}>
          <Text style={styles.breakdownTitle}>Skor Hasil Tes DASS-21</Text>

          {selectedData ? (
            <>
              <ScoreRow label="Skor Depresi" value={selectedData.depression_score} category={selectedData.depression_category as ScoreCategory} />
              <ScoreRow label="Skor Kecemasan" value={selectedData.anxiety_score} category={selectedData.anxiety_category as ScoreCategory} />
              <ScoreRow label="Skor Stres" value={selectedData.stress_score} category={selectedData.stress_category as ScoreCategory} />
            </>
          ) : (
            <Text style={{ textAlign: 'center', marginVertical: 20, color: colors.inkSoft }}>Belum ada data</Text>
          )}

          <View style={styles.divider} />

          <ScoreRow
            label="Total Skor"
            value={totalScore}
            category={totalCategory as ScoreCategory}
            isTotal
          />
        </View>

        {/* ── Warning Card ── */}
        {selectedData && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              {totalCategory === 'Normal'
                ? 'Skor DASS-21 kamu secara umum berada dalam batas normal. Pertahankan terus gaya hidup positif dan kesehatan mentalmu!'
                : `Hasil tes kamu menunjukkan kecenderungan tingkat "${totalCategory}". Jika kamu merasa kondisi ini mengganggu aktivitas sehari-hari, kamu dapat mempertimbangkan untuk berkonsultasi dengan profesional.`
              }
            </Text>
          </View>
        )}
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
              {historyList.map((hist) => {
                const histDate = new Date(hist.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                const hTotal = hist.depression_score + hist.anxiety_score + hist.stress_score;
                const hCat = getMaxSeverity(hist.depression_category, hist.anxiety_category, hist.stress_category);

                return (
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
                      setSelectedData(hist);
                      setHistoryModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: 'Fredoka_600SemiBold', color: colors.ink }}>{histDate}</Text>
                    <Text style={{ fontSize: 16, fontFamily: 'Fredoka_400Regular', color: colors.inkSoft }}>Skor: {hTotal} ({hCat})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}