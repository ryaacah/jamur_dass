import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";
import { colors, styles } from "./styles";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  date: string;        // Format: YYYY-MM-DD
  displayDate: string; // Format: "20 Feb"
  preview: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

// ─── Konfigurasi Kalender & Warna Mood ────────────────────────────────────────
LocaleConfig.locales["id"] = {
  monthNames: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  today: "Hari ini",
};
LocaleConfig.defaultLocale = "id";

const getMoodColor = (mood: string) => {
  switch (mood) {
    case "senang": return colors.accentYellow;
    case "sedih":  return colors.accentBlue;
    case "marah":  return colors.accentRed;
    case "cemas":  return colors.accentPurple;
    case "rileks": return colors.accentGreen;
    default:       return colors.surfaceVariant;
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeekCalendar({
  weekDays,
}: {
  weekDays: { day: string; dateStr: string; dateLabel: string; color: string; hasLog: boolean }[];
}) {
  return (
    <View style={styles.calendarRow}>
      {weekDays.map((item) => (
        <View
          key={item.dateStr}
          style={[styles.dayCell, { backgroundColor: item.color }]}
        >
          <Text style={styles.dayLabel}>{item.day}</Text>
          <Text style={styles.dayNumber}>{item.dateLabel}</Text>
        </View>
      ))}
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
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
        <Image
          source={require("../assets/images/relx.webp")}
          style={{ position: "absolute", bottom: -12, right: -12, width: 104, height: 104, opacity: 0.9 }}
          contentFit="contain"
        />
      </View>
      <View style={[styles.resetContent, { zIndex: 2 }]}>
        <Text style={styles.resetTitle}>Reset pikiran mu</Text>
        <Text style={styles.resetBody}>
          Mulai mengatur kembali pernafasan mu, rileks kan pikiran
        </Text>
        <TouchableOpacity style={styles.resetBtn} onPress={onPress} activeOpacity={0.8}>
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
        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.8}>
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
            params: { 
              id: entry.id, 
              displayDate: entry.displayDate, 
              date: entry.date,      // ✅ FIX: ganti "rawDate" → "date"
              body: entry.preview 
            }
          })}
        >
          <Text style={styles.entryDate}>{entry.displayDate}</Text>
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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMoodModalVisible, setMoodModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  // Set default ke format YYYY-MM-DD hari ini
  const [selectedDay] = useState(() => getLocalDateString(new Date()));

  // Menghasilkan daftar hari dari Senin hingga Minggu di minggu ini
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);

    const displayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      const moodMark = markedDates[dateStr];
      const moodColor = moodMark?.customStyles?.container?.backgroundColor || colors.surfaceCard;

      days.push({
        day: displayNames[i],
        dateStr,
        dateLabel: d.getDate().toString().padStart(2, "0"),
        color: moodColor,
        hasLog: !!moodMark,
      });
    }
    return days;
  }, [markedDates]);

  // ── Load jurnal dari Supabase ──────────────────────────────────────────────
  useEffect(() => {
    const fetchJournals = async () => {
      let currentId: string | null = null;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        currentId = session.user.id;
      } else {
        currentId = await AsyncStorage.getItem("user_uuid");
      }

      if (!currentId) return;

      setUserId(currentId);

      // ✅ FIX: pakai kolom "content" sesuai schema DB
      const { data, error } = await supabase
        .from("journals")
        .select("id, date, content")
        .eq("user_id", currentId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal memuat jurnal:", error.message);
        return;
      }

      if (data) {
        setEntries(
          data.map((d: any) => ({
            id: d.id,
            date: d.date,
            displayDate: formatDisplayDate(d.date),
            preview: d.content, // ✅ FIX: d.content bukan d.body
          }))
        );
      }
    };

    fetchJournals();
  }, []);

  // ── Load data mood untuk kalender pop-up ──────────────────────────────────
  useEffect(() => {
    const fetchMoods = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("moods")
        .select("date, mood")
        .eq("user_id", userId);

      if (data && !error) {
        const marks: any = {};
        data.forEach((item: any) => {
          marks[item.date] = {
            customStyles: {
              container: {
                backgroundColor: getMoodColor(item.mood),
                borderRadius: 8,
                elevation: 2,
              },
              text: { color: colors.ink, fontFamily: "Fredoka_700Bold" },
            },
          };
        });
        setMarkedDates(marks);
      }
    };

    fetchMoods();
  }, [userId]);

  // ── Simpan jurnal ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!journalText.trim()) return;

    try {
      let currentUserId = userId;

      if (!currentUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          currentUserId = session.user.id;
        } else {
          currentUserId = await AsyncStorage.getItem("user_uuid");
        }
      }

      if (!currentUserId) {
        Alert.alert(
          "Perhatian",
          "ID Pengguna tidak ditemukan. Silakan isi nama panggilan terlebih dahulu."
        );
        return;
      }

      // ✅ FIX: pakai kolom "content" sesuai schema DB
      const { data, error } = await supabase
        .from("journals")
        .insert([
          {
            user_id: currentUserId,
            date: selectedDay,
            content: journalText.trim(), // ✅ FIX: "content" bukan "body"
          },
        ])
        .select("id, date, content") // ✅ FIX: select "content" bukan "body"
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: JournalEntry = {
          id: data.id,
          date: data.date,
          displayDate: formatDisplayDate(data.date),
          preview: data.content, // ✅ FIX: data.content bukan data.body
        };

        const updatedEntries = [newEntry, ...entries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEntries(updatedEntries);
        setJournalText("");
        Alert.alert("Berhasil", "Jurnal harianmu telah tersimpan!");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan jurnal:", err);
      Alert.alert("Gagal", "Tidak dapat menyimpan jurnal: " + (err.message ?? "Unknown error"));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
          <WeekCalendar weekDays={weekDays} />

          {/* Lihat riwayat mood */}
          <MoodHistoryButton onPress={() => setMoodModalVisible(true)} />

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

        {/* ── Modal Kalender Riwayat Mood ── */}
        <Modal
          visible={isMoodModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMoodModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setMoodModalVisible(false)}
          >
            <View
              style={[styles.modalCard, { padding: 16 }]}
              onStartShouldSetResponder={() => true}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={styles.modalTitle}>Riwayat Mood</Text>
                <TouchableOpacity
                  onPress={() => setMoodModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color={colors.ink} />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: colors.borderDefault,
                }}
              >
                <Calendar
                  markingType={"custom"}
                  markedDates={markedDates}
                  theme={{
                    calendarBackground: colors.surfaceCard,
                    textSectionTitleColor: colors.inkSoft,
                    todayTextColor: colors.accentBlue,
                    dayTextColor: colors.ink,
                    textDisabledColor: colors.surfaceVariant,
                    monthTextColor: colors.ink,
                    arrowColor: colors.ink,
                    textDayFontFamily: "Fredoka_500Medium",
                    textMonthFontFamily: "Fredoka_700Bold",
                    textDayHeaderFontFamily: "Fredoka_600SemiBold",
                  }}
                />
              </View>

              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.borderDefault,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Fredoka_700Bold",
                    color: colors.ink,
                    marginBottom: 8,
                  }}
                >
                  Keterangan:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {["senang", "sedih", "marah", "cemas", "rileks"].map((mood) => (
                    <View
                      key={mood}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "45%",
                      }}
                    >
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          marginRight: 6,
                          backgroundColor: getMoodColor(mood),
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.inkSoft,
                          textTransform: "capitalize",
                        fontFamily: "Fredoka_400Regular",
                        }}
                      >
                        {mood}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}