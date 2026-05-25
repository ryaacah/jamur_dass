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
  StyleSheet,
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
      <View style={[localStyles.switchTrack, value ? localStyles.switchTrackOn : localStyles.switchTrackOff]}>
        <Animated.View style={[localStyles.switchThumb, { transform: [{ translateX }] }]}>
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
    style={[localStyles.chip, selected && localStyles.chipSelected]}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={label}
  >
    <Text style={[localStyles.chipText, selected && localStyles.chipSelectedText]}>
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
  <View style={[styles.card, localStyles.sectionCard]}>
    <Text style={styles.cardTitle}>{title}</Text>

    {/* Day chips */}
    {days && selectedDays && onToggleDay && (
      <View style={localStyles.chipRow}>
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
    <View style={localStyles.timeRow}>
      {times.map((t, idx) => (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          style={localStyles.timeChip}
          onPress={() => onRemoveTime(idx)}
          accessibilityRole="button"
        >
          <Text style={localStyles.timeChipText}>{t}</Text>
          <Icon name="close" size={16} color={colors.inkSoft} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onAddTime}
        style={localStyles.addButton}
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
    Alert.alert('Sukses', 'Profil berhasil disimpan!');
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

    if (pickerMode === 'hour') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      setPickerHour(h);
    } else {
      let m = Math.round(angle / 6) % 60;
      setPickerMinute(m);
    }
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
        <View style={[styles.card, localStyles.akunCard, { paddingRight: 64 }]}>
          <View style={[localStyles.profilDetails, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
            <Image
              source={AVATARS.find((a) => a.id === avatar)?.source || AVATARS[0].source}
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceVariant }}
              contentFit="cover"
            />
            <View style={{ flex: 1, gap: 12 }}>
              <View style={localStyles.profilRow}>
                <Icon name="person" size={20} color={colors.inkSoft} />
                <Text style={localStyles.profilText}>{nickname || 'Belum diatur'}</Text>
              </View>
              <View style={localStyles.profilRow}>
                <Icon name="email" size={20} color={colors.inkSoft} />
                {sessionEmail ? (
                  <Text style={localStyles.profilText}>{sessionEmail}</Text>
                ) : (
                  <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                    <Text style={[localStyles.profilText, { color: colors.accentBlue, fontWeight: '700' }]}>Masuk akun</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Tombol Edit Profil di Kanan Bawah */}
          <TouchableOpacity
            style={localStyles.editProfileBtn}
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
        <View style={[styles.card, localStyles.notifikasiCard]}>
          <Text style={styles.cardTitle}>Notifikasi</Text>
          <MushroomToggle value={notifEnabled} onToggle={() => setNotifEnabled(!notifEnabled)} />
        </View>

        <View
          style={[!notifEnabled && localStyles.disabledSection]}
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
        <View style={localStyles.logoutContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={[localStyles.akunButton, { backgroundColor: colors.accentRed }]}
            accessibilityRole="button"
            accessibilityLabel="Keluar dari akun"
          >
            <Text style={[localStyles.akunButtonText, { color: colors.ink }]}>Keluar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDeleteData}
            style={[localStyles.akunButton, { backgroundColor: colors.surfaceMuted, borderWidth: 0, elevation: 0 }]}
            accessibilityRole="button"
            accessibilityLabel="Hapus data akun"
          >
            <Text style={[localStyles.akunButtonText, { color: colors.inkSoft }]}>Hapus data akun</Text>
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
      <Modal visible={isTimeModalVisible} transparent animationType="fade" onRequestClose={() => setTimeModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTimeModalVisible(false)}>
          <View style={localStyles.tpCard} onStartShouldSetResponder={() => true}>
            <Text style={localStyles.tpHeader}>PILIH WAKTU</Text>

            {/* ── Digital Display & AM/PM ── */}
            <View style={localStyles.tpDigitalRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPickerMode('hour')}
                style={[localStyles.tpTimeBox, pickerMode === 'hour' ? localStyles.tpTimeBoxActive : localStyles.tpTimeBoxInactive]}
              >
                <Text style={[localStyles.tpTimeText, pickerMode !== 'hour' && { color: colors.inkSoft }]}>
                  {String(pickerHour).padStart(2, '0')}
                </Text>
              </TouchableOpacity>

              <Text style={localStyles.tpColon}>:</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPickerMode('minute')}
                style={[localStyles.tpTimeBox, pickerMode === 'minute' ? localStyles.tpTimeBoxActive : localStyles.tpTimeBoxInactive]}
              >
                <Text style={[localStyles.tpTimeText, pickerMode !== 'minute' && { color: colors.inkSoft }]}>
                  {String(pickerMinute).padStart(2, '0')}
                </Text>
              </TouchableOpacity>

              <View style={localStyles.tpAmPmCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setPickerAmPm('AM')} style={[localStyles.tpAmPmBtn, pickerAmPm === 'AM' && localStyles.tpAmPmBtnActive]}>
                  <Text style={[localStyles.tpAmPmText, pickerAmPm === 'AM' && localStyles.tpAmPmTextActive]}>AM</Text>
                </TouchableOpacity>
                <View style={localStyles.tpAmPmDivider} />
                <TouchableOpacity activeOpacity={0.8} onPress={() => setPickerAmPm('PM')} style={[localStyles.tpAmPmBtn, pickerAmPm === 'PM' && localStyles.tpAmPmBtnActive]}>
                  <Text style={[localStyles.tpAmPmText, pickerAmPm === 'PM' && localStyles.tpAmPmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Analog Clock Face ── */}
            <View style={localStyles.tpClockContainer}>
              <View
                style={localStyles.tpClockFace}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleClockTouch}
                onResponderMove={handleClockTouch}
              >
                {/* Angka Jam / Menit */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                  const angle = (h * 30 * Math.PI) / 180;
                  const radius = 96; // Jarak angka dari pusat
                  const x = 120 - 15 + radius * Math.sin(angle);
                  const y = 120 - 15 - radius * Math.cos(angle);
                  const label = pickerMode === 'hour' ? h : (h === 12 ? '00' : h * 5);
                  return (
                    <Text key={h} style={[localStyles.tpClockNumber, { left: x, top: y }]}>
                      {label}
                    </Text>
                  );
                })}

                {/* Jarum Jam */}
                <View
                  style={[
                    localStyles.tpClockHandWrapper,
                    { transform: [{ rotate: `${pickerMode === 'hour' ? pickerHour * 30 : pickerMinute * 6}deg` }] },
                  ]}
                  pointerEvents="none"
                >
                  <View style={localStyles.tpClockHandLine} />
                  <View style={localStyles.tpClockHandCircle}>
                    <Text style={localStyles.tpClockHandText}>
                      {pickerMode === 'hour' ? pickerHour : pickerMinute}
                    </Text>
                  </View>
                  <View style={localStyles.tpClockHandDot} />
                </View>
              </View>
            </View>

            {/* ── Footer ── */}
            <View style={localStyles.tpFooter}>
              <TouchableOpacity
                style={localStyles.tpBtnCancel}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={localStyles.tpBtnCancelText}>BATAL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={localStyles.tpBtnOk}
                onPress={handleSaveTime}
                activeOpacity={0.8}
              >
                <Text style={localStyles.tpBtnOkText}>OKE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surfaceCard },
  chipSelected: { backgroundColor: colors.primaryContainer, borderColor: colors.ink },
  chipText: { fontSize: 14, color: colors.inkSoft, fontWeight: '500' },
  chipSelectedText: { color: colors.onPrimaryContainer, fontWeight: '700' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
  timeChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surfaceCard },
  timeChipText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  addButton: { borderWidth: 1, borderColor: colors.ink, borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.secondaryFixed, alignItems: 'center', justifyContent: 'center' },
  notifikasiCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionCard: { marginBottom: 12 },
  akunCard: { marginBottom: 16 },
  profilDetails: { gap: 12 },
  profilRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profilText: { fontSize: 18, color: colors.inkSoft, fontWeight: '500' },
  logoutContainer: { marginTop: 16, marginBottom: 32, gap: 12 },
  akunButton: { width: '100%', height: 48, borderRadius: 12, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  akunButtonText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  disabledSection: { opacity: 0.5 },
  editProfileBtn: { position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentYellow, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },

  // ── Custom Time Picker Styles ──
  tpCard: { backgroundColor: colors.surfaceCard, borderRadius: 32, padding: 24, width: '100%', maxWidth: 360, shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  tpHeader: { fontSize: 14, fontWeight: '700', color: colors.inkSoft, letterSpacing: 1.5, marginBottom: 24, fontFamily: 'Fredoka_700Bold' },
  tpDigitalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 },
  tpTimeBox: { width: 88, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  tpTimeBoxActive: { backgroundColor: colors.tertiaryContainer, borderColor: colors.ink },
  tpTimeBoxInactive: { backgroundColor: colors.surfaceVariant },
  tpTimeText: { fontSize: 52, fontWeight: '700', color: colors.ink, fontFamily: 'Fredoka_700Bold' },
  tpColon: { fontSize: 40, fontWeight: '700', color: colors.inkSoft, marginBottom: 8 },
  tpAmPmCol: { borderWidth: 2, borderColor: colors.ink, borderRadius: 12, overflow: 'hidden' },
  tpAmPmBtn: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surfaceCard },
  tpAmPmBtnActive: { backgroundColor: colors.tertiaryContainer },
  tpAmPmText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft, textAlign: 'center' },
  tpAmPmTextActive: { color: colors.ink },
  tpAmPmDivider: { height: 2, backgroundColor: colors.ink },
  
  tpClockContainer: { alignItems: 'center', marginBottom: 32 },
  tpClockFace: { width: 240, height: 240, borderRadius: 120, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  tpClockNumber: { position: 'absolute', width: 32, height: 32, textAlign: 'center', textAlignVertical: 'center', fontSize: 17, fontWeight: '600', color: colors.ink, fontFamily: 'Fredoka_600SemiBold' },
  
  tpClockHandWrapper: { position: 'absolute', width: 40, height: 240, alignItems: 'center' },
  tpClockHandLine: { width: 2, height: 92, backgroundColor: colors.accentRed, marginTop: 28 }, // Garis menghubungkan jarum dengan titik pusat
  tpClockHandCircle: { position: 'absolute', top: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentRed, alignItems: 'center', justifyContent: 'center' },
  tpClockHandDot: { position: 'absolute', top: 116, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentRed },
  tpClockHandText: { fontSize: 16, fontWeight: '700', color: colors.ink, fontFamily: 'Fredoka_700Bold' },
  
  tpFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  tpBtnCancel: { paddingHorizontal: 16, paddingVertical: 8 },
  tpBtnCancelText: { fontSize: 16, fontWeight: '700', color: colors.inkSoft },
  tpBtnOk: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.accentGreen, borderRadius: 12, borderWidth: 2, borderColor: colors.ink },
  tpBtnOkText: { fontSize: 16, fontWeight: '700', color: colors.ink },

  // ── Custom Notification Switch Styles ──
  switchTrack: { width: 80, height: 44, borderRadius: 22, justifyContent: 'center', borderWidth: 2, borderColor: colors.ink },
  switchTrackOn: { backgroundColor: colors.accentGreen },
  switchTrackOff: { backgroundColor: colors.surfaceVariant },
  switchThumb: { position: 'absolute', left: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.ink },
});

export default PengaturanScreen;