// result-date.tsx
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalendarDay {
  day: number;
  isMuted?: boolean;
  isToday?: boolean;
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CALENDAR_DAYS: CalendarDay[] = [
  { day: 30, isMuted: true },
  { day: 31, isMuted: true },
  { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 },
  { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 },
  { day: 10, isToday: true },
  { day: 11 }, { day: 12 },
  { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
  { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 },
  { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 },
  { day: 1, isMuted: true },
  { day: 2, isMuted: true },
  { day: 3, isMuted: true },
];

export default function TanggalHasilModal() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState('April');

  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handlePrevMonth = () => {
    const idx = MONTHS.indexOf(currentMonth);
    setCurrentMonth(MONTHS[(idx - 1 + 12) % 12]);
  };

  const handleNextMonth = () => {
    const idx = MONTHS.indexOf(currentMonth);
    setCurrentMonth(MONTHS[(idx + 1) % 12]);
  };

  return (
    <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
      <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalNavButton} onPress={handlePrevMonth} activeOpacity={0.7}>
            <Icon name="chevron-left" size={24} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{currentMonth}</Text>
          <TouchableOpacity style={styles.modalNavButton} onPress={handleNextMonth} activeOpacity={0.7}>
            <Icon name="chevron-right" size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.calendarDaysRow}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.calendarDayLabel}>
              {d}
            </Text>
          ))}
        </View>

        {/* Date grid */}
        <View style={styles.calendarGrid}>
          {CALENDAR_DAYS.map((item, index) => (
            <View key={index} style={styles.calendarCell}>
              <View
                style={[
                  styles.calendarDate,
                  item.isToday && { backgroundColor: colors.accentYellow, borderColor: colors.ink },
                ]}
              >
                <Text
                  style={[
                    styles.calendarDateText,
                    item.isMuted && { color: colors.inkSoft, opacity: 0.5 },
                  item.isToday && { fontFamily: 'Fredoka_700Bold' }
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </Pressable>
  );
}