import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
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
      {/* Text content */}
      <View style={styles.resetContent}>
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

      {/* Decorative blob */}
      <View style={styles.resetDecorBlob} />
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
            pathname: '/detail_jurnal',
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
          {/* Lihat riwayat mood */}
          <MoodHistoryButton onPress={() => router.push("/tanggal_mood")} />

          {/* Reset pikiran card */}
          <ResetCard onPress={() => router.push("/pernafasan")} />

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
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}