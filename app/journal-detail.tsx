import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import { colors, styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MoodData {
  label: string;       // e.g. "sedang senang"
  emoji: string;       // unicode emoji as fallback
  shortLabel: string;  // e.g. "senang"
}

interface JournalEntry {
  id: string;
  body: string;
  mood: MoodData;
  date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOOD_IMAGES: Record<string, any> = {
  senang: require("../assets/images/j_senang.png"),
  sedih: require("../assets/images/j_sedih.png"),
  marah: require("../assets/images/j_marah.png"),
  cemas: require("../assets/images/j_cemas.png"),
  rileks: require("../assets/images/j_relax.png"),
};

const ENTRY: JournalEntry = {
  id: '1',
  date: 'Hari ini',
  body:
    'Hari ini aku pergi berbelanja dengan teman ku, lalu setelah itu aku pergi membeli makan, aku beli makanan favoritku di kedai dekat taman. Rasanya sangat tenang bisa menghabiskan waktu di luar ruangan setelah minggu yang cukup sibuk. Aku merasa jauh lebih lega sekarang.',
  mood: {
    label: 'sedang senang',
    shortLabel: 'senang',
    emoji: '😊',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Mood Badge ───────────────────────────────────────────────────────────────
function MoodBadge({ mood }: { mood: MoodData }) {
  const imageSource = MOOD_IMAGES[mood.shortLabel.toLowerCase()] || MOOD_IMAGES['senang'];
  return (
    <View style={styles.moodBadge}>
      <Image source={imageSource} style={{ width: 58, height: 58 }} contentFit="contain" />
      <Text style={styles.moodLabel}>{mood.shortLabel}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JournalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Tangkap data dari parameter URL atau gunakan nilai mock sebagai cadangan
  const date = (params.date as string) || ENTRY.date;
  const body = (params.body as string) || ENTRY.body;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          accessibilityLabel="Kembali"
          accessibilityRole="button"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Jurnal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Journal Entry Card */}
        <View style={styles.journalCard}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink }}>{date}</Text>
          <Text style={styles.journalBody}>{body}</Text>
        </View>

        {/* Edit Button */}
        <View style={styles.editRow}>
          <Pressable
            style={({ pressed }) => [
              styles.editBtn,
              pressed && { opacity: 0.8, transform: [{ translateY: 1 }] },
            ]}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Edit jurnal"
          >
            <Icon name="edit" size={20} color={colors.ink} />
            <Text style={[styles.editBtnText, { fontSize: 18 }]}>Edit</Text>
          </Pressable>
        </View>

        {/* Mood Card */}
        <View style={styles.moodCard}>
          <View style={[styles.moodTextGroup, { flex: 1, paddingRight: 16 }]}>
            <Text style={styles.moodTitle}>Mood hari ini</Text>
            <Text style={[styles.moodValue, { flexWrap: 'wrap' }]}>{ENTRY.mood.label}</Text>
          </View>
          <MoodBadge mood={ENTRY.mood} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="journal" />
    </SafeAreaView>
  );
}