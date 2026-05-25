import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";
import { BAR_COLORS, colors, styles } from "./styles";

// ─── Data ─────────────────────────────────────────────────────────────────────
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

// ─── Motivasi ─────────────────────────────────────────────────────────────────
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
  const quote = useMemo(() => {
    // Menggunakan hari sejak epoch (1 Jan 1970) agar selalu konsisten berubah tiap hari
    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    return MOTIVATIONAL_QUOTES[daysSinceEpoch % MOTIVATIONAL_QUOTES.length];
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.accentCream, padding: 20, paddingBottom: 36, position: "relative", overflow: "hidden" }]}>
      <Text style={[styles.cardBody, { fontStyle: "italic", color: colors.ink, lineHeight: 22, zIndex: 2, position: "relative", paddingRight: 16 }]}>
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
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
            <Image
              source={require("../assets/images/mur-jur.png")}
              style={{ position: "absolute", bottom: -8, left: -8, width: 72, height: 72, transform: [{ scaleX: -1 }], opacity: 0.9 }}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1, zIndex: 2 }}>
            <Text style={styles.cardTitle}>Ceritakan Harimu</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>
              Ayo buat jurnal harian mu disini..
            </Text>
          </View>
          <View style={[styles.chevronRow, { zIndex: 2 }]}>
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
          <View style={[StyleSheet.absoluteFillObject, { borderRadius: 12, overflow: "hidden" }]}>
            <Image
              source={require("../assets/images/relx.png")}
              style={{ position: "absolute", bottom: -8, right: -8, width: 72, height: 72, opacity: 0.9 }}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1, zIndex: 2 }}>
            <Text style={styles.cardTitle}>Atur pernafasan</Text>
            <Text style={[styles.cardBody, { marginTop: 4 }]}>
              Tenangkan pikiran mu, atur pernafasan mu disini...
            </Text>
          </View>
          <View style={[styles.chevronRow, { zIndex: 2 }]}>
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
  // Menghasilkan tanggal hari ini untuk header
  const headerDate = useMemo(() => {
    const today = new Date();
    return `${DAY_NAMES_LONG[today.getDay()]}, ${today.getDate()} ${MONTH_NAMES[today.getMonth()]}`;
  }, []);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fungsi untuk mendapatkan format tanggal YYYY-MM-DD sesuai waktu lokal HP
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Memuat sesi dan mood hari ini saat halaman pertama kali dibuka
  useEffect(() => {
    const loadMoodAndSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const today = getLocalDateString();
        
        const { data } = await supabase
          .from("moods")
          .select("id, mood")
          .eq("user_id", session.user.id)
          .eq("date", today)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (data && data.mood) {
          setSelectedMood(data.mood);
        }
      }
    };
    loadMoodAndSession();
  }, []);

  // Fungsi ketika mood ditekan: mengubah tampilan + menyimpan ke DB
  const handleSelectMood = async (moodId: string) => {
    setSelectedMood(moodId); // Ubah tampilan secara langsung
    if (!userId) return; // Jika belum login, hanya ubah tampilan lokal

    const today = getLocalDateString();
    
    // Cek apakah hari ini sudah ada data mood
    const { data: existing } = await supabase
      .from("moods")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (existing) {
      // Update data jika sudah ada
      await supabase.from("moods").update({ mood: moodId }).eq("id", existing.id);
    } else {
      // Insert data baru jika belum ada
      await supabase.from("moods").insert([{ user_id: userId, mood: moodId, date: today }]);
    }
  };

  const activeMood = MOODS.find((m) => m.id === selectedMood);
  const selectedMoodColor = activeMood ? activeMood.color : null;

  // State untuk nama panggilan
  const [nickname, setNickname] = useState("");
  const [tempName, setTempName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  // Cek apakah nama panggilan sudah pernah disimpan
  useEffect(() => {
    const loadName = async () => {
      try {
        // 1. Cek local storage dulu
        const savedName = await AsyncStorage.getItem("user_nickname");
        
        // 2. Cek sesi Supabase
        let { data: { session } } = await supabase.auth.getSession();
        
        // 3. Jika ada nickname lokal tapi belum ada sesi, sign in anonim sekarang
        if (savedName && !session) {
          const { data: { session: newSession }, error: signInError } = await supabase.auth.signInAnonymously();
          if (!signInError && newSession) {
            session = newSession;
            // Upsert profile agar DB sinkron dengan lokal
            await supabase.from('profile').upsert({ id: session.user.id, nickname: savedName, is_auth: false });
          }
        }

        if (session) {
          setUserId(session.user.id); // Set userId untuk mood tracking
          // Jika ada sesi, ambil nickname dari DB jika tidak ada di AsyncStorage
          const { data: profile } = await supabase
            .from('profile')
            .select('nickname')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.nickname) {
            setNickname(profile.nickname);
            await AsyncStorage.setItem("user_nickname", profile.nickname);
            return;
          }
        }

        if (savedName) {
          setNickname(savedName);
        } else {
          setModalVisible(true);
        }
      } catch (error) {
        console.error("Gagal memuat nama panggilan", error);
      }
    };
    loadName();
  }, []);

  const handleSaveName = async () => {
    if (tempName.trim()) {
      try {
        // 1. Sign in secara anonim jika belum ada sesi
        let { data: { session: existingSession } } = await supabase.auth.getSession();
        let userId = existingSession?.user.id;

        if (!existingSession) {
          const { data: { session: newSession, user }, error: signInError } = await supabase.auth.signInAnonymously();
          if (signInError) {
            console.error("Gagal Anonymous Sign-in:", signInError.message);
            // Jika anonim gagal, kita buat UUID lokal sebagai ID guest sementara
            const localId = await AsyncStorage.getItem("user_uuid") || 
                            Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
            userId = localId;
            await AsyncStorage.setItem("user_uuid", localId);
          } else {
            userId = user?.id;
            existingSession = newSession;
            if (userId) await AsyncStorage.setItem("user_uuid", userId);
          }
        }

        // 2. Simpan ke database (tabel profile)
        if (userId) {
          setUserId(userId);
          const { error: upsertError } = await supabase
            .from('profile')
            .upsert({ 
              id: userId, 
              nickname: tempName.trim(),
              is_auth: !!existingSession?.user.email,
              user_id: userId
            });
          
          if (upsertError) {
            console.error("Gagal simpan ke DB:", upsertError.message);
          }
        }

        // 3. Simpan secara lokal
        await AsyncStorage.setItem("user_nickname", tempName.trim());
        setNickname(tempName.trim());
        setModalVisible(false);
      } catch (error: any) {
        console.error("Gagal menyimpan nama panggilan", error);
        Alert.alert("Kesalahan", "Terjadi masalah saat menyimpan nama: " + (error.message || "Unknown error"));
      }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { flex: 1, marginRight: 8 }]} numberOfLines={1} adjustsFontSizeToFit>
          {nickname ? `${getGreeting()}, ${nickname}!` : headerDate}
        </Text>
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
        {/* Motivation Card */}
        <MotivationCard />

        {/* Mood Selector */}
        <MoodSelector selected={selectedMood} onSelect={handleSelectMood} />

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

      {/* Modal Input Nama Panggilan */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalTextGroup, { marginBottom: 8 }]}>
              <Text style={styles.modalTitle}>Kenalan Dulu Yuk!</Text>
              <Text style={styles.modalBody}>
                Siapa nama panggilan yang kamu suka?
              </Text>
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