import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native";
import BottomNav from "../components/BottomNav";
import { BAR_COLORS, colors, styles } from "./styles";

// ─── Data ─────────────────────────────────────────────────────────────────────
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const MOODS = [
  {
    id: "senang",
    label: "senang",
    color: colors.accentYellow,
    source: require("../assets/images/j_senang.png"),
  },
  {
    id: "sedih",
    label: "sedih",
    color: colors.accentBlue,
    source: require("../assets/images/j_sedih.png"),
  },
  {
    id: "marah",
    label: "marah",
    color: colors.accentRed,
    source: require("../assets/images/j_marah.png"),
  },
  {
    id: "cemas",
    label: "cemas",
    color: colors.accentPurple,
    source: require("../assets/images/j_cemas.png"),
  },
  {
    id: "rileks",
    label: "rileks",
    color: colors.accentGreen,
    source: require("../assets/images/j_relax.png"),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeekCalendar({
  selected,
  onSelect,
  selectedMoodColor,
  weekDays,
}: {
  selected: string;
  onSelect: (date: string) => void;
  selectedMoodColor: string | null;
  weekDays: { day: string; date: string; color: string; hasLog: boolean }[];
}) {
  return (
    <View style={styles.calendarRow}>
      {weekDays.map((item) => {
        const isSelected = item.date === selected;
        const bgColor = isSelected 
          ? (selectedMoodColor || colors.surfaceCard) 
          : item.color;
          
        return (
          <TouchableOpacity
            key={item.date}
            onPress={() => onSelect(item.date)}
            activeOpacity={0.75}
            style={[
              styles.dayCell,
              { backgroundColor: bgColor },
            ]}
          >
            <Text style={styles.dayLabel}>{item.day}</Text>
            <Text style={styles.dayNumber}>{item.date}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MoodSelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const isAnySelected = selected !== null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Apa yang hari ini kamu rasakan?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => {
          const isActive = mood.id === selected;
          const isDimmed = isAnySelected && !isActive;
          return (
            <TouchableOpacity
              key={mood.id}
              onPress={() => onSelect(mood.id)}
              activeOpacity={0.8}
              style={styles.moodItem}
            >
              <View
                style={[
                  styles.moodBubble,
                  { backgroundColor: isDimmed ? colors.surfaceVariant : mood.color },
                  isActive && styles.moodBubbleActive,
                ]}
              >
                <Image
                  source={mood.source}
                  style={[styles.moodImage, isDimmed && { opacity: 0.3 }]}
                  contentFit="contain"
                  transition={200}
                />
              </View>
              <Text
                style={[
                  styles.moodLabel,
                  isActive
                    ? { color: colors.ink }
                    : { color: colors.inkSoft },
                  isDimmed && { opacity: 0.6 }
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function QuickActions() {
  return (
    <View style={styles.bentoGrid}>
      {/* Jurnal */}
      <Link href="./journal" asChild>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={StyleSheet.flatten([styles.mutableCard, styles.bentoCell])}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Ceritakan Harimu</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>
              Ayo buat jurnal harian mu disini..
            </Text>
          </View>
          <View style={styles.chevronRow}>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </Link>

      {/* Pernafasan */}
      <Link href="./breathing" asChild>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={StyleSheet.flatten([styles.mutableCard, styles.bentoCell])}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Atur pernafasan</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>
              Tenangkan pikiran mu, atur pernafasan mu disini...
            </Text>
          </View>
          <View style={styles.chevronRow}>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function DassBanner() {
  return (
    <Link href="./assessment" asChild>
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={StyleSheet.flatten([styles.card, styles.bannerRow])}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Luangkan Waktu Sejenak untuk Mengenali Dirimu
          </Text>
          <Text style={styles.cardBody}>Lakukan tes dengan DASS-21</Text>
        </View>
        <Text style={[styles.chevron, { marginLeft: 8 }]}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}

// Data dummy untuk ringkasan DASS-21
const SUMMARY_CHART_DATA = [
  { x: "Depresi", y: 16 },
  { x: "Kecemasan", y: 5 },
  { x: "Stres", y: 18 },
];

function DassChart() {
  // Menghitung lebar layar dikurangi padding container (kiri-kanan)
  const { width } = Dimensions.get("window");
  const chartWidth = width - 64;

  return (
    <View style={StyleSheet.flatten([styles.mutableCard, styles.chartCard])}>
      <Text style={styles.cardTitle}>Riwayat Skor DASS-21</Text>

      {/* Chart area */}
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
            if (t === 0) return "Normal";
            if (t === 7) return "Ringan";
            if (t === 14) return "Sedang";
            if (t === 21) return "Tinggi";
            return "";
          }}
          style={{
            axis: { stroke: "#E8E0D0", strokeWidth: 0.5 },
            tickLabels: { fontSize: 10, fill: colors.ink, fontFamily: "System" },
            grid: { stroke: "#E8E0D0", strokeWidth: 0.5, strokeDasharray: "4,4" },
          }}
        />

        {/* X-Axis */}
        <VictoryAxis
          style={{
            axis: { stroke: "#E8E0D0", strokeWidth: 0.5 },
            tickLabels: { fontSize: 11, fill: colors.ink, fontFamily: "System" },
            grid: { stroke: "transparent" },
          }}
        />

        {/* Bars */}
        <VictoryBar
          data={SUMMARY_CHART_DATA}
          cornerRadius={{ top: 6 }}
          style={{
            data: {
              fill: ({ datum }: any) => BAR_COLORS[datum?.x] ?? "#C4B49A",
              width: 32,
            },
          }}
        />
      </VictoryChart>

      <Link href="./dass-history" asChild>
        <TouchableOpacity 
          style={styles.seeMoreRow} 
          activeOpacity={0.7}
        >
          <Text style={styles.seeMoreText}>Lihat selengkapnya ›</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Index() {
  // Menghasilkan kalender mingguan secara real-time
  const { weekDays, headerDate } = useMemo(() => {
    const today = new Date();
    const header = `${DAY_NAMES_LONG[today.getDay()]}, ${today.getDate()} ${MONTH_NAMES[today.getMonth()]}`;

    const days = [];
    // Warna mock untuk progress chart di kalender
    const mockColors = [
      colors.accentYellow,
      colors.accentBlue,
      colors.accentRed,
      colors.accentPurple,
      colors.accentGreen,
      colors.accentYellow,
      colors.surfaceCard,
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push({
        day: DAY_NAMES[d.getDay()],
        date: d.getDate().toString().padStart(2, "0"),
        color: mockColors[6 - i],
        hasLog: i !== 0,
      });
    }
    return { weekDays: days, headerDate: header };
  }, []);

  // Set default state menggunakan tanggal hari ini (data terakhir di array = index 6)
  const [selectedDay, setSelectedDay] = useState(weekDays[6].date);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const activeMood = MOODS.find((m) => m.id === selectedMood);
  const selectedMoodColor = activeMood ? activeMood.color : null;

  return (
    
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerDate}</Text>
        <Link href="./settings-notification" asChild>
          <TouchableOpacity activeOpacity={0.7} accessibilityRole="button">
            <Icon name="settings" size={26} color={colors.ink} />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Calendar */}
        <WeekCalendar 
          selected={selectedDay} 
          onSelect={setSelectedDay}
          weekDays={weekDays}
          selectedMoodColor={selectedMoodColor} 
        />

        {/* Mood Selector */}
        <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />

        {/* Quick Actions Bento */}
        <QuickActions />

        {/* DASS-21 Banner */}
        <DassBanner />

        {/* DASS-21 Chart */}
        <DassChart />

        {/* Bottom padding for nav bar */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="home" />
    </SafeAreaView>
  );
}