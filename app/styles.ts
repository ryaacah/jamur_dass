import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const colors = {
  canvas: "#FFFFF8",
  ink: "#241A1A",
  inkSoft: "#4A3F3F",
  surface: "#f8faf0",
  surfaceCard: "#FFFFFF",
  surfaceMuted: "#EAE2D2",
  surfaceBright: "#f8faf0",
  surfaceContainer: "#ecefe5",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f5eb",
  surfaceVariant: "#e1e4da",
  outlineVariant: "#c1c9b9",
  borderDefault: "#D4C8BE",
  outline: "#72796c",
  primary: "#326b24",
  onPrimary: "#ffffff",
  secondaryContainer: "#eae2d2",
  onSecondaryContainer: "#241A1A",
  secondary: "#241A1A",
  tertiaryContainer: "#ffead9",
  tertiary: "#241A1A",
  onTertiaryContainer: "#241A1A",
  onSurface: "#241A1A",
  onSurfaceVariant: "#241A1A",

  // Accent
  accentYellow: "#FFF197",
  accentBlue: "#88BCFF",
  accentRed: "#FF8B8B",
  accentPurple: "#F2CCFF",
  accentGreen: "#BEFFA6",
  accentOrange: "#FFB176",
  accentCream: "#EAE2D2",

  // Score
  scoreHigh: "#FF8B8B",
  scoreMedium: "#88BCFF",
  scoreLow: "#BEFFA6",
  scoreYellow: "#FFF197",
  scoreOrange: "#FFB176",

  // Brand / Additional
  brandDark: "#241A1A",
  primaryContainer: "#beffa6",
  onPrimaryContainer: "#241A1A",
  secondaryFixed: "#eae2d2",
  shadowColor: "#241A1A",

  // Additional Colors
  white: '#FFFFFF',
  border: '#D4C8BE',
  borderVariant: '#c1c9b9',
  warningBg: '#FFF197',
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC05',
  googleRed: '#EA4335',
  scoreNormal: '#EAE2D2',
  black: '#000000',
};

export const spacing = {
  screenEdge: 16,
  cardPadding: 16,
  cardGap: 12,
  xxl: 32,
  xl: 24,
  lg: 20,
  md: 16,
  sm: 12,
  xs: 8,
  xxs: 4,
  section: 40,
};

export const BAR_COLORS: Record<string, string> = {
  Depresi: colors.accentRed,
  Kecemasan: colors.accentYellow,
  Stres: colors.accentGreen,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const radii = radius;

// Balanced Typography Scale for better responsiveness
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontFamily: 'Fredoka_700Bold' },
  headingLg: { fontSize: 26, lineHeight: 34, fontFamily: 'Fredoka_700Bold' },
  headingMd: { fontSize: 22, lineHeight: 30, fontFamily: 'Fredoka_600SemiBold' },
  headingSm: { fontSize: 20, lineHeight: 26, fontFamily: 'Fredoka_600SemiBold' },
  bodyMd: { fontSize: 16, lineHeight: 24, fontFamily: 'Fredoka_400Regular' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: 'Fredoka_600SemiBold' },
  bodySm: { fontSize: 14, lineHeight: 20, fontFamily: 'Fredoka_400Regular' },
  bodySmStrong: { fontSize: 14, lineHeight: 20, fontFamily: 'Fredoka_600SemiBold' },
  labelMood: { fontSize: 12, lineHeight: 18, fontFamily: 'Fredoka_500Medium' },
  buttonMd: { fontSize: 16, lineHeight: 22, fontFamily: 'Fredoka_600SemiBold' },
  buttonSm: { fontSize: 14, lineHeight: 20, fontFamily: 'Fredoka_600SemiBold' },
};

const cardShadow = {
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 4,
} as const;

const smShadow = {
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
} as const;

// ─── Styles ───────────────────────────────────────────────────────────────────
export const styles = StyleSheet.create({
  // Global & Layout
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.screenEdge,
    gap: spacing.md,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenEdge,
    paddingTop: spacing.xs,
    paddingBottom: 120,
    gap: spacing.cardGap,
  },

  // Header & Top Bar
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: spacing.screenEdge,
    backgroundColor: colors.canvas,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: spacing.screenEdge,
    backgroundColor: colors.canvas,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackIcon: {
    fontSize: 24,
    color: colors.ink,
  },
  topBarBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
  },
  headerTitleNormal: {
    fontFamily: "Fredoka_600SemiBold",
    fontSize: 18,
  },
  topBarTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerPlaceholder: {
    width: 40,
  },
  topBarPlaceholder: {
    width: 40,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cards
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    lineHeight: 24,
    marginBottom: spacing.xxs,
  },
  cardBody: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 20,
  },
  mutableCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  chartCard: {
    backgroundColor: colors.surfaceMuted,
    minHeight: 260,
    overflow: 'hidden',
  },
  moodCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },

  // Mood Details
  moodTextGroup: {
    flex: 1,
    gap: 4,
  },
  moodTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  moodValue: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accentYellow,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodEmojiPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
  },
  moodEmojiText: {
    fontSize: 24,
  },

  // Mood Selection
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    width: '100%',
  },
  moodItem: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  moodBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...smShadow,
  },
  moodBubbleActive: {
    borderWidth: 3,
    borderColor: colors.ink,
    transform: [{ scale: 1.1 }],
  },
  moodImage: {
    width: 32,
    height: 32,
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
    marginTop: 2,
    textAlign: 'center',
  },

  // Bento Grid
  bentoGrid: {
    flexDirection: "row",
    gap: spacing.cardGap,
    width: '100%',
  },
  bentoCell: {
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },
  chevronRow: {
    alignItems: "flex-end",
  },
  chevron: {
    fontSize: 28,
    color: colors.ink,
    fontFamily: "Fredoka_400Regular",
  },

  // Banner
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
  },

  // See More
  seeMoreRow: {
    alignItems: "flex-end",
    marginTop: spacing.sm,
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },

  // Bottom Nav
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 6,
    gap: 8,
    ...cardShadow,
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  navBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnActive: {
    backgroundColor: colors.accentYellow,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  navIcon: {
    fontSize: 22,
    color: colors.inkSoft,
  },
  navIconActive: {
    fontSize: 22,
    color: colors.ink,
  },

  // Breathing
  breathingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  breathingButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accentCream,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  breathingButtonText: {
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    fontSize: 32,
  },
  breathingPhaseLabelInside: {
    fontSize: 24,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
  },
  breathingTimerInside: {
    fontSize: 64,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
  },

  // Landing / Splash / Decorative
  bgImage: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.5,
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: height,
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -64,
    left: -64,
    width: 280,
    height: 280,
    backgroundColor: colors.accentCream,
    borderRadius: 140,
    opacity: 0.7,
  },
  mascotContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotImage: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
    gap: spacing.xs,
    width: '100%',
  },
  appName: {
    fontSize: 48,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },

  // Mood History & Journal List
  moodHistoryBtn: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...cardShadow,
    width: '100%',
  },
  moodHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moodHistoryIcon: {
    fontSize: 24,
  },
  moodHistoryLabel: {
    fontSize: 16,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
  },
  moodHistoryChevron: {
    fontSize: 24,
    color: colors.ink,
  },

  // Reset Thoughts Card
  resetCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.cardPadding,
    ...cardShadow,
    minHeight: 140,
    position: "relative",
    overflow: "hidden",
    width: '100%',
  },
  resetContent: {
    width: "70%",
    zIndex: 2,
    gap: 4,
  },
  resetTitle: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    lineHeight: 24,
  },
  resetBody: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 20,
  },
  resetBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    ...smShadow,
  },
  resetBtnText: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  resetDecorBlob: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ink,
    opacity: 0.05,
  },

  // Journal Input
  journalInputCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.cardPadding,
    ...cardShadow,
    width: '100%',
  },
  journalTextInput: {
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.ink,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveRow: {
    alignItems: "flex-end",
    marginTop: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.accentGreen,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: 24,
    paddingVertical: 10,
    ...smShadow,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },

  // Journal Detail
  journalCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  journalBody: {
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.ink,
    lineHeight: 24,
  },
  editRow: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accentCream,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    minWidth: 160,
    ...smShadow,
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },

  // History Section
  historySection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    width: '100%',
  },
  historySectionTitle: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginBottom: 4,
  },
  entryCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.sm,
    ...cardShadow,
    width: '100%',
  },
  entryDate: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginBottom: 2,
  },
  entryText: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 20,
  },

  // Assessment Intro
  mascotSection: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  mascotWrapper: {
    position: "relative",
    alignItems: "center",
  },
  assesmenMascotImage: {
    width: 160,
    height: 160,
  },
  speechBubble: {
    position: "absolute",
    top: -10,
    right: -20,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...smShadow,
  },
  speechBubbleText: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  instructionCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: spacing.md,
    ...cardShadow,
    width: '100%',
  },
  titleBlock: {
    alignItems: "center",
    gap: 4,
  },
  displayTitle: {
    fontSize: 32,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeIcon: {
    fontSize: 18,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
  },
  divider: {
    height: 2,
    backgroundColor: colors.outlineVariant,
    width: "100%",
  },
  descBlock: {
    gap: spacing.sm,
  },
  descText: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.ink,
    lineHeight: 22,
  },
  descTextBold: {
    fontFamily: "Fredoka_700Bold",
  },
  instructionBox: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  instructionBoxTitle: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginBottom: 2,
  },
  instructionBoxText: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 20,
  },
  assesmenBentoCell: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: colors.ink,
    ...smShadow,
  },
  bentoIcon: {
    fontSize: 24,
  },
  bentoValueTertiary: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.tertiary,
    textAlign: "center",
  },
  bentoValueSecondary: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.secondary,
    textAlign: "center",
  },
  bentoLabelTertiary: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.inkSoft,
    textAlign: "center",
  },
  bentoLabelSecondary: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.inkSoft,
    textAlign: "center",
  },
  taglineAssesmen: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
  assesmenFooter: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenEdge,
    backgroundColor: colors.canvas,
    width: '100%',
  },
  startBtn: {
    height: 56,
    backgroundColor: colors.accentGreen,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  startBtnText: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  startBtnIcon: {
    fontSize: 24,
    color: colors.ink,
  },

  // Assessment Questions
  progressSection: {
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.sm,
    width: '100%',
  },
  progressWrapper: {
    gap: 4,
    marginVertical: spacing.sm,
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentYellow,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  questionCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    padding: 24,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsStack: {
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  optionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  option0: { backgroundColor: colors.scoreLow },
  option1: { backgroundColor: colors.scoreYellow },
  option2: { backgroundColor: colors.scoreOrange },
  option3: { backgroundColor: colors.scoreHigh },
  optionBtnGreen: { backgroundColor: colors.scoreLow },
  optionBtnYellow: { backgroundColor: colors.scoreYellow },
  optionBtnOrange: { backgroundColor: colors.scoreOrange },
  optionBtnRed: { backgroundColor: colors.scoreHigh },
  optionSelected: {
    borderWidth: 4,
    borderColor: colors.ink,
    transform: [{ scale: 1.01 }],
  },
  etiketWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  etiketImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  etiketText: {
    fontSize: 24,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    zIndex: 1,
  },
  optionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionBadgeNumber: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTextGroup: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 18,
  },
  optionDesc: {
    fontSize: 13,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    lineHeight: 18,
  },

  // Login & Register
  loginScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingVertical: spacing.section,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  loginHeaderTitle: {
    fontSize: 36,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginBottom: 6,
  },
  loginHeaderSubtitle: {
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: spacing.md,
    ...cardShadow,
    width: '100%',
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginLeft: 2,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.accentCream,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.ink,
  },
  textInputFocused: {
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  passwordWrapper: {
    // optional extra styles
  },
  primaryButton: {
    height: 52,
    backgroundColor: colors.accentGreen,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    marginTop: 6,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.accentGreen,
    opacity: 0.9,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  googleButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  googleButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
  },
  loginFooter: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // History & Results
  dateSelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: spacing.xxs,
    width: '100%',
  },
  dateSelectorText: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  dateSelectorButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Fredoka_700Bold',
    color: colors.ink,
  },
  breakdownCard: {
    gap: spacing.sm,
    width: '100%',
  },
  breakdownTitle: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
  },
  scoreValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreValue: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  scoreCategory: {
    fontSize: 14,
    fontFamily: "Fredoka_400Regular",
    color: colors.inkSoft,
    width: 80,
    textAlign: 'right',
  },
  scoreDivider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  totalCategory: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    width: 80,
    textAlign: 'right',
  },
  warningCard: {
    backgroundColor: colors.accentRed,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
    width: '100%',
  },
  warningText: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: spacing.sm,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  chartLegendLabel: {
    fontSize: 12,
    fontFamily: "Fredoka_500Medium",
    color: colors.ink,
  },

  // Modals & Calendar
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalNavButton: {
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 26, 26, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 26, 26, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderWidth: 3,
    borderColor: colors.ink,
    ...cardShadow,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
  },
  modalTextGroup: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  modalBody: {
    fontSize: 16,
    fontFamily: "Fredoka_400Regular",
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalConfirm: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
    textAlign: 'center',
    marginTop: 6,
  },
  modalActions: {
    gap: spacing.sm,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtnContinue: {
    flex: 1,
    height: 48,
    backgroundColor: colors.accentGreen,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  modalBtnExit: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },
  calendarDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.inkSoft,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  calendarDate: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calendarDateText: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.ink,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    fontFamily: "Fredoka_500Medium",
    color: colors.inkSoft,
  },

  // Weekly Calendar (Home)
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    width: '100%',
  },
  dayCell: {
    width: "13%",
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    ...smShadow,
  },
  dayCellSelected: {
    borderWidth: 4,
    borderColor: colors.ink,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: "Fredoka_600SemiBold",
    color: colors.inkSoft,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: "Fredoka_700Bold",
    color: colors.ink,
  },

  // Chart Specific
  chartArea2: {
    height: 200,
  },
  gridLineBottom: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  barDepresi: { backgroundColor: colors.accentRed },
  barKecemasan: { backgroundColor: colors.accentYellow },
  barStres: { backgroundColor: colors.accentGreen },

  // Font Helper Classes
  fontRegular: {
    fontFamily: "Fredoka_400Regular",
  },
  fontBold: {
    fontFamily: "Fredoka_700Bold",
  },
});

export default styles;