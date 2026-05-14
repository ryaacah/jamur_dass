import React, { useState } from 'react';
import { Image, ImageSource } from 'expo-image';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, styles } from './index.styles'; // Pastikan styles sudah dibuat di index.styles.ts

// ─── Aset gambar ──────────────────────────────────────────────────────────────
const ETIKET_0 = require("../assets/images/etiket0.png");
const ETIKET_1 = require("../assets/images/etiket1.png");
const ETIKET_2 = require("../assets/images/etiket2.png");
const ETIKET_3 = require("../assets/images/etiket3.png");

// ─── Types ────────────────────────────────────────────────────────────────────
export type AnswerValue = 0 | 1 | 2 | 3;

interface AnswerOption {
  value:       AnswerValue;
  label:       string;
  description: string;
  image:       ImageSource;
  // key harus cocok dengan nama style di StyleSheet
  colorStyle:  'option0' | 'option1' | 'option2' | 'option3';
}

// ─── List Pertanyaan ──────────────────────────────────────────────────────────
const DASS_QUESTIONS = [
  "Saya sama sekali tidak dapat merasakan perasaan positif (contoh: merasa gembira, bangga, dsb).",
  "Saya merasa sulit berinisiatif melakukan sesuatu",
  "Saya merasa tidak ada lagi yang bisa saya harapkan",
  "Saya merasa sedih dan tertekan.",
  "Saya tidak bisa merasa antusias terhadap hal apapun.",
  "Saya merasa diri saya tidak berharga.",
  "Saya merasa hidup ini tidak berarti.",
  "Saya merasa rongga mulut saya kering.",
  "Saya merasa kesulitan bernafas (misalnya seringkali terengah-engah atau tidak dapat bernapas padahal tidak melakukan aktivitas fisik sebelumnya).",
  "Saya merasa gemetar (misalnya pada tangan).",
  "Saya merasa khawatir dengan situasi di mana saya mungkin menjadi panik dan mempermalukan diri sendiri.",
  "Saya merasa hampir panik",
  "Saya menyadari kondisi jantung saya (seperti meningkatnya atau melemahnya detak jantung) meskipun sedang tidak melakukan aktivitas fisik.",
  "Saya merasa ketakutan tanpa alasan yang jelas.",
  "Saya merasa sulit untuk beristirahat.",
  "Saya cenderung menunjukkan reaksi berlebihan terhadap suatu situasi.",
  "Saya merasa energi saya terkuras karena terlalu cemas.",
  "Saya merasa gelisah.",
  "Saya merasa sulit untuk merasa tenang",
  "Saya sulit untuk bersabar dalam menghadapi gangguan yang terjadi ketika sedang melakukan sesuatu",
  "Perasaan saya mudah tergugah atau tersentuh."
];

// ─── Data pilihan jawaban ─────────────────────────────────────────────────────
const ANSWER_OPTIONS: AnswerOption[] = [
  {
    value:       0,
    label:       'Tidak pernah',
    description: 'Tidak berlaku sama sekali',
    image:       ETIKET_0,
    colorStyle:  'option0',
  },
  {
    value:       1,
    label:       'Kadang-kadang',
    description: 'Berlaku sampai tingkat tertentu',
    image:       ETIKET_1,
    colorStyle:  'option1',
  },
  {
    value:       2,
    label:       'Sering',
    description: 'Berlaku sampai tingkat yang tinggi',
    image:       ETIKET_2,
    colorStyle:  'option2',
  },
  {
    value:       3,
    label:       'Hampir selalu',
    description: 'Sangat berlaku',
    image:       ETIKET_3,
    colorStyle:  'option3',
  },
];

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

/** Progress bar + label "X dari Y" */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {current} dari {total}
      </Text>
    </View>
  );
}

/** Kartu pertanyaan */
function QuestionCard({ text }: { text: string }) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{text}</Text>
    </View>
  );
}

/** Satu tombol pilihan jawaban */
function OptionButton({
  option,
  isSelected,
  onPress,
}: {
  option:     AnswerOption;
  isSelected: boolean;
  onPress:    () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.optionButton,
        styles[option.colorStyle],
        isSelected && styles.optionSelected,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Pilihan ${option.value}: ${option.label}. ${option.description}`}
    >
      {/* Gambar Etiket Pilihan */}
      <View style={styles.etiketWrapper}>
        <Image
          source={option.image}
          style={styles.etiketImage}
          contentFit="contain"
        />
        <Text style={styles.etiketText}>{option.value}</Text>
      </View>

      {/* Teks label & deskripsi */}
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen utama ─────────────────────────────────────────────────────────────
export default function DASSFormScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerValue | null>(null);
  const [answers, setAnswers] = useState<AnswerValue[]>([]);

  const currentQuestionNumber = currentIndex + 1;
  const totalQuestions = DASS_QUESTIONS.length;
  const questionText = DASS_QUESTIONS[currentIndex];

  const handleAnswer = (value: AnswerValue) => {
    setSelected(value);
    
    // Beri sedikit delay (400ms) agar user melihat pilihannya terlebih dahulu
    setTimeout(() => {
      const newAnswers = [...answers, value];
      if (currentIndex < totalQuestions - 1) {
        setAnswers(newAnswers);
        setCurrentIndex(currentIndex + 1);
        setSelected(null); // Reset pilihan untuk soal berikutnya
      } else {
        // Selesai semua pertanyaan
        router.replace("/riwayat_dass"); // Bawa user langsung ke halaman skor
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        style="dark"
        backgroundColor={colors.canvas}
        translucent={false}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Formulir DASS-21</Text>

        {/* Spacer agar judul tetap di tengah */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── Konten yang bisa di-scroll ─────────────────────────── */}
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProgressBar current={currentQuestionNumber} total={totalQuestions} />

        {/* Kartu pertanyaan */}
        <QuestionCard text={questionText} />

        {/* Pilihan jawaban */}
        <View style={styles.optionsStack}>
          {ANSWER_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={selected === option.value}
              onPress={() => handleAnswer(option.value)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
