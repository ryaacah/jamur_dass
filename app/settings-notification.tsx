import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayId = 'Sen' | 'Sel' | 'Rab' | 'Kam' | 'Jum' | 'Sab' | 'Ming';

interface DayChipProps {
  label: DayId;
  selected: boolean;
  onPress: (day: DayId) => void;
}

interface SectionScheduleProps {
  title: string;
  days?: DayId[];
  selectedDays?: DayId[];
  onToggleDay?: (day: DayId) => void;
  times: string[];
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DAYS: DayId[] = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'];

// ─── Daftar Opsi Avatar ───────────────────────────────────────────────────────
const AVATARS = [
  { id: 'icon1', source: require('../assets/images/icon1.png') },
  { id: 'icon2', source: require('../assets/images/icon2.png') },
  { id: 'icon3', source: require('../assets/images/icon3.png') },
  { id: 'icon4', source: require('../assets/images/icon4.png') },
  { id: 'icon5', source: require('../assets/images/icon5.png') },
  { id: 'icon6', source: require('../assets/images/icon6.png') },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Custom Mushroom Toggle ───────────────────────────────────────────────────
interface MushroomFaceProps {
  isOn: boolean;
}

function MushroomFace({ isOn }: MushroomFaceProps) {
  const mouthPath = isOn
    ? 'M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15' // senyum
    : 'M9 16H15';                                      // datar

  return (
    <Svg viewBox="0 0 24 24" width={24} height={24} fill="none">
      <Circle cx={12} cy={12} r={10} fill="white" />
      <Circle cx={8} cy={11} r={1.5} fill={colors.ink} />
      <Circle cx={16} cy={11} r={1.5} fill={colors.ink} />
      <Path d={mouthPath} stroke={colors.ink} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function MushroomToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const translateX = useRef(new Animated.Value(value ? 40 : 4)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 40 : 4,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
      <View style={[styles.switchTrack, value ? styles.switchTrackOn : styles.switchTrackOff]}>
        <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]}>
          <MushroomFace isOn={value} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const DayChip: React.FC<DayChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress(label)}
    style={[styles.chip, selected && styles.chipSelected]}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={label}
  >
    <Text style={[styles.chipText, selected && styles.chipSelectedText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionSchedule: React.FC<SectionScheduleProps> = ({
  title,
  days,
  selectedDays,
  onToggleDay,
  times,
  onAddTime,
  onRemoveTime,
}) => (
  <View style={[styles.card, styles.sectionCard]}>
    <Text style={styles.cardTitle}>{title}</Text>

    {/* Day chips */}
    {days && selectedDays && onToggleDay && (
      <View style={styles.chipRow}>
        {days.map((day) => (
          <DayChip
            key={day}
            label={day}
            selected={selectedDays.includes(day)}
            onPress={onToggleDay}
          />
        ))}
      </View>
    )}

    {/* Time row */}
    <View style={styles.settingsTimeRow}>
      {times.map((t, idx) => (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          style={styles.timeChip}
          onPress={() => onRemoveTime(idx)}
          accessibilityRole="button"
        >
          <Text style={styles.timeChipText}>{t}</Text>
          <Icon name="close" size={16} color={colors.inkSoft} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onAddTime}
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel={`Tambah jadwal ${title}`}
      >
        <Icon name="add" size={24} color={colors.ink} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface PengaturanScreenProps {
  onBack?: () => void;
  onDeleteData?: () => void;
  onLogout?: () => void;
}

const PengaturanScreen: React.FC<PengaturanScreenProps> = ({
  onBack,
  onDeleteData,
  onLogout,
}) => {
  const router = useRouter();
  const handleBack = onBack || (() => router.back());

  // ── State ──────────────────────────────────────────────────────────────────

  const [notifEnabled, setNotifEnabled] = useState<boolean>(true);

  const [moodTimes, setMoodTimes] = useState<string[]>(['21:00']);
  const [jurnalTimes, setJurnalTimes] = useState<string[]>(['21:00']);

  // ── Profil (Nickname) State ─────────────────────────────────────────────────
  const [nickname, setNickname] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>('icon1');
  const [tempAvatar, setTempAvatar] = useState<string>('icon1');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadName = async () => {
      try {
        // 1. Ambil dari lokal dulu
        const savedName = await AsyncStorage.getItem('user_nickname');
        if (savedName) setNickname(savedName);
        const savedAvatar = await AsyncStorage.getItem('user_avatar');
        if (savedAvatar) setAvatar(savedAvatar);

        // 2. Ambil dari Supabase untuk memastikan sinkronisasi
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile, error } = await supabase
            .from('profile')
            .select('nickname')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.nickname) {
            setNickname(profile.nickname);
            await AsyncStorage.setItem('user_nickname', profile.nickname);
          }
        }
      } catch (error) {
        console.error('Gagal memuat nama panggilan', error);
      }
    };
    loadName();
  }, []);

  // Mengecek sesi login di Supabase
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionEmail(session?.user?.email || null);
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSaveName = async () => {
  if (!tempName.trim()) return;

  try {
    // 1. Pastikan ada sesi (anonymous atau email)
    let { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }

    const userId = session?.user?.id;
    if (!userId) throw new Error('Tidak bisa mendapatkan user ID');

    // 2. Simpan lokal
    await AsyncStorage.setItem('user_nickname', tempName.trim());
    await AsyncStorage.setItem('user_avatar', tempAvatar);
    await AsyncStorage.setItem('user_uuid', userId);
    setNickname(tempName.trim());
    setAvatar(tempAvatar);

    // 3. Upsert ke DB - pastikan kolom sesuai schema
    const { error: upsertError } = await supabase
      .from('profile')
      .upsert({
        id: userId,
        user_id: userId,
        nickname: tempName.trim(),
        is_auth: !!session?.user?.email,// false kalau anonymous
      }, {
        onConflict: 'id', // pastikan upsert berdasarkan PK
      });

    if (upsertError) throw upsertError;

    setModalVisible(false);
  } catch (error: any) {
    console.error('Gagal menyimpan profil:', error);
    Alert.alert('Kesalahan', error.message || 'Gagal menyimpan perubahan');
  }
};

  // ── Assesmen State ──────────────────────────────────────────────────────────
  const [assesmenSelectedDays, setAssesmenSelectedDays] = useState<DayId[]>([
    'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming',
  ]);
  const [assesmenTimes, setAssesmenTimes] = useState<string[]>(['12:00']);

  // ── Modal Tambah Waktu State ────────────────────────────────────────────────
  const [isTimeModalVisible, setTimeModalVisible] = useState<boolean>(false);
  const [timeTarget, setTimeTarget] = useState<'mood' | 'jurnal' | 'assesmen' | null>(null);
  
  // State untuk custom picker (menyerupai image.png)
  const [pickerHour, setPickerHour] = useState<number>(12);
  const [pickerMinute, setPickerMinute] = useState<number>(0);
  const [pickerAmPm, setPickerAmPm] = useState<'AM' | 'PM'>('AM');
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');

  // ── Animasi rotasi jarum jam yang lebih mulus ──────────────────────────────
  const clockHandAnim = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    if (isTimeModalVisible) {
      const targetAngle = pickerMode === 'hour' ? pickerHour * 30 : pickerMinute * 6;
      Animated.spring(clockHandAnim, {
        toValue: targetAngle,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [pickerMode, isTimeModalVisible]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveTime = () => {
    // Konversi AM/PM ke format 24 jam untuk disimpan
    const h24 = pickerAmPm === 'PM' ? (pickerHour === 12 ? 12 : pickerHour + 12) : (pickerHour === 12 ? 0 : pickerHour);
    const formattedTime = `${String(h24).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`;
    
    if (timeTarget === 'mood') setMoodTimes([...moodTimes, formattedTime]);
    if (timeTarget === 'jurnal') setJurnalTimes([...jurnalTimes, formattedTime]);
    if (timeTarget === 'assesmen') setAssesmenTimes([...assesmenTimes, formattedTime]);
    
    setTimeModalVisible(false);
  };

  const handleClockTouch = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    // Titik pusat jam (radius 120 dari kotak 240x240)
    const cx = 120;
    const cy = 120;
    const dx = locationX - cx;
    const dy = locationY - cy;
    
    // Hitung derajat kemiringan (0 derajat di arah jam 12)
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    // Melacak rotasi secara realtime mengikuti sentuhan jari
    clockHandAnim.setValue(angle);

    if (pickerMode === 'hour') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      setPickerHour(h);
    } else {
      let m = Math.round(angle / 6) % 60;
      setPickerMinute(m);
    }
  };

  const handleClockRelease = () => {
    // Efek snap yang mulus ke angka terdekat saat jari dilepas
    const targetAngle = pickerMode === 'hour' ? pickerHour * 30 : pickerMinute * 6;
    Animated.spring(clockHandAnim, {
      toValue: targetAngle,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const toggleDay = (
    day: DayId,
    setter: React.Dispatch<React.SetStateAction<DayId[]>>,
    current: DayId[],
  ) => {
    setter(
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );
  };

  const handleAssesmenToggleDay = (day: DayId) =>
    toggleDay(day, setAssesmenSelectedDays, assesmenSelectedDays);

  // Fungsi logout yang tersambung dengan Supabase
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
      router.replace('/login');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={colors.canvas}
        barStyle="dark-content"
      />

      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBackBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pengaturan</Text>

        {/* Spacer to balance and centre the title */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Profil ──────────────────────────────────────────────────────── */}
        <View style={[styles.card, styles.akunCard, { paddingRight: 64 }]}>
          <View style={[styles.profilDetails, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
            <Image
              source={AVATARS.find((a) => a.id === avatar)?.source || AVATARS[0].source}
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceVariant }}
              contentFit="cover"
            />
            <View style={{ flex: 1, gap: 12 }}>
              <View style={styles.profilRow}>
                <Icon name="person" size={20} color={colors.inkSoft} />
                <Text style={styles.profilText}>{nickname || 'Belum diatur'}</Text>
              </View>
              <View style={styles.profilRow}>
                <Icon name="email" size={20} color={colors.inkSoft} />
                {sessionEmail ? (
                  <Text style={styles.profilText}>{sessionEmail}</Text>
                ) : (
                  <TouchableOpacity onPress={() => router.push('/b-login')} activeOpacity={0.7}>
                    <Text style={[styles.profilText, { color: colors.accentBlue, fontFamily: 'Fredoka_700Bold' }]}>Masuk akun</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Tombol Edit Profil di Kanan Bawah */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => {
              setTempName(nickname);
              setTempAvatar(avatar);
              setModalVisible(true);
            }}
            activeOpacity={0.8}
            accessibilityLabel="Edit Profil"
          >
            <Icon name="edit" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Notifikasi ──────────────────────────────────────────────────── */}
        <View style={[styles.card, styles.notifikasiCard]}>
          <Text style={styles.cardTitle}>Notifikasi</Text>
          <MushroomToggle value={notifEnabled} onToggle={() => setNotifEnabled(!notifEnabled)} />
        </View>

        <View
          style={[!notifEnabled && styles.disabledSection]}
          pointerEvents={notifEnabled ? 'auto' : 'none'}
        >
          {/* ── Trak Mood ───────────────────────────────────────────────────── */}
          <SectionSchedule
            title="Trak Mood"
            times={moodTimes}
            onAddTime={() => {
              setTimeTarget('mood');
              setPickerHour(12);
              setPickerMinute(0);
              setPickerAmPm('AM');
              setPickerMode('hour');
              clockHandAnim.setValue(360);
              setTimeModalVisible(true);
            }}
            onRemoveTime={(idx) => {
              const newTimes = [...moodTimes];
              newTimes.splice(idx, 1);
              setMoodTimes(newTimes);
            }}
          />

          {/* ── Jurnal Harian ───────────────────────────────────────────────── */}
          <SectionSchedule
            title="Jurnal Harian"
            times={jurnalTimes}
            onAddTime={() => {
              setTimeTarget('jurnal');
              setPickerHour(12);
              setPickerMinute(0);
              setPickerAmPm('AM');
              setPickerMode('hour');
              clockHandAnim.setValue(360);
              setTimeModalVisible(true);
            }}
            onRemoveTime={(idx) => {
              const newTimes = [...jurnalTimes];
              newTimes.splice(idx, 1);
              setJurnalTimes(newTimes);
            }}
          />

          {/* ── Self Assessment ─────────────────────────────────────────────── */}
          <SectionSchedule
            title="Self Assessment"
            days={ALL_DAYS}
            selectedDays={assesmenSelectedDays}
            onToggleDay={handleAssesmenToggleDay}
            times={assesmenTimes}
            onAddTime={() => {
              setTimeTarget('assesmen');
              setPickerHour(12);
              setPickerMinute(0);
              setPickerAmPm('AM');
              setPickerMode('hour');
              clockHandAnim.setValue(360);
              setTimeModalVisible(true);
            }}
            onRemoveTime={(idx) => {
              const newTimes = [...assesmenTimes];
              newTimes.splice(idx, 1);
              setAssesmenTimes(newTimes);
            }}
          />
        </View>

        {/* ── Logout & Hapus Data ─────────────────────────────────────────── */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={[styles.akunButton, { backgroundColor: colors.accentRed }]}
            accessibilityRole="button"
            accessibilityLabel="Keluar dari akun"
          >
            <Text style={[styles.akunButtonText, { color: colors.ink }]}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Modal Edit Nama ──────────────────────────────────────────────── */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalTextGroup, { marginBottom: 16 }]}>
              <Text style={styles.modalTitle}>Ubah Profil</Text>
              <Text style={styles.modalBody}>
                Pilih avatar dan nama panggilan barumu
              </Text>
            </View>
            
            {/* ── Avatar Selection Grid ── */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {AVATARS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setTempAvatar(item.id)}
                  style={{
                    width: 60, height: 60, borderRadius: 30, padding: 3,
                    borderWidth: 3, borderColor: tempAvatar === item.id ? colors.ink : 'transparent',
                  }}
                >
                  <Image source={item.source} style={{ width: '100%', height: '100%', borderRadius: 999 }} contentFit="cover" />
                </TouchableOpacity>
              ))}
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
                style={[styles.modalBtnExit, { flex: 1, backgroundColor: colors.surfaceVariant }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnContinue, { flex: 1, backgroundColor: colors.accentGreen, opacity: tempName.trim() ? 1 : 0.5 }]}
                onPress={handleSaveName}
                activeOpacity={0.8}
                disabled={!tempName.trim()}
              >
                <Text style={styles.modalBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Time Picker Modal (Ala image.png) ──────────────────────── */}
      <Modal visible={isTimeModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.tpCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.tpHeader}>PILIH WAKTU</Text>

            {/* ── Digital Display & AM/PM ── */}
            <View style={styles.tpDigitalRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPickerMode('hour')}
                style={[styles.tpTimeBox, pickerMode === 'hour' ? styles.tpTimeBoxActive : styles.tpTimeBoxInactive]}
              >
                <Text style={[styles.tpTimeText, pickerMode !== 'hour' && { color: colors.inkSoft }]}>
                  {String(pickerHour).padStart(2, '0')}
                </Text>
              </TouchableOpacity>

              <Text style={styles.tpColon}>:</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPickerMode('minute')}
                style={[styles.tpTimeBox, pickerMode === 'minute' ? styles.tpTimeBoxActive : styles.tpTimeBoxInactive]}
              >
                <Text style={[styles.tpTimeText, pickerMode !== 'minute' && { color: colors.inkSoft }]}>
                  {String(pickerMinute).padStart(2, '0')}
                </Text>
              </TouchableOpacity>

              <View style={styles.tpAmPmCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setPickerAmPm('AM')} style={[styles.tpAmPmBtn, pickerAmPm === 'AM' && styles.tpAmPmBtnActive]}>
                  <Text style={[styles.tpAmPmText, pickerAmPm === 'AM' && styles.tpAmPmTextActive]}>AM</Text>
                </TouchableOpacity>
                <View style={styles.tpAmPmDivider} />
                <TouchableOpacity activeOpacity={0.8} onPress={() => setPickerAmPm('PM')} style={[styles.tpAmPmBtn, pickerAmPm === 'PM' && styles.tpAmPmBtnActive]}>
                  <Text style={[styles.tpAmPmText, pickerAmPm === 'PM' && styles.tpAmPmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Analog Clock Face ── */}
            <View style={styles.tpClockContainer}>
              <View
                style={styles.tpClockFace}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleClockTouch}
                onResponderMove={handleClockTouch}
                onResponderRelease={handleClockRelease}
              >
                {/* Angka Jam / Menit */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                  const angle = (h * 30 * Math.PI) / 180;
                  const radius = 96; // Jarak angka dari pusat
                  const x = 120 - 15 + radius * Math.sin(angle);
                  const y = 120 - 15 - radius * Math.cos(angle);
                  const label = pickerMode === 'hour' ? h : (h === 12 ? '00' : h * 5);
                  return (
                    <Text key={h} style={[styles.tpClockNumber, { left: x, top: y }]}>
                      {label}
                    </Text>
                  );
                })}

                {/* Jarum Jam */}
                <Animated.View
                  style={[
                    styles.tpClockHandWrapper,
                    {
                      transform: [
                        {
                          rotate: clockHandAnim.interpolate({
                            inputRange: [0, 360],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <View style={styles.tpClockHandLine} />
                  <View style={styles.tpClockHandCircle}>
                    <Text style={styles.tpClockHandText}>
                      {pickerMode === 'hour' ? pickerHour : pickerMinute}
                    </Text>
                  </View>
                  <View style={styles.tpClockHandDot} />
                </Animated.View>
              </View>
            </View>

            {/* ── Footer ── */}
            <View style={styles.tpFooter}>
              <TouchableOpacity
                style={styles.tpBtnCancel}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={styles.tpBtnCancelText}>BATAL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tpBtnOk}
                onPress={handleSaveTime}
                activeOpacity={0.8}
              >
                <Text style={styles.tpBtnOkText}>OKE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PengaturanScreen;