import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { colors, styles } from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  date: string;
  preview: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const JOURNAL_HISTORY: JournalEntry[] = [
  {
    id: "1",
    date: "20 Feb",
    preview:
      "Hari ini aku pergi berbelanja dengan teman ku, lalu setelah itu aku pergi membeli makan, aku beli makanan...",
  },
  {
    id: "2",
    date: "19 Feb",
    preview:
      "Hari ini aku pergi ke kampus untuk kelas mata kuliah, setelah kelas aku pergi ke kantin untuk makan siang kar...",
  },
  {
    id: "3",
    date: "18 Feb",
    preview:
      "Aku tadi pergi jalan jalan pagi buat olahraga, tapi di jalan aku malah laper jadinya aku milih belok untuk sar...",
  },
  {
    id: "4",
    date: "17 Feb",
    preview: "",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeekCalendar({
  selected,
  onSelect,
  weekDays,
}: {
  selected: string;
  onSelect: (date: string) => void;
  weekDays: { day: string; date: string; color: string; hasLog: boolean }[];
}) {
  return (
    <View style={styles.calendarRow}>
      {weekDays.map((item) => {
        const isSelected = item.date === selected;
        const bgColor = isSelected ? colors.primaryContainer : item.color;

        return (
          <TouchableOpacity
            key={item.date}
            onPress={() => onSelect(item.date)}
            activeOpacity={0.75}
            style={[
              styles.dayCell,
              { backgroundColor: bgColor },
              isSelected && { borderWidth: 4, borderColor: colors.ink } // Day Cell Selected Style
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

function Header({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBackBtn}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-back" size={24} color={colors.ink} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Jurnal</Text>

      {/* Spacer to keep title centered */}
      <View style={styles.headerSpacer} />
    </View>
  );
}

function MoodHistoryButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.moodHistoryBtn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.moodHistoryLeft}>
        <Icon name="calendar-today" size={20} color={colors.ink} />
        <Text style={styles.moodHistoryLabel}>Lihat riwayat mood</Text>
      </View>
      <Text style={styles.moodHistoryChevron}>›</Text>
    </TouchableOpacity>
  );
}

function ResetCard({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.resetCard}>
      {/* Gambar maskot di sudut kanan bawah */}
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
        <Image
          source={require("../assets/images/relx.png")}
          style={{ position: "absolute", bottom: -12, right: -12, width: 104, height: 104, opacity: 0.9 }}
          contentFit="contain"
        />
      </View>

      {/* Text content */}
      <View style={[styles.resetContent, { zIndex: 2 }]}>
        <Text style={styles.resetTitle}>Reset pikiran mu</Text>
        <Text style={styles.resetBody}>
          Mulai mengatur kembali pernafasan mu, rileks kan pikiran
        </Text>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.resetBtnText}>Mulai</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function JournalInput({
  value,
  onChange,
  onSave,
}: {
  value: string;
  onChange: (text: string) => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.journalInputCard}>
      <TextInput
        style={styles.journalTextInput}
        placeholder="Ceritakan hari mu disini..."
        placeholderTextColor={colors.inkSoft}
        multiline
        value={value}
        onChangeText={onChange}
        scrollEnabled={false}
      />
      <View style={styles.saveRow}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function JournalHistorySection({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();

  return (
    <View style={styles.historySection}>
      <Text style={styles.historySectionTitle}>Riwayat jurnal</Text>
      {entries.map((entry) => (
        <TouchableOpacity 
          key={entry.id} 
          style={styles.entryCard}
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: './journal-detail',
            params: { id: entry.id, date: entry.date, body: entry.preview }
          })}
        >
          <Text style={styles.entryDate}>{entry.date}</Text>
          {entry.preview ? (
            <Text style={styles.entryText} numberOfLines={2}>
              {entry.preview}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function JournalScreen() {
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_HISTORY);

  // Menghasilkan daftar hari dari Senin hingga Minggu di minggu ini
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    // Mencari tanggal hari Senin di minggu ini
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);

    const days = [];
    const displayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        day: displayNames[i],
        date: d.getDate().toString().padStart(2, "0"),
        color: colors.surfaceCard,
        hasLog: false,
      });
    }
    return days;
  }, []);

  const [selectedDay, setSelectedDay] = useState(() => {
    return new Date().getDate().toString().padStart(2, "0");
  });

  const handleSave = () => {
    if (!journalText.trim()) return;

    const now = new Date();
    const dateLabel = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: dateLabel,
      preview: journalText.trim(),
    };

    setEntries([newEntry, ...entries]);
    setJournalText("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Sticky Header */}
        <Header onBack={() => router.back()} />

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Kalender Mingguan */}
          <WeekCalendar
            selected={selectedDay}
            onSelect={setSelectedDay}
            weekDays={weekDays}
          />

          {/* Lihat riwayat mood */}
          <MoodHistoryButton onPress={() => router.push("./mood-date")} />

          {/* Reset pikiran card */}
          <ResetCard onPress={() => router.push("./breathing")} />

          {/* Journal input */}
          <JournalInput
            value={journalText}
            onChange={setJournalText}
            onSave={handleSave}
          />

          {/* History */}
          <JournalHistorySection entries={entries} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav active="journal" />
      </View>
    </SafeAreaView>
  );
}