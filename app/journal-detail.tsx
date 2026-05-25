import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<string, { image: any; label: string }> = {
  senang: { image: require("../assets/images/j_senang.png"), label: "senang" },
  sedih:  { image: require("../assets/images/j_sedih.png"),  label: "sedih"  },
  marah:  { image: require("../assets/images/j_marah.png"),  label: "marah"  },
  cemas:  { image: require("../assets/images/j_cemas.png"),  label: "cemas"  },
  rileks: { image: require("../assets/images/j_relax.png"),  label: "rileks" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MoodDisplay({ mood, date }: { mood: string | null; date: string }) {
  // Cek apakah tanggal jurnal adalah hari ini
  const isToday = React.useMemo(() => {
    if (!date) return false;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return date === todayStr;
  }, [date]);

  if (!mood) return null;

  const config = MOOD_CONFIG[mood.toLowerCase()] ?? MOOD_CONFIG['senang'];

  const textPrefix = isToday ? "Hari ini kamu " : "Hari itu kamu ";

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      marginTop: 16,
    }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingRight: 8 }}>
        <Text style={{ lineHeight: 32 }}>
          <Text style={{ fontSize: 18, color: colors.inkSoft, fontWeight: '600' }}>{textPrefix}</Text>
          <Text style={{ fontSize: 24, color: colors.ink, fontWeight: 'bold' }}>sedang {config.label}</Text>
        </Text>
      </View>
      <Image
        source={config.image}
        style={{ width: 80, height: 80 }}
        contentFit="contain"
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JournalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ── Params dari navigation ──────────────────────────────────────────────────
  // JournalScreen mengirim: { id, date (YYYY-MM-DD), displayDate, body }
  const journalId    = params.id          as string;
  const rawDate      = params.date        as string; // ✅ FIX: pakai "date" bukan "rawDate"
  const displayDate  = (params.displayDate as string) || rawDate || 'Detail Jurnal';
  const initialBody  = (params.body       as string) || '';

  // ── State ───────────────────────────────────────────────────────────────────
  const [mood, setMood]           = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(initialBody);
  const [loadingMood, setLoadingMood] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);

  // ── Fetch mood sesuai tanggal jurnal & user ─────────────────────────────────
  useEffect(() => {
    const fetchMood = async () => {
      setLoadingMood(true);

      if (!rawDate) {
        setLoadingMood(false);
        return;
      }

      try {
        // ✅ FIX: ambil userId dulu supaya tidak kena mood orang lain
        let currentUserId: string | null = null;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          currentUserId = session.user.id;
        } else {
          currentUserId = await AsyncStorage.getItem('user_uuid');
        }

        if (!currentUserId) {
          setLoadingMood(false);
          return;
        }

        // ✅ FIX: filter by user_id DAN date supaya hasil tepat
        const { data, error } = await supabase
          .from('moods')
          .select('mood')
          .eq('user_id', currentUserId)
          .eq('date', rawDate)        // cocokkan tanggal jurnal
          .order('created_at', { ascending: false }) // ambil yang terbaru jika ada >1
          .limit(1)
          .maybeSingle();             // pakai maybeSingle agar tidak throw jika kosong

        if (data && !error) {
          setMood(data.mood);
        } else {
          setMood(null); // tidak ada mood di tanggal itu
        }
      } catch (err) {
        console.error('Gagal memuat mood detail:', err);
        setMood(null);
      } finally {
        setLoadingMood(false);
      }
    };

    fetchMood();
  }, [rawDate]);

  // ── Update jurnal ───────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editedBody.trim()) {
      Alert.alert('Perhatian', 'Isi jurnal tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('journals')
        .update({ content: editedBody.trim() }) // ✅ sesuai kolom DB
        .eq('id', journalId);

      if (error) throw error;

      Alert.alert('Berhasil', 'Jurnal telah diperbarui.');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Gagal update jurnal:', err);
      Alert.alert('Gagal', 'Tidak dapat memperbarui jurnal: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top App Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            accessibilityLabel="Kembali"
          >
            <Icon name="arrow-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Jurnal' : 'Detail Jurnal'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.wrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood di tanggal jurnal */}
          {loadingMood ? (
            <ActivityIndicator color={colors.ink} style={{ marginVertical: 20 }} />
          ) : (
            <MoodDisplay mood={mood} date={rawDate} />
          )}

          {/* Journal Entry Card */}
          <View style={[
            styles.journalCard,
            isEditing && { borderColor: colors.primary, borderWidth: 2 },
          ]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 12 }}>
              {displayDate}
            </Text>

            {isEditing ? (
              <TextInput
                style={[styles.journalBody, { minHeight: 150, textAlignVertical: 'top' }]}
                multiline
                value={editedBody}
                onChangeText={setEditedBody}
                autoFocus
              />
            ) : (
              <Text style={styles.journalBody}>{editedBody}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.editRow}>
            {isEditing ? (
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.editBtn, { flex: 1, backgroundColor: colors.surfaceVariant }]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedBody(initialBody); // reset ke teks awal
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.editBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editBtn, { flex: 1, backgroundColor: colors.accentGreen }]}
                  onPress={handleUpdate}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <ActivityIndicator color={colors.white} />
                    : <Text style={[styles.editBtnText, { color: colors.white }]}>Simpan</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Icon name="edit" size={20} color={colors.ink} />
                <Text style={styles.editBtnText}>Edit Jurnal</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <BottomNav active="journal" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}