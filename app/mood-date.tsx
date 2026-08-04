// mood-date.tsx
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { colors, styles } from "./styles";

// ─── Konfigurasi Bahasa Indonesia ─────────────────────────────────────────────
LocaleConfig.locales["id"] = {
  monthNames: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
  dayNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  dayNamesShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  today: "Hari ini",
};
LocaleConfig.defaultLocale = "id";

// ─── Fungsi Warna Mood ────────────────────────────────────────────────────────
const getMoodColor = (mood: string) => {
  switch (mood) {
    case "senang": return colors.accentYellow || "#FFD166";
    case "sedih": return colors.accentBlue || "#4D96FF";
    case "marah": return colors.accentRed || "#EF476F";
    case "cemas": return colors.accentPurple || "#B185DB";
    case "rileks": return colors.accentGreen || "#06D6A0";
    default: return colors.surfaceVariant || "#ccc";
  }
};

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function MoodDateScreen() {
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    const fetchMoodHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Ambil data mood pengguna dari database
      const { data, error } = await supabase
        .from("moods")
        .select("date, mood")
        .eq("user_id", session.user.id);

      if (data && !error) {
        const marks: any = {};
        data.forEach((item) => {
          marks[item.date] = {
            customStyles: {
              container: {
                backgroundColor: getMoodColor(item.mood),
                borderRadius: 8,
                elevation: 2,
              },
              text: {
                color: colors.ink,
                fontFamily: "Fredoka_700Bold",
              },
            },
          };
        });
        setMarkedDates(marks);
      }
    };

    fetchMoodHistory();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Mood</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.wrapper} contentContainerStyle={{ padding: 16 }}>
        <View style={{ borderRadius: 16, overflow: "hidden", elevation: 2, shadowColor: colors.ink, shadowOpacity: 0.1, shadowRadius: 8 }}>
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

        {/* Keterangan Warna / Legend */}
        <View style={styles.moodLegendContainer}>
          <Text style={styles.moodLegendTitle}>Keterangan Mood:</Text>
          <View style={styles.moodLegendRow}>
            {["senang", "sedih", "marah", "cemas", "rileks"].map((mood) => (
              <View key={mood} style={styles.moodLegendItem}>
                <View style={[styles.moodLegendColor, { backgroundColor: getMoodColor(mood) }]} />
                <Text style={styles.moodLegendLabel}>{mood}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}