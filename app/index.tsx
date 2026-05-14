import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CHART_H, colors, styles } from "./index.styles";

// ─── Data ─────────────────────────────────────────────────────────────────────
const WEEK_DAYS = [
  { day: "Sen", date: "06", color: colors.accentYellow, hasLog: true },
  { day: "Sel", date: "07", color: colors.accentBlue, hasLog: true },
  { day: "Rab", date: "08", color: colors.accentRed, hasLog: true },
  { day: "Kam", date: "09", color: colors.accentPurple, hasLog: true },
  { day: "Jum", date: "10", color: colors.accentGreen, hasLog: true },
  { day: "Sab", date: "11", color: colors.accentYellow, hasLog: true },
  { day: "Min", date: "12", color: colors.surfaceCard, hasLog: false },
];

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
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.calendarRow}
    >
      {WEEK_DAYS.map((item) => {
        const isSelected = item.date === selected;
        return (
          <TouchableOpacity
            key={item.date}
            onPress={() => onSelect(item.date)}
            activeOpacity={0.75}
            style={[
              styles.dayCell,
              { backgroundColor: item.color },
              isSelected && styles.dayCellSelected,
            ]}
          >
            <Text style={styles.dayLabel}>{item.day}</Text>
            <Text style={styles.dayNumber}>{item.date}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function MoodSelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Apa yang hari ini kamu rasakan?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => {
          const isActive = mood.id === selected;
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
                  { backgroundColor: mood.color },
                  isActive && styles.moodBubbleActive,
                ]}
              >
                <Image
                  source={mood.source}
                  style={styles.moodImage}
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
  const router = useRouter();

  return (
    <View style={styles.bentoGrid}>
      {/* Jurnal */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.card, styles.bentoCell]}
        onPress={() => router.push("/jurnal")}
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

      {/* Pernafasan */}
      <TouchableOpacity activeOpacity={0.8} style={[styles.card, styles.bentoCell]}>
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
    </View>
  );
}

function DassBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={[styles.card, styles.bannerRow]}
      onPress={() => router.push("/assesmen")}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          Luangkan Waktu Sejenak untuk Mengenali Dirimu
        </Text>
        <Text style={styles.cardBody}>Lakukan tes dengan DASS-21</Text>
      </View>
      <Text style={[styles.chevron, { marginLeft: 8 }]}>›</Text>
    </TouchableOpacity>
  );
}

// Simple bar chart for DASS-21 history
const DASS_DATA = [
  { label: "Depresi", color: colors.scoreHigh, heightPct: 0.75 },
  { label: "Anxiety", color: colors.scoreLow, heightPct: 0.25 },
  { label: "Stres", color: colors.scoreMedium, heightPct: 0.85 },
];
const Y_LABELS = ["Tinggi", "Sedang", "Ringan", "Normal"];

function DassChart() {
  const router = useRouter();

  return (
    <View style={styles.mutableCard}>
      <Text style={styles.cardTitle}>Riwayat Skor DASS-21</Text>

      {/* Chart area */}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {Y_LABELS.map((l) => (
            <Text key={l} style={styles.yLabel}>
              {l}
            </Text>
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsArea}>
          {/* Gridlines */}
          {[0, 33, 66, 100].map((pct) => (
            <View
              key={pct}
              style={[
                styles.gridLine,
                { bottom: `${pct}%` as any },
              ]}
            />
          ))}

          {DASS_DATA.map((d) => (
            <View key={d.label} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: d.color,
                    height: CHART_H * d.heightPct,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {DASS_DATA.map((d) => (
          <Text key={d.label} style={styles.xLabel}>
            {d.label}
          </Text>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.seeMoreRow} 
        activeOpacity={0.7}
        onPress={() => router.push("/riwayat_dass")}
      >
        <Text style={styles.seeMoreText}>Lihat selengkapnya ›</Text>
      </TouchableOpacity>
    </View>
  );
}

function BottomNav({ active }: { active: "home" | "chart" }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNavWrapper}>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, active === "home" && styles.navItemActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, active === "home" && { color: colors.ink }]}>
            ⌂
          </Text>
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity
          style={[styles.navItem, active === "chart" && styles.navItemActive]}
          activeOpacity={0.7}
          onPress={() => router.push("/riwayat_dass")}
        >
          <Text style={[styles.navIcon, active === "chart" && { color: colors.ink }]}>
            ▦
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Index() {
  const [selectedDay, setSelectedDay] = useState("12");
  const [selectedMood, setSelectedMood] = useState<string | null>("senang");

  return (
    
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minggu, 12 April</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Calendar */}
        <WeekCalendar selected={selectedDay} onSelect={setSelectedDay} />

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
