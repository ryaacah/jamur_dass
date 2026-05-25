import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, radii, spacing, styles, typography } from './styles';

// ─── Assets ───────────────────────────────────────────────────────────────────
const BG_IMAGE = require('../assets/images/bg_splash.png');
const MASCOT_IMAGE = require('../assets/images/splash_icon.png');

// ─── Components ───────────────────────────────────────────────────────────────
const GoogleIcon: React.FC = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = () => {
    router.replace('/');
  };

  const handleEmailLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {/* Background persis seperti splash-screen */}
      <Image
        source={BG_IMAGE}
        style={styles.bgImage}
        contentFit="cover"
        accessibilityElementsHidden
      />

      {/* Dekorasi blob */}
      <View style={styles.blobBottomLeft} />

      {/* Area konten maskot dan text */}
      <View style={[styles.content, { flex: 1, justifyContent: 'center' }]}>
        <View style={styles.mascotContainer}>
          <Image
            source={MASCOT_IMAGE}
            style={styles.mascotImage}
            contentFit="contain"
            accessibilityLabel="Mushroom Mascot"
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.appName}>Naung</Text>
          <Text style={styles.tagline}>
            Satu langkah kecil untuk mengenal dirimu lebih dalam.
          </Text>
        </View>
      </View>

      {/* ── Bottom Sheet ── */}
      <View style={localStyles.bottomBox}>
        <Text style={localStyles.loginTitle}>Mulai Perjalananmu</Text>

        <View style={localStyles.buttonGroup}>
          {/* Google button */}
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googleButtonPressed,
            ]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
          </Pressable>

          {/* Email button */}
          <Pressable
            style={({ pressed }) => [
              localStyles.emailButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleEmailLogin}
          >
            <Text style={localStyles.emailIcon}>✉️</Text>
            <Text style={styles.primaryButtonText}>Masuk dengan Email</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  bottomBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + 16,
    borderWidth: 2,
    borderColor: colors.ink,
    borderBottomWidth: 0,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  loginTitle: {
    ...typography.headingLg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonGroup: {
    gap: spacing.md,
  },
  emailButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentGreen,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emailIcon: {
    fontSize: 20,
  },
});

export default WelcomeScreen;