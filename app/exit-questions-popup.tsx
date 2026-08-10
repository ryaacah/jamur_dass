import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, styles } from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnswerOption {
  value: 0 | 1 | 2 | 3;
  label: string;
  description: string;
  btnStyle: object;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 21;

const ANSWER_OPTIONS: AnswerOption[] = [
  {
    value: 0,
    label: 'Tidak pernah',
    description: 'Tidak berlaku sama sekali',
    btnStyle: styles.optionBtnGreen,
  },
  {
    value: 1,
    label: 'Kadang-kadang',
    description: 'Berlaku sampai tingkat tertentu',
    btnStyle: styles.optionBtnYellow,
  },
  {
    value: 2,
    label: 'Sering',
    description: 'Berlaku sampai tingkat yang tinggi',
    btnStyle: styles.optionBtnOrange,
  },
  {
    value: 3,
    label: 'Hampir selalu',
    description: 'Sangat berlaku',
    btnStyle: styles.optionBtnRed,
  },
];

// Sample questions — replace with your full DASS-21 question list
const QUESTIONS = [
  'Saya merasa sulit untuk santai.',
  'Saya merasa mulut saya kering.',
  'Saya tidak dapat merasakan perasaan positif apapun.',
  'Saya mengalami kesulitan bernafas.',
  'Saya merasa sedih dan tertekan.',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Icon({ name, style }: { name: string; style?: object }) {
  const iconMap: Record<string, string> = {
    arrow_back: '←',
  };
  return (
    <Text style={[{ fontSize: 22, color: colors.primary }, style]}>
      {iconMap[name] ?? '?'}
    </Text>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────
interface OptionBtnProps {
  option: AnswerOption;
  selected: boolean;
  onPress: () => void;
}

function OptionButton({ option, selected, onPress }: OptionBtnProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionBtn,
        option.btnStyle,
        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        selected && {
          borderWidth: 2,
          borderColor: colors.ink,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.label}: ${option.description}`}
    >
      {/* Badge */}
      <View style={styles.optionBadge}>
        <Text style={styles.optionBadgeNumber}>{option.value}</Text>
      </View>

      {/* Text */}
      <View style={styles.optionTextGroup}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionDesc}>{option.description}</Text>
      </View>
    </Pressable>
  );
}

// ─── Exit Confirm Modal ───────────────────────────────────────────────────────
interface ExitModalProps {
  visible: boolean;
  onContinue: () => void;
  onExit: () => void;
}

function ExitConfirmModal({ visible, onContinue, onExit }: ExitModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <Pressable style={styles.modalBackdrop} onPress={onContinue}>
        <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
          {/* Text group */}
          <View style={styles.modalTextGroup}>
            <Text style={styles.modalTitle}>Ingin berhenti sejenak?</Text>
            <Text style={styles.modalBody}>
              Progres kamu akan hilang jika keluar sekarang. Kami di sini untuk
              menemanimu menyelesaikan ini.
            </Text>
            <Text style={styles.modalConfirm}>Yakin ingin keluar?</Text>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalBtnContinue}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Lanjutkan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnExit}
              onPress={onExit}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DassFormScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(4); // 0-indexed, starts at Q5
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const selectedAnswer = answers[currentQuestion] ?? null;
  const progress = (currentQuestion + 1) / TOTAL_QUESTIONS;
  const questionText = QUESTIONS[currentQuestion] ?? 'Saya merasa sedih dan tertekan.';

  const handleSelectAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const handleBack = () => {
    if (currentQuestion === 0) {
      setExitModalVisible(true);
    } else {
      setCurrentQuestion((q) => q - 1);
    }
  };

  const handleContinue = () => setExitModalVisible(false);

  const handleExit = () => {
    setExitModalVisible(false);
    // Navigate back / pop stack
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow_back" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Formulir DASS-21</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Section */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {currentQuestion + 1} dari {TOTAL_QUESTIONS}
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{questionText}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {ANSWER_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              selected={selectedAnswer === option.value}
              onPress={() => handleSelectAnswer(option.value)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        visible={exitModalVisible}
        onContinue={handleContinue}
        onExit={handleExit}
      />
    </SafeAreaView>
  );
}