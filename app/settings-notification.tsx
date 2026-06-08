// settings-notification.tsx
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import {
  loadNotificationSettings,
  saveAndSyncNotifications,
} from '../lib/notifications';
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

const CLOCK_SIZE = 256;
const CLOCK_CENTER = CLOCK_SIZE / 2; // 128
const OUTER_RADIUS = 96;
const INNER_RADIUS = 60;
const NUM_SIZE_OUTER = 36;
const NUM_SIZE_INNER = 28;

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
    ? 'M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15'
    : 'M9 16H15';

  return (
    <Svg viewBox="0 0 24 24" width={24} height={24} fill="none">
      <Circle cx={12} cy={12} r={10} fill="white" />
      <Circle cx={8} cy={11} r={1.5} fill={colors.ink} />
      <Circle cx={16} cy={11} r={1.5} fill={colors.ink} />
      <Path
        d={mouthPath}
        stroke={colors.ink}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MushroomToggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
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
      <View
        style={[
          styles.switchTrack,
          value ? styles.switchTrackOn : styles.switchTrackOff,
        ]}
      >
        <Animated.View
          style={[styles.switchThumb, { transform: [{ translateX }] }]}
        >
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

    {days && selectedDays && onToggleDay && (
      <View style={styles.chipRow}>
        {days.map((day) => (
          <DayChip
            key={day}
            label={day}
            selected={selectedDays.includes(day)}
            onPress={() => onToggleDay(day)}
          />
        ))}
      </View>
    )}

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
          <Icon
            name="close"
            size={16}
            color={colors.inkSoft}
        style={styles.timeChipIcon}
          />
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

// ─── Material 24h Clock Face ──────────────────────────────────────────────────

interface ClockFaceProps {
  mode: 'hour' | 'minute';
  hour: number;    // 0-23
  minute: number;  // 0-59
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onRelease?: () => void;
}

function calcAngle(mode: 'hour' | 'minute', hour: number, minute: number): number {
  return mode === 'hour' ? ((hour % 12) / 12) * 360 : (minute / 60) * 360;
}

function calcLength(mode: 'hour' | 'minute', hour: number): number {
  return mode === 'hour' && (hour === 0 || hour > 12) ? INNER_RADIUS : OUTER_RADIUS;
}

// Hitung koordinat (x,y) ujung jarum dari sudut akumulatif + panjang
function angleToXY(accAngle: number, length: number): { x: number; y: number } {
  const rad = ((accAngle - 90) * Math.PI) / 180;
  return {
    x: CLOCK_CENTER + length * Math.cos(rad),
    y: CLOCK_CENTER + length * Math.sin(rad),
  };
}

// AnimatedLine & AnimatedCircle: wrap SVG elements supaya bisa pakai Animated.Value
const AnimatedLine = Animated.createAnimatedComponent(Line as any);
const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

function ClockFace({ mode, hour, minute, onHourChange, onMinuteChange, onRelease }: ClockFaceProps) {
  // accAngle: sudut akumulatif, TIDAK di-clamp ke 0-360.
  // Ini ref JS biasa (bukan Animated) — hanya untuk menghitung target delta.
  const accAngle = useRef<number>(calcAngle(mode, hour, minute));

  // Animated.Value untuk koordinat langsung — TIDAK pakai useNativeDriver
  // karena SVG props bukan native props, tapi ini tetap lebih smooth dari
  // setState karena tidak trigger React reconciliation tiap frame.
  const animX = useRef(new Animated.Value(
    angleToXY(accAngle.current, calcLength(mode, hour)).x
  )).current;
  const animY = useRef(new Animated.Value(
    angleToXY(accAngle.current, calcLength(mode, hour)).y
  )).current;

  // Untuk hapus animasi sebelumnya
  const runningAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const targetAngle = calcAngle(mode, hour, minute);
    const targetLen   = calcLength(mode, hour);

    // Delta terpendek — tidak pernah lompat > 180°
    let delta = targetAngle - (accAngle.current % 360);
    if (delta > 180)  delta -= 360;
    if (delta < -180) delta += 360;
    const finalAngle = accAngle.current + delta;

    // Hitung target (x,y) dari finalAngle + targetLen
    const { x: targetX, y: targetY } = angleToXY(finalAngle, targetLen);

    // Stop animasi sebelumnya
    if (runningAnim.current) runningAnim.current.stop();

    // Jalankan animasi koordinat (bukan rotasi) menggunakan spring RN
    // Spring terasa lebih natural di sentuhan dibanding timing
    runningAnim.current = Animated.parallel([
      Animated.spring(animX, {
        toValue: targetX,
        useNativeDriver: false, // SVG props tidak support native driver
        speed: 20,
        bounciness: 3,
      }),
      Animated.spring(animY, {
        toValue: targetY,
        useNativeDriver: false,
        speed: 20,
        bounciness: 3,
      }),
    ]);
    runningAnim.current.start(({ finished }) => {
      // Update accAngle hanya setelah animasi selesai agar delta berikutnya benar
      if (finished) {
        accAngle.current = finalAngle;
      }
    });

    return () => {
      if (runningAnim.current) runningAnim.current.stop();
    };
  }, [mode, hour, minute, animX, animY]);

  const handleTouch = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - CLOCK_CENTER;
    const dy = locationY - CLOCK_CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    if (mode === 'hour') {
      let h = Math.round(angle / 30) % 12;
      const useInner = dist < (OUTER_RADIUS + INNER_RADIUS) / 2;
      if (useInner) {
        h = h === 0 ? 0 : h + 12;
      } else {
        if (h === 0) h = 12;
      }
      onHourChange(h);
    } else {
      const m = Math.round(angle / 6) % 60;
      onMinuteChange(m);
    }
  };

  // Outer ring: 12, 1, 2, ..., 11
  const outerNums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Inner ring: 00, 13, 14, ..., 23
  const innerNums = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const isInnerSelected = mode === 'hour' && (hour === 0 || hour > 12);

  return (
    <View
      style={styles.tpClockFace}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTouch}
      onResponderMove={handleTouch}
      onResponderRelease={() => {
        if (onRelease) onRelease();
      }}
    >
      {/* ── Jarum jam: Animated SVG dengan koordinat langsung ─────────────
          - Tidak ada transform/rotate → tidak ada masalah inputRange
          - Tidak ada setState di loop → tidak ada re-render tiap frame
          - animX/animY dikontrol Animated.spring RN → smooth di native */}
      <Svg
        width={CLOCK_SIZE}
        height={CLOCK_SIZE}
        style={styles.tpSvgOverlay}
        pointerEvents="none"
      >
        {/* Garis jarum */}
        <AnimatedLine
          x1={CLOCK_CENTER}
          y1={CLOCK_CENTER}
          x2={animX}
          y2={animY}
          stroke={colors.accentPurple}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Titik pivot tengah */}
        <Circle
          cx={CLOCK_CENTER}
          cy={CLOCK_CENTER}
          r={4}
          fill={colors.accentPurple}
        />
        {/* Bulatan ujung jarum */}
        <AnimatedCircle
          cx={animX}
          cy={animY}
          r={18}
          fill={colors.accentPurple}
        />
      </Svg>

      {/* ── Outer ring numbers ─────────────────────────────────────────── */}
      {outerNums.map((num, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const x = CLOCK_CENTER + OUTER_RADIUS * Math.cos(angle) - NUM_SIZE_OUTER / 2;
        const y = CLOCK_CENTER + OUTER_RADIUS * Math.sin(angle) - NUM_SIZE_OUTER / 2;

        const isHourSelected =
          mode === 'hour' &&
          !isInnerSelected &&
          (hour === num || (num === 12 && hour === 12));
        const isMinSelected =
          mode === 'minute' && (num * 5) % 60 === minute;
        const isSelected = isHourSelected || isMinSelected;

        return (
          <Text
            key={`outer-${num}`}
            pointerEvents="none"
            style={[
              styles.tpClockNumber,
              {
                left: x,
                top: y,
                width: NUM_SIZE_OUTER,
                height: NUM_SIZE_OUTER,
              },
              isSelected && styles.tpClockNumberSelected,
            ]}
          >
            {mode === 'minute' ? String((num * 5) % 60).padStart(2, '0') : num}
          </Text>
        );
      })}

      {/* ── Inner ring numbers (hour only) ────────────────────────────── */}
      {mode === 'hour' &&
        innerNums.map((num, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const x = CLOCK_CENTER + INNER_RADIUS * Math.cos(angle) - NUM_SIZE_INNER / 2;
          const y = CLOCK_CENTER + INNER_RADIUS * Math.sin(angle) - NUM_SIZE_INNER / 2;
          const isSelected = hour === num;
          const label = num === 0 ? '00' : String(num);

          return (
            <Text
              key={`inner-${num}`}
              pointerEvents="none"
              style={[
                styles.tpClockNumberInner,
                {
                  left: x,
                  top: y,
                  width: NUM_SIZE_INNER,
                  height: NUM_SIZE_INNER,
                },
                isSelected && styles.tpClockNumberSelected,
                isSelected && { borderRadius: NUM_SIZE_INNER / 2 },
              ]}
            >
              {label}
            </Text>
          );
        })}
    </View>
  );
}

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

  // ── Profil State ────────────────────────────────────────────────────────────
  const [nickname, setNickname] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>('icon1');
  const [tempAvatar, setTempAvatar] = useState<string>('icon1');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // ── Load profil dari AsyncStorage & Supabase ────────────────────────────────
  useEffect(() => {
    const loadName = async () => {
      try {
        const savedName = await AsyncStorage.getItem('user_nickname');
        if (savedName) setNickname(savedName);
        const savedAvatar = await AsyncStorage.getItem('user_avatar');
        if (savedAvatar) setAvatar(savedAvatar);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // tambahkan ini
          setSessionEmail(session.user.email || null);

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
      } catch (error) {
        console.error('Gagal memuat nama panggilan', error);
      }
    };
    loadName();
  }, []);

  // ── Load notification settings ──────────────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadNotificationSettings();
        setNotifEnabled(settings.notifEnabled);
        setMoodTimes(settings.moodTimes);
        setJurnalTimes(settings.jurnalTimes);
        setAssesmenSelectedDays(settings.assesmenDays as DayId[]);
        setAssesmenTimes(settings.assesmenTimes);
      } catch (error) {
        console.error('Gagal memuat pengaturan notifikasi', error);
      }
    };
    loadSettings();
  }, []);

  // ── Cek sesi login Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSessionEmail(session?.user?.email || null);
    };
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;

    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        session = data.session;
      }

      const userId = session?.user?.id;
      if (!userId) throw new Error('Tidak bisa mendapatkan user ID');

      await AsyncStorage.setItem('user_nickname', tempName.trim());
      await AsyncStorage.setItem('user_avatar', tempAvatar);
      await AsyncStorage.setItem('user_uuid', userId);
      setNickname(tempName.trim());
      setAvatar(tempAvatar);

      const { error: upsertError } = await supabase.from('profile').upsert(
        {
          id: userId,
          user_id: userId,
          nickname: tempName.trim(),
          is_auth: !!session?.user?.email,
        },
        { onConflict: 'id' }
      );

      if (upsertError) throw upsertError;

      setModalVisible(false);
    } catch (error: any) {
      console.error('Gagal menyimpan profil:', error);
      Alert.alert('Kesalahan', error.message || 'Gagal menyimpan perubahan');
    }
  };

  // ── Assessment State ────────────────────────────────────────────────────────
  const [assesmenSelectedDays, setAssesmenSelectedDays] = useState<DayId[]>([
    'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming',
  ]);
  const [assesmenTimes, setAssesmenTimes] = useState<string[]>(['12:00']);

  // ── Time Picker State ───────────────────────────────────────────────────────
  const [isTimeModalVisible, setTimeModalVisible] = useState<boolean>(false);
  const [timeTarget, setTimeTarget] = useState<
    'mood' | 'jurnal' | 'assesmen' | null
  >(null);

  // 24h format: hour 0-23, minute 0-59
  const [pickerHour, setPickerHour] = useState<number>(13);
  const [pickerMinute, setPickerMinute] = useState<number>(0);
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');

  const handleMinuteChange = (m: number) => {
    setPickerMinute(m);
  };

  const handleClockHourSelect = (h: number) => {
    setPickerHour(h);
  };

  const handleClockRelease = () => {
    // Otomatis pindah ke menit dinonaktifkan, biarkan pengguna tap secara manual
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleToggleNotif = async () => {
    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    await saveAndSyncNotifications({ notifEnabled: newVal });
  };

  const handleSaveTime = async () => {
    const formattedTime = `${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`;

    if (timeTarget === 'mood') {
      const newTimes = [...moodTimes, formattedTime];
      setMoodTimes(newTimes);
      await saveAndSyncNotifications({ moodTimes: newTimes });
    }
    if (timeTarget === 'jurnal') {
      const newTimes = [...jurnalTimes, formattedTime];
      setJurnalTimes(newTimes);
      await saveAndSyncNotifications({ jurnalTimes: newTimes });
    }
    if (timeTarget === 'assesmen') {
      const newTimes = [...assesmenTimes, formattedTime];
      setAssesmenTimes(newTimes);
      await saveAndSyncNotifications({ assesmenTimes: newTimes });
    }

    setTimeModalVisible(false);
  };

  const handleRemoveMoodTime = async (idx: number) => {
    const newTimes = moodTimes.filter((_, i) => i !== idx);
    setMoodTimes(newTimes);
    await saveAndSyncNotifications({ moodTimes: newTimes });
  };

  const handleRemoveJurnalTime = async (idx: number) => {
    const newTimes = jurnalTimes.filter((_, i) => i !== idx);
    setJurnalTimes(newTimes);
    await saveAndSyncNotifications({ jurnalTimes: newTimes });
  };

  const handleRemoveAssesmenTime = async (idx: number) => {
    const newTimes = assesmenTimes.filter((_, i) => i !== idx);
    setAssesmenTimes(newTimes);
    await saveAndSyncNotifications({ assesmenTimes: newTimes });
  };

  const handleAssesmenToggleDay = async (day: DayId) => {
    const newDays = assesmenSelectedDays.includes(day)
      ? assesmenSelectedDays.filter((d) => d !== day)
      : [...assesmenSelectedDays, day];
    setAssesmenSelectedDays(newDays);
    await saveAndSyncNotifications({ assesmenDays: newDays });
  };

  const openTimePicker = (target: 'mood' | 'jurnal' | 'assesmen') => {
    setTimeTarget(target);
    setPickerHour(13);
    setPickerMinute(0);
    setPickerMode('hour');
    setTimeModalVisible(true);
  };

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
      <StatusBar style="dark" backgroundColor={colors.canvas} />

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
          <View
          style={[styles.profilDetails, styles.profilDetailsRow]}
          >
            <Image
              source={
                AVATARS.find((a) => a.id === avatar)?.source ||
                AVATARS[0].source
              }
            style={styles.profilAvatar}
              contentFit="cover"
            />
          <View style={styles.profilInfo}>
              <View style={styles.profilRow}>
                <Icon name="person" size={20} color={colors.inkSoft} />
                <Text style={styles.profilText}>
                  {nickname || 'Belum diatur'}
                </Text>
              </View>
              <View style={styles.profilRow}>
                <Icon name="email" size={20} color={colors.inkSoft} />
                {sessionEmail ? (
                  <Text style={styles.profilText}>{sessionEmail}</Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => router.push('/b-login')}
                    activeOpacity={0.7}
                  >
                    <Text
                  style={[styles.profilText, styles.profilTextLink]}
                    >
                      Masuk akun
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

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

        {/* ── Notifikasi Toggle ────────────────────────────────────────────── */}
        <View style={[styles.card, styles.notifikasiCard]}>
          <Text style={styles.cardTitle}>Notifikasi</Text>
          <MushroomToggle value={notifEnabled} onToggle={handleToggleNotif} />
        </View>

        {/* ── Jadwal Notifikasi ────────────────────────────────────────────── */}
        <View
          style={[!notifEnabled && styles.disabledSection]}
          pointerEvents={notifEnabled ? 'auto' : 'none'}
        >
          <SectionSchedule
            title="Trak Mood"
            times={moodTimes}
            onAddTime={() => openTimePicker('mood')}
            onRemoveTime={handleRemoveMoodTime}
          />

          <SectionSchedule
            title="Jurnal Harian"
            times={jurnalTimes}
            onAddTime={() => openTimePicker('jurnal')}
            onRemoveTime={handleRemoveJurnalTime}
          />

          <SectionSchedule
            title="Self Assessment"
            days={ALL_DAYS}
            selectedDays={assesmenSelectedDays}
            onToggleDay={handleAssesmenToggleDay}
            times={assesmenTimes}
            onAddTime={() => openTimePicker('assesmen')}
            onRemoveTime={handleRemoveAssesmenTime}
          />
        </View>

        {/* ── Logout ──────────────────────────────────────────────────────── */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
          style={[styles.akunButton, styles.akunButtonLogout]}
            accessibilityRole="button"
            accessibilityLabel="Keluar dari akun"
          >
          <Text style={styles.akunButtonText}>
              Keluar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Modal Edit Profil ────────────────────────────────────────────── */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalCard}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalTextGroup, { marginBottom: 16 }]}>
              <Text style={styles.modalTitle}>Ubah Profil</Text>
              <Text style={styles.modalBody}>
                Pilih avatar dan nama panggilan barumu
              </Text>
            </View>

            <View
              style={styles.avatarGrid}
            >
              {AVATARS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setTempAvatar(item.id)}
                  style={[
                    styles.avatarOption,
                    tempAvatar === item.id && styles.avatarOptionSelected,
                  ]}
                >
                  <Image
                    source={item.source}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.textInput, styles.profilInput]}
              placeholder="Masukkan panggilan..."
              placeholderTextColor={colors.inkSoft}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnExit, styles.modalBtnCancel]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnContinue,
                  styles.modalBtnSave,
                  { opacity: tempName.trim() ? 1 : 0.5 },
                ]}
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

      {/* ── Material 24h Time Picker Modal ──────────────────────────────── */}
      <Modal
        visible={isTimeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, styles.modalCardNoPadding]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header banner */}
            <View
              style={styles.tpModalHeader}
            >
              <Text
                style={styles.tpModalTitle}
              >
                PILIH WAKTU
              </Text>
              <View
                style={styles.tpDigitalContainer}
              >
                {/* Hour */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPickerMode('hour')}
                  style={[
                    styles.tpTimeBox,
                    pickerMode === 'hour' ? styles.tpTimeBoxActive : styles.tpTimeBoxInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tpTimeText,
                      pickerMode !== 'hour' && styles.tpTimeTextInactive,
                    ]}
                  >
                    {String(pickerHour).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={styles.tpColon}
                >
                  :
                </Text>

                {/* Minute */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPickerMode('minute')}
                  style={[
                    styles.tpTimeBox,
                    pickerMode === 'minute' ? styles.tpTimeBoxActive : styles.tpTimeBoxInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tpTimeText,
                      pickerMode !== 'minute' && styles.tpTimeTextInactive,
                    ]}
                  >
                    {String(pickerMinute).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Clock body */}
            <View
              style={styles.tpClockBody}
            >
              <View
                style={styles.tpClockContainerWrapper}
              >
                <ClockFace
                  mode={pickerMode}
                  hour={pickerHour}
                  minute={pickerMinute}
                  onHourChange={handleClockHourSelect}
                  onMinuteChange={handleMinuteChange}
                  onRelease={handleClockRelease}
                />
              </View>

              {/* Footer */}
              <View
                style={styles.tpFooter}
              >
                <TouchableOpacity
                  style={styles.tpBtnCancel}
                  onPress={() => setTimeModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={styles.tpBtnCancelText}
                  >
                    BATAL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tpBtnOk}
                  onPress={handleSaveTime}
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.tpBtnOkText}
                  >
                    OKE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PengaturanScreen;