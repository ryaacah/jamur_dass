import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { colors, styles } from './styles';

// ── Types & Data ─────────────────────────────────────────────
interface CalendarDay {
  day: number | null;
  mood?: 'senang' | 'sedih' | 'marah' | 'cemas' | 'rileks';
}

const CALENDAR_DATA: CalendarDay[] = [
  { day: 1, mood: 'senang' },
  { day: 2, mood: 'sedih' },
  { day: 3, mood: 'marah' },
  { day: 4 },
  { day: 5, mood: 'cemas' },
  { day: 6, mood: 'rileks' },
  { day: 7 },
  { day: 8, mood: 'senang' },
  { day: 9 },
  { day: 10, mood: 'sedih' },
  { day: 11 },
  { day: 12, mood: 'rileks' },
  { day: 13, mood: 'senang' },
  { day: 14 },
  { day: 15, mood: 'cemas' },
  { day: 16, mood: 'marah' },
  { day: 17 },
  { day: 18, mood: 'rileks' },
  { day: 19 },
  { day: 20, mood: 'senang' },
  { day: 21, mood: 'sedih' },
  { day: 22 },
  { day: 23, mood: 'senang' },
  { day: 24 },
  { day: 25, mood: 'rileks' },
  { day: 26 },
  { day: 27, mood: 'cemas' },
  { day: 28, mood: 'senang' },
  { day: 29 },
  { day: 30, mood: 'sedih' },
  { day: null },
  { day: null },
  { day: null },
  { day: null },
  { day: null },
];

const MOOD_COLORS: Record<string, string> = {
  senang: colors.accentYellow,
  sedih: colors.accentBlue,
  marah: colors.accentRed,
  cemas: colors.accentPurple,
  rileks: colors.accentGreen,
};

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const LEGEND = [
  { mood: 'senang', label: 'Senang', color: colors.accentYellow },
  { mood: 'sedih', label: 'Sedih', color: colors.accentBlue },
  { mood: 'marah', label: 'Marah', color: colors.accentRed },
  { mood: 'cemas', label: 'Cemas', color: colors.accentPurple },
  { mood: 'rileks', label: 'Rileks', color: colors.accentGreen },
];

export default function TanggalMoodModal() {
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
          {CALENDAR_DATA.map((item, index) => {
            const isFilled = item.day !== null;
            return (
              <View key={index} style={styles.calendarCell}>
                {isFilled && (
                  <View
                    style={[
                      styles.calendarDate,
                      item.mood && { 
                        backgroundColor: MOOD_COLORS[item.mood],
                        borderColor: colors.ink // Border ala neo-brutalism
                      },
                    ]}
                  >
                    <Text style={styles.calendarDateText}>{item.day}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.calendarLegend}>
          {LEGEND.map((item) => (
            <View key={item.mood} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Pressable>
  );
}