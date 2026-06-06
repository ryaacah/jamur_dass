import { Image, ImageSource } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

// ─── Aset gambar ──────────────────────────────────────────────────────────────
const ETIKET_0 = require("../assets/images/etiket0.png");
const ETIKET_1 = require("../assets/images/etiket1.png");
const ETIKET_2 = require("../assets/images/etiket2.png");
const ETIKET_3 = require("../assets/images/etiket3.png");

// ─── Types ────────────────────────────────────────────────────────────────────
export type AnswerValue = 0 | 1 | 2 | 3;

export type Severity =
  | 'Normal'
  | 'Ringan'
  | 'Sedang'
  | 'Berat'
  | 'Sangat Parah';

interface AnswerOption {
  value:       AnswerValue;
  label:       string;
  description: string;
  image:       ImageSource;
  colorStyle:  'option0' | 'option1' | 'option2' | 'option3';
}

// ─── Pemetaan subskala DASS-21 ────────────────────────────────────────────────
//
// Index di bawah merujuk ke posisi pertanyaan dalam array DASS_QUESTIONS (0-based).
// Urutan item mengikuti standar DASS-21 Lovibond (1995):
//
//   Depresi  : item 3, 5, 10, 13, 16, 17, 21  → index 2, 4, 9, 12, 15, 16, 20
//   Kecemasan: item 2, 4, 7,  9, 15, 19, 20   → index 1, 3, 6,  8, 14, 18, 19
//   Stres    : item 1, 6, 8, 11, 12, 14, 18   → index 0, 5, 7, 10, 11, 13, 17
//
const SUBSCALE_INDICES = {
  depression: [2, 4, 9, 12, 15, 16, 20],
  anxiety:    [1, 3, 6,  8, 14, 18, 19],
  stress:     [0, 5, 7, 10, 11, 13, 17],
} as const;

// ─── List Pertanyaan ──────────────────────────────────────────────────────────

const DASS_QUESTIONS: string[] = [
  /* 01 – Stres     */ "Saya merasa sulit untuk menenangkan diri",
  /* 02 – Kecemasan */ "Saya merasa rongga mulut saya kering",
  /* 03 – Depresi   */ "Saya sama sekali tidak dapat merasakan perasaan positif apapun",
  /* 04 – Kecemasan */ "Saya mengalami kesulitan bernapas (misalnya terengah-engah atau tidak dapat bernapas padahal tidak sedang melakukan aktivitas fisik)",
  /* 05 – Depresi   */ "Saya merasa sulit untuk berinisiatif melakukan sesuatu",
  /* 06 – Stres     */ "Saya cenderung bereaksi berlebihan terhadap suatu situasi",
  /* 07 – Kecemasan */ "Saya merasa gemetar (misalnya pada tangan)",
  /* 08 – Stres     */ "Saya merasa banyak mengeluarkan energi karena ketegangan",
  /* 09 – Kecemasan */ "Saya merasa khawatir berada dalam situasi di mana saya mungkin panik dan mempermalukan diri sendiri",
  /* 10 – Depresi   */ "Saya merasa tidak ada hal yang dapat saya nantikan",
  /* 11 – Stres     */ "Saya merasa mudah gelisah dan tidak tenang",
  /* 12 – Stres     */ "Saya merasa sulit untuk bersantai atau merilekskan diri",
  /* 13 – Depresi   */ "Saya merasa sedih dan murung",
  /* 14 – Stres     */ "Saya tidak toleran terhadap apapun yang menghalangi saya dalam menyelesaikan aktivitas saya",
  /* 15 – Kecemasan */ "Saya merasa hampir panik",
  /* 16 – Depresi   */ "Saya tidak mampu merasa antusias terhadap apapun",
  /* 17 – Depresi   */ "Saya merasa diri saya tidak berharga sebagai seorang manusia",
  /* 18 – Stres     */ "Saya merasa mudah tersinggung",
  /* 19 – Kecemasan */ "Saya menyadari detak jantung saya tanpa sedang melakukan aktivitas fisik (misalnya detak jantung meningkat atau tidak beraturan)",
  /* 20 – Kecemasan */ "Saya merasa takut tanpa alasan yang jelas",
  /* 21 – Depresi   */ "Saya merasa hidup ini tidak berarti",
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

// ─── Logika Perhitungan Skor ──────────────────────────────────────────────────

function calculateSubscaleScore(
  answers: Record<number, AnswerValue>,
  indices: readonly number[],
): number {
  const rawSum = indices.reduce((sum, idx) => sum + (answers[idx] ?? 0), 0);
  return rawSum * 2;
}

function getSeverityCategory(
  score: number,
  type: 'depression' | 'anxiety' | 'stress',
): Severity {
  if (type === 'depression') {
    if (score <= 9)  return 'Normal';
    if (score <= 13) return 'Ringan';
    if (score <= 20) return 'Sedang';
    if (score <= 27) return 'Berat';
    return 'Sangat Parah';
  }

  if (type === 'anxiety') {
    if (score <= 7)  return 'Normal';
    if (score <= 9)  return 'Ringan';
    if (score <= 14) return 'Sedang';
    if (score <= 19) return 'Berat';
    return 'Sangat Parah';
  }

  // stress
  if (score <= 14) return 'Normal';
  if (score <= 18) return 'Ringan';
  if (score <= 25) return 'Sedang';
  if (score <= 33) return 'Berat';
  return 'Sangat Parah';
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <View style={styles.progressSection}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={styles.progressLabel}>
        {current} dari {total}
      </Text>
    </View>
  );
}

function QuestionCard({ text }: { text: string }) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{text}</Text>
    </View>
  );
}

function OptionButton({
  option,
  isSelected,
  isAnySelected,
  onPress,
}: {
  option:     AnswerOption;
  isSelected: boolean;
  isAnySelected: boolean;
  onPress:    () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.optionButton,
        (styles as any)[option.colorStyle],
        isSelected && styles.optionSelected,
        (isAnySelected && !isSelected) && { opacity: 0.4 },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Pilihan ${option.value}: ${option.label}. ${option.description}`}
    >
      <View style={styles.etiketWrapper}>
        <Image
          source={option.image}
          style={styles.etiketImage}
          contentFit="contain"
        />
        <Text style={styles.etiketText}>{option.value}</Text>
      </View>

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
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [answers, setAnswers]                 = useState<Record<number, AnswerValue>>({});
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      setExitModalVisible(true);
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  const totalQuestions        = DASS_QUESTIONS.length;
  const currentQuestionNumber = currentIndex + 1;
  const questionText          = DASS_QUESTIONS[currentIndex];
  const isNextDisabled        = answers[currentIndex] === undefined;

  const handleAnswer = (value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    } else {
      setConfirmModalVisible(true);
    }
  };

  const processResults = async () => {
    setIsSubmitting(true);
    
    // ── Semua pertanyaan selesai: hitung skor ──────────────────────────────

    // 1. Jumlahkan skor tiap subskala lalu kalikan 2 (konversi ke skala DASS-42)
    const depressionScore = calculateSubscaleScore(answers, SUBSCALE_INDICES.depression);
    const anxietyScore    = calculateSubscaleScore(answers, SUBSCALE_INDICES.anxiety);
    const stressScore     = calculateSubscaleScore(answers, SUBSCALE_INDICES.stress);

    // 2. Tentukan kategori keparahan berdasarkan cut-off Lovibond (1995)
    const depressionCategory = getSeverityCategory(depressionScore, 'depression');
    const anxietyCategory    = getSeverityCategory(anxietyScore,    'anxiety');
    const stressCategory     = getSeverityCategory(stressScore,     'stress');

    // 3. Simpan ke Supabase
    try {
      let currentUserId = null;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        currentUserId = session.user.id;
      } else {
        currentUserId = await AsyncStorage.getItem('user_uuid');
      }

      if (currentUserId) {
        await supabase.from('dass_results').insert([
          {
            user_id:              currentUserId,
            depression_score:     depressionScore,
            anxiety_score:        anxietyScore,
            stress_score:         stressScore,
            depression_category:  depressionCategory,
            anxiety_category:     anxietyCategory,
            stress_category:      stressCategory,
          },
        ]);
      }
    } catch (err) {
      console.error('Error saving DASS results:', err);
    } finally {
      setIsSubmitting(false);
      setConfirmModalVisible(false);
      router.replace('/dass-history');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
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
          onPress={() => setExitModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Formulir DASS-21</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── Konten ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar current={currentQuestionNumber} total={totalQuestions} />
        <QuestionCard text={questionText} />

        <View style={styles.optionsStack}>
          {ANSWER_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={answers[currentIndex] === option.value}
              isAnySelected={!isNextDisabled}
              onPress={() => handleAnswer(option.value)}
            />
          ))}
        </View>

        {/* ── Navigasi ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, marginBottom: 24, gap: 16 }}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1, backgroundColor: colors.surfaceVariant },
              currentIndex === 0 && { opacity: 0 },
            ]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.ink, fontFamily: 'Fredoka_700Bold' }]}>
              Sebelumnya
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1, backgroundColor: isNextDisabled ? colors.surfaceVariant : colors.accentGreen },
            ]}
            onPress={handleNext}
            disabled={isNextDisabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: isNextDisabled ? colors.inkSoft : colors.ink, fontFamily: 'Fredoka_700Bold' }]}>
              {currentIndex === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Modal Konfirmasi Keluar ─────────────────────────────── */}
      <Modal
        visible={exitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExitModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setExitModalVisible(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalTextGroup}>
              <Text style={styles.modalTitle}>Ingin berhenti sejenak?</Text>
              <Text style={styles.modalBody}>
                Progres kamu akan hilang jika keluar sekarang. Kami di sini untuk
                menemanimu menyelesaikan ini.
              </Text>
              <Text style={styles.modalConfirm}>Yakin ingin keluar?</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnContinue}
                onPress={() => setExitModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnText}>Lanjutkan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnExit}
                onPress={() => router.replace('/assessment')}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── Modal Konfirmasi Selesai ─────────────────────────────── */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmModalVisible(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalTextGroup}>
              <Text style={styles.modalTitle}>Sudah Yakin?</Text>
              <Text style={styles.modalBody}>
                Pastikan semua jawabanmu sudah sesuai dengan apa yang kamu rasakan akhir-akhir ini.
              </Text>
              <Text style={styles.modalConfirm}>Lanjut lihat hasil?</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnContinue, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: colors.ink }]}>Cek Lagi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnExit, { backgroundColor: colors.accentGreen }]}
                onPress={processResults}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: colors.ink }]}>
                  {isSubmitting ? 'Menghitung...' : 'Ya, Selesai'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}