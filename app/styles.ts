import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const colors = {
  canvas: "#FFFFF8",
  ink: "#241A1A",
  inkSoft: "#241A1A",
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

  // Score
  scoreHigh: "#FF8B8B",
  scoreMedium: "#88BCFF",
  scoreLow: "#BEFFA6",
  scoreYellow: "#FFF197",
  scoreOrange: "#FFB176",

  // Brand / Additional
  brandDark: "#241A1A",
  accentCream: "#EAE2D2",
  primaryContainer: "#beffa6",
  onPrimaryContainer: "#241A1A",
  secondaryFixed: "#eae2d2",
  shadowColor: "#241A1A",

  // Additional Colors Merged
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

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  headingLg: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  headingMd: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  bodyMd: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const, fontFamily: 'Fredoka_400Regular' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const, fontFamily: 'Fredoka_600SemiBold' },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, fontFamily: 'Fredoka_400Regular' },
  bodySmStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, fontFamily: 'Fredoka_600SemiBold' },
  labelMood: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, fontFamily: 'Fredoka_500Medium' },
  buttonMd: { fontSize: 16, lineHeight: 20, fontWeight: '700' as const, fontFamily: 'Fredoka_700Bold' },
  buttonSm: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const, fontFamily: 'Fredoka_600SemiBold' },
};

const cardShadow = {
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 5,
} as const;

const smShadow = {
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

// ─── Styles ───────────────────────────────────────────────────────────────────
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: spacing.screenEdge,
    backgroundColor: colors.canvas,
  },
  headerBackBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackText: {
    fontSize: 28,
    color: colors.ink,
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 30,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 32,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: spacing.screenEdge,
    paddingTop: 4,
    paddingBottom: 120,
    gap: spacing.cardGap,
    flexDirection: "column",
  },

  // Calendar
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  dayCell: {
    width: "13%",
    height: 64,
    borderRadius: 8,
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
    fontSize: 12,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 14,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 21,
  },

  // Cards
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 21,
  },
  cardBody: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 17,
  },

  // Mood
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
  },
  moodItem: {
    alignItems: "center",
    gap: 4,
  },
  moodBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBubbleActive: {
    borderWidth: 4,
    borderColor: colors.ink,
  },
  moodImage: {
    width: 40,
    height: 40,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 10,
  },

  // Bento grid
  bentoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  bentoCell: {
    flex: 1,
    minHeight: 120,
    justifyContent: "space-between",
  },
  chevronRow: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  chevron: {
    fontSize: 24,
    color: colors.inkSoft,
    lineHeight: 22,
  },

  // Banner
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Muted card (DASS chart bg)
  mutableCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  seeMoreRow: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },

  // Bottom Nav
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 32,
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
        gap: 6,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
  },
  navItem: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "transparent",
  },
  navItemActive: {
        backgroundColor: colors.accentYellow,
        borderColor: colors.ink,
  },

  // ── Breathing Area (Pernafasan) ───────────────────────────
  breathingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.xxl,
  },
  breathingButton: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accentCream,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  breathingButtonText: {
    ...typography.display,
    color: colors.ink,
    fontSize: 40,
  },

  // ─── Additional Screen Styles (Merged) ────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Background image (full screen)
  bgImage: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.4,
  },

  // Decorative cream blob (bottom-left)
  blobBottomLeft: {
    position: "absolute",
    bottom: -64,
    left: -64,
    width: 320,
    height: 320,
    backgroundColor: colors.accentCream,
    borderTopRightRadius: 120,
    opacity: 0.6,
  },

  // Main content wrapper
  content: {
    position: "relative",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    width: "100%",
    maxWidth: 448,
    paddingHorizontal: spacing.screenEdge,
  },

  // Mascot image container
  mascotContainer: {
    width: 192,
    height: 192,
    alignItems: "center",
    justifyContent: "center",
  },

  mascotImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  // Text block
  textBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },

  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.brandDark,
    letterSpacing: -0.5,
    lineHeight: 40,
    textAlign: "center",
  },

  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 240,
  },

  // ── Additional Merged Sections (Journal & Mood History) ───────────────
  moodHistoryBtn: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...cardShadow,
  },
  moodHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moodHistoryIcon: {
    fontSize: 22,
    color: colors.ink,
  },
  moodHistoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 21,
  },
  moodHistoryChevron: {
    fontSize: 24,
    color: colors.ink,
  },

  // ── Reset pikiran card ────────────────────────────────────────────────
  resetCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.cardPadding,
    ...cardShadow,
    minHeight: 140,
  },
  resetContent: {
    width: "60%",
    zIndex: 2,
  },
  resetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 21,
    marginBottom: spacing.xxs,
  },
  resetBody: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  resetBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    ...smShadow,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  resetDecorBlob: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.inkSoft,
    opacity: 0.08,
  },

  // ── Journal input card ────────────────────────────────────────────────
  journalInputCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.cardPadding,
    ...cardShadow,
    gap: spacing.sm,
  },
  journalTextInput: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.ink,
    lineHeight: 21,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  saveRow: {
    alignItems: "flex-end",
  },
  saveBtn: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    ...smShadow,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },

  // ── Journal history section ───────────────────────────────────────────
  historySection: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  entryCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 12,
    ...cardShadow,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 17,
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 17,
  },

  // ── Additional Merged Sections (Assesmen) ───────────────
  mascotSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  mascotWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  assesmenMascotImage: {
    width: 160,
    height: 160,
  },
  speechBubble: {
    position: "absolute",
    top: -16,
    right: -32,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...smShadow,
  },
  speechBubbleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 17,
  },
  instructionCard: {
    width: "100%",
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: spacing.md,
    ...cardShadow,
  },
  titleBlock: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  displayTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 34,
    textAlign: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  timeIcon: {
    fontSize: 18,
    color: colors.inkSoft,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.inkSoft,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    width: "100%",
  },
  descBlock: {
    gap: spacing.sm,
  },
  descText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  descTextBold: {
    fontWeight: "700",
    color: colors.ink,
  },
  instructionBox: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  instructionBoxTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 21,
    marginBottom: spacing.xxs,
  },
  instructionBoxText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onSurfaceVariant,
    lineHeight: 17,
  },
  assesmenBentoCell: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    borderWidth: 2,
    borderColor: colors.ink,
    ...smShadow,
  },
  bentoCellTertiary: {
    backgroundColor: colors.tertiaryContainer,
  },
  bentoCellSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  bentoIcon: {
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
  bentoValueTertiary: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.tertiary,
    lineHeight: 21,
    textAlign: "center",
  },
  bentoValueSecondary: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    lineHeight: 21,
    textAlign: "center",
  },
  bentoLabelTertiary: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onTertiaryContainer,
    lineHeight: 12,
    textAlign: "center",
  },
  bentoLabelSecondary: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSecondaryContainer,
    lineHeight: 12,
    textAlign: "center",
  },
  taglineAssesmen: {
    marginTop: spacing.lg,
    fontSize: 14,
    fontWeight: "400",
    color: colors.inkSoft,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 17,
  },
  assesmenFooter: {
    width: "100%",
    paddingHorizontal: spacing.screenEdge,
    paddingVertical: spacing.screenEdge,
    gap: spacing.md,
    backgroundColor: colors.canvas,
  },
  startBtn: {
    height: 48,
    backgroundColor: colors.accentGreen,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onPrimaryContainer,
    lineHeight: 14,
  },
  startBtnIcon: {
    fontSize: 20,
    color: colors.onPrimaryContainer,
  },

  // ── Additional Merged Sections (Quiz/Assesment Options) ───────────────
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  headerPlaceholder: {
    width: 40,
  },
  progressSection: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.secondaryFixed,
  },
  progressLabel: {
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  questionCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  questionText: {
    fontSize: 24,
    lineHeight: 25,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 280,
  },
  optionsStack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.sm,
    ...cardShadow,
  },
  option0: { backgroundColor: colors.scoreLow },
  option1: { backgroundColor: colors.scoreYellow },
  option2: { backgroundColor: colors.scoreOrange },
  option3: { backgroundColor: colors.accentRed },
  optionSelected: {
    borderWidth: 4,
    borderColor: colors.ink,
  },
  etiketWrapper: {
    width: 56,
    height: 56,
    marginRight: spacing.md,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiketImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  etiketText: {
    fontSize: 24,
    lineHeight: 25,
    fontWeight: '700',
    color: colors.ink,
    zIndex: 1,
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.ink,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '400',
    color: colors.inkSoft,
  },

  // ── Login Screen ──
  loginScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingVertical: spacing.section,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  loginHeaderTitle: {
    ...typography.display,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginHeaderSubtitle: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.xl,
    marginBottom: spacing.xs,
    gap: spacing.cardGap,
    ...cardShadow,
  },
  fieldWrapper: {
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  fieldLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
    paddingLeft: spacing.xs,
  },
  textInput: {
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentCream,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.xl,
    ...typography.bodyMd,
    color: colors.ink,
  },
  textInputFocused: {
    borderColor: colors.ink,
  },
  passwordWrapper: {
    paddingBottom: spacing.xs,
  },
  primaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentCream,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    ...smShadow,
  },
  primaryButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Fredoka_400Regular',
    color: colors.ink,
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.ink,
  },
  dividerText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentCream,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    ...smShadow,
  },
  googleButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Fredoka_400Regular',
    color: colors.ink,
  },
  loginFooter: {
    marginTop: spacing.section,
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.inkSoft,
  },
  footerLink: {
    ...typography.bodySmStrong,
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Additional Component Styles (Chart, etc.) ──
  chartScrollContent: {
    paddingHorizontal: spacing.screenEdge,
    paddingTop: spacing.xs,
    paddingBottom: 100,
    gap: spacing.cardGap,
    flexGrow: 1,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenEdge,
    backgroundColor: colors.canvas,
    borderBottomWidth: 0,
  },
  topBarBackButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...typography.headingLg,
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  topBarPlaceholder: {
    width: 40,
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorText: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  dateSelectorButton: {
    padding: spacing.xxs,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartArea2: {
    flex: 1,
    position: 'relative',
  },
  gridLineBottom: {
    borderColor: colors.inkSoft,
    borderTopWidth: 2,
  },
  barDepresi: {
    backgroundColor: colors.accentRed,
  },
  barKecemasan: {
    backgroundColor: colors.scoreLow,
  },
  barStres: {
    backgroundColor: colors.scoreMedium,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    position: 'absolute',
    top: 4,
  },
  breakdownCard: {
    gap: spacing.xs,
  },
  breakdownTitle: {
    ...typography.headingMd,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.bodyMd,
    color: colors.ink,
  },
  scoreValueGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreValue: {
    ...typography.bodyMd,
    color: colors.ink,
    width: 32,
    textAlign: 'right',
  },
  scoreCategory: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    width: 64,
    textAlign: 'right',
  },
  scoreDivider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginVertical: spacing.xxs,
  },
  totalLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  totalValue: {
    ...typography.bodyStrong,
    color: colors.ink,
    width: 32,
    textAlign: 'right',
  },
  totalCategory: {
    ...typography.bodyStrong,
    color: colors.inkSoft,
    width: 64,
    textAlign: 'right',
  },
  warningCard: {
    backgroundColor: colors.warningBg,
    borderRadius: radii.xl,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    ...smShadow,
  },
  warningText: {
    ...typography.bodyStrong,
    color: colors.ink,
    textAlign: 'center',
  },
  chartCard: {
    gap: 8,
    width: '100%',
    overflow: 'hidden',
  },
  chartLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  chartLegendLabel: {
    fontSize: 13,
    color: colors.ink,
  },

  // ── Calendar Modal ───────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36, 26, 26, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenEdge,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: spacing.lg,
    ...cardShadow,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    ...typography.headingMd,
    color: colors.ink,
  },
  modalNavButton: {
    borderRadius: radius.full,
    padding: spacing.xxs,
  },
  calendarDaysRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: "center",
    ...typography.bodySm,
    color: colors.inkSoft,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  calendarDate: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  calendarDateText: {
    ...typography.bodySmStrong,
    color: colors.ink,
  },
  calendarLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  legendLabel: {
    ...typography.labelMood,
    color: colors.inkSoft,
  },

  // ── Pop-up Keluar & Legacy Options ──
  progressWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  optionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  optionBtn: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionBtnGreen: {
    backgroundColor: colors.scoreLow,
  },
  optionBtnYellow: {
    backgroundColor: colors.accentYellow,
  },
  optionBtnOrange: {
    backgroundColor: colors.accentOrange,
  },
  optionBtnRed: {
    backgroundColor: colors.accentRed,
  },
  optionBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  optionBadgeNumber: {
    ...typography.headingLg,
    color: colors.ink,
  },
  optionTextGroup: {
    flex: 1,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  optionDesc: {
    ...typography.bodySm,
    color: colors.inkSoft,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenEdge,
  },
  modalTextGroup: {
    gap: spacing.md,
    alignItems: 'center',
  },
  modalBody: {
    ...typography.bodyMd,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalConfirm: {
    ...typography.bodyStrong,
    color: colors.ink,
    textAlign: 'center',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalBtnContinue: {
    flex: 1,
    backgroundColor: colors.scoreLow,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  modalBtnExit: {
    flex: 1,
    backgroundColor: colors.accentRed,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  modalBtnText: {
    ...typography.buttonMd,
    color: colors.ink,
  },
  breathingPhaseLabelInside: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    fontFamily: 'Fredoka_700Bold',
  },
  breathingTimerInside: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Fredoka_700Bold',
  },

  // ─── Journal Detail Components (Merged) ──────────────────────────────────
  headerBackIcon: {
    fontSize: 24,
    color: colors.ink,
  },
  journalCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    ...cardShadow,
  },
  journalBody: {
    ...typography.bodyMd,
    color: colors.ink,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...smShadow,
  },
  editBtnText: {
    ...typography.buttonMd,
    color: colors.ink,
  },
  moodCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl + 16,
    ...cardShadow,
  },
  moodTextGroup: {
    gap: spacing.xxs,
  },
  moodTitle: {
    ...typography.headingLg,
    color: colors.ink,
  },
  moodValue: {
    ...typography.headingLg,
    color: colors.ink,
  },
  moodBadge: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.full,
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentYellow,
    gap: 4,
    ...smShadow,
  },
  moodEmoji: {
    width: 48,
    height: 48,
  },
  moodEmojiPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmojiText: {
    fontSize: 28,
  },
  navBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
  },
  navBtnActive: {
    backgroundColor: colors.primaryContainer,
  },
  navIcon: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
  },
  navIconActive: {
    fontSize: 24,
    color: colors.onPrimaryContainer,
  },
});

export default styles;