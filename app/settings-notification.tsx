import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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
  days: DayId[];
  selectedDays: DayId[];
  onToggleDay: (day: DayId) => void;
  time: string;
  onAddTime: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DAYS: DayId[] = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  time,
  onAddTime,
}) => (
  <View style={[styles.card, localStyles.sectionCard]}>
    <Text style={styles.cardTitle}>{title}</Text>

    {/* Day chips */}
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

    {/* Time row */}
    <View style={localStyles.timeRow}>
      <View style={localStyles.timeChip}>
        <Text style={localStyles.timeChipText}>{time}</Text>
      </View>

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
  userEmail?: string;
}

const PengaturanScreen: React.FC<PengaturanScreenProps> = ({
  onBack,
  onDeleteData,
  onLogout,
  userEmail = 'example@gmail.com',
}) => {
  const router = useRouter();
  const handleBack = onBack || (() => router.back());

  // ── State ──────────────────────────────────────────────────────────────────

  const [notifEnabled, setNotifEnabled] = useState<boolean>(true);

  const [moodSelectedDays, setMoodSelectedDays] = useState<DayId[]>([
    'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming',
  ]);
  const [moodTime] = useState<string>('21:00');

  const [jurnalSelectedDays, setJurnalSelectedDays] = useState<DayId[]>([
    'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming',
  ]);
  const [jurnalTime] = useState<string>('21:00');

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  const handleMoodToggleDay = (day: DayId) =>
    toggleDay(day, setMoodSelectedDays, moodSelectedDays);

  const handleJurnalToggleDay = (day: DayId) =>
    toggleDay(day, setJurnalSelectedDays, jurnalSelectedDays);

  const handleAddMoodTime = () => {
    // Placeholder: open time picker
    console.log('Add mood time');
  };

  const handleAddJurnalTime = () => {
    // Placeholder: open time picker
    console.log('Add jurnal time');
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
        {/* ── Notifikasi ──────────────────────────────────────────────────── */}
        <View style={[styles.card, localStyles.notifikasiCard]}>
          <Text style={styles.cardTitle}>Notifikasi</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{
              false: colors.surfaceVariant,
              true: colors.ink,
            }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.surfaceVariant}
            accessibilityLabel="Aktifkan notifikasi"
          />
        </View>

        <View
          style={[!notifEnabled && localStyles.disabledSection]}
          pointerEvents={notifEnabled ? 'auto' : 'none'}
        >
          {/* ── Trak Mood ───────────────────────────────────────────────────── */}
          <SectionSchedule
            title="Trak Mood"
            days={ALL_DAYS}
            selectedDays={moodSelectedDays}
            onToggleDay={handleMoodToggleDay}
            time={moodTime}
            onAddTime={handleAddMoodTime}
          />

          {/* ── Jurnal Harian ───────────────────────────────────────────────── */}
          <SectionSchedule
            title="Jurnal Harian"
            days={ALL_DAYS}
            selectedDays={jurnalSelectedDays}
            onToggleDay={handleJurnalToggleDay}
            time={jurnalTime}
            onAddTime={handleAddJurnalTime}
          />
        </View>

        {/* ── Akun ────────────────────────────────────────────────────────── */}
        <View style={[styles.card, localStyles.akunCard]}>
          <View>
            <Text style={styles.cardTitle}>Akun</Text>
            <Text style={localStyles.akunEmail}>{userEmail}</Text>
          </View>

          <View style={localStyles.akunButtonRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onDeleteData}
              style={[localStyles.akunButton, localStyles.akunButtonDanger]}
              accessibilityRole="button"
              accessibilityLabel="Hapus data akun"
            >
              <Text style={localStyles.akunButtonText}>Hapus data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace('/login')}
              style={localStyles.akunButton}
              accessibilityRole="button"
              accessibilityLabel="Keluar dari akun"
            >
              <Text style={localStyles.akunButtonText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surfaceCard },
  chipSelected: { backgroundColor: colors.primaryContainer, borderColor: colors.ink },
  chipText: { fontSize: 12, color: colors.inkSoft, fontWeight: '500' },
  chipSelectedText: { color: colors.onPrimaryContainer, fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  timeChip: { borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.surfaceCard },
  timeChipText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  addButton: { borderWidth: 1, borderColor: colors.ink, borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.secondaryFixed, alignItems: 'center', justifyContent: 'center' },
  notifikasiCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionCard: { marginBottom: 12 },
  akunCard: { gap: 16, marginBottom: 12 },
  akunEmail: { fontSize: 14, color: colors.inkSoft, marginTop: 4 },
  akunButtonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  akunButton: { flex: 1, height: 48, backgroundColor: colors.surfaceMuted, borderRadius: 12, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  akunButtonDanger: { backgroundColor: colors.accentRed },
  akunButtonText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  disabledSection: { opacity: 0.5 },
});

export default PengaturanScreen;