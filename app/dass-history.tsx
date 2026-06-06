import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
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

const getWarningContent = (category: string) => {
  switch (category) {
    case 'Ringan':
      return {
        color: colors.accentBlue,
        text: (
          <>Hasil tes kamu menunjukkan kecenderungan <Text style={{ fontFamily: 'Fredoka_700Bold' }}>tingkat Ringan</Text>. Kamu mungkin sesekali merasakan ketidaknyamanan emosional dan itu hal yang sangat manusiawi.{'\n\n'}Cobalah perhatikan lebih apa yang tubuh dan pikiranmu butuhkan saat ini. Ceritakan perasaanmu pada orang yang kamu percaya, atau coba luangkan waktu untuk melakukan hal yang membuatmu tenang. Kamu tidak harus menanggung semuanya sendirian.</>
        ),
      };
    case 'Sedang':
      return {
        color: colors.accentYellow,
        text: (
          <>Hasil tes kamu menunjukkan kecenderungan <Text style={{ fontFamily: 'Fredoka_700Bold' }}>tingkat Sedang</Text>. Mungkin belakangan ini ada hal-hal yang cukup berat kamu tanggung, dan itu terasa nyata.{'\n\n'}Perlu diingat bahwa mencari dukungan adalah tanda keberanian, bukan kelemahan. Pertimbangkan untuk berbicara dengan seseorang yang kamu percaya, atau mulai cari tahu layanan konseling yang mungkin bisa membantumu. Kamu layak mendapatkan ruang untuk merasa lebih baik.</>
        ),
      };
    case 'Berat': // Sama dengan 'Parah'
      return {
        color: colors.accentRed,
        text: (
          <>Hasil tes kamu menunjukkan kecenderungan <Text style={{ fontFamily: 'Fredoka_700Bold' }}>tingkat Parah</Text>. Jika kamu merasa kondisi ini sudah mengganggu keseharian dan terasa sulit dikendalikan sendiri, kamu tidak perlu menghadapinya seorang diri.{'\n\n'}Kami sangat menyarankan kamu untuk mempertimbangkan berkonsultasi dengan profesional kesehatan jiwa  psikolog atau psikiater. Mereka hadir untuk membantumu, bukan untuk menghakimi. Langkah pertama memang sering terasa berat, tapi kamu sudah sangat berani hanya dengan mengenali perasaanmu hari ini.</>
        ),
      };
    case 'Sangat Parah':
      return {
        color: colors.accentRed,
        text: (
          <>Hasil tes kamu menunjukkan kecenderungan <Text style={{ fontFamily: 'Fredoka_700Bold' }}>tingkat Sangat Parah</Text>. Kami ingin kamu tahu apa yang kamu rasakan itu valid, dan kamu tidak sendirian.{'\n\n'}Kondisi seperti ini membutuhkan perhatian dan dukungan yang lebih serius. Kami sangat menganjurkan kamu untuk segera menghubungi profesional kesehatan jiwa. Jika kamu merasa tidak aman atau dalam kondisi krisis saat ini, tolong hubungi orang terdekatmu atau layanan darurat yang tersedia. Kamu berharga, dan ada orang-orang yang peduli padamu.</>
        ),
      };
    case 'Normal':
    default:
      return {
        color: colors.accentGreen,
        text: (
          <>Hasil tes kamu menunjukkan bahwa kondisimu saat ini berada dalam <Text style={{ fontFamily: 'Fredoka_700Bold' }}>batas Normal</Text>. Kamu tampaknya sedang cukup baik-baik saja dan itu hal yang patut disyukuri.{'\n\n'}Teruslah jaga keseimbangan hidupmu: istirahat yang cukup, terhubung dengan orang-orang yang kamu percaya, dan lakukan hal-hal yang membuatmu merasa berarti. Setiap langkah kecil untuk merawat dirimu sendiri itu penting.</>
        ),
      };
  }
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

  // Fungsi untuk memetakan teks kategori ke tinggi sumbu-Y (1 sampai 5)
  const getSeverityValue = (cat: string) => {
    if (!cat) return 0;
    const c = cat.toLowerCase();
    if (c.includes('normal')) return 1;
    if (c.includes('ringan')) return 2;
    if (c.includes('sedang')) return 3;
    if (c.includes('sangat')) return 5;
    if (c.includes('berat') || c.includes('tinggi') || c.includes('parah')) return 4;
    return 0;
  };

  const chartData = selectedData ? [
    { x: 'Depresi', y: getSeverityValue(selectedData.depression_category), score: selectedData.depression_score },
    { x: 'Kecemasan', y: getSeverityValue(selectedData.anxiety_category), score: selectedData.anxiety_score },
    { x: 'Stres', y: getSeverityValue(selectedData.stress_category), score: selectedData.stress_score },
  ] : [
    { x: 'Depresi', y: 0, score: 0 },
    { x: 'Kecemasan', y: 0, score: 0 },
    { x: 'Stres', y: 0, score: 0 },
  ];

  const totalScore = selectedData ? selectedData.depression_score + selectedData.anxiety_score + selectedData.stress_score : 0;
  const totalCategory = selectedData ? getMaxSeverity(selectedData.depression_category, selectedData.anxiety_category, selectedData.stress_category) : 'Normal';
  const warningContent = getWarningContent(totalCategory);

  const displayDate = selectedData
    ? new Date(selectedData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Belum ada data';

  const { width } = useWindowDimensions();
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
            height={260}
            domainPadding={{ x: 40 }}
            padding={{ top: 30, bottom: 40, left: 60, right: 40 }}
            domain={{ y: [0, 5.5] }}
          >
            {/* Y-Axis */}
            <VictoryAxis
              dependentAxis
              tickValues={[1, 2, 3, 4, 5]}
              tickFormat={(t: number) => {
                if (t === 1) return 'Normal';
                if (t === 2) return 'Ringan';
                if (t === 3) return 'Sedang';
                if (t === 4) return 'Berat';
                if (t === 5) return 'S. Parah';
                return '';
              }}
              style={{
                axis: { stroke: '#E8E0D0', strokeWidth: 0.5 },
                tickLabels: { fontSize: 11, fill: colors.ink, fontFamily: 'Fredoka_500Medium' },
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
              labels={({ datum }: any) => (datum.y > 0 ? datum.score.toString() : "")}
              style={{
                data: {
                  fill: ({ datum }: any) =>
                    BAR_COLORS[datum?.x] ?? '#C4B49A',
                  width: 32,
                },
                labels: { fill: colors.ink, fontSize: 14, fontFamily: "Fredoka_700Bold", textAnchor: "middle" },
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
          <View style={[styles.warningCard, { backgroundColor: warningContent.color }]}>
            <Text style={[styles.warningText, { textAlign: 'left' }]}>
              {warningContent.text}
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