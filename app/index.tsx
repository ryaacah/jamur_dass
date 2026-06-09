// index.tsx
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Link, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";
import { getInboxNotifications } from "../lib/notifications";
import { BAR_COLORS, colors, styles } from "./styles";

// ─── Data ─────────────────────────────────────────────────────────────────────
const DAY_NAMES_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const MOODS = [
  { id: "senang", label: "senang", color: colors.accentYellow, source: require("../assets/images/j_senang.png") },
  { id: "sedih", label: "sedih", color: colors.accentBlue, source: require("../assets/images/j_sedih.png") },
  { id: "marah", label: "marah", color: colors.accentRed, source: require("../assets/images/j_marah.png") },
  { id: "cemas", label: "cemas", color: colors.accentPurple, source: require("../assets/images/j_cemas.png") },
  { id: "rileks", label: "rileks", color: colors.accentGreen, source: require("../assets/images/j_relax.png") },
];

const MOTIVATIONAL_QUOTES = [
  "Perasaanku valid. Aku berhak merasakan apa yang aku rasakan tanpa harus menjelaskannya pada siapapun.",
  "Aku tidak harus menjadi produktif setiap saat. Istirahat adalah bagian dari proses, bukan kelemahan.",
  "Aku sedang tumbuh. Setiap langkah kecil yang aku ambil hari ini adalah kemajuan yang nyata.",
  "Aku layak dicintai — bukan karena apa yang aku capai, tapi karena aku ada dan aku berarti.",
  "Hari yang berat bukan berarti hidup yang buruk. Badai ini akan berlalu dan aku cukup kuat untuk melewatinya.",
  "Aku tidak harus membandingkan perjalananku dengan orang lain. Hidupku punya ritmenya sendiri.",
  "Meminta bantuan adalah tanda keberanian, bukan kelemahan. Aku tidak harus menanggung semuanya sendiri.",
  "Aku tidak harus sempurna. Yang aku butuhkan hanyalah terus mencoba dengan cara terbaikku hari ini.",
  "Aku kuat. Aku tangguh. Aku bisa melewati semua ini.",
  "Aku sudah melewati hal-hal sulit sebelumnya dan aku akan melewati ini juga.",
  "Di dalam diriku ada kekuatan yang lebih besar dari rasa takut apapun yang aku rasakan hari ini.",
  "Aku tidak menyerah. Setiap napas yang aku ambil adalah bukti bahwa aku masih berjuang dan itu luar biasa.",
  "Aku lebih tangguh dari yang aku kira, lebih berani dari yang aku bayangkan, dan lebih mampu dari yang aku percaya.",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MotivationCard() {
  const todayDate = new Date().getDate();
  const quote = MOTIVATIONAL_QUOTES[todayDate % MOTIVATIONAL_QUOTES.length];

  return (
    <View style={[styles.card, { backgroundColor: colors.accentCream, padding: 20, paddingBottom: 36, position: "relative", overflow: "hidden" }]}>
      <Text style={[styles.cardBody, { fontSize: 16, fontStyle: "italic", color: colors.ink, lineHeight: 24, zIndex: 2, position: "relative", paddingRight: 16 }]}>
        {`"${quote}"`}
      </Text>
      <Image
        source={require("../assets/images/mur.png")}
        style={{ position: "absolute", width: 80, height: 80, bottom: -16, right: -16, zIndex: 1 }}
        contentFit="contain"
      />
    </View>
  );
}

function MoodSelector({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const isAnySelected = selected !== null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Apa yang hari ini kamu rasakan?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => {
          const isActive = mood.id === selected;
          const isDimmed = isAnySelected && !isActive;
          return (
            <TouchableOpacity key={mood.id} onPress={() => onSelect(mood.id)} activeOpacity={0.8} style={styles.moodItem}>
              <View style={[styles.moodBubble, { backgroundColor: isDimmed ? colors.surfaceVariant : mood.color }, isActive && styles.moodBubbleActive]}>
                <Image source={mood.source} style={[styles.moodImage, isDimmed && { opacity: 0.3 }]} contentFit="contain" transition={200} />
              </View>
              <Text style={[styles.moodLabel, isActive ? { color: colors.ink } : { color: colors.inkSoft }, isDimmed && { opacity: 0.6 }]}>
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
      <Link href="/journal" asChild>
        <TouchableOpacity activeOpacity={0.8} style={StyleSheet.flatten([styles.mutableCard, styles.bentoCell])}>
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
            <Image source={require("../assets/images/mur-jur.png")} style={{ position: "absolute", bottom: -8, left: -8, width: 72, height: 72, transform: [{ scaleX: -1 }], opacity: 0.9 }} contentFit="contain" />
          </View>
          <View style={{ flex: 1, zIndex: 2 }}>
            <Text style={styles.cardTitle}>Ceritakan Harimu</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>Ayo buat jurnal harian mu disini..</Text>
          </View>
          <View style={[styles.chevronRow, { zIndex: 2 }]}><Text style={styles.chevron}>›</Text></View>
        </TouchableOpacity>
      </Link>

      <Link href="/breathing" asChild>
        <TouchableOpacity activeOpacity={0.8} style={StyleSheet.flatten([styles.mutableCard, styles.bentoCell])}>
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
            <Image source={require("../assets/images/relx.png")} style={{ position: "absolute", bottom: -8, right: -8, width: 72, height: 72, opacity: 0.9 }} contentFit="contain" />
          </View>
          <View style={{ flex: 1, zIndex: 2 }}>
            <Text style={styles.cardTitle}>Atur pernafasan</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>Tenangkan pikiran mu, atur pernafasan mu disini...</Text>
          </View>
          <View style={[styles.chevronRow, { zIndex: 2 }]}><Text style={styles.chevron}>›</Text></View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function DassBanner() {
  return (
    <Link href="/assessment" asChild>
      <TouchableOpacity activeOpacity={0.8} style={StyleSheet.flatten([styles.card, styles.bannerRow])}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Luangkan Waktu Sejenak untuk Mengenali Dirimu</Text>
          <Text style={styles.cardBody}>Lakukan tes dengan DASS-21</Text>
        </View>
        <Text style={[styles.chevron, { marginLeft: 8 }]}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}

function DassChart({ latestDass }: { latestDass: any }) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

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

  const chartData = latestDass ? [
    { x: "Depresi", y: getSeverityValue(latestDass.depression_category), score: latestDass.depression_score },
    { x: "Kecemasan", y: getSeverityValue(latestDass.anxiety_category), score: latestDass.anxiety_score },
    { x: "Stres", y: getSeverityValue(latestDass.stress_category), score: latestDass.stress_score },
  ] : [
    { x: "Depresi", y: 0, score: 0 },
    { x: "Kecemasan", y: 0, score: 0 },
    { x: "Stres", y: 0, score: 0 },
  ];

  return (
    <View style={StyleSheet.flatten([styles.mutableCard, styles.chartCard])}>
      <Text style={styles.cardTitle}>Riwayat Skor DASS-21</Text>
      <VictoryChart width={chartWidth} height={260} domainPadding={{ x: 40 }} padding={{ top: 30, bottom: 40, left: 60, right: 40 }} domain={{ y: [0, 5.5] }}>
        <VictoryAxis dependentAxis tickValues={[1, 2, 3, 4, 5]} tickFormat={(t: number) => { if (t === 1) return 'Normal'; if (t === 2) return 'Ringan'; if (t === 3) return 'Sedang'; if (t === 4) return 'Berat'; if (t === 5) return 'S. Parah'; return ''; }} style={{ axis: { stroke: "#E8E0D0", strokeWidth: 0.5 }, tickLabels: { fontSize: 11, fill: colors.ink, fontFamily: "Fredoka_500Medium" }, grid: { stroke: "#E8E0D0", strokeWidth: 0.5, strokeDasharray: "4,4" } }} />
        <VictoryAxis style={{ axis: { stroke: "#E8E0D0", strokeWidth: 0.5 }, tickLabels: { fontSize: 13, fill: colors.ink, fontFamily: "Fredoka_500Medium" }, grid: { stroke: "transparent" } }} />
        <VictoryBar data={chartData} cornerRadius={{ top: 6 }} labels={({ datum }: any) => (datum.y > 0 ? datum.score.toString() : "")} style={{ data: { fill: ({ datum }: any) => BAR_COLORS[datum?.x] ?? "#C4B49A", width: 32 }, labels: { fill: colors.ink, fontSize: 14, fontFamily: "Fredoka_700Bold", textAnchor: "middle" } }} />
      </VictoryChart>

      {!latestDass ? (
        <Text style={{ textAlign: 'center', color: colors.inkSoft, marginTop: 4, marginBottom: 16, fontSize: 20, fontFamily: 'Fredoka_700Bold' }}>Belum ada riwayat tes.</Text>
      ) : (
        <View style={{ height: 16 }} />
      )}

      <Link href="/dass-history" asChild>
        <TouchableOpacity style={styles.seeMoreRow} activeOpacity={0.7}>
          <Text style={styles.seeMoreText}>Lihat selengkapnya ›</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Index() {
  const today = new Date();
  const headerDate = `${DAY_NAMES_LONG[today.getDay()]}, ${today.getDate()} ${MONTH_NAMES[today.getMonth()]}`;

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [latestDass, setLatestDass] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [tempName, setTempName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // FIX: state untuk pull-to-refresh

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadMoodForUser = useCallback(async (uid: string) => {
    const today = getLocalDateString();
    const { data } = await supabase
      .from("moods")
      .select("id, mood")
      .eq("user_id", uid)
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.mood) setSelectedMood(data.mood);
    else setSelectedMood(null);
  }, []);

  const fetchDass = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("dass_results")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setLatestDass(data);
  }, []);

  const fetchUnreadNotif = useCallback(async () => {
    const inbox = await getInboxNotifications();
    const unread = inbox.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  }, []);

  // FIX: Fungsi refresh — dipanggil saat pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const uid = session.user.id;

        // Refresh nickname dari DB
        const { data: profile } = await supabase
          .from('profile')
          .select('nickname')
          .eq('id', uid)
          .maybeSingle();
        if (profile?.nickname) {
          setNickname(profile.nickname);
          await AsyncStorage.setItem('user_nickname', profile.nickname);
        }

        // Refresh mood, dass, notif
        await Promise.all([
          loadMoodForUser(uid),
          fetchDass(uid),
          fetchUnreadNotif(),
        ]);
      } else {
        await fetchUnreadNotif();
      }
    } catch (e) {
      console.error('Gagal refresh:', e);
    } finally {
      setRefreshing(false);
    }
  }, [loadMoodForUser, fetchDass, fetchUnreadNotif]);

  // ── Fungsi utama load nickname & session ──
  useEffect(() => {
    const loadName = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUserId(session.user.id);
          await loadMoodForUser(session.user.id);

          const { data: profile } = await supabase
            .from('profile')
            .select('nickname')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.nickname) {
            setNickname(profile.nickname);
            await AsyncStorage.setItem('user_nickname', profile.nickname);
            return;
          }

          const savedName = await AsyncStorage.getItem('user_nickname');
          if (savedName) {
            setNickname(savedName);
            await supabase.from('profile').update({ nickname: savedName }).eq('id', session.user.id);
            return;
          }

          setModalVisible(true);
          return;
        }

        const savedName = await AsyncStorage.getItem('user_nickname');
        if (savedName) {
          setNickname(savedName);
          const { data: { session: newSession }, error } = await supabase.auth.signInAnonymously();
          if (!error && newSession) {
            setUserId(newSession.user.id);
            await loadMoodForUser(newSession.user.id);
            await supabase.from('profile').upsert({
              id: newSession.user.id,
              user_id: newSession.user.id,
              nickname: savedName,
              is_auth: false,
            });
          }
          return;
        }

        setModalVisible(true);

      } catch (error) {
        console.error('Gagal memuat nama panggilan', error);
      }
    };

    loadName();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          await loadMoodForUser(session.user.id);

          const { data: profile } = await supabase
            .from('profile')
            .select('nickname')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.nickname) {
            setNickname(profile.nickname);
            await AsyncStorage.setItem('user_nickname', profile.nickname);
          }
        }

        if (event === 'SIGNED_OUT') {
          setUserId(null);
          setNickname('');
          setSelectedMood(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadMoodForUser]);

  // ── Refresh DASS chart & notif setiap kali halaman difokuskan ──
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchDass(userId);
      fetchUnreadNotif();
    }, [userId, fetchDass, fetchUnreadNotif])
  );

  const handleSelectMood = async (moodId: string) => {
    setSelectedMood(moodId);
    if (!userId) return;

    const today = getLocalDateString();
    const { data: existing } = await supabase
      .from("moods")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      await supabase.from("moods").update({ mood: moodId }).eq("id", existing.id);
    } else {
      await supabase.from("moods").insert([{ user_id: userId, mood: moodId, date: today }]);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    try {
      let { data: { session } } = await supabase.auth.getSession();
      let currentUserId = session?.user?.id;

      if (!session) {
        const { data: { session: newSession }, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Gagal Anonymous Sign-in:', error.message);
        } else if (newSession) {
          session = newSession;
          currentUserId = newSession.user.id;
          await AsyncStorage.setItem('user_uuid', newSession.user.id);
        }
      }

      if (currentUserId) {
        setUserId(currentUserId);
        await supabase.from('profile').upsert({
          id: currentUserId,
          user_id: currentUserId,
          nickname: tempName.trim(),
          is_auth: !!session?.user?.email,
        });
      }

      await AsyncStorage.setItem('user_nickname', tempName.trim());
      setNickname(tempName.trim());
      setModalVisible(false);
    } catch (error: any) {
      console.error('Gagal menyimpan nama panggilan', error);
      Alert.alert('Kesalahan', 'Terjadi masalah saat menyimpan nama: ' + (error.message || 'Unknown error'));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 19) return "Selamat sore";
    return "Selamat malam";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { flex: 1, marginRight: 8, fontSize: 24, textAlign: 'left' }]} numberOfLines={1} adjustsFontSizeToFit>
          {nickname ? `${getGreeting()}, ${nickname}!` : headerDate}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Link href="/inbox" asChild>
            <TouchableOpacity activeOpacity={0.7} accessibilityRole="button" style={{ position: 'relative' }}>
              <Icon name="notifications" size={26} color={colors.ink} />
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: 0, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accentRed, borderWidth: 1.5, borderColor: colors.canvas }} />
              )}
            </TouchableOpacity>
          </Link>
          <Link href="/settings-notification" asChild>
            <TouchableOpacity activeOpacity={0.7} accessibilityRole="button">
              <Icon name="settings" size={26} color={colors.ink} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* FIX: Tambah RefreshControl ke ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accentPurple]}
            tintColor={colors.accentPurple}
          />
        }
      >
        <MotivationCard />
        <MoodSelector selected={selectedMood} onSelect={handleSelectMood} />
        <QuickActions />
        <DassBanner />
        <DassChart latestDass={latestDass} />
        <View style={{ height: 16 }} />
      </ScrollView>

      <BottomNav active="home" />

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalTextGroup, { marginBottom: 8 }]}>
              <Text style={styles.modalTitle}>Kenalan Dulu Yuk!</Text>
              <Text style={styles.modalBody}>Siapa nama panggilan yang kamu suka?</Text>
            </View>
            <TextInput
              style={[styles.textInput, { width: '100%', textAlign: 'center', marginBottom: 16 }]}
              placeholder="Masukkan panggilan..."
              placeholderTextColor={colors.inkSoft}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnContinue, { backgroundColor: colors.accentGreen, opacity: tempName.trim() ? 1 : 0.5 }]}
                onPress={handleSaveName}
                activeOpacity={0.8}
                disabled={!tempName.trim()}
              >
                <Text style={styles.modalBtnText}>Mulai Perjalanan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}